import { CRLF, Menu } from "./gopher.ts";
import { GopherClientOptions } from "./gopher_client.ts";
import { GopherResponse } from "./gopher_response.ts";

/** Handler for RFC1436 Gopher. */
export class GopherHandler {
  constructor(private readonly options?:GopherClientOptions){};

  parseMenu(response:GopherResponse): Menu {
    const menu = new TextDecoder().decode(response.body);
    return new Menu(menu.trim());
  }

  /** Generates a selector string to be sent to the server. */
  generateQueryString(selector:string|undefined):string {
    return `${selector || ''}${CRLF}`;
  }
}

/** Handler for Gopher+. */
export class GopherPlusHandler extends GopherHandler {
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
