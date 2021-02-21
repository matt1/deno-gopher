import {GopherClient, GopherProtocol} from './gopher.ts';

const client = new GopherClient({
  ProtocolVersion: GopherProtocol.RFC1436,
});
const menu = await client.downloadMenu({
  Hostname: 'gopher.quux.org',
});

const toDownload = [];
for (const menuItem of menu.Items) {
  console.log(menuItem.toString());
  if (menuItem.Type === "0") {
    toDownload.push(menuItem);
  }
}
