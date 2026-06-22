const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");

// CREATE
router.post("/", async (req, res, next) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            throw new AppError("Name and email are required", 400, "VALIDATION_ERROR");
        }

        const user = await User.create({ name, email });
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// READ ALL
router.get("/", async (req, res, next) => {
    try {
        const users = await User.find();
        res.json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
});

// READ ONE
router.get("/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw new AppError("User not found", 404, "NOT_FOUND");
        }
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// UPDATE
router.put("/:id", async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!user) {
            throw new AppError("User not found", 404, "NOT_FOUND");
        }
        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
});

// DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            throw new AppError("User not found", 404, "NOT_FOUND");
        }
        res.json({ success: true, message: "User deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
