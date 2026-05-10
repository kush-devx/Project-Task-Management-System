const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const User = require("../models/User");

router.get("/", verifyJWT, async (req, res) => {
  try {
    const search = req.query.search?.trim();
    const query = {
      _id: { $ne: req.user.id },
      isActive: true,
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { college: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("name email role college department skills avatar")
      .sort({ name: 1 })
      .limit(20);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", verifyJWT, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
