const MV_PADDLE = 5;
const MARGIN = 8;
/**========================================================================
 *                           Init raquettes et Canva
 *========================================================================**/
class PongGame {
    constructor(canvas) {
        this.infosDiv = null;
        this.keys = {};
        this.canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Contexte introuvable");
        this.ctx = ctx;
        this.infosDiv = document.getElementById("pong-infos");
        this.width = canvas.width;
        this.height = canvas.height;
        this.scoreA = 0;
        this.scoreB = 0;
        this.paddleHeight = 50;
        this.paddleWidth = 5;
        this.rightPaddle1Y = (this.height - this.paddleHeight) / 4;
        this.rightPaddle1X = this.width - 30 - this.paddleWidth;
        this.rightPaddle2Y = 3 * (this.height - this.paddleHeight) / 4;
        this.rightPaddle2X = this.width - 30 - this.paddleWidth;
        this.leftPaddle1Y = (this.height - this.paddleHeight) / 4;
        this.leftPaddle1X = 30;
        this.leftPaddle2Y = 3 * (this.height - this.paddleHeight) / 4;
        this.leftPaddle2X = 30;
        this.balls =
            [
                { x: this.width / 2 + 5, y: this.height / 2, angle: Math.PI / 3 },
                { x: this.width / 2 - 5, y: this.height / 2, angle: Math.PI / 5 + Math.PI },
            ];
        this.nbBalls = 1;
        this.ballSpeed = 4;
        this.ballTouch = 1;
        this.ballDX = 1;
        this.player1pts = 0;
        this.player2pts = 0;
        this.player1name = "Team 1";
        this.player2name = "Team 2";
    }
}
/**========================================================================
 *                           fonction de depart
 *=============================	===========================================**/
