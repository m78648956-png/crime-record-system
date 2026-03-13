// ================================================================
//  CRIME RECORD MANAGEMENT SYSTEM V2 - ADVANCED
// ================================================================

// ===== DATA =====
let records = JSON.parse(localStorage.getItem('crms_records')) || [];
let criminals = JSON.parse(localStorage.getItem('crms_criminals')) || [];
let officers = JSON.parse(localStorage.getItem('crms_officers')) || [];
let complaints = JSON.parse(localStorage.getItem('crms_complaints')) || [];
let activityLog = JSON.parse(localStorage.getItem('crms_log')) || [];
let currentUser = null;
let currentSearch = 'cases';
let viewingRecord = null;
let viewingComplaint = null;

// Default Users
const defaultUsers = [
    { username: 'admin123', password: 'admin123@#$%^&', role: 'Admin', name: 'Administrator' },
];

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    if (records.length === 0) loadSampleData();
    createParticles();
    setupPublicNav();
    setupEventListeners();
    updateHeroStats();
    updateDate();

    // Check session
    const saved = sessionStorage.getItem('crms_user');
    if (saved) {
        currentUser = JSON.parse(saved);
        showDashboard();
    }
});

// ===== PARTICLES =====
function createParticles() {
    const c = document.getElementById('particles');
    if (!c) return;
    for (let i = 0; i < 50; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (Math.random() * 10 + 5) + 's';
        p.style.animationDelay = Math.random() * 10 + 's';
        p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
        c.appendChild(p);
    }
}

// ===== PUBLIC NAV =====
function setupPublicNav() {
    // Scroll effect
    window.addEventListener('scroll', () => {
        const nav = document.getElementById('pubNav');
        if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Mobile toggle
    const toggle = document.getElementById('pubNavToggle');
    const links = document.getElementById('pubNavLinks');
    if (toggle) toggle.addEventListener('click', () => links.classList.toggle('open'));

    // Close on link click
    document.querySelectorAll('.pub-nav-links a').forEach(a => {
        a.addEventListener('click', () => links.classList.remove('open'));
    });
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Go to login
    document.getElementById('goToLogin')?.addEventListener('click', e => {
        e.preventDefault();
        showPage('loginPage');
    });

    // Back to site
    document.getElementById('backToSite')?.addEventListener('click', () => showPage('publicSite'));

    // Login Form
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);

    // Toggle password
    document.getElementById('togglePass')?.addEventListener('click', () => {
        const inp = document.getElementById('loginPassword');
        const icon = document.getElementById('togglePass').querySelector('i');
        if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
        else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
    });

    // Logout
    document.getElementById('logoutBtn')?.addEventListener('click', handleLogout);

    // Sidebar nav
    document.querySelectorAll('.sb-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Menu toggle
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('show');
    });
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('show');
    });

    // Crime Form
    document.getElementById('crimeForm')?.addEventListener('submit', handleCrimeForm);

    // Criminal Form
    document.getElementById('criminalForm')?.addEventListener('submit', handleCriminalForm);
    document.getElementById('showAddCriminal')?.addEventListener('click', () => {
        document.getElementById('criminalFormWrap').style.display = 'block';
        document.getElementById('criminalForm').reset();
        document.getElementById('editCriminalId').value = '';
    });
    document.getElementById('cancelCriminal')?.addEventListener('click', () => {
        document.getElementById('criminalFormWrap').style.display = 'none';
    });

    // Officer Form
    document.getElementById('officerForm')?.addEventListener('submit', handleOfficerForm);
    document.getElementById('showAddOfficer')?.addEventListener('click', () => {
        document.getElementById('officerFormWrap').style.display = 'block';
        document.getElementById('officerForm').reset();
        document.getElementById('editOfficerId').value = '';
    });
    document.getElementById('cancelOfficer')?.addEventListener('click', () => {
        document.getElementById('officerFormWrap').style.display = 'none';
    });

    // Filters
    document.getElementById('applyFilter')?.addEventListener('click', applyFilters);
    document.getElementById('clearFilter')?.addEventListener('click', clearFilters);

    // Search
    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('keyup', e => { if (e.key === 'Enter') performSearch(); });

    // Quick Search
    document.getElementById('quickSearch')?.addEventListener('keyup', e => {
        if (e.key === 'Enter') { navigateTo('search'); document.getElementById('searchInput').value = e.target.value; performSearch(); }
    });

    // Track FIR
    document.getElementById('trackFIRBtn')?.addEventListener('click', trackFIR);
    document.getElementById('trackFIRInput')?.addEventListener('keyup', e => { if (e.key === 'Enter') trackFIR(); });

    // Public Complaint
    document.getElementById('publicComplaintForm')?.addEventListener('submit', handlePublicComplaint);

    // Notifications
    document.getElementById('notifBtn')?.addEventListener('click', () => {
        const p = document.getElementById('notifPanel');
        p.style.display = p.style.display === 'none' ? 'block' : 'none';
    });

    // Theme Toggle
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Modal close on outside click
    document.getElementById('viewModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
    document.getElementById('compModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeCompModal(); });

    // Close notif on outside
    document.addEventListener('click', e => {
        if (!e.target.closest('#notifBtn') && !e.target.closest('#notifPanel')) {
            const p = document.getElementById('notifPanel');
            if (p) p.style.display = 'none';
        }
    });
}

// ===== PAGE MANAGEMENT =====
function showPage(pageId) {
    ['publicSite', 'loginPage', 'dashboardApp'].forEach(id => {
        document.getElementById(id).style.display = id === pageId ? (id === 'dashboardApp' ? 'block' : (id === 'publicSite' ? 'block' : 'block')) : 'none';
    });
    if (pageId === 'publicSite') window.scrollTo(0, 0);
}

// ===== AUTHENTICATION =====
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errEl = document.getElementById('loginError');

    // Check default users
    let user = defaultUsers.find(u => u.username === username && u.password === password);

    // Check officer users
    if (!user) {
        const officer = officers.find(o => o.username === username && o.password === password);
        if (officer) user = { username: officer.username, password: officer.password, role: 'Officer', name: officer.name };
    }

    if (user) {
        currentUser = user;
        sessionStorage.setItem('crms_user', JSON.stringify(user));
        errEl.style.display = 'none';
        addLog('login', `${user.name} logged in as ${user.role}`);
        showDashboard();
        toast('Welcome back, ' + user.name + '!', 'success');
    } else {
        errEl.textContent = 'Invalid username or password. Access denied.';
        errEl.style.display = 'block';
    }
}

function handleLogout() {
    addLog('login', `${currentUser.name} logged out`);
    sessionStorage.removeItem('crms_user');
    currentUser = null;
    showPage('publicSite');
    toast('Logged out successfully', 'info');
}

function showDashboard() {
    showPage('dashboardApp');
    document.getElementById('sbUserName').textContent = currentUser.name;
    document.getElementById('sbUserRole').textContent = currentUser.role;
    document.getElementById('sbAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('tbAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
    document.getElementById('tbUserName').textContent = currentUser.name;
    document.getElementById('sbRole').textContent = currentUser.role + ' Panel';

    // Role-based visibility
    const isAdmin = currentUser.role === 'Admin';
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
    });

    navigateTo('dashboard');
    updateNotifications();
}

