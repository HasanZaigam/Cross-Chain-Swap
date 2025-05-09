const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { parseEther } = require("ethers");

module.exports = buildModule("DeployTestToken", (m) => {
  // Add gas settings to reduce deployment cost
  const deploymentOptions = {
    gasLimit: 2000000,
    maxFeePerGas: parseEther("0.000000002"), // 2 gwei
    maxPriorityFeePerGas: parseEther("0.000000001") // 1 gwei
  };

  const token = m.contract("TestToken", [
    "BaseToken", 
    "BST", 
    parseEther("1000000")
  ], deploymentOptions); // Add the deployment options here

  return { token };
});

