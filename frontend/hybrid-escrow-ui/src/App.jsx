import React, { useState } from "react";
import WalletInfo from "./components/WalletInfo";
import TokenBalance from "./components/TokenBalance";
import Faucet from "./components/Faucets";
import Escrow from "./components/Escrow";

function App() {
  const [state, setState] = useState(null);

  return (
    <div className="p-6 max-w-xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">🌐 Hybrid Escrow UI</h1>

      {/* Wallet Connect Info */}
      <WalletInfo onReady={setState} />

      {/* Token Balance (only when wallet connected) */}
      {state && (
        <TokenBalance
          provider={state.provider}
          tokenAddress={state.token}
          walletAddress={state.signer.address}
        />
      )}

      {/* Faucet Component */}
      <div className="min-h-screen bg-gray-800 text-white">
      <h1 className="text-center text-3xl font-bold py-6">🔗 DApp Dashboard</h1>
      <Faucet />
      <Escrow />
    </div>
    </div>
  );
}

export default App;
