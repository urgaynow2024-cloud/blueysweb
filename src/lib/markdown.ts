import { marked } from "marked";
import DOMPurify from "dompurify";

/**
 * Render markdown string to sanitized HTML.
 * @param markdown - The markdown string to render.
 * @returns Sanitized HTML string.
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return "";
  
  // Use marked to convert markdown to HTML
  const html = marked(markdown) as string;
  
  // Sanitize the HTML with DOMPurify
  const sanitized = DOMPurify.sanitize(html, {
    // Allow only the tags and attributes we need for Discord-style markdown
    ALLOWED_TAGS: [
      "b", "i", "u", "s", "strong", "em", "ins", "del", "code", "pre", "h1", "h2", "h3", "h4", "h5", "h6",
      "blockquote", "p", "ul", "ol", "li", "a", "br", "hr"
    ],
    ALLOWED_ATTR: ["href", "name", "target"],
    // We'll allow target="_blank" for links but we'll add rel="noreferrer noopener" later if needed
    // For now, we'll just allow the attributes and handle them in the markdown parsing if needed.
    // We can also add a hook to add rel attributes to links.
  });
  
  return sanitized;
}
