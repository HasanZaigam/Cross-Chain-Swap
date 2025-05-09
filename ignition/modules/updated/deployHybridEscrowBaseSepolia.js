const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config(); // Ensure the .env file is loaded

module.exports = buildModule("DeployHybridEscrowBaseSepolia", (m) => {
  // Deploying HybridEscrow Contract on BaseSepolia
  const escrowBaseSepolia = m.contract("HybridEscrow", [
    process.env.TEST_TOKEN_BASE_SEPOLIA1 // BaseSepolia Token Address from .env
  ]);

  return { escrowBaseSepolia };
});
