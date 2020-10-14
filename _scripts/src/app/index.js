import organismsGet from './organisms-get.js';
import Requerio from '../../../node_modules/requerio/dist/requerio.npm.mjs';
import Simulation from './simulation.js';
import './matrix-prepare.js';
import './stats-prepare.js';

const $organisms = organismsGet();
const requerio = new Requerio($, Redux, $organisms);

requerio.init();

const matrixWidth = Math.round(Math.sqrt(window.population) * 1.5);
const matrixHeight = matrixWidth;

const sim = new Simulation(
  requerio,
  {
    matrixWidth,
    matrixHeight,
    playerPadding: window.player_padding,
    playerSize: window.player_size,
    population: window.population,
    renderInterval: window.render_interval,
    turnInterval: window.turn_interval,
    snowflakeColor: window.snowflake_color
  }
);

sim.init();
