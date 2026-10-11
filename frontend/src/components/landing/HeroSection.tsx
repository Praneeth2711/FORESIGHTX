import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="relative z-10 w-full min-h-[100vh] flex flex-col justify-center px-6 lg:px-12 pointer-events-none">
      <div className="max-w-[1400px] mx-auto w-full mt-20">
        <div className="max-w-[660px]">
          <div className="mono-val text-[11px] md:text-[13px] font-semibold tracking-[0.15em] text-[#F06445] mb-6 md:mb-8 uppercase">
            FORESIGHTX / AI-POWERED DECISION INTELLIGENCE & ADAPTIVE EXECUTION
          </div>
          <h1 className="text-[58px] md:text-[84px] lg:text-[94px] font-medium tracking-[-0.04em] leading-[0.98] text-[#171615] mb-8 md:mb-10">
            Think Beyond<br />
            the Decision.
          </h1>
          
          <div className="flex flex-col gap-8">
            <p className="text-[17px] md:text-[21px] text-[#241F1B] font-normal leading-[1.5]">
              Explore alternatives, challenge assumptions, turn decisions into action plans, and adapt when conditions change — powered by Gemma 4.
            </p>
            
            <div className="flex flex-wrap items-center gap-4 pointer-events-auto">
              <Link
                to="/workspace"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-[#F06445] text-white text-[15px] font-medium hover:bg-[#D04525] transition-colors shadow-sm group"
              >
                Explore FORESIGHTX
                <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-transparent border border-[#241F1B] text-[#241F1B] text-[15px] font-medium hover:bg-[#171615] hover:text-[#F4EFE7] transition-colors"
              >
                See How It Works
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
