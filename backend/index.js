require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { ethers } = require("ethers");
const SwapIntent = require("./models/swapIntent");
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const atomicSwapRoutes = require('./routes/atomicSwap');

const app = express();
app.use(cors());  // Enable CORS for all routes
app.use(express.json());

const cache = new NodeCache({ stdTTL: 5 }); // Cache for 5 seconds

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 2, // 2 requests per window
  message: { success: false, error: 'Too many requests, please try again later' }
});

// console.log("Process Env");
// console.log(process.env.MONGO_URI);

// console.log("MONGO_URI", process.env.MONGO_URI);

// MongoDB connection
const MONGODB_USERNAME = "hasan";  // Replace with your MongoDB username
const MONGODB_PASSWORD = "hasan123";  // Replace with your MongoDB password
const MONGODB_CLUSTER = "your-cluster-name";  // Replace with your cluster name (e.g., "cluster0.abc123")
const MONGODB_DATABASE = "atomic-swap";

const MONGODB_URI = `mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

console.log("Attempting to connect to MongoDB...");
mongoose.connect(MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected to Atlas"))
    .catch(err => {
        console.log("❌ MongoDB Connection Error:", err.message);
        console.log("Please check your MongoDB connection string and make sure:");
        console.log("1. Your MongoDB Atlas cluster is running");
        console.log("2. Your IP address is whitelisted in MongoDB Atlas");
        console.log("3. Your username and password are correct");
        console.log("4. Your cluster name is correct");
        process.exit(1);  // Exit if can't connect to database
    });

// Contract ABIs
const ESCROW_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "user", "type": "address"},
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "nonce", "type": "uint256"},
      {"internalType": "bytes", "name": "signature", "type": "bytes"}
    ],
    "name": "adminWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const HTLC_ABI = [
  "function initiateSwap(address initiator, address counterparty, address token, uint256 amount, bytes32 hashlock, uint256 timelock) external",
  "function claimSwap(bytes32 swapId, bytes32 preimage) external",
  "function refundSwap(bytes32 swapId) external",
  "function getSwap(bytes32 swapId) external view returns (address, address, address, uint256, bytes32, uint256, bool, bool)"
];

// Contract addresses from environment variables
const CONTRACT_ADDRESSES = {
  // Sepolia
  "11155111": {
    escrow: process.env.ESCROW_ADDRESS_SEPOLIA,
    htlc: process.env.HTLC_ADDRESS_SEPOLIA,
    token: process.env.TEST_TOKEN_SEPOLIA
  },
  // Base Sepolia
  "84532": {
    escrow: process.env.ESCROW_ADDRESS_BASE_SEPOLIA,
    htlc: process.env.HTLC_ADDRESS_BASE_SEPOLIA,
    token: process.env.TEST_TOKEN_BASE_SEPOLIA
  }
};

// Network configurations
const NETWORK_CONFIG = {
  "11155111": {
    name: "Sepolia",
    rpcUrl: process.env.RPC_URL_SEPOLIA,
    privateKey: process.env.PRIVATE_KEY_SEPOLIA
  },
  "84532": {
    name: "Base Sepolia",
    rpcUrl: process.env.RPC_URL_BASE_SEPOLIA,
    privateKey: process.env.PRIVATE_KEY_BASE_SEPOLIA
  }
};

// Helper function to get provider and signer for a network
async function getNetworkProvider(chainId) {
  const config = NETWORK_CONFIG[chainId];
  if (!config) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Validate private key format
  if (!config.privateKey || !config.privateKey.startsWith('0x') || config.privateKey.length !== 66) {
    throw new Error(`Invalid private key format for chain ${chainId}. Private key must be a 32-byte hex string starting with '0x'`);
  }

  const provider = new ethers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.privateKey, provider);
  return { provider, wallet };
}

// Helper function to get contract instances
async function getContractInstances(chainId) {
  const addresses = CONTRACT_ADDRESSES[chainId];
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`);
  }

  // Validate contract addresses
  if (!addresses.escrow || !addresses.htlc || !addresses.token) {
    throw new Error(`Missing contract addresses for chain ${chainId}`);
  }

  const { provider, wallet } = await getNetworkProvider(chainId);
  
  return {
    escrow: new ethers.Contract(addresses.escrow, ESCROW_ABI, wallet),
    htlc: new ethers.Contract(addresses.htlc, HTLC_ABI, wallet),
    provider,
    wallet
  };
}

