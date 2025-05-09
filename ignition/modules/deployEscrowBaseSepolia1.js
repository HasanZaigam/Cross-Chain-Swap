const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config(); // Load environment variables

module.exports = buildModule("DeployEscrowBaseSepolia", (m) => {
  const escrow = m.contract("Escrow", [
    process.env.TEST_TOKEN_BASE_SEPOLIA1
  ]);

  return { escrow };
});
