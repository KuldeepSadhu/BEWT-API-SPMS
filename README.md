# Backend API (SPMS)

Simple Node.js + Express backend for a Student Project Management System (SPMS), using MongoDB and JWT authentication.

## Tech Stack
- Node.js (ES Modules)
- Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing with `bcryptjs`

## Project Structure
- `index.js` - app entry point, middleware, route mounting
- `config/` - DB connection, bcrypt utilities, admin helper script
- `controllers/` - API business logic
- `routes/` - API route definitions
- `models/` - Mongoose schemas
- `middleware/` - auth and role-based guards
- `scripts/` - data seeding and helper scripts

## Environment Variables
Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
SALT=10
```

## Install & Run
```bash
npm install
npm run dev
```

Production-style run:
```bash
node index.js
```

Server default: `http://localhost:5000`

## Base Routes
- `GET /` -> `Backend API is running!`
- `GET /api/status` -> health/connection check JSON

## Authentication
JWT token is returned from login/register.

Use in protected requests:
```http
Authorization: Bearer <token>
```

Admin endpoints require:
1. Valid token (`protect` middleware)
2. Role = `admin` (`authorize("admin")`)

## API Endpoints

### Auth (`/api/auth`)

1. `POST /api/auth/register`
- Register only `faculty` or `student`
- Sample body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "student",
  "department": "Computer Science",
  "rollNumber": "CS2026001"
}
```

2. `POST /api/auth/login`
- Login for `admin`, `faculty`, or `student`
- Sample body:
```json
{
  "email": "admin@college.edu",
  "password": "adminpassword123",
  "role": "admin"
}
```

### Groups (`/api/groups`)

1. `GET /api/groups`
- Public route
- Returns all groups

2. `POST /api/groups`
- Admin only
- Creates a group
- Sample body:
```json
{
  "groupID": "G-2026-001",
  "project": "AI Attendance",
  "students": ["Alice", "Bob"],
  "guide": "Prof. Sharma",
  "status": "Pending",
  "progress": 0
}
```

3. `PATCH /api/groups/:id/status`
- Admin only
- Allowed status values: `Approved`, `Rejected`
- Sample body:
```json
{
  "status": "Approved"
}
```

### Admin (`/api/admin`) - Protected + Admin Role Required

1. `GET /api/admin/stats`
- Dashboard counts:
  - total projects
  - pending approvals
  - approved/active groups
  - total faculty

2. `GET /api/admin/proposals/recent`
- Latest 5 project proposals with populated student/faculty info

3. `GET /api/admin/students`
- List all students (password excluded)

4. `GET /api/admin/faculty`
- List all faculty (password excluded)

5. `GET /api/admin/projects`
- List all projects with populated refs

6. `GET /api/admin/config/master`
- Returns academic years and project types

## Data Models (High-Level)
- `Admin`: email, password, name
- `Faculty`: name, email, password, department, designation, expertise, role
- `Student`: name, email, password, rollNumber, department, year, status, role
- `Group`: groupID, project, students[], guide, status, progress
- `Project`: title, description, department, student, faculty, status, academicYear, remarks
- `AcademicYear`: year, startDate, endDate, isCurrent, status
- `ProjectType`: type, semester, credits, description
- `Submission`: project, student, faculty, fileUrl, remarks, status, grade

## Utility Scripts
- `scripts/seedAdminData.js` - clears and seeds sample data
- `scripts/testLogin.js` - validates admin password comparison flow
- `checkMongoDB.js` - quick DB + collection inspection helper

Run a script:
```bash
node scripts/seedAdminData.js
```

## Notes
- CORS origin is currently fixed to `http://localhost:5173` in `index.js`.
- JWT expiry is set to `1d`.
- Passwords are hashed in model pre-save hooks.
