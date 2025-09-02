import { useForm } from 'react-hook-form';
import axios from 'axios';

export default function AddSchool() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('address', data.address);
      formData.append('city', data.city);
      formData.append('state', data.state || '');
      formData.append('contact', data.contact || '');
      formData.append('email_id', data.email_id || '');
      if (data.image && data.image[0]) formData.append('image', data.image[0]);

      const res = await axios.post('/api/schools', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 201) {
        alert('Saved!');
        reset();
      }
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold text-center mb-4">Add New School</h2>
        <input {...register('name')} placeholder="School Name" className="w-full border p-2 rounded" />
        <input {...register('address')} placeholder="Address" className="w-full border p-2 rounded" />
        <input {...register('city')} placeholder="City" className="w-full border p-2 rounded" />
        <input {...register('state')} placeholder="State" className="w-full border p-2 rounded" />
        <input {...register('contact')} placeholder="Contact Number" className="w-full border p-2 rounded" />
        <input {...register('email_id')} placeholder="Email" className="w-full border p-2 rounded" />
        <input type="file" {...register('image')} className="w-full border p-2 rounded" />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Save School
        </button>
      </form>
    </div>
  );
}