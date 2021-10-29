contract CA {
    struct Member {
        uint from;
        uint to;
        string pk;
    }

    mapping(address => Member) members;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public {
        require(msg.sender == owner, "Caller should be the owner of the contract.");
        owner = newOwner;
    }

    function issue(address member, string memory pk) public {
        require(msg.sender == owner, "Caller should be the owner of the contract.");
        members[member].from = block.timestamp;
        members[member].to = type(uint).max;
        members[member].pk = pk;
    }

    function revoke(address member) public {
        require(msg.sender == owner, "Caller should be the owner of the contract.");
        members[member].to = block.timestamp;
    }

    function getPK(address member) public view returns (string memory) {
        require(members[member].from <= block.timestamp && members[member].to >= block.timestamp, "Membership expired.");
        return members[member].pk;
    }

    function isValid(address member, bytes32 hash, uint8 v, bytes32 r, bytes32 s, uint timestamp) public view returns (bool) {
        if (members[member].from <= timestamp && members[member].to >= timestamp) {
            if (ecrecover(hash, v, r, s) == member) {
                return true;
            }
        }
        return false;
    }
}
