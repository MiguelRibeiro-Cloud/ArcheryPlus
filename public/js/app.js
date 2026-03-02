// ============================================================
// FPTA ArcheryPlus - Main Application Logic
// ============================================================

// State
let athletes = [...MOCK_ATHLETES];
let tournaments = [...MOCK_TOURNAMENTS];
let scores = [...MOCK_SCORES];
let payments = [...MOCK_PAYMENTS];
let currentPage = 'dashboard';
let currentAthleteFilter = { search: '', discipline: '', ageCategory: '', club: '', status: '' };
let currentTournamentFilter = 'all';
let currentPaymentFilter = 'all';
let calendarDate = new Date(2026, 2, 1); // March 2026
let charts = {};
let athleteSortBy = 'name';
let athleteSortDir = 'asc';

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLanguageToggle();
    initGlobalSearch();
    initModalOverlays();
    initKeyboardShortcuts();
    navigateTo('dashboard');
    translatePage();
    Chatbot.init();
});

// ---- Navigation ----
function initNavigation() {
    document.querySelectorAll('.nav-item[data-page]').forEach(item => {
        item.addEventListener('click', () => {
            navigateTo(item.getAttribute('data-page'));
        });
    });
}

function navigateTo(page) {
    currentPage = page;
    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (activeNav) activeNav.classList.add('active');
    // Show page
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(`page-${page}`);
    if (section) section.classList.add('active');
    // Render page
    renderPage(page);
    // Close mobile sidebar
    document.querySelector('.sidebar').classList.remove('open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.remove('active');
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update sidebar badges
    updateSidebarBadges();
}

function renderPage(page) {
    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'athletes': renderAthletes(); break;
        case 'tournaments': renderTournaments(); break;
        case 'standings': renderStandings(); break;
        case 'payments': renderPayments(); break;
        case 'calendar': renderCalendar(); break;
        case 'reports': renderReports(); break;
    }
}

// ---- Language Toggle ----
function initLanguageToggle() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setLanguage(btn.getAttribute('data-lang'));
            renderPage(currentPage);
        });
    });
    // Set initial
    const lang = getCurrentLanguage();
    document.querySelectorAll('.lang-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
}

// ---- Global Search ----
function initGlobalSearch() {
    const searchInput = document.getElementById('global-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (query.length >= 2) {
                const results = searchAll(query);
                showSearchResults(results);
            } else {
                hideSearchResults();
            }
        });
        searchInput.addEventListener('blur', () => setTimeout(hideSearchResults, 200));
    }
}

function searchAll(query) {
    const results = [];
    athletes.forEach(a => {
        const name = `${a.firstName} ${a.lastName}`.toLowerCase();
        if (name.includes(query) || a.licenseNumber.toLowerCase().includes(query)) {
            results.push({ type: 'athlete', id: a.id, text: `${a.firstName} ${a.lastName}`, sub: a.licenseNumber });
        }
    });
    tournaments.forEach(tourn => {
        if (tourn.name.toLowerCase().includes(query)) {
            results.push({ type: 'tournament', id: tourn.id, text: tourn.name, sub: tourn.date });
        }
    });
    return results.slice(0, 8);
}

function showSearchResults(results) {
    let dropdown = document.getElementById('search-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'search-dropdown';
        dropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:white;border:1px solid var(--border-color);border-radius:var(--radius-md);box-shadow:var(--shadow-lg);max-height:320px;overflow-y:auto;z-index:100;';
        document.querySelector('.header-search').appendChild(dropdown);
    }
    if (results.length === 0) {
        dropdown.innerHTML = `<div style="padding:16px;text-align:center;color:var(--text-light);font-size:0.85rem;">${t('common.noResults')}</div>`;
    } else {
        dropdown.innerHTML = results.map(r => `
            <div class="search-result-item" onclick="${r.type === 'athlete' ? `viewAthleteProfile(${r.id})` : `viewTournamentDetail(${r.id})`}" 
                 style="padding:10px 16px;cursor:pointer;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--border-color);transition:background 0.2s;"
                 onmouseover="this.style.background='var(--bg-primary)'" onmouseout="this.style.background='white'">
                <i class="fas ${r.type === 'athlete' ? 'fa-user' : 'fa-trophy'}" style="color:var(--text-light);width:16px;text-align:center;"></i>
                <div>
                    <div style="font-weight:600;font-size:0.88rem;">${r.text}</div>
                    <div style="font-size:0.75rem;color:var(--text-light);">${r.sub}</div>
                </div>
            </div>
        `).join('');
    }
    dropdown.style.display = 'block';
}

function hideSearchResults() {
    const dropdown = document.getElementById('search-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

// ---- Dashboard ----
function renderDashboard() {
    const activeAthletes = athletes.filter(a => a.status === 'active').length;
    const upcomingTournaments = tournaments.filter(tr => tr.status === 'upcoming').length;
    const upcomingEvents = MOCK_CALENDAR_EVENTS.filter(e => new Date(e.date) >= new Date('2026-03-02')).length;
    const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

    animateCounter('stat-athletes', activeAthletes);
    animateCounter('stat-tournaments', upcomingTournaments);
    animateCounter('stat-events', upcomingEvents);
    animateCounter('stat-revenue', totalPaid, '€');

    renderActivityLog();
    renderQuickActions();
    renderDashboardCharts();
    renderUpcomingTournamentsList();
}

function renderActivityLog() {
    const container = document.getElementById('activity-log');
    if (!container) return;
    const iconMap = {
        'athlete_registered': 'register', 'payment_received': 'payment',
        'tournament_updated': 'tournament', 'tournament_created': 'tournament',
        'score_entered': 'score', 'athlete_updated': 'register',
        'payment_overdue': 'alert', 'license_expiring': 'alert'
    };
    const faIconMap = {
        'register': 'fa-user-plus', 'payment': 'fa-euro-sign',
        'tournament': 'fa-trophy', 'score': 'fa-bullseye',
        'alert': 'fa-exclamation-triangle'
    };
    container.innerHTML = MOCK_ACTIVITY_LOG.map(a => {
        const iconClass = iconMap[a.action] || 'register';
        const faIcon = faIconMap[iconClass] || 'fa-info';
        const time = formatRelativeTime(a.timestamp);
        return `<li class="activity-item">
            <div class="activity-icon ${iconClass}"><i class="fas ${faIcon}"></i></div>
            <div>
                <div class="activity-text">${a.description}</div>
                <div class="activity-time">${time} · ${a.user}</div>
            </div>
        </li>`;
    }).join('');
}

function renderQuickActions() {
    const container = document.getElementById('quick-actions');
    if (!container) return;
    const lang = getCurrentLanguage();
    const actions = [
        { icon: 'fa-user-plus', color: 'green', text: t('dashboard.newAthlete'), desc: t('dashboard.registerAthlete'), action: 'openAthleteModal()' },
        { icon: 'fa-trophy', color: 'gold', text: t('dashboard.newTournament'), desc: t('dashboard.createTournament'), action: 'openTournamentModal()' },
        { icon: 'fa-chart-line', color: 'blue', text: t('dashboard.viewStandings'), desc: t('dashboard.viewLeague'), action: "navigateTo('standings')" },
        { icon: 'fa-file-invoice-dollar', color: 'red', text: t('dashboard.managePayments'), desc: t('dashboard.manageFees'), action: "navigateTo('payments')" }
    ];
    const colorMap = { green: 'var(--green-pale)', gold: 'var(--gold-light)', blue: 'var(--blue-light)', red: 'var(--red-pale)' };
    const textColorMap = { green: 'var(--green-primary)', gold: 'var(--gold-dark)', blue: 'var(--blue-primary)', red: 'var(--red-primary)' };
    container.innerHTML = actions.map(a => `
        <button class="quick-action-btn" onclick="${a.action}">
            <i class="fas ${a.icon}" style="background:${colorMap[a.color]};color:${textColorMap[a.color]};"></i>
            <div><div class="qa-text">${a.text}</div><div class="qa-desc">${a.desc}</div></div>
        </button>
    `).join('');
}

function renderDashboardCharts() {
    // Chart: Athletes by discipline
    const discCounts = {};
    athletes.filter(a => a.status === 'active').forEach(a => {
        discCounts[a.discipline] = (discCounts[a.discipline] || 0) + 1;
    });

    const disciplineCtx = document.getElementById('chart-discipline');
    if (disciplineCtx) {
        if (charts['discipline']) charts['discipline'].destroy();
        charts['discipline'] = new Chart(disciplineCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(discCounts),
                datasets: [{
                    data: Object.values(discCounts),
                    backgroundColor: ['#2e7d32', '#c62828', '#ffc107', '#1565c0'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } }
                },
                cutout: '65%'
            }
        });
    }

    // Chart: Payment overview
    const paid = payments.filter(p => p.status === 'paid').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const overdue = payments.filter(p => p.status === 'overdue').length;

    const paymentCtx = document.getElementById('chart-payments');
    if (paymentCtx) {
        if (charts['payments']) charts['payments'].destroy();
        const lang = getCurrentLanguage();
        charts['payments'] = new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: [t('payments.paid'), t('payments.pending'), t('payments.overdue')],
                datasets: [{
                    data: [paid, pending, overdue],
                    backgroundColor: ['#2e7d32', '#ffc107', '#c62828'],
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } } }
                },
                cutout: '65%'
            }
        });
    }
}

