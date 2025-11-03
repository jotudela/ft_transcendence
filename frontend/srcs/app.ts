// Déclaration des types pour tsparticles
declare const tsParticles: any;

// Importe la configuration
import { particlesConfig } from "./particles-config.js";
import { renderPongGame } from "./pong.js";
import { renderTournament } from "./tournament.js";
import { renderPongFourPlayers } from "./pongFourPlayers.js";
import { renderAuth } from "./auth.js";
import { fetchUserProfile } from "./auth.js";
import { renderLvl } from "./auth.js";
import { renderPlayer2Login } from "./auth.js";
import { renderSettings } from "./settings.js";
import { renderFriends } from "./friends.js";
import { gestTournament } from "./tournament.js";




// Fonction pour charger les particles
async function loadParticles() {
	if (typeof tsParticles === "undefined") return;
	
	await tsParticles.load({
	id: "tsparticles",
	options: particlesConfig
	});
}

class User {
	id: number;
	name: string;
	email: string;
	token: string;

	constructor(id: number, name: string, email: string, token: string) 
	{
		this.id = id;
		this.name = name;
		this.email = email;
		this.token = token;
	}
}

let isNavigatingFromHistory = false;



/**========================================================================
 *                           Initialisation
 *========================================================================**/
function initApp() {
	loadParticles();

	const token = localStorage.getItem("accessToken");
	const userName = localStorage.getItem("userName") || "";
	const userId = Number(localStorage.getItem("userId")) || -1;

	if (token) {
		history.pushState({ page: "auth" }, "", "/auth");
		renderAuth();
	} else {
		history.pushState({ page: "home" }, "", "/");
		renderHome();
	}



window.addEventListener("popstate", (e) => {
	isNavigatingFromHistory = true;
	const state = e.state;

	if (!state) {
		renderHome();
		isNavigatingFromHistory = false;
		return;
	}

    switch (state.page) {
        case "home":
            renderHome();
            break;
        case "id":
            renderLvl(state.playerName, state.playerId);
            break;
        case "easy":
        case "medium":
        case "hard":
            renderPongGame(state.playerName, state.playerId, `ai${state.level}`, state.level);
            break;
        case "id2":
            renderPlayer2Login(state.playerName, state.playerId);
            break;
    	case "tournament":
            renderTournament(state.hostName, state.hostId);
            break;
        case "gestTournament":
            gestTournament(state.players, state.tournamentName);
        	break;
        case "auth":
        case "log":
            renderAuth();
            break;
        case "settings":
            renderSettings();
            break;
        case "friends":
            renderFriends();
            break;
		default:
			renderHome();
			break;
	}

	isNavigatingFromHistory = false;
});
}



if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", initApp);
} 
else 
{
		initApp();
}


function safePushState(state: any, title: string, url: string) {
	if (!isNavigatingFromHistory) {
		history.pushState(state, title, url);
	}
}

/**========================================================================
 *                           Page d'accueil
 *========================================================================**/


