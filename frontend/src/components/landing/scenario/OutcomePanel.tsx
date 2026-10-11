import { motion, AnimatePresence } from 'framer-motion';
import { calculateOutcome, SCENARIO_DATA } from './scenarioData';
import type { DecisionId } from './scenarioData';

interface OutcomePanelProps {
  activeDecision: DecisionId;
  internetLost: boolean;
}

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1 py-3 border-t border-[#D8D0C5]/60 min-w-0">
    <div className="mono-val text-[11px] text-[#756D65] uppercase tracking-wider">{label}</div>
    <div className="text-[13px] sm:text-[14px] text-[#241F1B] leading-relaxed break-words">{value}</div>
  </div>
);

const ListRow = ({ label, items }: { label: string; items: string[] }) => (
  <div className="flex flex-col gap-2 py-3 border-t border-[#D8D0C5]/60 min-w-0">
    <div className="mono-val text-[11px] text-[#756D65] uppercase tracking-wider">{label}</div>
    <ul className="flex flex-col gap-1 min-w-0">
      {items.map((item, i) => (
        <li key={i} className="text-[13px] sm:text-[14px] text-[#241F1B] leading-relaxed flex items-start gap-2 break-words">
          <span className="text-[#F06445] mt-[2px] shrink-0">›</span>
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const OutcomePanel = ({ activeDecision, internetLost }: OutcomePanelProps) => {
  const pathData = SCENARIO_DATA[activeDecision];
  const outcome = calculateOutcome(pathData, internetLost);

  return (
    <div className="h-full flex flex-col relative w-full min-w-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeDecision}-${internetLost}`}
          initial={{ opacity: 0, filter: 'blur(4px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.3 }}
          className="flex flex-col h-full min-w-0"
        >
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-[#F06445] shrink-0" />
            <div className="mono-val text-[11px] font-semibold text-[#241F1B] tracking-widest uppercase">
              Selected Future: Path {activeDecision}
            </div>
          </div>
          
          <h3 className="text-[24px] sm:text-[28px] xl:text-[32px] font-medium leading-[1.15] tracking-[-0.02em] mb-4 text-[#171615] break-words">
            {outcome.title}
          </h3>
          
          <p className="text-[15px] sm:text-[16px] text-[#756D65] leading-relaxed mb-6 sm:mb-8 max-w-[440px] break-words">
            {outcome.summary}
          </p>

          <div className="flex flex-col min-w-0">
            <DetailRow label="Operational Impact" value={outcome.operationalImpact} />
            <DetailRow label="Schedule Impact" value={outcome.scheduleImpact} />
            <DetailRow label="Attendee Experience" value={outcome.attendeeExperience} />
            <DetailRow label="Implementation Requirements" value={outcome.implementationReqs} />
            <ListRow label="Key Trade-offs" items={outcome.tradeOffs} />
            <ListRow label="Underlying Assumptions" items={outcome.assumptions} />
            <ListRow label="Potential Failure Points" items={outcome.failurePoints} />
          </div>

          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#D8D0C5] flex flex-wrap items-center justify-between gap-2 min-w-0">
            <span className="mono-val text-[10px] text-[#A39B93] uppercase tracking-widest">
              Illustrative Scenario Analysis
            </span>
            {internetLost && (
               <span className="mono-val text-[10px] text-[#F06445] font-bold uppercase tracking-widest bg-[#F06445]/10 px-2 py-1 rounded shrink-0">
                 Disruption Recalculated
               </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
