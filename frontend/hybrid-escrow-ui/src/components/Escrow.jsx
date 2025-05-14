// // src/components/Escrow.jsx

// import React, { useState } from "react";
// import { ethers } from "ethers";
// import { ESCROW_ABI } from "../abis/Escrow";
// import { RPCS, ESCROW_ADDRESSES, TOKEN_ADDRESSES, PRIVATE_KEY, EXPLORERS } from "../config/network";
// import ERC20_ABI from "../abis/ERC20";

// function Escrow() {
//   const [chainId, setChainId] = useState("11155111");
//   const [amount, setAmount] = useState("");
//   const [recipient, setRecipient] = useState("");
//   const [txHash, setTxHash] = useState("");

//   const handleDeposit = async () => {
//     try {
//       const provider = new ethers.JsonRpcProvider(RPCS[chainId]);
//       const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

//       const token = new ethers.Contract(TOKEN_ADDRESSES[chainId], ERC20_ABI, wallet);
//       const escrow = new ethers.Contract(ESCROW_ADDRESSES[chainId], ESCROW_ABI, wallet);

//       const decimals = await token.decimals();
//       const parsedAmount = ethers.parseUnits(amount, decimals);

//       const approvalTx = await token.approve(escrow.target, parsedAmount);
//       await approvalTx.wait();

//       const tx = await escrow.deposit(parsedAmount);
//       await tx.wait();
//       setTxHash(tx.hash);
//       alert(`✅ Deposit successful!`);
//     } catch (err) {
//       console.error("Deposit error:", err);
//       alert("❌ Deposit failed.");
//     }
//   };

//   const handleRefund = async () => {
//     try {
//       const provider = new ethers.JsonRpcProvider(RPCS[chainId]);
//       const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

//       const escrow = new ethers.Contract(ESCROW_ADDRESSES[chainId], ESCROW_ABI, wallet);
//       const tx = await escrow.refund();
//       await tx.wait();
//       setTxHash(tx.hash);
//       alert("✅ Refunded (if timeout passed)");
//     } catch (err) {
//       console.error("Refund error:", err);
//       alert("❌ Refund failed");
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-white max-w-md mx-auto rounded shadow-md mt-8">
//       <h2 className="text-xl font-bold mb-4">💼 Hybrid Escrow</h2>

//       <div className="mb-3">
//         <label className="block mb-1">Network</label>
//         <select
//           value={chainId}
//           onChange={(e) => setChainId(e.target.value)}
//           className="text-black w-full p-2 rounded"
//         >
//           <option value="11155111">Ethereum Sepolia</option>
//           <option value="84532">Base Sepolia</option>
//         </select>
//       </div>

//       <div className="mb-3">
//         <label className="block mb-1">Amount to Deposit</label>
//         <input
//           type="number"
//           className="text-black w-full p-2 rounded"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />
//       </div>

//       <button
//         onClick={handleDeposit}
//         className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 mb-2 w-full"
//       >
//         📥 Deposit
//       </button>

//       <button
//         onClick={handleRefund}
//         className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 w-full"
//       >
//         💸 Refund
//       </button>

//       {txHash && (
//         <p className="mt-4 text-sm">
//           ⛓ TX:{" "}
//           <a
//             href={`${EXPLORERS[chainId]}${txHash}`}
//             className="text-blue-400 underline"
//             target="_blank"
//             rel="noreferrer"
//           >
//             View on Explorer
//           </a>
//         </p>
//       )}
//     </div>
//   );
// }

// export default Escrow;


// import React, { useEffect, useState } from "react";
// import { ethers } from "ethers";
// import ERC20_ABI from "../abis/ERC20";
// import Escrow_ABI from "../abis/Escrow";

// const TOKEN_ADDRESSES = {
//       11155111: "0xC0C4e8699545d9603B7bEb931F636Df9b8a812eC",
//       84532:   "0x1c13952F1282096E9133a2E98ba5A269D4D284C1",
//     };
//     const ESCROW_ADDRESSES = {
//         11155111: "0x44581B35fb43a09b2AE88Ad40AeCe5d960af759B", // 👈 Update this with deployed escrow address
//         84532: "0x17B78ec3f3E77544826d1C6430cFF540Ab45ed39",
//     };

// function Escrow() {
//   const [chainId, setChainId] = useState("11155111");
//   const [amount, setAmount] = useState("");
//   const [signer, setSigner] = useState(null);
//   const [userAddress, setUserAddress] = useState("");
//   const [txHash, setTxHash] = useState("");

//   useEffect(() => {
//     connectWallet();
//   }, []);

//   const connectWallet = async () => {
//     if (!window.ethereum) {
//       alert("Install MetaMask");
//       return;
//     }
//     try {
//       const provider = new ethers.BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       const address = await signer.getAddress();
//       setSigner(signer);
//       setUserAddress(address);
//     } catch (err) {
//       console.error("Wallet connect error:", err);
//     }
//   };

//   const handleDeposit = async () => {
//     try {
//       if (!signer) {
//         alert("Connect wallet first!");
//         return;
//       }

//       const tokenAddress = TOKEN_ADDRESSES[chainId];
//       const escrowAddress = ESCROW_CONTRACTS[chainId];
//       if (!tokenAddress || !escrowAddress) {
//         alert("Unsupported network selected.");
//         return;
//       }

//       const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
//       const escrowContract = new ethers.Contract(escrowAddress, Escrow_ABI, signer);

//       const decimals = await tokenContract.decimals();
//       const amountInWei = ethers.parseUnits(amount, decimals);

//       // Approve token transfer
//       const approveTx = await tokenContract.approve(escrowAddress, amountInWei);
//       await approveTx.wait();

//       // Deposit
//       const depositTx = await escrowContract.deposit(amountInWei);
//       await depositTx.wait();

