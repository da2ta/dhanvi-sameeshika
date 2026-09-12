// Dhanvi & Sameeshika 💌 - Interactive Script & Visual FX Engine

// State Management
let audioEnabled = true;
let audioCtx = null;

// Initialize Web Audio Context on user interaction safely
function getAudioContext() {
  try {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch (e) {
    console.warn('Audio context init error:', e);
  }
  return audioCtx;
}

// Synthesize soft audio chimes (Web Audio API)
function playTone(freq, type = 'sine', duration = 0.3, gainVal = 0.08) {
  if (!audioEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent catch if audio is blocked by browser
  }
}

// Sound FX Presets
function playSound(effect) {
  if (!audioEnabled) return;
  try {
    if (effect === 'click') {
      playTone(523.25, 'sine', 0.15, 0.06); // C5
    } else if (effect === 'reveal') {
      playTone(587.33, 'sine', 0.2, 0.07); // D5
      setTimeout(() => playTone(880, 'sine', 0.3, 0.08), 100); // A5
    } else if (effect === 'celebrate') {
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
      notes.forEach((freq, idx) => {
        setTimeout(() => playTone(freq, 'sine', 0.4, 0.08), idx * 120);
      });
    }
  } catch (e) {}
}

// Sound Toggle Handler
function toggleSound() {
  audioEnabled = !audioEnabled;
  const btn = document.getElementById('sound-toggle');
  if (btn) {
    btn.innerHTML = audioEnabled 
      ? '<span class="sound-icon">🔊</span> Sound On' 
      : '<span class="sound-icon">🔇</span> Sound Off';
  }
  if (audioEnabled) {
    playSound('click');
  }
}

// --- CANVAS FLOATING HEARTS & PARTICLES SYSTEM ---
const canvas = document.getElementById('heart-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let width = window.innerWidth;
let height = window.innerHeight;
let particles = [];
let confetti = [];

function resizeCanvas() {
  if (!canvas) return;
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const heartEmojis = ['💗', '♡', '🌷', '💞', '✨', '🌸', '💖', '🫶🏻'];

class FloatingHeart {
  constructor(x, y) {
    this.x = x !== undefined ? x : Math.random() * width;
    this.y = y !== undefined ? y : height + Math.random() * 100;
    this.emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    this.size = Math.random() * 16 + 14;
    this.speedY = Math.random() * 1.2 + 0.6;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.swingSpeed = Math.random() * 0.02 + 0.01;
    this.swingAmount = Math.random() * 2 + 1;
    this.opacity = Math.random() * 0.5 + 0.3;
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    this.angle += this.swingSpeed;
    this.x += Math.sin(this.angle) * this.swingAmount + this.speedX;
    this.y -= this.speedY;

    if (this.y < -50) {
      this.y = height + 50;
      this.x = Math.random() * width;
    }
  }

  draw() {
    if (!ctx) return;
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.font = `${this.size}px sans-serif`;
    ctx.fillText(this.emoji, this.x, this.y);
    ctx.restore();
  }
}

// Confetti Particle System
class ConfettiParticle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.emoji = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
    this.size = Math.random() * 18 + 14;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 8 + 3;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed - 2;
    this.gravity = 0.15;
    this.alpha = 1;
    this.decay = Math.random() * 0.015 + 0.01;
    this.rotation = Math.random() * 360;
    this.rotSpeed = Math.random() * 6 - 3;
  }

  update() {
    this.vx *= 0.98;
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
    this.rotation += this.rotSpeed;
  }

  draw() {
    if (!ctx || this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.font = `${this.size}px sans-serif`;
    ctx.fillText(this.emoji, 0, 0);
    ctx.restore();
  }
}

// Init Canvas Floating Background
function initCanvas() {
  if (!canvas) return;
  particles = [];
  const count = Math.min(Math.floor(width / 35), 30);
  for (let i = 0; i < count; i++) {
    particles.push(new FloatingHeart(Math.random() * width, Math.random() * height));
  }
}

function animateCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  particles.forEach(p => {
    p.update();
    p.draw();
  });

  for (let i = confetti.length - 1; i >= 0; i--) {
    confetti[i].update();
    confetti[i].draw();
    if (confetti[i].alpha <= 0) {
      confetti.splice(i, 1);
    }
  }

  requestAnimationFrame(animateCanvas);
}

// Trigger Confetti Burst
function spawnConfetti(x, y, count = 40) {
  const spawnX = x !== undefined ? x : width / 2;
  const spawnY = y !== undefined ? y : height / 2;
  for (let i = 0; i < count; i++) {
    confetti.push(new ConfettiParticle(spawnX, spawnY));
  }
}

// Canvas click interaction
window.addEventListener('click', (e) => {
  if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A') {
    spawnConfetti(e.clientX, e.clientY, 8);
  }
});

// Initialize canvas
initCanvas();
animateCanvas();

// --- HIDDEN MESSAGE INTERACTION (FIXED & BULLETPROOF) ---
function showMessage(id, ev) {
  try {
    playSound('reveal');
  } catch (e) {}

  const element = document.getElementById(id);
  if (!element) {
    console.error('Element not found:', id);
    return;
  }

  const isHidden = getComputedStyle(element).display === 'none' || !element.classList.contains('show');

  if (isHidden) {
    element.classList.add('show');
    element.style.display = 'block';

    // Safely determine click position
    let clickX = width / 2;
    let clickY = height / 2;

    const eventObj = ev || (typeof event !== 'undefined' ? event : null);
    if (eventObj && eventObj.currentTarget) {
      const rect = eventObj.currentTarget.getBoundingClientRect();
      clickX = rect.left + rect.width / 2;
      clickY = rect.top + rect.height / 2;
    }

    spawnConfetti(clickX, clickY, 35);

    setTimeout(() => {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 50);
  } else {
    element.classList.remove('show');
    element.style.display = 'none';
  }
}

// --- PEACE SELECTION TOAST & CELEBRATION ---
function handlePeaceSelection(choiceText) {
  try {
    playSound('celebrate');
  } catch (e) {}

  spawnConfetti(width / 2, height / 3, 70);

  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = `${choiceText} 💖 (Dhanvi & Sameeshika)`;
    toast.classList.add('active');

    setTimeout(() => {
      toast.classList.remove('active');
    }, 4500);
  }
}

// Expose functions globally for HTML inline onclick handlers
window.showMessage = showMessage;
window.toggleSound = toggleSound;
window.handlePeaceSelection = handlePeaceSelection;
window.playSound = playSound;
