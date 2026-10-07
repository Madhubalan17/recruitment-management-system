/**
 * HireHub API Client & Frontend Utilities
 * Handles JWT Authentication, API Calls, Bootstrap UI alerts & Navbar State
 */

const API_BASE_URL = "/api";

// -------------------------------------------------------------
// TOKEN MANAGEMENT
// -------------------------------------------------------------

function getAccessToken() {
    return localStorage.getItem("access_token");
}

function getRefreshToken() {
    return localStorage.getItem("refresh_token");
}

function saveTokens(access, refresh) {
    if (access) {
        localStorage.setItem("access_token", access);
    }
    if (refresh) {
        localStorage.setItem("refresh_token", refresh);
    }
}

function saveCurrentUser(user) {
    if (user) {
        localStorage.setItem("user", JSON.stringify(user));
    }
}

function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function logoutUser() {
    const refresh = getRefreshToken();
    if (refresh) {
        fetch(`${API_BASE_URL}/auth/logout/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refresh })
        }).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/";
}

// -------------------------------------------------------------
// CORE FETCH WRAPPER
// -------------------------------------------------------------

async function apiRequest(endpoint, method = "GET", body = null, isFormData = false) {
    const token = getAccessToken();
    const headers = {};

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (!isFormData && body !== null) {
        headers["Content-Type"] = "application/json";
    }

    const options = {
        method: method,
        headers: headers
    };

    if (body !== null) {
        options.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(API_BASE_URL + endpoint, options);

    let data = {};
    try {
        data = await response.json();
    } catch (error) {
        data = {};
    }

    if (!response.ok) {
        let message = "";
        const errObj = data.errors || (!data.detail && !data.message ? data : null);

        if (errObj && typeof errObj === "object" && Object.keys(errObj).length > 0) {
            const keys = Object.keys(errObj);
            const errList = keys.map(k => {
                const val = errObj[k];
                const fieldName = k.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
                const cleanVal = Array.isArray(val) ? val.join(" ") : (typeof val === "object" ? JSON.stringify(val) : val);
                return `${fieldName}: ${cleanVal}`;
            });
            message = errList.join(" | ");
        } else if (data.detail) {
            message = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
        } else if (data.message) {
            message = typeof data.message === "string" ? data.message : JSON.stringify(data.message);
        } else {
            message = "An unexpected error occurred.";
        }

        throw new Error(message);
    }

    return data;
}

// -------------------------------------------------------------
// BOOTSTRAP TOAST & NOTIFICATION HELPERS
// -------------------------------------------------------------

function showToast(message, type = "info") {
    let container = document.getElementById("hhToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "hhToastContainer";
        container.className = "toast-container position-fixed top-0 end-0 p-3";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
    }

    const bgClass = type === "success" ? "text-bg-success"
                  : type === "danger" || type === "error" ? "text-bg-danger"
                  : type === "warning" ? "text-bg-warning"
                  : "text-bg-primary";

    const toastId = "toast_" + Date.now();
    const toastEl = document.createElement("div");
    toastEl.id = toastId;
    toastEl.className = `toast align-items-center ${bgClass} border-0 shadow-lg`;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body fw-medium">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toastEl);
    if (window.bootstrap && bootstrap.Toast) {
        const bsToast = new bootstrap.Toast(toastEl, { delay: 4000 });
        bsToast.show();
        toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
    } else {
        setTimeout(() => toastEl.remove(), 4000);
    }
}

// -------------------------------------------------------------
// DYNAMIC NAVBAR AUTH SYNCHRONIZATION
// -------------------------------------------------------------

function updateNavbarAuth() {
    const user = getCurrentUser();
    const authActions = document.getElementById("navbarAuthActions");
    const navLinksContainer = document.getElementById("navbarLinks");

    if (!authActions) return;

    if (user && user.username) {
        const initial = (user.username || "U").charAt(0).toUpperCase();
        const roleLabel = user.role === "employer" ? "Employer" : "Candidate";

        if (navLinksContainer) {
            let roleSpecificLinks = "";
            if (user.role === "employer") {
                roleSpecificLinks = `
                    <li class="nav-item"><a class="nav-link" href="/employer-jobs/"><i class="bi bi-briefcase me-1"></i>My Jobs</a></li>
                    <li class="nav-item"><a class="nav-link" href="/company/"><i class="bi bi-building me-1"></i>Company</a></li>
                `;
            } else {
                roleSpecificLinks = `
                    <li class="nav-item"><a class="nav-link" href="/applications/"><i class="bi bi-file-earmark-check me-1"></i>Applications</a></li>
                    <li class="nav-item"><a class="nav-link" href="/interviews/"><i class="bi bi-calendar-event me-1"></i>Interviews</a></li>
                `;
            }
            const dynamicSlot = document.getElementById("navDynamicLinks");
            if (dynamicSlot) {
                dynamicSlot.innerHTML = roleSpecificLinks;
            }
        }

        authActions.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light-custom dropdown-toggle d-flex align-items-center gap-2 py-1 px-2 border" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="user-avatar-badge">${initial}</div>
                    <span class="d-none d-md-inline fw-semibold text-start">
                        <span class="d-block lh-1 text-truncate" style="max-width: 110px;">${user.username}</span>
                        <small class="text-muted" style="font-size: 0.72rem;">${roleLabel}</small>
                    </span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-lg border-0 py-2" style="border-radius: var(--hh-radius-md); min-width: 210px;">
                    <li class="px-3 py-2 border-bottom mb-1">
                        <div class="fw-bold text-dark">${user.username}</div>
                        <div class="small text-muted text-truncate">${user.email || user.role}</div>
                    </li>
                    <li><a class="dropdown-item py-2" href="/dashboard/"><i class="bi bi-speedometer2 me-2 text-primary"></i>Dashboard</a></li>
                    ${user.role === 'employer' ? `
                        <li><a class="dropdown-item py-2" href="/employer-jobs/"><i class="bi bi-briefcase me-2 text-primary"></i>Manage Jobs</a></li>
                        <li><a class="dropdown-item py-2" href="/company/"><i class="bi bi-building me-2 text-primary"></i>Company Profile</a></li>
                    ` : `
                        <li><a class="dropdown-item py-2" href="/applications/"><i class="bi bi-file-earmark-text me-2 text-primary"></i>My Applications</a></li>
                        <li><a class="dropdown-item py-2" href="/interviews/"><i class="bi bi-calendar2-check me-2 text-primary"></i>My Interviews</a></li>
                    `}
                    <li><hr class="dropdown-divider my-1"></li>
                    <li><button class="dropdown-item text-danger py-2" onclick="logoutUser()"><i class="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                </ul>
            </div>
        `;
    } else {
        authActions.innerHTML = `
            <div class="d-flex align-items-center gap-2">
                <a href="/register/" class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-person-plus"></i> Register
                </a>
                <a href="/#login" class="btn btn-primary btn-sm">
                    <i class="bi bi-box-arrow-in-right"></i> Sign In
                </a>
            </div>
        `;
    }
}

// Auto init on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    updateNavbarAuth();
});