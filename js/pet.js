import { updateFavicon } from './utils.js';
import { PET_SPEED, PET_POS_Y, FOOD_POS_Y } from './consts.js';

export class Pet {
    constructor(data) {
        Object.assign(this, data);
        this.sprite = null;
        this.foodSprite = null;
        this.container = null;
        this.hearts = [];
        this.smiles = [];
        this.drinks = [];
    }

    addToScene(scene) {
        this.container = scene.add.container(0, PET_POS_Y);
        scene.petLayer.add(this.container);

        this.sprite = scene.add.sprite(0, 0, this.sprite_type).setScale(2);
        this.container.add(this.sprite);

        this.modifiers = {
            weed: scene.add.sprite(0, 0, this.sprite_type+'_weed').setScale(2).setVisible(false),
            sweat: scene.add.sprite(0, 0, this.sprite_type+'_sweat').setScale(2).setVisible(false),
            fuck: scene.add.sprite(0, 0, this.sprite_type+'_fuck').setScale(2).setVisible(false),
            blood: scene.add.sprite(0, 0, this.sprite_type+'_blood').setScale(2).setVisible(false),
            zboub: scene.add.sprite(0, 0, this.sprite_type+'_zboub').setScale(2).setVisible(false),
        };
        this.container.add(this.modifiers.weed);
        this.container.add(this.modifiers.sweat);
        this.container.add(this.modifiers.fuck);
        this.container.add(this.modifiers.blood);
        this.container.add(this.modifiers.zboub);

        // Sync modifiers
        this.sprite.on('animationstart', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
            updateFavicon(this.createFavicon(scene));
        });
        this.sprite.on('animationupdate', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
            updateFavicon(this.createFavicon(scene));
        });
        this.sprite.on('animationend', (_, frame) => {
            for (let key in this.modifiers) {
                if (this.modifiers[key].visible) {
                    this.modifiers[key].setFrame(frame.textureFrame);
                }
            }
            updateFavicon(this.createFavicon(scene));
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
        this.updateDrinks();
    }

    updateHearts() {
        for (let sprite of this.hearts) {
            sprite.destroy();
        }
        this.hearts = []
        for (let i = 0; i < this.max_food; i++) {
            this.hearts.push(this.container.scene.add.sprite(this.container.scene.game.config.width/2-40*(this.max_food-1)/2+40*i, 48, this.food >= i+1 ? 'heart_red' : 'heart_grey').setScale(2));
        }
    }

    updateSmiles() {
        for (let sprite of this.smiles) {
            sprite.destroy();
        }
        this.smiles = [];
        for (let i = 0; i < this.max_happiness; i++) {
            this.smiles.push(this.container.scene.add.sprite(this.container.scene.game.config.width/2-40*(this.max_happiness-1)/2+40*i, 90, this.happiness >= i+1 ? 'smile' : 'smile_grey').setScale(2));
        }
    }

    updateDrinks() {
        for (let sprite of this.drinks) {
            sprite.destroy();
        }
        this.drinks = [];
        for (let i = 0; i < this.max_drink; i++) {
            this.drinks.push(this.container.scene.add.sprite(this.container.scene.game.config.width/2-40*(this.max_drink-1)/2+40*i, 132, this.drink >= i+1 ? 'drink' : 'drink_grey').setScale(2));
        }
    }

    getX() {
        let petWidth = this.sprite.displayWidth+12*this.sprite.scale;
        return Math.round((this.container.scene.game.config.width-petWidth/2)*this.pos_x+petWidth/4);
    }

    statusToAnim(status) {
        return this.sprite_type+'_'+(status || this.status);
    }

    updateData(newData) {
        const newStatus = this.status !== newData.status;
        const newFoodLevel = this.food !== newData.food;
        const newHappyLevel = this.happiness !== newData.happiness;
        const newDrinkLevel = this.drink !== newData.drink;
        const newPosX = this.pos_x !== newData.pos_x;
        const newFlipX = this.flip_x !== newData.flip_x;

        const oldX = this.getX();

        Object.assign(this, newData);

        let statUpdated = false;

        if (newStatus) {
            this.sprite.play(this.statusToAnim());
        }
        if (newFoodLevel) {
            this.updateHearts();
            statUpdated = true;
        }
        if (newHappyLevel) {
            this.updateSmiles();
            statUpdated = true;
        }
        if (newDrinkLevel) {
            this.updateDrinks();
            statUpdated = true;
        }
        if (newFlipX) {
            this.container.list.forEach(child => {
                child.setFlipX(this.flip_x);
            });
        }
        if (newPosX) {
            this.walk(oldX);
        }

        return statUpdated;
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

    createFavicon(scene) {
        const renderTexture = scene.make.renderTexture({
            width: this.sprite.width,
            height: this.sprite.height,
            add: false
        });

        renderTexture.draw(this.container, this.sprite.width / 2, 0);

        return renderTexture.texture.canvas.toDataURL('image/png');
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

    fap() {
        this.modifiers.zboub.setVisible(true);
        setTimeout(() => {
            this.modifiers.zboub.setVisible(false);
        }, 15000);
    }

    punch() {
        this.modifiers.blood.setVisible(true);
        setTimeout(() => {
            this.modifiers.blood.setVisible(false);
        }, 15000);
    }

    sweat() {
        this.modifiers.sweat.setVisible(true);
        setTimeout(() => {
            this.modifiers.sweat.setVisible(false);
        }, 15000);
    }

    fuck() {
        this.modifiers.fuck.setVisible(true);
        setTimeout(() => {
            this.modifiers.fuck.setVisible(false);
        }, 15000);
    }
}

