'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  User,
  UserPlus,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getAllUsers } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    search: '',
    status: 'all',
    dateRange: 'all',
    customStart: '',
    customEnd: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedUser, setExpandedUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const itemsPerPage = 10;

  // ─── Highlight search term ────────────────────────────────
  const highlightText = (text, query) => {
    if (!query || !text || typeof text !== 'string') return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-bold text-black px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // ─── Load users from API ──────────────────────────────────
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await getAllUsers(); // returns { users: [...] }
        const userList = data || [];

        // ── Normalize: ensure every user has an `id` and all fields ──
        const normalized = userList.map((user) => ({
          id: user._id || user.id || `user-${Math.random().toString(36).substr(2, 6)}`,
          _id: user._id || user.id, // keep original _id for reference
          name: user.name || 'Unknown',
          email: user.email || 'unknown@example.com',
          phone: user.phone || 'N/A',
          address: user.address || 'N/A',
          status: user.status || 'active',
          createdAt: user.createdAt || new Date().toISOString(),
          lastLogin: user.lastLogin || new Date().toISOString(),
          deletedAt: user.deletedAt || null,
          role: user.role || 'user',
        }));
        setUsers(normalized);
      } catch (err) {
        console.error('Failed to load users:', err);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // ─── Filter & Sort ─────────────────────────────────────────
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Status filter
    if (filter.status !== 'all') {
      result = result.filter((u) => u.status === filter.status);
    }

    // Date range (registration)
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    const yearStart = new Date(now);
    yearStart.setFullYear(now.getFullYear() - 1);

    if (filter.dateRange === 'today') {
      result = result.filter((u) => new Date(u.createdAt) >= todayStart);
    } else if (filter.dateRange === 'week') {
      result = result.filter((u) => new Date(u.createdAt) >= weekStart);
    } else if (filter.dateRange === 'month') {
      result = result.filter((u) => new Date(u.createdAt) >= monthStart);
    } else if (filter.dateRange === 'year') {
      result = result.filter((u) => new Date(u.createdAt) >= yearStart);
    } else if (filter.dateRange === 'custom' && filter.customStart && filter.customEnd) {
      const start = new Date(filter.customStart);
      const end = new Date(filter.customEnd);
      end.setHours(23, 59, 59);
      result = result.filter((u) => {
        const d = new Date(u.createdAt);
        return d >= start && d <= end;
      });
    }

    // ── Search: match against name, email, or _id ──
    if (filter.search.trim()) {
      const query = filter.search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          (u._id && u._id.toLowerCase().includes(query)) ||
          (u.id && u.id.toLowerCase().includes(query))
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'createdAt' || sortConfig.key === 'lastLogin') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortConfig.key === 'name') {
          aVal = a.name;
          bVal = b.name;
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [users, filter, sortConfig]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─── Stats ──────────────────────────────────────────────────
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const deletedUsers = users.filter((u) => u.status === 'deleted').length;
  const suspendedUsers = users.filter((u) => u.status === 'suspended').length;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = users.filter((u) => new Date(u.createdAt) >= monthStart).length;

  // ─── Toggle expand ─────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedUser(expandedUser === id ? null : id);
  };

  // ─── Sort handler ──────────────────────────────────────────
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // ─── Status badge ──────────────────────────────────────────
  const statusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      deleted: 'bg-red-100 text-red-800',
      suspended: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span
        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // ─── Format date ───────────────────────────────────────────
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // ─── Clear filters ─────────────────────────────────────────
  const clearFilters = () => {
    setFilter({
      search: '',
      status: 'all',
      dateRange: 'all',
      customStart: '',
      customEnd: '',
    });
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1a237e]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 sm:px-0">
      {/* ─── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Users</h1>
          <p className="text-gray-700 text-sm">Manage all registered users</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={clearFilters}
            className="text-sm text-gray-700 hover:text-black transition"
          >
            Clear Filters
          </button>
          <button className="bg-[#1a237e] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0d1757] transition shadow-sm">
            Export Data
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          label="Total Users"
          value={totalUsers}
          bg="bg-blue-50"
        />
        <StatCard
          icon={<UserCheck className="w-5 h-5 text-green-600" />}
          label="Active"
          value={activeUsers}
          bg="bg-green-50"
        />
        <StatCard
          icon={<UserX className="w-5 h-5 text-red-600" />}
          label="Deleted"
          value={deletedUsers}
          bg="bg-red-50"
        />
        <StatCard
          icon={<UserPlus className="w-5 h-5 text-purple-600" />}
          label="New This Month"
          value={newThisMonth}
          bg="bg-purple-50"
        />
      </div>

      {/* ─── Filters ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
          {/* Status */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Filter size={18} className="text-gray-600 flex-shrink-0" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="deleted">Deleted</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Date range */}
          <div className="flex items-center gap-2 flex-1 min-w-[140px]">
            <Calendar size={18} className="text-gray-600 flex-shrink-0" />
            <select
              value={filter.dateRange}
              onChange={(e) => setFilter({ ...filter, dateRange: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="year">Last Year</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {filter.dateRange === 'custom' && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={filter.customStart}
                onChange={(e) => setFilter({ ...filter, customStart: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white w-full sm:w-auto"
              />
              <span className="text-gray-600 text-sm">to</span>
              <input
                type="date"
                value={filter.customEnd}
                onChange={(e) => setFilter({ ...filter, customEnd: e.target.value })}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white w-full sm:w-auto"
              />
            </div>
          )}

          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white font-medium"
            />
          </div>
        </div>
        <div className="mt-3 text-xs sm:text-sm text-gray-700">
          Showing {paginatedUsers.length} of {filteredUsers.length} users
          {filter.search && ` (matching "${filter.search}")`}
        </div>
      </div>

      {/* ─── Users Table ────────────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-4 py-3 font-semibold text-black cursor-pointer hover:text-[#1a237e]"
                  onClick={() => handleSort('name')}
                >
                  Name{' '}
                  {sortConfig.key === 'name' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp className="inline w-4" />
                    ) : (
                      <ChevronDown className="inline w-4" />
                    ))}
                </th>
                <th className="px-4 py-3 font-semibold text-black">Email</th>
                <th
                  className="px-4 py-3 font-semibold text-black cursor-pointer hover:text-[#1a237e]"
                  onClick={() => handleSort('createdAt')}
                >
                  Registered{' '}
                  {sortConfig.key === 'createdAt' &&
                    (sortConfig.direction === 'asc' ? (
                      <ChevronUp className="inline w-4" />
                    ) : (
                      <ChevronDown className="inline w-4" />
                    ))}
                </th>
                <th className="px-4 py-3 font-semibold text-black">Status</th>
                <th className="px-4 py-3 font-semibold text-black text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-600">
                    <User size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium">No users found</p>
                    <p className="text-sm text-gray-500">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-black font-medium">
                        {highlightText(user.name, filter.search)}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {highlightText(user.email, filter.search)}
                      </td>
                      <td className="px-4 py-3 text-black">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">{statusBadge(user.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(user.id)}
                          className="text-gray-600 hover:text-black transition"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedUser === user.id && (
                      <tr>
                        <td colSpan="5" className="px-4 py-4 bg-gray-50/80 border-t border-gray-200">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-black flex items-center gap-2">
                              <User size={16} /> User Details
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Phone</p>
                                <p className="text-black">{user.phone}</p>
                                <p className="text-gray-600 mt-1">Address</p>
                                <p className="text-black">{user.address}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Role</p>
                                <p className="text-black capitalize">{user.role}</p>
                                <p className="text-gray-600 mt-1">Last Login</p>
                                <p className="text-black">{formatDate(user.lastLogin)}</p>
                                {user.deletedAt && (
                                  <>
                                    <p className="text-gray-600 mt-1">Deleted At</p>
                                    <p className="text-black">{formatDate(user.deletedAt)}</p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Mobile Cards ───────────────────────────────────── */}
      <div className="lg:hidden space-y-4">
        {paginatedUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <User size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-black">No users found</p>
            <p className="text-sm text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-black">
                    {highlightText(user.name, filter.search)}
                  </p>
                  <p className="text-sm text-gray-700">
                    {highlightText(user.email, filter.search)}
                  </p>
                </div>
                {statusBadge(user.status)}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                <span>Registered: {formatDate(user.createdAt)}</span>
              </div>
              <button
                onClick={() => toggleExpand(user.id)}
                className="mt-3 w-full text-center text-sm text-[#1a237e] hover:text-[#0d1757] font-medium border-t border-gray-100 pt-2 flex items-center justify-center gap-1"
              >
                {expandedUser === user.id ? 'Hide Details' : 'View Details'}{' '}
                <ChevronDown
                  size={16}
                  className={`transition-transform ${expandedUser === user.id ? 'rotate-180' : ''}`}
                />
              </button>
              {expandedUser === user.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-gray-600 text-xs">Phone</p>
                      <p className="text-black">{user.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Role</p>
                      <p className="text-black capitalize">{user.role}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600 text-xs">Address</p>
                      <p className="text-black">{user.address}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">Last Login</p>
                      <p className="text-black">{formatDate(user.lastLogin)}</p>
                    </div>
                    {user.deletedAt && (
                      <div>
                        <p className="text-gray-600 text-xs">Deleted At</p>
                        <p className="text-black">{formatDate(user.deletedAt)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ─── Pagination ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="text-xs sm:text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-black text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-black text-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card Component ────────────────────────────────────
function StatCard({ icon, label, value, bg }) {
  return (
    <div
      className={`${bg} rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition`}
    >
      <div className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-700 truncate">{label}</p>
        <p className="text-sm sm:text-lg font-bold text-black truncate">{value}</p>
      </div>
    </div>
  );
}