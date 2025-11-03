import { renderAuth } from "./auth.js";
const API_URL = "http://localhost:4000/v2/users";
/**========================================================================
 *                           Fonction principal friends
 *========================================================================**/
export async function renderFriends() {
    const userData = localStorage.getItem("user");
    if (!userData) {
        console.error("Utilisateur non connecté");
        return;
    }
    const user = JSON.parse(userData);
    //recup id de l'user
    const userId = user.result?.id;
    if (!userId) {
        console.error("ID utilisateur non trouvé");
        return;
    }
    console.log("user ID = ", userId);
    const app = document.getElementById("app");
    if (!app)
        return;
    //recup la liste des utilisateurs
    const allUsers = await fetchAllUsers();
    if (!allUsers)
        return (console.error("liste users non recup"));
    const filteredUsers = allUsers.filter(u => u.id !== userId && ![1, 2, 3].includes(u.id));
    app.innerHTML = `
  <div class="relative h-screen flex items-center justify-center">
	<!-- Canvas ou conteneur des particules -->
	<div id="particles-js" class="absolute inset-0 -z-10"></div>

	<!-- Cadre principal -->
	<div class="flex flex-col bg-gray-900 bg-opacity-30 border border-gray-500 border-opacity-40 rounded-2xl p-10 backdrop-blur-md shadow-xl text-white w-full max-w-3xl min-h-fit">
	  
	  <h2 class="text-3xl font-bold text-center mb-8">👥 Gestion des amis</h2>

	  <div class="flex items-center gap-3 mb-6">
		<select id="add-friend-select" class="flex-grow px-4 py-2 rounded-md bg-gray-700 text-white">
		  ${filteredUsers.map(u => `<option value="${u.id}">${u.username}</option>`).join("")}
		</select>
		<button id="add-friend-btn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold transition">
		  ➕ Ajouter
		</button>
	  </div>

	<!-- Liste d'amis -->

	<div class="mb-8">
	<h3 class="text-xl font-semibold mb-3">Vos amis</h3>
	<ul id="friends-list" class="space-y-3"></ul>
	</div>

	<!-- Demandes en cours -->
	<div class="mb-8">
			<h3 class="text-xl font-semibold mb-3">
				Demandes reçues
			</h3>
		<ul id="pending-requests" class="space-y-3"></ul>
	</div>

	<div class="mb-8">
			<h3 class="text-xl font-semibold mb-3">
				Demandes envoyées
			</h3>
		<ul id="sent-requests" class="space-y-3"></ul>
	</div>

	  <div class="text-center">
		<button id="back-home" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-semibold transition">
		  ← Retour
		</button>
	  </div>
	</div>
  </div>
`;
    // Bouton retour
    document.getElementById("back-home")?.addEventListener("click", () => {
        history.pushState({ page: "auth" }, "", "/auth");
        renderAuth();
    });
    //Ajout d'un ami
    document.getElementById("add-friend-btn")?.addEventListener("click", async () => {
        const select = document.getElementById("add-friend-select");
        if (!select)
            return;
        const friendId = Number(select.value);
        const token = user.accessToken;
        if (!token)
            return alert("❌ Vous n'êtes pas authentifié");
        try {
            await addFriend(userId, friendId, token);
            alert("✅ Demande d’ami envoyée !");
            renderFriends();
        }
        catch (err) {
            console.error("Erreur ajout ami :", err);
            alert(err instanceof Error ? err.message : "❌ Erreur lors de l’ajout de l’ami");
        }
    });
    const friends = await fetchFriends(userId);
    const friendsListEl = document.getElementById('friends-list');
    if (friendsListEl) {
        if (friends.length === 0) {
            friendsListEl.innerHTML = `<li class="text-gray-400 italic">Aucun ami pour le moment</li>`;
        }
        else {
            friendsListEl.innerHTML = friends
                .map(f => {
                const friendId = f.user_id_min === userId ? f.user_id_max : f.user_id_min;
                const friendUser = allUsers.find(u => u.id === friendId);
                if (!friendUser) {
                    console.warn(`⚠️ [DEBUG] Aucun user trouvé pour id ${friendId}`);
                    return '';
                }
                console.log(`👥 [DEBUG] Affichage ami : ${friendUser.username} (${f.friend_status})`);
                const statusColor = f.friend_status === "online" ? "bg-green-500" : "bg-red-500";
                return `
			<li class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
				<div class="flex items-center gap-2">
					<!-- Statut online/offline et nom de lami -->

				<span class="inline-block w-3 h-3 ${statusColor} rounded-full"></span>
				<span>${friendUser.username}</span>
				</div>
				<button 
				data-user1="${f.user_id_min}" 
				data-user2="${f.user_id_max}" 
				class="bg-red-700 hover:bg-red-800 px-3 py-1 rounded-md text-white">
				❌ Supprimer
				</button>
			</li>`;
            })
                .join('');
        }
    }
    // demandes envoyees et recues
    const pending = await fetchPendingRequests(userId);
    const receivedRequests = pending.filter(req => req.requested_by !== userId);
    const sentRequests = pending.filter(req => req.requested_by === userId);
    const receivedEl = document.getElementById("pending-requests");
    const sentEl = document.getElementById("sent-requests");
    //recues
    if (receivedEl) {
        if (!receivedRequests.length) {
            receivedEl.innerHTML = `<li class="text-gray-400 italic">Aucune demande reçue</li>`;
        }
        else {
            receivedEl.innerHTML = receivedRequests
                .map(req => {
                const senderId = req.user_id_min === userId ? req.user_id_max : req.user_id_min;
                const sender = allUsers.find(u => u.id === senderId);
                return `
					<li class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
					<span>${sender.username}</span>
					<div class="space-x-2">
						<button 
						data-id="${req.id}" 
						data-action="accept" 
						class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md">
						✅
						</button>
						<button 
							data-id="${req.id}" 
							data-action="decline"
							data-user1="${req.user_id_min}"
							data-user2="${req.user_id_max}"
							class="bg-red-800 hover:bg-red-900 px-3 py-1 rounded-md">
							❌
						</button>
					</div>
				</li>
					`;
            })
                .join("");
        }
    }
    //envoyees
    if (sentEl) {
        if (!sentRequests.length) {
            sentEl.innerHTML = `<li class="text-gray-400 italic">Aucune demande envoyée</li>`;
        }
        else {
            sentEl.innerHTML = sentRequests
                .map(req => {
                const receiverId = req.user_id_min === userId ? req.user_id_max : req.user_id_min;
                const receiver = allUsers.find(u => u.id === receiverId);
                return `
						<li class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
							<span>${receiver.username}</span>
							<button 
								data-user1="${req.user_id_min}" 
								data-user2="${req.user_id_max}" 
								class="bg-red-800 hover:bg-red-900 px-3 py-1 rounded-md">
								❌ Annuler
							</button>
						</li>
					`;
            })
                .join("");
        }
    }
    // accepter et refuser demande amis
    document.querySelectorAll("#pending-requests button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const button = e.currentTarget;
            const action = button.dataset.action;
            const requestId = Number(button.dataset.id);
            try {
                if (action === "accept") {
                    await acceptFriend({ requestId, accept: true });
                }
                else if (action === "decline") {
                    const user1 = Number(button.dataset.user1);
                    const user2 = Number(button.dataset.user2);
                    if (!isNaN(user1) && !isNaN(user2)) {
                        await deleteFriend(user1, user2);
                    }
                    else {
                        console.error("IDs invalides pour refuser la demande", button.dataset);
                        return;
                    }
                }
                renderFriends();
            }
            catch (err) {
                console.error("Erreur traitement demande :", err);
                alert("❌ Impossible de traiter la demande");
            }
        });
    });
    //annuler demande d amis
    document.querySelectorAll('#sent-requests button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.currentTarget;
            const user1 = parseInt(button.dataset.user1 || "", 10);
            const user2 = parseInt(button.dataset.user2 || "", 10);
            if (isNaN(user1) || isNaN(user2)) {
                console.error("IDs invalides :", button.dataset);
                return;
            }
            await deleteFriend(user1, user2);
            renderFriends();
        });
    });
    //supprimer un ami
    document.querySelectorAll('#friends-list button').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const button = e.currentTarget;
            const user1 = Number(button.dataset.user1);
            const user2 = Number(button.dataset.user2);
            try {
                await deleteFriend(user1, user2);
                renderFriends();
            }
            catch (err) {
                console.error("Erreur suppression ami :", err);
                alert("Impossible de supprimer l'ami");
            }
        });
    });
}
/**========================================================================
 *                           Fonctions utiles recuperation infos
 *========================================================================**/
