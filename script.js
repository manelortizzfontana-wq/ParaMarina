// ============================================================================
// 1. FONDO MOTEADO RETRO (Idéntico al patrón de la ilustración de referencia)
// ============================================================================
const bgCanvas = document.getElementById('bg-dots');
const bgCtx = bgCanvas.getContext('2d');

function drawSpeckledBackground() {
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;
  const height = window.innerHeight;

  bgCanvas.width = width * dpr;
  bgCanvas.height = height * dpr;
  bgCtx.scale(dpr, dpr);

  bgCtx.clearRect(0, 0, width, height);

  let seed = 192837;
  function rand() {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  const cellSize = 26;
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x1 = (c + 0.15 + rand() * 0.7) * cellSize;
      const y1 = (r + 0.15 + rand() * 0.7) * cellSize;
      const radius1 = 1.3 + rand() * 1.6;

      bgCtx.beginPath();
      bgCtx.arc(x1, y1, radius1, 0, Math.PI * 2);
      bgCtx.fillStyle = rand() > 0.3 ? 'rgba(96, 128, 180, 0.55)' : 'rgba(72, 102, 158, 0.7)';
      bgCtx.fill();

      if (rand() > 0.35) {
        const x2 = (c + rand()) * cellSize;
        const y2 = (r + rand()) * cellSize;
        const radius2 = 0.7 + rand() * 0.9;
        bgCtx.beginPath();
        bgCtx.arc(x2, y2, radius2, 0, Math.PI * 2);
        bgCtx.fillStyle = 'rgba(84, 114, 168, 0.45)';
        bgCtx.fill();
      }
    }
  }
}

window.addEventListener('resize', drawSpeckledBackground);
drawSpeckledBackground();

// ============================================================================
// 2. LÓGICA DEL BOTÓN "NO" IMPOSIBLE DE PULSAR (Móvil + Ordenador)
// ============================================================================
const btnNo = document.getElementById('btn-no');
const btnYes = document.getElementById('btn-yes');
const questionWindow = document.getElementById('question-window');
const mathWindow = document.getElementById('math-window');

let isNoEscaping = false;
let lastNoX = 0;
let lastNoY = 0;

function escapeNoButton(event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;

  if (event && event.touches && event.touches.length > 0) {
    pointerX = event.touches[0].clientX;
    pointerY = event.touches[0].clientY;
  } else if (event && typeof event.clientX === 'number') {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }

  const rect = btnNo.getBoundingClientRect();
  const btnWidth = rect.width || 76;
  const btnHeight = rect.height || 34;

  if (!isNoEscaping) {
    isNoEscaping = true;
    lastNoX = rect.left;
    lastNoY = rect.top;

    const placeholder = document.createElement('span');
    placeholder.style.width = `${btnWidth}px`;
    placeholder.style.height = `${btnHeight}px`;
    placeholder.style.display = 'inline-block';
    btnNo.parentNode.insertBefore(placeholder, btnNo);

    document.body.appendChild(btnNo);
    btnNo.classList.add('escaping');
    btnNo.style.left = `${lastNoX}px`;
    btnNo.style.top = `${lastNoY}px`;
  }

  const margin = 20;
  const minX = margin;
  const maxX = Math.max(margin, window.innerWidth - btnWidth - margin);
  const minY = margin;
  const maxY = Math.max(margin, window.innerHeight - btnHeight - margin);

  let nextX = minX;
  let nextY = minY;
  let attempts = 0;

  do {
    nextX = minX + Math.random() * (maxX - minX);
    nextY = minY + Math.random() * (maxY - minY);
    attempts++;

    const distToPointer = Math.hypot(
      nextX + btnWidth / 2 - pointerX,
      nextY + btnHeight / 2 - pointerY
    );
    const distToLast = Math.hypot(nextX - lastNoX, nextY - lastNoY);

    if (distToPointer > 110 && distToLast > 80) {
      break;
    }
  } while (attempts < 25);

  lastNoX = nextX;
  lastNoY = nextY;

  const randomTilt = (Math.random() - 0.5) * 14;
  btnNo.style.left = `${Math.round(nextX)}px`;
  btnNo.style.top = `${Math.round(nextY)}px`;
  btnNo.style.transform = `rotate(${randomTilt.toFixed(1)}deg)`;
}

