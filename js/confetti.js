const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '0';
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');
let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const colors = ['#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
const particles = [];

class FallingParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * -height; // Start above the screen
    this.size = Math.random() * 8 + 4;
    this.vy = Math.random() * 3 + 2; // Falling downward speed
    this.vx = (Math.random() - 0.5) * 2; // Slight side-to-side sway
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.rotation = Math.random() * 360;
    this.rotationSpeed = (Math.random() - 0.5) * 6;
  }

  update() {
    this.y += this.vy;
    this.x += Math.sin(this.y * 0.01) + this.vx; // Gentle wave effect
    this.rotation += this.rotationSpeed;

    // Reset particle to top when it falls past the bottom
    if (this.y > height) {
      this.reset();
      this.y = -10; // Respawn just above the viewable area
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}

// Create particle pool
for (let i = 0; i < 100; i++) {
  particles.push(new FallingParticle());
}

// Infinite animation loop
function animate() {
  ctx.clearRect(0, 0, width, height);
  for (let i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }
  requestAnimationFrame(animate);
}

animate();