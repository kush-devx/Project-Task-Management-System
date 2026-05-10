const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "manager", "member", "viewer","owner"],
        message: "Member role must be admin, manager, or member",
      },
      default: "member",
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Project description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [memberSchema],
    deadline: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v > new Date();
        },
        message: "Deadline must be a future date",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["planning", "in-progress", "completed", "on-hold", "cancelled"],
        message: "Invalid project status",
      },
      default: "planning",
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Progress cannot be negative"],
      max: [100, "Progress cannot exceed 100"],
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    domain: {
      type: String,
      enum: [
        "web",
        "mobile",
        "ml",
        "data-science",
        "iot",
        "blockchain",
        "ar-vr",
        "other",
      ],
      default: "other",
    },
    techStack: [
      {
        type: String,
        trim: true,
      },
    ],
    githubUrl: {
      type: String,
      match: [/^https?:\/\/.+/, "Please provide a valid URL"],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
projectSchema.index({ "members.user": 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ status: 1 });

// Virtual: member count
projectSchema.virtual("memberCount").get(function () {
  return this.members?.length || 0;
});

// Helper method: check if a user is a member
//projectSchema.methods.isMember = function (userId) {
  //return this.members.some((m) => m.user.toString() === userId.toString());
//};

projectSchema.methods.isMember = function (userId) {
  return this.members.some(
    (m) => (m.user._id || m.user).toString() === userId.toString()
  );
};

// Helper method: check if a user is owner
//projectSchema.methods.isOwner = function (userId) {
  //return this.members.some(
    //(m) => m.user.toString() === userId.toString() && m.role === "owner"
  //);
//};

projectSchema.methods.isOwner = function (userId) {
  return this.members.some(
    (m) =>
      (m.user._id || m.user).toString() === userId.toString() &&
      m.role === "owner"
  );
};

// Helper method: get member role
//projectSchema.methods.getMemberRole = function (userId) {
  //const member = this.members.find(
    //(m) => m.user.toString() === userId.toString()
  //);
  //return member?.role || null;
//};

projectSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (m) => (m.user._id || m.user).toString() === userId.toString()
  );

  return member?.role || null;
};

module.exports = mongoose.model("Project", projectSchema);