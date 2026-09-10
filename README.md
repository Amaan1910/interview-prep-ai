# Interview Prep AI

An AI-powered interview preparation application that helps job seekers analyze a job description, compare it against their resume or self-summary, and generate a tailored interview strategy.

The app combines:
- a Node.js + Express backend
- a MongoDB database for user and report storage
- a React + Vite frontend
- Google Gemini for AI-generated interview insights
- Puppeteer for resume PDF generation

## Features

- User registration and login with JWT-based authentication
- Secure cookie-based session management
- Resume upload support (PDF input handled on the backend)
- Self-description fallback when no resume is provided
- AI-generated match score against the target role
- Technical interview questions with intent and answer guidance
- Behavioral interview questions with intent and answer guidance
- Skill gap analysis and severity ranking
- Personalized 7+ day preparation roadmap
- Downloadable resume PDF generated from the analyzed profile
- Previous reports history per user

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT + bcryptjs
- Multer for multipart file upload
- Google GenAI SDK
- Puppeteer
- Zod validation

### Frontend
- React 19
- Vite
- React Router
- Axios
- Sass

## Project Structure

```text
interview-prep-ai/
├── README.md
├── Backend/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── src/
│       ├── app.js
│       ├── config/
│       │   └── database.js
│       ├── controllers/
│       │   ├── auth.controller.js
│       │   └── interview.controller.js
│       ├── middlewares/
│       │   ├── auth.middleware.js
│       │   └── file.middleware.js
│       ├── models/
│       │   ├── blacklist.model.js
│       │   ├── interviewReport.model.js
│       │   └── user.model.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   └── interview.routes.js
│       └── services/
│           └── ai.service.js
└── Frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── App.jsx
        ├── app.routes.jsx
        ├── main.jsx
        ├── features/
        │   ├── auth/
        │   └── interview/
        └── style/
```
## Prerequisites

Before running the app, make sure you have:

Node.js installed (v18 or newer recommended)
MongoDB database available locally or via MongoDB Atlas
A Google Generative AI API key

## Environment Variables

Create a .env file inside the Backend folder with the following values:
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_GENAI_API_KEY=your_google_generative_ai_key
```

The repo already includes a .env file in the backend for local development, but you should update the values if needed for your own environment.

## Getting Started

1. Install backend dependencies
```
cd Backend
npm install
```

2. Install frontend dependencies
```
cd ../Frontend
npm install
```

3. Start the backend server
```
cd ../Backend
npm run dev
```

This starts the Express API on:

```http://localhost:3000```

4. Start the frontend development server
```
cd ../Frontend
npm run dev
```

## App Flow

1. User creates an account or logs in.
2. User uploads their resume (PDF) or provides a self-description.
3. Backend extracts resume text and sends the data to the AI service.
4. AI generates:
   - Match score against the job description
   - Technical and behavioral interview questions with guidance
   - Skill gap analysis
   - Personalized preparation roadmap
   - Job title

5. The report is stored in MongoDB.
6. User can view the report, download a AI-generated resume PDF, and access previous reports.

## API Overview

### Authentication Routes
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login and receive a cookie-based token
- `GET /api/auth/logout`: Log out and invalidate the token
- `GET /api/auth/get-me`: Get the current authenticated user

### Interview Report Routes
- `POST /api/interview`: Generate a job-fit interview report
- `GET /api/interview`: Get all reports for the current user
- `GET /api/interview/report/:interviewId`: Get a specific interview report for the current user
- `POST /api/interview/resume/pdf/:interviewReportId`: Download the AI-generated resume PDF for a specific report

## Notes

- The frontend is configured to communicate with the backend at `http://localhost:3000`.
- CORS is enabled for `http://localhost:5173`.
- Authentication uses cookies, so the frontend must send credentials with requests.
- The resume upload limit is set to 3MB in the backend middleware.

## Common Issues

### Backend fails to connect to MongoDB
- Check that your `MONGO_URI` is valid.
- Ensure that your MongoDB server is running and accessible.

### AI response fails
- Confirm that your `GOOGLE_GENAI_API_KEY` is set correctly.
- Make sure the job description and resume text are not too large or blocked by content filters.

### Frontend cannot reach the backend
- Confirm both servers are running and that the backend is accessible at `http://localhost:3000`.
- Verify the frontend is using the correct API base URL in its Axios configuration.

## License

This project is currently unlicensed unless you add a license file for your own usage.

## Future Enhancements

- Add email verification for new users
- Implement password reset functionality
- Add support for additional resume formats (e.g., DOCX)
- Add analytics and dashboard views
- Improve report export and PDF styling
- Add test coverage for backend and frontend components