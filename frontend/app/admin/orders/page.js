'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Eye,
  Package,
  DollarSign,
  ShoppingBag,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    dateRange: 'all',
    customStart: '',
    customEnd: '',
    status: 'all',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
  const itemsPerPage = 10;

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

  useEffect(() => {
    const loadOrders = () => {
      try {
        const stored = localStorage.getItem('orders');
        const parsed = stored ? JSON.parse(stored) : [];
        const normalized = parsed.map(order => ({
          id: order.id || `ORD-${Math.random().toString(36).substr(2, 4)}`,
          orderDate: order.orderDate || new Date().toISOString(),
          customer: {
            name: order.customer?.name || 'Unknown',
            email: order.customer?.email || 'unknown@example.com',
            userId: order.customer?.userId || 'unknown',
          },
          items: order.items || [],
          total: order.total || 0,
          status: order.status || 'Pending',
          shipping: {
            address: order.shipping?.address || 'N/A',
            phone: order.shipping?.phone || 'N/A',
          },
        }));
        setOrders(normalized);
      } catch (err) {
        console.error('Failed to load orders:', err);
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    let result = [...orders];
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now);
    monthStart.setMonth(now.getMonth() - 1);
    const yearStart = new Date(now);
    yearStart.setFullYear(now.getFullYear() - 1);

    if (filter.dateRange === 'today') {
      result = result.filter(o => new Date(o.orderDate) >= todayStart);
    } else if (filter.dateRange === 'week') {
      result = result.filter(o => new Date(o.orderDate) >= weekStart);
    } else if (filter.dateRange === 'month') {
      result = result.filter(o => new Date(o.orderDate) >= monthStart);
    } else if (filter.dateRange === 'year') {
      result = result.filter(o => new Date(o.orderDate) >= yearStart);
    } else if (filter.dateRange === 'custom' && filter.customStart && filter.customEnd) {
      const start = new Date(filter.customStart);
      const end = new Date(filter.customEnd);
      end.setHours(23, 59, 59);
      result = result.filter(o => {
        const d = new Date(o.orderDate);
        return d >= start && d <= end;
      });
    }

    if (filter.status !== 'all') {
      result = result.filter(o => o.status === filter.status);
    }

    if (filter.search.trim()) {
      const query = filter.search.toLowerCase();
      result = result.filter(o =>
        o.id.toLowerCase().includes(query) ||
        o.customer?.name?.toLowerCase().includes(query) ||
        o.customer?.email?.toLowerCase().includes(query)
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        if (sortConfig.key === 'orderDate') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        } else if (sortConfig.key === 'total') {
          aVal = Number(aVal);
          bVal = Number(bVal);
        } else if (sortConfig.key === 'customer') {
          aVal = a.customer?.name || '';
          bVal = b.customer?.name || '';
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [orders, filter, sortConfig]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalOrders = filteredOrders.length;
  const totalRevenue = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalUsers = new Set(
    filteredOrders.map(o => o.customer?.userId || 'unknown')
  ).size;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const toggleExpand = (id) => {
    setExpandedOrder(expandedOrder === id ? null : id);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const statusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Processing: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-indigo-100 text-indigo-800',
      Delivered: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const clearFilters = () => {
    setFilter({
      dateRange: 'all',
      customStart: '',
      customEnd: '',
      status: 'all',
      search: '',
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black">Orders</h1>
          <p className="text-gray-700 text-sm">Manage and track all orders</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button onClick={clearFilters} className="text-sm text-gray-700 hover:text-black transition">
            Clear Filters
          </button>
          <button className="bg-[#1a237e] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-[#0d1757] transition shadow-sm">
            Export Data
          </button>
        </div>
      </div>

      {/* ─── Stats Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={<ShoppingBag className="w-5 h-5 text-blue-600" />} label="Total Orders" value={totalOrders} bg="bg-blue-50" />
        <StatCard icon={<DollarSign className="w-5 h-5 text-green-600" />} label="Total Revenue" value={`₹${totalRevenue.toFixed(2)}`} bg="bg-green-50" />
        <StatCard icon={<Users className="w-5 h-5 text-purple-600" />} label="Unique Customers" value={totalUsers} bg="bg-purple-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-orange-600" />} label="Avg Order Value" value={`₹${avgOrderValue.toFixed(2)}`} bg="bg-orange-50" />
      </div>

      {/* ─── Filters ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
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

          {/* Status */}
          <div className="flex items-center gap-2 flex-1 min-w-[120px]">
            <Filter size={18} className="text-gray-600 flex-shrink-0" />
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[160px] relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              type="text"
              placeholder="Search..."
              value={filter.search}
              onChange={(e) => setFilter({ ...filter, search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1a237e] focus:border-[#1a237e] outline-none text-black bg-white font-medium"
            />
          </div>
        </div>
        <div className="mt-3 text-xs sm:text-sm text-gray-700">
          Showing {paginatedOrders.length} of {filteredOrders.length} orders
          {filter.search && ` (matching "${filter.search}")`}
        </div>
      </div>

      {/* ─── Orders ───────────────────────────────────────────── */}
      {/* Desktop Table */}
      <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-black cursor-pointer hover:text-[#1a237e]" onClick={() => handleSort('id')}>
                  Order ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4" /> : <ChevronDown className="inline w-4" />)}
                </th>
                <th className="px-4 py-3 font-semibold text-black cursor-pointer hover:text-[#1a237e]" onClick={() => handleSort('orderDate')}>
                  Date {sortConfig.key === 'orderDate' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4" /> : <ChevronDown className="inline w-4" />)}
                </th>
                <th className="px-4 py-3 font-semibold text-black cursor-pointer hover:text-[#1a237e]" onClick={() => handleSort('customer')}>
                  Customer {sortConfig.key === 'customer' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4" /> : <ChevronDown className="inline w-4" />)}
                </th>
                <th className="px-4 py-3 font-semibold text-black text-right">Items</th>
                <th className="px-4 py-3 font-semibold text-black text-right cursor-pointer hover:text-[#1a237e]" onClick={() => handleSort('total')}>
                  Total {sortConfig.key === 'total' && (sortConfig.direction === 'asc' ? <ChevronUp className="inline w-4" /> : <ChevronDown className="inline w-4" />)}
                </th>
                <th className="px-4 py-3 font-semibold text-black">Status</th>
                <th className="px-4 py-3 font-semibold text-black text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-600">
                    <Package size={40} className="mx-auto text-gray-300 mb-2" />
                    <p className="font-medium">No orders found</p>
                    <p className="text-sm text-gray-500">Try adjusting your filters</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-black">{highlightText(order.id, filter.search)}</td>
                      <td className="px-4 py-3 text-black">{formatDate(order.orderDate)}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-black">{highlightText(order.customer?.name || 'Unknown', filter.search)}</p>
                          <p className="text-xs text-gray-700">{highlightText(order.customer?.email || 'No email', filter.search)}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-black">{order.items?.length || 0}</td>
                      <td className="px-4 py-3 text-right font-semibold text-black">₹{order.total?.toFixed(2) || '0.00'}</td>
                      <td className="px-4 py-3">{statusBadge(order.status)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleExpand(order.id)} className="text-gray-600 hover:text-black transition">
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                    {expandedOrder === order.id && (
                      <tr>
                        <td colSpan="7" className="px-4 py-4 bg-gray-50/80 border-t border-gray-200">
                          <div className="space-y-3">
                            <h4 className="font-semibold text-black flex items-center gap-2">
                              <Package size={16} /> Order Details
                            </h4>
                            <div className="grid sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-600">Shipping Address</p>
                                <p className="text-black">{order.shipping?.address || 'N/A'}</p>
                                <p className="text-gray-600">Phone: <span className="text-black">{order.shipping?.phone || 'N/A'}</span></p>
                              </div>
                              <div>
                                <p className="text-gray-600">Items</p>
                                <ul className="space-y-1">
                                  {order.items?.map((item, idx) => (
                                    <li key={idx} className="flex justify-between text-black">
                                      <span>{item.name} × {item.quantity}</span>
                                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="border-t pt-1 mt-1 font-bold flex justify-between">
                                  <span>Total</span>
                                  <span>₹{order.total?.toFixed(2) || '0.00'}</span>
                                </div>
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
        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="font-medium text-black">No orders found</p>
            <p className="text-sm text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-black font-semibold">{highlightText(order.id, filter.search)}</p>
                  <p className="text-sm text-gray-700">{formatDate(order.orderDate)}</p>
                </div>
                {statusBadge(order.status)}
              </div>
              <div className="mt-2">
                <p className="font-medium text-black">{highlightText(order.customer?.name || 'Unknown', filter.search)}</p>
                <p className="text-xs text-gray-700">{highlightText(order.customer?.email || 'No email', filter.search)}</p>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-600">{order.items?.length || 0} items</span>
                </div>
                <span className="font-bold text-black">₹{order.total?.toFixed(2) || '0.00'}</span>
              </div>
              <button
                onClick={() => toggleExpand(order.id)}
                className="mt-3 w-full text-center text-sm text-[#1a237e] hover:text-[#0d1757] font-medium border-t border-gray-100 pt-2 flex items-center justify-center gap-1"
              >
                {expandedOrder === order.id ? 'Hide Details' : 'View Details'} <ChevronRight size={16} className={`transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
              </button>
              {expandedOrder === order.id && (
                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Shipping Address</p>
                    <p className="text-black">{order.shipping?.address || 'N/A'}</p>
                    <p className="text-gray-600 text-xs mt-1">Phone: <span className="text-black">{order.shipping?.phone || 'N/A'}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Items</p>
                    <ul className="space-y-1 mt-1">
                      {order.items?.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-black text-sm">
                          <span>{item.name} × {item.quantity}</span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t pt-1 mt-1 font-bold flex justify-between text-black">
                      <span>Total</span>
                      <span>₹{order.total?.toFixed(2) || '0.00'}</span>
                    </div>
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
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-black text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    <div className={`${bg} rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-2 sm:gap-3 shadow-sm hover:shadow-md transition`}>
      <div className="p-1.5 sm:p-2 rounded-full bg-white shadow-sm flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] sm:text-xs text-gray-700 truncate">{label}</p>
        <p className="text-sm sm:text-lg font-bold text-black truncate">{value}</p>
      </div>
    </div>
  );
}