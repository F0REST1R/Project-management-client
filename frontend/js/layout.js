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
})

function initLogout(){

	const btn = document.getElementById("logoutBtn")

	if(!btn) return

	btn.onclick = () => {

		window.location.href =
		"../../auth/register.html"

	}

}

function initSidebarToggle(){

	const toggle =
		document.getElementById("sidebarToggle")

	const sidebar =
		document.querySelector(".sidebar")

	if(!toggle || !sidebar) return

	const savedState =
		localStorage.getItem("sidebar")

	if(savedState === "collapsed"){

		sidebar.classList.add("collapsed")

	}

	toggle.onclick = () => {

		sidebar.classList.toggle("collapsed")

		if(sidebar.classList.contains("collapsed")){

			localStorage.setItem(
				"sidebar",
				"collapsed"
			)

		}else{

			localStorage.setItem(
				"sidebar",
				"expanded"
			)

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