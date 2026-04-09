// employees.js

// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
let employees = [];
let positions = [];
let currentFilterRole = 'all';
let searchTerm = '';
let editingId = null;

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', async () => {
    await loadPositions();
    await loadEmployees();
    initFilters();
    initModal();
    updateStats();
});

// ==================== ЗАГРУЗКА ДАННЫХ ====================

async function loadPositions() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/register.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/employees/positions', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to load positions');

        positions = await response.json();
        renderPositionSelect();
    } catch (error) {
        console.error('Error loading positions:', error);
        showNotification('Failed to load positions', 'error');
    }
}

async function loadEmployees() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/register.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/employees', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to load employees');

        employees = await response.json();
        renderEmployeesTable();
        updateStats();
    } catch (error) {
        console.error('Error loading employees:', error);
        showNotification('Failed to load employees', 'error');
    }
}

function renderPositionSelect() {
    const positionSelect = document.getElementById('position');
    if (!positionSelect) return;

    positionSelect.innerHTML = '<option value="">Select position</option>';
    positions.forEach(pos => {
        const option = document.createElement('option');
        option.value = pos.id;
        option.textContent = pos.name;
        positionSelect.appendChild(option);
    });
}

function renderEmployeesTable() {
    const tbody = document.getElementById('employeesTableBody');
    if (!tbody) return;

    let filteredEmployees = [...employees];

    if (currentFilterRole !== 'all') {
        filteredEmployees = filteredEmployees.filter(emp => emp.position_id == currentFilterRole);
    }

    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredEmployees = filteredEmployees.filter(emp =>
            emp.first_name?.toLowerCase().includes(term) ||
            emp.last_name?.toLowerCase().includes(term) ||
            emp.email?.toLowerCase().includes(term) ||
            emp.position?.toLowerCase().includes(term)
        );
    }

    if (filteredEmployees.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="color: #888;">No employees found</div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredEmployees.map(emp => `
        <tr>
            <td>
                <div class="employee-info">
                    <div class="employee-avatar">${emp.first_name?.[0] || ''}${emp.last_name?.[0] || ''}</div>
                    <div>
                        <div class="employee-name">${emp.first_name} ${emp.last_name}</div>
                        <div class="employee-email">${emp.email}</div>
                    </div>
                </div>
            </td>
            <td><span class="position-badge">${emp.position || '—'}</span></td>
            <td><span class="rate-value">$${emp.hourly_rate?.toFixed(2) || '0.00'}</span></td>
            <td class="workload-cell">
                <div class="workload-bar-container">
                    <div class="workload-bar">
                        <div class="workload-fill" style="width: ${emp.workload || 0}%"></div>
                    </div>
                    <span class="workload-text">${emp.workload || 0}%</span>
                </div>
            </td>
            <td><span class="projects-count">${emp.projects || 0}</span></td>
            <td>
                <span class="status-badge ${emp.is_active ? 'active' : 'inactive'}">
                    ${emp.is_active ? 'Active' : 'Inactive'}
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
    const active = employees.filter(e => e.is_active).length;
    const inactive = total - active;
    const avgWorkload = employees.filter(e => e.is_active).reduce((sum, e) => sum + (e.workload || 0), 0) / active || 0;

    document.getElementById('totalEmployees').textContent = total;
    document.getElementById('activeEmployees').textContent = active;
    document.getElementById('inactiveEmployees').textContent = inactive;
    document.getElementById('avgWorkload').textContent = Math.round(avgWorkload) + '%';
}

// ==================== ФИЛЬТРЫ ====================

function initFilters() {
    // Role filters (по position_id)
    document.querySelectorAll('.role-filter').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.role-filter').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilterRole = btn.dataset.role;
            renderEmployeesTable();
        });
    });

    const searchInput = document.getElementById('searchEmployee');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            renderEmployeesTable();
        });
    }
}

// ==================== МОДАЛЬНОЕ ОКНО ====================

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

    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            editingId = null;
            document.getElementById('modalTitle').textContent = 'Add New Employee';
            resetForm();
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

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

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    viewModal?.addEventListener('click', (e) => {
        if (e.target === viewModal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (validateForm()) {
                saveEmployee();
            }
        });
    }

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
    document.getElementById('userEmail').value = '';
    document.getElementById('position').value = '';
    document.getElementById('hourlyRate').value = '';
    document.getElementById('isActive').checked = true;
    document.getElementById('employeeError').textContent = '';
}

function validateForm() {
    const email = document.getElementById('userEmail').value.trim();
    const position = document.getElementById('position').value;
    const hourlyRate = document.getElementById('hourlyRate').value;
    const error = document.getElementById('employeeError');
    const modalTitle = document.getElementById('modalTitle').textContent;

    if (!email || !isValidEmail(email)) {
        error.textContent = 'Please enter a valid email of existing user';
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

    return true;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ==================== СОЗДАНИЕ/РЕДАКТИРОВАНИЕ ====================

async function saveEmployee() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/auth/register.html';
        return;
    }

    const email = document.getElementById('userEmail').value.trim();
    const positionId = parseInt(document.getElementById('position').value);
    const hourlyRate = parseFloat(document.getElementById('hourlyRate').value);
    const isActive = document.getElementById('isActive').checked;
    const modalTitle = document.getElementById('modalTitle').textContent;

    const employeeData = {
        email: email,
        position_id: positionId,
        hourly_rate: hourlyRate,
        is_active: isActive
    };

    try {
        let url = 'http://localhost:8080/api/employees/create';
        let method = 'POST';

        if (modalTitle.includes('Edit')) {
            url = `http://localhost:8080/api/employees/${editingId}`;
            method = 'PUT';
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(employeeData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to save employee');
        }

        showNotification(modalTitle.includes('Edit') ? 'Employee updated successfully' : 'Employee created successfully', 'success');
        await loadEmployees();
        document.getElementById('employeeModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();

    } catch (error) {
        console.error('Error saving employee:', error);
        document.getElementById('employeeError').textContent = error.message;
        showNotification(error.message, 'error');
    }
}

// ==================== ПРОСМОТР ====================

window.viewEmployee = async function(id) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to load employee');

        const employee = await response.json();
        editingId = id;

        document.getElementById('viewFullName').textContent = `${employee.first_name} ${employee.last_name}`;
        document.getElementById('viewPosition').textContent = employee.position || '—';
        document.getElementById('viewEmail').textContent = employee.email;
        document.getElementById('viewRate').textContent = `$${employee.hourly_rate?.toFixed(2) || '0.00'}`;
        document.getElementById('viewProjects').textContent = employee.projects || 0;
        document.getElementById('viewAvatar').textContent = `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`;

        const statusElement = document.getElementById('viewStatus');
        statusElement.textContent = employee.is_active ? 'Active' : 'Inactive';
        statusElement.className = `profile-status ${employee.is_active ? 'active' : 'inactive'}`;

        const projectsList = document.getElementById('viewProjectsList');
        projectsList.innerHTML = employee.projects && employee.projects > 0
            ? '<p style="color: #888; text-align: center;">Projects loaded from database</p>'
            : '<p style="color: #888; text-align: center;">No active projects</p>';

        lucide.createIcons();
        document.getElementById('viewModal').classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading employee:', error);
        showNotification('Failed to load employee details', 'error');
    }
};

