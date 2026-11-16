/* =========================================================
   STUDENT SKILL HUB — CORE APPLICATION SCRIPT
   Frontend-only prototype using localStorage for evaluation demo.
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Student Skill Hub initialized successfully.");

  // =======================================================
  // 1. REUSABLE STORAGE & SESSION UTILITIES
  // =======================================================
  const STORAGE = {
    users: "ssh_demo_users",
    current: "ssh_demo_current_user",
    skills: "ssh_demo_skills",
    goals: "ssh_demo_goals"
  };

  const read = (key, fallback) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.warn("Could not read saved data:", error);
      return fallback;
    }
  };

  const save = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Could not save data:", error);
    }
  };

  const currentUser = () => read(STORAGE.current, null);

  const setCurrentUser = (user) => {
    save(STORAGE.current, user);
  };

  const userKey = (type) => {
    const user = currentUser();
    return `${STORAGE[type]}_${user ? user.email.toLowerCase() : "guest"}`;
  };

  const getSkills = () => read(userKey("skills"), []);
  const setSkills = (items) => save(userKey("skills"), items);
  const getGoals = () => read(userKey("goals"), []);
  const setGoals = (items) => save(userKey("goals"), items);
  const PROJ_KEY = () => {
    const user = currentUser();
    return user ? `ssh_demo_projects_${user.email.toLowerCase()}` : null;
  };
  const getProjects = () => {
    const key = PROJ_KEY();
    return key ? read(key, []) : [];
  };
  const setProjects = (items) => {
    const key = PROJ_KEY();
    if (key) save(key, items);
  };

  const escapeHTML = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));

  const initials = (name) =>
    String(name || "Student")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase() || "ST";

  let toastTimer;
  function toast(message) {
    const element = document.getElementById("ssToast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => element.classList.remove("show"), 2600);
  }

  function setMessage(id, message, success = false) {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = message;
    element.classList.toggle("success", success);
  }

  // =======================================================
  // 2. PAGE ROUTE PROTECTION & REDIRECTS (TASK 4)
  // =======================================================
  const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const protectedPages = [
    "dashboard.html",
    "profile.html",
    "skills.html",
    "projects.html",
    "certificates.html",
    "achievements.html"
  ];

  const signedIn = currentUser();

  if (protectedPages.includes(page) && !signedIn) {
    sessionStorage.setItem("ssh_redirect_after_login", page);
    location.replace("login.html");
    return;
  }

  // =======================================================
  // 3. REUSABLE LOGOUT HANDLER (TASK 3)
  // =======================================================
  function handleLogout(event) {
    if (event) event.preventDefault();
    localStorage.removeItem(STORAGE.current);
    sessionStorage.removeItem("ssh_redirect_after_login");
    toast("Logged out successfully.");
    setTimeout(() => {
      location.href = "index.html";
    }, 150);
  }

  document.querySelectorAll("[data-logout], .logout-link").forEach((link) => {
    link.hidden = !signedIn;
    link.addEventListener("click", handleLogout);
  });

  // =======================================================
  // 4. NAVIGATION STATE & DYNAMIC AUTH LINKS (TASK 1)
  // =======================================================
  document.querySelectorAll("[data-nav]").forEach((link) => {
    const navTarget = link.dataset.nav;
    if (page === navTarget + ".html" || (page === "index.html" && navTarget === "index")) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll(".sidebar-nav .sidebar-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href && href.toLowerCase() === page) {
      link.classList.add("active");
    }
  });

  document.querySelectorAll("[data-auth-link]").forEach((link) => {
    link.hidden = !!signedIn;
  });

  // =======================================================
  // 5. DYNAMIC STUDENT IDENTITY (TASK 2)
  // =======================================================
  if (signedIn) {
    const userInitials = initials(signedIn.name);
    const firstName = signedIn.name.split(" ")[0] || "Student";

    const dashboardName = document.getElementById("dashboardName");
    if (dashboardName) {
      dashboardName.textContent = firstName;
    }

    const sidebarAvatar = document.querySelector(".sidebar-profile .sidebar-avatar");
    if (sidebarAvatar) {
      sidebarAvatar.textContent = userInitials;
    }

    const sidebarName = document.querySelector(".sidebar-profile strong");
    if (sidebarName) {
      sidebarName.textContent = signedIn.name;
    }

    const sidebarRole = document.querySelector(".sidebar-profile span");
    if (sidebarRole) {
      sidebarRole.textContent = signedIn.department || "Student";
    }

    const topbarAvatar = document.querySelector(".dashboard-topbar .topbar-avatar");
    if (topbarAvatar) {
      topbarAvatar.textContent = userInitials;
    }

    const certHeroStudentName = document.getElementById("certHeroName");
    if (certHeroStudentName) {
      certHeroStudentName.textContent = signedIn.name;
    }

    const studentQueryParam = new URLSearchParams(window.location.search).get("student");
    if (page === "public-profile.html" && !studentQueryParam) {
      const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      setText("publicTopbarName", signedIn.name);
      setText("publicName", signedIn.name);
      setText("publicFooterName", signedIn.name);
      setText("publicRole", signedIn.department ? signedIn.department + " Student" : "Student");
      setText("publicCollege", "🎓 Skillora Member");
      setText("publicFooterRole", signedIn.department || "Skillora Member");
      if (document.getElementById("publicBio") && signedIn.bio) {
        document.getElementById("publicBio").textContent = signedIn.bio;
      }

      const publicAvatar = document.getElementById("publicAvatar");
      if (publicAvatar) {
        const verified = publicAvatar.querySelector(".profile-verified");
        publicAvatar.textContent = userInitials;
        if (verified) publicAvatar.appendChild(verified);
      }

      // Populate skills
      const skillList = document.getElementById("publicSkillList");
      if (skillList) {
        const skills = getSkills();
        if (skills.length) {
          skillList.innerHTML = skills.slice(0, 6).map((s) => `
            <div class="public-skill">
              <div class="public-skill-header"><span>${escapeHTML(s.name)}</span><strong>${Number(s.progress)}%</strong></div>
              <div class="public-progress"><div style="width:${Number(s.progress)}%"></div></div>
            </div>`).join("");
        }
      }

      // Populate projects
      const projList = document.getElementById("publicProjectList");
      if (projList) {
        const projects = getProjects();
        if (projects.length) {
          projList.innerHTML = projects.slice(0, 2).map((p) => `
            <article class="public-project-card">
              <div class="project-icon purple-project">📋</div>
              <div class="public-project-content">
                <span>${escapeHTML(p.status)}</span>
                <h3>${escapeHTML(p.title)}</h3>
                <p>${escapeHTML(p.desc || "")}</p>
                <div class="project-tech">${(p.tech||"").split(",").filter(Boolean).map((t)=>`<span>${escapeHTML(t.trim())}</span>`).join("")}</div>
              </div>
            </article>`).join("");
        }
      }

      // Stats
      const u = currentUser();
      if (u) {
        const sk = read(`ssh_demo_skills_${u.email}`, []);
        const pr = read(`ssh_demo_projects_${u.email}`, []);
        const setText2 = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = String(val).padStart(2,"0"); };
        setText2("statSkillsCount", sk.length);
        setText2("statProjects", pr.length);
      }
    }
  }

  // =======================================================
  // 6. REGISTRATION WORKFLOW
  // =======================================================
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(registerForm);
      const name = String(form.get("name") || "").trim();
      const email = String(form.get("email") || "").trim().toLowerCase();
      const department = String(form.get("department") || "").trim();
      const password = String(form.get("password") || "");
      const confirmPassword = String(form.get("confirmPassword") || "");

      if (!name || !email || password.length < 6) {
        setMessage(
          "registerMessage",
          "Please complete the required fields. Password must be at least 6 characters."
        );
        return;
      }
      if (password !== confirmPassword) {
        setMessage("registerMessage", "Passwords do not match. Please try again.");
        document.getElementById("confirmPassword")?.focus();
        return;
      }

      const users = read(STORAGE.users, []);
      if (users.some((user) => user.email === email)) {
        setMessage(
          "registerMessage",
          "An account with this email already exists. Please log in."
        );
        return;
      }

      const newUser = { name, email, department, password, bio: "" };
      users.push(newUser);
      save(STORAGE.users, users);
      setCurrentUser({ name, email, department, bio: "" });
      toast("Account created successfully!");

      const redirect = sessionStorage.getItem("ssh_redirect_after_login") || "dashboard.html";
      sessionStorage.removeItem("ssh_redirect_after_login");
      location.href = redirect;
    });
  }

  // =======================================================
  // 7. LOGIN WORKFLOW
  // =======================================================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const email = String(new FormData(loginForm).get("email") || "").trim().toLowerCase();
      const password = String(new FormData(loginForm).get("password") || "");
      const users = read(STORAGE.users, []);
      const user = users.find(
        (item) => item.email === email && item.password === password
      );

      if (!user) {
        setMessage(
          "loginMessage",
          "Email or password is incorrect. Register first if you are new."
        );
        return;
      }

      setCurrentUser({
        name: user.name,
        email: user.email,
        department: user.department || "",
        bio: user.bio || ""
      });
      toast("Welcome back!");

      const redirect = sessionStorage.getItem("ssh_redirect_after_login") || "dashboard.html";
      sessionStorage.removeItem("ssh_redirect_after_login");
      location.href = redirect;
    });
  }

  // =======================================================
  // 8. PROFILE WORKFLOW (LOAD & UPDATE)
  // =======================================================
  const profileForm = document.getElementById("profileForm");
  if (profileForm) {
    const user = currentUser();
    const users = read(STORAGE.users, []);
    const fullUser = users.find((item) => user && item.email === user.email) || user || {};

    ["name", "email", "department", "bio"].forEach((field) => {
      const input = document.getElementById("profile" + field[0].toUpperCase() + field.slice(1));
      if (input) input.value = fullUser[field] || "";
    });

    const heading = document.getElementById("profileHeading");
    const emailText = document.getElementById("profileEmailText");
    const avatar = document.getElementById("profileAvatar");

    const refreshProfileHeader = () => {
      const name = document.getElementById("profileName")?.value || "Student";
      if (heading) heading.textContent = name;
      if (emailText) {
        emailText.textContent = document.getElementById("profileEmail")?.value || "Update your details below.";
      }
      if (avatar) avatar.textContent = initials(name);
    };

    refreshProfileHeader();
    profileForm.addEventListener("input", refreshProfileHeader);

    profileForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(profileForm);
      const updated = {
        name: String(form.get("name") || "").trim(),
        email: String(form.get("email") || "").trim().toLowerCase(),
        department: String(form.get("department") || "").trim(),
        bio: String(form.get("bio") || "").trim()
      };

      if (!updated.name || !updated.email) {
        setMessage("profileMessage", "Name and email are required.");
        return;
      }

      const storedUsers = read(STORAGE.users, []);
      const emailInUse = storedUsers.some(
        (item) => item.email === updated.email && item.email !== (user && user.email)
      );

      if (emailInUse) {
        setMessage("profileMessage", "That email address is already used by another account.");
        return;
      }

      const oldEmail = user && user.email;
      const index = storedUsers.findIndex((item) => item.email === oldEmail);
      if (index >= 0) {
        storedUsers[index] = { ...storedUsers[index], ...updated };
      } else {
        storedUsers.push(updated);
      }

      save(STORAGE.users, storedUsers);
      setCurrentUser(updated);

      if (oldEmail && oldEmail !== updated.email) {
        const oldSkillKey = `${STORAGE.skills}_${oldEmail}`;
        const oldGoalKey = `${STORAGE.goals}_${oldEmail}`;
        const oldSkills = localStorage.getItem(oldSkillKey);
        const oldGoals = localStorage.getItem(oldGoalKey);
        if (oldSkills) localStorage.setItem(`${STORAGE.skills}_${updated.email}`, oldSkills);
        if (oldGoals) localStorage.setItem(`${STORAGE.goals}_${updated.email}`, oldGoals);
        localStorage.removeItem(oldSkillKey);
        localStorage.removeItem(oldGoalKey);
      }

      refreshProfileHeader();
      setMessage("profileMessage", "Profile saved successfully.", true);
      toast("Profile updated.");
    });
  }

  // =======================================================
  // 9. SKILLS MANAGEMENT (CRUD & PROGRESS SLIDER)
  // =======================================================
  const skillForm = document.getElementById("skillForm");
  const skillsList = document.getElementById("skillsList");

  function renderSkills() {
    if (!skillsList) return;
    const skills = getSkills();
    const empty = document.getElementById("skillsEmpty");
    if (empty) empty.hidden = skills.length > 0;
    const count = document.getElementById("skillCount");
    if (count) count.textContent = `${skills.length} skill${skills.length === 1 ? "" : "s"}`;

    skillsList.innerHTML = skills.map((skill) => `
      <article class="ss-skill-card" data-skill-id="${escapeHTML(skill.id)}">
        <div class="ss-skill-top">
          <div><h3 class="ss-skill-name">${escapeHTML(skill.name)}</h3><div class="ss-skill-meta">${escapeHTML(skill.category)} · ${Number(skill.progress)}% complete</div></div>
          <div class="ss-skill-actions"><button class="ss-btn secondary small" type="button" data-edit-skill="${escapeHTML(skill.id)}">Edit name</button><button class="ss-btn danger small" type="button" data-delete-skill="${escapeHTML(skill.id)}">Delete</button></div>
        </div>
        <div class="ss-progress" aria-label="${Number(skill.progress)}% progress"><span style="width:${Math.max(0, Math.min(100, Number(skill.progress)))}%"></span></div>
        <div class="ss-skill-bottom"><label style="flex:1;font-size:13px;font-weight:700" for="progress-${escapeHTML(skill.id)}">Update progress <input id="progress-${escapeHTML(skill.id)}" data-progress-skill="${escapeHTML(skill.id)}" type="range" min="0" max="100" step="5" value="${Number(skill.progress)}" aria-label="Update ${escapeHTML(skill.name)} progress"></label><span class="ss-pill">${Number(skill.progress) === 100 ? "Completed 🎉" : Number(skill.progress) < 30 ? "Getting started" : Number(skill.progress) < 70 ? "In progress" : "Nearly there"}</span></div>
      </article>`).join("");
    updateDashboardStats();
  }

  if (skillForm) {
    skillForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const form = new FormData(skillForm);
      const name = String(form.get("name") || "").trim();
      const category = String(form.get("category") || "Other");
      const progress = Number(form.get("progress") || 0);

      if (!name) {
        setMessage("skillMessage", "Enter a skill name.");
        return;
      }
      const skills = getSkills();
      if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
        setMessage("skillMessage", "That skill is already in your list.");
        return;
      }

      skills.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        name,
        category,
        progress
      });

      setSkills(skills);
      skillForm.reset();
      const defaultSlider = document.getElementById("skillProgress");
      if (defaultSlider) defaultSlider.value = "50";
      setMessage("skillMessage", "Skill added. Keep making progress!", true);
      renderSkills();
      toast("Skill added successfully.");
    });
  }

  if (skillsList) {
    skillsList.addEventListener("input", (event) => {
      const range = event.target.closest("[data-progress-skill]");
      if (!range) return;
      const skills = getSkills();
      const skill = skills.find((item) => item.id === range.dataset.progressSkill);
      if (!skill) return;
      skill.progress = Number(range.value);
      setSkills(skills);

      const card = range.closest(".ss-skill-card");
      const meta = card?.querySelector(".ss-skill-meta");
      const bar = card?.querySelector(".ss-progress span");
      const pill = card?.querySelector(".ss-pill");
      if (meta) meta.textContent = `${skill.category} · ${skill.progress}% complete`;
      if (bar) bar.style.width = `${skill.progress}%`;
      if (pill) {
        pill.textContent =
          skill.progress === 100
            ? "Completed 🎉"
            : skill.progress < 30
            ? "Getting started"
            : skill.progress < 70
            ? "In progress"
            : "Nearly there";
      }
      updateDashboardStats();
    });

    skillsList.addEventListener("change", (event) => {
      if (event.target.matches("[data-progress-skill]")) toast("Progress saved.");
    });

    skillsList.addEventListener("click", (event) => {
      const edit = event.target.closest("[data-edit-skill]");
      const remove = event.target.closest("[data-delete-skill]");

      if (edit) {
        const skills = getSkills();
        const skill = skills.find((item) => item.id === edit.dataset.editSkill);
        if (!skill) return;
        const name = prompt("Update skill name:", skill.name);
        if (name === null) return;
        if (!name.trim()) {
          toast("Skill name cannot be empty.");
          return;
        }
        if (
          skills.some(
            (item) => item.id !== skill.id && item.name.toLowerCase() === name.trim().toLowerCase()
          )
        ) {
          toast("That skill already exists.");
          return;
        }
        skill.name = name.trim();
        setSkills(skills);
        renderSkills();
        toast("Skill updated.");
      }

      if (remove) {
        const skills = getSkills();
        const skill = skills.find((item) => item.id === remove.dataset.deleteSkill);
        if (skill && confirm(`Delete "${skill.name}" from your skills?`)) {
          setSkills(skills.filter((item) => item.id !== skill.id));
          renderSkills();
          toast("Skill deleted.");
        }
      }
    });

    renderSkills();
  }

  // =======================================================
  // 10. WEEKLY MISSIONS (CRUD)
  // =======================================================
  const goalForm = document.getElementById("goalForm");
  const goalList = document.getElementById("goalList");

  function renderGoals() {
    if (!goalList) return;
    const goals = getGoals();
    const empty = document.getElementById("goalsEmpty");
    if (empty) empty.hidden = goals.length > 0;

    goalList.innerHTML = goals.map((goal) => `
      <div class="ss-goal ${goal.done ? "done" : ""}">
        <input type="checkbox" data-goal-toggle="${escapeHTML(goal.id)}" ${goal.done ? "checked" : ""} aria-label="Mark ${escapeHTML(goal.text)} complete">
        <div class="ss-goal-text">${escapeHTML(goal.text)}<small>${goal.done ? "Completed — nice work!" : "One small step at a time"}</small></div>
        <button class="ss-btn danger small" type="button" data-goal-delete="${escapeHTML(goal.id)}" aria-label="Delete mission">×</button>
      </div>`).join("");
    updateDashboardStats();
  }

  if (goalForm) {
    goalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = document.getElementById("goalInput");
      const text = input.value.trim();
      if (!text) return;
      const goals = getGoals();
      goals.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`,
        text,
        done: false
      });
      setGoals(goals);
      input.value = "";
      renderGoals();
      toast("Weekly mission added.");
    });
  }

  if (goalList) {
    goalList.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-goal-toggle]");
      if (!checkbox) return;
      const goals = getGoals();
      const goal = goals.find((item) => item.id === checkbox.dataset.goalToggle);
      if (goal) goal.done = checkbox.checked;
      setGoals(goals);
      renderGoals();
      toast(checkbox.checked ? "Mission completed. Great job!" : "Mission moved back to pending.");
    });

    goalList.addEventListener("click", (event) => {
      const button = event.target.closest("[data-goal-delete]");
      if (!button) return;
      setGoals(getGoals().filter((goal) => goal.id !== button.dataset.goalDelete));
      renderGoals();
      toast("Mission deleted.");
    });

    renderGoals();
  }

  // =======================================================
  // 11. DASHBOARD STATS & RECENT SKILLS
  // =======================================================
  function updateDashboardStats() {
    const skills = getSkills();
    const goals = getGoals();
    const avg = skills.length
      ? Math.round(
          skills.reduce((sum, skill) => sum + Number(skill.progress || 0), 0) / skills.length
        )
      : 0;

    const statSkills = document.getElementById("statSkills");
    const statProgress = document.getElementById("statProgress");
    const progressBar = document.getElementById("averageProgressBar");
    const statGoals = document.getElementById("statGoals");

    if (statSkills) statSkills.textContent = skills.length;
    if (statProgress) statProgress.textContent = `${avg}%`;
    if (progressBar) progressBar.style.width = `${avg}%`;
    if (statGoals) {
      statGoals.textContent = `${goals.filter((goal) => goal.done).length}/${goals.length}`;
    }

    const list = document.getElementById("dashboardSkills");
    const empty = document.getElementById("dashboardSkillsEmpty");
    if (list) {
      if (empty) empty.hidden = skills.length > 0;
      list.innerHTML = skills.slice(0, 4).map((skill) => `
        <div class="ss-skill-card">
          <div class="ss-skill-top"><div><h3 class="ss-skill-name">${escapeHTML(skill.name)}</h3><div class="ss-skill-meta">${escapeHTML(skill.category)}</div></div><span class="ss-pill">${Number(skill.progress)}%</span></div>
          <div class="ss-progress"><span style="width:${Math.max(0, Math.min(100, Number(skill.progress)))}%"></span></div>
        </div>`).join("");
    }
  }

  updateDashboardStats();

  // =======================================================
  // 12. REUSABLE SEARCH AND BUTTON FILTERS
  // =======================================================
  function setupButtonFilters(config) {
    const cards = document.querySelectorAll(config.cards);
    const filterButtons = document.querySelectorAll(config.filters);
    const searchInput = config.search ? document.querySelector(config.search) : null;
    const searchButton = config.searchButton ? document.querySelector(config.searchButton) : null;

    if (!cards.length) return;

    let selectedFilter = "all";

    function updateCards() {
      const searchText = searchInput ? searchInput.value.trim().toLowerCase() : "";

      cards.forEach((card) => {
        const cardText = card.textContent.toLowerCase();
        const category = config.getCategory ? config.getCategory(card).toLowerCase() : cardText;

        const matchesSearch = !searchText || cardText.includes(searchText);

        let matchesFilter = selectedFilter === "all";
        if (!matchesFilter && config.matchesFilter) {
          matchesFilter = config.matchesFilter(card, selectedFilter, category, cardText);
        } else if (!matchesFilter) {
          matchesFilter = category.includes(selectedFilter) || cardText.includes(selectedFilter);
        }

        card.hidden = !(matchesSearch && matchesFilter);
      });
    }

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((item) => {
          item.classList.remove(
            "active",
            "filter-active",
            "certificate-filter-active",
            "achievement-filter-active"
          );
        });

        button.classList.add(config.activeClass);
        selectedFilter = button.textContent.trim().toLowerCase();

        if (selectedFilter === "all students" || selectedFilter === "all projects") {
          selectedFilter = "all";
        }

        updateCards();
      });
    });

    if (searchInput) searchInput.addEventListener("input", updateCards);
    if (searchButton) searchButton.addEventListener("click", updateCards);

    updateCards();
  }

  setupButtonFilters({
    search: ".student-search-box input",
    searchButton: ".student-search-box button",
    filters: ".student-filters .filter-button",
    cards: ".student-card",
    activeClass: "active"
  });

  setupButtonFilters({
    filters: ".project-filter button",
    cards: ".project-card",
    activeClass: "filter-active",
    getCategory: (card) => {
      const status = card.querySelector(".project-status");
      return status ? status.textContent : "";
    },
    matchesFilter: (card, filter, category, cardText) => {
      if (filter === "completed") return category.includes("completed");
      if (filter === "in progress") return category.includes("in progress");
      return cardText.includes(filter);
    }
  });

  setupButtonFilters({
    filters: ".certificate-filter button",
    cards: ".certificate-grid .certificate-card",
    activeClass: "certificate-filter-active",
    getCategory: (card) => {
      const type = card.querySelector(".certificate-type");
      return type ? type.textContent : "";
    },
    matchesFilter: (card, filter, category) => {
      if (filter === "hackathons") return category.includes("hackathon");
      if (filter === "events") {
        return (
          category.includes("event") ||
          category.includes("workshop") ||
          category.includes("hackathon")
        );
      }
      if (filter === "courses") {
        return (
          category.includes("course") ||
          category.includes("workshop") ||
          category.includes("cloud") ||
          category.includes("nptel")
        );
      }
      return category.includes(filter);
    }
  });

  setupButtonFilters({
    filters: ".achievement-filter button",
    cards: ".achievement-timeline .achievement-item",
    activeClass: "achievement-filter-active",
    getCategory: (card) => {
      const category = card.querySelector(".achievement-category");
      return category ? category.textContent : "";
    },
    matchesFilter: (card, filter, category) => {
      if (filter === "events") {
        return category.includes("event") || category.includes("hackathon");
      }
      if (filter === "academic") {
        return category.includes("academic") || category.includes("technical learning");
      }
      if (filter === "leadership") return category.includes("leadership");
      return category.includes(filter);
    }
  });

  // =======================================================
  // 12b. HAMBURGER MENU
  // =======================================================
  const hamburger = document.getElementById("hamburgerBtn");
  const mainNav = document.getElementById("mainNav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      const open = mainNav.classList.toggle("open");
      hamburger.classList.toggle("open", open);
      hamburger.setAttribute("aria-expanded", String(open));
    });
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // =======================================================
  // 12c. PASSWORD SHOW/HIDE TOGGLES
  // =======================================================
  document.querySelectorAll(".skl-pw-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrap = btn.closest(".skl-pw-wrap");
      if (!wrap) return;
      const input = wrap.querySelector("input");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      btn.textContent = show ? "🙈" : "👁";
      btn.setAttribute("aria-label", show ? "Hide password" : "Show password");
    });
  });

  // =======================================================
  // 12d. PROJECTS CRUD
  // =======================================================
  const projectsGrid = document.getElementById("projectsGrid");
  const projectsEmpty = document.getElementById("projectsEmpty");
  const projectModal = document.getElementById("projectModal");
  const projectModalTitle = document.getElementById("projectModalTitle");
  const projectEditId = document.getElementById("projectEditId");
  const projectTitle = document.getElementById("projectTitle");
  const projectDesc = document.getElementById("projectDesc");
  const projectTech = document.getElementById("projectTech");
  const projectStatus = document.getElementById("projectStatus");
  const projectLink = document.getElementById("projectLink");
  const projectFormMsg = document.getElementById("projectFormMsg");
  const deleteProjectModal = document.getElementById("deleteProjectModal");
  const deleteProjectName = document.getElementById("deleteProjectName");
  const deleteProjectId = document.getElementById("deleteProjectId");

  function openProjectModal(project) {
    if (!projectModal) return;
    if (project) {
      projectModalTitle.textContent = "Edit Project";
      projectEditId.value = project.id;
      projectTitle.value = project.title;
      projectDesc.value = project.desc || "";
      projectTech.value = project.tech || "";
      projectStatus.value = project.status || "Completed";
      projectLink.value = project.link || "";
    } else {
      projectModalTitle.textContent = "Add Project";
      projectEditId.value = "";
      projectTitle.value = "";
      projectDesc.value = "";
      projectTech.value = "";
      projectStatus.value = "Completed";
      projectLink.value = "";
    }
    if (projectFormMsg) projectFormMsg.textContent = "";
    projectModal.style.display = "flex";
    projectTitle.focus();
  }

  function closeProjectModal() {
    if (projectModal) projectModal.style.display = "none";
  }

  function statusClass(s) {
    if (s === "Completed") return "completed";
    if (s === "In Progress") return "in-progress";
    return "planned";
  }

  function renderProjects() {
    if (!projectsGrid) return;
    const projects = getProjects();
    const activeFilter = document.querySelector(".skl-filter-btn.active");
    const filter = activeFilter ? activeFilter.dataset.projectFilter || "all" : "all";

    const filtered = filter === "all" ? projects : projects.filter((p) => {
      const sc = statusClass(p.status);
      return sc === filter;
    });

    if (projectsEmpty) projectsEmpty.style.display = projects.length === 0 ? "block" : "none";

    projectsGrid.innerHTML = filtered.map((p) => {
      const tags = (p.tech || "").split(",").map((t) => t.trim()).filter(Boolean)
        .map((t) => `<span class="skl-project-tag">${escapeHTML(t)}</span>`).join("");
      return `
      <div class="skl-project-card">
        <div class="skl-project-card-top">
          <h3>${escapeHTML(p.title)}</h3>
          <span class="skl-project-status ${statusClass(p.status)}">${escapeHTML(p.status)}</span>
        </div>
        <p>${escapeHTML(p.desc || "")}</p>
        <div class="skl-project-tags">${tags}</div>
        <div class="skl-project-actions">
          ${p.link ? `<a class="ss-btn secondary small" href="${escapeHTML(p.link)}" target="_blank" rel="noopener">🔗 Link</a>` : ""}
          <button class="ss-btn secondary small" data-edit-project="${escapeHTML(p.id)}">Edit</button>
          <button class="ss-btn danger small" data-delete-project="${escapeHTML(p.id)}" data-project-title="${escapeHTML(p.title)}">Delete</button>
        </div>
      </div>`;
    }).join("");

    if (filtered.length === 0 && projects.length > 0) {
      projectsGrid.innerHTML = `<p style="color:var(--skl-muted);padding:20px">No projects match this filter.</p>`;
    }
  }

  if (projectsGrid) {
    document.getElementById("addProjectBtn")?.addEventListener("click", () => openProjectModal(null));
    document.getElementById("projectModalClose")?.addEventListener("click", closeProjectModal);
    document.getElementById("projectCancelBtn")?.addEventListener("click", closeProjectModal);
    document.getElementById("deleteProjectClose")?.addEventListener("click", () => { if (deleteProjectModal) deleteProjectModal.style.display = "none"; });
    document.getElementById("deleteProjectCancel")?.addEventListener("click", () => { if (deleteProjectModal) deleteProjectModal.style.display = "none"; });

    projectModal?.addEventListener("click", (e) => { if (e.target === projectModal) closeProjectModal(); });
    deleteProjectModal?.addEventListener("click", (e) => { if (e.target === deleteProjectModal) deleteProjectModal.style.display = "none"; });

    document.getElementById("projectSaveBtn")?.addEventListener("click", () => {
      const title = projectTitle.value.trim();
      if (!title) { if (projectFormMsg) projectFormMsg.textContent = "Project title is required."; return; }
      const projects = getProjects();
      const id = projectEditId.value;
      if (id) {
        const idx = projects.findIndex((p) => p.id === id);
        if (idx >= 0) projects[idx] = { ...projects[idx], title, desc: projectDesc.value.trim(), tech: projectTech.value.trim(), status: projectStatus.value, link: projectLink.value.trim() };
      } else {
        projects.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2,6)}`, title, desc: projectDesc.value.trim(), tech: projectTech.value.trim(), status: projectStatus.value, link: projectLink.value.trim() });
      }
      setProjects(projects);
      closeProjectModal();
      renderProjects();
      toast(id ? "Project updated." : "Project added.");
    });

    document.getElementById("deleteProjectConfirm")?.addEventListener("click", () => {
      const id = deleteProjectId?.value;
      if (id) { setProjects(getProjects().filter((p) => p.id !== id)); renderProjects(); toast("Project deleted."); }
      if (deleteProjectModal) deleteProjectModal.style.display = "none";
    });

    projectsGrid.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit-project]");
      const delBtn = e.target.closest("[data-delete-project]");
      if (editBtn) {
        const p = getProjects().find((p) => p.id === editBtn.dataset.editProject);
        if (p) openProjectModal(p);
      }
      if (delBtn) {
        if (deleteProjectModal) {
          deleteProjectName.textContent = delBtn.dataset.projectTitle || "this project";
          deleteProjectId.value = delBtn.dataset.deleteProject;
          deleteProjectModal.style.display = "flex";
        }
      }
    });

    document.querySelectorAll(".skl-filter-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".skl-filter-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderProjects();
      });
    });

    renderProjects();
  }

  // =======================================================
  // 12e. RESUME STATUS ON PROFILE PAGE
  // =======================================================
  if (page === "profile.html" && signedIn) {
    const metaKey = `ssh_resume_meta_${signedIn.email.toLowerCase()}`;
    const meta = read(metaKey, null);
    const heading = document.getElementById("resumeStatusHeading");
    const text = document.getElementById("resumeStatusText");
    const btn = document.getElementById("resumeActionBtn");
    if (meta && heading) {
      const size = meta.size < 1024
        ? `${meta.size} bytes`
        : meta.size < 1024 * 1024
          ? `${(meta.size / 1024).toFixed(1)} KB`
          : `${(meta.size / (1024 * 1024)).toFixed(2)} MB`;
      heading.textContent = "Resume available";
      if (text) text.textContent = `${meta.name} · ${size} · Uploaded ${meta.date} · ${meta.status || "Available"}`;
      if (btn) btn.textContent = "Update Resume →";
    }
  }

  // =======================================================
  // 13. FEATURED STUDENT PUBLIC PROFILES (?student=<slug>)
  // =======================================================
  // (see section 14 below for scroll animations)
  const publicProfile = new URLSearchParams(window.location.search).get("student");

  const featuredStudentProfiles = {
    "ananya-krishnan": {
      name: "Ananya Krishnan",
      initials: "AK",
      role: "Computer Science Student",
      college: "Sri Ramakrishna Institute of Technology",
      year: "2027",
      location: "Tamil Nadu",
      projects: "08",
      achievements: "12",
      skills: ["Python", "React", "SQL"]
    },
    "priya-sharma": {
      name: "Priya Sharma",
      initials: "PS",
      role: "AI & Data Science Student",
      college: "PSG College of Technology",
      year: "2027",
      location: "Coimbatore",
      projects: "06",
      achievements: "09",
      skills: ["Python", "ML", "Data Science"]
    },
    "rahul-kumar": {
      name: "Rahul Kumar",
      initials: "RK",
      role: "Full Stack Developer",
      college: "Kumaraguru College of Technology",
      year: "2026",
      location: "Coimbatore",
      projects: "11",
      achievements: "15",
      skills: ["JavaScript", "Node.js", "MongoDB"]
    },
    "sneha-nair": {
      name: "Sneha Nair",
      initials: "SN",
      role: "Cybersecurity Student",
      college: "Amrita Vishwa Vidyapeetham",
      year: "2027",
      location: "Kerala",
      projects: "05",
      achievements: "11",
      skills: ["Cybersecurity", "Python", "Linux"]
    },
    "divya-menon": {
      name: "Divya Menon",
      initials: "DM",
      role: "UI / UX & Web Developer",
      college: "PSGR Krishnammal College",
      year: "2027",
      location: "Tamil Nadu",
      projects: "07",
      achievements: "08",
      skills: ["Figma", "HTML", "CSS"]
    },
    "vishnu-s": {
      name: "Vishnu S",
      initials: "VS",
      role: "Cloud & Backend Developer",
      college: "Anna University",
      year: "2026",
      location: "Chennai",
      projects: "09",
      achievements: "13",
      skills: ["AWS", "Node.js", "Docker"]
    }
  };

  const featuredStudent = featuredStudentProfiles[publicProfile];

  if (featuredStudent) {
    document.body.classList.add("featured-student-profile");
    document.title = featuredStudent.name + " | Public Profile | Skillora";

    const setText = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
    const setQ = (sel, value) => { const el = document.querySelector(sel); if (el) el.textContent = value; };

    setText("publicTopbarName", featuredStudent.name);
    setText("publicName", featuredStudent.name);
    setText("publicRole", featuredStudent.role);
    setText("publicCollege", "🎓 " + featuredStudent.college + " · " + featuredStudent.location);
    setText("publicFooterName", featuredStudent.name);
    setText("publicFooterRole", featuredStudent.role + " · Class of " + featuredStudent.year);
    setText("topbarAvatar", featuredStudent.initials);
    setQ(".sidebar-profile .sidebar-avatar", featuredStudent.initials);
    setQ(".sidebar-profile strong", featuredStudent.name);

    const publicAvatar = document.getElementById("publicAvatar");
    if (publicAvatar) {
      const verifiedBadge = publicAvatar.querySelector(".profile-verified");
      publicAvatar.textContent = featuredStudent.initials;
      if (verifiedBadge) publicAvatar.appendChild(verifiedBadge);
    }

    const profileTags = document.getElementById("publicTags");
    if (profileTags) {
      profileTags.innerHTML = [
        "Class of " + featuredStudent.year,
        featuredStudent.location,
        "Featured Student"
      ].map((t) => `<span>${t}</span>`).join("");
    }

    const aboutText = document.getElementById("publicBio");
    if (aboutText) {
      aboutText.textContent = featuredStudent.name + " is a " + featuredStudent.role +
        " at " + featuredStudent.college + ". Featured skills include " +
        featuredStudent.skills.join(", ") + ".";
    }

    const skillList = document.getElementById("publicSkillList");
    if (skillList) {
      skillList.innerHTML = featuredStudent.skills.map((s) =>
        `<div class="public-skill"><div class="public-skill-header"><span>${s}</span></div></div>`
      ).join("");
    }

    setText("statProjects", featuredStudent.projects);
    setText("statSkillsCount", String(featuredStudent.skills.length).padStart(2, "0"));
    setText("statAchievements", featuredStudent.achievements);

    const profileActions = document.querySelector(".profile-actions");
    const profileAside = document.querySelector(".public-profile-right");
    const footerLinks = document.querySelector(".footer-profile-links");
    if (profileActions) profileActions.hidden = true;
    if (profileAside) profileAside.hidden = true;
    if (footerLinks) footerLinks.hidden = true;
  }

  // =======================================================
  // 14. SCROLL ANIMATIONS & INTERACTIVITY
  // =======================================================

  // Scroll progress bar
  const sklProgressBar = document.createElement('div');
  sklProgressBar.className = 'skl-scroll-progress';
  document.body.appendChild(sklProgressBar);
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    sklProgressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }, { passive: true });

  // Animate-on-scroll
  const animateEls = document.querySelectorAll(
    '.skl-feature-card, .skl-step, .skl-student-mini, .skl-stat-item, .ss-stat, .ss-card, .skl-project-card, .skl-cert-card, .skl-achievement-item, .skl-section-title, .skl-section-sub, .skl-section-label'
  );

  if ('IntersectionObserver' in window && animateEls.length) {
    animateEls.forEach((el, i) => {
      el.classList.add('skl-animate');
      if (i % 3 === 1) el.classList.add('skl-animate-delay-1');
      if (i % 3 === 2) el.classList.add('skl-animate-delay-2');
    });
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('skl-visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    animateEls.forEach((el) => scrollObserver.observe(el));
  }

  // Animated stat counters (landing page stats banner)
  function animateCounter(el, target, duration) {
    const start = performance.now();
    const suffix = el.dataset.suffix || '+';
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  const counterEls = document.querySelectorAll('.skl-stat-item strong');
  if (counterEls.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const raw = parseInt(el.textContent.replace(/[^0-9]/g, ''), 10);
          if (!isNaN(raw)) {
            el.dataset.suffix = el.textContent.includes('%') ? '%' : '+';
            animateCounter(el, raw, 1400);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    counterEls.forEach((el) => counterObserver.observe(el));
  }

  // Animate progress bars on load
  setTimeout(() => {
    document.querySelectorAll('.ss-progress span, .skl-hero-bar span').forEach((bar) => {
      const w = bar.style.width;
      bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = w; }));
    });
  }, 200);

});
