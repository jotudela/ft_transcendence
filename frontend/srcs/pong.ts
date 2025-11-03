import { handleAI } from "./ai.js";
import { renderHome } from "./app.js";
import { renderAuth } from "./auth.js";

const MV_PADDLE = 300;
const MARGIN = 8;


let animationFrameId: number | null = null;
let lastTimestamp = 0

function handleKeyDown(e: KeyboardEvent) {
	if (currentGame) {
		currentGame.keys[e.key.toLowerCase()] = true;
	}
}

function handleKeyUp(e: KeyboardEvent) {
	if (currentGame) {
  		currentGame.keys[e.key.toLowerCase()] = false;
	}
}

let currentGame: PongGame | null = null;



/**========================================================================
 *                           Init raquettes et Canva
 *========================================================================**/

export class PongGame {
	public canvas: HTMLCanvasElement;
	public ctx: CanvasRenderingContext2D;

	public width: number;
	public height: number;

	public colorGame: string;
	public isAi: number;

	public matchpoint : number;

	//taille raquette
	public paddleHeight: number;
	public paddleWidth: number;

	public scoreA : number;
	public scoreB : number;

	//emplacement raquette
	public leftPaddleY: number;
	public leftPaddleX: number;

	public rightPaddleY: number;
	public rightPaddleX: number;

	//boule
	public ballX: number;
	public ballY: number;

	public ballDX: number;
	public ballAngle: number;

	public ballSpeed: number;
	public ballTouch: number;


	//players

	public player1pts: number;
	public player2pts: number;
	public player1name: string;
	public player2name: string;

	public player1Id: number;
	public player2Id: number;

	public infosDiv: HTMLDivElement | null = null;

	public keys: { [key: string]: boolean } = {};

	public startTime: Date | null = null;
	public endTime: Date | null = null;
	
	public isTournament: boolean;
	public endParty: boolean;


	constructor(canvas: HTMLCanvasElement, player1name: string, player2name: string) 
	{
		this.canvas = canvas;
		const ctx = canvas.getContext("2d");
		if (!ctx) throw new Error("Contexte introuvable");
		this.ctx = ctx;

		this.infosDiv = document.getElementById("pong-infos") as HTMLDivElement;

		this.colorGame = "blue";
		this.isAi = 0;
		this.width = canvas.width;
		this.height = canvas.height;

		this.matchpoint = 2;

		this.scoreA = 0;
		this.scoreB = 0;

		this.paddleHeight = 80;
		this.paddleWidth = 5;
			//extremite 
		this.rightPaddleY = (this.height - this.paddleHeight) / 2;
		this.rightPaddleX = this.width - 30 - this.paddleWidth;

		this.leftPaddleY = (this.height - this.paddleHeight) / 2;
		this.leftPaddleX = 30;

		this.ballX = this.width / 2;
		this.ballY = this.height / 2;

		this.ballSpeed = 4;
		this.ballTouch = 1
		this.ballAngle = Math.PI / 4;
		this.ballDX = 1;

		this.player1pts = 0;
		this.player2pts = 0;
		this.player1name = player1name;
		this.player2name = player2name;

		this.player1Id = -1;
		this.player2Id = -1;

		this.isTournament = false;
		this.endParty = false;
	}

	public startGame() {
		this.startTime = new Date();
		this.endTime = null;
	}

	public endGame() {
		this.endTime = new Date();
	}

	public toApiPayload(winnerId: number) {
	return {
		game_type: "1vs1",
		team_1_player_user_id_1: this.player1Id,
		team_2_player_user_id_3: this.player2Id,
		started_at: this.startTime ? this.startTime.toISOString().split(".")[0] + "Z" : null,
		ended_at: this.endTime ? this.endTime.toISOString().split(".")[0] + "Z" : null,
		score_team_1: this.scoreA,
		score_team_2: this.scoreB,
		winner_user_id_1: winnerId,
	};
	}
	
}

/**========================================================================
 *                           fonction de depart
 *========================================================================**/

