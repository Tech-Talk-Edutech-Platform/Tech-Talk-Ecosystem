'use client';
import { useState } from 'react';

export default function LeadMagnetForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    await fetch('/api/send-curriculum', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    setStatus('success');
    setTimeout(onClose, 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {status === 'success' ? (
        <p className="text-green-600 font-bold text-center">Thanks! Check your email for the PDF.</p>
      ) : (
        <>
          <input 
            type="email" 
            placeholder="Enter parent email" 
            className="p-3 rounded-lg border border-slate-200"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button 
            disabled={status === 'loading'}
            className="bg-slate-800 text-white p-3 rounded-lg font-bold hover:bg-slate-900"
          >
            {status === 'loading' ? 'Sending...' : 'Get Roadmap PDF'}
          </button>
        </>
      )}
    </form>
  );
}
// 'use client';
// import { useState } from 'react';

// export default function LeadMagnetForm() {
//   const [email, setEmail] = useState('');
//   const [status, setStatus] = useState('idle'); // idle, loading, success

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('loading');
    
//     // API call to your own backend/API route
//     await fetch('/api/send-curriculum', {
//       method: 'POST',
//       body: JSON.stringify({ email }),
//     });

//     setStatus('success');
//   };

//   return (
//     <form onSubmit={handleSubmit} className="flex flex-col gap-3">
//       {status === 'success' ? (
//         <p className="text-green-600 font-bold">Thanks! Check your email for the PDF.</p>
//       ) : (
//         <>
//           <input 
//             type="email" 
//             placeholder="Enter parent email" 
//             className="p-3 rounded-lg border border-slate-200"
//             required
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//           <button 
//             disabled={status === 'loading'}
//             className="bg-slate-800 text-white p-3 rounded-lg font-bold hover:bg-slate-900"
//           >
//             {status === 'loading' ? 'Sending...' : 'Get Roadmap PDF'}
//           </button>
//         </>
//       )}
//     </form>
//   );
// }