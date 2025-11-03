/**========================================================================
 *                           Fonction show stats
 *========================================================================**/
export async function showStats() {
    try {
        const token = localStorage.getItem("user");
        if (!token) {
            alert("Impossible de récupérer le token");
            return;
        }
        const user = JSON.parse(token);
        const userId = user.result.id;
        console.log("User Id in Stats:", userId);
        const global = await fetchGlobalStats();
        const matches = await fetchMatchHistory(userId);
        console.log("=== Stats globales ===", global);
        console.log("=== Détails des matchs ===");
        matches.forEach((m, i) => console.log(`Match #${i + 1}`, m));
        const stats = {
            total_scored: global.total_scored,
            total_wins: global.total_wins,
            total_losts: global.total_losts,
            matches
        };
        let modal = document.getElementById("stats-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "stats-modal";
            modal.style.position = "fixed";
            modal.style.top = "50%";
            modal.style.left = "50%";
            modal.style.transform = "translate(-50%, -50%)";
            modal.style.backgroundColor = "rgba(16,30,61,0.95)";
            modal.style.color = "white";
            modal.style.padding = "20px";
            modal.style.borderRadius = "10px";
            modal.style.zIndex = "9999";
            modal.style.textAlign = "center";
            modal.style.width = "850px";
            modal.style.maxWidth = "90vw";
            modal.style.maxHeight = "85vh";
            modal.style.display = "flex";
            modal.style.flexDirection = "column";
            modal.style.overflow = "hidden";
            document.body.appendChild(modal);
        }
        modal.innerHTML = `
      <h2 style="margin-bottom:15px;">🎮 Vos stats</h2>

      <!-- Onglets -->
      <div id="tabs" style="display:flex; justify-content:center; margin-bottom:15px;">
        <button class="tab-button active" data-tab="global"
          style="flex:1; padding:8px; cursor:pointer; background-color:#004080; color:white; font-weight:bold; border-radius:5px 5px 0 0; border:none;">
          Globales
        </button>
        <button class="tab-button" data-tab="matches"
          style="flex:1; padding:8px; cursor:pointer; background-color:transparent; color:white; border:none;">
          Par match
        </button>
      </div>

      <!-- Zone scrollable -->
      <div id="tab-content" style="
        flex:1; 
        overflow-y:auto; 
        padding-right:5px; 
        text-align:left;
      ">
        
        <!-- Stats globales -->
        <div id="global" class="tab active" style="display:block;">
          <table style="margin:auto; border-collapse: collapse; width: 100%;">
            <tr><th style="border-bottom:1px solid white; padding:5px;">Stat</th><th style="border-bottom:1px solid white; padding:5px;">Valeur</th></tr>
            <tr><td style="border-bottom:1px solid white; padding:5px;">Total points</td><td style="border-bottom:1px solid white; padding:5px;">${stats.total_scored}</td></tr>
            <tr><td style="border-bottom:1px solid white; padding:5px;">Victoires</td><td style="border-bottom:1px solid white; padding:5px;">${stats.total_wins}</td></tr>
            <tr><td style="padding:5px;">Défaites</td><td style="padding:5px;">${stats.total_losts}</td></tr>
          </table>
        </div>

        <!-- Stats par match -->
        <div id="matches" class="tab" style="display:none; text-align:center;">
          ${stats.matches && stats.matches.length > 0
            ? stats.matches.map((m, i) => `
                <div style="
                  display:flex; 
                  justify-content:space-between; 
                  align-items:stretch; 
                  margin-bottom:20px; 
                  border:1px solid white; 
                  padding:10px; 
                  border-radius:10px; 
                  background-color:rgba(0,0,0,0.3);
                ">

                  <!-- Player 1 -->
				<div style="flex:1; text-align:center; padding:5px; border-right:1px solid white;">
					<h3>${m.player1_name ?? 'Player 1'}</h3>
					<p>Points: ${m.player1_points ?? '-'}</p>
				</div>


                  <!-- Centre -->
				<div style="flex:1.2; text-align:center; padding:5px;">
				<!-- Type de game -->
				<div style="border:1px solid white; border-radius:5px; padding:5px; margin-bottom:5px; background-color:rgba(0,64,128,0.2); font-weight:bold;">
					Type: ${m.game_type ?? '-'}
				</div>

				<!-- Start / End -->
				<div style="border:1px solid white; border-radius:5px; padding:5px; margin-bottom:5px;">
					<p>Start At: ${m.start_at ?? '-'}</p>
					<p>End At: ${m.end_at ?? '-'}</p>
				</div>

				<!-- Winner -->
				<div style="border:1px solid white; border-radius:5px; padding:5px; margin-top:5px; font-weight:bold; background-color:rgba(0,64,128,0.3);">
					Winner: ${m.winner ?? '-'}
				</div>
				</div>

                  <!-- Player 2 -->
				<div style="flex:1; text-align:center; padding:5px; border-left:1px solid white;">
					<h3>${m.player2_name ?? 'Player 2'}</h3>
					<p>Points: ${m.player2_points ?? '-'}</p>
				</div>

                </div>
              `).join("")
            : "<p style='text-align:center;'>Aucun match joué pour le moment.</p>"}
        </div>
      </div>

      <!-- Bouton fermer -->
      <button id="close-stats" 
        style="margin-top:15px; padding:10px 20px; border:none; border-radius:5px; background:#00aaff; color:white; cursor:pointer;">
        Fermer
      </button>
    `;
        // Gestion fermeture modal
        document.getElementById("close-stats")?.addEventListener("click", () => {
            modal?.remove();
        });
        // Gestion des onglets
        document.querySelectorAll(".tab-button").forEach(btn => {
            btn.addEventListener("click", (e) => {
                const tab = e.currentTarget.dataset.tab;
                // Afficher le contenu correspondant
                document.querySelectorAll(".tab").forEach(t => t.style.display = "none");
                document.getElementById(tab).style.display = "block";
                // Modifier le style des boutons pour mettre en évidence l'actif
                document.querySelectorAll(".tab-button").forEach(b => {
                    const bEl = b;
                    if (bEl.dataset.tab === tab) {
                        bEl.style.backgroundColor = "#004080"; // bleu clair pour l'actif
                        bEl.style.color = "white";
                        bEl.style.fontWeight = "bold";
                        bEl.style.borderRadius = "5px 5px 0 0";
                    }
                    else {
                        bEl.style.backgroundColor = "transparent";
                        bEl.style.color = "white";
                        bEl.style.fontWeight = "normal";
                        bEl.style.borderRadius = "0";
                    }
                });
            });
        });
    }
    catch (err) {
        console.error("Erreur récupération stats :", err);
        alert("Impossible de récupérer vos stats");
    }
}
/**========================================================================
 *                           Recuperer stats globales
 *========================================================================**/
