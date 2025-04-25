const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
require("dotenv").config(); // Make sure this is at the top to load .env

module.exports = buildModule("DeployEscrow", (m) => {
  const escrow = m.contract("Escrow", [
    process.env.TEST_TOKEN_SEPOLIA // or TEST_TOKEN_BASE_SEPOLIA
  ]);

  return { escrow };
});
