import { supabase } from "../supabase";

export const getSessionId = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
};