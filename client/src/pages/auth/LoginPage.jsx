import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function LoginPage() {
  usePageTitle('Sign in');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      const dest = location.state?.from || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest);
    } catch (error) {
      toast.error(getApiError(error, 'Unable to sign in'));
    }
  };

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to book and manage trips.</p>
        <div className="mt-6">
          <label className="label" htmlFor="email">Email</label>
          <input id="email" className="input" type="email" {...register('email', { required: 'Email is required' })} />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div className="mt-4">
          <label className="label" htmlFor="password">Password</label>
          <input id="password" className="input" type="password" {...register('password', { required: 'Password is required' })} />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>
        <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="mt-4 text-sm text-slate-500">
          New here? <Link to="/register" className="text-sky-600">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
