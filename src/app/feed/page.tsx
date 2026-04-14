import DashboardLayout from "@/components/DashboardLayout";

export default function FeedPage() {
  return (
    <DashboardLayout>
      <div className="pt-8 pb-12 px-4 md:px-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-8">
        {/*  Main Feed Content  */}
        <section className="flex-1 max-w-2xl space-y-8">
          {/*  Create Post (Glassmorphism)  */}
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] border border-outline-variant/10">
<div className="flex gap-4">
<div className="h-12 w-12 rounded-full overflow-hidden shrink-0">
<img alt="User profile avatar" className="h-full w-full object-cover" data-alt="close-up of a smiling young professional woman, soft natural lighting, airy office background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-ekZoYXxZOmLwqSC0P1dK7Stl8zqoYxYOH9ey7y_8jDiFmMAABVbY-Y7Yuk84anDU5jPtA5LI29ru21MW7S2iLbfT1Ai_XBMJ1KPVDisnOrDnSbrE9yzJSOC6KVE7Xi1rBqOnmUCqknnPP0pXUMQ5gzC1XdICSegiQq3wXiVZgSgNvR30fy4a0OMCYABuryHYYQCOGCZG0pHS1GBtI5C8pNL7fTNyV1756rthMJPhOrhqDKX2OtyY5ETzreJdQjDC02Z_w4zNI1I"/>
</div>
<div className="flex-1">
<button className="w-full text-left px-5 py-3 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container transition-colors">
              Start a post, Share an update...
            </button>
</div>
</div>
<div className="flex justify-between mt-4 px-2 border-t border-outline-variant/5 pt-4">
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined text-primary-container" data-icon="image">image</span>
<span className="text-sm font-medium">Photo</span>
</button>
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined text-[#8A4FFF]" data-icon="videocam">videocam</span>
<span className="text-sm font-medium">Video</span>
</button>
<button className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors">
<span className="material-symbols-outlined text-tertiary" data-icon="calendar_month">calendar_month</span>
<span className="text-sm font-medium">Event</span>
</button>
</div>
</div>
{/*  Video Post  */}
<article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] border border-outline-variant/10">
<div className="p-6">
<div className="flex items-center gap-3 mb-4">
<div className="h-12 w-12 rounded-full overflow-hidden">
<img alt="Recruiter profile" className="h-full w-full object-cover" data-alt="portrait of a confident recruiter in a modern workspace, warm lighting, professional attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBQHHSjxwhMvfNMCFaPVaYgYWo0cJg_kRZthqeh_qm4Ud3V7Rx2Ko4LBdIphsUyJn2NUw6GJWQzVodNjhBQqK34UwNk7M9PEroELQbrvx9KuNpJB5AyEw4c2AOno-0SZtevveRcXT8iolYHSvNhZ1oWhSElQpLilqsENOGFGhYUhDUug5YVrT4mI294N7xZ4PAJ_U0kzvpQRLiYHrExo3eu4WrQzDUVTSN_LfpSziDTKIEeLnudJI3XpobcIslO5CVKcmlas_SwnPg"/>
</div>
<div>
<h3 className="font-bold text-[#34313A]">Sarah Jenkins</h3>
<p className="text-xs text-on-surface-variant">Lead Recruiter at Luminary Design • 2h ago</p>
</div>
</div>
<p className="text-on-surface mb-4 leading-relaxed">Excited to announce we're looking for 3 New Product Designers to join our remote-first team! Watch the video to learn more about our culture and the impact you'll make. 🎨✨</p>
</div>
<div className="relative group cursor-pointer aspect-video bg-black flex items-center justify-center">
<img alt="Office video thumbnail" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity" data-alt="cinematic shot of a modern brightly lit architectural office with people collaborating, soft warm sun flares" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWQhR4YirXwTh7tE5sZGT_ngSTcMGIb3cDpE8u9b4Q86hWBnd7iHK3JOGp1vnEpxRZZ-TfGTJKGGWkmkjkOV5tZHOVAy0qaEtkmEIPg0ZxKYILTGcm7q46Q2baT7bUudv0VqI48AdYnX5ls2x2vUzzfAn4TjJO2GpG9nSnVIUxLK-92SuJhrb4awCyIr0VpbPGFJSdkpJYL7Y-9unuMT_-ChsYE1Bpw9foSbXKIOLOqEG33ZYEIywbb8mO4EUnjh84cxa0UTjjFOE"/>
<div className="relative z-10 h-20 w-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform">
<span className="material-symbols-outlined text-white text-5xl" data-icon="play_arrow" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>play_arrow</span>
</div>
<div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
<span className="bg-black/50 text-white text-[10px] px-2 py-1 rounded-md backdrop-blur-sm">02:45</span>
</div>
</div>
<div className="p-4 flex items-center justify-between border-t border-outline-variant/5">
<div className="flex items-center -space-x-2">
<div className="h-6 w-6 rounded-full border-2 border-white bg-primary flex items-center justify-center">
<span className="material-symbols-outlined text-[12px] text-white" data-icon="thumb_up" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>thumb_up</span>
</div>
<div className="h-6 w-6 rounded-full border-2 border-white bg-tertiary flex items-center justify-center">
<span className="material-symbols-outlined text-[12px] text-white" data-icon="favorite" data-weight="fill" style={{"fontVariationSettings":"'FILL' 1"}}>favorite</span>
</div>
<span className="pl-4 text-xs text-on-surface-variant">1.2k reactions</span>
</div>
<span className="text-xs text-on-surface-variant">84 comments • 12 shares</span>
</div>
<div className="px-6 pb-6 flex justify-between gap-2">
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="thumb_up">thumb_up</span>
<span className="font-medium text-sm">Like</span>
</button>
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
<span className="font-medium text-sm">Comment</span>
</button>
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="share">share</span>
<span className="font-medium text-sm">Share</span>
</button>
</div>
</article>
{/*  Image Post (Asymmetric Layout)  */}
<article className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-[0_8px_24px_-4px_rgba(114,48,230,0.04)] border border-outline-variant/10">
<div className="p-6">
<div className="flex items-center gap-3 mb-4">
<div className="h-12 w-12 rounded-full overflow-hidden">
<img alt="Promoter profile" className="h-full w-full object-cover" data-alt="dynamic portrait of a tech influencer in a minimal workspace, neon accent lighting, modern tech vibe" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMwjlpxoZb7ZEzaNn5M67cXHM85HVoWPf8Hb0Icenk37r0ZYnbA23lCgc_eGh4Wft8I9ySo8F_IOowywm7sSeiPxlZQCmy7Vs3n-wuuf4Ix_omkDu6V5PhCdK9EzQ7GBgh10LtiTMecbDzFVav_vPR96TTS4ODagZ_nGzh7HQIPyXrAkD5Gq1BYes-6EpfeayIWhZjsc0JEmnYjTDPyyOXnOSSflAX1dVIv5BVQ__4f_V3SIAgAELceBhfSnTG-T8JH_ZSYFs9tR8"/>
</div>
<div>
<h3 className="font-bold text-[#34313A]">Marcus Chen</h3>
<p className="text-xs text-on-surface-variant">Tech Promoter • Sponsored • 4h ago</p>
</div>
</div>
<p className="text-on-surface mb-6 leading-relaxed">The future of workspace is evolving. Check out how these teams are integrating AI tools into their creative workflow. 🚀 #FutureOfWork #CuratorPro</p>
<div className="grid grid-cols-2 gap-3 h-[400px]">
<div className="h-full rounded-lg overflow-hidden">
<img alt="Modern workspace" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" data-alt="minimalist white desk with ultra-wide monitor, mechanical keyboard, and a large green plant, soft natural window light" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCff5t-2WdJ-daglcpwOp61xrnr0kRyjziv4J7OR2AZRFDPN9Ih_ngwEExfDPhQppeAWwVzqUBUU2LtOeYcx_j_2c8OpWY38ud9RrO6VJ73R86i3GIBf4NwX4p3AvStEvvvRNG5Fd_BhW5U6Zi69_7gAr90SJgTYKocf7nEjjGJBq5ukEATTF9Awul2CJSIyD5eGuOndk30nCurQp0WQv0kRvJoR38a0mRMystzp3QXiuSexSEm_m5CC5OjcG-xmr7IV9Y_Ttw1N1Q"/>
</div>
<div className="grid grid-rows-2 gap-3 h-full">
<div className="rounded-lg overflow-hidden">
<img alt="Creative team meeting" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" data-alt="candid shot of diverse creative team discussing wireframes on a tablet in a bright studio, casual modern attire" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6vOjrbEu-s-AqPg6kajJOZt5WgRHZ7vdhnETDooA5lvF1NGRnHWJ2evAwTp6xs_7QocyspfaxhJGv4Dk6Z3XKE0ZDgf3sBu1Gxosn8PCQ-2Qa5_DoerVXESQ_bBXTWITvbvatIPqVaNhLHve4o15Vp-w_LWtIFKIRs3FufZ7q4ZsFcbfUre5pFZKT4FyvIDjW54F29GYUMefdBDk_PIvNGSMi9bfjB89kToMNBeARfOjbEEszWec1VFnqHzFHf3LW7rG8rbJJLCM"/>
</div>
<div className="rounded-lg overflow-hidden">
<img alt="AI Interface" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" data-alt="close up of a digital tablet showing a futuristic AI workflow interface with glowing purple accents and data visualizations" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOMCR8tlHoZ-N4EVKOvf5uyQedxGyCkilnsljzGruQLfZC0K18mSl_gdUZhcbszQ4RR1QSG8oLpHcfmBq0jqa_7XPSwMSdGYjlPyJsPsxiUH84TZE5HOFuw2e0MzauKH1KeKoELV1IdLxOb1qCbi-jqMqiQpjW1eM0iZPMwAa9t_EzqoIWJ_TDebkKDQdo-wK-9AySD5YMKPdK6NnpKAHvLK10ixXUqxW538TARNPz6_rBxUPfwGYYVN_Xa2IEXXzv6LOOqCgbuJ4"/>
</div>
</div>
</div>
</div>
<div className="px-6 pb-6 pt-2 flex justify-between gap-2">
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="thumb_up">thumb_up</span>
<span className="font-medium text-sm">Like</span>
</button>
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
<span className="font-medium text-sm">Comment</span>
</button>
<button className="flex-1 py-2 flex items-center justify-center gap-2 hover:bg-surface-container-low rounded-lg transition-colors text-on-surface-variant">
<span className="material-symbols-outlined" data-icon="share">share</span>
<span className="font-medium text-sm">Share</span>
</button>
</div>
</article>
</section>
{/*  Right Sidebar: Trending & Suggested  */}
<aside className="hidden xl:flex flex-col w-80 space-y-6">
{/*  Trending Topics (Bento Style)  */}
<div className="bg-surface-container-low rounded-xl p-6">
<h2 className="text-lg font-extrabold text-[#34313A] mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="trending_up">trending_up</span>
          Trending Now
        </h2>
<div className="space-y-4">
<div className="group cursor-pointer">
<p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Design • Trending</p>
<h4 className="font-bold text-[#34313A] group-hover:text-primary transition-colors">#FigmaWorkshop2024</h4>
<p className="text-xs text-on-surface-variant">2,431 posts</p>
</div>
<div className="group cursor-pointer">
<p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Remote Work • Trending</p>
<h4 className="font-bold text-[#34313A] group-hover:text-primary transition-colors">Digital Nomad Life</h4>
<p className="text-xs text-on-surface-variant">1,890 posts</p>
</div>
<div className="group cursor-pointer">
<p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Tech News • Hot</p>
<h4 className="font-bold text-[#34313A] group-hover:text-primary transition-colors">AI Recruitment Tools</h4>
<p className="text-xs text-on-surface-variant">5.2k posts</p>
</div>
</div>
<button className="w-full mt-6 text-sm font-bold text-primary hover:underline transition-all">Show More</button>
</div>
{/*  Suggested Connections  */}
<div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_12px_rgba(114,48,230,0.04)] border border-outline-variant/10">
<h2 className="text-lg font-extrabold text-[#34313A] mb-4">Suggested</h2>
<div className="space-y-4">
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden">
<img alt="Connection 1" className="h-full w-full object-cover" data-alt="headshot of a smiling creative professional woman with glasses, soft purple lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDbllZtXmHsdV9PnK9C8XETquMTGObx1wrHPDXMaZjTX7cWPgYZt9XW7z_Cq9PbscWd162e1PFHFzjvBcrIqF4B3ijwjA8b0x9xdnxZQjrqOtpsSeV_B2fM0GAHGGzk0OsZUwNU2RQKKuoqJjqUMzCDlKNgMEeObMCHD_LesC13kgpBOr6T_W7JK5TCFKJGY2nR45-PNTl94-nfy96oVfiMUF5ItQ3LNxSIW2nnYDxTdpF3jTuixd8tS5kfjKx9JraEZ7oJ-xbYhk"/>
</div>
<div className="flex-1 overflow-hidden">
<h4 className="font-bold text-sm text-[#34313A] truncate">Leila Moss</h4>
<p className="text-[10px] text-on-surface-variant truncate">UX Manager at Adobe</p>
</div>
<button className="material-symbols-outlined text-primary-container p-1 hover:bg-primary-container hover:text-white rounded-full transition-all" data-icon="person_add">person_add</button>
</div>
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden">
<img alt="Connection 2" className="h-full w-full object-cover" data-alt="portrait of a focused male developer in a hoodie, tech environment, cool blue lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBf54emSNFV77cJ1-ApZwbsWSQun_PYhvRtsEYsM4qktHpsfFdMK_EUtmj8k7maIXJQ0xsAWXFDmoP_zc_6zZdV9DO3YZegr0O3CRanyxImX7Ul6r7tJJ-XHklM28huwc82O3Uuhai4OZ5rYz1lb5I9Himr5OD6s8GcUeiTXtLIgEVURZJN4sw6tin695azu2Ua7EvJtx2rMZEI26QX3Fc-BsX0gu1eauTRA3pjyNIDK2eCDkdhwA1kPpRD7_VA4RwuaT72StU8EDM"/>
</div>
<div className="flex-1 overflow-hidden">
<h4 className="font-bold text-sm text-[#34313A] truncate">David K.</h4>
<p className="text-[10px] text-on-surface-variant truncate">Senior Fullstack Eng.</p>
</div>
<button className="material-symbols-outlined text-primary-container p-1 hover:bg-primary-container hover:text-white rounded-full transition-all" data-icon="person_add">person_add</button>
</div>
<div className="flex items-center gap-3">
<div className="h-10 w-10 rounded-full overflow-hidden">
<img alt="Connection 3" className="h-full w-full object-cover" data-alt="professional portrait of a confident woman entrepreneur in a minimalist office, high key lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzRKQ_tEUrerp3_ZYJ_OK9HHYvtgiU4K5ggf2ek0mZGM5fc-z4APNxpY5jVHTrbVrq_UVSk1JFiBm2hx_HOVlZdsA5c0rNl6M_Rg-NBZxRVdlAOttC-5d59fQo2cL_5EopVZ3vE3b3o-T_otUFkterNMAZJiPHDgPttdeLMhG7jcYFkR7L-J3l04yViBJHdeh4QXu4PAtRVXu0kKC5l-qKJG8FusGAlm549OxCJGrB-6bCL775Cnjrom40MsYYAySDgBWsPEg0ynQ"/>
</div>
<div className="flex-1 overflow-hidden">
<h4 className="font-bold text-sm text-[#34313A] truncate">Sophia Wu</h4>
<p className="text-[10px] text-on-surface-variant truncate">Product Lead @ Meta</p>
</div>
<button className="material-symbols-outlined text-primary-container p-1 hover:bg-primary-container hover:text-white rounded-full transition-all" data-icon="person_add">person_add</button>
</div>
</div>
<button className="w-full mt-6 bg-surface-container-low text-[#34313A] font-bold py-2 rounded-lg hover:bg-surface-container transition-colors text-sm">View All</button>
</div>
</aside>
      </div>
    </DashboardLayout>
  );
}