// ===== NAVIGATION =====
function navigateTo(page) {
    document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`[data-page="${page}"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.pg').forEach(p => p.classList.remove('active'));
    const pg = document.getElementById(`pg-${page}`);
    if (pg) pg.classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Dashboard', addRecord: 'New FIR', allRecords: 'All Records',
        criminals: 'Criminal Records', officers: 'Officer Management',
        complaints: 'Public Complaints', search: 'Search', reports: 'Reports',
        activityLog: 'Activity Log'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Refresh data
    if (page === 'dashboard') refreshDashboard();
    if (page === 'allRecords') renderAllRecords();
    if (page === 'criminals') renderCriminals();
    if (page === 'officers') renderOfficers();
    if (page === 'complaints') renderComplaints();
    if (page === 'activityLog') renderActivityLog();

    // Close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
}

// ===== DATE =====
function updateDate() {
    const el = document.getElementById('tbDate');
    if (el) el.textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ===== FORM STEPS =====
function goStep(n) {
    document.querySelectorAll('.form-step-content').forEach(s => s.classList.remove('active'));
    document.getElementById(`step${n}`).classList.add('active');
    document.querySelectorAll('.step').forEach(s => {
        const sn = parseInt(s.dataset.step);
        s.classList.remove('active', 'done');
        if (sn === n) s.classList.add('active');
        if (sn < n) s.classList.add('done');
    });
}

// ===== CRIME RECORD CRUD =====
function handleCrimeForm(e) {
    e.preventDefault();
    const editId = document.getElementById('editId').value;

    const rec = {
        id: editId || Date.now().toString(),
        firNumber: document.getElementById('firNumber').value.trim(),
        crimeType: document.getElementById('crimeType').value,
        crimeDate: document.getElementById('crimeDate').value,
        crimeTime: document.getElementById('crimeTime').value,
        location: document.getElementById('crimeLocation').value.trim(),
        priority: document.getElementById('crimePriority').value,
        victimName: document.getElementById('victimName').value.trim(),
        victimContact: document.getElementById('victimContact').value,
        victimCNIC: document.getElementById('victimCNIC')?.value || '',
        victimAddress: document.getElementById('victimAddress')?.value || '',
        suspectName: document.getElementById('suspectName').value,
        suspectDesc: document.getElementById('suspectDesc')?.value || '',
        officerName: document.getElementById('officerName').value.trim(),
        policeStation: document.getElementById('policeStation')?.value || '',
        status: document.getElementById('caseStatus').value,
        evidence: document.getElementById('evidence').value,
        witnesses: document.getElementById('witnesses')?.value || '',
        weaponUsed: document.getElementById('weaponUsed')?.value || '',
        description: document.getElementById('crimeDescription').value.trim(),
        officerNotes: document.getElementById('officerNotes')?.value || '',
        createdAt: editId ? (records.find(r => r.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: currentUser.name
    };

    if (editId) {
        const idx = records.findIndex(r => r.id === editId);
        if (idx !== -1) { records[idx] = rec; addLog('edit', `Updated FIR: ${rec.firNumber}`); toast('Record updated!', 'success'); }
    } else {
        if (records.find(r => r.firNumber === rec.firNumber)) { toast('FIR Number already exists!', 'error'); return; }
        records.push(rec);
        addLog('add', `New FIR registered: ${rec.firNumber}`);
        toast('FIR registered successfully!', 'success');
    }

    save();
    document.getElementById('crimeForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Register New FIR';
    goStep(1);
    navigateTo('allRecords');
}

function editRecord(id) {
    const r = records.find(x => x.id === id);
    if (!r) return;
    document.getElementById('editId').value = r.id;
    document.getElementById('firNumber').value = r.firNumber;
    document.getElementById('crimeType').value = r.crimeType;
    document.getElementById('crimeDate').value = r.crimeDate;
    document.getElementById('crimeTime').value = r.crimeTime || '';
    document.getElementById('crimeLocation').value = r.location;
    document.getElementById('crimePriority').value = r.priority;
    document.getElementById('victimName').value = r.victimName;
    document.getElementById('victimContact').value = r.victimContact || '';
    if (document.getElementById('victimCNIC')) document.getElementById('victimCNIC').value = r.victimCNIC || '';
    if (document.getElementById('victimAddress')) document.getElementById('victimAddress').value = r.victimAddress || '';
    document.getElementById('suspectName').value = r.suspectName || '';
    if (document.getElementById('suspectDesc')) document.getElementById('suspectDesc').value = r.suspectDesc || '';
    document.getElementById('officerName').value = r.officerName;
    if (document.getElementById('policeStation')) document.getElementById('policeStation').value = r.policeStation || '';
    document.getElementById('caseStatus').value = r.status;
    document.getElementById('evidence').value = r.evidence || '';
    if (document.getElementById('witnesses')) document.getElementById('witnesses').value = r.witnesses || '';
    if (document.getElementById('weaponUsed')) document.getElementById('weaponUsed').value = r.weaponUsed || '';
    document.getElementById('crimeDescription').value = r.description;
    if (document.getElementById('officerNotes')) document.getElementById('officerNotes').value = r.officerNotes || '';
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit FIR: ' + r.firNumber;
    document.getElementById('submitBtn').innerHTML = '<i class="fas fa-save"></i> Update Record';
    navigateTo('addRecord');
    goStep(1);
}

function deleteRecord(id) {
    if (!confirm('Delete this record permanently?')) return;
    const r = records.find(x => x.id === id);
    records = records.filter(x => x.id !== id);
    save();
    addLog('delete', `Deleted FIR: ${r?.firNumber || id}`);
    renderAllRecords();
    toast('Record deleted', 'success');
}

function viewRecord(id) {
    const r = records.find(x => x.id === id);
    if (!r) return;
    viewingRecord = r;
    document.getElementById('modalTitle').innerHTML = `<i class="fas fa-file-alt"></i> ${r.firNumber}`;
    const fields = [
        ['FIR Number', r.firNumber], ['Crime Type', r.crimeType],
        ['Date & Time', `${formatDate(r.crimeDate)} ${r.crimeTime || ''}`],
        ['Location', r.location], ['Police Station', r.policeStation || 'N/A'],
        ['Priority', `<span class="badge bg-${r.priority.toLowerCase()}">${r.priority}</span>`],
        ['Status', `<span class="badge bg-${statusClass(r.status)}">${r.status}</span>`],
        ['Victim', r.victimName], ['Victim Contact', r.victimContact || 'N/A'],
        ['Victim CNIC', r.victimCNIC || 'N/A'], ['Victim Address', r.victimAddress || 'N/A'],
        ['Suspect', r.suspectName || 'Unknown'], ['Suspect Description', r.suspectDesc || 'N/A'],
        ['Officer', r.officerName], ['Evidence', r.evidence || 'N/A'],
        ['Witnesses', r.witnesses || 'N/A'], ['Weapon Used', r.weaponUsed || 'N/A'],
        ['Description', r.description], ['Officer Notes', r.officerNotes || 'N/A'],
        ['Created', new Date(r.createdAt).toLocaleString()],
        ['Last Updated', new Date(r.updatedAt).toLocaleString()],
        ['Created By', r.createdBy || 'System']
    ];
    document.getElementById('modalBody').innerHTML = fields.map(([l, v]) =>
        `<div class="detail-row"><span class="detail-label">${l}</span><span class="detail-value">${v}</span></div>`
    ).join('');
    document.getElementById('viewModal').style.display = 'flex';
}

function closeModal() { document.getElementById('viewModal').style.display = 'none'; }

// ===== CRIMINAL CRUD =====
function handleCriminalForm(e) {
    e.preventDefault();
    const editId = document.getElementById('editCriminalId').value;
    const c = {
        id: editId || Date.now().toString(),
        name: document.getElementById('cName').value.trim(),
        cnic: document.getElementById('cCNIC').value,
        age: document.getElementById('cAge').value,
        gender: document.getElementById('cGender').value,
        address: document.getElementById('cAddress').value,
        history: document.getElementById('cHistory').value,
        status: document.getElementById('cStatus').value,
        relatedFIR: document.getElementById('cFIR').value,
        description: document.getElementById('cDesc').value,
        createdAt: editId ? (criminals.find(x => x.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    if (editId) {
        const idx = criminals.findIndex(x => x.id === editId);
        if (idx !== -1) criminals[idx] = c;
        addLog('edit', `Updated criminal: ${c.name}`);
        toast('Criminal record updated', 'success');
    } else {
        criminals.push(c);
        addLog('add', `Added criminal: ${c.name}`);
        toast('Criminal record added', 'success');
    }
    localStorage.setItem('crms_criminals', JSON.stringify(criminals));
    document.getElementById('criminalForm').reset();
    document.getElementById('editCriminalId').value = '';
    document.getElementById('criminalFormWrap').style.display = 'none';
    renderCriminals();
}

function editCriminal(id) {
    const c = criminals.find(x => x.id === id);
    if (!c) return;
    document.getElementById('editCriminalId').value = c.id;
    document.getElementById('cName').value = c.name;
    document.getElementById('cCNIC').value = c.cnic || '';
    document.getElementById('cAge').value = c.age || '';
    document.getElementById('cGender').value = c.gender;
    document.getElementById('cAddress').value = c.address || '';
    document.getElementById('cHistory').value = c.history || '';
    document.getElementById('cStatus').value = c.status;
    document.getElementById('cFIR').value = c.relatedFIR || '';
    document.getElementById('cDesc').value = c.description || '';
    document.getElementById('criminalFormWrap').style.display = 'block';
}

function deleteCriminal(id) {
    if (!confirm('Delete this criminal record?')) return;
    criminals = criminals.filter(x => x.id !== id);
    localStorage.setItem('crms_criminals', JSON.stringify(criminals));
    addLog('delete', 'Deleted a criminal record');
    renderCriminals();
    toast('Deleted', 'success');
}

// ===== OFFICER CRUD =====
function handleOfficerForm(e) {
    e.preventDefault();
    const editId = document.getElementById('editOfficerId').value;
    const o = {
        id: editId || Date.now().toString(),
        name: document.getElementById('oName').value.trim(),
        badge: document.getElementById('oBadge').value,
        rank: document.getElementById('oRank').value,
        phone: document.getElementById('oPhone').value,
        station: document.getElementById('oStation').value,
        username: document.getElementById('oUsername').value,
        password: document.getElementById('oPassword').value,
        status: document.getElementById('oStatus').value,
        createdAt: editId ? (officers.find(x => x.id === editId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };
    if (editId) {
        const idx = officers.findIndex(x => x.id === editId);
        if (idx !== -1) officers[idx] = o;
        toast('Officer updated', 'success');
    } else {
        officers.push(o);
        toast('Officer added', 'success');
    }
    addLog('add', `Officer: ${o.name} (${o.rank})`);
    localStorage.setItem('crms_officers', JSON.stringify(officers));
    document.getElementById('officerForm').reset();
    document.getElementById('editOfficerId').value = '';
    document.getElementById('officerFormWrap').style.display = 'none';
    renderOfficers();
}

function editOfficer(id) {
    const o = officers.find(x => x.id === id);
    if (!o) return;
    document.getElementById('editOfficerId').value = o.id;
    document.getElementById('oName').value = o.name;
    document.getElementById('oBadge').value = o.badge;
    document.getElementById('oRank').value = o.rank;
    document.getElementById('oPhone').value = o.phone || '';
    document.getElementById('oStation').value = o.station || '';
    document.getElementById('oUsername').value = o.username || '';
    document.getElementById('oPassword').value = o.password || '';
    document.getElementById('oStatus').value = o.status;
    document.getElementById('officerFormWrap').style.display = 'block';
}

function deleteOfficer(id) {
    if (!confirm('Delete this officer?')) return;
    officers = officers.filter(x => x.id !== id);
    localStorage.setItem('crms_officers', JSON.stringify(officers));
    renderOfficers();
    toast('Officer deleted', 'success');
}

// ===== PUBLIC COMPLAINT =====
function handlePublicComplaint(e) {
    e.preventDefault();
    const comp = {
        id: 'COMP-' + Date.now().toString().slice(-6),
        name: document.getElementById('compName').value.trim(),
        cnic: document.getElementById('compCNIC').value,
        phone: document.getElementById('compPhone').value,
        email: document.getElementById('compEmail').value,
        type: document.getElementById('compType').value,
        location: document.getElementById('compLocation').value,
        date: document.getElementById('compDate').value,
        urgency: document.getElementById('compUrgency').value,
        details: document.getElementById('compDetails').value,
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    complaints.push(comp);
    localStorage.setItem('crms_complaints', JSON.stringify(complaints));
    document.getElementById('publicComplaintForm').reset();
    toast('Complaint submitted successfully! Your ID: ' + comp.id, 'success');
    addLog('add', `Public complaint received: ${comp.id}`);
}

function viewComplaint(id) {
    const c = complaints.find(x => x.id === id);
    if (!c) return;
    viewingComplaint = c;
    const fields = [
        ['Complaint ID', c.id], ['Name', c.name], ['CNIC', c.cnic],
        ['Phone', c.phone], ['Email', c.email || 'N/A'], ['Type', c.type],
        ['Location', c.location], ['Date', formatDate(c.date)],
        ['Urgency', `<span class="badge bg-${c.urgency.toLowerCase()}">${c.urgency}</span>`],
        ['Status', `<span class="badge bg-${c.status.toLowerCase()}">${c.status}</span>`],
        ['Details', c.details], ['Submitted', new Date(c.createdAt).toLocaleString()]
    ];
    document.getElementById('compModalBody').innerHTML = fields.map(([l, v]) =>
        `<div class="detail-row"><span class="detail-label">${l}</span><span class="detail-value">${v}</span></div>`
    ).join('');
    document.getElementById('compModal').style.display = 'flex';
}

function closeCompModal() { document.getElementById('compModal').style.display = 'none'; }

function updateComplaintStatus(id, status) {
    const idx = complaints.findIndex(x => x.id === id);
    if (idx !== -1) {
        complaints[idx].status = status;
        localStorage.setItem('crms_complaints', JSON.stringify(complaints));
        renderComplaints();
        toast(`Complaint ${status}`, 'success');
    }
}

function convertToFIR() {
    if (!viewingComplaint) return;
    closeCompModal();
    document.getElementById('crimeType').value = viewingComplaint.type;
    document.getElementById('crimeDate').value = viewingComplaint.date;
    document.getElementById('crimeLocation').value = viewingComplaint.location;
    document.getElementById('victimName').value = viewingComplaint.name;
    document.getElementById('victimContact').value = viewingComplaint.phone;
    if (document.getElementById('victimCNIC')) document.getElementById('victimCNIC').value = viewingComplaint.cnic;
    document.getElementById('crimeDescription').value = viewingComplaint.details;
    document.getElementById('firNumber').value = 'FIR-' + new Date().getFullYear() + '-' + String(records.length + 1).padStart(3, '0');
    navigateTo('addRecord');
    goStep(1);
    updateComplaintStatus(viewingComplaint.id, 'Reviewed');
}

// ===== TRACK FIR =====
function trackFIR() {
    const fir = document.getElementById('trackFIRInput').value.trim();
    const result = document.getElementById('trackResult');
    if (!fir) { toast('Please enter FIR number', 'warning'); return; }

    const r = records.find(x => x.firNumber.toLowerCase() === fir.toLowerCase());
    if (r) {
        result.style.display = 'block';
        result.innerHTML = `
            <h3>✅ FIR Found: ${r.firNumber}</h3>
            <div class="track-row"><span class="t-label">Crime Type:</span><span class="t-value">${r.crimeType}</span></div>
            <div class="track-row"><span class="t-label">Date:</span><span class="t-value">${formatDate(r.crimeDate)}</span></div>
            <div class="track-row"><span class="t-label">Location:</span><span class="t-value">${r.location}</span></div>
            <div class="track-row"><span class="t-label">Status:</span><span class="t-value"><span class="badge bg-${statusClass(r.status)}">${r.status}</span></span></div>
            <div class="track-row"><span class="t-label">Investigating Officer:</span><span class="t-value">${r.officerName}</span></div>
            <div class="track-row"><span class="t-label">Last Updated:</span><span class="t-value">${new Date(r.updatedAt).toLocaleString()}</span></div>
        `;
    } else {
        result.style.display = 'block';
        result.innerHTML = '<h3 style="color:var(--danger)">❌ No FIR found with this number</h3><p style="color:var(--text2);margin-top:10px;">Please check the FIR number and try again.</p>';
    }
}

// ===== RENDER FUNCTIONS =====
function refreshDashboard() {
    document.getElementById('stTotal').textContent = records.length;
    document.getElementById('stOpen').textContent = records.filter(r => r.status === 'Open').length;
    document.getElementById('stInvestigation').textContent = records.filter(r => r.status === 'Under Investigation').length;
    document.getElementById('stSolved').textContent = records.filter(r => r.status === 'Solved').length;
    document.getElementById('stClosed').textContent = records.filter(r => r.status === 'Closed').length;
    document.getElementById('stCriminals').textContent = criminals.length;

    // Recent
    const recent = [...records].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
    document.getElementById('recentTable').innerHTML = recent.length ? recent.map(r => `
        <tr style="cursor:pointer" onclick="viewRecord('${r.id}')">
            <td><strong>${r.firNumber}</strong></td><td>${r.crimeType}</td><td>${r.victimName}</td>
            <td>${formatDate(r.crimeDate)}</td>
            <td><span class="badge bg-${r.priority.toLowerCase()}">${r.priority}</span></td>
            <td><span class="badge bg-${statusClass(r.status)}">${r.status}</span></td>
        </tr>
    `).join('') : '<tr><td colspan="6" style="text-align:center;color:var(--text3)">No records</td></tr>';

    // Critical
    const critical = records.filter(r => r.priority === 'Critical' && r.status !== 'Closed').slice(0, 5);
    document.getElementById('criticalTable').innerHTML = critical.length ? critical.map(r => `
        <tr><td><strong>${r.firNumber}</strong></td><td>${r.crimeType}</td><td>${r.location}</td>
        <td><span class="badge bg-${statusClass(r.status)}">${r.status}</span></td></tr>
    `).join('') : '<tr><td colspan="4" style="text-align:center;color:var(--text3)">No critical cases</td></tr>';

    // Chart
    renderChart();

    // Activity
    const recentAct = activityLog.slice(-5).reverse();
    document.getElementById('recentActivity').innerHTML = recentAct.length ? recentAct.map(a => `
        <div class="activity-item">
            <div class="activity-dot" style="background:${a.type === 'add' ? 'var(--success)' : a.type === 'delete' ? 'var(--danger)' : 'var(--primary)'}"></div>
            <div><span>${a.message}</span><span class="activity-time">${timeAgo(a.timestamp)}</span></div>
        </div>
    `).join('') : '<p class="empty-state">No recent activity</p>';

    // Complaint badge
    const pendingComp = complaints.filter(c => c.status === 'Pending').length;
    const badge = document.getElementById('complaintBadge');
    if (badge) badge.textContent = pendingComp;
}

function renderChart() {
    const types = {};
    records.forEach(r => { types[r.crimeType] = (types[r.crimeType] || 0) + 1; });
    const sorted = Object.entries(types).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const max = sorted.length > 0 ? sorted[0][1] : 1;
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899'];

    document.getElementById('chartArea').innerHTML = sorted.length ? sorted.map(([type, count], i) => `
        <div class="chart-bar-item">
            <span class="chart-bar-label">${type}</span>
            <div class="chart-bar-track">
                <div class="chart-bar-fill" style="width:${(count/max)*100}%;background:${colors[i % colors.length]}">${count}</div>
            </div>
        </div>
    `).join('') : '<p class="empty-state">No data</p>';
}

function renderAllRecords(data = null) {
    const list = data || records;
    const tbl = document.getElementById('allRecordsTable');
    const noR = document.getElementById('noRecords');
    const count = document.getElementById('recordsCount');

    if (count) count.textContent = `Showing ${list.length} of ${records.length} records`;

    if (list.length === 0) { tbl.innerHTML = ''; noR.style.display = 'block'; return; }
    noR.style.display = 'none';

    const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    tbl.innerHTML = sorted.map(r => `
        <tr>
            <td><strong>${r.firNumber}</strong></td><td>${r.crimeType}</td><td>${formatDate(r.crimeDate)}</td>
            <td>${r.location}</td><td>${r.victimName}</td><td>${r.suspectName || '<em>Unknown</em>'}</td>
            <td><span class="badge bg-${r.priority.toLowerCase()}">${r.priority}</span></td>
            <td><span class="badge bg-${statusClass(r.status)}">${r.status}</span></td>
            <td><div class="act-btns">
                <button class="act-btn act-view" onclick="viewRecord('${r.id}')" title="View"><i class="fas fa-eye"></i></button>
                <button class="act-btn act-edit" onclick="editRecord('${r.id}')" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="act-btn act-delete" onclick="deleteRecord('${r.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>
    `).join('');
}

function renderCriminals() {
    const tbl = document.getElementById('criminalsTable');
    const noC = document.getElementById('noCriminals');
    if (criminals.length === 0) { tbl.innerHTML = ''; noC.style.display = 'block'; return; }
    noC.style.display = 'none';
    tbl.innerHTML = criminals.map(c => `
        <tr>
            <td><strong>${c.name}</strong></td><td>${c.cnic || 'N/A'}</td><td>${c.age || 'N/A'}</td>
            <td>${c.gender}</td><td>${c.history || 'N/A'}</td>
            <td><span class="badge bg-${c.status.toLowerCase().replace(/ /g,'-')}">${c.status}</span></td>
            <td>${c.relatedFIR || 'N/A'}</td>
            <td><div class="act-btns">
                <button class="act-btn act-edit" onclick="editCriminal('${c.id}')"><i class="fas fa-pen"></i></button>
                <button class="act-btn act-delete" onclick="deleteCriminal('${c.id}')"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>
    `).join('');
}

function renderOfficers() {
    const tbl = document.getElementById('officersTable');
    const allOfficers = [...officers];
    // Count cases per officer
    tbl.innerHTML = allOfficers.map(o => {
        const caseCount = records.filter(r => r.officerName.toLowerCase().includes(o.name.toLowerCase())).length;
        return `<tr>
            <td><strong>${o.name}</strong></td><td>${o.badge}</td><td>${o.rank}</td>
            <td>${o.station || 'N/A'}</td><td>${o.phone || 'N/A'}</td>
            <td><strong>${caseCount}</strong></td>
            <td><span class="badge bg-${o.status.toLowerCase().replace(/ /g,'-')}">${o.status}</span></td>
            <td><div class="act-btns">
                <button class="act-btn act-edit" onclick="editOfficer('${o.id}')"><i class="fas fa-pen"></i></button>
                <button class="act-btn act-delete" onclick="deleteOfficer('${o.id}')"><i class="fas fa-trash"></i></button>
            </div></td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text3)">No officers added</td></tr>';
}

