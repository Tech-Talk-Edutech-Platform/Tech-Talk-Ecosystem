// utils/fetchTodaysClasses.js
import { supabase } from "../supabase";

/**
 * Fetches the number of classes booked for a tutor today
 * @param {string} tutorId 
 * @returns {number}
 */
export async function fetchTodaysClasses(tutorId) {
  if (!tutorId) return 0;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*", { count: 'exact' }) // count only
      .eq("tutor_id", tutorId)
      .gte("start_time", todayStart.toISOString())
      .lte("start_time", todayEnd.toISOString());

    if (error) throw error;

    return data?.length || 0;
  } catch (err) {
    console.error("Fetch Today's Classes Error:", err.message);
    return 0;
  }
}
