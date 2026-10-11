import React from 'react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      num: '01',
      title: 'AI Decision Intelligence',
      desc: 'Use Gemma 4 to understand complex scenarios and explore alternative courses of action.',
      tag: 'Core Intelligence',
    },
    {
      num: '02',
      title: 'Decision Autopilot',
      desc: 'Turn selected strategies into structured action plans with tasks, dependencies, and execution tracking.',
      tag: 'Execution Engine',
    },
    {
      num: '03',
      title: 'Dependency Guardrails',
      desc: 'Identify critical requirements and flag plans when user-reported conditions fail.',
      tag: 'Live Guardrails',
    },
    {
      num: '04',
      title: 'Adaptive Fallbacks',
      desc: 'Move to a prepared alternative when your active plan becomes blocked.',
      tag: 'Resilience',
    },
    {
      num: '05',
      title: 'Scenario Analysis',
      desc: 'Evaluate possible consequences with transparent assumptions and domain-specific simulation tools where supported.',
      tag: 'Analysis & Sim',
    },
  ];

  return (
    <section className="relative z-20 bg-[#EAE3D8] py-24 px-6 lg:px-12 w-full border-t border-[#D8D0C5]" id="features">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-[700px] mb-16">
          <div className="mono-val text-[11px] md:text-[13px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-4">
            Platform Capabilities
          </div>
          <h2 className="text-[38px] md:text-[50px] font-medium tracking-[-0.03em] text-[#171615] leading-[1.1] mb-5">
            Engineered for High-Stakes Decisions
          </h2>
          <p className="text-[17px] text-[#756D65] leading-relaxed">
            A unified decision intelligence platform bridging generative strategy formulation with deterministic execution control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D8D0C5] rounded-2xl p-7 shadow-sm flex flex-col justify-between hover:border-[#171615] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="mono-val text-[11px] font-bold text-[#F06445]">
                    FEATURE {f.num}
                  </span>
                  <span className="mono-val text-[10px] px-2 py-0.5 rounded bg-[#F4EFE7] text-[#756D65]">
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-[20px] font-semibold text-[#171615] mb-3 leading-snug">
                  {f.title}
                </h3>
                <p className="text-[14px] text-[#756D65] leading-relaxed">
                  {f.desc}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-[#F4EFE7] flex items-center justify-between text-[11px] mono-val text-[#A39B93]">
                <span>FORESIGHTX System</span>
                <span className="text-[#10b981]">Active</span>
              </div>
            </div>
          ))}

          {/* Sixth decorative card summarizing Google Gemma 4 architecture */}
          <div className="bg-[#171615] text-[#F4EFE7] rounded-2xl p-7 shadow-sm flex flex-col justify-between border border-[#171615]">
            <div>
              <div className="mono-val text-[11px] font-bold text-[#F06445] mb-5">
                MODEL ARCHITECTURE
              </div>
              <h3 className="text-[20px] font-semibold text-white mb-3 leading-snug">
                Powered by Google Gemma 4
              </h3>
              <p className="text-[14px] text-[#D8D0C5] leading-relaxed">
                Single-request Decision Contract extraction generating structured operational alternatives, assigned roles, critical guardrails, and deterministic fallbacks.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] mono-val text-[#A39B93]">
              <span>Zero Hallucinated Execution</span>
              <span className="text-[#F06445]">Deterministic</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
