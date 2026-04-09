// ======================================================================
// КЛИЕНТЫ - УПРАВЛЕНИЕ КЛИЕНТСКОЙ БАЗОЙ
// ======================================================================

// ==================== DOM ЭЛЕМЕНТЫ ====================
const modal = document.getElementById("clientModal")
const openBtn = document.getElementById("openClientModal")
const closeBtn = document.getElementById("closeClientModal")
const createBtn = document.getElementById("createClientBtn")
const error = document.getElementById("clientError")
const dropdown = document.getElementById("stageDropdown")
const selected = dropdown.querySelector(".dropdown-selected")
const items = dropdown.querySelectorAll(".dropdown-item")
const menu = dropdown.querySelector(".dropdown-menu")
const clientsTableBody = document.querySelector(".clients-table tbody")
const searchInput = document.querySelector(".client-search-input")
const filterSelect = document.getElementById("stageFilter")


// ==================== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ====================
window.allClients = []           // Хранит всех клиентов из БД
let editingClientId = null    // ID клиента в режиме редактирования

// ==================== ИНИЦИАЛИЗАЦИЯ ====================
document.addEventListener('DOMContentLoaded', () => {
    loadClients()
    
    if (searchInput) searchInput.addEventListener('input', filterClients)
    if (filterSelect) filterSelect.addEventListener('change', filterClients)
})

// ======================================================================
// 1. ЗАГРУЗКА И ОТОБРАЖЕНИЕ КЛИЕНТОВ
// ======================================================================

/**
 * Загружает список клиентов с сервера
 */
async function loadClients() {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch('http://localhost:8080/api/clients', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Failed to load clients')

        allClients = await response.json()
        renderClientsTable(allClients)

    } catch (error) {
        console.error('Error loading clients:', error)
        showNotification('Failed to load clients', 'error')
    }
}

/**
 * Отрисовывает таблицу клиентов
 */
