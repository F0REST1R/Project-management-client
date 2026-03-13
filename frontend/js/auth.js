const cards = [
	"Fast project management",
	"Real-time task tracking",
	"Built for small teams",
	"Secure cloud storage",
	"Simple and powerful interface"
]

const track = document.querySelector(".carousel__track")

let centerIndex = 2

function renderCards(){

	track.innerHTML = ""

	const leftIndex =
	(centerIndex - 1 + cards.length) % cards.length

	const rightIndex =
	(centerIndex + 1) % cards.length

	const visible = [
		cards[leftIndex],
		cards[centerIndex],
		cards[rightIndex]
	]

	visible.forEach((text, index)=>{

		const div = document.createElement("div")

		div.classList.add("card")

		if(index === 1){
			div.classList.add("card--active")
		}

		div.innerText = text

		track.appendChild(div)

	})

}

function rotateCards(){

	centerIndex =
	(centerIndex + 1) % cards.length

	renderCards()

}

renderCards()

setInterval(rotateCards,5000)

const signupTab = document.getElementById("signupTab")
const loginTab = document.getElementById("loginTab")

const signupForm = document.getElementById("signupForm")
const loginForm = document.getElementById("loginForm")

const formTitle = document.getElementById("formTitle")
const submitBtn = document.getElementById("submitBtn")

const switchText = document.getElementById("switchText")
const switchLink = document.getElementById("switchLink")

function showSignup(){

	signupTab.classList.add("tab--active")
	loginTab.classList.remove("tab--active")

	signupForm.style.display = "block"
	loginForm.style.display = "none"

	formTitle.innerText = "Create your account"

	submitBtn.innerText = "Create Account"

	switchText.innerHTML =
	'Already have an account? <span id="switchLink">Log in</span>'

	addSwitchListener()

}

function showLogin(){

	loginTab.classList.add("tab--active")
	signupTab.classList.remove("tab--active")

	signupForm.style.display = "none"
	loginForm.style.display = "block"

	formTitle.innerText = "Welcome back"

	submitBtn.innerText = "Log In"

	switchText.innerHTML =
	'Don’t have an account? <span id="switchLink">Sign up</span>'

	addSwitchListener()

}

signupTab.onclick = showSignup
loginTab.onclick = showLogin

function addSwitchListener(){

	const link = document.getElementById("switchLink")

	if(link.innerText === "Log in"){
		link.onclick = showLogin
	}else{
		link.onclick = showSignup
	}

}

addSwitchListener()

function isValidEmail(email){

	const regex =
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/

	return regex.test(email)

}

const formError =
document.getElementById("formError")

submitBtn.onclick = () => {

	formError.innerText = ""

	if(signupForm.style.display !== "none"){

		const email =
		document.getElementById("signupEmail").value

		const password =
		document.getElementById("signupPassword").value

		const confirm =
		document.getElementById("confirmPassword").value

		if(!isValidEmail(email)){
			formError.innerText = "Invalid email address"
			return
		}

		if(password.length < 6){
			formError.innerText =
			"Password must be at least 6 characters"
			return
		}

		if(password !== confirm){
			formError.innerText =
			"Passwords do not match"
			return
		}

		alert("Account created!")

	}else{

		const email =
		document.getElementById("loginEmail").value

		if(!isValidEmail(email)){
			formError.innerText = "Invalid email address"
			return
		}

		alert("Login successful")

	}

}

document
.querySelectorAll(".toggle-password")
.forEach(icon => {

	icon.onclick = () => {

		const input =
		document.getElementById(
			icon.dataset.target
		)

		if(input.type === "password"){
			input.type = "text"
		}else{
			input.type = "password"
		}

	}

})