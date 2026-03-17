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

const form = document.getElementById("authForm")

const signupTab = document.getElementById("signupTab")
const loginTab = document.getElementById("loginTab")

const signupForm = document.getElementById("signupForm")
const loginForm = document.getElementById("loginForm")

const formTitle = document.getElementById("formTitle")
const submitBtn = document.getElementById("submitBtn")

const formError = document.getElementById("formError")

function showSignup(){

	signupTab.classList.add("tab--active")
	loginTab.classList.remove("tab--active")

	signupForm.style.display = "block"
	loginForm.style.display = "none"

	formTitle.innerText = "Create your account"

	submitBtn.innerText = "Create Account"

}

function saveUserData(userData) {
    localStorage.setItem('userData', JSON.stringify({
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        email: userData.email
    }));
}

function showLogin(){

	loginTab.classList.add("tab--active")
	signupTab.classList.remove("tab--active")

	signupForm.style.display = "none"
	loginForm.style.display = "block"

	formTitle.innerText = "Welcome back"

	submitBtn.innerText = "Log In"

}

signupTab.onclick = showSignup
loginTab.onclick = showLogin


function isValidEmail(email){

	const regex =
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/

	return regex.test(email)

}


form.addEventListener("submit", async (event)=>{

	event.preventDefault()

	formError.innerText = ""

	if(signupForm.style.display !== "none"){

		const firstName =
		document.getElementById("firstName").value

		const lastName =
		document.getElementById("lastName").value

		const email =
		document.getElementById("signupEmail").value

		const password =
		document.getElementById("signupPassword").value

		const confirm =
		document.getElementById("confirmPassword").value

		const role =
		document.querySelector(
			'input[name="role"]:checked'
		)?.value


		if(!isValidEmail(email)){
			formError.innerText =
			"Invalid email address"
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

		if(!role){
			formError.innerText =
			"Please select a role"
			return
		}


		try{

			const response =
			await fetch(
				"http://localhost:8080/api/auth/register",
				{
					method: "POST",

					headers:{
						"Content-Type":
						"application/json"
					},

					body: JSON.stringify({

						first_name: firstName,
						last_name: lastName,
						email: email,
						password: password,
						role: role

					})

				}
			)

			if(response.status === 201){

				alert("Account created")

				showLogin()

			}else{

				const error =
				await response.text()

				formError.innerText = error

			}

		}catch(err){

			formError.innerText =
			"Server connection error"

		}

	}else{

		const email =
		document.getElementById("loginEmail").value

		const password =
		document.getElementById("loginPassword").value

		try{

			const response =
			await fetch(
				"http://localhost:8080/api/auth/login",
				{
					method:"POST",

					headers:{
						"Content-Type":
						"application/json"
					},

					body: JSON.stringify({

						email: email,
						password: password

					})

				}
			)

			if (!response.ok) {
				formError.innerText = "Invalid credentials";
				return
			}

			const data = await response.json()

			// Сохраняем токен
			localStorage.setItem("token", data.token)

			// Если сервер возвращает данные пользователя вместе с токеном
			if (data.user) {
				saveUserData(data.user);
			}

			window.location.href = "../pages/dashboard/index.html"

		}catch(err){

			formError.innerText =
			"Server connection error"

		}

	}

})