# Indu Prakash Deo Pandey — Portfolio

A responsive personal portfolio website for showcasing frontend development skills, selected projects, and contact information.

**Live website:** https://induprakashdeopandey.github.io/Indu-porfolio/  
**Backend service:** https://indu-porfolio.onrender.com

## Features

- Responsive layout for desktop, tablet, and mobile
- About, skills, projects, and contact sections
- Mobile navigation
- Contact form connected to an Express API
- Contact submissions stored in MongoDB Atlas
- Basic request validation, rate limiting, CORS, and security headers

## Project structure

```text
Indu-porfolio/
├── index.html
├── style.css
├── script.js
├── config.js
├── README.md
└── backend/
    ├── package.json
    ├── server.js
    └── .env.example
```

## Tech stack

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express.js  
**Database:** MongoDB Atlas with Mongoose  
**Deployment:** GitHub Pages (frontend), Render (backend)

## Run the backend locally

1. Install Node.js 20 or later.
2. Open a terminal in the `backend` directory.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in `backend/` using `.env.example` as a guide:

   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_connection_string
   FRONTEND_ORIGIN=https://induprakashdeopandey.github.io
   ```

   For local frontend testing, add the local origin you actually use (for example, `http://127.0.0.1:5500`) to `FRONTEND_ORIGIN`, separated by a comma.

5. Start the API:

   ```bash
   npm start
   ```

The health endpoint is available at `http://localhost:5000/health`.

## Deployment notes

### Backend on Render

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- Add `MONGODB_URI` and `FRONTEND_ORIGIN` in the Render environment variables.\n- For email alerts, create a Resend account, verify a sending domain, then set `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `CONTACT_TO_EMAIL` in Render. Email alerts stay disabled until these values are configured; contact messages are still saved in MongoDB. Never commit API keys.
- Keep database credentials private. Never commit the real `.env` file or MongoDB connection string.

### Frontend

The frontend is published through GitHub Pages. The API base URL is configured in `config.js`. If the backend URL changes, update that file and commit the change.

## Contact

Use the contact form on the live website, or email: **induprakashdeopandey@gmail.com**.
