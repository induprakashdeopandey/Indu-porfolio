# Portfolio Backend

Express API that stores portfolio contact form submissions in MongoDB Atlas.

## Local setup

1. Install Node.js 20 or newer.
2. From this folder run `npm install`.
3. Copy `.env.example` to `.env` and fill in your MongoDB Atlas connection string.
4. Set `FRONTEND_ORIGIN` to the exact origin hosting the frontend.
5. Run `npm run dev`.
6. Check `http://localhost:5000/health`.

## Endpoints

- `GET /health` — service health check.
- `POST /api/contact` — validates and stores `{ name, email, message }`.

Never commit the real `.env` file or database credentials.
