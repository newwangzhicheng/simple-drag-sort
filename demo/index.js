import SimpleDragSort from '../dist/SimpleDragSort.esm.js';
window.onload = () => {
  const el = document.querySelector('.list');
  new SimpleDragSort(el, {
    animation: 150,
    easing: 'ease-out',
  });
  el.ondragstart = (e) => {
    e.target.style.backgroundColor = 'lightsalmon';
  }
  el.ondragend = (e) => {
    e.target.style.backgroundColor = '';
  }
}
