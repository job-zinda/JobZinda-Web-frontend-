import Link from "next/link";

const POINTS = [
  { icon: "travel_explore", text: "Discover verified freelancers near you" },
  { icon: "verified_user", text: "Secure and seamless chat & calls" },
  { icon: "auto_awesome", text: "Showcase your work to thousands" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="primary-gradient relative hidden w-[44%] flex-col justify-between overflow-hidden p-12 text-white lg:flex">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-tertiary-container/20 blur-3xl" />
        <Link href="/" className="relative">
          <img src="/logo-wordmark.png" alt="Job Zinda" className="h-9 w-auto" />
        </Link>
        <div className="relative">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight xl:text-5xl">
            Find your dream job.
            <br />
            Hire the right talent.
          </h1>
          <ul className="mt-10 space-y-4">
            {POINTS.map((p) => (
              <li key={p.icon} className="flex items-center gap-3 text-white/90">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <span className="material-symbols-outlined">{p.icon}</span>
                </span>
                <span className="font-medium">{p.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} Job Zinda</p>
      </aside>
      <main className="flex flex-1 items-center justify-center bg-background px-5 py-10">
        <div className="w-full max-w-lg">
          <Link href="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl" />
            <span className="font-headline text-xl font-black tracking-tighter text-primary">Job Zinda</span>
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
