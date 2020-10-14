export default function () {
  const $organisms = {
    'body': null,
    '.matrix': null,
    '.controls': null,
    '.select--engagement-risk': null,
    '.display--engagement-risk': null,
    '.container--slider--engagement-risk': null,
    '.slider--engagement-risk': null,
    '.slider--speed': null,
    '.button--rerun': null,
    '.button--run-pause': null,
    '.button--step': null,
    '.console__messages': null,
    '.stats__player': null,
    '.container--article-body': null
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
