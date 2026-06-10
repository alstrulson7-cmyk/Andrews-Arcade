(() => {
  let allGames = [];
  let activeCategory = 'All';
  let searchQuery = '';

  const grid          = document.getElementById('grid');
  const filters       = document.getElementById('filters');
  const searchInput   = document.getElementById('search-input');
  const modal         = document.getElementById('modal');
  const gameFrame     = document.getElementById('game-frame');
  const modalTitle    = document.getElementById('modal-title');
  const modalIcon     = document.getElementById('modal-icon');
  const modalLink     = document.getElementById('modal-link');
  const btnClose      = document.getElementById('btn-close');
  const empty         = document.getElementById('empty');
  const gameCount     = document.getElementById('game-count');
  const logoBtn       = document.getElementById('logo-btn');
  const featuredBanner = document.getElementById('featured-banner');
  const featuredPlay  = document.getElementById('featured-play');
  const statGames     = document.getElementById('stat-games');
  const statCats      = document.getElementById('stat-cats');

  // Category color map
  const catColors = {
    Arcade:   { color: '#00f0ff', bg: 'rgba(0,240,255,0.12)', border: 'rgba(0,240,255,0.3)' },
    Puzzle:   { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' },
    Strategy: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)' },
    Word:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.3)' },
    Card:     { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
  };

  function getCatStyle(cat) {
    return catColors[cat] || { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' };
  }

  // ── Fetch games.json ──────────────────────────────
  fetch('games.json')
    .then(r => { if (!r.ok) throw new Error('Could not load games.json'); return r.json(); })
    .then(data => {
      allGames = data;
      const cats = new Set(allGames.map(g => g.category));
      statGames.textContent = allGames.length;
      statCats.textContent  = cats.size;
      setupFeatured();
      buildFilters();
      render();
    })
    .catch(err => {
      grid.innerHTML = `<p style="color:var(--pink);padding:24px;grid-column:1/-1">Failed to load games: ${err.message}</p>`;
    });

  // ── Featured banner ───────────────────────────────
  function setupFeatured() {
    const featured = allGames[0];
    if (!featured) return;
    document.getElementById('featured-title').textContent = featured.title;
    document.getElementById('featured-desc').textContent  = featured.description;
    document.getElementById('featured-tag').textContent   = featured.category;
    document.getElementById('featured-deco').textContent  = featured.thumbnail;

    const s = getCatStyle(featured.category);
    const tag = document.getElementById('featured-tag');
    tag.style.color       = s.color;
    tag.style.background  = s.bg;
    tag.style.borderColor = s.border;

    featuredBanner.addEventListener('click', () => openGame(featured.id));
    featuredPlay.addEventListener('click', e => { e.stopPropagation(); openGame(featured.id); });
    featuredBanner.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(featured.id); }
    });
  }

  // ── Category pills ────────────────────────────────
  function buildFilters() {
    const categories = ['All', ...new Set(allGames.map(g => g.category))].sort((a, b) =>
      a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
    );
    filters.innerHTML = '';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'pill' + (cat === activeCategory ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        activeCategory = cat;
        document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        render();
      });
      filters.appendChild(btn);
    });
  }

  // ── Render ────────────────────────────────────────
  function render() {
    const q = searchQuery.toLowerCase().trim();
    const visible = allGames.filter(g => {
      const matchCat    = activeCategory === 'All' || g.category === activeCategory;
      const matchSearch = !q || g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.category.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });

    gameCount.textContent = visible.length + ' game' + (visible.length !== 1 ? 's' : '');

    if (visible.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
    } else {
      empty.style.display = 'none';
      grid.innerHTML = visible.map(g => cardHTML(g)).join('');
      grid.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => openGame(card.dataset.id));
      });
    }
  }

  function cardHTML(g) {
    const s = getCatStyle(g.category);
    return `
      <div class="card" data-id="${esc(g.id)}" role="button" tabindex="0" aria-label="Play ${esc(g.title)}">
        <div class="card-thumb">
          <span class="card-thumb-emoji">${g.thumbnail}</span>
          <div class="card-play-overlay">PLAY</div>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="card-cat" style="color:${s.color};background:${s.bg};border-color:${s.border}">${esc(g.category)}</span>
          </div>
          <div class="card-title">${esc(g.title)}</div>
          <div class="card-desc">${esc(g.description)}</div>
          <div class="card-footer">
            <span class="card-play-btn">Play Now <span class="card-play-arrow">→</span></span>
            <span class="card-platform">Browser</span>
          </div>
        </div>
      </div>`;
  }

  // ── Open modal ────────────────────────────────────
  function openGame(id) {
    const game = allGames.find(g => g.id === id);
    if (!game) return;
    modalTitle.textContent = game.title;
    modalIcon.textContent  = game.thumbnail;
    modalLink.href = game.url;
    gameFrame.src  = game.url;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    gameFrame.src = 'about:blank';
    document.body.style.overflow = '';
  }

  btnClose.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  grid.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
      e.preventDefault(); openGame(e.target.dataset.id);
    }
  });

  searchInput.addEventListener('input', e => { searchQuery = e.target.value; render(); });

  logoBtn.addEventListener('click', e => {
    e.preventDefault();
    searchQuery = ''; activeCategory = 'All';
    searchInput.value = '';
    document.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p.textContent === 'All'));
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
})();
