/** Common CRLF (as per RFC etc) used in many places. */
export const CRLF = '\r\n';

/** The type of the Gopher protocol. */
export enum GopherProtocol {
  /** Standard/Original RFC1436 Gopher protocol. */
  RFC1436,
  /** Gopher+ protocol. */
  GopherPlus,
}
