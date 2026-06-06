import React, { useState, useEffect } from 'react';
import { Users, Home, AlertOctagon, MessageSquare, Ban, Check, ShieldAlert, Sparkles, UserX, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_pic: string;
  is_banned: number;
}

interface Report {
  id: string;
  filer: string;
  reportedUser: string;
  reason: string;
  status: string;
}

const AdminDashboardComponent: React.FC = () => {
  const { properties } = useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([
    { id: '1', filer: 'Alice Johnson', reportedUser: 'Bob Smith', reason: 'Suspicious listing', status: 'pending' },
    { id: '2', filer: 'Charlie Brown', reportedUser: 'Diana Prince', reason: 'Fake profile', status: 'pending' },
  ]);

  const persistUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers);
    localStorage.setItem('fyr_users', JSON.stringify(updatedUsers));
  };

  useEffect(() => {
    const stored = localStorage.getItem('fyr_users');
    if (stored) {
      try { setUsers(JSON.parse(stored)); } catch { setUsers([]); }
    }
  }, []);

  const handleToggleBan = (id: number) => {
    persistUsers(users.map(u => u.id === id ? { ...u, is_banned: u.is_banned ? 0 : 1 } : u));
  };

  const handleToggleVerify = (id: number) => {
    persistUsers(users.map(u => u.id === id ? { ...u, is_banned: 0 } : u));
  };

  const handleResolveReport = (id: string) => {
    setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' } : r));
  };

  const totalSeekers = users.filter(u => u.role === 'seeker').length;
  const totalOwners = users.filter(u => u.role === 'owner').length;
  const totalListings = properties?.length || 0;
  const activeReportsCount = reports.filter(r => r.status === 'pending').length;

  const stats = [
    { label: 'Total Seekers', value: totalSeekers, icon: Users, color: 'text-amber-600' },
    { label: 'Total Owners', value: totalOwners, icon: Home, color: 'text-emerald-600' },
    { label: 'Total Listings', value: totalListings, icon: MessageSquare, color: 'text-indigo-600' },
    { label: 'Active Reports', value: activeReportsCount, icon: AlertOctagon, color: 'text-rose-600' },
  ];

  return (
    <div className="min-h-screen bg-amber-50/30 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-amber-600" />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-50">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Profile</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Email</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Role</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Verification</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Banned Status</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-slate-100/60 hover:bg-amber-50/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                        user.role === 'owner'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
                        Verified
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        user.is_banned
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.is_banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleVerify(user.id)}
                          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:shadow-md hover:from-amber-600 hover:to-amber-800"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Activate
                        </button>
                        <button
                          onClick={() => handleToggleBan(user.id)}
                          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
                            user.is_banned
                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          }`}
                        >
                          {user.is_banned ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          {user.is_banned ? 'Unban' : 'Ban'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-semibold text-slate-800">Report Management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Filer</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Reported User</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Reason</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="py-3 px-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report.id} className="border-b border-slate-100/60 hover:bg-amber-50/20 transition-colors">
                    <td className="py-3 px-4 text-sm text-slate-800">{report.filer}</td>
                    <td className="py-3 px-4 text-sm text-slate-800">{report.reportedUser}</td>
                    <td className="py-3 px-4 text-sm text-slate-600">{report.reason}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        report.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleResolveReport(report.id)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:shadow-md hover:from-amber-600 hover:to-amber-800"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminDashboard = AdminDashboardComponent;
