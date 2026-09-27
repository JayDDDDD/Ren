const jokeContainer = document.getElementById('jokeContainer');
const closeBtn = document.getElementById('closeBtn');
const poemContainer = document.getElementById('poemContainer');
const envelope = document.getElementById('envelope');
const moviesButton = document.getElementById('moviesButton');
const dimOverlay = document.getElementById('dimOverlay');

  closeBtn.addEventListener('click', () => {
    jokeContainer.style.display = 'none';
    envelope.style.display = 'block';
  });

  envelope.addEventListener('click', () => {
    poemContainer.style.display = "block";
    envelope.style.display = "none";
    moviesButton.style.display = "block"
  })

  poemContainer.addEventListener('click', () => {
    poemContainer.classList.toggle('expanded');
    dimOverlay.classList.toggle('active');
  });