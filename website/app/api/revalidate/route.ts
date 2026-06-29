import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';
import { parseBody } from 'next-sanity/webhook';

export async function POST(req: NextRequest) {
  try {
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(
      req,
      process.env.SANITY_REVALIDATE_SECRET // Define this in .env.local
    );

    if (!isValidSignature) {
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // Revalidate the /about page whenever any document changes
    // You can customize this to revalidate based on body._type if needed
    revalidatePath('/about');

    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return new NextResponse('Error revalidating', { status: 500 });
  }
}