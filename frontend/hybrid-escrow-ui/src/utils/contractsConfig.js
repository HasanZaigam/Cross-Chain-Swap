import { ethers } from "ethers";
import HybridEscrow from "../abi/HybridEscrow.json"; // You’ll add this JSON later
import TestToken from "../abi/TestToken.json";       // Add this too

export const ESCROW_ADDRESS = "0x5CefE24F50C57dce7aBc4bc658134c16a5d6Da81";
export const TOKEN_ADDRESS = "0x9BF7e9Ef56923B41243B6fF47B9C950980434648";

export const getContracts = (signerOrProvider) => {
  const escrow = new ethers.Contract(ESCROW_ADDRESS, HybridEscrow.abi, signerOrProvider);
  const token = new ethers.Contract(TOKEN_ADDRESS, TestToken.abi, signerOrProvider);
  return { escrow, token };
};
