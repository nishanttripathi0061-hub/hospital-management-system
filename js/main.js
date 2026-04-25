function initStandaloneMobileNav() {
    const navbar = document.querySelector(".navbar");
    const navToggleBtn = document.getElementById("nav-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navToggleIcon = navToggleBtn ? navToggleBtn.querySelector("i") : null;

    if (!navbar || !navToggleBtn || !navLinks) return;

    const closeMenu = () => {
        navbar.classList.remove("menu-open");
        navLinks.classList.remove("menu-open");
        navToggleBtn.setAttribute("aria-expanded", "false");
        if (navToggleIcon) {
            navToggleIcon.className = "fa-solid fa-bars";
        }
    };

    const openMenu = () => {
        navbar.classList.add("menu-open");
        navLinks.classList.add("menu-open");
        navToggleBtn.setAttribute("aria-expanded", "true");
        if (navToggleIcon) {
            navToggleIcon.className = "fa-solid fa-xmark";
        }
    };

    navToggleBtn.setAttribute("aria-expanded", "false");

    navToggleBtn.addEventListener("click", () => {
        const isOpen = navbar.classList.contains("menu-open");
        if (isOpen) {
            closeMenu();
            return;
        }
        openMenu();
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (window.innerWidth <= 768) {
                closeMenu();
            }
        });
    });

    document.addEventListener("click", (event) => {
        const isOpen = navbar.classList.contains("menu-open");
        if (!isOpen) return;

        if (!navbar.contains(event.target)) {
            closeMenu();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

initStandaloneMobileNav();

class HospitalApp {

    constructor() {
        const storedDoctors = JSON.parse(localStorage.getItem("doctors"));

        if (!storedDoctors) {
            localStorage.setItem("doctors", JSON.stringify(defaultDoctors));
            this.doctors = defaultDoctors;
        } else {
            this.doctors = storedDoctors;
        }

        this.doctorContainer = document.getElementById("doctor-container");
        this.slotContainer = document.getElementById("slot-container");
        this.form = document.getElementById("appointment-form");
        this.confirmationMessage = document.getElementById("confirmation-message");
        this.dateInput = document.getElementById("appointment-date");
        this.slotsSection = document.querySelector(".slots-section");

        this.nameInput = document.getElementById("patient-name");
        this.ageInput = document.getElementById("patient-age");
        this.phoneInput = document.getElementById("patient-phone");

        this.themeToggleBtn = document.getElementById("theme-toggle");
        this.consultantInput = document.getElementById("consultant-input");
        this.consultantSendBtn = document.getElementById("consultant-send");
        this.consultantResponse = document.getElementById("consultant-response");

        this.searchInput = document.getElementById("doctor-search");
        this.chipContainer = document.getElementById("specialization-chips");
        this.clearFiltersBtn = document.getElementById("clear-doctor-filters");
        this.stepperItems = Array.from(document.querySelectorAll(".step-item"));
        this.toastContainer = document.getElementById("toast-container");
        this.summaryStatus = document.getElementById("summary-status");
        this.summaryDoctor = document.getElementById("summary-doctor");
        this.summarySpecialization = document.getElementById("summary-specialization");
        this.summaryDate = document.getElementById("summary-date");
        this.summarySlot = document.getElementById("summary-slot");
        this.summaryPatient = document.getElementById("summary-patient");
        this.summaryPhone = document.getElementById("summary-phone");

        this.selectedDoctor = null;
        this.selectedSlot = null;
        this.selectedDate = null;

        this.selectedSpecialization = "All";
        this.searchTerm = "";
        this.scrollObserver = null;
        this.themeTransitionTimer = null;

        this.init();
    }

    init() {
        this.renderFilterChips();
        this.renderDoctors();
        this.handleFormSubmit();
        this.handleHeroScroll();
        this.scrollAppointment();
        this.handleDateChange();
        this.setMinDate();
        this.setInputConstraints();
        this.initTheme();
        this.initConsultantChat();
        this.initDoctorFilters();
        this.initStepper();
        this.bindPatientInputProgress();
        this.initScrollAnimations();
        this.updateBookingSummary();
    }

    initScrollAnimations() {
        if (!("IntersectionObserver" in window)) return;

        const revealItems = document.querySelectorAll("section, footer");
        if (revealItems.length === 0) return;

        revealItems.forEach((item) => item.classList.add("reveal"));

        this.scrollObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.14,
                rootMargin: "0px 0px -40px 0px"
            }
        );

        revealItems.forEach((item) => this.scrollObserver.observe(item));
    }

    setMinDate() {
        const today = new Date().toISOString().split("T")[0];
        if (this.dateInput) {
            this.dateInput.min = today;
        }
    }

    setInputConstraints() {
        if (this.ageInput) {
            this.ageInput.min = "1";
            this.ageInput.max = "120";
        }
        if (this.phoneInput) {
            this.phoneInput.maxLength = 14;
            this.phoneInput.placeholder = "10 digit number or +91XXXXXXXXXX";
        }
    }

    handleHeroScroll() {
        const btn = document.getElementById("scrollToDoctors");
        if (btn) {
            btn.addEventListener("click", () => {
                document.getElementById("doctors").scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    scrollAppointment() {
        const btn = document.getElementById("scrollToAppointment");
        if (btn) {
            btn.addEventListener("click", () => {
                document.getElementById("appointment").scrollIntoView({ behavior: "smooth" });
            });
        }
    }

    initDoctorFilters() {
        if (this.searchInput) {
            this.searchInput.addEventListener("input", (e) => {
                this.searchTerm = e.target.value.trim().toLowerCase();
                this.renderDoctors();
            });
        }

        if (this.clearFiltersBtn) {
            this.clearFiltersBtn.addEventListener("click", () => {
                this.selectedSpecialization = "All";
                this.searchTerm = "";

                if (this.searchInput) {
                    this.searchInput.value = "";
                }

                this.renderFilterChips();
                this.renderDoctors();
                this.showToast("Doctor filters reset.", "info");
            });
        }
    }

    renderFilterChips() {
        if (!this.chipContainer) return;

        const specializations = [
            "All",
            ...new Set(this.doctors.map((doctor) => doctor.specialization))
        ];

        this.chipContainer.innerHTML = "";

        specializations.forEach((specialization) => {
            const chip = document.createElement("button");
            chip.type = "button";
            chip.className = "filter-chip";
            chip.textContent = specialization;

            if (specialization === this.selectedSpecialization) {
                chip.classList.add("active");
            }

            chip.addEventListener("click", () => {
                this.selectedSpecialization = specialization;
                this.renderFilterChips();
                this.renderDoctors();
            });

            this.chipContainer.appendChild(chip);
        });
    }

    getFilteredDoctors() {
        return this.doctors.filter((doctor) => {
            const specializationMatch =
                this.selectedSpecialization === "All" ||
                doctor.specialization === this.selectedSpecialization;

            const searchableText = `${doctor.name} ${doctor.specialization}`.toLowerCase();
            const searchMatch = searchableText.includes(this.searchTerm);

            return specializationMatch && searchMatch;
        });
    }

    handleDateChange() {
        if (!this.dateInput) return;

        this.dateInput.addEventListener("change", (e) => {
            this.selectedDate = e.target.value;
            this.selectedSlot = null;

            if (this.selectedDoctor) {
                this.renderSlots(this.selectedDoctor);
                this.slotsSection.scrollIntoView({ behavior: "smooth" });
            }

            this.updateStepper();
            this.updateBookingSummary();
        });
    }

    renderDoctors() {
        if (!this.doctorContainer) return;

        const filteredDoctors = this.getFilteredDoctors();

        this.doctorContainer.innerHTML = "";

        if (filteredDoctors.length === 0) {
            this.doctorContainer.innerHTML = "<p class='empty-state'>No doctors match your search/filter.</p>";
            return;
        }

        filteredDoctors.forEach((doctor) => {
            const card = document.createElement("div");
            card.classList.add("doctor-card");

            if (this.selectedDoctor && this.selectedDoctor.id === doctor.id) {
                card.classList.add("selected");
            }

            card.innerHTML = `
                <div class="doctor-img">
                    <img src="${doctor.image}" alt="${doctor.name}">
                </div>
                <h3>${doctor.name}</h3>
                <p>${doctor.specialization}</p>
                <p>Experience: ${doctor.experience}</p>
                <p>Fee: Rs. ${doctor.fee}</p>
                <p>Rating: ${doctor.rating}</p>
            `;

            card.addEventListener("click", () => {
                this.selectedDoctor = doctor;
                this.selectedSlot = null;

                document.querySelectorAll(".doctor-card").forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");

                if (this.selectedDate) {
                    this.renderSlots(doctor);
                } else {
                    this.slotContainer.innerHTML = "<p style='color:#ffcbcb; font-weight:700;'>Please select a date first.</p>";
                }

                this.updateStepper();
                this.updateBookingSummary();
                this.slotsSection.scrollIntoView({ behavior: "smooth" });
            });

            this.doctorContainer.appendChild(card);
        });
    }

    renderSlots(doctor) {
        if (!this.slotContainer) return;

        this.slotContainer.innerHTML = "";

        if (!this.selectedDate) {
            this.slotContainer.innerHTML = "<p style='color:#ffcbcb; font-weight:700;'>Please select a date first.</p>";
            return;
        }

        const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

        doctor.slots.forEach((slotTime) => {
            const slot = document.createElement("div");
            slot.classList.add("slot");
            slot.innerText = slotTime;

            const isBooked = bookings.some((booking) =>
                booking.doctorId === doctor.id &&
                booking.date === this.selectedDate &&
                booking.time === slotTime
            );

            if (isBooked) {
                slot.classList.add("booked");
            }

            slot.addEventListener("click", () => {
                if (slot.classList.contains("booked")) return;

                document.querySelectorAll(".slot").forEach((s) => s.classList.remove("active"));

                slot.classList.add("active");
                this.selectedSlot = slotTime;
                this.updateStepper();
                this.updateBookingSummary();
            });

            this.slotContainer.appendChild(slot);
        });
    }

    initStepper() {
        this.updateStepper();
    }

    bindPatientInputProgress() {
        [this.nameInput, this.ageInput, this.phoneInput].forEach((input) => {
            if (!input) return;
            input.addEventListener("input", () => {
                this.updateStepper();
                this.updateBookingSummary();
            });
        });
    }

    formatReadableDate(dateString) {
        if (!dateString) return "Not selected";

        const date = new Date(`${dateString}T00:00:00`);
        if (Number.isNaN(date.getTime())) return dateString;

        return date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    updateBookingSummary() {
        if (!this.summaryStatus) return;

        const doctorName = this.selectedDoctor ? this.selectedDoctor.name : "Not selected";
        const specialization = this.selectedDoctor ? this.selectedDoctor.specialization : "-";
        const dateLabel = this.formatReadableDate(this.selectedDate);
        const slotLabel = this.selectedSlot || "Not selected";

        const patientName = this.nameInput && this.nameInput.value.trim()
            ? this.nameInput.value.trim()
            : "Not entered";

        const normalizedPhone = this.phoneInput
            ? this.normalizePhone(this.phoneInput.value.trim())
            : { valid: false, value: "" };

        const phoneLabel = normalizedPhone.valid
            ? normalizedPhone.value
            : (this.phoneInput && this.phoneInput.value.trim() ? this.phoneInput.value.trim() : "Not entered");

        if (this.summaryDoctor) this.summaryDoctor.textContent = doctorName;
        if (this.summarySpecialization) this.summarySpecialization.textContent = specialization;
        if (this.summaryDate) this.summaryDate.textContent = dateLabel;
        if (this.summarySlot) this.summarySlot.textContent = slotLabel;
        if (this.summaryPatient) this.summaryPatient.textContent = patientName;
        if (this.summaryPhone) this.summaryPhone.textContent = phoneLabel;

        const isReadyToConfirm =
            Boolean(this.selectedDoctor) &&
            Boolean(this.selectedDate) &&
            Boolean(this.selectedSlot) &&
            this.hasBasicPatientDetails();

        this.summaryStatus.textContent = isReadyToConfirm ? "Ready to Confirm" : "In Progress";
        this.summaryStatus.classList.toggle("ready", isReadyToConfirm);
    }

    hasBasicPatientDetails() {
        const name = this.nameInput.value.trim();
        const age = Number(this.ageInput.value);
        const phoneStatus = this.normalizePhone(this.phoneInput.value);

        return (
            name.length >= 3 &&
            /^[a-zA-Z ]+$/.test(name) &&
            Number.isInteger(age) &&
            age >= 1 &&
            age <= 120 &&
            phoneStatus.valid
        );
    }

    updateStepper() {
        if (!this.stepperItems.length) return;

        const state = [
            Boolean(this.selectedDoctor),
            Boolean(this.selectedDate),
            Boolean(this.selectedSlot),
            this.hasBasicPatientDetails()
        ];

        let currentStep = 4;
        for (let i = 0; i < state.length; i += 1) {
            if (!state[i]) {
                currentStep = i + 1;
                break;
            }
        }

        this.stepperItems.forEach((item, index) => {
            const stepIndex = index + 1;
            item.classList.remove("active", "completed");

            if (state[index]) {
                item.classList.add("completed");
            }

            if (stepIndex === currentStep) {
                item.classList.add("active");
            }
        });
    }

    validateBookingForm(name, age, phoneRaw) {
        const trimmedName = name.trim();

        if (!trimmedName || trimmedName.length < 3) {
            return { ok: false, message: "Please enter full name (minimum 3 characters)." };
        }

        if (!/^[a-zA-Z ]+$/.test(trimmedName)) {
            return { ok: false, message: "Name should contain only letters and spaces." };
        }

        const ageNum = Number(age);
        if (!Number.isInteger(ageNum) || ageNum < 1 || ageNum > 120) {
            return { ok: false, message: "Age must be a whole number between 1 and 120." };
        }

        const normalizedPhone = this.normalizePhone(phoneRaw);
        if (!normalizedPhone.valid) {
            return { ok: false, message: "Enter valid phone: 10 digits or +91 followed by 10 digits." };
        }

        if (!this.selectedDate) {
            return { ok: false, message: "Please select appointment date." };
        }

        const selectedDateObj = new Date(`${this.selectedDate}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDateObj < today) {
            return { ok: false, message: "Past dates are not allowed." };
        }

        if (!this.selectedDoctor) {
            return { ok: false, message: "Please select a doctor first." };
        }

        if (!this.selectedSlot) {
            return { ok: false, message: "Please select an available time slot." };
        }

        return {
            ok: true,
            normalizedName: trimmedName,
            normalizedAge: ageNum,
            normalizedPhone: normalizedPhone.value
        };
    }

    normalizePhone(phoneRaw) {
        const cleaned = phoneRaw.replace(/\s+/g, "").replace(/-/g, "");

        if (/^\d{10}$/.test(cleaned)) {
            return { valid: true, value: cleaned };
        }

        if (/^\+91\d{10}$/.test(cleaned)) {
            return { valid: true, value: cleaned };
        }

        if (/^91\d{10}$/.test(cleaned)) {
            return { valid: true, value: `+${cleaned}` };
        }

        return { valid: false, value: "" };
    }

    handleFormSubmit() {
        if (!this.form) return;

        this.form.addEventListener("submit", (e) => {
            e.preventDefault();

            const name = this.nameInput.value;
            const age = this.ageInput.value;
            const phone = this.phoneInput.value;

            const validation = this.validateBookingForm(name, age, phone);
            if (!validation.ok) {
                this.showMessage(validation.message, "error");
                this.showToast(validation.message, "error");
                return;
            }

            const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

            const alreadyBooked = bookings.some((booking) =>
                booking.doctorId === this.selectedDoctor.id &&
                booking.date === this.selectedDate &&
                booking.time === this.selectedSlot
            );

            if (alreadyBooked) {
                const message = "This slot was just booked. Please pick another slot.";
                this.showMessage(message, "error");
                this.showToast(message, "error");
                this.renderSlots(this.selectedDoctor);
                return;
            }

            const newBooking = {
                id: Date.now(),
                doctorId: this.selectedDoctor.id,
                doctorName: this.selectedDoctor.name,
                patientName: validation.normalizedName,
                age: validation.normalizedAge,
                phone: validation.normalizedPhone,
                date: this.selectedDate,
                time: this.selectedSlot
            };

            bookings.push(newBooking);
            localStorage.setItem("bookings", JSON.stringify(bookings));

            const successMessage = `Appointment Confirmed! Doctor: ${this.selectedDoctor.name} | Date: ${this.selectedDate} | Slot: ${this.selectedSlot} | Patient: ${validation.normalizedName}`;
            this.showMessage(successMessage, "success");
            this.showToast("Appointment booked successfully.", "success");

            this.form.reset();
            this.selectedSlot = null;
            this.renderSlots(this.selectedDoctor);
            this.updateStepper();
            this.updateBookingSummary();
        });
    }

    showMessage(message, type) {
        if (!this.confirmationMessage) return;

        this.confirmationMessage.textContent = message;
        this.confirmationMessage.classList.remove("success-message", "error-message");
        this.confirmationMessage.classList.add(type === "success" ? "success-message" : "error-message");
    }

    showToast(message, type = "info") {
        if (!this.toastContainer) return;

        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;

        const iconMap = {
            success: "fa-circle-check",
            error: "fa-circle-xmark",
            info: "fa-circle-info"
        };

        const iconClass = iconMap[type] || iconMap.info;
        toast.innerHTML = `<i class="fa-solid ${iconClass}"></i><span>${message}</span>`;

        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("hide");
            setTimeout(() => toast.remove(), 280);
        }, 3200);
    }

    initTheme() {
        if (!this.themeToggleBtn) return;

        const savedTheme = localStorage.getItem("themePreference") || "dark";
        this.applyTheme(savedTheme, true);

        this.themeToggleBtn.addEventListener("click", () => {
            const current = document.body.classList.contains("theme-light") ? "light" : "dark";
            const nextTheme = current === "light" ? "dark" : "light";
            this.applyTheme(nextTheme);
            localStorage.setItem("themePreference", nextTheme);
        });
    }

    applyTheme(theme, skipAnimation = false) {
        const icon = this.themeToggleBtn.querySelector("i");
        const text = this.themeToggleBtn.querySelector("span");

        if (!skipAnimation) {
            document.body.classList.add("theme-switching");
            if (this.themeTransitionTimer) {
                clearTimeout(this.themeTransitionTimer);
            }
            this.themeTransitionTimer = setTimeout(() => {
                document.body.classList.remove("theme-switching");
                this.themeTransitionTimer = null;
            }, 500);
        }

        if (theme === "light") {
            document.body.classList.add("theme-light");
            icon.className = "fa-solid fa-sun";
            text.textContent = "Light";
            return;
        }

        document.body.classList.remove("theme-light");
        icon.className = "fa-solid fa-moon";
        text.textContent = "Dark";
    }

    initConsultantChat() {
        if (!this.consultantSendBtn || !this.consultantInput || !this.consultantResponse) return;

        const handleConsultation = () => {
            const message = this.consultantInput.value.trim();

            if (message.length < 4) {
                this.consultantResponse.innerHTML = "<p class='consultant-bubble consultant-error'>Please describe your symptoms in a bit more detail.</p>";
                return;
            }

            const matches = this.findDoctorMatches(message);

            if (matches.length === 0) {
                this.consultantResponse.innerHTML = `
                    <div class="consultant-bubble">
                        <p>I could not map your symptoms exactly. Start with a General Physician:</p>
                        <p><strong>${this.getGeneralPhysicianName()}</strong></p>
                    </div>
                `;
                return;
            }

            const suggestions = matches
                .slice(0, 3)
                .map((doctor) => `<li><strong>${doctor.name}</strong> - ${doctor.specialization}</li>`)
                .join("");

            this.consultantResponse.innerHTML = `
                <div class="consultant-bubble">
                    <p>Based on your symptoms, suggested doctors:</p>
                    <ul>${suggestions}</ul>
                    <p class="consultant-note">Please choose one doctor card above to continue booking.</p>
                </div>
            `;
        };

        this.consultantSendBtn.addEventListener("click", handleConsultation);

        this.consultantInput.addEventListener("keydown", (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                handleConsultation();
            }
        });
    }

    findDoctorMatches(symptomsText) {
        const text = symptomsText.toLowerCase();

        const map = {
            Cardiologist: ["chest", "heart", "bp", "blood pressure", "palpit", "cardiac"],
            Dermatologist: ["skin", "rash", "acne", "itch", "allergy", "pigment"],
            Orthopedic: ["bone", "joint", "knee", "back pain", "fracture", "shoulder"],
            Pediatrician: ["child", "kid", "baby", "newborn", "infant", "vaccination"],
            Neurologist: ["headache", "migraine", "seizure", "brain", "numb", "nerve"],
            Gynecologist: ["pregnan", "period", "pcos", "women", "uterus", "ovary"],
            "ENT Specialist": ["ear", "nose", "throat", "sinus", "tonsil", "hearing"],
            Psychiatrist: ["anxiety", "depression", "stress", "sleep", "panic", "mental"],
            "General Physician": ["fever", "cold", "cough", "infection", "weakness", "viral"],
            Oncologist: ["cancer", "tumor", "chemotherapy", "oncology", "lump"]
        };

        const matchedSpecializations = Object.keys(map).filter((specialization) =>
            map[specialization].some((keyword) => text.includes(keyword))
        );

        const unique = [];

        matchedSpecializations.forEach((specialization) => {
            const found = this.doctors.find(
                (doc) => doc.specialization.toLowerCase() === specialization.toLowerCase()
            );

            if (found && !unique.some((existing) => existing.id === found.id)) {
                unique.push(found);
            }
        });

        return unique;
    }

    getGeneralPhysicianName() {
        const fallback = this.doctors.find(
            (doc) => doc.specialization.toLowerCase() === "general physician"
        );

        return fallback ? `${fallback.name} (${fallback.specialization})` : "General Physician";
    }
}

new HospitalApp();
