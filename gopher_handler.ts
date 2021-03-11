import {CRLF} from './gopher_common.ts';
import {GopherClientOptions} from './gopher_client.ts';
import {GopherResponse} from './gopher_response.ts';
import {Menu} from './gopher_menu.ts';

/** Handler for RFC1436 Gopher. */
export class GopherHandler {
  constructor(private readonly options?:GopherClientOptions){};

  parseMenu(response:GopherResponse): Menu {
    const menu = new TextDecoder().decode(response.body);
    return new Menu(menu.trim());
  }

  /** Generates a selector string to be sent to the server. */
  generateSelectorString(selector:string|undefined):string {
    return `${selector || ''}${CRLF}`;
  }

  /** Generates a query string for use with a search server. */
  generaeteQueryString(selector:string|undefined, query:string):string {
    return `${selector || ''}\t${query}${CRLF}`
  }
}

/** Handler for Gopher+. */
export class GopherPlusHandler extends GopherHandler {
  generateSelectorString(selector:string|undefined):string {
    return `${selector || ''}\t+${CRLF}`;
  }

  generateMenuAttributeQueryString(selector:string|undefined):string {
    return `${selector || ''}\t$${CRLF}`;
  }

  generateAttributeQueryString(selector:string|undefined):string {
    return `${selector || ''}\t!${CRLF}`;
  }
}
