import DashboardLayout from "@/components/DashboardLayout";

export default function SubscriptionPage() {
  return (
    <DashboardLayout>
      <div className="flex-grow flex flex-col overflow-hidden">
        <main className="max-w-6xl mx-auto px-8 py-6 lg:py-8">
        {/*  Hero Section  */}
        <section className="text-center mb-6 max-w-2xl mx-auto">
<h1 className="font-headline text-4xl lg:text-5xl font-extrabold tracking-tight text-on-surface mb-6">
                Elevate Your Career Path
            </h1>
<p className="text-on-surface-variant text-base lg:text-lg leading-relaxed mb-10">
                Unlock premium editorial features, advanced analytics, and priority placement in the global marketplace.
            </p>
{/*  Toggle  */}
<div className="flex items-center justify-center gap-4">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Monthly</span>
<button className="w-12 h-6 bg-surface-container-high rounded-full p-1 flex items-center transition-all duration-300">
<div className="w-4 h-4 bg-primary rounded-full shadow-sm translate-x-6"></div>
</button>
<span className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    Yearly
                    <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold">Save 20%</span>
</span>
</div>
</section>
        {/*  Pricing Grid  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
{/*  Free Plan  */}
<div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 flex flex-col transition-all hover:shadow-xl hover:shadow-primary/5">
<div className="mb-8">
<h3 className="font-headline text-lg font-bold mb-1">Free</h3>
<p className="text-on-surface-variant text-xs">Essentials for starting out.</p>
</div>
<div className="mb-8 flex items-baseline gap-1">
<span className="text-4xl font-extrabold text-on-surface">$0</span>
<span className="text-outline text-sm">/mo</span>
</div>
<ul className="space-y-4 mb-10 flex-grow">
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Basic Profile Portfolio
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Apply to 5 Jobs / Mo
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Standard Job Alerts
                    </li>
</ul>
<button className="w-full py-3 px-6 rounded-xl bg-surface-container-highest text-on-surface-variant font-bold text-sm transition-all cursor-default">
                    Current Plan
                </button>
</div>
{/*  Pro Plan (Active/Highlighted)  */}
<div className="relative bg-surface-container-lowest rounded-2xl p-8 flex flex-col shadow-[0_20px_40px_-12px_rgba(114,48,230,0.12)] border-2 border-primary scale-105 z-10">
<div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-3 py-1 rounded-full font-bold uppercase tracking-widest shadow-md">
                    Most Popular
                </div>
<div className="mb-8">
<h3 className="font-headline text-lg font-bold mb-1">Pro</h3>
<p className="text-on-surface-variant text-xs">Professional tools for growth.</p>
</div>
<div className="mb-8 flex items-baseline gap-1">
<span className="text-4xl font-extrabold text-on-surface">$24</span>
<span className="text-outline text-sm">/mo</span>
</div>
<ul className="space-y-4 mb-10 flex-grow">
<li className="flex items-center gap-3 text-sm text-on-surface">
<span className="material-symbols-outlined text-primary text-lg" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                        Curated Profile Badging
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface">
<span className="material-symbols-outlined text-primary text-lg" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                        Unlimited Job Applications
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface">
<span className="material-symbols-outlined text-primary text-lg" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                        Advanced Skill Analytics
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface">
<span className="material-symbols-outlined text-primary text-lg" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                        Priority Messenger Access
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface">
<span className="material-symbols-outlined text-primary text-lg" style={{"fontVariationSettings":"'FILL' 1"}}>check_circle</span>
                        No Platform Transaction Fees
                    </li>
</ul>
<button className="w-full py-3.5 px-6 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all transform active:scale-95">
                    Upgrade to Pro
                </button>
</div>
{/*  Enterprise Plan  */}
<div className="bg-surface-container-low border border-outline-variant/10 rounded-2xl p-8 flex flex-col transition-all hover:shadow-xl hover:shadow-primary/5">
<div className="mb-8">
<h3 className="font-headline text-lg font-bold mb-1">Enterprise</h3>
<p className="text-on-surface-variant text-xs">For teams and agencies.</p>
</div>
<div className="mb-8 flex items-baseline gap-1">
<span className="text-4xl font-extrabold text-on-surface">$89</span>
<span className="text-outline text-sm">/mo</span>
</div>
<ul className="space-y-4 mb-10 flex-grow">
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Custom Branding Kits
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Dedicated Success Manager
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        Team Collaboration Tools
                    </li>
<li className="flex items-center gap-3 text-sm text-on-surface-variant">
<span className="material-symbols-outlined text-primary text-lg">check_circle</span>
                        API Integration Access
                    </li>
</ul>
<button className="w-full py-3 px-6 rounded-xl bg-surface-container-highest text-primary font-bold text-sm hover:bg-primary/10 transition-all">
                    Contact Sales
                </button>
</div>
</div>
        {/*  Deep Dive Features  */}
        <section className="mt-16">
<div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
<div className="max-w-xl">
<h2 className="font-headline text-3xl font-bold text-on-surface mb-4">Deep Dive Features</h2>
<p className="text-on-surface-variant text-sm leading-relaxed">
                        Beyond the basics, TalentCurator offers a suite of editorial-grade tools designed to transform how you present and manage your professional identity.
                    </p>
</div>
<a className="text-primary font-bold text-sm flex items-center gap-2 group" href="#">
                    View Full Feature Comparison
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-12 gap-6">
{/*  Analytics Card  */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-low border border-outline-variant/10 rounded-3xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden group">
<div className="flex-1">
<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>insights</span>
</div>
<h3 className="text-xl font-headline font-bold mb-4">Advanced Analytics</h3>
<p className="text-on-surface-variant text-sm mb-6">Track profile views, application success rates, and skill demand in your specific niche with precision data.</p>
<ul className="space-y-3">
<li className="flex items-center gap-2 text-xs font-bold text-on-surface">
<div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Competitor Benchmarking
                            </li>
<li className="flex items-center gap-2 text-xs font-bold text-on-surface">
<div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                Weekly Performance Reports
                            </li>
</ul>
</div>
<div className="flex-1 w-full relative">
<img alt="Dashboard Analytics UI" className="rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnEnQTDhw1LoCuC4-ZmH_D0m7D_tuF-ndXTLtasx7oAlf9wUYoZnJ68VXwT_j4MSNyYiWn8ExoLt3cyxNO8a-ulvTh3t-WWWFwqzMPMHMDwv0qR4y1FLYKis6Lpgk4Wow6XxsW9BKFGIz7faKiut2sJSUUQTN9m2-IVEwPBc2Yxgm367nrPLM7p2azVQA-kRBNk1NRTW3BNW2ThLIeUKoDTL8IUpDRUVZRLK5vagjQSa2D4aVTZTzEdqMtsZ5EHzKTfAQgHhsAOE8"/>
</div>
</div>
{/*  Messaging Card  */}
<div className="col-span-12 lg:col-span-4 bg-tertiary-container/20 border border-tertiary/10 rounded-3xl p-10 flex flex-col">
<div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-6">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>forum</span>
</div>
<h3 className="text-xl font-headline font-bold mb-4 text-on-tertiary-container">Smart Messaging</h3>
<p className="text-on-tertiary-container/80 text-sm mb-8">AI-powered outreach and priority inbox to ensure you never miss an opportunity.</p>
<div className="mt-auto space-y-4">
<div className="bg-surface/80 p-3 rounded-xl flex items-center gap-3 shadow-sm">
<div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
<img alt="Contact" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDr7sF2EX-HZPeNzTSKwaAfxTHkbKFm-k8hSmQZtMadsiPQfI3McJWqIwy7yc48nRFR-CIiyhWmKQBkBq7BgBwWGTv_Oc4D-vwdAp6UdOpuvhnfw0WMzcUSUtqUosFQTubyI-JWFAmLroVEN1YIerOvlEJANhFOVyhpcx_DuAsDitHBA4TSOlyWQ_-FPTC-ha_cmmTPmtaCsmDi9aQY0mFxencyGWxmFH5v4VBuz6saPzKiVX7rH_aXuzMTQFkg75MJi9kA2fQ8HBM"/>
</div>
<div className="flex-1 h-1.5 bg-outline-variant/30 rounded-full"></div>
</div>
<div className="bg-primary/10 p-3 rounded-xl flex items-center gap-3 self-end w-4/5 ml-auto">
<div className="flex-1 h-1.5 bg-primary/20 rounded-full"></div>
</div>
</div>
</div>
{/*  Portfolio Card  */}
<div className="col-span-12 lg:col-span-5 bg-surface-container-high border border-outline-variant/10 rounded-3xl p-10 flex flex-col">
<div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>auto_awesome</span>
</div>
<h3 className="text-xl font-headline font-bold mb-4">Editorial Showcase</h3>
<p className="text-on-surface-variant text-sm leading-relaxed">Transform your static CV into a dynamic, editorial-style digital portfolio that tells your unique story.</p>
</div>
{/*  Security Card  */}
<div className="col-span-12 lg:col-span-7 bg-on-surface text-surface rounded-3xl p-10 flex items-center justify-between overflow-hidden relative">
<div className="max-w-xs relative z-10">
<h3 className="text-xl font-headline font-bold mb-4">Enterprise Grade Security</h3>
<p className="text-surface/70 text-sm">Rest easy with end-to-end encryption for all documents and private conversations.</p>
</div>
<div className="absolute right-[-20px] top-[-20px] opacity-10">
<span className="material-symbols-outlined text-[140px] rotate-12" style={{"fontVariationSettings":"'FILL' 1"}}>verified_user</span>
</div>
</div>
</div>
</section>
</main>
      </div>
    </DashboardLayout>
  );
}
