// ================= SECURITY CHECK =================

if (localStorage.getItem("adminLoggedIn") !== "true") {
    window.location.href = "modal.html";
}

// ================= LOAD DATA =================

// Doctors
let doctors = JSON.parse(localStorage.getItem("doctors"));

if (!doctors) {
    localStorage.setItem("doctors", JSON.stringify(defaultDoctors));
    doctors = defaultDoctors;
}

// Bookings
let bookings = JSON.parse(localStorage.getItem("bookings")) || [];


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

    if (!totalDoctorsEl) return;

    totalDoctorsEl.innerText = doctors.length;
    totalBookingsEl.innerText = bookings.length;

    const today = new Date().toISOString().split("T")[0];

    const todayCount = bookings.filter(b => b.date === today).length;

    todayBookingsEl.innerText = todayCount;
}

initDashboard();


// ================= DOCTORS PAGE =================

function renderDoctors() {

    const doctorList = document.getElementById("doctor-list");
    if (!doctorList) return;

    doctorList.innerHTML = "";

    if (doctors.length === 0) {
        doctorList.innerHTML = "<p>No doctors available</p>";
        return;
    }

    doctors.forEach(doc => {

        const div = document.createElement("div");
        div.classList.add("doctor-item");

        div.innerHTML = `
            <div class="doctor-info">
                <strong>${doc.name}</strong>
                <span class="specialization">${doc.specialization}</span>
            </div>

            <button class="delete-doctor-btn" data-id="${doc.id}">
                Delete
            </button>
        `;

        doctorList.appendChild(div);
    });
}

renderDoctors();


// ================= DELETE DOCTOR =================

document.addEventListener("click", function(e) {

    if (e.target.classList.contains("delete-doctor-btn")) {

        const id = Number(e.target.dataset.id);

        doctors = doctors.filter(doc => doc.id !== id);

        localStorage.setItem("doctors", JSON.stringify(doctors));

        renderDoctors();
        initDashboard();
    }

});


// ================= ADD DOCTOR =================

function initAddDoctor() {

    const form = document.getElementById("add-doctor-form");
    if (!form) return;

    form.addEventListener("submit", function(e) {

        e.preventDefault();

        const name = document.getElementById("doc-name").value;
        const specialization = document.getElementById("doc-specialization").value;
        const experience = document.getElementById("doc-experience").value;
        const fee = document.getElementById("doc-fee").value;
        const rating = document.getElementById("doc-rating").value;
        const image = document.getElementById("doc-image").value;
        const slotsInput = document.getElementById("doc-slots").value;

        const slots = slotsInput.split(",").map(s => s.trim());

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

        alert("Doctor added successfully");

    });
}

initAddDoctor();


// ================= BOOKINGS PAGE =================

function renderBookings() {

    const tableBody = document.getElementById("bookings-table-body");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (bookings.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5">No bookings found</td>
            </tr>
        `;
        return;
    }

    bookings.forEach(booking => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${booking.patientName}</td>
            <td>${booking.doctorName}</td>
            <td>${booking.date}</td>
            <td>${booking.time}</td>
            <td>
                <button class="delete-booking-btn" data-id="${booking.id}">
                    Cancel
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

renderBookings();


// ================= DELETE BOOKING =================

document.addEventListener("click", function(e) {

    if (e.target.classList.contains("delete-booking-btn")) {

        const id = Number(e.target.dataset.id);

        bookings = bookings.filter(b => b.id !== id);

        localStorage.setItem("bookings", JSON.stringify(bookings));

        renderBookings();
        initDashboard();
    }

});


// ================= MOBILE SIDEBAR =================

const menuToggle = document.getElementById("menu-toggle");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("overlay");

if (menuToggle && sidebar && overlay) {

    menuToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        overlay.classList.toggle("active");
    });

    overlay.addEventListener("click", () => {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    });
}