function renderUpcomingTournamentsList() {
    const container = document.getElementById('upcoming-tournaments-list');
    if (!container) return;
    const upcoming = tournaments.filter(tr => tr.status === 'upcoming').sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 4);
    container.innerHTML = upcoming.map(tourn => {
        const d = new Date(tourn.date);
        const months = getCurrentLanguage() === 'pt' 
            ? ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `<div class="event-list-item" style="cursor:pointer;" onclick="viewTournamentDetail(${tourn.id})">
            <div class="event-date-badge">
                <div class="edb-month">${months[d.getMonth()]}</div>
                <div class="edb-day">${d.getDate()}</div>
            </div>
            <div class="event-info">
                <div class="event-title">${tourn.name}</div>
                <div class="event-type" style="background:${tourn.type === 'Indoor' ? 'var(--blue-light)' : 'var(--green-pale)'};color:${tourn.type === 'Indoor' ? 'var(--blue-primary)' : 'var(--green-primary)'};">${tourn.type}</div>
            </div>
        </div>`;
    }).join('');
}

// ---- Athletes ----
function renderAthletes() {
    // Restore section HTML if it was replaced by profile view
    const section = document.getElementById('page-athletes');
    if (!document.getElementById('athlete-filters')) {
        section.innerHTML = `
            <div class="page-header"><div>
                <h1 class="page-title" data-i18n="athletes.title">${t('athletes.title')}</h1>
            </div></div>
            <div class="filter-bar" id="athlete-filters"></div>
            <div class="text-sm text-muted mb-2" id="athlete-count"></div>
            <div class="card"><div class="table-container" id="athlete-table"></div></div>`;
    }
    renderAthleteFilters();
    renderAthleteTable();
}

