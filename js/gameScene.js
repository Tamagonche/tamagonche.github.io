import { EAT_TIME } from './consts.js';

export class GameScene extends Phaser.Scene {
    constructor(gameManager) {
        super();
        this.gameManager = gameManager;
        this.gameManager.scene = this;
    }

    preload() {
        this.load.spritesheet('puchitomatchi', 'img/puchitomatchi.png', { frameWidth: 66, frameHeight: 68 });
        this.load.spritesheet('puchitomatchi_weed', 'img/puchitomatchi_weed.png', { frameWidth: 66, frameHeight: 68 });
        this.load.spritesheet('puchitomatchi_zboub', 'img/puchitomatchi_zboub.png', { frameWidth: 66, frameHeight: 68 });
        this.load.spritesheet('puchitomatchi_blood', 'img/puchitomatchi_blood.png', { frameWidth: 66, frameHeight: 68 });
        this.load.spritesheet('food', 'img/food.png', { frameWidth: 26, frameHeight: 28 });
        this.load.image('scroll', 'img/scroll.png');
        this.load.image('poop', 'img/poop.png');
        this.load.image('bottle', 'img/bottle.png');
        this.load.image('smile', 'img/smile.png');
        this.load.image('smile_grey', 'img/smilegrey.png');
        this.load.image('heart_red', 'img/heartred.png');
        this.load.image('heart_grey', 'img/heartgrey.png');
        this.load.image('drink', 'img/drink.png');
        this.load.image('drink_grey', 'img/drinkgrey.png');
    }

    create() {
        this.anims.create({
            key: 'puchitomatchi_idle',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 0, end: 1 }),
            frameRate: 2,
            repeat: -1
        });

        this.anims.create({
            key: 'puchitomatchi_walk',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 4, end: 5 }),
            frameRate: 6,
            repeat: -1
        });

        this.anims.create({
            key: 'puchitomatchi_eat',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 1, end: 1 }),
            frameRate: 4 / EAT_TIME,
            repeat: 0
        });

        this.anims.create({
            key: 'puchitomatchi_sad',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 2, end: 2 }),
            frameRate: 2,
            repeat: 0
        });

        this.anims.create({
            key: 'puchitomatchi_sick',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 13, end: 13 }),
            frameRate: 2,
            repeat: 0
        });

        this.anims.create({
            key: 'puchitomatchi_dry',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 2, end: 2 }),
            frameRate: 2,
            repeat: 0
        });

        this.anims.create({
            key: 'puchitomatchi_dead',
            frames: this.anims.generateFrameNumbers('puchitomatchi', { start: 12, end: 12 }),
            frameRate: 2,
            repeat: 0
        });

        this.anims.create({
            key: 'consume_burger',
            frames: this.anims.generateFrameNumbers('food', { start: 147, end: 149 }),
            frameRate: 4 / EAT_TIME,
            repeat: 0
        });


        this.petLayer = this.add.layer();
        this.trashLayer = this.add.layer();
        this.petLayer.setDepth(1);
        this.trashLayer.setDepth(0);

        this.add.sprite(180, 90, 'scroll').setScale(2);
        Object.values(this.gameManager.pets).forEach(pet => pet.addToScene(this));
        Object.values(this.gameManager.trash).forEach(trash => trash.addToScene(this));
    }

    update() {}
}
