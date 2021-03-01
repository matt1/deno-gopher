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
  assertEquals(menu.Items[0].Type, '1');
  assertEquals(menu.Items[0].Name, 'A Menu');
  assertEquals(menu.Items[0].Selector, '/A/Menu');
  assertEquals(menu.Items[0].Hostname, 'gopher.example.com');
  assertEquals(menu.Items[0].Port, 70);

  assertEquals(menu.Items[1].Type, '0');
  assertEquals(menu.Items[1].Name, 'A-Text_File!');
  assertEquals(menu.Items[1].Selector, '/A Text File.txt');
  assertEquals(menu.Items[1].Hostname, 'gopher.example.com');
  assertEquals(menu.Items[1].Port, 70);

  assertEquals(menu.Items[2].Type, 'I');
  assertEquals(menu.Items[2].Name, 'An image');
  assertEquals(menu.Items[2].Selector, '/image.gif');
  assertEquals(menu.Items[2].Hostname, 'gopher.example.com');
  assertEquals(menu.Items[2].Port, 70);

  assertEquals(menu.Items[3].Type, 'i');
  assertEquals(menu.Items[3].Name, 'Information');
  assertEquals(menu.Items[3].Selector, 'fake');
  assertEquals(menu.Items[3].Hostname, '(NULL)');
  assertEquals(menu.Items[3].Port, 0);

  assertEquals(menu.Items[4].Type, 'i');
  assertEquals(menu.Items[4].Name, '');
  assertEquals(menu.Items[4].Selector, 'fake');
  assertEquals(menu.Items[4].Hostname, '(NULL)');
  assertEquals(menu.Items[4].Port, 0);
});

Deno.test('MenuItem parses well-formed menu item', () => {
  const line = '1Home	/home	gopher.example.com	70';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, '1');
  assertEquals(menuItem.Name, 'Home');
  assertEquals(menuItem.Selector, '/home');
  assertEquals(menuItem.Hostname, 'gopher.example.com');
  assertEquals(menuItem.Port, 70);
});

Deno.test('MenuItem parses well-formed Gopher+ menu item', () => {
  const line = '1Home	/home	gopher.example.com	70	+';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, '1');
  assertEquals(menuItem.Name, 'Home');
  assertEquals(menuItem.Selector, '/home');
  assertEquals(menuItem.Hostname, 'gopher.example.com');
  assertEquals(menuItem.Port, 70);
});

Deno.test('MenuItem parses selectors with spaces', () => {
  const line = '0One Two	/One Two.txt	gopher.example.com	70	+';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, '0');
  assertEquals(menuItem.Name, 'One Two');
  assertEquals(menuItem.Selector, '/One Two.txt');
  assertEquals(menuItem.Hostname, 'gopher.example.com');
  assertEquals(menuItem.Port, 70);
});

Deno.test('MenuItem parses informational menu item', () => {
  const line = 'iThis is info	fake	(NULL)	0';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, 'i');
  assertEquals(menuItem.Name, 'This is info');
  assertEquals(menuItem.Selector, 'fake');
  assertEquals(menuItem.Hostname, '(NULL)');
  assertEquals(menuItem.Port, 0);
});

Deno.test('MenuItem parses empty informational menu item', () => {
  const line = 'i	fake	(NULL)	0';
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, 'i');
  assertEquals(menuItem.Name, '');
  assertEquals(menuItem.Selector, 'fake');
  assertEquals(menuItem.Hostname, '(NULL)');
  assertEquals(menuItem.Port, 0);
});
