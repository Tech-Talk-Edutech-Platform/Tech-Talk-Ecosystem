import { supabase } from "../supabase";

/**
 * Triggers a push notification to a specific tutor
 * @param {string} tutorId - The UUID of the tutor (e.g., Nancy)
 * @param {string} message - The alert text
 */
/**
 * ACTIONS: Change things in the DB
 */
export const updateUserRole = async (userId, newRole) => {
  const { data, error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('id', userId);
  if (error) throw error;
  return data;
};

export const notifyTutor = async (tutorId, message) => {
  // Always log for dev debugging
  console.log(`[Admin Action] Notifying ${tutorId}: ${message}`);
  
  return await supabase.functions.invoke('send-push', {
    body: { tutor_id: tutorId, title: "Class Update", body: message },
  });
};

/**
 * MONITORING: Watch things in the DB
 */
export const subscribeToClasses = (onUpdate) => {
  return supabase
    .channel("live_classes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "calendar_events" },
      (payload) => onUpdate(payload)
    )
    .subscribe();
};
// export const notifyTutor = async (tutorId, message) => {
//   const { data, error } = await supabase.functions.invoke('send-push', {
//     body: { 
//       tutor_id: tutorId, 
//       title: "New Schedule Update", 
//       body: message 
//     },
//   });

//   if (error) console.error("Push failed:", error);
//   return data;
// };