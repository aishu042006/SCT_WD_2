/**
 * PURE VANILLA JAVASCRIPT - STOPWATCH APPLICATION
 * High Precision Timing Engine with Hours Support & UI Control
 */

document.addEventListener('DOMContentLoaded', () => {
  // --------------------------------------------------------------------------
  // 1. DOM Element References
  // --------------------------------------------------------------------------
  const hoursVal = document.getElementById('hoursVal');
  const minsVal = document.getElementById('minsVal');
  const secsVal = document.getElementById('secsVal');
  const msVal = document.getElementById('msVal');

  const startPauseBtn = document.getElementById('startPauseBtn');
  const startBtnText = document.getElementById('startBtnText');
  const lapBtn = document.getElementById('lapBtn');
  const resetBtn = document.getElementById('resetBtn');

  const emptyLaps = document.getElementById('emptyLaps');
  const lapTable = document.getElementById('lapTable');
  const lapList = document.getElementById('lapList');

  const totalLapsVal = document.getElementById('totalLapsVal');
  const fastestLapVal = document.getElementById('fastestLapVal');
  const slowestLapVal = document.getElementById('slowestLapVal');

  const themeToggleBtn = document.getElementById('themeToggleBtn');

  // --------------------------------------------------------------------------
  // 2. Stopwatch State Variables
  // --------------------------------------------------------------------------
  let isRunning = false;
  let startTime = 0;
  let accumulatedTime = 0;
  let elapsedTime = 0;
  let animationFrameId = null;

  let lapCount = 0;
  let lastLapTotalTime = 0;
  let laps = [];

  /**
   * Formats milliseconds for Lap Statistics (e.g. 00:02.273)
   */
  function formatStatTime(ms) {
    if (ms === null || ms === undefined || isNaN(ms)) return '--:--.---';
    const totalSeconds = Math.floor(ms / 1000);
    const millis = Math.floor(ms % 1000);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, '0');
    const padMs = (num) => String(num).padStart(3, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${padMs(millis)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}.${padMs(millis)}`;
  }

  /**
   * Recalculates Total Laps, Fastest Lap duration, and Slowest Lap duration
   */
  function updateLapStats() {
    totalLapsVal.textContent = laps.length;

    if (laps.length === 0) {
      fastestLapVal.textContent = '--:--.---';
      slowestLapVal.textContent = '--:--.---';
      return;
    }

    const lapTimes = laps.map((l) => l.lapTime);
    const fastestMs = Math.min(...lapTimes);
    const slowestMs = Math.max(...lapTimes);

    fastestLapVal.textContent = formatStatTime(fastestMs);
    slowestLapVal.textContent = formatStatTime(slowestMs);
  }

  /**
   * Toggles empty state and lap table display based on laps.length
   */
  function updateLapUI() {
    if (laps.length === 0) {
      emptyLaps.classList.remove('hidden');
      lapTable.classList.add('hidden');
    } else {
      emptyLaps.classList.add('hidden');
      lapTable.classList.remove('hidden');
    }
    updateLapStats();
  }

  // --------------------------------------------------------------------------
  // 3. High Precision Timing Engine (performance.now)
  // --------------------------------------------------------------------------

  /**
   * Animation Frame Loop for Precise 60fps Display Rendering
   */
  function updateTimer() {
    if (!isRunning) return;

    const now = performance.now();
    elapsedTime = accumulatedTime + (now - startTime);
    renderTimerDisplay(elapsedTime);

    animationFrameId = requestAnimationFrame(updateTimer);
  }

  /**
   * Renders display as 00 : 00 : 00 . 00 (HH : MM : SS . CS)
   */
  function renderTimerDisplay(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, '0');

    hoursVal.textContent = pad(hours);
    minsVal.textContent = pad(minutes);
    secsVal.textContent = pad(seconds);
    msVal.textContent = pad(hundredths);
  }

  /**
   * Formats time strings for Lap Table (e.g. 00:04.25 or 01:25:43.27)
   */
  function formatLapTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const hours = Math.floor(totalSeconds / 3600);

    const pad = (num) => String(num).padStart(2, '0');

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}.${pad(hundredths)}`;
  }

  // --------------------------------------------------------------------------
  // 4. Button Handlers (Start / Pause / Resume / Lap / Reset)
  // --------------------------------------------------------------------------

  function handleStartPauseResume() {
    if (!isRunning && accumulatedTime === 0) {
      // START
      isRunning = true;
      startTime = performance.now();

      startPauseBtn.classList.add('pause');
      startBtnText.textContent = 'PAUSE';
      startPauseBtn.setAttribute('aria-label', 'Pause stopwatch');

      lapBtn.disabled = false;
      resetBtn.disabled = false;

      updateTimer();
    } else if (isRunning) {
      // PAUSE
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
      accumulatedTime = elapsedTime;

      startPauseBtn.classList.remove('pause');
      startPauseBtn.classList.add('resume');
      startBtnText.textContent = 'RESUME';
      startPauseBtn.setAttribute('aria-label', 'Resume stopwatch');

      lapBtn.disabled = true;
    } else {
      // RESUME
      isRunning = true;
      startTime = performance.now();

      startPauseBtn.classList.remove('resume');
      startPauseBtn.classList.add('pause');
      startBtnText.textContent = 'PAUSE';
      startPauseBtn.setAttribute('aria-label', 'Pause stopwatch');

      lapBtn.disabled = false;

      updateTimer();
    }
  }

  function handleLap() {
    if (!isRunning) return;

    lapCount++;
    const currentTotalMs = elapsedTime;
    const lapDurationMs = currentTotalMs - lastLapTotalTime;
    lastLapTotalTime = currentTotalMs;

    const newLap = {
      id: lapCount,
      lapTime: lapDurationMs,
      totalTime: currentTotalMs
    };

    laps.unshift(newLap);

    // Update visibility of empty state vs table
    updateLapUI();

    const padLapNum = (num) => String(num).padStart(2, '0');

    // Create table row element
    const tr = document.createElement('tr');
    tr.className = 'lap-row-anim';

    tr.innerHTML = `
      <td class="col-lap">${padLapNum(lapCount)}</td>
      <td class="col-time">${formatLapTime(lapDurationMs)}</td>
      <td class="col-total">${formatLapTime(currentTotalMs)}</td>
    `;

    // Insert newest lap at top of the table
    lapList.insertBefore(tr, lapList.firstChild);
  }

  function handleReset() {
    // Stop animation loop
    isRunning = false;
    cancelAnimationFrame(animationFrameId);

    // Reset internal state
    startTime = 0;
    accumulatedTime = 0;
    elapsedTime = 0;
    lapCount = 0;
    lastLapTotalTime = 0;
    laps = [];

    // Reset timer display
    renderTimerDisplay(0);

    // Reset button states
    startPauseBtn.classList.remove('pause', 'resume');
    startBtnText.textContent = 'START';
    startPauseBtn.setAttribute('aria-label', 'Start stopwatch');

    lapBtn.disabled = true;
    resetBtn.disabled = true;

    // Reset Lap Table UI
    lapList.innerHTML = '';
    updateLapUI();
  }

  // --------------------------------------------------------------------------
  // 5. Theme Control Engine
  // --------------------------------------------------------------------------
  
  function initTheme() {
    const savedTheme = localStorage.getItem('stopwatch_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('stopwatch_theme', nextTheme);
  }

  // --------------------------------------------------------------------------
  // 6. Bind Event Listeners
  // --------------------------------------------------------------------------
  startPauseBtn.addEventListener('click', handleStartPauseResume);
  lapBtn.addEventListener('click', handleLap);
  resetBtn.addEventListener('click', handleReset);
  themeToggleBtn.addEventListener('click', toggleTheme);

  // Initialize theme state on load
  initTheme();
});
