/** The type of the Gopher protocol. */
export enum GopherProtocol {
  /** Standard/Original RFC1436 Gopher protocol. */
  RFC1436,
  /** Gopher+ protocol. */
  GopherPlus,
}

/** Options used when requesting a selector from a Gopher server. */
export interface GopherRequestOptions {
  /** The hostname (could be a plain IP address) to use. */
  Hostname:string;
  /** Port number used for the TCP connection, typically 70. */
  Port?: number;
  /** Selectors should container a leading slash, e.g. `/foo` */
  Selector?: string;
  /** The Gopher protocol to use for this request. */
  Protocol?:GopherProtocol;
}

/** Options used when creating a new Gopher client. */
export interface GopherClientOptions {
  /** Version of the protocol to use. */
  ProtocolVersion: GopherProtocol,
}

/** Handler for RFC1436 Gopher. */
export class GopherHandler {

  constructor(private readonly options?:GopherClientOptions){};

  parseMenuBytes( buffer:Uint8Array): Menu {
    const menu = new TextDecoder().decode(buffer);
    return new Menu(menu.trim());
  }

  /** Generates a selector string to be sent to the server. */
  generateQueryString(selector:string|undefined):string {
    return `${selector || ''}\r\n`;
  }
}

/** Handler for Gopher+. */
export class GopherPlusHandler extends GopherHandler {
  parseMenuBytes(buffer:Uint8Array): Menu {
    const menu = new TextDecoder().decode(buffer);

    // http://gopherinfo.somnolescent.net/documentation/gopherplus.html#2.3
    const linefeed = menu.indexOf('\r\n');
    const header = menu.substring(0, linefeed);
    let body = menu.substring(linefeed);
    if (header === '+-1') {
      // Ends with fullstop on a single line.  Find last line and remove it.
      const footerSeparator = body.indexOf('\r\n.\r\n');
      body = menu.substring(linefeed, footerSeparator);
    } else if (header === '+-2') {
      // Ends when connection closed - no-op.
    } else {
      // Size specified in header and closes when connection closes - no-op.
    }
    return new Menu(body.trim());
  }

  generateQueryString(selector:string|undefined):string {
    return `${selector || ''}\t+\r\n`;
  }

  generateAttributeQueryString(selector:string|undefined):string {
    return `${selector || ''}\t!\r\n`;
  }
}

/** A client for interacting with Gopher servers. */
export class GopherClient {
  /** The version of the Gopher protocol this client will use. */
  protocolVersion:GopherProtocol;

  /**
   * The handler for the protocol - understands how to turn raw bytes into
   * parsed responses etc.
   */
  handler!:GopherHandler;

  /** 
   * The amount of data we read at once. 2048 is picked out of the air, but seems
   * to work well enough.
   */
  private readonly BUFFER_SIZE = 2048;

  constructor(options?:GopherClientOptions){
    this.protocolVersion = options?.ProtocolVersion || GopherProtocol.RFC1436;

    if (this.protocolVersion === GopherProtocol.RFC1436) {
      this.handler = new GopherHandler(options);
    } else if (this.protocolVersion === GopherProtocol.GopherPlus) {
      this.handler = new GopherPlusHandler(options);
    }
  }

  /** Make a request to a Gopher server to download a menu. */
  async downloadMenu(options:GopherRequestOptions): Promise<Menu> {
    const buffer = await this.downloadBytes(options, this.handler.generateQueryString(options.Selector));
    return this.handler.parseMenuBytes(buffer);
  }

  /** Make a request to the Gopher server to download an item. */
  async downloadItem(menuItem:MenuItem): Promise<Uint8Array | Menu> {
    const options = {
      Hostname: menuItem.Hostname,
      Port: menuItem.Port,
      Selector: menuItem.Selector,
    };
    if (menuItem.Type === "1") return await this.downloadMenu(options);
    return await this.downloadBytes(options, this.handler.generateQueryString(options.Selector));
  }

