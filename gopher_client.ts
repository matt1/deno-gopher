import {GopherProtocol} from './gopher_common.ts';
import {GopherHandler, GopherPlusHandler} from './gopher_handler.ts';
import {Menu, MenuItem} from './gopher_menu.ts';
import {GopherResponse, GopherTimingInfo} from './gopher_response.ts';
import {GopherRequest} from './gopher_request.ts';

/** A client for interacting with Gopher servers. */
export class GopherClient {
  /** The version of the Gopher protocol this client will use. */
  readonly protocolVersion:GopherProtocol;

  /** 
   * Try to use TLS when connecting to servers - N.B. Deno does not yet allow
   * us to set the TLS ALPN property so this may not work until then, depending
   * on server support (GoT requires ALPN for example).
   * 
   * Defaults to false.
   */
  readonly tls?:boolean = false;

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
    this.protocolVersion = options?.protocolVersion || GopherProtocol.RFC1436;
    this.tls = options?.tls || false;

    if (this.protocolVersion === GopherProtocol.RFC1436) {
      this.handler = new GopherHandler(options);
    } else if (this.protocolVersion === GopherProtocol.GopherPlus) {
      this.handler = new GopherPlusHandler(options);
    }
  }

  /** Make a request to a Gopher server to download a menu. */
  async downloadMenu(request:GopherRequest): Promise<Menu> {
    const response = await this.downloadBytes(request, this.handler.generateSelectorString(request.selector));
    const menu =  this.handler.parseMenu(response);
    menu.hostname = request.hostname;
    menu.port = request.port || 70;
    menu.selector = request.selector || '';
    return menu;
  }

  /** Make a request to the Gopher server to download an item as raw bytes. */
  async downloadItem(request:GopherRequest): Promise<GopherResponse> {
    return await this.downloadBytes(request, this.handler.generateSelectorString(request.selector));
  }

  /** Make a search request to the Gopher server - returns a menu of results. */
  async search(request:GopherRequest): Promise<Menu> {
    if (!request.query) throw new Error('No query provided for search');
    const response = await this.downloadBytes(request, this.handler.generaeteQueryString(request.selector, request.query));
    const menu =  this.handler.parseMenu(response);
    menu.hostname = request.hostname;
    menu.port = request.port || 70;
    menu.selector = request.selector || '';
    return menu;
  }

  /** Get the Gopher+ attributes for the entire menu at once. */
  async populateMenuAttributes(menu:Menu) {
    // TODO: refactor this into handlers
    if (this.protocolVersion !== GopherProtocol.GopherPlus) {
      throw new Error('Attributes are only supported by Gopher+, but client is not using that protocol.');
    }
    const options = {
      hostname: menu.hostname,
      port: menu.port || 70,
      selector: menu.selector || '',
    };

    const query = (this.handler as GopherPlusHandler).generateMenuAttributeQueryString(menu.selector);
    const attributesBytes = await this.downloadBytes(options, query);
    const attributes = new TextDecoder().decode(attributesBytes.body);
    // TODO: this is a mess - we need to split the raw attributes by `+INFO` and
    // then match each attribute to a MenuItem in this Menu, and then have that
    // MenuItem parse its own string.
    const attributesPerFile = attributes.split('+INFO:');

    throw new Error('Not implemented');
  }

  /** Get the Gopher+ attributes for a menu item. */
  async populateAttributes(menuItem:MenuItem) {
    // TODO: refactor this into handlers.
    if (this.protocolVersion !== GopherProtocol.GopherPlus) {
      throw new Error('Attributes are only supported by Gopher+, but client is not using that protocol.');
    }
    const options = {
      hostname: menuItem.hostname,
      port: menuItem.port || 70,
      selector: menuItem.selector || '',
    };

    const query = (this.handler as GopherPlusHandler).generateAttributeQueryString(menuItem.selector);
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
    let connection;    
    let result:Uint8Array = new Uint8Array(0);
    let writeStartMillis:number;
    let readStartMillis!:number;
    let buffer = new Uint8Array(this.BUFFER_SIZE);
    let bytesRead: number | null = 0;
    const startMillis = Date.now();
    try {
      if (this.tls) {
        // TODO: handle scenario where we need to fail-over from TLS to plain
        // text.
        connection = await Deno.connectTls({
          hostname: options.hostname,
          port: options.port || 70,
        });
      } else {
        connection = await Deno.connect({
          hostname: options.hostname,
          port: options.port || 70,
          transport: 'tcp'
        });
      }
      writeStartMillis = Date.now();
      await connection.write(new TextEncoder().encode(query));
      do {
        bytesRead = await connection.read(buffer);
        if (!readStartMillis) readStartMillis = Date.now();
        result = this.concatenateUint8Arrays(result, buffer.slice(0, bytesRead!));
        buffer = new Uint8Array(this.BUFFER_SIZE);
      } while (bytesRead && bytesRead > 0);
     } catch (error) {
       throw error;
     } finally {
      if (connection) {
        connection.close();
      }
    }
    const readCompleteMillis = Date.now();
    return new GopherResponse(result, this.protocolVersion, new GopherTimingInfo(
      startMillis,
      writeStartMillis,
      readStartMillis,
      readCompleteMillis
    ), this.tls);
  }
}

/** Options used when creating a new Gopher client. */
export interface GopherClientOptions {
  /** Version of the protocol to use. */
  protocolVersion: GopherProtocol,
  /** Attempt to use TLS when connecting to servers. */
  tls?:boolean;
}
