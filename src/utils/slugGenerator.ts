import crypto from 'crypto';

/**
 * Generate a unique slug for cards
 */
export function generateSlug(): string {
  // Generate a random 8-character slug
  const randomBytes = crypto.randomBytes(4);
  return randomBytes.toString('hex');
}

/**
 * Generate a more readable slug (optional for future use)
 */
export function generateReadableSlug(): string {
  const adjectives = ['cool', 'amazing', 'awesome', 'brilliant', 'fantastic', 'incredible', 'outstanding', 'remarkable'];
  const nouns = ['link', 'card', 'preview', 'share', 'post', 'content', 'story', 'update'];
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  
  return `${adjective}-${noun}-${number}`;
}

