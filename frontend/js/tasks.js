// tasks.js - с поддержкой выбранного проекта

// Тестовые данные
let tasks = [
    {
        id: 1,
        title: 'Design review for homepage',
        description: 'Review the new homepage design with the team. Need to check responsiveness and accessibility.',
        project: 'Website Redesign',
        projectId: 1,
        assignee: 'John Doe',
        assigneeId: 2,
        priority: 'high',
        dueDate: '2026-03-20',
        status: 'in-progress',
        hours: 4,
        comments: [
            {
                author: 'John Doe',
                time: '2 hours ago',
                text: 'I\'ll start working on this today'
            }
        ]
    },
    {
        id: 2,
        title: 'API integration for payment gateway',
        description: 'Integrate Stripe payment gateway. Handle webhooks and error cases.',
        project: 'Mobile App Development',
        projectId: 2,
        assignee: 'Alice Smith',
        assigneeId: 3,
        priority: 'urgent',
        dueDate: '2026-03-18',
        status: 'todo',
        hours: 8,
        comments: []
    },
    {
        id: 3,
        title: 'Fix navigation bug on mobile',
        description: 'Navigation menu not working on iOS devices. Hamburger menu doesn\'t respond.',
        project: 'Mobile App Development',
        projectId: 2,
        assignee: 'John Doe',
        assigneeId: 2,
        priority: 'medium',
        dueDate: '2026-03-15',
        status: 'done',
        hours: 2,
        comments: []
    },
    {
        id: 4,
        title: 'Update documentation',
        description: 'Update API documentation with new endpoints and examples.',
        project: 'Backend API Integration',
        projectId: 3,
        assignee: 'Robert Johnson',
        assigneeId: 4,
        priority: 'low',
        dueDate: '2026-03-25',
        status: 'review',
        hours: 3,
        comments: []
    },
    {
        id: 5,
        title: 'Security audit',
        description: 'Perform security audit on the system. Check for vulnerabilities.',
        project: 'Security Audit',
        projectId: 5,
        assignee: 'Mary Williams',
        assigneeId: 5,
        priority: 'high',
        dueDate: '2026-03-10',
        status: 'overdue',
        hours: 6,
        comments: []
    },
    {
        id: 6,
        title: 'Database optimization',
        description: 'Optimize slow queries and add indexes',
        project: 'Website Redesign',
        projectId: 1,
        assignee: 'Alex Lesnik',
        assigneeId: 1,
        priority: 'high',
        dueDate: '2026-03-22',
        status: 'todo',
        hours: 5,
        comments: []
    }
];

const employees = [
    { id: 1, name: 'Alex Lesnik', role: 'manager' },
    { id: 2, name: 'John Doe', role: 'employee' },
    { id: 3, name: 'Alice Smith', role: 'employee' },
    { id: 4, name: 'Robert Johnson', role: 'employee' },
    { id: 5, name: 'Mary Williams', role: 'employee' }
];

const projectsList = [
    { id: 1, name: 'Website Redesign', client: 'Acme Corp' },
    { id: 2, name: 'Mobile App Development', client: 'Tech Ltd' },
    { id: 3, name: 'Backend API Integration', client: 'Startup Inc' },
    { id: 4, name: 'Cloud Migration', client: 'Enterprise Co' },
    { id: 5, name: 'Security Audit', client: 'Finance Corp' }
];

// Текущий пользователь
let currentUser = {
    id: 1,
    name: 'Alex Lesnik',
    role: 'manager',
    clientProjects: [1, 2, 3]
};

let currentFilter = 'all';
let currentProject = 'all';
let currentView = 'list';
let editingId = null;
let selectedProjectId = null;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Tasks page loaded');
    
    // Проверяем, пришли ли мы с конкретного проекта
    const fromProject = localStorage.getItem('fromProject');
    const savedProjectId = localStorage.getItem('currentProjectId');
    
    if (fromProject === 'true' && savedProjectId) {
        selectedProjectId = parseInt(savedProjectId);
        // Очищаем флаги
        localStorage.removeItem('fromProject');
        localStorage.removeItem('currentProjectId');
    }
    
    initProjectsLink();
    initUserInterface();
    initFilters();
    initModal();
    initDropdown();
    loadProjectsSelect();
    loadEmployeesSelect();
    loadTasks();
    initEventListeners();
    
    // Если выбран проект, обновляем заголовок
    if (selectedProjectId) {
        updatePageHeaderForProject();
    }
});

