// Importe la configuration
import { particlesConfig } from "./particles-config.js";
import { renderPongGame } from "./pong.js";
import { renderPongFourPlayers } from "./pongFourPlayers.js";
import { renderAuth } from "./auth.js";
import { fetchUserProfile } from "./auth.js";
// Fonction pour charger les particles
async function loadParticles() {
    if (typeof tsParticles === "undefined")
        return;
    await tsParticles.load({
        id: "tsparticles",
        options: particlesConfig
    });
}
class User {
    constructor(id, name, email, token) {
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
    console.log("🚀 initApp() called");
    loadParticles();
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName") || "";
    const userId = Number(localStorage.getItem("userId")) || -1;
    if (token) {
        history.pushState({ page: "auth" }, "", "/auth");
        renderAuth();
    }
    else {
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
            case "newId":
                renderPageNewId();
                break;
            case "id":
                renderPageId();
                break;
            case "pong":
                renderModeChoice();
                break;
            case "pong4p":
                renderPongFourPlayers();
                break;
            case "auth":
            case "log":
                renderAuth();
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
else {
    initApp();
}
function safePushState(state, title, url) {
    if (!isNavigatingFromHistory) {
        history.pushState(state, title, url);
    }
}
/**========================================================================
 *                           Page d'accueil
 *========================================================================**/
export async function renderHome() {
    console.log("🏠 renderHome() called");
    const app = document.getElementById("app");
    if (!app)
        return;
    const token = localStorage.getItem("user");
    console.log("🔐 Token check in renderHome:", !!token);
    if (await checkIfUserExists()) {
        console.log("Token Valide ✅");
        history.pushState({ page: "auth" }, "", "/auth");
        renderAuth();
        return;
    }
    else {
        console.log("Token invalide ❌ et supprimé");
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
            renderModeChoice();
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
    if (newId) {
        newId.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "newId" }, "", "/newId");
            renderPageNewId();
        });
    }
}
/**========================================================================
 *                           Page creation d utilisateur
 *========================================================================**/