export async function renderHome() {
	const app = document.getElementById("app");
	if (!app) return;

	const token = localStorage.getItem("user");
	if (await checkIfUserExists()){
		history.pushState({ page: "auth" }, "", "/auth");
		renderAuth(); 
		return;
	}
	else{
		localStorage.removeItem("token");
		localStorage.removeItem("user");
	}
	
	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
		<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		<div class="text-center mb-6">
			<div class="text-4xl text-gray-400 mb-1">
			Bienvenue sur 
			</div>
			<h1 class="text-7xl font-black text-white mb-4 tracking-widest">
			PONG
			</h1>
		</div>

		<div class="space-y-2 text-center">
			<button id="link-id" class="w-full bg-sky-800 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Identifiez vous
			</button>
			<button id="new-id" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Créez votre compte
			</button>
			<button id="invite-id" class="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Continuer en tant qu'invité
			</button>
			<button id="invite-id4p" class="w-full bg-sky-300 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode 4 joueurs
			</button>
		</div>
		</div>
	</div>
	`;

	const link = document.getElementById("link-id");
	if (link) {
		link.addEventListener("click", (e) => {
		e.preventDefault();
		history.pushState({ page: "id" }, "", "/id"); // change l'URL
		renderPageId();
	});
	}

	const invite = document.getElementById("invite-id");
	if (invite) {
		invite.addEventListener("click", (e) => {
		e.preventDefault();
		history.pushState({ page: "pong" }, "", "/pong");
		renderModeChoice()
	});
	}

	const invite4p = document.getElementById("invite-id4p");
	if (invite4p) {
		invite4p.addEventListener("click", (e) => {
		e.preventDefault();
		history.pushState({ page: "pong4p" }, "", "/pongFourPlayers");
		renderPongFourPlayers();
	});
	}

	const newId = document.getElementById("new-id");
	if (newId){
		newId.addEventListener("click", (e) =>{
			e.preventDefault();
			history.pushState({ page: "newId"}, "", "/newId");
			renderPageNewId()
		})

	}
}

/**========================================================================
 *                           Page creation d utilisateur
 *========================================================================**/

function renderPageNewId(){
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
		<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		<div class="text-center mb-6">
			<h1 class="text-3xl font-bold text-white mb-2">Créer un compte</h1>
			<p class="text-gray-300 text-sm mb-4">Remplissez vos informations</p>
		</div>

		<form id="register-form" class="space-y-4">
			<div>
			<label class="block text-gray-300 text-sm mb-1" for="username">
			Nom d’utilisateur
			</label>
			<input type="text" id="username" placeholder="ID" required
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<div>
			<label class="block text-gray-300 text-sm mb-1" for="email">
			Email
			</label>
			<input type="email" id="email" placeholder="votre@email.com" required
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<div>
			<label class="block text-gray-300 text-sm mb-1" for="password">
			Mot de passe
			</label>
			<input type="password" id="password" placeholder="••••••••" required
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			<p id="password-feedback" class="text-sm mt-1 text-red-400"></p>
			</div>

			<div>
			<label class="block text-gray-300 text-sm mb-1" for="username_in_tournaments">
			Pseudo en tournois
			</label>
			<input type="text" id="username_in_tournaments" placeholder="Nom definitif de tournoi"
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<div>
				<label class="block text-gray-300 text-sm mb-1">
					Choisir un avatar
				</label>

				<button type="button" id="choose-avatar-btn"
					class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
					Choisir une image
				</button>

				<input type="file" id="avatar" accept="image/png, image/jpeg, image/webp" class="hidden" />

				<div class="mt-3">
					<img id="avatar-preview" src="" alt="Prévisualisation de l’avatar"
						class="hidden mx-auto w-24 h-24 object-cover rounded-full mb-4 border-4 border-sky-500" />
				</div>
			</div>

			<button type="submit"
			class="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Créer un compte
			</button>
		</form>

		<div id="error-message" class="text-red-400 text-sm mt-3 hidden"></div>

		<div class="mt-4 text-center">
			<a href="/" id="link-home" class="text-gray-300 text-sm underline hover:text-white">
			← Retour
			</a>
		</div>
		</div>
	</div>
	`;

	const form = document.getElementById("register-form") as HTMLFormElement;
 	const usernameInput = document.getElementById("username") as HTMLInputElement;
 	const emailInput = document.getElementById("email") as HTMLInputElement;
 	const passwordInput = document.getElementById("password") as HTMLInputElement;
	const feedback = document.getElementById("password-feedback") as HTMLInputElement | null;
 	const tournamentInput = document.getElementById("username_in_tournaments") as HTMLInputElement;
	const messageDiv = document.getElementById("error-message") as HTMLDivElement;
	const avatarInput = document.getElementById("avatar") as HTMLInputElement | null;
	const chooseBtn = document.getElementById("choose-avatar-btn") as HTMLButtonElement | null;
	const preview = document.getElementById("avatar-preview") as HTMLImageElement | null;

	if (passwordInput && feedback) {
		passwordInput.addEventListener("input", () => {
			const password = passwordInput.value;
			const errors = [];
	
			if (password.length < 8)
				errors.push("❌ Minimum 8 caractères requis");
			if (password.length > 64)
				errors.push("❌ Maximum 64 caractères autorisés");
	
			if (!/[a-z]/.test(password))
				errors.push("❌ Doit contenir au moins une lettre minuscule");
			if (!/[A-Z]/.test(password))
				errors.push("❌ Doit contenir au moins une lettre majuscule");
			if (!/\d/.test(password))
				errors.push("❌ Doit contenir au moins un chiffre");
			if (!/[@$!%*?&]/.test(password))
				errors.push("❌ Un caractère spécial requis (@ $ ! % * ? &)");
	
			if (errors.length === 0) {
				feedback.textContent = "✅ Mot de passe valide";
				feedback.classList.remove("text-red-400");
				feedback.classList.add("text-green-400");
			}
			else {
				feedback.innerHTML = errors.join("<br>");
				feedback.classList.remove("text-green-400");
				feedback.classList.add("text-red-400");
			}
			if (password.length === 0) {
				feedback.classList.remove("text-green-400");
				feedback.classList.remove("text-red-400");
				feedback.textContent = "";
			}
		});
	}

	if (chooseBtn && avatarInput && preview) {
		chooseBtn.addEventListener("click", () => avatarInput.click());

		avatarInput.addEventListener("change", (event: Event) => {
			const target = event.target as HTMLInputElement | null;
			if (!target?.files?.length) {
				preview.src = "";
				preview.classList.add("hidden");
				return;
			}

			const file = target.files[0];

			const reader = new FileReader();
			reader.onload = (e) => {
				const result = e.target?.result;
				if (typeof result === "string") {
					preview.src = result;
					preview.classList.remove("hidden");
				}
			};
			reader.readAsDataURL(file);
		});
	}
	
	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		
		if (!usernameInput.value || !emailInput.value || !passwordInput.value) {
			messageDiv.textContent = "Les champs <Nom d'utilisateur>, <Email> et <Mot de passe> sont requis";
			return;
		}

		const payload: any = {
			username: usernameInput.value.trim(),
			email: emailInput.value.trim(),
			password: passwordInput.value.trim()
		}

		const tournament = tournamentInput.value.trim();
		if (tournament && (tournament.length < 3 && tournament.length > 0)) {
			messageDiv.textContent = "❌ Veuillez mettre au moins 3 charactère pour pseudo en tournois.";
			messageDiv.className = "text-red-400 text-sm mt-3";
			throw new Error("minlength for username_in_tournaments is 3.");
		}
		if (tournament && tournament.length >= 3)
			payload.username_in_tournaments = tournament;

		try {
			const res = await fetch("/api-auth/v2/users/register", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			throw new Error("Erreur lors de l’inscription");
		}

		const data = await res.json();
		localStorage.setItem("token", data.accessToken);
		const user = await fetchUserProfile();
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
		}

		messageDiv.textContent = "✅ Nom d’utilisateur enregistré avec succès";
		messageDiv.className = "text-green-400 text-sm mt-3";

		if (avatarInput?.files?.length) {
			const token = localStorage.getItem("token");
			const fileInput = document.getElementById("avatar") as HTMLInputElement | null;
			const file = fileInput?.files?.[0];

			if (!file) {
			console.error("Aucun fichier sélectionné");
			return;
			}

			// Crée un FormData pour envoyer le fichier
			const formData = new FormData();
			formData.append("avatar", file);
			try {
			const token = localStorage.getItem("token");
			const avatarRes = await fetch("/api-auth/v2/users/avatar", {
				method: "PUT",
				headers: {
					"Authorization": `Bearer ${token}`,
				},
				body: formData
			});
			if (!avatarRes.ok)
				throw new Error("Erreur upload avatar");

			const data = await avatarRes.json();
			localStorage.setItem("token", data.accessToken);
			const user = await fetchUserProfile();
			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
			}

			messageDiv.textContent = "✅ Compte et avatar enregistrés !";
			messageDiv.className = "text-green-400 text-sm mt-3";
			}
			catch (avatarErr) {
			console.error("❌ Erreur avatar :", avatarErr);
			messageDiv.textContent = "⚠️ Compte créé, mais échec de l’envoi de l’avatar.";
			messageDiv.className = "text-yellow-400 text-sm mt-3";
			}
		}
		} 
		catch (err) {
			console.error(err);
			messageDiv.textContent = "❌ Nom du'utilisateur ou mail déjà utilisé.";
			messageDiv.className = "text-red-400 text-sm mt-3";
		}
		});
	
	const backLink = document.getElementById("link-home");
	if (backLink) {
		backLink.addEventListener("click", (e) => {
		e.preventDefault();
		safePushState({ page: "home" }, "", "/"); 
		renderHome();
	});
	}

}