function renderComplaints() {
    const tbl = document.getElementById('complaintsTable');
    const noC = document.getElementById('noComplaints');
    const count = document.getElementById('complaintCount');
    if (count) count.textContent = complaints.length + ' complaints';

    if (complaints.length === 0) { tbl.innerHTML = ''; noC.style.display = 'block'; return; }
    noC.style.display = 'none';

    const sorted = [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    tbl.innerHTML = sorted.map(c => `
        <tr>
            <td><strong>${c.id}</strong></td><td>${c.name}</td><td>${c.phone}</td><td>${c.type}</td>
            <td>${c.location}</td><td>${formatDate(c.date)}</td>
            <td><span class="badge bg-${c.urgency.toLowerCase()}">${c.urgency}</span></td>
            <td><span class="badge bg-${c.status.toLowerCase()}">${c.status}</span></td>
            <td><div class="act-btns">
                <button class="act-btn act-view" onclick="viewComplaint('${c.id}')" title="View"><i class="fas fa-eye"></i></button>
                ${c.status === 'Pending' ? `<button class="act-btn act-edit" onclick="updateComplaintStatus('${c.id}','Reviewed')" title="Mark Reviewed"><i class="fas fa-check"></i></button>` : ''}
                ${c.status !== 'Resolved' ? `<button class="act-btn" style="background:rgba(16,185,129,.12);color:var(--success)" onclick="updateComplaintStatus('${c.id}','Resolved')" title="Resolve"><i class="fas fa-check-double"></i></button>` : ''}
            </div></td>
        </tr>
    `).join('');
}

// ===== FILTERS =====
function applyFilters() {
    let filtered = [...records];
    const type = document.getElementById('filterType').value;
    const status = document.getElementById('filterStatus').value;
    const priority = document.getElementById('filterPriority').value;
    const from = document.getElementById('filterDateFrom').value;
    const to = document.getElementById('filterDateTo').value;

    if (type) filtered = filtered.filter(r => r.crimeType === type);
    if (status) filtered = filtered.filter(r => r.status === status);
    if (priority) filtered = filtered.filter(r => r.priority === priority);
    if (from) filtered = filtered.filter(r => r.crimeDate >= from);
    if (to) filtered = filtered.filter(r => r.crimeDate <= to);

    renderAllRecords(filtered);
    toast(`${filtered.length} records found`, 'info');
}

function clearFilters() {
    document.getElementById('filterType').value = '';
    document.getElementById('filterStatus').value = '';
    document.getElementById('filterPriority').value = '';
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    renderAllRecords();
}

// ===== SEARCH =====
function searchTab(tab, el) {
    currentSearch = tab;
    document.querySelectorAll('.stab').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
    performSearch();
}

function performSearch() {
    const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
    const tbl = document.getElementById('searchResults');
    const noS = document.getElementById('noSearch');
    const thead = document.getElementById('searchThead');

    if (!q) { tbl.innerHTML = ''; noS.style.display = 'block'; noS.innerHTML = '<i class="fas fa-search"></i><br>Enter keywords to search'; return; }

    if (currentSearch === 'cases') {
        thead.innerHTML = '<tr><th>FIR #</th><th>Type</th><th>Date</th><th>Location</th><th>Victim</th><th>Status</th><th>Actions</th></tr>';
        const results = records.filter(r =>
            r.firNumber.toLowerCase().includes(q) || r.crimeType.toLowerCase().includes(q) ||
            r.location.toLowerCase().includes(q) || r.victimName.toLowerCase().includes(q) ||
            (r.suspectName && r.suspectName.toLowerCase().includes(q)) ||
            r.officerName.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
        );
        if (results.length === 0) { tbl.innerHTML = ''; noS.style.display = 'block'; noS.innerHTML = '<i class="fas fa-inbox"></i><br>No cases found'; return; }
        noS.style.display = 'none';
        tbl.innerHTML = results.map(r => `
            <tr><td><strong>${r.firNumber}</strong></td><td>${r.crimeType}</td><td>${formatDate(r.crimeDate)}</td>
            <td>${r.location}</td><td>${r.victimName}</td>
            <td><span class="badge bg-${statusClass(r.status)}">${r.status}</span></td>
            <td><div class="act-btns">
                <button class="act-btn act-view" onclick="viewRecord('${r.id}')"><i class="fas fa-eye"></i></button>
                <button class="act-btn act-edit" onclick="editRecord('${r.id}')"><i class="fas fa-pen"></i></button>
            </div></td></tr>
        `).join('');
        toast(`${results.length} cases found`, 'info');
    } else {
        thead.innerHTML = '<tr><th>Name</th><th>CNIC</th><th>Gender</th><th>Crime History</th><th>Status</th><th>FIR</th></tr>';
        const results = criminals.filter(c =>
            c.name.toLowerCase().includes(q) || (c.cnic && c.cnic.includes(q)) ||
            (c.history && c.history.toLowerCase().includes(q))
        );
        if (results.length === 0) { tbl.innerHTML = ''; noS.style.display = 'block'; noS.innerHTML = '<i class="fas fa-user-slash"></i><br>No criminals found'; return; }
        noS.style.display = 'none';
        tbl.innerHTML = results.map(c => `
            <tr><td><strong>${c.name}</strong></td><td>${c.cnic || 'N/A'}</td><td>${c.gender}</td>
            <td>${c.history || 'N/A'}</td>
            <td><span class="badge bg-${c.status.toLowerCase().replace(/ /g,'-')}">${c.status}</span></td>
            <td>${c.relatedFIR || 'N/A'}</td></tr>
        `).join('');
        toast(`${results.length} criminals found`, 'info');
    }
}

// ===== REPORTS =====
function generateSummaryReport() {
    const types = {}, statuses = {}, priorities = {}, locations = {};
    records.forEach(r => {
        types[r.crimeType] = (types[r.crimeType] || 0) + 1;
        statuses[r.status] = (statuses[r.status] || 0) + 1;
        priorities[r.priority] = (priorities[r.priority] || 0) + 1;
        locations[r.location] = (locations[r.location] || 0) + 1;
    });
    const topLocations = Object.entries(locations).sort((a,b) => b[1]-a[1]).slice(0, 5);

    let html = `<h2>📊 Summary Report</h2><p style="color:var(--text2);margin-bottom:20px">Generated: ${new Date().toLocaleString()} by ${currentUser.name}</p>`;
    html += `<h4 style="color:var(--primary);margin:15px 0 8px">Overview</h4>`;
    html += `<div class="rep-row"><span>Total Cases</span><span>${records.length}</span></div>`;
    html += `<div class="rep-row"><span>Total Criminals</span><span>${criminals.length}</span></div>`;
    html += `<div class="rep-row"><span>Total Officers</span><span>${officers.length}</span></div>`;
    html += `<div class="rep-row"><span>Pending Complaints</span><span>${complaints.filter(c=>c.status==='Pending').length}</span></div>`;
    html += `<h4 style="color:var(--primary);margin:15px 0 8px">By Status</h4>`;
    html += Object.entries(statuses).map(([k,v]) => `<div class="rep-row"><span>${k}</span><span>${v}</span></div>`).join('');
    html += `<h4 style="color:var(--primary);margin:15px 0 8px">By Crime Type</h4>`;
    html += Object.entries(types).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `<div class="rep-row"><span>${k}</span><span>${v}</span></div>`).join('');
    html += `<h4 style="color:var(--primary);margin:15px 0 8px">By Priority</h4>`;
    html += Object.entries(priorities).map(([k,v]) => `<div class="rep-row"><span>${k}</span><span>${v}</span></div>`).join('');
    html += `<h4 style="color:var(--primary);margin:15px 0 8px">Top 5 Locations</h4>`;
    html += topLocations.map(([k,v]) => `<div class="rep-row"><span>${k}</span><span>${v} cases</span></div>`).join('');

    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportOutput').style.display = 'block';
    toast('Summary report generated', 'success');
}