btnNo.addEventListener('touchstart', escapeNoButton, { passive: false });
btnNo.addEventListener('pointerdown', escapeNoButton);
btnNo.addEventListener('mouseenter', escapeNoButton);
btnNo.addEventListener('mouseover', escapeNoButton);
btnNo.addEventListener('click', escapeNoButton);
btnNo.addEventListener('focus', () => {
  btnNo.blur();
  escapeNoButton();
});

// ============================================================================
// 3. DEFINICIÓN MATEMÁTICA DE LAS LETRAS (Para recorrido horizontal continuo)
// ============================================================================
// Cada letra está centrada localmente en x ∈ [-1.4, 1.4], y ∈ [-2.0, 2.0]
// y luego se desplaza a su posición xOffset a lo largo del eje X continuo.

const LETTER_DEFINITIONS = {
  M: {
    formula: (x0) => `y = 2 - 1.8|x - ${x0}|,  x = ${x0} ± 1.3`,
    strokes: [
      (t) => ({ x: -1.35, y: -1.9 + 3.8 * t }),
      (t) => ({ x: -1.35 + 1.35 * t, y: 1.9 - 2.1 * t }),
      (t) => ({ x: 1.35 * t, y: -0.2 + 2.1 * t }),
      (t) => ({ x: 1.35, y: 1.9 - 3.8 * t })
    ]
  },
  A: {
    formula: (x0) => `y = 1.9 - 2.9|x - ${x0}|,  y = -0.3`,
    strokes: [
      (t) => ({ x: -1.3 + 1.3 * t, y: -1.9 + 3.8 * t }),
      (t) => ({ x: 1.3 * t, y: 1.9 - 3.8 * t }),
      (t) => ({ x: -0.75 + 1.5 * t, y: -0.3 })
    ]
  },
  R: {
    formula: (x0) => `(x - ${x0})² + (y - 0.95)² = 0.95²`,
    strokes: [
      (t) => ({ x: -1.15, y: -1.9 + 3.8 * t }),
      (t) => ({ x: -1.15 + 1.0 * t, y: 1.9 }),
      (t) => {
        const theta = Math.PI / 2 - Math.PI * t;
        return {
          x: -0.15 + 1.05 * Math.cos(theta),
          y: 0.95 + 0.95 * Math.sin(theta)
        };
      },
      (t) => ({ x: -0.15 - 1.0 * t, y: 0 }),
      (t) => ({ x: -0.15 + 1.25 * t, y: -1.9 * t })
    ]
  },
  I: {
    formula: (x0) => `x = ${x0} (y ∈ [-1.9, 1.9]),  y = ±1.9`,
    strokes: [
      (t) => ({ x: -0.85 + 1.7 * t, y: 1.9 }),
      (t) => ({ x: 0, y: 1.9 - 3.8 * t }),
      (t) => ({ x: -0.85 + 1.7 * t, y: -1.9 })
    ]
  },
  N: {
    formula: (x0) => `y = -1.58(x - ${x0}),  x = ${x0} ± 1.2`,
    strokes: [
      (t) => ({ x: -1.2, y: -1.9 + 3.8 * t }),
      (t) => ({ x: -1.2 + 2.4 * t, y: 1.9 - 3.8 * t }),
      (t) => ({ x: 1.2, y: -1.9 + 3.8 * t })
    ]
  },
  E: {
    formula: (x0) => `x = ${(x0 - 1.1).toFixed(1)},  y ∈ {-1.9, 0, 1.9}`,
    strokes: [
      (t) => ({ x: -1.1, y: 1.9 - 3.8 * t }),
      (t) => ({ x: -1.1 + 2.1 * t, y: 1.9 }),
      (t) => ({ x: -1.1 + 1.7 * t, y: 0 }),
      (t) => ({ x: -1.1 + 2.1 * t, y: -1.9 })
    ]
  },
  G: {
    formula: (x0) => `x(t) = ${x0} + 1.3cos(t),  y(t) = 1.9sin(t)`,
    strokes: [
      (t) => {
        const theta = 0.22 * Math.PI + 1.78 * Math.PI * t;
        return {
          x: 1.3 * Math.cos(theta),
          y: 1.9 * Math.sin(theta)
        };
      },
      (t) => ({ x: 1.3, y: -0.95 + 0.95 * t }),
      (t) => ({ x: 1.3 - 1.15 * t, y: 0 })
    ]
  },
  U: {
    formula: (x0) => `y = 0.9(x - ${x0})² - 1.9`,
    strokes: [
      (t) => ({ x: -1.2, y: 1.9 - 2.6 * t }),
      (t) => {
        const theta = Math.PI + Math.PI * t;
        return {
          x: 1.2 * Math.cos(theta),
          y: -0.7 + 1.2 * Math.sin(theta)
        };
      },
      (t) => ({ x: 1.2, y: -0.7 + 2.6 * t })
    ]
  },
  S: {
    formula: (x0) => `x = ${x0} + 1.1cos(θ),  y = ±0.95 + 0.95sin(θ)`,
    strokes: [
      (t) => {
        const theta = 0.18 * Math.PI + 1.32 * Math.PI * t;
        return {
          x: 1.15 * Math.cos(theta),
          y: 0.95 + 0.95 * Math.sin(theta)
        };
      },
      (t) => {
        const theta = 0.5 * Math.PI - 1.35 * Math.PI * t;
        return {
          x: 1.15 * Math.cos(theta),
          y: -0.95 + 0.95 * Math.sin(theta)
        };
      }
    ]
  },
  T: {
    formula: (x0) => `y = 1.9,  x = ${x0} (y ∈ [-1.9, 1.9])`,
    strokes: [
      (t) => ({ x: -1.35 + 2.7 * t, y: 1.9 }),
      (t) => ({ x: 0, y: 1.9 - 3.8 * t })
    ]
  },
  C: {
    formula: (x0) => `x = ${x0} + 1.3cos(t),  y = 1.9sin(t)`,
    strokes: [
      (t) => {
        const theta = 0.24 * Math.PI + 1.52 * Math.PI * t;
        return {
          x: 1.3 * Math.cos(theta),
          y: 1.9 * Math.sin(theta)
        };
      }
    ]
  },
  H: {
    formula: (x0) => `x = ${x0} ± 1.2,  y = 0`,
    strokes: [
      (t) => ({ x: -1.2, y: 1.9 - 3.8 * t }),
      (t) => ({ x: 1.2, y: 1.9 - 3.8 * t }),
      (t) => ({ x: -1.2 + 2.4 * t, y: 0 })
    ]
  },
  O: {
    formula: (x0) => `(x - ${x0})²/1.3² + y²/1.9² = 1`,
    strokes: [
      (t) => {
        const theta = 0.5 * Math.PI + 2 * Math.PI * t;
        return {
          x: 1.3 * Math.cos(theta),
          y: 1.9 * Math.sin(theta)
        };
      }
    ]
  },
  Y: {
    formula: (x0) => `y = 0.1 + 1.5|x - ${x0}| (y > 0.1),  x = ${x0}`,
    strokes: [
      (t) => ({ x: -1.2 + 1.2 * t, y: 1.9 - 1.8 * t }),
      (t) => ({ x: 1.2 - 1.2 * t, y: 1.9 - 1.8 * t }),
      (t) => ({ x: 0, y: 0.1 - 2.0 * t })
    ]
  },
  J: {
    formula: (x0) => `x = ${(x0 + 0.5).toFixed(1)},  (x - ${x0} + 0.2)² + (y + 1)² = 0.7²`,
    strokes: [
      (t) => ({ x: -0.4 + 1.4 * t, y: 1.9 }),
      (t) => ({ x: 0.5, y: 1.9 - 2.9 * t }),
      (t) => {
        const theta = -Math.PI * t;
        return {
          x: -0.2 + 0.7 * Math.cos(theta),
          y: -1.0 + 0.9 * Math.sin(theta)
        };
      }
    ]
  },
  ',': {
    formula: (x0) => `x(t) = ${x0} - 0.3t²,  y(t) = -1.6 - 0.8t`,
    strokes: [
      (t) => ({
        x: 0.15 * Math.sin(Math.PI * t) - 0.35 * t * t,
        y: -1.55 - 0.85 * t
      })
    ]
  }
};

