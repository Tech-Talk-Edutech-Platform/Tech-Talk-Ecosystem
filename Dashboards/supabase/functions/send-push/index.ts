import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import WebPush from "https://esm.sh/web-push"

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;

WebPush.setVapidDetails(
  'mailto:admin@techtalk-hub.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

serve(async (req) => {
  const { tutor_id, title, body } = await req.json();

  // 1. Fetch the subscription from your 'users' table
  // (Using a service role client here to bypass RLS for the backend)
  const { data: user } = await supabase
    .from('users')
    .select('push_subscription')
    .eq('id', tutor_id)
    .single();

  if (!user?.push_subscription) {
    return new Response("No subscription found", { status: 404 });
  }

  // 2. Send the Push
  try {
    await WebPush.sendNotification(
      JSON.parse(user.push_subscription),
      JSON.stringify({ title, body, url: '/calendar' })
    );
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})