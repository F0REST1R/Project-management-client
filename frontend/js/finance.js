// finance.js

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initFilters();
    initModal();
    loadFinancialData();
});

function initCharts() {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [320, 380, 420, 450, 480, 520],
                        backgroundColor: '#22c55e',
                        borderRadius: 8,
                        barPercentage: 0.6
                    },
                    {
                        label: 'Costs',
                        data: [240, 290, 320, 340, 360, 380],
                        backgroundColor: '#ef4444',
                        borderRadius: 8,
                        barPercentage: 0.6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#a0a0a0' }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { 
                            color: '#888',
                            callback: value => '$' + value + 'K'
                        }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }

    // Budget Chart
    const budgetCtx = document.getElementById('budgetChart')?.getContext('2d');
    if (budgetCtx) {
        new Chart(budgetCtx, {
            type: 'doughnut',
            data: {
                labels: ['Website', 'Mobile App', 'Cloud', 'API', 'Security'],
                datasets: [{
                    data: [45, 28, 12, 32, 25],
                    backgroundColor: ['#28623A', '#3b82f6', '#eab308', '#a855f7', '#22c55e'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

function initFilters() {
    const periodSelect = document.getElementById('periodSelect');
    const exportBtn = document.getElementById('exportBtn');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            console.log('Period changed:', e.target.value);
            loadFinancialData(e.target.value);
            showNotification('Period updated', 'info');
        });
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            showNotification('Report exported successfully', 'success');
        });
    }
}

function initModal() {
    const openBtn = document.getElementById('createOperationBtn');
    const modal = document.getElementById('operationModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveOperationBtn');
    const incomeType = document.getElementById('incomeType');
    const expenseType = document.getElementById('expenseType');
    
    let operationType = 'income';
    
    if (openBtn && modal) {
        openBtn.addEventListener('click', () => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            setTodayDate();
        });
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal?.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Type toggle
    if (incomeType && expenseType) {
        incomeType.addEventListener('click', () => {
            incomeType.classList.add('active');
            expenseType.classList.remove('active');
            operationType = 'income';
        });
        
        expenseType.addEventListener('click', () => {
            expenseType.classList.add('active');
            incomeType.classList.remove('active');
            operationType = 'expense';
        });
    }
    
    // Save operation
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (validateForm()) {
                saveOperation(operationType);
            }
        });
    }
}

function setTodayDate() {
    const dateInput = document.getElementById('operationDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function resetForm() {
    document.getElementById('operationProject').value = '';
    document.getElementById('operationDesc').value = '';
    document.getElementById('operationAmount').value = '';
    document.getElementById('operationDate').value = '';
    document.getElementById('operationError').textContent = '';
    
    const incomeType = document.getElementById('incomeType');
    const expenseType = document.getElementById('expenseType');
    if (incomeType && expenseType) {
        incomeType.classList.add('active');
        expenseType.classList.remove('active');
    }
}

function validateForm() {
    const project = document.getElementById('operationProject');
    const desc = document.getElementById('operationDesc');
    const amount = document.getElementById('operationAmount');
    const date = document.getElementById('operationDate');
    const error = document.getElementById('operationError');
    
    if (!project.value) {
        error.textContent = 'Please select a project';
        return false;
    }
    
    if (!desc.value || desc.value.length < 3) {
        error.textContent = 'Description must be at least 3 characters';
        return false;
    }
    
    if (!amount.value || amount.value <= 0) {
        error.textContent = 'Please enter a valid amount';
        return false;
    }
    
    if (!date.value) {
        error.textContent = 'Please select a date';
        return false;
    }
    
    return true;
}

function saveOperation(type) {
    const project = document.getElementById('operationProject').value;
    const desc = document.getElementById('operationDesc').value;
    const amount = document.getElementById('operationAmount').value;
    const date = document.getElementById('operationDate').value;
    
    const operation = {
        type,
        project,
        description: desc,
        amount: parseFloat(amount),
        date,
        status: 'pending'
    };
    
    console.log('Saving operation:', operation);
    
    // Здесь будет отправка на бэкенд
    
    showNotification('Operation saved successfully', 'success');
    
    // Закрываем модалку
    document.getElementById('operationModal').classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

function loadFinancialData(period = 'month') {
    console.log('Loading financial data for period:', period);
    // Здесь будет загрузка данных с бэкенда
}

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

// Добавляем стили для уведомлений
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