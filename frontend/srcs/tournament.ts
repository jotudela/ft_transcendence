import { renderHome } from "./app.js";
import { renderAuth } from "./auth.js";
import { renderPongGame } from "./pong.js";

interface Player  {
	id: number;
	name: string;
	nameInTournament?: string;
};

interface MatchResult {
	player1: Player;
	player2: Player;
	score1: number;
	score2: number;
	winner: number;
	startTime: Date;
	endTime: Date;
}

interface TournamentData {
	semi1?: MatchResult;
	semi2?: MatchResult;
	final?: MatchResult;
}

const usedTournamentNames: string[] = [];
const usedUserIds: number[] = [];

const tournamentData: TournamentData = {};

export async function renderTournament(userName: string, userId: number) {
	const app = document.getElementById("app");
	
	usedTournamentNames.length = 0;
	usedUserIds.length = 0;
	
	const userData = localStorage.getItem("user");
	if (!userData) {
		console.error("Utilisateur non connecté");
		return;
	}

	const user = JSON.parse(userData);
	if (!userId)
		userId = user.result?.id;
	userName = user.result?.username


	if (!app) 
		return;

	const token = localStorage.getItem("user");

	let nameInTournament: string = userName;

	if (token) {
		try {
			const userObj = JSON.parse(token);
			const result = userObj.result;
			usedUserIds.push(userId);
			if (result.username_in_tournaments){
				nameInTournament = result.username_in_tournaments;
				usedTournamentNames.push(nameInTournament);
			}
			else
				nameInTournament = userName;

		} catch (error) {
			console.error("❌ Erreur lors du parsing du token :", error);
		}
	}

	app.innerHTML = `
		<div id="tournament-container" class="h-screen flex flex-col items-center justify-center text-white">
				<h1 class="text-3xl font-bold mb-8">
				Tournoi - Sélection des joueurs
			</h1>

			<div class="mb-6 w-full max-w-md">
			<label for="tournament-name" class="block text-gray-300 text-sm font-semibold mb-2">
				Nom du tournoi
			</label>
			<input type="text" id="tournament-name" placeholder="Entrez le nom du tournoi"
				class="w-full px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
			</div>

			<div class="grid grid-cols-4 gap-6 w-4/5 bg-gray-900 bg-opacity-20 border border-gray-500 border-opacity-40 rounded-xl p-6 backdrop-blur-md shadow-xl">
				<!-- Joueur principal -->
				<div id="slot-player1" class="bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-sky-500 text-center">
					<h2 class="text-xl font-bold mb-2">Joueur 1</h2>
					<p class="text-green-400 font-semibold">${nameInTournament}</p>
				</div>

				<!-- Joueur 2 -->
				<div id="slot-player2" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
					<h2 class="text-xl font-bold mb-2">Joueur 2</h2>
					<button id="player2Login" class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md w-full mb-2">
						Ajouter joueur
					</button>
				</div>

				<!-- Joueur 3 -->
				<div id="slot-player3" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
					<h2 class="text-xl font-bold mb-2">Joueur 3</h2>
					<button id="player3Login" class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md w-full mb-2">
						Ajouter joueur
					</button>
					<button id="player3Bot" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full">
						Ajouter IA
					</button>
				</div>

				<!-- Joueur 4 -->
				<div id="slot-player4" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
					<h2 class="text-xl font-bold mb-2">Joueur 4</h2>
					<button id="player4Login" class="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md w-full mb-2">
						Ajouter joueur
					</button>
					<button id="player4Bot" class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md w-full">
						Ajouter IA
					</button>
				</div>
			</div>

			<!-- Bouton retour -->
			<div class="mt-10">
			 <button id="start-tournament" 
					class="hidden bg-green-600 hover:bg-green-500 text-white font-semibold py-2 px-6 rounded-md">
					🚀 Lancer le tournoi
				</button>
				<button id="back-home" 
					class="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-6 rounded-md transition-colors">
					← Retour
				</button>
			</div>
		</div>
		</div>
			<div id="game-container" class="hidden flex flex-col items-center justify-center w-full h-screen">
		</div>	
	`;

	const backButton = document.getElementById("back-home");
	if (backButton) {
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			usedTournamentNames.length = 0;
			usedUserIds.length = 0;
			history.back(); 
		});
	}

	

	const player1 = { id: userId, name: nameInTournament };
	const player2 = await setupPlayerSlot("player2", 2);
	const player3 = await setupPlayerSlot("player3", 3);
	const player4 = await setupPlayerSlot("player4", 4);

	const players = [player1, player2, player3, player4];
	const startTournament = document.getElementById("start-tournament");
	if (player2 && player3 && player4) {
		startTournament?.classList.remove("hidden");
	}

	startTournament?.addEventListener("click", (e) => {
    e.preventDefault();
    const tournamentNameInput = document.getElementById("tournament-name") as HTMLInputElement;
    const tournamentName = tournamentNameInput?.value.trim() || "Rolland Garros";

	history.pushState({
        page: "gestTournament",
        players: players,
        tournamentName: tournamentName,
        hostName: userName,
        hostId: userId
    }, "", "/gestTournament");

    gestTournament(players, tournamentName);
	});
}

