import { CRLF, Menu } from "./gopher.ts";
import { GopherClientOptions } from "./gopher_client.ts";

/** Handler for RFC1436 Gopher. */
export class GopherHandler {

  constructor(private readonly options?:GopherClientOptions){};

  parseMenuBytes( buffer:Uint8Array): Menu {
    const menu = new TextDecoder().decode(buffer);
    return new Menu(menu.trim());
  }

  /** Generates a selector string to be sent to the server. */
  generateQueryString(selector:string|undefined):string {
    return `${selector || ''}${CRLF}`;
  }
}

/** Handler for Gopher+. */
export class GopherPlusHandler extends GopherHandler {
  parseMenuBytes(buffer:Uint8Array): Menu {
    const menu = new TextDecoder().decode(buffer);

    // http://gopherinfo.somnolescent.net/documentation/gopherplus.html#2.3
    const linefeed = menu.indexOf(CRLF);
    const header = menu.substring(0, linefeed);
    let body = menu.substring(linefeed);
    if (header === '+-1') {
      // Ends with fullstop on a single line.  Find last line and remove it.
      const footerSeparator = body.indexOf(`${CRLF}.${CRLF}`);
      body = menu.substring(linefeed, footerSeparator);
    } else if (header === '+-2') {
      // Ends when connection closed - no-op.
    } else {
      // Size specified in header and closes when connection closes - no-op.
    }
    return new Menu(body.trim());
  }

  generateQueryString(selector:string|undefined):string {
    return `${selector || ''}\t+${CRLF}`;
  }

  generateMenuAttributeQueryString(selector:string|undefined):string {
    return `${selector || ''}\t$${CRLF}`;
  }

  generateAttributeQueryString(selector:string|undefined):string {
    return `${selector || ''}\t!${CRLF}`;
  }
}
