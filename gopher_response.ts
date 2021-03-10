import {GopherProtocol} from './gopher_common.ts';

/** Contains timing information related to a Gopher response. */
export class GopherTimingInfo {
  /**
   * 
   * @param startMillis Timestamp when request started, before any connection has been attemted.
   * @param writeStartMillis Timestamp when write to socket started after successful connection.
   * @param readStartMillis Timestamp when read from socket started. 
   * @param readCompleteMillis Timestamp when read stopped.
   */
  constructor(readonly startMillis:number, readonly writeStartMillis:number,
    readonly readStartMillis:number, readonly readCompleteMillis:number){}

  /** Total duration of the request. */
  public get totalDurationMillis() : number {
    return this.readCompleteMillis - this.startMillis;
  }

  /** Total time spent waiting for connection */
  public get waitingDurationMillis() : number {
    return this.writeStartMillis - this.startMillis;
  }

  /** Total time spent waiting for first byte. */
  public get waitingForFirstByteDurationMillis() : number {
    return this.readStartMillis - this.writeStartMillis;
  }

  /** Total time spent recieving data. */
  public get recievingDuratrionMillis() : number {
    return this.readCompleteMillis - this.readStartMillis;
  }
}

/** Represents a response from the Gopher server. */
export class GopherResponse {
  /** The Gopher+ header bytes. May be zero-length (e.g. for Gopher0 responses). */
  header = new Uint8Array(0);

  /** Main body of the response. */
  body = new Uint8Array(0);

  /** Get total size of response in bytes. */
  public get responseSize(): number {
    return this.body.length + this.header.length;
  }

  /** Get total size of the body in bytes. */
  public get bodySize(): number {
    return this.body.length;
  }

  /** Get total size of the header in bytes. */
  public get headerSize(): number {
    return this.header.length;
  }

  /**
   * @param rawBytes Raw byte content of the response.
   * @param protocol Protocol used for the response.
   * @param timing GopherTimingInfo contain timing info about this response.
   * @param tls Flag to indicate if this response was via a TLS connection.
   */
  constructor(readonly rawBytes:Uint8Array, readonly protocol:GopherProtocol, readonly timing:GopherTimingInfo, readonly tls = false) {
    if (this.protocol === GopherProtocol.GopherPlus) {
      this.processGopherPlus(rawBytes);
    } else {
      this.body = rawBytes;
    }
  }

  /** 
   * Process the Gopher+ response.
   * 
   * The Gopher+ response contains a 'header' of sorts, that might be one of 4
   * potential formats:
   * 
   *    +5340<CRLF><data>
   *    +-1<CRLF><data><CRLF>.<CRLF>
   *    +-2<CRLF><data>
   *    --1<CRLF><data><CRLF>.<CRLF>
   * 
   * Where the header looks like:
   * 
   *  <status flag><status-code OR file size><CRLF>
   * 
   *  - <status flag> `+` means success
   *                  `-` means failure
   *  - <status-code> when success:
   *                    `-1` means data is terminated by <CRLF>.<CRLF>
   *                    `-2` means data just ends when the connection is closed
   *                  when failure:
   *                    `-1` Item not available
   *                    ... and potentially others ...
   *  - <size> is a positive integer that is the size of the response
   */
  private processGopherPlus(bytes:Uint8Array) {
    // Scan through bytes until we find the CRLF
    let headerEnd = -1;
    for (let i = 0; i < bytes.length-1; i++) {
      if (bytes[i] === /* \r */ 13 && bytes[i + 1] === /* \n */ 10) {
        headerEnd = i;
        break;
      }
    }

    // No header found, assume normal gopher response.
    if (headerEnd === -1) {
      console.warn('No Gopher+ header found');
      this.body = bytes;
      return;
    }

    // TODO: validate header

    this.header = bytes.slice(0, headerEnd);
    this.body = bytes.slice(headerEnd + 2);

    // +-1 is ASCII 43,45,49
    if (this.header[0] == 43 && this.header[1] == 45 && this.header[2] == 49) {
      // Data terminated by <CRLF>.<CRLF> so trim off the last 5 bytes
      this.body = this.body.slice(0, this.body.length - 5);
    }
  }
}