function generateMonthlyReport() {
    const month = document.getElementById('reportMonth').value;
    if (!month) { toast('Select a month first', 'warning'); return; }
    const [y, m] = month.split('-');
    const filtered = records.filter(r => { const d = new Date(r.crimeDate); return d.getFullYear() === +y && (d.getMonth()+1) === +m; });
    const monthName = new Date(y, m-1).toLocaleString('default', { month:'long', year:'numeric' });

    let html = `<h2>📅 Monthly Report - ${monthName}</h2><p style="color:var(--text2);margin-bottom:20px">Total Cases: ${filtered.length}</p>`;
    if (filtered.length > 0) {
        const types = {};
        filtered.forEach(r => { types[r.crimeType] = (types[r.crimeType]||0)+1; });
        html += Object.entries(types).map(([k,v]) => `<div class="rep-row"><span>${k}</span><span>${v}</span></div>`).join('');
    } else { html += '<p style="text-align:center;color:var(--text3)">No cases in this period</p>'; }

    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportOutput').style.display = 'block';
    toast('Monthly report generated', 'success');
}

function generateTypeReport() {
    const types = {};
    records.forEach(r => {
        if (!types[r.crimeType]) types[r.crimeType] = { total: 0, open: 0, solved: 0 };
        types[r.crimeType].total++;
        if (r.status === 'Open' || r.status === 'Under Investigation') types[r.crimeType].open++;
        if (r.status === 'Solved') types[r.crimeType].solved++;
    });

    let html = `<h2>🏷️ Crime Type Analysis</h2><p style="color:var(--text2);margin-bottom:20px">Generated: ${new Date().toLocaleString()}</p>`;
    html += '<table style="width:100%;margin-top:15px"><thead><tr><th>Crime Type</th><th>Total</th><th>Active</th><th>Solved</th><th>Solve Rate</th></tr></thead><tbody>';
    Object.entries(types).sort((a,b)=>b[1].total-a[1].total).forEach(([type, data]) => {
        const rate = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
        html += `<tr><td><strong>${type}</strong></td><td>${data.total}</td><td>${data.open}</td><td>${data.solved}</td><td>${rate}%</td></tr>`;
    });
    html += '</tbody></table>';

    document.getElementById('reportContent').innerHTML = html;
    document.getElementById('reportOutput').style.display = 'block';
    toast('Type report generated', 'success');
}

