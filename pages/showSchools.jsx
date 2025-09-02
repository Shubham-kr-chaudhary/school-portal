import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function ShowSchools() {
  const [schools, setSchools] = useState([]);
useEffect(() => {
  async function fetchSchools() {
    try {
      const res = await axios.get('/api/schools');
      setSchools(res.data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  }
  fetchSchools();
}, []);


  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-center">All Schools</h2>

      <div className="w-full max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {schools.map((s) => (
          <article key={s.id} className="bg-white rounded-xl shadow overflow-hidden flex flex-col">
            {s.image ? (
              <img
                src={s.image}
                alt={s.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <h3 className="text-lg font-semibold">{s.name}</h3>
              <p className="text-gray-600 mt-1">{[s.address, s.city, s.state].filter(Boolean).join(', ')}</p>
              <div className="mt-auto pt-3 text-sm text-gray-500 space-y-1">
                {s.contact && <p>📞 {s.contact}</p>}
                {s.email_id && <p>✉️ {s.email_id}</p>}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}