// Secuencia de palabras: "OYE MARINA, ME GUSTAS MUCHO"
const PHRASE_STRUCTURE = [
  { rowId: 'word-marina', chars: ['O', 'Y', 'E', ' ', 'M', 'A', 'R', 'I', 'N', 'A', ','] },
  { rowId: 'word-megustas', chars: ['M', 'E', ' ', 'G', 'U', 'S', 'T', 'A', 'S'] },
  { rowId: 'word-mucho', chars: ['M', 'U', 'C', 'H', 'O'] }
];

// ============================================================================
// 4. CÁMARA HORIZONTAL Y RENDERIZADO DEL PLANO CARTESIANO
// ============================================================================
const mathCanvas = document.getElementById('math-canvas');
const mathCtx = mathCanvas.getContext('2d');
const stepIndicator = document.getElementById('step-indicator');
const formulaText = document.getElementById('formula-text');
const finalOverlay = document.getElementById('final-overlay');
const replayContainer = document.getElementById('replay-container');
const btnReplay = document.getElementById('btn-replay');

let letterSequence = [];
let heartCenterX = 0;
let animationFrameId = null;

// Ancho visible del plano cartesiano: muestra un rango de 8 unidades de ancho ([-4, +4] respecto a cameraX)
// Así se ve la letra actual en el centro, la letra anterior saliendo por la izquierda y la siguiente entrando por la derecha.
const VIEW_HALF_SPAN = 4.2;

