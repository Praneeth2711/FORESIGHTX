import React from 'react';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Describe Your Challenge',
      desc: 'Input any operational challenge or disruption in natural language across IT, logistics, events, manufacturing, or business operations.',
    },
    {
      num: '02',
      title: 'Explore Alternatives with Gemma 4',
      desc: 'Generate a multi-path Decision Contract with structured reasoning, explicit assumptions, and actionable alternatives in a single request.',
    },
    {
      num: '03',
      title: 'Choose and Activate a Plan',
      desc: 'Deploy your selected strategy into live execution tracking with assigned operational roles and actionable checklists.',
    },
    {
      num: '04',
      title: 'Track Critical Dependencies',
      desc: 'Monitor essential requirements in real time. When reported conditions fail, active execution plans are deterministically flagged as blocked.',
    },
    {
      num: '05',
      title: 'Adapt with a Prepared Fallback',
      desc: 'Deterministically transition to pre-planned contingency workflows when active plans are blocked, preserving full activity history.',
    },
  ];

  return (
    <section className="relative z-20 bg-[#F4EFE7] py-24 px-6 lg:px-12 w-full border-t border-[#D8D0C5]" id="how-it-works">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-[700px] mb-16">
          <div className="mono-val text-[11px] md:text-[13px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-4">
            Workflow Architecture
          </div>
          <h2 className="text-[38px] md:text-[50px] font-medium tracking-[-0.03em] text-[#171615] leading-[1.1] mb-5">
            How It Works
          </h2>
          <p className="text-[17px] text-[#756D65] leading-relaxed">
            From natural-language disruption description to structured action tracking and adaptive contingency activation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D8D0C5] rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:border-[#171615] transition-all group"
            >
              <div>
                <div className="mono-val text-[12px] font-bold text-[#F06445] mb-4">
                  STEP {s.num}
                </div>
                <h3 className="text-[17px] font-semibold text-[#171615] mb-3 leading-snug">
                  {s.title}
                </h3>
                <p className="text-[13px] text-[#756D65] leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#F4EFE7] flex items-center justify-between text-[11px] mono-val text-[#A39B93]">
                <span>Phase {idx + 1}</span>
                <span className="group-hover:translate-x-1 transition-transform text-[#171615]">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
