7️⃣ How Role-Based Access Works (Supabase)

In profiles table:

role ENUM('owner','ops','tutor','marketer')

On login:

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single();

Store role in app state → route guards handle the rest.
OPS
profiles (id, full_name, role)
classes (id, tutor_id, student_name, start_time, status)
tutors (id, name, active)
payments (id, tutor_id, amount, status)
issues (id, title, status)
LEAD
profiles   (id, role)
payments   (id, amount, status, created_at)
leads      (id, source, status)
students   (id, active)
tutors     (id, active)
issues     (id, status)
