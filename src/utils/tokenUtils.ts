import jwt from 'jsonwebtoken';

// Store your secret in environment variables!
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export interface TokenPayload {
  userId: string;
  role: string;
}

/**
 * Generates a JWT token with the given payload
 * @param payload User information to include in the token
 * @param expiresIn Token expiration time (default: 200h)
 * @returns The generated JWT token
 */
export function generateToken(payload: TokenPayload, expiresIn: string = '200h'): string {
  return jwt.sign(payload, JWT_SECRET as string, {
    expiresIn,
  });
}