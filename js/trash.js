import { PET_POS_Y } from './consts.js';

export class Trash {
    constructor(data) {
        Object.assign(this, data);
        this.sprite = null;
    }

    addToScene(scene) {
        this.sprite = scene.add.sprite(0, 0, this.type).setScale(2).setOrigin(0.5, 1);
        this.sprite.setPosition(this.getX(), PET_POS_Y+46);
        this.sprite.setFlipX(this.flip_x);
        scene.trashLayer.add(this.sprite);
    }

    getX(margin=60) {
        return (this.sprite.scene.game.config.width-margin) * this.pos_x + margin/2;
    }
}