function updatePageHeaderForProject() {
    const project = projectsList.find(p => p.id === selectedProjectId);
    if (project) {
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');
        if (title) title.textContent = `${project.name}`;
        if (subtitle) subtitle.textContent = `Manage tasks for ${project.name}`;
        
        // Устанавливаем фильтр проекта
        const projectFilter = document.getElementById('projectFilter');
        if (projectFilter) {
            projectFilter.value = selectedProjectId;
            currentProject = selectedProjectId.toString();
        }
    }
}

function initEventListeners() {
    const addCommentBtn = document.getElementById('addCommentBtn');
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', addComment);
    }
}

function initUserInterface() {
    const userRole = currentUser.role;
    
    const title = document.getElementById('pageTitle');
    const subtitle = document.getElementById('pageSubtitle');
    const createBtn = document.getElementById('createTaskBtn');
    const managerStats = document.getElementById('managerStats');
    const clientStats = document.getElementById('clientStats');
    const projectSelector = document.getElementById('projectSelector');

    if (userRole === 'employee') {
        if (title) title.textContent = 'My Tasks';
        if (subtitle) subtitle.textContent = 'Manage your assigned tasks and stay productive';
        if (createBtn) createBtn.style.display = 'none';
        if (managerStats) managerStats.style.display = 'none';
        if (clientStats) clientStats.style.display = 'none';
        if (projectSelector) projectSelector.style.display = 'none';
    } 
    else if (userRole === 'client') {
        if (title) title.textContent = 'Project Tasks';
        if (subtitle) subtitle.textContent = 'Track tasks across your projects';
        if (createBtn) createBtn.style.display = 'none';
        if (managerStats) managerStats.style.display = 'none';
        if (clientStats) clientStats.style.display = 'grid';
        if (projectSelector) projectSelector.style.display = 'block';
        
        loadClientProjects();
    } 
    else if (userRole === 'manager') {
        if (title) title.textContent = 'All Tasks';
        if (subtitle) subtitle.textContent = 'Overview of all team tasks';
        if (managerStats) managerStats.style.display = 'grid';
        if (clientStats) clientStats.style.display = 'none';
        if (projectSelector) projectSelector.style.display = 'block';
    }
}

function loadClientProjects() {
    const select = document.getElementById('projectFilter');
    if (!select) return;
    
    select.innerHTML = '<option value="all">All Projects</option>';
    
    const clientProjectsList = projectsList.filter(p => currentUser.clientProjects?.includes(p.id));
    clientProjectsList.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
}

