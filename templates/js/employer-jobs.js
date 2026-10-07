/**
 * HireHub Employer Jobs Management JavaScript
 * Handles Job Posting, Listing, Applicant Review, Status Updating, and Interview Scheduling
 */

let activeJobIdForApplicants = null;

async function loadEmployerJobs() {
    const container = document.getElementById("employerJobsList");
    if (!container) return;

    const user = getCurrentUser();
    if (!user || user.role !== "employer") {
        showToast("Access restricted to employer accounts.", "warning");
        return;
    }

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted small">Loading your posted positions...</p>
        </div>
    `;

    try {
        const response = await apiRequest("/jobs/");
        const jobs = response.data || response.results || response || [];

        // Filter jobs posted by current user if employer ID is present
        const myJobs = jobs.filter(j => !j.employer || j.employer === user.id || (user.company && j.company === user.company));
        const displayJobs = myJobs.length > 0 ? myJobs : jobs;

        if (displayJobs.length === 0) {
            container.innerHTML = `
                <div class="empty-state py-4">
                    <div class="empty-state-icon"><i class="bi bi-briefcase"></i></div>
                    <h5 class="fw-bold">No jobs posted yet</h5>
                    <p class="text-muted small">Create your first job listing to start receiving candidate applications.</p>
                    <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#createJobModal">
                        <i class="bi bi-plus-circle me-1"></i> Post a Job
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small">
                        <tr>
                            <th>Job Title</th>
                            <th>Location</th>
                            <th>Type</th>
                            <th>Openings</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${displayJobs.map(job => `
                            <tr>
                                <td>
                                    <div class="fw-bold text-dark">${job.title}</div>
                                    <small class="text-muted">${job.skills ? job.skills.substring(0, 45) + '...' : ''}</small>
                                </td>
                                <td class="text-secondary small">
                                    <i class="bi bi-geo-alt me-1 text-danger"></i>${job.location || 'Remote'}
                                </td>
                                <td>
                                    <span class="badge bg-light text-dark border text-capitalize">
                                        ${(job.job_type || 'full_time').replace('_', ' ')}
                                    </span>
                                </td>
                                <td class="small fw-semibold">${job.openings || 1}</td>
                                <td>
                                    <span class="status-badge status-active">
                                        ${job.status || 'Active'}
                                    </span>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-primary btn-sm me-1" onclick="openApplicantsModal(${job.id}, '${escapeQuote(job.title)}')">
                                        <i class="bi bi-people-fill me-1"></i> Applicants
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm" onclick="deleteJob(${job.id})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger py-2 small">${error.message}</div>
        `;
    }
}

// -------------------------------------------------------------
// CREATE NEW JOB
// -------------------------------------------------------------

async function handleCreateJob(event) {
    event.preventDefault();

    const title = document.getElementById("jobTitle")?.value.trim();
    const location = document.getElementById("jobLocation")?.value.trim();
    const jobType = document.getElementById("jobType")?.value;
    const experience = document.getElementById("jobExperience")?.value;
    const minSalary = document.getElementById("jobMinSalary")?.value;
    const maxSalary = document.getElementById("jobMaxSalary")?.value;
    const openings = document.getElementById("jobOpenings")?.value || 1;
    const deadline = document.getElementById("jobDeadline")?.value;
    const skills = document.getElementById("jobSkills")?.value.trim();
    const description = document.getElementById("jobDescription")?.value.trim();

    const submitBtn = document.getElementById("createJobSubmitBtn");
    const msgEl = document.getElementById("jobMessage");

    const payload = {
        title,
        location,
        job_type: jobType,
        experience_level: experience,
        skills,
        description,
        openings: parseInt(openings)
    };

    if (minSalary) payload.min_salary = parseFloat(minSalary);
    if (maxSalary) payload.max_salary = parseFloat(maxSalary);
    if (deadline) payload.application_deadline = deadline;

    const originalText = submitBtn ? submitBtn.innerHTML : "Publish";
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Publishing...`;
    }

    try {
        await apiRequest("/jobs/create/", "POST", payload);
        showToast("Job opening published successfully!", "success");

        const modalEl = document.getElementById("createJobModal");
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
        }

        // Reset form
        document.getElementById("createJobForm")?.reset();
        loadEmployerJobs();

    } catch (error) {
        if (msgEl) {
            msgEl.className = "alert alert-danger py-2 mt-2";
            msgEl.innerHTML = error.message;
        }
        showToast(error.message, "danger");
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

// -------------------------------------------------------------
// DELETE JOB
// -------------------------------------------------------------

async function deleteJob(jobId) {
    if (!confirm("Are you sure you want to delete this job posting? This cannot be undone.")) {
        return;
    }

    try {
        await apiRequest(`/jobs/${jobId}/delete/`, "DELETE");
        showToast("Job posting deleted.", "success");
        loadEmployerJobs();
    } catch (error) {
        showToast(error.message, "danger");
    }
}

// -------------------------------------------------------------
// VIEW APPLICANTS FOR A JOB
// -------------------------------------------------------------

async function openApplicantsModal(jobId, jobTitle) {
    activeJobIdForApplicants = jobId;

    const modalTitleEl = document.getElementById("applicantsModalJobTitle");
    if (modalTitleEl) modalTitleEl.textContent = jobTitle || "Job Applicants";

    const container = document.getElementById("applicantsModalBody");
    if (!container) return;

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted small">Fetching applicants...</p>
        </div>
    `;

    const modalEl = document.getElementById("applicantsModal");
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    try {
        const response = await apiRequest(`/applications/job/${jobId}/`);
        const applicants = response.data || response || [];

        if (!Array.isArray(applicants) || applicants.length === 0) {
            container.innerHTML = `
                <div class="empty-state py-4">
                    <div class="empty-state-icon"><i class="bi bi-people"></i></div>
                    <h6 class="fw-bold">No applicants yet</h6>
                    <p class="text-muted small">No candidates have applied for this job opening yet.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table align-middle">
                    <thead class="table-light small">
                        <tr>
                            <th>Candidate</th>
                            <th>Contact</th>
                            <th>Resume</th>
                            <th>Status</th>
                            <th class="text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applicants.map(app => `
                            <tr>
                                <td>
                                    <div class="fw-bold text-dark">${app.candidate_name || "Applicant"}</div>
                                    <small class="text-muted">Applied: ${app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '-'}</small>
                                </td>
                                <td class="small">
                                    <div><i class="bi bi-envelope me-1 text-muted"></i>${app.candidate_email || "-"}</div>
                                </td>
                                <td>
                                    ${app.resume ? `
                                        <a href="${app.resume}" target="_blank" class="btn btn-outline-primary btn-sm">
                                            <i class="bi bi-file-earmark-pdf me-1"></i> Resume
                                        </a>
                                    ` : '<span class="text-muted small">No file</span>'}
                                </td>
                                <td>
                                    <select class="form-select form-select-sm" onchange="updateApplicantStatus(${app.id}, this.value)">
                                        <option value="applied" ${app.status === 'applied' ? 'selected' : ''}>Applied</option>
                                        <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                                        <option value="interview" ${app.status === 'interview' ? 'selected' : ''}>Interview</option>
                                        <option value="selected" ${app.status === 'selected' ? 'selected' : ''}>Selected</option>
                                        <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                    </select>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-outline-info btn-sm" onclick="openScheduleInterviewModal(${app.id}, '${escapeQuote(app.candidate_name)}')">
                                        <i class="bi bi-calendar-plus"></i> Schedule
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger py-2 small">${error.message}</div>
        `;
    }
}

async function updateApplicantStatus(applicationId, newStatus) {
    try {
        await apiRequest(`/applications/${applicationId}/status/`, "PATCH", {
            status: newStatus
        });
        showToast(`Candidate status updated to "${newStatus}".`, "success");
    } catch (error) {
        showToast(error.message, "danger");
    }
}

// -------------------------------------------------------------
// SCHEDULE INTERVIEW
// -------------------------------------------------------------

function openScheduleInterviewModal(applicationId, candidateName) {
    document.getElementById("schedAppId").value = applicationId;
    document.getElementById("schedCandidateName").textContent = candidateName || "Candidate";

    const modal = new bootstrap.Modal(document.getElementById("scheduleInterviewModal"));
    modal.show();
}

async function handleScheduleInterview(event) {
    event.preventDefault();

    const applicationId = document.getElementById("schedAppId")?.value;
    const date = document.getElementById("schedDate")?.value;
    const time = document.getElementById("schedTime")?.value;
    const type = document.getElementById("schedType")?.value;
    const interviewerName = document.getElementById("schedInterviewerName")?.value.trim();
    const meetingLink = document.getElementById("schedMeetingLink")?.value.trim();
    const notes = document.getElementById("schedNotes")?.value.trim();

    const submitBtn = document.getElementById("schedSubmitBtn");

    const payload = {
        application: parseInt(applicationId),
        interview_date: date,
        interview_time: time,
        interview_type: type,
        interviewer_name: interviewerName,
        meeting_link: meetingLink,
        notes: notes
    };

    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Scheduling...`;

    try {
        await apiRequest("/interviews/create/", "POST", payload);
        showToast("Interview scheduled successfully! Candidate notified.", "success");

        const modalEl = document.getElementById("scheduleInterviewModal");
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();

    } catch (error) {
        showToast(error.message, "danger");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

function escapeQuote(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("employerJobsList")) {
        loadEmployerJobs();
    }
    const createJobForm = document.getElementById("createJobForm");
    if (createJobForm) {
        createJobForm.addEventListener("submit", handleCreateJob);
    }
    const scheduleForm = document.getElementById("scheduleInterviewForm");
    if (scheduleForm) {
        scheduleForm.addEventListener("submit", handleScheduleInterview);
    }
});
