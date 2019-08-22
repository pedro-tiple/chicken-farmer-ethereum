pragma solidity ^0.5.8;

contract BarnRegistrationCenter {
    uint8 public barnCostInGoldEggs;

    function receiveNewGoldEgg() external {}
    function spendGoldEgg() external {}
}

contract Barn {
    uint8 public constant feedPerGoldEgg = 10;
    uint8 public constant goldEggChance = 15;

    struct Chicken {
        uint blockOfPurchase;
        uint restingUntil;
        uint eggsLaid;
        uint goldEggsLaid;
    }

    address owner;
    BarnRegistrationCenter barnRegistrationCenter;
    Chicken[] public chickens;
    uint public availableFeed;

    modifier onlyOwner {
        require(msg.sender == owner, "Owner exclusive function");
        _;
    }

    constructor(address _barnRegistrationCenter) public {
        owner = msg.sender;
        barnRegistrationCenter = BarnRegistrationCenter(_barnRegistrationCenter);
        availableFeed = barnRegistrationCenter.barnCostInGoldEggs() * feedPerGoldEgg;

        // add starting chicken
        chickens.push(Chicken(block.number, 0, 0, 0));
    }

    function newChicken() external onlyOwner {
        barnRegistrationCenter.spendGoldEgg();
        chickens.push(Chicken(block.number, 0, 0, 0));
    }

    function buyFeed() external onlyOwner {
        barnRegistrationCenter.spendGoldEgg();
        // TODO check for overflows
        availableFeed += feedPerGoldEgg;
    }

    function feedChicken(uint _chickenBarcode) external onlyOwner {
        require(availableFeed >= 1, "No feed available");
        require(_chickenBarcode < chickens.length, "Chicken does not exist");
        require(chickens[_chickenBarcode].restingUntil < block.number, "Chicken still resting");

        // got this online, we don't really care if some miner cheats at this, should return in [0, 99]
        uint rng = uint8(uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % 100);
        if (rng < goldEggChance) {
            barnRegistrationCenter.receiveNewGoldEgg();
            chickens[_chickenBarcode].goldEggsLaid += 1;
        }

        chickens[_chickenBarcode].eggsLaid += 1;
        chickens[_chickenBarcode].restingUntil = block.number + rng / 2;
        availableFeed -= 1;
    }
}
