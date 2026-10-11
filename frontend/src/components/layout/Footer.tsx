import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export const Footer = () => {
  return (
    <footer className="border-t border-[#D8D0C5] bg-[#EAE3D8] py-20 px-6 lg:px-12 relative z-10">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <BrandLogo className="w-5 h-5 text-[#241F1B]" />
              <span className="font-medium text-[15px] tracking-[-0.02em] text-[#241F1B]">FORESIGHTX</span>
            </Link>
            <p className="text-[14px] text-[#756D65] leading-relaxed max-w-[340px] mb-4">
              FORESIGHTX — Decision Intelligence Powered by Google Gemma 4.
            </p>
            <p className="text-[12px] text-[#A39B93] leading-relaxed max-w-[340px]">
              Explore alternatives, challenge assumptions, and adapt with structured execution plans when conditions change.
            </p>
          </div>
          
          <div>
            <div className="mono-val text-[11px] font-semibold text-[#241F1B] uppercase tracking-widest mb-5">Platform</div>
            <ul className="space-y-3 text-[14px]">
              <li><Link to="/workspace" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">Decision Workspace</Link></li>
              <li><a href="#how-it-works" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">How It Works</a></li>
              <li><a href="#features" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">Capabilities</a></li>
              <li><a href="#industries" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">Industries</a></li>
            </ul>
          </div>
          
          <div>
            <div className="mono-val text-[11px] font-semibold text-[#241F1B] uppercase tracking-widest mb-5">Decision Intel</div>
            <ul className="space-y-3 text-[14px]">
              <li><span className="text-[#756D65] font-medium">Google Gemma 4</span></li>
              <li><span className="text-[#756D65] font-medium">Decision Contracts</span></li>
              <li><span className="text-[#756D65] font-medium">Adaptive Fallbacks</span></li>
              <li><span className="text-[#756D65] font-medium">Deterministic Guardrails</span></li>
            </ul>
          </div>
          
          <div>
            <div className="mono-val text-[11px] font-semibold text-[#241F1B] uppercase tracking-widest mb-5">Company</div>
            <ul className="space-y-3 text-[14px]">
              <li><a href="#about" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">About FORESIGHTX</a></li>
              <li><a href="#terms" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">Terms of Service</a></li>
              <li><a href="#privacy" className="text-[#756D65] hover:text-[#241F1B] transition-colors font-medium">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#D8D0C5] flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#A39B93] mono-val font-medium">
          <div>© 2026 FORESIGHTX — Decision Intelligence Powered by Google Gemma 4.</div>
          <div className="flex items-center gap-8">
            <a href="#privacy" className="hover:text-[#756D65] transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-[#756D65] transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
