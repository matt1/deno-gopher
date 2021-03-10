[![tests workflow](https://github.com/matt1/deno-gopher/actions/workflows/deno.yml/badge.svg)](https://github.com/matt1/deno-gopher/actions/workflows/deno.yml)
[![deno doc](https://doc.deno.land/badge.svg)](https://doc.deno.land/https/deno.land/x/gopher/mod.ts)

[RFC1436](https://tools.ietf.org/html/rfc1436) Gopher Client for Deno, with 
basic support for [Gopher+](https://github.com/gopher-protocol/gopher-plus/blob/main/gopherplus.md).

# Example Usage

```javascript
// Import the client.
import {GopherClient} from 'https://deno.land/x/gopher/mod.ts';

// Create a new GopherClient, optionally specifying the protocol version to use.
const client = new GopherClient({
  protocolVersion: GopherProtocol.RFC1436,
  useTls: false,
});

try {
  // Download the Gopher server's menu.
  const menu = await client.downloadMenu({
    hostname: 'gopher.example.com',
    // Optional: port (default 70)
    // Optional: selector (e.g. '/foo')
  });

  // To display the menu items.
  for (const menuItem of menu.Items) {
    console.log(menuItem.toString());
  }

  // To download a single menu item - the response contains the body and header
  // (if it was  Gopher+ response) as well as some timing information:
  const gopherResponse = client.downloadItem(menuItem);

  /** Output timing info for the server response, e.g.
   * ```
   *  Timing info for Gopher Request:
   *  Waiting for connection: 94ms
   *  Waiting for first byte: 92ms
   *  Receiving time:         1ms
   *  Total request duration: 187ms
   * ```
   */
  console.log(`Timing info for Gopher Request:
    Waiting for connection: ${gopherResponse.timing.waitingDurationMillis}ms
    Waiting for first byte: ${gopherResponse.timing.waitingForFirstByteDurationMillis}ms
    Receiving time:         ${gopherResponse.timing.recievingDuratrionMillis}ms
    Total request duration: ${gopherResponse.timing.totalDurationMillis}ms`);

  // If it was a text entry (use the MenuItem.Type field to check) then you can
  // easily convert to a string.
  const text = new TextDecoder().decode(gopherResponse.body);
} catch (error) {
  console.error(`Error downloading from Gopher: ${error}`);
}
```

# Getting Gopher+ attributes
```javascript
// Having previously obtained the menu item (see basic example), attributes can
// be retrieved like so:
client.populateAttributes(myMenuItem)
console.log(myMenuItem);
```
Results:
```bash
MenuItem {
  Type: '0',
  Name: 'A file',
  Selector: '/a file.txt',
  Hostname: 'gopher.example.com',
  Port: 70,
  Original: '0A file\t/a file.txt\tgopher.example.com\t70\t+',
  Attributes: Map {
    'ADMIN' => Map {
        'Admin' => 'Foo Bar <foobar@example.com>',
        'Mod-Date' => 'Sun Feb 21 20:19:18 2021 <20210221201918>'
      },
    'VIEWS' => Map { 'text/plain' => '<1k>' }
  }
}
```
