import React from 'react';
import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

export default function ComingSoon() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="text-center max-w-md p-10 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="mx-auto w-16 h-16 flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl mb-6">
          <Construction className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Coming Soon</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          This feature is under development and will be available in a future update.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white text-sm font-semibold rounded-xl hover:bg-slate-900 transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
