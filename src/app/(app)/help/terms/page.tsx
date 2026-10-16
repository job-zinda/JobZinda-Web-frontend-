import { Page } from "@/components/app-shell";

export const metadata = { title: "Terms & Conditions" };

// Copied from jobzindaflutterfinal/lib/Terms_and_conditions/TermsAndConditionUi.dart.
const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "1. Role classification",
    body: [
      "Promoter: an independent referral partner, not an employee of JobZinda, who earns through referrals and onboarding.",
      "Freelancer: an independent service provider, not an employee of JobZinda, responsible for their own service delivery.",
    ],
  },
  {
    title: "2. No employment relationship",
    body: ["Registration does not create an employer–employee relationship. All earnings are performance-based."],
  },
  { title: "3. Earnings & incentives", body: ["Promoters earn through referrals. Freelancers earn by providing services."] },
  {
    title: "4. Wallet & payout",
    body: ["Minimum withdrawal applies as shown in the wallet. JobZinda may hold payouts for verification or disputes."],
  },
  {
    title: "5. PAN, TDS & taxation",
    body: [
      "Promoters earning below ₹30,000/year: no TDS, PAN not mandatory.",
      "If PAN is not provided and TDS is applicable, 20% TDS may be deducted.",
      "Freelancers are responsible for their own tax filing and GST compliance.",
    ],
  },
  { title: "6. Prohibited activities", body: ["Fake referrals, fraud, spam, or illegal activities are strictly prohibited."] },
  { title: "7. Governing law", body: ["These terms are governed by the laws of India."] },
];

export default function TermsPage() {
  return (
    <Page narrow title="Terms & Conditions" subtitle="JobZinda – Promoter & Freelancer terms">
      <article className="space-y-6 rounded-3xl bg-surface-container-lowest p-7 shadow-sm">
        {SECTIONS.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-extrabold">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p} className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
                {p}
              </p>
            ))}
          </section>
        ))}
        <p className="rounded-2xl bg-secondary-container/60 p-4 text-sm font-semibold">
          By registering, you agree to these Terms &amp; Conditions.
        </p>
      </article>
    </Page>
  );
}
