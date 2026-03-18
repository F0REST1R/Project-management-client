// employees.js

// Sample data
let employees = [
    {
        id: 1,
        firstName: 'Alex',
        lastName: 'Lesnik',
        email: 'alex.lesnik@company.com',
        position: 'developer',
        positionName: 'Developer',
        hourlyRate: 35.00,
        login: 'alesnik',
        isActive: true,
        workload: 80,
        projects: 3
    },
    {
        id: 2,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        position: 'senior-developer',
        positionName: 'Senior Developer',
        hourlyRate: 45.00,
        login: 'jdoe',
        isActive: true,
        workload: 95,
        projects: 4
    },
    {
        id: 3,
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice.smith@company.com',
        position: 'designer',
        positionName: 'Designer',
        hourlyRate: 32.00,
        login: 'asmith',
        isActive: true,
        workload: 60,
        projects: 2
    },
    {
        id: 4,
        firstName: 'Robert',
        lastName: 'Johnson',
        email: 'r.johnson@company.com',
        position: 'qa',
        positionName: 'QA Engineer',
        hourlyRate: 30.00,
        login: 'rjohnson',
        isActive: false,
        workload: 0,
        projects: 0
    },
    {
        id: 5,
        firstName: 'Mary',
        lastName: 'Williams',
        email: 'm.williams@company.com',
        position: 'project-manager',
        positionName: 'Project Manager',
        hourlyRate: 50.00,
        login: 'mwilliams',
        isActive: true,
        workload: 85,
        projects: 3
    },
    {
        id: 6,
        firstName: 'James',
        lastName: 'Brown',
        email: 'j.brown@company.com',
        position: 'devops',
        positionName: 'DevOps Engineer',
        hourlyRate: 42.00,
        login: 'jbrown',
        isActive: true,
        workload: 70,
        projects: 2
    }
];

let currentFilterRole = 'all';
let searchTerm = '';

document.addEventListener('DOMContentLoaded', () => {
    loadEmployees();
    initFilters();
    initModal();
    updateStats();
});

