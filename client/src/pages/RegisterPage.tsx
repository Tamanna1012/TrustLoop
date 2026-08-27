import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { useRegister } from '@/hooks/useAuth';

// Functional but unstyled — the real register screen design lands in Phase 6.
export function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  return (
    <div className="mx-auto max-w-sm py-16">
      <h1 className="mb-6 text-xl font-semibold">Create an account</h1>
      <form
        noValidate
        className="flex flex-col gap-3"
        onSubmit={handleSubmit((values) => registerUser.mutate(values))}
      >
        <div>
          <input placeholder="Name" className="w-full border p-2" {...register('name')} />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>
        <div>
          <input placeholder="Email" type="email" className="w-full border p-2" {...register('email')} />
          {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <input placeholder="Password" type="password" className="w-full border p-2" {...register('password')} />
          {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
        </div>
        {registerUser.isError && <p className="text-sm text-red-600">Could not create account. Email may already be in use.</p>}
        <button type="submit" disabled={registerUser.isPending} className="border p-2">
          {registerUser.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
