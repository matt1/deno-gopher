import {assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import {GopherProtocol} from './gopher_common.ts';
import {GopherResponse, GopherTimingInfo} from './gopher_response.ts';

const GOPHER0_RESPONSE = new TextEncoder().encode('sample data');
const GOPHERP_RESPONSE_PLUS_SIZE = new TextEncoder().encode('+11\r\nsample data');
const GOPHERP_RESPONSE_PLUS_ONE = new TextEncoder().encode('+-1\r\nsample data plus 1\r\n.\r\n');
const GOPHERP_RESPONSE_PLUS_TWO = new TextEncoder().encode('+-2\r\nsample data plus 2');

const DUMMY_TIMING = new GopherTimingInfo(1, 2, 3, 4);

Deno.test('GopherResponse handles normal Gopher0 response', () => {
  const resp = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.RFC1436, DUMMY_TIMING);
  assertEquals(resp.body, GOPHER0_RESPONSE);
});

Deno.test('GopherResponse handles Gopher+ response with size', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_SIZE, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.header, new TextEncoder().encode('+11'));
  assertEquals(resp.body, new TextEncoder().encode('sample data'));
});

Deno.test('GopherResponse handles Gopher+ response +1', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_ONE, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.header, new TextEncoder().encode('+-1'));
  assertEquals(resp.body, new TextEncoder().encode('sample data plus 1'));
});

Deno.test('GopherResponse handles Gopher+ response +2', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_TWO, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.header, new TextEncoder().encode('+-2'));
  assertEquals(resp.body, new TextEncoder().encode('sample data plus 2'));
});

Deno.test('GopherResponse handles Gopher+ response that has no header', () => {
  const resp = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.header, new Uint8Array(0))
  assertEquals(resp.body, new TextEncoder().encode('sample data'));
});

Deno.test('GopherResponse sets Gopher0 response sizes correctly', () => {
  const resp = new GopherResponse(GOPHER0_RESPONSE, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.headerSize, 0)
  assertEquals(resp.bodySize, 11);
  assertEquals(resp.responseSize, 11);
});

Deno.test('GopherResponse sets Gopher+ response sizes correctly', () => {
  const resp = new GopherResponse(GOPHERP_RESPONSE_PLUS_TWO, GopherProtocol.GopherPlus, DUMMY_TIMING);
  assertEquals(resp.headerSize, 3)
  assertEquals(resp.bodySize, 18);
  assertEquals(resp.responseSize, 21);
});

