import { randomUUID } from 'crypto';
import events from 'events';
import net from 'net';
import tls from 'tls';

export const MESSAGE_TYPE = {
    QUERY: 0x11,    // dirty trick, non-stardand type code, use to differentiate read-only request and transaction
    CHANNEL_RPC_REQUEST: 0x12,
    CLIENT_REGISTER_EVENT_LOG: 0x15,
    AMOP_CLIENT_TOPICS: 0x32,
    TRANSACTION_NOTIFY: 0x1000,
    BLOCK_NOTIFY: 0x1001,
    EVENT_LOG_PUSH: 0x1002
};

const emitters = new Map();
const buffers = new Map();
const sockets = new Map();
const lastBytesRead = new Map();

const blockNotifyCallbacks = new Map();
const eventLogFilterCallbacks = new Map();

function checkErrorCode(errorCode: number) {
    switch (errorCode) {
        case 0:
            // successful
            return;
        case 100:
            throw new Error("node unreachable");
        case 101:
            throw new Error("SDK unreachable");
        case 102:
            throw new Error("channel time out");
        default:
            throw new Error(`unknown channel error code: ${errorCode}`);
    }
}

function getEmitter(seq: string) {
    if (!emitters.has(seq)) {
        // Stale message received
        return;
    }
    const { emitter } = emitters.get(seq);
    if (!emitter) {
        throw new Error(`unknown owner message receieved, seq=${seq}`);
    }
    return emitter;
}

function parseResponse(buffer: Buffer) {
    const seq = buffer.slice(6, 38).toString();
    const type = buffer.slice(4, 6).readUInt16BE();
    const errorCode = buffer.slice(38, 42).readUInt32BE();

    switch (type) {
        case MESSAGE_TYPE.TRANSACTION_NOTIFY: {
            // transaction notification
            checkErrorCode(errorCode);
            const emitter = getEmitter(seq);
            if (emitter) {
                const response = JSON.parse(buffer.slice(42).toString());

                if (response.error || response.status || (response.result && response.result.status)) {
                    emitter.emit('gotresult', response);
                } else {
                    if (!response.result) {
                        throw new Error(`unknown message received, seq=${seq}, data=${response.toString()}`);
                    }
                }
            }
            break;
        }
        case MESSAGE_TYPE.BLOCK_NOTIFY: {
            // block notification, which doesn't care about seq
            checkErrorCode(errorCode);
            const data = buffer.slice(42);
            // topic length = the actual topic length + 1, strange design
            const topicLength = data.slice(0, 1).readUInt8();
            const response = data.slice(topicLength).toString('ascii');
            const [groupID, blockHeight] = response.split(',').map((str) => (parseInt(str)));

            if (blockNotifyCallbacks.has(groupID)) {
                for (const callback of blockNotifyCallbacks.get(groupID)) {
                    callback(groupID, blockHeight);
                }
            }
            break;
        }
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST: {
            // JSON RPC 2.0 format response
            checkErrorCode(errorCode);
            const emitter = getEmitter(seq);
            if (emitter) {

                const response = JSON.parse(buffer.slice(42).toString());
                const readOnly = Object.getOwnPropertyDescriptor(emitter, 'readOnly')?.value;

                if (readOnly) {
                    // read-only query
                    if (response.error || typeof response.result !== 'undefined') {
                        emitter.emit('gotresult', response);
                    }
                } else {
                    // transaction
                    if (response.error || response.status || (response.result && response.result.status)) {
                        emitter.emit('gotresult', response);
                    } else {
                        if (!response.result) {
                            throw new Error(`unknown message received, seq=${seq}, data=${response.toString()}`);
                        }
                    }
                }
            }
            break;
        }
        case MESSAGE_TYPE.CLIENT_REGISTER_EVENT_LOG: {
            // result of register event
            checkErrorCode(errorCode);
            const emitter = getEmitter(seq);
            if (emitter) {
                const data = buffer.slice(42);
                // topic length = the actual topic length + 1, strange design
                const topicLength = data.slice(0, 1).readUInt8();
                const response = JSON.parse(data.slice(topicLength).toString());
                emitter.emit('gotresult', response);
            }
            break;
        }
        case MESSAGE_TYPE.EVENT_LOG_PUSH: {
            const response = JSON.parse(buffer.slice(42).toString());

            const filterID = response.filterID;
            if (eventLogFilterCallbacks.has(filterID)) {
                const callback = eventLogFilterCallbacks.get(filterID);
                callback(response);
            }

            break;
        }
        default:
            throw new Error(`unknown type message received, type=${type}`);
    }
}

