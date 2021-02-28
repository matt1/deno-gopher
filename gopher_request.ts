import {GopherProtocol} from './gopher_common.ts';

/** Request made to a Gopher server. */
export class GopherRequest {
  /** The hostname (could be a plain IP address) to use. */
  Hostname!:string;
  /** Port number used for the TCP connection, typically 70. */
  Port?: number;
  /** Selectors should container a leading slash, e.g. `/foo` */
  Selector?: string;
  /** The Gopher protocol to use for this request. */
  Protocol?:GopherProtocol;
}
