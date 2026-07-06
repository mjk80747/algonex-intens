// DOM Elements
const searchInput = document.getElementById('search-input');
const btnQuickAdd = document.getElementById('btn-quick-add');
const btnOpenForm = document.getElementById('btn-open-form');
const btnExportJson = document.getElementById('btn-export-json');
const studentModal = document.getElementById('student-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const btnCancel = document.getElementById('btn-cancel');
const studentForm = document.getElementById('student-form');
const jsonModal = document.getElementById('json-modal');
const jsonModalCloseBtn = document.getElementById('json-modal-close-btn');
const jsonCode = document.getElementById('json-code');
const btnCopyJson = document.getElementById('btn-copy-json');
const studentsGrid = document.getElementById('students-grid');
const resultsCount = document.getElementById('results-count');
const toast = document.getElementById('toast');

// Stats Elements
const statTotal = document.getElementById('stat-total');
const statTopper = document.getElementById('stat-topper');
const statTopperCgpa = document.getElementById('stat-topper-cgpa');
const statSkills = document.getElementById('stat-skills');
const statEligible = document.getElementById('stat-eligible');

// Eligibility Controls
const cgpaThreshold = document.getElementById('cgpa-threshold');
const cgpaThresholdVal = document.getElementById('cgpa-threshold-val');
const skillRequired = document.getElementById('skill-required');

// App State
let studentsList = [];
let allUniqueSkillsSet = new Set(["Python"]); // Default

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    fetchData();
    setupEventListeners();
});

// Setup Events
function setupEventListeners() {
    // Open / Close Add Student Modal
    const openModal = () => studentModal.classList.add('active');
    const closeModal = () => {
        studentModal.classList.remove('active');
        studentForm.reset();
    };
    btnQuickAdd.addEventListener('click', openModal);
    btnOpenForm.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
    });
    modalCloseBtn.addEventListener('click', closeModal);
    btnCancel.addEventListener('click', closeModal);

    // Form Submission
    studentForm.addEventListener('submit', handleFormSubmit);

    // Search Input Event
    searchInput.addEventListener('input', () => {
        renderStudents();
    });

    // Slider Event
    cgpaThreshold.addEventListener('input', (e) => {
        cgpaThresholdVal.textContent = parseFloat(e.target.value).toFixed(1);
        updateStats();
        renderStudents();
    });

    // Skill Selection Event
    skillRequired.addEventListener('change', () => {
        updateStats();
        renderStudents();
    });

    // Export JSON
    btnExportJson.addEventListener('click', (e) => {
        e.preventDefault();
        openJsonModal();
    });
    jsonModalCloseBtn.addEventListener('click', () => jsonModal.classList.remove('active'));

    // Copy JSON
    btnCopyJson.addEventListener('click', copyJsonToClipboard);
}

// Fetch Students & Stats from backend
async function fetchData() {
    try {
        const res = await fetch(`/api/students`);
        if (!res.ok) throw new Error("Failed to fetch students");
        studentsList = await res.json();
        
        await fetchStats();
        renderStudents();
    } catch (err) {
        console.error(err);
        showToast("Error loading data from API", true);
    }
}

// Fetch Stats from backend
async function fetchStats() {
    try {
        const threshold = cgpaThreshold.value;
        const reqSkill = skillRequired.value;
        const res = await fetch(`/api/stats?req_cgpa=${threshold}&req_skill=${encodeURIComponent(reqSkill)}`);
        if (!res.ok) throw new Error("Failed to fetch stats");
        const stats = await res.json();
        
        // Update dashboard values
        statTotal.textContent = stats.total_students;
        if (stats.topper) {
            statTopper.textContent = stats.topper.name;
            statTopperCgpa.textContent = stats.topper.cgpa.toFixed(1);
        } else {
            statTopper.textContent = "N/A";
            statTopperCgpa.textContent = "0.0";
        }
        statSkills.textContent = stats.unique_skills.length;
        statEligible.textContent = stats.eligible_count;

        // Repopulate skill dropdown
        const currentSelectedSkill = skillRequired.value;
        skillRequired.innerHTML = '';
        
        // Ensure "Python" is always present as a choice
        const skillsToDisplay = new Set(["Python", ...stats.unique_skills]);
        skillsToDisplay.forEach(skill => {
            const opt = document.createElement('option');
            opt.value = skill;
            opt.textContent = skill;
            if (skill === currentSelectedSkill) {
                opt.selected = true;
            }
            skillRequired.appendChild(opt);
        });
    } catch (err) {
        console.error(err);
    }
}

// Local stats recalculation for instant updates
function updateStats() {
    const threshold = parseFloat(cgpaThreshold.value);
    const reqSkill = skillRequired.value.toLowerCase();
    
    let eligibleCount = 0;
    studentsList.forEach(s => {
        const isEligible = s.cgpa >= threshold && s.skills.some(skill => skill.toLowerCase() === reqSkill);
        if (isEligible) eligibleCount++;
    });
    
    statEligible.textContent = eligibleCount;
}

