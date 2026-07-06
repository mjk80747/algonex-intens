import React, { useState, useEffect } from 'react';

function App() {
  // App States
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    total_students: 0,
    topper: null,
    unique_skills: [],
    eligible_count: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [cgpaThreshold, setCgpaThreshold] = useState(7.0);
  const [requiredSkill, setRequiredSkill] = useState('Python');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isJsonOpen, setIsJsonOpen] = useState(false);
  const [jsonExportContent, setJsonExportContent] = useState('');

  // Form input States
  const [formName, setFormName] = useState('');
  const [formCgpa, setFormCgpa] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formProj1, setFormProj1] = useState('');
  const [formProj2, setFormProj2] = useState('');
  const [formSkills, setFormSkills] = useState('');

  // Toast State
  const [toastMessage, setToastMessage] = useState('');
  const [toastError, setToastError] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchStudents();
  }, [searchQuery]);

  // Refetch stats when criteria changes
  useEffect(() => {
    fetchStats();
  }, [students, cgpaThreshold, requiredSkill]);

  const triggerToast = (msg, isErr = false) => {
    setToastMessage(msg);
    setToastError(isErr);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const fetchStudents = async () => {
    try {
      const url = searchQuery 
        ? `/api/students?search=${encodeURIComponent(searchQuery)}`
        : '/api/students';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch roster');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
      triggerToast('Error loading student profiles', true);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `/api/stats?req_cgpa=${cgpaThreshold}&req_skill=${encodeURIComponent(requiredSkill)}`
      );
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handle student creation
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formName.trim(),
      cgpa: parseFloat(formCgpa),
      role: formRole.trim(),
      projects: [formProj1.trim(), formProj2.trim()].filter(Boolean),
      skills: formSkills.split(/\s+/).filter(Boolean),
    };

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create student profile');
      triggerToast('Profile Saved Successfully!');
      setIsFormOpen(false);
      
      // Reset form
      setFormName('');
      setFormCgpa('');
      setFormRole('');
      setFormProj1('');
      setFormProj2('');
      setFormSkills('');

      // Refresh list
      fetchStudents();
    } catch (err) {
      console.error(err);
      triggerToast('Error saving profile', true);
    }
  };

  // Handle student deletion
  const handleDelete = async (idVal, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      const res = await fetch(`/api/students/${idVal}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete student');
      triggerToast('Student profile deleted');
      fetchStudents();
    } catch (err) {
      console.error(err);
      triggerToast('Error deleting profile', true);
    }
  };

  // Open JSON modal and fetch raw data
  const handleOpenJson = async () => {
    try {
      const res = await fetch('/api/export');
      if (!res.ok) throw new Error('Failed to export data');
      const data = await res.json();
      setJsonExportContent(JSON.stringify(data, null, 4));
      setIsJsonOpen(true);
    } catch (err) {
      console.error(err);
      triggerToast('Error exporting database', true);
    }
  };

  // Copy JSON content to clipboard
  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonExportContent)
      .then(() => triggerToast('JSON copied to clipboard!'))
      .catch((err) => console.error('Copy failed', err));
  };

  // Calculate unique list of skills for selector (including default "Python")
  const skillsForDropdown = Array.from(new Set(['Python', ...stats.unique_skills]));

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <i className="fa-solid fa-graduation-cap logo-icon"></i>
            <span className="logo-text">Algonex<span>Interns</span></span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button className="nav-item active">
            <i className="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </button>
          <button className="nav-item" onClick={() => setIsFormOpen(true)}>
            <i className="fa-solid fa-user-plus"></i>
            <span>Add Student</span>
          </button>
          <button className="nav-item" onClick={handleOpenJson}>
            <i className="fa-solid fa-code"></i>
            <span>Export JSON</span>
          </button>
        </nav>
        <div className="sidebar-footer">
          <p>System Version 1.0 (React)</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-search">
            <i className="fa-solid fa-magnifying-glass search-icon"></i>
            <input
              type="text"
              id="search-input"
              placeholder="Search by name, role, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <button className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              <i className="fa-solid fa-plus"></i> Add Student
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="dashboard-body">
          {/* Stats Cards */}
          <section className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper blue">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.total_students}</h3>
                <p>Total Students</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper gold">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.topper ? stats.topper.name : 'N/A'}</h3>
                <p>Topper (CGPA: {stats.topper ? stats.topper.cgpa.toFixed(1) : '0.0'})</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper purple">
                <i className="fa-solid fa-brain"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.unique_skills.length}</h3>
                <p>Unique Skills</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-wrapper green">
                <i className="fa-solid fa-user-check"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.eligible_count}</h3>
                <p>Eligible Interns</p>
              </div>
            </div>
          </section>

          {/* Controls Panel */}
          <section className="controls-panel card">
            <div className="panel-header">
              <h2><i className="fa-solid fa-sliders"></i> Eligibility & Filtering Settings</h2>
              <span className="badge badge-info">Live Status</span>
            </div>
            <div className="controls-grid">
              <div className="control-group">
                <label htmlFor="cgpa-threshold">
                  Min CGPA Threshold: <span>{cgpaThreshold.toFixed(1)}</span>
                </label>
                <input
                  type="range"
                  id="cgpa-threshold"
                  min="0"
                  max="10"
                  step="0.1"
                  value={cgpaThreshold}
                  onChange={(e) => setCgpaThreshold(parseFloat(e.target.value))}
                  className="slider"
                />
              </div>
              <div className="control-group">
                <label htmlFor="skill-required">Required Skill:</label>
                <select
                  id="skill-required"
                  value={requiredSkill}
                  onChange={(e) => setRequiredSkill(e.target.value)}
                  className="select-input"
                >
                  {skillsForDropdown.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Students Section */}
          <section className="students-section">
            <div className="section-header">
              <h2><i className="fa-solid fa-list-ul"></i> Student Roster</h2>
              <span className="results-count">
                Showing {students.length} of {students.length} students
              </span>
            </div>
            <div className="students-grid">
              {students.length === 0 ? (
                <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-user-slash" style={{ fontSize: '48px', marginBottom: '16px' }}></i>
                  <p>No students found matching your criteria</p>
                </div>
              ) : (
                students.map((s, index) => {
                  const isEligible =
                    s.cgpa >= cgpaThreshold &&
                    s.skills.some((sk) => sk.toLowerCase() === requiredSkill.toLowerCase());

                  return (
                    <div 
                      className="student-card" 
                      key={s.student_id[0]}
                      style={{ animationDelay: `${(index % 8) * 0.05}s` }}
                    >
                      <div className="student-card-header">
                        <div className="student-info">
                          <h3>{s.name}</h3>
                          <div className="student-role">{s.role}</div>
                        </div>
                        <div className="cgpa-display">{s.cgpa.toFixed(2)}</div>
                      </div>

                      <div className="student-id">
                        <i className="fa-solid fa-id-card"></i> Student ID: [{s.student_id.join(', ')}]
                      </div>

                      <div>
                        <div className="student-section-title">Projects</div>
                        <div className="tag-container">
                          {s.projects.map((proj) => (
                            <span className="tag-project" key={proj}>
                              <i className="fa-solid fa-code-fork"></i> {proj}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="student-section-title">Skills</div>
                        <div className="tag-container">
                          {s.skills.map((skill) => (
                            <span className="tag-skill" key={skill}>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="card-footer">
                        <span className={`badge ${isEligible ? 'badge-success' : 'badge-danger'}`}>
                          <i className={`fa-solid ${isEligible ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                          {isEligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s.student_id[0], s.name)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          <i className="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Student Form Modal */}
      <div className={`modal ${isFormOpen ? 'active' : ''}`}>
        <div className="modal-content card">
          <button className="modal-close" onClick={() => setIsFormOpen(false)}>&times;</button>
          <div className="modal-header">
            <h2>Add New Student Profile</h2>
            <p>Fill out the fields to add an intern to the database</p>
          </div>
          <form className="student-form" onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="student-name">Full Name</label>
              <input
                type="text"
                id="student-name"
                required
                placeholder="e.g. John Doe"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="student-cgpa">CGPA (0 - 10)</label>
                <input
                  type="number"
                  id="student-cgpa"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="e.g. 8.5"
                  value={formCgpa}
                  onChange={(e) => setFormCgpa(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="student-role">Target Role</label>
                <input
                  type="text"
                  id="student-role"
                  required
                  placeholder="e.g. Frontend Developer"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Projects (Add 2 projects)</label>
              <div className="projects-inputs">
                <input
                  type="text"
                  required
                  placeholder="Project 1 name"
                  value={formProj1}
                  onChange={(e) => setFormProj1(e.target.value)}
                />
                <input
                  type="text"
                  required
                  placeholder="Project 2 name"
                  value={formProj2}
                  onChange={(e) => setFormProj2(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="student-skills">Skills (space-separated)</label>
              <input
                type="text"
                id="student-skills"
                required
                placeholder="e.g. Python JavaScript React HTML CSS"
                value={formSkills}
                onChange={(e) => setFormSkills(e.target.value)}
              />
              <small className="form-help">Enter skills separated by space (e.g. Python SQL Docker)</small>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsFormOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      <div className={`modal ${isJsonOpen ? 'active' : ''}`}>
        <div className="modal-content card json-modal-content">
          <button className="modal-close" onClick={() => setIsJsonOpen(false)}>&times;</button>
          <div className="modal-header">
            <h2>Export Student Database (JSON-like Structure)</h2>
            <p>Raw serialization of all students in the registry</p>
          </div>
          <div className="json-actions">
            <button className="btn btn-secondary btn-sm" onClick={handleCopyJson}>
              <i className="fa-solid fa-copy"></i> Copy to Clipboard
            </button>
          </div>
          <pre className="json-code-block">
            <code id="json-code">{jsonExportContent}</code>
          </pre>
        </div>
      </div>

      {/* Toast Notification */}
      <div 
        className={`toast ${showToast ? 'show' : ''}`}
        style={{
          backgroundColor: toastError ? 'var(--accent-red)' : 'var(--accent-green)',
          color: toastError ? '#ffffff' : '#0b0f19'
        }}
      >
        {toastMessage}
      </div>
    </div>
  );
}

export default App;
