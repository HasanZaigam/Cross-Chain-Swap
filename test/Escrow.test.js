const { expect } = require("chai");
const { ethers } = require("hardhat");
const { parseEther } = require("ethers");

describe("Escrow", () => {
  let token, escrow, admin, user;

  beforeEach(async () => {
    [admin, user] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("TestToken");
    token = await Token.deploy("Test Token", "TTK", parseEther("1000000"));
    await token.waitForDeployment();
    expect(token.target).to.properAddress;

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(token.target);
    await escrow.waitForDeployment();
    expect(escrow.target).to.properAddress;

    await token.transfer(user.address, parseEther("1000"));
  });

  it("should allow user to deposit", async () => {
    await token.connect(user).approve(escrow.target, parseEther("100"));
    await escrow.connect(user).deposit(parseEther("100"));
    expect(await token.balanceOf(escrow.target)).to.equal(parseEther("100"));
  });

  it("should allow admin to withdraw with signature", async () => {
    const amount = parseEther("100");
    const nonce = 1;

    await token.connect(user).approve(escrow.target, amount);
    await escrow.connect(user).deposit(amount);

    const messageHash = ethers.solidityPackedKeccak256(
      ["address", "uint256", "uint256"],
      [user.address, amount, nonce]
    );

    const signature = await user.signMessage(ethers.getBytes(messageHash));

    await escrow.connect(admin).withdraw(user.address, amount, nonce, signature);

    expect(await token.balanceOf(user.address)).to.equal(parseEther("1000"));
  });
});
