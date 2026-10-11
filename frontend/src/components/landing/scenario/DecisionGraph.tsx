import { motion } from 'framer-motion';
import { SCENARIO_DATA } from './scenarioData';
import type { DecisionId } from './scenarioData';

interface DecisionGraphProps {
  activeDecision: DecisionId;
  onDecisionChange: (id: DecisionId) => void;
  internetLost: boolean;
}

export const DecisionGraph = ({ activeDecision, onDecisionChange, internetLost }: DecisionGraphProps) => {
  // SVG coordinate system: ViewBox 0 0 840 560
  // Cleanly proportioned so all labels and paths fit strictly within the viewBox bounds
  const nodes = {
    start: { x: 80, y: 280 },
    A: { x: 310, y: 130 },
    B: { x: 310, y: 280 },
    C: { x: 310, y: 430 },
    outA: { x: 540, y: 130 },
    outB: { x: 540, y: 280 },
    outC: { x: 540, y: 430 },
  };

  const drawBezier = (start: {x: number, y: number}, end: {x: number, y: number}) => {
    const cp1x = start.x + (end.x - start.x) * 0.45;
    const cp1y = start.y;
    const cp2x = start.x + (end.x - start.x) * 0.55;
    const cp2y = end.y;
    return `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;
  };

  const getPathColor = (id: DecisionId) => {
    if (internetLost && activeDecision === id) return '#F06445'; // Highlighted disrupted
    if (activeDecision === id) return '#171615'; // Highlighted normal
    return '#D8D0C5'; // Inactive
  };
  
  const getOutcomeColor = (id: DecisionId) => {
    if (activeDecision === id) return '#F06445';
    return '#D8D0C5';
  };

  return (
    <div className="w-full h-full min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex items-center justify-center p-3 sm:p-5 lg:p-6 min-w-0">
      <svg 
        viewBox="0 0 840 560" 
        className="w-full h-auto max-h-[560px] select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Underlay glow for disruption */}
        {internetLost && (
          <motion.circle 
            cx={nodes.start.x} 
            cy={nodes.start.y} 
            r={40} 
            fill="#F06445" 
            opacity={0.08} 
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="pointer-events-none"
          />
        )}

        {/* --- EDGES --- */}
        {(['A', 'B', 'C'] as DecisionId[]).map(id => {
          const isActive = activeDecision === id;
          return (
            <g 
              key={`edges-${id}`} 
              className="cursor-pointer group"
              onClick={() => onDecisionChange(id)}
            >
              {/* Invisible fat stroke for easier clicking */}
              <path
                d={drawBezier(nodes.start, nodes[id])}
                fill="none"
                stroke="transparent"
                strokeWidth={30}
              />
              <path
                d={drawBezier(nodes[id], nodes[`out${id}` as keyof typeof nodes])}
                fill="none"
                stroke="transparent"
                strokeWidth={30}
              />
              
              {/* Visible paths */}
              <motion.path
                d={drawBezier(nodes.start, nodes[id])}
                fill="none"
                stroke={getPathColor(id)}
                strokeWidth={isActive ? 3 : 1.5}
                animate={{ 
                  stroke: getPathColor(id),
                  strokeWidth: isActive ? 3 : 1.5
                }}
                className={isActive ? '' : 'group-hover:stroke-[#A39B93] transition-colors'}
              />
              <motion.path
                d={drawBezier(nodes[id], nodes[`out${id}` as keyof typeof nodes])}
                fill="none"
                stroke={getOutcomeColor(id)}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={internetLost && isActive ? "6,6" : "none"}
                animate={{ 
                  stroke: getOutcomeColor(id),
                  strokeWidth: isActive ? 3 : 1.5
                }}
                className={isActive ? '' : 'group-hover:stroke-[#A39B93] transition-colors'}
              />
            </g>
          );
        })}

        {/* --- NODES --- */}
        
        {/* Initial Event Node */}
        <circle cx={nodes.start.x} cy={nodes.start.y} r={8} fill={internetLost ? '#F06445' : '#171615'} />
        <circle cx={nodes.start.x} cy={nodes.start.y} r={16} fill="transparent" stroke={internetLost ? '#F06445' : '#171615'} strokeWidth={1} opacity={0.3} />
        <text x={nodes.start.x} y={nodes.start.y - 28} textAnchor="middle" className="mono-val text-[11px] font-semibold" fill={internetLost ? '#F06445' : '#241F1B'}>
          {internetLost ? 'DISRUPTED EVENT' : 'EVENT'}
        </text>
        <text x={nodes.start.x} y={nodes.start.y + 28} textAnchor="middle" className="text-[13px]" fill="#756D65">Speaker Delayed</text>

        {/* Decision Nodes */}
        {(['A', 'B', 'C'] as DecisionId[]).map(id => {
          const isActive = activeDecision === id;
          return (
            <g 
              key={`node-${id}`} 
              className="cursor-pointer group"
              onClick={() => onDecisionChange(id)}
            >
              <circle 
                cx={nodes[id].x} 
                cy={nodes[id].y} 
                r={isActive ? 10 : 6} 
                fill={isActive ? '#171615' : '#F4EFE7'}
                stroke={isActive ? '#171615' : '#A39B93'}
                strokeWidth={isActive ? 0 : 2}
                className={isActive ? '' : 'group-hover:stroke-[#171615] transition-colors'}
              />
              <text 
                x={nodes[id].x} 
                y={nodes[id].y - 20} 
                textAnchor="middle" 
                className={`mono-val text-[11px] font-semibold transition-colors ${isActive ? 'fill-[#171615]' : 'fill-[#A39B93] group-hover:fill-[#171615]'}`}
              >
                PATH {id}
              </text>
              <text 
                x={nodes[id].x} 
                y={nodes[id].y + 24} 
                textAnchor="middle" 
                className={`text-[14px] font-medium transition-colors ${isActive ? 'fill-[#241F1B]' : 'fill-[#756D65] group-hover:fill-[#241F1B]'}`}
              >
                {SCENARIO_DATA[id].label}
              </text>
            </g>
          );
        })}

        {/* Outcome Nodes */}
        {(['A', 'B', 'C'] as DecisionId[]).map(id => {
          const isActive = activeDecision === id;
          return (
            <g 
              key={`out-${id}`}
              className="cursor-pointer group"
              onClick={() => onDecisionChange(id)}
            >
              <circle 
                cx={nodes[`out${id}` as keyof typeof nodes].x} 
                cy={nodes[`out${id}` as keyof typeof nodes].y} 
                r={isActive ? 8 : 5} 
                fill={getOutcomeColor(id)} 
              />
              <text 
                x={nodes[`out${id}` as keyof typeof nodes].x + 16} 
                y={nodes[`out${id}` as keyof typeof nodes].y + 5} 
                textAnchor="start" 
                className={`text-[13px] md:text-[14px] font-medium transition-colors ${isActive ? 'fill-[#F06445]' : 'fill-[#756D65] group-hover:fill-[#241F1B]'}`}
              >
                {internetLost && isActive ? SCENARIO_DATA[id].withDisruption.title : SCENARIO_DATA[id].base.title}
              </text>
            </g>
          );
        })}

      </svg>
    </div>
  );
};
