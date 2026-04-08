/* ============================================
   CONSTANTS — Category Colors
   ============================================ */
const CC = {
  Food:          { t: '#1D9E75', bg: 'var(--cf)' },
  Transport:     { t: '#4f8aff', bg: 'var(--ct)' },
  Shopping:      { t: '#D4537E', bg: 'var(--cs)' },
  Health:        { t: '#639922', bg: 'var(--ch)' },
  Bills:         { t: '#7F77DD', bg: 'var(--cb)' },
  Entertainment: { t: '#EF9F27', bg: 'var(--ce)' },
  Other:         { t: '#888780', bg: 'var(--co)' }
};

/* Credit source colors — greenish tones */
const CRC = {
  Salary:     { t: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
  Business:   { t: '#16a34a', bg: 'rgba(22,163,74,0.15)' },
  Freelance:  { t: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  Gift:       { t: '#34d399', bg: 'rgba(52,211,153,0.15)' },
  Refund:     { t: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  Investment: { t: '#059669', bg: 'rgba(5,150,105,0.15)' },
  Other:      { t: '#6ee7b7', bg: 'rgba(110,231,183,0.15)' }
};


/* ============================================
   STATE
   ============================================ */
let expenses = [];
let credits = [];
let budget = 0;
let activeFilter = 'all';
let activeCrFilter = 'all';
let activeHistoryType = 'expenses';


/* ============================================
   THEME
   ============================================ */
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-btn').textContent = t === 'dark' ? '🌙' : '☀️';
  try { localStorage.setItem('dt_theme', t); } catch (e) {}
}

function setTheme(t) {
  applyTheme(t);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}


/* ============================================
   DATA — Load & Save
   ============================================ */
function loadData() {
  try {
    expenses = JSON.parse(localStorage.getItem('dt_expenses') || '[]');
    credits  = JSON.parse(localStorage.getItem('dt_credits') || '[]');
    budget   = parseFloat(localStorage.getItem('dt_budget') || '0');
    applyTheme(localStorage.getItem('dt_theme') || 'dark');
  } catch (e) {
    expenses = [];
    credits = [];
    budget = 0;
  }
}

function saveData() {
  try {
    localStorage.setItem('dt_expenses', JSON.stringify(expenses));
    localStorage.setItem('dt_credits', JSON.stringify(credits));
    localStorage.setItem('dt_budget', String(budget));
  } catch (e) {}
}


/* ============================================
   UTILITIES
   ============================================ */
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStr() {
  return todayStr().slice(0, 7);
}

function fmt(n) {
  return 'D\u00a0' + (+n).toLocaleString('en-GM', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function fmtS(n) {
  return 'D\u00a0' + Math.round(n).toLocaleString('en-GM');
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* ============================================
   NAVIGATION
   ============================================ */
function showPanel(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  btn.classList.add('active');

  if (name === 'compare') renderCompare();
}


/* ============================================
   ADD / DELETE EXPENSES
   ============================================ */
function addExpense() {
  const desc   = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const cat    = document.getElementById('category').value;
  const date   = document.getElementById('date').value;

  if (!desc)                    { toast('Enter a description'); return; }
  if (!amount || amount <= 0)   { toast('Enter a valid amount'); return; }
  if (!date)                    { toast('Select a date'); return; }

  expenses.unshift({ id: Date.now(), desc, amount, cat, date });
  saveData();

  document.getElementById('desc').value = '';
  document.getElementById('amount').value = '';
  toast('Expense added!');
  render();
}

function addCredit() {
  const desc   = document.getElementById('cr-desc').value.trim();
  const amount = parseFloat(document.getElementById('cr-amount').value);
  const source = document.getElementById('cr-source').value;
  const date   = document.getElementById('cr-date').value;

  if (!desc)                    { toast('Enter a description'); return; }
  if (!amount || amount <= 0)   { toast('Enter a valid amount'); return; }
  if (!date)                    { toast('Select a date'); return; }

  credits.unshift({ id: Date.now(), desc, amount, source, date });
  saveData();

  document.getElementById('cr-desc').value = '';
  document.getElementById('cr-amount').value = '';
  toast('Credit added!');
  render();
}

function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  expenses = expenses.filter(e => e.id !== id);
  saveData();
  render();
}

function deleteCredit(id) {
  if (!confirm('Delete this credit?')) return;
  credits = credits.filter(c => c.id !== id);
  saveData();
  render();
}

function setFilter(f, btn) {
  activeFilter = f;
  document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderHistory();
}


/* ============================================
   HTML HELPERS
   ============================================ */
function catPill(cat) {
  const c = CC[cat] || CC.Other;
  return `<span class="cat-pill" style="background:${c.bg};color:${c.t}">${cat}</span>`;
}

function srcPill(source) {
  const c = CRC[source] || CRC.Other;
  return `<span class="cat-pill" style="background:${c.bg};color:${c.t}">${source}</span>`;
}

function expenseHTML(e) {
  return `
    <div class="expense-item">
      ${catPill(e.cat)}
      <div class="exp-desc">${esc(e.desc)}</div>
      <div class="exp-date">${e.date}</div>
      <div class="exp-amount">${fmt(e.amount)}</div>
      <button class="del-btn" data-delete-id="${e.id}" title="Delete">&#x2715;</button>
    </div>`;
}

function creditHTML(c) {
  return `
    <div class="expense-item credit-item">
      ${srcPill(c.source)}
      <div class="exp-desc">${esc(c.desc)}</div>
      <div class="exp-date">${c.date}</div>
      <div class="exp-amount credit-amount">+ ${fmt(c.amount)}</div>
      <button class="del-btn" data-delete-credit-id="${c.id}" title="Delete">&#x2715;</button>
    </div>`;
}


/* ============================================
   RENDER — Main Entry
   ============================================ */
function render() {
  renderDashboard();
  renderHistory();
  renderCreditHistory();
}

function renderDashboard() {
  const today = todayStr();
  const month = monthStr();
  const monthExp   = expenses.filter(e => e.date.startsWith(month));
  const todayExp   = expenses.filter(e => e.date === today);
  const monthTotal = monthExp.reduce((s, e) => s + e.amount, 0);
  const todayTotal = todayExp.reduce((s, e) => s + e.amount, 0);
  const dayOfMonth = new Date().getDate();
  const avg = dayOfMonth > 0 ? monthTotal / dayOfMonth : 0;

  /* Credit metrics */
  const monthCr    = credits.filter(c => c.date.startsWith(month));
  const crTotal    = monthCr.reduce((s, c) => s + c.amount, 0);
  const netBalance = crTotal - monthTotal;

  /* Summary metrics */
  document.getElementById('m-month').textContent      = fmt(monthTotal);
  document.getElementById('m-month-sub').textContent   = monthExp.length + ' entries';
  document.getElementById('m-credit-month').textContent = fmt(crTotal);
  document.getElementById('m-credit-month-sub').textContent = monthCr.length + ' entries';

  const netEl = document.getElementById('m-net');
  netEl.textContent = (netBalance >= 0 ? '+' : '') + ' ' + fmt(Math.abs(netBalance));
  netEl.className = 'metric-value' + (netBalance >= 0 ? ' credit-color' : ' danger');
  document.getElementById('m-net-sub').textContent = netBalance >= 0 ? 'surplus' : 'deficit';

  document.getElementById('m-today').textContent       = fmt(todayTotal);
  document.getElementById('m-today-sub').textContent    = todayExp.length + ' entries';
  document.getElementById('m-avg').textContent         = fmtS(avg);
  document.getElementById('m-avg-sub').textContent     = 'day ' + dayOfMonth + ' of month';

  /* Budget */
  if (budget > 0) {
    const left = budget - monthTotal;
    const pct  = Math.min(100, (monthTotal / budget) * 100);
    const lvl  = pct >= 100 ? 'danger' : pct >= 80 ? 'warn' : '';

    const el = document.getElementById('m-budget-left');
    el.textContent = left >= 0 ? fmt(left) : '–' + fmt(-left);
    el.className = 'metric-value' + (lvl ? ' ' + lvl : '');

    document.getElementById('m-budget-sub').textContent = Math.round(pct) + '% used';
    document.getElementById('budget-bar-card').style.display = 'block';

    const bar = document.getElementById('budget-bar');
    bar.style.width = pct + '%';
    bar.className = 'budget-bar-fill' + (lvl ? ' ' + lvl : '');

    document.getElementById('bar-spent').textContent = fmt(monthTotal) + ' spent';
    document.getElementById('bar-limit').textContent = 'of ' + fmt(budget);
    document.getElementById('budget-metric').className =
      'metric' + (lvl === 'danger' ? ' danger-border' : lvl === 'warn' ? ' warn-border' : '');
  } else {
    document.getElementById('m-budget-left').textContent = '—';
    document.getElementById('m-budget-sub').textContent  = 'No budget set';
    document.getElementById('budget-bar-card').style.display = 'none';
    document.getElementById('budget-metric').className = 'metric';
  }

  /* Category totals */
  const catTotals = {};
  monthExp.forEach(e => {
    catTotals[e.cat] = (catTotals[e.cat] || 0) + e.amount;
  });

  renderDonut(catTotals, monthTotal);
  renderBars(catTotals);
  renderSparkline();
  renderHeatmap(month);

  /* Recent list */
  const recEl = document.getElementById('recent-list');
  recEl.innerHTML = expenses.length
    ? expenses.slice(0, 5).map(expenseHTML).join('')
    : '<div class="empty">No expenses yet</div>';

  /* Recent credits */
  const crEl = document.getElementById('recent-credit-list');
  crEl.innerHTML = credits.length
    ? credits.slice(0, 5).map(creditHTML).join('')
    : '<div class="empty">No credits yet</div>';
}


/* ============================================
   DONUT CHART
   ============================================ */
function renderDonut(catTotals, total) {
  const svg    = document.getElementById('donut-svg');
  const legend = document.getElementById('donut-legend');
  document.getElementById('donut-val').textContent = fmtS(total);

  if (!total) {
    svg.innerHTML = `<circle cx="65" cy="65" r="50" fill="none" stroke-width="15" stroke="var(--bg3)"/>`;
    legend.innerHTML = '<div style="font-size:11px;color:var(--text3);text-align:center">No data</div>';
    return;
  }

  const cx = 65, cy = 65, r = 50;
  const entries = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  let angle = 0;
  let paths = '';

  entries.forEach(([cat, val]) => {
    const sweep = (val / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);

    paths += `<path
      d="M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)}
         A${r},${r} 0 ${sweep > Math.PI ? 1 : 0},1 ${x2.toFixed(2)},${y2.toFixed(2)} Z"
      fill="${CC[cat]?.t || '#888'}" opacity=".85"/>`;
  });

  paths += `<circle cx="${cx}" cy="${cy}" r="36" fill="var(--bg2)"/>`;
  svg.innerHTML = paths;

  legend.innerHTML = entries.slice(0, 5).map(([cat, val]) => `
    <div class="legend-row">
      <span class="legend-dot" style="background:${CC[cat]?.t || '#888'}"></span>
      <span>${cat}</span>
      <span class="legend-pct">${Math.round((val / total) * 100)}%</span>
    </div>`
  ).join('');
}


/* ============================================
   BAR CHART
   ============================================ */
function renderBars(catTotals) {
  const maxCat = Math.max(...Object.values(catTotals), 1);
  const barsEl = document.getElementById('cat-bars');

  if (!Object.keys(catTotals).length) {
    barsEl.innerHTML = '<div class="empty">No data for this month</div>';
    return;
  }

  barsEl.innerHTML = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, total]) => `
      <div class="bar-row">
        <div class="bar-label" style="color:${CC[cat]?.t || '#888'}">${cat}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(total / maxCat * 100).toFixed(1)}%;background:${CC[cat]?.t || '#888'}"></div>
        </div>
        <div class="bar-amt">${fmtS(total)}</div>
      </div>`)
    .join('');
}


/* ============================================
   SPARKLINE
   ============================================ */
function renderSparkline() {
  const svg   = document.getElementById('sparkline-svg');
  const today = todayStr();

  const data = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      key,
      total: expenses.filter(e => e.date === key).reduce((s, e) => s + e.amount, 0)
    };
  });

  const maxVal = Math.max(...data.map(d => d.total), 1);
  const W = 300, H = 72, pad = 4;
  const xs = data.map((_, i) => pad + i * (W - pad * 2) / 13);
  const ys = data.map(d => H - pad - (d.total / maxVal) * (H - pad * 2));
  const bW = ((W - pad * 2) / 14) * 0.65;

  let bars = '';
  data.forEach((d, i) => {
    const bH = d.total > 0 ? (d.total / maxVal) * (H - pad * 2) : 0;
    bars += `<rect
      x="${(xs[i] - bW / 2).toFixed(1)}" y="${(H - pad - bH).toFixed(1)}"
      width="${bW.toFixed(1)}" height="${bH.toFixed(1)}"
      fill="#4f8aff" opacity="${d.key === today ? 0.9 : 0.35}" rx="2">
      <title>${d.key}: ${fmt(d.total)}</title>
    </rect>`;
  });

  const line = 'M' + xs.map((x, i) => `${x.toFixed(1)},${ys[i].toFixed(1)}`).join('L');
  const area = 'M' + xs[0].toFixed(1) + ',' + H + ' '
    + xs.map((x, i) => `L${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
    + ` L${xs[13].toFixed(1)},${H} Z`;

  svg.innerHTML = bars
    + `<path d="${area}" fill="#4f8aff" opacity=".07"/>`
    + `<path d="${line}" fill="none" stroke="#4f8aff" stroke-width="1.5" stroke-linejoin="round" opacity=".5"/>`;
}


/* ============================================
   HEATMAP
   ============================================ */
function renderHeatmap(month) {
  const grid = document.getElementById('heatmap-grid');
  const year = parseInt(month.slice(0, 4));
  const mo   = parseInt(month.slice(5, 7)) - 1;
  const first = new Date(year, mo, 1);
  const last  = new Date(year, mo + 1, 0).getDate();

  const dailyTotals = {};
  expenses
    .filter(e => e.date.startsWith(month))
    .forEach(e => { dailyTotals[e.date] = (dailyTotals[e.date] || 0) + e.amount; });

  const maxDay = Math.max(...Object.values(dailyTotals), 1);
  let cells = '';

  // Empty cells for days before the 1st
  for (let p = 0; p < first.getDay(); p++) {
    cells += '<div></div>';
  }

  // Day cells
  for (let d = 1; d <= last; d++) {
    const key   = month + '-' + String(d).padStart(2, '0');
    const val   = dailyTotals[key] || 0;
    const alpha = val > 0 ? (0.2 + (val / maxDay) * 0.75).toFixed(2) : 0;
    const bg    = val > 0 ? `rgba(79,138,255,${alpha})` : 'var(--bg3)';
    const border = key === todayStr() ? 'border:1.5px solid var(--accent);' : '';
    const tip   = val > 0 ? fmt(val) : 'No expenses';

    cells += `<div class="hm-cell" style="background:${bg};${border}" data-tip="${key}: ${tip}"></div>`;
  }

  grid.innerHTML = cells;
}


/* ============================================
   HISTORY
   ============================================ */
function renderHistory() {
  const filtered = activeFilter === 'all'
    ? expenses
    : expenses.filter(e => e.cat === activeFilter);

  const total = filtered.reduce((s, e) => s + e.amount, 0);
  const label = activeFilter === 'all' ? 'All' : activeFilter;

  document.getElementById('history-count').textContent =
    label + ' — ' + filtered.length + ' entries · ' + fmt(total);

  document.getElementById('history-list').innerHTML = filtered.length
    ? filtered.map(expenseHTML).join('')
    : '<div class="empty">No expenses found</div>';
}


/* ============================================
   CREDIT HISTORY
   ============================================ */
function renderCreditHistory() {
  const filtered = activeCrFilter === 'all'
    ? credits
    : credits.filter(c => c.source === activeCrFilter);

  const total = filtered.reduce((s, c) => s + c.amount, 0);
  const label = activeCrFilter === 'all' ? 'All' : activeCrFilter;

  document.getElementById('credit-history-count').textContent =
    label + ' — ' + filtered.length + ' entries · ' + fmt(total);

  document.getElementById('credit-history-list').innerHTML = filtered.length
    ? filtered.map(creditHTML).join('')
    : '<div class="empty">No credits found</div>';
}

function setCrFilter(f, btn) {
  activeCrFilter = f;
  document.querySelectorAll('[data-cr-filter]').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderCreditHistory();
}

function switchHistoryType(type, btn) {
  activeHistoryType = type;
  document.querySelectorAll('.history-type-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.history-section').forEach(s => s.classList.remove('active'));
  document.getElementById('history-' + type).classList.add('active');
}

function exportCreditCSV(mode) {
  const data = mode === 'all'
    ? credits
    : (activeCrFilter === 'all' ? credits : credits.filter(c => c.source === activeCrFilter));

  if (!data.length) { toast('No data to export'); return; }

  const rows = [
    'ID,Date,Description,Source,Amount (D)',
    ...data.map(c =>
      `${c.id},${c.date},"${c.desc.replace(/"/g, '""')}",${c.source},${c.amount.toFixed(2)}`
    )
  ];

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'credits-' + todayStr() + '.csv'
  });

  a.click();
  URL.revokeObjectURL(a.href);
  toast('Credits CSV exported!');
}


