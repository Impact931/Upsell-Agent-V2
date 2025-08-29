'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FolderOpen, Users, Settings, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { clsx } from 'clsx';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['manager', 'staff'],
  },
  {
    name: 'Materials',
    href: '/materials',
    icon: FolderOpen,
    roles: ['manager', 'staff'],
  },
  {
    name: 'Upload',
    href: '/upload',
    icon: Upload,
    roles: ['manager'],
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    roles: ['manager'],
  },
];

export function BottomNav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'staff')
  );

  // Don't show bottom nav on auth pages
  if (pathname === '/login' || pathname === '/register') {
    return null;
  }

  return (
    <nav className="bottom-nav md:hidden">
      {filteredNavItems.slice(0, 4).map((item) => { // Limit to 4 items on mobile
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        
        return (
          <Link
            key={item.name}
            href={item.href}
            className={clsx(
              'bottom-nav__item',
              {
                'bottom-nav__item--active': isActive,
              }
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="bottom-nav__icon" />
            <span className="bottom-nav__label">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}