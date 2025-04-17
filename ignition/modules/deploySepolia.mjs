const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeploySepoliaToken", (m) => {
  const token = m.contract("testToken", ["SepoliaToken", "SPT", ethers.utils.parseEther("1000000")]);
  return { token };
});
