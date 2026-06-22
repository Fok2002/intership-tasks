require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/usersdb";

mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/users", require("./routes/users"));

app.get("/", (req, res) => {
    res.json({ success: true, message: "REST API Running" });
});

// Catch-all for undefined routes — must come AFTER all valid routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.originalUrl} not found`,
            statusCode: 404,
            code: "NOT_FOUND",
        },
    });
});

// Centralized error handler — must be the LAST app.use()
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