function loadTasks() {
    console.log('Loading tasks...');
    const userRole = currentUser.role;
    let filteredTasks = [...tasks];

    // Фильтрация по роли
    if (userRole === 'employee') {
        filteredTasks = filteredTasks.filter(t => t.assigneeId === currentUser.id);
    } else if (userRole === 'client') {
        filteredTasks = filteredTasks.filter(t => currentUser.clientProjects?.includes(t.projectId));
        if (currentProject !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.projectId == currentProject);
        }
    } else if (userRole === 'manager') {
        if (currentProject !== 'all') {
            filteredTasks = filteredTasks.filter(t => t.projectId == currentProject);
        }
    }
    
    // Фильтрация по выбранному проекту (если пришли из проекта)
    if (selectedProjectId && !currentProject || currentProject === 'all') {
        filteredTasks = filteredTasks.filter(t => t.projectId === selectedProjectId);
    }

    // Фильтрация по вкладкам
    const today = new Date().toISOString().split('T')[0];
    
    switch(currentFilter) {
        case 'today':
            filteredTasks = filteredTasks.filter(t => t.dueDate === today);
            break;
        case 'upcoming':
            filteredTasks = filteredTasks.filter(t => t.dueDate > today && t.status !== 'done');
            break;
        case 'overdue':
            filteredTasks = filteredTasks.filter(t => t.dueDate < today && t.status !== 'done');
            break;
        case 'completed':
            filteredTasks = filteredTasks.filter(t => t.status === 'done');
            break;
        default:
            break;
    }

    // Сортировка
    const sortBy = document.getElementById('sortBy')?.value;
    if (sortBy) {
        filteredTasks.sort((a, b) => {
            if (sortBy === 'dueDate') {
                return a.dueDate.localeCompare(b.dueDate);
            } else if (sortBy === 'priority') {
                const priorityOrder = { 'urgent': 1, 'high': 2, 'medium': 3, 'low': 4 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            } else if (sortBy === 'project') {
                return a.project.localeCompare(b.project);
            }
            return 0;
        });
    }

    updateStats(filteredTasks);

    if (currentView === 'list') {
        renderListView(filteredTasks);
    } else {
        renderBoardView(filteredTasks);
    }
}

