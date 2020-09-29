const statsBody = document.getElementById('stats__body');

for (let i = 0; i < window.population; i++) {
  const statsRow = document.createElement('tr');
  statsRow.className = 'stats__player stats__player--' + i;
  statsRow.innerHTML = `<td class="stats__player__name stats__player--${i}__name"></td>
<td class="stats__player__pts stats__player--${i}__pts"></td>
<td class="stats__player__memory stats__player--${i}__memory"></td>
`;

  statsRow.setAttribute('data-id', '.player--' + i);
  statsBody.appendChild(statsRow);
}
