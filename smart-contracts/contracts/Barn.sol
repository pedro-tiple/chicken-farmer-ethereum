pragma solidity ^0.5.8;

contract BarnRegistrationCenter {
    uint8 public barnCostInGoldEggs;

    function receiveNewGoldEgg() external {}
    function spendGoldEggs(uint) external {}
	function getGoldEggCount() external view returns (uint) {}
}

contract Barn {
    uint8 public constant feedPerGoldEgg = 10;
    uint8 public constant autoFeederCost = 100;
    uint8 public constant chickenCost = 1;
    uint8 public constant feedCost = 1;

    struct Chicken {
        uint blockOfPurchase;
        uint restingUntil;
        uint eggsLaid;
        uint goldEggsLaid;
        uint8 goldEggChance;
        bool available;
    }

    address owner;
    BarnRegistrationCenter barnRegistrationCenter;
    Chicken[] public chickens;
    uint public availableFeed;
    bool public autoFeederBought;

    modifier onlyOwner {
        require(msg.sender == owner, "Owner exclusive function");
        _;
    }

    constructor(address _barnRegistrationCenter) public {
        owner = msg.sender;
        barnRegistrationCenter = BarnRegistrationCenter(_barnRegistrationCenter);
        availableFeed = barnRegistrationCenter.barnCostInGoldEggs() * feedPerGoldEgg;
        autoFeederBought = false;

        // add starting chicken
        chickens.push(Chicken(block.number, 0, 0, 0, 33, true));
    }

    function buyAutoFeeder() external onlyOwner {
		require(autoFeederBought == false, "AutoFeeder already bought");
		barnRegistrationCenter.spendGoldEggs(autoFeederCost);
		autoFeederBought = true;
	}

    function newChicken() external onlyOwner {
        barnRegistrationCenter.spendGoldEggs(chickenCost);

        // gold egg chance will be in [10, 90]
        chickens.push(Chicken(block.number, 0, 0, 0, rng(90) + 10, true));
    }

    function sellChicken(uint _chickenBarcode) external onlyOwner {
        require(_chickenBarcode < chickens.length, "Chicken does not exist");
        require(chickens[_chickenBarcode].available == true, "Chicken already sold");

        chickens[_chickenBarcode].available = false;
    }

    function buyFeed() external onlyOwner {
        // TODO variable feed cost with buyable upgrades
        barnRegistrationCenter.spendGoldEggs(feedCost);
        // TODO check for overflows
        availableFeed += feedPerGoldEgg;
    }

    function feedChicken(uint _chickenBarcode) external onlyOwner {
        require(availableFeed >= 1, "No feed available");
        require(_chickenBarcode < chickens.length, "Chicken does not exist");
        require(chickens[_chickenBarcode].available == true, "Chicken sold");
        require(chickens[_chickenBarcode].restingUntil < block.number, "Chicken still resting");

        uint randomVal = rng(100);
        if (randomVal < chickens[_chickenBarcode].goldEggChance) {
            barnRegistrationCenter.receiveNewGoldEgg();
            chickens[_chickenBarcode].goldEggsLaid += 1;
        }

        chickens[_chickenBarcode].eggsLaid += 1;
        chickens[_chickenBarcode].restingUntil = block.number + randomVal / 3;
        availableFeed -= 1;
    }

    function getChickenCount() public view returns (uint) {
		return chickens.length;
	}

	function rng(uint max) private view returns (uint8) {
        // got this online, we don't really care if some miner cheats at this, should return in [0, max]
		return uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % max);
	}
}
