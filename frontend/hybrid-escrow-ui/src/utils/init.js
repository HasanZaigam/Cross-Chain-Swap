import { getContracts } from "./getContractByChain";
import { ethers } from "ethers";

async function init() {
  if (!window.ethereum) return console.error("🦊 MetaMask not found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  try {
    const { escrow, token, name } = getContracts(network.chainId);
    console.log(`✅ Connected to ${name}`);
    console.log("Escrow:", escrow);
    console.log("Token:", token);

    // You can now pass `escrow` and `token` addresses into your contract instances

  } catch (err) {
    console.error("❌ Unsupported network:", err.message);
  }
}
