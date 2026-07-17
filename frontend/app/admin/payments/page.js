'use client';
import { useState, useEffect } from 'react';
import { Loader2, ArrowUpDown, Search } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/payments`);
        if (!res.ok) throw new Error('Failed to fetch payments');
        const data = await res.json();
        setPayments(data.payments || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filteredPayments = payments
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        p.userEmail?.toLowerCase().includes(s) ||
        p._id?.toLowerCase().includes(s) ||
        p.paymentMethod?.toLowerCase().includes(s) ||
        p.status?.toLowerCase().includes(s)
      );
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'amount') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Payments</h1>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, ID, method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-black" size={32} />
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm">
            {error}
          </div>
        )}

        {!loading && !error && payments.length === 0 && (
          <div className="bg-white p-10 text-center rounded-xl shadow-sm border text-gray-500">
            No payments found.
          </div>
        )}

        {!loading && !error && payments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  {['Order ID', 'User Email', 'Amount', 'Method', 'Status', 'Date'].map((header, idx) => {
                    const fieldMap = {
                      'Order ID': '_id',
                      'User Email': 'userEmail',
                      'Amount': 'amount',
                      'Method': 'paymentMethod',
                      'Status': 'status',
                      'Date': 'createdAt',
                    };
                    const field = fieldMap[header];
                    return (
                      <th
                        key={header}
                        className="px-4 py-3 text-left cursor-pointer hover:bg-gray-100 select-none"
                        onClick={() => handleSort(field)}
                      >
                        <div className="flex items-center gap-1">
                          {header}
                          <ArrowUpDown size={12} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-700 truncate max-w-[120px]">
                      #{payment._id?.slice(-8) || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-900">{payment.userEmail || 'Guest'}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      ₹{payment.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 capitalize text-gray-700">{payment.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : payment.status === 'Pending'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {payment.status || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPayments.length === 0 && (
              <div className="p-6 text-center text-gray-400">No payments match your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}