import React from 'react';
import { Radar, Users, Award, Lock } from 'lucide-react';

export default function SignupSidebar() {
  return (
    <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white p-8 flex flex-col justify-between shadow-xl min-h-full rounded-3xl relative overflow-hidden select-none">
      {/* Background Decorative Glows */}
      <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

      <div className="space-y-12">
        {/* Brand Logo */}
        <div className="flex items-center space-x-1.5 select-none z-10 relative">
          <span className="text-2xl font-extrabold tracking-tight text-white font-sans">
            Skill<span className="text-indigo-400">Bridge</span>
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5"></span>
        </div>

        {/* Header Pitch */}
        <div className="space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-100">
            Your career <br />
            gap starts <br />
            closing <br />
            today.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed max-w-xs">
            Set up your profile once. Get a skill roadmap built for Sri Lankan employers.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="space-y-4 z-10 relative">
          {/* Card 1 */}
          <div className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-500/25 text-cyan-400 mr-4">
              <Radar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-tight mb-1 text-white">
                Local employer signals
              </h4>
              <p className="text-[11px] text-indigo-200/80 leading-normal font-medium">
                See exactly which skills companies in Colombo, Gampaha, and Jaffna actually ask for — right now.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-500/25 text-cyan-400 mr-4">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-tight mb-1 text-white">
                Peer accountability
              </h4>
              <p className="text-[11px] text-indigo-200/80 leading-normal font-medium">
                Join a skill squad so you're never learning alone — and never losing momentum again.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex items-start p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all">
            <div className="p-2.5 rounded-xl bg-indigo-500/25 text-cyan-400 mr-4">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs tracking-tight mb-1 text-white">
                Verified skill profile
              </h4>
              <p className="text-[11px] text-indigo-200/80 leading-normal font-medium">
                Build proof recruiters can trust.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Elements */}
      <div className="space-y-6 pt-6 border-t border-white/5 z-10 relative">
        {/* Avatars + Text */}
        <div className="flex items-center space-x-3.5">
          <div className="flex -space-x-2.5">
            <div className="w-7 h-7 rounded-full border border-indigo-900 bg-emerald-500 flex items-center justify-center text-[10px] font-bold">K</div>
            <div className="w-7 h-7 rounded-full border border-indigo-900 bg-amber-500 flex items-center justify-center text-[10px] font-bold">P</div>
            <div className="w-7 h-7 rounded-full border border-indigo-900 bg-blue-500 flex items-center justify-center text-[10px] font-bold">S</div>
            <div className="w-7 h-7 rounded-full border border-indigo-900 bg-purple-500 flex items-center justify-center text-[10px] font-bold">A</div>
          </div>
          <p className="text-[11px] text-indigo-200 font-semibold leading-tight">
            <span className="text-cyan-400 font-bold">240+ students</span> already building skills for Sri Lankan employers
          </p>
        </div>

        {/* Lock Notice */}
        <div className="flex items-center space-x-2 text-[10px] text-indigo-300/60 leading-normal font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>Free for all Sri Lankan university students · No credit card needed</span>
        </div>
      </div>
    </div>
  );
}
