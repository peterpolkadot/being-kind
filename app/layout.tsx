import type { Metadata } from "next";
import "./globals.css";
import { getRun } from "./lib/supabase";

export async function generateMetadata(): Promise<Metadata> {
  const run = await getRun();
  const topic = run?.topic ?? process.env.SITE_TOPIC ?? "Site";
  return {
    title: { default: topic, template: `%s | ${topic}` },
    description: `Everything about ${topic}`,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const run = await getRun();
  const topic = run?.topic ?? process.env.SITE_TOPIC ?? "Site";

  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <a href="/" className="font-bold text-xl text-gray-900 hover:text-amber-600 transition-colors capitalize">
              {topic}
            </a>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">
          {children}
        </main>
        <footer className="border-t border-gray-100 mt-20">
          <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} {topic}
          </div>
        </footer>
      </body>
    </html>
  );
}
