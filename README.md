[RFC1436](https://tools.ietf.org/html/rfc1436) Gopher Client for Deno.

# Example Usage

```javascript
// Import the client.
import {GopherClient} from "https://deno.land/x/gopher/mod.ts";

// Create a new GopherClient, optionally specifying the protocol version to use.
const client = new GopherClient({
  ProtocolVersion: GopherProtocol.RFC1436,
});

// Download the Gopher server's menu.
const menu = await client.downloadMenu({
  Hostname: 'gopher.example.com',
  // Optional: Port (default 70)
  // Optional: Selector (e.g. "/foo")
});

// To display the menu items.
for (const menuItem of menu.Items) {
  console.log(menuItem.toString());
}

// To download a single menu item as a UInt8Array payload:
const bytes = client.downloadItem(menuItem);

// If it was a text entry (use the MenuItem.Type field to check) then you can
// easily convert to a string.
const text = new TextDecoder().decode(bytes);
```