[RFC1436](https://tools.ietf.org/html/rfc1436) Gopher Client for Deno.

# Example Usage

```javascript
// Create a GopherClient.
const client = new GopherClient();

// Download the Gopher server's menu.
const menu = await client.DownloadMenu({
  Hostname: 'gopher.example.com',
  // Optional: Port (default 70)
  // Optional: Selector (e.g. "/foo")
});

// To display the menu items.
for (const menuItem of menu.Items) {
  console.log(menuItem.toString());
}

// To download a single menu item as a UInt8Array payload:
const bytes = client.DownloadItem(menuItem);

// If it was a text entry (use the MenuItem.Type field to check) then you can easily convert to a string.
const text = new TextDecoder().decode(bytes);
```