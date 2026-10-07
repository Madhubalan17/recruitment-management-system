/**
 * HireHub Applications JavaScript
 * Handles Candidate Applications List, Status Filtering, and Application Withdrawal
 */

let allApplicationsList = [];
let currentFilter = "all";

async function loadApplications() {
    const container = document.getElementById("applicationsContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 fw-semibold text-muted">Retrieving your job applications...</p>
        </div>
    `;

    try {
        const response = await apiRequest("/applications/my/");
        allApplicationsList = response.data || response.results || response || [];

        renderFilteredApplications();
        updateApplicationsCounts();

    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger shadow-sm d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                <div>${error.message}</div>
            </div>
        `;
    }
}

function updateApplicationsCounts() {
    const countBadge = document.getElementById("appsTotalCount");
    if (countBadge) {
        countBadge.textContent = allApplicationsList.length;
    }
}

function filterApplications(status, btnElement) {
    currentFilter = status;

    // Update active tab button style
    document.querySelectorAll(".app-filter-btn").forEach(btn => {
        btn.classList.remove("btn-primary");
        btn.classList.add("btn-light-custom");
    });
    if (btnElement) {
        btnElement.classList.remove("btn-light-custom");
        btnElement.classList.add("btn-primary");
    }

    renderFilteredApplications();
}

function renderFilteredApplications() {
    const container = document.getElementById("applicationsContainer");
    if (!container) return;

    let filtered = allApplicationsList;
    if (currentFilter !== "all") {
        filtered = allApplicationsList.filter(app => (app.status || "").toLowerCase() === currentFilter.toLowerCase());
    }

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-file-earmark-x"></i>
                </div>
                <h4 class="fw-bold">No applications found</h4>
                <p class="text-muted mb-3">
                    ${currentFilter === 'all' 
                        ? "You haven't applied to any job postings yet. Explore open roles today!" 
                        : `No applications with status "${currentFilter}".`}
                </p>
                <a href="/jobs/" class="btn btn-primary btn-sm">
                    <i class="bi bi-search me-1"></i> Browse Jobs
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(app => {
        const status = (app.status || "applied").toLowerCase();
        const statusBadgeClass = `status-${status}`;
        const canWithdraw = !["selected", "rejected", "withdrawn"].includes(status);
        const appliedDate = app.applied_at ? new Date(app.applied_at).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' }) : "-";

        return `
            <div class="card-custom mb-3 p-4 bg-white shadow-sm card-hover">
                <div class="row align-items-center gy-3">
                    <div class="col-lg-6 col-md-7">
                        <div class="d-flex align-items-start gap-3">
                            <div class="company-logo-avatar mt-1">
                                ${(app.company_name || "C").charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h5 class="fw-bold mb-1">
                                    <a href="/job-details/?id=${app.job}" class="text-dark hover-primary">${app.job_title || "Job Application"}</a>
                                </h5>
                                <div class="text-muted small fw-medium mb-1">
                                    <i class="bi bi-building me-1 text-primary"></i>${app.company_name || "Company"}
                                    <span class="mx-1">•</span>
                                    <i class="bi bi-geo-alt me-1 text-danger"></i>${app.job_location || "Remote"}
                                </div>
                                <div class="small text-muted">
                                    <i class="bi bi-calendar-check me-1"></i>Applied on ${appliedDate}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-3 col-md-5 text-md-center">
                        <span class="status-badge ${statusBadgeClass} px-3 py-2 fs-6">
                            <i class="bi bi-circle-fill" style="font-size: 0.55rem;"></i>
                            ${status}
                        </span>
                        ${app.employer_message ? `
                            <div class="mt-2 small text-info fw-semibold">
                                <i class="bi bi-chat-quote-fill me-1"></i>Message from Employer
                            </div>
                        ` : ''}
                    </div>

                    <div class="col-lg-3 col-md-12 text-lg-end d-flex justify-content-lg-end gap-2 flex-wrap">
                        <a href="/job-details/?id=${app.job}" class="btn btn-outline-primary btn-sm">
                            <i class="bi bi-eye"></i> View Job
                        </a>
                        ${canWithdraw ? `
                            <button class="btn btn-outline-danger btn-sm" onclick="confirmWithdraw(${app.id}, '${escapeQuote(app.job_title)}')">
                                <i class="bi bi-x-circle"></i> Withdraw
                            </button>
                        ` : ''}
                    </div>
                </div>

                ${app.employer_message ? `
                    <div class="alert alert-light border mt-3 mb-0 py-2 px-3 small">
                        <strong><i class="bi bi-info-circle me-1 text-primary"></i>Employer Note:</strong>
                        <span class="text-secondary">${app.employer_message}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }).join("");
}

// -------------------------------------------------------------
// WITHDRAW APPLICATION CONFIRMATION & API CALL
// -------------------------------------------------------------

let withdrawTargetId = null;

function confirmWithdraw(appId, jobTitle) {
    withdrawTargetId = appId;
    const titleEl = document.getElementById("withdrawJobTitle");
    if (titleEl) titleEl.textContent = jobTitle || "this job";

    const modalEl = document.getElementById("withdrawModal");
    if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

async function executeWithdraw() {
    if (!withdrawTargetId) return;

    const btn = document.getElementById("confirmWithdrawBtn");
    const originalText = btn ? btn.innerHTML : "Confirm Withdraw";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Processing...`;
    }

    try {
        await apiRequest(`/applications/${withdrawTargetId}/withdraw/`, "POST");
        showToast("Application withdrawn successfully.", "success");

        const modalEl = document.getElementById("withdrawModal");
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        // Reload applications list
        loadApplications();
    } catch (error) {
        showToast(error.message, "danger");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
        withdrawTargetId = null;
    }
}

function escapeQuote(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("applicationsContainer")) {
        loadApplications();
    }
    const confirmBtn = document.getElementById("confirmWithdrawBtn");
    if (confirmBtn) {
        confirmBtn.addEventListener("click", executeWithdraw);
    }
});