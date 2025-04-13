export class NavbarItem {
  constructor(id, icon, redrawCharts = false) {
    this.id = id;
    this.icon = icon;
    this.el = null;
    this.redrawCharts = redrawCharts;
  }
}
export class Navbar {
  constructor(gameManager, items) {
    this.items = items;
    this.el = document.getElementById("navbar");
    this.gameManager = gameManager;
    for (let item of items) {
      const itemEl = document.createElement('div');
      itemEl.className = 'navbar-item';
      const itemIcon = document.createElement('i');
      itemIcon.className = `fa-solid fa-${item.icon}`;
      itemEl.append(itemIcon);
      itemEl.onclick = () => {
        this.onclick(item);
      };
      item.el = itemEl;
      let el = document.getElementById(item.id);
      el.className += " hide";
      this.el.append(itemEl);
    }

    this.onclick(this.items[0]);
  }

  onclick(clickedItem) {
    for (let item of this.items) {
      let el = document.getElementById(item.id);
      el.className = el.className
        .split(" ")
        .filter(c => c !== "hide")
        .join(" ");
      const display = item.id === clickedItem.id;
      el.className += display ? "" : " hide";

      item.el.className = item.el.className
        .split(" ")
        .filter(c => c !== "selected")
        .join(" ");
      item.el.className += display ? " selected" : ""
      if (display && item.redrawCharts) {
        this.gameManager.resizeCharts();
      }
    }
  }
}
