// frontend/js/user-header.js

// Функция для безопасного обновления UI с проверкой элементов
function updateUserInterface(userData) {
    console.log('Updating UI with:', userData);
    
    // Ищем элементы
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    console.log('Elements found:', {userNameElement, userRoleElement});
    
    if (!userNameElement || !userRoleElement) {
        console.log('Elements not found, retrying in 100ms');
        // Если элементов нет, пробуем снова через 100мс
        setTimeout(() => updateUserInterface(userData), 100);
        return;
    }
    
    // Обновляем текст
    const fullName = `${userData.first_name} ${userData.last_name}`;
    userNameElement.textContent = fullName;
    
    const role = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    userRoleElement.textContent = role;
    
    console.log('UI updated successfully:', fullName, role);
}

// Основная функция загрузки данных
async function loadUserData() {
    console.log('loadUserData started');
    
    const token = localStorage.getItem('token');
    const cachedUser = localStorage.getItem('userData');
    
    console.log('Token exists:', !!token);
    console.log('Cached user exists:', !!cachedUser);
    
    // Сначала показываем кэшированные данные (если есть)
    if (cachedUser) {
        console.log('Showing cached user');
        updateUserInterface(JSON.parse(cachedUser));
    }
    
    if (!token) {
        console.log('No token, redirecting');
        window.location.href = '/auth/register.html';
        return;
    }
    
    // Затем пробуем получить свежие данные с сервера
    try {
        console.log('Fetching fresh user data...');
        const response = await fetch('http://localhost:8080/api/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            console.log('Token invalid, clearing storage');
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = '/auth/register.html';
            return;
        }
        
        const userData = await response.json();
        console.log('Fresh user data received:', userData);
        
        // Сохраняем в localStorage
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Обновляем UI
        updateUserInterface(userData);
        
    } catch (error) {
        console.error('Error fetching user data:', error);
    }
}

// Запускаем после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUserData);
} else {
    loadUserData();
}