import SimpleSort from '../dist/SimpleSort.js';
window.onload = () => {
  const el = document.querySelector('.list');
  new SimpleSort(el, {
    animation: 250,
    easing: 'ease-out',
  });
  el.ondragstart = (e) => {
    e.target.style.backgroundColor = 'lightsalmon';
  }
  el.ondragend = (e) => {
    e.target.style.backgroundColor = '';
  }
}