  /** Get the Gopher+ attributes for a menu item. */
  // TODO: refactor this into both handlers.
  async populateAttributes(menuItem:MenuItem) {
    const options = {
      Hostname: menuItem.Hostname,
      Port: menuItem.Port,
      Selector: menuItem.Selector,
    };
    if (this.protocolVersion !== GopherProtocol.GopherPlus) {
      throw new Error('Attributes are only supported by Gopher+, but client is not using that protocol.');
    }

    const query = (this.handler as GopherPlusHandler).generateAttributeQueryString(menuItem.Selector);
    const attributesBytes = await this.downloadBytes(options, query);
    const attributes = new TextDecoder().decode(attributesBytes);
    menuItem.parseAttributes(attributes);
  }

  /** Concatenate two UInt8Arrays. */
  private concatenateUint8Arrays(a:Uint8Array, b:Uint8Array):Uint8Array {
    const result = new Uint8Array(a.length + b.length);
    result.set(a, 0);
    result.set(b, a.length);
    return result;
  }

  /** 
   * Download bytes from a Gopher server. Makes no assumptions on type - ideal
   * for downloading text files or images etc.
   */
  private async downloadBytes(options:GopherRequestOptions, query:string): Promise<Uint8Array> {
    const connection = await Deno.connect({
      hostname: options.Hostname,
      port: options.Port || 70,
      transport: "tcp"
    });
    await connection.write(new TextEncoder().encode(query));
    let result:Uint8Array = new Uint8Array(0);
    let buf = new Uint8Array(this.BUFFER_SIZE);
    let bytesRead: number | null = 0;
    do {
      bytesRead = await connection.read(buf);
      result = this.concatenateUint8Arrays(result, buf.slice(0, bytesRead!));
      buf = new Uint8Array(this.BUFFER_SIZE);
    } while (bytesRead && bytesRead > 0);
    connection.close();
    return result;
  }
}

/** Represents a Gopher menu. */
export class Menu {
  Items: MenuItem[] = Array<MenuItem>();

  /** Generates a Gopher menu from the raw string returned from the server. */
  constructor(menuString: string) {
    const lines = menuString.split("\r\n");
    for (const line of lines) {
      this.Items.push(new MenuItem(line));
    }
  }
}

export abstract class GopherItem {
  Type: ItemType = "?";
  Name: string = "";
  Selector: string = "fake";
  Hostname: string = "";
  Port: number = 0;
  Original: string = "";

  /** Gopher+ Attribute map for this item. May not be populated. */
  Attributes: Map<string, Map<string, string>> = new Map<string,Map<string,string>>();

  /** Parses a string and converts it to attributes. */
  parseAttributes(rawAttributes:string) {
    // Spec does not say if attributes should be CRLF or just LF?
    let lines = rawAttributes.split(`\n`);
    // Shift off the first line (the Gopher+ status) since we don't care.
    lines.shift();
    if (!lines) return;
    let lastAttribute = '';
    for (const line of lines) {
      if (line.startsWith('+')) {
        const attributeName = line.substring(1,line.indexOf(':'));
        // Forget about info since it is just a repeat of the selector.
        if (attributeName === 'INFO') continue;
        this.Attributes.set(attributeName, new Map<string, string>());
        lastAttribute = attributeName;
      } else {
        if (!lastAttribute) continue;
        const separator = line.indexOf(':');
        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 1).trim();
        if (!key || !value) continue;
        this.Attributes.get(lastAttribute!)!.set(key, value);
      }
    }
    
  }
}

export type ItemType = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
  | "+"| "g" | "I" | "T" | "d" | "h" | "i" | "s" | "?";

/** Represents a single entry in a Gopher menu. */
export class MenuItem extends GopherItem {

  constructor(menuItemString: string) {
    super();
    this.Original = menuItemString;
    this.Type = menuItemString.substring(0, 1) as ItemType;
    const parts = menuItemString.substring(1).split("\t");
    this.Name = parts[0];
    this.Selector = parts[1];
    this.Hostname = parts[2];
    this.Port = Number(parts[3]);
  }

  toString(): string {
    if (this.Selector === "fake" || this.Port === 0 || this.Hostname === "(NULL)") {
      return `${this.Type} ${this.Name}`;
    }
    return `${this.Type} ${this.Name} gopher://${this.Hostname}:${this.Port}${this.Selector}`;
  }
}
