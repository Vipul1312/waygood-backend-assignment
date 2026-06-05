# Waygood Study Abroad — Backend Submission

A study-abroad platform backend built on the Waygood candidate starter. Students discover universities and programs, get aggregation-powered recommendations, and manage an application lifecycle. Counselors and students authenticate with JWT.

## Tech Stack

Node.js, Express, MongoDB (Mongoose), JWT auth with bcrypt hashing, Redis (optional, with in-memory fallback), Jest + Supertest for testing, Docker for deployment.

## Setup

1. cd backend
2. npm install
3. cp .env.example .env
4. Start MongoDB locally (or use docker compose)
5. npm run seed
6. npm run dev

The API runs on http://localhost:4000.

## Environment Variables

- PORT — server port (default 4000)
- MONGODB_URI — Mongo connection string
- JWT_SECRET — secret used to sign tokens
- JWT_EXPIRES_IN — token lifetime (default 1d)
- CACHE_TTL_SECONDS — cache time to live (default 300)
- REDIS_URL — optional; if empty the app uses an in-memory cache
- OPENAI_API_KEY — optional; enables the AI study-plan endpoint

## Sample Credentials (after seeding)

- aarav@example.com / Candidate123!
- sara@example.com / Candidate123!
- counselor@example.com / Candidate123!

## API Overview

Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (protected)

Discovery
- GET /api/universities (country, partnerType, q, scholarshipAvailable, sortBy, page, limit)
- GET /api/universities/popular (cached)
- GET /api/programs (country, degreeLevel, field, intake, maxTuition, scholarshipAvailable, q, sortBy, page, limit)

Recommendations
- GET /api/recommendations/:studentId (MongoDB aggregation scoring)
- GET /api/recommendations/:studentId/study-plan (protected, AI/local plan)

Applications
- GET /api/applications (studentId, status filters)
- POST /api/applications (protected)
- PATCH /api/applications/:id/status (protected)

Dashboard
- GET /api/dashboard (cached aggregation summary)

## Response Format

Every endpoint returns a consistent envelope: { success, data, meta } on success and { success: false, error: { message, details } } on failure.

## Recommendation Engine

Scoring runs fully inside a MongoDB aggregation pipeline rather than in JavaScript. Weights: preferred country 35, field alignment 30, within budget 20, preferred intake 10, IELTS requirement met 5. Each result includes a reasons array explaining the match.

## Application Lifecycle

Statuses: draft, submitted, under-review, offer-received, visa-processing, enrolled, rejected. Transitions are enforced server-side from config/constants.js. Every status change appends a timeline entry. A unique compound index on (student, program, intake) plus a service-level check prevents duplicate applications.

## Caching and Performance

The cache service uses Redis when REDIS_URL is set and falls back to an in-memory store otherwise. Cached endpoints: /api/universities/popular and /api/dashboard. The dashboard cache is invalidated whenever an application is created or its status changes.

## Indexing Strategy

- University: country, popularScore, and a text index on name/country/city for search.
- Program: country, field, degreeLevel, tuitionFeeUsd, plus a compound index (country, degreeLevel, field, tuitionFeeUsd) supporting the most common filtered listing.
- Application: student, program, intake, status, destinationCountry; a unique compound index on (student, program, intake) for duplicate prevention; and (status, createdAt) for filtered listings.

## Security

Passwords hashed with bcrypt. JWT bearer auth. helmet for secure headers. Rate limiting: 300 requests / 15 min globally and 20 / 15 min on auth routes. Request validation via express-validator returns 422 with field-level details.

## Testing

Run npm test. Jest with an in-memory MongoDB covers the auth flow (register, duplicate, login, protected route, wrong password) and the application workflow (creation, duplicate prevention, valid and invalid transitions, and the unsupported-intake edge case).

## Docker

docker compose up --build starts MongoDB, Redis, and the API together.

## Assumptions

- Students and counselors share one Student collection differentiated by role.
- An application starts in draft; submission is a separate status transition.
- The AI endpoint degrades to a deterministic local plan when no OpenAI key is configured, so evaluation never depends on external credentials.
