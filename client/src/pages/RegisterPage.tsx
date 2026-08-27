import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { useRegister } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <CardHeader className="flex-col items-start pb-1">
          <h1 className="text-xl font-semibold text-foreground">Create an account</h1>
          <p className="text-sm text-foreground-muted">Start or join your first circle.</p>
        </CardHeader>
        <CardBody>
          <form
            noValidate
            className="flex flex-col gap-4"
            onSubmit={handleSubmit((values) => registerUser.mutate(values))}
          >
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" autoComplete="name" {...register('name')} />
              <FieldError>{errors.name?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
              <FieldError>{errors.password?.message}</FieldError>
            </div>
            {registerUser.isError && (
              <FieldError>Could not create account. That email may already be in use.</FieldError>
            )}
            <Button type="submit" loading={registerUser.isPending} className="mt-1">
              Create account
            </Button>
          </form>
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-foreground-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
