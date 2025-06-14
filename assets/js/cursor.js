const dot = document.querySelector(".cursor-dot");
const circle = document.querySelector(".cursor-circle");
const interactiveElements = document.querySelectorAll("a, button, .card");

let dotX = 0, dotY = 0;
let circleX = 0, circleY = 0;

document.addEventListener("mousemove", (e) => {
  dotX = e.clientX;
  dotY = e.clientY;
  dot.style.left = dotX + "px";
  dot.style.top = dotY + "px";
});

function animateCircle() {
  circleX += (dotX - circleX) * 0.1;
  circleY += (dotY - circleY) * 0.1;
  circle.style.left = circleX + "px";
  circle.style.top = circleY + "px";
  requestAnimationFrame(animateCircle);
};

animateCircle();

// Hover effect sobre links
interactiveElements.forEach(link => {
  link.addEventListener("mouseenter", () => {
    document.body.classList.add("hover-effect");
  });
  link.addEventListener("mouseleave", () => {
    document.body.classList.remove("hover-effect");
  });
  
});