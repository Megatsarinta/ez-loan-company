'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  UserPlus,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Users,
  Calendar,
  Lock,
  User,
  IndianRupee,
} from 'lucide-react';
import { GOVERNMENT_LOGOS, COMPANY_LOGOS, COMPANY_INFO } from '@/lib/constants/company-info';
import { toast } from 'sonner';

interface AdminRow {
  id: number;
  username: string;
  email: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export default function AdminAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createConfirmPassword, setCreateConfirmPassword] = useState('');
  const [createRole, setCreateRole] = useState('admin');
  const [submitting, setSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/admin/admins');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 403) {
          setError(data.error || 'You do not have permission to view this page.');
          setAdmins([]);
          return;
        }
        throw new Error(data.error || 'Failed to load admins');
      }
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load admins');
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createUsername.trim()) {
      toast.error('Username is required');
      return;
    }
    if (!createPassword) {
      toast.error('Password is required');
      return;
    }
    if (createPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (createPassword !== createConfirmPassword) {
      toast.error('Password and Confirm Password do not match');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createUsername.trim(),
          password: createPassword,
          confirmPassword: createConfirmPassword,
          role: createRole,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to create admin');
        return;
      }

      toast.success(`Admin "${createUsername.trim()}" created successfully. They can log in now.`);
      setShowCreateModal(false);
      setCreateUsername('');
      setCreatePassword('');
      setCreateConfirmPassword('');
      setCreateRole('admin');
      fetchAdmins();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-orange-50 to-green-50">
      {/* Header - Using EasyLoan company logo */}
      <header className="bg-white border-b border-[#e9ecef] shadow-sm sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 text-[#6C757D] hover:text-[#FF9933] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </Link>
            <div className="flex items-center gap-3">
              {/* Company Logo - EasyLoan.png */}
              <div className="w-10 h-10 relative">
                <Image
                  src={COMPANY_LOGOS.main}
                  alt="EasyLoan"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#212529]">Admin Management</h1>
                <p className="text-sm text-[#6C757D]">Create and view administrator accounts</p>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Create New Admin
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-4xl mx-auto">
        {error && (
          <Card className="p-4 mb-6 bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        )}

        {loading ? (
          <Card className="p-12 text-center border border-[#e9ecef]">
            <Loader2 className="w-10 h-10 animate-spin text-[#FF9933] mx-auto mb-4" />
            <p className="text-[#6C757D]">Loading admins...</p>
          </Card>
        ) : (
          <Card className="border border-[#e9ecef] overflow-hidden">
            <div className="p-4 border-b border-[#e9ecef] bg-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FF9933]" />
              <h2 className="text-lg font-semibold text-[#212529]">Administrators</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#f8f9fa] border-b border-[#e9ecef]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212529]">#</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212529]">Username</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212529]">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212529]">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[#212529]">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-[#6C757D]">
                        No administrators found.
                      </td>
                    </tr>
                  ) : (
                    admins.map((admin, index) => (
                      <tr
                        key={admin.id}
                        className="border-b border-[#e9ecef] hover:bg-[#f8f9fa] transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-[#6C757D]">{index + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-[#212529]">{admin.username}</span>
                          {admin.email && (
                            <span className="block text-xs text-[#6C757D]">{admin.email}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                              admin.role === 'SUPER_ADMIN'
                                ? 'bg-[#FF9933]/10 text-[#FF9933]'
                                : 'bg-[#6C757D]/10 text-[#6C757D]'
                            }`}
                          >
                            <Shield className="w-3 h-3" />
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              admin.is_active
                                ? 'text-[#138808] font-medium'
                                : 'text-[#FF9933] font-medium'
                            }
                          >
                            {admin.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#6C757D]">
                          {formatDate(admin.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => !submitting && setShowCreateModal(false)}
        >
          <Card
            className="w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#e9ecef] flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#212529] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#FF9933]" />
                Create New Administrator
              </h3>
              <button
                type="button"
                onClick={() => !submitting && setShowCreateModal(false)}
                className="text-[#6C757D] hover:text-[#212529] p-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
              <div>
                <Label htmlFor="create-username" className="flex items-center gap-2 text-[#212529]">
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="create-username"
                  type="text"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20"
                  autoComplete="username"
                  disabled={submitting}
                  minLength={2}
                />
              </div>
              <div>
                <Label htmlFor="create-password" className="flex items-center gap-2 text-[#212529]">
                  <Lock className="w-4 h-4" />
                  Password
                </Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="mt-1 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20"
                  autoComplete="new-password"
                  disabled={submitting}
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="create-confirm" className="flex items-center gap-2 text-[#212529]">
                  Confirm Password
                </Label>
                <Input
                  id="create-confirm"
                  type="password"
                  value={createConfirmPassword}
                  onChange={(e) => setCreateConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="mt-1 focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20"
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="create-role" className="text-[#212529]">Role</Label>
                <select
                  id="create-role"
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-[#e9ecef] rounded-lg bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#FF9933]"
                  disabled={submitting}
                >
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-[#6C757D] mt-1">
                  Senior Administrator is reserved for initial setup.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-2 border-[#e9ecef] hover:border-[#FF9933] hover:text-[#FF9933]"
                  onClick={() => !submitting && setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#FF9933] to-[#138808] hover:from-[#e68a2e] hover:to-[#0f6d07] text-white"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    'Create Admin'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}