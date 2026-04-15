# Hospital Management System

![HTML](https://img.shields.io/badge/HTML-5-orange)
![CSS](https://img.shields.io/badge/CSS-3-blue)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow)
![Responsive](https://img.shields.io/badge/Responsive-Yes-green)
![Status](https://img.shields.io/badge/Project-Frontend--Only-lightgrey)

A frontend-only Hospital Management System built with HTML, CSS, and Vanilla JavaScript.

It includes a patient-facing booking flow and an admin dashboard, with all data persisted in browser localStorage.

## Live Demo

https://hospital-managment-system-front.netlify.app/

## Features

### Patient Side
- Doctor cards rendered dynamically from stored data.
- Search doctor by name/specialization.
- Filter doctors by specialization chips.
- Date-based slot availability with instant booked-slot lock.
- Appointment booking with validation:
- Name: letters/spaces, minimum 3 characters.
- Age: integer from 1 to 120.
- Phone: 10 digits or `+91` + 10 digits.
- Booking progress stepper (choose doctor -> date -> slot -> patient details).
- Toast notifications for success/error/info states.
- Symptom helper ("Chat With Consultant") suggesting relevant doctors.
- Dark/light theme toggle stored in localStorage.

### Admin Side
- Password-protected entry page (`modal.html`).
- Dashboard stats:
- Total doctors
- Total bookings
- Today's bookings
- Manage doctors (view + delete).
- Add new doctor (name, specialization, experience, fee, rating, image, slots).
- Manage bookings (view + cancel).
- Mobile sidebar toggle in admin pages.

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6)
- Browser localStorage (client-side persistence)

## Local Storage Keys

- `doctors`: doctor master list (seeded from `defaultDoctors` when missing)
- `bookings`: booked appointments
- `adminLoggedIn`: simple admin auth flag
- `themePreference`: patient UI theme

## Project Structure

```text
hospital_management/
|-- index.html
|-- modal.html
|-- admin-dashboard.html
|-- admin-doctors.html
|-- admin-add-doctor.html
|-- admin-bookings.html
|-- css/
|   |-- style.css
|   |-- layout.css
|   |-- responsive.css
|   `-- admin.css
|-- js/
|   |-- data.js
|   |-- main.js
|   |-- admin.js
|   `-- modal.js
`-- assets/
    `-- images/
```

## How To Run

1. Clone/download the project.
2. Open `index.html` in your browser.
3. For admin pages, open `modal.html`.

Admin password (current code): `admin123`

## Notes

- This is a frontend-only project; no backend/database is used.
- Admin password is hardcoded in `js/modal.js` for demo purposes.
- To reset app state, clear site data/localStorage in browser devtools.

## Author

Developed by Nishant.
