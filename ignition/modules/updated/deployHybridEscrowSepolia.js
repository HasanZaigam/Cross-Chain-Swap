// ignition/modules/updated/deployHybridEscrowSepolia.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config();

module.exports = buildModule("DeployHybridEscrowSepolia", (m) => {
  const hybridEscrow = m.contract("HybridEscrow", [process.env.TEST_TOKEN_SEPOLIA1]);
  return { hybridEscrow };
});
