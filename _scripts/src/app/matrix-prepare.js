const matrix = document.getElementById('matrix');

for (let i = 0; i < window.population; i++) {
  const player = document.createElement('div');
  player.className = 'player player--' + i;
  player.innerHTML = `<div class="player__content">
  <div class="player__pts player--${i}__pts"></div>
</div>
`;

  matrix.appendChild(player);
}
