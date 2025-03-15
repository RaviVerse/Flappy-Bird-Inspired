// Game Variables
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 20;
canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight - 20;

let bird, pipes, score, highScore, gravity, velocity, gameRunning, countdownTimer;
let pipeGap = 150;
const pipeWidth = 60;
let pipeSpeed = 3;
let countdown = 3;

// Get High Score from Local Storage & Show on Start
highScore = localStorage.getItem("highScore") || 0;
document.getElementById("high-score").innerText = "Best Score: " + highScore;
document.getElementById("high-scores").innerText = "Best Score: " + highScore;

// Load Sounds
const jumpSound = new Audio("assets/jump.mp3");
const scoreSound = new Audio("assets/score.mp3");
const hitSound = new Audio("assets/hit.mp3");
const countdownBeep = new Audio("assets/countdown.mp3");
const goSound = new Audio("assets/hit.mp3");

// Ensure Audio Loads
jumpSound.load();
scoreSound.load();
hitSound.load();
countdownBeep.load();
goSound.load();

// Bird Object
function createBird() {
    return {
        x: 50,
        y: canvas.height / 2,
        width: 30,
        height: 30,
        velocityY: 0,
        jump: -6,
    };
}

// Pipe Object
function createPipe(x) {
    let height = Math.random() * (canvas.height / 2);
    return {
        x: x,
        topHeight: height,
        bottomY: height + pipeGap,
        passed: false,
        opacity: 0, // For fade-in animation
    };
}

// Reset Game
function resetGame() {
    clearInterval(countdownTimer);
    bird = createBird();
    pipes = [createPipe(canvas.width)];
    score = 0;
    gravity = 0.25;
    velocity = 0;
    pipeSpeed = 3;
    pipeGap = 150;
    gameRunning = false;
    countdown = 3;

    document.getElementById("score").innerText = "Score: 0";
    document.getElementById("game-over-screen").classList.add("hidden");
    document.getElementById("start-screen").classList.remove("hidden");
    document.getElementById("high-score").innerText = "Best Score: " + highScore;
}

// Start Countdown with Sound
function startCountdown() {
    clearInterval(countdownTimer);
    countdown = 3;
    document.getElementById("start-screen").innerHTML = `<h1>${countdown}</h1>`;

    countdownTimer = setInterval(() => {
        playSound(countdownBeep);
        countdown--;
        document.getElementById("start-screen").innerHTML = `<h1>${countdown > 0 ? countdown : "Go!"}</h1>`;

        if (countdown <= 0) {
            playSound(goSound);
            clearInterval(countdownTimer);
            startGame();
        }
    }, 1000);
}

// Start Game
function startGame() {
    gameRunning = true;
    document.getElementById("start-screen").classList.add("hidden");
    loop();
}

// Game Loop
function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bird Flap Animation
    bird.velocityY += gravity;
    bird.y += bird.velocityY + Math.sin(Date.now() / 100) * 0.5; // Subtle up-down motion
    ctx.fillStyle = "yellow";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);

    // Pipe Mechanics
    pipes.forEach((pipe, index) => {
        pipe.x -= pipeSpeed;
        pipe.opacity = Math.min(pipe.opacity + 0.05, 1); // Fade-in effect

        // Top Pipe
        ctx.fillStyle = `rgba(0, 128, 0, ${pipe.opacity})`;
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.topHeight);

        // Bottom Pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipeWidth, canvas.height - pipe.bottomY);

        // Collision Detection
        if (
            bird.x < pipe.x + pipeWidth &&
            bird.x + bird.width > pipe.x &&
            (bird.y < pipe.topHeight || bird.y + bird.height > pipe.bottomY)
        ) {
            endGame();
        }

        // Score Update
        if (!pipe.passed && bird.x > pipe.x + pipeWidth) {
            pipe.passed = true;
            score++;
            document.getElementById("score").innerText = "Score: " + score;

            // Score Pop Animation
            document.getElementById("score").style.transform = "scale(1.3)";
            setTimeout(() => {
                document.getElementById("score").style.transform = "scale(1)";
            }, 200);

            // Score Sound
            playSound(scoreSound);

            // Adjust Difficulty Gradually
            if (score % 5 === 0) {
                pipeSpeed += 0.2;
                pipeGap = Math.max(pipeGap - 5, 100);
            }
        }

        // Remove Pipes Out of Screen
        if (pipe.x + pipeWidth < 0) {
            pipes.splice(index, 1);
        }
    });

    // Add New Pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        pipes.push(createPipe(canvas.width));
    }

    // Ground Collision
    if (bird.y + bird.height > canvas.height) {
        endGame();
    }

    requestAnimationFrame(loop);
}

// Bird Jump with Sound
function jump() {
    if (!gameRunning) return;
    bird.velocityY = bird.jump;
    playSound(jumpSound);
}

// Play Sound Helper
function playSound(sound) {
    sound.pause();
    sound.currentTime = 0;
    sound.play().catch(error => console.log("Audio play error:", error));
}

// End Game
function endGame() {
    gameRunning = false;
    playSound(hitSound);
    document.getElementById("game-over-screen").classList.remove("hidden");
    document.getElementById("final-score").innerText = "Score: " + score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
    }
    document.getElementById("high-score").innerText = "Best Score: " + highScore;
}

// Restart Game
function restartGame() {
    document.getElementById("game-over-screen").classList.add("hidden");
    resetGame();
    startCountdown();
}

// Event Listeners
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") jump();
});
document.getElementById("start-btn").addEventListener("click", startCountdown);
document.getElementById("restart-btn").addEventListener("click", restartGame);
canvas.addEventListener("click", jump);
canvas.addEventListener("touchstart", jump); // Enable touch controls

// Resize canvas on window resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth > 480 ? 480 : window.innerWidth - 20;
    canvas.height = window.innerHeight > 640 ? 640 : window.innerHeight - 20;
    resetGame();
});

// Initialize Game
resetGame();
