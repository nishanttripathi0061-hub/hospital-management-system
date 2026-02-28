const ADMIN_PASSWORD = "admin123";

const loginBtn = document.getElementById("login-btn");
const cancelBtn = document.getElementById("cancel-btn");
const passwordInput = document.getElementById("admin-password");
const errorMessage = document.getElementById("error-message");

// 🔐 LOGIN BUTTON
loginBtn.addEventListener("click", () => {

    const enteredPassword = passwordInput.value.trim();

    if (enteredPassword === ADMIN_PASSWORD) {

        // Optional: session flag
        localStorage.setItem("adminLoggedIn", "true");

        // Redirect to dashboard
        window.location.href = "admin-dashboard.html";

    } else {
        errorMessage.innerText = "Incorrect password";
    }

});

passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        loginBtn.click();
    }
});



// ❌ CANCEL BUTTON
cancelBtn.addEventListener("click", () => {
    window.location.href = "index.html";
});