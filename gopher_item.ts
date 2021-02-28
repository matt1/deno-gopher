import {CRLF} from './gopher_common.ts';
import {ItemType, UnknownType} from './gopher_types.ts';

/** Contains all of the Gopher+ attributes for a GopherItem. */
export class ItemAttributes {
  /** The name of the block, e.g. `INFO`, `VIEWS` etc. No leading `+`. */
  Name: string = '';
  /** The attribute block dedscriptor - e.g. `+INFO: <descriptor goes here>`. */
  Descriptor!: string;
  /** 
   * The lines of the attribute block. This is typically treated as key values,
   * but may just be strings, so we have both the raw string block and a map
   * for convenience.
   */
  RawLines: string = '';
  Lines: Map<string, string> = new Map<string, string>();
}

/** Represents an item in a Gopher menu. */
export abstract class GopherItem {
  Type: ItemType = new UnknownType('?');
  Name: string = '';
  Selector: string = 'fake';
  Hostname: string = '';
  Port: number = 0;
  Original: string = '';

  /** Gopher+ Attribute map for this item. May not be populated. */
  Attributes: Map<string, ItemAttributes> = new Map<string, ItemAttributes>();

  /** Parses a string and converts it to attributes. */
  parseAttributes(rawAttributes:string) {
    // Spec does not say if attributes should be CRLF or just LF?
    let lines = rawAttributes.split(`\n`);
    // Shift off the first line (the Gopher+ status) since we don't care.
    lines.shift();
    if (!lines) return;
    let lastAttribute = '';
    for (const line of lines) {
      const separator = line.indexOf(':');
      if (line.startsWith('+')) {
        const attributeName = line.substring(1, separator);
        const descriptor = line.substring(separator + 1).trim();
        const attr = new ItemAttributes();
        attr.Name = attributeName;
        attr.Descriptor = descriptor;
        this.Attributes.set(attributeName, attr);
        lastAttribute = attributeName;
      } else {
        if (!lastAttribute) continue;
        this.Attributes.get(lastAttribute)!.RawLines += `${line}${CRLF}`;
        const key = line.substring(0, separator).trim();
        const value = line.substring(separator + 1).trim();
        if (!key || !value) continue;
        this.Attributes.get(lastAttribute)!.Lines.set(key, value);
      }
    }
  }
}
