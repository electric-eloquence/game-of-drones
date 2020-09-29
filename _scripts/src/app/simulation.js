import snowflakeGenerate from './snowflake-generate.js';

const MAX_POINTS = 255;
const play = new Event('play');
const pts = 10;

export default class Simulation {
  constructor(requerio, matrixWidth, matrixHeight, population, renderInterval, turnInterval) {
    this.requerio = requerio;
    this.$orgs = requerio.$orgs;
    this.matrixWidth = matrixWidth;
    this.matrixHeight = matrixHeight;
    this.population = population;
    this.populationAlive = population;
    this.renderInterval = renderInterval;
    this.turnInterval = turnInterval;

    this.cooperatorAlive = true;
    this.intervalId = null;
    this.matrix = [];
    this.maxPointsReached = false;
    this.playerPadding = window.player_padding;
    this.playerSize = window.player_size;
    this.risk = null;
    this.riskIntroduced = false;
    this.teamKeys = ['karen', 'maga', 'snowflake'];
    this.teams = {};
    this.vonNeumannKeys = [{x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}, {x: 1, y: 0}];

    for (let x = 0; x < this.matrixWidth; x++) {
      this.matrix[x] = [];

      for (let y = 0; y < this.matrixHeight; y++) {
        this.matrix[x][y] = null;
      }
    }
  }

