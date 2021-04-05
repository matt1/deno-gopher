import {serve, Server, ServerRequest} from "https://deno.land/std/http/server.ts";
import {GopherClient} from "./gopher_client.ts";
import {GopherProtocol} from "./gopher_common.ts";
import {GopherRequest} from "./gopher_request.ts";
import {URI_REGEX} from "./gopher_utils.ts";

const GOPHER_CONTENT_TYPE = 'application/gopher';

const URL_PARAM_REGEX = /^\/gopher-proxy\?url=(.+)$/;

/** A simple Gopher-over-HTTPs proxy. */
export class GopherProxy {

  readonly server: Server;
  readonly gopherClient: GopherClient;

  constructor() {
    this.server = serve({
      port: 8080,
    });

    this.gopherClient = new GopherClient({
      protocolVersion: GopherProtocol.RFC1436,
    });
  }

  async serve() {
    console.log(`Starting server.`);

    while (true) {
      try {
        for await (const request of this.server) {
          const accept = request.headers.get('Accept');
          
          if (!accept || accept !== GOPHER_CONTENT_TYPE) {
            request.respond({
              status: 400,
              body: `400 Bad Request: unsupported Accept header value: '${accept}' - all requests should only Accept: ${GOPHER_CONTENT_TYPE}`
            });
            return;
          }
          console.log(request.url);

          if (!request.url.startsWith('/gopher-proxy')) {
            request.respond({
              status: 400,
              body: `400 Bad Request: proxy requests only served by '/gopher-proxy' URL.`
            });
          } else {
            switch (request.method) {
              case "POST":
                
                break;
              case "GET":
                if (!URL_PARAM_REGEX.test(request.url)) {
                  request.respond({
                    status: 400,
                    body: `400 Bad Request: invalid request. Should be '/gopher-proxy?url=<URI-encoded gopher URI>'.`,
                  });
                } else {
                  this.handleRequest(request);
                }
                break;
              default:
                request.respond({
                  status: 400,
                  body: `400 Bad Request: unsupported method '${request.method}'`
                });
            }
          }
          request.finalize();
        }
      } catch (error) {
        console.warn(error);
      }
    }
  }

  private async handleRequest(request:ServerRequest) {
    const headers = new Headers();
    let gopherUri = '';

    let matches = request.url.match(URL_PARAM_REGEX);
    try {
      if(matches && matches[1]) {
        gopherUri = decodeURIComponent(matches[1]);
      } else {
        request.respond({
          status: 400,
          body: `400 Bad Request: unable to parse request '${request.url}'.`
        });
        return;
      }
    } catch (error) {
      request.respond({
        status: 400,
        body: `400 Bad Request: malformed URL encoding.`
      });
      return;
    }

    matches = gopherUri.match(URI_REGEX);
    if (!matches) {
      request.respond({
        status: 400,
        body: `400 Bad Request: unable to parse gopher URI '${gopherUri}'.`
      });
      return;
    }
    
    const gopherRequest = new GopherRequest();
    gopherRequest.hostname = matches[2];
    gopherRequest.port = parseInt(matches[3]);
    gopherRequest.selector = matches[4];

    const gopherData = await this.gopherClient.downloadItem(gopherRequest);

    headers.set('Content-Type', GOPHER_CONTENT_TYPE);
    headers.set('Via', `Gopher/RFC1436 ${gopherRequest.hostname}`)
    headers.append("access-control-allow-origin", "*");
    headers.append(
      "access-control-allow-headers",
      "Origin, X-Requested-With, Content-Type, Accept, Range",
    );

    request.respond({
      status: 200,
      headers,
      body:gopherData.body,
    });
  }

}