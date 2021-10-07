contract CA {
    struct Period {
        uint from;
        uint to;
    }

    mapping(address => Period) members;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function setOwner(address newOwner) public {
        require(msg.sender == owner);
        owner = newOwner;
    }

    function issue(address member) public {
        require(msg.sender == owner);
        members[member].from = block.timestamp;
        members[member].to = type(uint).max;
    }

    function revoke(address member) public {
        require(msg.sender == owner);
        members[member].to = block.timestamp;
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
