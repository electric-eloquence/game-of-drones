export default function () {
  const $organisms = {
    window: null,
    body: null,
    '.navigation': null,
    '.grid__left': null,
    '.matrix': null,
    '.matrix__filler': null,
    '.matrix__cover': null,
    '.select--risk': null,
    '.display--risk': null,
    '.container--slider--risk': null,
    '.slider--risk': null,
    '.slider--speed': null,
    '.button--restart': null,
    '.button--run-pause': null,
    '.button--step': null,
    '.console__messages': null,
    '.stats__player': null,
    '.grid__article': null,
    '.container--article-body': null,
    '.footer': null
  };

  for (let i = 0; i < window.population; i++) {
    $organisms['.avatar--player--' + i + '__img'] = null;
    $organisms['.avatar--player--' + i + '__number'] = null;
    $organisms['.player--' + i] = null;
    $organisms['.player--' + i + '__pts'] = null;
    $organisms['.stats__player--' + i] = null;
    $organisms['.stats__player--' + i + '__name'] = null;
    $organisms['.stats__player--' + i + '__pts'] = null;
    $organisms['.stats__player--' + i + '__memory'] = null;
  }

  return $organisms;
}
