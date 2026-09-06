import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function RegisterPage() {
  usePageTitle('Create account');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { register: signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    try {
      await signup(values);
      toast.success('Account created');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getApiError(error, 'Unable to register'));
    }
  };

  return (
    <div className="container-page py-12">
      <form onSubmit={handleSubmit(onSubmit)} className="card mx-auto max-w-xl p-8">
        <h1 className="text-2xl font-bold">Create your SkyBook account</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">First name</label>
            <input className="input" {...register('firstName', { required: 'Required' })} />
            {errors.firstName ? <p className="text-xs text-red-600">{errors.firstName.message}</p> : null}
          </div>
          <div>
            <label className="label">Last name</label>
            <input className="input" {...register('lastName', { required: 'Required' })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email', { required: 'Required' })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              {...register('password', {
                required: 'Required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
        </div>
        <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </button>
        <p className="mt-4 text-sm text-slate-500">
          Already registered? <Link to="/login" className="text-sky-600">Sign in</Link>
        </p>
      </form>
    </div>
  );
}
