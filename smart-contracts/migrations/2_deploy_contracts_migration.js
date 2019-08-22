const BarnRegistrationCenter = artifacts.require("BarnRegistrationCenter");
const Barn = artifacts.require("Barn");

module.exports = async function(deployer, network, accounts) {
  deployer.deploy(BarnRegistrationCenter).then(function() {
    return deployer.deploy(Barn, BarnRegistrationCenter.address, { from: accounts[0] });
  });
};
