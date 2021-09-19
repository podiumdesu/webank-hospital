// SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.5.0;
pragma experimental ABIEncoderV2;

abstract contract PRE {
    function generatorGen(string memory g, string memory h) public virtual view returns(string memory, string memory);
    function reEncrypt(string memory ca1, string memory rk) public virtual view returns(string memory);
}

contract MedicalRecord {
    mapping(string => string[2]) public keys;

    function get(string memory id) public view returns (string[2] memory) {
        return keys[id];
    }

    function set(string memory id, string[2] memory key) public {
        keys[id] = key;
    }

    function reEncrypt(string memory id, string memory rk) public view returns (string[2] memory) {
        PRE pre = PRE(address(0x5007));
        return [keys[id][0], pre.reEncrypt(keys[id][1], rk)];
    }
}
