import { Web3jService } from './contract-sdk';
import { baseConfig } from './config';
import { readFileSync } from 'fs';
import { Configuration } from './contract-sdk/config';

const caConfig = new Configuration({
    ...baseConfig,
    privateKey: Buffer.from(`b3e20ffdadfbd2b01e5f3c08b927583aa4247dbe13041d6e4ed6fde9fd50f3c2`, 'hex'),
});

const web3j = new Web3jService(caConfig);

(async () => {
    const { contractAddress: ca } = await web3j.deploy(
        readFileSync('../contracts/build/CA.abi').toString(),
        readFileSync('../contracts/build/CA.bin').toString(),
        [],
    );
    const { contractAddress: meta } = await web3j.deploy(
        readFileSync('../contracts/build/Meta.abi').toString(),
        readFileSync('../contracts/build/Meta.bin').toString(),
        [],
    );
    const { contractAddress: record } = await web3j.deploy(
        readFileSync('../contracts/record/target/contract.abi').toString(),
        readFileSync('../contracts/record/target/contract.wasm').toString('hex'),
        [],
    );
    const { contractAddress: trace } = await web3j.deploy(
        readFileSync('../contracts/trace/target/contract.abi').toString(),
        readFileSync('../contracts/trace/target/contract.wasm').toString('hex'),
        [meta],
    );
    console.log({
        ca,
        meta,
        record,
        trace,
    });
})()
