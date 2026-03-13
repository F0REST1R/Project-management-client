const modal =
	document.getElementById("clientModal")

const openBtn =
	document.getElementById("openClientModal")

const closeBtn =
	document.getElementById("closeClientModal")

const createBtn =
	document.getElementById("createClientBtn")

const error =
	document.getElementById("clientError")

openBtn.onclick = () => {

	modal.style.display = "flex"

}

closeBtn.onclick = () => {

	modal.style.display = "none"

	resetErrors()

    resetForm()
}

function resetErrors(){

	error.innerText = ""

	document
	.querySelectorAll("input")
	.forEach(input=>{
		input.classList.remove("input-error")
	})

}

function isValidEmail(email){

	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

}

createBtn.onclick = () => {

	resetErrors()

	const name =
		document.getElementById("clientName")

	const inn =
		document.getElementById("clientInn")

	const email =
		document.getElementById("clientEmail")

	const phone =
		document.getElementById("clientPhone")

	if(name.value.trim().length < 2){

		error.innerText =
		"Company name is required"

		name.classList.add("input-error")

		return

	}

	if(!/^\d{10}$|^\d{12}$/.test(inn.value)){

		error.innerText =
		"INN must contain 10 or 12 digits"

		inn.classList.add("input-error")

		return

	}

	if(email.value === "" && phone.value === ""){

		error.innerText =
		"Enter email or phone"

		email.classList.add("input-error")

		phone.classList.add("input-error")

		return

	}

	if(email.value && !isValidEmail(email.value)){

		error.innerText =
		"Invalid email format"

		email.classList.add("input-error")

		return

	}

	alert("Client created")

    window.dispatchEvent(
        new Event("clientCreated")
    )

    resetForm()

	modal.style.display = "none"

}

function resetForm(){

	document.getElementById("clientName").value = ""
	document.getElementById("clientInn").value = ""
	document.getElementById("clientEmail").value = ""
	document.getElementById("clientPhone").value = ""

	document.getElementById("clientStage").selectedIndex = 0

}

const dropdown =
document.getElementById("stageDropdown")

const selected =
dropdown.querySelector(".dropdown-selected")

const items =
dropdown.querySelectorAll(".dropdown-item")

const menu =
dropdown.querySelector(".dropdown-menu")

selected.onclick = () => {

	menu.style.display =
	menu.style.display === "block"
	? "none"
	: "block"

}

items.forEach(item => {

	item.onclick = () => {

		selected.childNodes[0].nodeValue =
		item.dataset.value + " "

		menu.style.display = "none"

	}

})

