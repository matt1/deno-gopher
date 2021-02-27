export const TYPE_UNKNOWN = "?";
export const TYPE_TEXT = '0';
export const TYPE_MENU = "1";
export const TYPE_CCSO_NAMESERVER = "2";
export const TYPE_ERROR = "3";
export const TYPE_BINHEX_FILE = "4";
export const TYPE_DOS_FILE = "5";
export const TYPE_UUENCODED_FILE = "6";
export const TYPE_FULL_TEXT_SEARCH = "7";
export const TYPE_TELNET = "8";
export const TYPE_BINARY_FILE = "9";
export const TYPE_MIRROR = "+";
export const TYPE_GIF = "g";
export const TYPE_IMAGE = "I";
export const TYPE_TELNET_3270 = "T";
export const TYPE_DOC = "d";
export const TYPE_HTML = "h";
export const TYPE_INFO = "i";
export const TYPE_AUDIO = "s";

export const TYPE_PLUS_IMAGE = ":";
export const TYPE_PLUS_VIDEO = ";";
export const TYPE_PLUS_AUDIO = "<";


export type ItemType = typeof TYPE_UNKNOWN | typeof TYPE_TEXT | typeof TYPE_MENU | typeof TYPE_CCSO_NAMESERVER | typeof TYPE_ERROR |
    typeof TYPE_BINHEX_FILE | typeof TYPE_DOS_FILE | typeof TYPE_UUENCODED_FILE | typeof TYPE_FULL_TEXT_SEARCH |
    typeof TYPE_TELNET | typeof TYPE_BINARY_FILE | typeof TYPE_MIRROR | typeof TYPE_GIF | typeof TYPE_IMAGE |
    typeof TYPE_TELNET_3270 | typeof TYPE_DOC | typeof TYPE_HTML | typeof TYPE_INFO | typeof TYPE_AUDIO |
    typeof TYPE_PLUS_IMAGE | typeof TYPE_PLUS_VIDEO | typeof TYPE_PLUS_AUDIO;