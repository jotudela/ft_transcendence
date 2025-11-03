import { renderAuth } from "./auth.js";
;
let isHiddenGoogle = false;
let isHidden2fa = false;
/**========================================================================
 *                           Accueil Settings
 *========================================================================**/
export async function renderSettings() {
    const app = document.getElementById("app");
    if (!app)
        return;
    const userData = localStorage.getItem("user");
    let user = null;
    if (userData) {
        user = JSON.parse(userData);
        console.log("Objet user parsé :", user);
    }
    let userName = "Utilisateur";
    let userPassword = "";
    let userEmail = "";
    let userUsername_in_tournament = "";
    let userId = -1;
    let isGoogleUser = false;
    if (user && user.result) {
        if (user.result.username) {
            userName = user.result.username;
        }
        if (user.result.email) {
            userEmail = user.result.email;
        }
        if (user.result.password) {
            userPassword = user.result.password;
        }
        if (user.result.username_in_tournaments) {
            userUsername_in_tournament = user.result.username_in_tournaments;
        }
        if (user.result.id) {
            userId = user.result.id;
        }
        if (user.result.sub) {
            isGoogleUser = true;
        }
    }
    app.innerHTML = `
    <div class="h-screen flex items-center justify-center">
        <div class="flex bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-2xl p-10 backdrop-blur-md shadow-xl w-full max-w-5xl text-white">
        
        <!-- COLONNE GAUCHE : Boutons -->
        <div class="w-1/3 flex flex-col justify-start items-center pr-8 border-r border-gray-600">
            
            <button id="user-info" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
            Information utilisateur
            </button>
            <button id="security" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Sécurité
            </button>
        </div>

        <!-- COLONNE DROITE : Formulaire utilisateur -->
        <div class="w-2/3 pl-10">
            <form id="update-form" class="space-y-5">

            <div class="${isGoogleUser ? '' : 'hidden'}" role="status" aria-live="polite">
                <p class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
                    Pour modifier <strong>Nom d'utilisateur</strong> et <strong>Email</strong>, veuillez désynchroniser votre compte Google.
                </p>
            </div>

            <div class="${isGoogleUser ? 'hidden' : ''}">
                <label class="block text-gray-300 mb-1">
                Nom d’utilisateur
                </label>
                <input type="text" id="username" placeholder="${userName}"
                class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <div class="${isGoogleUser ? 'hidden' : ''}">
                <label class="block text-gray-300 mb-1">
                Email
                </label>
                <input type="email" id="email" placeholder=${userEmail}
                class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <div>
                <label class="block text-gray-300 mb-1">Mot de passe</label>
                <input type="password" id="password" placeholder="............"
                class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <div>
                <label class="block text-gray-300 mb-1">Pseudo en tournois</label>
                <input type="text" id="username_in_tournaments" placeholder="${userUsername_in_tournament}"
                class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-sky-500">
            </div>

            <div class="pt-4">
                <button type="submit" class="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-md transition-colors">
                Mettre à jour
                </button>
            </div>
            </form>

            <div id="error-message" class="text-sm mt-3 hidden"></div>

            <div class="mt-4 text-center">
                <a href="/" id="link-home" class="text-gray-300 text-sm underline hover:text-white">
                ← Retour
                </a>
            </div>
        </div>
        </div>
    </div>
    `;
    const form = document.getElementById("update-form");
    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const tournamentInput = document.getElementById("username_in_tournaments");
    const messageDiv = document.getElementById("error-message");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isGoogleUser) {
            if (!passwordInput.value && !tournamentInput.value) {
                messageDiv.textContent = "Un champ minimum requis.";
                messageDiv.className = "text-red-400 text-sm mt-3";
                messageDiv.classList.remove("hidden");
                return;
            }
        }
        if (!usernameInput.value && !emailInput.value && !passwordInput.value && !tournamentInput.value) {
            messageDiv.textContent = "Un champ minimum requis.";
            messageDiv.className = "text-red-400 text-sm mt-3";
            messageDiv.classList.remove("hidden");
            return;
        }
        const payload = {};
        if (usernameInput.value)
            payload.username = usernameInput.value.trim();
        if (emailInput.value)
            payload.email = emailInput.value.trim();
        if (passwordInput.value)
            payload.password = passwordInput.value.trim();
        const tournament = tournamentInput.value.trim();
        if (tournament) {
            if (tournament.length < 3) {
                messageDiv.textContent = "❌ Le pseudo en tournois doit contenir au moins 3 caractères.";
                messageDiv.classList.remove("hidden");
                messageDiv.classList.add("text-red-400");
                throw new Error("Pseudo en tournois trop court (<3 caractères)");
            }
            payload.username_in_tournaments = tournament;
        }
        else
            delete payload.username_in_tournaments;
        console.log("Constructed payload :", payload);
        try {
            let token = localStorage.getItem("token");
            if (!token) {
                console.error("❌ Aucun token trouvé dans localStorage");
                return;
            }
            if (payload.username) {
                const res = await fetch(`http://localhost:4000/v2/users/update/username/${user.result.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: payload.username }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur lors de la mise à jour du username: ${errText}`);
                }
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    token = data.accessToken;
                }
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!profileRes.ok) {
                    const errText = await profileRes.text();
                    throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                }
                const dbUser = await profileRes.json();
                if (dbUser)
                    localStorage.setItem("user", JSON.stringify(dbUser));
            }
            if (payload.email) {
                const res = await fetch(`http://localhost:4000/v2/users/update/email/${user.result.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: payload.email }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur lors de la mise à jour du username: ${errText}`);
                }
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    token = data.accessToken;
                }
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!profileRes.ok) {
                    const errText = await profileRes.text();
                    throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                }
                const dbUser = await profileRes.json();
                if (dbUser)
                    localStorage.setItem("user", JSON.stringify(dbUser));
            }
            if (payload.password) {
                const res = await fetch(`http://localhost:4000/v2/users/update/password/${user.result.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: payload.password }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur lors de la mise à jour du username: ${errText}`);
                }
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    token = data.accessToken;
                }
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!profileRes.ok) {
                    const errText = await profileRes.text();
                    throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                }
                const dbUser = await profileRes.json();
                if (dbUser)
                    localStorage.setItem("user", JSON.stringify(dbUser));
            }
            if (payload.username_in_tournaments) {
                const res = await fetch(`http://localhost:4000/v2/users/update/username_in_tournaments/${user.result.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: payload.username_in_tournaments }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur lors de la mise à jour du username: ${errText}`);
                }
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    token = data.accessToken;
                }
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!profileRes.ok) {
                    const errText = await profileRes.text();
                    throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                }
                const dbUser = await profileRes.json();
                if (dbUser)
                    localStorage.setItem("user", JSON.stringify(dbUser));
            }
            messageDiv.textContent = "✅ Nouvelles information enregistré avec succès";
            messageDiv.classList.add("text-green-400");
            messageDiv.classList.remove("text-red-400");
            messageDiv.classList.remove("hidden");
        }
        catch (err) {
            console.error(err);
            messageDiv.textContent = "❌ Impossible d’enregistrer de nouvelles informations.";
            messageDiv.classList.add("text-red-400");
            messageDiv.classList.remove("text-green-400");
            messageDiv.classList.remove("hidden");
        }
    });
    const userInfo = document.getElementById("user-info");
    if (userInfo) {
        userInfo.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "settings" }, "", "/settings");
            renderSettings();
        });
    }
    const secutity = document.getElementById("security");
    if (secutity) {
        secutity.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "settings" }, "", "/settings");
            renderSecurity();
        });
    }
    const backLink = document.getElementById("link-home");
    if (backLink) {
        backLink.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "log" }, "", "/log");
            renderAuth();
        });
    }
}
export async function renderSecurity() {
    const app = document.getElementById("app");
    if (!app)
        return;
    const userData = localStorage.getItem("user");
    let user = null;
    if (userData) {
        user = JSON.parse(userData);
        console.log("Objet user parsé :", user);
    }
    let isGoogleUser = false;
    let is2faEnabled = false;
    if (user && user.result) {
        if (user.result.sub) {
            isGoogleUser = true;
        }
        if (user.result.is_fa_enabled === 1) {
            is2faEnabled = true;
        }
    }
    app.innerHTML = `
    <div class="h-screen flex items-center justify-center">
        <div class="flex bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-2xl p-10 backdrop-blur-md shadow-xl w-full max-w-5xl text-white">
        
        <!-- COLONNE GAUCHE : Boutons -->
        <div class="w-1/3 flex flex-col justify-start items-center pr-8 border-r border-gray-600">
            
            <button id="user-info" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
            Information utilisateur
            </button>
            <button id="security" class="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition-colors">
            Sécurité
            </button>
        </div>
        
        <!-- COLONNE DROITE : Formulaire utilisateur -->
        <div class="w-2/3 pl-10">
            <form id="update-form" class="space-y-5">
            <div class="mb-6">
                <h2 class="text-2xl text-white mb-2">Options de Connection</h2>
            </div>

            <div>
                <button id="google" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
                Google
                </button>
            </div>

            <div class="hidden" id="google-true">
                <button id="google-to-true" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
                Syncroniser votre compte Google
                </button>
            </div>

            <div class="hidden" id="prevent-msg-gg-true">
                <div class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-md p-3 flex items-center justify-between">
                    <p class="text-red-400">
                    Voulez-vous vraiment synchroniser votre compte <strong>Google</strong> ? <br>Vous ne pourrais plus modifier votre <strong>Nom d'utilisateur</strong> et votre <strong>Email</strong>.
                    <br>De plus, votre <strong>Nom d'utilisateur</strong> et votre <strong>Email</strong>, seront mis à jour avec les information de votre compte <strong>Google</strong>.
                    </p>
                    <div class="flex gap-3">
                        <button id="confirm-gg-to-true" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition">
                            Confirmer
                        </button>
                        <button id="cancel-gg-to-true" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>

            <div class="hidden" id="google-false">
                <button id="google-to-false" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
                Désyncroniser votre compte Google
                </button>
            </div>

            <div class="hidden" id="prevent-msg-gg-false">
                <div class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-md p-3 flex items-center justify-between">
                    <p class="text-red-400">
                    Voulez-vous vraiment désynchroniser votre compte <strong>Google</strong> ?
                    </p>
                    <div class="flex gap-3">
                        <button id="confirm-gg-to-false" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition">
                            Confirmer
                        </button>
                        <button id="cancel-gg-to-false" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>    

            <div>
                <button id="2fa" class="w-full bg-sky-800 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md mb-3 transition-colors">
                Double authentification
                </button>
            </div>

            <div class="hidden" id="prevent-msg-2fa">
                <div class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-md p-3 flex items-center justify-between">
                    <p class="text-red-400">
                    Voulez-vous vraiment activer la <strong>Double Authentification</strong> ?<br>
                    Cette action est <strong>iréversible</strong>.
                    </p>
                    <div class="flex gap-3">
                        <button id="confirm-2fa-to-true" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded-md transition">
                            Confirmer
                        </button>
                        <button id="cancel-2fa-to-true" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md transition">
                            Annuler
                        </button>
                    </div>
                </div>
            </div>

            <div class="hidden" id="div-setup">
                <div class="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-md p-6 flex flex-col items-center gap-4">
                    
                    <!-- Texte + QR côte à côte -->
                    <div class="flex w-full items-center justify-between gap-6">
                    <p class="text-red-400 text-center flex-1">
                        Veuillez installer l'application <strong>Authenticator</strong> sur votre mobile,<br>
                        puis scannez ce QR Code.
                    </p>

                    <div class="flex justify-center">
                        <img id="qrcode-img" class="w-64 h-64 object-contain border border-gray-700 rounded-md shadow-md" alt="QR Code 2FA">
                    </div>
                    </div>

                    <!-- Bouton en dessous -->
                    <button id="to-confirm" class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md transition">
                    Continuer
                    </button>
                </div>
            </div>

            <!-- SECTION CODE 2FA -->
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

            <div id="error-message-gg" class="text-sm mt-3 hidden"></div>

            </form>

            <div class="mt-4 text-center">
                <a href="/" id="link-home" class="text-gray-300 text-sm underline hover:text-white">
                ← Retour
                </a>
            </div>
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
    const userInfo = document.getElementById("user-info");
    const secutity = document.getElementById("security");
    const google = document.getElementById("google");
    const ggTrue = document.getElementById("google-true");
    const ggFalse = document.getElementById("google-false");
    const toTrue = document.getElementById("google-to-true");
    const divPreventTrue = document.getElementById("prevent-msg-gg-true");
    const ggConfirmTrue = document.getElementById("confirm-gg-to-true");
    const ggCancelTrue = document.getElementById("cancel-gg-to-true");
    const toFalse = document.getElementById("google-to-false");
    const divPreventFalse = document.getElementById("prevent-msg-gg-false");
    const ggConfirmFalse = document.getElementById("confirm-gg-to-false");
    const ggCancelFalse = document.getElementById("cancel-gg-to-false");
    const ggErrorMsg = document.getElementById("error-message-gg");
    const backLink = document.getElementById("link-home");
    const two_fa = document.getElementById("2fa");
    const prevent_msg_fa = document.getElementById("prevent-msg-2fa");
    const yes_two_fa = document.getElementById("confirm-2fa-to-true");
    const no_two_fa = document.getElementById("cancel-2fa-to-true");
    const setup_two_fa = document.getElementById("div-setup");
    const qrImg = document.getElementById("qrcode-img");
    const continue_fa = document.getElementById("to-confirm");
    const verify_two_fa = document.getElementById("div-verify-2fa");
    const confirm_two_fa = document.getElementById("confirm-2fa-code");
    if (userInfo) {
        userInfo.addEventListener("click", (e) => {
            e.preventDefault();
            isHiddenGoogle = false;
            history.pushState({ page: "settings" }, "", "/settings");
            renderSettings();
        });
    }
    if (secutity) {
        secutity.addEventListener("click", (e) => {
            e.preventDefault();
            history.pushState({ page: "settings" }, "", "/settings");
            renderSecurity();
        });
    }
    if (google && ggTrue && ggFalse && divPreventFalse && ggErrorMsg) {
        google.addEventListener("click", (e) => {
            e.preventDefault();
            if (isHiddenGoogle === false) {
                if (isGoogleUser === false) {
                    ggTrue.classList.remove("hidden");
                    ggFalse.classList.add("hidden");
                }
                else {
                    ggTrue.classList.add("hidden");
                    ggFalse.classList.remove("hidden");
                }
                isHiddenGoogle = true;
            }
            else {
                isHiddenGoogle = false;
                ggTrue.classList.add("hidden");
                ggFalse.classList.add("hidden");
                divPreventFalse.classList.add("hidden");
                ggErrorMsg.classList.add("hidden");
            }
        });
    }
    if (toTrue && divPreventTrue && ggErrorMsg) {
        toTrue.addEventListener("click", (e) => {
            e.preventDefault();
            divPreventTrue.classList.toggle("hidden");
            ggErrorMsg.classList.add("hidden");
        });
    }
    if (divPreventTrue && ggConfirmTrue && ggErrorMsg) {
        ggConfirmTrue.addEventListener("click", async (e) => {
            e.preventDefault();
            const width = 600;
            const height = 600;
            const left = (screen.width - width) / 2;
            const top = (screen.height - height) / 2;
            const token1 = localStorage.getItem("token");
            if (!token1)
                return;
            const popup = window.open(`http://localhost:4000/v1/auth/google/link?token=${token1}`, "SynchronisationGoogle", `width=${width},height=${height},left=${left},top=${top}`);
            async function win(event) {
                event.preventDefault();
                try {
                    if (event.origin !== "http://localhost:4000")
                        return;
                    if (event.data?.error === "cancelled") {
                        console.warn("❌ Synchronisation Google annulée par l'utilisateur");
                        alert("Synchronisation Google annulée !");
                        window.removeEventListener("message", win);
                        return;
                    }
                    if (event.data?.error === "failed") {
                        if (divPreventTrue && ggErrorMsg) {
                            ggErrorMsg.textContent = `⚠️ ${event.data.message || "Erreur lors de la synchronisation Google."}`;
                            ggErrorMsg.classList.remove("text-green-400");
                            ggErrorMsg.classList.add("text-red-400");
                            ggErrorMsg.classList.remove("hidden");
                        }
                        if (popup && !popup.closed)
                            popup.close();
                        window.removeEventListener("message", win);
                        return;
                    }
                    const { token } = event.data;
                    if (token) {
                        localStorage.setItem("token", token);
                        const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                            method: "GET",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                            },
                        });
                        if (!profileRes.ok) {
                            const errText = await profileRes.text();
                            throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                        }
                        const dbUser = await profileRes.json();
                        if (dbUser)
                            localStorage.setItem("user", JSON.stringify(dbUser));
                        if (divPreventTrue && ggErrorMsg) {
                            divPreventTrue.classList.add("hidden");
                            ggErrorMsg.textContent = "✅ Succès synchronisation de votre compte Google !";
                            ggErrorMsg.classList.add("text-green-400");
                            ggErrorMsg.classList.remove("text-red-400");
                            ggErrorMsg.classList.remove("hidden");
                        }
                        if (popup && !popup.closed)
                            popup.close();
                        window.removeEventListener("message", win);
                    }
                }
                catch (err) {
                    if (divPreventTrue && ggErrorMsg) {
                        let msg = "❌ Erreur lors de la synchronisation de votre compte Google !";
                        if (err.message?.includes("OAuth failed")) {
                            msg = "⚠️ La synchronisation a échoué : compte Google déjà associé.";
                        }
                        else if (err.message?.includes("401")) {
                            msg = "⚠️ Votre session a expiré. Veuillez vous reconnecter.";
                        }
                        ggErrorMsg.textContent = msg;
                        ggErrorMsg.classList.remove("text-green-400");
                        ggErrorMsg.classList.add("text-red-400");
                        ggErrorMsg.classList.remove("hidden");
                    }
                    if (popup && !popup.closed)
                        popup.close();
                    window.removeEventListener("message", win);
                }
            }
            ;
            window.addEventListener("message", win);
        });
    }
    if (divPreventTrue && ggCancelTrue && ggErrorMsg) {
        ggCancelTrue.addEventListener("click", (e) => {
            e.preventDefault();
            divPreventTrue.classList.add("hidden");
            ggErrorMsg.classList.add("hidden");
        });
    }
    if (toFalse && divPreventFalse && ggErrorMsg) {
        toFalse.addEventListener("click", (e) => {
            e.preventDefault();
            divPreventFalse.classList.toggle("hidden");
            ggErrorMsg.classList.add("hidden");
        });
    }
    if (divPreventFalse && ggConfirmFalse && ggErrorMsg) {
        ggConfirmFalse.addEventListener("click", async (e) => {
            e.preventDefault();
            const res = await fetch(`http://localhost:4000/v2/users/isPasswordGG/${user.result.id}`, {
                method: "GET"
            });
            if (!res.ok)
                throw new Error("Erreur lors de la vérification du mot de passe Google");
            const data = await res.json();
            if (data === true) {
                ggErrorMsg.textContent = "❌ Veuillez enregistrer un mot de passe avant de désynchroniser votre compte Google.";
                ggErrorMsg.classList.add("text-red-400");
                ggErrorMsg.classList.remove("text-green-400");
                ggErrorMsg.classList.remove("hidden");
                return;
            }
            const payload = {};
            payload.sub = "null";
            let token = localStorage.getItem("token");
            if (!token) {
                console.error("❌ Aucun token trouvé dans localStorage");
                return;
            }
            try {
                const res = await fetch(`http://localhost:4000/v2/users/update/sub/${user.result.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ data: payload.sub }),
                });
                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(`Erreur lors de la mise à jour du username: ${errText}`);
                }
                const data = await res.json();
                if (data.accessToken) {
                    localStorage.setItem("token", data.accessToken);
                    token = data.accessToken;
                }
                const profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                if (!profileRes.ok) {
                    const errText = await profileRes.text();
                    throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
                }
                const dbUser = await profileRes.json();
                if (dbUser)
                    localStorage.setItem("user", JSON.stringify(dbUser));
                divPreventFalse.classList.add("hidden");
                ggErrorMsg.textContent = "✅ Succès désyncronisation de votre compte Google !";
                ggErrorMsg.classList.add("text-green-400");
                ggErrorMsg.classList.remove("text-red-400");
                ggErrorMsg.classList.remove("hidden");
            }
            catch (err) {
                console.error("Erreur lors de la mise à jour :", err);
                ggErrorMsg.textContent = "❌ Impossible de désyncroniser votre compte Google.";
                ggErrorMsg.classList.add("text-red-400");
                ggErrorMsg.classList.remove("text-green-400");
                ggErrorMsg.classList.remove("hidden");
            }
        });
    }
    if (divPreventFalse && ggCancelFalse && ggErrorMsg) {
        ggCancelFalse.addEventListener("click", (e) => {
            e.preventDefault();
            divPreventFalse.classList.add("hidden");
            ggErrorMsg.classList.add("hidden");
        });
    }
    if (two_fa && prevent_msg_fa && setup_two_fa && ggErrorMsg && verify_two_fa) {
        two_fa.addEventListener("click", (e) => {
            e.preventDefault();
            if (isHidden2fa === false) {
                prevent_msg_fa.classList.remove("hidden");
                isHidden2fa = true;
            }
            else {
                isHidden2fa = false;
                prevent_msg_fa.classList.add("hidden");
                verify_two_fa.classList.add("hidden");
                setup_two_fa.classList.add("hidden");
                ggErrorMsg.classList.add("hidden");
            }
        });
    }
    if (two_fa && ggErrorMsg && prevent_msg_fa && yes_two_fa && setup_two_fa && qrImg) {
        yes_two_fa.addEventListener("click", async (e) => {
            e.preventDefault();
            const resV = await fetch(`http://localhost:4000/v2/users/isPasswordGG/${user.result.id}`, {
                method: "GET"
            });
            if (!resV.ok)
                throw new Error("Erreur lors de la vérification du mot de passe Google");
            const dataV = await resV.json();
            if (dataV === true) {
                ggErrorMsg.textContent = "❌ Veuillez enregistrer un mot de passe avant de d'activer la Double Authentification.";
                ggErrorMsg.classList.add("text-red-400");
                ggErrorMsg.classList.remove("text-green-400");
                ggErrorMsg.classList.remove("hidden");
                return;
            }
            const tokenV = localStorage.getItem("token");
            let profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenV}`,
                },
            });
            if (!profileRes.ok) {
                const errText = await profileRes.text();
                throw new Error(`Erreur lors de la récupération du profil: ${errText}`);
            }
            const dbUser = await profileRes.json();
            if (dbUser.result.is_fa_enabled === 1) {
                ggErrorMsg.textContent = "❌ La Double Authentification est déjà configuré.";
                ggErrorMsg.classList.add("text-red-400");
                ggErrorMsg.classList.remove("text-green-400");
                ggErrorMsg.classList.remove("hidden");
                return;
            }
            prevent_msg_fa.classList.toggle("hidden");
            setup_two_fa.classList.toggle("hidden");
            let token = localStorage.getItem("token");
            if (!token) {
                console.error("❌ Aucun token trouvé dans localStorage");
                return;
            }
            const res = await fetch("http://localhost:4000/v2/users/auth/2fa/setup", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!res.ok)
                return;
            const data = await res.json();
            console.log("Réponse backend:", data);
            if (qrImg && data.qrCodeDataUrl)
                qrImg.src = data.qrCodeDataUrl;
            else
                console.error("⚠️ Pas de QR Code reçu du serveur :", data);
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
                token = data.accessToken;
            }
            profileRes = await fetch("http://localhost:4000/v2/users/profile", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (profileRes.ok) {
                const dbUser = await profileRes.json();
                localStorage.setItem("user", JSON.stringify(dbUser));
            }
        });
    }
    if (two_fa && prevent_msg_fa && setup_two_fa && continue_fa && verify_two_fa) {
        continue_fa.addEventListener("click", (e) => {
            e.preventDefault();
            setup_two_fa.classList.add("hidden");
            verify_two_fa.classList.remove("hidden");
        });
    }
    if (verify_two_fa && confirm_two_fa) {
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
                if (ggErrorMsg) {
                    ggErrorMsg.textContent = "❌ Veuillez entrer les 6 chiffres du code.";
                    ggErrorMsg.classList.add("text-red-400");
                    ggErrorMsg.classList.remove("text-green-400");
                    ggErrorMsg.classList.remove("hidden");
                }
                return;
            }
            // Envoie le code au backend
            try {
                let token = localStorage.getItem("token");
                if (!token) {
                    console.error("❌ Aucun token trouvé");
                    return;
                }
                const res = await fetch("http://localhost:4000/v2/users/auth/2fa/confirm", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ code: code })
                });
                if (!res.ok) {
                    throw new Error("Code invalide");
                }
                const data = await res.json();
                console.log("2FA activé avec succès:", data);
                if (ggErrorMsg) {
                    ggErrorMsg.textContent = "✅ Double authentification activée avec succès !";
                    ggErrorMsg.classList.add("text-green-400");
                    ggErrorMsg.classList.remove("text-red-400");
                    ggErrorMsg.classList.remove("hidden");
                }
                // Masque le div de vérification
                verify_two_fa.classList.add("hidden");
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
            }
            catch (err) {
                console.error("Erreur lors de la vérification 2FA:", err);
                if (ggErrorMsg) {
                    ggErrorMsg.textContent = "❌ Code invalide. Veuillez réessayer.";
                    ggErrorMsg.classList.add("text-red-400");
                    ggErrorMsg.classList.remove("text-green-400");
                    ggErrorMsg.classList.remove("hidden");
                }
                // Efface les inputs en cas d'erreur
                inputs.forEach(input => input.value = "");
                inputs[0].focus();
            }
        });
    }
    if (two_fa && prevent_msg_fa && no_two_fa && ggErrorMsg) {
        no_two_fa.addEventListener("click", (e) => {
            e.preventDefault();
            prevent_msg_fa.classList.toggle("hidden");
            ggErrorMsg.classList.add("hidden");
        });
    }
    if (backLink) {
        backLink.addEventListener("click", (e) => {
            e.preventDefault();
            isHiddenGoogle = false;
            history.pushState({ page: "log" }, "", "/log");
            renderAuth();
        });
    }
}
