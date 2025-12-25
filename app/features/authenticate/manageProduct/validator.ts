import z from 'zod'
export type ProductFormSchema = z.infer<typeof productFormSchema>
export const productFormSchema = z.object({
  title: z.string().trim().min(1).max(255),
  medias: z.array(z.object({ id: z.string(), url: z.string() })),
  description: z.string()
})