async function fetchGlobalStats() {
    const token = localStorage.getItem("token");
    if (!token)
        throw new Error("Vous devez être connecté");
    const res = await fetch("http://localhost:4002/v1/global_stats/all", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
    if (!res.ok)
        throw new Error(`Erreur API stats : ${res.status}`);
    const data = await res.json();
    console.log("Stats globales reçues :", data);
    return {
        total_scored: data.total_scored,
        total_wins: data.total_wins,
        total_losts: data.total_losts
    };
}
async function fetchMatchHistory(user_id) {
    const token = localStorage.getItem("token");
    if (!token)
        throw new Error("Vous devez être connecté");
    try {
        const userMap = await fetchAllUsers();
        const res = await fetch(`http://localhost:4002/v1/matchs_history/global/${user_id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (!res.ok)
            return [];
        const data = await res.json();
        console.log("json brut = ", data);
        const matchesRaw = data?.history?.array || [];
        const matches = matchesRaw.map((m) => ({
            player1_points: m.score_team_1 ?? 0,
            player2_points: m.score_team_2 ?? 0,
            start_at: m.started_at ?? '-',
            end_at: m.ended_at ?? '-',
            winner: m.winner_user_id_1 ? (userMap[m.winner_user_id_1] ?? `User #${m.winner_user_id_1}`) : '-',
            game_type: m.game_type ?? "1vs1",
            player1_name: userMap[m.team_1_player_user_id_1] ?? `User #${m.team_1_player_user_id_1}`,
            player2_name: userMap[m.team_2_player_user_id_3] ?? `User #${m.team_2_player_user_user_id_3}`
        }));
        console.log("Matches avec noms :", matches);
        return matches;
    }
    catch (e) {
        console.warn("Erreur récupération de l'historique des matchs :", e);
        return [];
    }
}
async function fetchAllUsers() {
    const token = localStorage.getItem("token");
    if (!token)
        throw new Error("Vous devez être connecté");
    try {
        const res = await fetch("http://localhost:4000/v2/users/all", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!res.ok)
            throw new Error(`Erreur récupération users : ${res.status}`);
        const data = await res.json();
        const usersArray = Array.isArray(data) ? data : data.users ?? [];
        const userMap = {};
        usersArray.forEach(u => {
            userMap[u.id] = u.username;
        });
        return userMap;
    }
    catch (err) {
        console.warn("Erreur fetchAllUsers :", err);
        return {};
    }
}
