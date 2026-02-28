'use client';

import React from "react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Users,
  HandCoins,
  ChartLine,
  FileText,
  LogIn,
  AlertCircleIcon,
  Award,
  Building,
  IndianRupee
} from 'lucide-react';
import { GOVERNMENT_LOGOS, COMPANY_INFO, COMPANY_LOGOS } from '@/lib/constants/company-info';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('[v0] Login attempt for username:', username);
      
      const response = await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          username,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      console.log('[v0] Login response:', { status: response.status, data });

      if (!response.ok) {
        if (response.status === 401) {
          const errorMsg = data.error || 'Invalid username or password';
          setError(errorMsg);
          console.log('[v0] Login failed:', errorMsg);
        } else {
          setError(data.error || 'Login failed. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      console.log('[v0] Admin login successful');
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('Network error. Please check your connection and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] to-[#e4e8f0] flex items-center justify-center p-4">
      <div className="flex w-full max-w-[1000px] bg-white rounded-2xl overflow-hidden shadow-2xl shadow-orange-900/10">
        
        {/* Brand & Information Panel - Updated to Indian colors */}
        <div className="flex-1 bg-gradient-to-br from-[#FF9933] via-[#e68a2e] to-[#138808] text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 border-4 border-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-20 h-20 border-2 border-white rounded-full"></div>
          </div>
          
          <div className="relative">
            {/* Logo Section */}
            <div className="flex items-center gap-4 mb-10">
              <div className="w-16 h-16 relative bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="EasyLoan Logo"
                  width={64}
                  height={64}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-black tracking-tight text-white">EASY</span>
                  <span className="text-2xl font-black tracking-tight text-white">LOAN</span>
                </div>
                <p className="text-sm text-white/80">Admin Portal</p>
              </div>
            </div>

            {/* Tagline - Updated for India */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-yellow-300" />
                <span className="text-sm text-white/90">For NRIs, For India</span>
              </div>
              <p className="text-lg text-white/90 mb-4 leading-relaxed">
                Secure administrative portal for managing EasyLoan operations, users, loans, and funds.
              </p>
            </div>

            {/* Features List - Updated text */}
            <ul className="space-y-4">
              {[
                { icon: Shield, text: 'Bank-grade security & encryption' },
                { icon: Users, text: 'Comprehensive user management' },
                { icon: HandCoins, text: 'Loan processing & tracking' },
                { icon: ChartLine, text: 'Fund management analytics' },
                { icon: FileText, text: 'Document management system' },
                { icon: Building, text: 'RBI, MCA & CIBIL compliance' },
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3 text-sm text-white/90">
                  <feature.icon className="w-4 h-4 text-white/70" />
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>

            {/* Government Logos - Updated for India */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-xs text-white/70 mb-3">Regulatory Partners</p>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                  <Image src={GOVERNMENT_LOGOS.rbi} alt="RBI" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                  <Image src={GOVERNMENT_LOGOS.mca} alt="MCA" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                  <Image src={GOVERNMENT_LOGOS.cibil} alt="CIBIL" width={32} height={32} className="object-contain" />
                </div>
                <div className="w-8 h-8 bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                  <Image src={GOVERNMENT_LOGOS.digilocker} alt="DigiLocker" width={32} height={32} className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Login Form Panel */}
        <div className="flex-1 p-12 flex flex-col justify-center bg-white">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#FF9933] mb-2">Administrator Sign In</h2>
            <p className="text-gray-600 text-sm">Enter your credentials to access the admin dashboard</p>
          </div>

          {/* Error Message - Updated colors */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-[#138808] rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-[#138808] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[#138808] text-sm font-medium">{error}</p>
                  <p className="text-xs text-red-600 mt-1">
                    Status: 401 - Authentication failed
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all"
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10 pr-12 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#FF9933] focus:ring-[#FF9933]/20 focus:ring-2"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="font-medium text-[#FF9933] hover:text-[#138808] hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !username || !password}
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#FF9933] via-[#e68a2e] to-[#138808] hover:from-[#e68a2e] hover:via-[#d47d29] hover:to-[#0f6d07] text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Security Notice - Updated colors */}
          <div className="mt-6 p-4 bg-orange-50/50 border-l-4 border-[#FF9933] rounded-r-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#FF9933] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                <span className="font-semibold text-[#FF9933]">Security Notice:</span> This is a restricted area for authorized administrators only. All activities are logged and monitored for security purposes.
              </p>
            </div>
          </div>

          {/* Mobile Footer - Updated with Indian regulators */}
          <div className="lg:hidden mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              © {new Date().getFullYear()} {COMPANY_INFO.name} • RBI Registered • MCA Registered • CIBIL Partner
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}