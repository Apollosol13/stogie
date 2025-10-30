'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Archive, MapPin, User, Camera } from 'lucide-react';

const navItems = [
  { href: '/feed', label: 'Feed', icon: Home },
  { href: '/map', label: 'Map', icon: MapPin },
  { href: '/capture', label: 'Capture', icon: Camera },
  { href: '/humidor', label: 'Humidor', icon: Archive },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/[0.08] z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname?.startsWith(item.href);
            const isCapture = item.href === '/capture';

            if (isCapture) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center relative"
                >
                  <div className="absolute -top-8 w-14 h-14 rounded-full bg-accentGold flex items-center justify-center shadow-lg shadow-accentGold/50">
                    <Icon size={24} className="text-bgPrimary" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs mt-6 text-textSecondary font-semibold">
                    {item.label.toUpperCase()}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 py-2"
              >
                <Icon
                  size={24}
                  className={isActive ? 'text-accentGold' : 'text-textSecondary'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-xs font-semibold ${
                    isActive ? 'text-accentGold' : 'text-textSecondary'
                  }`}
                >
                  {item.label.toUpperCase()}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