/**========================================================================
 *                           Gestion des slots de connection
 *========================================================================**/



function setupPlayerSlot(slotId: string, playerIndex: number): Promise<Player> {
	return new Promise((resolve) => {
	const loginBtn = document.getElementById(`${slotId}Login`);
	const slot = document.getElementById(`slot-${slotId}`);
	const botBtn = document.getElementById(`${slotId}Bot`);


	if (!slot) return;


	loginBtn?.addEventListener("click", () => {
		slot.innerHTML = `
		<h2 class="text-xl font-bold mb-2">Joueur ${playerIndex} - Connexion</h2>
		<form id="form-${slotId}" class="space-y-2">
			<input type="email" id="email-${slotId}" placeholder="Email" required
				class="w-full px-3 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400">
			<input type="password" id="password-${slotId}" placeholder="Mot de passe" required
				class="w-full px-3 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400">
			<button type="submit"
				class="w-full bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-md">
				Se connecter
			</button>
		</form>
		<div class="flex items-center my-2">
			<hr class="flex-grow border-gray-600">
				<span class="px-2 text-gray-400 text-sm">ou</span>
			<hr class="flex-grow border-gray-600">
		</div>
			<button id="google-${slotId}" 
				class="w-full flex items-center justify-center gap-2 bg-white text-gray-800 font-semibold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
				<img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" class="w-5 h-5">
					Continuer avec Google
			</button>
		<div id="error-${slotId}" class="text-red-400 text-sm mt-2"></div>
		`;

		const form = document.getElementById(`form-${slotId}`) as HTMLFormElement;
		const emailInput = document.getElementById(`email-${slotId}`) as HTMLInputElement;
		const passwordInput = document.getElementById(`password-${slotId}`) as HTMLInputElement;
		const errorDiv = document.getElementById(`error-${slotId}`) as HTMLDivElement;
		const googleBtn = document.getElementById(`google-${slotId}`);

	form.addEventListener("submit", async (e) => {
		e.preventDefault();
		try {
			const res = await fetch("/api-auth/v2/users/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: emailInput.value.trim(),
				password: passwordInput.value.trim(),
			}),
		});

		if (!res.ok) {
			errorDiv.textContent = "Identifiants invalides";
			return;
		}

		const data = await res.json();
		const profileRes = await fetch("/api-auth/v2/users/profile", {
			method: "GET",
			headers: { Authorization: `Bearer ${data.accessToken}` },
		});

		if (profileRes.ok) {
			const profileData = await profileRes.json();
			const playerName = profileData.result.username;
			const playerId = profileData.result.id;
			let tournamentName = profileData.result.username_in_tournaments;

			if (!tournamentName)
				tournamentName = playerName;
			else{
				if (usedTournamentNames.includes(tournamentName)){
					usedTournamentNames.push(tournamentName);
					tournamentName = `${playerName} - ${tournamentName}`;
				}
				else
					usedTournamentNames.push(tournamentName);
			}

			if (usedUserIds.includes(playerId)) {
				errorDiv.textContent = "Ce joueur est déjà connecté dans un autre slot !";
			return;
			}

			usedUserIds.push(playerId);

			slot.innerHTML = `
				<h2 class="text-xl font-bold mb-2">Joueur ${playerIndex}</h2>
				<p class="text-yellow-400 font-semibold">${tournamentName}</p>
			`;

			resolve({ id: playerId, name: tournamentName});
		}
		} catch (err) {
			console.error(err);
			errorDiv.textContent = "Erreur connexion";
		}
		});

	googleBtn?.addEventListener("click", () => {
	const width = 600, height = 600;
	const left = (screen.width - width) / 2;
	const top = (screen.height - height) / 2;

	const popup = window.open(
	"/api-auth/v1/auth/google",
	"GoogleLogin",
	`width=${width},height=${height},left=${left},top=${top}`
	);

	const listener = async (event: MessageEvent) => {
	if (event.origin !== "https://localhost" && event.origin !== "https://localhost:8443")
			return;
	const { token } = event.data;
	if (token) {
		try {
		const profileRes = await fetch("/api-auth/v2/users/profile", {
			method: "GET",
			headers: { Authorization: `Bearer ${token}` },
		});

		if (profileRes.ok) {
			const profileData = await profileRes.json();
			const playerName = profileData.result.username;
			const playerId = profileData.result.id;
			let tournamentName = profileData.result.username_in_tournaments;

			if (!tournamentName)
				tournamentName = playerName;
			else{
				if (usedTournamentNames.includes(tournamentName)){
					usedTournamentNames.push(tournamentName);
					tournamentName = `${playerName} - ${tournamentName}`;
				}
				else
					usedTournamentNames.push(tournamentName);
			}


			if (usedUserIds.includes(playerId)) {
				errorDiv.textContent = "Ce joueur est déjà connecté dans un autre slot !";
				return;
			}

			usedUserIds.push(playerId);

			slot.innerHTML = `
			<h2 class="text-xl font-bold mb-2">Joueur ${playerIndex}</h2>
			<p class="text-yellow-400 font-semibold">${tournamentName}</p>
			`;

			resolve({ id: playerId, name: tournamentName });
		}
		} catch (err) {
		console.error(err);
		const errorDiv = document.getElementById(`error-${slotId}`);
		if (errorDiv) errorDiv.textContent = "Erreur Google login";
		}
		if (popup && !popup.closed) popup.close();
		window.removeEventListener("message", listener);
	}
	};

	window.addEventListener("message", listener);

	const checkPopup = setInterval(() => {
		if (!popup || popup.closed) clearInterval(checkPopup);
	}, 500);});
	});
	
	botBtn?.addEventListener("click", () => {
		const botPlayer = {
		id: 1,
		name: `ai1`,
		};
	slot.innerHTML = `
		<h2 class="text-xl font-bold mb-2">Joueur ${playerIndex}</h2>
		<button id="${slotId}BotEasy"
			class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-md mr-2">
			IA Facile
		</button>
		<button id="${slotId}BotMedium"
      	class="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-md mr-2">
      	IA Moyenne
    	</button>
		<button id="${slotId}BotHard"
			class="bg-purple-800 hover:bg-purple-900 text-white px-4 py-2 rounded-md">
			IA Difficile
		</button>
		<p id="ai-selected-${slotId}" class="text-gray-400 text-sm mt-2"></p>
	`;
	const easyBtn = document.getElementById(`${slotId}BotEasy`);
	const mediumBtn = document.getElementById(`${slotId}BotMedium`);
	const hardBtn = document.getElementById(`${slotId}BotHard`);
	const selectedP = document.getElementById(`ai-selected-${slotId}`);

	const selectBot = (difficulty: "Facile" | "Moyen" | "Difficile") => {
		const botPlayer = {
			id: 0,
			name: "",
			difficulty,
			nameInTournament: "",
		};

		if (difficulty === "Facile") {
			botPlayer.id = 1;
			botPlayer.name = "bot_easy";
			botPlayer.nameInTournament = "bot_easy";
		} 
		else if (difficulty === "Moyen") {
			botPlayer.id = 2;
			botPlayer.name = "bot_medium";
			botPlayer.nameInTournament = "bot_medium";
		} 
		else if (difficulty === "Difficile") {
			botPlayer.id = 3;
			botPlayer.name = "bot_hard";
			botPlayer.nameInTournament = "bot_hard";
		}

		if (usedTournamentNames.includes(botPlayer.name)) {
			alert(`L'IA ${botPlayer.name} est déjà utilisée dans ce tournoi.`);
			return;
		}

		usedTournamentNames.push(botPlayer.name);
		
		slot.innerHTML = `
		<h2 class="text-xl font-bold mb-2">Joueur ${playerIndex}</h2>
		<p class="text-purple-400 font-semibold">${botPlayer.name} (${botPlayer.difficulty})</p>
		`;
		resolve(botPlayer);
	};
	easyBtn?.addEventListener("click", () => selectBot("Facile"));
	mediumBtn?.addEventListener("click", () => selectBot("Moyen"));
	hardBtn?.addEventListener("click", () => selectBot("Difficile"));
	});
	});
}

