import "server-only";
import sanitizeHtml from "sanitize-html";

// Article bodies are written by operators, not the public, but an editor
// account is still a lower bar than a deploy. Sanitising on write keeps a
// compromised or careless account from planting script into a public page.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h2",
    "h3",
    "blockquote",
    "ul",
    "ol",
    "li",
    "a",
    "img",
    "figure",
    "figcaption",
    "hr",
    "code",
    "pre",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    // Anything opening a new tab must not hand the opener over with it.
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.target
        ? { ...attribs, rel: "noopener noreferrer" }
        : attribs,
    }),
    // The page renders its own <h1>; a heading pasted from Word must not
    // produce a second one.
    h1: "h2",
  },
};

export function sanitizeArticleHtml(dirty: string) {
  return sanitizeHtml(dirty, OPTIONS);
}
