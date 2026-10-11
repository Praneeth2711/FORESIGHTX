import React from 'react';
import { Link } from 'react-router-dom';

// Compare surfaces the disruption injection comparison view.
// The full side-by-side comparison is available directly in the Workspace after
// toggling "Internet connection lost", which calls POST /api/simulations/recalculate
// and renders original vs updated outcomes + delta metrics inline.

export const Compare: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4EFE7] pt-20">
      <div className="border-b border-[#D8D0C5] bg-[#EAE3D8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5">
          <div className="mono-val text-[10px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-1">Scenario Comparison</div>
          <h1 className="text-[22px] sm:text-[26px] font-medium text-[#171615] tracking-[-0.02em]">Decision Comparison</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 flex flex-col items-center text-center">
        <div className="max-w-[480px] bg-white border border-[#D8D0C5] rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F4EFE7] border border-[#D8D0C5] flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/>
            </svg>
          </div>
          <h2 className="text-[20px] font-medium text-[#171615] mb-3">Compare outcomes with disruption injection</h2>
          <p className="text-[14px] text-[#756D65] leading-relaxed mb-6">
            In the Workspace, toggle "Internet connection lost" after running a simulation to trigger a full counterfactual recalculation via the deterministic engine. Original vs updated outcomes are shown side-by-side with delta metrics.
          </p>
          <Link
            to="/workspace"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#171615] text-[#F4EFE7] text-[13px] font-medium hover:bg-[#241F1B] transition-colors"
          >
            Open Simulation Workspace →
          </Link>
        </div>
      </div>
    </div>
  );
};
