import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, env.JWT_SECRET);
};

export const generateRefreshToken = (payload: any): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
};