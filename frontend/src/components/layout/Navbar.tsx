import { Link } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar = () => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#EAE3D8]/80 backdrop-blur-md border-b border-[#D8D0C5] transition-colors">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <BrandLogo className="w-5 h-5 text-[#241F1B]" />
          <span className="font-medium text-[15px] tracking-[-0.02em] text-[#241F1B]">FORESIGHTX</span>
        </Link>
        
        <nav className="hidden md:flex items-center gap-10">
          <a href="/#how-it-works" className="text-[13.5px] font-medium text-[#756D65] hover:text-[#241F1B] transition-colors">How It Works</a>
          <a href="/#features" className="text-[13.5px] font-medium text-[#756D65] hover:text-[#241F1B] transition-colors">Capabilities</a>
          <a href="/#industries" className="text-[13.5px] font-medium text-[#756D65] hover:text-[#241F1B] transition-colors">Industries</a>
        </nav>
        
        <div className="flex items-center gap-6">
          <Link to="/workspace" className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-[#171615] text-[#F4EFE7] text-[13px] font-medium hover:bg-[#241F1B] transition-colors shadow-sm">
            Explore FORESIGHTX
          </Link>
        </div>
      </div>
    </header>
  );
};
