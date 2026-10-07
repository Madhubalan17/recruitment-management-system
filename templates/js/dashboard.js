/**
 * HireHub Dashboard JavaScript
 * Handles Dynamic Role-Based Analytics (Candidate vs Employer), KPI Metrics, and Quick Actions
 */

async function loadDashboard() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = "/#login";
        return;
    }

    // Set greeting and role badges
    const usernameEl = document.getElementById("dashboardUsername");
    const roleBadgeEl = document.getElementById("dashboardRoleBadge");
    if (usernameEl) usernameEl.textContent = user.username || "User";
    if (roleBadgeEl) {
        roleBadgeEl.textContent = user.role === "employer" ? "Employer" : "Candidate";
        roleBadgeEl.className = `badge ${user.role === "employer" ? "bg-warning text-dark" : "bg-primary"} text-capitalize`;
    }

    // Profile card
    const profileEl = document.getElementById("profileInfo");
    if (profileEl) {
        profileEl.innerHTML = `
            <div class="list-group list-group-flush small">
                <div class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Username</span>
                    <strong class="text-dark">${user.username || "-"}</strong>
                </div>
                <div class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Email</span>
                    <strong class="text-dark">${user.email || "-"}</strong>
                </div>
                <div class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Phone</span>
                    <strong class="text-dark">${user.phone || "Not set"}</strong>
                </div>
                <div class="list-group-item d-flex justify-content-between px-0 py-2">
                    <span class="text-muted">Account Type</span>
                    <strong class="text-capitalize text-primary">${user.role || "Candidate"}</strong>
                </div>
            </div>
        `;
    }

    // Load role-specific metrics & sections
    if (user.role === "employer") {
        await loadEmployerDashboard();
    } else {
        await loadCandidateDashboard();
    }
}

