// Admin Sidebar Navigation Component
'use client';

import { Button } from "@/components/ui/button"
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { LayoutDashboard, Users, FileText, Wallet, Menu, X, ChevronDown, Shield, Banknote } from 'lucide-react';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS } from '@/lib/constants/company-info';

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [adminRole, setAdminRole] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    documents: false,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/admin', { method: 'GET', cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setAdminRole(data.admin?.role ?? null);
        }
      } catch {
        setAdminRole(null);
      }
    };
    fetchSession();
  }, []);

  const baseNavItems = [
    {
      label: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'User Management',
      href: '/admin/users',
      icon: Users,
    },
    {
      label: 'Loan Management',
      href: '/admin/loans',
      icon: FileText,
    },
    {
      label: 'Fund Management',
      href: '/admin/funds',
      icon: Wallet,
    },
    {
      label: 'Deposit Management',
      href: '/admin/deposits',
      icon: Banknote,
    },
  ];

  const adminManagementItem = {
    label: 'Admin Management',
    href: '/admin/admins',
    icon: Shield,
  };

  const navItems = adminRole === 'SUPER_ADMIN'
    ? [...baseNavItems, adminManagementItem]
    : baseNavItems;

  const documentItems = [
    {
      label: 'Loan Approval Letter',
      href: '/admin/documents/loan-approval-letter',
    },
    {
      label: 'Loan List Table',
      href: '/admin/documents/loan-list-table',
    },
    {
      label: 'Repayment Schedule',
      href: '/admin/documents/repayment-schedule',
    },
  ];

  const isActive = (href: string) => pathname === href;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const NavContent = () => (
    <>
      {/* Logo/Brand - Fixed: Using COMPANY_LOGOS.main and Indian colors */}
      <div className="p-6 border-b border-[#e9ecef] bg-gradient-to-r from-[#FF9933]/5 via-white to-[#138808]/5">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 relative">
            <Image
              src={COMPANY_LOGOS.main} // ✅ Fixed: Using company logo, not Digital India
              alt="EasyLoan Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
              onError={() => {
                console.log('[v0] EasyLoan logo failed to load');
              }}
            />
          </div>
          <div>
            <div className="flex items-baseline">
              {/* ✅ Fixed: Changed from blue/red to saffron/green */}
              <span className="text-lg font-black tracking-tight">
                <span className="text-[#FF9933]">EASY</span>
                <span className="text-[#138808]">LOAN</span>
              </span>
            </div>
            <p className="text-xs text-[#6C757D] font-medium">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                active
                  ? 'bg-gradient-to-r from-[#FF9933] to-[#138808] text-white shadow-md hover:shadow-lg' // ✅ Fixed: Gradient to saffron/green
                  : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#FF9933]' // ✅ Fixed: Hover to saffron
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}

        {/* Document Management Section */}
        <div className="pt-4 border-t border-[#e9ecef] mt-4">
          <button
            onClick={() => toggleSection('documents')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              expandedSections.documents
                ? 'bg-[#138808]/10 text-[#FF9933] border-l-4 border-[#FF9933]' // Document activation: saffron border, green background
                : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#FF9933]'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="font-medium flex-1">Document Management</span>
            <ChevronDown 
              className={`w-4 h-4 transition-transform ${expandedSections.documents ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Document Submenu */}
          {expandedSections.documents && (
            <div className="pl-8 mt-2 space-y-1">
              {documentItems.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm ${
                      active
                        ? 'bg-[#138808] text-white border-l-2 border-[#FF9933]' // Active doc: green bg, saffron border
                        : 'text-[#6C757D] hover:bg-[#f8f9fa] hover:text-[#FF9933]'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Footer - Optional */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e9ecef] bg-white">
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-[#138808] rounded-full"></div> {/* ✅ Fixed: Green status dot */}
          <span className="text-xs text-[#6C757D]">System Online</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-white border-r border-[#e9ecef] min-h-screen fixed left-0 top-0 overflow-y-auto shadow-sm">
        <NavContent />
      </aside>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gradient-to-r from-[#FF9933]/10 via-white to-[#138808]/10 border-b border-[#e9ecef] z-50 flex items-center justify-between px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 relative">
            <Image
              src={COMPANY_LOGOS.main} // ✅ Fixed: Using company logo for mobile
              alt="EasyLoan Logo"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex items-baseline">
            <span className="text-base font-black tracking-tight">
              <span className="text-[#FF9933]">EASY</span>
              <span className="text-[#138808]">LOAN</span>
            </span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setIsOpen(false)}>
          <aside className="bg-white w-64 h-screen overflow-y-auto shadow-lg">
            <NavContent />
          </aside>
        </div>
      )}
    </>
  );
}