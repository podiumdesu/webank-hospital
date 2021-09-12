
import tls from 'tls';

import net from 'net';

import { randomUUID } from 'crypto';

import events from 'events';

export const MESSAGE_TYPE = {
    QUERY: 0x11,    // dirty trick, non-stardand type code, use to differentiate read-only request and transaction
    CHANNEL_RPC_REQUEST: 0x12,
    CLIENT_REGISTER_EVENT_LOG: 0x15,
    AMOP_CLIENT_TOPICS: 0x32,
    TRANSACTION_NOTIFY: 0x1000,
    BLOCK_NOTIFY: 0x1001,
    EVENT_LOG_PUSH: 0x1002
};

let emitters = new Map();
let buffers = new Map();
let sockets = new Map();
let lastBytesRead = new Map();

let blockNotifyCallbacks = new Map();
let eventLogFilterCallbacks = new Map();

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
    let emitter = emitters.get(seq);
    if (!emitter) {
        // Stale message received
        return;
    }
    emitter = emitter.emitter;
    if (!emitter) {
        throw new Error(`unknown owner message receieved, seq=${seq}`);
    }
    return emitter;
}

function parseResponse(buffer: Buffer) {
    let seq = buffer.slice(6, 38).toString();
    let type = buffer.slice(4, 6).readUInt16BE();
    let errorCode = buffer.slice(38, 42).readUInt32BE();

    switch (type) {
        case MESSAGE_TYPE.TRANSACTION_NOTIFY: {
            // transaction notification
            checkErrorCode(errorCode);
            let emitter = getEmitter(seq);
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
            let data = buffer.slice(42);
            // topic length = the actual topic length + 1, strange design
            let topicLength = data.slice(0, 1).readUInt8();
            const response = data.slice(topicLength).toString('ascii');
            let [groupID, blockHeight] = response.split(',').map((str) => (parseInt(str)));

            if (blockNotifyCallbacks.has(groupID)) {
                for (let callback of blockNotifyCallbacks.get(groupID)) {
                    callback(groupID, blockHeight);
                }
            }
            break;
        }
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST: {
            // JSON RPC 2.0 format response
            checkErrorCode(errorCode);
            let emitter = getEmitter(seq);
            if (emitter) {

                const response = JSON.parse(buffer.slice(42).toString());
                let readOnly = Object.getOwnPropertyDescriptor(emitter, 'readOnly')?.value;

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
            let emitter = getEmitter(seq);
            if (emitter) {
                let data = buffer.slice(42);
                // topic length = the actual topic length + 1, strange design
                let topicLength = data.slice(0, 1).readUInt8();
                const response = JSON.parse(data.slice(topicLength).toString());
                emitter.emit('gotresult', response);
            }
            break;
        }
        case MESSAGE_TYPE.EVENT_LOG_PUSH: {
            const response = JSON.parse(buffer.slice(42).toString());

            let filterID = response.filterID;
            if (eventLogFilterCallbacks.has(filterID)) {
                let callback = eventLogFilterCallbacks.get(filterID);
                callback(response);
            }

            break;
        }
        default:
            throw new Error(`unknown type message received, type=${type}`);
    }
}

/**
 * Create a new TLS socket
 * @param {String} ip IP of channel server
 * @param {Number} port Port of channel server
 * @param {Object} authentication A JSON object contains certificate file path, private key file path and CA file path
 * @return {TLSSocket} A new TLS socket
 */
function createNewSocket(ip: string, port: number, { key, ca, cert }: { key: string; ca: string; cert: string }) {
    let secureContext = tls.createSecureContext({
        key,
        cert,
        ca,
        ecdhCurve: 'secp256k1',
    });

    let socket = new net.Socket();
    socket.connect(port, ip);

    let clientOptions = {
        rejectUnauthorized: false,
        secureContext,
        socket
    };

    let tlsSocket = tls.connect(clientOptions);

    let socketID = `${ip}:${port}`;

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
            let cache = buffers.get(socketID);
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

    let length = Buffer.alloc(4);
    length.writeUInt32BE(headerLength + data.length);

    let dataType = Buffer.alloc(2);
    switch (type) {
        case MESSAGE_TYPE.QUERY:
        case MESSAGE_TYPE.CHANNEL_RPC_REQUEST:
            dataType.writeUInt16BE(MESSAGE_TYPE.CHANNEL_RPC_REQUEST);
            break;
        default:
            dataType.writeUInt16BE(type);
            break;
    }

    let uuid = randomUUID();
    uuid = uuid.replace(/-/g, '');
    let seq = Buffer.from(uuid, 'ascii');

    let result = Buffer.alloc(4);
    result.writeInt32BE(0);

    return {
        uuid,
        packagedData: Buffer.concat([length, dataType, seq, result, data])
    };
}

function packData(data: string, type: number) {
    let msg = Buffer.from(data, 'ascii');

    return packWithHeader(msg, type);
}

function clearContext(uuid: string) {
    if (emitters.get(uuid).timer) {
        clearTimeout(emitters.get(uuid).timer);
    }
    emitters.delete(uuid);
    buffers.delete(uuid);
}

function channelPromise(data: object, type: number, node: { ip: string; port: number }, authentication: { key: string; ca: string; cert: string }, timeout?: number) {
    let ip = node.ip;
    let port = node.port;

    let socketID = `${ip}:${port}`;

    const { uuid, packagedData } = packData(JSON.stringify(data), type);

    return new Promise(async (resolve, reject) => {
        // Singleton Socket instance
        if (!sockets.has(socketID)) {
            let newSocket = createNewSocket(ip, port, authentication);
            newSocket.unref();
            sockets.set(socketID, newSocket);

            let clear = () => {
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
        let tlsSocket = sockets.get(socketID);
        tlsSocket.socketID = uuid;

        if (timeout) {
            let eventEmitter = new events.EventEmitter();

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
            resolve(undefined);
        }
    });
}

function registerBlockNotifyCallback(groupID: number, callback: Function, node: { ip: string; port: number }, authentication: { key: string; ca: string; cert: string }) {
    if (blockNotifyCallbacks.has(groupID)) {
        blockNotifyCallbacks.get(groupID).push(callback);
    } else {
        blockNotifyCallbacks.set(groupID, [callback]);
    }

    let data = ['_block_notify_' + groupID];
    return channelPromise(data, MESSAGE_TYPE.AMOP_CLIENT_TOPICS, node, authentication);
}

export { channelPromise }
export { registerBlockNotifyCallback }
