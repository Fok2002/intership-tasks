# Users API

A RESTful API for managing users, built with **Node.js**, **Express**, and **MongoDB** (via Mongoose).

---

## Tech Stack

| Layer      | Technology             |
|------------|------------------------|
| Runtime    | Node.js                |
| Framework  | Express 5              |
| Database   | MongoDB (Atlas / Local)|
| ODM        | Mongoose 9             |
| Env Config | dotenv                 |

---

## Project Structure

```
users-api/
├── models/
│   └── User.js            # Mongoose user schema & model
├── routes/
│   └── users.js           # CRUD route handlers
├── middleware/
│   └── errorHandler.js    # Centralized error-handling middleware
├── server.js              # App entry point & MongoDB connection
├── .env                   # Environment variables (not committed)
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — either a local instance or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- **npm**

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd users-api

# 2. Install dependencies
npm install

# 3. Create a .env file (see below)
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/usersdb
PORT=3000
```

| Variable    | Description                     | Default                               |
|-------------|---------------------------------|---------------------------------------|
| `MONGO_URI` | MongoDB connection string       | `mongodb://localhost:27017/usersdb`    |
| `PORT`      | Port the server listens on      | `3000`                                |

### Running the Server

```bash
# Production
npm start

# Development (auto-restart with nodemon)
npm run dev
```

The server will start at `http://localhost:3000`.

---

## API Endpoints

Base URL: `http://localhost:3000/users`

### Health Check

| Method | Endpoint | Description        |
|--------|----------|--------------------|
| GET    | `/`      | API running status |

### Users CRUD

| Method | Endpoint      | Description       | Body                                      |
|--------|---------------|-------------------|--------------------------------------------|
| POST   | `/users`      | Create a user     | `{ "name": "string", "email": "string" }` |
| GET    | `/users`      | List all users    | —                                          |
| GET    | `/users/:id`  | Get user by ID    | —                                          |
| PUT    | `/users/:id`  | Update a user     | `{ "name": "string", "email": "string" }` |
| DELETE | `/users/:id`  | Delete a user     | —                                          |

### Example Requests

#### Create a User

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com"}'
```

**Response** `201 Created`:
```json
{
  "_id": "6658a1b2c3d4e5f6a7b8c9d0",
  "name": "Alice",
  "email": "alice@example.com",
  "__v": 0
}
```

#### Get All Users

```bash
curl http://localhost:3000/users
```

#### Get User by ID

```bash
curl http://localhost:3000/users/6658a1b2c3d4e5f6a7b8c9d0
```

#### Update a User

```bash
curl -X PUT http://localhost:3000/users/6658a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Updated"}'
```

#### Delete a User

```bash
curl -X DELETE http://localhost:3000/users/6658a1b2c3d4e5f6a7b8c9d0
```

---

## Error Handling

The API uses a **centralized error-handling middleware** that returns consistent JSON error responses.

### Error Response Format

Every error response follows this structure:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "statusCode": 404,
    "code": "NOT_FOUND"
  }
}
```

### Error Codes

| HTTP Status | Code                | When                                    |
|-------------|---------------------|-----------------------------------------|
| `400`       | `VALIDATION_ERROR`  | Missing/invalid fields, bad input       |
| `400`       | `INVALID_ID`        | Malformed MongoDB ObjectId              |
| `404`       | `NOT_FOUND`         | User/resource doesn't exist             |
| `409`       | `DUPLICATE_KEY`     | Duplicate unique field (e.g. email)     |
| `500`       | `INTERNAL_ERROR`    | Unexpected server error                 |

---

## Scripts

| Script          | Command            | Description                          |
|-----------------|--------------------|--------------------------------------|
| `npm start`     | `node server.js`   | Start the server                     |
| `npm run dev`   | `nodemon server.js`| Start with auto-reload (development) |

---

## License

ISC
