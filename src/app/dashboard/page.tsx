import DashboardLayout from "@/components/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="px-8 pb-12 pt-8">
        {/*  Welcome Header  */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-['Manrope'] font-black text-on-surface tracking-tight mb-2">Welcome back, Ahmed!</h1>
          <p className="text-on-surface-variant max-w-lg leading-relaxed">Your professional journey is looking bright. You have 4 new job matches today that align perfectly with your expertise.</p>
</section>
{/*  Bento Grid Metrics  */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] relative overflow-hidden group hover:bg-surface-bright transition-all">
<div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
<p className="text-outline font-medium mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">send</span>
            Active Applications
          </p>
<div className="flex items-baseline gap-3">
<span className="text-5xl font-black font-headline text-on-surface">12</span>
<span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+2 new</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] relative overflow-hidden group hover:bg-surface-bright transition-all">
<div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
<p className="text-outline font-medium mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">stars</span>
            New Job Matches
          </p>
<div className="flex items-baseline gap-3">
<span className="text-5xl font-black font-headline text-on-surface">04</span>
<span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">Top matches</span>
</div>
</div>
<div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] relative overflow-hidden group hover:bg-surface-bright transition-all">
<div className="absolute top-0 right-0 -translate-y-4 translate-x-4 w-24 h-24 bg-primary/5 rounded-full group-hover:scale-110 transition-transform"></div>
<p className="text-outline font-medium mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">visibility</span>
            Profile Views
          </p>
