import { createCipheriv, createDecipheriv } from 'crypto';
import { securityConfig } from '../config/security';

export const encrypt = (data: string) => {
  const { algorithm, ivLength, keyLength, saltRounds } = securityConfig.encryption;
  
  // Generate random IV and salt
  const iv = Buffer.alloc(ivLength);
  const salt = Buffer.alloc(saltRounds);
  
  // Generate key from salt
  const key = Buffer.alloc(keyLength);
  
  // Create cipher
  const cipher = createCipheriv(algorithm, key, iv);
  
  // Encrypt data
  const encrypted = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]);
  
  return {
    encryptedData: encrypted.toString('hex'),
    iv: iv.toString('hex'),
    salt: salt.toString('hex')
  };
};

export const decrypt = (data: string, iv: string, salt: string) => {
  const { algorithm, ivLength, keyLength } = securityConfig.encryption;
  
  // Convert inputs to buffers
  const encryptedData = Buffer.from(data, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const saltBuffer = Buffer.from(salt, 'hex');
  
  // Derive key from salt
  const key = Buffer.alloc(keyLength);
  
  // Create decipher
  const decipher = createDecipheriv(algorithm, key, ivBuffer);
  
  // Decrypt data
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  
  return decrypted.toString();
};