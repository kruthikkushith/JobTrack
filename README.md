# JobTrack

JobTrack is a personal job-application tracker. The React dashboard lets you create, review, search, filter, edit, and delete applications. An Express API stores the records in MongoDB.

## Current Status

- The client production build and ESLint check pass.
- The backend connects to the configured local MongoDB database and listens on port `5000`.
- There is no login, user account, or JWT authentication. The current API and database are shared by anyone who can reach this local app.
- The app tracks company, role, status, and an optional application date. It does not currently track interviews as separate records, profiles, or notifications.

## Requirements

- Node.js and npm
- MongoDB running locally on `127.0.0.1:27017`

The backend uses the database named `jobtrack` and creates its collection when the first application is saved. Its MongoDB connection string is currently defined directly in `server/server.js`; there is no environment-variable configuration yet.

## Run Locally

Open three terminals from the repository root. Start MongoDB first (for example, start the MongoDB service installed on your machine), then run:

**Terminal 1: API server**

```powershell
cd server
npm install
node server.js
```

The server prints a MongoDB connection message and listens at `http://localhost:5000`. Keep this terminal running. The server package does not currently define a `start` script.

**Terminal 2: React client**

```powershell
cd client
npm install
npm run dev
```

Open the Vite URL printed in the terminal, normally `http://localhost:5173`. Keep the client terminal running. The client sends API requests to `http://localhost:5000/api/applications`.

**Terminal 3: optional client checks**

```powershell
cd client
npm run build
npm run lint
```

The production build is written to `client/dist/`. `npm run preview` serves that build locally after running `npm run build`; it does not start the API or MongoDB.

To confirm the API is reachable, open `http://localhost:5000/`; it returns `JobTrack backend is running successfully!`. If the server exits with a MongoDB connection error, check that the MongoDB service is running at the configured address.

## How It Works

1. `client/src/main.jsx` mounts the React application, and `client/src/App.jsx` fetches application records when the dashboard loads.
2. The dashboard sends create, update, and delete requests to the Express API. Search, status filtering, and summary counts are calculated in the browser from the loaded records.
3. `server/server.js` validates requests, reads and writes MongoDB documents through Mongoose, and returns JSON records with an `id` field.
4. MongoDB persists application data across client reloads. All requests currently use the same local database; there is no per-user data separation.

Application statuses are `Applied`, `Interview`, `Rejected`, and `Offer`. Company and role are required. Application date is optional. New records appear first.

## API Reference

Base URL: `http://localhost:5000`

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/` | Backend health message. |
| `GET` | `/api/applications` | List all applications, newest first. |
| `POST` | `/api/applications` | Create an application. |
| `PUT` | `/api/applications/:id` | Update provided fields on an existing application. |
| `DELETE` | `/api/applications/:id` | Delete an application. |

Create requests use JSON with `company`, `role`, and `status`; `date` is optional:

```json
{
	"company": "Example Company",
	"role": "Software Developer",
	"status": "Applied",
	"date": "2026-10-22"
}
```

Successful application responses contain `id`, `company`, `role`, `status`, and `date`. Invalid create data or IDs return a client error; missing records return `404`; server/database failures return an error response. The API enables CORS for cross-origin requests and currently has no authentication or authorization middleware.

## Repository Files

### Root

| File | Purpose and current status |
| --- | --- |
| `README.md` | This setup guide, API reference, and file map. |
| `.gitignore` | Excludes dependency folders, build output, local environment files, logs, and editor/OS files from Git. |

### Client

| File | Purpose and current status |
| --- | --- |
| `client/package.json` | Client dependencies and Vite, build, lint, and preview scripts. |
| `client/package-lock.json` | Locks exact npm dependency resolutions for repeatable client installs. |
| `client/.gitignore` | Ignores client-specific dependencies, generated output, local files, and editor files. |
| `client/README.md` | Unmodified Vite starter documentation; this root README is the JobTrack-specific guide. |
| `client/index.html` | Vite HTML entry point; provides the root element and loads `src/main.jsx`. Its current browser title is `client`. |
| `client/vite.config.js` | Configures Vite with the React plugin. |
| `client/eslint.config.js` | Configures ESLint rules for JavaScript, React Hooks, and Vite React refresh; ignores `dist`. |
| `client/src/main.jsx` | Mounts `<App />` under React Strict Mode and imports the global stylesheet. |
| `client/src/App.jsx` | Active dashboard and application state: fetches records, submits create/update requests, deletes records, filters/searches, and computes summary counts. Uses the fixed API URL `http://localhost:5000/api/applications`. |
| `client/src/index.css` | Main dashboard, form, list, responsive layout, and visual styles. |
| `client/src/App.css` | Additional stylesheet imported by `App.jsx`; includes generic and overlapping layout/control styles from an earlier UI. |
| `client/src/components/Navbar.jsx` | Small standalone navbar component; not imported by the active `App.jsx` dashboard. |
| `client/src/components/Sidebar.jsx` | Standalone starter sidebar; not imported by the active dashboard, which renders its own sidebar. |
| `client/src/components/StatsCard.jsx` | Standalone statistics card; not imported by the active dashboard, which renders cards inline. |
| `client/public/favicon.svg` | Favicon referenced by `index.html`. |
| `client/public/icons.svg` | SVG symbol collection; not referenced by the active client code. |
| `client/src/assets/hero.png` | Image asset; not referenced by the active client code. |
| `client/src/assets/react.svg` | React starter asset; not referenced by the active client code. |
| `client/src/assets/vite.svg` | Vite starter asset; not referenced by the active client code. |

### Server

| File | Purpose and current status |
| --- | --- |
| `server/package.json` | Express, CORS, and Mongoose dependencies. It has no start or working test script; start the server with `node server.js`. |
| `server/package-lock.json` | Locks exact npm dependency resolutions for repeatable server installs. |
| `server/server.js` | Express API, Mongoose application schema/model, request validation, CRUD routes, MongoDB connection, and server startup. Uses port `5000` and `mongodb://127.0.0.1:27017/jobtrack`. |

`node_modules/` folders and `client/dist/` are generated dependency/build output, not application source files. They are recreated by npm install/build and are ignored by Git.

## Technology

- React 19 and Vite 8 for the client
- Node.js, Express 5, and Mongoose 9 for the API and MongoDB access
- MongoDB for persistent application records