import { Command } from "./command.js";
import { NavbarItem } from "./navbar.js";

export const ACTIONS_COUNT = 15;
export const PET_SPEED = 50;
export const PET_POS_Y = 216;
export const FOOD_POS_Y = -25;
export const EAT_TIME = 6; // seconds

export const HEART_RATE = 4; // hours
export const HAPPY_RATE = 3; // hours
export const HAPPY_OFFSET = 30; // minutes
export const DRINK_RATE = 3; // hours
export const TRASH_RATE = 2; // hours

export const STATS = {
  food: "Vie",
  happiness: "Bonheur",
  drink: "Marlouterie",
};

export const NAVBAR_ITEMS = [
  new NavbarItem("history", "clock-rotate-left"),
  new NavbarItem("commands", "list"),
  new NavbarItem("countdown", "hourglass"),
  new NavbarItem("top_kheys", "crown"),
  new NavbarItem("stats", "line-chart", true),
  new NavbarItem("users", "users"),
];

export const COMMANDS = [
  new Command("feed", "burger", "/nourrir", action => `<span class="pseudo">${action.username}</span> lui donne à manger`),
  new Command("clean_trash", "poop", "/nettoyer", action => `<span class="pseudo">${action.username}</span> mange sa merde`),
  new Command("give_medicine", "syringe", "/doliprane", action => `<span class="pseudo">${action.username}</span> lui donne un doliprane`),
  new Command("weed", "cannabis", "/weed", action => `<span class="pseudo">${action.username}</span> lui donne de la weed`),
  new Command("drink", "beer-mug-empty", "/marloute", action => `<span class="pseudo">${action.username}</span> lui marloute la gueule`),
  new Command("fap", "droplet", "/branle", action => `<span class="pseudo">${action.username}</span> lui branle le Z`),
  new Command("punch", "hand-fist", "/battre", action => `<span class="pseudo">${action.username}</span> lui démonte la tronche`),
  new Command("sweat", "fire", "/sueur", action => `<span class="pseudo">${action.username}</span> le fait suer du cul`),
];

export const COMMANDS_MAP = COMMANDS.reduce((acc, cmd) => ({...acc, [cmd.id]: cmd}), {});
