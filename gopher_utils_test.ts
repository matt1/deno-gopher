import {assert, assertEquals} from 'https://deno.land/std@0.87.0/testing/asserts.ts';
import { URI_REGEX } from './gopher_utils.ts';

Deno.test('Gopher Utils URI regex accepts valid Gopher URIs', () => {
  assertEquals(true, URI_REGEX.test('127.0.0.1'));
  assertEquals(true, URI_REGEX.test('127.0.0.1:70'));
  assertEquals(true, URI_REGEX.test('example.com'));
  assertEquals(true, URI_REGEX.test('example.com/'));
  assertEquals(true, URI_REGEX.test('example.com:70'));
  assertEquals(true, URI_REGEX.test('example.com:70/'));
  assertEquals(true, URI_REGEX.test('gopher://example.com'));
  assertEquals(true, URI_REGEX.test('gopher://example.com:70'));
  assertEquals(true, URI_REGEX.test('gopher://example.com/'));
  assertEquals(true, URI_REGEX.test('gopher://example.com:70/'));
  assertEquals(true, URI_REGEX.test('gopher://example.com/some/selector'));
  assertEquals(true, URI_REGEX.test('gopher://example.com/1/some/selector'));
  assertEquals(true, URI_REGEX.test('gopher://example.com/test.txt'));
  assertEquals(true, URI_REGEX.test('gopher://example-123.com/foor-BAR_1?=#'));
});

Deno.test('Gopher Utils URI regex rejects invalid Gopher URIs', () => {
  assertEquals(false, URI_REGEX.test(''));
  assertEquals(false, URI_REGEX.test('foo'));
  assertEquals(false, URI_REGEX.test('foo.'));
  assertEquals(false, URI_REGEX.test('foo bar'));  
  assertEquals(false, URI_REGEX.test('http://example.com'));
  assertEquals(false, URI_REGEX.test('http://example.com'));
  assertEquals(false, URI_REGEX.test('http://example.com:70'));
  assertEquals(false, URI_REGEX.test('http://example.com/'));
});

Deno.test('Gopher Utils URI regex parses valid Gopher URIs', () => {
  let parts = 'gopher://example.com:70/some/selector/test.txt'.match(URI_REGEX);
  assert(parts);
  assertEquals('gopher', parts[1]);
  assertEquals('example.com', parts[2]);
  assertEquals('70', parts[3]);
  assertEquals('/some/selector/test.txt', parts[4]);

  parts = 'gophers://127.0.0.1/some/selector/something-STRANGE_123?!'.match(URI_REGEX);
  assert(parts);
  assertEquals('gophers', parts[1]);
  assertEquals('127.0.0.1', parts[2]);
  assertEquals(undefined, parts[3]);
  assertEquals('/some/selector/something-STRANGE_123?!', parts[4]);

  parts = 'example.co.uk'.match(URI_REGEX);
  assert(parts);
  assertEquals(undefined, parts[1]);
  assertEquals('example.co.uk', parts[2]);
  assertEquals(undefined, parts[3]);
  assertEquals(undefined, parts[4]);

});