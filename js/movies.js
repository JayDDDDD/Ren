const TMDB_API_KEY = 'dc32ea99d1a41863b0717ad07b3bf7be';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",
  99:"Documentary",18:"Drama",10751:"Family",14:"Fantasy",36:"History",
  27:"Horror",10402:"Music",9648:"Mystery",10749:"Romance",878:"Science Fiction",
  10770:"TV Movie",53:"Thriller",10752:"War",37:"Western",
  10759:"Action & Adventure",10762:"Kids",10763:"News",10764:"Reality",
  10765:"Sci-Fi & Fantasy",10766:"Soap",10767:"Talk",10768:"War & Politics"
};

// Titles to always exclude, regardless of what TMDB returns.
// Add more lowercase titles here if something else slips through.
const EXCLUDED_TITLES = ["overflow"];

function isExcluded(title){
  return EXCLUDED_TITLES.includes((title || "").trim().toLowerCase());
}

function genreNames(ids){
  return (ids || []).slice(0,2).map(id => GENRE_MAP[id]).filter(Boolean).join(", ") || "—";
}

function toItem(raw, type){
  const isTv = type !== "movie";
  return {
    title: raw.title || raw.name,
    type,
    genre: genreNames(raw.genre_ids || (raw.genres ? raw.genres.map(g => g.id) : [])),
    year: ((raw.release_date || raw.first_air_date || "").slice(0,4)) || "—",
    rating: raw.vote_average ? raw.vote_average.toFixed(1) : "—",
    posterPath: raw.poster_path,
    desc: raw.overview || "No description available.",
    emoji: isTv ? "📺" : "🎬",
    color: isTv ? "#3d5a99" : "#4a3466"
  };
}

// 👉 EDIT THIS LIST to change your personal recommendations.
const RECOMMENDED_IDS = [
  { id: 177572,  type: "movie"  },  
  { id: 1150573, type: "movie"  },  
  { id: 72636,    type: "series"  },  
  { id: 335797,   type: "movie" },  
  { id: 228161,  type: "movie" },  
  { id: 565156,   type: "movie" },  
  { id: 1510688,   type: "movie"  },  
  { id: 1465063,  type: "movie"  },
  { id: 1255833,  type: "movie"  },
  { id: 1117898,  type: "movie"  }   
];

const WATCHED_IDS = [
  { id: 950396, type: "movie" },  
  { id: 868759, type: "movie" },  
  { id: 1824, type: "movie" },    
  { id: 496243, type: "movie" },  
  { id: 1184918, type: "movie" },
  { id: 787, type: "movie" },
  { id: 447277, type: "movie" },
  { id: 12153, type: "movie" },
  { id: 9919, type: "movie" },
  { id: 93405, type: "series" },
  { id: 110316, type: "series" },
  { id: 1160981, type: "movie" },
  { id: 746036, type: "movie" },
  { id: 1307078, type: "movie" },
  { id: 803796, type: "movie" },
  { id: 269149, type: "movie" },
  { id: 982843, type: "movie" },
  { id: 1084242, type: "movie" },
  { id: 1424649, type: "movie" },
  { id: 429300, type: "movie" },
  { id: 271607, type: "series" },
  { id: 306762, type: "series" },
  { id: 1007757, type: "movie" },
  { id: 1339713, type: "movie" },
  { id: 530079, type: "movie" },
  { id: 490132, type: "movie" },
  { id: 278043, type: "series" },
  { id: 1633263,  type: "movie" } 
];

let TRENDING_MOVIES = [];
let TRENDING_SERIES = [];
let TRENDING_ANIME = [];
let RECOMMENDED = [];
let WATCHED = [];

async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("TMDB request failed: " + res.status);
  return res.json();
}

async function loadTrendingMovies(){
  const data = await fetchJSON(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`);
  return (data.results || []).slice(0,10).map(r => toItem(r, "movie"));
}

async function loadTrendingSeries(){
  const data = await fetchJSON(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}`);
  return (data.results || [])
    .filter(r => !isExcluded(r.name || r.title))
    .filter(r => !(r.genre_ids || []).includes(16)) // skip anime/animation — already its own section
    .slice(0,10)
    .map(r => toItem(r, "series"));
}

async function loadTrendingAnime(){
  const data = await fetchJSON(`${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&include_adult=false&vote_count.gte=50&page=1`);
  return (data.results || [])
    .filter(r => !isExcluded(r.name || r.title))
    .slice(0,10)
    .map(r => toItem(r, "anime"));
}

