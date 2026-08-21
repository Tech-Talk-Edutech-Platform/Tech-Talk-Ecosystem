
import { createClient } from "@supabase/supabase-js";

// const supabaseUrl = 'https://iinwzibplknjqmofevpw.supabase.co'
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlpbnd6aWJwbGtuanFtb2ZldnB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMjgxODEsImV4cCI6MjA4NTcwNDE4MX0.6EJzg0Tbt4feUic5kGgP9Alnhtty2yuDZ7B47OZCeIA'

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;


export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// import { createServerClient } from '@supabase/ssr';
// import { cookies } from 'next/headers';

// export async function createClient() {
//   const cookieStore = await cookies();

//   const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//   const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

//   if (!supabaseUrl || !supabaseKey) {
//     throw new Error("Missing Supabase environment variables.");
//   }

//   return createServerClient(supabaseUrl, supabaseKey, {
//     cookies: {
//       getAll() {
//         return cookieStore.getAll();
//       },
//       setAll(cookiesToSet) {
//         try {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             cookieStore.set(name, value, options)
//           );
//         } catch {
//           // The `setAll` method was called from a Server Component.
//         }
//       },
//     },
//   });
// }