function printReport() {
    const content = document.getElementById('reportContent').innerHTML;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>CRMS Report</title><style>body{font-family:Arial;padding:30px;color:#333}h2{color:#1a73e8;border-bottom:2px solid #1a73e8;padding-bottom:8px}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}th{background:#f0f0f0}.rep-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}</style></head><body>${content}<p style="text-align:center;color:#999;margin-top:40px;font-size:11px">Crime Record Management System - Official Report</p></body></html>`);
    w.document.close();
    w.print();
}

function printAllRecords() {
    const w = window.open('', '_blank');
    const rows = records.map(r => `<tr><td>${r.firNumber}</td><td>${r.crimeType}</td><td>${formatDate(r.crimeDate)}</td><td>${r.location}</td><td>${r.victimName}</td><td>${r.suspectName||'Unknown'}</td><td>${r.status}</td><td>${r.priority}</td></tr>`).join('');
    w.document.write(`<html><head><title>All Records</title><style>body{font-family:Arial;padding:20px}h1{text-align:center;color:#1a73e8}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:7px;font-size:12px}th{background:#1a73e8;color:white}tr:nth-child(even){background:#f9f9f9}</style></head><body><h1>🚔 All Crime Records</h1><p style="text-align:center">Total: ${records.length} | ${new Date().toLocaleString()}</p><table><thead><tr><th>FIR#</th><th>Type</th><th>Date</th><th>Location</th><th>Victim</th><th>Suspect</th><th>Status</th><th>Priority</th></tr></thead><tbody>${rows}</tbody></table></body></html>`);
    w.document.close();
    w.print();
}

function printCurrentCase() {
    if (!viewingRecord) return;
    const r = viewingRecord;
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>${r.firNumber}</title><style>body{font-family:Arial;padding:30px;color:#333}h1{text-align:center;color:#1a73e8;border-bottom:3px solid #1a73e8;padding-bottom:10px}.row{display:flex;padding:8px 0;border-bottom:1px solid #eee}.label{width:180px;font-weight:bold;color:#555}.value{flex:1}</style></head><body><h1>🚔 Case Report - ${r.firNumber}</h1><p style="text-align:center;color:#999">Generated: ${new Date().toLocaleString()}</p><br>
    ${[['FIR Number',r.firNumber],['Crime Type',r.crimeType],['Date',formatDate(r.crimeDate)+' '+(r.crimeTime||'')],['Location',r.location],['Priority',r.priority],['Status',r.status],['Victim',r.victimName],['Victim Contact',r.victimContact||'N/A'],['Suspect',r.suspectName||'Unknown'],['Officer',r.officerName],['Evidence',r.evidence||'N/A'],['Description',r.description]].map(([l,v])=>`<div class="row"><span class="label">${l}:</span><span class="value">${v}</span></div>`).join('')}
    <p style="text-align:center;color:#999;margin-top:40px;font-size:11px">Crime Record Management System - Official Document</p></body></html>`);
    w.document.close();
    w.print();
}

// ===== EXPORT CSV =====
function exportCSV() {
    const headers = ['FIR Number', 'Crime Type', 'Date', 'Location', 'Victim', 'Suspect', 'Officer', 'Status', 'Priority'];
    const rows = records.map(r => [r.firNumber, r.crimeType, r.crimeDate, r.location, r.victimName, r.suspectName || '', r.officerName, r.status, r.priority]);
    let csv = headers.join(',') + '\n' + rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'crime_records_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click();
    toast('CSV exported', 'success');
}

// ===== ACTIVITY LOG =====
function addLog(type, message) {
    activityLog.push({ type, message, timestamp: new Date().toISOString(), user: currentUser?.name || 'System' });
    if (activityLog.length > 200) activityLog = activityLog.slice(-200);
    localStorage.setItem('crms_log', JSON.stringify(activityLog));
}

function renderActivityLog() {
    const list = document.getElementById('activityLogList');
    const logs = [...activityLog].reverse();
    list.innerHTML = logs.length ? logs.map(l => `
        <div class="log-item">
            <div class="log-icon log-${l.type}"><i class="fas fa-${l.type === 'add' ? 'plus' : l.type === 'edit' ? 'pen' : l.type === 'delete' ? 'trash' : 'right-to-bracket'}"></i></div>
            <div><span>${l.message}</span><span class="log-time">${l.user} • ${new Date(l.timestamp).toLocaleString()}</span></div>
        </div>
    `).join('') : '<p class="empty-state">No activity logged</p>';
}

function clearActivityLog() {
    if (!confirm('Clear all activity logs?')) return;
    activityLog = [];
    localStorage.setItem('crms_log', JSON.stringify(activityLog));
    renderActivityLog();
    toast('Activity log cleared', 'success');
}

// ===== NOTIFICATIONS =====
function updateNotifications() {
    const notifs = [];
    const critical = records.filter(r => r.priority === 'Critical' && r.status !== 'Closed');
    if (critical.length > 0) notifs.push({ icon: 'fa-exclamation-triangle', text: `${critical.length} critical cases need attention`, time: 'Now' });
    const pending = complaints.filter(c => c.status === 'Pending');
    if (pending.length > 0) notifs.push({ icon: 'fa-bullhorn', text: `${pending.length} pending complaints`, time: 'Recent' });
    const open = records.filter(r => r.status === 'Open');
    if (open.length > 0) notifs.push({ icon: 'fa-folder-open', text: `${open.length} open cases`, time: 'Today' });

    document.getElementById('notifList').innerHTML = notifs.length ? notifs.map(n => `
        <div class="notif-item"><i class="fas ${n.icon}"></i><div>${n.text}<span class="notif-time">${n.time}</span></div></div>
    `).join('') : '<div class="notif-item">No notifications</div>';

    const dot = document.getElementById('notifDot');
    if (dot) dot.style.display = notifs.length > 0 ? 'block' : 'none';
}

// ===== THEME =====
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = document.querySelector('#themeToggle i');
    const span = document.querySelector('#themeToggle span');
    if (document.body.classList.contains('light-theme')) {
        icon.className = 'fas fa-sun'; span.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon'; span.textContent = 'Dark Mode';
    }
}

// ===== HERO STATS =====
function updateHeroStats() {
    document.getElementById('heroTotal').textContent = records.length;
    document.getElementById('heroSolved').textContent = records.filter(r => r.status === 'Solved').length;
    document.getElementById('heroOfficers').textContent = officers.length + 2; // + default officers
}

// ===== HELPERS =====
function statusClass(s) {
    return { 'Open': 'open', 'Under Investigation': 'investigation', 'Solved': 'solved', 'Closed': 'closed' }[s] || 'open';
}

function formatDate(d) {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function timeAgo(t) {
    const diff = Math.floor((Date.now() - new Date(t)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

function save() {
    localStorage.setItem('crms_records', JSON.stringify(records));
}

function toast(msg, type = 'info') {
    const container = document.getElementById('toast');
    const t = document.createElement('div');
    t.className = `toast-msg toast-${type}`;
    t.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i> ${msg}`;
    container.appendChild(t);
    setTimeout(() => { t.style.animation = 'toastOut .4s ease forwards'; setTimeout(() => t.remove(), 400); }, 3500);
}

// ===== SAMPLE DATA =====
function loadSampleData() {
    records = [
        { id:'1',firNumber:'FIR-2024-001',crimeType:'Theft',crimeDate:'2024-01-15',crimeTime:'14:30',location:'Lahore, Gulberg III',priority:'Medium',victimName:'Ahmed Khan',victimContact:'0300-1234567',victimCNIC:'35201-1234567-1',victimAddress:'House 45, Gulberg III',suspectName:'Unknown',suspectDesc:'Tall, dark complexion',officerName:'Inspector Raza',policeStation:'Gulberg PS',status:'Under Investigation',evidence:'CCTV footage',witnesses:'Shopkeeper nearby',weaponUsed:'None',description:'Mobile phone snatching near market area during daylight.',officerNotes:'CCTV being analyzed',createdAt:'2024-01-15T14:30:00Z',updatedAt:'2024-01-20T10:00:00Z',createdBy:'Admin'},
        { id:'2',firNumber:'FIR-2024-002',crimeType:'Fraud',crimeDate:'2024-02-10',crimeTime:'10:00',location:'Karachi, Clifton',priority:'High',victimName:'Sara Ali',victimContact:'0321-9876543',victimCNIC:'42301-9876543-2',victimAddress:'Block 5, Clifton',suspectName:'Bilal Ahmed',suspectDesc:'Known fraudster',officerName:'Inspector Malik',policeStation:'Clifton PS',status:'Open',evidence:'Bank records, phone logs',witnesses:'Bank manager',weaponUsed:'N/A',description:'Online banking fraud. Rs. 500,000 stolen from account.',officerNotes:'Suspect identified',createdAt:'2024-02-10T10:00:00Z',updatedAt:'2024-02-15T10:00:00Z',createdBy:'Admin'},
        { id:'3',firNumber:'FIR-2024-003',crimeType:'Robbery',crimeDate:'2024-03-05',crimeTime:'22:15',location:'Islamabad, F-10 Markaz',priority:'Critical',victimName:'Muhammad Usman',victimContact:'0333-5556677',victimCNIC:'',victimAddress:'F-10/3, Islamabad',suspectName:'Two masked men',suspectDesc:'Armed, wearing black masks',officerName:'DSP Tariq',policeStation:'F-10 PS',status:'Under Investigation',evidence:'Weapon recovered, CCTV',witnesses:'Security guard',weaponUsed:'Pistol',description:'Armed robbery at a jewelry shop. Cash and gold stolen worth Rs. 2 million.',officerNotes:'Suspects traced through CCTV',createdAt:'2024-03-05T22:15:00Z',updatedAt:'2024-03-10T10:00:00Z',createdBy:'Admin'},
        { id:'4',firNumber:'FIR-2024-004',crimeType:'Assault',crimeDate:'2024-03-20',crimeTime:'18:45',location:'Rawalpindi, Saddar',priority:'Medium',victimName:'Fatima Bibi',victimContact:'0345-1112233',victimCNIC:'',victimAddress:'Saddar, Rawalpindi',suspectName:'Nasir Shah',suspectDesc:'Neighbor, age 35',officerName:'Inspector Akram',policeStation:'Saddar PS',status:'Solved',evidence:'Medical reports, witness statements',witnesses:'3 neighbors',weaponUsed:'None - physical',description:'Physical assault during a property dispute with neighbor.',officerNotes:'Case resolved, suspect arrested',createdAt:'2024-03-20T18:45:00Z',updatedAt:'2024-04-01T10:00:00Z',createdBy:'Admin'},
        { id:'5',firNumber:'FIR-2024-005',crimeType:'Cybercrime',crimeDate:'2024-04-12',crimeTime:'09:00',location:'Lahore, DHA Phase 5',priority:'High',victimName:'Ali Hassan',victimContact:'0312-4445566',victimCNIC:'35201-5556677-3',victimAddress:'DHA Phase 5, Lahore',suspectName:'Unknown Hacker',suspectDesc:'Operating from unknown location',officerName:'Cyber Cell Officer Zain',policeStation:'Cyber Crime Wing',status:'Open',evidence:'IP logs, email headers, screenshots',witnesses:'N/A',weaponUsed:'N/A',description:'Instagram account hacked. Blackmail attempt with private photos. Demanding Rs. 100,000.',officerNotes:'IP tracking in progress',createdAt:'2024-04-12T09:00:00Z',updatedAt:'2024-04-15T10:00:00Z',createdBy:'Admin'},
        { id:'6',firNumber:'FIR-2024-006',crimeType:'Murder',crimeDate:'2024-04-25',crimeTime:'03:00',location:'Faisalabad, Ghulam Muhammad Abad',priority:'Critical',victimName:'Rashid Mehmood',victimContact:'N/A',victimCNIC:'',victimAddress:'GM Abad, Faisalabad',suspectName:'Under investigation',suspectDesc:'Unknown',officerName:'SSP Kamran',policeStation:'Madina Town PS',status:'Under Investigation',evidence:'Forensic reports pending, blood samples',witnesses:'Night watchman',weaponUsed:'Sharp weapon',description:'Body found near canal early morning. Multiple stab wounds. Suspected targeted killing.',officerNotes:'Forensics awaited',createdAt:'2024-04-25T03:00:00Z',updatedAt:'2024-05-01T10:00:00Z',createdBy:'Admin'},
        { id:'7',firNumber:'FIR-2024-007',crimeType:'Drug Offense',crimeDate:'2024-05-08',crimeTime:'16:00',location:'Peshawar, Hayatabad',priority:'High',victimName:'State of Pakistan',victimContact:'N/A',victimCNIC:'',victimAddress:'',suspectName:'Gul Zaman',suspectDesc:'Age 45, known dealer',officerName:'ANF Officer Shahid',policeStation:'ANF Peshawar',status:'Solved',evidence:'5kg hashish recovered',witnesses:'ANF team',weaponUsed:'None',description:'Drug trafficking bust during checkpoint operation. Drugs hidden in vehicle.',officerNotes:'Suspect convicted',createdAt:'2024-05-08T16:00:00Z',updatedAt:'2024-06-01T10:00:00Z',createdBy:'Admin'},
        { id:'8',firNumber:'FIR-2024-008',crimeType:'Kidnapping',crimeDate:'2024-05-20',crimeTime:'11:30',location:'Multan, Cantt Area',priority:'Critical',victimName:'Ayesha (Age 12)',victimContact:'0301-7778899',victimCNIC:'',victimAddress:'Cantt, Multan',suspectName:'Gang of 3',suspectDesc:'Professional kidnappers',officerName:'Inspector Naveed',policeStation:'Cantt PS',status:'Solved',evidence:'Phone tracking, ransom calls, CCTV',witnesses:'School guard',weaponUsed:'Pistol',description:'12-year-old girl kidnapped from school van. Rs. 5 million ransom demanded. Recovered safely after 48 hours.',officerNotes:'All 3 suspects arrested',createdAt:'2024-05-20T11:30:00Z',updatedAt:'2024-05-22T10:00:00Z',createdBy:'Admin'},
        { id:'9',firNumber:'FIR-2024-009',crimeType:'Harassment',crimeDate:'2024-06-15',crimeTime:'19:00',location:'Karachi, Gulshan-e-Iqbal',priority:'Medium',victimName:'Sana Sheikh',victimContact:'0322-8889900',victimCNIC:'42201-8889900-4',victimAddress:'Block 10, Gulshan',suspectName:'Imran Siddiqui',suspectDesc:'Co-worker, age 30',officerName:'Inspector Nadia',policeStation:'Gulshan PS',status:'Open',evidence:'Text messages, email screenshots',witnesses:'2 colleagues',weaponUsed:'N/A',description:'Workplace harassment complaint. Continuous unwanted messages and stalking behavior by colleague.',officerNotes:'Suspect summoned for questioning',createdAt:'2024-06-15T19:00:00Z',updatedAt:'2024-06-18T10:00:00Z',createdBy:'Admin'},
        { id:'10',firNumber:'FIR-2024-010',crimeType:'Theft',crimeDate:'2024-07-01',crimeTime:'02:30',location:'Islamabad, G-9 Markaz',priority:'Low',victimName:'Hassan Raza',victimContact:'0311-2223344',victimCNIC:'',victimAddress:'G-9/1, Islamabad',suspectName:'Unknown',suspectDesc:'',officerName:'Constable Farooq',policeStation:'G-9 PS',status:'Closed',evidence:'Broken lock',witnesses:'None',weaponUsed:'None',description:'Bicycle theft from outside grocery store. No CCTV coverage available.',officerNotes:'Case closed - no leads',createdAt:'2024-07-01T02:30:00Z',updatedAt:'2024-07-15T10:00:00Z',createdBy:'Admin'}
    ];

    criminals = [
        { id:'1',name:'Bilal Ahmed',cnic:'35202-1234567-1',age:'32',gender:'Male',address:'Karachi, Lyari',history:'Fraud, Forgery, Identity Theft',status:'Wanted',relatedFIR:'FIR-2024-002',description:'Known fraud specialist. Multiple cases pending.',createdAt:'2024-02-10T10:00:00Z'},
        { id:'2',name:'Nasir Shah',cnic:'37405-9876543-3',age:'28',gender:'Male',address:'Rawalpindi, Dhoke Syedan',history:'Assault, Domestic Violence',status:'Arrested',relatedFIR:'FIR-2024-004',description:'Repeat offender. Currently in custody.',createdAt:'2024-03-21T10:00:00Z'},
        { id:'3',name:'Gul Zaman',cnic:'17301-5556677-9',age:'45',gender:'Male',address:'Peshawar, Karkhano Market',history:'Drug Trafficking (10+ years)',status:'Convicted',relatedFIR:'FIR-2024-007',description:'Major drug dealer. Sentenced to 10 years.',createdAt:'2024-05-10T10:00:00Z'},
        { id:'4',name:'Imran Siddiqui',cnic:'42101-4445566-7',age:'30',gender:'Male',address:'Karachi, Gulshan Block 5',history:'Harassment',status:'Released on Bail',relatedFIR:'FIR-2024-009',description:'Released on bail. Trial ongoing.',createdAt:'2024-06-20T10:00:00Z'}
    ];

    officers = [
        { id:'1',name:'Inspector Raza Ahmed',badge:'LHR-001',rank:'Inspector',phone:'0300-1111111',station:'Gulberg PS, Lahore',username:'raza',password:'raza123',status:'Active',createdAt:'2024-01-01T00:00:00Z'},
        { id:'2',name:'DSP Tariq Mehmood',badge:'ISB-002',rank:'DSP',phone:'0333-2222222',station:'F-10 PS, Islamabad',username:'tariq',password:'tariq123',status:'Active',createdAt:'2024-01-01T00:00:00Z'},
        { id:'3',name:'Inspector Nadia Khan',badge:'KHI-003',rank:'Inspector',phone:'0322-3333333',station:'Gulshan PS, Karachi',username:'nadia',password:'nadia123',status:'Active',createdAt:'2024-01-01T00:00:00Z'}
    ];

    complaints = [
        { id:'COMP-001',name:'Usman Tariq',cnic:'35201-9998887-6',phone:'0300-9998877',email:'usman@email.com',type:'Theft',location:'Lahore, Johar Town',date:'2024-07-10',urgency:'Normal',details:'My motorcycle was stolen from outside the mosque during Friday prayer.',status:'Pending',createdAt:'2024-07-10T15:00:00Z'},
        { id:'COMP-002',name:'Zainab Fatima',cnic:'42301-1112223-4',phone:'0321-5554433',email:'',type:'Harassment',location:'Karachi, North Nazimabad',date:'2024-07-12',urgency:'Urgent',details:'Being harassed by neighbors. They are threatening my family and making life difficult.',status:'Pending',createdAt:'2024-07-12T09:00:00Z'}
    ];

    save();
    localStorage.setItem('crms_criminals', JSON.stringify(criminals));
    localStorage.setItem('crms_officers', JSON.stringify(officers));
    localStorage.setItem('crms_complaints', JSON.stringify(complaints));
}

// ===== PWA =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
}

// ================================================================
//  NEW FEATURES - ADD TO YOUR EXISTING app.js
// ================================================================

// ===== NEW DATA =====
let publicUsers = JSON.parse(localStorage.getItem('crms_publicUsers')) || [];
let uploadedFiles = {};
let currentPublicUser = null;
let crimeMap = null;
let dashMap = null;
let chartInstances = {};

// City coordinates for Pakistan
const cityCoords = {
    'lahore': [31.5204, 74.3587], 'karachi': [24.8607, 67.0011],
    'islamabad': [33.6844, 73.0479], 'rawalpindi': [33.5651, 73.0169],
    'faisalabad': [31.4504, 73.1350], 'peshawar': [34.0151, 71.5249],
    'multan': [30.1575, 71.5249], 'quetta': [30.1798, 66.9750],
    'hyderabad': [25.3960, 68.3578], 'sialkot': [32.4945, 74.5229]
};

// ===== ADD THESE TO setupEventListeners() =====
// Put these INSIDE your existing setupEventListeners function

function setupNewEventListeners() {
    // Registration
    document.getElementById('goToRegister')?.addEventListener('click', e => { e.preventDefault(); showPage('registerPage'); });
    document.getElementById('backFromRegister')?.addEventListener('click', () => showPage('publicSite'));
    document.getElementById('goToLoginFromReg')?.addEventListener('click', e => { e.preventDefault(); showPage('loginPage'); });
    document.getElementById('goToRegFromLogin')?.addEventListener('click', e => { e.preventDefault(); showPage('registerPage'); });
    document.getElementById('registerForm')?.addEventListener('submit', handleRegistration);

    // Public Dashboard
    document.getElementById('pubLogout')?.addEventListener('click', () => {
        sessionStorage.removeItem('crms_pubUser');
        currentPublicUser = null;
        showPage('publicSite');
        toast('Logged out', 'info');
    });
    document.getElementById('pubNewComplaintForm')?.addEventListener('submit', handlePubComplaint);

    // Chat
    document.getElementById('chatToggle')?.addEventListener('click', toggleChat);

    // File uploads
    setupFileUploads();
}

// Call this at end of DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    setupNewEventListeners();

    // Check public user session
    const pubUser = sessionStorage.getItem('crms_pubUser');
    if (pubUser) {
        currentPublicUser = JSON.parse(pubUser);
        showPublicDashboard();
    }
});

