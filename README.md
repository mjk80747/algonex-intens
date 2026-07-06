# Algonex Intens - Intern Management System

Algonex Intens is a modern, full-stack **Intern Management System** designed to track, manage, and analyze interns (students) and their credentials (CGPA, roles, projects, skills). 

The project contains a **FastAPI** backend coupled with two frontend options:
1. A classic **Vanilla JavaScript/CSS** frontend (located in `/static`).
2. A modern, premium **React + Vite** frontend (located in `/frontend`).

---

## 🚀 Features

- **Dashboard Statistics**: Real-time stats showing total students, top performer (highest CGPA), unique skill count, and custom eligibility filter calculations.
- **Search & Filter**: Real-time, case-insensitive searching by name, role, or specific skills.
- **Student Management**: Add new interns with automatic ID generation, assign custom roles, input CGPA, track project lists, and manage their skill tags.
- **Delete Interns**: Easily remove records from the management interface.
- **Data Export**: Export student/intern lists quickly via a dedicated JSON endpoint.

---

## 🛠️ Tech Stack

- **Backend**: Python, [FastAPI](https://fastapi.tiangolo.com/), Pydantic (data validation)
- **Frontend Options**:
  - **Option A (React)**: React, Vite, modern CSS
  - **Option B (Vanilla)**: HTML5, CSS3, Vanilla ES6 JavaScript

---

## 📂 Project Structure

```text
├── main.py              # FastAPI application & entry point
├── static/              # Vanilla HTML/JS/CSS frontend implementation
│   ├── index.html       # Dashboard layout
│   ├── style.css        # Dashboard styling
│   └── app.js           # API integration and DOM logic
├── frontend/            # React + Vite frontend implementation
│   ├── src/             # React components and pages
│   ├── package.json     # Node.js dependencies
│   └── vite.config.js   # Vite configuration
├── README.md            # Project documentation
└── .gitignore           # Python/Node git ignore rules
```

---

## ⚙️ Setup & Running Locally

### 1. Backend Setup (FastAPI)

Make sure you have Python 3.9+ installed.

1. **Install dependencies**:
   ```bash
   pip install fastapi uvicorn pydantic
   ```

2. **Run the FastAPI server**:
   ```bash
   uvicorn main:app --reload
   ```
   By default, the API will be available at `http://127.0.0.1:8000`.
   - Interactive Swagger API docs: `http://127.0.0.1:8000/docs`

---

### 2. Frontend Options

The FastAPI backend is configured to automatically serve the React frontend if it has been built. If not, it falls back to serving the Vanilla frontend.

#### Option A: Running with React Frontend (Recommended)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Build the production build:
   ```bash
   npm run build
   ```
4. Start the backend (`uvicorn main:app --reload` from root). It will detect `frontend/dist` and serve the React build at `http://127.0.0.1:8000/`.
5. Alternatively, you can run the React frontend in development mode:
   ```bash
   npm run dev
   ```

#### Option B: Running with Vanilla Frontend
If `frontend/dist` is not present, running the backend server will serve the static files from the `static/` directory by default at `http://127.0.0.1:8000/`.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/api/students` | Get all students (supports query parameter `?search=`) |
| **POST** | `/api/students` | Add a new student |
| **DELETE** | `/api/students/{id}` | Delete a student by ID |
| **GET** | `/api/stats` | Retrieve dashboard stats (supports query parameters `?req_cgpa=` and `?req_skill=`) |
| **GET** | `/api/export` | Export the student data as a JSON file |
