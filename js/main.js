const miniGift1 = document.getElementById('miniGift1');
const miniGift2 = document.getElementById('miniGift2');
const miniSurprise1 = document.getElementById('miniSurprise1');
const miniSurprise2 = document.getElementById('miniSurprise2');
const arrow1 = document.getElementById('arrow1');
const arrow2 = document.getElementById('arrow2');

miniGift1.addEventListener('click', () => {
     miniSurprise1.classList.remove('hidden');
     arrow1.classList.add('hidden');
     miniGift1.classList.add('opened');
     miniGift1.style.backgroundImage='none';
});

miniGift2.addEventListener('click', () => {
     miniSurprise2.classList.remove('hidden');
     arrow2.classList.add('hidden');
     miniGift2.classList.add('opened');
     miniGift2.style.backgroundImage='none';
});