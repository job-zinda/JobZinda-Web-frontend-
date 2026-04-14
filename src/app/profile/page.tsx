"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  const displayName = user?.name || (user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || "User");

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 pb-24 md:pb-12">
        {/* Profile Header */}
        <header className="relative mb-10">
          <div className="h-40 md:h-48 w-full rounded-2xl overflow-hidden bg-gradient-to-br from-[#7230E6] to-[#8347F8]" />
          <div className="px-4 md:px-8 flex flex-col md:flex-row items-start md:items-end gap-5 -mt-16 relative z-10">
            <div className="relative">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-white overflow-hidden shadow-xl bg-[#7230E6]/10 flex items-center justify-center">
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[#7230E6] text-6xl">person</span>
                )}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-[#7230E6] text-white rounded-xl shadow-lg hover:bg-[#5a20c0] transition-colors">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-1">
                {displayName}
              </h1>
              <p className="text-slate-500 font-medium text-base">
                @{user?.username || "username"}
                {user?.role && <span className="ml-3 text-xs bg-[#7230E6]/10 text-[#7230E6] px-2 py-0.5 rounded-full font-bold uppercase">{user.role}</span>}
              </p>
            </div>
            <div className="hidden md:block pb-2">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-500">Profile Completion</span>
                  <span className="text-sm font-bold text-[#7230E6]">85%</span>
                </div>
                <div className="w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="bg-[#7230E6] h-full w-[85%] rounded-full transition-all" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-1 mb-8 border-b border-slate-100">
          <button className="whitespace-nowrap px-5 py-3 text-[#7230E6] font-bold border-b-2 border-[#7230E6] text-sm">
            Account Info
          </button>
          <button className="whitespace-nowrap px-5 py-3 text-slate-500 font-medium hover:text-slate-700 text-sm transition-colors">
            Experience
          </button>
          <button className="whitespace-nowrap px-5 py-3 text-slate-500 font-medium hover:text-slate-700 text-sm transition-colors">
            Security
          </button>
          <button className="whitespace-nowrap px-5 py-3 text-slate-500 font-medium hover:text-slate-700 text-sm transition-colors">
            Subscriptions
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-8 bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1">Personal Details</h2>
              <p className="text-slate-500 text-sm">Manage your basic information and public presence.</p>
            </div>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">First Name</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#7230E6] focus:ring-2 focus:ring-[#7230E6]/10 px-4 py-3 rounded-xl transition-all text-slate-800"
                    type="text"
                    defaultValue={user?.firstName || ""}
                    placeholder="Enter first name"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Last Name</label>
                  <input
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#7230E6] focus:ring-2 focus:ring-[#7230E6]/10 px-4 py-3 rounded-xl transition-all text-slate-800"
                    type="text"
                    defaultValue={user?.lastName || ""}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Address</label>
                <input
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#7230E6] focus:ring-2 focus:ring-[#7230E6]/10 px-4 py-3 rounded-xl transition-all text-slate-800"
                  type="email"
                  defaultValue={user?.email || ""}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Bio</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#7230E6] focus:ring-2 focus:ring-[#7230E6]/10 px-4 py-3 rounded-xl transition-all resize-none text-slate-800"
                  rows={4}
                  defaultValue={user?.bio || ""}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-50 rounded-xl transition-colors text-sm" type="button">
                  Discard
                </button>
                <button className="px-8 py-2.5 primary-gradient text-white font-bold rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all text-sm" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Verification */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#7230E6]" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <h3 className="font-bold text-lg">Verification</h3>
              </div>
              <p className="text-sm text-slate-500 mb-4">Your identity has been verified. You have full access to enterprise tools.</p>
              <div className="flex items-center gap-2 text-green-600">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="text-sm font-bold">Identity Verified</span>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-lg mb-5">Connection Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Active Subscriptions</span>
                  <span className="font-bold text-slate-800">4</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Profile Views (30d)</span>
                  <span className="font-bold text-slate-800">1,248</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm">Network Reach</span>
                  <span className="font-bold text-[#7230E6]">Expert</span>
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3.5 text-red-500 font-bold border-2 border-red-100 hover:bg-red-50 rounded-2xl transition-all text-sm"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