// ===== MULTI-LANGUAGE SYSTEM =====
function switchLang(lang) {
    document.documentElement.setAttribute('data-lang', lang);
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));

    document.querySelectorAll(`[data-${lang}]`).forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = text;
            else el.textContent = text;
        }
    });

    if (lang === 'ur') {
        document.body.style.direction = 'rtl';
        document.body.style.fontFamily = "'Noto Nastaliq Urdu', 'Inter', sans-serif";
    } else {
        document.body.style.direction = 'ltr';
        document.body.style.fontFamily = "'Inter', sans-serif";
    }

    localStorage.setItem('crms_lang', lang);
}

// ===== PUBLIC USER REGISTRATION =====
function handleRegistration(e) {
    e.preventDefault();
    const errEl = document.getElementById('regError');
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value;

    if (publicUsers.find(u => u.username === username)) {
        errEl.textContent = 'Username already exists!';
        errEl.style.display = 'block';
        return;
    }

    const user = {
        id: Date.now().toString(),
        name: document.getElementById('regName').value.trim(),
        cnic: document.getElementById('regCNIC').value,
        phone: document.getElementById('regPhone').value,
        email: document.getElementById('regEmail').value,
        username, password,
        role: 'Public',
        createdAt: new Date().toISOString()
    };

    publicUsers.push(user);
    localStorage.setItem('crms_publicUsers', JSON.stringify(publicUsers));
    addLog('add', `New public user registered: ${user.name}`);
    toast('Registration successful! Please login.', 'success');
    showPage('loginPage');
}

