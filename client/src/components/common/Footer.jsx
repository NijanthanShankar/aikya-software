import { Link } from 'react-router-dom';
import { GraduationCap, Twitter, Linkedin, Youtube, Github } from 'lucide-react';

const links = {
  Platform: [
    { label: 'Browse Courses', to: '/courses' },
    { label: 'Live Sessions', to: '/live' },
    { label: 'Become an Instructor', to: '/register?role=instructor' },
    { label: 'My Dashboard', to: '/dashboard' },
  ],
  Support: [
    { label: 'Help Center', to: '#' },
    { label: 'Contact Us', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Terms of Service', to: '#' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-ink border-t border-white/10 mt-auto text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">AikyaAcademy</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-xs text-white/50">
              Fellowship programs and certification courses in Reproductive Medicine, Gynecology, and Laparoscopy by Aikya Fertility & Research Centre.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[Twitter, Linkedin, Youtube, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Icon size={16} className="text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-white/50 hover:text-white/90 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} Aikya Academy. All rights reserved.</p>
          <p>Crafted with ❤️ for learners worldwide</p>
        </div>
      </div>
    </footer>
  );
}