// ==================== РЕДАКТИРОВАНИЕ ====================

window.editEmployee = async function(id) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to load employee');

        const employee = await response.json();
        editingId = id;

        document.getElementById('modalTitle').textContent = 'Edit Employee';
        document.getElementById('userEmail').value = employee.email;
        document.getElementById('userEmail').disabled = true; // Email нельзя менять
        document.getElementById('position').value = employee.position_id || '';
        document.getElementById('hourlyRate').value = employee.hourly_rate;
        document.getElementById('isActive').checked = employee.is_active;
        document.getElementById('employeeError').textContent = '';

        document.getElementById('employeeModal').classList.add('active');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error('Error loading employee for edit:', error);
        showNotification('Failed to load employee data', 'error');
    }
};

// ==================== УДАЛЕНИЕ ====================

window.deleteEmployee = function(id) {
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal';
    confirmModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;';
    confirmModal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f1215, #1a1f23); padding: 30px; border-radius: 30px; width: 400px; border: 1px solid rgba(40,98,58,0.3);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2 style="color: white;">Confirm Deletion</h2>
                <button id="closeConfirm" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div style="text-align: center; padding: 20px;">
                <i data-lucide="alert-triangle" style="width: 48px; height: 48px; stroke: #ef4444; margin-bottom: 15px;"></i>
                <p style="color: white;">Are you sure you want to delete this employee?</p>
                <p style="color: #a0e0b0;">This action cannot be undone.</p>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button id="cancelDelete" style="padding: 10px 24px; border-radius: 40px; background: rgba(255,255,255,0.05); color: #a0a0a0; border: none; cursor: pointer;">Cancel</button>
                <button id="confirmDelete" style="padding: 10px 24px; border-radius: 40px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; cursor: pointer;">Delete</button>
            </div>
        </div>
    `;

    document.body.appendChild(confirmModal);
    document.body.style.overflow = 'hidden';
    lucide.createIcons();

    document.getElementById('closeConfirm').onclick = () => { confirmModal.remove(); document.body.style.overflow = 'auto'; };
    document.getElementById('cancelDelete').onclick = () => { confirmModal.remove(); document.body.style.overflow = 'auto'; };
    document.getElementById('confirmDelete').onclick = async () => {
        await confirmDeleteEmployee(id);
        confirmModal.remove();
        document.body.style.overflow = 'auto';
    };
};

async function confirmDeleteEmployee(id) {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`http://localhost:8080/api/employees/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete employee');
        }

        showNotification('Employee deleted successfully', 'success');
        await loadEmployees();

    } catch (error) {
        console.error('Error deleting employee:', error);
        showNotification(error.message, 'error');
    }
}

// ==================== УВЕДОМЛЕНИЯ ====================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
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
            transition: all 0.3s ease;
            z-index: 1001;
            border: 1px solid rgba(40, 98, 58, 0.3);
        }
        .notification.show { transform: translateX(0); opacity: 1; }
        .notification--success { background: linear-gradient(135deg, #1a2a23, #1e3a2a); border-left: 4px solid #22c55e; }
        .notification--error { background: linear-gradient(135deg, #2a1a1a, #3a1e1e); border-left: 4px solid #ef4444; }
        .notification i { width: 20px; height: 20px; }
        .notification--success i { stroke: #22c55e; }
        .notification--error i { stroke: #ef4444; }
    `;
    document.head.appendChild(style);
}