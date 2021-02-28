import {CRLF} from './gopher_common.ts';
import {GopherItem} from './gopher_item.ts';
import {ItemType} from './gopher_types.ts';

/** Represents a Gopher top-level menu. */
export class Menu extends GopherItem {
  /** The items within this menu. */
  Items: MenuItem[] = Array<MenuItem>();

  /** Generates a Gopher menu from the raw string returned from the server. */
  constructor(menuString: string) {
    super();
    const lines = menuString.split(CRLF);
    for (const line of lines) {
      if (!line) continue;
      this.Items.push(new MenuItem(line));
    }
  }
}

/** Represents a single entry in a Gopher menu. */
export class MenuItem extends GopherItem {

  constructor(menuItemString: string) {
    super();
    this.Original = menuItemString;
    this.Type = menuItemString.substring(0, 1) as ItemType;
    const parts = menuItemString.substring(1).split('\t');
    this.Name = parts[0];
    this.Selector = parts[1];
    this.Hostname = parts[2];
    this.Port = Number(parts[3]);
  }

  toString(): string {
    if (this.Selector === 'fake' || this.Port === 0 || this.Hostname === '(NULL)') {
      return `${this.Type} ${this.Name}`;
    }
    return `${this.Type} ${this.Name} gopher://${this.Hostname}:${this.Port}${this.Selector}`;
  }
}