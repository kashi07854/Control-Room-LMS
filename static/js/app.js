var _lastShown = null;

async function startScan(){
  var r = await fetch('/api/scan', {method:'POST'});
  var j = await r.json();
  if(!j.ok) alert(j.error || 'Scan failed to start');
  pollScan();
}

async function pollScan(){
  try {
    var r = await fetch('/api/scan_status');
    var s = await r.json();
    var el = document.getElementById('scanState');
    if(!el) return;
    if(s.running){
      el.innerHTML = 'Scanning... ' + s.done + ' items<br><small class="text-secondary">' + (s.current || '') + '</small>';
      _lastShown = null;
      setTimeout(pollScan, 1500);
    } else if(s.finished){
      if(_lastShown !== s.finished){
        el.textContent = 'Done - ' + s.total_files + ' files, ' + s.total_folders + ' folders';
        _lastShown = s.finished;
        if(location.pathname === '/') setTimeout(function(){ location.reload(); }, 1500);
      }
    } else {
      el.textContent = 'Not scanned yet';
    }
  } catch(e) {}
}

async function api(url, body){
  var r = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body || {})
  });
  var j = null;
  try { j = await r.json(); } catch(e){}
  if(!r.ok || !j || !j.ok){ return null; }
  return j;
}

async function openExplorer(path){
  await api('/api/open_explorer', {path: path});
}

pollScan();
// --- Advanced Command Palette Logic ---
let cpInput, cpResults, cpItems = [], cpSelectedIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
    cpInput = document.getElementById('cpInput');
    cpResults = document.getElementById('cpResults');
    const overlay = document.getElementById('commandPalette');

    // Keyboard shortcut: Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
        }
        if (e.key === 'Escape') closePalette();
        
        if (overlay.style.display === 'flex') {
            if (e.key === 'ArrowDown') { e.preventDefault(); moveSelection(1); }
            if (e.key === 'ArrowUp') { e.preventDefault(); moveSelection(-1); }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (cpSelectedIndex >= 0 && cpItems[cpSelectedIndex]) {
                    window.location.href = cpItems[cpSelectedIndex].href;
                }
            }
        }
    });

    if(cpInput) {
        cpInput.addEventListener('input', debounce(async (e) => {
            const q = e.target.value.trim();
            if (q.length < 2) {
                cpResults.innerHTML = '<div class="cp-empty">Type at least 2 characters...</div>';
                cpItems = []; cpSelectedIndex = -1;
                return;
            }
            
            cpResults.innerHTML = '<div class="cp-empty">Searching...</div>';
            try {
                const res = await fetch('/search?q=' + encodeURIComponent(q));
                const text = await res.text();
                // Parse the HTML response to extract results
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                const rows = doc.querySelectorAll('tbody tr');
                
                if (rows.length === 0) {
                    cpResults.innerHTML = '<div class="cp-empty">No results found.</div>';
                    cpItems = []; cpSelectedIndex = -1;
                    return;
                }

                let html = '';
                cpItems = [];
                rows.forEach((row, i) => {
                    if (i > 7) return; // Show top 8
                    const link = row.querySelector('a');
                    const pathCell = row.querySelectorAll('td')[1];
                    if (link) {
                        cpItems.push(link);
                        html += `
                        <a href="${link.href}" class="cp-item ${i===0?'selected':''}">
                            <i class="bi bi-file-earmark-text cp-item-icon"></i>
                            <div class="cp-item-text">
                                <span class="cp-item-title">${link.textContent}</span>
                                <span class="cp-item-subtitle">${pathCell ? pathCell.textContent : ''}</span>
                            </div>
                        </a>`;
                    }
                });
                cpResults.innerHTML = html;
                cpSelectedIndex = 0;
            } catch(err) {
                cpResults.innerHTML = '<div class="cp-empty text-danger">Error searching.</div>';
            }
        }, 300));
    }
});

function openPalette() {
    const overlay = document.getElementById('commandPalette');
    if(!overlay) return;
    overlay.style.display = 'flex';
    document.getElementById('cpInput').value = '';
    document.getElementById('cpInput').focus();
    document.getElementById('cpResults').innerHTML = '<div class="cp-empty">Type to start searching...</div>';
}

function closePalette() {
    const overlay = document.getElementById('commandPalette');
    if(overlay) overlay.style.display = 'none';
}

function moveSelection(dir) {
    const items = document.querySelectorAll('.cp-item');
    if(items.length === 0) return;
    items[cpSelectedIndex]?.classList.remove('selected');
    cpSelectedIndex = (cpSelectedIndex + dir + items.length) % items.length;
    items[cpSelectedIndex]?.classList.add('selected');
    items[cpSelectedIndex]?.scrollIntoView({ block: 'nearest' });
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === Theme Toggle ===
function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const icon = document.getElementById('themeIcon');
  const label = document.getElementById('themeLabel');
  if (icon && label) {
    if (theme === 'dark') { icon.className = 'bi bi-sun'; label.textContent = 'Light Mode'; }
    else { icon.className = 'bi bi-moon-stars'; label.textContent = 'Dark Mode'; }
  }
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', next);
  applyTheme(next);
}
(function() {
  const saved = localStorage.getItem('theme') || 'light';
  applyTheme(saved);
})();