/* ============================================
   COMPARE — Monthly Comparison
   ============================================ */
function renderCompare() {
  const now = new Date();

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      key: d.toISOString().slice(0, 7),
      label: d.toLocaleDateString('en-GM', { month: 'short', year: '2-digit' }),
      current: i === 5
    };
  });

  /* Monthly totals */
  const totals = {};
  months.forEach(m => {
    totals[m.key] = expenses
      .filter(e => e.date.startsWith(m.key))
      .reduce((s, e) => s + e.amount, 0);
  });

  const maxTotal = Math.max(...Object.values(totals), 1);
  const mgEl = document.getElementById('month-grid');

  if (Object.values(totals).every(v => v === 0)) {
    mgEl.innerHTML = '<div class="empty">No data yet</div>';
  } else {
    mgEl.innerHTML = months.map((m, i) => {
      const total = totals[m.key];
      const pct   = (total / maxTotal * 100).toFixed(1);

      let delta = '', dc = 'same';
      if (i > 0) {
        const prev = totals[months[i - 1].key];
        if (prev > 0) {
          const diff = ((total - prev) / prev) * 100;
          delta = diff > 0 ? '+' + Math.round(diff) + '%'
                : diff < 0 ? Math.round(diff) + '%'
                : '—';
          dc = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
        }
      }

      return `
        <div class="month-row">
          <div class="month-name" style="${m.current ? 'color:var(--accent);font-weight:500' : ''}">${m.label}</div>
          <div class="month-bar-track">
            <div class="month-bar-fill${m.current ? ' current' : ''}" style="width:${pct}%"></div>
          </div>
          <div class="month-total">${total > 0 ? fmtS(total) : '—'}</div>
          <div class="month-delta ${dc}">${delta}</div>
        </div>`;
    }).join('');
  }

  /* Category breakdown table */
  const cats  = Object.keys(CC);
  const last3 = months.slice(-3);

  let html = `
    <table style="width:100%;border-collapse:collapse;font-size:12px">
      <thead>
        <tr>
          <th style="text-align:left;padding:6px 0;color:var(--text3);font-weight:400;letter-spacing:.05em">Category</th>
          ${last3.map(m => `<th style="text-align:right;padding:6px 4px;color:var(--text3);font-weight:400">${m.label}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

  cats.forEach(cat => {
    const vals = last3.map(m =>
      expenses
        .filter(e => e.date.startsWith(m.key) && e.cat === cat)
        .reduce((s, e) => s + e.amount, 0)
    );
    if (vals.every(v => v === 0)) return;

    html += `
        <tr style="border-top:1px solid var(--border)">
          <td style="padding:8px 0">
            <span style="display:inline-flex;align-items:center;gap:7px">
              <span style="width:8px;height:8px;border-radius:50%;background:${CC[cat].t};flex-shrink:0;display:inline-block"></span>
              <span style="color:var(--text2)">${cat}</span>
            </span>
          </td>
          ${vals.map(v => `<td style="text-align:right;padding:8px 4px;color:var(--text)">${v > 0 ? fmtS(v) : '—'}</td>`).join('')}
        </tr>`;
  });

  document.getElementById('cat-month-table').innerHTML = html + '</tbody></table>';
}


