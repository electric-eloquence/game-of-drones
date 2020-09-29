import organismsGet from './organisms-get.js';
import Requerio from '../../../node_modules/requerio/dist/requerio.npm.mjs';
import Simulation from './simulation.js';
import './matrix-prepare.js';
import './stats-prepare.js';

const POPULATION = window.population;
const MATRIX_WIDTH = Math.round(Math.sqrt(POPULATION) * 1.5);
const MATRIX_HEIGHT = MATRIX_WIDTH;
const RENDER_INTERVAL = window.render_interval;
const TURN_INTERVAL = window.turn_interval;
const $organisms = organismsGet();
const requerio = new Requerio($, Redux, $organisms);

requerio.init();

const simulation = new Simulation(
  requerio,
  MATRIX_WIDTH,
  MATRIX_HEIGHT,
  POPULATION,
  RENDER_INTERVAL,
  TURN_INTERVAL
);

simulation.stoke();
