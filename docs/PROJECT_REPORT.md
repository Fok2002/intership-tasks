# Users API — Project Report

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Project Objectives](#2-project-objectives)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Project Structure](#5-project-structure)
6. [Data Model](#6-data-model)
7. [API Specification](#7-api-specification)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Configuration & Environment](#9-configuration--environment)
10. [Setup & Deployment](#10-setup--deployment)
11. [Testing](#11-testing)
12. [Future Improvements](#12-future-improvements)
13. [Conclusion](#13-conclusion)

---

## 1. Introduction

The **Users API** is a RESTful web service designed to manage user data through standard CRUD (Create, Read, Update, Delete) operations. It serves as a backend microservice that can be integrated with any frontend application, mobile app, or consumed by other services within a larger system architecture.

The API is built following modern software engineering practices including modular architecture, centralized error handling, and environment-based configuration. It exposes a clean, predictable HTTP interface and returns structured JSON responses to ensure consistency and ease of integration for client applications.

---

## 2. Project Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Build a RESTful API with full CRUD operations for user management | ✅ Achieved |
| 2 | Persist data in a MongoDB database via Mongoose ODM | ✅ Achieved |
| 3 | Implement a centralized error-handling middleware that returns proper HTTP responses | ✅ Achieved |
| 4 | Follow a modular, maintainable project structure (routes, models, middleware) | ✅ Achieved |
| 5 | Support both local and cloud-based MongoDB deployments via environment variables | ✅ Achieved |
| 6 | Provide consistent, structured JSON responses for both success and error cases | ✅ Achieved |

---

## 3. Technology Stack

| Layer               | Technology        | Version   | Purpose                                    |
|---------------------|-------------------|-----------|--------------------------------------------|
| **Runtime**         | Node.js           | ≥ 18      | JavaScript server-side runtime             |
| **Framework**       | Express           | 5.2.x     | HTTP server and routing framework          |
| **Database**        | MongoDB           | 6.x / 7.x| NoSQL document database for data storage   |
| **ODM**             | Mongoose          | 9.7.x     | Object-Document Mapping for MongoDB        |
| **Env Management**  | dotenv            | 17.4.x    | Loads environment variables from `.env`     |
| **Dev Tooling**     | nodemon           | 3.1.x     | Auto-restarts server on file changes       |

### Why These Choices?

- **Express 5**: The latest major version of Express provides improved async error handling, better routing performance, and is the actively maintained release.
- **Mongoose 9**: Provides schema validation at the application layer, query building, and middleware hooks — eliminating the need for manual MongoDB driver operations.
- **MongoDB**: A document-based NoSQL database that offers flexible schemas, horizontal scalability, and native JSON storage — ideal for a user management microservice.

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client                               │
│              (Browser / Postman / Mobile App)                │
└─────────────────────┬───────────────────────────────────────┘
                      │  HTTP (JSON)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Express Server                            │
│                   (server.js)                                │
│                                                             │
│  ┌────────────┐   ┌──────────────┐   ┌──────────────────┐  │
│  │  JSON Body │──▶│   Router     │──▶│  Route Handlers  │  │
│  │  Parser    │   │  /users/*    │   │  (routes/users)  │  │
│  └────────────┘   └──────────────┘   └───────┬──────────┘  │
│                                              │              │
│                                    ┌─────────▼──────────┐   │
│                                    │  Mongoose Model    │   │
│                                    │  (models/User)     │   │
│                                    └─────────┬──────────┘   │
│                                              │              │
│  ┌────────────────────────────────┐          │              │
│  │  Error Handler Middleware      │◀─ next() │              │
│  │  (middleware/errorHandler)     │          │              │
│  └────────────────────────────────┘          │              │
└──────────────────────────────────────────────┼──────────────┘
                                               │
                                               ▼
                                    ┌──────────────────────┐
                                    │      MongoDB         │
                                    │  (Atlas or Local)    │
                                    │  Collection: users   │
                                    └──────────────────────┘
```

### Request Lifecycle

1. **Client** sends an HTTP request to the server.
2. **Express JSON parser** deserializes the request body.
3. The **Router** matches the URL pattern and method to a route handler.
4. The **Route Handler** validates input, calls the **Mongoose Model** for database operations.
5. On **success**, a structured JSON response is returned directly.
6. On **error**, the handler calls `next(err)`, which passes control to the **Error Handler Middleware**.
7. The **Error Handler** classifies the error (validation, cast, duplicate, etc.) and returns a structured error response with the appropriate HTTP status code.

---

## 5. Project Structure

```
users-api/
│
├── server.js                    # Application entry point
│                                  - Express app initialization
│                                  - MongoDB connection
│                                  - Middleware & route registration
│                                  - 404 catch-all handler
│
├── models/
│   └── User.js                  # Mongoose schema & model definition
│                                  - Fields: name (required), email (required)
│
├── routes/
│   └── users.js                 # Express router with CRUD endpoints
│                                  - POST /        → Create user
│                                  - GET /          → List all users
│                                  - GET /:id       → Get user by ID
│                                  - PUT /:id       → Update user
│                                  - DELETE /:id    → Delete user
│
├── middleware/
│   └── errorHandler.js          # Centralized error handling
│                                  - AppError custom class
│                                  - Mongoose/MongoDB error mapping
│                                  - Structured JSON error responses
│
├── docs/
│   └── PROJECT_REPORT.md        # This report
│
├── .env                         # Environment variables (git-ignored)
├── package.json                 # Dependencies and scripts
├── package-lock.json            # Locked dependency tree
└── README.md                    # Project documentation
```

---

## 6. Data Model

### User Schema

| Field   | Type     | Required | Constraints           | Description              |
|---------|----------|----------|-----------------------|--------------------------|
| `_id`   | ObjectId | Auto     | Generated by MongoDB  | Unique document ID       |
| `name`  | String   | Yes      | Must not be blank     | Full name of the user    |
| `email` | String   | Yes      | Must not be blank     | Email address of the user|
| `__v`   | Number   | Auto     | Mongoose version key  | Document version tracker |

### Schema Definition (Mongoose)

```javascript
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    }
});
```

### Example Document (MongoDB)

```json
{
    "_id": "6658a1b2c3d4e5f6a7b8c9d0",
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "__v": 0
}
```

---

## 7. API Specification

**Base URL**: `http://localhost:3000`

### 7.1 Health Check

| Method | Endpoint | Description         | Response                                         |
|--------|----------|---------------------|--------------------------------------------------|
| GET    | `/`      | API status check    | `{ "success": true, "message": "REST API Running" }` |

### 7.2 User Endpoints

| Method | Endpoint       | Description         | Request Body                               |
|--------|----------------|---------------------|--------------------------------------------|
| POST   | `/users`       | Create a new user   | `{ "name": "...", "email": "..." }`        |
| GET    | `/users`       | Retrieve all users  | —                                          |
| GET    | `/users/:id`   | Retrieve one user   | —                                          |
| PUT    | `/users/:id`   | Update a user       | `{ "name": "...", "email": "..." }`        |
| DELETE | `/users/:id`   | Delete a user       | —                                          |

### 7.3 Detailed Endpoint Documentation

#### `POST /users` — Create User

**Request:**
```http
POST /users HTTP/1.1
Content-Type: application/json

{
    "name": "Alice Johnson",
    "email": "alice@example.com"
}
```

**Success Response** — `201 Created`:
```json
{
    "success": true,
    "data": {
        "_id": "6658a1b2c3d4e5f6a7b8c9d0",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "__v": 0
    }
}
```

**Error Response** — `400 Bad Request` (missing fields):
```json
{
    "success": false,
    "error": {
        "message": "Name and email are required",
        "statusCode": 400,
        "code": "VALIDATION_ERROR"
    }
}
```

---

#### `GET /users` — List All Users

**Success Response** — `200 OK`:
```json
{
    "success": true,
    "count": 2,
    "data": [
        {
            "_id": "6658a1b2c3d4e5f6a7b8c9d0",
            "name": "Alice Johnson",
            "email": "alice@example.com",
            "__v": 0
        },
        {
            "_id": "6658a1b2c3d4e5f6a7b8c9d1",
            "name": "Bob Smith",
            "email": "bob@example.com",
            "__v": 0
        }
    ]
}
```

---

#### `GET /users/:id` — Get Single User

**Success Response** — `200 OK`:
```json
{
    "success": true,
    "data": {
        "_id": "6658a1b2c3d4e5f6a7b8c9d0",
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "__v": 0
    }
}
```

**Error Response** — `404 Not Found`:
```json
{
    "success": false,
    "error": {
        "message": "User not found",
        "statusCode": 404,
        "code": "NOT_FOUND"
    }
}
```

**Error Response** — `400 Bad Request` (malformed ID):
```json
{
    "success": false,
    "error": {
        "message": "Invalid _id: abc123",
        "statusCode": 400,
        "code": "INVALID_ID"
    }
}
```

---

#### `PUT /users/:id` — Update User

**Request:**
```http
PUT /users/6658a1b2c3d4e5f6a7b8c9d0 HTTP/1.1
Content-Type: application/json

{
    "name": "Alice Updated"
}
```

**Success Response** — `200 OK`:
```json
{
    "success": true,
    "data": {
        "_id": "6658a1b2c3d4e5f6a7b8c9d0",
        "name": "Alice Updated",
        "email": "alice@example.com",
        "__v": 0
    }
}
```

---

#### `DELETE /users/:id` — Delete User

**Success Response** — `200 OK`:
```json
{
    "success": true,
    "message": "User deleted"
}
```

---

## 8. Error Handling Strategy

### 8.1 Overview

The application uses a **centralized error-handling architecture**. Rather than handling errors individually inside each route, all errors are delegated via Express's `next(err)` mechanism to a single middleware function.

This approach ensures:
- **Consistency**: Every error response follows the same JSON structure.
- **Maintainability**: Error logic is defined in one place, not scattered across routes.
- **Extensibility**: New error types can be added without modifying route handlers.

### 8.2 Error Response Format

All error responses follow this unified structure:

```json
{
    "success": false,
    "error": {
        "message": "Human-readable description of the error",
        "statusCode": 400,
        "code": "VALIDATION_ERROR"
    }
}
```

| Field               | Type    | Description                                     |
|---------------------|---------|-------------------------------------------------|
| `success`           | boolean | Always `false` for error responses              |
| `error.message`     | string  | Human-readable error description                |
| `error.statusCode`  | number  | HTTP status code                                |
| `error.code`        | string  | Machine-readable error identifier               |

### 8.3 Error Classification

The middleware automatically classifies errors by inspecting the error object properties:

| Error Source               | Detection Criteria             | HTTP Status | Error Code         |
|----------------------------|--------------------------------|-------------|--------------------|
| **Manual validation**      | `AppError` with explicit code  | _varies_    | _varies_           |
| **Mongoose validation**    | `err.name === "ValidationError"` | `400`     | `VALIDATION_ERROR` |
| **Invalid ObjectId**       | `err.name === "CastError"`     | `400`       | `INVALID_ID`       |
| **Duplicate key**          | `err.code === 11000`           | `409`       | `DUPLICATE_KEY`    |
| **Malformed JSON body**    | `err.type === "entity.parse.failed"` | `400` | `VALIDATION_ERROR` |
| **Unhandled / Unknown**    | Fallback                       | `500`       | `INTERNAL_ERROR`   |

### 8.4 Custom AppError Class

Route handlers use the `AppError` class to throw domain-specific errors with an explicit status code and error code:

```javascript
class AppError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

// Usage in a route handler:
if (!user) {
    throw new AppError("User not found", 404, "NOT_FOUND");
}
```

### 8.5 404 Catch-All

Any request to an undefined route is caught by a dedicated middleware and returns a structured `404` response:

```json
{
    "success": false,
    "error": {
        "message": "Route GET /unknown-path not found",
        "statusCode": 404,
        "code": "NOT_FOUND"
    }
}
```

---

## 9. Configuration & Environment

The application uses environment variables loaded via the `dotenv` package from a `.env` file at the project root.

| Variable    | Required | Default                             | Description                          |
|-------------|----------|-------------------------------------|--------------------------------------|
| `MONGO_URI` | No       | `mongodb://localhost:27017/usersdb` | MongoDB connection string            |
| `PORT`      | No       | `3000`                              | Port number for the HTTP server      |

**Security Note**: The `.env` file should be added to `.gitignore` and never committed to version control, as it may contain sensitive credentials (e.g., MongoDB Atlas connection strings with passwords).

---

## 10. Setup & Deployment

### 10.1 Local Development

```bash
# Install dependencies
npm install

# Create .env file with your MongoDB URI
echo "MONGO_URI=mongodb://localhost:27017/usersdb" > .env
echo "PORT=3000" >> .env

# Start in development mode (auto-restart)
npm run dev
```

### 10.2 Production

```bash
# Install dependencies (production only)
npm install --production

# Start the server
npm start
```

### 10.3 NPM Scripts

| Script        | Command              | Description                            |
|---------------|----------------------|----------------------------------------|
| `npm start`   | `node server.js`     | Start server for production            |
| `npm run dev` | `nodemon server.js`  | Start server with auto-reload on save  |

---

## 11. Testing

The API can be tested manually using tools such as:

- **curl** (command-line)
- **Postman** (GUI-based API client)
- **Thunder Client** (VS Code extension)

### Sample Test Sequence (curl)

```bash
# 1. Health check
curl http://localhost:3000/

# 2. Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'

# 3. Get all users
curl http://localhost:3000/users

# 4. Get a single user (replace <id>)
curl http://localhost:3000/users/<id>

# 5. Update a user
curl -X PUT http://localhost:3000/users/<id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Name"}'

# 6. Delete a user
curl -X DELETE http://localhost:3000/users/<id>

# 7. Test error: invalid ID
curl http://localhost:3000/users/invalidid123

# 8. Test error: missing fields
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{}'

# 9. Test error: unknown route
curl http://localhost:3000/unknown
```

---

## 12. Future Improvements

The following enhancements could be implemented in future iterations:

| Priority | Improvement                  | Description                                                     |
|----------|------------------------------|-----------------------------------------------------------------|
| High     | **Input validation library** | Integrate `Joi` or `express-validator` for robust schema validation |
| High     | **Authentication**           | Add JWT-based authentication and route protection               |
| High     | **Unique email constraint**  | Add a unique index on the `email` field to prevent duplicates   |
| Medium   | **Pagination**               | Implement `page` and `limit` query parameters on `GET /users`   |
| Medium   | **Search & filtering**       | Add query parameters for searching by name or email             |
| Medium   | **Automated tests**          | Add unit and integration tests with Jest and Supertest          |
| Medium   | **Request logging**          | Add Morgan or Winston for HTTP request/response logging         |
| Low      | **Rate limiting**            | Protect endpoints from abuse with `express-rate-limit`          |
| Low      | **API documentation**        | Generate interactive docs with Swagger/OpenAPI                  |
| Low      | **Docker support**           | Containerize the app with a `Dockerfile` and `docker-compose.yml` |

---

## 13. Conclusion

The **Users API** project successfully delivers a clean, functional REST API for user management. The key achievements of this project include:

- **Full CRUD Operations**: All create, read, update, and delete operations are implemented and return structured responses.
- **Centralized Error Handling**: A dedicated middleware intercepts all errors — including Mongoose validation, invalid ObjectIds, duplicate keys, and malformed requests — and returns consistent, informative JSON error responses with appropriate HTTP status codes.
- **Modular Architecture**: The codebase is organized into clearly separated concerns (models, routes, middleware), making it easy to maintain and extend.
- **Cloud-Ready Configuration**: Environment-based configuration supports both local development and cloud deployment (MongoDB Atlas) without code changes.

The project provides a solid foundation that can be extended with authentication, pagination, automated testing, and additional features as requirements evolve.

---

*Report generated on June 22, 2026.*
