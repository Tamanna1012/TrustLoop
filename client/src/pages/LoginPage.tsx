import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { useLogin } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input, Label, FieldError } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';

export function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <Card>
        <CardHeader className="flex-col items-start pb-1">
          <h1 className="text-xl font-semibold text-foreground">Log in</h1>
          <p className="text-sm text-foreground-muted">Welcome back to your circles.</p>
        </CardHeader>
        <CardBody>
          <form noValidate className="flex flex-col gap-4" onSubmit={handleSubmit((values) => login.mutate(values))}>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              <FieldError>{errors.email?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register('password')} />
              <FieldError>{errors.password?.message}</FieldError>
            </div>
            {login.isError && <FieldError>Invalid email or password.</FieldError>}
            <Button type="submit" loading={login.isPending} className="mt-1">
              Log in
            </Button>
          </form>
        </CardBody>
      </Card>
      <p className="mt-4 text-center text-sm text-foreground-muted">
        No account?{' '}
        <Link to="/register" className="font-medium text-primary">
          Register
        </Link>
      </p>
    </div>
  );
}
