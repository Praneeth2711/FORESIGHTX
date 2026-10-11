import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollState } from './store';

gsap.registerPlugin(ScrollTrigger);

export const Storytelling = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // We bind the scroll progress of the whole container to the 3D sculpture's scrollState
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        scrollState.progress = self.progress;
      }
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative z-10 w-full" id="story">
      {/* Spacer for Hero to be visible */}
      <div className="h-[100vh] w-full pointer-events-none" />

      {/* Chapters */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        
        {/* CHAPTER 1 */}
        <section className="min-h-[100vh] flex flex-col justify-center max-w-[500px]">
          <div className="mono-val text-[12px] font-semibold text-[#F06445] mb-5 tracking-widest uppercase">Chapter 01</div>
          <h2 className="text-[40px] md:text-[56px] font-medium tracking-[-0.03em] text-[#241F1B] leading-[1.1] mb-6">
            One disruption changes everything.
          </h2>
          <p className="text-[17px] md:text-[20px] text-[#756D65] leading-[1.6]">
            A critical server crashes, a supply route breaks down, or an event schedule slips. An isolated incident creates compounding operational friction across your entire workflow.
          </p>
        </section>

        {/* CHAPTER 2 */}
        <section className="min-h-[100vh] flex flex-col justify-center items-end text-right max-w-[500px] ml-auto">
          <div className="mono-val text-[12px] font-semibold text-[#F06445] mb-5 tracking-widest uppercase">Chapter 02</div>
          <h2 className="text-[40px] md:text-[56px] font-medium tracking-[-0.03em] text-[#241F1B] leading-[1.1] mb-6">
            Every response creates another future.
          </h2>
          <p className="text-[17px] md:text-[20px] text-[#756D65] leading-[1.6]">
            You have strategic alternatives: immediate stabilization, redundant failover, or tactical restructuring. Each path introduces unique trade-offs and operational prerequisites.
          </p>
        </section>

        {/* CHAPTER 3 */}
        <section className="min-h-[100vh] flex flex-col justify-center max-w-[600px]">
          <div className="mono-val text-[12px] font-semibold text-[#F06445] mb-5 tracking-widest uppercase">Chapter 03</div>
          <h2 className="text-[40px] md:text-[56px] font-medium tracking-[-0.03em] text-[#241F1B] leading-[1.1] mb-6">
            See the consequences before deciding.
          </h2>
          <p className="text-[17px] md:text-[20px] text-[#756D65] leading-[1.6]">
            FORESIGHTX evaluates alternative decision paths, tracks live dependency guardrails, and deploys adaptive execution plans — powered by Google Gemma 4.
          </p>
        </section>

      </div>
    </div>
  );
};
