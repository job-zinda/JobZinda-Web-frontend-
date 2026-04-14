import DashboardLayout from "@/components/DashboardLayout";

export default function FreelancersPage() {
  return (
    <DashboardLayout>
      <div className="h-full relative flex flex-col md:flex-row overflow-hidden flex-1">
{/*  Search & Filter Header (Floating atop map)  */}
<div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-4xl px-4">
<div className="bg-surface/80 backdrop-blur-2xl rounded-2xl shadow-xl p-4 flex flex-col md:flex-row items-center gap-4 border border-outline-variant/10">
<div className="flex-1 w-full relative">
<span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input className="w-full pl-12 pr-4 py-3 bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-on-surface-variant/60" placeholder="Search freelancers by name or role..." type="text"/>
</div>
<div className="flex items-center gap-3 w-full md:w-auto">
<div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-primary text-sm">distance</span>
<span className="text-sm font-medium whitespace-nowrap">15 km</span>
</div>
<div className="flex items-center gap-2 bg-surface-container-low px-4 py-3 rounded-xl cursor-pointer hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-primary text-sm">tune</span>
<span className="text-sm font-medium">Filters</span>
</div>
<button className="bg-gradient-to-br from-primary to-primary-container text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                        Update Map
                    </button>
</div>
</div>
</div>
{/*  Map Area  */}
<div className="flex-1 h-full relative overflow-hidden bg-surface-container-low">
{/*  Simulated Map Image  */}
<img className="w-full h-full object-cover opacity-60" data-alt="stylized vector city map of Austin Texas with soft pastel colors, purple highlights for landmarks and clean roads" data-location="Austin, Texas" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIpooLy7iBhg6hrPJHBwEw7_YMZP_Xxm6TUxjOao4LnOpNAplPRHiXLXvX1Z2GykkA7MJoDcazDqmGl4cl1SNGbMpBtQmLkMuH6LkHTeqdcrtgpOgnwtxCqtQaX_HD8qJHcJWUHWM-dLEvMonCb2PMcoKn9E8wPaWt6Sma498aYB6zvsHDpbuBMyW5RVumapwm1qI2SQPVMg0qnptTB29pXbFCfUSsvgzPc8_ecteppx-juKXtOwuiGBbaEagX7b-07DPgAzFG_ss"/>
{/*  Map Overlay UI (Pins)  */}
<div className="absolute inset-0 pointer-events-none">
{/*  Pin 1  */}
<div className="absolute top-[35%] left-[42%] pointer-events-auto cursor-pointer group">
<div className="relative flex flex-col items-center">
<div className="bg-white p-1 rounded-full shadow-lg border-2 border-primary group-hover:scale-110 transition-transform">
<img className="w-10 h-10 rounded-full object-cover" data-alt="portrait of a male graphic designer smiling wearing a minimal grey shirt on a soft beige background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUxBrto0RZXnOul0mrbXXmdlCJHvIsr1dOPs3CX9rb-KiNrnZVjjRHUuTL250xMdoNPgbPVdCny3iy1CRhwWZTqIjCvUMbQjpx_wkneQmdTjQoVRR5QxL4XMNwehFxVWuxkKmwyCTgopR7lH1LnvUR44oKdyhiUaex7dkwUPeB-rbFc5-I-rXb7NzMlkAXRydlqn-wMtmBNWNDQpIMTll4URExPjGsRpoD5cYLJA7YFCOa2jAIBCCsqXJfXbnV3Jf91M1qqWmKhzE"/>
</div>
<div className="mt-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                            UX DESIGN
                        </div>
</div>
</div>
{/*  Pin 2  */}
<div className="absolute top-[60%] left-[25%] pointer-events-auto cursor-pointer group">
<div className="relative flex flex-col items-center">
<div className="bg-white p-1 rounded-full shadow-lg border-2 border-primary-container group-hover:scale-110 transition-transform">
<img className="w-10 h-10 rounded-full object-cover" data-alt="professional photo of a female software engineer in a modern office with natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJxUNhYg8_K201Pf0HGcZk8XxoH946Vhcr5RYOyKY5TvUOT1tjK9DyM7ZC1_OnyBAWhDEHGxLY8_PkXSEIuM38zgdCbwC0SSnHYaoehYD1JoFcdvyE6AOfkfIh5pOjzp2v53FYy-rTRdfRPifWMP2riL6N3zJKAV3surbsUB2lluvSn2Q-g2nRV6p7r_lF5WsdYSBuDblH8rI5TuacFSEvRRVvnbRgZGZsGwo5--VPZrmTwwUdiSZcbKuHyRrBBBYleIifalv4B08"/>
</div>
<div className="mt-2 bg-primary-container text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                            REACT DEV
                        </div>
</div>
</div>
{/*  Pin 3  */}
<div className="absolute top-[48%] left-[68%] pointer-events-auto cursor-pointer group">
<div className="relative flex flex-col items-center">
<div className="bg-white p-1 rounded-full shadow-lg border-2 border-tertiary group-hover:scale-110 transition-transform">
<img className="w-10 h-10 rounded-full object-cover" data-alt="close-up of a content strategist in creative studio workspace with blurred warm lights" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9ixTmDmaR9p6CAf06NsYtR8O0w27X45c_WTk0CIwLPjQctBEGSFZtkSqvDcMXMrkGb1w5yv7qHfhAv3CFr3eIUL_TXxx0O-nb6MxE1pNUdEQmXHCk3Bl5YeTG4yVwiSNpeNmgzx0293ZtY3Oz5Z9RoimvA8TTck1L8jRwdj5mdZ4Ppua0UGjgc5wKX-GTvaQQ4LNiw-jdhmPGuuYWSEK4Rg9KvyM544fHHma0hvVhPA5BuTWgD3gBaG5xpim3Ptg11ZlVgek5JvU"/>
</div>
<div className="mt-2 bg-tertiary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
                            CONTENT
                        </div>
</div>
</div>
</div>
{/*  Map Controls  */}
<div className="absolute bottom-10 right-10 flex flex-col gap-2 z-20">
<button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined">add</span>
</button>
<button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined">remove</span>
</button>
<button className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary mt-4 hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined" style={{"fontVariationSettings":"'FILL' 1"}}>my_location</span>
</button>
</div>
</div>
{/*  Side Panel: Freelancer Cards  */}
<div className="w-full md:w-96 lg:w-[420px] h-1/2 md:h-full bg-white border-l border-outline-variant/10 shadow-2xl z-40 flex flex-col">
<div className="p-6 border-b border-outline-variant/10">
<div className="flex justify-between items-center mb-4">
<h3 className="text-xl font-bold font-headline text-on-surface">Freelancers Nearby</h3>
<span className="text-sm font-medium text-primary">24 found</span>
</div>
<div className="flex gap-2">
<button className="bg-primary text-white px-4 py-1.5 rounded-full text-xs font-semibold">Highest Rated</button>
<button className="bg-surface-container-low text-on-surface-variant px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-surface-container transition-colors">Available Now</button>
</div>
</div>
<div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
{/*  Card 1  */}
<div className="group p-5 rounded-2xl bg-surface-container-lowest hover:bg-surface-bright border border-transparent hover:border-primary-container/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(114,48,230,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(114,48,230,0.08)]">
<div className="flex items-start gap-4 mb-4">
<img className="w-16 h-16 rounded-xl object-cover" data-alt="square portrait of a male graphic designer smiling wearing a minimal grey shirt on a soft beige background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDb7YlCCwsa8M9MDcAVcL_r2Uzqo227iGHJyASYg6pbxL-nYcCKeY_Ls9F2Q0fthYUvWAnS1hTlqUqA1Wq6jUoZEsm8ej47slZwWgDsd0W7iVgzwqmuQFTPsWer3F1qku0V3Sh-RPeAZxXStfFdTk0oydmG8PYZviOKgdkrnpKZBROYm7fnKcLJZp23qD4uTypNFbBSk7fVhZ-8pIsaFtv0ix33bJXuw06I0k6MEqmFIiBGaiLpEa2H2GEgi8as7ECi68Xt6FvEHtM"/>
<div className="flex-1">
<h4 className="font-bold text-lg text-on-surface">Alex Rivera</h4>
<p className="text-sm text-on-surface-variant">Senior Product Designer</p>
<div className="flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-amber-400 text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-xs font-bold">4.9</span>
<span className="text-[10px] text-on-surface-variant">(120+ reviews)</span>
</div>
</div>
<span className="text-primary font-bold text-lg">$85<span className="text-xs font-normal text-on-surface-variant">/hr</span></span>
</div>
<div className="flex flex-wrap gap-2 mb-4">
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Figma</span>
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">UI/UX</span>
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Prototyping</span>
</div>
<button className="w-full py-3 rounded-xl bg-surface-container-highest text-primary font-bold text-sm hover:bg-primary-container hover:text-white transition-all">
                        View Profile
                    </button>
</div>
{/*  Card 2  */}
<div className="group p-5 rounded-2xl bg-surface-container-lowest hover:bg-surface-bright border border-transparent hover:border-primary-container/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(114,48,230,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(114,48,230,0.08)]">
<div className="flex items-start gap-4 mb-4">
<img className="w-16 h-16 rounded-xl object-cover" data-alt="professional square photo of a female software engineer in a modern office with natural light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh9far_KRQoQAZdCIinebJDfzD1FfJnUMlCN9vX7W6B2kWExIUQHG-47q6AIpxuO3Bt-bhKMbcGVe3w8u_d5LtkbRUVp_5u8WGEVznNUIbkw0_-xreUOVQzsTGZpj-0xMYvePOiBBrOsmUPvE-x80W47Eo8Bh5X11iWFlymDhBlfQhtM8m-DF36bI_LbOdvNfBzNREFSYrbaQDEi2yKXNx63K8KKQszOdncMf47pUczsLV2V6mptEEi-GuvqYf5uZrLo0Q6Z8I1xM"/>
<div className="flex-1">
<h4 className="font-bold text-lg text-on-surface">Elena Vance</h4>
<p className="text-sm text-on-surface-variant">Full Stack Developer</p>
<div className="flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-amber-400 text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-xs font-bold">5.0</span>
<span className="text-[10px] text-on-surface-variant">(45 reviews)</span>
</div>
</div>
<span className="text-primary font-bold text-lg">$110<span className="text-xs font-normal text-on-surface-variant">/hr</span></span>
</div>
<div className="flex flex-wrap gap-2 mb-4">
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">React</span>
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Node.js</span>
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">TypeScript</span>
</div>
<button className="w-full py-3 rounded-xl bg-surface-container-highest text-primary font-bold text-sm hover:bg-primary-container hover:text-white transition-all">
                        View Profile
                    </button>
</div>
{/*  Card 3  */}
<div className="group p-5 rounded-2xl bg-surface-container-lowest hover:bg-surface-bright border border-transparent hover:border-primary-container/20 transition-all cursor-pointer shadow-[0_4px_12px_rgba(114,48,230,0.03)] hover:shadow-[0_8px_24px_-4px_rgba(114,48,230,0.08)]">
<div className="flex items-start gap-4 mb-4">
<img className="w-16 h-16 rounded-xl object-cover" data-alt="portrait of a creative content strategist in modern workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQDUIp90Ezp66HsFmw03weh0S9tmpP6Im7cVsZi9xNHmEE8PyIviEZY0FyGbVsF46QJ4V18RyDc4AjMkh05rPk2Iyao-0QHjqbxveOv0WyWUXFYqoGKBU61aQIhO4J9huMyo9dA4mZcL1eMQcvpuz_G6xAhf0JI-U9pAMy9f0vUUD-Ip9elFVZWzeu7OeQc1vblAbW_BjHoOLaFoL-0JACllw6o72XD0IYRp-QB0EY7rb8LsSh7zq9UwwJVc95q5E8hh2DlvwO7cQ"/>
<div className="flex-1">
<h4 className="font-bold text-lg text-on-surface">Julian Black</h4>
<p className="text-sm text-on-surface-variant">Content Strategist</p>
<div className="flex items-center gap-1 mt-1">
<span className="material-symbols-outlined text-amber-400 text-sm" style={{"fontVariationSettings":"'FILL' 1"}}>star</span>
<span className="text-xs font-bold">4.8</span>
<span className="text-[10px] text-on-surface-variant">(89 reviews)</span>
</div>
</div>
<span className="text-primary font-bold text-lg">$65<span className="text-xs font-normal text-on-surface-variant">/hr</span></span>
</div>
<div className="flex flex-wrap gap-2 mb-4">
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">Copywriting</span>
<span className="bg-surface-container-low px-3 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase text-on-surface-variant">SEO</span>
</div>
<button className="w-full py-3 rounded-xl bg-surface-container-highest text-primary font-bold text-sm hover:bg-primary-container hover:text-white transition-all">
                        View Profile
                    </button>
</div>
</div>
</div>
      </div>
    </DashboardLayout>
  );
}
