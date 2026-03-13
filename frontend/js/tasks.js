const modal =
	document.getElementById("taskModal")

const openBtn =
	document.getElementById("openTaskModal")

const closeBtn =
	document.getElementById("closeTaskModal")

const createBtn =
	document.getElementById("createTaskBtn")

openBtn.onclick = () => {

	modal.style.display = "flex"

}

closeBtn.onclick = () => {

	modal.style.display = "none"

}

createBtn.onclick = () => {

	const title =
		document.getElementById("taskTitle").value

	const status =
		document.getElementById("taskStatus").value

	if(title.trim() === ""){

		alert("Enter task title")

		return

	}

	const column =
		document.querySelector(
			`[data-status="${status}"]`
		)

	const card =
		document.createElement("div")

	card.classList.add("task-card")

	card.setAttribute("draggable", "true")

	card.innerText = title

	column.appendChild(card)

	document.getElementById("taskTitle").value = ""

	modal.style.display = "none"

}