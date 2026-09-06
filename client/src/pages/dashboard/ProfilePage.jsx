import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function ProfilePage() {
  usePageTitle('Profile');
  const { user, setUser } = useAuth();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
      phone: user?.phone,
      dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
      gender: user?.gender || '',
      nationality: user?.nationality || '',
      passportNumber: user?.passportNumber || '',
      country: user?.country || '',
      address: user?.address || {},
    },
  });
  const passwordForm = useForm();

  const save = async (values) => {
    try {
      const { data } = await userService.updateProfile(values);
      setUser(data.data);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(save)} className="card p-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="mt-4 flex items-center gap-4">
          <img src={user?.avatar || 'https://placehold.co/80x80?text=SB'} alt="" className="h-16 w-16 rounded-full object-cover" />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const { data } = await userService.uploadAvatar(file);
                setUser(data.data);
                toast.success('Avatar updated');
              } catch (error) {
                toast.error(getApiError(error));
              }
            }}
          />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><label className="label">First name</label><input className="input" {...register('firstName')} /></div>
          <div><label className="label">Last name</label><input className="input" {...register('lastName')} /></div>
          <div><label className="label">Phone</label><input className="input" {...register('phone')} /></div>
          <div><label className="label">Date of birth</label><input className="input" type="date" {...register('dateOfBirth')} /></div>
          <div>
            <label className="label">Gender</label>
            <select className="input" {...register('gender')}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div><label className="label">Nationality</label><input className="input" {...register('nationality')} /></div>
          <div><label className="label">Passport</label><input className="input" {...register('passportNumber')} /></div>
          <div><label className="label">Country</label><input className="input" {...register('country')} /></div>
          <div className="sm:col-span-2"><label className="label">Address</label><input className="input" {...register('address.line1')} /></div>
        </div>
        <button className="btn-primary mt-6">Save profile</button>
      </form>

      <form
        className="card p-6"
        onSubmit={passwordForm.handleSubmit(async (values) => {
          try {
            await userService.changePassword(values);
            toast.success('Password updated');
            passwordForm.reset();
          } catch (error) {
            toast.error(getApiError(error));
          }
        })}
      >
        <h2 className="text-xl font-bold">Change password</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Current password</label>
            <input className="input" type="password" {...passwordForm.register('currentPassword', { required: true })} />
          </div>
          <div>
            <label className="label">New password</label>
            <input className="input" type="password" {...passwordForm.register('newPassword', { required: true, minLength: 8 })} />
          </div>
        </div>
        <button className="btn-outline mt-6">Update password</button>
      </form>
    </div>
  );
}