function buildPhraseAndCoordinates() {
  letterSequence = [];
  let currentX = 0;
  const LETTER_STEP = 3.6; // Separación horizontal entre letras en el eje X
  const WORD_GAP = 2.4;    // Separación extra entre palabras

  PHRASE_STRUCTURE.forEach((group, groupIdx) => {
    const rowEl = document.getElementById(group.rowId);
    rowEl.innerHTML = '';

    if (groupIdx > 0) {
      currentX += WORD_GAP;
    }

    group.chars.forEach((ch) => {
      const slot = document.createElement('div');
      if (ch === ' ') {
        slot.className = 'letter-slot space-slot';
        rowEl.appendChild(slot);
        currentX += WORD_GAP;
      } else {
        slot.className = 'letter-slot';
        slot.textContent = ch;
        rowEl.appendChild(slot);

        letterSequence.push({
          char: ch,
          xOffset: Number(currentX.toFixed(1)),
          slotEl: slot
        });

        currentX += LETTER_STEP;
      }
    });
  });

  // El corazón matemático se sitúa al final del recorrido horizontal
  heartCenterX = Number((currentX + 5.5).toFixed(1));
}

function worldToCanvasX(worldX, cameraX, size) {
  return ((worldX - (cameraX - VIEW_HALF_SPAN)) / (VIEW_HALF_SPAN * 2)) * size;
}

function worldToCanvasY(worldY, size) {
  return ((VIEW_HALF_SPAN - worldY) / (VIEW_HALF_SPAN * 2)) * size;
}

