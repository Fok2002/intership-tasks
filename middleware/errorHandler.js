/**
 * Centralized error-handling middleware for the Users API.
 *
 * Catches all errors thrown or passed via next(err) in route handlers,
 * and returns a consistent JSON response with the appropriate HTTP status.
 */

// Custom error class so route handlers can throw with a status code
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

/**
 * Express error-handling middleware (must have 4 parameters).
 */
function errorHandler(err, req, res, _next) {
    let statusCode = err.statusCode || 500;
    let code = err.code || "INTERNAL_ERROR";
    let message = err.message || "Something went wrong";

    // ── Mongoose Validation Error ────────────────────────────────────────
    if (err.name === "ValidationError") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        // Collect all field-level messages
        const messages = Object.values(err.errors).map(e => e.message);
        message = messages.join(". ");
    }

    // ── Mongoose CastError (invalid ObjectId, etc.) ──────────────────────
    if (err.name === "CastError") {
        statusCode = 400;
        code = "INVALID_ID";
        message = `Invalid ${err.path}: ${err.value}`;
    }

    // ── MongoDB Duplicate Key Error ──────────────────────────────────────
    if (err.code === 11000 || err.code === 11001) {
        statusCode = 409;
        code = "DUPLICATE_KEY";
        const field = Object.keys(err.keyValue || {}).join(", ");
        message = `Duplicate value for field: ${field}`;
    }

    // ── JSON Parse Error (malformed body) ────────────────────────────────
    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        code = "VALIDATION_ERROR";
        message = "Malformed JSON in request body";
    }

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            statusCode,
            code,
        },
    });
}

module.exports = { AppError, errorHandler };
