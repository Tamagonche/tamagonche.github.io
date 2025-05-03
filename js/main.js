import { NAVBAR_ITEMS, HEART_RATE, HAPPY_RATE, HAPPY_OFFSET, DRINK_RATE, TRASH_RATE } from './consts.js';
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

function getTimeLeft(rate, minute = 0) {
  const now = new Date();
  const currentHourUTC = now.getUTCHours();

  let nextExecutionHourUTC = Math.ceil((currentHourUTC + 1) / rate) * rate;

  if (nextExecutionHourUTC >= 24) {
    nextExecutionHourUTC = 0;
    now.setUTCDate(now.getUTCDate() + 1); // Move to the next day
  }

  const nextExecutionDateUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    nextExecutionHourUTC,
    minute,
    0,
    0
  ));

  let timeLeft = nextExecutionDateUTC - new Date() + 60 * 1000;
  if (timeLeft < 0) timeLeft = 0;

  return timeLeft;
}

function insertTimeLeft(timeLeft, el) {
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  el.innerHTML = (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes;
}

const heartCountdown = document.getElementById("heart-countdown");
const happyCountdown = document.getElementById("happy-countdown");
const drinkCountdown = document.getElementById("drink-countdown");
const trashCountdown = document.getElementById("trash-countdown");
setInterval(() => {
  insertTimeLeft(getTimeLeft(HEART_RATE), heartCountdown);
  insertTimeLeft(getTimeLeft(HAPPY_RATE, HAPPY_OFFSET), happyCountdown);
  insertTimeLeft(getTimeLeft(DRINK_RATE), drinkCountdown);
  insertTimeLeft(getTimeLeft(TRASH_RATE), trashCountdown);
}, 1000);