function renderListView(tasksArray) {
    const container = document.getElementById('tasksList');
    if (!container) return;

    if (tasksArray.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="check-circle"></i>
                <h3>No tasks found</h3>
                <p>${currentUser.role === 'employee' ? 'You have no tasks assigned.' : 'No tasks match your filters.'}</p>
                ${currentUser.role === 'manager' ? '<button class="create-task-btn empty-state-btn" onclick="document.getElementById(\'createTaskBtn\').click()"><i data-lucide="plus"></i>Create Task</button>' : ''}
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = tasksArray.map(task => {
        const today = new Date().toISOString().split('T')[0];
        const isOverdue = task.dueDate < today && task.status !== 'done';
        
        const statusDisplay = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'review': 'Review',
            'done': 'Done',
            'overdue': 'Overdue'
        };
        
        return `
            <div class="task-item" onclick="window.viewTask(${task.id})">
                <div class="task-checkbox" onclick="event.stopPropagation()">
                    <input type="checkbox" id="task_${task.id}" ${task.status === 'done' ? 'checked' : ''} onchange="window.toggleTaskStatus(${task.id}, this.checked)">
                    <label for="task_${task.id}"></label>
                </div>
                <div class="task-content">
                    <span class="task-title" style="${task.status === 'done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(task.title)}</span>
                    <span class="task-project">${escapeHtml(task.project)}</span>
                    <span class="task-priority priority-${task.priority}">${task.priority.toUpperCase()}</span>
                    <span class="task-due-date ${isOverdue ? 'overdue' : ''}">
                        <i data-lucide="calendar"></i>
                        ${formatDate(task.dueDate)}
                    </span>
                    <span class="task-status status-${task.status}">${statusDisplay[task.status] || task.status}</span>
                    <span class="task-assignee">
                        <i data-lucide="user"></i>
                        ${escapeHtml(task.assignee)}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="task-action-btn" onclick="event.stopPropagation(); window.editTask(${task.id})">
                        <i data-lucide="edit-2"></i>
                    </button>
                    <button class="task-action-btn" onclick="event.stopPropagation(); window.deleteTask(${task.id})">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
}

function renderBoardView(tasksArray) {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;

    const columns = {
        'todo': { title: 'To Do', color: '#6b7280', tasks: tasksArray.filter(t => t.status === 'todo') },
        'in-progress': { title: 'In Progress', color: '#3b82f6', tasks: tasksArray.filter(t => t.status === 'in-progress') },
        'review': { title: 'Review', color: '#eab308', tasks: tasksArray.filter(t => t.status === 'review') },
        'done': { title: 'Done', color: '#22c55e', tasks: tasksArray.filter(t => t.status === 'done') }
    };

    board.innerHTML = Object.entries(columns).map(([key, column]) => `
        <div class="kanban-column" data-status="${key}">
            <div class="kanban-header">
                <h3>${column.title}</h3>
                <span class="kanban-count">${column.tasks.length}</span>
            </div>
            <div class="kanban-tasks" id="column-${key}" data-status="${key}">
                ${column.tasks.map(task => `
                    <div class="kanban-task" draggable="true" data-task-id="${task.id}" 
                         ondragstart="window.dragStart(event)" ondragend="window.dragEnd(event)"
                         onclick="window.viewTask(${task.id})">
                        <div class="kanban-task-header">
                            <span class="kanban-task-title">${escapeHtml(task.title)}</span>
                            <span class="task-priority priority-${task.priority}">${task.priority}</span>
                        </div>
                        <div class="kanban-task-footer">
                            <span>${escapeHtml(task.project)}</span>
                            <span>${escapeHtml(task.assignee)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.kanban-tasks').forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('drop', drop);
    });

    lucide.createIcons();
}

function updateStats(tasksArray) {
    const today = new Date().toISOString().split('T')[0];
    
    const completedToday = document.getElementById('completedToday');
    const inProgress = document.getElementById('inProgress');
    const overdueTasks = document.getElementById('overdueTasks');
    const teamMembers = document.getElementById('teamMembers');
    const clientProjects = document.getElementById('clientProjects');
    const clientCompleted = document.getElementById('clientCompleted');
    const clientInProgress = document.getElementById('clientInProgress');

    if (completedToday) completedToday.textContent = tasksArray.filter(t => t.status === 'done' && t.dueDate === today).length;
    if (inProgress) inProgress.textContent = tasksArray.filter(t => t.status === 'in-progress').length;
    if (overdueTasks) overdueTasks.textContent = tasksArray.filter(t => t.dueDate < today && t.status !== 'done').length;
    if (teamMembers) teamMembers.textContent = employees.length;
    
    if (clientProjects) clientProjects.textContent = currentUser.clientProjects?.length || 0;
    if (clientCompleted) clientCompleted.textContent = tasksArray.filter(t => t.status === 'done').length;
    if (clientInProgress) clientInProgress.textContent = tasksArray.filter(t => t.status === 'in-progress' || t.status === 'review').length;
}

function initFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            loadTasks();
        });
    });

    const projectFilter = document.getElementById('projectFilter');
    if (projectFilter) {
        projectFilter.addEventListener('change', (e) => {
            currentProject = e.target.value;
            // Если выбран конкретный проект, очищаем selectedProjectId
            if (currentProject !== 'all') {
                selectedProjectId = parseInt(currentProject);
                updatePageHeaderForSelectedProject();
            } else {
                selectedProjectId = null;
                resetPageHeader();
            }
            loadTasks();
        });
    }

    const sortBy = document.getElementById('sortBy');
    if (sortBy) {
        sortBy.addEventListener('change', () => {
            loadTasks();
        });
    }

    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            
            const listView = document.getElementById('listView');
            const boardView = document.getElementById('boardView');
            
            if (listView) listView.style.display = currentView === 'list' ? 'block' : 'none';
            if (boardView) boardView.style.display = currentView === 'board' ? 'block' : 'none';
            
            loadTasks();
        });
    });
}

function updatePageHeaderForSelectedProject() {
    const project = projectsList.find(p => p.id === selectedProjectId);
    if (project) {
        const title = document.getElementById('pageTitle');
        const subtitle = document.getElementById('pageSubtitle');
        if (title) title.textContent = `${project.name} Tasks`;
        if (subtitle) subtitle.textContent = `Manage tasks for ${project.name}`;
    }
}

function resetPageHeader() {
    const title = document.getElementById('pageTitle');
    const subtitle = document.getElementById('pageSubtitle');
    if (title) title.textContent = 'All Tasks';
    if (subtitle) subtitle.textContent = 'Overview of all team tasks';
    
    const backBtn = document.querySelector('.back-to-projects');
    if (backBtn) backBtn.remove();
}

function initModal() {
    const modal = document.getElementById('taskModal');
    const openBtn = document.getElementById('createTaskBtn');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveTaskBtn');
    const viewModal = document.getElementById('viewTaskModal');
    const closeViewBtn = document.getElementById('closeViewBtn');
    const closeViewModalBtn = document.getElementById('closeViewModalBtn');
    const editBtn = document.getElementById('editTaskBtn');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            editingId = null;
            const modalTitle = document.getElementById('modalTitle');
            if (modalTitle) modalTitle.textContent = 'Create New Task';
            resetForm();
            
            // Если выбран проект, предустанавливаем его
            if (selectedProjectId) {
                const projectSelect = document.getElementById('taskProject');
                if (projectSelect) projectSelect.value = selectedProjectId;
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    function closeModal() {
        if (modal) modal.classList.remove('active');
        if (viewModal) viewModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        resetForm();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (closeViewBtn) closeViewBtn.addEventListener('click', closeModal);
    if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    if (viewModal) {
        viewModal.addEventListener('click', (e) => {
            if (e.target === viewModal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            if (validateForm()) {
                saveTask();
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (editingId) {
                if (viewModal) viewModal.classList.remove('active');
                window.editTask(editingId);
            }
        });
    }
}

function initDropdown() {
    const dropdown = document.getElementById('statusDropdown');
    if (!dropdown) return;

    const selected = dropdown.querySelector('.dropdown-selected');
    const menu = dropdown.querySelector('.dropdown-menu');
    const items = dropdown.querySelectorAll('.dropdown-item');

    if (selected) {
        selected.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = dropdown.classList.contains('active');
            
            if (isActive) {
                dropdown.classList.remove('active');
                if (menu) menu.style.display = 'none';
            } else {
                dropdown.classList.add('active');
                if (menu) menu.style.display = 'block';
            }
        });
    }

    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selected) {
                selected.childNodes[0].nodeValue = item.innerText + ' ';
            }
            dropdown.classList.remove('active');
            if (menu) menu.style.display = 'none';
        });
    });

    document.addEventListener('click', () => {
        dropdown.classList.remove('active');
        if (menu) menu.style.display = 'none';
    });
}

function loadProjectsSelect() {
    const select = document.getElementById('taskProject');
    if (!select) return;

    select.innerHTML = '<option value="">Select project</option>';
    projectsList.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.name;
        select.appendChild(option);
    });
}

function loadEmployeesSelect() {
    const select = document.getElementById('taskAssignee');
    if (!select) return;

    select.innerHTML = '<option value="">Select assignee</option>';
    employees.forEach(emp => {
        const option = document.createElement('option');
        option.value = emp.id;
        option.textContent = emp.name;
        select.appendChild(option);
    });
}

function resetForm() {
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDescription');
    const dueDateInput = document.getElementById('taskDueDate');
    const hoursInput = document.getElementById('taskHours');
    const errorDiv = document.getElementById('taskError');
    const dropdown = document.querySelector('#statusDropdown .dropdown-selected');

    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';
    if (dueDateInput) dueDateInput.value = '';
    if (hoursInput) hoursInput.value = '';
    if (errorDiv) errorDiv.textContent = '';
    
    if (dropdown) dropdown.childNodes[0].nodeValue = 'To Do ';
}

function validateForm() {
    const title = document.getElementById('taskTitle')?.value.trim();
    const project = document.getElementById('taskProject')?.value;
    const error = document.getElementById('taskError');

    if (!title) {
        if (error) error.textContent = 'Task title is required';
        return false;
    }

    if (!project) {
        if (error) error.textContent = 'Please select a project';
        return false;
    }

    return true;
}

function saveTask() {
    const title = document.getElementById('taskTitle')?.value.trim();
    const description = document.getElementById('taskDescription')?.value.trim();
    const projectId = document.getElementById('taskProject')?.value;
    const assigneeId = document.getElementById('taskAssignee')?.value;
    const priority = document.getElementById('taskPriority')?.value;
    const dueDate = document.getElementById('taskDueDate')?.value;
    const hours = document.getElementById('taskHours')?.value;
    const status = document.getElementById('taskStatus')?.value;
    
    let statusText = 'todo';
    if (statusElem) {
        const statusMap = {
            'To Do': 'todo',
            'In Progress': 'in-progress',
            'Review': 'review',
            'Done': 'done'
        };
        const selectedText = statusElem.childNodes[0].nodeValue.trim();
        statusText = statusMap[selectedText] || 'todo';
    }

    const project = projectsList.find(p => p.id == projectId);
    const assignee = employees.find(e => e.id == assigneeId);

    const taskData = {
        id: editingId || Date.now(),
        title: title || 'Untitled',
        description: description || '',
        project: project?.name || '',
        projectId: parseInt(projectId),
        assignee: assignee?.name || 'Unassigned',
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        priority: priority || 'medium',
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        status: statusText,
        hours: parseFloat(hours) || 0,
        comments: editingId ? (tasks.find(t => t.id === editingId)?.comments || []) : []
    };

    if (editingId) {
        const index = tasks.findIndex(t => t.id === editingId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...taskData };
        }
        showNotification('Task updated successfully', 'success');
    } else {
        tasks.push(taskData);
        showNotification('Task created successfully', 'success');
    }

    loadTasks();
    
    const modal = document.getElementById('taskModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    resetForm();
}

window.viewTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingId = id;

    const titleEl = document.getElementById('viewTaskTitle');
    const projectEl = document.getElementById('viewTaskProject');
    const assigneeEl = document.getElementById('viewTaskAssignee');
    const dueDateEl = document.getElementById('viewTaskDueDate');
    const hoursEl = document.getElementById('viewTaskHours');
    const descEl = document.getElementById('viewTaskDescription');
    const statusEl = document.getElementById('viewTaskStatus');
    const priorityEl = document.getElementById('viewTaskPriority');

    if (titleEl) titleEl.textContent = task.title;
    if (projectEl) projectEl.textContent = task.project;
    if (assigneeEl) assigneeEl.textContent = task.assignee;
    if (dueDateEl) dueDateEl.textContent = formatDate(task.dueDate);
    if (hoursEl) hoursEl.textContent = `${task.hours}h planned`;
    if (descEl) descEl.textContent = task.description || 'No description provided.';
    
    if (statusEl) {
        const statusDisplay = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'review': 'Review',
            'done': 'Done'
        };
        statusEl.textContent = statusDisplay[task.status] || task.status;
    }
    
    if (priorityEl) {
        priorityEl.textContent = task.priority.toUpperCase();
        priorityEl.className = `priority-badge priority-${task.priority}`;
    }

    const commentsContainer = document.getElementById('taskComments');
    if (commentsContainer) {
        if (task.comments && task.comments.length > 0) {
            commentsContainer.innerHTML = task.comments.map(comment => `
                <div class="comment">
                    <div class="comment-avatar">${comment.author[0]}</div>
                    <div class="comment-content">
                        <div class="comment-header">
                            <span class="comment-author">${escapeHtml(comment.author)}</span>
                            <span class="comment-time">${comment.time}</span>
                        </div>
                        <div class="comment-text">${escapeHtml(comment.text)}</div>
                    </div>
                </div>
            `).join('');
        } else {
            commentsContainer.innerHTML = '<p style="color: #888; text-align: center;">No comments yet</p>';
        }
    }

    lucide.createIcons();
    
    const viewModal = document.getElementById('viewTaskModal');
    if (viewModal) {
        viewModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editingId = id;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Task';
    
    const titleInput = document.getElementById('taskTitle');
    const descInput = document.getElementById('taskDescription');
    const projectSelect = document.getElementById('taskProject');
    const assigneeSelect = document.getElementById('taskAssignee');
    const prioritySelect = document.getElementById('taskPriority');
    const dueDateInput = document.getElementById('taskDueDate');
    const hoursInput = document.getElementById('taskHours');
    const statusSelect = document.getElementById('taskStatus');

    if (titleInput) titleInput.value = task.title;
    if (descInput) descInput.value = task.description || '';
    if (projectSelect) projectSelect.value = task.projectId;
    if (assigneeSelect) assigneeSelect.value = task.assigneeId || '';
    if (prioritySelect) prioritySelect.value = task.priority;
    if (dueDateInput) dueDateInput.value = task.dueDate;
    if (hoursInput) hoursInput.value = task.hours;
    
    if (statusElem) {
        const statusMap = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'review': 'Review',
            'done': 'Done'
        };
        statusElem.childNodes[0].nodeValue = statusMap[task.status] + ' ';
    }

    const modal = document.getElementById('taskModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.deleteTask = function(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const index = tasks.findIndex(t => t.id === id);
        if (index !== -1) {
            tasks.splice(index, 1);
            loadTasks();
            showNotification('Task deleted successfully', 'success');
        }
    }
};

window.toggleTaskStatus = function(id, completed) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.status = completed ? 'done' : 'todo';
        loadTasks();
        showNotification(`Task marked as ${completed ? 'completed' : 'pending'}`, 'success');
    }
};

window.dragStart = function(e) {
    const task = e.target.closest('.kanban-task');
    if (task) {
        e.dataTransfer.setData('text/plain', task.dataset.taskId);
        task.style.opacity = '0.5';
    }
};

window.dragEnd = function(e) {
    const task = e.target.closest('.kanban-task');
    if (task) task.style.opacity = '1';
};

function dragOver(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const column = e.target.closest('.kanban-column');
    
    if (column && taskId) {
        const newStatus = column.dataset.status;
        const task = tasks.find(t => t.id == taskId);
        if (task && task.status !== newStatus) {
            task.status = newStatus;
            loadTasks();
            showNotification('Task status updated', 'success');
        }
    }
}

function addComment() {
    const commentText = document.getElementById('newComment')?.value.trim();
    if (!commentText || !editingId) return;

    const task = tasks.find(t => t.id === editingId);
    if (task) {
        if (!task.comments) task.comments = [];
        task.comments.push({
            author: currentUser.name,
            time: 'Just now',
            text: commentText
        });
        
        const newComment = document.getElementById('newComment');
        if (newComment) newComment.value = '';
        
        window.viewTask(editingId);
        showNotification('Comment added', 'success');
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'success') {
    const oldNotification = document.querySelector('.notification');
    if (oldNotification) oldNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : 'info'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для новых элементов
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .back-to-projects {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: rgba(40, 98, 58, 0.15);
        border: 1px solid rgba(40, 98, 58, 0.3);
        border-radius: 40px;
        color: #a0e0b0;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        margin-bottom: 12px;
        transition: all 0.3s ease;
    }
    
    .back-to-projects:hover {
        background: rgba(40, 98, 58, 0.25);
        transform: translateX(-3px);
    }
    
    .back-to-projects i {
        width: 16px;
        height: 16px;
    }
    
    .tasks-header__left {
        display: flex;
        flex-direction: column;
    }
    
    .task-status {
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 11px;
        font-weight: 600;
        min-width: 80px;
        text-align: center;
    }
    
    .status-todo {
        background: rgba(107, 114, 128, 0.15);
        color: #9ca3af;
        border: 1px solid rgba(107, 114, 128, 0.3);
    }
    
    .status-in-progress {
        background: rgba(59, 130, 246, 0.15);
        color: #60a5fa;
        border: 1px solid rgba(59, 130, 246, 0.3);
    }
    
    .status-review {
        background: rgba(234, 179, 8, 0.15);
        color: #fbbf24;
        border: 1px solid rgba(234, 179, 8, 0.3);
    }
    
    .status-done {
        background: rgba(34, 197, 94, 0.15);
        color: #4ade80;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }
    
    .status-overdue {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
    }
`;
document.head.appendChild(additionalStyles);

function initProjectsLink() {
    const projectsBtn = document.getElementById('projectsLinkBtn');
    if (projectsBtn) {
        projectsBtn.addEventListener('click', () => {
            window.location.href = '../projects/index.html';
        });
    }
}