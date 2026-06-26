import { updateGround,setUpGround } from "./ground.js"
import { updateDino, setUpDino, getDinoRect, setDinoLose } from "./dino.js"
import { updateCactus, setUpCactus, getCactusRect } from "./cactus.js"

const WORLD_WIDTH = 100;
const WORLD_HEIGHT = 30;
const SPEED_SCALE_INCREASE = 0.00001;

const worldElem = document.querySelector("[data-world]");
const scoreElem = document.querySelector("[data-score]");
const startElem = document.querySelector("[data-start-screen]");
const hiscoreElem = document.querySelector("[data-highscore]")

const bgMusic = new Audio("sounds/moodmode-retro-game-arcade-236133.mp3");
bgMusic.loop = true;

let highscore = Number(localStorage.getItem("highscore")) || 0;
displayHighScore();

setPixelToWorldScale();
window.addEventListener("resize", setPixelToWorldScale);
document.addEventListener("keydown", handleStart, { once: true });

setUpGround();

let lastTime;
let speedScale;
let score;
function update(time) {
    if (lastTime == null){
        lastTime = time;
        window.requestAnimationFrame(update);
        return;
    }
    const delta = time - lastTime;
    updateGround(delta, speedScale)
    updateDino(delta, speedScale);
    updateCactus(delta, speedScale);
    updateSpeedScale(delta);
    updateScore(delta);
    if (checkLose()) return handleLose();

    lastTime = time;
    window.requestAnimationFrame(update)
}

function checkLose() {
    const dinoRect = getDinoRect();
    return getCactusRect().some(rect => isCollision(rect, dinoRect));
}

function isCollision(rect1, rect2) {
    return rect1.left < rect2.right && rect1.top < rect2.bottom && rect1.right > rect2.left && rect1.bottom > rect2.top
}

function updateSpeedScale(delta) {
    speedScale += delta * SPEED_SCALE_INCREASE;
}

function updateScore(delta) {
    score += delta * 0.01
    scoreElem.textContent = Math.floor(score);

    if (score > highscore) {
        highscore = score;
        displayHighScore();
    }
}

function displayHighScore() {
    if (hiscoreElem) {
        hiscoreElem.textContent = Math.floor(highscore)
    }
}

function handleStart() {
    lastTime = null;
    score = 0;
    speedScale = 1;
    setUpGround();
    setUpDino();
    setUpCactus();
    startElem.classList.add("hide");
    bgMusic.play();
    window.requestAnimationFrame(update);
}

function setPixelToWorldScale() {
    let worldToPixelScale;
    if (window.innerWidth / window.innerHeight < WORLD_WIDTH / WORLD_HEIGHT) {
        worldToPixelScale = window.innerWidth / WORLD_WIDTH;
    }
    else {
        worldToPixelScale = window.innerHeight / WORLD_HEIGHT;
    }

    worldElem.style.width = `${WORLD_WIDTH * worldToPixelScale}px`
    worldElem.style.height = `${WORLD_HEIGHT * worldToPixelScale}px`
}

function handleLose() {
    setDinoLose();

    localStorage.setItem("highscore", Math.floor(highscore));

    const titleElem = startElem.querySelector("[data-game-title]");
    const msgElem = startElem.querySelector("[data-msg]");
    
    if (titleElem)
    {
        titleElem.textContent = "EXTINCTION";
        titleElem.classList.add("game-over")
    }
    if (msgElem) msgElem.textContent = "You became a fossil! CLAW (SPACE) to survive again!!!.";

    bgMusic.pause();
    bgMusic.currentTime = 0;

    setTimeout(() => {
        document.addEventListener("keydown", handleStart, { once: true })
        startElem.classList.remove("hide");
    }, 100)
}
