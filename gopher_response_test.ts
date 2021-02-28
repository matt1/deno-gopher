import {assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import {GopherProtocol} from './gopher_common.ts';
import {GopherResponse} from './gopher_response.ts';

const GOPHER0_RESPONSE = new TextEncoder().encode('sample data');
const GOPHERP_RESPONSE_PLUS_SIZE = new TextEncoder().encode('+11\r\nsample data');
const GOPHERP_RESPONSE_PLUS_ONE = new TextEncoder().encode('+-1\r\nsample data plus 1\r\n.\r\n');
const GOPHERP_RESPONSE_PLUS_TWO = new TextEncoder().encode('+-2\r\nsample data plus 2');

Deno.test('GopherResponse handles normal Gopher0 response', () => {
  const resp = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.RFC1436);
  assertEquals(resp.body, GOPHER0_RESPONSE);
});

Deno.test('GopherResponse handles Gopher+ response with size', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_SIZE, GopherProtocol.GopherPlus);
  assertEquals(resp.header, new TextEncoder().encode('+11'));
  assertEquals(resp.body, new TextEncoder().encode('sample data'));
});

Deno.test('GopherResponse handles Gopher+ response +1', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_ONE, GopherProtocol.GopherPlus);
  assertEquals(resp.header, new TextEncoder().encode('+-1'));
  assertEquals(resp.body, new TextEncoder().encode('sample data plus 1'));
});

Deno.test('GopherResponse handles Gopher+ response +2', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_TWO, GopherProtocol.GopherPlus);
  assertEquals(resp.header, new TextEncoder().encode('+-2'));
  assertEquals(resp.body, new TextEncoder().encode('sample data plus 2'));
});

Deno.test('GopherResponse handles Gopher+ response that has no header', () => {
  const resp = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.GopherPlus);
  assertEquals(resp.header, undefined)
  assertEquals(resp.body, new TextEncoder().encode('sample data'));
});
