'use strict';

const ESCALATE_THRESHOLD = 10;
const MANAGER_THRESHOLD  = 4;
const MAX_SCORE          = 20; // dynamically calculated from items

let immediateOutcome = null;

/* ─── SVG icons ──────────────────────────────────────────────────────────── */
const ICONS = {
  idle:     `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  proceed:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  manager:  `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
  escalate: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

/* ─── Outcome content ────────────────────────────────────────────────────── */
const OUTCOMES = {
  idle: {
    cls:   'outcome-idle',
    icon:  ICONS.idle,
    title: 'Awaiting input',
    desc:  'Select an immediate trigger above, or tick observables in Part 2 to see the recommended outcome.',
  },
  proceed: {
    cls:   'outcome-proceed',
    icon:  ICONS.proceed,
    title: 'Proceed with probation',
    desc:  'No issues or concerns have been identified at the 3-month mark. Employee is on track. No further action is required prior to the 5-month review.',
  },
  immediateEscalate: {
    cls:   'outcome-escalate',
    icon:  ICONS.escalate,
    title: 'Escalate to Head of HR',
    desc:  'An immediate trigger has been identified. HR to compile the full probation overview document and refer to the Head of HR before any outcome conversation takes place with the employee. The Hiring Manager should not communicate a probation outcome until the Head of HR has reviewed and advised.',
  },
  scoredEscalate: {
    cls:   'outcome-escalate',
    icon:  ICONS.escalate,
    title: 'Escalate to Head of HR',
    desc:  'The combined severity of observed concerns warrants Head of HR involvement before any outcome decision is made. HR to complete the probation overview document in full and brief the Head of HR. The Hiring Manager should not communicate an outcome to the employee until the Head of HR has reviewed.',
  },
  manager: {
    cls:   'outcome-manager',
    icon:  ICONS.manager,
    title: 'Hiring Manager to address',
    desc:  'Concerns are present but fall below the escalation threshold. HR to brief the Hiring Manager on each flagged item with clear action steps. All actions must be documented before the 5-month review. HR to monitor and reassess at 5 months — escalation may still apply if concerns persist or worsen.',
  },
  scoredProceed: {
    cls:   'outcome-proceed',
    icon:  ICONS.proceed,
    title: 'No escalation — proceed with probation',
    desc:  'Observed items are low severity and manageable. No escalation required at this stage. Hiring Manager to note and monitor any flagged items. HR to review again at the 5-month mark.',
  },
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function getObsScore() {
  let score = 0;
  document.querySelectorAll('.row.checked[data-part="obs"]').forEach(r => {
    score += parseInt(r.dataset.sev || '0', 10);
  });
  return score;
}

function renderOutcome(key) {
  const o = OUTCOMES[key];
  const el = document.getElementById('outcome');
  el.className = `outcome ${o.cls}`;
  el.innerHTML = `
    <div class="outcome-icon">${o.icon}</div>
    <div class="outcome-body">
      <div class="outcome-title">${o.title}</div>
      <div class="outcome-desc">${o.desc}</div>
    </div>`;
}

function renderScoreBar(score) {
  const panel   = document.getElementById('score-panel');
  const display = document.getElementById('score-display');
  const bar     = document.getElementById('score-bar');
  const track   = document.getElementById('bar-track');

  panel.style.display = 'block';

  const pct = Math.min((score / MAX_SCORE) * 100, 100);
  bar.style.width = pct + '%';

  let colour;
  if (score >= ESCALATE_THRESHOLD) {
    colour = 'var(--red)';
  } else if (score >= MANAGER_THRESHOLD) {
    colour = 'var(--amber)';
  } else {
    colour = 'var(--teal)';
  }

  bar.style.backgroundColor = colour;
  display.style.color = colour;
  display.textContent = `${score} / ${MAX_SCORE}`;
  track.setAttribute('aria-valuenow', score);
}

function hideScoreBar() {
  document.getElementById('score-panel').style.display = 'none';
}

function dimPart2(dim) {
  const p2 = document.getElementById('part2');
  if (dim) {
    p2.classList.add('dimmed');
  } else {
    p2.classList.remove('dimmed');
  }
}

/* ─── Core evaluate ──────────────────────────────────────────────────────── */
function evaluate() {
  const obsChecked = document.querySelectorAll('.row.checked[data-part="obs"]').length;
  const score      = getObsScore();

  /* Part 1 active — immediate outcome */
  if (immediateOutcome === 'proceed') {
    hideScoreBar();
    dimPart2(true);
    renderOutcome('proceed');
    return;
  }

  if (immediateOutcome === 'escalate') {
    hideScoreBar();
    dimPart2(true);
    renderOutcome('immediateEscalate');
    return;
  }

  /* No immediate trigger — Part 2 */
  dimPart2(false);

  if (obsChecked === 0) {
    hideScoreBar();
    renderOutcome('idle');
    return;
  }

  renderScoreBar(score);

  if (score >= ESCALATE_THRESHOLD) {
    renderOutcome('scoredEscalate');
  } else if (score >= MANAGER_THRESHOLD) {
    renderOutcome('manager');
  } else {
    renderOutcome('scoredProceed');
  }
}

/* ─── Event handlers ─────────────────────────────────────────────────────── */
function toggleImmediate(row) {
  const wasChecked = row.classList.contains('checked');

  /* Clear all Part 1 rows */
  document.querySelectorAll('.row[data-part="immediate"]').forEach(r => {
    r.classList.remove('checked');
    r.setAttribute('aria-checked', 'false');
  });

  if (wasChecked) {
    immediateOutcome = null;
  } else {
    row.classList.add('checked');
    row.setAttribute('aria-checked', 'true');
    immediateOutcome = row.dataset.outcome;
  }

  evaluate();
}

function toggle(row) {
  /* Block Part 2 interaction when Part 1 is active */
  if (immediateOutcome) return;

  const checked = row.classList.toggle('checked');
  row.setAttribute('aria-checked', checked ? 'true' : 'false');
  evaluate();
}

function handleKey(event, row) {
  if (event.key === ' ' || event.key === 'Enter') {
    event.preventDefault();
    const part = row.dataset.part;
    if (part === 'immediate') {
      toggleImmediate(row);
    } else {
      toggle(row);
    }
  }
}

function resetAll() {
  document.querySelectorAll('.row.checked').forEach(r => {
    r.classList.remove('checked');
    r.setAttribute('aria-checked', 'false');
  });
  immediateOutcome = null;
  dimPart2(false);
  hideScoreBar();
  renderOutcome('idle');
}

/* ─── Init ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  renderOutcome('idle');
});
