// Security configuration
export const securityConfig = {
  // JWT Settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-here',
    expires: '1h'
  },
  // Rate Limiting Settings
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  },
  // CORS Settings
  cors: {
    origin: ['http://localhost:3000', 'https://your-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 3600 // 1 hour
  },
  // Encryption Settings
  encryption: {
    algorithm: 'aes-256-cbc',
    ivLength: 16,
    keyLength: 32,
    saltRounds: 12
  }
};