// Render student cards dynamically
function renderStudents() {
    studentsGrid.innerHTML = '';
    const searchQuery = searchInput.value.toLowerCase();
    const threshold = parseFloat(cgpaThreshold.value);
    const reqSkill = skillRequired.value.toLowerCase();

    let filtered = studentsList.filter(s => {
        if (!searchQuery) return true;
        const nameMatch = s.name.toLowerCase().includes(searchQuery);
        const roleMatch = s.role.toLowerCase().includes(searchQuery);
        const skillMatch = s.skills.some(sk => sk.toLowerCase().includes(searchQuery));
        return nameMatch || roleMatch || skillMatch;
    });

    resultsCount.textContent = `Showing ${filtered.length} of ${studentsList.length} students`;

    if (filtered.length === 0) {
        studentsGrid.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
                <i class="fa-solid fa-user-slash" style="font-size: 48px; margin-bottom: 16px;"></i>
                <p>No students found matching your criteria</p>
            </div>
        `;
        return;
    }

    filtered.forEach(s => {
        const isEligible = s.cgpa >= threshold && s.skills.some(skill => skill.toLowerCase() === reqSkill);
        
        const card = document.createElement('div');
        card.className = 'student-card';
        card.innerHTML = `
            <div class="student-card-header">
                <div class="student-info">
                    <h3>${escapeHtml(s.name)}</h3>
                    <div class="student-role">${escapeHtml(s.role)}</div>
                </div>
                <div class="cgpa-display">${s.cgpa.toFixed(2)}</div>
            </div>
            
            <div class="student-id">
                <i class="fa-solid fa-id-card"></i> Student ID: [${s.student_id.join(', ')}]
            </div>

            <div>
                <div class="student-section-title">Projects</div>
                <div class="tag-container">
                    ${s.projects.map(p => `<span class="tag-project"><i class="fa-solid fa-code-fork"></i> ${escapeHtml(p)}</span>`).join('')}
                </div>
            </div>

            <div>
                <div class="student-section-title">Skills</div>
                <div class="tag-container">
                    ${s.skills.map(sk => `<span class="tag-skill">${escapeHtml(sk)}</span>`).join('')}
                </div>
            </div>

            <div class="card-footer">
                <span class="badge ${isEligible ? 'badge-success' : 'badge-danger'}">
                    <i class="fa-solid ${isEligible ? 'fa-check-circle' : 'fa-times-circle'}"></i>
                    ${isEligible ? 'Eligible' : 'Not Eligible'}
                </span>
                <button class="btn btn-danger btn-sm" onclick="deleteStudentProfile(${s.student_id[0]})" style="padding: 6px 12px; font-size: 12px;">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        studentsGrid.appendChild(card);
    });
}

// Handle Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('student-name').value.trim();
    const cgpa = parseFloat(document.getElementById('student-cgpa').value);
    const role = document.getElementById('student-role').value.trim();
    const proj1 = document.getElementById('project-1').value.trim();
    const proj2 = document.getElementById('project-2').value.trim();
    const skillsString = document.getElementById('student-skills').value.trim();

    const payload = {
        name,
        cgpa,
        role,
        projects: [proj1, proj2].filter(p => p !== ''),
        skills: skillsString.split(/\s+/).filter(s => s !== '')
    };

    try {
        const res = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save student profile");
        
        studentModal.classList.remove('active');
        studentForm.reset();
        showToast("Student Profile Saved Successfully!");
        
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast("Error saving profile", true);
    }
}

// Delete a Student profile
async function deleteStudentProfile(idVal) {
    if (!confirm("Are you sure you want to remove this student profile?")) return;
    try {
        const res = await fetch(`/api/students/${idVal}`, { method: 'DELETE' });
        if (!res.ok) throw new Error("Failed to delete student");
        
        showToast("Student profile deleted");
        await fetchData();
    } catch (err) {
        console.error(err);
        showToast("Error deleting profile", true);
    }
}

// Expose delete function globally for inline onclick handlers
window.deleteStudentProfile = deleteStudentProfile;

// Open Export JSON Modal
async function openJsonModal() {
    try {
        const res = await fetch('/api/export');
        if (!res.ok) throw new Error("Failed to export JSON data");
        const data = await res.json();
        
        // Pretty format the JSON-like structure
        jsonCode.textContent = JSON.stringify(data, null, 4);
        jsonModal.classList.add('active');
    } catch (err) {
        console.error(err);
        showToast("Error exporting JSON", true);
    }
}

// Copy JSON block to clipboard
function copyJsonToClipboard() {
    const text = jsonCode.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast("JSON copied to clipboard!");
    }).catch(err => {
        console.error("Copy failed", err);
    });
}

// Toast indicator helper
function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.backgroundColor = isError ? 'var(--accent-red)' : 'var(--accent-green)';
    toast.style.color = isError ? '#ffffff' : '#0b0f19';
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Basic HTML Sanitizer
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
