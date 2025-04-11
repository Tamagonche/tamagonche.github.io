import { Command } from "./command.js";

export const ACTIONS_COUNT = 15;
export const PET_SPEED = 50;
export const PET_POS_Y = 216;
export const FOOD_POS_Y = -25;
export const EAT_TIME = 6; // seconds

export const COMMANDS = [
  new Command("feed", "burger", action => `<span class="pseudo">${action.username}</span> lui donne à manger`),
  new Command("clean_trash", "poop", action => `<span class="pseudo">${action.username}</span> nettoie la merde`),
  new Command("give_medicine", "syringe", action => `<span class="pseudo">${action.username}</span> lui donne un doliprane`),
  new Command("weed", "cannabis", action => `<span class="pseudo">${action.username}</span> lui donne de la weed`),
  new Command("drink", "beer-mug-empty", action => `<span class="pseudo">${action.username}</span> lui marloute la gueule`),
  new Command("fap", "droplet", action => `<span class="pseudo">${action.username}</span> lui branle le Z`),
  new Command("punch", "hand-fist", action => `<span class="pseudo">${action.username}</span> lui démonte la tronche`),
]
