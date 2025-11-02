import { z } from 'zod'

export const newsletterInputSchema = z
  .object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Enter a valid email address'),
    name: z
      .string()
      .trim()
      .min(1, 'Name cannot be empty')
      .max(120, 'Name must be 120 characters or fewer')
      .optional(),
    source: z
      .string()
      .trim()
      .min(1, 'Source cannot be empty')
      .max(120, 'Source must be 120 characters or fewer')
      .optional(),
  })
  .transform((value) => ({
    email: value.email.trim().toLowerCase(),
    name: value.name?.trim(),
    source: value.source?.trim() ?? 'website',
  }))

export const applicationInputSchema = z
  .object({
    name: z
      .string({ required_error: 'Name is required' })
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(160, 'Name must be 160 characters or fewer'),
    email: z
      .string({ required_error: 'Email is required' })
      .email('Enter a valid email address')
      .transform((val) => val.trim().toLowerCase()),
    roleInterest: z
      .string({ required_error: 'Role interest is required' })
      .trim()
      .min(2, 'Role interest must be at least 2 characters')
      .max(160, 'Role interest must be 160 characters or fewer'),
    experience: z
      .string()
      .trim()
      .min(1, 'Experience cannot be empty')
      .max(1200, 'Experience must be 1200 characters or fewer')
      .optional(),
    portfolioUrl: z
      .string()
      .trim()
      .url('Provide a valid URL')
      .max(300, 'Portfolio URL must be 300 characters or fewer')
      .optional(),
    message: z
      .string({ required_error: 'Message is required' })
      .trim()
      .min(10, 'Message must be at least 10 characters')
      .max(1500, 'Message must be 1500 characters or fewer'),
  })
  .transform((value) => ({
    name: value.name,
    email: value.email,
    role_interest: value.roleInterest,
    experience: value.experience,
    portfolio_url: value.portfolioUrl,
    message: value.message,
  }))

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
})