async function fetchFriends(userId) {
    try {
        const res = await fetch(`${API_URL}/allfriends_accepted/${userId}`);
        if (!res.ok)
            throw new Error("Erreur récupération amis");
        const data = await res.json();
        console.log("data from fetchFriends:", data);
        return data.friends || [];
    }
    catch (err) {
        console.error("Erreur fetchFriends :", err);
        return [];
    }
}
async function fetchPendingRequests(userId) {
    const res = await fetch(`${API_URL}/allfriends_pending/${userId}`);
    console.log("liste d amis = ", res);
    return res.json();
}
async function deleteFriend(userId1, userId2) {
    const res = await fetch(`${API_URL}/delete_friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id_1: userId1, user_id_2: userId2 }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Erreur suppression ami : ${err}`);
    }
    return res.json();
}
async function acceptFriend({ requestId, accept }) {
    const res = await fetch(`${API_URL}/accept_decline_friends`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: requestId,
            status: accept ? "accepted" : "rejected",
        }),
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Erreur acceptFriend: ${err}`);
    }
    return res.json();
}
async function fetchAllUsers() {
    try {
        const res = await fetch("http://localhost:4000/v2/users/all");
        if (!res.ok) {
            console.warn(`Erreur ${res.status} : impossible de récupérer les utilisateurs.`);
            return [];
        }
        const data = await res.json();
        console.log("All Users :", data);
        if (Array.isArray(data.users)) {
            return data.users;
        }
        console.warn("⚠️ Structure inattendue reçue :", data);
        return [];
    }
    catch (err) {
        console.error("Erreur réseau lors du fetchAllUsers :", err);
        return [];
    }
}
async function addFriend(userId, friendId, token) {
    try {
        const res = await fetch(`${API_URL}/newfriends`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                user_id_1: userId,
                user_id_2: friendId,
                requested_by: userId
            }),
        });
        if (!res.ok) {
            let message = "❌ Erreur lors de l’ajout de l’ami";
            if (res.status === 400) {
                message = "🔒 Vous devez être connecté pour envoyer une demande d’ami.";
            }
            else if (res.status === 401) {
                message = "⚠️ Une demande d’amitié existe déjà entre vous deux.";
            }
            else if (res.status === 409) {
                message = "⚠️ Vous êtes déjà amis";
            }
            else {
                const errText = await res.text();
                try {
                    const errJson = JSON.parse(errText);
                    if (errJson.message)
                        message = `⚠️ ${errJson.message}`;
                }
                catch {
                    console.warn("Réponse d’erreur non JSON :", errText);
                }
            }
            throw new Error(message);
        }
        return res.json();
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