/**========================================================================
 *                           Page d'identification
 *========================================================================**/

function renderPageId() {
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
		<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		<div class="text-center mb-6">
			<h1 class="text-3xl font-bold text-white mb-2">Connexion</h1>
			<p class="text-gray-300 text-sm mb-4">Entrez vos identifiants</p>
		</div>

		<form id="login-form" class="space-y-4">
			<div>
			<label class="block text-gray-300 text-sm mb-1" for="email">Email</label>
			<input type="email" id="email" placeholder="votre@email.com" required
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<div>
			<label class="block text-gray-300 text-sm mb-1" for="password">Mot de passe</label>
			<input type="password" id="password" placeholder="••••••••" required
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<button type="submit"
			class="w-full  bg-sky-800 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Connexion
			</button>
		</form>

		<div class="hidden" id="div-verify-2fa">
			<div class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-md p-6 flex flex-col items-center gap-4">
				<p class="text-red-400 text-center">
				Entrez le code à <strong>6 chiffres</strong> généré par votre application <strong>Authenticator</strong> :
				</p>

				<!-- Champs de saisie du code -->
				<div class="flex justify-center gap-3">
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				<input type="text" maxlength="1" class="w-12 h-14 text-center text-2xl font-semibold text-white bg-gray-900 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600" />
				</div>

				<p class="text-gray-400 text-sm italic mt-2">// code à 6 chiffres à récupérer depuis l’appli, puis à rentrer pour valider la configuration 2FA</p>

				<!-- Bouton de validation -->
				<button id="confirm-2fa-code" class="bg-sky-700 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition mt-3">
				Valider le code
				</button>
			</div>
		</div>

		<!-- Divider -->
		<div class="flex items-center my-6">
			<hr class="flex-grow border-gray-600">
			<span class="px-2 text-gray-400 text-sm">ou</span>
			<hr class="flex-grow border-gray-600">
		</div>

		<!-- Bouton Google -->
		<button id="google-login" 
			class="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
			<img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" class="w-5 h-5">
			Continuer avec Google
		</button>

		<div id="error-message" class="text-red-400 text-sm mt-3 hidden"></div>

		<div class="mt-4 text-center">
			<a href="/" id="link-home" class="text-gray-300 text-sm underline hover:text-white">← Retour</a>
		</div>
		</div>
	</div>
	`;

	// Gestion des cases
    const container = document.querySelector("#div-verify-2fa");

    if (container) {
        const inputs = container.querySelectorAll<HTMLInputElement>("input[type='text']");

        inputs.forEach((input, index) => {
            input.addEventListener("input", (e: Event) => {
                const target = e.target as HTMLInputElement;
                const value = target.value;

                if (!/^[0-9]$/.test(value)) {
                    target.value = "";
                    return;
                }

                if (index < inputs.length - 1 && value !== "") {
                    inputs[index + 1].focus();
                }
            });

            input.addEventListener("keydown", (e: KeyboardEvent) => {
                const target = e.target as HTMLInputElement;
                if (e.key === "Backspace" && !target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });

            input.addEventListener("paste", (e: ClipboardEvent) => {
                e.preventDefault();
                const paste = e.clipboardData?.getData("text").replace(/\D/g, "") ?? "";
                paste.split("").forEach((char, i) => {
                    if (index + i < inputs.length) {
                        inputs[index + i].value = char;
                    }
                });
                const nextIndex = Math.min(index + paste.length, inputs.length - 1);
                inputs[nextIndex].focus();
            });
        });
    }

	const form = document.getElementById("login-form") as HTMLFormElement;
	const emailInput = document.getElementById("email") as HTMLInputElement;
	const passwordInput = document.getElementById("password") as HTMLInputElement;
	const messageDiv = document.getElementById("error-message") as HTMLDivElement;
	const verify_two_fa = document.getElementById("div-verify-2fa");
	const confirm_two_fa = document.getElementById("confirm-2fa-code");

//id par mdp

	form.addEventListener("submit", async (e) => {
		e.preventDefault();

		if (!emailInput.value || !passwordInput.value){
			messageDiv.textContent = "Veuillez saisir un mail valide et un mot de passe"
			return;
		}
		
		const payload: any = {
			email: emailInput.value.trim(),
			password: passwordInput.value.trim()
		}

		try{
			const res = await fetch("/api-auth/v2/users/login",{
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
			});

		if (!res.ok) {
			let errorMsg = "Une erreur est survenue";
		if (res.status === 400)
			errorMsg = "Requête invalide";
		else if (res.status === 401) 
			errorMsg = "Email ou mot de passe incorrect";
		else if (res.status >= 500) 
			errorMsg = "Erreur serveur, veuillez réessayer plus tard";

		messageDiv.textContent = `❌ ${errorMsg}`;
		messageDiv.className = "text-red-400 text-sm mt-3";
		return;
		}

			const data = await res.json();

			const is2faEnabled = !!data.twoFAToken;

			if (is2faEnabled === true)
				localStorage.setItem("twoFAToken", data.twoFAToken);
			else
				localStorage.setItem("token", data.accessToken);
			const user = await fetchUserProfile();
			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
			}
			if (is2faEnabled === true) {
				verify_two_fa?.classList.remove("hidden");
				form.classList.add("hidden");
				return;
			}
			else {
				history.pushState({ page: "log" }, "", "/log");
				renderAuth();
			}
	
		} 
		catch (err){
			console.error("ERREUR DE LOGIN :", err)
			alert("Identifiants invalides");
		}

	});

	if (verify_two_fa && confirm_two_fa && messageDiv) {
		confirm_two_fa.addEventListener("click", async (e) => {
				e.preventDefault();

				const container = document.querySelector("#div-verify-2fa");
				if (!container) return;
				
				const inputs = container.querySelectorAll<HTMLInputElement>("input[type='text']");
				
				const code = Array.from(inputs)
					.map(input => input.value)
					.join("");
								
				if (code.length !== 6) {
					if (messageDiv) {
						messageDiv.textContent = "❌ Veuillez entrer les 6 chiffres du code.";
						messageDiv.classList.add("text-red-400");
						messageDiv.classList.remove("text-green-400");
						messageDiv.classList.remove("hidden");
					}
					return;
				}

				try {
					let token = localStorage.getItem("twoFAToken");
					if (!token) {
						console.error("❌ Aucun token trouvé");
						return;
					}
					
					const res = await fetch("/api-auth/v2/users/2fa/verify", {
						method: "POST",
						headers: {
							"Content-Type": "application/json"
						},
						body: JSON.stringify({ code: code, twoFAToken: token })
					});
					
					if (!res.ok) {
						throw new Error("Code invalide");
					}
					
					const data = await res.json();
					
					// Rafraîchit le profil utilisateur
					if (data.accessToken) {
						localStorage.setItem("token", data.accessToken);
						token = data.accessToken;
					}
					const profileRes = await fetch("/api-auth/v2/users/profile", {
						method: "GET",
						headers: {
							"Authorization": `Bearer ${token}`
						}
					});
					
					if (profileRes.ok) {
						const dbUser = await profileRes.json();
						localStorage.setItem("user", JSON.stringify(dbUser));
					}
					history.pushState({ page: "log" }, "", "/log");
					renderAuth();
				}
				catch (err) {
					console.error("Erreur lors de la vérification 2FA:", err);
					if (messageDiv) {
						messageDiv.textContent = "❌ Code invalide. Veuillez réessayer.";
						messageDiv.classList.add("text-red-400");
						messageDiv.classList.remove("text-green-400");
						messageDiv.classList.remove("hidden");
					}
					
					// Efface les inputs en cas d'erreur
					inputs.forEach(input => input.value = "");
					inputs[0].focus();
				}
		});
	}

// bouton google 
	const googleBtn = document.getElementById("google-login");
	if (googleBtn) {
	googleBtn.addEventListener("click", () => {
		const width = 600;
		const height = 600;
		const left = (screen.width - width) / 2;
		const top = (screen.height - height) / 2;

		const popup = window.open(
		"/api-auth/v1/auth/google",
		"GoogleLogin",
		`width=${width},height=${height},left=${left},top=${top}`
		);

		function win(event: any) {
		if (event.origin !== "https://localhost" && event.origin !== "https://localhost:8443")
			return;

		if (event.data?.error === "cancelled") {
			console.warn("❌ Connexion Google annulée par l'utilisateur");
			alert("Connexion Google annulée !");
			window.removeEventListener("message", win);
			return;
		}

		const { token } = event.data;
		if (token) {
			localStorage.setItem("token", token);
			const user = fetchUserProfile();
			if (user) {
				localStorage.setItem("user", JSON.stringify(user));
			}
			history.pushState({ page: "log" }, "", "/log");
    		renderAuth();
			if (popup && !popup.closed)
				popup.close();
			window.removeEventListener("message", win);
		}
		};

		window.addEventListener("message", win);

		const checkPopup = setInterval(() => {
		if (!popup || popup.closed) {
			clearInterval(checkPopup);
			checkAuthStatus();
			window.removeEventListener("message", win);
		}
		}, 500);
	});
	}

	const backLink = document.getElementById("link-home");
	if (backLink) {
	backLink.addEventListener("click", (e) => {
		e.preventDefault();
		safePushState({ page: "home" }, "", "/"); 
		renderHome();
	});
	}
}

//auth google
async function checkAuthStatus() {
	try {
		const token = localStorage.getItem("token");
		if (token) {
		const user = await fetchUserProfile();
		if (user) {
			localStorage.setItem("user", JSON.stringify(user));
			history.pushState({ page: "log" }, "", "/log");
			renderAuth();
		}
		}
	} catch (error) {
		console.error("Erreur lors de la vérification:", error);
	}
}


/**========================================================================
 *                           Page pour jouer en tant qu'inviter
 *========================================================================**/

// choix du mode 1vs1 ou 1vd ia
function renderModeChoice() {
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
	<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">

		<div class="text-center mb-6">
		<h2 class="text-3xl font-bold text-white mb-4">Choisis ton mode de jeu</h2>
		<p class="text-gray-400">Sélectionne un mode pour commencer</p>
		</div>

		<!-- BUTTONS -->
		<div class="space-y-3">
		<button id="btn-1vs1" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			🆚 Jouer à 2 (1 vs 1 local)
		</button>
		<button id="btn-ia" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			🤖 Jouer contre l'IA
		</button>
		<button id="back-home" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			← Retour
		</button>
		</div>
	</div>
	</div>
	`;

	document.getElementById("btn-1vs1")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "local-2p" }, "", "/local-2p");
	renderLocalId2p(); 
	});

	document.getElementById("btn-ia")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "local-ia" }, "", "/local-ia");
	renderLvlChoice(); 
	});

	document.getElementById("back-home")?.addEventListener("click", (e) => {
	e.preventDefault();
	safePushState({ page: "home" }, "", "/");
	renderHome();
	});
}