function createNewSocket(ip: string, port: number, { key, ca, cert }: { key: string; ca: string; cert: string }) {
    const secureContext = tls.createSecureContext({
        key,
        cert,
        ca,
        ecdhCurve: 'secp256k1',
    });

    const socket = new net.Socket();
    socket.connect(port, ip);

    const clientOptions = {
        rejectUnauthorized: false,
        secureContext,
        socket
    };

    const tlsSocket = tls.connect(clientOptions);

    const socketID = `${ip}:${port}`;

    lastBytesRead.set(socketID, 0);

    tlsSocket.on('data', function (response) {
        if (!buffers.has(socketID)) {
            // First time to read data from this socket
            let expectedLength = null;
            if (tlsSocket.bytesRead - lastBytesRead.get(socketID) >= 4) {
                expectedLength = response.readUIntBE(0, 4);
            }

            if (!expectedLength || tlsSocket.bytesRead < lastBytesRead.get(socketID) + expectedLength) {
                buffers.set(socketID, {
                    expectedLength,
                    buffer: response
                });
            } else {
                lastBytesRead.set(socketID, lastBytesRead.get(socketID) + expectedLength);
                parseResponse(response);
                buffers.delete(socketID);
            }
        } else {
            // Multiple reading
            const cache = buffers.get(socketID);
            cache.buffer = Buffer.concat([cache.buffer, response]);
            if (!cache.expectedLength && tlsSocket.bytesRead - lastBytesRead.get(socketID) >= 4) {
                cache.expectedLength = cache.buffer.readUIntBE(0, 4);
            }

            if (cache.expectedLength && tlsSocket.bytesRead - lastBytesRead.get(socketID) >= cache.expectedLength) {
                lastBytesRead.set(socketID, lastBytesRead.get(socketID) + cache.expectedLength);
                parseResponse(buffers.get(socketID).buffer);
                buffers.delete(socketID);
            }
        }
    });

    return tlsSocket;
}

function packWithHeader(data: Buffer, type: number) {
    /*
      name    type      length(byte)  description
      length  uint32_t  4             Data packet length, including header and data
      type    uint16_t  2             Data packet type
      seq     string    32            Data packet serial number, 32 bytes
      result  int       4             Process result
    */

    const headerLength = 4 + 2 + 32 + 4;

    const length = Buffer.alloc(4);
    length.writeUInt32BE(headerLength + data.length);

    const dataType = Buffer.alloc(2);
    switch (type) {
        case MESSAGE_TYPE.QUERY:
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST:
            dataType.writeUInt16BE(MESSAGE_TYPE.CHANNEL_RPC_REQUEST);
            break;
        default:
            dataType.writeUInt16BE(type);
            break;
    }

    const uuid = randomUUID().replace(/-/g, '');
    const seq = Buffer.from(uuid, 'ascii');

    const result = Buffer.alloc(4);
    result.writeInt32BE(0);

    return {
        uuid,
        packagedData: Buffer.concat([length, dataType, seq, result, data])
    };
}

function packData(data: string, type: number) {
    const msg = Buffer.from(data, 'ascii');

    return packWithHeader(msg, type);
}

function clearContext(uuid: string) {
    if (emitters.get(uuid).timer) {
        clearTimeout(emitters.get(uuid).timer);
    }
    emitters.delete(uuid);
    buffers.delete(uuid);
}

export function channelPromise<T>(data: object, type: number, node: { ip: string; port: number }, authentication: { key: string; ca: string; cert: string }, timeout?: number) {
    const ip = node.ip;
    const port = node.port;

    const socketID = `${ip}:${port}`;

    const { uuid, packagedData } = packData(JSON.stringify(data), type);

    return new Promise<T>(async (resolve, reject) => {
        // Singleton Socket instance
        if (!sockets.has(socketID)) {
            const newSocket = createNewSocket(ip, port, authentication);
            newSocket.unref();
            sockets.set(socketID, newSocket);

            const clear = () => {
                buffers.delete(socketID);
                lastBytesRead.delete(socketID);
                sockets.delete(socketID);
            };

            newSocket.on('error', error => {
                clear();
                reject(new Error(error));
            });

            newSocket.on('end', () => {
                clear();
                reject(new Error('disconnected from remote node'));
            });
        }
        const tlsSocket = sockets.get(socketID);
        tlsSocket.socketID = uuid;

        if (timeout) {
            const eventEmitter = new events.EventEmitter();

            if (type === MESSAGE_TYPE.QUERY || type === MESSAGE_TYPE.CHANNEL_RPC_REQUEST) {
                Object.defineProperty(eventEmitter, 'readOnly', {
                    value: type === MESSAGE_TYPE.QUERY,
                    writable: false,
                    configurable: false,
                    enumerable: false
                });
            }

            eventEmitter.on('gotresult', (result) => {
                clearContext(uuid);
                if (result.error) {
                    reject(result);
                } else {
                    resolve(result);
                }
            });

            emitters.set(uuid, {
                emitter: eventEmitter
            });


            eventEmitter.on('timeout', () => {
                clearContext(uuid);
                reject({
                    'error': `timeout when send request:  ${JSON.stringify(data)}`
                });
            });

            emitters.get(uuid).timer = setTimeout(() => {
                eventEmitter.emit('timeout');
            }, timeout);

            tlsSocket.write(packagedData);
        } else {
            tlsSocket.write(packagedData);
            resolve(undefined as unknown as T);
        }
    });
}

export function registerBlockNotifyCallback(groupID: number, callback: Function, node: { ip: string; port: number }, authentication: { key: string; ca: string; cert: string }) {
    if (blockNotifyCallbacks.has(groupID)) {
        blockNotifyCallbacks.get(groupID).push(callback);
    } else {
        blockNotifyCallbacks.set(groupID, [callback]);
    }

    const data = ['_block_notify_' + groupID];
    return channelPromise(data, MESSAGE_TYPE.AMOP_CLIENT_TOPICS, node, authentication);
}
