import { PongGame } from "./pong.js";

const MARGIN = 8;
const MV_PADDLE = 300;


let lastDecisionTime = 0;
let lastFrameTime = 0;
let targetY = 0;
let isInitialized = false;

export function handleAI(game: PongGame, lvlAI: number, currentTime: number) 
{
	if (lvlAI === 1) AIlvl1(game, currentTime);
	if (lvlAI === 2) AIlvl2(game, currentTime);
	if (lvlAI === 3) AIlvl3(game, currentTime);
}

/**========================================================================
 *                           Easy
 *========================================================================**/

function AIlvl1(game: PongGame, currentTime: number) {
    if (!isInitialized) {
        lastFrameTime = currentTime;
        targetY = game.ballY;
        isInitialized = true;
    }

    const REACTION_MS = 250 + Math.random() * 150; 
    const SPEED_PX_PER_SEC = MV_PADDLE; 
    const DEAD_ZONE = 6; 

    if (currentTime - lastDecisionTime >= REACTION_MS) {
        lastDecisionTime = currentTime;

        if (Math.random() < 0.6) {
            targetY = game.ballY + (Math.random() * 40 - 20); 
        }
		else
		{
            targetY = Math.random() * (game.height - game.paddleHeight - 2 * MARGIN) + 
                      MARGIN + game.paddleHeight/2;
        }
    }

    const dt = Math.max(0, (currentTime - lastFrameTime) / 1000);
    lastFrameTime = currentTime;

    const paddleCenter = game.rightPaddleY + game.paddleHeight / 2;
    const diff = targetY - paddleCenter;

    if (Math.abs(diff) <= DEAD_ZONE)
		return;

    let move = Math.sign(diff) * Math.min(Math.abs(diff), SPEED_PX_PER_SEC * dt);
    if (Math.random() < 0.05)
		move *= -1;

    game.rightPaddleY += move;

    game.rightPaddleY = Math.max(MARGIN, Math.min(game.rightPaddleY, game.height - game.paddleHeight - MARGIN));
}

/**========================================================================
 *                           Medium
 *========================================================================**/

function AIlvl2(game: PongGame, currentTime: number) {
    if (!isInitialized) {
        lastFrameTime = currentTime;
        targetY = game.ballY;
        isInitialized = true;
    }

    const REACTION_MS = 100;
    const SPEED_PX_PER_SEC = MV_PADDLE;
    const DEAD_ZONE = 4;

    if (currentTime - lastDecisionTime >= REACTION_MS) {
        lastDecisionTime = currentTime;

        if (Math.random() < 0.85) {
            targetY = game.ballY;
        } else {
            targetY = game.ballY + (Math.random() * 60 - 30);
        }
    }

    const dt = Math.max(0, (currentTime - lastFrameTime) / 1000);
    lastFrameTime = currentTime;

    const paddleCenter = game.rightPaddleY + game.paddleHeight / 2;
    const diff = targetY - paddleCenter;

    if (Math.abs(diff) <= DEAD_ZONE) return;

    const move = Math.sign(diff) * Math.min(Math.abs(diff), SPEED_PX_PER_SEC * dt);

    game.rightPaddleY += move;

    game.rightPaddleY = Math.max(
        MARGIN,
        Math.min(game.rightPaddleY, game.height - game.paddleHeight - MARGIN)
    );
}

/**========================================================================
 *                           Hard
 *========================================================================**/

function AIlvl3(game: PongGame, currentTime: number) {
    if (!isInitialized) {
        lastFrameTime = currentTime;
        targetY = game.ballY;
        isInitialized = true;
    }

    let REACTION_MS = 60;
    const SPEED_PX_PER_SEC = MV_PADDLE;


    if (currentTime - lastDecisionTime >= REACTION_MS) {
        lastDecisionTime = currentTime;

        // prédiction avec rebonds
        let predictedY = game.ballY;
        let ballX = game.ballX;
        let ballY = game.ballY;
        let dx = game.ballDX;
        let dy = Math.sin(game.ballAngle);

        while (ballX < game.width - game.paddleWidth - MARGIN) {
            ballX += dx * game.ballSpeed * 0.05;
            ballY += dy * game.ballSpeed * 0.05;

            if (ballY <= 0 || ballY >= game.height) {
                dy *= -1;
            }
        }

        predictedY = ballY;
        targetY = predictedY + (Math.random() * 20 - 10); // petite marge d’erreur
    }

    const dt = Math.max(0, (currentTime - lastFrameTime) / 1000);
    lastFrameTime = currentTime;

    const paddleCenter = game.rightPaddleY + game.paddleHeight / 2;
    const diff = targetY - paddleCenter;

    const easing = 0.25;
    const smoothDiff = diff * easing;

    const move = Math.sign(smoothDiff) * Math.min(Math.abs(smoothDiff), SPEED_PX_PER_SEC * dt);

    game.rightPaddleY += move;

    game.rightPaddleY = Math.max(MARGIN, Math.min(game.rightPaddleY, game.height - game.paddleHeight - MARGIN));
}