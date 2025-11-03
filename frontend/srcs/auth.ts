
import { renderHome } from "./app.js";
import { renderPongGame } from "./pong.js";
import { renderFriends } from "./friends.js"

import { renderTournament } from "./tournament.js"
import { renderSettings } from "./settings.js"
import { showStats } from "./stats.js";

/**========================================================================
 *                           Accueil ID
 *========================================================================**/

export async function renderAuth(){
	const app = document.getElementById("app");
	if (!app) 
		return;

	const userData = localStorage.getItem("user");
	let user = null;

	if (userData) {
		user = JSON.parse(userData);
	}

	let userName = "Utilisateur";
	let userEmail = "";
	let userId = -1;

 	if (user && user.result) {
		if (user.result.username) {
				userName = user.result.username;
		} 
		if (user.result.email) {
				userEmail = user.result.email;
		}
		if (user.result.id) {
			userId = user.result.id;
		}
		}

	renderNavbar(userName);

	app.innerHTML = `
		<div class="h-screen flex items-center justify-center">
			<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md text-center">
				
				<!-- Avatar -->
				<img id="user-avatar"
					 alt="Avatar utilisateur" 
					 class="w-24 h-24 mx-auto object-cover rounded-full mb-4 border-4 border-sky-500"/>

				<h2 class="text-3xl font-bold text-white mb-2">
					Bienvenue ${userName}
				</h2>
				<h2 class="text-xl font-bold text-gray-300 mb-4">
					${userEmail}
				</h2>
				<p class="text-green-500 mb-6">✅ Vous êtes connectés</p>

				<!-- BUTTONS -->
				<div class="space-y-3">
					<button id="1vsAi" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
						1 joueur vs IA
					</button>
					<button id="1vs1" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
						1 vs 1 local
					</button>
					<button id="tournament" class="w-full bg-sky-400 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
						Créer votre tournoi
					</button>
				</div>
			</div>
		</div>
	`;

	await loadUserAvatar();

	const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;
	if (avatarImg) {
		if (!avatarImg.src)
			avatarImg.src = "/assets/avatar.png";
	}

	document.getElementById("1vsAi")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "id" }, "", "/id");
	renderLvl(userName, userId); 
	});

	document.getElementById("1vs1")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "id2" }, "", "/id2");
	renderPlayer2Login(userName, userId); 
	});

	document.getElementById("tournament")?.addEventListener("click", (e) => {
	e.preventDefault();
		history.pushState({ page: "tournament" }, "", "/tournament");
		renderTournament(userName, userId); 
	});
}


/**========================================================================
 *                           Load user avatar
 *========================================================================**/
