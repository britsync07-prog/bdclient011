const { z } = require('zod');
const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

try {
  registerSchema.parse({ username: 'user', password: 'Password1!' });
  console.log('Valid password passed');
} catch (e) {
  console.error('Valid password failed:', e.errors);
  process.exit(1);
}

try {
  registerSchema.parse({ username: 'user', password: 'password1!' });
  console.error('Invalid password (no uppercase) passed');
  process.exit(1);
} catch (e) {
  console.log('Invalid password (no uppercase) caught:', e.errors[0].message);
}

console.log('Final verification success');
