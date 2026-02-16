let score = 0;
let time = 10;
let timer = null;
let playing = false;

const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const btn = document.getElementById('btn');
const start = document.getElementById('start');

btn.disabled = true;

start.addEventListener('click', startGame);
btn.addEventListener('click', addPoint);

function startGame() {
  score = 0;
  time = 10;
  playing = true;

  scoreEl.textContent = score;
  timeEl.textContent = time;

  btn.disabled = false;
  start.disabled = true;

  timer = setInterval(() => {
    time--;
    timeEl.textContent = time;

    if (time === 0) {
      endGame();
    }
  }, 1000);
}

function addPoint() {
  if (!playing) return;
  score++;
  scoreEl.textContent = score;
}

function endGame() {
  clearInterval(timer);
  playing = false;
  btn.disabled = true;
  start.disabled = false;

  alert(`Fim de jogo! Você fez ${score} pontos.`);
}