async function loadUserAvatar() {
  const token = localStorage.getItem("token");
  const avatarImg = document.getElementById("user-avatar") as HTMLImageElement | null;

  if (!avatarImg)
	return;

  if (!token) {
    return;
  }

  try {
    const response = await fetch("/api-auth/v2/users/avatar/get_avatar_by_id", {
	  method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
	avatarImg.src = `data:${data.contentType};base64,${data.base64Image}`;
	localStorage.setItem("token", data.accessToken);

  } catch (err) {
    console.error("Erreur lors du chargement de l’avatar :", err);
  }
}

/**========================================================================
 *                           Login Player 2
 *========================================================================**/
export function renderPlayer2Login(player1Name: string, user1Id: number) {
	const app = document.getElementById("app");
	if (!app) return;

	app.innerHTML = `
	<div class="h-screen flex items-center justify-center">
		<div class="bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-10 backdrop-blur-md shadow-xl w-full max-w-md">
		
		<h2 class="text-3xl font-bold text-white mb-4 text-center">Joueur 2 - Connexion</h2>
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
			Se Connecter
			</button>
		</form>

		<!-- Divider -->
		<div class="flex items-center my-4">
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

		<button id="back-local" class="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md">← Retour</button>
		<div id="error-message" class="text-red-400 text-sm mt-2"></div>
		</div>
	</div>
	`;

	const form = document.getElementById("login-form") as HTMLFormElement;
	const emailInput = document.getElementById("email") as HTMLInputElement;
	const passwordInput = document.getElementById("password") as HTMLInputElement;
	const messageDiv = document.getElementById("error-message") as HTMLDivElement;

	form.addEventListener("submit", async (e) => {
	e.preventDefault();

	const payload = { 
		email: emailInput.value.trim(), 
		password: passwordInput.value.trim() 
	};

	try {
		const res = await fetch("/api-auth/v2/users/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			messageDiv.textContent = "Identifiants invalides";
			return;
		}
	
		const data = await res.json();
		const profileRes = await fetch("/api-auth/v2/users/profile", {
			method: "GET",
			headers: { 
				"Authorization": `Bearer ${data.accessToken}` 
			}
		});

		let player2Name = "Joueur 2";
		let user2Id = -1;
		if (profileRes.ok) {
			const profileData = await profileRes.json();
			player2Name = profileData.result.username;
			user2Id = profileData.result.id;
		}
		renderPongGame(player1Name, user1Id, player2Name, user2Id);
	} 
	catch (err) {
		console.error(err);
		messageDiv.textContent = "Erreur connexion";
	}
	});

	document.getElementById("back-local")?.addEventListener("click", () => {
	renderAuth();
	});

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

			async function win(event: any) {
				if (event.origin !== "https://localhost" && event.origin !== "https://localhost:8443")
					return;

				if (event.data?.error === "cancelled") {
					console.warn("❌ Connexion Google annulée par l'utilisateur");
					alert("Connexion Google annulée !");
					window.removeEventListener("message", win);
					if (popup && !popup.closed) popup.close();
					return;
				}

				const { token } = event.data;
				if (token) {
					try {
						const profileRes = await fetch("/api-auth/v2/users/profile", {
							method: "GET",
							headers: { "Authorization": `Bearer ${token}` }
						});

						if (profileRes.ok) {
							const profileData = await profileRes.json();
							const player2Name = profileData.result.username;
							const user2Id = profileData.result.id;
							renderPongGame(player1Name, user1Id, player2Name, user2Id);
						}
					} catch (err) {
						console.error("Erreur lors de la récupération du profil :", err);
					} finally {
						if (popup && !popup.closed) popup.close();
						window.removeEventListener("message", win);
					}
				}
			}
			window.addEventListener("message", win);

			const checkPopup = setInterval(() => {
				if (!popup || popup.closed) {
					clearInterval(checkPopup);
					window.removeEventListener("message", win);
				}
			}, 500);
		});
	}
}

/**========================================================================
 *                           Choix lvl avec ID
 *========================================================================**/
export function renderLvl(name: string, user1Id: number) {
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
		<button id="easy" class="w-full bg-sky-600 hover:bg-sky-800 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode facile
		</button>
		<button id="medium" class="w-full bg-sky-500 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
			Mode Moyen
		</button>
		<button id="hard" class="w-full bg-sky-400 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
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
    history.pushState({ page: "easy", level: 1, playerName: name, playerId: user1Id }, "", "/easy");
	renderPongGame(name, user1Id, "ai1", 1)});

	document.getElementById("medium")?.addEventListener("click", (e) => {
	e.preventDefault();
    history.pushState({ page: "medium", level: 2, playerName: name, playerId: user1Id }, "", "/medium");
	renderPongGame(name, user1Id, "ai2", 2); 
	});

	document.getElementById("hard")?.addEventListener("click", (e) => {
	e.preventDefault();
    history.pushState({ page: "hard", level: 3, playerName: name, playerId: user1Id }, "", "/hard");
	renderPongGame(name, user1Id, "ai3", 3); 
	});
	
	document.getElementById("back-home")?.addEventListener("click", (e) => {
	e.preventDefault();
	history.pushState({ page: "home" }, "", "/");
	renderAuth();
	});
}

/**========================================================================
 *                           Logout
 *========================================================================**/

