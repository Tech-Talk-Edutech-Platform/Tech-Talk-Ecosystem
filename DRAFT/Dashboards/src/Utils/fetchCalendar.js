
import { supabase } from "../supabaseClient";

const fetchEvents = async () => {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, title, start_time, end_time");

  return data.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start_time,
    end: e.end_time
  }));
};
// Real-time updates (optional but 🔥)
// supabase
//   .channel("calendar_changes")
//   .on(
//     "postgres_changes",
//     { event: "*", schema: "public", table: "calendar_events" },
//     payload => refetchEvents()
//   )
//   .subscribe();
