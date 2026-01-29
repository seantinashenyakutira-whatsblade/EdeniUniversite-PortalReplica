// Check admin authentication
if (!isAdminLoggedIn()) {
  window.location.href = './admin_login.html';
}

// Initialize
document.addEventListener('DOMContentLoaded', async function () {
  await loadStudents();
  setupEventListeners();
});

// View Management
async function showView(viewName) {
  document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('visible'));
  document.getElementById(viewName + '-view').classList.add('visible');

  const viewNames = {
    'students': 'Students',
    'add-student': 'Add Student',
    'courses': 'Course Management',
    'results': 'Results Management',
    'finance': 'Fee Management',
    'settings': 'Settings'
  };
  document.getElementById('currentView').textContent = viewNames[viewName] || 'Admin';

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
  document.querySelector(`[data-view="${viewName}"]`)?.classList.add('active');

  if (viewName === 'students') {
    await loadStudents();
  } else if (viewName === 'add-student') {
    resetStudentForm();
  } else if (viewName === 'courses') {
    await loadCourses();
  } else if (viewName === 'results') {
    await loadResultsView();
  } else if (viewName === 'finance') {
    await loadFinanceView();
  }
}

// Navigation
document.querySelectorAll('[data-view]').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    showView(this.getAttribute('data-view'));
  });
});

// Load and display students
async function loadStudents() {
  const students = await getAllStudents();
  const tbody = document.getElementById('studentsTableBody');

  if (students.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No students found. Add your first student to get started.</td></tr>';
    return;
  }

  tbody.innerHTML = students.map(student => `
    <tr>
      <td>${escapeHtml(student.studentId || student.id)}</td>
      <td>${escapeHtml(student.fullName || 'N/A')}</td>
      <td>${escapeHtml(student.email || 'N/A')}</td>
      <td>${escapeHtml(student.program || 'N/A')}</td>
      <td>${escapeHtml(student.year || 'N/A')}</td>
      <td><span class="status-badge ${escapeHtml(student.accountStatus || 'active')}">${escapeHtml(student.accountStatus || 'active')}</span></td>
      <td>
        <button class="btn-icon" onclick="editStudent('${escapeHtml(student.id)}')" title="Edit">
          <span class="material-icons">edit</span>
        </button>
        <button class="btn-icon" onclick="deleteStudentConfirm('${escapeHtml(student.id)}')" title="Delete">
          <span class="material-icons">delete</span>
        </button>
      </td>
    </tr>
  `).join('');
}

// Student Form
function resetStudentForm() {
  document.getElementById('studentForm').reset();
  document.getElementById('studentId').value = '';
  document.getElementById('studentFormTitle').textContent = 'Add New Student';

  // Set default values for new students
  if (document.getElementById('registrationStatus')) {
    document.getElementById('registrationStatus').value = 'Registered';
  }
  if (document.getElementById('accommodation')) {
    document.getElementById('accommodation').value = 'NON-RESIDENT';
  }
  if (document.getElementById('studentSponsor')) {
    document.getElementById('studentSponsor').value = 'SELF';
  }
  if (document.getElementById('remark')) {
    document.getElementById('remark').value = 'NO COMMENT ADDED YET';
  }
  if (document.getElementById('academicSession')) {
    document.getElementById('academicSession').value = 'GER 2025';
  }

  document.getElementById('resultsContainer').innerHTML = `
    <div class="result-entry">
      <div class="form-grid">
        <div class="form-group">
          <label>Course</label>
          <input type="text" class="result-course" placeholder="Course name" />
        </div>
        <div class="form-group">
          <label>Grade</label>
          <input type="text" class="result-grade" placeholder="e.g., A, B, C" />
        </div>
        <div class="form-group">
          <label>Course Code</label>
          <input type="text" class="result-code" placeholder="e.g., ICT101" />
        </div>
        <div class="form-group">
          <label>&nbsp;</label>
          <button type="button" class="btn-ghost remove-result">Remove</button>
        </div>
      </div>
    </div>
  `;
  setupResultRemovers();
}