function loadEmployees() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    let filteredEmployees = employees;

    // Apply role filter
    if (currentFilterRole !== 'all') {
        filteredEmployees = filteredEmployees.filter(emp => emp.position === currentFilterRole);
    }

    // Apply search
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp => 
            emp.firstName.toLowerCase().includes(term) ||
            emp.lastName.toLowerCase().includes(term) ||
            emp.email.toLowerCase().includes(term) ||
            emp.positionName.toLowerCase().includes(term)
        );
    }

    tbody.innerHTML = filteredEmployees.map(emp => `
        <tr>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${emp.firstName[0]}${emp.lastName[0]}</div>
                    <div>
                        <div class="employee-name">${emp.firstName} ${emp.lastName}</div>
                        <div class="employee-email">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="position-badge">${emp.positionName}</span></td>
            <td><span class="rate-value">$${emp.hourlyRate.toFixed(2)}</span></td>
            <td class="workload-cell">
                <div class="workload-bar-container">
                    <div class="workload-bar">
                        <div class="workload-fill ${emp.workload > 90 ? 'high' : ''}" style="width: ${emp.workload}%"></div>
                    </div>
                    <span class="workload-text">${emp.workload}%</span>
                </div>
            </td>
            <td><span class="projects-count">${emp.projects}</span></td>
            <td>
                <span class="status-badge ${emp.isActive ? 'active' : 'inactive'}">
                    ${emp.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" onclick="viewEmployee(${emp.id})">
                        <i data-lucide="eye"></i>
                    </button>
                    <button class="action-btn" onclick="editEmployee(${emp.id})">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete" onclick="deleteEmployee(${emp.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

function updateStats() {
    const total = employees.length;
    const active = employees.filter(e => e.isActive).length;
    const inactive = total - active;
    const avgWorkload = Math.round(employees.filter(e => e.isActive).reduce((sum, e) => sum + e.workload, 0) / active) || 0;

    document.getElementById('totalEmployees').textContent = total;
    document.getElementById('activeEmployees').textContent = active;
    document.getElementById('inactiveEmployees').textContent = inactive;
    document.getElementById('avgWorkload').textContent = avgWorkload + '%';
}

function initFilters() {
    // Role filters
    document.querySelectorAll('.role-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.role-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterRole = btn.dataset.role;
            loadEmployees();
        });
    });

    // Search
    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            loadEmployees();
        });
    }

    // Filter button
    const filterBtn = document.getElementById('filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            // Здесь можно открыть расширенный фильтр
            showNotification('Advanced filters coming soon', 'info');
        });
    }
}

function initModal() {
    const modal = document.getElementById('employeeModal');
    const openBtn = document.getElementById('createEmployeeBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveEmployeeBtn');
    const viewModal = document.getElementById('viewModal');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const closeViewModalBtn = document.getElementById('closeViewModalBtn');
    const editFromViewBtn = document.getElementById('editFromViewBtn');

    let editingId = null;

    // Open create modal
    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Add New Employee';
            resetForm();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close modal function
    function closeModal() {
        modal.classList.remove('active');
        viewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (closeViewBtn) closeViewBtn.addEventListener('click', closeModal);
    if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeModal);

    // Close on click outside
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    viewModal?.addEventListener('click', (e) => {
        if (e.target === viewModal) closeModal();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Save employee
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (validateForm()) {
                saveEmployee(editingId);
            }
        });
    }

    // Edit from view modal
    if (editFromViewBtn) {
        editFromViewBtn.addEventListener('click', () => {
            if (editingId) {
                viewModal.classList.remove('active');
                editEmployee(editingId);
            }
        });
    }
}

function resetForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('position').value = '';
    document.getElementById('hourlyRate').value = '';
    document.getElementById('login').value = '';
    document.getElementById('password').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('employeeError').textContent = '';
}

function validateForm() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const position = document.getElementById('position').value;
    const hourlyRate = document.getElementById('hourlyRate').value;
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    const error = document.getElementById('employeeError');

    if (!firstName || firstName.length < 2) {
        error.textContent = 'First name must be at least 2 characters';
        return false;
    }

    if (!lastName || lastName.length < 2) {
        error.textContent = 'Last name must be at least 2 characters';
        return false;
    }

    if (!email || !isValidEmail(email)) {
        error.textContent = 'Please enter a valid email';
        return false;
    }

    if (!position) {
        error.textContent = 'Please select a position';
        return false;
    }

    if (!hourlyRate || hourlyRate <= 0) {
        error.textContent = 'Please enter a valid hourly rate';
        return false;
    }

    if (!login || login.length < 3) {
        error.textContent = 'Login must be at least 3 characters';
        return false;
    }

    // Only validate password for new employees
    if (!document.getElementById('modalTitle').textContent.includes('Edit') && (!password || password.length < 6)) {
        error.textContent = 'Password must be at least 6 characters';
        return false;
    }

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function saveEmployee(editingId) {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const position = document.getElementById('position').value;
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
    const login = document.getElementById('login').value.trim();
    const isActive = document.getElementById('isActive').checked;

    // Get position display name
    const positionSelect = document.getElementById('position');
    const positionName = positionSelect.options[positionSelect.selectedIndex]?.text || position;

    const employeeData = {
        id: editingId || Date.now(),
        firstName,
        lastName,
        email,
        position,
        positionName,
        hourlyRate,
        login,
        isActive,
        workload: editingId ? employees.find(e => e.id === editingId)?.workload || 50 : 50,
        projects: editingId ? employees.find(e => e.id === editingId)?.projects || 0 : 0
    };

    if (editingId) {
        // Update existing
        const index = employees.findIndex(e => e.id === editingId);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...employeeData };
        }
        showNotification('Employee updated successfully', 'success');
    } else {
        // Create new
        employees.push(employeeData);
        showNotification('Employee added successfully', 'success');
    }

    loadEmployees();
    updateStats();
    
    // Close modal
    document.getElementById('employeeModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

// Global functions for buttons
window.viewEmployee = function(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    editingId = id;

    // Update view modal
    document.getElementById('viewFullName').textContent = `${employee.firstName} ${employee.lastName}`;
    document.getElementById('viewPosition').textContent = employee.positionName;
    document.getElementById('viewEmail').textContent = employee.email;
    document.getElementById('viewLogin').textContent = employee.login;
    document.getElementById('viewRate').textContent = `$${employee.hourlyRate.toFixed(2)}`;
    document.getElementById('viewProjects').textContent = employee.projects;
    document.getElementById('viewAvatar').textContent = `${employee.firstName[0]}${employee.lastName[0]}`;
    
    const statusElement = document.getElementById('viewStatus');
    statusElement.textContent = employee.isActive ? 'Active' : 'Inactive';
    statusElement.className = `profile-status ${employee.isActive ? 'active' : 'inactive'}`;

    // Load projects (sample data)
    const projectsList = document.getElementById('viewProjectsList');
    if (employee.projects > 0) {
        projectsList.innerHTML = `
            <div class="project-item">
                <div>
                    <div class="project-name">Website Redesign</div>
                    <div class="project-role">${employee.positionName}</div>
                </div>
                <span class="project-hours">20h/week</span>
            </div>
            <div class="project-item">
                <div>
                    <div class="project-name">Mobile App Development</div>
                    <div class="project-role">${employee.positionName}</div>
                </div>
                <span class="project-hours">15h/week</span>
            </div>
        `;
    } else {
        projectsList.innerHTML = '<p style="color: #888; text-align: center;">No active projects</p>';
    }

    // Load activity (sample data)
    const activityList = document.getElementById('viewActivity');
    activityList.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon"><i data-lucide="check-circle"></i></div>
            <div class="activity-content">
                <div class="activity-text">Completed task "Design review"</div>
                <div class="activity-time">2 hours ago</div>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon"><i data-lucide="clock"></i></div>
            <div class="activity-content">
                <div class="activity-text">Added timesheet for last week</div>
                <div class="activity-time">1 day ago</div>
            </div>
        </div>
        <div class="activity-item">
            <div class="activity-icon"><i data-lucide="message-square"></i></div>
            <div class="activity-content">
                <div class="activity-text">Commented on task "API Integration"</div>
                <div class="activity-time">2 days ago</div>
            </div>
        </div>
    `;

    lucide.createIcons();
    document.getElementById('viewModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.editEmployee = function(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    editingId = id;
    document.getElementById('modalTitle').textContent = 'Edit Employee';
    
    document.getElementById('firstName').value = employee.firstName;
    document.getElementById('lastName').value = employee.lastName;
    document.getElementById('email').value = employee.email;
    document.getElementById('position').value = employee.position;
    document.getElementById('hourlyRate').value = employee.hourlyRate;
    document.getElementById('login').value = employee.login;
    document.getElementById('password').value = ''; // Don't populate password
    document.getElementById('isActive').checked = employee.isActive;
    document.getElementById('employeeError').textContent = '';

    document.getElementById('employeeModal').classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.deleteEmployee = function(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        employees = employees.filter(e => e.id !== id);
        loadEmployees();
        updateStats();
        showNotification('Employee deleted successfully', 'success');
    }
};

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add notification styles
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
            color: white;
            padding: 16px 24px;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            gap: 12px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1001;
            border: 1px solid rgba(40, 98, 58, 0.3);
        }
        
        .notification.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .notification--success {
            background: linear-gradient(135deg, #1a2a23, #1e3a2a);
            border-left: 4px solid #22c55e;
        }
        
        .notification i {
            width: 20px;
            height: 20px;
        }
        
        .notification--success i {
            stroke: #22c55e;
        }
    `;
    document.head.appendChild(style);
}