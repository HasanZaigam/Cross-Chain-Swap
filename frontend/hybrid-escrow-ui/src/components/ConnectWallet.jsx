import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWallet({ setSigner }) {
  const [wallet, setWallet] = useState(null);

  const connect = async () => {
    if (!window.ethereum) return alert("MetaMask not found!");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    setWallet(accounts[0]);
    setSigner(signer);
  };

  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">🔐 Hybrid Escrow</h1>
      <button onClick={connect} className="bg-purple-600 text-white px-4 py-2 rounded">
        {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Connect Wallet"}
      </button>
    </div>
  );
}
