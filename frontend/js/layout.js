async function loadLayout(){

	const sidebar = document.getElementById("sidebar")
	const header = document.getElementById("header")

	if(sidebar){

		const res = await fetch("../../components/sidebar.html")
		sidebar.innerHTML = await res.text()

	}

	if(header){

		const res = await fetch("../../components/header.html")
		header.innerHTML = await res.text()

	}

}

loadLayout().then(() => {

	setActiveNavigation()

	lucide.createIcons()

	initLogout()

	initSidebarToggle()

	loadUserScript()

	initDateTime()
})

function loadUserScript() {
	// Проверяем, что элементы header существуют
	const userNameElement = document.getElementById('userName');
	const userRoleElement = document.getElementById('userRole');
	
	if (userNameElement && userRoleElement) {
		// Если элементы уже есть, загружаем скрипт
		const script = document.createElement('script');
		script.src = '../../js/user-header.js';
		document.body.appendChild(script);
		console.log('User script loaded');
	} else {
		// Если элементов нет, ждем немного и пробуем снова
		console.log('Waiting for header elements...');
		setTimeout(loadUserScript, 50);
	}
}

function initLogout(){

	const btn = document.getElementById("logoutBtn")

	if(!btn) return

	btn.onclick = () => {

		window.location.href =
		"../../auth/register.html"

	}

}

function initSidebarToggle(){
    const toggle = document.getElementById("sidebarToggle")
    const sidebar = document.querySelector(".sidebar")

    if(!toggle || !sidebar) return

    const savedState = localStorage.getItem("sidebar")
    if(savedState === "collapsed"){
        sidebar.classList.add("collapsed")
    }

    toggle.onclick = () => {
        sidebar.classList.toggle("collapsed")
        
        if(sidebar.classList.contains("collapsed")){
            localStorage.setItem("sidebar", "collapsed")
        }else{
            localStorage.setItem("sidebar", "expanded")
        }
    }
}

function setActiveNavigation(){

	const path = window.location.pathname

	let currentPage = ""

	if(path.includes("dashboard")){
		currentPage = "dashboard"
	}

	if(path.includes("projects")){
		currentPage = "projects"
	}

	if(path.includes("project")){
		currentPage = "projects"
	}

	if(path.includes("clients")){
		currentPage = "clients"
	}
	
	const items =
		document.querySelectorAll(".sidebar__item")

	items.forEach(item => {

		if(item.dataset.page === currentPage){

			item.classList.add("sidebar__item--active")

		}

	})

}


// Добавьте эту функцию в layout.js
function initDateTime() {
    const weekdayElement = document.getElementById('currentWeekday');
    const dateElement = document.getElementById('currentDate');
    const timeElement = document.getElementById('currentTime');
    
    if (!weekdayElement || !dateElement || !timeElement) return;
    
    function updateDateTime() {
        const now = new Date();
        
        // День недели
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        weekdayElement.textContent = weekdays[now.getDay()];
        
        // Дата
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[now.getMonth()];
        const day = now.getDate();
        const year = now.getFullYear();
        dateElement.textContent = `${month} ${day}, ${year}`;
        
        // Время
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // 0 -> 12
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        timeElement.textContent = `${hours}:${minutes} ${ampm}`;
    }
    
    updateDateTime();
    setInterval(updateDateTime, 1000); // Обновляем каждую секунду
}