async function loadCandidateDashboard() {
    // Stat cards elements
    const appCountEl = document.getElementById("statCount1");
    const shortlistCountEl = document.getElementById("statCount2");
    const interviewCountEl = document.getElementById("statCount3");
    const jobsCountEl = document.getElementById("statCount4");

    // Labels
    document.getElementById("statLabel1").textContent = "Total Applied";
    document.getElementById("statLabel2").textContent = "Shortlisted";
    document.getElementById("statLabel3").textContent = "Interviews";
    document.getElementById("statLabel4").textContent = "Open Jobs";

    // Set icons
    document.getElementById("statIcon1").className = "bi bi-file-earmark-text";
    document.getElementById("statIcon2").className = "bi bi-bookmark-check";
    document.getElementById("statIcon3").className = "bi bi-calendar2-week";
    document.getElementById("statIcon4").className = "bi bi-briefcase";

    // Dynamic Quick Actions
    const quickActionsEl = document.getElementById("dashboardQuickActions");
    if (quickActionsEl) {
        quickActionsEl.innerHTML = `
            <div class="col-md-3 col-6">
                <a href="/jobs/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem;">
                        <i class="bi bi-search"></i>
                    </div>
                    <span class="fw-semibold small d-block">Search Jobs</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/applications/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #ecfdf5; color: #10b981;">
                        <i class="bi bi-file-earmark-check"></i>
                    </div>
                    <span class="fw-semibold small d-block">My Applications</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/interviews/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #faf5ff; color: #8b5cf6;">
                        <i class="bi bi-camera-video"></i>
                    </div>
                    <span class="fw-semibold small d-block">My Interviews</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/jobs/?experience=fresher" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #fffbeb; color: #f59e0b;">
                        <i class="bi bi-stars"></i>
                    </div>
                    <span class="fw-semibold small d-block">Entry Level</span>
                </a>
            </div>
        `;
    }

    try {
        // Fetch applications
        const appsRes = await apiRequest("/applications/my/");
        const apps = appsRes.data || appsRes.results || appsRes || [];
        if (appCountEl) appCountEl.textContent = apps.length;

        const shortlisted = apps.filter(a => a.status === "shortlisted");
        if (shortlistCountEl) shortlistCountEl.textContent = shortlisted.length;

        // Fetch interviews
        const intRes = await apiRequest("/interviews/my/");
        const interviews = intRes.data || intRes.results || intRes || [];
        if (interviewCountEl) interviewCountEl.textContent = interviews.length;

        // Fetch jobs total
        const jobsRes = await apiRequest("/jobs/");
        const jobs = jobsRes.data || jobsRes.results || jobsRes || [];
        if (jobsCountEl) jobsCountEl.textContent = Array.isArray(jobs) ? jobs.length : "10+";

        // Render recent applications preview
        const recentSection = document.getElementById("dashboardRecentSection");
        if (recentSection) {
            if (apps.length === 0) {
                recentSection.innerHTML = `
                    <div class="empty-state py-4">
                        <i class="bi bi-file-earmark-text fs-1 text-muted mb-2"></i>
                        <h6 class="fw-bold">No active applications</h6>
                        <p class="small text-muted mb-3">You haven't applied for any positions yet.</p>
                        <a href="/jobs/" class="btn btn-primary btn-sm">Find Jobs Now</a>
                    </div>
                `;
            } else {
                recentSection.innerHTML = `
                    <div class="table-responsive">
                        <table class="table align-middle mb-0">
                            <thead class="table-light small">
                                <tr>
                                    <th>Job Title</th>
                                    <th>Company</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${apps.slice(0, 5).map(a => `
                                    <tr>
                                        <td class="fw-semibold">
                                            <a href="/job-details/?id=${a.job}" class="text-dark">${a.job_title || "Job"}</a>
                                        </td>
                                        <td class="text-muted small">${a.company_name || "-"}</td>
                                        <td class="text-muted small">${a.applied_at ? new Date(a.applied_at).toLocaleDateString() : '-'}</td>
                                        <td>
                                            <span class="status-badge status-${(a.status || 'applied').toLowerCase()}">${a.status || 'applied'}</span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `;
            }
        }

    } catch (e) {
        console.warn("Dashboard data load error:", e);
    }
}

async function loadEmployerDashboard() {
    // Stat cards elements for Employer
    const stat1 = document.getElementById("statCount1");
    const stat2 = document.getElementById("statCount2");
    const stat3 = document.getElementById("statCount3");
    const stat4 = document.getElementById("statCount4");

    // Labels
    document.getElementById("statLabel1").textContent = "Active Jobs";
    document.getElementById("statLabel2").textContent = "Applicants";
    document.getElementById("statLabel3").textContent = "Interviews";
    document.getElementById("statLabel4").textContent = "Company Profile";

    // Set icons
    document.getElementById("statIcon1").className = "bi bi-briefcase";
    document.getElementById("statIcon2").className = "bi bi-people";
    document.getElementById("statIcon3").className = "bi bi-calendar2-check";
    document.getElementById("statIcon4").className = "bi bi-building";

    // Quick Actions
    const quickActionsEl = document.getElementById("dashboardQuickActions");
    if (quickActionsEl) {
        quickActionsEl.innerHTML = `
            <div class="col-md-3 col-6">
                <a href="/employer-jobs/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem;">
                        <i class="bi bi-plus-circle"></i>
                    </div>
                    <span class="fw-semibold small d-block">Post New Job</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/employer-jobs/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #ecfdf5; color: #10b981;">
                        <i class="bi bi-briefcase"></i>
                    </div>
                    <span class="fw-semibold small d-block">Manage Jobs</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/company/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #faf5ff; color: #8b5cf6;">
                        <i class="bi bi-building"></i>
                    </div>
                    <span class="fw-semibold small d-block">Company Info</span>
                </a>
            </div>
            <div class="col-md-3 col-6">
                <a href="/interviews/" class="card-custom p-3 text-center d-block bg-white text-dark card-hover text-decoration-none">
                    <div class="feature-icon-circle mx-auto mb-2" style="width: 44px; height: 44px; font-size: 1.25rem; background: #fffbeb; color: #f59e0b;">
                        <i class="bi bi-calendar-event"></i>
                    </div>
                    <span class="fw-semibold small d-block">Interviews</span>
                </a>
            </div>
        `;
    }

    try {
        // Fetch employer interviews
        const intRes = await apiRequest("/interviews/employer/");
        const interviews = intRes.data || intRes.results || intRes || [];
        if (stat3) stat3.textContent = interviews.length;

        // Fetch company
        try {
            const compRes = await apiRequest("/companies/me/");
            if (stat4) stat4.textContent = "Verified";
        } catch {
            if (stat4) stat4.textContent = "Setup Needed";
        }

        // Fetch all jobs
        const jobsRes = await apiRequest("/jobs/");
        const allJobs = jobsRes.data || jobsRes.results || jobsRes || [];
        if (stat1) stat1.textContent = allJobs.length;
        if (stat2) stat2.textContent = "Active";

        const recentSection = document.getElementById("dashboardRecentSection");
        if (recentSection) {
            recentSection.innerHTML = `
                <div class="p-3 bg-light rounded text-center">
                    <h6 class="fw-bold mb-1">Employer Control Center</h6>
                    <p class="small text-muted mb-3">You can create new job openings and review incoming candidate applications directly from the Employer Jobs portal.</p>
                    <a href="/employer-jobs/" class="btn btn-primary btn-sm">
                        <i class="bi bi-briefcase me-1"></i> Open Employer Jobs & Applicants
                    </a>
                </div>
            `;
        }

    } catch (e) {
        console.warn("Employer dashboard error:", e);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    if (document.getElementById("dashboardUsername")) {
        loadDashboard();
    }
});