function renderClientsTable(clients) {
    if (!clientsTableBody) return

    if (clients.length === 0) {
        clientsTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px;">
                    <div style="color: #888; font-size: 16px;">No clients yet. Click "Create Client" to add one.</div>
                </td>
            </tr>
        `
        return
    }

    clientsTableBody.innerHTML = clients.map(client => `
        <tr>
            <td>${client.name}</td>
            <td>${client.inn}</td>
            <td>${client.email || '—'}</td>
            <td>${client.phone || '—'}</td>
            <td>${client.stage}</td>
            <td>${client.projects_count || 0}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editClient(${client.id})" title="Edit">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteClient(${client.id})" title="Delete">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('')
    
    lucide.createIcons()
}

/**
 * Фильтрует клиентов по поиску и стадии
 */
function filterClients() {
    if (!allClients.length) return
    
    const searchTerm = searchInput?.value.toLowerCase() || ''
    const stageFilter = filterSelect?.value || 'all'
    
    const filtered = allClients.filter(client => {
        const matchesSearch = 
            client.name.toLowerCase().includes(searchTerm) ||
            client.inn.includes(searchTerm) ||
            (client.email?.toLowerCase().includes(searchTerm)) ||
            (client.phone?.includes(searchTerm))
        
        const matchesStage = stageFilter === 'all' || client.stage === stageFilter
        
        return matchesSearch && matchesStage
    })
    
    renderClientsTable(filtered)
}

// ======================================================================
// 2. ПРОСМОТР КЛИЕНТА (ИНФОРМАЦИЯ)
// ======================================================================

/**
 * Открывает модальное окно с информацией о клиенте
 */
window.viewClient = async function(id) {
    const client = allClients.find(c => c.id === id)
    if (!client) return

    const viewModal = document.createElement('div')
    viewModal.id = 'viewClientModal'
    viewModal.className = 'modal'
    viewModal.innerHTML = `
        <div class="modal-content client-card">
            <div class="modal-header">
                <h2>Client Information</h2>
                <button class="modal-close" onclick="document.getElementById('viewClientModal').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="client-card-content">
                <div class="client-card-avatar">
                    <div class="client-avatar">${client.name.charAt(0).toUpperCase()}</div>
                </div>
                <div class="client-card-details">
                    <div class="detail-row"><span class="detail-label">Company Name</span><span class="detail-value">${client.name}</span></div>
                    <div class="detail-row"><span class="detail-label">INN</span><span class="detail-value">${client.inn}</span></div>
                    <div class="detail-row"><span class="detail-label">Email</span><span class="detail-value">${client.email || '—'}</span></div>
                    <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${client.phone || '—'}</span></div>
                    <div class="detail-row"><span class="detail-label">Stage</span><span class="detail-value stage-badge">${client.stage}</span></div>
                    <div class="detail-row"><span class="detail-label">Projects</span><span class="detail-value">${client.projects_count || 0}</span></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="modal-btn modal-btn--secondary" onclick="document.getElementById('viewClientModal').remove()">Close</button>
            </div>
        </div>
    `
    document.body.appendChild(viewModal)
    viewModal.classList.add('active')
    document.body.style.overflow = 'hidden'
    lucide.createIcons()
}

// ======================================================================
// 3. ПРОСМОТР ПРОЕКТОВ КЛИЕНТА
// ======================================================================

// ======================================================================
// 4. РЕДАКТИРОВАНИЕ КЛИЕНТА
// ======================================================================

/**
 * Открывает модальное окно для редактирования клиента
 */
window.editClient = function(id) {
    const client = allClients.find(c => c.id === id)
    if (!client) {
        console.error('Client not found:', id)
        return
    }

    editingClientId = id

    // Удаляем предыдущее модальное окно если есть
    const existingModal = document.getElementById('editClientModal')
    if (existingModal) existingModal.remove()

    // Создаем модальное окно
    const editModal = document.createElement('div')
    editModal.id = 'editClientModal'
    editModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `

    editModal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, #0f1215, #1a1f23);
            padding: 30px;
            border-radius: 30px;
            width: 450px;
            border: 1px solid rgba(40, 98, 58, 0.3);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            ">
                <h2 style="
                    font-size: 24px;
                    font-weight: 600;
                    background: linear-gradient(135deg, #ffffff, #a0e0b0);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin: 0;
                ">Edit Client</h2>
                <button id="closeEditModalBtn" style="
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #a0a0a0;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                ">×</button>
            </div>

            <div style="margin-bottom: 20px;">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #a0e0b0; margin-bottom: 6px;">Company name *</label>
                    <input type="text" id="editName" value="${client.name.replace(/"/g, '&quot;')}" style="width: 100%; padding: 12px 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 12px; color: white; font-size: 14px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #a0e0b0; margin-bottom: 6px;">INN *</label>
                    <input type="text" id="editInn" value="${client.inn}" style="width: 100%; padding: 12px 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 12px; color: white; font-size: 14px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #a0e0b0; margin-bottom: 6px;">Email</label>
                    <input type="email" id="editEmail" value="${client.email || ''}" style="width: 100%; padding: 12px 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 12px; color: white; font-size: 14px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #a0e0b0; margin-bottom: 6px;">Phone</label>
                    <input type="text" id="editPhone" value="${client.phone || ''}" style="width: 100%; padding: 12px 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 12px; color: white; font-size: 14px; box-sizing: border-box;">
                </div>

                <div style="margin-bottom: 15px;">
                    <label style="display: block; font-size: 13px; font-weight: 500; color: #a0e0b0; margin-bottom: 6px;">Stage</label>
                    <select id="editStage" style="width: 100%; padding: 12px 16px; background: #1e1e1e; border: 1px solid #333; border-radius: 12px; color: white; font-size: 14px; cursor: pointer;">
                        <option value="Lead" ${client.stage === 'Lead' ? 'selected' : ''}>Lead</option>
                        <option value="Commercial Offer" ${client.stage === 'Commercial Offer' ? 'selected' : ''}>Commercial Offer</option>
                        <option value="Negotiation" ${client.stage === 'Negotiation' ? 'selected' : ''}>Negotiation</option>
                        <option value="Signed" ${client.stage === 'Signed' ? 'selected' : ''}>Signed</option>
                    </select>
                </div>

                <div id="editError" style="color: #ef4444; font-size: 13px; text-align: center; min-height: 20px; display: none;"></div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                <button id="cancelEditBtn" style="padding: 10px 24px; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; background: rgba(255, 255, 255, 0.05); color: #a0a0a0; border: 1px solid rgba(255, 255, 255, 0.1);">Cancel</button>
                <button id="saveEditBtn" style="padding: 10px 24px; border-radius: 40px; font-size: 14px; font-weight: 600; cursor: pointer; background: linear-gradient(135deg, #28623A, #1e4a2c); color: white; border: none; box-shadow: 0 4px 15px rgba(40, 98, 58, 0.3);">Save Changes</button>
            </div>
        </div>
    `

    document.body.appendChild(editModal)

    // Обработчики закрытия
    const closeBtn = document.getElementById('closeEditModalBtn')
    const cancelBtn = document.getElementById('cancelEditBtn')
    
    const closeModal = () => {
        if (editModal && editModal.parentNode) editModal.remove()
        document.body.style.overflow = 'auto'
    }

    if (closeBtn) closeBtn.onclick = closeModal
    if (cancelBtn) cancelBtn.onclick = closeModal
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal()
    })

    document.body.style.overflow = 'hidden'

    // Обработчик сохранения
    const saveBtn = document.getElementById('saveEditBtn')
    if (saveBtn) saveBtn.onclick = async () => await saveClientChanges()
}

