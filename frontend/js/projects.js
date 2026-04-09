let projects = [];
window.allClients = [];
let statusValue = "initiation";
let currentView = "active";
let showArchive = false;

document.addEventListener("DOMContentLoaded", () => {
    initModal();
    initDropdown();
    loadProjects();
    initArchive();
    loadClients();
});

function renderProjectsTable() {
    const tbody = document.querySelector(".projects-table tbody");
    if (!tbody) return;

    if (projects.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <div style="color: #888; font-size: 16px;">
                        No projects yet. Click "Create Project" to get started.
                    </div>
                 </td>
             </tr>
        `;
        return;
    }

    tbody.innerHTML = projects.map(project => {
        const statusClass = getStatusClass(project.status);
        const statusText = getStatusText(project.status);
        
        return `
            <tr onclick="viewProject(${project.id})">
                <td><strong>${project.name}</strong></td>
                <td>${project.client_name || '—'}</td>
                <td>${project.manager_name || '—'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(project.start_date)}</td>
                <td>${project.end_date ? formatDate(project.end_date) : '—'}</td>
            </tr>
        `;
    }).join('');
}

function getStatusClass(status) {
    switch(status) {
        case 'initiation': return 'status-initiation';
        case 'planning': return 'status-planning';
        case 'active': return 'status-active';
        case 'completed': return 'status-completed';
        default: return 'status-planning';
    }
}

function getStatusText(status) {
    switch(status) {
        case 'initiation': return 'Initiation';
        case 'planning': return 'Planning';
        case 'active': return 'In Progress';
        case 'completed': return 'Completed';
        default: return 'Planning';
    }
}

function getClientName(clientId) {
    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    const client = clients.find(c => c.id == clientId);
    return client ? client.name : 'Unknown';
}

function getManagerName(managerId) {
    const managers = {
        1: 'Alex Lesnik',
        2: 'Ivan Petrov'
    };
    return managers[managerId] || 'Unknown';
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// View project function - передаем ID проекта на страницу задач
window.viewProject = function(projectId) {
    // Сохраняем ID проекта в localStorage
    localStorage.setItem("currentProjectId", projectId);
    // Также сохраняем флаг, что мы перешли из проекта
    localStorage.setItem("fromProject", "true");
    window.location.href = "../tasks/index.html";
};

function initModal() {
    const modal = document.getElementById("projectModal");
    const openBtn = document.getElementById("openProjectModal");
    const closeBtn = document.getElementById("closeProjectModal");
    const createBtn = document.getElementById("createProjectBtn");
    const error = document.getElementById("projectError");
    const clientSelect = document.getElementById("projectClient");
    const createClientBtn = document.getElementById("createClientFromProject");

    if (openBtn) {
        openBtn.addEventListener("click", () => {
            renderClientSelect();
            document.getElementById("projectStart").value = 
                new Date().toISOString().split("T")[0];
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        resetForm();
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    if (createClientBtn) {
        createClientBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const clientModal = document.getElementById("clientModal");
            if (clientModal) {
                clientModal.style.display = "flex";
            }
        });
    }

    if (createBtn) {
        createBtn.addEventListener("click", () => {
            if (validateForm()) {
                createProject();
            }
        });
    }

    window.addEventListener("clientCreated", () => {
        loadClients();
        const clients = JSON.parse(localStorage.getItem("clients")) || [];
        if (clients.length > 0) {
            const lastClient = clients[clients.length - 1];
            document.getElementById("projectClient").value = lastClient.id;
        }
    });
}

function validateForm() {
    const error = document.getElementById("projectError");
    error.innerText = "";

    const name = document.getElementById("projectName").value.trim();
    const start = document.getElementById("projectStart").value;
    const end = document.getElementById("projectEnd").value;

    if (name.length < 3) {
        error.innerText = "Project name must be at least 3 characters";
        return false;
    }

    const today = new Date().toISOString().split("T")[0];
    if (start > today) {
        error.innerText = "Start date cannot be in the future";
        return false;
    }

    if (end && end <= start) {
        error.innerText = "End date must be after start date";
        return false;
    }

    return true;
}


async function loadProjects() {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch('http://localhost:8080/api/projects?archived=false', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Failed to load projects')

        const data = await response.json()
        projects = data
        renderProjectsTable()
    } catch (error) {
        console.error('Error loading projects:', error)
        showNotification('Failed to load projects', 'error')
    }
}

async function createProject() {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    const name = document.getElementById("projectName").value.trim()
    const clientId = document.getElementById("projectClient").value
    const managerId = document.getElementById("projectManager").value
    const startDate = document.getElementById("projectStart").value
    let endDate = document.getElementById("projectEnd").value || null
    const status = statusValue

    if (endDate === "") endDate = null
    const finalClientId = clientId === "" ? null : parseInt(clientId)

    try {
        const response = await fetch('http://localhost:8080/api/projects/create', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                client_id: finalClientId,
                manager_id: parseInt(managerId),
                start_date: startDate,
                end_date: endDate,
                status: status
            })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create project')
        }

        showNotification("Project created successfully!", "success")
        
        document.getElementById("projectModal").style.display = "none"
        document.body.style.overflow = "auto"
        
        await loadProjects()
        showArchive = false
    } catch (error) {
        console.error('Error creating project:', error)
        const errorDiv = document.getElementById("projectError")
        errorDiv.innerText = error.message
        showNotification(error.message, 'error')
    }
}

function resetForm() {
    document.getElementById("projectName").value = "";
    document.getElementById("projectEnd").value = "";
    document.getElementById("projectError").innerText = "";
    
    const statusSelected = document.querySelector("#statusDropdown .dropdown-selected");
    if (statusSelected) {
        statusSelected.childNodes[0].nodeValue = "Initiation ";
    }
    statusValue = "initiation";
}

function initDropdown() {
    const statusDropdown = document.getElementById("statusDropdown");
    if (!statusDropdown) return;

    const statusSelected = statusDropdown.querySelector(".dropdown-selected");
    const statusMenu = statusDropdown.querySelector(".dropdown-menu");
    const statusItems = statusDropdown.querySelectorAll(".dropdown-item");

    statusSelected.addEventListener("click", (e) => {
        e.stopPropagation();
        const isActive = statusDropdown.classList.contains("active");
        
        if (isActive) {
            statusDropdown.classList.remove("active");
            statusMenu.style.display = "none";
        } else {
            statusDropdown.classList.add("active");
            statusMenu.style.display = "block";
        }
    });

    statusItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            statusValue = item.dataset.value;
            statusSelected.childNodes[0].nodeValue = item.innerText + " ";
            statusDropdown.classList.remove("active");
            statusMenu.style.display = "none";
        });
    });

    document.addEventListener("click", (e) => {
        if (!statusDropdown.contains(e.target)) {
            statusDropdown.classList.remove("active");
            statusMenu.style.display = "none";
        }
    });
}

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

        window.allClients = await response.json()
        renderClientSelect()
    } catch (error) {
        console.error('Error loading clients:', error)
    }
}

function renderClientSelect() {
    const clientSelect = document.getElementById("projectClient")
    if (!clientSelect) return

    try {
        clientSelect.innerHTML = '<option value="">No client (optional)</option>'
        
        if (window.allClients && window.allClients.length > 0) {
            window.allClients.forEach(client => {
                const option = document.createElement("option")
                option.value = client.id
                option.innerText = client.name
                clientSelect.appendChild(option)
            })
        }
    } catch (error) {
        console.error('Error rendering client select:', error)
        clientSelect.innerHTML = '<option value="">Error loading clients</option>'
    }
}

function initArchive() {
    const archiveBtn = document.getElementById("viewArchive");
    if (!archiveBtn) return;
    
    archiveBtn.addEventListener("click", async () => {
        showArchive = !showArchive;
        
        if (showArchive) {
            archiveBtn.textContent = "← Show Active";
            archiveBtn.classList.add("active");
            await loadArchivedProjects();
        } else {
            archiveBtn.textContent = "View Archive";
            archiveBtn.classList.remove("active");
            await loadProjects();
        }
    });
}

async function loadArchivedProjects() {
    const token = localStorage.getItem('token')
    if (!token) {
        window.location.href = '/auth/register.html'
        return
    }

    try {
        const response = await fetch('http://localhost:8080/api/projects/archived', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) throw new Error('Failed to load archived projects')

        const data = await response.json()
        projects = data
        renderProjectsTable()
    } catch (error) {
        console.error('Error loading archived projects:', error)
        showNotification('Failed to load archived projects', 'error')
    }
}

const clientModal = document.getElementById("clientModal");
if (clientModal) {
    const closeClientModal = document.getElementById("closeClientModal");
    const createClientBtn = document.getElementById("createClientBtn");

    closeClientModal?.addEventListener("click", () => {
        clientModal.style.display = "none";
    });

    clientModal.addEventListener("click", (e) => {
        if (e.target === clientModal) {
            clientModal.style.display = "none";
        }
    });

    if (createClientBtn) {
        createClientBtn.addEventListener("click", () => {
            clientModal.style.display = "none";
        });
    }
}

function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === "success" ? "check-circle" : "info"}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    if (window.lucide) {
        lucide.createIcons();
    }
    
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

if (!document.querySelector("#notification-styles")) {
    const style = document.createElement("style");
    style.id = "notification-styles";
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
            backdrop-filter: blur(10px);
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