// Supabase Configuration
console.log('Admin-data.js loading...');
window.ADMIN_DATA_LOADED = true;
const SUPABASE_URL = 'https://uqeifgszsqtfcuscrexd.supabase.co';
const SUPABASE_KEY = 'sb_publishable_KO9_5LwsUO2tCYQsMKC8iA_Ur3Rj1SO';

// Initialize the Supabase client
let supabase;
try {
  supabase = (window.supabase && SUPABASE_URL !== 'YOUR_SUPABASE_URL')
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    : null;
} catch (err) {
  console.error('Supabase initialization failed:', err);
  supabase = null;
}

// Get all students
async function getAllStudents() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('fullName', { ascending: true });

    if (error) throw error;

    // Cache in localStorage for fallback
    localStorage.setItem('students', JSON.stringify(data));
    return data;
  } catch (err) {
    console.error('Error fetching students from Supabase:', err);
    return JSON.parse(localStorage.getItem('students') || '[]');
  }
}

// Get student by ID
async function getStudentById(id) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching student by ID:', err);
    return null;
  }
}

// Get student by email/username/studentId
async function getStudentByEmail(searchValue) {
  if (!supabase || !searchValue) return null;
  try {
    const val = searchValue.trim();
    // Search in email OR studentId
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`email.eq.${val},studentId.eq.${val}`)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Error fetching student by email/ID:', err);
    return null;
  }
}

// Add new student
async function addStudent(studentData) {
  if (!supabase) throw new Error('Supabase not initialized');
  try {
    const { data, error } = await supabase
      .from('students')
      .insert([{
        ...studentData,
        accountStatus: 'active',
        createdAt: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Error adding student to Supabase:', err);
    throw err;
  }
}

// Update student
async function updateStudent(id, updatedData) {
  if (!supabase) throw new Error('Supabase not initialized');
  try {
    const { data, error } = await supabase
      .from('students')
      .update(updatedData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.error('Error updating student in Supabase:', err);
    throw err;
  }
}

// Delete student
async function deleteStudent(id) {
  if (!supabase) throw new Error('Supabase not initialized');
  try {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Error deleting student from Supabase:', err);
    throw err;
  }
}

// Verify student login
async function verifyStudentLogin(email, password) {
  if (!email || !password) return null;
  const student = await getStudentByEmail(email);
  if (student && student.password && student.password.trim() === password.trim()) {
    return student;
  }
  return null;
}

// Session Management (Stays client-side in sessionStorage)
function getCurrentStudent() {
  const studentData = sessionStorage.getItem('currentStudentData');
  return studentData ? JSON.parse(studentData) : null;
}

async function refreshCurrentStudent() {
  const current = getCurrentStudent();
  if (current && current.id) {
    const updated = await getStudentById(current.id);
    if (updated) {
      setCurrentStudent(updated);
      return updated;
    }
  }
  return current;
}

function setCurrentStudent(student) {
  if (student) {
    sessionStorage.setItem('currentStudentId', student.id);
    sessionStorage.setItem('currentStudentData', JSON.stringify(student));
  } else {
    sessionStorage.removeItem('currentStudentId');
    sessionStorage.removeItem('currentStudentData');
  }
}

function logoutStudent() {
  sessionStorage.removeItem('currentStudentId');
  sessionStorage.removeItem('currentStudentData');
}

// Admin Management
function isAdminLoggedIn() {
  return sessionStorage.getItem('adminLoggedIn') === 'true';
}

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
}

async function getAdminAccount() {
  if (!supabase) return { username: 'Administrator', password: '#Sean@7053' };
  try {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
      // If table is empty, return default
      return { username: 'Administrator', password: '#Sean@7053' };
    }
    return data;
  } catch (err) {
    console.error('Error fetching admin account from Supabase:', err);
    return { username: 'Administrator', password: '#Sean@7053' };
  }
}

async function updateAdminAccount(newAdminData) {
  if (!supabase) throw new Error('Supabase not initialized');
  try {
    // Check if record exists
    const { data: existing } = await supabase.from('admin_settings').select('id').limit(1).maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('admin_settings')
        .update(newAdminData)
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('admin_settings')
        .insert([newAdminData]);
      if (error) throw error;
    }
    return { success: true };
  } catch (err) {
    console.error('Error updating admin account in Supabase:', err);
    throw err;
  }
}

// Optional: Fallback for initialize (Not strictly needed with Supabase)
async function initializeStudents() {
  return await getAllStudents();
}
