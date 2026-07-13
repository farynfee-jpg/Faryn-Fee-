
const views = [...document.querySelectorAll(".view")];
const navButtons = [...document.querySelectorAll("[data-target]")];

function showView(name, push = true) {
  views.forEach(view => view.classList.toggle("active", view.dataset.view === name));
  if (push) history.pushState({ view: name }, "", `#${name}`);
}

navButtons.forEach(button => {
  button.addEventListener("click", () => showView(button.dataset.target));
});

addEventListener("popstate", event => {
  showView(event.state?.view || location.hash.slice(1) || "home", false);
});

const initial = location.hash.slice(1) || "home";
showView(initial, false);
history.replaceState({ view: initial }, "", `#${initial}`);

const canvas = document.getElementById("network");
const ctx = canvas.getContext("2d");
let hoverCell = null;
let mouse = { x: innerWidth / 2, y: innerHeight / 2 };
let dpr = 1;

function resizeCanvas() {
  dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
addEventListener("resize", resizeCanvas);

function center(element) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function lightning(a, b, depth = 2, alpha = .14) {
  ctx.save();
  ctx.strokeStyle = `rgba(173,151,196,${alpha})`;
  ctx.lineWidth = .65;
  const points = [a];
  const segments = 9;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    points.push({
      x: a.x + (b.x - a.x) * t + (Math.random() - .5) * 10,
      y: a.y + (b.y - a.y) * t + (Math.random() - .5) * 10
    });
  }
  points.push(b);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y));
  ctx.stroke();

  if (depth > 0) {
    for (let i = 2; i < points.length - 2; i += 3) {
      const point = points[i];
      const angle = Math.atan2(b.y - a.y, b.x - a.x) + (Math.random() < .5 ? -1 : 1) * (.6 + Math.random() * .5);
      const length = 20 + Math.random() * 48;
      lightning(point, {
        x: point.x + Math.cos(angle) * length,
        y: point.y + Math.sin(angle) * length
      }, depth - 1, alpha * .7);
    }
  }
  ctx.restore();
}

function animateNetwork() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  if (hoverCell) lightning(center(hoverCell), mouse);
  requestAnimationFrame(animateNetwork);
}
animateNetwork();

addEventListener("pointermove", event => {
  mouse = { x: event.clientX, y: event.clientY };
});

document.querySelectorAll(".vesicle").forEach(cell => {
  cell.addEventListener("pointerenter", () => hoverCell = cell);
  cell.addEventListener("pointerleave", () => hoverCell = null);
});

const diaryButtons = [...document.querySelectorAll(".diary-open")];
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
let diaryIndex = 0;

function openDiary(index) {
  diaryIndex = (index + diaryButtons.length) % diaryButtons.length;
  lightboxImage.src = diaryButtons[diaryIndex].dataset.image;
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}

function closeDiary() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
}

diaryButtons.forEach((button, index) => button.addEventListener("click", () => openDiary(index)));
document.querySelector(".lightbox-close").addEventListener("click", closeDiary);
document.querySelector(".lightbox-prev").addEventListener("click", () => openDiary(diaryIndex - 1));
document.querySelector(".lightbox-next").addEventListener("click", () => openDiary(diaryIndex + 1));
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeDiary();
});
document.addEventListener("keydown", event => {
  if (!lightbox.classList.contains("open")) return;
  if (event.key === "Escape") closeDiary();
  if (event.key === "ArrowLeft") openDiary(diaryIndex - 1);
  if (event.key === "ArrowRight") openDiary(diaryIndex + 1);
});
