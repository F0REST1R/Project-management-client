document.addEventListener("DOMContentLoaded", () => {
    initProjects();
    initModal();
    initDropdown();
    initArchive();
    loadClients();
});

let projects = [];
let statusValue = "initiation";

function initProjects() {
    // Load projects from localStorage
    projects = JSON.parse(localStorage.getItem("projects")) || [];
    renderProjectsTable();
}

function renderProjectsTable() {
    const tbody = document.querySelector(".projects-table tbody");
    if (!tbody) return;

    const activeProjects = projects.filter(p => !p.archived);

    if (activeProjects.length === 0) {
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

    tbody.innerHTML = activeProjects.map(project => {
        const statusClass = getStatusClass(project.status);
        const statusText = getStatusText(project.status);
        
        return `
            <tr onclick="viewProject(${project.id})">
                <td><strong>${project.name}</strong></td>
                <td>${getClientName(project.clientId)}</td>
                <td>${getManagerName(project.managerId)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${formatDate(project.startDate)}</td>
                <td>${project.endDate ? formatDate(project.endDate) : '—'}</td>
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

// View project function (global for onclick)
window.viewProject = function(projectId) {
    // Store current project ID to view later
    localStorage.setItem("currentProjectId", projectId);
    window.location.href = "../project/index.html";
};

function initModal() {
    const modal = document.getElementById("projectModal");
    const openBtn = document.getElementById("openProjectModal");
    const closeBtn = document.getElementById("closeProjectModal");
    const createBtn = document.getElementById("createProjectBtn");
    const error = document.getElementById("projectError");
    const clientSelect = document.getElementById("projectClient");
    const createClientBtn = document.getElementById("createClientFromProject");

    // Open modal
    if (openBtn) {
        openBtn.addEventListener("click", () => {
            loadClients();
            document.getElementById("projectStart").value = 
                new Date().toISOString().split("T")[0];
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    // Close modal
    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        resetForm();
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Close on click outside
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.style.display === "flex") {
            closeModal();
        }
    });

    // Open client modal from project modal
    if (createClientBtn) {
        createClientBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const clientModal = document.getElementById("clientModal");
            if (clientModal) {
                clientModal.style.display = "flex";
            }
        });
    }

    // Create project
    if (createBtn) {
        createBtn.addEventListener("click", () => {
            if (validateForm()) {
                createProject();
            }
        });
    }

    // Listen for client created event
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
    const client = document.getElementById("projectClient").value;
    const start = document.getElementById("projectStart").value;
    const end = document.getElementById("projectEnd").value;

    if (name.length < 3) {
        error.innerText = "Project name must be at least 3 characters";
        return false;
    }

    if (!client) {
        error.innerText = "Please select a client";
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

function createProject() {
    const name = document.getElementById("projectName").value.trim();
    const clientId = document.getElementById("projectClient").value;
    const managerId = document.getElementById("projectManager").value;
    const startDate = document.getElementById("projectStart").value;
    const endDate = document.getElementById("projectEnd").value || null;
    const status = statusValue;

    const projects = JSON.parse(localStorage.getItem("projects")) || [];

    const newProject = {
        id: Date.now(),
        name,
        clientId,
        managerId,
        startDate,
        endDate,
        status,
        archived: false,
        createdAt: new Date().toISOString()
    };

    projects.push(newProject);
    localStorage.setItem("projects", JSON.stringify(projects));

    // Show success notification
    showNotification("Project created successfully!", "success");

    // Close modal and reset
    document.getElementById("projectModal").style.display = "none";
    document.body.style.overflow = "auto";
    resetForm();

    // Refresh table
    initProjects();
}

function resetForm() {
    document.getElementById("projectName").value = "";
    document.getElementById("projectEnd").value = "";
    document.getElementById("projectError").innerText = "";
    
    // Reset status dropdown
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

    // Toggle dropdown
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

    // Select item
    statusItems.forEach(item => {
        item.addEventListener("click", (e) => {
            e.stopPropagation();
            statusValue = item.dataset.value;
            statusSelected.childNodes[0].nodeValue = item.innerText + " ";
            statusDropdown.classList.remove("active");
            statusMenu.style.display = "none";
        });
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
        if (!statusDropdown.contains(e.target)) {
            statusDropdown.classList.remove("active");
            statusMenu.style.display = "none";
        }
    });
}

function loadClients() {
    const clientSelect = document.getElementById("projectClient");
    if (!clientSelect) return;

    const clients = JSON.parse(localStorage.getItem("clients")) || [];
    clientSelect.innerHTML = "";

    if (clients.length === 0) {
        const option = document.createElement("option");
        option.value = "";
        option.innerText = "No clients yet";
        option.disabled = true;
        option.selected = true;
        clientSelect.appendChild(option);
        return;
    }

    clients.forEach(client => {
        const option = document.createElement("option");
        option.value = client.id;
        option.innerText = client.name;
        clientSelect.appendChild(option);
    });
}

function initArchive() {
    const archiveBtn = document.getElementById("viewArchive");
    if (archiveBtn) {
        archiveBtn.addEventListener("click", () => {
            const archived = projects.filter(p => p.archived);
            if (archived.length === 0) {
                showNotification("No archived projects", "info");
            } else {
                // Здесь можно открыть модалку с архивными проектами
                console.log("Archived projects:", archived);
                showNotification(`Found ${archived.length} archived projects`, "info");
            }
        });
    }
}

// Client modal functionality
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
            // Client creation is handled in clients.js
            // Just close this modal
            clientModal.style.display = "none";
        });
    }
}

// Notification function
function showNotification(message, type = "success") {
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === "success" ? "check-circle" : "info"}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Create icon
    if (window.lucide) {
        lucide.createIcons();
    }
    
    // Show notification
    setTimeout(() => {
        notification.classList.add("show");
    }, 10);
    
    // Hide and remove
    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles if not present
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