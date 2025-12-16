import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSet } from '~/components/ui/field'
import { Input } from '~/components/ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
const loginFormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.'
  }),
  password: z.string()
})
export default function LoginPage() {
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <div className='flex items-center justify-center w-full h-screen bg-gray-300'>
      <div className='w-md'>
        <FieldSet className=' bg-white px-5 py-10 rounded-lg'>
          <div className='text-center text-2xl font-medium'>Login</div>
          <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name='username'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='username'>Username</FieldLabel>
                    <Input
                      {...field}
                      id='username'
                      aria-invalid={fieldState.invalid}
                      placeholder='Max Leiter'
                      autoComplete='off'
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor='password'>Password</FieldLabel>
                    <FieldDescription>Must be at least 8 characters long.</FieldDescription>
                    <Input
                      type='password'
                      {...field}
                      id='password'
                      aria-invalid={fieldState.invalid}
                      placeholder='••••••••'
                      autoComplete='off'
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
            <Button type='submit' form='form-rhf-demo' className='w-full'>
              Login
            </Button>
          </form>
        </FieldSet>
      </div>
    </div>
  )
}