async function loadRecommended(){
  return Promise.all(RECOMMENDED_IDS.map(async ({id, type}) => {
    const endpoint = type === "movie" ? "movie" : "tv";
    const raw = await fetchJSON(`${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${TMDB_API_KEY}`);
    return toItem(raw, type);
  }));
}

async function loadWatched(){
  return Promise.all(WATCHED_IDS.map(async ({id, type}) => {
    const endpoint = type === "movie" ? "movie" : "tv";
    const raw = await fetchJSON(`${TMDB_BASE_URL}/${endpoint}/${id}?api_key=${TMDB_API_KEY}`);
    return toItem(raw, type);
  }));
}

async function fetchRandomItem(poolType){
  const randomPage = Math.floor(Math.random() * 20) + 1;
  let url;
  if(poolType === "movie"){
    url = `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&include_adult=false&vote_count.gte=50&page=${randomPage}`;
  } else if(poolType === "series"){
    url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&without_genres=16&include_adult=false&vote_count.gte=50&page=${randomPage}`;
  } else {
    url = `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_origin_country=JP&sort_by=popularity.desc&include_adult=false&vote_count.gte=50&page=${randomPage}`;
  }
  const data = await fetchJSON(url);
  const results = (data.results || []).filter(r => !isExcluded(r.title || r.name));
  if(results.length === 0) throw new Error("No results returned");
  const raw = results[Math.floor(Math.random() * results.length)];
  return toItem(raw, poolType === "movie" ? "movie" : poolType);
}

/* ---------- Render ---------- */
function cardMarkup(item){
  const posterInner = item.posterPath
    ? `<img src="${IMAGE_BASE_URL}${item.posterPath}" alt="${item.title} poster" style="width:100%;height:100%;object-fit:cover;">`
    : item.emoji;
  const posterBg = item.posterPath ? "#000" : item.color;
  return `
    <div class="poster" style="background:${posterBg}">${posterInner}</div>
    <div class="meta">
      <h3>${item.title}</h3>
      <span>${item.genre}</span>
    </div>
  `;
}

function renderCarousel(containerId, items){
  const el = document.getElementById(containerId);
  el.innerHTML = items.map((item, i) => `
    <div class="card" tabindex="0" data-key="${containerId}-${i}">${cardMarkup(item)}</div>
  `).join("");

  [...el.children].forEach((card, i) => {
    const open = () => {
      card.classList.add("pop");
      card.addEventListener("animationend", () => card.classList.remove("pop"), { once: true });
      openDetail(items[i]);
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", e => { if(e.key === "Enter") open(); });
  });
}

function renderLoading(containerId, count = 6){
  const el = document.getElementById(containerId);
  el.innerHTML = Array.from({length: count}).map(() => `
    <div class="card">
      <div class="poster" style="background:#ecd9ef;opacity:.6;">⏳</div>
      <div class="meta"><h3>Loading…</h3><span>&nbsp;</span></div>
    </div>
  `).join("");
}

function renderError(containerId, message){
  document.getElementById(containerId).innerHTML =
    `<p style="color:var(--text-dim);">${message}</p>`;
}
async function searchMovies(query){
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;
  const data = await fetchJSON(url);
  return (data.results || [])
    .filter(r => !isExcluded(r.title || r.name))
    .slice(0,20)
    .map(r => toItem(r, "movie"));
}

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const searchResultsSection = document.getElementById("search-results");

async function runSearch(){
  const query = searchInput.value.trim();
  if(!query) return;

  searchResultsSection.style.display = "block";
  renderLoading("grid-search", 6);

  try{
    const items = await searchMovies(query);
    if(items.length === 0){
      renderError("grid-search", `No movies found for "${query}".`);
      return;
    }
    renderCarousel("grid-search", items);
  } catch(err){
    console.error(err);
    renderError("grid-search", "Something went wrong while searching — try again.");
  }
}

searchBtn.addEventListener("click", runSearch);
searchInput.addEventListener("keydown", e => {
  if(e.key === "Enter") runSearch();
});

document.getElementById("closeSearchResults").addEventListener("click", () => {
  document.getElementById("search-results").style.display = "none";
});

async function init(){
  renderLoading("grid-movies", 8);
  renderLoading("grid-series", 8);
  renderLoading("grid-anime", 8);
  renderLoading("grid-recommended", 8);
  renderLoading("grid-watched", 8);

  try{
    TRENDING_MOVIES = await loadTrendingMovies();
    renderCarousel("grid-movies", TRENDING_MOVIES);
  } catch(err){
    console.error(err);
    renderError("grid-movies", "Couldn't load trending movies — check your connection or API key.");
  }

  try{
  TRENDING_SERIES = await loadTrendingSeries();
  renderCarousel("grid-series", TRENDING_SERIES);
} catch(err){
  console.error(err);
  renderError("grid-series", "Couldn't load trending series — check your connection or API key.");
}

  try{
    TRENDING_ANIME = await loadTrendingAnime();
    renderCarousel("grid-anime", TRENDING_ANIME);
  } catch(err){
    console.error(err);
    renderError("grid-anime", "Couldn't load trending anime — check your connection or API key.");
  }

  try{
    RECOMMENDED = await loadRecommended();
    renderCarousel("grid-recommended", RECOMMENDED);
  } catch(err){
    console.error(err);
    renderError("grid-recommended", "Couldn't load recommendations — check your connection or API key.");
  }

  try{
  WATCHED = await loadWatched();
  renderCarousel("grid-watched", WATCHED);
} catch(err){
  console.error(err);
  renderError("grid-watched", "Couldn't load watched list — check your connection or API key.");
}
}
init();

/* ---------- Carousel arrows ---------- */
document.querySelectorAll(".arrow").forEach(btn => {
  btn.addEventListener("click", () => {
    const track = document.getElementById(btn.dataset.target);
    const amount = track.clientWidth * 0.8;
    track.scrollBy({ left: btn.classList.contains("arrow-left") ? -amount : amount, behavior: "smooth" });
  });
});

/* ---------- Detail modal ---------- */
const detailOverlay = document.getElementById("detailOverlay");
const modalPoster = document.getElementById("modalPoster");
const modalTitle = document.getElementById("modalTitle");
const modalMeta = document.getElementById("modalMeta");
const modalDesc = document.getElementById("modalDesc");

function openDetail(item){
  if(item.posterPath){
    modalPoster.style.background = "#000";
    modalPoster.innerHTML = `<img src="${IMAGE_BASE_URL}${item.posterPath}" alt="${item.title} poster" style="width:100%;height:100%;object-fit:cover;">`;
  } else {
    modalPoster.style.background = item.color;
    modalPoster.textContent = item.emoji;
  }
  modalTitle.textContent = item.title;
  modalMeta.textContent = `${item.genre} • ${item.year} • ⭐ ${item.rating} • ${item.type}`;
  modalDesc.textContent = item.desc;
  detailOverlay.classList.add("open");
}

function openLoadingDetail(){
  modalPoster.style.background = "#ecd9ef";
  modalPoster.textContent = "⏳";
  modalTitle.textContent = "Finding something for you…";
  modalMeta.textContent = "";
  modalDesc.textContent = "";
  detailOverlay.classList.add("open");
}

function openErrorDetail(){
  modalPoster.style.background = "#f3d6d6";
  modalPoster.textContent = "⚠️";
  modalTitle.textContent = "Couldn't fetch a pick";
  modalMeta.textContent = "";
  modalDesc.textContent = "Something went wrong reaching TMDb — try again in a moment.";
  detailOverlay.classList.add("open");
}

document.getElementById("closeDetail").addEventListener("click", () => {
  detailOverlay.classList.remove("open");
});
detailOverlay.addEventListener("click", e => {
  if(e.target === detailOverlay) detailOverlay.classList.remove("open");
});

/* ---------- Welcome popup ---------- */
document.getElementById("welcomeClose").addEventListener("click", () => {
  document.getElementById("welcomeOverlay").classList.remove("open");
});

/* ---------- Random generator ---------- */
const randomFab = document.getElementById("randomFab");
const randomMenu = document.getElementById("randomMenu");

randomFab.addEventListener("click", () => {
  randomMenu.classList.toggle("open");
  document.getElementById("fabHint").classList.add("hide");
});
document.addEventListener("click", e => {
  if(!randomMenu.contains(e.target) && e.target !== randomFab){
    randomMenu.classList.remove("open");
  }
});

randomMenu.querySelectorAll("button[data-pool]").forEach(btn => {
  btn.addEventListener("click", async () => {
    randomMenu.classList.remove("open");
    openLoadingDetail();
    try{
      const pick = await fetchRandomItem(btn.dataset.pool);
      openDetail(pick);
    } catch(err){
      console.error(err);
      openErrorDetail();
    }
  });
});