import {GopherClient, GopherProtocol, MenuItem} from './gopher.ts';

const client = new GopherClient({
  ProtocolVersion: GopherProtocol.GopherPlus,
});
const menu = await client.downloadMenu({
  Hostname: 'gopher.quux.org',
});

let lastItem:MenuItem;
for (const menuItem of menu.Items) {
  console.log(menuItem.toString());
  lastItem = menuItem;
}

await client.downloadAttributes(lastItem!);