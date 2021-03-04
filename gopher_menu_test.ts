import {assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import {Menu, MenuItem} from './gopher_menu.ts';

Deno.test('Menu parses well-formed menu', () => {
  const menuStr = '1A Menu	/A/Menu	gopher.example.com	70\r\n' +
                  '0A-Text_File!	/A Text File.txt	gopher.example.com	70	+\r\n' +
                  'IAn image	/image.gif	gopher.example.com	70\r\n' +
                  'iInformation	fake	(NULL)	0\r\n' +
                  'i	fake	(NULL)	0\r\n';
  const menu = new Menu(menuStr);

  assertEquals(menu.Items.length, 5);
  assertEquals(menu.Items[0].type, '1');
  assertEquals(menu.Items[0].name, 'A Menu');
  assertEquals(menu.Items[0].selector, '/A/Menu');
  assertEquals(menu.Items[0].hostname, 'gopher.example.com');
  assertEquals(menu.Items[0].port, 70);

  assertEquals(menu.Items[1].type, '0');
  assertEquals(menu.Items[1].name, 'A-Text_File!');
  assertEquals(menu.Items[1].selector, '/A Text File.txt');
  assertEquals(menu.Items[1].hostname, 'gopher.example.com');
  assertEquals(menu.Items[1].port, 70);

  assertEquals(menu.Items[2].type, 'I');
  assertEquals(menu.Items[2].name, 'An image');
  assertEquals(menu.Items[2].selector, '/image.gif');
  assertEquals(menu.Items[2].hostname, 'gopher.example.com');
  assertEquals(menu.Items[2].port, 70);

  assertEquals(menu.Items[3].type, 'i');
  assertEquals(menu.Items[3].name, 'Information');
  assertEquals(menu.Items[3].selector, 'fake');
  assertEquals(menu.Items[3].hostname, '(NULL)');
  assertEquals(menu.Items[3].port, 0);

  assertEquals(menu.Items[4].type, 'i');
  assertEquals(menu.Items[4].name, '');
  assertEquals(menu.Items[4].selector, 'fake');
  assertEquals(menu.Items[4].hostname, '(NULL)');
  assertEquals(menu.Items[4].port, 0);
});

Deno.test('MenuItem parses well-formed menu item', () => {
  const line = '1Home	/home	gopher.example.com	70';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.type, '1');
  assertEquals(menuItem.name, 'Home');
  assertEquals(menuItem.selector, '/home');
  assertEquals(menuItem.hostname, 'gopher.example.com');
  assertEquals(menuItem.port, 70);
});

Deno.test('MenuItem parses well-formed Gopher+ menu item', () => {
  const line = '1Home	/home	gopher.example.com	70	+';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.type, '1');
  assertEquals(menuItem.name, 'Home');
  assertEquals(menuItem.selector, '/home');
  assertEquals(menuItem.hostname, 'gopher.example.com');
  assertEquals(menuItem.port, 70);
});

Deno.test('MenuItem parses selectors with spaces', () => {
  const line = '0One Two	/One Two.txt	gopher.example.com	70	+';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.type, '0');
  assertEquals(menuItem.name, 'One Two');
  assertEquals(menuItem.selector, '/One Two.txt');
  assertEquals(menuItem.hostname, 'gopher.example.com');
  assertEquals(menuItem.port, 70);
});

Deno.test('MenuItem parses informational menu item', () => {
  const line = 'iThis is info	fake	(NULL)	0';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.type, 'i');
  assertEquals(menuItem.name, 'This is info');
  assertEquals(menuItem.selector, 'fake');
  assertEquals(menuItem.hostname, '(NULL)');
  assertEquals(menuItem.port, 0);
});

Deno.test('MenuItem parses empty informational menu item', () => {
  const line = 'i	fake	(NULL)	0';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.type, 'i');
  assertEquals(menuItem.name, '');
  assertEquals(menuItem.selector, 'fake');
  assertEquals(menuItem.hostname, '(NULL)');
  assertEquals(menuItem.port, 0);
});
