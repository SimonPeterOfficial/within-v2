/**
 * Validation — every user-supplied value passes through here before it
 * touches the database. Hand-rolled and dependency-free: the rules are
 * small, explicit, and shared by every route that accepts input.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9_-]{2,29}$/;

export type FieldErrors = Record<string, string>;

export function validateEmail(email: string): string | null {
  const value = email.trim().toLowerCase();
  if (!value) return "Email is required.";
  if (value.length > 254) return "Email is too long.";
  if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password.length > 200) return "Password is too long.";
  return null;
}

export function validateName(name: string): string | null {
  const value = name.trim();
  if (!value) return "Name is required.";
  if (value.length < 2) return "Name must be at least 2 characters.";
  if (value.length > 80) return "Name is too long.";
  return null;
}

export function validateUsername(username: string): string | null {
  const value = username.trim().toLowerCase();
  if (!value) return "Username is required.";
  if (!USERNAME_PATTERN.test(value)) {
    return "Usernames: 3–30 characters, lowercase letters, numbers, _ or -.";
  }
  return null;
}

export function validateBio(bio: string): string | null {
  if (bio.length > 280) return "Bio must be 280 characters or fewer.";
  return null;
}

export function validateTitle(title: string): string | null {
  const value = title.trim();
  if (!value) return "Title is required.";
  if (value.length < 2) return "Title must be at least 2 characters.";
  if (value.length > 120) return "Title is too long.";
  return null;
}

export function validateDescription(description: string): string | null {
  if (description.length > 2000) return "Description is too long.";
  return null;
}

export function validateTags(tags: unknown): string[] | null {
  if (!Array.isArray(tags)) return [];
  const cleaned = tags
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0 && tag.length <= 32);
  if (cleaned.length > 12) return null; // too many tags
  return [...new Set(cleaned)];
}

/** Derives a candidate username from a name + email prefix. */
export function deriveUsername(name: string, email: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  const fromEmail = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_-]/g, "") ?? "";
  const candidate = base || fromEmail || "soul";
  return candidate.slice(0, 30) || "soul";
}