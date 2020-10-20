import snowflakeGenerate from './snowflake-generate.js';
// For debugging, import a persistent array of random unsigned 8-bit integers.
// import randomValuesFromFile from './random-values.js';

const MAX_POINTS = 127;
const play = new Event('play');
const ptsInitial = 10;

export default class Simulation {
  constructor(requerio, config) {
    this.requerio = requerio;
    this.$orgs = requerio.$orgs;
    this.matrixWidth = config.matrixWidth;
    this.matrixHeight = config.matrixHeight;
    this.playerPadding = config.playerPadding;
    this.playerSize = config.playerSize;
    this.population = config.population;
    this.renderInterval = config.renderInterval;
    this.turnInterval = config.turnInterval;
    this.snowflakeColor = config.snowflakeColor;

    this.renderInterval2x = this.renderInterval * 2; // Must be longer than this.renderInterval to process winner data.
    this.intervalId = null;
    this.players = [];
    this.randomValuesStore = [];
    this.randomValues = [];
    // For debugging, copy and save randomValuesFromFile.
    // this.randomValuesStore = randomValuesFromFile;
    // this.randomValues = this.randomValuesStore.slice();
    // sessionStorage.setItem('randomValuesStore', this.randomValuesStore);
    this.renderIntervalAdjusted = this.renderInterval;
    this.renderMultiplier = this.turnInterval / this.renderInterval;
    this.risk = null;
    this.semaphoreArray = [];
    this.semaphoreLocked = false;
    this.sliderRiskHeight = null;
    this.speed = null;
    this.teamKeys = ['karen', 'maga', 'snowflake'];
    this.teams = {};
    this.turnIntervalAdjusted = this.turnInterval;
    this.vonNeumannKeys = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}];
  }

  /*** @private */
  addEventListeners() {
    const debounce = (callback, wait = 100) => {
      let timeout;
      let callbackArgs;

      const later = () => callback.apply(this, callbackArgs);

      return () => {
        callbackArgs = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    this.$orgs.window.on('load', this.mobileArticleScrollClosure());

    this.$orgs.window.on('resize', debounce(this.mobileArticleScrollClosure()));

    this.$orgs['.button--run-pause'].on('click', () => {
      const buttonRunPauseState = this.$orgs['.button--run-pause'].getState();

      this.$orgs['.button--restart'].dispatchAction('prop', {disabled: false});

      if (buttonRunPauseState.classArray.includes('button--run')) {
        if (this.risk === null) {
          const windowState = this.$orgs.window.getState();

          if (windowState.innerWidth <= window.bp_xs_max) {
            this.sliderRiskHeight = this.$orgs['.container--slider--risk'].getState().height;

            this.mobileArticleScrollClosure(this.sliderRiskHeight)();
          }

          this.$orgs['.select--risk'].dispatchAction('addClass', 'hidden');
          this.$orgs['.display--risk'].dispatchAction('removeClass', 'hidden');
          this.$orgs['.container--slider--risk'].dispatchAction('css', {height: '0'});
        }

        const selectRiskVal = this.$orgs['.select--risk'].getState().val;

        if (this.risk !== selectRiskVal) {
          this.risk = parseFloat(selectRiskVal) * 0.01;
          document.cookie = `risk=${selectRiskVal};sameSite=strict`;
        }

        const sliderSpeed = parseFloat(this.$orgs['.slider--speed'].getState().val) || 0;
        let cookieSpeed;

        try {
          cookieSpeed = document.cookie.split('; ')
            .find(row => row.startsWith('speed='))
            .split('=')[1];
        }
        catch {}

        if (sliderSpeed !== this.speed || sliderSpeed !== parseFloat(cookieSpeed)) {
          this.speed = sliderSpeed;
          document.cookie = `speed=${sliderSpeed};sameSite=strict`;
          this.renderIntervalAdjusted = (50 - this.speed) * this.renderMultiplier;
          this.turnIntervalAdjusted = this.renderIntervalAdjusted * this.renderMultiplier;

          if (this.speed === 0) {
            this.$orgs.body.dispatchAction('removeClass', 'transition-medium');
            this.$orgs.body.dispatchAction('addClass', 'transition-slow');
          }
          else if (this.speed <= 25) {
            this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
            this.$orgs.body.dispatchAction('addClass', 'transition-medium');
          }
          else if (this.speed > 25) {
            this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
            this.$orgs.body.dispatchAction('removeClass', 'transition-medium');
          }
        }

        this.$orgs['.button--run-pause']
          .dispatchAction('removeClass', 'button--run')
          .dispatchAction('addClass', 'button--pause');
        this.$orgs['.button--step'].dispatchAction('prop', {disabled: true});
        this.run();
      }
      else {
        this.pause();
        this.$orgs['.button--run-pause']
          .dispatchAction('removeClass', 'button--pause')
          .dispatchAction('addClass', 'button--run');
        this.$orgs['.button--step'].dispatchAction('prop', {disabled: false});
      }
    });

    this.$orgs['.button--run-pause'].on('mouseleave', () => {
      this.$orgs['.button--run-pause'].dispatchAction('blur');
    });

    this.$orgs['.button--step'].on('click', async () => {
      this.renderIntervalAdjusted = this.renderInterval;
      this.turnIntervalAdjusted = this.turnInterval;

      if (this.risk === null) {
        const windowState = this.$orgs.window.getState();

        if (windowState.innerWidth <= window.bp_xs_max) {
          this.sliderRiskHeight = this.$orgs['.container--slider--risk'].getState().height;

          this.mobileArticleScrollClosure(this.sliderRiskHeight)();
        }

        this.$orgs['.select--risk'].dispatchAction('addClass', 'hidden');
        this.$orgs['.display--risk'].dispatchAction('removeClass', 'hidden');
        this.$orgs['.container--slider--risk'].dispatchAction('css', {height: '0'});
      }

      const selectRiskVal = this.$orgs['.select--risk'].getState().val;

      if (this.risk !== selectRiskVal) {
        this.risk = parseFloat(selectRiskVal) * 0.01;
        document.cookie = `risk=${selectRiskVal};sameSite=strict`;
      }

      this.$orgs.body.dispatchAction('removeClass', 'transition-medium');
      this.$orgs.body.dispatchAction('addClass', 'transition-slow');
      this.$orgs['.button--step'].dispatchAction('css', {'pointer-events': 'none'});
      this.$orgs['.button--restart'].dispatchAction('prop', {disabled: false});

      await this.turn(true);
      this.$orgs['.button--step'].dispatchAction('css', {'pointer-events': ''});

      if (this.speed !== null) {
        this.renderIntervalAdjusted = (50 - this.speed) * this.renderMultiplier;
        this.turnIntervalAdjusted = this.renderIntervalAdjusted * this.renderMultiplier;

        if (this.speed > 0 && this.speed <= 25) {
          this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
          this.$orgs.body.dispatchAction('addClass', 'transition-medium');
        }
        else if (this.speed > 25) {
          this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
        }
      }
    });

    this.$orgs['.button--step'].on('mouseleave', () => {
      this.$orgs['.button--step'].dispatchAction('blur');
    });

    this.$orgs['.button--restart'].on('click', () => {
      this.$orgs['.button--restart'].dispatchAction('prop', {disabled: true});
      this.restart();
    });

    this.$orgs['.button--restart'].on('mouseleave', () => {
      this.$orgs['.button--restart'].dispatchAction('blur');
    });

    this.$orgs['.grid__article'].on('scroll', debounce(() => {
      const gridArticleState = this.$orgs['.grid__article'].getState();

      if (gridArticleState.scrollTop) {
        this.$orgs['.footer'].dispatchAction('addClass', 'opaque');
      }
    }));

    const simulationInst = this;

    this.$orgs['.select--risk'].on('change', function () {
      simulationInst.$orgs['.display--risk'].dispatchAction('text', `${this.value}%`)
      simulationInst.$orgs['.slider--risk'].dispatchAction('val', this.value);
      document.cookie = `risk=${this.value};sameSite=strict`;
    });

    this.$orgs['.slider--risk'].on('change', function () {
      simulationInst.$orgs['.select--risk'].dispatchAction('val', this.value);
      simulationInst.$orgs['.display--risk'].dispatchAction('text', `${this.value}%`)
      document.cookie = `risk=${this.value};sameSite=strict`;
    });

    this.$orgs['.slider--speed'].on('change', function () {
      simulationInst.$orgs['.slider--speed'].dispatchAction('val', this.value);
      document.cookie = `speed=${this.value};sameSite=strict`;
    });

    this.$orgs['.stats__player'].on('mouseenter', function () {
      const playerId = '.player--' + this.dataset.idx;

      simulationInst.$orgs[playerId].dispatchAction('addClass', 'focused');
    });

    this.$orgs['.stats__player'].on('mouseleave', function () {
      const playerId = '.player--' + this.dataset.idx;

      simulationInst.$orgs[playerId].dispatchAction('removeClass', 'focused');
    });
  }

  /*** @private */
  consoleMessage(message, numberLines = 1) {
    this.$orgs['.console__messages'].dispatchAction('append', message);
    this.mobileArticleScrollClosure()();
  }

  /*** @private */
  findVonNeumannNeighbors(posX, posY, matrixData) {
    const vonNeumannNeighbors = Object.create(null);

    for (let x = -1; x < 2; x++) {
      vonNeumannNeighbors[x] = Object.create(null);

      if (x === -1) {
        // Skip if posX is on left edge.
        if (posX === 0) {
          continue;
        }
      }

      if (x === 1) {
        // Skip if posX is on right edge.
        if (matrixData.populationAlive > 4) {
          if (posX === this.matrixWidth - 1) {
            continue;
          }
        }
        // Shrink playable area if there are 4 or fewer players.
        else {
          if (posX >= this.matrixWidth - 2) {
            continue;
          }
        }
      }

      for (let y = -1; y < 2; y++) {
        if (x === -1 || x === 1) {
          // Skip if not center.
          if (y !== 0) {
            continue;
          }
        }

        if (x === 0) {
          // Skip if center.
          if (y === 0) {
            continue;
          }

          // Shrink playable area if there are 4 or fewer players.
          if (y === 1) {
            if (matrixData.populationAlive <= 4) {
              if (posY >= this.matrixHeight - 2) {
                continue;
              }
            }
          }
        }

        vonNeumannNeighbors[x][y] = matrixData.matrix[posX + x][posY + y];
      }
    }

    return vonNeumannNeighbors;
  }

  /*** @private */
  getRandomValue() {
    if (!this.randomValues.length) {
      const randomValuesTyped = new Uint8Array(65536); // Maximum size data store allowed by crypto.getRandomValues().

      crypto.getRandomValues(randomValuesTyped);

      this.randomValues = Array.from(randomValuesTyped);
      this.randomValuesStore = this.randomValuesStore.concat(this.randomValues);

      sessionStorage.setItem('randomValuesStore', this.randomValuesStore);
    }

    return this.randomValues.shift() / 256;
  }

  /*** @private */
  getStyleFromAttrib(playerState, property) {
    const parsedStyleAttrib = playerState.attribs.style.split(/\s*;\s*/);
    const value = parsedStyleAttrib.reduce(
      (acc, cur) => acc + (cur.indexOf(`${property}:`) === 0 ? cur.replace(`${property}:`, '').trim() : ''),
      ''
    );

    return value;
  }

  /*** @private */
  mobileArticleScrollClosure(sliderRiskHeight = 0) {
    return () => {
      const windowState = this.$orgs.window.getState();

      if (windowState.innerWidth <= window.bp_sm_max) {
        const gridLeftState = this.$orgs['.grid__left'].getState();

        // In smaller viewports, if there is enough space, fix the matrix, controls, and stats to the top, and make
        // the article scroll.
        if (gridLeftState.outerHeight < windowState.innerHeight / 2) {
          const navigationState = this.$orgs['.navigation'].getState();
          const footerState = this.$orgs['.footer'].getState();

          this.$orgs['.grid__article'].dispatchAction(
            'css',
            {
              height: (windowState.innerHeight -
                navigationState.outerHeight -
                gridLeftState.outerHeight -
                footerState.outerHeight +
                (sliderRiskHeight || 0)) + 'px'
            }
          );
        }
        else {
          this.$orgs['.grid__article'].dispatchAction('css', {height: ''});
          this.$orgs['.footer'].dispatchAction('addClass', 'opaque');
        }
      }
      else {
        this.$orgs['.grid__article'].dispatchAction('css', {height: ''});
      }
    };
  }

  /*** @private */
  parseTransformTranslate(transformValue) {
    const transformValueParsed = transformValue.split('(')[1].slice(0, -1).split(', ');
    transformValueParsed[1] = transformValueParsed[1] || '0px';

    return transformValueParsed;
  }

  /*** @private */
  playPlayerB(playerB, matrixData) {
    const playerBState = playerB.getState();
    const playerBData = playerBState.data;
    const vonNeumannNeighbors = this.findVonNeumannNeighbors(playerBData.posX, playerBData.posY, matrixData);

    this.vonNeumannKeys.forEach((key) => {
      const vonNeumannNeighbor = vonNeumannNeighbors[key.x][key.y];

      if (vonNeumannNeighbor === playerBData.inPlayWith) {
        const playerBTransform = this.getStyleFromAttrib(playerBState, 'transform');
        const playerBTransformParsed = this.parseTransformTranslate(playerBTransform);
        const playerBTranslateXOffset = parseFloat(playerBTransformParsed[0]) + (key.x * this.playerPadding);
        const playerBTranslateYOffset = parseFloat(playerBTransformParsed[1]) + (key.y * this.playerPadding);

        playerB.dispatchAction(
          'css',
          {transform: 'translate(' + playerBTranslateXOffset + 'px, ' + playerBTranslateYOffset + 'px)'}
        );
      }
    });
  }

  /* END PRIVATE METHODS. BEGIN PUBLIC METHODS */

  extinguish() {
    this.$orgs['.matrix__filler']
      .dispatchAction('addClass', 'extinction')
      .dispatchAction(
        'html',
        `<img src="../../_assets/src/extinction.png" width="${this.matrixWidth * this.playerSize}">`
      );

    return new Promise(
      (resolve) => {
        setTimeout(() => {
          this.$orgs['.matrix__filler'].dispatchAction('removeClass', 'hidden');

          resolve();
        }, this.renderInterval);
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.$orgs['.matrix__cover'].dispatchAction('addClass', 'reveal');
              this.consoleMessages('<p>There are no winners</p>');

              resolve();
            }, this.renderInterval);
          });
      });
  }

  populateMatrix() {
    this.$orgs['.matrix'].dispatchAction(
      'css',
      {width: (this.playerSize * this.matrixWidth + 2) + 'px', height: (this.playerSize * this.matrixHeight + 2) + 'px'}
    );

    const matrix = [];

    for (let x = 0; x < this.matrixWidth; x++) {
      matrix[x] = [];

      for (let y = 0; y < this.matrixHeight; y++) {
        matrix[x][y] = null;
      }
    }

    for (let i = 0; i < this.population; i++) {
      const player = this.$orgs['.player--' + i];
      let playerData = {posX: null, posY: null};

      player
        .dispatchAction('removeClass', 'dead')
        .dispatchAction('data', {idx: i, memoryOfLastPlays: {}, memoryStatus: 0, pts: ptsInitial});
      this.$orgs['.player--' + i + '__pts'].dispatchAction('text', ptsInitial);

      while (playerData.posX === null || playerData.posY === null) {
        const posX = Math.floor(this.getRandomValue() * this.matrixWidth);
        const posY = Math.floor(this.getRandomValue() * this.matrixHeight);

        if (matrix[posX][posY] === null) {
          matrix[posX][posY] = '.player--' + i;
          playerData = {posX, posY};

          player
            .dispatchAction('data', playerData)
            .dispatchAction('css', {
              display: 'block',
              transform: 'translate(' + (this.playerSize * posX) + 'px, ' + (this.playerSize * posY) + 'px)'
            });
        }
      }
    }

    this.$orgs['.matrix'].dispatchAction(
      'data',
      {
        matrix,
        cooperatorAlive: true,
        maxPointsReached: false,
        populationAlive: this.population,
        riskIntroduced: false,
        turnsTaken: 0
      }
    );
  }

  populateStats() {
    for (let i = 0; i < this.population; i++) {
      const statsPlayerId = '.stats__player--' + i;

      this.$orgs[statsPlayerId + '__name']
        .dispatchAction('removeClass', 'dead')
        .dispatchAction('html', `<div class="container container--avatar">${this.players[i].name}</div>`);
      this.$orgs[statsPlayerId + '__pts'].dispatchAction('text', ptsInitial);
      this.$orgs[statsPlayerId + '__memory'].dispatchAction('text', '');
    }
  }

  stoke() {
    this.teamKeys.forEach((team) => {
      this.teams[team] = {
        playerIds: [],
        subPopulation: 0
      };
    });

    for (let i = 0; i < this.population; i++) {
      const player = this.$orgs['.player--' + i];
      let id;
      let img = '<img class="avatar--player__img" ';
      let span = '<span class="avatar--player__number">';
      let name;
      let team;

      if (i === 0) {
        team = 'the-donald';
        id = '.' + team;
        img += 'src="../../_assets/src/the-donald.svg">';
        span += '&nbsp;</span>';
        name = img + span;
      }
      else {
        team = this.teamKeys[Math.floor((i - 1) * 3 / (this.population - 1))];
        id = `.${team}--${i}`;
        span += `${this.teams[team].subPopulation + 1}</span>`;

        this.teams[team].playerIds.push(i);
        this.teams[team].subPopulation++;

        switch (team) {
          case 'karen':
          case 'maga': {
            img += `src="../../_assets/src/${team}.svg">`;
            name = img + span;

            break;
          }

          case 'snowflake': {
            const snowflakeCanvas = snowflakeGenerate(this.snowflakeColor, 80); // Double density for retina screens.
            const snowflakeDataURL = snowflakeCanvas.toDataURL('image/png');
            img += `src="${snowflakeDataURL}">`;
            name = img + span;

            break;
          }
        }
      }

      player.dispatchAction('addClass', team)
      this.players[i] = {id, name, team};
    }
  }

  win(winnerState) {
    this.$orgs['.matrix__filler'].dispatchAction('css', {transition: 'none', transform: winnerState.css.transform});

    return new Promise(
      (resolve) => {
        setTimeout(() => {
          const {idx, posX, posY} = winnerState.data;
          const team = this.players[idx].team;

          this.$orgs['.matrix__filler']
            .dispatchAction('css', {transition: ''})
            .dispatchAction('addClass', team);
          this.$orgs['.matrix__cover'].dispatchAction('addClass', 'hidden');
          this.$orgs['.matrix__filler']
            .dispatchAction('css', {transform: `translate(${posX * 40}px, ${posY * 40}px) scale(7, 7)`})
          this.consoleMessage(`<p>${this.players[winnerState.data.idx].name} wins!</p>`);

          resolve();
        }, this.renderInterval2x); // Must use an interval longer than this.renderInterval to process winner data.
      });
  }

  init() {
    let cookieRisk;

    try {
      cookieRisk = document.cookie.split('; ')
        .find(row => row.startsWith('risk='))
        .split('=')[1];
    }
    catch {}

    if (cookieRisk) {
      // If the cookie is set, update the select and slider but leave this.risk set to null when initializing the page.
      this.$orgs['.select--risk'].dispatchAction('val', cookieRisk);
      this.$orgs['.display--risk'].dispatchAction('text', `${cookieRisk}%`)
      this.$orgs['.slider--risk'].dispatchAction('val', cookieRisk);
    }

    let cookieSpeed;

    try {
      cookieSpeed = document.cookie.split('; ')
        .find(row => row.startsWith('speed='))
        .split('=')[1];
    }
    catch {}

    if (cookieSpeed) {
      this.$orgs['.slider--speed'].dispatchAction('val', cookieSpeed);
    }

    this.$orgs.body.dispatchAction('addClass', 'initialized');
    this.stoke();
    this.populateMatrix();
    this.populateStats();
    this.addEventListeners();
  }

  end() {
    this.pause();
    this.$orgs['.button--run-pause'].dispatchAction('prop', {disabled: true});
    this.$orgs['.button--step'].dispatchAction('prop', {disabled: true});

    this.semaphoreArray = [];
    this.semaphoreLocked = false;

    const matrixData = this.$orgs['.matrix'].getState().data;

    // End simulation if max points reached.
    if (matrixData.maxPointsReached) {
      return new Promise(
        (resolve) => {
          setTimeout(() => {
            const articleBody = this.$orgs['.container--article-body'].html();

            this.$orgs['.matrix__filler']
              .dispatchAction('removeClass', 'hidden')
              .dispatchAction('addClass', 'kill-screen')
              .dispatchAction('html', articleBody);
            this.$orgs['.matrix__cover'].dispatchAction('addClass', 'hidden');
            this.consoleMessage('<p>Error 503 Guru Meditation</p>');

            resolve();
          }, this.renderInterval2x);
        });
    }

    let survivorCount = 0;
    let winner;
    let winnerState;

    for (let i = 0; i < this.population; i++) {
      const state = this.$orgs['.player--' + i].getState();

      if (state.data.pts > 0) {
        survivorCount++;

        if (survivorCount === 1) {
          winner = this.$orgs['.player--' + i];
          winnerState = state;
        }
      }
    }

    // End simulation if down to 0 or 1 survivors respectively.
    if (survivorCount === 0) {
      return this.extinguish();
    }
    else if (survivorCount === 1) {
      return this.win(winnerState);
    }

    // Should never be the case, but if more than 1 survivor, return empty resolved promise.
    return Promise.resolve();
  }

  move() {
    // Move to empty position.
    for (let i = 0; i < this.population; i++) {
      const playerId = '.player--' + i;
      const player = this.$orgs[playerId];
      let playerState = player.getState();

      // Skip dead players.
      if (playerState.data.pts <= 0) {
        if (playerState.attribs.style) {
          player.dispatchAction('css', {display: '', transform: ''});
          player.dispatchAction('attr', {style: null});
        }

        continue;
      }

      let keysTried = [false, false, false, false];
      let posX = playerState.data.posX;
      let posY = playerState.data.posY;

      // Set/unset any translate offsets.
      const playerTransform = this.getStyleFromAttrib(playerState, 'transform');
      const playerTransformParsed = this.parseTransformTranslate(playerTransform);
      let playerTranslateXReset = parseFloat(playerTransformParsed[0]);
      let playerTranslateYReset = parseFloat(playerTransformParsed[1]);
      const playerTranslateXRemainder = playerTranslateXReset % this.playerSize;
      const playerTranslateYRemainder = playerTranslateYReset % this.playerSize;

      if (playerTranslateXRemainder) {
        if (playerTranslateXRemainder > this.playerPadding) {
          playerTranslateXReset = playerTranslateXReset + this.playerPadding;
        }
        else {
          playerTranslateXReset = playerTranslateXReset - this.playerPadding;
        }
      }

      if (playerTranslateYRemainder) {
        if (playerTranslateYRemainder > this.playerPadding) {
          playerTranslateYReset = playerTranslateYReset + this.playerPadding;
        }
        else {
          playerTranslateYReset = playerTranslateYReset - this.playerPadding;
        }
      }

      player.dispatchAction(
        'css',
        {transform: 'translate(' + playerTranslateXReset + 'px, ' + playerTranslateYReset + 'px)'}
      );

      const matrixData = this.$orgs['.matrix'].getState().data;
      const matrix = matrixData.matrix;
      playerState = player.getState();

      while (keysTried.includes(false)) {
        const random = Math.floor(this.getRandomValue() * 9);
        let keyIdxRandom;

        // Include the option of not moving. This is especially necessary toward the end when we must not have an
        // oscillation where players always avoid each other. Using 1/9 chance because 1/5 made the players too lazy.
        if (random === 8) {
          keysTried = keysTried.map(val => true);

          continue;
        }

        keyIdxRandom = Math.floor(random / 2);
        keysTried[keyIdxRandom] = true;

        const vonNeumannNeighbors = this.findVonNeumannNeighbors(posX, posY, matrixData);
        const vonNeumannNeighborFound =
          vonNeumannNeighbors[this.vonNeumannKeys[keyIdxRandom].x][this.vonNeumannKeys[keyIdxRandom].y];

        if (vonNeumannNeighborFound === null) { // Must strictly equal null. Undefined means out of bounds.
          const keyIdx = keyIdxRandom;

          // Better to parse the style attrib to avoid getting a real-time computed style.
          const playerTransform = this.getStyleFromAttrib(playerState, 'transform');
          const playerTransformParsed = this.parseTransformTranslate(playerTransform);
          let translateX = playerTransformParsed[0];
          let translateY = playerTransformParsed[1];
          const translateXInt = parseFloat(translateX);
          const translateYInt = parseFloat(translateY);

          // Unset old position.
          matrix[posX][posY] = null;

          if (keyIdx === 0) { // Left.
            translateX = (translateXInt - this.playerSize) + 'px';
            posX--;
          }
          if (keyIdx === 1) { // Above.
            translateY = (translateYInt - this.playerSize) + 'px';
            posY--;
          }
          if (keyIdx === 2) { // Below.
            translateY = (translateYInt + this.playerSize) + 'px';
            posY++;
          }
          if (keyIdx === 3) { // Right.
            translateX = (translateXInt + this.playerSize) + 'px';
            posX++;
          }

          player.dispatchAction('css', {transform: 'translate(' + translateX + ', ' + translateY + ')'});
          player.dispatchAction('data', {posX, posY});

          // Set new position.
          matrix[posX][posY] = playerId;

          this.$orgs['.matrix'].dispatchAction('data', {matrix});

          break;
        }
      }
    }
  }

  approach() {
    for (let i = 0; i < this.population; i++) {
      const playerAId = '.player--' + i;
      const playerA = this.$orgs[playerAId];
      const playerAState = playerA.getState();

      if (playerAState.data.pts <= 0) {
        continue;
      }

      if (playerAState.data.inPlayWith) {
        continue;
      }

      const matrixData = this.$orgs['.matrix'].getState().data;
      const keysTried = [false, false, false, false];
      const vonNeumannNeighbors =
        this.findVonNeumannNeighbors(playerAState.data.posX, playerAState.data.posY, matrixData);

      while (keysTried.includes(false)) {
        const keyIdxRandom = Math.floor(this.getRandomValue() * 4);
        keysTried[keyIdxRandom] = true;
        const vonNeumannNeighborFound =
          vonNeumannNeighbors[this.vonNeumannKeys[keyIdxRandom].x][this.vonNeumannKeys[keyIdxRandom].y];

        if (vonNeumannNeighborFound) {
          const playerB = this.$orgs[vonNeumannNeighborFound];
          const playerBState = playerB.getState();
          const key = this.vonNeumannKeys[keyIdxRandom];

          if (!playerBState.data.inPlayWith) {
            const playerATransform = this.getStyleFromAttrib(playerAState, 'transform');
            const playerATransformParsed = this.parseTransformTranslate(playerATransform);
            const playerATranslateXOffset = parseFloat(playerATransformParsed[0]) + (key.x * this.playerPadding);
            const playerATranslateYOffset = parseFloat(playerATransformParsed[1]) + (key.y * this.playerPadding);

            playerA.dispatchAction('data', {inPlayWith: vonNeumannNeighborFound});
            playerA.dispatchAction(
              'css',
              {transform: 'translate(' + playerATranslateXOffset + 'px, ' + playerATranslateYOffset + 'px)'}
            );
            playerB.dispatchAction('data', {inPlayWith: playerAId});
            this.playPlayerB(playerB, matrixData);

            break;
          }
        }
      }
    }
  }

  engage() {
    for (let i = 0; i < this.population; i++) {
      const playerA = this.$orgs['.player--' + i];
      const playerAState = playerA.getState();
      const playerATeam = this.players[i].team;

      if (playerAState.data.pts <= 0) {
        continue;
      }

      if (!playerAState.data.inPlayWith) {
        continue;
      }

      const playerBId = playerAState.data.inPlayWith;
      const playerB = this.$orgs[playerBId];
      const playerBState = playerB.getState();
      const playerBTeam = this.players[playerBState.data.idx].team;

      if (playerATeam === 'karen') {
        playerA.dispatchAction('data', {play: 'defect'});
      }

      else if (playerATeam === 'maga') {
        let play = 'defect';

        if (playerBTeam === 'maga' || playerBTeam === 'the-donald') {
          play = 'cooperate';
        }

        playerA.dispatchAction('data', {play});
      }

      else if (playerATeam === 'snowflake') {
        const memoryOfLastPlays = playerAState.data.memoryOfLastPlays;
        let play = 'cooperate';

        if (Object.keys(memoryOfLastPlays).includes(playerBId)) {
          play = memoryOfLastPlays[playerBId];
        }

        playerA.dispatchAction('data', {play});
      }

      else if (playerATeam === 'the-donald') {
        playerA.dispatchAction('data', {play: 'defect'});
      }
    }
  }

  remember() {
    const matrixData = this.$orgs['.matrix'].getState().data;
    let snowflakeHasIncompleteMemory;

    for (let i = 0; i < this.population; i++) {
      const playerA = this.$orgs['.player--' + i];
      const playerAState = playerA.getState();
      const playerATeam = this.players[i].team;
      let memoryOfLastPlays;
      let numberOfMemoriesBefore;
      let numberOfMemoriesAfter;

      if (playerAState.data.pts <= 0) {
        continue;
      }

      if (playerATeam === 'snowflake') {
        memoryOfLastPlays = playerAState.data.memoryOfLastPlays;
        numberOfMemoriesBefore = Object.keys(memoryOfLastPlays).length;

        if (
          !snowflakeHasIncompleteMemory &&
          numberOfMemoriesBefore < matrixData.populationAlive - 1
        ) {
          snowflakeHasIncompleteMemory = true;
        }
      }

      // Need this here between the conditional blocks in order to account for snowflakes not in play.
      if (!playerAState.data.inPlayWith) {
        continue;
      }

      if (playerATeam === 'snowflake') {
        const playerBId = playerAState.data.inPlayWith;
        const playerB = this.$orgs[playerBId];
        const playerBState = playerB.getState();
        memoryOfLastPlays[playerBId] = playerBState.data.play;
        numberOfMemoriesAfter = Object.keys(memoryOfLastPlays).length;
        let memoryStatus = Math.round(numberOfMemoriesAfter * 100 / (matrixData.populationAlive - 1));
        memoryStatus = memoryStatus < 100 ? memoryStatus : 100;

        if (
          !snowflakeHasIncompleteMemory &&
          numberOfMemoriesAfter < matrixData.populationAlive - 1
        ) {
          snowflakeHasIncompleteMemory = true;
        }

        if (memoryStatus !== playerAState.data.memoryStatus) {
          playerA.dispatchAction('data', {memoryOfLastPlays, memoryStatus});
          this.$orgs['.stats__player--' + i + '__memory'].dispatchAction('removeClass', 'fade--in');

          setTimeout(() => {
            this.$orgs['.stats__player--' + i + '__memory']
              .dispatchAction('text', memoryStatus + '%')
              .dispatchAction('addClass', 'fade--in');
          }, this.renderIntervalAdjusted);
        }
      }
    }

    if (!snowflakeHasIncompleteMemory && !matrixData.riskIntroduced && this.risk) {
      this.$orgs['.matrix'].dispatchAction('data', {riskIntroduced: true});
      this.consoleMessage('<p>Engagement risk introduced</p>');
    }
  }

  tally() {
    const matrixData = this.$orgs['.matrix'].getState().data;
    const matrix = matrixData.matrix;
    const players = [];
    let cooperatorAlive = false;
    let populationAlive = matrixData.populationAlive;

    for (let i = 0; i < this.population; i++) {
      const player = this.$orgs['.player--' + i];
      const state = player.getState();
      const team = this.players[i].team;

      players.push({player, state});

      if (
        state.data.pts > 0 &&
        (team === 'maga' || team === 'snowflake')
      ) {
        cooperatorAlive = true;
      }
    }

    // Need to know cooperatorAlive in order to determine whether to apply engagement risk to a Karen.
    for (let i = 0; i < players.length; i++) {
      const playerA = players[i].player;
      const playerAState = players[i].state;
      const playerATeam = this.players[i].team;

      if (playerAState.data.pts <= 0) {
        continue;
      }

      let playerAPtsOld = playerAState.data.pts;
      let playerAPts = playerAPtsOld;

      if (playerAState.data.inPlayWith) {
        const playerBId = playerAState.data.inPlayWith;
        const playerB = this.$orgs[playerBId];
        const playerBState = playerB.getState();

        if (playerAState.data.play === 'cooperate') {
          if (playerBState.data.play === 'cooperate') {
            playerAPts++;
          }
          if (playerBState.data.play === 'defect') {
            playerAPts--;
          }
        }

        if (playerAState.data.play === 'defect') {
          if (playerBState.data.play === 'cooperate') {
            playerAPts += 2;
          }
        }

        playerA.dispatchAction('data', {inPlayWith: null})

        if (
          matrixData.riskIntroduced &&
          playerAPts > 0 &&
          (!cooperatorAlive || playerATeam !== 'karen') &&
          this.getRandomValue() < this.risk
        ) {
          playerAPts--;
        }
      }

      if (playerAPts !== playerAPtsOld) {
        if (playerAPts > MAX_POINTS) {
          playerAPts = NaN;

          this.$orgs['.matrix'].dispatchAction('data', {maxPointsReached: true});
        }

        const playerPtsId = '.player--' + i + '__pts';

        playerA.dispatchAction('data', {pts: playerAPts})
        this.$orgs[playerPtsId]
          .dispatchAction('text', playerAPts)
          .dispatchAction('addClass', 'fade--in');

        this.$orgs['.stats__player--' + i + '__pts'].dispatchAction('removeClass', 'fade--in');
        setTimeout(() => {
          this.$orgs['.stats__player--' + i + '__pts']
            .dispatchAction('text', playerAPts)
            .dispatchAction('addClass', 'fade--in');
        }, this.renderIntervalAdjusted);

        if (playerAPts <= 0) {
          matrix[playerAState.data.posX][playerAState.data.posY] = null;
          populationAlive--;

          playerA.dispatchAction('addClass', 'dead');
          playerA.dispatchAction('data', {posX: null, posY: null});
          this.$orgs['.stats__player--' + i + '__name']
            .dispatchAction('addClass', 'dead')
            .dispatchAction(
              'append',
              '<img class="death-indicator" src="../../_assets/src/tombstone.svg">'
            );
        }
      }
    }

    this.$orgs['.matrix'].dispatchAction('data', {matrix, populationAlive, turnsTaken: matrixData.turnsTaken + 1});

    // Must recalculate cooperatorAlive in case they all died within the last loop.
    cooperatorAlive = false;

    for (let i = 0; i < players.length; i++) {
      if (this.players[i].team !== 'maga' && this.players[i].team !== 'snowflake') {
        continue;
      }

      if (players[i].player.getState().data.pts > 0) {
        cooperatorAlive = true;

        break;
      }
    }

    if (matrixData.cooperatorAlive !== cooperatorAlive) {
      this.$orgs['.matrix'].dispatchAction('data', {cooperatorAlive});
      this.consoleMessage(`<p>All cooperators have died</p>
<p><img class="avatar--player__img" src="../../_assets/src/karen.svg">s risk point loss</p>
`);
    }
  }

  redisplayPts() {
    for (let i = 0; i < this.population; i++) {
      const playerPts = this.$orgs['.player--' + i + '__pts'];

      playerPts.dispatchAction('removeClass', 'fade--in');
    }
  }

  turn(step = false) {
    const matrixData = this.$orgs['.matrix'].getState().data;

    // Check whether to end simulation.
    if (matrixData.populationAlive < 2 || matrixData.maxPointsReached) {
      return this.end();
    }

    // Check and see if speed has been changed.
    const sliderSpeed = parseFloat(this.$orgs['.slider--speed'].getState().val) || 0;
    let cookieSpeed;

    try {
      cookieSpeed = document.cookie.split('; ')
        .find(row => row.startsWith('speed='))
        .split('=')[1];
    }
    catch {}

    if (!step && (sliderSpeed !== this.speed || sliderSpeed !== parseFloat(cookieSpeed))) {
      this.speed = sliderSpeed;
      document.cookie = `speed=${sliderSpeed};sameSite=strict`;
      this.renderIntervalAdjusted = (50 - this.speed) * this.renderMultiplier;
      this.turnIntervalAdjusted = this.renderIntervalAdjusted * this.renderMultiplier;

      if (this.speed === 0) {
        this.$orgs.body.dispatchAction('removeClass', 'transition-medium');
        this.$orgs.body.dispatchAction('addClass', 'transition-slow');
      }
      else if (this.speed <= 25) {
        this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
        this.$orgs.body.dispatchAction('addClass', 'transition-medium');
      }
      else if (this.speed > 25) {
        this.$orgs.body.dispatchAction('removeClass', 'transition-slow');
        this.$orgs.body.dispatchAction('removeClass', 'transition-medium');
      }

      if (this.intervalId) {
        this.intervalId = clearInterval(this.intervalId);

        this.run();

        return Promise.resolve();
      }
    }

    // Otherwise, run through all the methods that compose a turn.
    return new Promise(
      (resolve) => {
          this.move();

          resolve();
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.approach();

              resolve();
            }, this.renderIntervalAdjusted * 2); // Longer interval necessary for animating correctly in Safari.
          });
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.engage();
              this.remember();
              this.tally();
              this.redisplayPts();

              resolve();
            }, this.renderIntervalAdjusted);
          });
      });
  }

  async restart() {
    const windowState = this.$orgs.window.getState();

    this.$orgs.body
      .dispatchAction('removeClass', 'transition-slow')
      .dispatchAction('removeClass', 'transition-medium');
    this.$orgs['.matrix'].dispatchAction('addClass', 'near-transparent');
    this.$orgs['.select--risk'].dispatchAction('removeClass', 'hidden');
    this.$orgs['.display--risk'].dispatchAction('addClass', 'hidden');
    this.$orgs['.button--run-pause'].dispatchAction('css', {'pointer-events': 'none'});
    this.$orgs['.button--step'].dispatchAction('css', {'pointer-events': 'none'});
    this.$orgs['.button--restart'].dispatchAction('css', {'pointer-events': 'none'});
    this.$orgs['.console__messages'].dispatchAction('html', '');
    this.$orgs['.container--slider--risk'].dispatchAction('css', {height: ''});

    if (windowState.innerWidth <= window.bp_xs_max) {
      this.mobileArticleScrollClosure(-this.sliderRiskHeight)();
    }
    else {
      this.mobileArticleScrollClosure()();
    }

    // Shouldn't be possible, but just in case.
    if (this.intervalId) {
      this.intervalId = clearInterval(this.intervalId);
    }

    while (this.semaphoreArray.length) {
      await this.semaphoreArray.shift().call(this);
    }

    this.redisplayPts();
    this.stoke();

    setTimeout(() => {
      this.$orgs['.matrix__filler']
        .dispatchAction('attr', {class: 'matrix__filler', style: null})
        .dispatchAction('html', '');
      this.$orgs['.matrix__cover']
        .dispatchAction('attr', {class: 'matrix__cover'})
      this.$orgs['.select--risk'].dispatchAction('removeClass', 'hidden');
      this.$orgs['.display--risk'].dispatchAction('addClass', 'hidden');
      this.$orgs['.container--slider--risk'].dispatchAction('css', {height: ''});
      this.$orgs['.button--run-pause']
        .dispatchAction('removeClass', 'button--pause')
        .dispatchAction('addClass', 'button--run')
        .dispatchAction('prop', {disabled: false});
      this.$orgs['.button--step'].dispatchAction('prop', {disabled: false});
    }, this.turnInterval);
    setTimeout(() => {
      this.randomValues = this.randomValuesStore.slice();
      this.risk = null;

      this.populateMatrix();
      this.populateStats();

      this.$orgs['.matrix'].dispatchAction('removeClass', 'near-transparent');
      this.$orgs['.button--run-pause'].dispatchAction('css', {'pointer-events': ''});
      this.$orgs['.button--step'].dispatchAction('css', {'pointer-events': ''});
      this.$orgs['.button--restart'].dispatchAction('css', {'pointer-events': ''});
      this.mobileArticleScrollClosure()();
    }, this.turnInterval + this.renderInterval);
    setTimeout(() => {
      if (this.speed === 0) {
        this.$orgs.body.dispatchAction('addClass', 'transition-slow');
      }
      else if (this.speed <= 25) {
        this.$orgs.body.dispatchAction('addClass', 'transition-medium');
      }
    }, this.turnInterval + this.renderInterval2x);
  }

  async run() {
    // Use a semaphore to determine whether a turn is still pending after the end of the interval in which it began.
    if (!this.intervalId) {
      if (!this.semaphoreLocked) {
        if (this.speed === 0) {
          this.$orgs.body.dispatchAction('addClass', 'transition-slow');
        }
        else if (this.speed <= 25) {
          this.$orgs.body.dispatchAction('addClass', 'transition-medium');
        }

        // Take an immediate turn, with the next to follow the setInterval interval.
        if (this.speed !== 50) {
          this.semaphoreLocked = true;

          this.turn().then(() => {
            this.semaphoreLocked = false;
          });
        }
      }

      if (this.speed === 50) {
        this.intervalId = -1;

        while (this.semaphoreArray.length) {
          await this.semaphoreArray.shift().call(this);
        }

        while (this.intervalId) {
          await this.turn();
        }
      }
      else {
        this.intervalId = setInterval(() => {
          if (!this.semaphoreArray.length) {
            this.semaphoreArray.push(this.turn);
          }

          if (!this.semaphoreLocked) {
            this.semaphoreLocked = true;

            this.semaphoreArray.shift().call(this).then(() => {
              this.semaphoreLocked = false;
            });
          }
        }, this.turnIntervalAdjusted);
      }
    }
  }

  pause() {
    if (this.intervalId) {
      this.intervalId = clearInterval(this.intervalId);
    }
  }
}
