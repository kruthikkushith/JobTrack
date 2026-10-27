# JobTrack — Job Application Tracker

JobTrack is a full-stack web application that helps users organize and manage their job search. Users can create an account, log in securely, and track job applications through a dashboard.

## Live Demo

- **Frontend:** [Open JobTrack](YOUR_RENDER_FRONTEND_URL)
- **Backend API:** https://jobtrack-api-fck9.onrender.com

> Replace `YOUR_RENDER_FRONTEND_URL` with your actual deployed frontend URL.

## Features

- **User Authentication:** Register and log in using email and password.
- **JWT Authentication:** Protect API endpoints using JSON Web Tokens.
- **Password Security:** Hash passwords before storing them in the database.
- **Application Management:** Create, view, edit, and delete job applications.
- **Search and Filtering:** Search applications and filter them by status.
- **Dashboard:** View application summaries and track progress.
- **Database Persistence:** Store user accounts and application records in MongoDB Atlas.
- **Responsive Interface:** Access the application through a web browser.

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT, bcryptjs |
| API | REST API, JSON |
| Deployment | Render |
| Version Control | Git, GitHub |

## Architecture

The application uses a client-server architecture.

1. **React frontend:** Displays the dashboard and sends HTTP requests to the backend.
2. **Express backend:** Handles authentication, validates requests, and processes application operations.
3. **JWT authentication:** Verifies the identity of authenticated users.
4. **MongoDB Atlas:** Persists user and job application data through Mongoose models.
5. **Render:** Hosts the frontend and backend services.

## Application Statuses

Each job application can have one of the following statuses:

- Applied
- Interview
- Rejected
- Offer

Application records include company name, job role, status, and an optional application date.

## API Overview

**Base URL:** `https://jobtrack-api-fck9.onrender.com`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check backend availability |
| POST | `/api/auth/register` | Register a new account |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/applications` | Retrieve the authenticated user's applications |
| POST | `/api/applications` | Create a job application |
| PUT | `/api/applications/:id` | Update a job application |
| DELETE | `/api/applications/:id` | Delete a job application |

Application endpoints require valid authentication. Users should only be able to access their own application records.

## Run Locally

### Prerequisites

- Node.js and npm
- Git
- A MongoDB Atlas database or local MongoDB installation

### 1. Clone the repository

```bash
git clone https://github.com/kruthikkushith/JobTrack.git
cd JobTrack
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_random_secret
```

Replace the example values with your own MongoDB connection string and a strong, private JWT secret. Never commit `.env` to GitHub.

### 3. Start the backend

```bash
npm run dev
```

The backend runs locally at `http://localhost:5000`.

### 4. Configure and start the frontend

Open a second terminal:

```bash
cd client
npm install
npm run dev
```

Open the local Vite URL printed in the terminal, usually `http://localhost:5173`.

For local development, configure the frontend API base URL to point to `http://localhost:5000/api`. For production, use the deployed backend URL.

### 5. Build and lint the frontend

From the `client` directory:

```bash
npm run build
npm run lint
```

The production build is generated in `client/dist/`.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign and verify JWTs |

Keep environment variables and database credentials private. Configure production values in the backend service's environment settings on Render.

## Deployment

The application is deployed using Render:

- **Frontend:** Render Static Site
- **Backend:** Render Web Service
- **Database:** MongoDB Atlas

The frontend communicates with the deployed backend using its production API URL. The backend connects to MongoDB Atlas using the configured environment variables.

## Repository Structure

```text
JobTrack/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

## Future Improvements

- Interview scheduling and interview-round management
- Follow-up reminders and notifications
- Resume upload and management
- Job recommendations and matching
- Automated backend and frontend tests

## Author

**Kruthik A.**

Full-Stack Development Project | React, Node.js, Express.js, MongoDB, JWT
