/**
 * NO AI badge — single source of truth for keys and placement.
 *
 * The badge image is stored as its own asset in the
 * `site_images` table under the key `no_ai_badge` (storage
 * path `site/<uuid>`), completely separate from every other
 * icon and image on the site. Its on/off state and where it
 * appears live in `site_config` under the keys below, so
 * they persist through the existing admin save flow and
 * survive refreshes without any code edits.
 */

export const NO_AI_IMAGE_KEY = "no_ai_badge";

export const NO_AI_ENABLED_KEY = "no_ai_enabled";
export const NO_AI_PLACEMENT_KEY = "no_ai_placement";

export type NoAiPlacement = "footer" | "home" | "all";

export const NO_AI_PLACEMENTS: { value: NoAiPlacement; label: string; desc: string }[] = [
  { value: "footer", label: "Footer", desc: "Every page, at the bottom of the site." },
  { value: "home", label: "Homepage", desc: "Homepage only, below the hero." },
  { value: "all", label: "Footer + Homepage", desc: "Both locations (default)." },
];

export const NO_AI_HEADING = "NO AI";
export const NO_AI_TAGLINE = "AI-generated artwork and AI-assisted submissions are not accepted.";

export function isNoAiEnabled(site: Record<string, unknown>): boolean {
  // The badge is on by default so the status is visible
  // before any configuration happens. Saving "false" in
  // site_config turns it off permanently.
  return site[NO_AI_ENABLED_KEY] !== "false";
}

export function noAiPlacement(site: Record<string, unknown>): NoAiPlacement {
  const value = site[NO_AI_PLACEMENT_KEY];
  if (value === "footer" || value === "home" || value === "all") return value;
  return "all";
}

export function showsAtPlacement(site: Record<string, unknown>, placement: "footer" | "home"): boolean {
  if (!isNoAiEnabled(site)) return false;
  const where = noAiPlacement(site);
  return where === "all" || where === placement;
}
