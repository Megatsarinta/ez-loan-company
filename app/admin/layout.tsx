'use client';

import React, { useEffect, useState } from "react";
import { AdminSidebar } from '@/components/admin-sidebar';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { COMPANY_LOGOS } from '@/lib/constants/company-info';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!response.ok) {
          console.log('[v0] Admin not authenticated, redirecting to login');
          router.push('/admin-login');
          return;
        }

        const data = await response.json();
        if (data.success) {
          console.log('[v0] Admin authenticated:', data.admin);
          setIsAuthorized(true);
        } else {
          router.push('/admin-login');
        }
      } catch (error) {
        console.error('[v0] Auth check error:', error);
        router.push('/admin-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 relative">
              <Image
                src={COMPANY_LOGOS.main}
                alt="EasyLoan"
                width={80}
                height={80}
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Brand Name - Updated to Indian colors */}
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-3xl font-black tracking-tight text-[#FF9933]">EASY</span>
            <span className="text-3xl font-black tracking-tight text-[#138808]">LOAN</span>
          </div>
          
          {/* Spinner - Updated to Indian colors */}
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-16 h-16 border-4 border-[#FF9933] border-t-[#138808] rounded-full animate-spin" />
          </div>
          
          {/* Loading Text */}
          <p className="text-[#212529] font-medium text-lg">Loading Admin Portal...</p>
          <p className="text-[#6C757D] text-sm">Please wait while we verify your credentials</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-orange-50 to-green-50">
      {/* Sidebar - only shown for authenticated admin */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="md:ml-64 mt-14 md:mt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}