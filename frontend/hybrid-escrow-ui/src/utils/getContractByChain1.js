export const getContracts = (chainId) => {
    switch (chainId) {
      case 11155111: // Ethereum Sepolia
        return {
          name: "Sepolia",
          token: "0xC0C4e8699545d9603B7bEb931F636Df9b8a812eC",
          explorer: "https://sepolia.etherscan.io/tx/"
        };
  
      case 84532: // Base Sepolia
        return {
          name: "Base Sepolia",
          token: "0x24c1c6daD78fEbc2B52A293591AD073aC2003Ecd",
          explorer: "https://sepolia.basescan.org/tx/"
        };
  
      default:
        throw new Error("Unsupported network");
    }
  };
  