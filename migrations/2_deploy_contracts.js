var TejaToken = artifacts.require("./TejaToken.sol");
var TejaTokenSale = artifacts.require("./TejaTokenSale.sol");


module.exports = function(deployer) {
  deployer.deploy(TejaToken , 1000000).then(function() {
    // Token price is 0.001 Ether
    var tokenPrice = 1000000000000000;
    return deployer.deploy(TejaTokenSale, TejaToken.address, tokenPrice);
  });
};