<div className="flex items-baseline gap-3">
<span className="text-5xl font-black font-headline text-on-surface">84</span>
<span className="text-sm font-bold text-on-surface-variant bg-surface-container-low px-2 py-0.5 rounded-full">This week</span>
</div>
</div>
</div>
{/*  Main Asymmetric Layout  */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
{/*  Left Column: Featured Jobs  */}
<div className="lg:col-span-8">
<div className="flex items-center justify-between mb-8">
<h2 className="text-2xl font-black font-headline text-on-surface tracking-tight">Featured Job Opportunities</h2>
<button className="text-primary font-bold text-sm hover:underline">View all opportunities</button>
</div>
<div className="space-y-6">
{/*  Job Card 1  */}
<div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-surface-bright transition-all group border border-transparent hover:border-primary/10">
<div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center p-3">
<img alt="Company logo" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" data-alt="minimalist modern corporate logo icon with abstract geometric shapes in dark blue and white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfjzv43cb6_ixd_Teh1m2dvtiznB3rbK4AhHvUpFtLgH1NBD3oY8hGsPQZoXJ6140LJ5mD-3K0eZc9QIPTV_khBXANHnXkLwEsVsmLL7bHmj9YRS1fSFZcqIO2U6eImVirKFre13_bDNBLH5lN9fRgFjBDWKDMJW8IICzobvr64wudU2gsUOVmUXASrcYC5soOdsHnFYuI0jwpX65gcr7oyhsf1csR4BHqPgpzt3dPPEioMTwpD16iWjlx5YN1Jbl_yjC7YWBGHAA"/>
</div>
<div className="flex-1">
<h3 className="text-lg font-bold text-on-surface mb-1">Senior UX Designer</h3>
<div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">domain</span> Linear Systems</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span> San Francisco, CA</span>
<span className="flex items-center gap-1 font-bold text-primary bg-primary/5 px-2 rounded">$140k - $180k</span>
</div>
</div>
<div className="flex items-center gap-3 w-full md:w-auto">
<button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-[0_8px_24px_-4px_rgba(114,48,230,0.2)] active:scale-95 duration-200">
                  Apply Now
                </button>
<button className="p-2.5 rounded-xl text-outline hover:text-primary hover:bg-primary/5 transition-all">
<span className="material-symbols-outlined">bookmark</span>
</button>
</div>
</div>
{/*  Job Card 2  */}
<div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-surface-bright transition-all group border border-transparent hover:border-primary/10">
<div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center p-3">
<img alt="Company logo" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" data-alt="minimal circle logo for a technology startup with sleek lines and soft gradients" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwH0yrIcODIFhN8hxJQoDgnck3tGUmBYk2Jp9ybrJrycUj7ZqHqXZUerNFgHA1FEQBRXrrsqZqZyA136WTia60IxH-2XgYX5pxxkhzTE2QVb7qkKaNOk1bQp24qfJbNA9oKNsHHxrXzV0NU7JuhkDMN1YmmPcT9C7YSxWBx4mRdO-F-KOus-cX0JZQEM76lTj10jQi5Es129O1RWzOX6PvyfDNoDCVuQTyxensxofaZBAR8WHOjdHNYpXMhCYsMn-xZU35t7U-F3I"/>
</div>
<div className="flex-1">
<h3 className="text-lg font-bold text-on-surface mb-1">Product Marketing Lead</h3>
<div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">domain</span> Velocity AI</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span> Remote</span>
<span className="flex items-center gap-1 font-bold text-primary bg-primary/5 px-2 rounded">$120k - $160k</span>
</div>
</div>
<div className="flex items-center gap-3 w-full md:w-auto">
<button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-[0_8px_24px_-4px_rgba(114,48,230,0.2)] active:scale-95 duration-200">
                  Apply Now
                </button>
<button className="p-2.5 rounded-xl text-outline hover:text-primary hover:bg-primary/5 transition-all">
<span className="material-symbols-outlined">bookmark</span>
</button>
</div>
</div>
{/*  Job Card 3  */}
<div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-surface-bright transition-all group border border-transparent hover:border-primary/10">
<div className="w-16 h-16 rounded-xl bg-surface-container flex items-center justify-center p-3">
<img alt="Company logo" className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" data-alt="bold modern logo for a digital health company with clean typography and a vibrant accent color" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlVuNzrVMEbt3OVd7wL_dKdl4OA1mOvS3b6utuPQp8h8GQWJWWRJrInDD8MArokAzsekgwcX8mbafhIaUbYdnZ4VPgNfVOrjS47EzHfwGo5hGCbzCnYC8zedfWPifeiM61h9BTSc7FhHUEzEf-E7xrYLcaKMvRmSzXg45edwF4Qk4asfOzUCOlwQdHE62J50dEjsxozXQ47QFxNiGGBqsls-WyWSa-2154-KTmNMlhYiqVScEaFWJ506M6vm4jIiArUqAHh0Gsmjw"/>
</div>
<div className="flex-1">
<h3 className="text-lg font-bold text-on-surface mb-1">Lead Data Scientist</h3>
<div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-on-surface-variant">
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">domain</span> HealthPulse</span>
<span className="flex items-center gap-1"><span className="material-symbols-outlined text-base">location_on</span> New York, NY</span>
<span className="flex items-center gap-1 font-bold text-primary bg-primary/5 px-2 rounded">$165k - $210k</span>
</div>
</div>
<div className="flex items-center gap-3 w-full md:w-auto">
<button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-br from-primary to-primary-container text-white font-bold shadow-[0_8px_24px_-4px_rgba(114,48,230,0.2)] active:scale-95 duration-200">
                  Apply Now
                </button>
<button className="p-2.5 rounded-xl text-outline hover:text-primary hover:bg-primary/5 transition-all">
<span className="material-symbols-outlined">bookmark</span>
</button>
</div>
</div>
</div>
</div>
{/*  Right Column: Activity Feed  */}
<div className="lg:col-span-4 space-y-8">
<div>
<h2 className="text-2xl font-black font-headline text-on-surface tracking-tight mb-8">Recent Activity</h2>
<div className="relative pl-8 space-y-8 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/20">
{/*  Activity Item 1  */}
<div className="relative">
<div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white shadow-lg ring-4 ring-surface">
<span className="material-symbols-outlined text-xs" style={{"fontVariationSettings":"'FILL' 1"}}>check</span>
</div>
<p className="text-sm font-bold text-on-surface mb-1">Application Submitted</p>
<p className="text-xs text-on-surface-variant mb-2">You applied for the <span className="font-bold text-primary">UI/UX Architect</span> role at Framer.</p>
<p className="text-[10px] uppercase tracking-wider text-outline font-bold">2 hours ago</p>
</div>
{/*  Activity Item 2  */}
<div className="relative">
<div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-white shadow-lg ring-4 ring-surface">
<span className="material-symbols-outlined text-xs" style={{"fontVariationSettings":"'FILL' 1"}}>visibility</span>
</div>
<p className="text-sm font-bold text-on-surface mb-1">Profile Viewed</p>
<p className="text-xs text-on-surface-variant mb-2">A recruiter from <span className="font-bold text-on-surface">Google</span> viewed your portfolio.</p>
<p className="text-[10px] uppercase tracking-wider text-outline font-bold">5 hours ago</p>
</div>
{/*  Activity Item 3  */}
<div className="relative">
<div className="absolute -left-8 top-1 w-6 h-6 rounded-full bg-tertiary flex items-center justify-center text-[10px] text-white shadow-lg ring-4 ring-surface">
<span className="material-symbols-outlined text-xs" style={{"fontVariationSettings":"'FILL' 1"}}>mail</span>
</div>
<p className="text-sm font-bold text-on-surface mb-1">New Message</p>
<p className="text-xs text-on-surface-variant mb-2">Sarah Miller sent you a message regarding your application.</p>
<p className="text-[10px] uppercase tracking-wider text-outline font-bold">Yesterday</p>
</div>
</div>
</div>
{/*  Upgrade CTA Card  */}
<div className="p-8 rounded-2xl bg-primary text-white shadow-[0_20px_40px_-10px_rgba(114,48,230,0.3)] relative overflow-hidden group">
<div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full group-hover:scale-110 transition-transform"></div>
<h3 className="text-xl font-black font-headline mb-3 relative z-10">Land your dream job 2x faster</h3>
<p className="text-primary-container-variant text-sm mb-6 relative z-10 opacity-90 leading-relaxed">Unlock direct messages to recruiters and see how you rank against other applicants.</p>
<button className="w-full py-3 bg-white text-primary font-black rounded-xl hover:bg-surface-container-lowest transition-colors relative z-10">
              Upgrade to Premium
            </button>
</div>
</div>
</div>
</div>
    </DashboardLayout>
  );
}