function renderAthleteFilters() {
    const container = document.getElementById('athlete-filters');
    if (!container) return;

    const lang = getCurrentLanguage();
    const disciplines = [...new Set(athletes.map(a => a.discipline))];
    const categories = [...new Set(athletes.map(a => a.ageCategory))];
    const clubs = MOCK_CLUBS.map(c => ({ id: c.id, name: c.name }));

    container.innerHTML = `
        <div class="search-wrapper">
            <i class="fas fa-search"></i>
            <input type="text" id="athlete-search" placeholder="${t('athletes.search')}" value="${currentAthleteFilter.search}" oninput="filterAthletes()">
        </div>
        <select class="filter-select" id="filter-discipline" onchange="filterAthletes()">
            <option value="">${t('athletes.filterDiscipline')}</option>
            ${disciplines.map(d => `<option value="${d}" ${currentAthleteFilter.discipline === d ? 'selected' : ''}>${d}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-category" onchange="filterAthletes()">
            <option value="">${t('athletes.filterAge')}</option>
            ${categories.map(c => `<option value="${c}" ${currentAthleteFilter.ageCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
        </select>
        <select class="filter-select" id="filter-club" onchange="filterAthletes()">
            <option value="">${t('athletes.filterClub')}</option>
            ${clubs.map(c => `<option value="${c.id}" ${currentAthleteFilter.club === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
        </select>
        <div style="margin-left:auto;display:flex;gap:8px;">
            <button class="btn btn-secondary btn-sm" onclick="exportAthletes()"><i class="fas fa-download"></i> ${t('athletes.export')}</button>
            <button class="btn btn-primary btn-sm" onclick="openAthleteModal()"><i class="fas fa-plus"></i> ${t('athletes.addNew')}</button>
        </div>
    `;
}

function filterAthletes() {
    currentAthleteFilter = {
        search: (document.getElementById('athlete-search')?.value || '').toLowerCase(),
        discipline: document.getElementById('filter-discipline')?.value || '',
        ageCategory: document.getElementById('filter-category')?.value || '',
        club: document.getElementById('filter-club')?.value || '',
        status: ''
    };
    renderAthleteTable();
}

function getFilteredAthletes() {
    return athletes.filter(a => {
        const name = `${a.firstName} ${a.lastName}`.toLowerCase();
        const club = MOCK_CLUBS.find(c => c.id === a.clubId);
        const clubName = club ? club.name.toLowerCase() : '';
        if (currentAthleteFilter.search && !name.includes(currentAthleteFilter.search) && !clubName.includes(currentAthleteFilter.search) && !a.licenseNumber.toLowerCase().includes(currentAthleteFilter.search)) return false;
        if (currentAthleteFilter.discipline && a.discipline !== currentAthleteFilter.discipline) return false;
        if (currentAthleteFilter.ageCategory && a.ageCategory !== currentAthleteFilter.ageCategory) return false;
        if (currentAthleteFilter.club && a.clubId !== currentAthleteFilter.club) return false;
        return true;
    });
}

function sortAthletes(field) {
    if (athleteSortBy === field) {
        athleteSortDir = athleteSortDir === 'asc' ? 'desc' : 'asc';
    } else {
        athleteSortBy = field;
        athleteSortDir = 'asc';
    }
    renderAthleteTable();
}

function renderAthleteTable() {
    const container = document.getElementById('athlete-table');
    if (!container) return;
    let filtered = getFilteredAthletes();
    const lang = getCurrentLanguage();

    // Sort
    filtered.sort((a, b) => {
        let va, vb;
        switch (athleteSortBy) {
            case 'name': va = `${a.firstName} ${a.lastName}`.toLowerCase(); vb = `${b.firstName} ${b.lastName}`.toLowerCase(); break;
            case 'club': va = MOCK_CLUBS.find(c => c.id === a.clubId)?.name || ''; vb = MOCK_CLUBS.find(c => c.id === b.clubId)?.name || ''; break;
            case 'discipline': va = a.discipline; vb = b.discipline; break;
            case 'category': va = a.ageCategory; vb = b.ageCategory; break;
            default: va = a.firstName; vb = b.firstName;
        }
        const cmp = va < vb ? -1 : va > vb ? 1 : 0;
        return athleteSortDir === 'asc' ? cmp : -cmp;
    });

    document.getElementById('athlete-count').textContent = `${t('athletes.showing')} ${filtered.length} ${t('athletes.of')} ${athletes.length}`;
    const sortIcon = (f) => athleteSortBy === f ? (athleteSortDir === 'asc' ? ' <i class="fas fa-sort-up"></i>' : ' <i class="fas fa-sort-down"></i>') : ' <i class="fas fa-sort" style="opacity:0.3;"></i>';

    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th class="sortable" onclick="sortAthletes('name')">${t('athletes.name')}${sortIcon('name')}</th>
                    <th class="sortable" onclick="sortAthletes('club')">${t('athletes.club')}${sortIcon('club')}</th>
                    <th class="sortable" onclick="sortAthletes('discipline')">${t('athletes.discipline')}${sortIcon('discipline')}</th>
                    <th class="sortable" onclick="sortAthletes('category')">${t('athletes.category')}${sortIcon('category')}</th>
                    <th>${t('athletes.license')}</th>
                    <th>${t('athletes.status')}</th>
                    <th>${t('athletes.actions')}</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(a => {
                    const club = MOCK_CLUBS.find(c => c.id === a.clubId);
                    const initials = a.firstName[0] + a.lastName[0];
                    const statusBadge = a.status === 'active' ? 'badge-active' : a.status === 'expired' ? 'badge-expired' : 'badge-inactive';
                    const statusText = t(`athletes.${a.status}`);
                    return `<tr>
                        <td>
                            <div class="athlete-cell">
                                <div class="athlete-avatar ${a.gender === 'M' ? 'avatar-m' : 'avatar-f'}">${initials}</div>
                                <div class="athlete-info">
                                    <div class="athlete-name" style="cursor:pointer;" onclick="viewAthleteProfile(${a.id})">${a.firstName} ${a.lastName}</div>
                                    <div class="athlete-license">${a.email}</div>
                                </div>
                            </div>
                        </td>
                        <td>${club ? club.name : '-'}</td>
                        <td>${a.discipline}</td>
                        <td>${a.ageCategory}</td>
                        <td><span class="text-xs text-muted">${a.licenseNumber}</span></td>
                        <td><span class="badge ${statusBadge}">${statusText}</span></td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-icon btn-secondary" onclick="viewAthleteProfile(${a.id})" title="${t('common.view')}"><i class="fas fa-eye"></i></button>
                                <button class="btn btn-icon btn-secondary" onclick="openAthleteModal(${a.id})" title="${t('common.edit')}"><i class="fas fa-pencil-alt"></i></button>
                                <button class="btn btn-icon btn-secondary" onclick="deleteAthlete(${a.id})" title="${t('common.delete')}"><i class="fas fa-trash"></i></button>
                            </div>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    `;
}

function openAthleteModal(athleteId = null) {
    const modal = document.getElementById('athlete-modal');
    const form = document.getElementById('athlete-form');
    const title = document.getElementById('athlete-modal-title');
    const lang = getCurrentLanguage();

    if (athleteId) {
        const athlete = athletes.find(a => a.id === athleteId);
        if (!athlete) return;
        title.textContent = `${t('form.edit')}: ${athlete.firstName} ${athlete.lastName}`;
        form.innerHTML = getAthleteFormHTML(athlete);
    } else {
        title.textContent = t('athletes.addNew');
        form.innerHTML = getAthleteFormHTML(null);
    }
    modal.classList.add('active');
}

function getAthleteFormHTML(athlete) {
    const a = athlete || {};
    const clubs = MOCK_CLUBS;
    const lang = getCurrentLanguage();
    return `
        <input type="hidden" id="form-athlete-id" value="${a.id || ''}">
        <h4 style="margin-bottom:16px;color:var(--green-primary);font-size:0.95rem;"><i class="fas fa-user"></i> ${t('form.personalData')}</h4>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.firstName')} *</label>
                <input type="text" class="form-control" id="form-firstName" value="${a.firstName || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.lastName')} *</label>
                <input type="text" class="form-control" id="form-lastName" value="${a.lastName || ''}" required>
            </div>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">${t('form.birthDate')} *</label>
                <input type="date" class="form-control" id="form-birthDate" value="${a.birthDate || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.gender')} *</label>
                <select class="form-control" id="form-gender">
                    <option value="M" ${a.gender === 'M' ? 'selected' : ''}>${t('form.male')}</option>
                    <option value="F" ${a.gender === 'F' ? 'selected' : ''}>${t('form.female')}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.nif')}</label>
                <input type="text" class="form-control" id="form-nif" value="${a.nif || ''}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('form.email')} *</label>
                <input type="email" class="form-control" id="form-email" value="${a.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.phone')}</label>
                <input type="tel" class="form-control" id="form-phone" value="${a.phone || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.address')}</label>
            <input type="text" class="form-control" id="form-address" value="${a.address || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.emergencyContact')}</label>
            <input type="text" class="form-control" id="form-emergency" value="${a.emergencyContact || ''}">
        </div>
        <h4 style="margin:20px 0 16px;color:var(--green-primary);font-size:0.95rem;"><i class="fas fa-id-card"></i> ${t('form.federationData')}</h4>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">${t('form.club')} *</label>
                <select class="form-control" id="form-club">
                    <option value="">${t('form.selectClub')}</option>
                    ${clubs.map(c => `<option value="${c.id}" ${a.clubId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.discipline')} *</label>
                <select class="form-control" id="form-discipline">
                    <option value="">${t('form.selectDiscipline')}</option>
                    <option value="Recurvo" ${a.discipline === 'Recurvo' ? 'selected' : ''}>Recurvo</option>
                    <option value="Composto" ${a.discipline === 'Composto' ? 'selected' : ''}>Composto</option>
                    <option value="Arco Nu" ${a.discipline === 'Arco Nu' ? 'selected' : ''}>Arco Nu</option>
                    <option value="Arco Longo" ${a.discipline === 'Arco Longo' ? 'selected' : ''}>Arco Longo</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('form.ageCategory')} *</label>
                <select class="form-control" id="form-ageCategory">
                    <option value="">${t('form.selectCategory')}</option>
                    <option value="Sub-15" ${a.ageCategory === 'Sub-15' ? 'selected' : ''}>Sub-15</option>
                    <option value="Sub-18" ${a.ageCategory === 'Sub-18' ? 'selected' : ''}>Sub-18</option>
                    <option value="Sub-21" ${a.ageCategory === 'Sub-21' ? 'selected' : ''}>Sub-21</option>
                    <option value="Sénior" ${a.ageCategory === 'Sénior' ? 'selected' : ''}>Sénior</option>
                    <option value="Master" ${a.ageCategory === 'Master' ? 'selected' : ''}>Master</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('form.notes')}</label>
            <textarea class="form-control" id="form-notes" rows="3">${a.notes || ''}</textarea>
        </div>
    `;
}

function saveAthlete() {
    const id = document.getElementById('form-athlete-id').value;
    const firstName = document.getElementById('form-firstName').value.trim();
    const lastName = document.getElementById('form-lastName').value.trim();
    if (!firstName || !lastName) {
        showToast(t('notif.requiredFields'), 'warning');
        return;
    }

    const data = {
        firstName, lastName,
        birthDate: document.getElementById('form-birthDate').value,
        gender: document.getElementById('form-gender').value,
        nif: document.getElementById('form-nif').value,
        email: document.getElementById('form-email').value,
        phone: document.getElementById('form-phone').value,
        address: document.getElementById('form-address').value,
        emergencyContact: document.getElementById('form-emergency').value,
        clubId: document.getElementById('form-club').value,
        discipline: document.getElementById('form-discipline').value,
        ageCategory: document.getElementById('form-ageCategory').value,
        notes: document.getElementById('form-notes').value,
        status: 'active'
    };

    if (id) {
        const idx = athletes.findIndex(a => a.id === parseInt(id));
        if (idx >= 0) {
            athletes[idx] = { ...athletes[idx], ...data };
        }
    } else {
        const newId = Math.max(0, ...athletes.map(a => a.id)) + 1;
        athletes.push({
            id: newId,
            ...data,
            licenseNumber: `FPTA-2026-${String(newId).padStart(4, '0')}`,
            licenseExpiry: '2026-12-31',
            registrationDate: new Date().toISOString().split('T')[0],
            photo: null
        });
    }

    closeModal('athlete-modal');
    showToast(t('notif.athleteSaved'), 'success');
    renderAthletes();
}

function deleteAthlete(id) {
    showConfirmDialog(t('notif.confirmDelete'), () => {
        athletes = athletes.filter(a => a.id !== id);
        showToast(t('notif.athleteDeleted'), 'success');
        renderAthletes();
    });
}

function exportAthletes() {
    const filtered = getFilteredAthletes();
    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const csv = 'Nome,Email,Clube,Disciplina,Categoria,Licença,Estado\n' +
        filtered.map(a => {
            const club = MOCK_CLUBS.find(c => c.id === a.clubId);
            return [a.firstName + ' ' + a.lastName, a.email, club ? club.name : '', a.discipline, a.ageCategory, a.licenseNumber, a.status].map(esc).join(',');
        }).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'atletas_fpta.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast(t('notif.exportSuccess'), 'success');
}

// ---- Athlete Profile ----
function viewAthleteProfile(athleteId) {
    const athlete = athletes.find(a => a.id === athleteId);
    if (!athlete) return;
    navigateTo('athletes');

    const club = MOCK_CLUBS.find(c => c.id === athlete.clubId);
    const athleteScores = scores.filter(s => s.athleteId === athleteId);
    const athletePayments = payments.filter(p => p.athleteId === athleteId);
    const bestScore = athleteScores.length > 0 ? Math.max(...athleteScores.map(s => s.score)) : 0;
    const avgScore = athleteScores.length > 0 ? Math.round(athleteScores.reduce((s, sc) => s + sc.score, 0) / athleteScores.length) : 0;
    const lang = getCurrentLanguage();

    const section = document.getElementById('page-athletes');
    section.innerHTML = `
        <div class="page-header">
            <div>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('athletes')" style="margin-bottom:12px;"><i class="fas fa-arrow-left"></i> ${t('profile.back')}</button>
                <h1 class="page-title">${t('profile.title')}</h1>
            </div>
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="openAthleteModal(${athlete.id})"><i class="fas fa-pencil-alt"></i> ${t('common.edit')}</button>
            </div>
        </div>
        <div class="profile-header">
            <div class="profile-avatar ${athlete.gender === 'M' ? 'avatar-m' : 'avatar-f'}">${athlete.firstName[0]}${athlete.lastName[0]}</div>
            <div class="profile-details">
                <div class="profile-name">${athlete.firstName} ${athlete.lastName}</div>
                <div class="profile-meta">
                    <span class="profile-meta-item"><i class="fas fa-bullseye"></i> ${athlete.discipline}</span>
                    <span class="profile-meta-item"><i class="fas fa-users"></i> ${club ? club.name : '-'}</span>
                    <span class="profile-meta-item"><i class="fas fa-layer-group"></i> ${athlete.ageCategory}</span>
                    <span class="profile-meta-item"><i class="fas fa-id-card"></i> ${athlete.licenseNumber}</span>
                    <span class="badge ${athlete.status === 'active' ? 'badge-active' : 'badge-expired'}">${t(`athletes.${athlete.status}`)}</span>
                </div>
                <div class="profile-stats-mini">
                    <div class="profile-stat-mini"><div class="psm-value">${athleteScores.length}</div><div class="psm-label">${t('profile.tournamentsPlayed')}</div></div>
                    <div class="profile-stat-mini"><div class="psm-value">${bestScore}</div><div class="psm-label">${t('profile.bestScore')}</div></div>
                    <div class="profile-stat-mini"><div class="psm-value">${avgScore}</div><div class="psm-label">${t('profile.avgScore')}</div></div>
                </div>
            </div>
        </div>
        <div class="profile-grid">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><i class="fas fa-user" style="color:var(--green-primary);margin-right:8px;"></i>${t('profile.personalInfo')}</h3></div>
                <div class="info-grid">
                    <div class="info-item"><div class="info-label">Email</div><div class="info-value">${athlete.email}</div></div>
                    <div class="info-item"><div class="info-label">${t('form.phone')}</div><div class="info-value">${athlete.phone || '-'}</div></div>
                    <div class="info-item"><div class="info-label">${t('form.birthDate')}</div><div class="info-value">${formatDate(athlete.birthDate)}</div></div>
                    <div class="info-item"><div class="info-label">${t('form.gender')}</div><div class="info-value">${athlete.gender === 'M' ? t('form.male') : t('form.female')}</div></div>
                    <div class="info-item"><div class="info-label">NIF</div><div class="info-value">${athlete.nif || '-'}</div></div>
                    <div class="info-item"><div class="info-label">${t('form.emergencyContact')}</div><div class="info-value">${athlete.emergencyContact || '-'}</div></div>
                    <div class="info-item" style="grid-column:1/3;"><div class="info-label">${t('form.address')}</div><div class="info-value">${athlete.address || '-'}</div></div>
                    ${athlete.notes ? `<div class="info-item" style="grid-column:1/3;"><div class="info-label">${t('form.notes')}</div><div class="info-value">${athlete.notes}</div></div>` : ''}
                </div>
            </div>
            <div>
                <div class="card mb-3">
                    <div class="card-header"><h3 class="card-title"><i class="fas fa-trophy" style="color:var(--gold-dark);margin-right:8px;"></i>${t('profile.tournamentHistory')}</h3></div>
                    ${athleteScores.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>${t('tournaments.name')}</th><th>${t('tournaments.scores')}</th><th>X</th></tr></thead>
                                <tbody>
                                    ${athleteScores.map(s => {
                                        const tourn = tournaments.find(tr => tr.id === s.tournamentId);
                                        return `<tr><td>${tourn ? tourn.name : '-'}</td><td><strong>${s.score}</strong></td><td>${s.xCount}</td></tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>` : `<div class="empty-state"><p>${t('common.noResults')}</p></div>`}
                </div>
                <div class="card">
                    <div class="card-header"><h3 class="card-title"><i class="fas fa-file-invoice-dollar" style="color:var(--blue-primary);margin-right:8px;"></i>${t('profile.paymentHistory')}</h3></div>
                    ${athletePayments.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead><tr><th>${t('payments.description')}</th><th>${t('payments.amount')}</th><th>${t('payments.status')}</th></tr></thead>
                                <tbody>
                                    ${athletePayments.map(p => {
                                        const badge = p.status === 'paid' ? 'badge-paid' : p.status === 'pending' ? 'badge-pending' : 'badge-overdue';
                                        return `<tr><td>${p.description}</td><td>€${p.amount.toFixed(2)}</td><td><span class="badge ${badge}">${t(`payments.${p.status}`)}</span></td></tr>`;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>` : `<div class="empty-state"><p>${t('common.noResults')}</p></div>`}
                </div>
            </div>
        </div>
    `;
}

// ---- Tournaments ----
function renderTournaments() {
    // Restore section HTML if it was replaced by detail view
    const section = document.getElementById('page-tournaments');
    if (!document.getElementById('tournament-content')) {
        section.innerHTML = `
            <div class="page-header"><div>
                <h1 class="page-title" data-i18n="tournaments.title">${t('tournaments.title')}</h1>
            </div></div>
            <div id="tournament-content"></div>`;
    }
    renderTournamentList();
}

function renderTournamentList() {
    const container = document.getElementById('tournament-content');
    if (!container) return;

    const allCount = tournaments.length;
    const upcomingCount = tournaments.filter(tr => tr.status === 'upcoming').length;
    const completedCount = tournaments.filter(tr => tr.status === 'completed').length;
    const lang = getCurrentLanguage();

    let filtered = tournaments;
    if (currentTournamentFilter === 'upcoming') filtered = tournaments.filter(tr => tr.status === 'upcoming');
    else if (currentTournamentFilter === 'completed') filtered = tournaments.filter(tr => tr.status === 'completed');

    container.innerHTML = `
        <div class="d-flex align-center justify-between mb-3" style="flex-wrap:wrap;gap:12px;">
            <div class="tab-filters">
                <button class="tab-filter ${currentTournamentFilter === 'all' ? 'active' : ''}" onclick="setTournamentFilter('all')">${t('tournaments.all')} <span class="count">${allCount}</span></button>
                <button class="tab-filter ${currentTournamentFilter === 'upcoming' ? 'active' : ''}" onclick="setTournamentFilter('upcoming')">${t('tournaments.upcoming')} <span class="count">${upcomingCount}</span></button>
                <button class="tab-filter ${currentTournamentFilter === 'completed' ? 'active' : ''}" onclick="setTournamentFilter('completed')">${t('tournaments.completed')} <span class="count">${completedCount}</span></button>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openTournamentModal()"><i class="fas fa-plus"></i> ${t('tournaments.createNew')}</button>
        </div>
        <div class="tournament-grid">
            ${filtered.sort((a, b) => new Date(b.date) - new Date(a.date)).map(tourn => {
                const participantCount = scores.filter(s => s.tournamentId === tourn.id).length;
                return `<div class="tournament-card" onclick="viewTournamentDetail(${tourn.id})">
                    <div class="tournament-card-header">
                        <div>
                            <div class="tc-name">${tourn.name}</div>
                            <div class="d-flex gap-1 mt-1">
                                <span class="badge badge-${tourn.type.toLowerCase()}">${tourn.type}</span>
                                ${tourn.isLeague ? `<span class="badge badge-league">${t('tournaments.league')}</span>` : ''}
                                <span class="badge badge-${tourn.status}">${tourn.status === 'upcoming' ? t('tournaments.statusUpcoming') : t('tournaments.statusCompleted')}</span>
                            </div>
                        </div>
                        <div class="tc-icon ${tourn.type.toLowerCase()}"><i class="fas ${tourn.type === 'Indoor' ? 'fa-warehouse' : 'fa-sun'}"></i></div>
                    </div>
                    <div class="tournament-card-body">
                        <div class="tc-meta">
                            <div class="tc-meta-item"><i class="fas fa-calendar"></i> ${formatDate(tourn.date)}${tourn.endDate !== tourn.date ? ` - ${formatDate(tourn.endDate)}` : ''}</div>
                            <div class="tc-meta-item"><i class="fas fa-map-marker-alt"></i> ${tourn.location}</div>
                            <div class="tc-meta-item"><i class="fas fa-users"></i> ${participantCount} / ${tourn.maxParticipants} ${t('tournaments.participantsLabel')}</div>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
}

function setTournamentFilter(filter) {
    currentTournamentFilter = filter;
    renderTournamentList();
}

function openTournamentModal(tournamentId = null) {
    const modal = document.getElementById('tournament-modal');
    const form = document.getElementById('tournament-form');
    const title = document.getElementById('tournament-modal-title');
    const lang = getCurrentLanguage();

    if (tournamentId) {
        const tournament = tournaments.find(tr => tr.id === tournamentId);
        if (!tournament) return;
        title.textContent = t('tournamentForm.editTitle');
        form.innerHTML = getTournamentFormHTML(tournament);
    } else {
        title.textContent = t('tournamentForm.title');
        form.innerHTML = getTournamentFormHTML(null);
    }
    modal.classList.add('active');
}

function getTournamentFormHTML(tournament) {
    const tr = tournament || {};
    return `
        <input type="hidden" id="form-tournament-id" value="${tr.id || ''}">
        <div class="form-group">
            <label class="form-label">${t('tournaments.name')} *</label>
            <input type="text" class="form-control" id="form-tname" value="${tr.name || ''}">
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">${t('tournaments.type')} *</label>
                <select class="form-control" id="form-ttype">
                    <option value="Indoor" ${tr.type === 'Indoor' ? 'selected' : ''}>Indoor</option>
                    <option value="Outdoor" ${tr.type === 'Outdoor' ? 'selected' : ''}>Outdoor</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('tournamentForm.startDate')} *</label>
                <input type="date" class="form-control" id="form-tdate" value="${tr.date || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('tournamentForm.endDate')}</label>
                <input type="date" class="form-control" id="form-tenddate" value="${tr.endDate || ''}">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('tournaments.location')} *</label>
            <input type="text" class="form-control" id="form-tlocation" value="${tr.location || ''}">
        </div>
        <div class="form-group">
            <label class="form-label">${t('tournaments.description')}</label>
            <textarea class="form-control" id="form-tdesc" rows="2">${tr.description || ''}</textarea>
        </div>
        <div class="form-row-3">
            <div class="form-group">
                <label class="form-label">${t('tournaments.maxParticipants')}</label>
                <input type="number" class="form-control" id="form-tmax" value="${tr.maxParticipants || 60}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('tournaments.distances')}</label>
                <input type="text" class="form-control" id="form-tdist" value="${tr.distances || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">${t('tournaments.targetFace')}</label>
                <input type="text" class="form-control" id="form-ttarget" value="${tr.targetFace || ''}">
            </div>
        </div>
        <div class="form-check">
            <input type="checkbox" id="form-tisleague" ${tr.isLeague ? 'checked' : ''}>
            <label for="form-tisleague" class="form-label" style="margin-bottom:0;">${t('tournaments.isLeague')}</label>
        </div>
    `;
}

function saveTournament() {
    const id = document.getElementById('form-tournament-id').value;
    const name = document.getElementById('form-tname').value.trim();
    if (!name) {
        showToast(t('notif.requiredFields'), 'warning');
        return;
    }

    const data = {
        name,
        type: document.getElementById('form-ttype').value,
        date: document.getElementById('form-tdate').value,
        endDate: document.getElementById('form-tenddate').value || document.getElementById('form-tdate').value,
        location: document.getElementById('form-tlocation').value,
        description: document.getElementById('form-tdesc').value,
        maxParticipants: parseInt(document.getElementById('form-tmax').value) || 60,
        distances: document.getElementById('form-tdist').value,
        targetFace: document.getElementById('form-ttarget').value,
        isLeague: document.getElementById('form-tisleague').checked,
        status: 'upcoming'
    };

    if (id) {
        const idx = tournaments.findIndex(tr => tr.id === parseInt(id));
        if (idx >= 0) tournaments[idx] = { ...tournaments[idx], ...data };
    } else {
        const newId = Math.max(0, ...tournaments.map(tr => tr.id)) + 1;
        tournaments.push({ id: newId, ...data, rounds: '' });
    }

    closeModal('tournament-modal');
    showToast(t('notif.tournamentSaved'), 'success');
    renderTournaments();
}

function viewTournamentDetail(tournamentId) {
    const tourn = tournaments.find(tr => tr.id === tournamentId);
    if (!tourn) return;
    navigateTo('tournaments');

    const tournScores = scores.filter(s => s.tournamentId === tournamentId);
    const lang = getCurrentLanguage();

    const section = document.getElementById('page-tournaments');
    const tournamentParticipants = tournScores.map(s => {
        const a = athletes.find(at => at.id === s.athleteId);
        return a ? { ...s, athlete: a } : null;
    }).filter(Boolean);

    // Group by discipline
    const byDiscipline = {};
    tournamentParticipants.forEach(p => {
        if (!byDiscipline[p.athlete.discipline]) byDiscipline[p.athlete.discipline] = [];
        byDiscipline[p.athlete.discipline].push(p);
    });
    Object.keys(byDiscipline).forEach(d => {
        byDiscipline[d].sort((a, b) => b.score - a.score);
    });

    section.innerHTML = `
        <div class="page-header">
            <div>
                <button class="btn btn-secondary btn-sm" onclick="navigateTo('tournaments')" style="margin-bottom:12px;"><i class="fas fa-arrow-left"></i> ${t('common.back')}</button>
                <h1 class="page-title">${tourn.name}</h1>
                <p class="page-subtitle">${tourn.description || ''}</p>
            </div>
            <div class="btn-group">
                <button class="btn btn-secondary" onclick="openTournamentModal(${tourn.id})"><i class="fas fa-pencil-alt"></i> ${t('common.edit')}</button>
                <button class="btn btn-secondary" onclick="deleteTournament(${tourn.id})" style="color:var(--red-primary);"><i class="fas fa-trash"></i></button>
                ${tourn.status === 'upcoming' ? `<button class="btn btn-primary" onclick="openScoreEntry(${tourn.id})"><i class="fas fa-keyboard"></i> ${t('tournaments.enterScores')}</button>` : ''}
            </div>
        </div>
        <div class="card mb-3">
            <div class="tournament-meta-grid">
                <div class="meta-item"><i class="fas fa-calendar"></i> <strong>${formatDate(tourn.date)}${tourn.endDate !== tourn.date ? ' - ' + formatDate(tourn.endDate) : ''}</strong></div>
                <div class="meta-item"><i class="fas fa-map-marker-alt"></i> <strong>${tourn.location}</strong></div>
                <div class="meta-item"><i class="fas fa-users"></i> <strong>${tournScores.length} / ${tourn.maxParticipants}</strong></div>
                <div class="meta-item"><i class="fas fa-ruler"></i> <strong>${tourn.distances || '-'}</strong></div>
                <div class="meta-item"><i class="fas fa-bullseye"></i> <strong>${tourn.targetFace || '-'}</strong></div>
                <div class="meta-item"><span class="badge badge-${tourn.status}">${tourn.status === 'upcoming' ? t('tournaments.statusUpcoming') : t('tournaments.statusCompleted')}</span> ${tourn.isLeague ? `<span class="badge badge-league">${t('tournaments.league')}</span>` : ''}</div>
            </div>
        </div>
        ${Object.keys(byDiscipline).length > 0 ? Object.keys(byDiscipline).map(discipline => `
            <div class="card mb-3">
                <div class="card-header">
                    <h3 class="card-title"><i class="fas fa-bullseye" style="color:var(--green-primary);margin-right:8px;"></i>${discipline}</h3>
                </div>
                <div class="table-container">
                    <table class="data-table standings-table">
                        <thead>
                            <tr>
                                <th style="width:50px;text-align:center;">#</th>
                                <th>${t('standings.athlete')}</th>
                                <th>${t('standings.club')}</th>
                                <th style="text-align:center;">${t('tournaments.score')}</th>
                                <th style="text-align:center;">X</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${byDiscipline[discipline].map((p, idx) => {
                                const club = MOCK_CLUBS.find(c => c.id === p.athlete.clubId);
                                const rankClass = idx < 3 ? `rank-${idx + 1}` : '';
                                const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                                return `<tr>
                                    <td class="rank-cell ${rankClass}">${medal}</td>
                                    <td>
                                        <div class="athlete-cell">
                                            <div class="athlete-avatar ${p.athlete.gender === 'M' ? 'avatar-m' : 'avatar-f'}">${p.athlete.firstName[0]}${p.athlete.lastName[0]}</div>
                                            <span class="fw-semibold" style="cursor:pointer;" onclick="viewAthleteProfile(${p.athlete.id})">${p.athlete.firstName} ${p.athlete.lastName}</span>
                                        </div>
                                    </td>
                                    <td>${club ? club.name : '-'}</td>
                                    <td class="text-center fw-bold">${p.score}</td>
                                    <td class="text-center">${p.xCount}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('') : `<div class="card"><div class="empty-state"><i class="fas fa-trophy"></i><p>${t('common.noResults')}</p></div></div>`}
    `;
}

function openScoreEntry(tournamentId) {
    const modal = document.getElementById('score-modal');
    const form = document.getElementById('score-form');
    const lang = getCurrentLanguage();

    document.getElementById('score-modal-title').innerHTML = `<i class="fas fa-bullseye" style="margin-right:8px;color:var(--green-primary);"></i>${t('tournaments.enterScores')}`;

    const existingScores = scores.filter(s => s.tournamentId === tournamentId);
    const availableAthletes = athletes.filter(a => a.status === 'active');

    form.innerHTML = `
        <input type="hidden" id="score-tournament-id" value="${tournamentId}">
        <p class="text-sm text-muted mb-2">${t('tournaments.scoreInstructions')}</p>
        <div id="score-entries">
            ${availableAthletes.map(a => {
                const existing = existingScores.find(s => s.athleteId === a.id);
                return `<div class="score-entry-grid">
                    <div class="athlete-cell">
                        <div class="athlete-avatar ${a.gender === 'M' ? 'avatar-m' : 'avatar-f'}" style="width:28px;height:28px;font-size:0.65rem;">${a.firstName[0]}${a.lastName[0]}</div>
                        <span class="text-sm fw-semibold">${a.firstName} ${a.lastName}</span>
                    </div>
                    <input type="number" class="score-input" data-athlete-id="${a.id}" placeholder="${t('tournaments.scorePlaceholder')}" value="${existing ? existing.score : ''}" min="0" max="720">
                    <input type="number" class="x-input" data-athlete-id="${a.id}" placeholder="X" value="${existing ? existing.xCount : ''}" min="0" max="72">
                </div>`;
            }).join('')}
        </div>
    `;
    modal.classList.add('active');
}

function saveScores() {
    const tournamentId = parseInt(document.getElementById('score-tournament-id').value);
    const scoreInputs = document.querySelectorAll('.score-input');
    const xInputs = document.querySelectorAll('.x-input');

    scoreInputs.forEach((input, i) => {
        const athleteId = parseInt(input.getAttribute('data-athlete-id'));
        const scoreVal = parseInt(input.value);
        const xVal = parseInt(xInputs[i].value) || 0;

        if (!isNaN(scoreVal) && scoreVal > 0) {
            const existingIdx = scores.findIndex(s => s.tournamentId === tournamentId && s.athleteId === athleteId);
            if (existingIdx >= 0) {
                scores[existingIdx].score = scoreVal;
                scores[existingIdx].xCount = xVal;
            } else {
                scores.push({ tournamentId, athleteId, score: scoreVal, xCount: xVal, rank: 0 });
            }
        }
    });

    // Update ranks within the tournament by discipline
    const tournScores = scores.filter(s => s.tournamentId === tournamentId);
    const byDisc = {};
    tournScores.forEach(s => {
        const a = athletes.find(at => at.id === s.athleteId);
        if (a) {
            if (!byDisc[a.discipline]) byDisc[a.discipline] = [];
            byDisc[a.discipline].push(s);
        }
    });
    Object.values(byDisc).forEach(group => {
        group.sort((a, b) => b.score - a.score || b.xCount - a.xCount);
        group.forEach((s, i) => s.rank = i + 1);
    });

    closeModal('score-modal');
    showToast(t('notif.scoresSaved'), 'success');
    viewTournamentDetail(tournamentId);
}

// ---- Standings ----
function renderStandings() {
    const container = document.getElementById('standings-content');
    if (!container) return;
    const lang = getCurrentLanguage();

    // Calculate league standings from league tournaments
    // Persist discipline filter
    const currentDiscFilter = document.getElementById('standings-discipline')?.value || '';
    const leagueTournaments = tournaments.filter(tr => tr.isLeague && tr.status === 'completed');
    const standings = {};

    leagueTournaments.forEach(tourn => {
        const tournScores = scores.filter(s => s.tournamentId === tourn.id);
        tournScores.forEach(s => {
            const a = athletes.find(at => at.id === s.athleteId);
            if (!a) return;
            const key = `${s.athleteId}-${a.discipline}`;
            if (!standings[key]) {
                standings[key] = {
                    athleteId: a.id,
                    name: `${a.firstName} ${a.lastName}`,
                    club: MOCK_CLUBS.find(c => c.id === a.clubId)?.name || '-',
                    clubId: a.clubId,
                    discipline: a.discipline,
                    gender: a.gender,
                    totalScore: 0,
                    events: 0,
                    bestScore: 0,
                    scores: []
                };
            }
            standings[key].totalScore += s.score;
            standings[key].events++;
            standings[key].bestScore = Math.max(standings[key].bestScore, s.score);
            standings[key].scores.push({ tournamentId: tourn.id, score: s.score });
        });
    });

    const standingsArray = Object.values(standings).sort((a, b) => b.totalScore - a.totalScore);
    const disciplines = [...new Set(standingsArray.map(s => s.discipline))];

    container.innerHTML = `
        <div class="d-flex align-center justify-between mb-3" style="flex-wrap:wrap;gap:12px;">
            <div class="d-flex align-center gap-2">
                <select class="filter-select" id="standings-discipline" onchange="renderStandings()">
                    <option value="">${t('standings.allDisciplines')}</option>
                    ${disciplines.map(d => `<option value="${d}" ${currentDiscFilter === d ? 'selected' : ''}>${d}</option>`).join('')}
                </select>
                <span class="text-sm text-muted">${t('standings.seasonInfo')} · ${leagueTournaments.length} ${leagueTournaments.length === 1 ? t('standings.stageCompleted') : t('standings.stagesCompleted')}</span>
            </div>
        </div>
        <div class="card">
            <div class="card-header">
                <h3 class="card-title"><i class="fas fa-medal" style="color:var(--gold-dark);margin-right:8px;"></i>${t('standings.title')}</h3>
            </div>
            ${standingsArray.length > 0 ? renderStandingsTable(standingsArray, leagueTournaments) :
            `<div class="empty-state"><i class="fas fa-chart-bar"></i><p>${t('standings.noData')}</p></div>`}
        </div>
    `;
}

function renderStandingsTable(standingsArray, leagueTournaments) {
    const filterDisc = document.getElementById('standings-discipline')?.value || '';
    let filtered = standingsArray;
    if (filterDisc) filtered = standingsArray.filter(s => s.discipline === filterDisc);
    const lang = getCurrentLanguage();

    return `<div class="table-container">
        <table class="data-table standings-table">
            <thead>
                <tr>
                    <th style="width:50px;text-align:center;">${t('standings.rank')}</th>
                    <th>${t('standings.athlete')}</th>
                    <th>${t('standings.club')}</th>
                    <th>${t('standings.discipline')}</th>
                    ${leagueTournaments.map((lt, i) => `<th style="text-align:center;">${t('standings.stageAbbrev')}${i + 1}</th>`).join('')}
                    <th style="text-align:center;">${t('standings.totalPoints')}</th>
                    <th style="text-align:center;">${t('standings.bestScore')}</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map((s, idx) => {
                    const rankClass = idx < 3 ? `rank-${idx + 1}` : '';
                    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                    return `<tr>
                        <td class="rank-cell ${rankClass}">${medal}</td>
                        <td>
                            <div class="athlete-cell">
                                <div class="athlete-avatar ${s.gender === 'M' ? 'avatar-m' : 'avatar-f'}" style="width:30px;height:30px;font-size:0.65rem;">${s.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</div>
                                <span class="fw-semibold" style="cursor:pointer;" onclick="viewAthleteProfile(${s.athleteId})">${s.name}</span>
                            </div>
                        </td>
                        <td class="text-sm">${s.club}</td>
                        <td><span class="badge badge-${s.discipline === 'Recurvo' ? 'outdoor' : s.discipline === 'Composto' ? 'indoor' : 'league'}">${s.discipline}</span></td>
                        ${leagueTournaments.map(lt => {
                            const sc = s.scores.find(sc => sc.tournamentId === lt.id);
                            return `<td class="text-center text-sm">${sc ? sc.score : '-'}</td>`;
                        }).join('')}
                        <td class="text-center fw-bold text-green">${s.totalScore}</td>
                        <td class="text-center">${s.bestScore}</td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
    </div>`;
}

// ---- Payments ----
function renderPayments() {
    const container = document.getElementById('payment-content');
    if (!container) return;
    const lang = getCurrentLanguage();

    const paid = payments.filter(p => p.status === 'paid');
    const pending = payments.filter(p => p.status === 'pending');
    const overdue = payments.filter(p => p.status === 'overdue');
    const totalCollected = paid.reduce((s, p) => s + p.amount, 0);
    const totalPending = pending.reduce((s, p) => s + p.amount, 0);
    const totalOverdue = overdue.reduce((s, p) => s + p.amount, 0);
    const collectionRate = payments.length > 0 ? Math.round((paid.length / payments.length) * 100) : 0;

    let filtered = payments;
    if (currentPaymentFilter === 'paid') filtered = paid;
    else if (currentPaymentFilter === 'pending') filtered = pending;
    else if (currentPaymentFilter === 'overdue') filtered = overdue;

    container.innerHTML = `
        <div class="payment-stats">
            <div class="payment-stat collected">
                <div class="ps-value">€${totalCollected.toFixed(0)}</div>
                <div class="ps-label">${t('payments.totalCollected')}</div>
                <div class="progress-bar mt-1"><div class="progress-fill green" style="width:${collectionRate}%"></div></div>
            </div>
            <div class="payment-stat pending">
                <div class="ps-value">€${totalPending.toFixed(0)}</div>
                <div class="ps-label">${t('payments.totalPending')}</div>
            </div>
            <div class="payment-stat overdue">
                <div class="ps-value">€${totalOverdue.toFixed(0)}</div>
                <div class="ps-label">${t('payments.totalOverdue')}</div>
            </div>
            <div class="payment-stat rate">
                <div class="ps-value">${collectionRate}%</div>
                <div class="ps-label">${t('payments.collectionRate')}</div>
            </div>
        </div>
        <div class="d-flex align-center justify-between mb-2" style="flex-wrap:wrap;gap:12px;">
            <div class="tab-filters">
                <button class="tab-filter ${currentPaymentFilter === 'all' ? 'active' : ''}" onclick="setPaymentFilter('all')">${t('payments.all')} <span class="count">${payments.length}</span></button>
                <button class="tab-filter ${currentPaymentFilter === 'paid' ? 'active' : ''}" onclick="setPaymentFilter('paid')">${t('payments.paid')} <span class="count">${paid.length}</span></button>
                <button class="tab-filter ${currentPaymentFilter === 'pending' ? 'active' : ''}" onclick="setPaymentFilter('pending')">${t('payments.pending')} <span class="count">${pending.length}</span></button>
                <button class="tab-filter ${currentPaymentFilter === 'overdue' ? 'active' : ''}" onclick="setPaymentFilter('overdue')">${t('payments.overdue')} <span class="count">${overdue.length}</span></button>
            </div>
            <button class="btn btn-primary btn-sm" onclick="openPaymentModal()"><i class="fas fa-plus"></i> ${t('payments.newPayment')}</button>
        </div>
        <div class="card">
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>${t('payments.athlete')}</th>
                            <th>${t('payments.description')}</th>
                            <th>${t('payments.type')}</th>
                            <th>${t('payments.amount')}</th>
                            <th>${t('payments.dueDate')}</th>
                            <th>${t('payments.status')}</th>
                            <th>${t('common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filtered.map(p => {
                            const a = athletes.find(at => at.id === p.athleteId);
                            const badge = p.status === 'paid' ? 'badge-paid' : p.status === 'pending' ? 'badge-pending' : 'badge-overdue';
                            const typeText = t(`payments.${p.type}`) || p.type;
                            return `<tr>
                                <td>
                                    <div class="athlete-cell">
                                        ${a ? `<div class="athlete-avatar ${a.gender === 'M' ? 'avatar-m' : 'avatar-f'}" style="width:28px;height:28px;font-size:0.6rem;">${a.firstName[0]}${a.lastName[0]}</div>` : ''}
                                        <span class="fw-semibold" style="cursor:pointer;" onclick="viewAthleteProfile(${p.athleteId})">${a ? `${a.firstName} ${a.lastName}` : '-'}</span>
                                    </div>
                                </td>
                                <td class="text-sm">${p.description}</td>
                                <td class="text-sm">${typeText}</td>
                                <td class="fw-semibold">€${p.amount.toFixed(2)}</td>
                                <td class="text-sm">${formatDate(p.dueDate)}</td>
                                <td><span class="badge ${badge}">${t(`payments.${p.status}`)}</span></td>
                                <td>
                                    <div class="btn-group">
                                        ${p.status !== 'paid' ? `<button class="btn btn-sm btn-primary" onclick="markPaymentPaid(${p.id})"><i class="fas fa-check"></i></button>` : ''}
                                        ${p.status !== 'paid' ? `<button class="btn btn-sm btn-secondary" onclick="sendPaymentReminder(${p.id})" title="${t('payments.sendReminder')}"><i class="fas fa-envelope"></i></button>` : ''}
                                    </div>
                                </td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function setPaymentFilter(filter) {
    currentPaymentFilter = filter;
    renderPayments();
}

function markPaymentPaid(paymentId) {
    const payment = payments.find(p => p.id === paymentId);
    if (payment) {
        payment.status = 'paid';
        payment.paidDate = new Date().toISOString().split('T')[0];
        showToast(t('notif.paymentUpdated'), 'success');
        renderPayments();
    }
}

function sendPaymentReminder(paymentId) {
    showToast(t('notif.reminderSent'), 'info');
}

// ---- Payment Creation ----
function openPaymentModal() {
    const modal = document.getElementById('payment-modal');
    const form = document.getElementById('payment-form');
    const title = document.getElementById('payment-modal-title');
    title.innerHTML = `<i class="fas fa-file-invoice-dollar" style="margin-right:8px;color:var(--green-primary);"></i>${t('payments.newPayment')}`;

    form.innerHTML = `
        <div class="form-group">
            <label class="form-label">${t('payments.athlete')} *</label>
            <select class="form-control" id="form-payment-athlete">
                <option value="">${t('form.selectClub').replace('clube', 'atleta').replace('club', 'athlete')}</option>
                ${athletes.filter(a => a.status === 'active').map(a => `<option value="${a.id}">${a.firstName} ${a.lastName}</option>`).join('')}
            </select>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('payments.type')} *</label>
                <select class="form-control" id="form-payment-type">
                    <option value="quota_annual">${t('payments.quota_annual')}</option>
                    <option value="tournament_fee">${t('payments.tournament_fee')}</option>
                    <option value="license_fee">${t('payments.license_fee')}</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">${t('payments.amount')} (€) *</label>
                <input type="number" class="form-control" id="form-payment-amount" value="50" min="0" step="0.01">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">${t('payments.description')} *</label>
            <input type="text" class="form-control" id="form-payment-desc" value="">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label class="form-label">${t('payments.dueDate')} *</label>
                <input type="date" class="form-control" id="form-payment-due" value="2026-04-01">
            </div>
            <div class="form-group">
                <label class="form-label">${t('payments.status')}</label>
                <select class="form-control" id="form-payment-status">
                    <option value="pending">${t('payments.pending')}</option>
                    <option value="paid">${t('payments.paid')}</option>
                    <option value="overdue">${t('payments.overdue')}</option>
                </select>
            </div>
        </div>
    `;
    modal.classList.add('active');
}

function savePayment() {
    const athleteId = parseInt(document.getElementById('form-payment-athlete').value);
    const description = document.getElementById('form-payment-desc').value.trim();
    const amount = parseFloat(document.getElementById('form-payment-amount').value);
    const dueDate = document.getElementById('form-payment-due').value;

    if (!athleteId || !description || isNaN(amount) || !dueDate) {
        showToast(t('notif.requiredFields'), 'warning');
        return;
    }

    const newId = Math.max(0, ...payments.map(p => p.id)) + 1;
    const status = document.getElementById('form-payment-status').value;
    payments.push({
        id: newId,
        athleteId,
        description,
        type: document.getElementById('form-payment-type').value,
        amount,
        dueDate,
        status,
        paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : null
    });

    closeModal('payment-modal');
    showToast(t('notif.paymentCreated'), 'success');
    renderPayments();
}

// ---- Calendar ----
function renderCalendar() {
    const container = document.getElementById('calendar-content');
    if (!container) return;
    const lang = getCurrentLanguage();
    const months = t('calendar.months');
    const weekdays = t('calendar.weekdays');

    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Get events for this month - combine calendar events, tournaments, and payment deadlines
    const allEvents = [...MOCK_CALENDAR_EVENTS];

    // Add tournaments as calendar events
    tournaments.forEach(tr => {
        if (!allEvents.find(e => e.title === tr.name)) {
            allEvents.push({ date: tr.date, title: tr.name, type: 'tournament', color: '#2e7d32' });
        }
    });

    // Add overdue/pending payment deadlines
    payments.filter(p => p.status !== 'paid').forEach(p => {
        const a = athletes.find(at => at.id === p.athleteId);
        const name = a ? `${a.firstName} ${a.lastName[0]}.` : '';
        allEvents.push({ date: p.dueDate, title: `${p.description} - ${name}`, type: 'deadline', color: p.status === 'overdue' ? '#c62828' : '#ffc107' });
    });

    const monthEvents = allEvents.filter(e => {
        const d = new Date(e.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });

    // Upcoming events (from today) - use combined events
    const upcoming = allEvents
        .filter(e => new Date(e.date) >= new Date('2026-03-02'))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 8);

    const days = [];
    // Previous month padding
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
        days.push({ day: prevMonthLast - i, current: false, events: [] });
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const dayEvents = monthEvents.filter(e => e.date === dateStr);
        days.push({ day: d, current: true, date: dateStr, events: dayEvents, isToday: dateStr === '2026-03-02' });
    }
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, current: false, events: [] });
    }

    container.innerHTML = `
        <div class="calendar-container">
            <div class="calendar-grid-wrapper">
                <div class="card">
                    <div class="calendar-header-nav">
                        <button class="calendar-nav-btn" onclick="changeMonth(-1)"><i class="fas fa-chevron-left"></i></button>
                        <h3 class="calendar-month-title">${months[month]} ${year}</h3>
                        <button class="calendar-nav-btn" onclick="changeMonth(1)"><i class="fas fa-chevron-right"></i></button>
                    </div>
                    <div class="calendar-grid">
                        ${weekdays.map(d => `<div class="calendar-day-header">${d}</div>`).join('')}
                        ${days.map(d => `
                            <div class="calendar-day ${d.current ? '' : 'other-month'} ${d.isToday ? 'today' : ''}">
                                <div class="day-number">${d.day}</div>
                                ${d.events.map(e => `<div class="calendar-event" style="background:${e.color};" title="${e.title}">${e.title}</div>`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="event-list-sidebar">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title"><i class="fas fa-calendar-alt" style="color:var(--green-primary);margin-right:8px;"></i>${t('calendar.upcomingEvents')}</h3>
                    </div>
                    ${upcoming.map(e => {
                        const d = new Date(e.date);
                        const monthShort = months[d.getMonth()].substring(0, 3);
                        const typeMap = { tournament: t('calendar.tournament'), meeting: t('calendar.meeting'), deadline: t('calendar.deadline'), training: t('calendar.training'), event: t('calendar.event') };
                        return `<div class="event-list-item">
                            <div class="event-date-badge">
                                <div class="edb-month">${monthShort}</div>
                                <div class="edb-day">${d.getDate()}</div>
                            </div>
                            <div class="event-info">
                                <div class="event-title">${e.title}</div>
                                <div class="event-type" style="background:${e.color}20;color:${e.color};">${typeMap[e.type] || e.type}</div>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </div>
    `;
}

function changeMonth(delta) {
    calendarDate.setMonth(calendarDate.getMonth() + delta);
    renderCalendar();
}

// ---- Reports ----
function renderReports() {
    const container = document.getElementById('reports-content');
    if (!container) return;
    const lang = getCurrentLanguage();

    // Calculate stats
    const active = athletes.filter(a => a.status === 'active');
    const maleCount = active.filter(a => a.gender === 'M').length;
    const femaleCount = active.filter(a => a.gender === 'F').length;
    const clubCounts = {};
    active.forEach(a => {
        const club = MOCK_CLUBS.find(c => c.id === a.clubId);
        const name = club ? club.name : a.clubId;
        clubCounts[name] = (clubCounts[name] || 0) + 1;
    });
    const ageCounts = {};
    active.forEach(a => { ageCounts[a.ageCategory] = (ageCounts[a.ageCategory] || 0) + 1; });

    // Top performers
    const performerScores = {};
    scores.forEach(s => {
        if (!performerScores[s.athleteId]) performerScores[s.athleteId] = [];
        performerScores[s.athleteId].push(s.score);
    });
    const topPerformers = Object.entries(performerScores)
        .map(([id, sc]) => {
            const a = athletes.find(at => at.id === parseInt(id));
            return a ? { athlete: a, best: Math.max(...sc), avg: Math.round(sc.reduce((s, v) => s + v, 0) / sc.length), events: sc.length } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.best - a.best)
        .slice(0, 10);

    container.innerHTML = `
        <div class="d-flex justify-between align-center mb-3">
            <span></span>
            <button class="btn btn-primary btn-sm" onclick="exportReportsCSV()"><i class="fas fa-download"></i> ${t('athletes.export')} CSV</button>
        </div>
        <div class="report-grid">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><i class="fas fa-venus-mars" style="color:var(--purple-primary);margin-right:8px;"></i>${t('reports.genderDistribution')}</h3></div>
                <div class="chart-wrapper"><canvas id="chart-gender"></canvas></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><i class="fas fa-layer-group" style="color:var(--blue-primary);margin-right:8px;"></i>${t('reports.ageDistribution')}</h3></div>
                <div class="chart-wrapper"><canvas id="chart-age"></canvas></div>
            </div>
        </div>
        <div class="report-grid">
            <div class="card">
                <div class="card-header"><h3 class="card-title"><i class="fas fa-home" style="color:var(--green-primary);margin-right:8px;"></i>${t('reports.clubDistribution')}</h3></div>
                <div class="chart-wrapper"><canvas id="chart-clubs"></canvas></div>
            </div>
            <div class="card">
                <div class="card-header"><h3 class="card-title"><i class="fas fa-chart-line" style="color:var(--red-primary);margin-right:8px;"></i>${t('reports.scoreEvolution')}</h3></div>
                <div class="chart-wrapper"><canvas id="chart-scores"></canvas></div>
            </div>
        </div>
        <div class="card">
            <div class="card-header"><h3 class="card-title"><i class="fas fa-star" style="color:var(--gold-dark);margin-right:8px;"></i>${t('reports.topPerformers')}</h3></div>
            <div class="table-container">
                <table class="data-table">
                    <thead><tr>
                        <th>#</th>
                        <th>${t('standings.athlete')}</th>
                        <th>${t('athletes.discipline')}</th>
                        <th>${t('athletes.club')}</th>
                        <th style="text-align:center;">${t('profile.bestScore')}</th>
                        <th style="text-align:center;">${t('profile.avgScore')}</th>
                        <th style="text-align:center;">${t('standings.events')}</th>
                    </tr></thead>
                    <tbody>
                        ${topPerformers.map((p, idx) => {
                            const club = MOCK_CLUBS.find(c => c.id === p.athlete.clubId);
                            const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`;
                            return `<tr>
                                <td class="fw-bold ${idx < 3 ? `rank-${idx + 1}` : ''}" style="text-align:center;">${medal}</td>
                                <td>
                                    <div class="athlete-cell">
                                        <div class="athlete-avatar ${p.athlete.gender === 'M' ? 'avatar-m' : 'avatar-f'}" style="width:28px;height:28px;font-size:0.6rem;">${p.athlete.firstName[0]}${p.athlete.lastName[0]}</div>
                                        <span class="fw-semibold" style="cursor:pointer;" onclick="viewAthleteProfile(${p.athlete.id})">${p.athlete.firstName} ${p.athlete.lastName}</span>
                                    </div>
                                </td>
                                <td>${p.athlete.discipline}</td>
                                <td class="text-sm">${club ? club.name : '-'}</td>
                                <td class="text-center fw-bold text-green">${p.best}</td>
                                <td class="text-center">${p.avg}</td>
                                <td class="text-center">${p.events}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    // Render charts after DOM insertion
    setTimeout(() => {
        // Gender chart
        const genderCtx = document.getElementById('chart-gender');
        if (genderCtx) {
            if (charts['gender']) charts['gender'].destroy();
            charts['gender'] = new Chart(genderCtx, {
                type: 'pie',
                data: {
                    labels: [t('form.male'), t('form.female')],
                    datasets: [{ data: [maleCount, femaleCount], backgroundColor: ['#2e7d32', '#c62828'], borderWidth: 0 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } } }
            });
        }

        // Age chart
        const ageCtx = document.getElementById('chart-age');
        if (ageCtx) {
            if (charts['age']) charts['age'].destroy();
            charts['age'] = new Chart(ageCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(ageCounts),
                    datasets: [{ label: t('nav.athletes'), data: Object.values(ageCounts), backgroundColor: '#2e7d32', borderRadius: 6 }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        }

        // Clubs chart
        const clubsCtx = document.getElementById('chart-clubs');
        if (clubsCtx) {
            if (charts['clubs']) charts['clubs'].destroy();
            const sortedClubs = Object.entries(clubCounts).sort((a, b) => b[1] - a[1]);
            charts['clubs'] = new Chart(clubsCtx, {
                type: 'bar',
                data: {
                    labels: sortedClubs.map(c => c[0].length > 20 ? c[0].substring(0, 18) + '...' : c[0]),
                    datasets: [{ label: t('nav.athletes'), data: sortedClubs.map(c => c[1]), backgroundColor: '#1565c0', borderRadius: 6 }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } } }
            });
        }

        // Score evolution chart - top 3 athletes
        const scoreCtx = document.getElementById('chart-scores');
        if (scoreCtx) {
            if (charts['scores']) charts['scores'].destroy();
            const leagueTournaments = tournaments.filter(tr => tr.isLeague).sort((a, b) => new Date(a.date) - new Date(b.date));
            const top3 = topPerformers.slice(0, 3);
            const colors = ['#2e7d32', '#c62828', '#1565c0'];
            charts['scores'] = new Chart(scoreCtx, {
                type: 'line',
                data: {
                    labels: leagueTournaments.map((lt, i) => `${t('standings.etapa')} ${i + 1}`),
                    datasets: top3.map((p, i) => ({
                        label: `${p.athlete.firstName} ${p.athlete.lastName[0]}.`,
                        data: leagueTournaments.map(lt => {
                            const sc = scores.find(s => s.tournamentId === lt.id && s.athleteId === p.athlete.id);
                            return sc ? sc.score : null;
                        }),
                        borderColor: colors[i],
                        backgroundColor: colors[i] + '20',
                        tension: 0.3,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true
                    }))
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 14, usePointStyle: true, font: { size: 11 } } } }, scales: { y: { beginAtZero: false } } }
            });
        }
    }, 50);
}

// ---- Sidebar Badge Updates ----
function updateSidebarBadges() {
    const athleteBadge = document.querySelector('.nav-item[data-page="athletes"] .nav-badge');
    const paymentBadge = document.querySelector('.nav-item[data-page="payments"] .nav-badge');
    if (athleteBadge) athleteBadge.textContent = athletes.length;
    const overdueCount = payments.filter(p => p.status === 'overdue').length;
    if (paymentBadge) paymentBadge.textContent = overdueCount;
}

// ---- Delete Tournament ----
function deleteTournament(id) {
    showConfirmDialog(t('notif.confirmDelete'), () => {
        tournaments = tournaments.filter(tr => tr.id !== id);
        scores = scores.filter(s => s.tournamentId !== id);
        showToast(t('notif.tournamentDeleted'), 'success');
        renderTournaments();
    });
}

// ---- Custom Confirmation Dialog ----
function showConfirmDialog(message, onConfirm) {
    const existing = document.getElementById('confirm-dialog');
    if (existing) existing.remove();
    const overlay = document.createElement('div');
    overlay.id = 'confirm-dialog';
    overlay.className = 'modal-overlay active';
    overlay.innerHTML = `
        <div class="modal" style="max-width:420px;">
            <div class="modal-header" style="border-bottom:none;padding-bottom:0;">
                <h3 class="modal-title"><i class="fas fa-exclamation-triangle" style="color:var(--gold-dark);margin-right:8px;"></i>${t('common.confirm')}</h3>
            </div>
            <div class="modal-body" style="padding:12px 24px 20px;">
                <p style="color:var(--text-secondary);font-size:0.92rem;line-height:1.5;">${message}</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="confirm-cancel">${t('common.cancel')}</button>
                <button class="btn btn-primary" id="confirm-ok" style="background:var(--red-primary);"><i class="fas fa-check"></i> ${t('common.confirm')}</button>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#confirm-cancel').onclick = () => overlay.remove();
    overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); onConfirm(); };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

// ---- Report Export ----
function exportReportsCSV() {
    const topPerformerScores = {};
    scores.forEach(s => {
        if (!topPerformerScores[s.athleteId]) topPerformerScores[s.athleteId] = [];
        topPerformerScores[s.athleteId].push(s.score);
    });
    const topPerformers = Object.entries(topPerformerScores)
        .map(([id, sc]) => {
            const a = athletes.find(at => at.id === parseInt(id));
            return a ? { athlete: a, best: Math.max(...sc), avg: Math.round(sc.reduce((s, v) => s + v, 0) / sc.length), events: sc.length } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.best - a.best)
        .slice(0, 20);

    const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const lang = getCurrentLanguage();
    const csv = 'Rank,Nome,Disciplina,Clube,Melhor,Media,Eventos\n' +
        topPerformers.map((p, i) => [i+1, p.athlete.firstName + ' ' + p.athlete.lastName, p.athlete.discipline, MOCK_CLUBS.find(c => c.id === p.athlete.clubId)?.name || '', p.best, p.avg, p.events].map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'relatorio_fpta.csv'; link.click();
    URL.revokeObjectURL(url);
    showToast(t('notif.exportSuccess'), 'success');
}

// ---- Utility Functions ----
function initModalOverlays() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });
    });
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `
        <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.classList.add('removing');setTimeout(()=>this.parentElement.remove(),300);">&times;</button>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const lang = getCurrentLanguage();
    return d.toLocaleDateString(lang === 'pt' ? 'pt-PT' : 'en-US', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatRelativeTime(timestamp) {
    const now = new Date('2026-03-02T12:00:00');
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const lang = getCurrentLanguage();

    if (diffMins < 60) return lang === 'pt' ? `há ${diffMins}m` : `${diffMins}m ago`;
    if (diffHours < 24) return lang === 'pt' ? `há ${diffHours}h` : `${diffHours}h ago`;
    if (diffDays < 7) return lang === 'pt' ? `há ${diffDays}d` : `${diffDays}d ago`;
    return formatDate(timestamp);
}

// Mobile menu
function toggleMobileMenu() {
    document.querySelector('.sidebar').classList.toggle('open');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) backdrop.classList.toggle('active');
}

// Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

        if (e.key === '/' || (e.ctrlKey && e.key === 'k')) {
            e.preventDefault();
            document.getElementById('global-search').focus();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
            hideSearchResults();
        }
        if (e.altKey && e.key === '1') navigateTo('dashboard');
        if (e.altKey && e.key === '2') navigateTo('athletes');
        if (e.altKey && e.key === '3') navigateTo('tournaments');
        if (e.altKey && e.key === '4') navigateTo('standings');
        if (e.altKey && e.key === '5') navigateTo('payments');
        if (e.altKey && e.key === '6') navigateTo('calendar');
        if (e.altKey && e.key === '7') navigateTo('reports');
        if (e.altKey && e.key === 'n') openAthleteModal();
    });
}

// Animated counter
function animateCounter(elementId, target, prefix = '', duration = 800) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const startTime = performance.now();
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = prefix + Math.round(target * eased);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