export async function renderPongGame(
	player1name: string, 
	player1Id: number, 
	player2name: string, 
	player2Id: number, 
	isTournament = false,
	tournamentName?: string
):
	Promise<{winnerId: number;
		 scoreA: number; 
		 scoreB: number; 
		 startGame: Date| null ; 
		 endGame: Date | null}> 
{
	return new Promise(async (resolve) => {

	const app = isTournament
  	? document.getElementById("game-container")   
  	: document.getElementById("app");

	if (!app)
		return;

	app!.innerHTML = "";

	if (isTournament) {
    	const tournamentDiv = document.getElementById("tournament-container")!;
    	const gameDiv = document.getElementById("game-container")!;
    	tournamentDiv.style.display = "none";
    	gameDiv.style.display = "flex";
    	app!.innerHTML = ""; 
    } 


	app!.innerHTML = `
	<div class="h-screen flex flex-col items-center justify-center relative">
	
<div id="tournament-name"
     class="absolute text-white text-3xl font-bold text-center"
     style="top: 20px; left: 50%; transform: translateX(-50%);
            text-shadow: 0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 30px #00ffff;">
    Pong Game
</div>


	<!-- TERRAIN -->
	<canvas id="pong" width="800" height="500"
		class="rounded-lg bg-black border border-gray-500 z-20"></canvas>
	
	<div id="color-menu-container" 
		class="fixed bottom-4 right-4 bg-gray-800 p-2 rounded-lg shadow-md"
		style="z-index: 9999;">
	<select id="color-select" class="bg-gray-700 text-white px-2 py-1 rounded">
		<option value="blue">Bleu</option>
		<option value="red">Rouge</option>
		<option value="green">Vert</option>
	</select>
	</div>

	<!-- INSTRUCTIONS -->
	<div id="pong-controls" 
		class="mt-4 text-white text-center text-sm font-mono opacity-80 z-20">
	🕹️ <b>Contrôles :</b> <span id="controls-text"></span><br>
	🎯 <b>Partie en</b> <span id="matchpoint-display">5</span> <b>points</b>
	</div>

	<!-- BACK HOME -->
	<button id="back-home" class="mt-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-md transition-colors z-20">
		← Retour
	</button>

	<!-- DEBUG -->
	<div id="pong-infos" 
		style="position: absolute; top: 10px; left: 10px; color: white; font-family: monospace; z-index: 30;">
		</div>
	</div>`;

	const canvas = document.getElementById("pong") as HTMLCanvasElement;
	if (!canvas) return;

	currentGame = new PongGame(canvas, player1name, player2name);

	document.getElementById("matchpoint-display")!.textContent = currentGame.matchpoint.toString();

	window.addEventListener("keydown", handleKeyDown);
	window.addEventListener("keyup", handleKeyUp);
	
	document.getElementById("back-home")?.addEventListener("click", (e) => {
		e.preventDefault();

		cleanupPongGame(isTournament); 

		if (isTournament) {
			const tournamentDiv = document.getElementById("tournament-container")!;
			const gameDiv = document.getElementById("game-container")!;
			gameDiv.style.display = "none";
			tournamentDiv.style.display = "flex";
			return;
		}

		history.pushState({ page: "id" }, "", "/");
		if (localStorage.getItem("token")) 
			renderAuth();
		else 
			renderHome();
	});


	//nom de la partie
	const tournamentDiv = document.getElementById("tournament-name");
	if (tournamentDiv && canvas) {
		tournamentDiv.textContent = tournamentName || "Pong Game";
		tournamentDiv.style.color = "#ffffff";
		tournamentDiv.style.textAlign = "center";
		tournamentDiv.style.fontSize = "36px";
		tournamentDiv.style.fontWeight = "bold";
		tournamentDiv.style.textShadow = `
			0 0 10px #00ffff,
			0 0 20px #00ffff,
			0 0 30px #00ffff
		`;
		tournamentDiv.style.position = "absolute";
		updateTournamentNamePosition(canvas, tournamentDiv);
	}

	window.addEventListener("resize", () => {
		if (tournamentDiv && canvas) {
			updateTournamentNamePosition(canvas, tournamentDiv);
		}
	});
	
	const infosDiv = document.getElementById("pong-infos");

	if (player2name === "ai1" || player2name === "bot_easy")
		currentGame.isAi = 1;
	if (player2name === "ai2" || player2name === "bot_medium")
		currentGame.isAi = 2;
	if (player2name === "ai3" || player2name === "bot_hard")
		currentGame.isAi = 3;
	currentGame.player1Id = player1Id;
	currentGame.player2Id = player2Id;
	currentGame.isTournament = isTournament;

	const controlsText = document.getElementById("controls-text")!;
	if (currentGame.isAi === 0) {
		controlsText.innerHTML = `
			Joueur 1 → <span class="text-sky-400">W / S</span> | 
			Joueur 2 → <span class="text-green-400">↑ / ↓</span>
		`;
	} 
	else {
		controlsText.innerHTML = `
		Joueur 1 → <span class="text-sky-400">W / S</span> | 
		Adversaire → IA
		`;
	}


	createColorMenu(currentGame);
	
	document.fonts.load("40px 'Press Start 2P'").then(() =>{
		drawField(currentGame!.ctx, currentGame!.width, currentGame!.height, currentGame!.colorGame);
		currentGame!.startGame();
		drawStart(currentGame!);
	});
	
	await waitForEnter();
	function loop(timestamp: number) {
		drawloop(currentGame!, timestamp); 
		if (!currentGame!.endParty) {    
			requestAnimationFrame(loop); 
		}
		else{
			resolve({
				winnerId: currentGame!.scoreA > currentGame!.scoreB ? currentGame!.player1Id : currentGame!.player2Id,
				scoreA: currentGame!.scoreA,
				scoreB: currentGame!.scoreB,
				startGame: currentGame!.startTime,
				endGame: currentGame!.endTime
			});
			cleanupPongGame(currentGame!.isTournament);
		}
	}

	requestAnimationFrame(loop); 
	});
}