function renderPageNewId() {
    const app = document.getElementById("app");
    if (!app)
        return;
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
			</div>

			<div>
			<label class="block text-gray-300 text-sm mb-1" for="username_in_tournaments">
			Pseudo en tournois
			</label>
			<input type="text" id="username_in_tournaments" placeholder="Nom definitif de tournoi"
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
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
    const form = document.getElementById("register-form");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const tournamentInput = document.getElementById("username_in_tournaments");
    const messageDiv = document.getElementById("error-message");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!usernameInput.value || !emailInput.value || !passwordInput.value) {
            messageDiv.textContent = "Tous les champs sont requis";
            return;
        }
        const payload = {
            username: usernameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };
        const tournament = tournamentInput.value.trim();
        if (tournament && (tournament.length < 3 && tournament.length > 0)) {
            messageDiv.textContent = "❌ Veuillez mettre au moins 3 charactère pour pseudo en tournois.";
            messageDiv.className = "text-red-400 text-sm mt-3";
            throw new Error("minlength for username_in_tournaments is 3.");
        }
        if (tournament && tournament.length >= 3)
            payload.username_in_tournaments = tournament;
        try {
            const res = await fetch("http://localhost:4000/v2/users/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error("Erreur lors de l’inscription");
            }
            const data = await res.json();
            console.log("Réponse API :", data);
            messageDiv.textContent = "✅ Nom d’utilisateur enregistré avec succès";
            messageDiv.className = "text-green-400 text-sm mt-3";
        }
        catch (err) {
            console.error(err);
            messageDiv.textContent = "❌ Impossible d’enregistrer ce nom d’utilisateur.";
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
    if (!app)
        return;
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
    console.log("Container trouvé ?", container);
    if (container) {
        const inputs = container.querySelectorAll("input[type='text']");
        console.log("2FA inputs found:", inputs.length);
        inputs.forEach((input, index) => {
            input.addEventListener("input", (e) => {
                const target = e.target;
                const value = target.value;
                if (!/^[0-9]$/.test(value)) {
                    target.value = "";
                    return;
                }
                if (index < inputs.length - 1 && value !== "") {
                    inputs[index + 1].focus();
                }
            });
            input.addEventListener("keydown", (e) => {
                const target = e.target;
                if (e.key === "Backspace" && !target.value && index > 0) {
                    inputs[index - 1].focus();
                }
            });
            input.addEventListener("paste", (e) => {
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
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const messageDiv = document.getElementById("error-message");
    const verify_two_fa = document.getElementById("div-verify-2fa");
    const confirm_two_fa = document.getElementById("confirm-2fa-code");
    //id par mdp
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!emailInput.value || !passwordInput.value) {
            messageDiv.textContent = "Veuillez saisir un mail valide et un mot de passe";
            return;
        }
        const payload = {
            email: emailInput.value.trim(),
            password: passwordInput.value.trim()
        };
        try {
            const res = await fetch("http://localhost:4000/v2/users/login", {
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
            console.log("✅ Connecté :", data);
            const is2faEnabled = !!data.twoFAToken;
            if (is2faEnabled === true)
                localStorage.setItem("twoFAToken", data.twoFAToken);
            else
                localStorage.setItem("token", data.accessToken);
            const user = await fetchUserProfile();
            if (user) {
                localStorage.setItem("user", JSON.stringify(user));
                console.log("👤 Utilisateur :", user);
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
        catch (err) {
            console.error("ERREUR DE LOGIN :", err);
            alert("Identifiants invalides");
        }
    });
    if (verify_two_fa && confirm_two_fa && messageDiv) {
        confirm_two_fa.addEventListener("click", async (e) => {
            e.preventDefault();
            // Récupère tous les inputs
            const container = document.querySelector("#div-verify-2fa");
            if (!container)
                return;
            const inputs = container.querySelectorAll("input[type='text']");
            // Concatène toutes les valeurs pour obtenir le code complet
            const code = Array.from(inputs)
                .map(input => input.value)
                .join("");
            console.log("Code 2FA saisi:", code);
            // Vérifie que le code est complet (6 chiffres)
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
                const res = await fetch("http://localhost:4000/v2/users/2fa/verify", {
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
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
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
            const popup = window.open("http://localhost:4000/v1/auth/google", "GoogleLogin", `width=${width},height=${height},left=${left},top=${top}`);
            function win(event) {
                if (event.origin !== "http://localhost:4000")
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
                        console.log("👤 Utilisateur :", user);
                    }
                    history.pushState({ page: "log" }, "", "/log");
                    renderAuth();
                    if (popup && !popup.closed)
                        popup.close();
                    window.removeEventListener("message", win);
                }
            }
            ;
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
            history.pushState({ page: "home" }, "", "/"); // remet l'URL
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
    }
    catch (error) {
        console.error("Erreur lors de la vérification:", error);
    }
}
/**========================================================================
 *                           Page pour jouer en tant qu'inviter
 *========================================================================**/
// choix du mode 1vs1 ou 1vd ia
function renderModeChoice() {
    const app = document.getElementById("app");
    if (!app)
        return;
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
        history.pushState({ page: "home" }, "", "/");
        renderHome();
    });
}
/**========================================================================
 *                           Choix lvl IA
 *========================================================================**/
function renderLvlChoice() {
    const app = document.getElementById("app");
    if (!app)
        return;
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
        history.pushState({ page: "easy" }, "", "/easy");
        renderLocalId1P(1);
    });
    document.getElementById("medium")?.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({ page: "meduim" }, "", "/medium");
        renderLocalId1P(2);
    });
    document.getElementById("hard")?.addEventListener("click", (e) => {
        e.preventDefault();
        history.pushState({ page: "hard" }, "", "/hard");
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
function renderLocalId1P(lvl) {
    const app = document.getElementById("app");
    if (!app)
        return;
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
        const player1 = document.getElementById("player1").value || "Player 1";
        const linkGame = document.getElementById("start-game");
        if (linkGame) {
            linkGame.addEventListener("click", (e) => {
                e.preventDefault();
                history.pushState({ page: "pong" }, "", "/pong");
                if (lvl === 1)
                    renderPongGame(player1, -1, "ai1", 1);
                if (lvl === 2)
                    renderPongGame(player1, -1, "ai2", 2);
                if (lvl === 3)
                    renderPongGame(player1, -1, "ai3", 3);
            });
        }
    });
    const backLink = document.getElementById("back-home");
    if (backLink) {
        backLink.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "home" }, "", "/"); // remet l'URL
            renderHome();
        });
    }
}
/**========================================================================
 *                           choix 1vs1 local
 *========================================================================**/
function renderLocalId2p() {
    const app = document.getElementById("app");
    if (!app)
        return;
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
        const player1 = document.getElementById("player1").value || "Player 1";
        const player2 = document.getElementById("player2").value || "Player 2";
        const linkGame = document.getElementById("start-game");
        if (linkGame) {
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
        });
    }
}
async function checkIfUserExists() {
    const token = localStorage.getItem("token"); // récupère ton JWT
    if (!token) {
        console.log("Aucun token trouvé dans localStorage");
        return false;
    }
    try {
        const res = await fetch("http://localhost:4000/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok) {
            // 401, 403, 404 → utilisateur inexistant ou token invalide
            console.log("Utilisateur inexistant ou token invalide :", res.status);
            localStorage.removeItem("token");
            return false;
        }
        const data = await res.json();
        console.log("Réponse du backend :", data);
        // Si le backend renvoie les données utilisateur → existe
        return true;
    }
    catch (err) {
        console.error("Erreur lors de la vérification de l'utilisateur :", err);
        return false;
    }
}