  /*** @private */
  addEventListeners() {
    this.$orgs['.button--run-pause'].on('click', () => {
      const buttonRunPauseState = this.$orgs['.button--run-pause'].getState();

      if (buttonRunPauseState.classArray.includes('button--run')) {
        const selectEngagementRisk = this.$orgs['.select--engagement-risk'];
        const selectEngagementRiskState = selectEngagementRisk.getState();

        if (this.risk === null) {
          this.$orgs['.select--engagement-risk'].dispatchAction('addClass', 'hidden');
          this.$orgs['.display--engagement-risk'].dispatchAction('removeClass', 'hidden');
        }

        this.risk = 0.01 * parseInt(selectEngagementRiskState.value || selectEngagementRisk.val(), 10);

        this.run();
        this.$orgs['.display--engagement-risk'].dispatchAction('text', `${100 * this.risk}%`)
        this.$orgs['.button--run-pause']
          .dispatchAction('removeClass', 'button--run')
          .dispatchAction('addClass', 'button--pause');
        this.$orgs['.button--step'].dispatchAction('prop', {disabled: true});
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
    this.$orgs['.button--run-pause'].on('touchend', () => {
      this.$orgs['.button--run-pause'].dispatchAction('blur');
    });
    this.$orgs['.button--step'].on('click', () => {
      const buttonStepState = this.$orgs['.button--step'].getState();

      if (buttonStepState.props.disabled) {
        return;
      }

      const selectEngagementRisk = this.$orgs['.select--engagement-risk'];
      const selectEngagementRiskState = selectEngagementRisk.getState();

      if (this.risk === null) {
        this.$orgs['.select--engagement-risk'].dispatchAction('addClass', 'hidden');
        this.$orgs['.display--engagement-risk'].dispatchAction('removeClass', 'hidden');
      }

      this.risk = 0.01 * parseInt(selectEngagementRiskState.value || selectEngagementRisk.val(), 10);

      this.turn();
      this.$orgs['.display--engagement-risk'].dispatchAction('text', `${100 * this.risk}%`)
    });
    this.$orgs['.button--step'].on('mouseleave', () => {
      this.$orgs['.button--step'].dispatchAction('blur');
    });
    this.$orgs['.button--step'].on('touchend', () => {
      this.$orgs['.button--step'].dispatchAction('blur');
    });
    this.$orgs['.button--rerun'].on('click', () => {
      location.reload();
    });
    this.$orgs['.button--rerun'].on('mouseleave', () => {
      this.$orgs['.button--rerun'].dispatchAction('blur');
    });
    this.$orgs['.button--rerun'].on('touchend', () => {
      this.$orgs['.button--rerun'].dispatchAction('blur');
    });

    const simulationInst = this;

    this.$orgs['.select--engagement-risk'].on('change', function () {
      simulationInst.$orgs['.select--engagement-risk']
        .dispatchAction('val', this.value)
        .dispatchAction('blur');
    });
    this.$orgs['.stats__player'].on('mouseenter', function () {
      const playerId = this.dataset.id;

      simulationInst.$orgs[playerId].dispatchAction('addClass', 'focused');
    });
    this.$orgs['.stats__player'].on('mouseleave', function () {
      const playerId = this.dataset.id;

      simulationInst.$orgs[playerId].dispatchAction('removeClass', 'focused');
    });
  }

  /*** @private */
  findVonNeumannNeighbors(posX, posY) {
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
        if (this.populationAlive > 4) {
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
            if (this.populationAlive <= 4) {
              if (posY >= this.matrixHeight - 2) {
                continue;
              }
            }
          }
        }

        vonNeumannNeighbors[x][y] = this.matrix[posX + x][posY + y];
      }
    }

    return vonNeumannNeighbors;
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
  parseTransformTranslate(transformValue) {
    const transformValueParsed = transformValue.split('(')[1].slice(0, -1).split(', ');
    transformValueParsed[1] = transformValueParsed[1] || '0px';

    return transformValueParsed;
  }

  /*** @private */
  playPlayerB(playerB) {
    const playerBState = playerB.getState();
    const playerBData = playerBState.data;
    const vonNeumannNeighbors = this.findVonNeumannNeighbors(playerBData.posX, playerBData.posY);

    this.vonNeumannKeys.forEach((key) => {
      const vonNeumannNeighbor = vonNeumannNeighbors[key.x][key.y];

      if (vonNeumannNeighbor === playerBData.inPlayWith) {
        const playerBTransform = this.getStyleFromAttrib(playerBState, 'transform');
        const playerBTransformParsed = this.parseTransformTranslate(playerBTransform);
        const playerBTranslateXOffset = parseInt(playerBTransformParsed[0], 10) + (key.x * this.playerPadding);
        const playerBTranslateYOffset = parseInt(playerBTransformParsed[1], 10) + (key.y * this.playerPadding);

        playerB.dispatchAction(
          'css',
          {transform: 'translate(' + playerBTranslateXOffset + 'px, ' + playerBTranslateYOffset + 'px)'}
        );
      }
    });
  }

  extinguish() {
    this.$orgs['.console__messages'].dispatchAction(
      'append',
      '<p>There are no winners</p>'
    );

    return new Promise(
      (resolve) => {
        setTimeout(() => {
          this.$orgs['.matrix'].dispatchAction('html', `
      <img src="../../_assets/src/extinction.png" width="${this.matrixWidth * this.playerSize}">
      <img class="matrix__cover" src="../../_assets/src/matrix__cover.svg"></div>
      `
          );
          this.requerio.incept('.matrix__cover');
          resolve();
        }, this.renderInterval);
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.$orgs['.matrix__cover'].dispatchAction('addClass', 'reveal');
              resolve();
            }, this.turnInterval); // Using this.turnInterval and not this.renderInterval because this.win() does.
          });
      });
  }

  populateMatrix() {
    this.$orgs['.matrix'].dispatchAction(
      'css',
      {width: (this.playerSize * this.matrixWidth + 2) + 'px', height: (this.playerSize * this.matrixHeight + 2) + 'px'}
    );

    this.teamKeys.forEach((team) => {
      this.teams[team] = {
        playerIds: [],
        subPopulation: 0
      };
    });

    for (let i = 0; i < this.population; i++) {
      const player = this.$orgs['.player--' + i];
      let playerData = {posX: null, posY: null};

      while (playerData.posX === null || playerData.posY === null) {
        const posX = Math.floor(Math.random() * this.matrixWidth);
        const posY = Math.floor(Math.random() * this.matrixHeight);

        if (this.matrix[posX][posY] === null) {
          this.matrix[posX][posY] = '.player--' + i;
          playerData = {posX, posY};

          player
            .dispatchAction('data', playerData)
            .dispatchAction('css', {
              display: 'block',
              transform: 'translate(' + (this.playerSize * posX) + 'px, ' + (this.playerSize * posY) + 'px)'
            });
        }
      }

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
        team = this.teamKeys[Math.floor(3 * (i - 1) / (this.population - 1))];
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
            const snowflakeCanvas = snowflakeGenerate(window.snowflake_color);
            const snowflakeDataURL = snowflakeCanvas.toDataURL('image/png');
            img += `src="${snowflakeDataURL}">`;
            name = img + span;

            break;
          }
        }
      }

      player
        .dispatchAction('addClass', team)
        .dispatchAction('data', {id, memoryOfLastPlays: {}, memoryStatus: 0, name, pts, team});
      this.$orgs['.player--' + i + '__pts'].dispatchAction('text', pts);
    }

    this.$orgs['.matrix'].dispatchAction('data', {matrix: this.matrix});
  }

  populateStats() {
    for (let i = 0; i < this.population; i++) {
      const playerData = this.$orgs['.player--' + i].getState().data;
      const statsPlayer = this.$orgs['.stats__player--' + i];
      const statsPlayerName = this.$orgs['.stats__player--' + i + '__name'];

      statsPlayerName.dispatchAction('html', `<div class="container container--avatar">${playerData.name}</div>`);
      this.$orgs['.stats__player--' + i + '__pts'].dispatchAction('text', pts);
    }
  }

  win(winnerState) {
    this.$orgs['.console__messages'].dispatchAction('append', `<p>${winnerState.data.name} wins!</p>`);
    this.$orgs['.matrix'].dispatchAction('prepend', '<div class="matrix__filler"></div>');
    this.requerio.incept('.matrix__filler');

    const fillerOrg = this.$orgs['.matrix__filler'];

    fillerOrg.dispatchAction('css', {transform: winnerState.style.transform});

    return new Promise(
      (resolve) => {
        setTimeout(() => {
          const {posX, posY, team} = winnerState.data;

          fillerOrg.dispatchAction('addClass', team);
          fillerOrg.dispatchAction('css', {transform: `translate(${40 * posX}px, ${40 * posY}px) scale(7, 7)`});
          resolve();
        }, this.turnInterval); // Must use this.turnInterval and not this.renderInterval so as to process winner data.
      });
  }

  stoke() {
    this.$orgs.body.dispatchAction('addClass', 'stoked');
    this.populateMatrix();
    this.populateStats();
    this.addEventListeners();
  }

  end() {
    this.pause();
    this.$orgs['.button--run-pause'].dispatchAction('prop', {disabled: true});

    // End simulation if max points reached.
    if (this.maxPointsReached) {
      return new Promise(
        (resolve) => {
          setTimeout(() => {
            const articleBody = this.$orgs['.container--article-body'].html();

            this.$orgs['.matrix'].dispatchAction('addClass', 'kill-screen');
            this.$orgs['.matrix'].dispatchAction('append', '<div class="matrix__dummy-text">' + articleBody + '</div>');
            this.$orgs['.console__messages'].dispatchAction(
              'append',
              '<p>Reached the kill screen</p><p>Ending simulation</p>'
            );
          }, this.turnInterval);
        });
    }

    // End simulation if down to 1 or 0 survivors.
    let winner;
    let winnerState;

    for (let i = 0; i < this.population; i++) {
      const state = this.$orgs['.player--' + i].getState();

      if (state.data.pts > 0) {
        winner = this.$orgs['.player--' + i];
        winnerState = state;

        break;
      }
    }

    // End of simultation message for 1 survivor.
    if (winnerState) {
      return this.win(winnerState);
    }
    // End of simultation message for 0 survivors.
    else {
      return this.extinguish();
    }
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
      let playerTranslateXReset = parseInt(playerTransformParsed[0], 10);
      let playerTranslateYReset = parseInt(playerTransformParsed[1], 10);
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

      playerState = player.getState();

      while (keysTried.includes(false)) {
        const keyIdxRandom = Math.floor(Math.random() * 5);

        // Include the option of not moving. This is especially necessary toward the end when we must not have an
        // oscillation where players always avoid each other.
        if (keyIdxRandom === 4) {
          keysTried = keysTried.map(val => true);

          continue;
        }

        keysTried[keyIdxRandom] = true;
        const vonNeumannNeighbors = this.findVonNeumannNeighbors(posX, posY);
        const vonNeumannNeighborFound =
          vonNeumannNeighbors[this.vonNeumannKeys[keyIdxRandom].x][this.vonNeumannKeys[keyIdxRandom].y];

        if (vonNeumannNeighborFound === null) { // Must strictly equal null. Undefined means out of bounds.
          const keyIdx = keyIdxRandom;

          // Need to parse the style attrib because the computed style value at the time the state was set will have
          // the styles at the time the animation starts, not when it ends.
          const playerTransform = this.getStyleFromAttrib(playerState, 'transform');
          const playerTransformParsed = this.parseTransformTranslate(playerTransform);
          let translateX = playerTransformParsed[0];
          let translateY = playerTransformParsed[1];
          const translateXInt = parseInt(translateX, 10);
          const translateYInt = parseInt(translateY, 10);

          // Unset old position.
          this.matrix[posX][posY] = null;

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
          this.matrix[posX][posY] = playerId;

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

      const vonNeumannNeighbors = this.findVonNeumannNeighbors(playerAState.data.posX, playerAState.data.posY);
      const keysTried = [false, false, false, false];

      while (keysTried.includes(false)) {
        const keyIdxRandom = Math.floor(Math.random() * 4);
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
            const playerATranslateXOffset = parseInt(playerATransformParsed[0], 10) + (key.x * this.playerPadding);
            const playerATranslateYOffset = parseInt(playerATransformParsed[1], 10) + (key.y * this.playerPadding);

            playerA.dispatchAction('data', {inPlayWith: vonNeumannNeighborFound});
            playerA.dispatchAction(
              'css',
              {transform: 'translate(' + playerATranslateXOffset + 'px, ' + playerATranslateYOffset + 'px)'}
            );
            playerB.dispatchAction('data', {inPlayWith: playerAId});
            this.playPlayerB(playerB);

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

      if (playerAState.data.pts <= 0) {
        continue;
      }

      if (!playerAState.data.inPlayWith) {
        continue;
      }

      const playerBId = playerAState.data.inPlayWith;
      const playerB = this.$orgs[playerBId];
      const playerBState = playerB.getState();

      if (playerAState.data.team === 'karen') {
        playerA.dispatchAction('data', {play: 'defect'});
      }

      else if (playerAState.data.team === 'maga') {
        let play = 'defect';

        if (playerBState.data.team === 'maga' || playerBState.data.team === 'the-donald') {
          play = 'cooperate';
        }

        playerA.dispatchAction('data', {play});
      }

      else if (playerAState.data.team === 'snowflake') {
        const memoryOfLastPlays = playerAState.data.memoryOfLastPlays;
        let play = 'cooperate';

        if (Object.keys(memoryOfLastPlays).includes(playerBId)) {
          play = memoryOfLastPlays[playerBId];
        }

        playerA.dispatchAction('data', {play});
      }

      else if (playerAState.data.team === 'the-donald') {
        playerA.dispatchAction('data', {play: 'defect'});
      }
    }
  }

  remember() {
    let snowflakeHasIncompleteMemory;

    for (let i = 0; i < this.population; i++) {
      const playerA = this.$orgs['.player--' + i];
      const playerAState = playerA.getState();
      let memoryOfLastPlays;
      let numberOfMemoriesBefore;
      let numberOfMemoriesAfter;

      if (playerAState.data.pts <= 0) {
        continue;
      }

      if (playerAState.data.team === 'snowflake') {
        memoryOfLastPlays = playerAState.data.memoryOfLastPlays;
        numberOfMemoriesBefore = Object.keys(memoryOfLastPlays).length;

        if (
          !snowflakeHasIncompleteMemory &&
          numberOfMemoriesBefore < this.populationAlive - 1
        ) {
          snowflakeHasIncompleteMemory = true;
        }
      }

      // Need this here between the conditional blocks in order to account for snowflakes not in play.
      if (!playerAState.data.inPlayWith) {
        continue;
      }

      if (playerAState.data.team === 'snowflake') {
        const playerBId = playerAState.data.inPlayWith;
        const playerB = this.$orgs[playerBId];
        const playerBState = playerB.getState();
        memoryOfLastPlays[playerBId] = playerBState.data.play;
        numberOfMemoriesAfter = Object.keys(memoryOfLastPlays).length;
        let memoryStatus = Math.round(100 * numberOfMemoriesAfter / (this.populationAlive - 1));
        memoryStatus = memoryStatus < 100 ? memoryStatus : 100;

        if (
          !snowflakeHasIncompleteMemory &&
          numberOfMemoriesAfter < this.populationAlive - 1
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
          }, this.renderInterval);
        }
      }
    }

    if (!snowflakeHasIncompleteMemory && !this.riskIntroduced && this.risk) {
      this.riskIntroduced = true;

      this.$orgs['.console__messages'].dispatchAction('append', '<p>Engagement risk introduced!</p>');
    }
  }

  tally() {
    const players = [];
    let cooperatorAlive = false;

    for (let i = 0; i < this.population; i++) {
      const player = this.$orgs['.player--' + i];
      const state = player.getState();

      players.push({player, state});

      if (
        state.data.pts > 0 &&
        (state.data.team === 'maga' || state.data.team === 'snowflake')
      ) {
        cooperatorAlive = true;
      }
    }

    // Need to know cooperatorAlive in order to determine whether to apply engagement risk to a Karen.
    for (let i = 0; i < players.length; i++) {
      const playerA = players[i].player;
      const playerAState = players[i].state;

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
          this.riskIntroduced &&
          playerAPts > 0 &&
          (!cooperatorAlive || playerAState.data.team !== 'karen') &&
          Math.random() < this.risk
        ) {
          playerAPts--;
        }
      }

      if (playerAPts !== playerAPtsOld) {
        if (playerAPts > MAX_POINTS) {
          playerAPts = NaN;
          this.maxPointsReached = true;
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
        }, this.renderInterval);

        if (playerAPts <= 0) {
          this.matrix[playerAState.data.posX][playerAState.data.posY] = null;

          this.populationAlive--;
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

    // Must recalculate cooperatorAlive in case they all died within the last loop.
    cooperatorAlive = false;

    for (let i = 0; i < players.length; i++) {
      if (players[i].state.data.team !== 'maga' && players[i].state.data.team !== 'snowflake') {
        continue;
      }

      if (players[i].player.getState().data.pts > 0) {
        cooperatorAlive = true;

        break;
      }
    }

    if (this.cooperatorAlive !== cooperatorAlive) {
      this.cooperatorAlive = cooperatorAlive;

      this.$orgs['.console__messages'].dispatchAction('append', `<p>All cooperators have died</p>
<p><img class="avatar--player__img" src="../../_assets/src/karen.svg">s risk point loss</p>
`
      );
    }
  }

  reset() {
    for (let i = 0; i < this.population; i++) {
      const playerPts = this.$orgs['.player--' + i + '__pts'];

      playerPts.dispatchAction('removeClass', 'fade--in');
    }
  }

  turn() {
    // Check whether to end simulation.
    if (this.populationAlive < 2 || this.maxPointsReached) {
      return this.end();
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
            }, this.renderInterval * 2); // Longer interval necessary for animating correctly in Safari.
          });
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.engage();
              this.remember();
              this.tally();
              resolve();
            }, this.renderInterval);
          });
      })
      .then(() => {
        return new Promise(
          (resolve) => {
            setTimeout(() => {
              this.reset();
              resolve();
            }, this.renderInterval);
          });
      });
  }

  run() {
    if (!this.intervalId) {
      // this.intervalId initialized to null. clearInterval() sets it to undefined.
      if (this.intervalId === null) {
        this.turn();
      }

      this.intervalId = setInterval(() => {
        this.turn();
      }, this.turnInterval);
    }
  }

  pause() {
    if (this.intervalId) {
      this.intervalId = clearInterval(this.intervalId);
    }
  }
}
