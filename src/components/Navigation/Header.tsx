'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Home,
  FolderOpen,
  Users,
  Upload,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui';
import { clsx } from 'clsx';
import { useNotifications } from '@/hooks/useNotifications';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    roles: ['manager', 'staff'],
  },
  {
    name: 'Products',
    href: '/upload',
    icon: Upload,
    roles: ['manager'],
  },
  {
    name: 'Materials',
    href: '/materials',
    icon: FolderOpen,
    roles: ['manager', 'staff'],
  },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Get real notifications
  const { notifications, unreadCount, isLoading: notificationsLoading } = useNotifications();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    if (showNotifications || isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications, isUserMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/materials?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
  };

  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(user?.role || 'staff')
  );

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-sage-200/40 shadow-spa sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Mobile Menu Toggle */}
          <div className="flex items-center">
            <button
              className="md:hidden p-2 rounded-xl text-earth-400 hover:text-sage-500 hover:bg-sage-50/50 focus:outline-none focus:ring-2 focus:ring-sage-300/50 transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            <Link href="/dashboard" className="flex items-center ml-2 md:ml-0 group">
              <div className="w-10 h-10 bg-gradient-to-br from-sage-400 to-sage-500 rounded-xl flex items-center justify-center mr-3 shadow-spa group-hover:shadow-spa-lg group-hover:scale-105 transition-all duration-300">
                <span className="text-white font-bold text-xl font-display">U</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-display text-xl font-semibold text-earth-800 group-hover:text-sage-600 transition-colors">
                  Upsell Agent for {user?.businessName || 'Business Name'}
                </div>
                <div className="text-xs text-earth-500 -mt-1">Sales Training Platform</div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 group ${
                    isActive
                      ? 'bg-sage-100/70 text-sage-700 shadow-spa'
                      : 'text-earth-600 hover:text-sage-600 hover:bg-sage-50/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 transition-colors ${
                    isActive ? 'text-sage-600' : 'text-earth-400 group-hover:text-sage-500'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side: Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="hidden lg:block">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  className="w-64 px-4 py-2 pl-10 pr-4 text-sm border-2 border-sage-200/60 bg-white/70 backdrop-blur-sm rounded-xl focus:ring-2 focus:ring-sage-300/50 focus:border-sage-300 focus:outline-none transition-all duration-300 placeholder:text-earth-400"
                  placeholder="Search product materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search training materials"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-earth-400 hover:text-sage-500 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                className="p-2 text-earth-400 hover:text-sage-500 hover:bg-sage-50/60 rounded-xl relative transition-all duration-200"
                aria-label="Notifications"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-accent-coral rounded-full flex items-center justify-center text-xs font-bold text-white animate-pulse"
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              {notification.type === 'completed' ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <Clock className="w-5 h-5 text-blue-500" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sm text-gray-900">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-2">
                                {notification.timestamp}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No notifications</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-200">
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                className="flex items-center space-x-2 p-2 text-sm rounded-xl text-earth-600 hover:bg-sage-50/60 focus:outline-none focus:ring-2 focus:ring-sage-300/50 transition-all duration-200"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="User menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-sage-200 to-earth-200 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-sage-600" />
                </div>
                <span className="hidden sm:block font-medium">
                  {user?.businessName || 'User'}
                </span>
                <ChevronDown className="w-4 h-4 text-earth-400" />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
                  style={{ boxShadow: 'var(--shadow-lg)' }}
                >
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
                    <p className="text-sm font-medium" style={{ color: 'var(--neutral-900)' }}>
                      {user?.businessName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--neutral-600)' }}>
                      {user?.email}
                    </p>
                    <p className="text-xs capitalize" style={{ color: 'var(--neutral-500)' }}>
                      {user?.role} • {user?.businessType}
                    </p>
                  </div>
                  
                  <div className="py-1">
                    <Link
                      href="/settings"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--neutral-700)' }}
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--neutral-700)' }}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 md:hidden bg-white border-t shadow-lg z-40" style={{ borderColor: 'var(--neutral-200)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--neutral-200)' }}>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="search"
                  className="w-full px-4 py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Search materials..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search training materials"
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 left-0 pl-3 flex items-center"
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                </button>
              </form>
            </div>
            
            <nav className="px-2 py-2 space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={clsx(
                      'flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors',
                      isActive
                        ? 'bg-teal-100 text-teal-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    )}
                    style={{
                      backgroundColor: isActive ? 'var(--primary-teal-pale)' : 'transparent',
                      color: isActive ? 'var(--primary-teal-dark)' : 'var(--neutral-600)',
                    }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile User Info */}
            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--neutral-200)' }}>
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <User className="w-5 h-5" style={{ color: 'var(--neutral-600)' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--neutral-900)' }}>
                    {user?.businessName}
                  </p>
                  <p className="text-sm capitalize" style={{ color: 'var(--neutral-600)' }}>
                    {user?.role} • {user?.businessType}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <Link
                  href="/settings"
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors"
                  style={{ color: 'var(--neutral-700)' }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </Link>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors text-left"
                  style={{ color: 'var(--neutral-700)' }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}