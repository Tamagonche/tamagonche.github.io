import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { GameScene } from './gameScene.js';
import { Pet } from './pet.js';
import { Trash } from './trash.js';
import { ACTIONS_COUNT } from './consts.js';

export class GameManager {
    constructor() {
        this.sb = createClient(
            'https://toflnsmrnnpfkzjpfuuu.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZmxuc21ybm5wZmt6anBmdXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDUzNzQsImV4cCI6MjA1NzMyMTM3NH0.xaJngrx5KnnhuuhtMC6adJUFrkTFRvxy5srwlK0FbVs'
        );
        this.scene = null;
        this.pets = {};
        this.trash = {};
        this.startGame();
    }

    async startGame() {
        await this.loadData();
        new Phaser.Game({
            type: Phaser.CANVAS,
            width: 360,
            height: 360,
            pixelArt: true,
            physics: { default: 'arcade' },
            canvas: document.getElementById("canvas"),
            scene: new GameScene(this),
            transparent: true,
            audio: { noAudio: true }
        });

        this.setupListeners();
    }

    async loadData() {
        const { data: petsData } = await this.sb.from('pets').select();
        this.pets = Object.fromEntries(petsData.map(p => [p.id.toString(), new Pet(p)]));

        const { data: trashData } = await this.sb.from('trash').select();
        this.trash = Object.fromEntries(trashData.map(t => [t.id.toString(), new Trash(t)]));

        const { data: actions } = await this.sb.from('actions').select().order('id', { ascending: false }).limit(ACTIONS_COUNT);

        for (let action of actions.reverse()) {
            this.addAction(action);
        }

        await this.updateTopUsers();
    }

    setupListeners() {
        this.sb.channel('prod')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pets' }, p => {
                const pet = this.pets[p.new.id.toString()];
                if (pet) pet.updateData(p.new);
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions' }, a => {
                this.addAction(a.new);

                if (a.new.useful) {
                    this.updateTopUsers();
                }

                if (a.new.type === 'feed') this.pets[a.new.pet_id.toString()].feed();
                if (a.new.type === 'weed') this.pets[a.new.pet_id.toString()].giveWeed();
                if (a.new.type === 'fap') this.pets[a.new.pet_id.toString()].fap();
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trash' }, t => {
                this.trash[t.new.id.toString()] = new Trash(t.new);
                this.trash[t.new.id.toString()].addToScene(this.scene);
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'trash' }, t => {
                if (this.trash[t.old.id.toString()]) {
                    this.trash[t.old.id.toString()].sprite.destroy();
                    delete this.trash[t.old.id.toString()];
                }
            })
            .subscribe();
    }

    async updateTopUsers() {
        const { data: topUsers } = await this.sb.from('top_users_per_actiontype').select();
        document.getElementById('top-users').innerHTML = '';

        for (let user of topUsers) {
            const div = document.createElement('div');
            div.className = 'top-user';
            const left = document.createElement('div');
            left.className = 'left';
            const right = document.createElement('div');
            right.className = 'right';
            right.innerHTML = user.username + ' (' + user.action_count + ')';

            if (user.type === 'feed') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-burger"></i></div>`;
            } else if (user.type === 'clean_trash') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-poop"></i></div>`;
            } else if (user.type === 'give_medicine') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-syringe"></i></div>`;
            } else if (user.type === 'weed') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-cannabis"></i></div>`;
            } else if (user.type === 'drink') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-beer-mug-empty"></i></div>`;
            } else if (user.type === 'fap') {
                left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-droplet"></i></div>`;
            }
            div.append(left);
            div.append(right);
            document.getElementById('top-users').append(div);
        }
    }

    addAction(action) {
        const div = document.createElement('div');
        div.className = 'action';
        const left = document.createElement('div');
        left.className = 'left';
        const right = document.createElement('div');
        right.className = 'right';
        const time = document.createElement('div');
        time.className = 'time';
        const createdAt = new Date(action.created_at);
        time.textContent = createdAt.toLocaleString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            hour12: false
        });
        const content = document.createElement('div');
        if (action.type === 'feed') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-burger"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> lui donne à manger`;
        } else if (action.type === 'clean_trash') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-poop"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> nettoie la merde`;
        } else if (action.type === 'give_medicine') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-syringe"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> lui donne un doliprane`;
        } else if (action.type === 'weed') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-cannabis"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> lui donne de la weed`;
        } else if (action.type === 'drink') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-beer-mug-empty"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> lui marloute la gueule`;
        } else if (action.type === 'fap') {
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-beer-mug-empty"></i></div>`;
            content.innerHTML = `<span class="pseudo">${action.username}</span> lui branle le Z`;
        } else {
            return;
        }
        right.appendChild(time);
        right.appendChild(content);
        div.appendChild(left);
        div.appendChild(right);
        document.getElementById('actions').prepend(div);

        const children = Array.from(document.getElementById('actions').children);
        children.slice(ACTIONS_COUNT).forEach(child => child.remove());
    }
}

