const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("DeployBaseSepoliaToken", (m) => {
  const token = m.contract("testToken", ["BaseToken", "BPT", ethers.utils.parseEther("1000000")]);
  return { token };
});
