document.addEventListener("DOMContentLoaded", () => {

	const modal =
	document.getElementById("projectModal")

	const openBtn =
	document.getElementById("openProjectModal")

	const closeBtn =
	document.getElementById("closeProjectModal")

	const createBtn =
	document.getElementById("createProjectBtn")

	const error =
	document.getElementById("projectError")

	const clientSelect =
	document.getElementById("projectClient")

    const statusDropdown =
    document.getElementById("statusDropdown")

    const statusSelected =
    statusDropdown.querySelector(".dropdown-selected")

    const statusMenu =
    statusDropdown.querySelector(".dropdown-menu")

    const statusItems =
    statusDropdown.querySelectorAll(".dropdown-item")

    let statusValue = "initiation"

    createClientBtn.onclick = (e) => {

        e.preventDefault()

        const clientModal =
        document.getElementById("clientModal")

        if(clientModal){

            clientModal.style.display = "flex"

        }

    }
    document
    .getElementById("closeClientModal")
    .addEventListener("click", () => {

        document
        .getElementById("clientModal")
        .style.display = "none"

    })


    window.addEventListener("clientCreated", () => {

        loadClients()

        const clients =
        JSON.parse(localStorage.getItem("clients"))

        const lastClient =
        clients[clients.length - 1]

        clientSelect.value = lastClient.id

    })
  

    statusSelected.onclick = () => {

        statusMenu.style.display =
        statusMenu.style.display === "block"
        ? "none"
        : "block"

    }

    statusItems.forEach(item => {

        item.onclick = () => {

            statusValue = item.dataset.value

            statusSelected.childNodes[0].nodeValue =
            item.innerText + " "

            statusMenu.style.display = "none"

        }

    })
    


	function loadClients(){

		const clients =
		JSON.parse(localStorage.getItem("clients")) || []

		clientSelect.innerHTML = ""

		if(clients.length === 0){

			const option =
			document.createElement("option")

			option.innerText = "No clients yet"

			option.disabled = true

			clientSelect.appendChild(option)

			return
		}

		clients.forEach(client => {

			const option =
			document.createElement("option")

			option.value = client.id

			option.innerText = client.name

			clientSelect.appendChild(option)

		})

	}


	function resetForm(){

		document.getElementById("projectName").value = ""

		document.getElementById("projectEnd").value = ""

		error.innerText = ""

	}


	openBtn.addEventListener("click", () => {

		loadClients()

		document.getElementById("projectStart").value =
		new Date().toISOString().split("T")[0]

		modal.style.display = "flex"

	})


	closeBtn.addEventListener("click", () => {

		modal.style.display = "none"

		resetForm()

	})


	createBtn.addEventListener("click", () => {

		error.innerText = ""

		const name =
		document.getElementById("projectName").value.trim()

		const client =
		document.getElementById("projectClient").value

		const manager =
		document.getElementById("projectManager").value

		const start =
		document.getElementById("projectStart").value

		const end =
		document.getElementById("projectEnd").value

		const status = statusValue



		if(name.length < 3){

			error.innerText =
			"Project name must be longer than 3 characters"

			return

		}


		if(!client){

			error.innerText =
			"Please select a client"

			return

		}


		const today =
		new Date().toISOString().split("T")[0]


		if(start > today){

			error.innerText =
			"Start date cannot be in the future"

			return

		}


		if(end && end <= start){

			error.innerText =
			"End date must be greater than start date"

			return

		}


		const projects =
		JSON.parse(localStorage.getItem("projects")) || []


		const newProject = {

			id: Date.now(),

			name,

			clientId: client,

			managerId: manager,

			startDate: start,

			endDate: end || null,

			status,

			archived:false

		}


		projects.push(newProject)


		localStorage.setItem(
			"projects",
			JSON.stringify(projects)
		)


		alert("Project created successfully")

		modal.style.display = "none"

		resetForm()

	})


    const archiveBtn =
    document.getElementById("viewArchive")

    if(archiveBtn){

        archiveBtn.addEventListener("click", () => {

            const projects =
            JSON.parse(localStorage.getItem("projects")) || []

            const archived =
            projects.filter(p => p.archived)

            console.log("Archived projects:", archived)

        })

    }

    createClientBtn.onclick = (e) => {

        e.preventDefault()

        const clientModal =
        document.getElementById("clientModal")

        if(clientModal){

            clientModal.style.display = "flex"

        }

    }


	window.addEventListener("click", (e) => {

		if(e.target === modal){

			modal.style.display = "none"

		}

	})

})