// Helper function to execute atomic swap
async function executeAtomicSwap(swap) {
  try {
    console.log("\n=== Starting Atomic Swap Execution ===");
    console.log("Swap ID:", swap._id);
    console.log("Chain A:", swap.chainIdA);
    console.log("Chain B:", swap.chainIdB);

    // Get contract instances for both networks
    const networkA = await getContractInstances(swap.chainIdA);
    const networkB = await getContractInstances(swap.chainIdB);

    // Generate hashlock and timelock
    const preimage = ethers.randomBytes(32);
    const hashlock = ethers.keccak256(preimage);
    const timelock = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // Execute HTLC swaps on both networks
    console.log("Initiating HTLC swap on chain A...");
    const txA = await networkA.htlc.initiateSwap(
      swap.userA,
      swap.userB,
      CONTRACT_ADDRESSES[swap.chainIdA].token,
      swap.amountA,
      hashlock,
      timelock
    );

    console.log("Initiating HTLC swap on chain B...");
    const txB = await networkB.htlc.initiateSwap(
      swap.userB,
      swap.userA,
      CONTRACT_ADDRESSES[swap.chainIdB].token,
      swap.amountB,
      hashlock,
      timelock
    );

    // Wait for both transactions
    const [receiptA, receiptB] = await Promise.all([
      txA.wait(),
      txB.wait()
    ]);

    // Update swap status
    swap.status = 'swapped';
    swap.swappedAt = new Date();
    swap.message = 'Swap completed successfully';
    swap.txHashA = txA.hash;
    swap.txHashB = txB.hash;
    swap.hashlock = hashlock;
    swap.preimage = preimage;
    await swap.save();

    console.log("Atomic swap completed successfully:", swap._id);
    return true;
  } catch (error) {
    console.error("Atomic swap execution failed:", error);
    
    swap.status = 'refunded';
    swap.refundedAt = new Date();
    swap.refundReason = error.message || "Unknown error during swap execution";
    await swap.save();
    
    console.log("Swap refunded:", swap._id);
    return false;
  }
}

// Cache middleware for swap status
const cacheSwapStatus = (req, res, next) => {
  const userAddress = req.params.userAddress?.toLowerCase();
  if (!userAddress) return next();

  const cacheKey = `swap_status_${userAddress}`;
  const cachedData = cache.get(cacheKey);
  
  if (cachedData) {
    // Only return cache if it's less than 30 seconds old
    const cacheAge = Date.now() - cachedData.timestamp;
    if (cacheAge < 30000) { // 30 seconds
      console.log(`Cache hit for ${userAddress} (age: ${cacheAge}ms)`);
      return res.json(cachedData.data);
    }
  }
  
  next();
};

// Apply rate limiting to swap status endpoint
app.get('/api/swap-status/:userAddress', limiter, cacheSwapStatus, async (req, res) => {
  const userAddress = req.params.userAddress?.toLowerCase();
  if (!userAddress) {
    return res.json({ success: false, error: 'Invalid user address' });
  }

  try {
    console.log(`Fetching swap status for: ${userAddress}`);
    
    // Find active swap
    const activeSwap = await SwapIntent.findOne({
      $or: [
        { userA: userAddress, status: { $in: ['pending', 'ready'] } },
        { userB: userAddress, status: { $in: ['pending', 'ready'] } }
      ]
    }).sort({ updatedAt: -1 });

    // Only fetch recent swaps if there's no active swap
    let swaps = [];
    if (!activeSwap) {
      swaps = await SwapIntent.find({
        $or: [
          { userA: userAddress },
          { userB: userAddress }
        ],
        status: { $in: ['swapped', 'refunded', 'cancelled'] } // Only fetch completed swaps
      })
      .sort({ updatedAt: -1 })
      .limit(5); // Limit to 5 recent swaps
    }

    const response = {
      success: true,
      activeSwap: activeSwap || null,
      swaps: swaps || []
    };

    // Cache the response with timestamp
    const cacheKey = `swap_status_${userAddress}`;
    cache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    });

    res.json(response);
  } catch (err) {
    console.error('Error fetching swap status:', err);
    res.json({ success: false, error: 'Failed to fetch swap status' });
  }
});

