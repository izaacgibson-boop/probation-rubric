# Probation Decision Rubric

An internal HR tool for determining the appropriate action after a new starter's 3-month probation review.

## What it does

A two-part interactive checklist that guides HR through a structured decision:

- **Part 1 — Immediate triggers:** Three clear-cut outcomes (no concerns, overall rating Below Expectations, or 5+ uncertified sick days). Selecting any one resolves the outcome instantly.
- **Part 2 — Weighted observables:** A severity-scored checklist across four areas (Performance, Attendance & Leave, WFH Compliance, Onboarding Survey). Items are weighted High (3pts), Medium (2pts), or Low (1pt). A score of 10+ escalates to Head of HR; 4–9 goes to the Hiring Manager; below 4 proceeds with no escalation.

## Files

```
probation-rubric/
├── index.html   — markup and content
├── styles.css   — all styling
├── rubric.js    — checklist logic and scoring
└── README.md    — this file
```

## Setup

No build step, no dependencies, no server required. It's a static site.

**To run locally:** open `index.html` in any browser.

**To host on GitHub Pages:**
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Under *Source*, select **Deploy from a branch**
4. Choose `main` branch and `/ (root)` folder (or `/docs` if you place files there)
5. Click **Save** — GitHub will provide a URL within a minute

## Customisation

All thresholds are defined at the top of `rubric.js`:

```js
const ESCALATE_THRESHOLD = 10;   // score to trigger Head of HR escalation
const MANAGER_THRESHOLD  = 4;    // score to trigger Hiring Manager action
const MAX_SCORE          = 15;   // maximum possible score (sum of all High items)
```

Criteria text, severity weights, and badge labels are all in `index.html` as `data-sev` attributes on each `.row` element.

---

*For internal HR use only. Draft prepared with AI assistance — requires review before distribution.*