// ===== UPDATED LOGIN (handles public users too) =====
// REPLACE your existing handleLogin function with this:
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const role = document.getElementById('loginRole').value;
    const errEl = document.getElementById('loginError');

    if (role === 'public') {
        const pubUser = publicUsers.find(u => u.username === username && u.password === password);
        if (pubUser) {
            currentPublicUser = pubUser;
            sessionStorage.setItem('crms_pubUser', JSON.stringify(pubUser));
            errEl.style.display = 'none';
            showPublicDashboard();
            toast('Welcome, ' + pubUser.name, 'success');
        } else {
            errEl.textContent = 'Invalid credentials!';
            errEl.style.display = 'block';
        }
        return;
    }

    // Staff login (existing logic)
    const defaultUsers = [
        { username: 'admin', password: 'admin123', role: 'Admin', name: 'Administrator' },
        { username: 'officer1', password: 'officer123', role: 'Officer', name: 'Inspector Raza' },
        { username: 'officer2', password: 'off456', role: 'Officer', name: 'SI Kamran Ali' }
    ];

    let user = defaultUsers.find(u => u.username === username && u.password === password);
    if (!user) {
        const officer = officers.find(o => o.username === username && o.password === password);
        if (officer) user = { username: officer.username, password: officer.password, role: 'Officer', name: officer.name };
    }

    if (user) {
        currentUser = user;
        sessionStorage.setItem('crms_user', JSON.stringify(user));
        errEl.style.display = 'none';
        addLog('login', `${user.name} logged in`);
        showDashboard();
        toast('Welcome, ' + user.name, 'success');
    } else {
        errEl.textContent = 'Invalid credentials!';
        errEl.style.display = 'block';
    }
}

// ===== PUBLIC DASHBOARD =====
function showPublicDashboard() {
    ['publicSite', 'loginPage', 'registerPage', 'dashboardApp'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
    document.getElementById('publicDashboard').style.display = 'block';
    document.getElementById('pubDashName').textContent = currentPublicUser.name;
    renderMyComplaints();
    renderProfile();
}

function pubTab(tab, el) {
    document.querySelectorAll('.pd-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.pd-content').forEach(c => c.classList.remove('active'));
    document.getElementById(`pd-${tab}`).classList.add('active');
}

function renderMyComplaints() {
    const myComps = complaints.filter(c =>
        c.cnic === currentPublicUser.cnic || c.phone === currentPublicUser.phone
    );
    const tbl = document.getElementById('myComplaintsTable');
    const noC = document.getElementById('noMyComplaints');

    if (myComps.length === 0) { tbl.innerHTML = ''; noC.style.display = 'block'; return; }
    noC.style.display = 'none';
    tbl.innerHTML = myComps.map(c => `<tr>
        <td><strong>${c.id}</strong></td><td>${c.type}</td><td>${formatDate(c.date)}</td>
        <td>${c.location}</td>
        <td><span class="badge bg-${c.urgency.toLowerCase()}">${c.urgency}</span></td>
        <td><span class="badge bg-${c.status.toLowerCase()}">${c.status}</span></td>
    </tr>`).join('');
}

function renderProfile() {
    const u = currentPublicUser;
    document.getElementById('profileInfo').innerHTML = `
        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${u.name}</span></div>
        <div class="detail-row"><span class="detail-label">CNIC</span><span class="detail-value">${u.cnic}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${u.phone}</span></div>
        <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${u.email || 'N/A'}</span></div>
        <div class="detail-row"><span class="detail-label">Username</span><span class="detail-value">${u.username}</span></div>
        <div class="detail-row"><span class="detail-label">Member Since</span><span class="detail-value">${new Date(u.createdAt).toLocaleDateString()}</span></div>
    `;
}

function handlePubComplaint(e) {
    e.preventDefault();
    const comp = {
        id: 'COMP-' + Date.now().toString().slice(-6),
        name: currentPublicUser.name,
        cnic: currentPublicUser.cnic,
        phone: currentPublicUser.phone,
        email: currentPublicUser.email,
        type: document.getElementById('pCompType').value,
        location: document.getElementById('pCompLocation').value,
        date: document.getElementById('pCompDate').value,
        urgency: document.getElementById('pCompUrgency').value,
        details: document.getElementById('pCompDetails').value,
        files: uploadedFiles['pCompFiles'] || [],
        status: 'Pending',
        createdAt: new Date().toISOString()
    };
    complaints.push(comp);
    localStorage.setItem('crms_complaints', JSON.stringify(complaints));
    document.getElementById('pubNewComplaintForm').reset();
    document.getElementById('pCompFilePreview').innerHTML = '';
    toast('Complaint submitted! ID: ' + comp.id, 'success');
    sendEmailNotification(comp);
    pubTab('myComplaints', document.querySelector('.pd-tab'));
    renderMyComplaints();
}

function pdTrackFIR() {
    const fir = document.getElementById('pdTrackInput').value.trim();
    const r = records.find(x => x.firNumber.toLowerCase() === fir.toLowerCase());
    document.getElementById('pdTrackResult').innerHTML = r ? `
        <div class="track-result" style="margin-top:15px"><h3>✅ ${r.firNumber}</h3>
        <div class="track-row"><span class="t-label">Type:</span><span class="t-value">${r.crimeType}</span></div>
        <div class="track-row"><span class="t-label">Status:</span><span class="t-value"><span class="badge bg-${statusClass(r.status)}">${r.status}</span></span></div>
        <div class="track-row"><span class="t-label">Officer:</span><span class="t-value">${r.officerName}</span></div>
        <div class="track-row"><span class="t-label">Updated:</span><span class="t-value">${new Date(r.updatedAt).toLocaleString()}</span></div></div>
    ` : '<div class="track-result" style="margin-top:15px"><h3 style="color:var(--danger)">❌ Not found</h3></div>';
}

// ===== CRIME MAP (Leaflet) =====
function initMap(elementId, isPublic = false) {
    const mapEl = document.getElementById(elementId);
    if (!mapEl || mapEl._leaflet_id) return; // Already initialized

    const map = L.map(elementId).setView([30.3753, 69.3451], 5); // Pakistan center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
    }).addTo(map);

    if (isPublic) crimeMap = map;
    else dashMap = map;

    addMapMarkers(map);
    return map;
}

function addMapMarkers(map) {
    if (!map) return;
    // Clear existing
    map.eachLayer(layer => { if (layer instanceof L.Marker) map.removeLayer(layer); });

    const priorityColors = { Critical: '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };

    records.forEach(r => {
        let lat = r.lat || null;
        let lng = r.lng || null;

        if (!lat || !lng) {
            // Try to find city coords from location
            const loc = r.location.toLowerCase();
            for (const [city, coords] of Object.entries(cityCoords)) {
                if (loc.includes(city)) {
                    lat = coords[0] + (Math.random() - 0.5) * 0.05;
                    lng = coords[1] + (Math.random() - 0.5) * 0.05;
                    break;
                }
            }
        }

        if (lat && lng) {
            const color = priorityColors[r.priority] || '#3b82f6';
            const icon = L.divIcon({
                html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
                className: 'custom-marker', iconSize: [16, 16]
            });
            L.marker([lat, lng], { icon }).addTo(map)
                .bindPopup(`<b>${r.firNumber}</b><br>${r.crimeType}<br>${r.location}<br>
                <span style="color:${color}">${r.priority}</span> | ${r.status}`);
        }
    });
}

function updateMap() {
    if (crimeMap) addMapMarkers(crimeMap);
}

// Initialize maps when sections become visible
const mapObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.id === 'crimeMapView') initMap('crimeMapView', true);
            if (entry.target.id === 'dashMapView') initMap('dashMapView', false);
        }
    });
});
document.querySelectorAll('.map-view').forEach(el => mapObserver.observe(el));

// ===== ADVANCED CHARTS (Chart.js) =====
function renderAdvancedCharts() {
    renderPieChart();
    renderLineChart();
    renderBarChart();
}

function renderPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    if (chartInstances.pie) chartInstances.pie.destroy();

    const types = {};
    records.forEach(r => { types[r.crimeType] = (types[r.crimeType] || 0) + 1; });
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316', '#06b6d4', '#ec4899', '#84cc16', '#6366f1'];

    chartInstances.pie = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(types),
            datasets: [{ data: Object.values(types), backgroundColor: colors, borderWidth: 0 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 11 } } } }
        }
    });
}

function renderLineChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    if (chartInstances.line) chartInstances.line.destroy();

    const months = {};
    records.forEach(r => {
        const m = r.crimeDate.substring(0, 7);
        months[m] = (months[m] || 0) + 1;
    });
    const sorted = Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));

    chartInstances.line = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sorted.map(([m]) => m),
            datasets: [{
                label: 'Cases', data: sorted.map(([, v]) => v),
                borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,.1)',
                fill: true, tension: 0.4, pointRadius: 4
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { ticks: { color: '#64748b' }, grid: { color: '#1e3050' } }, y: { ticks: { color: '#64748b' }, grid: { color: '#1e3050' } } },
            plugins: { legend: { labels: { color: '#94a3b8' } } }
        }
    });
}