/**
 * Сохраняет изменения клиента на сервере
 */
async function saveClientChanges() {
    const errorDiv = document.getElementById('editError')
    if (!errorDiv) return
    errorDiv.style.display = 'none'

    // Получаем элементы формы
    const nameInput = document.getElementById('editName')
    const innInput = document.getElementById('editInn')
    const emailInput = document.getElementById('editEmail')
    const phoneInput = document.getElementById('editPhone')
    const stageSelect = document.getElementById('editStage')
    
    if (!nameInput || !innInput || !stageSelect) return

    const updatedData = {
        name: nameInput.value.trim(),
        inn: innInput.value.trim(),
        email: emailInput.value.trim() || null,
        phone: phoneInput.value.trim() || null,
        stage: stageSelect.value
    }

    // Валидация данных
    if (updatedData.name.length < 2) {
        errorDiv.textContent = 'Company name must be at least 2 characters'
        errorDiv.style.display = 'block'
        return
    }

    if (!/^\d{10}$|^\d{12}$/.test(updatedData.inn)) {
        errorDiv.textContent = 'INN must contain 10 or 12 digits'
        errorDiv.style.display = 'block'
        return
    }

    if (!updatedData.email && !updatedData.phone) {
        errorDiv.textContent = 'Enter email or phone'
        errorDiv.style.display = 'block'
        return
    }

    if (updatedData.email && !isValidEmail(updatedData.email)) {
        errorDiv.textContent = 'Invalid email format'
        errorDiv.style.display = 'block'
        return
    }

    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch(`http://localhost:8080/api/clients/${editingClientId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        })

        const responseData = await response.json()

        if (!response.ok) {
            throw new Error(responseData.error || 'Failed to update client')
        }

        showNotification('Client updated successfully', 'success')
        await loadClients()
        
        // Закрываем модальное окно
        const modal = document.getElementById('editClientModal')
        if (modal) {
            modal.remove()
            document.body.style.overflow = 'auto'
        }

    } catch (err) {
        console.error('Error updating client:', err)
        errorDiv.textContent = err.message
        errorDiv.style.display = 'block'
    }
}

// ======================================================================
// 5. УДАЛЕНИЕ КЛИЕНТА (С ПОДТВЕРЖДЕНИЕМ)
// ======================================================================

/**
 * Открывает модальное окно подтверждения удаления
 */
// Должно быть так:
window.deleteClient = function(id) {
    console.log('deleteClient called, id:', id)
    const client = allClients.find(c => c.id === id)
    if (!client) {
        console.error('Client not found')
        return
    }
    console.log('Client found:', client)
    
    // Удаляем предыдущее модальное окно если есть
    const existingModal = document.getElementById('confirmModal')
    if (existingModal) existingModal.remove()
    
    const confirmModal = document.createElement('div')
    confirmModal.id = 'confirmModal'
    confirmModal.className = 'modal'
    confirmModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;'
    confirmModal.innerHTML = `
        <div style="background: linear-gradient(135deg, #0f1215, #1a1f23); padding: 30px; border-radius: 30px; width: 400px; border: 1px solid rgba(40,98,58,0.3);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                <h2 style="color: white;">Confirm Deletion</h2>
                <button id="closeConfirmModal" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">×</button>
            </div>
            <div style="text-align: center; padding: 20px;">
                <i data-lucide="alert-triangle" style="width: 48px; height: 48px; stroke: #ef4444; margin-bottom: 15px;"></i>
                <p style="color: white; font-size: 16px;">Are you sure you want to delete</p>
                <p style="color: #a0e0b0; font-size: 18px; font-weight: 600;">${client.name}</p>
                <p style="color: #888;">This action cannot be undone.</p>
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                <button id="cancelDeleteBtn" style="padding: 10px 24px; border-radius: 40px; background: rgba(255,255,255,0.05); color: #a0a0a0; border: none; cursor: pointer;">Cancel</button>
                <button id="confirmDeleteBtn" style="padding: 10px 24px; border-radius: 40px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; border: none; cursor: pointer;">Delete</button>
            </div>
        </div>
    `
    document.body.appendChild(confirmModal)
    document.body.style.overflow = 'hidden'
    lucide.createIcons()
    
    document.getElementById('closeConfirmModal').onclick = () => {
        confirmModal.remove()
        document.body.style.overflow = 'auto'
    }
    document.getElementById('cancelDeleteBtn').onclick = () => {
        confirmModal.remove()
        document.body.style.overflow = 'auto'
    }
    document.getElementById('confirmDeleteBtn').onclick = async () => {
        await confirmDelete(id)
        confirmModal.remove()
        document.body.style.overflow = 'auto'
    }
}

/**
 * Выполняет удаление клиента из БД
 */
async function confirmDelete(id) {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch(`http://localhost:8080/api/clients/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to delete client')
        }

        showNotification('Client deleted successfully', 'success')
        await loadClients()
        
        // Закрываем модальное окно подтверждения
        const modal = document.getElementById('confirmModal')
        if (modal) modal.remove()

    } catch (error) {
        console.error('Error deleting client:', error)
        showNotification(error.message, 'error')
        document.getElementById('confirmModal')?.remove()
    }
}