export async function renderPongFourPlayers() {
    const app = document.getElementById("app");
    if (!app)
        return;
    app.innerHTML = `
	<div class="h-screen flex flex-col items-center justify-center relative">
	
	 <!-- BARRE DE SCORE -->
<div id="score-left"
	   class="absolute top-24 w-32 h-20 bg-gray-900 text-white flex flex-col items-center justify-center rounded-lg border-2 border-gray-500 shadow-lg"
	   style="left: 40%; transform: translateX(-50%);">
	<span class="text-sm font-semibold">Player 1</span>
	<span class="text-3xl font-bold">0</span>
  </div>

	  <div id="score-right"
	   class="absolute top-24 w-32 h-20 bg-gray-900 text-white flex flex-col items-center justify-center rounded-lg border-2 border-gray-500 shadow-lg"
	   style="left: 60%;  transform: translateX(-50%);">
	<span class="text-sm font-semibold">Player 2</span>
	<span class="text-3xl font-bold">0</span>
  </div>

	<!-- TERRAIN -->
	<canvas id="pong" width="800" height="500"
		class="rounded-lg bg-black border border-gray-500 z-20"></canvas>
	
	<!-- BACK HOME -->
	<button id="back-home" class="mt-4 bg-sky-800 hover:bg-sky-900 text-white font-semibold py-2 px-4 rounded-md transition-colors z-20">
		← Retour
	</button>

	<!-- DEBUG -->
	<div id="pong-infos" 
		style="position: absolute; top: 10px; left: 10px; color: white; font-family: monospace; z-index: 30;">
		</div>
	</div>`;
    const backBtn = document.getElementById("back-home");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.location.href = "/";
        });
    }
    const scoreLeft = document.getElementById("score-left");
    const scoreRight = document.getElementById("score-right");
    const canvas = document.getElementById("pong");
    if (!canvas)
        return;
    const infosDiv = document.getElementById("pong-infos");
    const game = new PongGame(canvas);
    // Gestion du clavier
    window.addEventListener("keydown", (e) => {
        game.keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener("keyup", (e) => {
        game.keys[e.key.toLowerCase()] = false;
    });
    document.fonts.load("40px 'Press Start 2P'").then(() => {
        drawField(game.ctx, game.width, game.height);
        drawStart(game);
    });
    await waitForEnter(game);
    drawloop(game);
}
/**========================================================================
 *                           Boucle loop
 *========================================================================**/
function drawloop(game) {
    if (game.infosDiv) {
        game.infosDiv.innerHTML = `
				Vitesse balle: ${game.ballSpeed}<br>
				Nombre de touche : ${game.ballTouch}<br>
				Vitesse de la bblle  : ${game.ballSpeed}<br>
				Score A : ${game.scoreA}<br>
				Score B : ${game.scoreB}<br>
			`;
    }
    handleInput(game);
    drawField(game.ctx, game.width, game.height);
    if (game.nbBalls >= 1) {
        drawBall(game, game.balls[0]);
        updateBall(game, game.balls[0]);
    }
    if (game.nbBalls >= 2) {
        drawBall(game, game.balls[1]);
        updateBall(game, game.balls[1]);
    }
    drawPaddle(game.ctx, game.leftPaddle1X, game.leftPaddle1Y, game.paddleWidth, game.paddleHeight);
    drawPaddle(game.ctx, game.leftPaddle2X, game.leftPaddle2Y, game.paddleWidth, game.paddleHeight);
    drawPaddle(game.ctx, game.rightPaddle1X, game.rightPaddle1Y, game.paddleWidth, game.paddleHeight);
    drawPaddle(game.ctx, game.rightPaddle2X, game.rightPaddle2Y, game.paddleWidth, game.paddleHeight);
    drawScoreInCamp(game);
    drawScoreTop("left", "Team 1", game.scoreA);
    drawScoreTop("right", "Team 2", game.scoreB);
    if (game.scoreA === 5 || game.scoreB === 5) {
        drawWin(game);
        return;
    }
    requestAnimationFrame(() => drawloop(game));
}
/**========================================================================
*                           Mouvement des raquettes
*========================================================================**/
function handleInput(game) {
    //paddle 1
    if (game.keys["q"])
        game.leftPaddle1Y -= MV_PADDLE;
    if (game.keys["a"])
        game.leftPaddle1Y += MV_PADDLE;
    if (game.leftPaddle1Y < MARGIN)
        game.leftPaddle1Y = MARGIN;
    if (game.leftPaddle1Y + game.paddleHeight >= game.height / 2)
        game.leftPaddle1Y = game.height / 2 - game.paddleHeight;
    //paddle 2
    if (game.keys["r"])
        game.leftPaddle2Y -= MV_PADDLE;
    if (game.keys["f"])
        game.leftPaddle2Y += MV_PADDLE;
    if (game.leftPaddle2Y < game.height / 2)
        game.leftPaddle2Y = game.height / 2;
    if (game.leftPaddle2Y + game.paddleHeight >= game.height - MARGIN)
        game.leftPaddle2Y = game.height - game.paddleHeight - MARGIN;
    //paddle 3
    if (game.keys["arrowup"])
        game.rightPaddle1Y -= MV_PADDLE;
    if (game.keys["arrowdown"])
        game.rightPaddle1Y += MV_PADDLE;
    if (game.rightPaddle1Y < MARGIN)
        game.rightPaddle1Y = MARGIN;
    if (game.rightPaddle1Y + game.paddleHeight >= game.height / 2)
        game.rightPaddle1Y = game.height / 2 - game.paddleHeight;
    //paddle 4
    if (game.keys["o"])
        game.rightPaddle2Y -= MV_PADDLE;
    if (game.keys["l"])
        game.rightPaddle2Y += MV_PADDLE;
    if (game.rightPaddle2Y < game.height / 2)
        game.rightPaddle2Y = game.height / 2;
    if (game.rightPaddle2Y + game.paddleHeight >= game.height - MARGIN)
        game.rightPaddle2Y = game.height - game.paddleHeight - MARGIN;
    // Limites
}
/**========================================================================
 *                           Balle
 *========================================================================**/
/**========================================================================
 *                           Balle
 *========================================================================**/
function drawBall(game, ball) {
    const radius = 7;
    game.ctx.beginPath();
    game.ctx.arc(ball.x, ball.y, radius, 0, Math.PI * 2);
    game.ctx.shadowColor = "#00ffff";
    game.ctx.shadowBlur = 15;
    game.ctx.fillStyle = "#ffffff";
    game.ctx.fill();
}
// calcul de l'angle, que la balle ne parte jamais a l horizontale
function normalizeAngle(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0)
        angle += 2 * Math.PI;
    const minAngle = 20 * Math.PI / 180;
    const maxAngle = 160 * Math.PI / 180;
    const deviation = Math.abs(Math.sin(angle));
    if (deviation > 0.9) {
        if (angle < Math.PI / 2 || angle > 3 * Math.PI / 2) {
            angle = (angle < Math.PI / 2) ? minAngle : Math.PI - minAngle;
        }
        else {
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
function updateBall(game, ball) {
    ball.angle = normalizeAngle(ball.angle);
    ball.x += Math.cos(ball.angle) * game.ballSpeed;
    ball.y += Math.sin(ball.angle) * game.ballSpeed;
    if (ball.y <= MARGIN) {
        ball.y = MARGIN;
        ball.angle = 2 * Math.PI - ball.angle;
    }
    if (ball.y > game.height - MARGIN) {
        ball.y = game.height - MARGIN;
        ball.angle = 2 * Math.PI - ball.angle;
    }
    //gestion des raquettes
    // paddle 1
    if (Math.cos(ball.angle) > 0
        && ball.x >= game.width - 40
        && ball.y >= game.rightPaddle1Y
        && ball.y <= game.rightPaddle1Y + game.paddleHeight) {
        const hitPosition = (ball.y - game.rightPaddle1Y) / game.paddleHeight;
        const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
        ball.angle = Math.PI - ball.angle + angleVariation;
        ball.x = game.width - 41;
        game.ballTouch++;
        if (game.ballTouch % 2 === 0) {
            game.ballSpeed += 0.05;
        }
    }
    //paddle 2
    if (Math.cos(ball.angle) > 0
        && ball.x >= game.width - 40
        && ball.y >= game.rightPaddle2Y
        && ball.y <= game.rightPaddle2Y + game.paddleHeight) {
        const hitPosition = (ball.y - game.rightPaddle2Y) / game.paddleHeight;
        const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
        ball.angle = Math.PI - ball.angle + angleVariation;
        ball.x = game.width - 41;
        game.ballTouch++;
        if (game.ballTouch % 2 === 0) {
            game.ballSpeed += 0.05;
        }
    }
    //paddle 3
    else if (Math.cos(ball.angle) < 0
        && ball.x <= 40
        && ball.y >= game.leftPaddle1Y
        && ball.y <= game.leftPaddle1Y + game.paddleHeight) {
        const hitPosition = (ball.y - game.leftPaddle1Y) / game.paddleHeight;
        const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
        ball.angle = Math.PI - ball.angle + angleVariation;
        ball.x = 41;
        game.ballTouch++;
        if (game.ballTouch % 4 === 0) {
            game.ballSpeed += 0.5;
        }
    }
    //paddle 4
    else if (Math.cos(ball.angle) < 0
        && ball.x <= 40
        && ball.y >= game.leftPaddle2Y
        && ball.y <= game.leftPaddle2Y + game.paddleHeight) {
        const hitPosition = (ball.y - game.leftPaddle2Y) / game.paddleHeight;
        const angleVariation = (hitPosition - 0.5) * Math.PI / 3;
        ball.angle = Math.PI - ball.angle + angleVariation;
        ball.x = 41;
        game.ballTouch++;
        if (game.ballTouch % 4 === 0) {
            game.ballSpeed += 0.5;
        }
    }
    else if (ball.x >= game.width) {
        ball.x = game.width / 2;
        ball.y = game.height / 2;
        ball.angle = (135 * Math.PI) / 180;
        game.scoreA++;
    }
    else if (ball.x <= 0) {
        ball.x = game.width / 2;
        ball.y = game.height / 2;
        ball.angle = 45;
        game.scoreB++;
    }
}
/**========================================================================
 *                           Fonction dessin du terrain
 *========================================================================**/
function drawFieldRed(ctx, width, height) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "#ff5555";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(255, 85, 85, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#ff2222";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(255, 34, 34, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#aa0000";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(170, 0, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
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
function drawFieldGreen(ctx, width, height) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "#55ff55";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(85, 255, 85, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#22ff22";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(34, 255, 34, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#00ff00";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#00aa00";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 170, 0, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
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
function drawField(ctx, width, height) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "#00ffff";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#00ffff";
    ctx.lineWidth = 4;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(0, 255, 255, 0.8)";
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 170, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#00aaff";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(0, 170, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#0077ff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 120, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#0077ff";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(0, 120, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#0055ff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "rgba(0, 100, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#0055ff";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "rgba(0, 100, 255, 0.8)";
    ctx.lineWidth = 4;
    ctx.strokeRect(5, 5, width - 10, height - 10);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 60;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
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
function drawPaddle(ctx, x, y, paddleWidth, paddleHeight) {
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
function drawScoreInCamp(game) {
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
function drawScoreTop(side, playerName, score) {
    const scoreBox = document.getElementById(`score-${side}`);
    if (!scoreBox)
        return;
    const nameSpan = scoreBox.querySelector("span.text-sm");
    const scoreSpan = scoreBox.querySelector("span.text-3xl");
    if (nameSpan)
        nameSpan.textContent = playerName;
    if (scoreSpan)
        scoreSpan.textContent = score.toString();
}
/**========================================================================
 *                           Before start
 *========================================================================**/
function drawStart(game) {
    const ctx = game.ctx;
    ctx.font = "bold 30px 'Press Start 2P', monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Please press", game.width / 2, 100);
    ctx.fillText("ENTER", game.width / 2, 150);
    ctx.fillText("to start", game.width / 2, 200);
    ctx.fillText("- 4 players mode - ", game.width / 2, 250);
    ctx.fillText("(press SPACE for 2 balls)", game.width / 2, 350);
}
function waitForEnter(game) {
    return new Promise((resolve) => {
        let handled = false;
        function cleanup() {
            window.removeEventListener("keydown", handler);
        }
        function handler(e) {
            if (e.code === "Space") {
                e.preventDefault();
                if (handled)
                    return;
                handled = true;
                game.nbBalls = 2;
                cleanup();
                resolve();
                return;
            }
            if (e.code === "Enter") {
                e.preventDefault();
                if (handled)
                    return;
                handled = true;
                cleanup();
                resolve();
                return;
            }
        }
        window.addEventListener("keydown", handler);
    });
}
function drawWin(game) {
    const ctx = game.ctx;
    ctx.font = "bold 60px 'Press Start 2P', monospace";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    if (game.scoreA > game.scoreB)
        ctx.fillText("Team 1 WIN", game.width / 2, 200);
    else
        ctx.fillText("Team 2 WIN", game.width / 2, 200);
}
