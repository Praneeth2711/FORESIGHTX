import { useState } from 'react';
import type { DecisionId } from './scenarioData';
import { DecisionGraph } from './DecisionGraph';
import { OutcomePanel } from './OutcomePanel';
import { motion } from 'framer-motion';

export const ScenarioPreview = () => {
  const [activeDecision, setActiveDecision] = useState<DecisionId>('B');
  const [internetLost, setInternetLost] = useState(false);

  return (
    <section className="relative z-20 bg-[#F4EFE7] py-32 w-full" id="demo">
      {/* Top Editorial Intro */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mb-16">
        <div className="max-w-[800px]">
          <div className="mono-val text-[11px] md:text-[13px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-6">
            Explore the Possible
          </div>
          <h2 className="text-[48px] md:text-[64px] font-medium tracking-[-0.03em] text-[#171615] leading-[1.05] mb-6">
            One disruption.<br />
            Three possible futures.
          </h2>
          <p className="text-[18px] text-[#756D65] leading-relaxed max-w-[500px]">
            Explore how different responses reshape the outcome of an unexpected event. Click a path below to traverse the decision tree.
          </p>
        </div>
      </div>

      {/* Scenario Context Strip */}
      <div className="w-full border-y border-[#D8D0C5] bg-[#EAE3D8] py-4 mb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center gap-4">
          <span className="w-2 h-2 rounded-full bg-[#171615]" />
          <span className="mono-val text-[12px] md:text-[13px] text-[#171615] font-semibold uppercase tracking-widest">
            SCENARIO CONTEXT: KEYNOTE SPEAKER DELAYED — 30 MINUTES
          </span>
        </div>
      </div>

      {/* Main Experience: Graph / Inspector */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,63%)_minmax(0,37%)] items-stretch border border-[#D8D0C5] bg-white rounded-2xl shadow-sm overflow-hidden">
          
          {/* LEFT: Graph */}
          <div className="w-full border-b lg:border-b-0 lg:border-r border-[#D8D0C5] bg-[#F4EFE7] min-w-0 flex items-center justify-center">
            <DecisionGraph 
              activeDecision={activeDecision}
              onDecisionChange={setActiveDecision}
              internetLost={internetLost}
            />
          </div>

          {/* RIGHT: Inspector */}
          <div className="w-full p-6 sm:p-8 lg:p-10 xl:p-12 bg-white flex flex-col justify-center min-w-0">
            <OutcomePanel 
              activeDecision={activeDecision}
              internetLost={internetLost}
            />
          </div>

        </div>
      </div>

      {/* Second Disruption Injection */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="max-w-[600px] mx-auto text-center border border-[#D8D0C5] bg-white p-6 sm:p-8 md:p-12 rounded-2xl shadow-sm">
          <h4 className="text-[24px] font-medium text-[#171615] mb-3">
            What happens when the unexpected happens again?
          </h4>
          <p className="text-[15px] text-[#756D65] mb-8 max-w-[400px] mx-auto">
            Inject a compounding infrastructure failure to see how your chosen path holds up under extreme stress.
          </p>
          
          <div className="flex items-center justify-between p-5 md:p-6 border border-[#D8D0C5] rounded-xl bg-[#F4EFE7] hover:border-[#171615] transition-colors cursor-pointer group" onClick={() => setInternetLost(!internetLost)}>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${internetLost ? 'bg-[#F06445]/20 text-[#F06445]' : 'bg-[#D8D0C5] text-[#756D65] group-hover:bg-[#171615] group-hover:text-white'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 2 20 20"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 14 0"/><path d="M2 8.5a15 15 0 0 1 20 0"/></svg>
              </div>
              <div className="text-left">
                <div className="text-[15px] font-medium text-[#171615]">Internet connection lost</div>
                <div className="text-[13px] text-[#756D65]">Venue Wi-Fi and hardlines drop globally</div>
              </div>
            </div>
            
            <div className={`w-14 h-8 rounded-full transition-colors relative ${internetLost ? 'bg-[#F06445]' : 'bg-[#D8D0C5]'}`}>
              <motion.div 
                className="w-6 h-6 bg-white rounded-full absolute top-1 shadow-sm"
                animate={{ left: internetLost ? '30px' : '4px' }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