function updateTournamentNamePosition(canvas: HTMLCanvasElement, tournamentDiv: HTMLElement) {
    tournamentDiv.style.position = "fixed"; 
    const rect = canvas.getBoundingClientRect();
    tournamentDiv.style.left = `${rect.left + rect.width / 2}px`;
    tournamentDiv.style.top = `${rect.top - tournamentDiv.offsetHeight - 10}px`;
    tournamentDiv.style.transform = "translateX(-50%)";
    tournamentDiv.style.zIndex = "1000";
}


/**========================================================================
 *                           Boucle loop
 *========================================================================**/


function drawloop(game : PongGame, timestamp: number) 
{

	const currentTime = timestamp;

	const dt = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
    lastTimestamp = timestamp;

 	handleInput(game, dt);

	if (game.isAi != 0)
		handleAI(game, game.isAi, currentTime);

	drawField(game.ctx, game.width, game.height, game.colorGame);
	drawBall(game);
	updateBall(game);
	drawPaddle(game.ctx, game.leftPaddleX, game.leftPaddleY, game.paddleWidth, game.paddleHeight);
	drawPaddle(game.ctx, game.rightPaddleX, game.rightPaddleY, game.paddleWidth, game.paddleHeight);
	drawScoreInCamp(game);
	drawScoreTop("left", game.player1name, game.scoreA);
	drawScoreTop("right", game.player2name, game.scoreB);

	if (game.scoreA === game.matchpoint || game.scoreB === game.matchpoint){
		game.endGame();
		drawWin(game); 
		game.endParty = true
		return;
	}

}

/**========================================================================
*                           Mouvement des raquettes
*========================================================================**/