function renderBarChart() {
    const ctx = document.getElementById('barChart');
    if (!ctx) return;
    if (chartInstances.bar) chartInstances.bar.destroy();

    const statuses = { Open: 0, 'Under Investigation': 0, Solved: 0, Closed: 0 };
    records.forEach(r => { if (statuses.hasOwnProperty(r.status)) statuses[r.status]++; });

    chartInstances.bar = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(statuses),
            datasets: [{ label: 'Cases', data: Object.values(statuses), backgroundColor: ['#f59e0b', '#8b5cf6', '#10b981', '#ef4444'], borderRadius: 6 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: { x: { ticks: { color: '#64748b' }, grid: { display: false } }, y: { ticks: { color: '#64748b' }, grid: { color: '#1e3050' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function renderAnalyticsCharts() {
    // Area Chart
    const areaCtx = document.getElementById('areaChart');
    if (areaCtx) {
        if (chartInstances.area) chartInstances.area.destroy();
        const months = {};
        const types = [...new Set(records.map(r => r.crimeType))].slice(0, 5);
        records.forEach(r => {
            const m = r.crimeDate.substring(0, 7);
            if (!months[m]) months[m] = {};
            months[m][r.crimeType] = (months[m][r.crimeType] || 0) + 1;
        });
        const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];
        const sortedMonths = Object.keys(months).sort();

        chartInstances.area = new Chart(areaCtx, {
            type: 'line',
            data: {
                labels: sortedMonths,
                datasets: types.map((type, i) => ({
                    label: type, data: sortedMonths.map(m => months[m]?.[type] || 0),
                    borderColor: colors[i], backgroundColor: colors[i] + '20',
                    fill: true, tension: 0.4
                }))
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { color: '#64748b' } }, y: { ticks: { color: '#64748b' } } }, plugins: { legend: { labels: { color: '#94a3b8' } } } }
        });
    }

    // Doughnut
    const dCtx = document.getElementById('doughnutChart');
    if (dCtx) {
        if (chartInstances.doughnut) chartInstances.doughnut.destroy();
        const priorities = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        records.forEach(r => { if (priorities.hasOwnProperty(r.priority)) priorities[r.priority]++; });
        chartInstances.doughnut = new Chart(dCtx, {
            type: 'doughnut',
            data: { labels: Object.keys(priorities), datasets: [{ data: Object.values(priorities), backgroundColor: ['#10b981', '#f59e0b', '#f97316', '#ef4444'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }
        });
    }

    // Polar
    const pCtx = document.getElementById('polarChart');
    if (pCtx) {
        if (chartInstances.polar) chartInstances.polar.destroy();
        const locations = {};
        records.forEach(r => { const city = r.location.split(',')[0].trim(); locations[city] = (locations[city] || 0) + 1; });
        const top5 = Object.entries(locations).sort((a, b) => b[1] - a[1]).slice(0, 6);
        chartInstances.polar = new Chart(pCtx, {
            type: 'polarArea',
            data: { labels: top5.map(([k]) => k), datasets: [{ data: top5.map(([, v]) => v), backgroundColor: ['#3b82f620', '#ef444420', '#10b98120', '#f59e0b20', '#8b5cf620', '#f9731620'], borderColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#f97316'], borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } }, scales: { r: { ticks: { color: '#64748b' }, grid: { color: '#1e3050' } } } }
        });
    }
}

// Update refreshDashboard to include charts
const origRefreshDashboard = typeof refreshDashboard === 'function' ? refreshDashboard : null;
function refreshDashboard() {
    if (origRefreshDashboard) origRefreshDashboard();
    setTimeout(() => { renderAdvancedCharts(); }, 100);
}

// ===== FILE UPLOAD HANDLING =====
function setupFileUploads() {
    document.querySelectorAll('.file-input').forEach(input => {
        input.addEventListener('change', function () {
            const previewId = this.closest('.fg, .form-grp').querySelector('.file-preview')?.id;
            if (!previewId) return;
            handleFiles(this.files, previewId, this.id);
        });
    });
}

function handleFiles(files, previewId, inputId) {
    const preview = document.getElementById(previewId);
    if (!preview) return;
    if (!uploadedFiles[inputId]) uploadedFiles[inputId] = [];

    Array.from(files).forEach(file => {
        if (file.size > 5 * 1024 * 1024) { toast('File too large (max 5MB)', 'error'); return; }

        const reader = new FileReader();
        reader.onload = function (e) {
            const base64 = e.target.result;
            uploadedFiles[inputId].push({ name: file.name, data: base64, type: file.type });

            const thumb = document.createElement('div');
            thumb.className = 'file-thumb';
            if (file.type.startsWith('image/')) {
                thumb.innerHTML = `<img src="${base64}" alt="${file.name}"><button class="remove-file" onclick="this.parentElement.remove()">×</button>`;
            } else {
                thumb.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:20px"><i class="fas fa-file"></i></div><button class="remove-file" onclick="this.parentElement.remove()">×</button>`;
            }
            preview.appendChild(thumb);
        };
        reader.readAsDataURL(file);
    });
}

// ===== CHAT WIDGET =====
function toggleChat() {
    const box = document.getElementById('chatBox');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
}

function sendChat() {
    const input = document.getElementById('chatInput');
    const msg = input.value.trim();
    if (!msg) return;

    addChatMessage(msg, 'user');
    input.value = '';

    // Auto-reply bot
    setTimeout(() => {
        const reply = getChatReply(msg);
        addChatMessage(reply, 'bot');
    }, 1000);
}

function addChatMessage(text, type) {
    const container = document.getElementById('chatMessages');
    const div = document.createElement('div');
    div.className = `chat-msg ${type}`;
    div.innerHTML = `<p>${text}</p><span class="chat-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>`;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function getChatReply(msg) {
    const lower = msg.toLowerCase();
    if (lower.includes('fir') && (lower.includes('track') || lower.includes('status')))
        return 'To track your FIR, go to the "Track FIR" section on our homepage and enter your FIR number. You can also login to your dashboard.';
    if (lower.includes('complaint') || lower.includes('shikayat'))
        return 'You can file a complaint from our homepage or login to your dashboard. Go to the "File Complaint" section.';
    if (lower.includes('register') || lower.includes('account'))
        return 'Click the "Register" button on the homepage to create your public account. You need your CNIC and phone number.';
    if (lower.includes('emergency') || lower.includes('help'))
        return '🚨 For emergencies, call 15 (Police) or 1122 (Rescue) immediately. For non-emergency, use our complaint form.';
    if (lower.includes('officer') || lower.includes('login'))
        return 'Officers can login through the "Officer Login" button. Contact your admin for credentials.';
    if (lower.includes('hi') || lower.includes('hello') || lower.includes('salam'))
        return 'Hello! Welcome to CRMS Support. How can I assist you today? You can ask about FIR tracking, complaints, registration, or emergencies.';
    return 'Thank you for your message. For specific assistance:\n• FIR tracking - use our Track FIR section\n• File complaint - use Complaint form\n• Emergency - Call 15\n\nIs there anything specific you need help with?';
}

// ===== EMAIL NOTIFICATIONS (EmailJS) =====
function sendEmailNotification(data) {
    const config = JSON.parse(localStorage.getItem('crms_emailConfig') || '{}');
    if (!config.serviceId || !config.templateId || !config.publicKey) return;

    try {
        emailjs.init(config.publicKey);
        emailjs.send(config.serviceId, config.templateId, {
            to_name: data.name || 'User',
            to_email: data.email || '',
            complaint_id: data.id || '',
            type: data.type || '',
            status: data.status || 'Submitted',
            message: `Your complaint ${data.id} has been submitted successfully.`
        }).then(() => console.log('Email sent'))
            .catch(err => console.log('Email error:', err));
    } catch (e) { console.log('EmailJS not configured'); }
}

function saveEmailConfig() {
    const config = {
        serviceId: document.getElementById('ejServiceId').value,
        templateId: document.getElementById('ejTemplateId').value,
        publicKey: document.getElementById('ejPublicKey').value
    };
    localStorage.setItem('crms_emailConfig', JSON.stringify(config));
    toast('Email config saved!', 'success');
}

function saveSMSConfig() {
    const config = {
        phone: document.getElementById('smsPhone').value,
        template: document.getElementById('smsTemplate').value
    };
    localStorage.setItem('crms_smsConfig', JSON.stringify(config));
    toast('SMS config saved!', 'success');
}

// ===== FIREBASE CONNECTION =====
function connectFirebase() {
    const config = {
        apiKey: document.getElementById('fbApiKey').value,
        authDomain: document.getElementById('fbAuthDomain').value,
        projectId: document.getElementById('fbProjectId').value,
        storageBucket: document.getElementById('fbStorageBucket').value
    };

    if (!config.apiKey || !config.projectId) {
        toast('Please fill Firebase config!', 'error');
        return;
    }

    try {
        if (!firebase.apps.length) firebase.initializeApp(config);
        const db = firebase.firestore();

        // Sync data to Firebase
        db.collection('records').get().then(snapshot => {
            if (snapshot.empty) {
                // Upload local data
                records.forEach(r => db.collection('records').doc(r.id).set(r));
                criminals.forEach(c => db.collection('criminals').doc(c.id).set(c));
                toast('Data synced to Firebase!', 'success');
            } else {
                // Download from Firebase
                const fbRecords = [];
                snapshot.forEach(doc => fbRecords.push(doc.data()));
                records = fbRecords;
                save();
                toast('Data loaded from Firebase!', 'success');
            }
        });

        localStorage.setItem('crms_firebase', JSON.stringify(config));
        document.getElementById('fbStatus').innerHTML = '<span style="color:var(--success)">✅ Connected</span>';
        addLog('add', 'Firebase connected');
    } catch (e) {
        document.getElementById('fbStatus').innerHTML = '<span style="color:var(--danger)">❌ Error</span>';
        toast('Firebase connection failed!', 'error');
    }
}

// ===== DATA IMPORT/EXPORT =====
function exportAllData() {
    const data = { records, criminals, officers, complaints, activityLog, publicUsers };
    const blob = new Blob([JSON.stringify(data, null, 2)], { 

