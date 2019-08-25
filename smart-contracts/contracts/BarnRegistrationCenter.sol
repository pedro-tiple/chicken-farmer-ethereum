pragma solidity ^0.5.8;

contract BarnRegistrationCenter {
    uint8 public constant barnCostInGoldEggs = 10;

    mapping(address => address) barnIsOwnedBy;
    mapping(address => address[]) barnsOwnedBy;
    mapping(address => uint) goldEggsOwnedBy;

    constructor() public {}

    function registerBarn(address _barnAddress) external {
        require(barnIsOwnedBy[_barnAddress] == address(0), "Barn already owned");
        // TODO check if it's the expected smart contract bytecode?

        // first barn is free, next ones cost gold eggs
        if (barnsOwnedBy[msg.sender].length > 0) {
            require(goldEggsOwnedBy[msg.sender] >= barnCostInGoldEggs, "Not enough gold eggs");

            // no need for safe math because we already checked that there are enough
            goldEggsOwnedBy[msg.sender] -= barnCostInGoldEggs;
        }

        barnIsOwnedBy[_barnAddress] = msg.sender;
        barnsOwnedBy[msg.sender].push(_barnAddress);
    }

    function receiveNewGoldEgg() external {
        require(barnIsOwnedBy[msg.sender] != address(0), "Barn not owned");
        // should we check if this overflows?
        goldEggsOwnedBy[barnIsOwnedBy[msg.sender]] += 1;
    }

    function spendGoldEgg() external {
        require(barnIsOwnedBy[msg.sender] != address(0), "Barn not owned");
        require(goldEggsOwnedBy[barnIsOwnedBy[msg.sender]] >= 1, "No gold eggs available");
        goldEggsOwnedBy[barnIsOwnedBy[msg.sender]] -= 1;
    }

    function getOwnedBarns() public view returns (address[] memory) {
        return barnsOwnedBy[msg.sender];
    }

    function getGoldEggCount() public view returns (uint) {
        return goldEggsOwnedBy[msg.sender];
    }
}
