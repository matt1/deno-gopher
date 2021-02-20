import {GopherClient} from './gopher.ts';

const client = new GopherClient();
const menu = await client.DownloadMenu({
  Hostname: 'gopher.quux.org',
});

const toDownload = [];
for (const menuItem of menu.Items) {
  console.log(menuItem.toString());
  if (menuItem.Type === "0") {
    toDownload.push(menuItem);
  }
}
const decoder = new TextDecoder();
for (const menuItem of toDownload) {
  const bytes = await client.DownloadItem(menuItem) as Uint8Array;
  console.log(decoder.decode(bytes));
}
