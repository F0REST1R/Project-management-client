// settings.js

// Load user data on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    initPasswordToggle();
    initFormHandlers();
});

// Load user data from localStorage or API
async function loadUserData() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/register.html';
        return;
    }

    // Try from localStorage first
    const cachedUser = localStorage.getItem('userData');
    if (cachedUser) {
        populateForm(JSON.parse(cachedUser));
    }

    // Then fetch fresh data
    try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();
        localStorage.setItem('userData', JSON.stringify(userData));
        populateForm(userData);
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

// Populate form with user data
function populateForm(userData) {
    document.getElementById('firstName').value = userData.first_name || '';
    document.getElementById('lastName').value = userData.last_name || '';
    document.getElementById('email').value = userData.email || '';
    document.getElementById('role').value = userData.role || '';
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.nextElementSibling;
    
    if (field.type === 'password') {
        field.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        field.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    lucide.createIcons();
}

// Initialize password toggle
function initPasswordToggle() {
    window.togglePassword = togglePassword;
}

// Initialize form handlers
function initFormHandlers() {
    // Save profile button
    document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);
    
    // Cancel button
    document.getElementById('cancelBtn').addEventListener('click', () => {
        loadUserData(); // Reload original data
        clearErrors();
        showNotification('Changes discarded', 'info');
    });
    
    // Real-time validation
    document.getElementById('newPassword').addEventListener('input', validatePassword);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswordMatch);
}

// Validate password
function validatePassword() {
    const password = document.getElementById('newPassword').value;
    const errorElement = document.getElementById('newPasswordError');
    
    if (password && password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Validate password match
function validatePasswordMatch() {
    const password = document.getElementById('newPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirm && password !== confirm) {
        errorElement.textContent = 'Passwords do not match';
        return false;
    } else {
        errorElement.textContent = '';
        return true;
    }
}

// Clear all errors
function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.textContent = '');
}

// Save profile changes
async function saveProfileChanges() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../../auth/register.html';
        return;
    }

    // Validate password if changing
    const isPasswordValid = validatePassword() && validatePasswordMatch();
    if (!isPasswordValid) return;

    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;

    // Validate required fields
    if (!firstName || !lastName) {
        if (!firstName) document.getElementById('firstNameError').textContent = 'First name is required';
        if (!lastName) document.getElementById('lastNameError').textContent = 'Last name is required';
        return;
    }

    // Prepare data for API
    const updateData = {
        first_name: firstName,
        last_name: lastName
    };

    // Add password if changing
    if (currentPassword && newPassword) {
        updateData.current_password = currentPassword;
        updateData.new_password = newPassword;
    }

    // Show loading state
    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.classList.add('settings-btn--loading');
    saveBtn.disabled = true;

    try {
        const response = await fetch('http://localhost:8080/api/auth/update-profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update profile');
        }

        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';

        // Update localStorage
        localStorage.setItem('userData', JSON.stringify(data.user));

        showNotification('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification(error.message, 'error');
    } finally {
        saveBtn.classList.remove('settings-btn--loading');
        saveBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `settings-success`;
    
    const icon = document.createElement('i');
    icon.setAttribute('data-lucide', type === 'success' ? 'check-circle' : 'alert-circle');
    
    notification.appendChild(icon);
    notification.appendChild(document.createTextNode(message));
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Handle feedback submission
async function submitFeedback() {
    const token = localStorage.getItem('token');
    const type = document.getElementById('feedbackType').value;
    const subject = document.getElementById('feedbackSubject').value.trim();
    const message = document.getElementById('feedbackMessage').value.trim();
    
    // Validate
    let isValid = true;
    
    if (!subject) {
        document.getElementById('subjectError').textContent = 'Subject is required';
        isValid = false;
    }
    
    if (!message) {
        document.getElementById('messageError').textContent = 'Message is required';
        isValid = false;
    }
    
    if (!isValid) return;
    
    try {
        const response = await fetch('http://localhost:8080/api/feedback', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type, subject, message })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send feedback');
        }
        
        // Clear form
        document.getElementById('feedbackSubject').value = '';
        document.getElementById('feedbackMessage').value = '';
        
        showNotification('Feedback sent successfully! Thank you!', 'success');
        
    } catch (error) {
        console.error('Error sending feedback:', error);
        showNotification('Failed to send feedback', 'error');
    }
}

// Add feedback submit handler
document.addEventListener('DOMContentLoaded', () => {
    const feedbackBtn = document.createElement('button');
    feedbackBtn.className = 'settings-btn settings-btn--primary';
    feedbackBtn.textContent = 'Send Feedback';
    feedbackBtn.style.marginTop = '20px';
    feedbackBtn.onclick = submitFeedback;
    
    document.querySelector('.settings-card:last-child .settings-form').appendChild(feedbackBtn);
});