// Dibuja el plano cartesiano desplazándose horizontalmente según cameraX
function drawScrollingCartesianGrid(cameraX, size) {
  mathCtx.clearRect(0, 0, size, size);

  // Fondo crema suave
  mathCtx.fillStyle = '#fffef7';
  mathCtx.fillRect(0, 0, size, size);

  const minVisX = cameraX - VIEW_HALF_SPAN;
  const maxVisX = cameraX + VIEW_HALF_SPAN;

  // 1. Cuadrícula secundaria (cada 0.5 unidades)
  mathCtx.lineWidth = 1;
  mathCtx.strokeStyle = 'rgba(236, 137, 115, 0.16)';

  const startHalfX = Math.floor(minVisX * 2) / 2;
  for (let gx = startHalfX; gx <= maxVisX; gx += 0.5) {
    const px = worldToCanvasX(gx, cameraX, size);
    mathCtx.beginPath();
    mathCtx.moveTo(px, 0);
    mathCtx.lineTo(px, size);
    mathCtx.stroke();
  }

  for (let gy = -4; gy <= 4; gy += 0.5) {
    const py = worldToCanvasY(gy, size);
    mathCtx.beginPath();
    mathCtx.moveTo(0, py);
    mathCtx.lineTo(size, py);
    mathCtx.stroke();
  }

  // 2. Cuadrícula principal (cada 1 unidad entera)
  mathCtx.lineWidth = 1.2;
  mathCtx.strokeStyle = 'rgba(236, 137, 115, 0.34)';

  const startIntX = Math.floor(minVisX);
  for (let gx = startIntX; gx <= maxVisX; gx += 1) {
    const px = worldToCanvasX(gx, cameraX, size);
    mathCtx.beginPath();
    mathCtx.moveTo(px, 0);
    mathCtx.lineTo(px, size);
    mathCtx.stroke();
  }

  for (let gy = -4; gy <= 4; gy += 1) {
    const py = worldToCanvasY(gy, size);
    mathCtx.beginPath();
    mathCtx.moveTo(0, py);
    mathCtx.lineTo(size, py);
    mathCtx.stroke();
  }

  // 3. Eje horizontal X (y = 0) y Eje vertical Y (si está visible, o guía lateral)
  const originY = worldToCanvasY(0, size);
  const originX = worldToCanvasX(0, cameraX, size);

  mathCtx.lineWidth = 1.8;
  mathCtx.strokeStyle = 'rgba(72, 13, 22, 0.65)';

  // Eje X continuo a lo largo de todo el recorrido
  mathCtx.beginPath();
  mathCtx.moveTo(0, originY);
  mathCtx.lineTo(size, originY);
  mathCtx.stroke();

  // Eje Y en x = 0
  if (originX >= 0 && originX <= size) {
    mathCtx.beginPath();
    mathCtx.moveTo(originX, 0);
    mathCtx.lineTo(originX, size);
    mathCtx.stroke();
  }

  // Numeración del eje X que va corriendo a medida que avanza la cámara
  mathCtx.fillStyle = 'rgba(72, 13, 22, 0.58)';
  mathCtx.font = '700 11px "Space Mono", monospace';
  mathCtx.textAlign = 'center';
  mathCtx.textBaseline = 'top';

  for (let gx = startIntX; gx <= maxVisX; gx += 2) {
    const px = worldToCanvasX(gx, cameraX, size);
    if (px > 18 && px < size - 18) {
      mathCtx.fillText(String(gx), px, originY + 5);
    }
  }

  // Numeración vertical en el borde izquierdo para referencia constante del eje Y
  mathCtx.textAlign = 'left';
  for (let gy = -3; gy <= 3; gy += 1) {
    if (gy === 0) continue;
    const py = worldToCanvasY(gy, size);
    mathCtx.fillText(String(gy), 6, py - 6);
  }
}

