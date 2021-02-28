import { assertEquals } from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import { GopherProtocol } from './gopher.ts';
import { GopherHandler } from './gopher_handler.ts';
import { GopherResponse } from './gopher_response.ts';

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
  assertEquals(menu.Items.length, 2);
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
});

Deno.test('GopherHandler parses well-formed Gopher+ response', () => {
  const handler = new GopherHandler();
  const response = new GopherResponse(GOPHERP_RESPONSE, GopherProtocol.GopherPlus);

  const menu = handler.parseMenu(response);
  assertEquals(menu.Items.length, 2);
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
});