document.addEventListener('DOMContentLoaded', () => {
    // Инициализация графиков
    initActivityChart();
    initDistributionChart();
    
    // Загрузка данных пользователя для приветствия
    loadUserGreeting();
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