/**========================================================================
 *                           Tableau du tournoi
 *========================================================================**/

export function gestTournament(players: { id: number, name: string }[], touramentName : string) {

	const tournamentDiv = document.getElementById("tournament-container")!;
	const gameDiv = document.getElementById("game-container")!;

	tournamentDiv.innerHTML = `
		<div class="h-screen flex flex-col items-center justify-center text-white">
		
			<!-- Nom du tournoi -->
			<div id="tournament-name-header" 
				class="text-4xl font-bold text-center mb-6">
				${touramentName || "Tournoi"}
			</div>

			<h1 class="text-3xl font-bold mb-8">
				Résumé du tournoi
			</h1>

			<div class="space-y-8 w-full max-w-6xl mx-auto">

			<!-- Demi-finale 1 -->
			<div id="semi1" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
			<h2 class="text-xl font-bold mb-4">Demi-finale 1</h2>
			<p>
				<span class="font-bold">${players[0].name}</span> 
				<span class="text-sm mx-2">vs</span> 
				<span class="font-bold">${players[2].name}</span>
			</p>
			<button id="btn-semi1" 
					class="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-md">
				Jouer le match
			</button>
			<p id="winner-semi1" class="text-green-400 font-semibold mt-4 hidden"></p>
			</div>

			<!-- Demi-finale 2 -->
			<div id="semi2" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
			<h2 class="text-xl font-bold mb-4">Demi-finale 2</h2>
			<p>
				<span class="font-bold">${players[1].name}</span> 
				<span class="text-sm mx-2">vs</span>  
				<span class="font-bold">${players[3].name}</span>			</p>
			<button id="btn-semi2" 
					class="mt-4 bg-sky-600 hover:bg-sky-700 text-white px-6 py-6 rounded-md hidden">
				Jouer le match
			</button>
			<p id="winner-semi2" class="text-green-400 font-semibold mt-4 hidden"></p>
			</div>

			<!-- Finale -->
			<div id="final" class="bg-gray-800 rounded-xl p-6 shadow-lg text-center">
			<h2 class="text-xl font-bold mb-4">Finale</h2>
			<p id="final-match">
		 			<span class="font-bold">???</span>
				<span class="text-sm mx-2">vs</span> 
				<span class="font-bold">???</span>
			</p>
			<button id="btn-final" 
					class="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py- rounded-md hidden">
				Jouer la finale
			</button>
			<p id="winner-final" class="text-yellow-400 font-bold mt-4 hidden"></p>
			</div>
				<!-- Bouton Retour -->
			<div class="text-center mt-8">
				<button id="btn-back" 
						class="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-md">
					Retour
				</button>
			</div>
		</div>
		</div>
	`;


	const backButton = document.getElementById("btn-back");
	if (backButton) {
		backButton.addEventListener("click", (e) => {
			e.preventDefault();
			history.back(); 
		});
	}
	// Gestion demi-finale 1

	const btnSemi1 = document.getElementById("btn-semi1");
	const btnSemi2 = document.getElementById("btn-semi2");
	const btnFinal = document.getElementById("btn-final");
		
	btnSemi1?.addEventListener("click", async () => {
		tournamentDiv.style.display = "none";
		gameDiv.style.display = "flex";

		const result1 = await renderPongGame(players[0].name, players[0].id, players[2].name, players[2].id, true, touramentName);


		gameDiv.style.display = "none";
		tournamentDiv.style.display = "flex";

		tournamentData.semi1 = {
			player1: players[0],
			player2: players[2],
			score1: result1.scoreA,
			score2: result1.scoreB,
			winner: result1.winnerId,
			startTime: result1.startGame!,
			endTime: result1.endGame!
		};

		const winnerP = document.getElementById("winner-semi1");
		if (winnerP) {
			winnerP.textContent = `Vainqueur : ${players.find(p => p.id === result1.winnerId)?.name || "?"}`;
			winnerP.classList.remove("hidden");
		}

		btnSemi1.classList.add("hidden");
		btnSemi2?.classList.remove("hidden");
	});

	//demi final n 2
	
	btnSemi2?.addEventListener("click", async () => {
		tournamentDiv.style.display = "none";
		gameDiv.style.display = "flex";
		
			const result2 = await renderPongGame(players[1].name, players[1].id, players[3].name, players[3].id, true, touramentName);

			tournamentData.semi2 = {
			player1: players[1],
			player2: players[3],
			score1: result2.scoreA,
			score2: result2.scoreB,
			winner: result2.winnerId,
			startTime: result2.startGame!,
			endTime: result2.endGame!
		};

		const winnerP = document.getElementById("winner-semi2");
		if (winnerP) {
			winnerP.textContent = `Vainqueur : ${players.find(p => p.id === result2.winnerId)?.name || "?"}`;
			winnerP.classList.remove("hidden");
		}
			btnSemi2.classList.add("hidden");
			btnFinal?.classList.remove("hidden");
			const finalMatchP = document.getElementById("final-match");

		if (finalMatchP) {
		const winnerSemi1 = players.find(p => p.id === tournamentData.semi1?.winner)!;
		const winnerSemi2 = players.find(p => p.id === tournamentData.semi2?.winner)!;
		finalMatchP.innerHTML = `
			<span class="font-bold">${winnerSemi1.name}</span>
			<span class="text-sm mx-2">vs</span>
			<span class="font-bold">${winnerSemi2.name}</span>
		`;
		}

		gameDiv.style.display = "none";
		tournamentDiv.style.display = "flex";
	});


//finale
	btnFinal?.addEventListener("click", async () => {
		tournamentDiv.style.display = "none";
		gameDiv.style.display = "flex";

		const winnerSemi1Id = tournamentData.semi1?.winner!;
		const winnerSemi2Id = tournamentData.semi2?.winner!;
		let winnerSemi1 = players.find(p => p.id === winnerSemi1Id)!;
		let winnerSemi2 = players.find(p => p.id === winnerSemi2Id)!;

		let resultFinal;

		if (isBot(winnerSemi1) && isBot(winnerSemi2)) {
			resultFinal = simulateBotMatch(winnerSemi1, winnerSemi2);
		} 
		else {
			if (isBot(winnerSemi1) && !isBot(winnerSemi2)) {
				[winnerSemi1, winnerSemi2] = [winnerSemi2, winnerSemi1];
		}
			resultFinal = await renderPongGame(
			winnerSemi1.name, winnerSemi1.id,
			winnerSemi2.name, winnerSemi2.id,
			true,
			touramentName
		);
	}
		gameDiv.style.display = "none";
		tournamentDiv.style.display = "flex";

		tournamentData.final = {
			player1: winnerSemi1,
			player2: winnerSemi2,
			score1: resultFinal.scoreA,
			score2: resultFinal.scoreB,
			winner: resultFinal.winnerId,
			startTime: resultFinal.startGame!,
			endTime: resultFinal.endGame!
		};

		const winnerFinalP = document.getElementById("winner-final");
		if (winnerFinalP) {
			winnerFinalP.textContent = `Champion : ${players.find(p => p.id === resultFinal.winnerId)?.name || "?"} 🏆`;
			winnerFinalP.classList.remove("hidden");
		}

		btnFinal.classList.add("hidden");
		sendTournamentToApi(touramentName);
	});
}

