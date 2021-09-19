import { config } from './config';
import { Web3jService } from './contract-sdk';

const web3j = new Web3jService(config);

web3j.getBlockHeight().then(console.log, console.error);
web3j.getPbftView().then(console.log, console.error);

web3j.sendRawTransaction(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);

web3j.call(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);

(async () => {
    const { contractAddress } = await web3j.deploy(
        `[{"inputs":[{"internalType":"string","name":"id","type":"string"}],"name":"get","outputs":[{"internalType":"string[2]","name":"","type":"string[2]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"keys","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"id","type":"string"},{"internalType":"string","name":"rk","type":"string"}],"name":"reEncrypt","outputs":[{"internalType":"string[2]","name":"","type":"string[2]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"id","type":"string"},{"internalType":"string[2]","name":"key","type":"string[2]"}],"name":"set","outputs":[],"stateMutability":"nonpayable","type":"function"}]`,
        `608060405234801561001057600080fd5b50610e72806100206000396000f3fe608060405234801561001057600080fd5b506004361061004c5760003560e01c806306699b011461005157806317b1b24914610081578063693ec85e146100b157806386c124e0146100e1575b600080fd5b61006b6004803603810190610066919061092f565b6100fd565b6040516100789190610b70565b60405180910390f35b61009b600480360381019061009691906108b7565b6101c3565b6040516100a89190610b4e565b60405180910390f35b6100cb60048036038101906100c691906107ad565b61036a565b6040516100d89190610b4e565b60405180910390f35b6100fb60048036038101906100f6919061083f565b610455565b005b600082805160208101820180518482526020830160208501208183528095505050505050816002811061012f57600080fd5b0160009150915050805461014290610d0b565b80601f016020809104026020016040519081016040528092919081815260200182805461016e90610d0b565b80156101bb5780601f10610190576101008083540402835291602001916101bb565b820191906000526020600020905b81548152906001019060200180831161019e57829003601f168201915b505050505081565b6101cb610487565b6000615007905060405180604001604052806000866040516101ed9190610b37565b908152602001604051809103902060006002811061020e5761020d610d9d565b5b01805461021a90610d0b565b80601f016020809104026020016040519081016040528092919081815260200182805461024690610d0b565b80156102935780601f1061026857610100808354040283529160200191610293565b820191906000526020600020905b81548152906001019060200180831161027657829003601f168201915b505050505081526020018273ffffffffffffffffffffffffffffffffffffffff166317b1b2496000886040516102c99190610b37565b90815260200160405180910390206001600281106102ea576102e9610d9d565b5b01876040518363ffffffff1660e01b8152600401610309929190610b92565b60006040518083038186803b15801561032157600080fd5b505afa158015610335573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f8201168201806040525081019061035e91906107f6565b81525091505092915050565b610372610487565b6000826040516103829190610b37565b9081526020016040518091039020600280602002604051908101604052809291906000905b8282101561044a5783820180546103bd90610d0b565b80601f01602080910402602001604051908101604052809291908181526020018280546103e990610d0b565b80156104365780601f1061040b57610100808354040283529160200191610436565b820191906000526020600020905b81548152906001019060200180831161041957829003601f168201915b5050505050815260200190600101906103a7565b505050509050919050565b806000836040516104669190610b37565b90815260200160405180910390209060026104829291906104ae565b505050565b60405180604001604052806002905b60608152602001906001900390816104965790505090565b82600281019282156104f0579160200282015b828111156104ef5782518290805190602001906104df929190610501565b50916020019190600101906104c1565b5b5090506104fd9190610587565b5090565b82805461050d90610d0b565b90600052602060002090601f01602090048101928261052f5760008555610576565b82601f1061054857805160ff1916838001178555610576565b82800160010185558215610576579182015b8281111561057557825182559160200191906001019061055a565b5b50905061058391906105ab565b5090565b5b808211156105a7576000818161059e91906105c8565b50600101610588565b5090565b5b808211156105c45760008160009055506001016105ac565b5090565b5080546105d490610d0b565b6000825580601f106105e65750610605565b601f01602090049060005260206000209081019061060491906105ab565b5b50565b600061061b61061684610bee565b610bc9565b9050808285602086028201111561063557610634610e00565b5b60005b8581101561068357813567ffffffffffffffff81111561065b5761065a610dfb565b5b808601610668898261073c565b85526020850194506020840193505050600181019050610638565b5050509392505050565b60006106a061069b84610c14565b610bc9565b9050828152602081018484840111156106bc576106bb610e05565b5b6106c7848285610cc9565b509392505050565b60006106e26106dd84610c14565b610bc9565b9050828152602081018484840111156106fe576106fd610e05565b5b610709848285610cd8565b509392505050565b600082601f83011261072657610725610dfb565b5b6002610733848285610608565b91505092915050565b600082601f83011261075157610750610dfb565b5b813561076184826020860161068d565b91505092915050565b600082601f83011261077f5761077e610dfb565b5b815161078f8482602086016106cf565b91505092915050565b6000813590506107a781610e25565b92915050565b6000602082840312156107c3576107c2610e0f565b5b600082013567ffffffffffffffff8111156107e1576107e0610e0a565b5b6107ed8482850161073c565b91505092915050565b60006020828403121561080c5761080b610e0f565b5b600082015167ffffffffffffffff81111561082a57610829610e0a565b5b6108368482850161076a565b91505092915050565b6000806040838503121561085657610855610e0f565b5b600083013567ffffffffffffffff81111561087457610873610e0a565b5b6108808582860161073c565b925050602083013567ffffffffffffffff8111156108a1576108a0610e0a565b5b6108ad85828601610711565b9150509250929050565b600080604083850312156108ce576108cd610e0f565b5b600083013567ffffffffffffffff8111156108ec576108eb610e0a565b5b6108f88582860161073c565b925050602083013567ffffffffffffffff81111561091957610918610e0a565b5b6109258582860161073c565b9150509250929050565b6000806040838503121561094657610945610e0f565b5b600083013567ffffffffffffffff81111561096457610963610e0a565b5b6109708582860161073c565b925050602061098185828601610798565b9150509250929050565b60006109978383610a14565b905092915050565b60006109aa82610c64565b6109b48185610c87565b9350836020820285016109c685610c45565b8060005b85811015610a0257848403895281516109e3858261098b565b94506109ee83610c7a565b925060208a019950506001810190506109ca565b50829750879550505050505092915050565b6000610a1f82610c6f565b610a298185610c92565b9350610a39818560208601610cd8565b610a4281610e14565b840191505092915050565b6000610a5882610c6f565b610a628185610ca3565b9350610a72818560208601610cd8565b610a7b81610e14565b840191505092915050565b6000610a9182610c6f565b610a9b8185610cb4565b9350610aab818560208601610cd8565b80840191505092915050565b60008154610ac481610d0b565b610ace8186610ca3565b94506001821660008114610ae95760018114610afb57610b2e565b60ff1983168652602086019350610b2e565b610b0485610c4f565b60005b83811015610b2657815481890152600182019150602081019050610b07565b808801955050505b50505092915050565b6000610b438284610a86565b915081905092915050565b60006020820190508181036000830152610b68818461099f565b905092915050565b60006020820190508181036000830152610b8a8184610a4d565b905092915050565b60006040820190508181036000830152610bac8185610ab7565b90508181036020830152610bc08184610a4d565b90509392505050565b6000610bd3610be4565b9050610bdf8282610d3d565b919050565b6000604051905090565b600067ffffffffffffffff821115610c0957610c08610dcc565b5b602082029050919050565b600067ffffffffffffffff821115610c2f57610c2e610dcc565b5b610c3882610e14565b9050602081019050919050565b6000819050919050565b60008190508160005260206000209050919050565b600060029050919050565b600081519050919050565b6000602082019050919050565b600081905092915050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b6000819050919050565b82818337600083830152505050565b60005b83811015610cf6578082015181840152602081019050610cdb565b83811115610d05576000848401525b50505050565b60006002820490506001821680610d2357607f821691505b60208210811415610d3757610d36610d6e565b5b50919050565b610d4682610e14565b810181811067ffffffffffffffff82111715610d6557610d64610dcc565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b610e2e81610cbf565b8114610e3957600080fd5b5056fea2646970667358221220d06a7000bfd4dc25f36ef1c80da3cb3b9061097b4ec4bf83229a4c2f2da7b00864736f6c63430008070033`,
        []
    );

    console.log(await web3j.sendRawTransaction(
        contractAddress,
        'function set(string memory id, string[2] memory key) public',
        ['123', ['e5f99fdd9839b17b576a9eb4a8f6bb756af906b9fff321330b33b39a2a04c232', '33b1fed05ce4caa0294a6fa60c6c7555853fd4beb2083c0b0b9855afa9f62063bee7f1c8b833bc1fd9d23c309af34503']]
    ));
    console.log(await web3j.call(
        contractAddress,
        'function get(string memory id) public view returns (string[2] memory)',
        ['123']
    ));
    console.log(await web3j.call(
        contractAddress,
        'function reEncrypt(string memory id, string memory rk) public view returns (string[2] memory)',
        ['123', '4dc2227b1d965d9b1bf850ce9a880068648bfad0a270a22cc66a2bf151920d8add23aeb95709d3c76b803b3b87fc8b039e28c131b7c8a5244c8a270e848db95b86afa7f7078d144c3a7823b8765383155a6b9aa10b4ef55d259f667e050e3c91']
    ));
})();


