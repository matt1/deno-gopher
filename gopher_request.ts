import {GopherProtocol} from './gopher_common.ts';

/** Options for TLS support for this request. */
export enum TlsSupport {
  /** Do not attempt to use TLS at all. */
  DoNotUseTls,
  /** Attempt to use TLS, but fallback to non-TLS connction if TLS fails. */
  PreferTls,
  /** Attempt to use TLS, and no not attempt non-TLS connection. */
  OnlyTls
}

/** Request made to a Gopher server. */
export class GopherRequest {
  /** The hostname (could be a plain IP address) to use. */
  hostname!:string;
  
  /** Port number used for the TCP connection, typically 70. */
  port?: number;
  
  /** Selectors should container a leading slash, e.g. `/foo`. */
  selector?: string;

  /** The Gopher protocol to use for this request. */
  protocol?:GopherProtocol;

  /** Query to use if sending a request to a search server (type 7). */
  query?:string;

  /** TLS Option to use for this request. */
  tls?:TlsSupport = TlsSupport.DoNotUseTls;
}
