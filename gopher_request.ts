import {GopherProtocol} from './gopher_common.ts';

/** Request made to a Gopher server. */
export class GopherRequest {
  /** The hostname (could be a plain IP address) to use. */
  hostname!:string;
  /** Port number used for the TCP connection, typically 70. */
  port?: number;
  /** Selectors should container a leading slash, e.g. `/foo` */
  selector?: string;
  /** The Gopher protocol to use for this request. */
  protocol?:GopherProtocol;
}
