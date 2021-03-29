/** 
 * Regular expression used for parsing well-formed gopher URIs.
 * 
 * Group 1 - scheme (e.g. `gopher`), or undefined if not provided.
 * Group 2 - host (fully-qualified domain, or IPv4)
 * Group 3 - port, or undefined if not provided.
 * Group 4 - selector, or undefined if not provided.
 */
// eslint-disable-next-line
export const URI_REGEX = /^(?:(gopher|gophers):\/\/)?((?:[\w\d-_]*\.)+[\w\d]+)(?:\:([\d]+)){0,1}([/\w\d-_ !&?\.=#]*){0,1}$/;