// const [{ data: issues }] = await Promise.all([
//   supabase
//     .from("issues")
//     .select(`
//       id,
//       title,
//       status,
//       priority,
//       created_at,
//       users:reported_by(full_name)
//     `)
//     .order("created_at", { ascending: false })
// ]);
// const [issues, setIssues] = useState([]);
