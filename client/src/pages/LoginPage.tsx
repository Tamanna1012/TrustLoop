import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { useLogin } from '@/hooks/useAuth';

// Functional but unstyled — the real login screen design lands in Phase 6.
export function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-xl font-semibold">Log in</h1>
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={handleSubmit((values) => login.mutate(values))}
      >
        <div>
          <input placeholder="Email" type="email" className="w-full border p-2" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input placeholder="Password" type="password" className="w-full border p-2" {...register('password')} />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        {login.isError && <p className="text-sm text-red-600">Invalid email or password.</p>}
        <button type="submit" disabled={login.isPending} className="border p-2">
          {login.isPending ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        No account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}