//       setTxHash(depositTx.hash);
//       alert(`✅ Deposit successful! TX: ${depositTx.hash}`);
//     } catch (err) {
//       console.error("Deposit error:", err);
//       alert("❌ Deposit failed. See console.");
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-white max-w-md mx-auto rounded shadow-md">
//       <h2 className="text-xl font-bold mb-4">🔒 Hybrid Escrow</h2>

//       <div className="mb-3">
//         <label>Select Network</label>
//         <select
//           value={chainId}
//           onChange={(e) => setChainId(e.target.value)}
//           className="text-black w-full p-2 rounded"
//         >
//           <option value="11155111">Ethereum Sepolia</option>
//           <option value="84532">Base Sepolia</option>
//         </select>
//       </div>

//       <div className="mb-3">
//         <label>Deposit Amount</label>
//         <input
//           type="number"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//           className="text-black w-full p-2 rounded"
//         />
//       </div>

//       <div className="mb-3">
//         <button
//           onClick={handleDeposit}
//           className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 w-full"
//         >
//           💸 Deposit to Escrow
//         </button>
//       </div>

//       {userAddress && (
//         <p className="text-sm mb-2">
//           🔐 Connected: <span className="text-blue-300">{userAddress}</span>
//         </p>
//       )}

//       {txHash && (
//         <p className="mt-3">
//           ✅ TX:{" "}
//           <a
//             href={`${
//               chainId === "84532"
//                 ? "https://sepolia.basescan.org/tx/"
//                 : "https://sepolia.etherscan.io/tx/"
//             }${txHash}`}
//             target="_blank"
//             rel="noreferrer"
//             className="text-blue-400 underline"
//           >
//             View Transaction
//           </a>
//         </p>
//       )}
//     </div>
//   );
// }

// export default Escrow;



import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import ERC20_ABI from "../abis/ERC20";
import Escrow_ABI from "../abis/Escrow";

// ✅ CORRECTED Contract Address Maps
const TOKEN_ADDRESSES = {
  11155111: "0x8b7cff80332F8Cf8057eEfe7846c775Ab3745B44",  // Sepolia
  84532: "0x1c13952F1282096E9133a2E98ba5A269D4D284C1",    // Base Sepolia
};
const ESCROW_ADDRESSES = {
  11155111: "0x2C1f707843573311FBA27da19c9Fa3fc19209609",
  84532: "0x17B78ec3f3E77544826d1C6430cFF540Ab45ed39",
};

export default function Escrow() {
  const [chainId, setChainId] = useState("11155111");
  const [amount, setAmount] = useState("");
  const [signer, setSigner] = useState(null);
  const [userAddress, setUserAddress] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (!window.ethereum) return;
    (async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      setSigner(s);
      setUserAddress(addr);
    })();
  }, []);

  const handleDeposit = async () => {
    try {
      if (!signer) throw new Error("🔌 Connect wallet first.");

      const tokenAddr = TOKEN_ADDRESSES[chainId];
      const escrowAddr = ESCROW_ADDRESSES[chainId];

      if (!tokenAddr || !escrowAddr) {
        alert("❌ Unsupported network selected.");
        return;
      }

      const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
      const escrow = new ethers.Contract(escrowAddr, Escrow_ABI, signer);

      // ✅ Ensure decimals() works
      let decimals;
      try {
        decimals = await token.decimals();
      } catch (err) {
        alert("❌ Cannot read token decimals. Is token correct?");
        console.error("Decimals error:", err);
        return;
      }

      const amountInWei = ethers.parseUnits(amount || "0", decimals);

      const balance = await token.balanceOf(userAddress);
      if (balance < amountInWei) {
        alert(`❌ Insufficient balance. Your balance: ${ethers.formatUnits(balance, decimals)}`);
        return;
      }

      const allowance = await token.allowance(userAddress, escrowAddr);
      if (allowance < amountInWei) {
        console.log("🔁 Re-approving token...");
        const approveTx = await token.approve(escrowAddr, amountInWei);
        await approveTx.wait();
      }

      const depositTx = await escrow.deposit(amountInWei);
      await depositTx.wait();

      setTxHash(depositTx.hash);
      alert(`✅ Deposit successful! TX: ${depositTx.hash}`);
    } catch (err) {
      console.error("❌ Deposit error:", err);
      alert("❌ Deposit failed. Check console.");
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white max-w-md mx-auto rounded shadow-md my-6">
      <h2 className="text-xl font-bold mb-4">🔒 Hybrid Escrow</h2>

      <div className="mb-3">
        <label>Network</label>
        <select
          value={chainId}
          onChange={e => setChainId(e.target.value)}
          className="text-black w-full p-2 rounded"
        >
          <option value="11155111">Ethereum Sepolia</option>
          <option value="84532">Base Sepolia</option>
        </select>
      </div>

      <div className="mb-3">
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="text-black w-full p-2 rounded"
          placeholder="e.g. 10"
        />
      </div>

      <button
        onClick={handleDeposit}
        className="bg-green-600 w-full py-2 rounded hover:bg-green-700"
      >
        📥 Deposit
      </button>

      {userAddress && (
        <p className="mt-2 text-sm">
          🔑 Wallet: <span className="text-blue-300 break-all">{userAddress}</span>
        </p>
      )}

      {txHash && (
        <p className="mt-2 text-sm">
          ✅ TX:{" "}
          <a
            href={`${
              chainId === "84532"
                ? "https://sepolia.basescan.org/tx/"
                : "https://sepolia.etherscan.io/tx/"
            }${txHash}`}
            className="underline text-blue-400"
            target="_blank"
            rel="noreferrer"
          >
            View on Explorer
          </a>
        </p>
      )}
    </div>
  );
}
