import z from 'zod'

export type LoginFormSchema = z.infer<typeof loginFormSchema>
export const loginFormSchema = z.object({
  email: z.string().min(1),
  password: z.string().min(8)
})
