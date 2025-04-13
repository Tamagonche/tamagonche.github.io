import { NAVBAR_ITEMS } from './consts.js';
import { GameManager } from './gameManager.js';
import { Navbar } from './navbar.js';

Highcharts.setOptions({
  credits: {
    enabled: false,
  },
  chart: {
    animation: false,
  },
  tooltip: {
    xDateFormat: '%d/%m/%Y',
  },
  plotOptions: {
    series: {
      animation: false,
    }
  }
});

const gameManager = new GameManager();

new Navbar(gameManager, NAVBAR_ITEMS);
