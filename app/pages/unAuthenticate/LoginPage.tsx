import { Button } from '~/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from '~/components/ui/field'
import { Input } from '~/components/ui/input'

export default function LoginPage() {
  return (
    <div className='flex items-center justify-center w-full h-screen bg-gray-300'>
      <div className='w-md'>
        <FieldSet className=' bg-white px-5 py-10 rounded-lg'>
          <div className='text-center text-2xl font-medium'>Login</div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='username'>Username</FieldLabel>
              <Input id='username' type='text' placeholder='Max Leiter' />
            </Field>
            <Field>
              <FieldLabel htmlFor='password'>Password</FieldLabel>
              <FieldDescription>Must be at least 8 characters long.</FieldDescription>
              <Input id='password' type='password' placeholder='••••••••' />
            </Field>
          </FieldGroup>
          <Button>Login</Button>
        </FieldSet>
      </div>
    </div>
  )
}
