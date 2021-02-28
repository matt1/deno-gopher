import { ItemType, TYPE_UNKNOWN } from './gopher_types.ts';

/** Common CRLF (as per RFC etc) used in many places. */
export const CRLF = '\r\n';

/** The type of the Gopher protocol. */
export enum GopherProtocol {
  /** Standard/Original RFC1436 Gopher protocol. */
  RFC1436,
  /** Gopher+ protocol. */
  GopherPlus,
}

/** Contains all of the Gopher+ attributes for a GopherItem. */
export class ItemAttributes {
  /** The name of the block, e.g. `INFO`, `VIEWS` etc. No leading `+`. */
  Name: string = '';
  /** The attribute block dedscriptor - e.g. `+INFO: <descriptor goes here>`. */
  Descriptor!: string;
  /** 
   * The lines of the attribute block. This is typically treated as key values,
   * but may just be strings, so we have both the raw string block and a map
   * for convenience.
   */
  RawLines: string = '';
  Lines: Map<string, string> = new Map<string, string>();
}

/** Represents an item in a Gopher menu. */
export abstract class GopherItem {
  Type: ItemType = TYPE_UNKNOWN;
  Name: string = '';
  Selector: string = 'fake';
  Hostname: string = '';
  Port: number = 0;
  Original: string = '';

  /** Gopher+ Attribute map for this item. May not be populated. */
  Attributes: Map<string, ItemAttributes> = new Map<string, ItemAttributes>();

  /** Parses a string and converts it to attributes. */
  parseAttributes(rawAttributes:string) {
    // Spec does not say if attributes should be CRLF or just LF?
    let lines = rawAttributes.split(`\n`);
    // Shift off the first line (the Gopher+ status) since we don't care.
    lines.shift();
    if (!lines) return;
    let lastAttribute = '';
    for (const line of lines) {
      const separator = line.indexOf(':');
      if (line.startsWith('+')) {
        const attributeName = line.substring(1, separator);
        const descriptor = line.substring(separator + 1).trim();
        const attr = new ItemAttributes();
        attr.Name = attributeName;
        attr.Descriptor = descriptor;
        this.Attributes.set(attributeName, attr);
        lastAttribute = attributeName;
      } else {
        if (!lastAttribute) continue;
        this.Attributes.get(lastAttribute)!.RawLines += `${line}${CRLF}`;
        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 1).trim();
        if (!key || !value) continue;
        this.Attributes.get(lastAttribute)!.Lines.set(key, value);
      }
    }
  }
}

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
