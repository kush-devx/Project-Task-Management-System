const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "manager", "member"],
        message: "Role must be admin, manager, or member",
      },
      default: "member",
    },
    college: {
      type: String,
      trim: true,
      maxlength: [100, "College name cannot exceed 100 characters"],
    },
    department: {
      type: String,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
    },
    avatar: {
      type: String,
      default: null,
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    refreshToken: {
      type: String,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster queries

userSchema.index({ role: 1 });

// Virtual: public profile (no sensitive fields)
userSchema.virtual("publicProfile").get(function () {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    college: this.college,
    department: this.department,
    bio: this.bio,
    avatar: this.avatar,
    skills: this.skills,
    lastSeen: this.lastSeen,
  };
});

module.exports = mongoose.model("User", userSchema);
