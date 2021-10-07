import { Configuration } from './contract-sdk/config';
import { addresses, baseConfig } from './config';
import { Web3jService } from './contract-sdk';

const caConfig = new Configuration({
    ...baseConfig,
    privateKey: Buffer.from(`b3e20ffdadfbd2b01e5f3c08b927583aa4247dbe13041d6e4ed6fde9fd50f3c2`, 'hex'),
});

const web3j = new Web3jService(caConfig);

(async () => {
    await web3j.sendRawTransaction(
        addresses.ca,
        'function issue(address member) public',
        ['0x47f76a5e5ad8CF4E6D3E7c854678Bc2DfBb5f2A2']
    );
})();
