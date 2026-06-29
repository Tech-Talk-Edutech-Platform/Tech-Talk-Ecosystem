import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  const { email } = await req.json();

  try {
    // 1. Email to the Parent (with the link to your PDF)
    await resend.emails.send({
      from: 'Tech Talk Hub <hello@techtalkhub.com>',
      to: email,
      subject: 'Your Coding Roadmap from Tech Talk Hub',
      html: `<p>Hi there! Thanks for your interest in Tech Talk Hub.</p>
             <p>Here is your PDF Roadmap: <a href="YOUR_PDF_URL_HERE">Download Now</a></p>`
    });

    // 2. Notification to You
    await resend.emails.send({
      from: 'System <notifications@techtalkhub.com>',
      to: 'your-email@example.com', // Put your email here
      subject: 'New Lead: Curriculum Download',
      text: `New lead signed up for the curriculum roadmap: ${email}`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}