async function editStudent(studentId) {
  const student = await getStudentById(studentId);
  if (!student) return;

  await showView('add-student');
  document.getElementById('studentFormTitle').textContent = 'Edit Student';
  document.getElementById('studentId').value = student.id;
  document.getElementById('fullName').value = student.fullName || '';
  document.getElementById('email').value = student.email || '';
  document.getElementById('phone').value = student.phone || '';
  document.getElementById('studentIdInput').value = student.studentId || '';
  document.getElementById('school').value = student.school || '';
  document.getElementById('program').value = student.program || '';
  document.getElementById('year').value = student.year || '';
  document.getElementById('academicSession').value = student.academicSession || '';
  document.getElementById('registrationStatus').value = student.registrationStatus || 'Registered';
  document.getElementById('studentSponsor').value = student.studentSponsor || '';
  document.getElementById('accommodation').value = student.accommodation || 'NON-RESIDENT';
  document.getElementById('remark').value = student.remark || '';
  document.getElementById('courses').value = student.courses ? student.courses.join(', ') : '';
  document.getElementById('password').required = false;
  document.getElementById('confirmPassword').required = false;

  // Load results
  if (student.results && student.results.length > 0) {
    document.getElementById('resultsContainer').innerHTML = student.results.map(result => `
      <div class="result-entry">
        <div class="form-grid">
          <div class="form-group">
            <label>Course Code</label>
            <input type="text" class="result-code" value="${escapeHtml(result.courseCode || '')}" placeholder="e.g., ICT101" />
          </div>
          <div class="form-group">
            <label>Course</label>
            <input type="text" class="result-course" value="${escapeHtml(result.course || '')}" placeholder="Course name" />
          </div>
          <div class="form-group">
            <label>Grade</label>
            <input type="text" class="result-grade" value="${escapeHtml(result.grade || '')}" placeholder="e.g., A, B, C" />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="button" class="btn-ghost remove-result">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  } else {
    resetStudentForm();
  }
  setupResultRemovers();
}

function addResultEntry() {
  const container = document.getElementById('resultsContainer');
  const entry = document.createElement('div');
  entry.className = 'result-entry';
  entry.innerHTML = `
    <div class="form-grid">
      <div class="form-group">
        <label>Course</label>
        <input type="text" class="result-course" placeholder="Course name" />
      </div>
      <div class="form-group">
        <label>Grade</label>
        <input type="text" class="result-grade" placeholder="e.g., A, B, C" />
      </div>
      <div class="form-group">
        <label>Course Code</label>
        <input type="text" class="result-code" placeholder="e.g., ICT101" />
      </div>
      <div class="form-group">
        <label>&nbsp;</label>
        <button type="button" class="btn-ghost remove-result">Remove</button>
      </div>
    </div>
  `;
  container.appendChild(entry);
  setupResultRemovers();
}

function setupResultRemovers() {
  document.querySelectorAll('.remove-result').forEach(btn => {
    btn.addEventListener('click', function () {
      if (document.querySelectorAll('.result-entry').length > 1) {
        this.closest('.result-entry').remove();
      } else {
        alert('At least one result entry is required');
      }
    });
  });
}

// Handle form submission
document.getElementById('studentForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const studentId = document.getElementById('studentId').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match!');
    return;
  }

  // Collect results
  const results = [];
  document.querySelectorAll('.result-entry').forEach(entry => {
    const course = entry.querySelector('.result-course').value;
    const grade = entry.querySelector('.result-grade').value;
    const courseCode = entry.querySelector('.result-code') ? entry.querySelector('.result-code').value : '';
    if (course || grade || courseCode) {
      results.push({ course, courseCode, grade });
    }
  });

  // Collect courses
  const coursesInput = document.getElementById('courses').value;
  const courses = coursesInput ? coursesInput.split(',').map(c => c.trim()).filter(c => c) : [];

  const studentData = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    studentId: formData.get('studentIdInput'),
    school: formData.get('school'),
    program: formData.get('program'),
    year: formData.get('year'),
    academicSession: formData.get('academicSession'),
    registrationStatus: formData.get('registrationStatus'),
    studentSponsor: formData.get('studentSponsor'),
    accommodation: formData.get('accommodation'),
    remark: formData.get('remark'),
    courses: courses,
    results: results,
    password: password || undefined
  };

  // Handle profile photo
  const photoInput = document.getElementById('profilePhoto');
  if (photoInput.files.length > 0) {
    const file = photoInput.files[0];
    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        studentData.profilePhoto = e.target.result;
        await saveStudent(studentId, studentData);
      } catch (err) {
        console.error('Error saving student with photo:', err);
        alert('Failed to save student: ' + err.message);
      }
    };
    reader.readAsDataURL(file);
  } else {
    try {
      if (studentId) {
        const existing = await getStudentById(studentId);
        if (existing && existing.profilePhoto) {
          studentData.profilePhoto = existing.profilePhoto;
        }
      }
      await saveStudent(studentId, studentData);
    } catch (err) {
      console.error('Error saving student:', err);
      alert('Failed to save student: ' + err.message);
    }
  }
}
});

async function saveStudent(studentId, studentData) {
  try {
    if (studentId) {
      // Update existing
      const existing = await getStudentById(studentId);
      if (existing && existing.password && !studentData.password) {
        studentData.password = existing.password; // Keep existing password if not changed
      }
      await updateStudent(studentId, studentData);
      alert('Student updated successfully!');
    } else {
      // Add new
      if (!studentData.password) {
        alert('Password is required for new students!');
        return;
      }
      // Ensure results and courses are initialized
      if (!studentData.results) studentData.results = [];
      if (!studentData.courses) studentData.courses = [];

      await addStudent(studentData);
      alert('Student added successfully!');
    }
    await showView('students');
  } catch (err) {
    console.error('Save operation failed:', err);
    throw err; // Propagate to caller for alert
  }
}

// Delete student
async function deleteStudentConfirm(studentId) {
  if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
    await deleteStudent(studentId);
    await loadStudents();
    alert('Student deleted successfully!');
  }
}

// Admin password change
document.getElementById('adminPasswordForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmNewPassword = document.getElementById('confirmNewPassword').value;

  const adminAccount = await getAdminAccount();

  if (currentPassword !== adminAccount.password) {
    alert('Current password is incorrect!');
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert('New passwords do not match!');
    return;
  }

  adminAccount.password = newPassword;
  await updateAdminAccount(adminAccount);
  alert('Password updated successfully!');
  this.reset();
});

// Logout
document.getElementById('adminLogout').addEventListener('click', function (e) {
  e.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    logoutAdmin();
    window.location.href = './admin_login.html';
  }
});

// Setup event listeners
function setupEventListeners() {
  setupResultRemovers();
}

// Course Management Functions
async function loadCourses() {
  const students = await getAllStudents();
  const allCourses = new Map();

  // Extract courses from all students
  students.forEach(student => {
    if (student.courses && Array.isArray(student.courses)) {
      student.courses.forEach(courseName => {
        if (!allCourses.has(courseName)) {
          allCourses.set(courseName, {
            name: courseName,
            code: courseName.substring(0, 6).toUpperCase(),
            program: student.program || 'N/A',
            year: student.year || 'N/A',
            students: []
          });
        }
        allCourses.get(courseName).students.push(student.fullName);
      });
    }
  });

  const tbody = document.getElementById('coursesTableBody');
  if (allCourses.size === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No courses found. Courses are added when students are enrolled.</td></tr>';
    return;
  }

  tbody.innerHTML = Array.from(allCourses.values()).map(course => `
    <tr>
      <td>${escapeHtml(course.code)}</td>
      <td>${escapeHtml(course.name)}</td>
      <td>${escapeHtml(course.program)}</td>
      <td>Year ${escapeHtml(course.year)}</td>
      <td>3</td>
      <td>${escapeHtml(course.students.length)}</td>
      <td>
        <button class="btn-icon" onclick="editCourse('${escapeHtml(course.name)}')" title="Edit">
          <span class="material-icons">edit</span>
        </button>
        <button class="btn-icon" onclick="viewCourseStudents('${escapeHtml(course.name)}')" title="View Students">
          <span class="material-icons">people</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function showAddCourseForm() {
  alert('Course management: Courses are automatically created when students are enrolled. To add a course, edit a student and add the course to their enrollment.');
}

function editCourse(courseName) {
  alert(`Edit course: ${courseName}\n\nTo modify course details, edit the students enrolled in this course.`);
}

function viewCourseStudents(courseName) {
  const students = getAllStudents();
  const enrolledStudents = students.filter(s => s.courses && s.courses.includes(courseName));

  if (enrolledStudents.length === 0) {
    alert('No students enrolled in this course.');
    return;
  }

  const studentList = enrolledStudents.map(s => `- ${s.fullName} (${s.studentId})`).join('\n');
  alert(`Students enrolled in ${courseName}:\n\n${studentList}`);
}

// Results Management Functions
async function loadResultsView() {
  const students = await getAllStudents();
  const select = document.getElementById('resultStudentSelect');

  select.innerHTML = '<option value="">-- Select Student --</option>' +
    students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.fullName)} (${escapeHtml(s.studentId)})</option>`).join('');
}

async function loadStudentResults() {
  const studentId = document.getElementById('resultStudentSelect').value;
  if (!studentId) {
    document.getElementById('studentResultsContainer').innerHTML =
      '<div class="empty-state" style="text-align: center; padding: 40px; color: var(--muted);"><p>Select a student to view their results</p></div>';
    return;
  }

  const student = await getStudentById(studentId);
  if (!student) return;

  const container = document.getElementById('studentResultsContainer');

  if (!student.results || student.results.length === 0) {
    container.innerHTML = `
      <div class="card" style="padding: 24px;">
        <h3>${escapeHtml(student.fullName)} - Academic Results</h3>
        <p style="color: var(--muted); margin-top: 16px;">No results recorded yet.</p>
        <button class="btn-primary" onclick="addResultToStudent('${escapeHtml(studentId)}')" style="margin-top: 16px;">
          <span class="material-icons">add</span>
          Add Result
        </button>
      </div>
    `;
    return;
  }

  const totalScore2 = student.results.reduce((sum, r) => {
    if (r && r.score !== undefined && r.score !== null && r.score !== '') return sum + (parseFloat(r.score) || 0);
    return sum + (getScoreFromGrade(r.grade) || 0);
  }, 0);
  const averageScore = totalScore2 / student.results.length;
  const gpa = (averageScore / 25).toFixed(2);

  const passedCourses = student.results.filter(r => {
    const grade = r.grade || (r.score ? getGradeFromScore(parseFloat(r.score)) : null);
    return (grade || 'F').toUpperCase() !== 'F';
  }).length;
  const credits = student.results.length * 3;

  container.innerHTML = `
    <div class="card" style="padding: 24px; margin-bottom: 24px;">
      <h3>${student.fullName} - Academic Results</h3>
      <p style="color: var(--muted); margin-top: 8px;">Student ID: ${student.studentId}</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 24px;">
        <div>
          <div style="color: var(--muted); font-size: 14px;">Total Courses Passed</div>
            <div style="font-size: 24px; font-weight: 600;">${escapeHtml(passedCourses)} / ${escapeHtml(student.results.length)}</div>
        </div>
        <div>
          <div style="color: var(--muted); font-size: 14px;">Credits (Earned/Attempted)</div>
            <div style="font-size: 24px; font-weight: 600;">${escapeHtml(credits)} / ${escapeHtml(credits)}</div>
        </div>
        <div>
          <div style="color: var(--muted); font-size: 14px;">Average Score</div>
            <div style="font-size: 24px; font-weight: 600;">${escapeHtml(averageScore.toFixed(2))}%</div>
        </div>
        <div>
          <div style="color: var(--muted); font-size: 14px;">Overall GPA</div>
            <div style="font-size: 24px; font-weight: 600;">${escapeHtml(gpa)}</div>
        </div>
      </div>
    </div>
    
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3>Academic Year: 2025 - 2026</h3>
        <button class="btn-primary" onclick="addResultToStudent('${studentId}')">
          <span class="material-icons">add</span>
          Add Result
        </button>
      </div>
      <table class="admin-table">
        <thead>
          <tr>
            <th>Course Code</th>
            <th>Course Name</th>
            <th>Grade</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${student.results.map((result, index) => {
    const grade = result.grade || (result.score ? getGradeFromScore(parseFloat(result.score)) : 'N/A');
    const isPass = ['A', 'B', 'C', 'D'].includes((grade || '').toUpperCase());
    const status = isPass ? 'PASS' : 'FAIL';
    const statusClass = isPass ? 'active' : 'inactive';
    const gradeClass = getGradeClass(grade);
    const courseCode = result.courseCode || generateCourseCode(result.course, index);

    return `
              <tr>
                <td>${escapeHtml(courseCode)}</td>
                <td>${escapeHtml(result.course || 'N/A')}</td>
                <td><span class="status-badge ${gradeClass}">${escapeHtml(grade)}</span></td>
                <td>1</td>
                <td><span class="status-badge ${statusClass}">${status}</span></td>
                <td>
                  <button class="btn-icon" onclick="editResult('${studentId}', ${index})" title="Edit">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-icon" onclick="deleteResult('${studentId}', ${index})" title="Delete">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function addResultToStudent(studentId) {
  const course = prompt('Enter course name:');
  if (!course) return;

  const courseCode = prompt('Enter course code (optional, e.g., ICT101):') || '';
  const grade = prompt('Enter grade (A, B, C, D, F):');
  if (!grade) return;

  const student = await getStudentById(studentId);
  if (!student) return;

  if (!student.results) student.results = [];
  student.results.push({ course, courseCode: courseCode || undefined, grade });

  await updateStudent(studentId, { results: student.results });
  await loadStudentResults();
  alert('Result added successfully!');
}

async function editResult(studentId, index) {
  const student = await getStudentById(studentId);
  if (!student || !student.results || !student.results[index]) return;

  const result = student.results[index];
  const course = prompt('Enter course name:', result.course || '');
  if (!course) return;

  const courseCode = prompt('Enter course code (optional):', result.courseCode || '') || '';

  let grade = prompt('Enter grade (A, B, C, D, F):', result.grade || '');
  if (!grade) grade = result.grade || '';

  student.results[index] = {
    course,
    courseCode: courseCode || undefined,
    grade
  };
  await updateStudent(studentId, { results: student.results });
  await loadStudentResults();
  alert('Result updated successfully!');
}

async function deleteResult(studentId, index) {
  if (!confirm('Are you sure you want to delete this result?')) return;

  const student = await getStudentById(studentId);
  if (!student || !student.results) return;

  student.results.splice(index, 1);
  await updateStudent(studentId, { results: student.results });
  await loadStudentResults();
  alert('Result deleted successfully!');
}

// Finance Management Functions
async function loadFinanceView() {
  const students = await getAllStudents();
  const select = document.getElementById('financeStudentSelect');

  select.innerHTML = '<option value="">-- Select Student --</option>' +
    students.map(s => `<option value="${escapeHtml(s.id)}">${escapeHtml(s.fullName)} (${escapeHtml(s.studentId)})</option>`).join('');
}

async function loadStudentFinance() {
  const studentId = document.getElementById('financeStudentSelect').value;
  const academicYear = document.getElementById('financeAcademicYear').value;

  if (!studentId) {
    document.getElementById('studentFinanceContainer').innerHTML =
      '<div class="empty-state" style="text-align: center; padding: 40px; color: var(--muted);"><p>Select a student to manage their fees</p></div>';
    return;
  }

  const student = await getStudentById(studentId);
  if (!student) return;

  // Get or initialize finance data
  let finance = student.finance || {
    totalFees: 15780.00,
    amountPaid: 10147.00,
    balance: 5633.00,
    transactions: []
  };

  const container = document.getElementById('studentFinanceContainer');

  const paidPercentage = ((finance.amountPaid / (finance.totalFees || 0.01)) * 100).toFixed(1);

  container.innerHTML = `
    <div class="finance-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-bottom: 24px;">
      <div class="card" style="padding: 24px;">
        <div style="color: var(--muted); font-size: 14px; margin-bottom: 8px;">Outstanding Balance</div>
        <div style="font-size: 32px; font-weight: 700; color: ${finance.balance > 0 ? '#ef4444' : '#22c55e'};">
          ZMW ${finance.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style="margin-top: 16px;">
          <span class="status-badge ${finance.balance > 0 ? 'inactive' : 'active'}">
            ${finance.balance > 0 ? 'Payment Required' : 'Paid'}
          </span>
        </div>
      </div>
      
      <div class="card" style="padding: 24px;">
        <h3 style="margin-bottom: 16px;">Payment Summary</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--muted);">Total Fees:</span>
          <strong>ZMW ${finance.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: var(--muted);">Amount Paid:</span>
          <strong>ZMW ${finance.amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
          <span style="color: var(--muted);">Balance:</span>
          <strong style="color: ${finance.balance > 0 ? '#ef4444' : '#22c55e'};">ZMW ${finance.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>
        </div>
        <div style="background: #f3f4f6; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="background: #22c55e; height: 100%; width: ${paidPercentage}%;"></div>
        </div>
        <div style="text-align: center; margin-top: 8px; color: var(--muted); font-size: 14px;">
          ${paidPercentage}% Paid
        </div>
      </div>
    </div>
    
    <div class="card" style="padding: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3>Fee Management</h3>
        <button class="btn-primary" onclick="addPayment('${studentId}')">
          <span class="material-icons">add</span>
          Record Payment
        </button>
      </div>
      
      <div class="form-section">
        <div class="form-grid">
          <div class="form-group">
            <label>Total Fees (ZMW)</label>
            <input type="number" id="totalFeesInput" value="${finance.totalFees}" step="0.01" />
          </div>
          <div class="form-group">
            <label>Amount Paid (ZMW)</label>
            <input type="number" id="amountPaidInput" value="${finance.amountPaid}" step="0.01" />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn-primary" onclick="updateFinance('${studentId}')">Update Fees</button>
          </div>
        </div>
      </div>
      
      <div style="margin-top: 24px;">
        <h4>Payment History</h4>
        ${finance.transactions && finance.transactions.length > 0 ? `
          <table class="admin-table" style="margin-top: 16px;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              ${finance.transactions.map(t => `
                <tr>
                  <td>${escapeHtml(new Date(t.date).toLocaleDateString())}</td>
                  <td>${escapeHtml(t.reference || 'N/A')}</td>
                  <td>ZMW ${escapeHtml(parseFloat(t.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }))}</td>
                  <td><span class="status-badge active">${t.type || 'Payment'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : '<p style="color: var(--muted); margin-top: 16px;">No payment history recorded.</p>'}
      </div>
    </div>
  `;
}

async function updateFinance(studentId) {
  const totalFees = parseFloat(document.getElementById('totalFeesInput').value);
  const amountPaid = parseFloat(document.getElementById('amountPaidInput').value);

  if (isNaN(totalFees) || isNaN(amountPaid)) {
    alert('Please enter valid amounts');
    return;
  }

  const balance = totalFees - amountPaid;
  const student = await getStudentById(studentId);

  if (!student.finance) student.finance = { transactions: [] };

  student.finance.totalFees = totalFees;
  student.finance.amountPaid = amountPaid;
  student.finance.balance = balance;

  await updateStudent(studentId, { finance: student.finance });
  await loadStudentFinance();
  alert('Finance information updated successfully!');
}

async function addPayment(studentId) {
  const amount = prompt('Enter payment amount (ZMW):');
  if (!amount || isNaN(amount)) {
    alert('Invalid amount');
    return;
  }

  const reference = prompt('Enter transaction reference (optional):') || `TXN-${Date.now()}`;

  const student = await getStudentById(studentId);
  if (!student.finance) student.finance = { totalFees: 0, amountPaid: 0, balance: 0, transactions: [] };

  const paymentAmount = parseFloat(amount);
  student.finance.amountPaid = (student.finance.amountPaid || 0) + paymentAmount;
  student.finance.balance = (student.finance.totalFees || 0) - student.finance.amountPaid;

  if (!student.finance.transactions) student.finance.transactions = [];
  student.finance.transactions.push({
    date: new Date().toISOString(),
    reference: reference,
    amount: paymentAmount,
    type: 'Payment'
  });

  await updateStudent(studentId, { finance: student.finance });
  await loadStudentFinance();
  alert('Payment recorded successfully!');
}

