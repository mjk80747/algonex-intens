# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, Query
# pyrefly: ignore [missing-import]
from fastapi.staticfiles import StaticFiles
# pyrefly: ignore [missing-import]
from fastapi.responses import FileResponse
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import List, Tuple, Set, Optional
import os

app = FastAPI(title="Intern Management System API")
0
# Student Data Store (In-Memory)
# Pre-populated with some diverse sample data so the dashboard is beautiful on load
students = [
    {
        "name": "Jane Doe",
        "cgpa": 8.9,
        "role": "Frontend Developer",
        "student_id": (1, "ALG2026"),
        "projects": ["Portfolio Website", "Task Manager App"],
        "skills": {"Python", "JavaScript", "HTML", "CSS", "React"}
    },
    {
        "name": "John Smith",
        "cgpa": 6.8,
        "role": "Backend Engineer",
        "student_id": (2, "ALG2026"),
        "projects": ["E-commerce API", "Chat Server"],
        "skills": {"Java", "Spring Boot", "SQL"}
    },
    {
        "name": "Alice Johnson",
        "cgpa": 9.2,
        "role": "Data Scientist",
        "student_id": (3, "ALG2026"),
        "projects": ["Sales Forecasting Model", "Image Classifier"],
        "skills": {"Python", "Pandas", "Scikit-Learn", "SQL", "TensorFlow"}
    },
    {
        "name": "Bob Wilson",
        "cgpa": 7.5,
        "role": "Fullstack Developer",
        "student_id": (4, "ALG2026"),
        "projects": ["Blog Platform", "Realtime Whiteboard"],
        "skills": {"Python", "Django", "JavaScript", "Vue.js"}
    }
]

# Serializer helper to convert python internal types (set, tuple) to JSON safe types
def serialize_student(student):
    return {
        "name": student["name"],
        "cgpa": student["cgpa"],
        "role": student["role"],
        "student_id": list(student["student_id"]),
        "projects": list(student["projects"]),
        "skills": list(student["skills"])
    }

class StudentCreate(BaseModel):
    name: str = Field(..., example="Charlie Brown")
    cgpa: float = Field(..., example=8.2)
    role: str = Field(..., example="DevOps Engineer")
    projects: List[str] = Field(..., example=["CI/CD Pipeline", "Kubernetes Cluster"])
    skills: List[str] = Field(..., example=["Python", "Docker", "AWS"])

@app.get("/api/students")
def get_students(search: Optional[str] = None):
    results = []
    for s in students:
        if search:
            search_lower = search.lower()
            name_match = search_lower in s["name"].lower()
            role_match = search_lower in s["role"].lower()
            skills_match = any(search_lower in skill.lower() for skill in s["skills"])
            if not (name_match or role_match or skills_match):
                continue
        results.append(serialize_student(s))
    return results

@app.post("/api/students")
def add_student(student_data: StudentCreate):
    # Determine new auto-increment ID
    next_id = 1
    if students:
        next_id = max(s["student_id"][0] for s in students) + 1
    
    new_student = {
        "name": student_data.name,
        "cgpa": student_data.cgpa,
        "role": student_data.role,
        "student_id": (next_id, "ALG2026"),
        "projects": student_data.projects,
        "skills": set(student_data.skills)
    }
    students.append(new_student)
    return serialize_student(new_student)

@app.delete("/api/students/{id_val}")
def delete_student(id_val: int):
    global students
    for i, s in enumerate(students):
        if s["student_id"][0] == id_val:
            deleted = students.pop(i)
            return {"message": f"Student {deleted['name']} deleted successfully"}
    raise HTTPException(status_code=404, detail="Student not found")

@app.get("/api/stats")
def get_stats(req_cgpa: float = 7.0, req_skill: str = "Python"):
    if not students:
        return {
            "total_students": 0,
            "topper": None,
            "unique_skills": [],
            "eligible_count": 0
        }
    
    # 1. Count total students
    total_students = len(students)
    
    # 2. Find topper (highest CGPA)
    topper = max(students, key=lambda s: s["cgpa"])
    
    # 3. Unique skills
    all_skills = set()
    for s in students:
        all_skills.update(s["skills"])
    
    # Eligibility calculation
    eligible_count = sum(1 for s in students if s["cgpa"] >= req_cgpa and req_skill.lower() in [sk.lower() for sk in s["skills"]])
    
    return {
        "total_students": total_students,
        "topper": serialize_student(topper),
        "unique_skills": sorted(list(all_skills)),
        "eligible_count": eligible_count
    }

@app.get("/api/export")
def export_data():
    # Return raw list for easy copy/download
    return [serialize_student(s) for s in students]

# Serve React app static files
# We mount this at the root '/' so that index.html and compiled assets are served automatically.
# Make sure to mount this AFTER defining API routes so APIs take precedence.
frontend_path = os.path.join("frontend", "dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
else:
    # Fallback to old static directory if frontend is not built
    os.makedirs("static", exist_ok=True)
    app.mount("/static", StaticFiles(directory="static"), name="static")
    @app.get("/")
    def read_root():
        return FileResponse(os.path.join("static", "index.html"))

