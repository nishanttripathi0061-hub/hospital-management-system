// ================= SECURITY CHECK =================
if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "modal.html";
}

// ================= LOAD DATA =================
let doctors = JSON.parse(localStorage.getItem("doctors"));
if (!doctors) {
    localStorage.setItem("doctors", JSON.stringify(defaultDoctors));
    doctors = defaultDoctors;
}

let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

// ================= COMMON HELPERS =================
function updateDashboardDate() {
    const dateEl = document.getElementById("dashboard-date");
    if (!dateEl) return;

    const today = new Date();
    const dateText = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    dateEl.textContent = `Today: ${dateText}`;
}

function initActiveNav() {
    const page = document.body.dataset.page;
    if (!page) return;

    const activeLink = document.querySelector(`.menu a[data-nav="${page}"]`);
    if (activeLink) {
        activeLink.classList.add("active");
    }
}

// ================= LOGOUT =================
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("adminLoggedIn");
        window.location.href = "index.html";
    });
}

// ================= DASHBOARD =================
function initDashboard() {
    const totalDoctorsEl = document.getElementById("total-doctors");
    const totalBookingsEl = document.getElementById("total-bookings");
    const todayBookingsEl = document.getElementById("today-bookings");

    if (!totalDoctorsEl || !totalBookingsEl || !todayBookingsEl) return;

    totalDoctorsEl.innerText = doctors.length;
    totalBookingsEl.innerText = bookings.length;

    const today = new Date().toISOString().split("T")[0];
    const todayCount = bookings.filter((booking) => booking.date === today).length;
    todayBookingsEl.innerText = todayCount;
}

// ================= DOCTORS PAGE =================
function renderDoctors() {
    const doctorList = document.getElementById("doctor-list");
    const doctorCount = document.getElementById("doctor-count");
    if (!doctorList) return;

    doctorList.innerHTML = "";

    if (doctorCount) {
        doctorCount.textContent = String(doctors.length);
    }

    if (doctors.length === 0) {
        doctorList.innerHTML = "<p class='empty-row'>No doctors available.</p>";
        return;
    }

    doctors.forEach((doc) => {
        const div = document.createElement("div");
        div.classList.add("doctor-item");

        div.innerHTML = `
            <div class="doctor-meta">
                <div class="doctor-thumb-wrap">
                    <img
                        class="doctor-thumb"
                        src="${doc.image}"
                        alt="${doc.name}"
                        onerror="this.onerror=null;this.src='https://via.placeholder.com/68x68?text=Dr';"
                    >
                </div>
                <div class="doctor-info">
                    <strong>${doc.name}</strong>
                    <span class="specialization">${doc.specialization}</span>
                </div>
            </div>

            <button class="delete-doctor-btn" data-id="${doc.id}" type="button">
                Delete
            </button>
        `;

        doctorList.appendChild(div);
    });
}

// ================= ADD DOCTOR =================
function initAddDoctor() {
    const form = document.getElementById("add-doctor-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = document.getElementById("doc-name").value.trim();
        const specialization = document.getElementById("doc-specialization").value.trim();
        const experience = document.getElementById("doc-experience").value.trim();
        const fee = document.getElementById("doc-fee").value.trim();
        const rating = document.getElementById("doc-rating").value.trim();
        const image = document.getElementById("doc-image").value.trim();
        const slotsInput = document.getElementById("doc-slots").value;

        const slots = slotsInput
            .split(",")
            .map((slot) => slot.trim())
            .filter(Boolean);

        const newDoctor = {
            id: Date.now(),
            name,
            specialization,
            experience,
            fee,
            rating,
            image,
            slots
        };

        doctors.push(newDoctor);
        localStorage.setItem("doctors", JSON.stringify(doctors));

        form.reset();
        alert("Doctor added successfully.");
    });
}

// ================= BOOKINGS PAGE =================
function renderBookings() {
    const tableBody = document.getElementById("bookings-table-body");
    const bookingCount = document.getElementById("booking-count");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (bookingCount) {
        bookingCount.textContent = String(bookings.length);
    }

    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">No bookings found.</td>
            </tr>
        `;
        return;
    }

    bookings.forEach((booking) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${booking.patientName}</td>
            <td>${booking.doctorName}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>
                <button class="delete-booking-btn" data-id="${booking.id}" type="button">
                    Cancel
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

// ================= DELETE ACTIONS =================
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-doctor-btn")) {
        const id = Number(e.target.dataset.id);

        doctors = doctors.filter((doc) => doc.id !== id);
        localStorage.setItem("doctors", JSON.stringify(doctors));

        renderDoctors();
        initDashboard();
    }

    if (e.target.classList.contains("delete-booking-btn")) {
        const id = Number(e.target.dataset.id);

        bookings = bookings.filter((booking) => booking.id !== id);
        localStorage.setItem("bookings", JSON.stringify(bookings));

        renderBookings();
        initDashboard();
    }
});

// ================= MOBILE SIDEBAR =================
const menuToggle = document.getElementById("menu-toggle");
const sidebarCloseBtn = document.getElementById("sidebar-close");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && overlay) {
    const closeSidebar = () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
        document.body.classList.remove("sidebar-open");
        menuToggle.setAttribute("aria-expanded", "false");
    };

    const openSidebar = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
        document.body.classList.add("sidebar-open");
        menuToggle.setAttribute("aria-expanded", "true");
    };

    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
        const isOpen = sidebar.classList.contains("active");
        if (isOpen) {
            closeSidebar();
            return;
        }
        openSidebar();
    });

    overlay.addEventListener("click", closeSidebar);
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener("click", closeSidebar);
    }

    document.querySelectorAll(".menu a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 900) {
                closeSidebar();
            }
        });
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeSidebar();
        }
    });
}

// ================= INIT =================
updateDashboardDate();
initActiveNav();
initDashboard();
renderDoctors();
initAddDoctor();
renderBookings();
