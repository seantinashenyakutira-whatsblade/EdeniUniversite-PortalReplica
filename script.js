document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  const toggle = document.getElementById("togglePass");
  const password = document.getElementById("password");

  if (toggle && password) {
    toggle.addEventListener("click", () => {
      const isHidden = password.type === "password";
      password.type = isHidden ? "text" : "password";
      toggle.textContent = isHidden ? "visibility_off" : "visibility";
    });
  }

  // Form submission is now handled in index.html inline script

  // Dropdown toggle functionality
  const dropdownToggle = document.getElementById("dropdownToggle");
  const dropdownMenu = document.getElementById("dropdownMenu");
  const dropdownItems = document.querySelectorAll(".dropdown-item");

  if (dropdownToggle && dropdownMenu) {
    // Toggle dropdown on button click
    dropdownToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = dropdownMenu.classList.contains("show");

      if (isOpen) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.classList.remove("active");
      } else {
        dropdownMenu.classList.add("show");
        dropdownToggle.classList.add("active");
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      const isClickInside = dropdownToggle.contains(e.target) || dropdownMenu.contains(e.target);
      if (!isClickInside) {
        dropdownMenu.classList.remove("show");
        dropdownToggle.classList.remove("active");
      }
    });

    // Handle dropdown item selection
    dropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const selectedText = item.textContent.trim();

        // Update toggle button text
        const toggleText = dropdownToggle.querySelector(".dropdown-text");
        if (toggleText) {
          toggleText.textContent = selectedText;
        }

        // Update active state
        dropdownItems.forEach((i) => i.classList.remove("active"));
        item.classList.add("active");

        // Close dropdown
        dropdownMenu.classList.remove("show");
        dropdownToggle.classList.remove("active");
      });
    });
  }

  // Dashboard view switcher
  const views = document.querySelectorAll(".view");
  const navLinks = document.querySelectorAll(".nav-link[data-target]");
  const quickItems = document.querySelectorAll(".quick-item[data-target]");

  function showView(targetId, activator) {
    if (!targetId) return;
    views.forEach((v) => v.classList.remove("visible"));
    const target = document.getElementById(targetId);
    if (target) target.classList.add("visible");
    navLinks.forEach((n) => n.classList.remove("active"));
    if (activator && activator.classList.contains("nav-link")) {
      activator.classList.add("active");
    } else {
      const linked = document.querySelector(`.nav-link[data-target="${targetId}"]`);
      if (linked) linked.classList.add("active");
    }

    // Reload data when switching views (to reflect admin changes)
    if (typeof loadDashboardData === 'function') {
      loadDashboardData().catch(err => console.error('Error loading dashboard data', err));
    }

    // Specifically update results view when it's shown
    if (targetId === 'resultsView' && typeof updateResultsView === 'function') {
      const student = typeof getCurrentStudent === 'function' ? getCurrentStudent() : null;
      if (student) {
        updateResultsView(student);
      }
    }
  }

  // Make showView globally accessible
  window.showView = showView;

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      showView(link.getAttribute("data-target"), link);
    });
  });

  quickItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      showView(item.getAttribute("data-target"));
    });
  });

  // Buttons with data-target (chips, etc.)
  const targetButtons = document.querySelectorAll("[data-target]:not(.nav-link):not(.quick-item)");
  targetButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      showView(btn.getAttribute("data-target"));
    });
  });

  // Avatar dropdown functionality
  const avatarDropdownToggle = document.getElementById("avatarDropdownToggle");
  const avatarDropdownMenu = document.getElementById("avatarDropdownMenu");
  const avatarDropdownItems = document.querySelectorAll(".avatar-dropdown-item");

  if (avatarDropdownToggle && avatarDropdownMenu) {
    // Toggle dropdown on button click
    avatarDropdownToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = avatarDropdownMenu.classList.contains("show");

      if (isOpen) {
        avatarDropdownMenu.classList.remove("show");
      } else {
        avatarDropdownMenu.classList.add("show");
      }
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", function (e) {
      const isClickInside = avatarDropdownToggle.contains(e.target) || avatarDropdownMenu.contains(e.target);
      if (!isClickInside) {
        avatarDropdownMenu.classList.remove("show");
      }
    });

    // Handle dropdown item clicks
    avatarDropdownItems.forEach((item) => {
      item.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();

        const itemText = item.querySelector("span:not(.material-icons)")?.textContent || "";

        if (itemText === "Logout") {
          // Clear session and redirect
          if (typeof logoutStudent === 'function') logoutStudent();
          window.location.href = "index.html";
        } else if (itemText === "Profile") {
          // Redirect to profile page
          window.location.href = "./profile.html";
        } else if (itemText === "Settings") {
          // Handle settings click (you can add navigation here)
          console.log("Settings clicked");
        }

        // Close dropdown
        avatarDropdownMenu.classList.remove("show");
      });
    });
  }

  // Sidebar Mobile Toggle
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const sidebarLinks = document.querySelectorAll(".sidebar .nav-link, .sidebar .signout-btn");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      if (sidebarOverlay) sidebarOverlay.classList.toggle("visible");
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      sidebarOverlay.classList.remove("visible");
    });
  }

  // Close sidebar after clicking a nav link on mobile
  sidebarLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        sidebar.classList.remove("open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("visible");
      }
    });
  });
});

