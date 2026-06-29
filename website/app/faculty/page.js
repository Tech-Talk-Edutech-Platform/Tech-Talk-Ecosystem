import FacultyDirectory from "@/components/FacultyDirectory";
export default function FacultyPage() {
  return <FacultyDirectory />;
}
// import { client, urlFor } from '@/lib/sanity';
// import Image from 'next/image';
// import { FaLinkedin, FaTwitter, FaGithub } from "react-icons/fa";

// async function getTeam() {
//   return await client.fetch(`*[_type == "teamMember"] | order(orderRank)`);
// }

// export default async function FacultyDirectoryPage() {
//   const team = await getTeam();

//   if (!team || team.length === 0) return <div className="text-center py-20">No team members found.</div>;

//   return (
//     <div className="bg-slate-50 min-h-screen py-16 px-6 sm:px-12 lg:px-24">
//       {/* Header Section */}
//       <section className="text-center mb-16 max-w-4xl mx-auto">
//         <h1 className="text-5xl font-bold text-slate-900 mb-6">Meet Our Team</h1>
//         <p className="text-lg text-slate-600 leading-relaxed mb-4">
//           Industry veterans and expert educators dedicated to your success. 
//           We combine real-world experience with a passion for teaching the next generation of coders.
//         </p>
//       </section>

//       {/* Team Grid */}
//       <section className="grid gap-12 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
//         {team.map((member) => (
//           <article key={member._id} className="bg-white p-8 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center">
//             <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 mb-6 relative">
//               {member.image && (
//                 <Image 
//                   src={urlFor(member.image).url()} 
//                   alt={member.name} 
//                   fill 
//                   className="object-cover" 
//                 />
//               )}
//             </div>
//             <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
//             <p className="text-pink-600 font-semibold mb-3">{member.title}</p>
//             <p className="text-slate-500 text-sm mb-6 leading-relaxed">{member.bio}</p>
            
//             <div className="flex space-x-6 text-slate-400">
//               {member.linkedin && <a href={member.linkedin} className="hover:text-pink-600"><FaLinkedin size={20} /></a>}
//               {member.twitter && <a href={member.twitter} className="hover:text-pink-600"><FaTwitter size={20} /></a>}
//               {member.github && <a href={member.github} className="hover:text-pink-600"><FaGithub size={20} /></a>}
//             </div>
//           </article>
//         ))}
//       </section>

//       {/* Recruitment CTA */}
//       <section className="text-center mt-20">
//         <p className="text-slate-600 mb-6">Want to help shape the future of tech education?</p>
//         <a href="/careers" className="bg-slate-900 text-white px-8 py-4 rounded-full font-bold hover:bg-slate-800 transition">
//           View Open Roles
//         </a>
//       </section>
//     </div>
//   );
// }