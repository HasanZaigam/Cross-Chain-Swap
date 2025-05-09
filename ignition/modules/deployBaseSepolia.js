const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { parseEther } = require("ethers");

module.exports = buildModule("DeployBaseSepoliaToken", (m) => {
  const token = m.contract("TestToken", [
    "BaseSepoliaToken", 
    "BSPT", 
    parseEther("1000000")
  ]);
  return { token };
});
