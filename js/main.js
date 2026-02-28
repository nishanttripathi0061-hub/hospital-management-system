class HospitalApp {

    constructor(doctorsData) {

        // Data
        this.doctors = doctorsData;

        // DOM Elements
        this.doctorContainer = document.getElementById("doctor-container");
        this.slotContainer = document.getElementById("slot-container");
        this.form = document.getElementById("appointment-form");
        this.confirmationMessage = document.getElementById("confirmation-message");
        this.dateInput = document.getElementById("appointment-date");
        this.slotsSection = document.querySelector(".slots-section");

        // State
        this.selectedDoctor = null;
        this.selectedSlot = null;
        this.selectedDate = null;

        // Initialize
        this.init();
    }

    init() {
        this.renderDoctors();
        this.handleFormSubmit();
        this.handleHeroScroll();
        this.scrollAppointment();
        this.handleDateChange();
        this.setMinDate(); // 🔥 Disable past dates
    }

    // ================= DISABLE PAST DATES =================
    setMinDate() {
        const today = new Date().toISOString().split("T")[0];
        this.dateInput.min = today;
    }

    // ================= HERO SCROLL =================
    handleHeroScroll() {
        document.getElementById("scrollToDoctors")
            .addEventListener("click", () => {
                document.getElementById("doctors")
                    .scrollIntoView({ behavior: "smooth" });
            });
    }

    scrollAppointment() {
        document.getElementById("scrollToAppointment")
            .addEventListener("click", () => {
                document.getElementById("appointment")
                    .scrollIntoView({ behavior: "smooth" });
            });
    }

    // ================= DATE CHANGE =================
    handleDateChange() {
        this.dateInput.addEventListener("change", (e) => {

            this.selectedDate = e.target.value;

            // 🔥 Reset previous slot
            this.selectedSlot = null;

            if (this.selectedDoctor) {
                this.renderSlots(this.selectedDoctor);
                this.slotsSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // ================= RENDER DOCTORS =================
    renderDoctors() {

        this.doctorContainer.innerHTML = "";

        this.doctors.forEach((doctor) => {

            const card = document.createElement("div");
            card.classList.add("doctor-card");

            card.innerHTML = `
                <div class="doctor-img">
                    <img src="${doctor.image}" alt="${doctor.name}">
                </div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialization}</p>
                <p>Experience: ${doctor.experience}</p>
                <p>Fee: ₹${doctor.fee}</p>
                <p>⭐ ${doctor.rating}</p>
            `;

            card.addEventListener("click", () => {

                this.selectedDoctor = doctor;
                this.selectedSlot = null;

                document.querySelectorAll(".doctor-card")
                    .forEach(c => c.classList.remove("selected"));

                card.classList.add("selected");

                if (this.selectedDate) {
                    this.renderSlots(doctor);
                } else {
                    this.slotContainer.innerHTML = `
                        <p style="color:red; font-weight:600;">
                            Please select a date first.
                        </p>
                    `;
                }

                this.slotsSection.scrollIntoView({ behavior: "smooth" });
            });

            this.doctorContainer.appendChild(card);
        });
    }

    // ================= RENDER SLOTS =================
    renderSlots(doctor) {

        this.slotContainer.innerHTML = "";

        if (!this.selectedDate) {
            this.slotContainer.innerHTML = `
                <p style="color:red; font-weight:600;">
                    Please select a date first.
                </p>
            `;
            return;
        }

        doctor.slots.forEach((slotTime) => {

            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.innerText = slotTime;

            const slotKey = `${doctor.id}-${this.selectedDate}-${slotTime}`;

            // Check if already booked
            if (localStorage.getItem(slotKey)) {
                slot.classList.add("booked");
            }

            slot.addEventListener("click", () => {

                if (slot.classList.contains("booked")) return;

                document.querySelectorAll(".slot")
                    .forEach(s => s.classList.remove("active"));

                slot.classList.add("active");
                this.selectedSlot = slotTime;
            });

            this.slotContainer.appendChild(slot);
        });
    }

    // ================= HANDLE BOOKING =================
    handleFormSubmit() {

        this.form.addEventListener("submit", (e) => {

            e.preventDefault();

            const name = document.getElementById("patient-name").value;
            const age = document.getElementById("patient-age").value;
            const phone = document.getElementById("patient-phone").value;

            if (!this.selectedDoctor || !this.selectedSlot || !this.selectedDate) {
                alert("Please select doctor, date and slot first!");
                return;
            }

            const slotKey = `${this.selectedDoctor.id}-${this.selectedDate}-${this.selectedSlot}`;

            // Save booking permanently
            localStorage.setItem(slotKey, "booked");

            this.confirmationMessage.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Appointment Confirmed! <br>
                Doctor: ${this.selectedDoctor.name} <br>
                Date: ${this.selectedDate} <br>
                Slot: ${this.selectedSlot} <br>
                Patient: ${name}
            `;

            // Reset form and state
            this.form.reset();
            this.selectedSlot = null;

            // Re-render slots to update red state
            this.renderSlots(this.selectedDoctor);
        });
    }
}


// ================= START APP =================
document.addEventListener("DOMContentLoaded", () => {
    new HospitalApp(doctors);
});