function handleInput(game: PongGame, dt: number) {
	if (game.keys["w"]) 
		game.leftPaddleY -= MV_PADDLE * dt;
	if (game.keys["s"]) 
		game.leftPaddleY += MV_PADDLE * dt;
	
	// Limites
	if (game.leftPaddleY < MARGIN) 
		game.leftPaddleY = MARGIN;
	if (game.leftPaddleY + game.paddleHeight >= game.height - MARGIN)
		game.leftPaddleY = game.height - game.paddleHeight - MARGIN;

	if (game.isAi === 0){
		if (game.keys["arrowup"]) 
			game.rightPaddleY -= MV_PADDLE * dt;
		if (game.keys["arrowdown"]) 
			game.rightPaddleY += MV_PADDLE * dt;
	// Limites
		if (game.rightPaddleY < MARGIN) 
			game.rightPaddleY = MARGIN;
		if (game.rightPaddleY + game.paddleHeight >= game.height - MARGIN) 
			game.rightPaddleY = game.height - game.paddleHeight - MARGIN;
	}
}



/**========================================================================
 *                           Balle
 *========================================================================**/

function drawBall(game : PongGame)
{
	const radius = 7
	game.ctx.beginPath();
	game.ctx.arc(game.ballX, game.ballY, radius, 0, Math.PI * 2);
	game.ctx.shadowColor = "#00ffff";
	game.ctx.shadowBlur = 15;
	game.ctx.fillStyle = "#ffffff";
	game.ctx.fill();
}

// calcul de l'angle, que la balle ne parte jamais a l hori
function normalizeAngle(angle: number): number {
	angle = angle % (2 * Math.PI);
	if (angle < 0) angle += 2 * Math.PI;
	
	const minAngle = 20 * Math.PI / 180;  
	const maxAngle = 160 * Math.PI / 180; 
	
	const deviation = Math.abs(Math.sin(angle));
	
	if (deviation > 0.9) {
		if (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) {
			angle = (angle < Math.PI / 2) ? minAngle : Math.PI - minAngle;
		} else {
			angle = (angle < 3 * Math.PI / 2) ? Math.PI + minAngle : 2 * Math.PI - minAngle;
		}
	}
	
	if (Math.cos(angle) > 0.95) { 
		angle = (angle < Math.PI) ? minAngle : 2 * Math.PI - minAngle;
	}
	if (Math.cos(angle) < -0.95) { 
		angle = (angle < Math.PI) ? Math.PI - minAngle : Math.PI + minAngle;
	}
	
	return angle;
}


function updateBall(game : PongGame)
{
	game.ballAngle = normalizeAngle(game.ballAngle);

	game.ballX += Math.cos(game.ballAngle) * game.ballSpeed;
	game.ballY += Math.sin(game.ballAngle) * game.ballSpeed;


	if (game.ballY <= MARGIN) {
		game.ballY = MARGIN;
		game.ballAngle = 2 * Math.PI - game.ballAngle;	
	}
	if (game.ballY > game.height - MARGIN) {
		game.ballY = game.height - MARGIN;
		game.ballAngle = 2 * Math.PI - game.ballAngle;
	}

	//gestion des raquettes
	if (Math.cos(game.ballAngle) > 0
	&& game.ballX >= game.width - 40 
	&& game.ballY >= game.rightPaddleY 
	&& game.ballY <= game.rightPaddleY + game.paddleHeight) 
	{
		const hitPosition = (game.ballY - game.rightPaddleY) / game.paddleHeight;
		const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
		game.ballAngle = Math.PI - game.ballAngle + angleVariation;
		game.ballX = game.width - 41;
		game.ballTouch++;
		if (game.ballTouch % 2 === 0){
			game.ballSpeed += 1}
	}

	else if (Math.cos(game.ballAngle) < 0
	&& game.ballX <= 40 
	&& game.ballY >= game.leftPaddleY 
	&& game.ballY <= game.leftPaddleY + game.paddleHeight) 
	{
		const hitPosition = (game.ballY - game.leftPaddleY) / game.paddleHeight;
		const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
		game.ballAngle = Math.PI - game.ballAngle + angleVariation;
		game.ballX = 41;
		game.ballTouch++;
		if (game.ballTouch % 4 === 0){
			game.ballSpeed += 1}
	}

	else if (game.ballX >= game.width) {
		game.ballX = game.width / 2;
		game.ballY = game.height / 2;
	   	game.ballAngle = (135 * Math.PI) / 180;
		if (game.ballSpeed > 4)
			game.ballSpeed -= 1;
		game.scoreA ++;
	}
	else if (game.ballX <= 0) {
		game.ballX = game.width / 2;
		game.ballY = game.height / 2;
	   	game.ballAngle = 45;
		if (game.ballSpeed > 4)
			game.ballSpeed -= 1;
		game.scoreB ++;
	}
}