// Listen for storage changes from other tabs/windows (e.g., admin updates students)
window.addEventListener('storage', function (e) {
  if (!e.key) return;
  if (e.key === 'students' || e.key === 'students_last_update' || e.key === 'adminAccount') {
    // If dashboard is present, refresh its data
    if (typeof loadDashboardData === 'function') {
      try { loadDashboardData(); } catch (err) { console.error('Error loading dashboard data on storage event', err); }
    }

    // Update profile page elements if present
    try {
      const student = (typeof getCurrentStudent === 'function') ? getCurrentStudent() : null;
      if (student) {
        const profileName = document.querySelector('.profile-name');
        if (profileName) profileName.textContent = student.fullName || '';
        const profileEmail = document.querySelector('.profile-email');
        if (profileEmail) profileEmail.textContent = student.email || '';
        const avatar = document.querySelector('.avatar-image, #dashboardAvatar');
        if (avatar) {
          if (student.profilePhoto) avatar.src = student.profilePhoto;
          else if (student.studentId) avatar.src = `./${student.studentId}.png`;
        }
      }
    } catch (err) {
      console.error('Error updating profile on storage event', err);
    }
  }
});

// Inline admin toggle and login handler on the student portal
document.addEventListener('DOMContentLoaded', function () {
  const inlineToggle = document.getElementById('inlineAdminToggle');
  const inlineBox = document.getElementById('inlineAdminBox');
  const inlineCancel = document.getElementById('inlineAdminCancel');
  const inlineForm = document.getElementById('inlineAdminForm');
  const toggleInlineAdminPass = document.getElementById('toggleInlineAdminPass');

  if (inlineToggle && inlineBox) {
    inlineToggle.addEventListener('click', function () {
      inlineBox.style.display = inlineBox.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (inlineCancel && inlineBox) {
    inlineCancel.addEventListener('click', function () {
      inlineBox.style.display = 'none';
    });
  }

  if (toggleInlineAdminPass) {
    toggleInlineAdminPass.addEventListener('click', function () {
      const p = document.getElementById('inlineAdminPassword');
      if (!p) return;
      const isHidden = p.type === 'password';
      p.type = isHidden ? 'text' : 'password';
      this.textContent = isHidden ? 'visibility_off' : 'visibility';
    });
  }

  if (inlineForm) {
    inlineForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const username = document.getElementById('inlineAdminUsername').value.trim();
      const password = document.getElementById('inlineAdminPassword').value;

      try {
        const adminAccount = typeof getAdminAccount === 'function' ? await getAdminAccount() : null;
        if (!adminAccount) {
          alert('Admin account not found. Please contact your administrator.');
          return;
        }
        if (username === adminAccount.username && password === adminAccount.password) {
          sessionStorage.setItem('adminLoggedIn', 'true');
          window.location.href = './admin.html';
        } else {
          alert('Invalid admin credentials.');
        }
      } catch (err) {
        console.error('Admin login error:', err);
        alert('An error occurred. Make sure the backend server is running.');
      }
    });
  }
});