/* ============================================
   BUDGET
   ============================================ */
function saveBudget() {
  const val = parseFloat(document.getElementById('budget-input').value);
  if (isNaN(val) || val < 0) { toast('Enter a valid budget'); return; }

  budget = val;
  saveData();

  document.getElementById('current-budget-display').textContent =
    val > 0 ? 'Current: ' + fmt(val) + ' / month' : 'No budget set';

  toast('Budget saved!');
  renderDashboard();
}


/* ============================================
   CSV EXPORT
   ============================================ */
function exportCSV(mode) {
  const data = mode === 'all'
    ? expenses
    : (activeFilter === 'all' ? expenses : expenses.filter(e => e.cat === activeFilter));

  if (!data.length) { toast('No data to export'); return; }

  const rows = [
    'ID,Date,Description,Category,Amount (D)',
    ...data.map(e =>
      `${e.id},${e.date},"${e.desc.replace(/"/g, '""')}",${e.cat},${e.amount.toFixed(2)}`
    )
  ];

  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: 'expenses-' + todayStr() + '.csv'
  });

  a.click();
  URL.revokeObjectURL(a.href);
  toast('CSV exported!');
}


/* ============================================
   PDF EXPORT
   ============================================ */
function exportPDF(mode) {
  if (!window.jspdf) { toast('PDF library not ready yet'); return; }

  const { jsPDF } = window.jspdf;
  const data = mode === 'all'
    ? expenses
    : (activeFilter === 'all' ? expenses : expenses.filter(e => e.cat === activeFilter));

  if (!data.length) { toast('No data to export'); return; }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W  = doc.internal.pageSize.getWidth();
  const H  = doc.internal.pageSize.getHeight();
  const mg = 18;
  let y = mg;

  /* Header */
  doc.setFillColor(79, 138, 255);
  doc.rect(0, 0, W, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Expense Tracker — Report', mg, 12);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Generated: ' + new Date().toLocaleDateString('en-GM', { dateStyle: 'full' }), W - mg, 12, { align: 'right' });
  y = 26;

  /* Summary strip */
  const month = monthStr();
  const monthTotal = expenses
    .filter(e => e.date.startsWith(month))
    .reduce((s, e) => s + e.amount, 0);

  doc.setFillColor(244, 245, 250);
  doc.roundedRect(mg, y, W - mg * 2, 22, 3, 3, 'F');

  doc.setTextColor(100, 100, 120);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('RECORDS IN EXPORT', mg + 4, y + 6);
  doc.text('THIS MONTH TOTAL', mg + 55, y + 6);
  doc.text('BUDGET', mg + 110, y + 6);

  doc.setTextColor(20, 20, 40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(String(data.length), mg + 4, y + 16);
  doc.text(fmtS(monthTotal), mg + 55, y + 16);
  doc.text(budget > 0 ? fmtS(budget) : '—', mg + 110, y + 16);
  y += 30;

  /* Table header */
  const cx = [mg, mg + 26, mg + 95, mg + 122, mg + 152];

  function drawTableHeader() {
    doc.setFillColor(25, 25, 38);
    doc.rect(mg, y, W - mg * 2, 8, 'F');
    doc.setTextColor(210, 215, 235);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    ['Date', 'Description', 'Category', 'Amount', 'Running'].forEach((h, i) => {
      doc.text(h, cx[i], y + 5.5);
    });
    y += 10;
  }

  drawTableHeader();

  /* Table rows */
  let running = 0;
  data.forEach((e, idx) => {
    if (y > H - mg - 10) {
      doc.addPage();
      y = mg;
      drawTableHeader();
    }

    running += e.amount;

    if (idx % 2 === 0) {
      doc.setFillColor(248, 249, 253);
      doc.rect(mg, y - 0.5, W - mg * 2, 7.5, 'F');
    }

    doc.setTextColor(35, 35, 55);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text(e.date, cx[0], y + 4.5);
    doc.text(e.desc.length > 33 ? e.desc.slice(0, 33) + '…' : e.desc, cx[1], y + 4.5);
    doc.text(e.cat, cx[2], y + 4.5);
    doc.text(e.amount.toFixed(2), cx[3] + 14, y + 4.5, { align: 'right' });

    doc.setTextColor(100, 100, 130);
    doc.text(running.toFixed(2), cx[4] + 16, y + 4.5, { align: 'right' });
    y += 7.5;
  });

  /* Total row */
  doc.setFillColor(79, 138, 255);
  doc.rect(mg, y, W - mg * 2, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', cx[0], y + 6);
  doc.text(data.reduce((s, e) => s + e.amount, 0).toFixed(2), cx[3] + 14, y + 6, { align: 'right' });
  y += 16;

  /* Category breakdown bars */
  const catTotals = {};
  data.forEach(e => { catTotals[e.cat] = (catTotals[e.cat] || 0) + e.amount; });
  const catList = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);

  if (catList.length) {
    if (y > H - mg - 40) { doc.addPage(); y = mg; }

    doc.setTextColor(40, 40, 70);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Category breakdown', mg, y);
    y += 7;

    const maxC = catList[0][1];
    const barW = W - mg * 2 - 44;

    catList.forEach(([cat, val]) => {
      if (y > H - mg) { doc.addPage(); y = mg; }

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);
      doc.text(cat, mg, y + 3.5);

      doc.setTextColor(30, 30, 50);
      doc.text(val.toFixed(2), W - mg, y + 3.5, { align: 'right' });

      doc.setFillColor(228, 232, 245);
      doc.roundedRect(mg + 28, y, barW, 5, 1, 1, 'F');

      doc.setFillColor(79, 138, 255);
      doc.roundedRect(mg + 28, y, (val / maxC) * barW, 5, 1, 1, 'F');
      y += 9;
    });
  }

  /* Footer — page numbers */
  const pages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 180);
    doc.setFont('helvetica', 'normal');
    doc.text('Expense Tracker · Page ' + p + ' of ' + pages, W / 2, H - 7, { align: 'center' });
  }

  doc.save('expense-report-' + todayStr() + '.pdf');
  toast('PDF exported!');
}


