import { assertEquals } from "https://deno.land/std@0.87.0/testing/asserts.ts";
import { MenuItem } from "./gopher.ts";


Deno.test("MenuItem parses well-formed menu item", () => {
  const line = "1Home	/home	gopher.example.com	70";
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, "1");
  assertEquals(menuItem.Name, "Home");
  assertEquals(menuItem.Selector, "/home");
  assertEquals(menuItem.Hostname, "gopher.example.com");
  assertEquals(menuItem.Port, 70);
});

Deno.test("MenuItem parses selectors with spaces", () => {
  const line = "0One Two	/One Two.txt	gopher.example.com	70	+";
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, "0");
  assertEquals(menuItem.Name, "One Two");
  assertEquals(menuItem.Selector, "/One Two.txt");
  assertEquals(menuItem.Hostname, "gopher.example.com");
  assertEquals(menuItem.Port, 70);
});

Deno.test("MenuItem parses menu item with additional fields", () => {
  const line = "1Home	/home	gopher.example.com	70	+";
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, "1");
  assertEquals(menuItem.Name, "Home");
  assertEquals(menuItem.Selector, "/home");
  assertEquals(menuItem.Hostname, "gopher.example.com");
  assertEquals(menuItem.Port, 70);
});


Deno.test("MenuItem parses informational menu item", () => {
  const line = "iThis is info	fake	(NULL)	0";
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, "i");
  assertEquals(menuItem.Name, "This is info");
  assertEquals(menuItem.Selector, "fake");
  assertEquals(menuItem.Hostname, "(NULL)");
  assertEquals(menuItem.Port, 0);
});

Deno.test("MenuItem parses empty informational menu item", () => {
  const line = "i	fake	(NULL)	0";
  const menuItem = new MenuItem(line);

  assertEquals(menuItem.Type, "i");
  assertEquals(menuItem.Name, "");
  assertEquals(menuItem.Selector, "fake");
  assertEquals(menuItem.Hostname, "(NULL)");
  assertEquals(menuItem.Port, 0);
});

Deno.test("MenuItem parses attributes", () => {
  const attributes = `+-2
+INFO: 0whatsnew.txt    /whatsnew.txt   gopher.example.com 70      +
+ADMIN:
 Admin: Foo Bar <foobar@example.com>
 Mod-Date: Sun Feb 21 20:19:18 2021 <20210221201918>
+VIEWS:
 text/plain: <1k>
 text/html: <2k>`

  const menuItem = new MenuItem("1Home	/home	gopher.example.com	70");
  menuItem.parseAttributes(attributes);

  assertEquals(menuItem.Attributes.get('ADMIN')!.get('Admin'), "Foo Bar <foobar@example.com>");
  assertEquals(menuItem.Attributes.get('ADMIN')!.get('Mod-Date'), "Sun Feb 21 20:19:18 2021 <20210221201918>");
  assertEquals(menuItem.Attributes.get('VIEWS')!.get('text/plain'), "<1k>");
  assertEquals(menuItem.Attributes.get('VIEWS')!.get('text/html'), "<2k>");
  
});