/**========================================================================
 *                           Choix lvl IA
 *========================================================================**/
function renderLvlChoice() {
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
	<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">

		<div class="text-center mb-6">
		<h2 class="text-3xl font-bold text-white mb-4">Choisis ton mode de jeu</h2>
		<p class="text-gray-400">Sélectionne un mode pour commencer</p>
		</div>

		<!-- BUTTONS -->
		<div class="space-y-3">
		<button id="easy" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode facile
		</button>
		<button id="medium" class="w-full bg-sky-400 hover:bg-sky-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode Moyen
		</button>
		<button id="hard" class="w-full bg-sky-200 hover:bg-sky-300 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode Difficle
		</button>
		<button id="back-home" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			← Retour
		</button>
		</div>
	</div>
	</div>
	`;
	document.getElementById("easy")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "easy", level: 1 }, "", "/easy");
	renderLocalId1P(1); 
	});

	document.getElementById("medium")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "medium", level: 2 }, "", "/medium");
	renderLocalId1P(2); 
	});

	document.getElementById("hard")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "hard", level: 3 }, "", "/hard");
	renderLocalId1P(3); 
	});

	document.getElementById("back-home")?.addEventListener("click", (e) => {
    e.preventDefault();
    history.pushState({ page: "home" }, "", "/");
    renderHome();
	});

}

/**========================================================================
 *                           INVITE NICKNAME ONE PLAYER
 *========================================================================**/

function renderLocalId1P(lvl: number){
const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
	<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		
		<div class="text-center mb-6">
		<h2 class="text-3xl font-bold text-white mb-4">Choisis tes pseudos</h2>
		<p class="text-gray-400">Vous jouez en tant qu'invités</p>
		</div>

<!-- FORMULAIRE -->
		<div class="space-y-4">
		<div>
			<label class="block text-gray-300 mb-1" for="player1">Nom du Joueur 1</label>
			<input id="player1" type="text" placeholder="Player 1"
			class="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
		</div>
		</div>

<!-- BUTTON -->
		<div class="mt-6 space-y-3">
		<button id="start-game" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Lancer la partie
		</button>
		<button id="back-home" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			← Retour
		</button>
		</div>
	</div>
	</div>
	`;

	document.getElementById("start-game")?.addEventListener("click", () => {
		const player1 = (document.getElementById("player1") as HTMLInputElement).value || "Player 1";
	const linkGame = document.getElementById("start-game");
	if (linkGame){
		linkGame.addEventListener("click", (e) => {
				e.preventDefault();
				history.pushState({ page: "pong" }, "", "/pong");
				if (lvl ===1)
					renderPongGame(player1, -1, "ai1", 1)
			if (lvl ===2)
					renderPongGame(player1, -1, "ai2", 2)
			if (lvl ===3)
					renderPongGame(player1, -1, "ai3", 3)
			});}
		});

	const backLink = document.getElementById("back-home");
	if (backLink) {
	backLink.addEventListener("click", (e) => {
		e.preventDefault();
		history.pushState({ page: "home" }, "", "/"); // remet l'URL
		renderHome();
	});}
}

