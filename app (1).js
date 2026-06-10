(() => {
  // ── Games data (embedded — no fetch needed) ───────
  const allGames = [
    {
      id: "2048",
      title: "2048",
      category: "Puzzle",
      description: "Slide tiles and combine them to reach 2048.",
      thumbnail: "🔢",
      url: "https://play2048.co/"
    },
    {
      id: "pacman",
      title: "Pac-Man",
      category: "Arcade",
      description: "Classic maze chase — eat dots, dodge ghosts.",
      thumbnail: "👾",
      url: "https://freepacman.org/"
    },
    {
      id: "tetris",
      title: "Tetris",
      category: "Puzzle",
      description: "Stack falling blocks and clear lines.",
      thumbnail: "🟦",
      url: "https://tetris.com/play-tetris"
    },
    {
      id: "snake",
      title: "Snake",
      category: "Arcade",
      description: "Grow your snake without hitting walls or yourself.",
      thumbnail: "🐍",
      url: "https://www.google.com/fbx?fbx=snake_arcade"
    },
    {
      id: "chess",
      title: "Chess",
      category: "Strategy",
      description: "Play chess against the computer or a friend.",
      thumbnail: "♟️",
      url: "https://www.chess.com/play/computer"
    },
    {
      id: "sudoku",
      title: "Sudoku",
      category: "Puzzle",
      description: "Fill the 9×9 grid with numbers 1–9.",
      thumbnail: "🔣",
      url: "https://sudoku.com/"
    },
    {
      id: "flappybird",
      title: "Flappy Bird",
      category: "Arcade",
      description: "Tap to fly through the pipes without crashing.",
      thumbnail: "🐦",
      url: "https://flappybird.io/"
    },
    {
      id: "wordle",
      title: "Wordle",
      category: "Word",
      description: "Guess the 5-letter word in 6 tries.",
      thumbnail: "🔤",
      url: "https://wordplay.com/"
    },
    {
      id: "minesweeper",
      title: "Minesweeper",
      category: "Puzzle",
      description: "Clear the minefield without triggering a bomb.",
      thumbnail: "💣",
      url: "https://minesweeper.online/"
    },
    {
      id: "solitaire",
      title: "Solitaire",
      category: "Card",
      description: "Classic Klondike solitaire in your browser.",
      thumbnail: "🃏",
      url: "https://www.solitaire.org/"
    },
    {
      id: "typeracer",
      title: "TypeRacer",
      category: "Word",
      description: "Race others by typing quotes as fast as you can.",
      thumbnail: "⌨️",
      url: "https://play.typeracer.com/"
    },
    {
      id: "geometrydash",
      title: "Geometry Dash",
      category: "Arcade",
      description: "Jump and fly through a rhythm-based obstacle course.",
      thumbnail: "🔶",
      url: "https://geometrydashgame.org/"
    }
  ];

  // ── State ─────────────────────────────────────────
  let activeCategory = 'All';
  let searchQuery = '';

  // ── DOM refs ──────────────────────────────────────
  const grid           = document.getElementById('grid');
  const filters        = document.getElementById('filters');
  const searchInput    = document.getElementById('search-input');
  const modal          = document.getElementById('modal');
  const gameFrame      = document.getElementById('game-frame');
  const modalTitle     = document.getElementById('modal-title');
  const modalIcon      = document.getElementById('modal-icon');
  const modalLink      = document.getElementById('modal-link');
  const btnClose       = document.getElementById('btn-close');
  const empty          = document.getElementById('empty');
  const gameCount      = document.getElementById('game-count');
  const logoBtn        = document.getElementById('logo-btn');
  const featuredBanner = document.getElementById('featured-banner');
  const featuredPlay   = document.getElementById('featured-play');
  const statGames      = document.getElementById('stat-games');
  const statCats       = document.getElementById('stat-cats');

  // ── Category color map ────────────────────────────
  const catColors = {
    Arcade:   { color: '#00f0ff', bg: 'rgba(0,240,255,0.12)',   border: 'rgba(0,240,255,0.3)' },
    Puzzle:   { color: '#a855f7', bg: 'rgba(168,85,247,0.12)',  border: 'rgba(168,85,247,0.3)' },
    Strategy: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)' },
    Word:     { color: '#4ade80', bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.3)' },
    Card:     { color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.3)' },
  };

  function getCatStyle(cat) {
    return catColors[cat] || { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)' };
  }

  // ── Init ──────────────────────────────────────────
  const cats = new Set(allGames.map(g => g.category));
  statGames.textContent = allGames.length;
  statCats.textContent  = cats.size;
  setupFeatured();
  buildFilters();
  render();

  // ── Featured banner ───────────────────────────────
  function setupFeatured() {
    const f = allGames[0];
    if (!f) return;
    document.getElementById('featured-title').textContent = f.title;
    document.getElementById('featured-desc').textContent  = f.description;
    document.getElementById('featured-tag').textContent   = f.category;
    document.getElementById('featured-deco').textContent  = f.thumbnail;

    const s = getCatStyle(f.category);
    const tag = document.getElementById('featured-tag');
    tag.style.color       = s.color;
    tag.style.background  = s.bg;
    tag.style.borderColor = s.border;

    featuredBanner.addEventListener('click', () => openGame(f.id));
    featuredPlay.addEventListener('click', e => { e.stopPropagation(); openGame(f.id); });
    featuredBanner.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGame(f.id); }
    });
  }

  // ── Build category pills ──────────────────────────
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

  // ── Render cards ──────────────────────────────────
  function render() {
    const q = searchQuery.toLowerCase().trim();
    const visible = allGames.filter(g => {
      const matchCat    = activeCategory === 'All' || g.category === activeCategory;
      const matchSearch = !q ||
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q);
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

  // ── Open game modal ───────────────────────────────
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
      e.preventDefault();
      openGame(e.target.dataset.id);
    }
  });

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value;
    render();
  });

  logoBtn.addEventListener('click', e => {
    e.preventDefault();
    searchQuery = '';
    activeCategory = 'All';
    searchInput.value = '';
    document.querySelectorAll('.pill').forEach(p =>
      p.classList.toggle('active', p.textContent === 'All')
    );
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Escape HTML ───────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
