import {GopherClient, GopherProtocol, MenuItem, TlsSupport} from './mod.ts';

const client = new GopherClient({
  protocolVersion: GopherProtocol.RFC1436,
});

try {
  const menuResponse = await client.downloadItem({
    hostname: 'bitreich.org',
    tls: TlsSupport.PreferTls,
  });

  const menu = client.handler.parseMenu(menuResponse);

  console.log(`Response used TLS? ${menuResponse.tls}`);

  let lastItem:MenuItem;
  for (const menuItem of menu.items) {
    console.log(menuItem.toString());
    lastItem = menuItem;
  }
  
  const response = await client.downloadItem(lastItem!);
  console.log(response!);
  console.log(`Request used TLS? ${response.tls}`);
  console.log(`Timing info for Gopher Request:
    Waiting for connection: ${response.timing.waitingDurationMillis}ms
    Waiting for first byte: ${response.timing.waitingForFirstByteDurationMillis}ms
    Receiving time:         ${response.timing.recievingDuratrionMillis}ms
    Total request duration: ${response.timing.totalDurationMillis}ms`);

} catch (error) {
  console.error(`Unexpected error downloading from Gopher server! ${error}`);
}
