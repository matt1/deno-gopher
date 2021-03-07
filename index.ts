import {GopherClient, GopherProtocol, MenuItem} from './mod.ts';

const client = new GopherClient({
  protocolVersion: GopherProtocol.GopherPlus,
  useTls: false,
});

try {
  const menu = await client.downloadMenu({
    hostname: 'gopher.quux.org',
  });

  let lastItem:MenuItem;
  for (const menuItem of menu.items) {
    console.log(menuItem.toString());
    lastItem = menuItem;
  }
  
  await client.populateAttributes(lastItem!);
  console.log(lastItem!);

} catch (error) {
  console.error(`Unexpected error downloading from Gopher server! ${error}`);
}
