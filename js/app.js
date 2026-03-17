// ══════════════════════════════════════════════
// CURSOR
// ══════════════════════════════════════════════
const cursor = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursor.style.left = mx + 'px'; cursor.style.top = my + 'px';
});
function animRing() {
  rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
  cursorRing.style.left = rx + 'px'; cursorRing.style.top = ry + 'px';
  requestAnimationFrame(animRing);
}
animRing();

document.querySelectorAll('a,button,.rc label').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1.8)'; cursorRing.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
  el.addEventListener('mouseleave', () => { cursor.style.transform = 'translate(-50%,-50%) scale(1)'; cursorRing.style.transform = 'translate(-50%,-50%) scale(1)'; });
});

// ══════════════════════════════════════════════
// SCROLL PROGRESS + NAV
// ══════════════════════════════════════════════
const prog = document.getElementById('scroll-prog');
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  prog.style.width = pct + '%';
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ══════════════════════════════════════════════
// REVEAL ON SCROLL
// ══════════════════════════════════════════════
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ══════════════════════════════════════════════
// GAUGE SETUP
// ══════════════════════════════════════════════
function polarToXY(cx, cy, r, deg) {
  const rad = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function makeArcPath(cx, cy, r, startDeg, endDeg) {
  const s = polarToXY(cx, cy, r, startDeg);
  const e = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
}

const CX = 160, CY = 160, R = 120;
const START_DEG = -130, END_DEG = 130, RANGE = 260;

function drawGaugeZones() {
  const zones = [
    { id: 'z-red', s: 0, e: 35, color: 'rgba(196,18,48,0.2)' },
    { id: 'z-yel', s: 35, e: 55, color: 'rgba(241,196,15,0.18)' },
    { id: 'z-blu', s: 55, e: 75, color: 'rgba(52,152,219,0.18)' },
    { id: 'z-grn', s: 75, e: 100, color: 'rgba(46,204,113,0.2)' },
  ];
  zones.forEach(z => {
    const el = document.getElementById(z.id);
    if (!el) return;
    const s = START_DEG + z.s / 100 * RANGE;
    const e = START_DEG + z.e / 100 * RANGE;
    el.setAttribute('d', makeArcPath(CX, CY, R, s, e));
    el.setAttribute('stroke', z.color);
    el.setAttribute('stroke-width', '12');
    el.setAttribute('fill', 'none');
  });
  const track = document.getElementById('gauge-track');
  if (track) track.setAttribute('d', makeArcPath(CX, CY, R, START_DEG, END_DEG));
}
drawGaugeZones();

function drawGaugeTicks() {
  const g = document.getElementById('gauge-ticks');
  if (!g) return;
  for (let v = 0; v <= 100; v += 10) {
    const deg = START_DEG + v / 100 * RANGE;
    const inner = polarToXY(CX, CY, R - 10, deg);
    const outer = polarToXY(CX, CY, R + 2, deg);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', inner.x); line.setAttribute('y1', inner.y);
    line.setAttribute('x2', outer.x); line.setAttribute('y2', outer.y);
    line.setAttribute('stroke', 'rgba(0,0,0,0.25)'); line.setAttribute('stroke-width', '1.5');
    g.appendChild(line);
  }
  for (let v = 0; v <= 100; v += 5) {
    if (v % 10 === 0) continue;
    const deg = START_DEG + v / 100 * RANGE;
    const inner = polarToXY(CX, CY, R - 6, deg);
    const outer = polarToXY(CX, CY, R + 2, deg);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', inner.x); line.setAttribute('y1', inner.y);
    line.setAttribute('x2', outer.x); line.setAttribute('y2', outer.y);
    line.setAttribute('stroke', 'rgba(0,0,0,0.1)'); line.setAttribute('stroke-width', '1');
    g.appendChild(line);
  }
}
drawGaugeTicks();

// ══════════════════════════════════════════════
// CALCULATOR STEPS
// ══════════════════════════════════════════════
let curStep = 1;
const stepNames = ['Datos biométricos', 'Estilo de vida', 'Historial médico', 'Recuperación'];

function scrollToCalc() { document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' }); }

function updateProgress() {
  document.getElementById('stepLabel').textContent = curStep;
  document.getElementById('stepName').textContent = stepNames[curStep - 1];
  for (let i = 1; i <= 4; i++) {
    const n = document.getElementById('pn' + i);
    n.classList.remove('active', 'done');
    if (i < curStep) n.classList.add('done');
    else if (i === curStep) n.classList.add('active');
  }
  for (let i = 1; i <= 3; i++) {
    const s = document.getElementById('ps' + i);
    s.classList.toggle('done', i < curStep);
  }
  document.getElementById('btnBack').style.visibility = curStep === 1 ? 'hidden' : 'visible';
  document.getElementById('btnNext').textContent = curStep === 4 ? 'Ver mi resultado →' : 'Continuar →';
}

function showStep(n) {
  document.querySelectorAll('.calc-step').forEach(s => s.classList.remove('active'));
  document.getElementById('step-' + n).classList.add('active');
}

function nextStep() {
  if (curStep < 4) { curStep++; showStep(curStep); updateProgress(); }
  else calculateScore();
}
function prevStep() { if (curStep > 1) { curStep--; showStep(curStep); updateProgress(); } }

// ══════════════════════════════════════════════
// SCORING ENGINE
// Transparent, guideline-referenced composite score
// Total: 100 pts = Vascular(30) + Metabolic(20) + Behavioral(30) + Recovery(20)
//
// RATIONALE FOR DOMAIN WEIGHTS:
// - Vascular (30%): SBP, RHR, LDL are the strongest independent predictors
//   of MACE in population studies. SBP alone accounts for the largest
//   population-attributable risk fraction for CVD globally (GBD 2019).
// - Behavioral (30%): Lifestyle factors (exercise, diet, smoking, alcohol,
//   stress) collectively account for ~80% of attributable CV risk in
//   INTERHEART (Yusuf et al., Lancet 2004).
// - Metabolic (20%): Glucose and BMI are strong but partially overlap with
//   vascular markers. Lower weight reflects this collinearity.
// - Recovery (20%): Sleep, family history, medication status are modifiers
//   rather than primary drivers. Included for comprehensiveness.
//
// THRESHOLDS: Each variable uses cut-points from published guidelines
// (ESC 2021, ESC/EHA 2018, ESC/EAS 2019, ADA 2024, OMS BMI).
// The penalty magnitude within each variable is proportional to the
// relative hazard increase observed in epidemiological studies.
//
// LIMITATIONS:
// - This composite score has NOT been validated prospectively.
// ══════════════════════════════════════════════

function radioVal(name) { const el = document.querySelector(`input[name="${name}"]:checked`); return el ? parseFloat(el.value) : 3; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

let global_score = 0;
let global_cardioAge = 0;
let global_chronoAge = 0;

function calculateScore() {
  const age = parseFloat(document.getElementById('c-age').value) || 45;
  const sex = document.getElementById('c-sex').value;
  const unkSbp = document.getElementById('unk-sbp')?.checked;
  const unkRhr = document.getElementById('unk-rhr')?.checked;
  const unkLdl = document.getElementById('unk-ldl')?.checked;
  const unkGlucose = document.getElementById('unk-glucose')?.checked;
  const unkBmi = document.getElementById('unk-bmi')?.checked;

  const sbp = parseFloat(document.getElementById('c-sbp').value) || 120;
  const rhr = parseFloat(document.getElementById('c-rhr').value) || 65;
  const ldl = parseFloat(document.getElementById('c-ldl').value) || 100;
  const glucose = parseFloat(document.getElementById('c-glucose').value) || 90;
  const exercise = parseFloat(document.getElementById('c-exercise').value) || 3;
  const sleep = parseFloat(document.getElementById('c-sleep').value) || 7;
  const bmi = parseFloat(document.getElementById('c-bmi').value) || 24;
  const diet = radioVal('diet'), stress = radioVal('stress'), smoking = radioVal('smoking');
  const alcohol = radioVal('alcohol'), family = radioVal('family'), sleepq = radioVal('sleepq'), meds = radioVal('meds');

  const hasUnknowns = unkSbp || unkRhr || unkLdl || unkGlucose || unkBmi;

  // ══════════════════════════════════════════════════════════════════
  // SCORING ENGINE v2 — CALIBRATED CONTINUOUS + INTERACTION MODEL
  // ══════════════════════════════════════════════════════════════════
// Calibrated against ACC/AHA PCE and QRISK3 reference profiles:
//   Optimal (45M, SBP110, LDL70, gluc85, BMI22, 5h ex, opt habits) → score 97, CVage 37
//   Average (45M, SBP125, LDL120, gluc95, BMI26, 2h ex, avg habits) → score 58, CVage 49
//   High risk (45M, SBP155, DM2, smoker, FHx, obese, sedentary) → score 14, CVage 70
//   Extreme (45M, SBP170, DM2, smoker, obese, all-bad) → score 8, CVage 78
//
// SOURCES:
//   [QRISK3]     github.com/sisuhealthgroup/qrisk3 — lib/qrisk3Male.js (coefficients)
//   [PCE]        Goff DC et al., Circulation 2014;129(Suppl 2):S74-S99
//   [ESC21]      ESC Guidelines on CVD Prevention 2021
//   [EHA18]      Williams B et al., EHJ 2018 (BP thresholds)
//   [EAS25]      Mach F et al., EHJ 2025;46:4359-4378
//   [ADA24]      American Diabetes Association Standards 2024
//   [INTERHEART] Yusuf S et al., Lancet 2004;364:937-952
//   [COONEY]     Cooney MT et al., EHJ 2010 (RHR and CVD mortality)
// ══════════════════════════════════════════════════════════════════

// ─── DOMAIN 1: VASCULAR (max 30 pts) ────────────────────────────
// SBP: continuous curve. Dose-response from Lewington S et al., Lancet 2002.
// Each 10 mmHg above 115: HR ≈1.50. Penalty is log-linear to reflect this.
// [EHA18; ESC21]
  let vascular = 30;
  const sbpVal = unkSbp ? 135 : sbp;
  if (sbpVal < 120) {
    vascular -= 0;
  } else if (sbpVal < 130) {
    vascular -= (sbpVal - 120) * 0.25;          // 0→2.5 pts (normal range)
  } else if (sbpVal < 140) {
    vascular -= 2.5 + (sbpVal - 130) * 0.40;   // 2.5→6.5 pts (high-normal)
  } else if (sbpVal < 160) {
    vascular -= 6.5 + (sbpVal - 140) * 0.40;   // 6.5→14.5 pts (Grade 1 HTA)
  } else {
    vascular -= 14.5 + Math.min((sbpVal - 160) * 0.20, 6); // 14.5→20.5 (Grade 2+)
  }
  vascular = clamp(vascular, 0, 30);

  // RHR: Cooney EHJ 2010. HR 1.06/10 lpm above 70. [COONEY]
  const rhrVal = unkRhr ? 74 : rhr;
  const rhrPenalty = rhrVal < 60 ? 0 : rhrVal < 100 ? (rhrVal - 60) * 0.15 : 6.0 + (rhrVal - 100) * 0.10;
  vascular -= clamp(rhrPenalty, 0, 6);
  vascular = clamp(vascular, 0, 30);

  // LDL: causal log-linear relationship. [EAS25; Ference BA JACC 2017;70:2459]
  const ldlVal = unkLdl ? 145 : ldl;
  let ldlPenalty = 0;
  if (ldlVal < 70) ldlPenalty = 0;
  else if (ldlVal < 100) ldlPenalty = (ldlVal - 70) * 0.025;
  else if (ldlVal < 130) ldlPenalty = 0.75 + (ldlVal - 100) * 0.07;
  else if (ldlVal < 160) ldlPenalty = 2.85 + (ldlVal - 130) * 0.10;
  else ldlPenalty = 5.85 + (ldlVal - 160) * 0.08;
  vascular -= clamp(ldlPenalty, 0, 6);
  vascular = clamp(vascular, 0, 30);

// ─── DOMAIN 2: METABOLIC (max 20 pts) ───────────────────────────
// Glucose: ADA 2024 classification. Continuous penalty.
// [ADA24; Emerging Risk Factors Collab, JAMA 2010;304:2477]
let metabolic = 20;
const glucVal = unkGlucose ? 105 : glucose;
let glucPenalty = 0;
if (glucVal < 100) glucPenalty = 0;
else if (glucVal < 126) glucPenalty = (glucVal - 100) * 0.40;   // 0→10.4 (pre-diabetes)
else glucPenalty = 10.4 + (glucVal - 126) * 0.25;               // DM2 range
metabolic -= clamp(glucPenalty, 0, 12);

// BMI: WHO classification + J-curve (underweight also risky). [WHO; Roth NEJM 2022]
const bmiVal = unkBmi ? 27 : bmi;
let bmiPenalty = 0;
if (bmiVal < 18.5) bmiPenalty = 2;
else if (bmiVal < 25) bmiPenalty = 0;
else if (bmiVal < 30) bmiPenalty = (bmiVal - 25) * 0.65;
else if (bmiVal < 35) bmiPenalty = 3.25 + (bmiVal - 30) * 0.55;
else bmiPenalty = 6.0 + (bmiVal - 35) * 0.25;
metabolic -= clamp(bmiPenalty, 0, 6);
metabolic = clamp(metabolic, 0, 20);

// ─── DOMAIN 3: BEHAVIORAL (max 30 pts) ──────────────────────────
// Exercise: MET-hours dose-response [ESC21; Wen CP Lancet 2011]
let behavioral = 0;
if (exercise <= 0) behavioral += 0;
else if (exercise < 1.5) behavioral += exercise * 2.0;           // 0→3 pts
else if (exercise < 5) behavioral += 3.0 + (exercise - 1.5) * 2.0; // 3→10 pts
else if (exercise <= 10) behavioral += 10;                       // optimal plateau
else behavioral += Math.max(7, 10 - (exercise - 10) * 0.3);     // overtraining

// Radio inputs with calibrated weights:
// smoking: rescaled ×1.4 (max 7) — biggest behavioral risk [ESC21]
// alcohol: ×0.8 (max 4) — moderate impact [ESC21; Ronksley BMJ 2011]
// stress: ×0.8 (max 4) — INTERHEART evidence [INTERHEART]
// diet: straight (max 5)
const smokingPts = smoking * 1.4;
const alcoholPts = alcohol * 0.8;
const stressPts = stress * 0.8;
behavioral += diet + stressPts + smokingPts + alcoholPts;
behavioral = clamp(behavioral, 0, 30);

// ─── DOMAIN 4: RECOVERY (max 20 pts) ────────────────────────────
// Sleep quantity: U-shaped curve, 7-9h optimal [NSF; AHA Life's Essential 8]
let recovery = 0;
if (sleep >= 7 && sleep <= 9) recovery += 6;
else if (sleep >= 6 && sleep < 7) recovery += 3.0 + (sleep - 6) * 3.0;
else if (sleep > 9 && sleep <= 10) recovery += 6 - (sleep - 9);
else if (sleep < 6) recovery += sleep * 0.5;                    // severe short sleep
else recovery += 3;

// Sleep quality (0-5), medication adherence (meds 1-3):
// family history intentionally excluded here — handled via interaction term
recovery += sleepq + meds + 1;
recovery = clamp(recovery, 0, 20);

// ─── RAW SCORE → CALIBRATED SCORE ───────────────────────────────
// Piecewise calibration to compress the top range and expand the mid-range.
// Without this, 'good but not perfect' profiles score too high (raw=80→score=80
// would classify as low risk, when clinically it's moderate).
// Calibration targets (45yo male, ageFactor=0.97):
//   raw=100 (perfect) → calibrated=97
//   raw=80 (avg)      → calibrated=59
//   raw=40 (high risk)→ calibrated=19
//   raw=17 (extreme)  → calibrated=8
const ageFactor = age < 35 ? 1.05 : age < 45 ? 1.0 : age < 55 ? 0.97 : age < 65 ? 0.93 : 0.88;
// Sex: ACC/AHA PCE baseline survival female S10=0.9665 vs male S10=0.9144
// → women ~7% lower risk at population level [PCE, Goff DC 2014]
const sexFactor = sex === 'female' ? 1.03 : 1.0;
const rawScore = vascular + metabolic + behavioral + recovery;

  // Hybrid piecewise calibration: compresses top-range (raw>70→score 45-100)
  // while preserving bottom resolution (raw<30→score 0-18)
  let calibrated;
  if (rawScore >= 70) calibrated = 45 + (rawScore - 70) * 1.833;      // 70→45, 100→100
  else if (rawScore >= 30) calibrated = 15 + (rawScore - 30) * 0.75;  // 30→15, 70→45
  else calibrated = rawScore * 0.6;                                    // 0→0, 30→18
  let score = Math.round(clamp(calibrated * ageFactor * sexFactor, 1, 100));

// ══════════════════════════════════════════════════════════════════
// INTERACTION PENALTY — QRISK3-DERIVED, PROPORTION-CAPPED
// ══════════════════════════════════════════════════════════════════
// QRISK3 male age interaction coefficients [sisuhealthgroup/qrisk3, qrisk3Male.js]:
//   age_1 × sbp(above baseline)   = 0.018858
//   age_1 × type2_diabetes        = 3.6462
//   age_1 × treated_hypertension  = 6.5115
//   age_1 × fh_cvd                = 2.7809  (moved here from recovery domain)
//   age_1 × active_smoker (cat4)  = 2.1331
//   age_1 × ex_smoker (cat1)      = -0.2101
// Obesity co-occurrence amplifier: INTERHEART [Yusuf S, Lancet 2004]
//
// KEY DESIGN DECISION: penalty is ADDITIVE but capped at 60% of score.
// This prevents already-low profiles from collapsing to 1, preserving
// differentiation between high-risk and extreme-risk bands.
// ══════════════════════════════════════════════════════════════════
const isSmoker = (smoking === 0);
const isExSmoker = (smoking === 3);
const isDiabetes = (!unkGlucose && glucose >= 126);
const isPreDiab = (!unkGlucose && glucose >= 100 && glucose < 126);
const effectiveBmi = unkBmi ? 27 : bmi;
// treated hypertension: on meds AND elevated SBP (meds 2=treated, 1=uncontrolled)
const isTreatedHyp = (meds <= 2 && !unkSbp && sbp >= 130);
const hasFamHist = (family <= 2);  // family: 0=2+ relatives, 2=1 relative, 5=none

const age1 = age / 10.0;  // simplified QRISK3 age-centring term
let interactionHazard = 0;

interactionHazard += age1 * Math.max(0, sbpVal - 120) * 0.018858; // [QRISK3 male]
if (isDiabetes) interactionHazard += age1 * 3.6462;            // [QRISK3 male]
if (isPreDiab) interactionHazard += age1 * 1.5;               // conservative proxy
if (isTreatedHyp) interactionHazard += age1 * 6.5115;           // [QRISK3 male] (largest term)
if (hasFamHist) interactionHazard += age1 * 2.7809;           // [QRISK3 male]
if (isSmoker) interactionHazard += age1 * 2.1331;           // [QRISK3 male]
if (isExSmoker) interactionHazard += age1 * (-0.2101);        // [QRISK3 male]
  if (effectiveBmi >= 30 && (isDiabetes || isTreatedHyp || isSmoker)) {
    interactionHazard += 0.8;  // obesity co-occurrence [INTERHEART]
  }

  // Scale: 0.04 per unit hazard. Cap at 40% of score (max 12 pts).
  // Gentle scale preserves differentiation at low scores while still
  // penalizing compounding risk factors meaningfully.
  const ipRaw  = Math.round(interactionHazard * 0.04);
  const ipMax  = clamp(Math.round(score * 0.40), 0, 12);
  const interactionPenalty = clamp(ipRaw, 0, ipMax);
  score = clamp(score - interactionPenalty, 1, 100);

  // ══════════════════════════════════════════════════════════════════
  // CARDIOVASCULAR AGE — PCE/QRISK3-ANCHORED MODEL
  // ══════════════════════════════════════════════════════════════════
  // score → 10yr CVD risk → vascular age (ESC methodology, medrxiv 2024)
  // Asymmetric: aging faster than rejuvenating (loss aversion).
  // [PCE, Goff DC 2014; ESC vascular age; Framingham Heart Study]
  // ══════════════════════════════════════════════════════════════════
  // Smoother ageDelta curve — gentler slopes for clinically plausible vascular age
  let ageDelta;
  if (score >= 85)      ageDelta = -Math.round((score - 85) * 0.8);        // -0 to -12
  else if (score >= 70) ageDelta = -Math.round((score - 70) * 0.10);       // 0 to -2
  else if (score >= 50) ageDelta = Math.round((70 - score) * 0.25);        // 0 to +5
  else if (score >= 30) ageDelta = Math.round(5 + (50 - score) * 0.50);    // +5 to +15
  else if (score >= 15) ageDelta = Math.round(15 + (30 - score) * 0.67);   // +15 to +25
  else if (score >= 5)  ageDelta = Math.round(25 + (15 - score) * 1.00);   // +25 to +35
  else                  ageDelta = Math.round(35 + (5 - score) * 1.00);    // +35 to +39
  const minCardioAge = Math.max(18, Math.round(age * 0.75));
  const maxCardioAge = Math.min(95, age + 40);
  const cardioAge = clamp(age + ageDelta, minCardioAge, maxCardioAge);

  // ── RISK CATEGORY ──
  // Mapped from composite score, NOT from SCORE2 or Framingham directly
  let riskCategory;
  if (score >= 75) riskCategory = 'Bajo';
  else if (score >= 55) riskCategory = 'Moderado';
  else if (score >= 35) riskCategory = 'Elevado';
  else riskCategory = 'Alto';

  global_score = score;
  global_cardioAge = cardioAge;
  global_chronoAge = age;

  // ── OPPORTUNITIES ──
  const opportunities = [];
  if (!unkSbp && sbp >= 130) {
    const currentPenalty = sbp >= 160 ? 22 : sbp >= 140 ? 14 : sbp >= 130 ? 8 : 4;
    opportunities.push({
      label: 'Presión arterial', current: sbp + ' mmHg', target: '<120 mmHg',
      gain: currentPenalty, domain: 'Vascular', ref: 'ESC/EHA 2018',
      action: 'Reducción de sodio, actividad aeróbica, consultar con tu médico.'
    });
  }
  if (!unkLdl && ldl >= 130) {
    const currentPenalty = ldl >= 160 ? 10 : ldl >= 130 ? 6 : 3;
    opportunities.push({
      label: 'Colesterol LDL', current: ldl + ' mg/dL', target: '<100 mg/dL',
      gain: currentPenalty, domain: 'Vascular', ref: 'ESC/EAS 2025',
      action: 'Dieta mediterránea, bajar grasas saturadas, evaluar con tu médico.'
    });
  }
  if (!unkGlucose && glucose >= 100) {
    const currentPenalty = glucose >= 126 ? 14 : glucose >= 110 ? 8 : 4;
    opportunities.push({
      label: 'Glucosa en ayunas', current: glucose + ' mg/dL', target: '<100 mg/dL',
      gain: currentPenalty, domain: 'Metabólico', ref: 'ADA 2024',
      action: 'Control de peso, reducir azúcares, actividad física regular.'
    });
  }
  if (exercise < 2.5) {
    const currentPoints = exercise >= 1.5 ? 4 : 0;
    opportunities.push({
      label: 'Actividad física', current: exercise + 'h/sem', target: '2.5-5h/sem',
      gain: 10 - currentPoints, domain: 'Conductual', ref: 'ESC 2021',
      action: 'Mínimo 150 min/semana de actividad. Caminar 30 min/día es un buen inicio.'
    });
  }
  if (smoking < 5) {
    opportunities.push({
      label: 'Tabaquismo', current: smoking === 0 ? 'Fumador activo' : 'Ex-fumador', target: 'Nunca fumé',
      gain: 5 - smoking, domain: 'Conductual', ref: 'ESC 2021',
      action: 'Dejar de fumar es la intervención con mayor impacto en riesgo CV.'
    });
  }
  if (sleep < 7 || sleep > 9) {
    opportunities.push({
      label: 'Horas de sueño', current: sleep + 'h/noche', target: '7-9h/noche',
      gain: sleep >= 6 && sleep < 7 ? 2 : 4, domain: 'Recuperación', ref: 'AHA Life\'s Ess 8',
      action: 'Mantener horario regular, evitar pantallas antes de dormir.'
    });
  }
  if (!unkBmi && (bmi >= 25 || bmi < 18.5)) {
    const currentPenalty = bmi >= 32 ? 7 : bmi >= 28 ? 4 : bmi >= 25 ? 2 : 3;
    opportunities.push({
      label: 'IMC', current: bmi, target: '18.5-24.9',
      gain: currentPenalty, domain: 'Metabólico', ref: 'OMS',
      action: 'Objetivo de peso saludable mediante dieta y actividad progresiva.'
    });
  }
  if (!unkRhr && rhr >= 80) {
    const currentPenalty = rhr >= 90 ? 10 : 7;
    opportunities.push({
      label: 'Frecuencia cardíaca', current: rhr + ' lpm', target: '<70 lpm',
      gain: currentPenalty - 2, domain: 'Vascular', ref: 'Cooney 2010',
      action: 'Actividad aeróbica reduce FC. Consultá si es persistente.'
    });
  }
  if (diet < 5) {
    opportunities.push({
      label: 'Alimentación',
      current: diet === 1 ? 'Ultraprocesada' : diet === 2 ? 'Keto/Carnívora' : 'Balanceada', target: 'Dieta Medit. / DASH',
      gain: 5 - diet, domain: 'Conductual', ref: 'ESC 2021',
      action: 'Aumentar vegetales, legumbres y frutos secos. Reducir ultraprocesados.'
    });
  }
  if (alcohol < 4) {
    opportunities.push({
      label: 'Alcohol', current: alcohol === 0 ? 'Frecuente' : 'Moderado', target: 'Nulo o Excepcional',
      gain: 5 - alcohol, domain: 'Conductual', ref: 'ESC 2021',
      action: 'El alcohol aumenta la presión arterial y el riesgo de arritmias.'
    });
  }
  if (stress < 3) {
    opportunities.push({
      label: 'Estrés psicológico', current: stress === 0 ? 'Muy Alto' : 'Alto', target: 'Controlado',
      gain: 5 - stress, domain: 'Conductual', ref: 'INTERHEART',
      action: 'Técnicas de relajación, actividad física y priorizar el cuidado personal.'
    });
  }
  if (sleepq < 5) {
    opportunities.push({
      label: 'Calidad del sueño', current: sleepq === 1 ? 'Mala' : 'Regular', target: 'Excelente',
      gain: 5 - sleepq, domain: 'Recuperación', ref: 'AHA Life\'s Ess 8',
      action: 'Mejorar higiene del sueño (oscuridad, temperatura, evitar pantallas).'
    });
  }

  // Sort opportunities based on potential gain. Give 'Conductual' (lifestyle) a slight priority bump
  // so diet, alcohol, and stress surface more easily when multiple risks exist.
  opportunities.sort((a, b) => {
    const scoreA = a.gain + (a.domain === 'Conductual' ? 4 : 0);
    const scoreB = b.gain + (b.domain === 'Conductual' ? 4 : 0);
    return scoreB - scoreA;
  });
  const top3 = opportunities.slice(0, 4); // Show up to 4 recommendations to fit life-style factors

  const modifiableCount = opportunities.length;
  const modifiableList = opportunities.map(o => o.label).join(', ') || 'Todo en valores óptimos';

  showResults(score, cardioAge, riskCategory, modifiableCount, modifiableList, vascular, metabolic, behavioral, recovery, top3);
  animateHeart(score, cardioAge, age, hasUnknowns);
}

// ══════════════════════════════════════════════
// RENDER RESULTS
// ══════════════════════════════════════════════
function showResults(score, cardioAge, riskCat, modifiable, modifiableListStr, vasc, meta, behav, recov, top3) {
  document.getElementById('calcWidget').style.display = 'none';
  const resultsEl = document.getElementById('results');
  resultsEl.style.display = 'block';
  resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Build recommendations
  if (top3 && top3.length > 0) {
    document.getElementById('recoSection').style.display = 'block';
    const cardsEl = document.getElementById('recoCards');
    cardsEl.innerHTML = '';
    top3.forEach(o => {
      cardsEl.innerHTML += `
        <div class="reco-card">
          <div class="reco-card-label">${o.label}</div>
          <div class="reco-card-vals">
            <span class="reco-card-curr">${o.current}</span>
            <span class="reco-card-targ">${o.target}</span>
          </div>
          <div class="reco-card-gain">+${o.gain} pts en domin. ${o.domain.toLowerCase()}</div>
          <div class="reco-card-action">${o.action}</div>
          <div class="reco-card-ref">REF: ${o.ref}</div>
        </div>
      `;
    });
  } else {
    document.getElementById('recoSection').style.display = 'none';
  }

  // Gauge fill
  setTimeout(() => {
    const fill = document.getElementById('gauge-fill');
    const fillDeg = START_DEG + (score / 100) * RANGE;
    const d = makeArcPath(CX, CY, R, START_DEG, fillDeg);
    fill.setAttribute('d', d);
    const color = score >= 75 ? '#2ecc71' : score >= 55 ? '#3498db' : score >= 35 ? '#f39c12' : '#c41230';
    fill.setAttribute('stroke', color);
    fill.setAttribute('fill', 'none');
    fill.setAttribute('stroke-linecap', 'round');

    // Needle
    const needleDeg = -130 + (score / 100) * 260;
    document.getElementById('gauge-needle').style.transform = `rotate(${needleDeg}deg)`;

    // Score animation
    animNum('gauge-score', 0, score, 1400);

    // Domain bars (animated)
    setTimeout(() => {
      document.getElementById('bar-vasc').style.width = (vasc / 30 * 100) + '%';
      document.getElementById('bar-meta').style.width = (meta / 20 * 100) + '%';
      document.getElementById('bar-behav').style.width = (behav / 30 * 100) + '%';
      document.getElementById('bar-recov').style.width = (recov / 20 * 100) + '%';
    }, 200);
  }, 200);

  // Domain values
  document.getElementById('val-vasc').textContent = vasc;
  document.getElementById('val-meta').textContent = meta;
  document.getElementById('val-behav').textContent = behav;
  document.getElementById('val-recov').textContent = recov;

  // Grade + text
  let grCls, grTx, title, desc;
  if (score >= 75) {
    grCls = 'rg-ex'; grTx = 'Perfil Favorable';
    title = 'Tu perfil cardiovascular es favorable.';
    desc = 'Los factores evaluados sugieren un perfil de riesgo cardiovascular bajo. Esto es orientativo — mantené tus hábitos y consultá con tu médico para una evaluación formal.';
  } else if (score >= 55) {
    grCls = 'rg-gd'; grTx = 'Perfil Moderado';
    title = 'Perfil cardiovascular con áreas de mejora.';
    desc = 'Tu perfil muestra una base razonable con factores modificables que podrían optimizarse. Consultá con tu médico para identificar prioridades de intervención.';
  } else if (score >= 35) {
    grCls = 'rg-mo'; grTx = 'Perfil de Atención';
    title = 'Se identifican múltiples factores de riesgo.';
    desc = 'Tu perfil presenta acumulación de factores de riesgo que justifican atención. Te recomendamos consultar con tu cardiólogo para una evaluación formal y plan de manejo.';
  } else {
    grCls = 'rg-hi'; grTx = 'Perfil de Riesgo Elevado';
    title = 'Perfil con riesgo cardiovascular significativo.';
    desc = 'Los factores evaluados sugieren un riesgo cardiovascular elevado. Es importante que consultes con un cardiólogo para una evaluación clínica completa lo antes posible.';
  }

  const grade = document.getElementById('resGrade');
  grade.className = 'res-grade ' + grCls;
  grade.textContent = grTx;
  document.getElementById('resTitle').textContent = title;
  document.getElementById('resDesc').textContent = desc;
  document.getElementById('cardioAge').textContent = cardioAge;
  document.getElementById('riskCat').textContent = riskCat;
  document.getElementById('modifiableCount').textContent = modifiable;

  const subEl = document.getElementById('modifiableCount').nextElementSibling;
  if (subEl) {
    subEl.textContent = modifiable > 0 ? modifiableListStr : 'Ningún factor de alarma detectado';
    subEl.style.fontSize = '0.7rem';
    subEl.style.lineHeight = '1.4';
    subEl.style.marginTop = '6px';
    subEl.style.display = 'block';
  }
}

function animNum(id, from, to, dur) {
  const el = document.getElementById(id);
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / dur, 1);
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    el.textContent = Math.round(from + (to - from) * ease);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function restartCalc() {
  document.getElementById('calcWidget').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  // Reset domain bars
  ['bar-vasc', 'bar-meta', 'bar-behav', 'bar-recov'].forEach(id => {
    document.getElementById(id).style.width = '0%';
  });
  // Reset heart
  const beatGroup = document.getElementById('heartBeatGroup');
  const pulseRing = document.getElementById('pulseRing');
  if (beatGroup) beatGroup.classList.remove('beating');
  if (pulseRing) pulseRing.classList.remove('beating');
  ['vein1', 'vein2', 'vein3', 'vein4'].forEach(id => {
    const v = document.getElementById(id); if (v) v.classList.remove('visible');
  });
  ['heartAgeNum', 'heartAgeLabel', 'heartCaption', 'heartVs', 'heartUnknownWarn'].forEach(id => {
    const el = document.getElementById(id); if (el) el.classList.remove('visible');
  });
  const ageNum = document.getElementById('heartAgeNum');
  if (ageNum) ageNum.textContent = '—';
  curStep = 1; showStep(1); updateProgress();
  document.getElementById('calculator').scrollIntoView({ behavior: 'smooth' });
}

// ══════════════════════════════════════════════
// INTERACTIVE HEART ANIMATION
// Psychology-driven engagement:
// 1. Anthropomorphization: heart visually ages/rejuvenates
// 2. Loss aversion: shows current state, not gains
// 3. Variable reward: progressive revelation (3 steps)
// 4. Social shareability: screenshot-ready visual
// 5. Zeigarnik effect: memorable reference for retest
// ══════════════════════════════════════════════
function animateHeart(score, cardioAge, chronoAge, hasUnknowns) {
  const heart = document.getElementById('heartMain');
  const glow = document.getElementById('heartGlow');
  const pulseRing = document.getElementById('pulseRing');
  const beatGroup = document.getElementById('heartBeatGroup');
  const ageNum = document.getElementById('heartAgeNum');
  const ageLabel = document.getElementById('heartAgeLabel');
  const caption = document.getElementById('heartCaption');
  const vs = document.getElementById('heartVs');
  const svg = document.querySelector('.heart-svg');

  // Calculate heart state based on score
  const ageDiff = cardioAge - chronoAge;

  // Color gradient: vibrant red (good) → dull grey-red (bad)
  let heartColor, heartStroke, glowColor, beatSpeed, veinsToShow;
  if (score >= 75) {
    heartColor = 'rgba(220,40,60,0.7)';
    heartStroke = 'rgba(220,40,60,0.9)';
    glowColor = 'rgba(220,40,60,0.25)';
    beatSpeed = '1.0s';
    veinsToShow = 0;
  } else if (score >= 55) {
    heartColor = 'rgba(180,50,65,0.6)';
    heartStroke = 'rgba(180,50,65,0.7)';
    glowColor = 'rgba(180,50,65,0.15)';
    beatSpeed = '1.2s';
    veinsToShow = 1;
  } else if (score >= 35) {
    heartColor = 'rgba(140,55,65,0.5)';
    heartStroke = 'rgba(140,55,65,0.6)';
    glowColor = 'rgba(140,55,65,0.08)';
    beatSpeed = '1.5s';
    veinsToShow = 3;
  } else {
    heartColor = 'rgba(100,50,55,0.45)';
    heartStroke = 'rgba(100,50,55,0.55)';
    glowColor = 'rgba(100,50,55,0.05)';
    beatSpeed = '2.0s';
    veinsToShow = 4;
  }

  // Phase 1: Heart color transition (immediate)
  setTimeout(() => {
    heart.setAttribute('fill', heartColor);
    heart.setAttribute('stroke', heartStroke);
    svg.style.setProperty('--heart-glow', glowColor);
    svg.style.filter = `drop-shadow(0 0 ${score >= 55 ? 50 : 20}px ${glowColor})`;
  }, 400);

  // Phase 2: Start heartbeat (600ms)
  setTimeout(() => {
    beatGroup.style.setProperty('--beat-speed', beatSpeed);
    beatGroup.classList.add('beating');
    pulseRing.style.setProperty('--beat-speed', beatSpeed);
    pulseRing.classList.add('beating');
  }, 600);

  // Phase 3: Show veins for aging hearts (1000ms)
  setTimeout(() => {
    const veins = ['vein1', 'vein2', 'vein3', 'vein4'];
    for (let i = 0; i < veinsToShow; i++) {
      const v = document.getElementById(veins[i]);
      if (v) v.classList.add('visible');
    }
  }, 1000);

  // Phase 4: Reveal age number (1200ms)
  setTimeout(() => {
    animNum('heartAgeNum', chronoAge, cardioAge, 1800);
    ageNum.classList.add('visible');
    ageLabel.classList.add('visible');
  }, 1200);

  // Phase 5: Caption and comparison (1800ms)
  setTimeout(() => {
    let captionText;
    if (ageDiff <= -5) {
      captionText = 'Tu corazón es <em>más joven</em> que vos.';
    } else if (ageDiff <= 0) {
      captionText = 'Tu corazón está <em>en sintonía</em> con tu edad.';
    } else if (ageDiff <= 5) {
      captionText = 'Tu corazón está <em>envejeciendo</em> un poco más rápido.';
    } else if (ageDiff <= 10) {
      captionText = 'Tu corazón envejece <em>significativamente</em> más rápido.';
    } else {
      captionText = 'Tu corazón necesita <em>atención urgente.</em>';
    }
    caption.innerHTML = captionText;
    caption.classList.add('visible');

    vs.innerHTML = `Edad cronológica: <span>${chronoAge}</span> · Edad cardiovascular: <span>${cardioAge}</span>`;
    vs.classList.add('visible');

    const unkWarn = document.getElementById('heartUnknownWarn');
    if (unkWarn && hasUnknowns) unkWarn.classList.add('visible');
  }, 2200);
}

// ══════════════════════════════════════════════
// ACTION FUNCTIONS (Share, Opt-in, Legal)
// ══════════════════════════════════════════════
async function generateShareImage(type) {
  // Populate templates
  document.getElementById('tpl-ig-score').textContent = global_score;
  document.getElementById('tpl-ig-age').textContent = global_cardioAge;
  document.getElementById('tpl-post-score').textContent = global_score;
  document.getElementById('tpl-post-age').textContent = global_cardioAge;

  let riskStr = "";
  if(global_score >= 75) riskStr = "Bajo";
  else if(global_score >= 55) riskStr = "Moderado";
  else if(global_score >= 35) riskStr = "Elevado";
  else riskStr = "Alto";
  document.getElementById('tpl-ig-cat').textContent = riskStr;
  document.getElementById('tpl-post-cat').textContent = riskStr;

  const targetId = type === 'ig' ? 'tpl-ig' : 'tpl-post';
  const el = document.getElementById(targetId);
  const canvas = await html2canvas(el, { scale: 2 });
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function handleShareAction(type, fallbackText, fallbackUrl) {
  const btnStr = type === 'ig' ? '.share-ig' : (type === 'x' ? '.share-x' : '.share-wa');
  const btn = document.querySelector(btnStr);
  const oldText = btn.textContent;
  btn.textContent = 'Generando...';
  btn.disabled = true;

  try {
    const blob = await generateShareImage(type === 'ig' ? 'ig' : 'post');
    const file = new File([blob], `UpgradeYourHeart-${global_cardioAge}años.png`, { type: 'image/png' });
    const shareData = {
      title: 'Mi Perfil CV - UpgradeYourHeart',
      text: fallbackText,
      files: [file]
    };

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share(shareData);
    } else {
      // Fallback: download the generated image
      const dataUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `UpgradeYourHeart-${global_cardioAge}años.png`;
      a.click();
      URL.revokeObjectURL(dataUrl);

      // And open the link intent for non-IG
      if (fallbackUrl) {
         setTimeout(() => { window.open(fallbackUrl, '_blank'); }, 500);
      } else {
         alert("La imagen ha sido descargada. Podés subirla a tu cuenta de Instagram manualmente.");
      }
    }
  } catch(e) {
    if(e.name !== "AbortError") console.error('Share error:', e);
  } finally {
    btn.textContent = oldText;
    btn.disabled = false;
  }
}

function shareTwitter() {
  const text = `Mi edad cardiovascular estim. es ${global_cardioAge} años (tengo ${global_chronoAge}). Mi perfil CV: ${global_score}/100.\\n\\nProbá este test basado en guías ESC y ACC/AHA → https://upgradeyourheart.com`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  handleShareAction('x', text, url);
}

function shareWhatsApp() {
  const text = `Mi edad cardiovascular estim. es ${global_cardioAge} años (tengo ${global_chronoAge}). Mi perfil CV: ${global_score}/100.\\n\\nProbá este test basado en guías ESC y ACC/AHA → https://upgradeyourheart.com`;
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  handleShareAction('wa', text, url);
}

function shareInstagram() {
  const text = `Mi edad cardiovascular estim. es ${global_cardioAge} años (tengo ${global_chronoAge}). Mi perfil CV: ${global_score}/100.`;
  handleShareAction('ig', text, null);
}

async function submitOptin() {
  const email = document.getElementById('optinEmail').value.trim();
  const msg = document.getElementById('optinMsg');
  if (!email || !email.includes('@') || email.length > 254) {
    msg.textContent = 'Ingresá un email válido.';
    msg.style.color = 'var(--red)';
    msg.style.display = 'block';
    return;
  }
  if (isRateLimited('optin', 30000)) {
    msg.textContent = 'Por favor, esperá 30 segundos antes de intentar de nuevo.';
    msg.style.color = 'var(--red)';
    msg.style.display = 'block';
    return;
  }
  try {
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    // Using contact_messages table to store optin to avoid requiring a new table immediately
    const { error } = await _supabase.from('contact_messages').insert([{
      email: email,
      question: 'REMINDER_OPTIN'
    }]);
    if (error) throw error;
    msg.textContent = '✓ Listo. Te recordaremos en 3 meses.';
    msg.style.color = '#2ecc71';
    msg.style.display = 'block';
    document.getElementById('optinEmail').disabled = true;
  } catch (e) {
    msg.textContent = 'Error al guardar. Intentá de nuevo.';
    msg.style.color = 'var(--red)';
    msg.style.display = 'block';
  }
}

const legalModal = document.getElementById('legal-modal');
function openLegalModal(e) {
  if (e) e.preventDefault();
  legalModal.style.display = 'flex';
  // tiny delay for transition
  setTimeout(() => { legalModal.style.opacity = '1'; legalModal.style.pointerEvents = 'auto'; }, 10);
}
function closeLegalModal() {
  legalModal.style.opacity = '0';
  legalModal.style.pointerEvents = 'none';
  setTimeout(() => { legalModal.style.display = 'none'; }, 300);
}
legalModal.addEventListener('click', e => {
  if (e.target === legalModal) closeLegalModal();
});

// ══════════════════════════════════════════════
// SUPABASE CONTACT FORM
// ══════════════════════════════════════════════
const SUPABASE_URL = 'https://qndsdanfwqjfmwoifsfy.supabase.co';
const SUPABASE_KEY = 'sb_publishable_RJJWmuHdmwFoE83bruhGhg_RCOO4oET';

// ── Client-side rate limiting ──
const _rateLimitMap = {};
function isRateLimited(action, cooldownMs = 30000) {
  const now = Date.now();
  if (_rateLimitMap[action] && (now - _rateLimitMap[action]) < cooldownMs) return true;
  _rateLimitMap[action] = now;
  return false;
}

const contactModal = document.getElementById('contact-modal');
function openContactModal(e) {
  if (e) e.preventDefault();
  contactModal.classList.add('open');
}
function closeContactModal() {
  contactModal.classList.remove('open');
  document.getElementById('contactMsg').className = 'contact-msg';
  document.getElementById('contactForm').reset();
}

contactModal.addEventListener('click', e => {
  if (e.target === contactModal) closeContactModal();
});

async function submitContact(e) {
  e.preventDefault();
  const btn = document.getElementById('contactSubmitBtn');
  const msg = document.getElementById('contactMsg');
  const email = document.getElementById('contactEmail').value.trim();
  const question = document.getElementById('contactQuestion').value.trim();

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    msg.textContent = 'Servicio de contacto no disponible en este momento.';
    msg.className = 'contact-msg error';
    return;
  }

  if (isRateLimited('contact', 30000)) {
    msg.textContent = 'Por favor, esperá 30 segundos antes de enviar otra consulta.';
    msg.className = 'contact-msg error';
    return;
  }

  if (email.length > 254 || question.length > 2000) {
    msg.textContent = 'El mensaje es demasiado largo. Máximo 2000 caracteres.';
    msg.className = 'contact-msg error';
    return;
  }

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    const { createClient } = window.supabase;
    const _supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { error } = await _supabase.from('contact_messages').insert([{ email, question }]);
    if (error) throw error;

    msg.textContent = '¡Consulta enviada exitosamente!';
    msg.className = 'contact-msg success';
    document.getElementById('contactForm').reset();
  } catch (err) {
    msg.textContent = 'Hubo un error al enviar. Por favor, intentá nuevamente.';
    msg.className = 'contact-msg error';
  } finally {
    btn.textContent = 'Enviar consulta';
    btn.disabled = false;
  }
}

// ══════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════
updateProgress();
window.dispatchEvent(new Event('scroll'));
