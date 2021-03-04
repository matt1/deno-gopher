import {assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import {GopherProtocol} from './gopher_common.ts';
import {GopherHandler} from './gopher_handler.ts';
import {GopherResponse} from './gopher_response.ts';

const GOPHER0_RESPONSE = new TextEncoder().encode(
  '1A Menu	/A/Menu	gopher.example.com	70\r\n' +
  '0A-Text_File!	/A Text File.txt	gopher.example.com	70	+\r\n');

const GOPHERP_RESPONSE = new TextEncoder().encode(
  '+-2\r\n' +
  '1A Menu	/A/Menu	gopher.example.com	70\r\n' +
  '0A-Text_File!	/A Text File.txt	gopher.example.com	70	+\r\n');

Deno.test('GopherHandler parses well-formed Gopher0 response', () => {
  const handler = new GopherHandler();
  const response = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.RFC1436);

  const menu = handler.parseMenu(response);
  assertEquals(menu.items.length, 2);
  assertEquals(menu.items[0].type, '1');
  assertEquals(menu.items[0].name, 'A Menu');
  assertEquals(menu.items[0].selector, '/A/Menu');
  assertEquals(menu.items[0].hostname, 'gopher.example.com');
  assertEquals(menu.items[0].port, 70);

  assertEquals(menu.items[1].type, '0');
  assertEquals(menu.items[1].name, 'A-Text_File!');
  assertEquals(menu.items[1].selector, '/A Text File.txt');
  assertEquals(menu.items[1].hostname, 'gopher.example.com');
  assertEquals(menu.items[1].port, 70);
});

Deno.test('GopherHandler parses well-formed Gopher+ response', () => {
  const handler = new GopherHandler();
  const response = new GopherResponse(GOPHERP_RESPONSE, GopherProtocol.GopherPlus);

  const menu = handler.parseMenu(response);
  assertEquals(menu.items.length, 2);
  assertEquals(menu.items[0].type, '1');
  assertEquals(menu.items[0].name, 'A Menu');
  assertEquals(menu.items[0].selector, '/A/Menu');
  assertEquals(menu.items[0].hostname, 'gopher.example.com');
  assertEquals(menu.items[0].port, 70);

  assertEquals(menu.items[1].type, '0');
  assertEquals(menu.items[1].name, 'A-Text_File!');
  assertEquals(menu.items[1].selector, '/A Text File.txt');
  assertEquals(menu.items[1].hostname, 'gopher.example.com');
  assertEquals(menu.items[1].port, 70);
});