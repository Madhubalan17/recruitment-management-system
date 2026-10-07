/**
 * HireHub Interviews JavaScript
 * Handles Candidate and Employer Interview Schedules, Meeting Links, and Statuses
 */

let allInterviewsList = [];

async function loadInterviews() {
    const container = document.getElementById("interviewsContainer");
    if (!container) return;

    const user = getCurrentUser();
    const endpoint = (user && user.role === "employer") ? "/interviews/employer/" : "/interviews/my/";

    container.innerHTML = `
        <div class="loading-spinner-wrap">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;"></div>
            <p class="mt-3 fw-semibold text-muted">Loading your scheduled interviews...</p>
        </div>
    `;

    try {
        const response = await apiRequest(endpoint);
        allInterviewsList = response.data || response.results || response || [];

        renderInterviews(allInterviewsList);

        const totalCountBadge = document.getElementById("interviewsTotalCount");
        if (totalCountBadge) {
            totalCountBadge.textContent = allInterviewsList.length;
        }

    } catch (error) {
        container.innerHTML = `
            <div class="alert alert-danger shadow-sm d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                <div>${error.message}</div>
            </div>
        `;
    }
}

function renderInterviews(interviews) {
    const container = document.getElementById("interviewsContainer");
    if (!container) return;

    if (!Array.isArray(interviews) || interviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-calendar2-x"></i>
                </div>
                <h4 class="fw-bold">No interviews scheduled yet</h4>
                <p class="text-muted mb-3">
                    When an employer schedules an interview with you, it will appear here with the date, time, and meeting details.
                </p>
                <a href="/jobs/" class="btn btn-primary btn-sm">
                    <i class="bi bi-briefcase me-1"></i> Explore More Jobs
                </a>
            </div>
        `;
        return;
    }

    container.innerHTML = interviews.map(item => {
        const status = (item.status || "scheduled").toLowerCase();
        const statusBadgeClass = `status-${status}`;
        const type = (item.interview_type || "online").toLowerCase();

        // Type icon & label
        let typeIcon = "bi-camera-video";
        let typeBadge = '<span class="badge bg-primary-subtle text-primary border"><i class="bi bi-camera-video me-1"></i>Online Video</span>';
        if (type === "phone") {
            typeIcon = "bi-telephone";
            typeBadge = '<span class="badge bg-warning-subtle text-warning border"><i class="bi bi-telephone me-1"></i>Phone Call</span>';
        } else if (type === "in_person") {
            typeIcon = "bi-geo-alt";
            typeBadge = '<span class="badge bg-success-subtle text-success border"><i class="bi bi-geo-alt me-1"></i>In-Person</span>';
        }

        const dateStr = item.interview_date ? new Date(item.interview_date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "-";
        const timeStr = item.interview_time || "-";

        return `
            <div class="card-custom mb-4 p-4 bg-white shadow-sm card-hover">
                <div class="row align-items-center gy-3">
                    <div class="col-lg-7 col-md-7">
                        <div class="d-flex align-items-start gap-3">
                            <div class="feature-icon-circle m-0 flex-shrink-0" style="width: 48px; height: 48px; font-size: 1.25rem;">
                                <i class="bi ${typeIcon}"></i>
                            </div>
                            <div>
                                <div class="d-flex align-items-center gap-2 mb-1 flex-wrap">
                                    <h5 class="fw-bold mb-0 text-dark">
                                        ${item.application_title || "Job Interview"}
                                    </h5>
                                    ${typeBadge}
                                </div>
                                
                                <div class="text-muted small fw-medium mb-2">
                                    <i class="bi bi-person-badge me-1 text-primary"></i>Interviewer: <strong>${item.interviewer_name || "Hiring Team"}</strong>
                                    ${item.interviewer_email ? `<span class="mx-1">•</span><i class="bi bi-envelope me-1"></i>${item.interviewer_email}` : ''}
                                </div>

                                <div class="d-flex flex-wrap gap-3 text-secondary small">
                                    <span>
                                        <i class="bi bi-calendar-event text-primary me-1"></i><strong>${dateStr}</strong>
                                    </span>
                                    <span>
                                        <i class="bi bi-clock text-warning me-1"></i><strong>${timeStr}</strong>
                                    </span>
                                    ${item.duration_minutes ? `<span><i class="bi bi-hourglass-split text-info me-1"></i>${item.duration_minutes} Mins</span>` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-2 col-md-5 text-md-center">
                        <span class="status-badge ${statusBadgeClass} px-3 py-2 fs-6">
                            <i class="bi bi-circle-fill" style="font-size: 0.55rem;"></i>
                            ${status}
                        </span>
                    </div>

                    <div class="col-lg-3 col-md-12 text-lg-end d-flex justify-content-lg-end gap-2 flex-wrap">
                        ${item.meeting_link ? `
                            <a href="${item.meeting_link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                                <i class="bi bi-box-arrow-up-right me-1"></i> Join Meeting
                            </a>
                        ` : ''}
                        ${item.location && type === 'in_person' ? `
                            <span class="btn btn-light-custom btn-sm text-truncate" style="max-width: 170px;" title="${item.location}">
                                <i class="bi bi-geo-alt text-danger me-1"></i>${item.location}
                            </span>
                        ` : ''}
                    </div>
                </div>

                ${item.notes ? `
                    <div class="mt-3 pt-3 border-top">
                        <small class="text-muted d-block fw-semibold mb-1">INTERVIEW NOTES & INSTRUCTIONS:</small>
                        <div class="p-2 bg-light rounded text-secondary small">
                            ${item.notes}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("interviewsContainer")) {
        loadInterviews();
    }
});