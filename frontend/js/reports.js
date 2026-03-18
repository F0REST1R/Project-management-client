// reports.js

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    initFilters();
    initExport();
});

function initCharts() {
    // Timeline Chart
    const timelineCtx = document.getElementById('timelineChart')?.getContext('2d');
    if (timelineCtx) {
        new Chart(timelineCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [
                    {
                        label: 'Projects Started',
                        data: [4, 6, 8, 7, 10, 8],
                        borderColor: '#28623A',
                        backgroundColor: 'rgba(40, 98, 58, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Projects Completed',
                        data: [2, 4, 5, 6, 8, 7],
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
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
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }

    // Status Chart
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Planning', 'In Progress', 'Completed', 'On Hold'],
                datasets: [{
                    data: [4, 12, 6, 2],
                    backgroundColor: ['#eab308', '#3b82f6', '#22c55e', '#6b7280'],
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

    // Financial Chart
    const financialCtx = document.getElementById('financialChart')?.getContext('2d');
    if (financialCtx) {
        new Chart(financialCtx, {
            type: 'bar',
            data: {
                labels: ['Q1', 'Q2', 'Q3', 'Q4'],
                datasets: [
                    {
                        label: 'Revenue',
                        data: [300, 420, 380, 500],
                        backgroundColor: '#28623A',
                        borderRadius: 6
                    },
                    {
                        label: 'Costs',
                        data: [240, 320, 290, 380],
                        backgroundColor: '#ef4444',
                        borderRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#888' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#888' }
                    }
                }
            }
        });
    }
}

function initFilters() {
    const periodSelect = document.getElementById('periodSelect');
    const projectSelect = document.getElementById('projectSelect');
    
    if (periodSelect) {
        periodSelect.addEventListener('change', (e) => {
            console.log('Period changed:', e.target.value);
            // Здесь будет загрузка данных за выбранный период
            showNotification('Report period updated', 'info');
        });
    }
    
    if (projectSelect) {
        projectSelect.addEventListener('change', (e) => {
            console.log('Project filter:', e.target.value);
            // Здесь будет фильтрация по проекту
        });
    }
}

function initExport() {
    const exportBtn = document.getElementById('exportBtn');
    
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // Здесь будет логика экспорта
            showNotification('Report exported successfully', 'success');
        });
    }
}

// Функция для уведомлений
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

// Добавляем стили для уведомлений если их нет
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