
const BUFFER_SIZE = 1024;

/** Concatenate two UInt8Arrays. */
function concatenateUint8Arrays(a:Uint8Array, b:Uint8Array):Uint8Array {
  const result = new Uint8Array(a.length + b.length);
  result.set(a, 0);
  result.set(b, a.length);
  return result;
}

/** 
 * Download bytes from a Gopher server. Makes no assumptions on type - ideal
 * for downloading text files or images etc.
 */
async function downloadBytes(options:GopherRequestOptions): Promise<Uint8Array> {
  const connection = await Deno.connect({
    hostname: options.Hostname,
    port: options.Port || 70,
    transport: "tcp"
  });
  await connection.write(new TextEncoder().encode(`${options.Selector || ''}\r\n`));
  let result:Uint8Array = new Uint8Array(0);
  let buf = new Uint8Array(BUFFER_SIZE);
  let bytesRead: number | null = 0;
  do {
    bytesRead = await connection.read(buf);
    result = concatenateUint8Arrays(result, buf.slice(0, bytesRead!));
    buf = new Uint8Array(BUFFER_SIZE);
  } while (bytesRead && bytesRead > 0);
  connection.close();
  return result;
}

/** Download a Gopher menu. */
async function downloadMenu(options:GopherRequestOptions): Promise<Menu> {
  const buffer = await downloadBytes(options);
  const menu = new TextDecoder().decode(buffer);
  return new Menu(menu.trim());
}

/** Options used when requesting a selector from a Gopher server. */
export interface GopherRequestOptions {
  Hostname:string;
  /** Port number used for the TCP connection, typically 70. */
  Port?: number;
  /** Selectors should container a leading slash, e.g. `/foo` */
  Selector?: string;
}

export class GopherClient {
  /** Make a request to a Gopher server to download a menu. */
  async DownloadMenu(options:GopherRequestOptions): Promise<Menu> {
    return await downloadMenu(options);
  }

  /** Make a request to the Gopher server to download an item. */
  async DownloadItem(menuItem:MenuItem): Promise<Uint8Array | Menu> {
    const options = {
      Hostname: menuItem.Hostname,
      Port: menuItem.Port,
      Selector: menuItem.Selector,
    };
    if (menuItem.Type === "1") return await downloadMenu(options);
    return await downloadBytes(options);
  }
}

export abstract class GopherItem {
  Type: ItemType = "?";
  Name: string = "";
  Selector: string = "fake";
  Hostname: string = "";
  Port: number = 0;
  Original: string = "";
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
