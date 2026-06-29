import { supabase } from "./supabase"; // Adjust this path based on where you initialize your supabase client

export async function confirmBooking(formData, type = "trial") {
  const booking = {
    parent_name: formData.parentName,
    student_name: formData.studentName,
    email: formData.email,
    phone: formData.phone,
    course_title: formData.courseTitle || formData.planName || null,
    type: type,
    status: "upcoming",
    created_at: new Date().toISOString(),
  };

  // 1. Save to your main bookings table
  const { error: bookingError } = await supabase
    .from("bookings")
    .insert([booking]);

  if (bookingError) {
    console.error("Booking entry failed:", bookingError.message);
    throw bookingError;
  }

  // 2. If it's a free trial layout, sync to lead capturing pipeline table
  if (type === "trial") {
    const { error: leadError } = await supabase
      .from("trial_leads")
      .insert([
        {
          parent_name: formData.parentName,
          email: formData.email,
          created_at: new Date().toISOString(),
        }
      ]);

    if (leadError) {
      console.error("Lead generation registration failed:", leadError.message);
      // Optional: don't block the execution completely if the primary booking succeeded
    }
  }
}