// Submit swap intent
app.post("/api/swap-intent", async (req, res) => {
  try {
    const { 
      userAddress, 
      partnerAddress, 
      tokenAddress, 
      escrowAddress, // This will be ignored, we'll use chain-specific address
      amount, 
      signature, 
      nonce,
      chainId 
    } = req.body;

    console.log("\n=== New Swap Intent Received ===");
    console.log("User Address:", userAddress);
    console.log("Partner Address:", partnerAddress);
    console.log("Token Address:", tokenAddress);
    console.log("Amount:", amount);
    console.log("Chain ID:", chainId);
    console.log("Signature:", signature);

    // Validate required fields
    if (!userAddress || !partnerAddress || !tokenAddress || !amount || !signature || !nonce || !chainId) {
      console.error("Missing required fields");
      throw new Error("Missing required fields");
    }

    // Get chain-specific escrow address
    const escrowAddr = CONTRACT_ADDRESSES[chainId];
    if (!escrowAddr) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    console.log("Using escrow address for chain", chainId, ":", escrowAddr);

    // Convert addresses to lowercase for consistency
    const userAddr = userAddress.toLowerCase();
    const partnerAddr = partnerAddress.toLowerCase();
    const tokenAddr = tokenAddress.toLowerCase();

    // Check for self-swap
    if (userAddr === partnerAddr) {
      throw new Error("Cannot swap with yourself");
    }

    // First check if this is a matching intent
    console.log("Searching for matching intent...");
    const matchingIntent = await SwapIntent.findOne({
      $or: [
        // User A initiated, User B matching
        {
          userA: partnerAddr,
          userB: userAddr,
          amountA: amount,
          status: 'pending'
        },
        // User B initiated, User A matching
        {
          userA: userAddr,
          userB: partnerAddr,
          amountA: amount,
          status: 'pending'
        }
      ]
    });

    let swapRecord;
    if (matchingIntent) {
      console.log("Found matching intent:", matchingIntent._id);
      
      // Update matching intent with second user's signature
      if (matchingIntent.userA === userAddr) {
        matchingIntent.sigA = signature;
        matchingIntent.txHashA = req.body.txHash;
        matchingIntent.escrowA = escrowAddr.escrow;
        matchingIntent.tokenA = escrowAddr.token;
        matchingIntent.chainIdA = chainId;
      } else {
        matchingIntent.sigB = signature;
        matchingIntent.txHashB = req.body.txHash;
        matchingIntent.escrowB = escrowAddr.escrow;
        matchingIntent.tokenB = escrowAddr.token;
        matchingIntent.chainIdB = chainId;
      }
      
      matchingIntent.status = 'ready';
      matchingIntent.message = 'Swap matched! Processing atomic swap...';
      swapRecord = matchingIntent;
      
      await swapRecord.save();
      console.log("Updated matching intent with signature");
      
      // Execute swap if both signatures are present
      if (swapRecord.sigA && swapRecord.sigB) {
        console.log("Both signatures present, executing swap...");
        console.log("Swap details before execution:", {
          id: swapRecord._id,
          userA: swapRecord.userA,
          userB: swapRecord.userB,
          tokenA: swapRecord.tokenA,
          tokenB: swapRecord.tokenB,
          amountA: swapRecord.amountA,
          escrowA: swapRecord.escrowA,
          escrowB: swapRecord.escrowB,
          chainIdA: swapRecord.chainIdA,
          chainIdB: swapRecord.chainIdB,
          sigA: swapRecord.sigA,
          sigB: swapRecord.sigB,
          nonce: swapRecord.nonce
        });
        
        // Execute swap in background with better error handling
        executeAtomicSwap(swapRecord)
          .then(result => {
            console.log("Atomic swap execution completed:", result ? "Success" : "Failed");
          })
          .catch(err => {
            console.error("Background swap execution failed with error:", err);
            // Update swap status to refunded on error
            swapRecord.status = 'refunded';
            swapRecord.refundedAt = new Date();
            swapRecord.refundReason = err.message || "Unknown error during swap execution";
            return swapRecord.save();
          });
      } else {
        console.log("Waiting for both signatures. Current state:", {
          hasSigA: !!swapRecord.sigA,
          hasSigB: !!swapRecord.sigB
        });
      }
  } else {
      // Create new intent
      console.log("Creating new swap intent");
      swapRecord = new SwapIntent({
        userA: userAddr,
        tokenA: escrowAddr.token,
        amountA: amount,
        chainIdA: chainId,
        escrowA: escrowAddr.escrow,
        sigA: signature,
        txHashA: req.body.txHash,
        userB: partnerAddr,
        tokenB: escrowAddr.token,
        amountB: amount,
        chainIdB: chainId,
        escrowB: escrowAddr.escrow,
        nonce,
        status: 'pending',
        message: `Swap intent created for ${ethers.formatUnits(amount, 18)} tokens`
      });

      await swapRecord.save();
      console.log("New swap intent created:", swapRecord._id);
    }

    // Format response
    const response = {
      success: true,
      message: swapRecord.status === 'ready' ? 
        "Swap matched! Processing atomic swap..." : 
        "Swap intent recorded. Waiting for partner...",
      swap: formatSwapForResponse(swapRecord)
    };

    console.log("Sending response:", response);
    res.json(response);

    // Clear cache for both users
    await updateSwapCache(userAddr);
    await updateSwapCache(partnerAddr);

  } catch (err) {
    console.error("Swap intent error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message || "Internal server error"
    });
  }
});