// Dibuja una letra en su coordenada xOffset dentro del mundo continuo
function drawLetterAtOffset(char, xOffset, progress, cameraX, size, isCurrentActive) {
  const def = LETTER_DEFINITIONS[char];
  if (!def) return;

  // Si la letra ya quedó totalmente fuera de la vista a la izquierda, no hace falta pintarla
  if (xOffset + 2.2 < cameraX - VIEW_HALF_SPAN || xOffset - 2.2 > cameraX + VIEW_HALF_SPAN) {
    return;
  }

  const strokes = def.strokes;
  const totalStrokes = strokes.length;
  const scaledProgress = progress * totalStrokes;

  mathCtx.lineCap = 'round';
  mathCtx.lineJoin = 'round';

  let tipPoint = null;

  for (let s = 0; s < totalStrokes; s++) {
    const strokeProgress = Math.max(0, Math.min(1, scaledProgress - s));
    if (strokeProgress <= 0) break;

    const strokeFn = strokes[s];
    const steps = 48;
    const maxStep = Math.max(1, Math.floor(steps * strokeProgress));

    // Sombra sólida retro del trazo
    mathCtx.save();
    mathCtx.beginPath();
    for (let i = 0; i <= maxStep; i++) {
      const clampedT = Math.min(i / steps, strokeProgress);
      const localPt = strokeFn(clampedT);
      const cx = worldToCanvasX(localPt.x + xOffset, cameraX, size) + 2.5;
      const cy = worldToCanvasY(localPt.y, size) + 2.5;
      if (i === 0) mathCtx.moveTo(cx, cy);
      else mathCtx.lineTo(cx, cy);
    }
    mathCtx.lineWidth = 6.5;
    mathCtx.strokeStyle = 'rgba(72, 13, 22, 0.18)';
    mathCtx.stroke();
    mathCtx.restore();

    // Trazo principal de la función
    mathCtx.beginPath();
    for (let i = 0; i <= maxStep; i++) {
      const clampedT = Math.min(i / steps, strokeProgress);
      const localPt = strokeFn(clampedT);
      const worldPt = { x: localPt.x + xOffset, y: localPt.y };
      const cx = worldToCanvasX(worldPt.x, cameraX, size);
      const cy = worldToCanvasY(worldPt.y, size);
      if (i === 0) mathCtx.moveTo(cx, cy);
      else mathCtx.lineTo(cx, cy);
      tipPoint = worldPt;
    }
    mathCtx.lineWidth = 6.2;
    mathCtx.strokeStyle = isCurrentActive ? '#d93f38' : '#e66756';
    mathCtx.stroke();

    // Brillo interior cálido
    mathCtx.lineWidth = 2.0;
    mathCtx.strokeStyle = '#ff9f8c';
    mathCtx.stroke();
  }

  // Puntero matemático activo con coordenadas (x, y) mientras se dibuja
  if (isCurrentActive && tipPoint && progress < 0.99) {
    const tx = worldToCanvasX(tipPoint.x, cameraX, size);
    const ty = worldToCanvasY(tipPoint.y, size);

    mathCtx.save();
    mathCtx.setLineDash([4, 4]);
    mathCtx.lineWidth = 1.2;
    mathCtx.strokeStyle = 'rgba(72, 13, 22, 0.42)';

    mathCtx.beginPath();
    mathCtx.moveTo(tx, ty);
    mathCtx.lineTo(tx, worldToCanvasY(0, size));
    mathCtx.stroke();
    mathCtx.restore();

    mathCtx.beginPath();
    mathCtx.arc(tx, ty, 5.5, 0, Math.PI * 2);
    mathCtx.fillStyle = '#fffee8';
    mathCtx.fill();
    mathCtx.lineWidth = 2.2;
    mathCtx.strokeStyle = '#480d16';
    mathCtx.stroke();
  }
}