/**========================================================================
 *                           Fonction dessin du terrain
 *========================================================================**/


function drawField(ctx: CanvasRenderingContext2D, width: number, height: number, color: string) {
	ctx.fillStyle = "#000"; 
	ctx.fillRect(0, 0, width, height);

	let	color1 : string;
	let	color2 : string;
	let	color3 : string;
	let	color4 : string;

	switch(color)
	{
		case "bleu":
			color1 = "#00ffff";
			color2 = "#00aaff";
			color3 = "#0077ff";
			color4 = "#0055ff";
			break;
		case "red":
			color1 = "#55ff55";
			color2 = "#ff3333";
			color3 = "#ff1111";
			color4 = "#ff0000";
			break;
		case "green":
			color1 = "#ff5555";
			color2 = "#33ff33";
			color3 = "#11ff11";
			color4 = "#00ff00";
			break;
		default: // blue
			color1 = "#00ffff";
			color2 = "#00aaff";
			color3 = "#0077ff";
			color4 = "#0055ff";
			break;
	}

	ctx.save();

	ctx.shadowColor = color1;
	ctx.shadowBlur = 60;
	ctx.strokeStyle = color1 + "CC";
	ctx.lineWidth = 4;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 10;
	ctx.strokeRect(5, 5, width - 10, height - 10);

	ctx.shadowColor = color2;
	ctx.shadowBlur = 60;
	ctx.strokeStyle = color2 + "CC";
	ctx.lineWidth = 4;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 10;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 20;
	ctx.strokeRect(5, 5, width - 10, height - 10);

	ctx.shadowColor = color3;
	ctx.shadowBlur = 60;
	ctx.strokeStyle = color2 + "CC";
	ctx.lineWidth = 4;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 20;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 10;
	ctx.strokeRect(5, 5, width - 10, height - 10);

	ctx.shadowColor = color4;
	ctx.shadowBlur = 60;
	ctx.strokeStyle = color4 + "CC";
	ctx.lineWidth = 4;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 10;
	ctx.strokeRect(5, 5, width - 10, height - 10);
	ctx.shadowBlur = 20;
	ctx.strokeRect(5, 5, width - 10, height - 10);

	ctx.shadowColor = "#ffffff";
	ctx.shadowBlur = 60;
	ctx.strokeStyle = "#ffffff";
	ctx.lineWidth = 3;
	ctx.strokeRect(0, 0, width, height);
	ctx.shadowBlur = 10;
	ctx.strokeRect(0, 0, width, height);
	ctx.shadowBlur = 20;
	ctx.strokeRect(0, 0, width, height);

	ctx.restore();

	// Ligne centrale
	ctx.beginPath();
	ctx.setLineDash([15, 10]);
	ctx.moveTo(width / 2, 0);
	ctx.lineTo(width / 2, height);
	ctx.strokeStyle = "rgba(255,255,255,0.3)";
	ctx.lineWidth = 3;
	ctx.stroke();
	ctx.setLineDash([]);
}

/**========================================================================
 *                           Fonction pour raquettes
 *========================================================================**/

function drawPaddle(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	paddleWidth: number,
	paddleHeight: number
) 
{
	ctx.save();
	ctx.shadowColor = "#00ffff";
	ctx.shadowBlur = 15;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(x, y, paddleWidth, paddleHeight);
	ctx.restore();
}

/**========================================================================
 *                           Score & Player Name
 *========================================================================**/
