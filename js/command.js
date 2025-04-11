export class Command {
    constructor(id, icon, actionContentFn) {
        this.id = id;
        this.icon = icon;
        this.actionContentFn = actionContentFn;
    }
}

