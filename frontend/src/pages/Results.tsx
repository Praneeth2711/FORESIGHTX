import React from 'react';
import { Link } from 'react-router-dom';

// Results is now surfaced as a deep-link from the Workspace.
// We redirect users back to the workspace to run and view results there,
// since all simulation outputs live in the single workspace flow.

export const Results: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F4EFE7] pt-20">
      <div className="border-b border-[#D8D0C5] bg-[#EAE3D8]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-5">
          <div className="mono-val text-[10px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-1">Simulation Results</div>
          <h1 className="text-[22px] sm:text-[26px] font-medium text-[#171615] tracking-[-0.02em]">Results View</h1>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-16 flex flex-col items-center text-center">
        <div className="max-w-[480px] bg-white border border-[#D8D0C5] rounded-2xl p-8 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#F4EFE7] border border-[#D8D0C5] flex items-center justify-center mx-auto mb-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#241F1B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <h2 className="text-[20px] font-medium text-[#171615] mb-3">Simulation results live in the Workspace</h2>
          <p className="text-[14px] text-[#756D65] leading-relaxed mb-6">
            Run a scenario analysis in the Workspace and interact with all three decision paths, the disruption injector, and outcome inspector — all on one page.
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
