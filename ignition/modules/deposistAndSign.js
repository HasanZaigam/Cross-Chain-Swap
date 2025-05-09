const { ethers } = require("hardhat");

async function main() {
  const [user] = await ethers.getSigners();

  const escrowAddress = "0x3A88126577A5498A0B13bD733ED6f3dB87E2c8E6";
  const tokenAddress = "0x48b95b73FD3357127f0e6D864fd106743B21118a";
  const amount = ethers.parseEther("100");
  const nonce = 1;

  const token = await ethers.getContractAt("TestToken", tokenAddress);
  const escrow = await ethers.getContractAt("Escrow", escrowAddress);

  // Approve and deposit
  const approveTx = await token.connect(user).approve(escrowAddress, amount);
  await approveTx.wait();

  const depositTx = await escrow.connect(user).deposit(amount);
  await depositTx.wait();

  // Create message hash
  const messageHash = ethers.solidityPackedKeccak256(
    ["address", "uint256", "uint256"],
    [user.address, amount, nonce]
  );

  // Sign
  const signature = await user.signMessage(ethers.getBytes(messageHash));

  console.log("Signature:", signature);
  console.log("User:", user.address);
  console.log("Amount:", amount.toString());
  console.log("Nonce:", nonce);
}

main().catch(console.error);
