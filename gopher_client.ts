import { GopherProtocol, Menu, MenuItem } from "./gopher.ts";
import { GopherHandler, GopherPlusHandler } from "./gopher_handler.ts";
import { GopherResponse } from "./gopher_response.ts";
import {GopherRequest} from './gopher_request.ts';

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
  async downloadMenu(options:GopherRequest): Promise<Menu> {
    const response = await this.downloadBytes(options, this.handler.generateQueryString(options.Selector));
    return this.handler.parseMenu(response);
  }

  /** Make a request to the Gopher server to download an item as raw bytes. */
  async downloadItem(options:GopherRequest): Promise<GopherResponse> {
    // TODO: if this is Gopher+, the client probably only cares about the raw
    // bytes so strip out the Gopher+ header.
    return await this.downloadBytes(options, this.handler.generateQueryString(options.Selector));
  }

  /** Get the Gopher+ attributes for the entire menu at once. */
  async populateMenuAttributes(menu:Menu) {
    // TODO: refactor this into handlers
    if (this.protocolVersion !== GopherProtocol.GopherPlus) {
      throw new Error('Attributes are only supported by Gopher+, but client is not using that protocol.');
    }
    const options = {
      Hostname: menu.Hostname,
      Port: menu.Port,
      Selector: menu.Selector,
    };

    const query = (this.handler as GopherPlusHandler).generateMenuAttributeQueryString(menu.Selector);
    const attributesBytes = await this.downloadBytes(options, query);
    const attributes = new TextDecoder().decode(attributesBytes.body);
    throw new Error('Not implemented');
    // TODO: parse all attributes then assign to child menu items - menu.parseAttributes(attributes);
  }

  /** Get the Gopher+ attributes for a menu item. */
  async populateAttributes(menuItem:MenuItem) {
    // TODO: refactor this into handlers.
    if (this.protocolVersion !== GopherProtocol.GopherPlus) {
      throw new Error('Attributes are only supported by Gopher+, but client is not using that protocol.');
    }
    const options = {
      Hostname: menuItem.Hostname,
      Port: menuItem.Port,
      Selector: menuItem.Selector,
    };

    const query = (this.handler as GopherPlusHandler).generateAttributeQueryString(menuItem.Selector);
    const attributesBytes = await this.downloadBytes(options, query);
    const attributes = new TextDecoder().decode(attributesBytes.body);
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
  private async downloadBytes(options:GopherRequest, query:string): Promise<GopherResponse> {
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
    return new GopherResponse(result, this.protocolVersion);
  }
}

/** Options used when creating a new Gopher client. */
export interface GopherClientOptions {
  /** Version of the protocol to use. */
  ProtocolVersion: GopherProtocol,
}