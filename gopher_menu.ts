import {CRLF} from './gopher_common.ts';
import {GopherItem} from './gopher_item.ts';
import {ItemType} from './gopher_types.ts';

/** Represents a Gopher top-level menu. */
export class Menu extends GopherItem {
  /** The items within this menu. */
  items: MenuItem[] = Array<MenuItem>();

  /** Generates a Gopher menu from the raw string returned from the server. */
  constructor(menuString: string) {
    super();
    const lines = menuString.split(CRLF);
    for (const line of lines) {
      if (!line) continue;
      this.items.push(new MenuItem(line));
    }
  }
}

/** Represents a single entry in a Gopher menu. */
export class MenuItem extends GopherItem {

  constructor(menuItemString: string) {
    super();
    this.original = menuItemString;
    this.type = menuItemString.substring(0, 1) as ItemType;
    const parts = menuItemString.substring(1).split('\t');
    this.name = parts[0];
    this.selector = parts[1];
    this.hostname = parts[2];
    this.port = Number(parts[3]);
  }

  toString(): string {
    if (this.selector === 'fake' || this.port === 0 || this.hostname === '(NULL)') {
      return `${this.type} ${this.name}`;
    }
    return `${this.type} ${this.name} gopher://${this.hostname}:${this.port}${this.selector}`;
  }
}
