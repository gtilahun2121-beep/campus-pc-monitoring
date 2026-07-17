# Campus PC Entry & Exit Monitoring System

# Campus PC Monitoring System

A deployment-ready Campus PC entry and exit monitoring system with a frontend hosted on Vercel, a backend hosted on Railway, and MongoDB as the database.

## Deployment Architecture

- Frontend: React app deployed on Vercel
- Backend: Railway Node.js + Express API
- Database: MongoDB Atlas

## New Project Structure

```
Campus_PC_Monitoring_System/
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── .gitignore
│   ├── server.js
│   └── src/
│       ├── middleware/auth.js
│       ├── models/Admin.js
│       ├── models/PcHistory.js
│       ├── models/PcRegistration.js
│       ├── routes/auth.js
│       ├── routes/pc.js
│       └── utils/db.js
├── frontend/
│   ├── package.json
│   ├── package-lock.json
│   ├── .env.example
│   ├── vercel.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.css
│       ├── App.js
│       └── index.js
├── .gitignore
└── README.md
```

## Setup Instructions

### Frontend (Vercel)

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Set `REACT_APP_API_BASE_URL=https://your-railway-backend-url`.
3. Deploy the `frontend/` folder to Vercel.
4. Add the same `REACT_APP_API_BASE_URL` variable in your Vercel Environment Variables.

### Backend (Railway)

1. Create a new Railway project.
2. Connect this repository and use `backend/` as the deployment directory.
3. Copy `backend/.env.example` to `backend/.env` and set:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CORS_ORIGIN`
4. Deploy the backend.

### Database (MongoDB Atlas)

- Create a MongoDB Atlas cluster.
- Copy the connection string into `MONGODB_URI`.
- The backend automatically creates collections when the application runs.

## API Routes

- `POST /api/auth/login` — admin login
- `POST /api/auth/reset` — reset/create admin credentials
- `POST /api/pc/register` — register PC
- `GET /api/pc/search` — search registered PCs (admin)
- `POST /api/pc/entry` — record campus entry (admin)
- `POST /api/pc/exit` — record campus exit (admin)
- `GET /api/pc/history` — fetch activity history (admin)

## Usage Notes

- Frontend stores JWT in `localStorage`.
- Admin operations require the `Authorization: Bearer <token>` header.
- The frontend and backend are separated so the frontend can be deployed to Vercel and the backend to Railway.

## Security Notes

- Passwords are hashed using bcrypt.
- JWT tokens are signed with `JWT_SECRET`.
- Admin-only routes are protected by middleware.
- Do not commit `.env` files or sensitive credentials.
