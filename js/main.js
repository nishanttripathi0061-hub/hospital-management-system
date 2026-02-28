class HospitalApp {

    constructor() {

        // ================= LOAD DOCTORS =================

        let storedDoctors = JSON.parse(localStorage.getItem("doctors"));

        if (!storedDoctors) {
            // First time load → seed from defaultDoctors
            localStorage.setItem("doctors", JSON.stringify(defaultDoctors));
            this.doctors = defaultDoctors;
        } else {
            this.doctors = storedDoctors;
        }

        // ================= DOM ELEMENTS =================

        this.doctorContainer = document.getElementById("doctor-container");
        this.slotContainer = document.getElementById("slot-container");
        this.form = document.getElementById("appointment-form");
        this.confirmationMessage = document.getElementById("confirmation-message");
        this.dateInput = document.getElementById("appointment-date");
        this.slotsSection = document.querySelector(".slots-section");

        // ================= STATE =================

        this.selectedDoctor = null;
        this.selectedSlot = null;
        this.selectedDate = null;

        this.init();
    }

    init() {
        this.renderDoctors();
        this.handleFormSubmit();
        this.handleHeroScroll();
        this.scrollAppointment();
        this.handleDateChange();
        this.setMinDate();
    }

    // ================= DISABLE PAST DATES =================

    setMinDate() {
        const today = new Date().toISOString().split("T")[0];
        if (this.dateInput) {
            this.dateInput.min = today;
        }
    }

    // ================= HERO SCROLL =================

    handleHeroScroll() {
        const btn = document.getElementById("scrollToDoctors");
        if (btn) {
            btn.addEventListener("click", () => {
                document.getElementById("doctors")
                    .scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    scrollAppointment() {
        const btn = document.getElementById("scrollToAppointment");
        if (btn) {
            btn.addEventListener("click", () => {
                document.getElementById("appointment")
                    .scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    // ================= DATE CHANGE =================

    handleDateChange() {

        if (!this.dateInput) return;

        this.dateInput.addEventListener("change", (e) => {

            this.selectedDate = e.target.value;
            this.selectedSlot = null;

            if (this.selectedDoctor) {
                this.renderSlots(this.selectedDoctor);
                this.slotsSection.scrollIntoView({ behavior: "smooth" });
            }
        });
    }

    // ================= RENDER DOCTORS =================

    renderDoctors() {

        if (!this.doctorContainer) return;

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
                <p>Experience: ${doctor.experience} years</p>
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

        if (!this.slotContainer) return;

        this.slotContainer.innerHTML = "";

        if (!this.selectedDate) {
            this.slotContainer.innerHTML = `
                <p style="color:red; font-weight:600;">
                    Please select a date first.
                </p>
            `;
            return;
        }

        let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

        doctor.slots.forEach((slotTime) => {

            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.innerText = slotTime;

            const isBooked = bookings.some(booking =>
                booking.doctorId === doctor.id &&
                booking.date === this.selectedDate &&
                booking.time === slotTime
            );

            if (isBooked) {
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

        if (!this.form) return;

        this.form.addEventListener("submit", (e) => {

            e.preventDefault();

            const name = document.getElementById("patient-name").value;
            const age = document.getElementById("patient-age").value;
            const phone = document.getElementById("patient-phone").value;

            if (!this.selectedDoctor || !this.selectedSlot || !this.selectedDate) {
                alert("Please select doctor, date and slot first!");
                return;
            }

            let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

            const newBooking = {
                id: Date.now(),
                doctorId: this.selectedDoctor.id,
                doctorName: this.selectedDoctor.name,
                patientName: name,
                age: age,
                phone: phone,
                date: this.selectedDate,
                time: this.selectedSlot
            };

            bookings.push(newBooking);

            localStorage.setItem("bookings", JSON.stringify(bookings));

            this.confirmationMessage.innerHTML = `
                <i class="fa-solid fa-circle-check"></i>
                Appointment Confirmed! <br>
                Doctor: ${this.selectedDoctor.name} <br>
                Date: ${this.selectedDate} <br>
                Slot: ${this.selectedSlot} <br>
                Patient: ${name}
            `;

            this.form.reset();
            this.selectedSlot = null;

            this.renderSlots(this.selectedDoctor);
        });
    }
}

// ================= START APP =================

document.addEventListener("DOMContentLoaded", () => {
    new HospitalApp();
});