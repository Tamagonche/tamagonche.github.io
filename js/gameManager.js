import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { GameScene } from './gameScene.js';
import { Pet } from './pet.js';
import { Trash } from './trash.js';
import { ACTIONS_COUNT, COMMANDS, COMMANDS_MAP, STATS } from './consts.js';

export class GameManager {
    constructor() {
        this.sb = createClient(
            'https://toflnsmrnnpfkzjpfuuu.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvZmxuc21ybm5wZmt6anBmdXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NDUzNzQsImV4cCI6MjA1NzMyMTM3NH0.xaJngrx5KnnhuuhtMC6adJUFrkTFRvxy5srwlK0FbVs'
        );
        this.scene = null;
        this.pets = {};
        this.trash = {};
        this.petHistoryChart = null;
        this.dailyActionsChart = null;
        this.startGame();
        this.dailyActions = [];
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

        await Promise.all([
            this.updateTopUsers(),
            this.setupDailyActions(),
            this.setupPetHistory(),
            this.setupActionsByUser(),
        ]);
        window.addEventListener('resize', () => {
            this.resizeCharts();
        });

        document.getElementById("loading").style.display = "none";
        document.getElementById("game").style.display = "grid";
    }

    setupListeners() {
        this.sb.channel('prod')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pets' }, p => {
                const pet = this.pets[p.new.id.toString()];
                if (pet) {
                    const statUpdated = pet.updateData(p.new);
                    if (statUpdated) {
                        this.setupPetHistory();
                    }
                }
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'actions' }, a => {
                this.addAction(a.new);

                if (a.new.useful) {
                    this.updateTopUsers();
                }

                this.setupDailyActions();
                this.setupActionsByUser();

                if (a.new.type === 'feed') this.pets[a.new.pet_id.toString()].feed();
                if (a.new.type === 'weed') this.pets[a.new.pet_id.toString()].giveWeed();
                if (a.new.type === 'fap') this.pets[a.new.pet_id.toString()].fap();
                if (a.new.type === 'punch') this.pets[a.new.pet_id.toString()].punch();
                if (a.new.type === 'sweat') this.pets[a.new.pet_id.toString()].sweat();
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

            const command = COMMANDS.find(cmd => cmd.id === user.type);
            if (!command) continue;
            left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-${command.icon}"></i></div>`;

            div.append(left);
            div.append(right);
            document.getElementById('top-users').append(div);
        }
    }
    resizeCharts() {
        try {
            this.petHistoryChart.setSize(1, 1, false);
            this.dailyActionsChart.setSize(1, 1, false);
            const a = document.getElementById("daily-actions-container");
            this.petHistoryChart.setSize(a.offsetWidth, 200, false);
            const b = document.getElementById("pet-history-container");
            this.dailyActionsChart.setSize(b.offsetWidth, 300, false);
        } catch (e) {}
    }
    async setupPetHistory() {
        const { data: petsHistoryData } = await this.sb.from('pets_history').select();
        let lastX = null;
        const dataByPet = petsHistoryData.reduce((acc, h) => {
            if (!acc[h.pet_id.toString()]) {
                acc[h.pet_id.toString()] = {};
            }
            if (!acc[h.pet_id.toString()][h.stat_type]) {
                acc[h.pet_id.toString()][h.stat_type] = [];
            }

            if (new Date(h.created_at) > new Date(lastX)) {
                lastX = h.created_at
            }

            acc[h.pet_id.toString()][h.stat_type].push([h.created_at, h.stat_value]);
            return acc;
        }, {});
        const series = Object.entries(dataByPet["1"]).map(([stat, serie]) => {
            if (!STATS[stat]) return null;
            return {
                name: STATS[stat],
                data: (() => {
                    const lastPoint = serie[serie.length - 1];
                    const extendedPoint = [lastX, lastPoint[1]];
                    return [...serie, extendedPoint];
                })(),
            }
        }).filter(x => x);

        this.petHistoryChart = Highcharts.chart('pet-history-container', {
            chart: {
                animation: false,
                backgroundColor: null,
                marginTop: 0,
                height: 200,
                reflow: false,
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },

            xAxis: {
                visible: false,
                type: 'datetime',
                labels: {
                    rotation: 45,
                    style: {
                        fontSize: '10px'
                    }
                },
                tickInterval: 24 * 3600 * 1000,
            },
            yAxis: {
                visible: false,
                maxPadding: 0.02,
                startOnTick: false,
                endOnTick: false,
            },

            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    step: 'left',
                    lineWidth: 2,

                    dataLabels: {
                        enabled: false
                    },
                }
            },

            series,

            tooltip: {
                xDateFormat: '%d/%m/%Y',
            },
        });
    }
    async setupDailyActions() {
        const { data: data } = await this.sb.from('daily_action_count').select();

        this.dailyActions = data;
        const groupedByUser = {}
        const commands = COMMANDS.reduce((acc, cmd) => ({...acc, [cmd.id]: cmd.cmd}), {});

        data.forEach(row => {
            const cmd = commands[row.type];
            if (!groupedByUser[cmd]) groupedByUser[cmd] = []
            groupedByUser[cmd].push([new Date(row.action_day).getTime(), row.action_count])
        })

        const series = Object.entries(groupedByUser).map(([type, values]) => ({
            name: type,
            data: values,
        }));

        this.dailyActionsChart = Highcharts.chart('daily-actions-container', {
            chart: {
                type: 'column',
                animation: false,
                backgroundColor: null,
                marginTop: 0,
                height: 300,
                reflow: false,
            },
            title: {
                text: null
            },
            subtitle: {
                text: null
            },

            xAxis: {
                visible: false,
                type: 'datetime',
                labels: {
                    rotation: 45,
                    style: {
                        fontSize: '10px'
                    }
                },
                tickInterval: 24 * 3600 * 1000,
            },
            yAxis: {
                visible: false,
                maxPadding: 0,
            },

            legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
            },

            plotOptions: {
                series: {
                    label: {
                        connectorAllowed: false
                    },
                    stacking: 'normal',
                    pointPadding: 0,
                    borderWidth: 0,

                    dataLabels: {
                        enabled: false
                    },
                }
            },

            series,

            tooltip: {
                xDateFormat: '%d/%m/%Y',
            },
        });
    }

    async setupActionsByUser() {
        const { data: data } = await this.sb.from('actions_by_user').select();
        const usernameToRow = {};
        const rows = [];
        data.forEach((row) => {
            let i = rows.length;
            if (usernameToRow[row.username] !== undefined) {
                i = usernameToRow[row.username];
            } else {
                usernameToRow[row.username] = i;
                rows.push({username: row.username, actions: {}})
            }

            if (!COMMANDS_MAP[row.type]) return;
            rows[i].actions[row.type] = { total: row.total, useful: row.useful };
        });

        const table = document.createElement("table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        const headers = ["", ...COMMANDS.map(cmd => cmd.id)];
        headers.forEach(key => {
            const th = document.createElement("th");
            if (COMMANDS_MAP[key]) {
                const i = document.createElement("i");
                i.className = "fa-solid fa-"+COMMANDS_MAP[key].icon
                th.append(i);
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        rows.forEach(item => {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            td.textContent = item.username;
            row.appendChild(td);

            COMMANDS.forEach(cmd => {
                let value = "";
                if (!item.actions[cmd.id]) value = "0"
                else value = item.actions[cmd.id].total + "/" + item.actions[cmd.id].useful;

                const td = document.createElement("td");
                td.textContent = value;
                row.appendChild(td);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        document.getElementById("users-table-container").innerHTML = "";
        document.getElementById("users-table-container").append(table);
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
        const command = COMMANDS.find(cmd => cmd.id === action.type);
        if (!command) return;
        left.innerHTML = `<div class="action-icon"><i class="fa-solid fa-${command.icon}"></i></div>`;
        content.innerHTML = command.actionContentFn(action);
        right.appendChild(time);
        right.appendChild(content);
        div.appendChild(left);
        div.appendChild(right);
        document.getElementById('actions').prepend(div);

        const children = Array.from(document.getElementById('actions').children);
        children.slice(ACTIONS_COUNT).forEach(child => child.remove());
    }
}

