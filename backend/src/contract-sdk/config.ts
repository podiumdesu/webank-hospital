const EC_PRIVATE_KEY_PREFIX = '30740201010420';
const PRIVATE_KEY_PREFIX_LEN = 66;

export class Configuration {
    authentication: {
        key: string;
        cert: string;
        ca: string;
    };
    nodes: { ip: string; port: number; }[];
    timeout: number;
    groupID: number;
    chainID: number;
    account: {
        privateKey: string;
        address: string;
    }
    constructor(config: {
        authentication: {
            key: string;
            cert: string;
            ca: string;
        };
        nodes: { ip: string; port: number; }[];
        timeout: number;
        groupID: number;
        chainID: number;
        account: {
            privateKey: string;
            address: string;
        }
    }) {
        this.authentication = config.authentication;
        this.nodes = config.nodes;
        this.timeout = config.timeout;
        this.groupID = config.groupID;
        this.chainID = config.chainID;
        this.account = {
            privateKey: this._parsePrivateKey(config.account.privateKey),
            address: config.account.address
        }
    }

    _parsePrivateKey(privateKey: string) {
        privateKey = Buffer.from(privateKey.split('\n').filter(Boolean).slice(1, -1).join(''), 'base64').toString('hex');
        return privateKey.startsWith(EC_PRIVATE_KEY_PREFIX) ? privateKey.slice(EC_PRIVATE_KEY_PREFIX.length, EC_PRIVATE_KEY_PREFIX.length + 64) : privateKey.slice(PRIVATE_KEY_PREFIX_LEN, PRIVATE_KEY_PREFIX_LEN + 64);
    }
}
