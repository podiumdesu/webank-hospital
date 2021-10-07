import { utils } from "ethers";

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
    privateKey: Buffer;

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
        privateKey: Buffer;
    }) {
        this.authentication = config.authentication;
        this.nodes = config.nodes;
        this.timeout = config.timeout;
        this.groupID = config.groupID;
        this.chainID = config.chainID;
        this.privateKey = config.privateKey;
    }

    get address() {
        return utils.computeAddress(this.privateKey);
    }
}
