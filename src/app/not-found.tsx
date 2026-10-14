import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <img src="/logo.png" alt="" className="h-16 w-16 rounded-2xl shadow-lg shadow-primary/25" />
      <h1 className="text-3xl font-extrabold">Page not found</h1>
      <p className="max-w-sm text-sm text-on-surface-variant">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <Link href="/" className="primary-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white">
        Back to home
      </Link>
    </main>
  );
}
