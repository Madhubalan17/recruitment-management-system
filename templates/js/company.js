/**
 * HireHub Company JavaScript
 * Handles Employer Company Profile View, Creation, and Editing
 */

async function loadCompany() {
    const container = document.getElementById("companyContainer");
    if (!container) return;

    const user = getCurrentUser();
    if (!user) {
        window.location.href = "/#login";
        return;
    }

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 fw-semibold text-muted">Loading company profile...</p>
        </div>
    `;

    try {
        const response = await apiRequest("/companies/me/");
        const company = response.data || response.company || response;
        renderCompanyProfile(company);
    } catch (error) {
        // If 404, employer hasn't created company yet
        if (error.message.includes("not found") || error.message.includes("404")) {
            renderCompanyCreateForm();
        } else {
            container.innerHTML = `
                <div class="alert alert-danger shadow-sm">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i> ${error.message}
                </div>
            `;
        }
    }
}

function renderCompanyProfile(company) {
    const container = document.getElementById("companyContainer");
    if (!container) return;

    const initial = (company.company_name || "C").charAt(0).toUpperCase();

    container.innerHTML = `
        <div class="card-custom bg-white p-4 p-md-5 shadow-sm">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 pb-4 border-bottom mb-4">
                <div class="d-flex align-items-center gap-3">
                    ${company.logo ? `
                        <img src="${company.logo}" alt="${company.company_name}" class="rounded-3 shadow-sm" style="width: 72px; height: 72px; object-fit: cover;">
                    ` : `
                        <div class="company-logo-avatar fs-2" style="width: 72px; height: 72px;">
                            ${initial}
                        </div>
                    `}
                    <div>
                        <span class="badge bg-primary-subtle text-primary border mb-1">Registered Employer</span>
                        <h2 class="fw-bold mb-1">${company.company_name || "Your Company"}</h2>
                        <div class="text-muted fw-medium small">
                            <i class="bi bi-geo-alt text-danger me-1"></i>${company.location || "Location not set"}
                        </div>
                    </div>
                </div>

                <div class="d-flex gap-2">
                    <a href="/employer-jobs/" class="btn btn-primary">
                        <i class="bi bi-briefcase me-1"></i> Manage Posted Jobs
                    </a>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                        <small class="text-muted fw-semibold d-block">INDUSTRY</small>
                        <span class="fw-bold text-dark fs-6">${company.industry || "General / Technology"}</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                        <small class="text-muted fw-semibold d-block">COMPANY SIZE</small>
                        <span class="fw-bold text-dark fs-6">${company.employee_count ? company.employee_count + ' Employees' : 'Not specified'}</span>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="p-3 bg-light rounded-3 border">
                        <small class="text-muted fw-semibold d-block">WEBSITE</small>
                        ${company.website ? `
                            <a href="${company.website}" target="_blank" rel="noopener noreferrer" class="fw-bold text-primary text-truncate d-block">
                                <i class="bi bi-box-arrow-up-right me-1"></i>Visit Website
                            </a>
                        ` : '<span class="text-muted">Not specified</span>'}
                    </div>
                </div>
            </div>

            <!-- Description -->
            <div class="mb-4">
                <h5 class="fw-bold mb-3"><i class="bi bi-card-text me-2 text-primary"></i>About The Company</h5>
                <p class="text-secondary lh-lg" style="white-space: pre-line;">
                    ${company.description || "No company description provided yet."}
                </p>
            </div>
        </div>
    `;
}

function renderCompanyCreateForm() {
    const container = document.getElementById("companyContainer");
    if (!container) return;

    container.innerHTML = `
        <div class="card-custom bg-white p-4 p-md-5 shadow-sm">
            <div class="text-center mb-4">
                <div class="feature-icon-circle mx-auto mb-3" style="width: 64px; height: 64px;">
                    <i class="bi bi-building fs-2"></i>
                </div>
                <h3 class="fw-bold mb-1">Set Up Your Company Profile</h3>
                <p class="text-muted">Create your company identity so job seekers can learn more about your organization.</p>
            </div>

            <form id="createCompanyForm" class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Company Name *</label>
                    <input type="text" id="companyNameInput" class="form-control" placeholder="e.g. Acme Technologies" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Industry *</label>
                    <input type="text" id="companyIndustryInput" class="form-control" placeholder="e.g. Information Technology" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Location (City, Country) *</label>
                    <input type="text" id="companyLocationInput" class="form-control" placeholder="e.g. Bangalore, India" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Employee Count</label>
                    <input type="number" id="companyEmployeesInput" class="form-control" placeholder="e.g. 50" min="1">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Website URL</label>
                    <input type="url" id="companyWebsiteInput" class="form-control" placeholder="https://example.com">
                </div>

                <div class="col-md-6">
                    <label class="form-label">Company Logo</label>
                    <input type="file" id="companyLogoInput" class="form-control" accept="image/*">
                </div>

                <div class="col-12">
                    <label class="form-label">Company Description *</label>
                    <textarea id="companyDescriptionInput" class="form-control" rows="4" placeholder="Describe your company culture, mission, and products..." required></textarea>
                </div>

                <div class="col-12 text-end mt-4">
                    <button type="submit" id="saveCompanyBtn" class="btn btn-primary btn-lg">
                        <i class="bi bi-check-circle me-1"></i> Save Company Profile
                    </button>
                </div>

                <div id="companyFormMsg" class="col-12 mt-3"></div>
            </form>
        </div>
    `;

    const form = document.getElementById("createCompanyForm");
    if (form) {
        form.addEventListener("submit", handleCompanySubmit);
    }
}

async function handleCompanySubmit(event) {
    event.preventDefault();

    const name = document.getElementById("companyNameInput")?.value.trim();
    const industry = document.getElementById("companyIndustryInput")?.value.trim();
    const location = document.getElementById("companyLocationInput")?.value.trim();
    const employees = document.getElementById("companyEmployeesInput")?.value;
    const website = document.getElementById("companyWebsiteInput")?.value.trim();
    const description = document.getElementById("companyDescriptionInput")?.value.trim();
    const logoInput = document.getElementById("companyLogoInput");

    const submitBtn = document.getElementById("saveCompanyBtn");
    const msgEl = document.getElementById("companyFormMsg");

    const formData = new FormData();
    formData.append("company_name", name);
    formData.append("industry", industry);
    formData.append("location", location);
    formData.append("description", description);
    if (employees) formData.append("employee_count", employees);
    if (website) formData.append("website", website);
    if (logoInput && logoInput.files && logoInput.files.length > 0) {
        formData.append("logo", logoInput.files[0]);
    }

    const originalText = submitBtn ? submitBtn.innerHTML : "Save";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Saving profile...`;
    }

    try {
        await apiRequest("/companies/create/", "POST", formData, true);
        showToast("Company profile created successfully!", "success");
        loadCompany();
    } catch (error) {
        if (msgEl) {
            msgEl.innerHTML = `<div class="alert alert-danger py-2">${error.message}</div>`;
        }
        showToast(error.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("companyContainer")) {
        loadCompany();
    }
});