// Dibuja el corazón matemático centrado en heartCenterX
function drawHeartAtOffset(centerX, kValue, pulseScale, cameraX, size) {
  const samples = 520;
  const xMax = Math.sqrt(3);
  const scaleFactor = 1.65 * pulseScale;
  const yOffset = -0.35;

  mathCtx.save();
  mathCtx.beginPath();

  for (let i = 0; i <= samples; i++) {
    const u = -xMax + (2 * xMax * i) / samples;
    const x23 = Math.pow(Math.abs(u), 2 / 3);
    const rootTerm = Math.sqrt(Math.max(0, 3 - u * u));
    const rawY = x23 + 0.9 * Math.sin(kValue * u) * rootTerm;

    const worldX = centerX + u * scaleFactor;
    const worldY = (rawY + yOffset) * scaleFactor;

    const cx = worldToCanvasX(worldX, cameraX, size);
    const cy = worldToCanvasY(worldY, size);

    if (i === 0) mathCtx.moveTo(cx, cy);
    else mathCtx.lineTo(cx, cy);
  }

  mathCtx.lineJoin = 'round';
  mathCtx.lineCap = 'round';
  mathCtx.lineWidth = 2.5;
  mathCtx.strokeStyle = '#d9383a';
  mathCtx.stroke();
  mathCtx.restore();
}

