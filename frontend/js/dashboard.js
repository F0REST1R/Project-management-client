document.addEventListener('DOMContentLoaded', () => {
    // Инициализация графиков
    initActivityChart();
    initDistributionChart();
    
    // Загрузка данных пользователя для приветствия
    loadUserGreeting();

    // Инициализация объявлений
    initAnnouncements();
});

function loadUserGreeting() {
    const userNameElement = document.getElementById('dashboardUserName');
    const userData = localStorage.getItem('userData');
    
    if (userData && userNameElement) {
        const user = JSON.parse(userData);
        userNameElement.textContent = user.first_name;
    }
}

function initActivityChart() {
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Tasks Completed',
                data: [12, 19, 15, 17, 24, 18, 14],
                borderColor: '#28623A',
                backgroundColor: 'rgba(40, 98, 58, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#28623A',
                pointBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#888'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#888'
                    }
                }
            }
        }
    });
}

function initDistributionChart() {
    const ctx = document.getElementById('distributionChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['To Do', 'In Progress', 'Review', 'Completed'],
            datasets: [{
                data: [23, 34, 12, 156],
                backgroundColor: [
                    '#28623A',
                    '#eab308',
                    '#3b82f6',
                    '#22c55e'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// ============ ANNOUNCEMENTS SYSTEM ============

let announcements = [];

// Load announcements from localStorage
function loadAnnouncements() {
    const saved = localStorage.getItem('companyAnnouncements');
    if (saved) {
        announcements = JSON.parse(saved);
        // Remove announcements older than 24 hours
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        announcements = announcements.filter(a => a.timestamp > oneDayAgo);
        saveAnnouncements();
    }
    renderAnnouncements();
}

// Save announcements to localStorage
function saveAnnouncements() {
    localStorage.setItem('companyAnnouncements', JSON.stringify(announcements));
}

// Render announcements to DOM
function renderAnnouncements() {
    const container = document.getElementById('announcementsList');
    const section = document.getElementById('announcementsSection');
    
    if (!container) return;
    
    const userData = localStorage.getItem('userData');
    let userRole = 'employee';
    if (userData) {
        const user = JSON.parse(userData);
        userRole = user.role;
    }
    
    // Show section only for employees and managers
    if (userRole === 'manager' || userRole === 'employee') {
        section.style.display = 'block';
        
        if (announcements.length === 0) {
            container.innerHTML = `
                <div class="empty-announcements">
                    <i data-lucide="megaphone"></i>
                    <p>No announcements yet</p>
                    ${userRole === 'manager' ? '<small>Click "New Message" to notify your team</small>' : '<small>Check back later for updates</small>'}
                </div>
            `;
        } else {
            container.innerHTML = announcements.map(announcement => `
                <div class="announcement-card" data-id="${announcement.id}">
                    <div class="announcement-header">
                        <div class="announcement-author">
                            <div class="author-avatar">${announcement.authorInitials}</div>
                            <div>
                                <span class="author-name">${escapeHtml(announcement.authorName)}</span>
                                <span class="author-role">(${announcement.authorRole === 'manager' ? 'Manager' : 'Admin'})</span>
                            </div>
                        </div>
                        <div class="announcement-date">${formatAnnouncementDate(announcement.timestamp)}</div>
                    </div>
                    <div class="announcement-text">${escapeHtml(announcement.text)}</div>
                    ${userRole === 'manager' ? `
                        <div class="announcement-footer">
                            <button class="delete-announcement" onclick="deleteAnnouncement(${announcement.id})">
                                <i data-lucide="trash-2"></i>
                                Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
        }
    } else {
        section.style.display = 'none';
    }
    
    if (window.lucide) {
        lucide.createIcons();
    }
}

// Format announcement date
function formatAnnouncementDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

// Post new announcement
function postAnnouncement(text) {
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    
    const announcement = {
        id: Date.now(),
        text: text.trim(),
        authorName: `${user.first_name} ${user.last_name}`,
        authorInitials: `${user.first_name[0]}${user.last_name[0]}`,
        authorRole: user.role,
        timestamp: Date.now()
    };
    
    announcements.unshift(announcement);
    saveAnnouncements();
    renderAnnouncements();
    showNotification('Announcement posted successfully!', 'success');
}

// Delete confirmation modal
let pendingDeleteId = null;

function showDeleteConfirmModal(announcementId) {
    pendingDeleteId = announcementId;
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    pendingDeleteId = null;
}

function confirmDelete() {
    if (pendingDeleteId) {
        announcements = announcements.filter(a => a.id !== pendingDeleteId);
        saveAnnouncements();
        renderAnnouncements();
        showNotification('Announcement deleted successfully', 'success');
        hideDeleteConfirmModal();
    }
}

// Setup delete confirmation modal
function setupDeleteConfirmModal() {
    const modal = document.getElementById('deleteConfirmModal');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    
    if (cancelBtn) {
        cancelBtn.onclick = () => hideDeleteConfirmModal();
    }
    
    if (confirmBtn) {
        confirmBtn.onclick = () => confirmDelete();
    }
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            hideDeleteConfirmModal();
        }
    });
    
    // Close on outside click
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                hideDeleteConfirmModal();
            }
        };
    }
}

// Update the deleteAnnouncement function
window.deleteAnnouncement = function(id) {
    const userData = localStorage.getItem('userData');
    if (!userData) return;
    
    const user = JSON.parse(userData);
    if (user.role !== 'manager') return;
    
    // Show beautiful delete confirmation modal instead of browser confirm
    showDeleteConfirmModal(id);
};

// Setup announcement modal
function setupAnnouncementModal() {
    const addBtn = document.getElementById('addAnnouncementBtn');
    const modal = document.getElementById('announcementModal');
    const cancelBtn = document.getElementById('cancelAnnouncementBtn');
    const postBtn = document.getElementById('postAnnouncementBtn');
    const textarea = document.getElementById('announcementText');
    const charCount = document.getElementById('charCount');
    
    if (!addBtn) return;
    
    // Show modal only for managers
    const userData = localStorage.getItem('userData');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.role !== 'manager') {
            addBtn.style.display = 'none';
        }
    }
    
    addBtn.onclick = () => {
        if (textarea) textarea.value = '';
        if (charCount) charCount.textContent = '0';
        if (modal) modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    if (cancelBtn) {
        cancelBtn.onclick = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }
    
    if (postBtn) {
        postBtn.onclick = () => {
            const text = textarea?.value.trim();
            if (!text) {
                showNotification('Please enter a message', 'error');
                return;
            }
            if (text.length < 3) {
                showNotification('Message must be at least 3 characters', 'error');
                return;
            }
            postAnnouncement(text);
            modal.classList.remove('active');
            document.body.style.overflow = '';
        };
    }
    
    if (textarea) {
        textarea.oninput = () => {
            if (charCount) charCount.textContent = textarea.value.length;
        };
    }
    
    // Close modal on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Close on outside click
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        };
    }
}

// Helper function for escaping HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Simple notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
        color: white;
        padding: 12px 20px;
        border-radius: 40px;
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1001;
        border-left: 4px solid ${type === 'success' ? '#22c55e' : '#ef4444'};
        animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    if (window.lucide) lucide.createIcons();
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Initialize announcements
function initAnnouncements() {
    loadAnnouncements();
    setupAnnouncementModal();
    setupDeleteConfirmModal();
}