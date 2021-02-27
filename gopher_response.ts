import {GopherProtocol} from './gopher.ts';

/** Represents a response from the Gopher server. */
export class GopherResponse {

    /** The Gopher+ header bytes. May be undefined. */
    header!:Uint8Array;
  
    /** Main body of the response. */
    body!:Uint8Array;
  
    constructor(readonly rawBytes:Uint8Array, readonly protocol:GopherProtocol) {
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