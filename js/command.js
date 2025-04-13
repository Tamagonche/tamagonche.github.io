export class Command {
    constructor(id, icon, cmd, actionContentFn) {
        this.id = id;
        this.icon = icon;
        this.cmd = cmd;
        this.actionContentFn = actionContentFn;
    }
}

