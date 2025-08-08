import { z } from "zod";

import type { UserCreationRequest } from "@/types/roles";

const userCreationSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, "Bio too long").optional(),
  roleIds: z.array(z.string().uuid("Invalid role ID")).optional(),
  roleExpiresAt: z.string().datetime("Invalid expiration date").optional(),
});

export class UserCreationValidator {
  /**
   * Validate user creation request
   */
  static validateUserCreation(data: unknown): UserCreationRequest {
    return userCreationSchema.parse(data);
  }

  /**
   * Validate user creation request with custom password generation
   */
  static validateUserCreationWithGeneratedPassword(
    data: unknown,
  ): UserCreationRequest & { password: string } {
    const validated = userCreationSchema.parse(data);

    // If no password provided, we'll generate one
    if (!validated.password) {
      validated.password = this.generateSecurePassword();
    }

    return validated as UserCreationRequest & { password: string };
  }

  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailSchema = z.string().email();
    try {
      emailSchema.parse(email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a secure password
   */
  static generateSecurePassword(): string {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";

    // Ensure at least one character from each category
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]; // uppercase
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; // lowercase
    password += "0123456789"[Math.floor(Math.random() * 10)]; // number
    password += "!@#$%^&*"[Math.floor(Math.random() * 8)]; // special

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  }

  /**
   * Validate password strength
   */
  static validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*]/.test(password)) {
      errors.push(
        "Password must contain at least one special character (!@#$%^&*)",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
