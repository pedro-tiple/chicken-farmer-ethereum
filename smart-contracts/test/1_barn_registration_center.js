const BarnRegistrationCenter = artifacts.require("BarnRegistrationCenter");

contract("BarnRegistrationCenter", async accounts => {
    it("first barn should be free", async () => {
        const brc = await BarnRegistrationCenter.deployed();

        let balance = await brc.getGoldEggCount.call({ from: accounts[0] });
        assert.equal(balance.valueOf(), 0, "gold egg count should start at 0");

        await brc.registerBarn(accounts[1], { from: accounts[0] });

        balance = await brc.getGoldEggCount.call({ from: accounts[0] });
        assert.equal(balance.valueOf(), 0, "first barn registration should not affect gold egg count");

        let barns = await brc.getOwnedBarns.call({ from: accounts[0] });
        assert.equal(barns[0], accounts[1], "barn should become registered to address");
    });

    it("further barns should be paid", async () => {
        const brc = await BarnRegistrationCenter.deployed();

        try {
            await brc.registerBarn(accounts[2], { from: accounts[0] });
        } catch (e) {
            assert.equal(e.reason, "Not enough gold eggs", "second registration with not enough eggs should fail");
        }
    });

    it("receiving eggs should increase egg count", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        const barnCostInGoldEggs = (await brc.barnCostInGoldEggs.call()).toNumber();

        for (let i = 0; i < barnCostInGoldEggs; i++) {
            await brc.receiveNewGoldEgg({ from: accounts[1] });
        }

        let goldEggsCount = await brc.getGoldEggCount.call({ from: accounts[0] });
        assert.equal(goldEggsCount.valueOf(), barnCostInGoldEggs, "gold egg count should have increased");
    });

    it("with enough eggs should be able to register another barn", async () => {
        const brc = await BarnRegistrationCenter.deployed();
        await brc.registerBarn(accounts[2], { from: accounts[0] });

        let barns = await brc.getOwnedBarns.call({ from: accounts[0] });
        assert.equal(barns[1], accounts[2], "barn should become registered to address");
    });

    it("receiving gold eggs from unregistered barns should fail", async () => {
        const brc = await BarnRegistrationCenter.deployed();

        try {
            await brc.receiveNewGoldEgg({ from: accounts[0] });
        } catch (e) {
            assert.equal(e.reason, "Barn not owned", "new gold egg should not be accepted from not registered barn");
        }
    });

    it("spending gold eggs should decrease their amount", async () => {
        const brc = await BarnRegistrationCenter.deployed();

        await brc.receiveNewGoldEgg({ from: accounts[1] });
        await brc.spendGoldEggs(1, { from: accounts[1] });

        let balance = await brc.getGoldEggCount.call({ from: accounts[0] });
        assert.equal(balance, 0, "spending a gold egg should have decreased the available count");

        try {
            await brc.spendGoldEggs(999, { from: accounts[1] });
        } catch (e) {
            assert.equal(e.reason, "No gold eggs available", "should fail if there are not enough eggs available");
        }
    });
});