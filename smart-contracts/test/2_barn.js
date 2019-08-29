const BarnRegistrationCenter = artifacts.require("BarnRegistrationCenter");
const Barn = artifacts.require("Barn");

contract("Barn", async accounts => {
    it("barn should start with feed and a chicken", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        const barn = await Barn.deployed();

        const availableFeed = (await barn.availableFeed.call()).toNumber();
        const barnCostInGoldEggs = (await brc.barnCostInGoldEggs.call()).toNumber();
        const feedPerGoldEgg = (await barn.feedPerGoldEgg.call()).toNumber();
        const expectedFeed = feedPerGoldEgg * barnCostInGoldEggs;

        assert.equal(availableFeed, expectedFeed, "there should be feed available");
        assert.notEqual((await barn.chickens.call(0)).blockOfPurchase.toNumber(), 0, "there should be a chicken");
    });

    it("owner exclusive functions are restricted", async () => {
        const barn = await Barn.deployed();

        try {
            await barn.newChicken({ from: accounts[1] });
        } catch (e) {
            assert.equal(e.reason, "Owner exclusive function", "only owner should be able to call this function");
        }

        try {
            await barn.buyFeed({ from: accounts[1] });
        } catch (e) {
            assert.equal(e.reason, "Owner exclusive function", "only owner should be able to call this function");
        }

        try {
            await barn.feedChicken(0, { from: accounts[1] });
        } catch (e) {
            assert.equal(e.reason, "Owner exclusive function", "only owner should be able to call this function");
        }
    });

    it("buying a chicken adds a new one and spends an egg", async () => {
        // must first register the barn
        const brc = await BarnRegistrationCenter.deployed();
        const barn = await Barn.deployed();
        await brc.registerBarn(accounts[1], { from: accounts[0] });

        const barnCostInGoldEggs = (await brc.barnCostInGoldEggs.call()).toNumber();

        for (let i = 0; i < barnCostInGoldEggs; i++) {
            await brc.receiveNewGoldEgg({ from: accounts[1] });
        }
        await brc.registerBarn(barn.address, { from: accounts[0] });

        // need one more egg to pay the chicken
        await brc.receiveNewGoldEgg({ from: accounts[1] });
        await barn.newChicken({ from: accounts[0] });
        assert.notEqual((await barn.chickens.call(1)).blockOfPurchase.toNumber(), 0, "there should be a chicken");
        assert.equal((await brc.getGoldEggCount.call({ from: accounts[0] })).toNumber(), 0, "a gold egg should have been spent");
    });

    it("can't buy a new chicken without enough eggs", async () => {
        const barn = await Barn.deployed();
        try {
            await barn.newChicken({ from: accounts[0] });
        } catch (e) {
            assert.equal(e.reason, "No gold eggs available", "should not be able to buy chickens with 0 gold eggs");
        }
    });

    it("buying feed increases the available feed and spends an egg", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        const barn = await Barn.deployed();
        const feedPerGoldEgg = (await barn.feedPerGoldEgg.call()).toNumber();
        let availableFeed = (await barn.availableFeed.call()).toNumber();
        let goldEggCount = (await brc.getGoldEggCount.call({ from: accounts[0] })).toNumber();
        assert.equal(availableFeed, 100, "precondition amount of feed not correct");
        assert.equal(goldEggCount, 0, "precondition amount of gold eggs not correct");
        await brc.receiveNewGoldEgg({ from: accounts[1] });

        await barn.buyFeed({ from: accounts[0] });
        availableFeed = (await barn.availableFeed.call()).toNumber();
        goldEggCount = (await brc.getGoldEggCount.call({ from: accounts[0] })).toNumber();
        assert.equal(availableFeed, 100 + feedPerGoldEgg, "should have increased the amount of feed");
        assert.equal(goldEggCount, 0, "should have spent a gold egg");
    });

    it("need a gold egg to buy feed", async () => {
        const barn = await Barn.deployed();
        try {
            await barn.buyFeed({ from: accounts[0] });
        } catch (e) {
            assert.equal(e.reason, "No gold eggs available", "should not be able to buy feed with 0 gold eggs");
        }
    });

    it("feeding a chicken spends feed and generates an egg", async () => {
        const barn = await Barn.deployed();
        assert.equal((await barn.chickens.call(0)).eggsLaid.toNumber(), 0, "precondition amount of eggs should be 0");
        await barn.feedChicken(0, { from: accounts[0] });

        assert.equal((await barn.chickens.call(0)).eggsLaid.toNumber(), 1, "should have increased the amount of feed");
        assert.equal((await barn.availableFeed.call()).toNumber(), 109, "should have increased the amount of feed");
    });

    it("feeding a chicken spends feed and generates a golden egg", async () => {
        const barn = await Barn.deployed();

        // spend all the feed
        const availableFeed = (await barn.availableFeed.call()).toNumber();
        // chicken rest time is at max 100/2
        let waitTime = 50;
        for (let i = 0; i < availableFeed; i++) {
            // move block forward
            let blocksToMine = (await barn.chickens.call(0)).restingUntil.toNumber() - (await web3.eth.getBlock("latest")).number;
            for (let t = 0; t < blocksToMine; t++) {
                web3.currentProvider.send({
                    jsonrpc: "2.0",
                    method: "evm_mine",
                    id: new Date().getTime()
                }, () => {});
            }
            await barn.feedChicken(0, {from: accounts[0]});
        }
        assert.equal((await barn.availableFeed.call()).toNumber(), 0, "should have spent all the feed");
    });

    it("feeding a chicken needs it to exist, not be resting, and feed needs to be available", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        const barn = await Barn.deployed();

        try {
            await barn.feedChicken(0);
        } catch (e) {
            assert.equal(e.reason, "No feed available", "should have enough feed");
        }

        await brc.receiveNewGoldEgg({ from: accounts[1] });
        await barn.buyFeed({ from: accounts[0] });
        try {
            await barn.feedChicken(999);
        } catch (e) {
            assert.equal(e.reason, "Chicken does not exist", "invalid chicken barcode should fail");
        }

        try {
            await barn.feedChicken(0);
        } catch (e) {
            assert.equal(e.reason, "Chicken still resting", "should fail if chicken still resting");
        }
    });

    it("can sell a chicken", async () => {
        const barn = await Barn.deployed();

        await barn.sellChicken(0);
        const chicken = await barn.chickens(0);
        assert.equal(chicken.available, false, "should have marked the chicken with available as false");

        try {
            await barn.sellChicken(0);
        } catch (e) {
            assert.equal(e.reason, "Chicken already sold", "should fail if chicken already sold");
        }

        try {
            await barn.feedChicken(0);
        } catch (e) {
            assert.equal(e.reason, "Chicken sold", "should fail if chicken has been sold before");
        }

        try {
            await barn.sellChicken(999);
        } catch (e) {
            assert.equal(e.reason, "Chicken does not exist", "invalid chicken barcode should fail");
        }
    });

    it("can buy an autofeeder", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        const barn = await Barn.deployed();
        assert.equal(await barn.autoFeederBought.call(), false, "should not have autofeeder bought by default");


        const autoFeederCost = (await barn.autoFeederCost.call()).toNumber();
        for (let i = 0; i < autoFeederCost; i++) {
            await brc.receiveNewGoldEgg({ from: accounts[1] });
        }
        await barn.buyAutoFeeder();
        assert.equal(await barn.autoFeederBought.call(), true, "should have marked the chicken with available as false");

        try {
            await barn.buyAutoFeeder();
        } catch (e) {
            assert.equal(e.reason, "AutoFeeder already bought", "should not be able to buy autofeeder more than once");
        }
    });
});