/* ============================================
   CSV IMPORT
   ============================================ */
function importCSVFile() {
  document.getElementById('csv-file-input').click();
}

function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function (e) {
    const lines = e.target.result.trim().split('\n');
    if (lines.length < 2) { toast('Empty CSV'); return; }

    let imported = 0, skipped = 0;
    const existing = new Set(expenses.map(x => x.id));

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].match(/(".*?"|[^,]+)(?=,|$)/g);
      if (!parts || parts.length < 5) { skipped++; continue; }

      const id     = parseInt(parts[0]);
      const date   = parts[1].trim();
      const desc   = parts[2].replace(/^"|"$/g, '').replace(/""/g, '"').trim();
      const cat    = parts[3].trim();
      const amount = parseFloat(parts[4]);

      if (!date || !desc || isNaN(amount)) { skipped++; continue; }
      if (existing.has(id))                { skipped++; continue; }

      expenses.push({ id: id || Date.now() + i, desc, amount, cat, date });
      imported++;
    }

    expenses.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    saveData();
    render();
    toast(imported + ' imported, ' + skipped + ' skipped');
  };

  reader.readAsText(file);
  event.target.value = '';
}

function clearAll() {
  if (!confirm('Delete ALL expenses and credits? Cannot be undone.')) return;
  expenses = [];
  credits = [];
  saveData();
  render();
  toast('All data cleared');
}


