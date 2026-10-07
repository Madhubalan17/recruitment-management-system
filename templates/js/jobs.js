/**
 * HireHub Jobs Management JavaScript
 * Handles Job Search, Filters, Job Details, and Candidate Application Modal Submission
 */

// -------------------------------------------------------------
// LOAD JOBS LIST WITH FILTERS & PAGINATION
// -------------------------------------------------------------

async function loadJobs() {
    const container = document.getElementById("jobsContainer");
    if (!container) return;

    const searchInput = document.getElementById("searchInput");
    const locationInput = document.getElementById("locationInput");
    const experienceInput = document.getElementById("experienceInput");
    const jobTypeInput = document.getElementById("jobTypeInput");

    const search = searchInput ? searchInput.value.trim() : "";
    const location = locationInput ? locationInput.value.trim() : "";
    const experience = experienceInput ? experienceInput.value : "";
    const jobType = jobTypeInput ? jobTypeInput.value : "";

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (location) params.append("location", location);
    if (experience) params.append("experience", experience);
    if (jobType) params.append("job_type", jobType);

    // Show loading skeleton / spinner
    container.innerHTML = `
        <div class="col-12 loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 fw-semibold text-muted">Finding matching opportunities...</p>
        </div>
    `;

    try {
        const query = params.toString() ? `?${params.toString()}` : "";
        const response = await apiRequest(`/jobs/${query}`);
        const jobs = response.data || response.results || response;

        const countBadge = document.getElementById("jobsCountBadge");
        if (countBadge) {
            countBadge.textContent = Array.isArray(jobs) ? `${jobs.length} jobs found` : "0 jobs";
        }

        if (!Array.isArray(jobs) || jobs.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <div class="empty-state-icon">
                            <i class="bi bi-search"></i>
                        </div>
                        <h4 class="fw-bold">No jobs matched your search</h4>
                        <p class="text-muted mb-3">Try adjusting your keywords, removing location filters, or resetting filters.</p>
                        <button class="btn btn-outline-primary btn-sm" onclick="resetJobFilters()">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Filters
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = jobs.map(job => {
            const companyName = job.company_name || "Company";
            const initial = companyName.charAt(0).toUpperCase();
            const salaryText = job.min_salary 
                ? (job.max_salary ? `₹${Number(job.min_salary).toLocaleString()} - ₹${Number(job.max_salary).toLocaleString()}` : `₹${Number(job.min_salary).toLocaleString()}`) 
                : "Competitive Salary";
            
            // Format job type label
            const jobTypeFormatted = (job.job_type || "Full Time").replace("_", " ");
            const expFormatted = (job.experience_level || "Fresher").replace("_", " ");

            // Skills array
            let skillsBadges = "";
            if (job.skills) {
                const skillsList = job.skills.split(",").slice(0, 3);
                skillsBadges = skillsList.map(s => `<span class="badge bg-light text-dark border me-1">${s.trim()}</span>`).join("");
            }

            return `
                <div class="col-lg-6 col-12 mb-4">
                    <div class="job-card h-100">
                        <div>
                            <div class="d-flex align-items-start justify-content-between mb-3">
                                <div class="d-flex align-items-center gap-3">
                                    <div class="company-logo-avatar">
                                        ${initial}
                                    </div>
                                    <div>
                                        <h5 class="mb-0 fw-bold">
                                            <a href="/job-details/?id=${job.id}" class="text-dark hover-primary">${job.title || "Untitled Job"}</a>
                                        </h5>
                                        <div class="text-muted small fw-medium">
                                            <i class="bi bi-building me-1"></i>${companyName}
                                        </div>
                                    </div>
                                </div>
                                <span class="badge bg-primary-subtle text-primary fw-semibold px-2 py-1 text-capitalize">
                                    ${jobTypeFormatted}
                                </span>
                            </div>

                            <div class="d-flex flex-wrap gap-2 mb-3">
                                <span class="meta-tag">
                                    <i class="bi bi-geo-alt text-primary"></i> ${job.location || "Remote"}
                                </span>
                                <span class="meta-tag">
                                    <i class="bi bi-mortarboard text-secondary"></i> ${expFormatted}
                                </span>
                                <span class="meta-tag text-success fw-semibold">
                                    <i class="bi bi-cash-stack"></i> ${salaryText}
                                </span>
                            </div>

                            <p class="text-muted small mb-3" style="line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                                ${job.description || "Exciting role at a growing company. Click to view full requirements."}
                            </p>

                            <div class="mb-3">
                                ${skillsBadges}
                            </div>
                        </div>

                        <div class="d-flex align-items-center justify-content-between pt-3 border-top mt-auto">
                            <span class="small text-muted">
                                <i class="bi bi-clock me-1"></i>Active Opening
                            </span>
                            <div class="d-flex gap-2">
                                <a href="/job-details/?id=${job.id}" class="btn btn-outline-primary btn-sm">
                                    Details <i class="bi bi-arrow-right"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger d-flex align-items-center shadow-sm" role="alert">
                    <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>Failed to load jobs: ${error.message}</div>
                </div>
            </div>
        `;
    }
}

function resetJobFilters() {
    const s = document.getElementById("searchInput");
    const l = document.getElementById("locationInput");
    const e = document.getElementById("experienceInput");
    const t = document.getElementById("jobTypeInput");
    if (s) s.value = "";
    if (l) l.value = "";
    if (e) e.value = "";
    if (t) t.value = "";
    loadJobs();
}

// -------------------------------------------------------------
// LOAD SINGLE JOB DETAILS & APPLICATION MODAL
// -------------------------------------------------------------

async function loadJobDetails() {
    const container = document.getElementById("jobDetails");
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get("id");

    if (!jobId) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i class="bi bi-question-circle"></i></div>
                <h4 class="fw-bold">No Job Specified</h4>
                <p class="text-muted">Please select a job from the jobs directory.</p>
                <a href="/jobs/" class="btn btn-primary btn-sm"><i class="bi bi-arrow-left"></i> Browse Jobs</a>
            </div>
        `;
        return;
    }

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 fw-semibold text-muted">Loading job information...</p>
        </div>
    `;

    try {
        const data = await apiRequest(`/jobs/${jobId}/`);
        const job = data.data || data;

        const companyName = job.company_name || "Company";
        const initial = companyName.charAt(0).toUpperCase();
        const salaryText = job.min_salary 
            ? (job.max_salary ? `₹${Number(job.min_salary).toLocaleString()} - ₹${Number(job.max_salary).toLocaleString()}` : `₹${Number(job.min_salary).toLocaleString()}`) 
            : "Competitive Salary";
        const jobTypeFormatted = (job.job_type || "Full Time").replace("_", " ");
        const expFormatted = (job.experience_level || "Fresher").replace("_", " ");

        // Skills tags
        const skillsList = job.skills ? job.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
        const skillsChips = skillsList.map(s => `<span class="badge bg-primary-subtle text-primary border px-3 py-2 fs-6 fw-medium me-2 mb-2">${s}</span>`).join("");

        container.innerHTML = `
            <div class="row g-4">
                <!-- Main Job Info Column -->
                <div class="col-lg-8">
                    <div class="card-custom p-4 p-md-5 mb-4 shadow-sm bg-white">
                        <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="company-logo-avatar fs-2" style="width: 64px; height: 64px;">
                                    ${initial}
                                </div>
                                <div>
                                    <h2 class="h3 fw-bold mb-1">${job.title}</h2>
                                    <div class="text-muted fw-semibold">
                                        <i class="bi bi-building me-1 text-primary"></i>${companyName}
                                        <span class="mx-2">•</span>
                                        <i class="bi bi-geo-alt me-1 text-danger"></i>${job.location || "Remote"}
                                    </div>
                                </div>
                            </div>
                            <div>
                                <button class="btn btn-primary btn-lg shadow" onclick="openApplyModal(${job.id}, '${escapeHtml(job.title)}')">
                                    <i class="bi bi-send-fill me-1"></i> Apply For Position
                                </button>
                            </div>
                        </div>

                        <div class="d-flex flex-wrap gap-2 p-3 bg-light rounded-3 mb-4">
                            <div class="me-4 mb-2">
                                <small class="text-muted d-block fw-semibold">JOB TYPE</small>
                                <span class="fw-bold text-dark text-capitalize">${jobTypeFormatted}</span>
                            </div>
                            <div class="me-4 mb-2">
                                <small class="text-muted d-block fw-semibold">EXPERIENCE</small>
                                <span class="fw-bold text-dark text-capitalize">${expFormatted}</span>
                            </div>
                            <div class="me-4 mb-2">
                                <small class="text-muted d-block fw-semibold">OFFERED SALARY</small>
                                <span class="fw-bold text-success">${salaryText}</span>
                            </div>
                            <div class="mb-2">
                                <small class="text-muted d-block fw-semibold">VACANCIES</small>
                                <span class="fw-bold text-dark">${job.openings || 1} Openings</span>
                            </div>
                        </div>

                        <!-- Job Description Section -->
                        <div class="mb-4">
                            <h4 class="fw-bold mb-3 border-bottom pb-2">
                                <i class="bi bi-file-text me-2 text-primary"></i>Job Description
                            </h4>
                            <div class="text-secondary lh-lg" style="white-space: pre-line;">
                                ${job.description || "No description provided."}
                            </div>
                        </div>

                        <!-- Required Skills Section -->
                        <div class="mb-4">
                            <h4 class="fw-bold mb-3 border-bottom pb-2">
                                <i class="bi bi-tools me-2 text-primary"></i>Required Skills & Competencies
                            </h4>
                            <div class="d-flex flex-wrap">
                                ${skillsChips || "<p class='text-muted'>No specific skills listed.</p>"}
                            </div>
                        </div>

                        <!-- Application Deadline Info -->
                        ${job.application_deadline ? `
                            <div class="alert alert-info d-flex align-items-center mb-0 mt-4">
                                <i class="bi bi-calendar-event fs-4 me-3"></i>
                                <div>
                                    <strong>Application Deadline:</strong> ${job.application_deadline}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Right Sidebar Column -->
                <div class="col-lg-4">
                    <div class="card-custom p-4 mb-4 shadow-sm bg-white">
                        <h5 class="fw-bold mb-3">About the Organization</h5>
                        <div class="d-flex align-items-center gap-3 mb-3">
                            <div class="company-logo-avatar">
                                ${initial}
                            </div>
                            <div>
                                <h6 class="fw-bold mb-0">${companyName}</h6>
                                <small class="text-muted">${job.location || "Headquarters"}</small>
                            </div>
                        </div>
                        <p class="small text-muted mb-4">
                            Verified employer posting on HireHub. Connect with the hiring team directly through our application tracking system.
                        </p>
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="openApplyModal(${job.id}, '${escapeHtml(job.title)}')">
                                <i class="bi bi-send-fill me-1"></i> Apply Now
                            </button>
                            <a href="/jobs/" class="btn btn-outline-secondary">
                                <i class="bi bi-arrow-left me-1"></i> Back to All Jobs
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger shadow-sm">
                <i class="bi bi-exclamation-triangle-fill me-2"></i> ${error.message}
            </div>
            <a href="/jobs/" class="btn btn-primary"><i class="bi bi-arrow-left"></i> Return to Jobs</a>
        `;
    }
}

// -------------------------------------------------------------
// APPLY MODAL POPUP & FORM SUBMISSION
// -------------------------------------------------------------

function openApplyModal(jobId, jobTitle) {
    const user = getCurrentUser();
    if (!user) {
        showToast("Please sign in as a candidate to apply for this job.", "warning");
        setTimeout(() => {
            window.location.href = `/#login`;
        }, 1200);
        return;
    }

    if (user.role === "employer") {
        showToast("Employers cannot apply for jobs. Please register or login with a candidate account.", "danger");
        return;
    }

    // Populate modal inputs
    const modalJobIdInput = document.getElementById("applyJobId");
    const modalJobTitleEl = document.getElementById("applyModalJobTitle");
    const applyMsgEl = document.getElementById("applyMessage");

    if (modalJobIdInput) modalJobIdInput.value = jobId;
    if (modalJobTitleEl) modalJobTitleEl.textContent = jobTitle || "Position";
    if (applyMsgEl) {
        applyMsgEl.innerHTML = "";
        applyMsgEl.className = "";
    }

    // Reset file input & cover letter
    const form = document.getElementById("jobApplyForm");
    if (form) form.reset();

    const applyModal = new bootstrap.Modal(document.getElementById("applyJobModal"));
    applyModal.show();
}

async function submitJobApplication(event) {
    event.preventDefault();

    const jobId = document.getElementById("applyJobId")?.value;
    const resumeInput = document.getElementById("applyResume");
    const coverLetterInput = document.getElementById("applyCoverLetter");
    const submitBtn = document.getElementById("applySubmitBtn");
    const messageEl = document.getElementById("applyMessage");

    if (!jobId) {
        showToast("Job ID is missing.", "danger");
        return;
    }

    if (!resumeInput || !resumeInput.files || resumeInput.files.length === 0) {
        if (messageEl) {
            messageEl.className = "alert alert-danger py-2 mt-2";
            messageEl.innerHTML = "Please select your resume file (.pdf, .doc, .docx).";
        }
        return;
    }

    const formData = new FormData();
    formData.append("job", jobId);
    formData.append("resume", resumeInput.files[0]);
    if (coverLetterInput && coverLetterInput.value.trim()) {
        formData.append("cover_letter", coverLetterInput.value.trim());
    }

    const originalText = submitBtn ? submitBtn.innerHTML : "Submit Application";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;
    }

    try {
        const response = await apiRequest("/applications/apply/", "POST", formData, true);
        
        if (messageEl) {
            messageEl.className = "alert alert-success py-2 mt-2";
            messageEl.innerHTML = '<i class="bi bi-check-circle me-1"></i> Application submitted successfully!';
        }
        showToast("Application submitted successfully!", "success");

        setTimeout(() => {
            const modalEl = document.getElementById("applyJobModal");
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            window.location.href = "/applications/";
        }, 1200);

    } catch (error) {
        if (messageEl) {
            messageEl.className = "alert alert-danger py-2 mt-2";
            messageEl.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> ${error.message}`;
        }
        showToast(error.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// -------------------------------------------------------------
// INITIALIZATION ON PAGE LOAD
// -------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    // Check if on jobs listing page
    if (document.getElementById("jobsContainer")) {
        // Read any search param from URL (e.g. from hero search)
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get("search");
        const locationParam = params.get("location");
        if (searchParam && document.getElementById("searchInput")) {
            document.getElementById("searchInput").value = searchParam;
        }
        if (locationParam && document.getElementById("locationInput")) {
            document.getElementById("locationInput").value = locationParam;
        }
        loadJobs();

        // Bind enter key on search inputs
        ["searchInput", "locationInput"].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("keypress", (e) => {
                    if (e.key === "Enter") loadJobs();
                });
            }
        });
    }

    // Check if on job details page
    if (document.getElementById("jobDetails")) {
        loadJobDetails();
    }

    // Bind apply form
    const applyForm = document.getElementById("jobApplyForm");
    if (applyForm) {
        applyForm.addEventListener("submit", submitJobApplication);
    }
});