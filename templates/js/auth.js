/**
 * HireHub Authentication JavaScript
 * Handles User Login, Registration, Form Validation & UI Feedback
 */

document.addEventListener("DOMContentLoaded", function () {

    // ---------------------------------------------------------
    // PASSWORD VISIBILITY TOGGLE HELPER
    // ---------------------------------------------------------
    document.querySelectorAll(".btn-toggle-password").forEach(button => {
        button.addEventListener("click", function () {
            const targetInputId = this.getAttribute("data-target");
            const input = document.getElementById(targetInputId);
            const icon = this.querySelector("i");
            if (!input) return;

            if (input.type === "password") {
                input.type = "text";
                if (icon) {
                    icon.classList.remove("bi-eye");
                    icon.classList.add("bi-eye-slash");
                }
            } else {
                input.type = "password";
                if (icon) {
                    icon.classList.remove("bi-eye-slash");
                    icon.classList.add("bi-eye");
                }
            }
        });
    });

    // ---------------------------------------------------------
    // LOGIN FORM HANDLER
    // ---------------------------------------------------------
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const usernameInput = document.getElementById("loginUsername");
            const passwordInput = document.getElementById("loginPassword");
            const submitBtn = document.getElementById("loginSubmitBtn");
            const messageEl = document.getElementById("loginMessage");

            const username = usernameInput ? usernameInput.value.trim() : "";
            const password = passwordInput ? passwordInput.value : "";

            if (!username || !password) {
                renderAlert(messageEl, "Please enter both username and password.", "danger");
                return;
            }

            // Button loading state
            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Sign In";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...`;
            }

            renderAlert(messageEl, "", "");

            try {
                const response = await apiRequest("/auth/login/", "POST", {
                    username: username,
                    password: password
                });

                // Extract access & refresh tokens from response (supports both wrapped and flat formats)
                const access = response.data?.access_token || response.access_token || response.access;
                const refresh = response.data?.refresh_token || response.refresh_token || response.refresh;
                const user = response.data?.user || response.user;

                saveTokens(access, refresh);
                if (user) {
                    saveCurrentUser(user);
                }

                renderAlert(messageEl, '<i class="bi bi-check-circle me-1"></i> Login successful! Redirecting to dashboard...', "success");
                showToast("Welcome back! Redirecting...", "success");

                setTimeout(() => {
                    window.location.href = "/dashboard/";
                }, 700);

            } catch (error) {
                renderAlert(messageEl, `<i class="bi bi-exclamation-triangle me-1"></i> ${error.message}`, "danger");
                showToast(error.message, "danger");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // ---------------------------------------------------------
    // REGISTER FORM HANDLER
    // ---------------------------------------------------------
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const username = document.getElementById("registerUsername")?.value.trim() || "";
            const email = document.getElementById("registerEmail")?.value.trim() || "";
            const phone = document.getElementById("registerPhone")?.value.trim() || "";
            const password = document.getElementById("registerPassword")?.value || "";
            const confirmPassword = document.getElementById("registerConfirmPassword")?.value || "";
            
            // Check for selected role radio or select
            let role = "candidate";
            const roleRadio = document.querySelector('input[name="registerRole"]:checked');
            if (roleRadio) {
                role = roleRadio.value;
            } else {
                const roleSelect = document.getElementById("registerRole");
                if (roleSelect) role = roleSelect.value;
            }

            const submitBtn = document.getElementById("registerSubmitBtn");
            const messageEl = document.getElementById("registerMessage");

            if (!username || !email || !password) {
                renderAlert(messageEl, "Please fill in all required fields (Username, Email, Password).", "danger");
                return;
            }

            if (password.length < 8) {
                renderAlert(messageEl, "Password must be at least 8 characters long.", "danger");
                return;
            }

            if (confirmPassword && password !== confirmPassword) {
                renderAlert(messageEl, "Passwords do not match.", "danger");
                return;
            }

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : "Create Account";
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Creating account...`;
            }

            renderAlert(messageEl, "", "");

            try {
                // Must send password_confirm to satisfy RegisterSerializer
                const payload = {
                    username: username,
                    email: email,
                    password: password,
                    password_confirm: confirmPassword || password,
                    role: role
                };
                // Only attach phone if non-empty to avoid MySQL unique key conflict with empty strings
                if (phone && phone.trim().length > 0) {
                    payload.phone = phone.trim();
                }

                await apiRequest("/auth/register/", "POST", payload);

                renderAlert(messageEl, '<i class="bi bi-check-circle me-1"></i> Account created successfully! Redirecting to sign in...', "success");
                showToast("Account created successfully! Please sign in.", "success");

                setTimeout(() => {
                    window.location.href = "/#login";
                }, 1200);

            } catch (error) {
                renderAlert(messageEl, `<i class="bi bi-exclamation-triangle me-1"></i> ${error.message}`, "danger");
                showToast(error.message, "danger");
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    // Helper for rendering alert boxes
    function renderAlert(element, message, type) {
        if (!element) return;
        if (!message) {
            element.innerHTML = "";
            element.className = "";
            return;
        }
        element.className = `alert alert-${type} d-flex align-items-center mt-3 shadow-sm py-2 px-3 fade show`;
        element.role = "alert";
        element.innerHTML = `<div>${message}</div>`;
    }
});