# Eden University eCampus Portal

A student and admin management system for Eden University.

## Project Structure

### HTML Files
- **index.html** - Student login page
- **dashboard.html** - Student dashboard (home, results, finance views)
- **profile.html** - Student profile page
- **admin-login.html** - Admin login page
- **admin.html** - Admin dashboard for managing students

### JavaScript Files
- **script.js** - Client-side functionality for student pages (login, dashboard, profile)
  - Password toggle
  - Language dropdown
  - Dashboard view switching
  - Avatar dropdown navigation
  
- **admin-data.js** - Shared data management layer
  - Student CRUD operations
  - Authentication functions
  - Session management
  - LocalStorage operations
  
- **admin-script.js** - Admin dashboard functionality
  - Student list management
  - Add/Edit student forms
  - Profile photo upload
  - Results management

### CSS Files
- **styles.css** - All styling for the entire application
  - Login page styles
  - Dashboard styles
  - Profile page styles
  - Admin dashboard styles
  - Responsive design

### Assets
- **10001.jpg** - Login page background image
- **10003.png** - Eden University logo
- **2024061311.png** - Default student profile photo

## File Dependencies

### Student Pages
- `index.html` → `admin-data.js`, `script.js`, `styles.css`
- `dashboard.html` → `script.js`, `styles.css`
- `profile.html` → `script.js`, `styles.css`

### Admin Pages
- `admin-login.html` → `admin-data.js`, `styles.css`
- `admin.html` → `admin-data.js`, `admin-script.js`, `styles.css`

## Data Storage

All data is stored in browser's `localStorage`:
- **students** - Array of student objects
- **admin** - Admin account information
- **currentStudentId** - Session storage for logged-in student
- **adminLoggedIn** - Session storage for admin authentication

## Default Credentials

### Student Login
- **Username/Student ID:** `2024061311`
- **Password:** `#Sean2006`

### Admin Login
- **Username:** `Administrator`
- **Password:** `#Sean@7053`

## Features

### Student Features
- Login with student ID/email and password
- View dashboard with academic information
- View fee statement and payment history
- View academic results
- Manage profile information

### Admin Features
- Login to admin portal
- Add new students
- Edit student information
- Upload profile photos
- Manage student courses and results
- Set student passwords

## Browser Compatibility

- Modern browsers with localStorage support
- Material Icons (loaded from Google Fonts)
- Inter font family (loaded from Google Fonts)

