"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { contentApi, userApi } from "@/lib/api/endpoints";
import { getPosition } from "@/lib/hooks";
import { reversePlace, type Place } from "@/lib/geo";
import type { Profile } from "@/lib/types";
import { Page, RequireAuth } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { errorMessage, useToast } from "@/components/ui/toast";
import { PlaceSearch } from "@/components/map/place-search";

export default function EditProfilePage() {
  return (
    <RequireAuth>
      <EditProfileLoader />
    </RequireAuth>
  );
}

function EditProfileLoader() {
  const { user } = useAuth();
  if (!user) return null;
  return <EditProfile user={user} />;
}

function EditProfile({ user }: { user: Profile }) {
  const { isNormalAccount, refreshProfile } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const categories = useQuery({ queryKey: ["categories"], queryFn: contentApi.categories, staleTime: 600_000 });

  const [form, setForm] = useState({
    name: user.name ?? "",
    email: user.email ?? "",
    mobileNumber: user.mobileNumber ?? "",
    contactNumber: user.contactNumber ?? "",
    whatsappNumber: user.whatsappNumber ?? "",
    bio: user.bio ?? "",
    gender: user.gender ?? "",
    professionId: user.professionId ?? "",
    address: user.address ?? "",
    district: user.district ?? "",
    state: user.state ?? "",
    zipcode: user.zipcode ?? "",
    lat: user.lat || undefined,
    lng: user.lng || undefined,
  });
  const [skills, setSkills] = useState<string[]>(user.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [locating, setLocating] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  const digits = (k: "mobileNumber" | "contactNumber" | "whatsappNumber") => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value.replace(/\D/g, "").slice(0, 10) }));

  const applyPlace = (p: Place) =>
    setForm((f) => ({
      ...f,
      lat: p.lat,
      lng: p.lng,
      address: p.label,
      district: p.district ?? f.district,
      state: p.state ?? f.state,
      zipcode: p.zipcode ?? f.zipcode,
    }));

  const useMyLocation = async () => {
    setLocating(true);
    const pos = await getPosition();
    if (pos.fallback) {
      toast("Couldn't get your location. Allow location access or search instead.", "error");
    } else {
      const place = await reversePlace(pos.lat, pos.lng);
      applyPlace(place ?? { label: `${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`, lat: pos.lat, lng: pos.lng });
    }
    setLocating(false);
  };

  const addSkill = () => {
    const parts = skillInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) setSkills((s) => Array.from(new Set([...s, ...parts])).slice(0, 25));
    setSkillInput("");
  };

  const save = useMutation({
    mutationFn: () => {
      if (form.name.trim().length < 2) throw new Error("Enter your name.");
      if (form.mobileNumber && !/^\d{10}$/.test(form.mobileNumber)) throw new Error("Mobile number must be 10 digits.");
      if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) throw new Error("Enter a valid email.");
      const base = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobileNumber: form.mobileNumber,
        contactNumber: form.contactNumber,
        whatsappNumber: form.whatsappNumber,
        skills,
      };
      if (isNormalAccount) return userApi.update(base);
      const profession = categories.data?.find((c) => c._id === form.professionId)?.name ?? user.profession;
      return userApi.update({
        ...base,
        bio: form.bio.trim(),
        gender: form.gender || undefined,
        professionId: form.professionId || undefined,
        profession,
        address: form.address,
        district: form.district,
        state: form.state,
        zipcode: form.zipcode,
        lat: form.lat,
        lng: form.lng,
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      toast("Profile saved", "success");
      router.push("/profile");
    },
    onError: (err) => toast(errorMessage(err), "error"),
  });

  return (
    <Page narrow title="Edit profile" subtitle={isNormalAccount ? "Basic details" : "Your freelancer profile"}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
        className="space-y-6"
      >
        <Section title="Basic details">
          <Field label="Full name" htmlFor="name">
            <Input id="name" value={form.name} onChange={set("name")} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email" htmlFor="email">
              <Input id="email" type="email" value={form.email} onChange={set("email")} />
            </Field>
            <Field label="Mobile number" htmlFor="mobile">
              <Input id="mobile" inputMode="numeric" value={form.mobileNumber} onChange={digits("mobileNumber")} />
            </Field>
            <Field label="Call number" htmlFor="call" hint="Shown on your profile">
              <Input id="call" inputMode="numeric" value={form.contactNumber} onChange={digits("contactNumber")} />
            </Field>
            <Field label="WhatsApp number" htmlFor="wa" hint="Shown on your profile">
              <Input id="wa" inputMode="numeric" value={form.whatsappNumber} onChange={digits("whatsappNumber")} />
            </Field>
          </div>
        </Section>

        {!isNormalAccount && (
          <Section title="Professional details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Profession" htmlFor="profession">
                <Select id="profession" value={form.professionId} onChange={set("professionId")}>
                  <option value="">Select profession</option>
                  {categories.data?.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Gender" htmlFor="gender">
                <Select id="gender" value={form.gender} onChange={set("gender")}>
                  <option value="">Prefer not to say</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </Select>
              </Field>
            </div>
            <Field label="Bio" htmlFor="bio" hint={`${form.bio.length}/500`}>
              <Textarea id="bio" value={form.bio} onChange={set("bio")} maxLength={500} placeholder="Tell clients what you do best" />
            </Field>
          </Section>
        )}

        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-full bg-secondary-container py-1 pl-3 pr-1.5 text-xs font-bold text-on-secondary-container">
                {s}
                <button type="button" onClick={() => setSkills((all) => all.filter((x) => x !== s))} aria-label={`Remove ${s}`}>
                  <Icon name="close" className="text-sm" />
                </button>
              </span>
            ))}
            {!skills.length && <p className="text-sm text-on-surface-variant">No skills added yet.</p>}
          </div>
          <div className="flex gap-2">
            <Input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSkill();
                }
              }}
              placeholder="e.g. Photography, React"
            />
            <Button type="button" variant="secondary" onClick={addSkill}>
              Add
            </Button>
          </div>
        </Section>

        {!isNormalAccount && (
          <Section title="Location" hint="Used to show you on the nearby map">
            <div className="flex gap-2">
              <PlaceSearch className="flex-1" onPick={applyPlace} placeholder="Search your area" />
              <Button type="button" variant="outline" className="h-12" onClick={useMyLocation} loading={locating}>
                <Icon name="my_location" className="text-lg" /> Use mine
              </Button>
            </div>
            {form.address && (
              <p className="flex items-start gap-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm">
                <Icon name="location_on" className="text-lg text-primary" />
                {form.address}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="District" htmlFor="district">
                <Input id="district" value={form.district} onChange={set("district")} />
              </Field>
              <Field label="State" htmlFor="state">
                <Input id="state" value={form.state} onChange={set("state")} />
              </Field>
              <Field label="PIN code" htmlFor="zip">
                <Input id="zip" inputMode="numeric" value={form.zipcode} onChange={set("zipcode")} />
              </Field>
            </div>
          </Section>
        )}

        <div className="sticky bottom-20 flex justify-end gap-2 rounded-2xl bg-background/80 py-3 backdrop-blur md:bottom-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={save.isPending}>
            Save changes
          </Button>
        </div>
      </form>
    </Page>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-3xl bg-surface-container-lowest p-6 shadow-sm">
      <div>
        <h2 className="text-base font-extrabold">{title}</h2>
        {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