/**========================================================================
 *                           Envoi des infos a l api
 *========================================================================**/

async function sendTournamentToApi(tournamentName: string)
{
	const token = localStorage.getItem("user");
		if (!token) {
		console.error("Pas de token trouvé");
		return;
 		}

	const payload = {
		tournament: {
		tournament_type: "1vs1",
		tournament_name: tournamentName,
		started_at: tournamentData.semi1?.startTime?.toISOString(),
		ended_at: tournamentData.final?.endTime?.toISOString(),
		first_position_user_id_1: tournamentData.final?.winner,
		first_position_user_id_2: null,
		second_position_user_id_1: (tournamentData.final?.winner === tournamentData.semi1?.winner ? tournamentData.semi2?.winner : tournamentData.semi1?.winner),
		second_position_user_id_2: null,
		thirth_position_user_id_1: (tournamentData.semi1?.winner !== tournamentData.final?.winner ? tournamentData.semi1?.winner : tournamentData.semi2?.winner),
		thirth_position_user_id_2: null,
		fourth_position_user_id_1: (tournamentData.semi1?.winner !== tournamentData.final?.winner ? tournamentData.semi2?.winner : tournamentData.semi1?.winner),
		fourth_position_user_id_2: null,
		winner_user_id_1: tournamentData.final?.winner,
		winner_user_id_2: null
	},
	games_history: [
		{
		game_type: "1vs1",
		team_1_player_user_id_1: tournamentData.semi1?.player1.id,
		team_1_player_user_id_2: null,
		team_2_player_user_id_3: tournamentData.semi1?.player2.id,
		team_2_player_user_id_4: null,
		started_at: tournamentData.semi1?.startTime?.toISOString(),
		ended_at: tournamentData.semi1?.endTime?.toISOString(),
		score_team_1: tournamentData.semi1?.score1,
		score_team_2: tournamentData.semi1?.score2,
		winner_user_id_1: tournamentData.semi1?.winner,
		winner_user_id_2: null
		},
		{
		game_type: "1vs1",
		team_1_player_user_id_1: tournamentData.semi2?.player1.id,
		team_1_player_user_id_2: null,
		team_2_player_user_id_3: tournamentData.semi2?.player2.id,
		team_2_player_user_id_4: null,
		started_at: tournamentData.semi2?.startTime?.toISOString(),
		ended_at: tournamentData.semi2?.endTime?.toISOString(),
		score_team_1: tournamentData.semi2?.score1,
		score_team_2: tournamentData.semi2?.score2,
		winner_user_id_1: tournamentData.semi2?.winner,
		winner_user_id_2: null
		},
		{
		game_type: "1vs1",
		team_1_player_user_id_1: tournamentData.final?.player1.id,
		team_1_player_user_id_2: null,
		team_2_player_user_id_3: tournamentData.final?.player2.id,
		team_2_player_user_id_4: null,
		started_at: tournamentData.final?.startTime?.toISOString(),
		ended_at: tournamentData.final?.endTime?.toISOString(),
		score_team_1: tournamentData.final?.score1,
		score_team_2: tournamentData.final?.score2,
		winner_user_id_1: tournamentData.final?.winner,
		winner_user_id_2: null
		}
	]
	};
	try {
		const response = await fetch('/api_bc/v1/users/', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload)
		});
		const responseText = await response.text();
		
		if (!response.ok) {
			throw new Error(`Erreur API: ${response.status} - ${responseText}`);
		}

		const result = responseText ? JSON.parse(responseText) : {};
		return result;
	} 
	catch (error) {
		console.error('Erreur complète:', error);
		throw error;
	}

}
/**========================================================================
 *                           Si bot vs bot
 *========================================================================**/

function isBot(player: Player) {
	return player.name.startsWith("bot_");
}

function simulateBotMatch(playerA: Player, playerB: Player) {
	const winner = Math.random() < 0.5 ? playerA : playerB;
	const scoreA = Math.floor(Math.random() * 5) + 1;
	const scoreB = Math.floor(Math.random() * 5) + 1;

	const result = {
		scoreA,
		scoreB,
		winnerId: winner.id,
		startGame: new Date(),
		endGame: new Date(Date.now() + 1000),
	};

	return result;
}
