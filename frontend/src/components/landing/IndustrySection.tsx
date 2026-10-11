import React from 'react';
import { Link } from 'react-router-dom';

export const IndustrySection: React.FC = () => {
  const industries = [
    {
      title: 'IT Operations',
      desc: 'Rapid outage triage, disaster recovery failover routing, and cloud infrastructure mitigation plans.',
      icon: '🖥️',
      example: 'Production server down, DNS routing failure, or database replication lag.',
    },
    {
      title: 'Logistics',
      desc: 'Fleet breakdown rerouting, delivery timeline adjustments, and cargo consolidation contingency.',
      icon: '🚚',
      example: 'Delivery truck breakdown with 500 packages awaiting delivery.',
    },
    {
      title: 'Manufacturing',
      desc: 'Assembly line halting protocols, component supply shortages, and maintenance triage.',
      icon: '⚙️',
      example: 'Robotic assembly cell sensor failure halting production line.',
    },
    {
      title: 'Education',
      desc: 'Campus incident management, exam schedule shifts, and remote instruction contingency.',
      icon: '🎓',
      example: 'Power disruption during university exam period requiring session rescheduling.',
    },
    {
      title: 'Business Operations',
      desc: 'Vendor SLA breaches, payment gateway outages, and mission-critical staff reallocation.',
      icon: '💼',
      example: 'Primary payment provider degradation impacting customer transactions.',
    },
    {
      title: 'Event Management',
      desc: 'Keynote delay buffer management, AV disruption protocols, and calibrated numerical simulation.',
      icon: '🎤',
      example: 'Keynote speaker 30 minutes late with venue hard curfew.',
    },
  ];

  return (
    <section className="relative z-20 bg-[#F4EFE7] py-24 px-6 lg:px-12 w-full border-t border-[#D8D0C5]" id="industries">
      <div className="max-w-[1400px] mx-auto">
        <div className="max-w-[800px] mb-16">
          <div className="mono-val text-[11px] md:text-[13px] font-semibold text-[#F06445] tracking-[0.15em] uppercase mb-4">
            Cross-Domain Adaptability
          </div>
          <h2 className="text-[38px] md:text-[50px] font-medium tracking-[-0.03em] text-[#171615] leading-[1.1] mb-5">
            Built for Decisions Across Industries
          </h2>
          <p className="text-[17px] text-[#756D65] leading-relaxed">
            From operations and logistics to IT, manufacturing, education, and events, FORESIGHTX provides a flexible framework for structured decision planning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {industries.map((ind, idx) => (
            <div
              key={idx}
              className="bg-white border border-[#D8D0C5] rounded-2xl p-7 shadow-sm hover:border-[#171615] transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[26px]">{ind.icon}</span>
                  <span className="mono-val text-[10px] uppercase tracking-wider text-[#A39B93]">
                    Use Case {idx + 1}
                  </span>
                </div>
                <h3 className="text-[19px] font-semibold text-[#171615] mb-2">
                  {ind.title}
                </h3>
                <p className="text-[13px] text-[#756D65] leading-relaxed mb-4">
                  {ind.desc}
                </p>
              </div>

              <div className="p-3 bg-[#F4EFE7] rounded-xl border border-[#D8D0C5] text-[12px] text-[#241F1B]">
                <strong className="mono-val text-[10px] text-[#A39B93] block uppercase mb-0.5">
                  Example Scenario:
                </strong>
                {ind.example}
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Disclaimer Banner */}
        <div className="bg-[#EAE3D8] border border-[#D8D0C5] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="mono-val text-[10px] font-bold text-[#F06445] uppercase tracking-widest mb-1">
              Scope & Transparency
            </div>
            <p className="text-[13px] text-[#756D65] max-w-[850px] leading-relaxed">
              These industry examples represent potential use cases for the FORESIGHTX decision planning framework and Decision Autopilot. Numerical physics/schedule simulation is currently calibrated specifically for supported event management scenarios.
            </p>
          </div>
          <Link
            to="/workspace"
            className="px-5 py-2.5 rounded-full bg-[#171615] text-[#F4EFE7] text-[13px] font-medium hover:bg-[#241F1B] transition-colors shrink-0 shadow-sm"
          >
            Test a Domain Scenario →
          </Link>
        </div>
      </div>
    </section>
  );
};