// Cancel or refund swap
app.post("/api/swap-cancel/:swapId", async (req, res) => {
  try {
    const { swapId } = req.params;
    const { userAddress, reason } = req.body;

    const swap = await SwapIntent.findById(swapId);
    if (!swap) {
      throw new Error("Swap not found");
    }

    // Verify user is part of this swap
    if (swap.userA !== userAddress.toLowerCase() && swap.userB !== userAddress.toLowerCase()) {
      throw new Error("Unauthorized");
    }

    // Only allow cancellation if swap is pending
    if (swap.status !== 'pending') {
      throw new Error("Can only cancel pending swaps");
    }

    swap.status = 'cancelled';
    swap.cancelledAt = new Date();
    swap.message = reason || "Swap cancelled by user";
    await swap.save();

    res.json({ 
      success: true, 
      message: "Swap cancelled successfully",
      swap: formatSwapForResponse(swap)
    });

    // Clear cache for both users
    await updateSwapCache(swap.userA);
    await updateSwapCache(swap.userB);

  } catch (err) {
    console.error("Cancel swap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper function to format swap for response
function formatSwapForResponse(swap) {
  return {
    id: swap._id,
    status: swap.status,
    message: swap.message,
    timestamp: swap.createdAt,
    updatedAt: swap.updatedAt,
    swappedAt: swap.swappedAt,
    refundedAt: swap.refundedAt,
    cancelledAt: swap.cancelledAt,
    
    // User A details
    userA: swap.userA,
    tokenA: swap.tokenA,
    amountA: swap.amountA,
    chainIdA: swap.chainIdA,
    txHashA: swap.txHashA,
    
    // User B details
    userB: swap.userB,
    tokenB: swap.tokenB,
    amountB: swap.amountB,
    chainIdB: swap.chainIdB,
    txHashB: swap.txHashB,
    
    // Additional info
    nonce: swap.nonce,
    refundReason: swap.refundReason
  };
}

// Add cache cleanup on swap updates
const updateSwapCache = async (userAddress) => {
  const cacheKey = `swap_status_${userAddress.toLowerCase()}`;
  cache.del(cacheKey);
};

// Add cleanup endpoint to cancel all pending swaps
app.post("/api/cleanup-swaps", async (req, res) => {
  try {
    console.log("Cleaning up all pending swaps...");
    
    // Find all pending swaps
    const pendingSwaps = await SwapIntent.find({
      status: { $in: ['pending', 'ready'] }
    });
    
    console.log(`Found ${pendingSwaps.length} pending swaps to cancel`);
    
    // Cancel each swap
    for (const swap of pendingSwaps) {
      swap.status = 'cancelled';
      swap.cancelledAt = new Date();
      swap.message = "Swap cancelled during cleanup";
      await swap.save();
      console.log(`Cancelled swap: ${swap._id}`);
      
      // Clear cache for both users
      await updateSwapCache(swap.userA);
      await updateSwapCache(swap.userB);
    }
    
    res.json({
      success: true,
      message: `Successfully cancelled ${pendingSwaps.length} pending swaps`,
      cancelledSwaps: pendingSwaps.map(swap => ({
        id: swap._id,
        userA: swap.userA,
        userB: swap.userB,
        amount: swap.amountA
      }))
    });
    
  } catch (err) {
    console.error("Cleanup error:", err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Add HTLC-specific endpoints
app.post("/api/htlc/claim/:swapId", async (req, res) => {
  try {
    const { swapId } = req.params;
    const { network, preimage } = req.body;

    const swap = await SwapIntent.findById(swapId);
    if (!swap) {
      throw new Error("Swap not found");
    }

    const networkConfig = await getContractInstances(network);
    const tx = await networkConfig.htlc.claimSwap(swap.hashlock, preimage);
    await tx.wait();

    res.json({
      success: true,
      message: "Swap claimed successfully",
      txHash: tx.hash
    });
  } catch (err) {
    console.error("Claim swap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/htlc/refund/:swapId", async (req, res) => {
  try {
    const { swapId } = req.params;
    const { network } = req.body;

    const swap = await SwapIntent.findById(swapId);
    if (!swap) {
      throw new Error("Swap not found");
    }

    const networkConfig = await getContractInstances(network);
    const tx = await networkConfig.htlc.refundSwap(swap.hashlock);
    await tx.wait();

    res.json({
      success: true,
      message: "Swap refunded successfully",
      txHash: tx.hash
    });
  } catch (err) {
    console.error("Refund swap error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Routes
app.use('/api/atomic-swap', atomicSwapRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));