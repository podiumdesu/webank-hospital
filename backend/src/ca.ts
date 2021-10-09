import { Configuration } from './contract-sdk/config';
import { addresses, baseConfig } from './config';
import { Web3jService } from './contract-sdk';

const caConfig = new Configuration({
    ...baseConfig,
    privateKey: Buffer.from(`b3e20ffdadfbd2b01e5f3c08b927583aa4247dbe13041d6e4ed6fde9fd50f3c2`, 'hex'),
});

const web3j = new Web3jService(caConfig);

const members = [
    '0x47f76a5e5ad8CF4E6D3E7c854678Bc2DfBb5f2A2',
    '0xF12baAAB2b949497ce05C986269701EbCe866A5C',
    '0x7B59b2cC8b3d7712Cd67D92D134385277872EE80',
    '0x97E042b532a8796eecF184D91c7C6fc83D8ca774',
];

(async () => {
    await Promise.all(members.map((member) => web3j.sendRawTransaction(
        addresses.ca,
        'function issue(address member) public',
        [member]
    )));
})();
