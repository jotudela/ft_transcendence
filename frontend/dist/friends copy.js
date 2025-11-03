import { renderAuth } from "./auth.js";
const API_URL = "http://localhost:3020/v1/friendships";
export async function renderFriends() {
    const userData = localStorage.getItem("user");
    if (!userData) {
        console.error("Utilisateur non connecté");
        return;
    }
    const user = JSON.parse(userData);
    const userId = user.result?.id;
    if (!userId) {
        console.error("ID utilisateur non trouvé");
        return;
    }
    console.log("user ID = ", userId);
    const app = document.getElementById("app");
    if (!app)
        return;
    const allUsers = await fetchAllUsers();
    app.innerHTML = `
		<div class="h-screen flex items-center justify-center">
		<div class="flex bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-2xl p-10 backdrop-blur-md shadow-xl w-full max-w-5xl text-white">
			
			<div class="w-2/3 pl-10">
			<h2 class="text-3xl font-bold text-center mb-6">👥 Gestion des amis</h2>

			<!-- Menu déroulant pour ajouter un ami -->
			<div class="flex items-center gap-3 mb-6">
				<select id="add-friend-select" class="flex-grow px-4 py-2 rounded-md bg-gray-700 text-white">
				${allUsers.map(u => `<option value="${u.id}">${u.username}</option>`).join("")}
				</select>
				<button id="add-friend-btn" class="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-semibold transition">
				➕ Ajouter
				</button>
			</div>

			<!-- Liste amis -->
			<div class="mb-8">
				<h3 class="text-xl font-semibold mb-3">Vos amis</h3>
				<ul id="friends-list" class="space-y-3">
				${friends.map(f => `
					<li class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
					<span>${f.username}${f.tag ? "#" + f.tag : ""}</span>
					<button class="text-red-400 hover:text-red-600 transition" data-friend-id="${f.id}">❌ Retirer</button>
					</li>
				`).join("")}
				</ul>
			</div>

			<!-- Demandes reçues -->
			<div class="mb-8">
				<h3 class="text-xl font-semibold mb-3">Demandes reçues</h3>
				<ul id="pending-requests" class="space-y-3">
				${pendingRequests.map(f => `
					<li class="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
					<span>${f.username}</span>
					<div class="space-x-2">
						<button class="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md" data-accept-id="${f.id}">✅</button>
						<button class="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md" data-reject-id="${f.id}">❌</button>
					</div>
					</li>
				`).join("")}
				</ul>
			</div>

			<div class="text-center">
				<button id="back-home" class="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-md font-semibold transition">
				← Retour
				</button>
			</div>
			</div>
		</div>
		</div>
	`;
    // Retour à l'auth
    document.getElementById("back-home")?.addEventListener("click", () => {
        history.pushState({ page: "auth" }, "", "/auth");
        renderAuth();
    });
    // Gestion ajout ami
    document.getElementById("add-friend-btn")?.addEventListener("click", async () => {
        const select = document.getElementById("add-friend-select");
        const friendId = Number(select.value);
        await fetch(`${API_URL}/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id_1: userId, user_id_2: friendId, requested_by: userId }),
        });
        renderFriends(); // Refresh
    });
    // Retirer ami
    document.querySelectorAll("#friends-list button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const id = Number(e.currentTarget.dataset.friendId);
            await deleteFriend(userId, id);
            renderFriends();
        });
    });
    // Accepter / refuser demande
    document.querySelectorAll("#pending-requests button").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const acceptId = e.currentTarget.dataset.acceptId;
            const rejectId = e.currentTarget.dataset.rejectId;
            if (acceptId)
                await updateFriendStatus(Number(acceptId), "accepted");
            if (rejectId)
                await updateFriendStatus(Number(rejectId), "rejected");
            renderFriends();
        });
    });
}
async function fetchFriends(userId) {
    const res = await fetch(`${API_URL}/all_requests/accepted/user_id/${userId}`);
    return res.json();
}
async function fetchPendingRequests(userId) {
    const res = await fetch(`${API_URL}/all_requests/pending/user_id/${userId}`);
    return res.json();
}
async function updateFriendStatus(friendId, status) {
    await fetch(`${API_URL}/update_status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: friendId, status }),
    });
}
async function deleteFriend(userId1, userId2) {
    await fetch(`${API_URL}/by_friendship_users_id`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id_1: userId1, user_id_2: userId2 }),
    });
}
async function fetchAllUsers() {
    const res = await fetch("http://localhost:3020/v1/users"); // à adapter si tu as un endpoint users
    return res.json();
}
