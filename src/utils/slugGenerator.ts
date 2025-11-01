import crypto from 'crypto';

/**
 * Generate a unique slug for cards
 */
export function generateSlug(): string {
  // Generate a random 8-character slug
  const randomBytes = crypto.randomBytes(4);
  return randomBytes.toString('hex');
}