// ======================================================================
// 6. СОЗДАНИЕ КЛИЕНТА
// ======================================================================

openBtn.onclick = () => {
    modal.style.display = "flex"
    document.body.style.overflow = "hidden"
    setDefaultStage()
}

function setDefaultStage() {
    selected.childNodes[0].nodeValue = "Negotiation "
}

function closeModal() {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
    resetErrors()
    resetForm()
    dropdown.classList.remove("active")
}

closeBtn.onclick = closeModal

modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal()
})

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === "flex") closeModal()
})

function resetErrors() {
    error.innerText = ""
    document.querySelectorAll("input").forEach(input => {
        input.classList.remove("input-error")
    })
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function resetForm() {
    document.getElementById("clientName").value = ""
    document.getElementById("clientInn").value = ""
    document.getElementById("clientEmail").value = ""
    document.getElementById("clientPhone").value = ""
    setDefaultStage()
}

createBtn.onclick = async () => {
    resetErrors()

    const name = document.getElementById("clientName")
    const inn = document.getElementById("clientInn")
    const email = document.getElementById("clientEmail")
    const phone = document.getElementById("clientPhone")
    const stage = selected.childNodes[0].nodeValue.trim()

    let hasError = false

    if (name.value.trim().length < 2) {
        error.innerText = "Company name is required (min 2 characters)"
        name.classList.add("input-error")
        hasError = true
    }

    if (!/^\d{10}$|^\d{12}$/.test(inn.value)) {
        error.innerText = "INN must contain 10 or 12 digits"
        inn.classList.add("input-error")
        hasError = true
    }

    if (email.value === "" && phone.value === "") {
        error.innerText = "Enter email or phone"
        email.classList.add("input-error")
        phone.classList.add("input-error")
        hasError = true
    }

    if (email.value && !isValidEmail(email.value)) {
        error.innerText = "Invalid email format"
        email.classList.add("input-error")
        hasError = true
    }

    if (hasError) return

    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch('http://localhost:8080/api/clients/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name.value.trim(),
                inn: inn.value.trim(),
                email: email.value.trim() || null,
                phone: phone.value.trim() || null,
                stage: stage
            })
        })

        if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to create client')
        }

        showNotification("Client created successfully!", "success")
        await loadClients()
        window.dispatchEvent(new CustomEvent("clientCreated"))
        resetForm()
        closeModal()

    } catch (error) {
        console.error('Error creating client:', error)
        error.innerText = error.message || 'Failed to create client'
        showNotification(error.message || 'Failed to create client', 'error')
    }
}

// ======================================================================
// 7. DROPDOWN СТАДИЙ
// ======================================================================

selected.onclick = (e) => {
    e.stopPropagation()
    const isActive = dropdown.classList.contains("active")
    
    if (isActive) {
        dropdown.classList.remove("active")
        menu.style.display = "none"
    } else {
        dropdown.classList.add("active")
        menu.style.display = "block"
    }
}

items.forEach(item => {
    item.onclick = (e) => {
        e.stopPropagation()
        selected.childNodes[0].nodeValue = item.dataset.value + " "
        dropdown.classList.remove("active")
        menu.style.display = "none"
    }
})

document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("active")
        menu.style.display = "none"
    }
})

// ======================================================================
// 8. УВЕДОМЛЕНИЯ
// ======================================================================

function showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification notification--${type}`
    notification.innerHTML = `
        <i data-lucide="${type === "success" ? "check-circle" : "alert-circle"}"></i>
        <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    lucide.createIcons()
    
    setTimeout(() => notification.classList.add("show"), 10)
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

// Стили для уведомлений
if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style")
    style.id = "notification-styles"
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
    `
    document.head.appendChild(style)
}