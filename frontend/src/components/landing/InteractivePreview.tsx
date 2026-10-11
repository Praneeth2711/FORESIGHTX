import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const paths = [
  {
    id: 'A',
    name: 'Regional Manufacturing',
    desc: 'Supply continuity secured by Month 4; +18% initial capex offset by reduced freight exposure and localized inventory stability.',
    impact: '+6.4%',
    time: '4.2 Months',
    color: '#818CF8'
  },
  {
    id: 'B',
    name: 'Supplier Diversification',
    desc: 'Diversifies tier-1 suppliers across Southeast Asia; delivery delta +2.4 mos with exposure to regional ocean lane bottlenecks.',
    impact: '-1.2%',
    time: '9.0 Months',
    color: '#F59E0B'
  },
  {
    id: 'C',
    name: 'Maintain Current Strategy',
    desc: 'Conserves short-term liquidity; 34% probability of stockouts during Q3 demand surge with lasting customer attrition.',
    impact: '-14.8%',
    time: 'Unresolved',
    color: '#EF4444'
  }
];

export const InteractivePreview = () => {
  const [activePath, setActivePath] = useState('A');
  const activeData = paths.find(p => p.id === activePath)!;

  return (
    <section className="py-32 px-6 w-full max-w-[1200px] mx-auto" id="preview">
      <div className="text-center mb-16">
        <h2 className="text-[36px] md:text-[48px] font-medium tracking-[-0.03em] text-white mb-6">
          Interactive Engine Preview
        </h2>
        <p className="text-[16px] text-[#9CA3AF] max-w-[600px] mx-auto leading-relaxed">
          Test different interventions in a live counterfactual sandbox. <br className="hidden sm:block" />(Illustrative data for Global Semiconductor Disruption).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Node Visualization */}
        <div className="lg:col-span-7 bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 sm:p-8 relative overflow-hidden h-[300px] sm:h-[400px] flex items-center justify-center">
          <svg viewBox="0 0 500 300" className="w-full h-full">
            <line x1="50" y1="150" x2="150" y2="150" stroke="#475569" strokeWidth="2" />
            <circle cx="50" cy="150" r="6" fill="#F8FAFC" />
            <circle cx="150" cy="150" r="8" fill="#F8FAFC" />
            <text x="50" y="175" className="mono-val text-[10px]" fill="#9CA3AF" textAnchor="middle">TRIGGER</text>
            <text x="150" y="175" className="mono-val text-[10px]" fill="#F8FAFC" textAnchor="middle">DECISION</text>
            
            {/* Path A */}
            <motion.path 
              d="M 150 150 C 250 150, 250 50, 400 50" 
              stroke={activePath === 'A' ? '#818CF8' : '#1E293B'} 
              strokeWidth={activePath === 'A' ? 4 : 2} 
              fill="none"
              animate={{ stroke: activePath === 'A' ? '#818CF8' : '#1E293B', strokeWidth: activePath === 'A' ? 4 : 2 }}
            />
            {/* Path B */}
            <motion.path 
              d="M 150 150 C 250 150, 250 150, 400 150" 
              stroke={activePath === 'B' ? '#F59E0B' : '#1E293B'} 
              strokeWidth={activePath === 'B' ? 4 : 2} 
              fill="none"
              animate={{ stroke: activePath === 'B' ? '#F59E0B' : '#1E293B', strokeWidth: activePath === 'B' ? 4 : 2 }}
            />
            {/* Path C */}
            <motion.path 
              d="M 150 150 C 250 150, 250 250, 400 250" 
              stroke={activePath === 'C' ? '#EF4444' : '#1E293B'} 
              strokeWidth={activePath === 'C' ? 4 : 2} 
              fill="none"
              animate={{ stroke: activePath === 'C' ? '#EF4444' : '#1E293B', strokeWidth: activePath === 'C' ? 4 : 2 }}
            />

            {/* End Nodes */}
            <circle cx="400" cy="50" r="6" fill={activePath === 'A' ? '#818CF8' : '#1E293B'} />
            <circle cx="400" cy="150" r="6" fill={activePath === 'B' ? '#F59E0B' : '#1E293B'} />
            <circle cx="400" cy="250" r="6" fill={activePath === 'C' ? '#EF4444' : '#1E293B'} />
            
            <text x="415" y="53" className="mono-val text-[10px]" fill={activePath === 'A' ? '#818CF8' : '#475569'}>PATH A</text>
            <text x="415" y="153" className="mono-val text-[10px]" fill={activePath === 'B' ? '#F59E0B' : '#475569'}>PATH B</text>
            <text x="415" y="253" className="mono-val text-[10px]" fill={activePath === 'C' ? '#EF4444' : '#475569'}>PATH C</text>
          </svg>
        </div>

        {/* Right: Controls & Outcome */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="space-y-3">
            <div className="mono-val text-[11px] text-[#9CA3AF] mb-2 uppercase tracking-wider">Select Intervention</div>
            {paths.map(p => (
              <button
                key={p.id}
                onClick={() => setActivePath(p.id)}
                className={`w-full text-left px-5 py-4 rounded-[8px] border transition-all ${activePath === p.id ? 'bg-[#1E293B] border-[#818CF8]' : 'bg-[#0F172A] border-[#1E293B] hover:border-[#475569]'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="mono-val text-[11px] font-bold" style={{ color: p.color }}>PATH {p.id}</div>
                  <div className="text-[14px] font-medium text-white">{p.name}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 p-6 bg-[#0F172A] border border-[#1E293B] rounded-[8px] relative min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePath}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="mono-val text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-3">Predicted Outcome</div>
                <p className="text-[14px] text-[#9CA3AF] leading-relaxed mb-6">
                  {activeData.desc}
                </p>
                <div className="grid grid-cols-2 gap-4 border-t border-[#1E293B] pt-4">
                  <div>
                    <div className="mono-val text-[10px] text-[#475569] mb-1 tracking-wider">EBITDA IMPACT</div>
                    <div className="mono-val text-[16px] text-white font-medium">{activeData.impact}</div>
                  </div>
                  <div>
                    <div className="mono-val text-[10px] text-[#475569] mb-1 tracking-wider">EQUILIBRIUM</div>
                    <div className="mono-val text-[16px] text-white font-medium">{activeData.time}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
