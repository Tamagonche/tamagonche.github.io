import { PET_SPEED, PET_POS_Y, FOOD_POS_Y } from './consts.js';

export class Pet {
    constructor(data) {
        Object.assign(this, data);
        this.sprite = null;
        this.foodSprite = null;
        this.container = null;
        this.hearts = [];
        this.smiles = [];
    }

    addToScene(scene) {
        this.container = scene.add.container(0, PET_POS_Y);
        scene.petLayer.add(this.container);

        this.sprite = scene.add.sprite(0, 0, this.sprite_type).setScale(2);
        this.container.add(this.sprite);

        this.modifiers = {
            weed: scene.add.sprite(0, 0, this.sprite_type+'_weed').setScale(2).setVisible(false),
        };
        this.container.add(this.modifiers.weed);

        // Sync modifiers
        this.sprite.on('animationstart', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
        });
        this.sprite.on('animationupdate', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
        });
        this.sprite.on('animationend', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
        });


        this.foodSprite = scene.add.sprite(0, FOOD_POS_Y, 'food').setScale(2).setVisible(false);
        this.container.add(this.foodSprite);
        this.foodSprite.on('animationcomplete', () => {
            this.foodSprite.setVisible(false);
        });

        this.container.setPosition(this.getX(), PET_POS_Y);

        this.container.list.forEach(child => {
            child.setFlipX(this.flip_x);
        });

        this.sprite.play(this.statusToAnim());

        this.updateHearts();
        this.updateSmiles();
    }

    updateHearts() {
        for (let sprite of this.hearts) {
            sprite.destroy();
        }
        this.hearts = []
        for (let i = 0; i < this.max_food; i++) {
            this.hearts.push(this.container.scene.add.sprite(this.container.scene.game.config.width/2-40*(this.max_food-1)/2+40*i, 46, this.food >= i+1 ? 'heart_red' : 'heart_grey').setScale(2));
        }
    }

    updateSmiles() {
        for (let sprite of this.smiles) {
            sprite.destroy();
        }
        this.smiles = [];
        for (let i = 0; i < this.max_happiness; i++) {
            this.smiles.push(this.container.scene.add.sprite(this.container.scene.game.config.width/2-40*(this.max_happiness-1)/2+40*i, 88, this.happiness >= i+1 ? 'smile' : 'smile_grey').setScale(2));
        }
    }

    getX() {
        let petWidth = this.sprite.displayWidth+12*this.sprite.scale;
        return (this.container.scene.game.config.width-petWidth/2)*this.pos_x+petWidth/4;
    }

    statusToAnim(status) {
        return this.sprite_type+'_'+(status || this.status);
    }

    updateData(newData) {
        const newStatus = this.status !== newData.status;
        const newFoodLevel = this.food !== newData.food;
        const newHappyLevel = this.happiness !== newData.happiness;
        const newPosX = this.pos_x !== newData.pos_x;
        const newFlipX = this.flip_x !== newData.flip_x;

        const oldX = this.getX();

        Object.assign(this, newData);

        if (newStatus) {
            this.sprite.play(this.statusToAnim());
        }
        if (newFoodLevel) {
            this.updateHearts();
        }
        if (newHappyLevel) {
            this.updateSmiles();
        }
        if (newFlipX) {
            this.container.list.forEach(child => {
                child.setFlipX(this.flip_x);
            });
        }
        if (newPosX) {
            this.walk(oldX);
        }
    }

    walk(oldX) {
        const newX = this.getX();
        if (document.hidden) { // Don't animate if the tab is not active
            this.container.setPosition(newX, PET_POS_Y);
        } else {
            const duration = Math.abs(oldX-newX)/PET_SPEED*1000;
            this.container.scene.tweens.add({
                targets: this.container,
                x: newX,
                duration,
                repeat: 0,
                onStart: () => this.sprite.play(this.statusToAnim('walk')),
                onComplete: () => this.sprite.play(this.statusToAnim()),
            });
        }
    }

    // ACTIONS

    feed() {
        if (!document.hidden) { // Don't animate if the tab is not active
            this.foodSprite.setVisible(true);
            this.foodSprite.play('consume_burger');
        }
    }

    giveWeed() {
        this.modifiers.weed.setVisible(true);
        setTimeout(() => {
            this.modifiers.weed.setVisible(false);
        }, 15000);
    }
}