function drawScoreInCamp(game: PongGame) 
{
	const ctx = game.ctx;

	ctx.font = "bold 60px 'Press Start 2P', monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "center"; 
	ctx.textBaseline = "top"; 

	const middleX = game.width / 2;

	//score
	ctx.globalAlpha = 0.15;   
	//joueur 1
	ctx.fillText(game.scoreA.toString(), middleX - 200, 250);
	//joueur 2
	ctx.fillText(game.scoreB.toString(), middleX + 200, 250);
	ctx.globalAlpha = 1;


	// player name
	ctx.font = "bold 20px 'Press Start 2P', monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "center"; 
	ctx.textBaseline = "top"; 
	ctx.globalAlpha = 0.15;  
	ctx.fillText(game.player1name, middleX - 200, 150);
	ctx.fillText(game.player2name, middleX + 200, 150);
	ctx.globalAlpha = 1;

}

function drawScoreTop(side: "left" | "right", playerName: string, score: number) 
{
	const scoreBox = document.getElementById(`score-${side}`);
	if (!scoreBox) return;

	const nameSpan = scoreBox.querySelector("span.text-sm") as HTMLElement;
	const scoreSpan = scoreBox.querySelector("span.text-3xl") as HTMLElement;

	if (nameSpan) nameSpan.textContent = playerName;
	if (scoreSpan) scoreSpan.textContent = score.toString();
}

/**========================================================================
 *                           Before start
 *========================================================================**/


function drawStart(game: PongGame)
{
	const ctx = game.ctx;

	ctx.font = "bold 40px 'Press Start 2P', monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "center"; 
	ctx.textBaseline = "top"; 

	ctx.fillText("Please press", game.width / 2, 125);
	ctx.fillText("ENTER", game.width / 2, 225);
	ctx.fillText("to start", game.width / 2, 325);

}

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
	function handler(e: KeyboardEvent) {
		if (e.key === "Enter") 
		{
			window.removeEventListener("keydown", handler);
			resolve();
		}
	}
	window.addEventListener("keydown", handler);
  });
}

function drawWin(game: PongGame)
{
	const ctx = game.ctx;
	let winner: number

	ctx.font = "bold 60px 'Press Start 2P', monospace";
	ctx.fillStyle = "white";
	ctx.textAlign = "center"; 
	ctx.textBaseline = "top"; 

	if (game.scoreA > game.scoreB){
		ctx.fillText(game.player1name, game.width / 2, 200);
		ctx.fillText("WIN", game.width / 2, 300);
		winner = game.player1Id;
	}
	else{
		ctx.fillText(game.player2name, game.width / 2, 200);
		ctx.fillText("WIN", game.width / 2, 300);
		winner = game.player2Id;
	}

	if (!game.isTournament && game.player1Id > 0 && game.player2Id > 0)
	{
		const payload = game.toApiPayload(winner);


		if (game.player1Id > 0 && game.player2Id > 0) {
			fetch("/api-game/v1/matchs_history/new_match", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})
			.then(async (res) => {
			if (!res.ok) {
				throw new Error(`❌ Erreur API : ${res.status}`);
			}
			const data = await res.json();
			})
			.catch((err) => console.error("Erreur API :", err));
		}
	}
}



/**========================================================================
 *                           Menu couleur
 *========================================================================**/
function createColorMenu(game: PongGame){
  const colorSelect = document.getElementById("color-select") as HTMLSelectElement;
	if (colorSelect) {
		colorSelect.addEventListener("change", (e) => {
			const target = e.target as HTMLSelectElement;
			game.colorGame = target.value;
			game.ctx.clearRect(0, 0, game.width, game.height);
			drawField(game.ctx, game.width, game.height, game.colorGame);
			drawStart(game);
		});
	}
}

/**========================================================================
 *                           Fonction clean game
 *========================================================================**/

function cleanupPongGame(isTournament = false) {
	if (animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}

	window.removeEventListener("keydown", handleKeyDown);
	window.removeEventListener("keyup", handleKeyUp);

	lastTimestamp = 0;
	currentGame = null;

	if (isTournament) {
		const gameDiv = document.getElementById("game-container");
		if (gameDiv) gameDiv.innerHTML = "";
	}
}
