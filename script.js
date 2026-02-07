/**
 * LaundryLock Demo — State machine for laundry machine locking flow
 */

const STATES = {
  EMPTY: 'empty',
  FULL: 'full',
  RUNNING: 'running',
  COMPLETE_LOCKED: 'complete-locked',
  READY_UNLOAD: 'ready-unload',
};

const WASH_DURATION_SEC = 15; // Demo: 15 seconds
const LOAD_TRANSITION_MS = 800;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const washer = $('.washer');
const statusText = $('#statusText');
const timerEl = $('#timer');
const lockIndicator = $('#lockIndicator');
const btnAddLaundry = $('#btnAddLaundry');
const btnScanQR = $('#btnScanQR');
const btnUnload = $('#btnUnload');
const stateHint = $('#stateHint');

let state = STATES.EMPTY;
let washInterval = null;

function setState(newState) {
  state = newState;
  washer.dataset.state = state;
  updateUI();
}

function updateUI() {
  // Reset timer display
  timerEl.textContent = '';
  timerEl.classList.remove('running');
  if (washInterval) {
    clearInterval(washInterval);
    washInterval = null;
  }

  switch (state) {
    case STATES.EMPTY:
      statusText.textContent = 'Ready for laundry';
      lockIndicator.classList.remove('visible');
      btnAddLaundry.disabled = false;
      btnScanQR.disabled = true;
      btnUnload.disabled = true;
      stateHint.textContent = 'Tap "Put laundry in machine" to start the demo';
      break;

    case STATES.FULL:
      statusText.textContent = 'Laundry loaded';
      lockIndicator.classList.add('visible');
      btnAddLaundry.disabled = true;
      btnScanQR.disabled = true;
      btnUnload.disabled = true;
      stateHint.textContent = 'Starting wash cycle...';
      break;

    case STATES.RUNNING:
      statusText.textContent = 'Washing...';
      lockIndicator.classList.add('visible');
      btnAddLaundry.disabled = true;
      btnScanQR.disabled = true;
      btnUnload.disabled = true;
      stateHint.textContent = 'Machine is locked while running';
      startWashTimer();
      break;

    case STATES.COMPLETE_LOCKED:
      statusText.textContent = 'Cycle complete';
      lockIndicator.classList.add('visible');
      btnAddLaundry.disabled = true;
      btnScanQR.disabled = false;
      btnUnload.disabled = true;
      stateHint.textContent = 'Scan the QR code on the machine to unlock';
      break;

    case STATES.READY_UNLOAD:
      statusText.textContent = 'Unlocked — ready to unload';
      lockIndicator.classList.remove('visible');
      btnAddLaundry.disabled = true;
      btnScanQR.disabled = true;
      btnUnload.disabled = false;
      stateHint.textContent = 'Remove your laundry';
      break;
  }
}

function startWashTimer() {
  let remaining = WASH_DURATION_SEC;
  timerEl.textContent = formatTime(remaining);
  timerEl.classList.add('running');

  washInterval = setInterval(() => {
    remaining--;
    timerEl.textContent = formatTime(remaining);
    if (remaining <= 0) {
      clearInterval(washInterval);
      washInterval = null;
      timerEl.textContent = '';
      timerEl.classList.remove('running');
      setState(STATES.COMPLETE_LOCKED);
    }
  }, 1000);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Event handlers
btnAddLaundry.addEventListener('click', () => {
  if (state !== STATES.EMPTY) return;
  setState(STATES.FULL);
  // Brief pause to show "laundry loaded", then auto-start wash
  setTimeout(() => setState(STATES.RUNNING), LOAD_TRANSITION_MS);
});

btnScanQR.addEventListener('click', () => {
  if (state !== STATES.COMPLETE_LOCKED) return;
  // Simulate QR scan — brief delay for realism
  stateHint.textContent = 'Scanning QR code...';
  btnScanQR.disabled = true;
  setTimeout(() => {
    setState(STATES.READY_UNLOAD);
  }, 600);
});

btnUnload.addEventListener('click', () => {
  if (state !== STATES.READY_UNLOAD) return;
  setState(STATES.EMPTY);
});

// Initialize
updateUI();