/**========================================================================
 *                           choix 1vs1 local
 *========================================================================**/

function renderLocalId2p()
{
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
	<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		
		<div class="text-center mb-6">
		<h2 class="text-3xl font-bold text-white mb-4">Choisis tes pseudos</h2>
		<p class="text-gray-400">Vous jouez en tant qu'invités</p>
		</div>

<!-- FORMULAIRE -->
		<div class="space-y-4">
		<div>
			<label class="block text-gray-300 mb-1" for="player1">Nom du Joueur 1</label>
			<input id="player1" type="text" placeholder="Player 1"
			class="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
		</div>
		<div>
			<label class="block text-gray-300 mb-1" for="player2">Nom du Joueur 2</label>
			<input id="player2" type="text" placeholder="Player 2"
			class="w-full px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500"/>
		</div>
		</div>

<!-- BUTTON -->
		<div class="mt-6 space-y-3">
		<button id="start-game" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Lancer la partie
		</button>
		<button id="back-home" class="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			← Retour
		</button>
		</div>
	</div>
	</div>
	`;


	document.getElementById("start-game")?.addEventListener("click", () => {
    const player1 = (document.getElementById("player1") as HTMLInputElement).value || "Player 1";
    const player2 = (document.getElementById("player2") as HTMLInputElement).value || "Player 2";
    const linkGame = document.getElementById("start-game");
    if (linkGame){
        linkGame.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "pong" }, "", "/pong");
            renderPongGame(player1, -1, player2, -1);
        });
    }
	});

		
	const backLink = document.getElementById("back-home");
	if (backLink) {
	backLink.addEventListener("click", (e) => {
		e.preventDefault();
		history.pushState({ page: "home" }, "", "/"); // remet l'URL
		renderHome();
	});}
}

/**========================================================================
 *                           Check si l user existe
 *========================================================================**/

async function checkIfUserExists() {
    const tokenStr = localStorage.getItem("user");
    if (!tokenStr) return false;

    let user;
    try {
        user = JSON.parse(tokenStr);
    } catch {
        localStorage.removeItem("user");
        return false;
    }

    const token = user.accessToken;
    try {
        const res = await fetch("/api-game/v1/global_stats/all", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (res.status === 401 || res.status === 403 || res.status === 500) {
            localStorage.removeItem("user");
            return false;
        }

        if (!res.ok) {
            console.error("Erreur serveur stats :", res.status);
            return true; // Le token est valide, mais le serveur a planté
        }
        return true;
    } catch (err) {
        console.error("Erreur réseau :", err);
        return false;
    }
}
