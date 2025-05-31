const mongoose = require("mongoose");

const swapIntentSchema = new mongoose.Schema({
  // User A (Initiator)
  userA: { type: String, required: true, lowercase: true },
  tokenA: { type: String, required: true, lowercase: true },
  amountA: { type: String, required: true },
  chainIdA: { type: String, required: true },
  escrowA: { type: String, required: true, lowercase: true },
  sigA: { type: String },
  txHashA: { type: String },

  // User B (Partner)
  userB: { type: String, required: true, lowercase: true },
  tokenB: { type: String, required: true, lowercase: true },
  amountB: { type: String, required: true },
  chainIdB: { type: String, required: true },
  escrowB: { type: String, required: true, lowercase: true },
  sigB: { type: String },
  txHashB: { type: String },

  // Swap Status
  status: {
    type: String,
    enum: ['pending', 'ready', 'swapped', 'refunded', 'cancelled'],
    default: 'pending'
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  swappedAt: { type: Date },
  refundedAt: { type: Date },
  cancelledAt: { type: Date },

  // Additional Info
  nonce: { type: String, required: true },
  message: { type: String },
  refundReason: { type: String }
});

// Update timestamp on save
swapIntentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("SwapIntent", swapIntentSchema);