// ============================================================================
// 5. SECUENCIA DE DESPLAZAMIENTO CONTINUO LETRA A LETRA + CORAZÓN FINAL
// ============================================================================
function startMathSequence() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  buildPhraseAndCoordinates();
  finalOverlay.classList.add('hidden');
  replayContainer.classList.add('hidden');

  const size = mathCanvas.width;
  let currentIndex = 0;
  let phase = 'SCROLL_LETTERS'; // 'SCROLL_LETTERS' | 'PAN_TO_HEART' | 'HEART_GROW' | 'HEART_PULSE'
  let phaseStartTime = performance.now();

  let cameraX = letterSequence[0].xOffset;
  let panStartX = 0;

  const TIME_PER_LETTER_MS = 780;  // Punto intermedio ideal: fluido y fácil de leer
  const PAN_TO_HEART_MS = 1000;    // Deslizamiento hacia el corazón final
  const HEART_GROW_MS = 3800;      // Animación rellenando el corazón

  function activateLetterBadge(idx) {
    letterSequence.forEach((item, i) => {
      item.slotEl.classList.toggle('active', i === idx);
      item.slotEl.classList.toggle('completed', i < idx);
    });
    const item = letterSequence[idx];
    stepIndicator.textContent = `${item.char} (${idx + 1}/${letterSequence.length})`;
    formulaText.textContent = LETTER_DEFINITIONS[item.char].formula(item.xOffset);
  }

  activateLetterBadge(0);

  function tick(now) {
    const elapsed = now - phaseStartTime;

    if (phase === 'SCROLL_LETTERS') {
      const item = letterSequence[currentIndex];
      const rawProgress = Math.min(1, elapsed / TIME_PER_LETTER_MS);

      // Los primeros 75% del tiempo dibuja la letra con calma, y el 25% restante la mantiene visible mientras desliza a la siguiente
      const strokeRatio = Math.min(1, rawProgress / 0.75);
      const drawProgress =
        strokeRatio < 0.5
          ? 2 * strokeRatio * strokeRatio
          : 1 - Math.pow(-2 * strokeRatio + 2, 2) / 2;

      // La cámara se desliza suavemente hacia la siguiente letra en el tramo final
      const nextTargetX =
        currentIndex < letterSequence.length - 1
          ? letterSequence[currentIndex + 1].xOffset
          : item.xOffset;

      const slideFactor = Math.max(0, (rawProgress - 0.65) / 0.35);
      const easedSlide = slideFactor * slideFactor * (3 - 2 * slideFactor);
      const targetCamX = item.xOffset + (nextTargetX - item.xOffset) * easedSlide;
      cameraX += (targetCamX - cameraX) * 0.18;

      drawScrollingCartesianGrid(cameraX, size);

      // Dibujar todas las letras ya completadas que sigan dentro del plano visible (desfilando hacia la izquierda)
      for (let i = 0; i < currentIndex; i++) {
        drawLetterAtOffset(
          letterSequence[i].char,
          letterSequence[i].xOffset,
          1,
          cameraX,
          size,
          false
        );
      }

      // Dibujar la letra actual trazándose en vivo
      drawLetterAtOffset(item.char, item.xOffset, drawProgress, cameraX, size, true);

      if (rawProgress >= 1) {
        item.slotEl.classList.remove('active');
        item.slotEl.classList.add('completed');

        currentIndex++;
        if (currentIndex < letterSequence.length) {
          activateLetterBadge(currentIndex);
          phaseStartTime = now;
        } else {
          // Terminaron de pasar todas las letras: deslizar la cámara hasta el corazón
          phase = 'PAN_TO_HEART';
          panStartX = cameraX;
          phaseStartTime = now;
          stepIndicator.textContent = 'f(x)';
          formulaText.textContent = 'y = x^(2/3) + 0.9·sin(kx)·√(3 - x²)';
        }
      }
    } else if (phase === 'PAN_TO_HEART') {
      const t = Math.min(1, elapsed / PAN_TO_HEART_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      cameraX = panStartX + (heartCenterX - panStartX) * eased;

      drawScrollingCartesianGrid(cameraX, size);

      // Las últimas letras ("MUCHO") se ven salir por la izquierda mientras llega el corazón
      for (let i = 0; i < letterSequence.length; i++) {
        drawLetterAtOffset(
          letterSequence[i].char,
          letterSequence[i].xOffset,
          1,
          cameraX,
          size,
          false
        );
      }

      // Empezar a asomar la silueta inicial del corazón (k = 1.5)
      drawHeartAtOffset(heartCenterX, 1.5, 1, cameraX, size);

      if (t >= 1) {
        phase = 'HEART_GROW';
        phaseStartTime = now;
      }
    } else if (phase === 'HEART_GROW') {
      cameraX = heartCenterX;
      const progress = Math.min(1, elapsed / HEART_GROW_MS);
      const currentK = 1.5 + progress * 88.5;

      stepIndicator.textContent = `k = ${currentK.toFixed(1)}`;
      formulaText.textContent = 'y = x^(2/3) + 0.9·sin(kx)·√(3 - x²)';

      drawScrollingCartesianGrid(cameraX, size);
      drawHeartAtOffset(heartCenterX, currentK, 1, cameraX, size);

      if (progress > 0.65 && finalOverlay.classList.contains('hidden')) {
        finalOverlay.classList.remove('hidden');
      }

      if (progress >= 1) {
        phase = 'HEART_PULSE';
        phaseStartTime = now;
        replayContainer.classList.remove('hidden');
      }
    } else if (phase === 'HEART_PULSE') {
      const t = elapsed / 1000;
      const pulse = 1 + 0.035 * Math.sin(t * 4.2);
      const kOsc = 90 + 6 * Math.sin(t * 1.5);

      stepIndicator.textContent = '♥ f(x)';
      drawScrollingCartesianGrid(heartCenterX, size);
      drawHeartAtOffset(heartCenterX, kOsc, pulse, heartCenterX, size);
    }

    animationFrameId = requestAnimationFrame(tick);
  }

  animationFrameId = requestAnimationFrame(tick);
}

// ============================================================================
// 6. TRANSICIÓN AL PULSAR "SÍ"
// ============================================================================
btnYes.addEventListener('click', () => {
  btnNo.classList.add('hidden');
  questionWindow.classList.add('hidden');
  mathWindow.classList.remove('hidden');
  startMathSequence();
});

btnReplay.addEventListener('click', () => {
  startMathSequence();
});
