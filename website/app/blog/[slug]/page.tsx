import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";

export default async function BlogPostPage({ params }) {
  const { slug } = await params;

  // In a real application, fetch post data using the `slug` from your DB/CMS/Supabase
  return (
    <main className="min-h-screen bg-background text-text selection:bg-secondary/20 pt-28 pb-24">
      <article className="max-w-3xl mx-auto px-6">
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-sm font-medium text-text/60 hover:text-secondary mb-8 transition-colors"
        >
          <ArrowLeft size={16} /> Back to all articles
        </Link>

        <div className="space-y-4 mb-8">
          <span className="text-xs font-bold text-secondary uppercase tracking-wider bg-secondary/10 px-3 py-1 rounded-full">
            Engineering
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-text">
            Building Scalable Backend Systems with Python & FastAPI
          </h1>
          <div className="flex items-center gap-2 text-sm text-text/60">
            <Calendar size={14} /> August 10, 2026 • Published by Tech Talk Hub Team
          </div>
        </div>

        {/* Blog Body Content */}
        <div className="prose dark:prose-invert max-w-none text-text/80 space-y-6 text-base sm:text-lg leading-relaxed">
          <p>
            Welcome to our technical breakdown. When scaling backend infrastructure, performance and data cleanliness are paramount...
          </p>
          <h2 className="text-2xl font-bold text-text pt-4">1. Architecture Overview</h2>
          <p>
            By leveraging asynchronous routing and clean repository patterns, our systems maintain swift response times even under heavy traffic...
          </p>
        </div>
      </article>
    </main>
  );
}