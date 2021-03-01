import {assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import {MenuItem} from './gopher_menu.ts';

const RAW_ATTRIBUTES_STRING =  `+-2
+INFO: 0whatsnew.txt	/whatsnew.txt	gopher.example.com 70	+
+ADMIN:
 Admin: Foo Bar <foobar@example.com>
 Mod-Date: Sun Feb 21 20:19:18 2021 <20210221201918>
+VIEWS:
 text/plain: <1k>
 text/html: <2k>`

Deno.test('GopherItem parses Gopher0 attributes', () => {
  const menuItem = new MenuItem('1Home	/home	gopher.example.com	70');
  menuItem.parseAttributes(RAW_ATTRIBUTES_STRING);

  assertEquals(menuItem.Attributes.get('INFO')!.Descriptor, '0whatsnew.txt	/whatsnew.txt	gopher.example.com 70	+');
  assertEquals(menuItem.Attributes.get('ADMIN')!.Lines.get('Admin'), 'Foo Bar <foobar@example.com>');
  assertEquals(menuItem.Attributes.get('ADMIN')!.Lines.get('Mod-Date'), 'Sun Feb 21 20:19:18 2021 <20210221201918>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.Lines.get('text/plain'), '<1k>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.Lines.get('text/html'), '<2k>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.RawLines, ` text/plain: <1k>\r\n text/html: <2k>\r\n`);
});

Deno.test('GopherItem parses Gopher+ attributes', () => {
  const menuItem = new MenuItem('1Home	/home	gopher.example.com	70');
  menuItem.parseAttributes(`+-2\r\n${RAW_ATTRIBUTES_STRING}`);

  assertEquals(menuItem.Attributes.get('INFO')!.Descriptor, '0whatsnew.txt	/whatsnew.txt	gopher.example.com 70	+');
  assertEquals(menuItem.Attributes.get('ADMIN')!.Lines.get('Admin'), 'Foo Bar <foobar@example.com>');
  assertEquals(menuItem.Attributes.get('ADMIN')!.Lines.get('Mod-Date'), 'Sun Feb 21 20:19:18 2021 <20210221201918>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.Lines.get('text/plain'), '<1k>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.Lines.get('text/html'), '<2k>');
  assertEquals(menuItem.Attributes.get('VIEWS')!.RawLines, ` text/plain: <1k>\r\n text/html: <2k>\r\n`);
});