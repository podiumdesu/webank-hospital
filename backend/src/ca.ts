import { Configuration } from './contract-sdk/config';
import { addresses, baseConfig } from './config';
import { Web3jService } from './contract-sdk';

const caConfig = new Configuration({
    ...baseConfig,
    privateKey: Buffer.from(`b3e20ffdadfbd2b01e5f3c08b927583aa4247dbe13041d6e4ed6fde9fd50f3c2`, 'hex'),
});

const web3j = new Web3jService(caConfig);

const members = [
    ['0x47f76a5e5ad8CF4E6D3E7c854678Bc2DfBb5f2A2', 'ae767e00f212e76031912862618aa483bb6c18ff7843303619cef0657d22b6f5240adb213106cb1a137fd6a7295e992b'],
    ['0xF12baAAB2b949497ce05C986269701EbCe866A5C', '92d252dd1138d5a165afe8f50405c833450e927c36e858f6730e5274bf65eb77adc8c1ea6f628d5a001d1332d153c06a'],
    ['0x7B59b2cC8b3d7712Cd67D92D134385277872EE80', 'a22785a4beb2536dcb0d01b5f93f7a6a536d78219dd783d734ab5b366a8cc171714e442eef0e3ff09c22673c49c42cdf'],
    ['0x97E042b532a8796eecF184D91c7C6fc83D8ca774', 'ae5c723038f1b44a06680a61b54d6d62292605024bce816fbf5e6d3d85601a208e51b73d895e40dc6b5d7cae65d9a34c'],
];

(async () => {
    await Promise.all(members.map(([member, pk]) => web3j.sendRawTransaction(
        addresses.ca,
        'function issue(address member, string memory pk) public',
        [member, pk]
    )));
})();
