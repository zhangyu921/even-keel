import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createFamilySchema = z.object({
  name: z.string().min(1, "Family name is required").max(50),
});

export const joinFamilySchema = z.object({
  inviteCode: z.string().min(1, "Invite code is required"),
});

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  type: z.enum([
    "BANK",
    "CREDIT_CARD",
    "E_WALLET",
    "INVESTMENT",
    "REAL_ESTATE",
    "LIABILITY",
    "OTHER",
  ]),
  currency: z.string().default("CNY"),
  icon: z.string().optional(),
});

export const balanceRecordSchema = z.object({
  amount: z.string().refine(
    (val) => !isNaN(parseFloat(val)),
    "Please enter a valid number"
  ),
  note: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateFamilyInput = z.infer<typeof createFamilySchema>;
export type JoinFamilyInput = z.infer<typeof joinFamilySchema>;
export type AccountInput = z.infer<typeof accountSchema>;
export type BalanceRecordInput = z.infer<typeof balanceRecordSchema>;
