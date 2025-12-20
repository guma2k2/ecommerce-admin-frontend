import { Button } from '~/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { loginFormSchema, type LoginFormSchema } from '~/features/unAuthenticate/validator'
import { FormInput } from '~/components/Form'
import { FieldGroup, FieldSet } from '~/components/ui/field'
export default function LoginPage() {
  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const { control } = form

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    console.log(values)
  }
  return (
    <div className='flex items-center justify-center w-full h-screen bg-gray-300'>
      <div className='w-md'>
        <FieldSet className=' bg-white px-5 py-10 rounded-lg'>
          <div className='text-center text-2xl font-medium'>Login</div>
          <form id='form-rhf-demo' onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <FormInput control={control} name='email' label='Email' />
              <FormInput
                control={control}
                name='password'
                label='Password'
                description='Must be at least 8 characters long.'
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