function logout() {
	localStorage.removeItem("token");
	history.pushState({ page: "home" }, "", "/");
	renderHome();
	const nav = document.getElementById("navbar");
	if (nav) 
		nav.remove();
}

/**========================================================================
 *                           Recup User Profile
 *========================================================================**/
export async function fetchUserProfile() {
	const token = localStorage.getItem("token");
	if (!token) return null;

	try {
	const res = await fetch("/api-auth/v2/users/profile", {
		method: "GET",
		headers: {
		"Content-Type": "application/json",
		"Authorization": `Bearer ${token}`,
		},
	});

	if (!res.ok) {
		throw new Error("Impossible de récupérer le profil");
	}

	return await res.json();
	} catch (err) {
	console.error("Erreur profil utilisateur :", err);
	return null;
	}
}


/**========================================================================
 *                           Navbar connecte
 *========================================================================**/



export function renderNavbar(userName: string) {
	let nav = document.getElementById("navbar");
	if (!nav) {
		nav = document.createElement("div");
		nav.id = "navbar";
		nav.className = "fixed top-0 left-0 w-full flex justify-end items-center p-4 bg-gray-900 bg-opacity-70 backdrop-blur-md z-50";
		document.body.appendChild(nav);
	}

	nav.innerHTML = `
		<div class="relative flex items-center gap-2 text-gray-200 text-sm font-medium">
			<span class="w-3 h-3 rounded-full bg-green-500"></span>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
				stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
				<path stroke-linecap="round" stroke-linejoin="round" 
					d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 
					20.25a8.25 8.25 0 1115 0v.75H4.5v-.75z" />
			</svg>
			<span>${userName}</span>

			<!-- Dropdown trigger -->
			<button id="menu-toggle" class="ml-2 p-1 rounded hover:bg-gray-700">
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
					stroke-width="2" stroke="currentColor" class="w-4 h-4">
					<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
				</svg>
			</button>

			<!-- Dropdown menu -->
			<div id="dropdown-menu" 
				class="fixed top-16 right-4 w-40 bg-gray-800 text-white rounded shadow-lg hidden flex-col border border-gray-700"
				style="z-index: 99999;">				
			<button id="game-stat" class="px-4 py-2 hover:bg-gray-700 text-left w-full">
					GameStat
				</button>

				<button id="settings" class="px-4 py-2 hover:bg-gray-700 text-left w-full">
					Paramètres
				</button>

				<button id="friends" class="px-4 py-2 hover:bg-gray-700 text-left w-full">
					Ami(e)s
				</button>

				<button id="logout" class="px-4 py-2 hover:bg-gray-700 text-left w-full">
					Déconnexion
				</button>
			</div>
		</div>
	`;

	// Toggle dropdown
	const toggleBtn = document.getElementById("menu-toggle");
	const dropdown = document.getElementById("dropdown-menu");
	toggleBtn?.addEventListener("click", () => {
		dropdown?.classList.toggle("hidden");
	});

	// Gestion des boutons du menu
	document.getElementById("game-stat")?.addEventListener("click", () => {
		showStats();
		dropdown?.classList.add("hidden");
	});

	document.getElementById("settings")?.addEventListener("click", (e) => {
		dropdown?.classList.add("hidden");
		e.preventDefault();
		history.pushState({ page: "settings" }, "", "/settings");
		renderSettings();
	});

		document.getElementById("friends")?.addEventListener("click", (e) => {
		dropdown?.classList.add("hidden");
		e.preventDefault();
		history.pushState({ page: "friends" }, "", "/friends");
		renderFriends();
	});

	document.getElementById("logout")?.addEventListener("click", async () => {

		const userData = localStorage.getItem("user");
		let user = null;

		if (userData) {
			user = JSON.parse(userData);
		}

		const res = await fetch(`/api-auth/v2/users/to_offline/${user.result.id}`, {
			method: "POST"
		});

		if (res.ok === false)
			throw new Error("Can't chnage status of user");
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		logout();
	});
}
