import { JWT_EXPIRY, JWT_SECRET } from '../../config/serverConfig.js';
import jwt from 'jsonwebtoken';

export const createJWT = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
};
