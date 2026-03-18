// clients.js

const modal = document.getElementById("clientModal")
const openBtn = document.getElementById("openClientModal")
const closeBtn = document.getElementById("closeClientModal")
const createBtn = document.getElementById("createClientBtn")
const error = document.getElementById("clientError")
const dropdown = document.getElementById("stageDropdown")
const selected = dropdown.querySelector(".dropdown-selected")
const items = dropdown.querySelectorAll(".dropdown-item")
const menu = dropdown.querySelector(".dropdown-menu")

// Открытие модального окна
openBtn.onclick = () => {
    modal.style.display = "flex"
    document.body.style.overflow = "hidden" // Блокируем скролл
}

// Закрытие модального окна
function closeModal() {
    modal.style.display = "none"
    document.body.style.overflow = "auto" // Возвращаем скролл
    resetErrors()
    resetForm()
    dropdown.classList.remove("active")
}

closeBtn.onclick = closeModal

// Закрытие по клику вне модального окна
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal()
    }
})

// Закрытие по ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === "flex") {
        closeModal()
    }
})

// Сброс ошибок
function resetErrors() {
    error.innerText = ""
    document.querySelectorAll("input").forEach(input => {
        input.classList.remove("input-error")
    })
}

// Валидация email
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Сброс формы
function resetForm() {
    document.getElementById("clientName").value = ""
    document.getElementById("clientInn").value = ""
    document.getElementById("clientEmail").value = ""
    document.getElementById("clientPhone").value = ""
    selected.childNodes[0].nodeValue = "Negotiation "
}

// Создание клиента
createBtn.onclick = () => {
    resetErrors()

    const name = document.getElementById("clientName")
    const inn = document.getElementById("clientInn")
    const email = document.getElementById("clientEmail")
    const phone = document.getElementById("clientPhone")
    const stage = selected.childNodes[0].nodeValue.trim()

    // Валидация
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

    // Здесь будет отправка на бэкенд
    console.log("Creating client:", {
        name: name.value,
        inn: inn.value,
        email: email.value,
        phone: phone.value,
        stage: stage
    })

    // Показываем успешное уведомление
    showNotification("Client created successfully!", "success")

    // Триггерим событие для обновления списка
    window.dispatchEvent(new CustomEvent("clientCreated", {
        detail: {
            name: name.value,
            inn: inn.value,
            email: email.value,
            phone: phone.value,
            stage: stage
        }
    }))

    resetForm()
    closeModal()
}

// Dropdown функционал
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

// Выбор элемента в dropdown
items.forEach(item => {
    item.onclick = (e) => {
        e.stopPropagation()
        selected.childNodes[0].nodeValue = item.dataset.value + " "
        dropdown.classList.remove("active")
        menu.style.display = "none"
    }
})

// Закрытие dropdown при клике вне
document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("active")
        menu.style.display = "none"
    }
})

// Функция для показа уведомлений
function showNotification(message, type = "success") {
    const notification = document.createElement("div")
    notification.className = `notification notification--${type}`
    notification.innerHTML = `
        <i data-lucide="${type === "success" ? "check-circle" : "alert-circle"}"></i>
        <span>${message}</span>
    `
    
    document.body.appendChild(notification)
    lucide.createIcons()
    
    setTimeout(() => {
        notification.classList.add("show")
    }, 10)
    
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

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
            stroke: #22c55e;
        }
    `
    document.head.appendChild(style)
}