/* ============================================
   TOAST
   ============================================ */
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2300);
}


/* ============================================
   EVENT LISTENERS
   ============================================ */
function bindEvents() {

  /* Navigation tabs */
  document.querySelectorAll('.nav-tab[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => showPanel(btn.dataset.panel, btn));
  });

  /* Theme toggle */
  document.getElementById('theme-btn').addEventListener('click', toggleTheme);

  /* Theme buttons in settings */
  document.querySelectorAll('[data-set-theme]').forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.setTheme));
  });

  /* Add expense */
  document.getElementById('add-expense-btn').addEventListener('click', addExpense);

  /* Add credit */
  document.getElementById('add-credit-btn').addEventListener('click', addCredit);

  /* History type tabs */
  document.querySelectorAll('.history-type-tab[data-history-type]').forEach(btn => {
    btn.addEventListener('click', () => switchHistoryType(btn.dataset.historyType, btn));
  });

  /* Filter pills */
  document.querySelectorAll('.filter-pill[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn));
  });

  /* Credit filter pills */
  document.querySelectorAll('.filter-pill[data-cr-filter]').forEach(btn => {
    btn.addEventListener('click', () => setCrFilter(btn.dataset.crFilter, btn));
  });

  /* Export buttons */
  document.querySelectorAll('[data-export]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.export;
      if (action === 'csv-filtered') exportCSV('filtered');
      else if (action === 'csv-all') exportCSV('all');
      else if (action === 'pdf-filtered') exportPDF('filtered');
      else if (action === 'pdf-all') exportPDF('all');
    });
  });

  /* Credit export buttons */
  document.querySelectorAll('[data-cr-export]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.crExport;
      if (action === 'csv-filtered') exportCreditCSV('filtered');
      else if (action === 'csv-all') exportCreditCSV('all');
    });
  });

  /* Save budget */
  document.getElementById('save-budget-btn').addEventListener('click', saveBudget);

  /* Import CSV */
  document.getElementById('import-csv-btn').addEventListener('click', importCSVFile);

  /* CSV file input change */
  document.getElementById('csv-file-input').addEventListener('change', handleCSVImport);

  /* Clear all */
  document.getElementById('clear-all-btn').addEventListener('click', clearAll);

  /* Delete expense — event delegation on body */
  document.body.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-delete-id]');
    if (delBtn) {
      deleteExpense(Number(delBtn.dataset.deleteId));
    }
    const delCrBtn = e.target.closest('[data-delete-credit-id]');
    if (delCrBtn) {
      deleteCredit(Number(delCrBtn.dataset.deleteCreditId));
    }
  });
}


/* ============================================
   OFFLINE DETECTION
   ============================================ */
window.addEventListener('online',  () => { document.getElementById('offline-badge').style.display = 'none'; });
window.addEventListener('offline', () => { document.getElementById('offline-badge').style.display = 'block'; });
if (!navigator.onLine) document.getElementById('offline-badge').style.display = 'block';


/* ============================================
   INIT
   ============================================ */
document.getElementById('date').value = todayStr();
document.getElementById('cr-date').value = todayStr();
loadData();

if (budget > 0) {
  document.getElementById('budget-input').value = budget;
  document.getElementById('current-budget-display').textContent = 'Current: ' + fmt(budget) + ' / month';
}

bindEvents();
render();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
