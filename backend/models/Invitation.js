const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "accepted", "rejected", "expired"],
        message: "Invalid invitation status",
      },
      default: "pending",
    },
    message: {
      type: String,
      maxlength: [300, "Invitation message cannot exceed 300 characters"],
    },
    role: {
      type: String,
      enum: ["member", "viewer"],
      default: "member",
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  },
  { timestamps: true }
);

// Index to enforce uniqueness of pending invitations per project+receiver
invitationSchema.index(
  { project: 1, receiver: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "pending" },
  }
);

invitationSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("Invitation", invitationSchema);
