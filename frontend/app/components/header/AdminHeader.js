// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import {
//   Package,
//   PlusCircle,
//   ClipboardList,
//   Shield,
//   Users,
//   User,
//   CreditCard,
//   ChevronDown,
//   LogOut,
//   LayoutDashboard,
//   Menu,
//   X,
// } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { getUserCount } from '@/lib/api';

// const adminNavItems = [
//   { name: 'Products', href: '/admin/products', icon: Package },
//   { name: 'Add Product', href: '/admin/products/add', icon: PlusCircle },
//   { name: 'Orders', href: '/admin/orders', icon: ClipboardList },
//    { name: 'Users', href: '/admin/users', icon: Users },
// ];

// export default function AdminHeader() {
//   const router = useRouter();
//   const pathname = usePathname();
//   const dropdownRef = useRef(null);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const [userCount, setUserCount] = useState(0);
//   const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     const fetchUserCount = async () => {
//       try {
//         const count = await getUserCount();
//         setUserCount(count);
//       } catch (error) {
//         console.warn('Failed to fetch user count:', error);
//         setUserCount(0);
//       }
//     };
//     fetchUserCount();
//   }, []);

//   useEffect(() => {
//     const handleScroll = () => setIsScrolled(window.scrollY > 10);
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setProfileDropdownOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   useEffect(() => {
//     if (sidebarOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => document.body.style.overflow = 'unset';
//   }, [sidebarOpen]);

//   const handleAdminLogout = () => {
//     localStorage.removeItem('adminLoggedIn');
//     window.dispatchEvent(new Event('admin-updated'));
//     setProfileDropdownOpen(false);
//     setSidebarOpen(false);
//     window.location.href = '/';
//   };

//   return (
//     <header
//       className={`sticky top-0 z-50 transition-all duration-500 ${
//         isScrolled
//           ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
//           : 'bg-white shadow-md border-b border-gray-100'
//       }`}
//     >
//       <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16 md:h-20">
//           {/* ─── Logo / Brand ──────────────────────────── */}
//           <Link
//             href="/admin/dashboard"
//             className="flex items-center gap-2 text-xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent hover:from-gray-800 hover:to-gray-500 transition-all duration-300"
//           >
//             <Shield className="text-[#1a237e] h-6 w-6" />
//             Admin Panel
//             <span className="hidden sm:inline-block text-[10px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
//               v2.0
//             </span>
//           </Link>

//           {/* ─── Desktop Navigation ────────────────────── */}
//           <nav className="hidden md:flex items-center gap-1">
//             {adminNavItems.map((item) => {
//               const isActive = pathname === item.href;
//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 group ${
//                     isActive
//                       ? 'bg-[#1a237e]/10 text-[#1a237e]'
//                       : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
//                   }`}
//                 >
//                   <span className="flex items-center gap-2">
//                     <item.icon size={16} />
//                     {item.name}
//                   </span>
//                   {isActive && (
//                     <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#1a237e] rounded-full" />
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* ─── Right Side – User Count & Profile ────── */}
//           <div className="flex items-center gap-3">
//             {/* Total Users Badge */}
//             <div className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-[#1a237e]/5 to-[#1a237e]/10 px-3 py-1.5 rounded-full border border-[#1a237e]/20 shadow-sm">
//               <Users size={16} className="text-[#1a237e]" />
//               <span className="text-sm font-semibold text-gray-700">{userCount}</span>
//               <span className="text-xs text-gray-400">users</span>
//             </div>

//             {/* Profile Dropdown */}
//             <div className="relative" ref={dropdownRef}>
//               <button
//                 onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
//                 className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 transition border border-transparent hover:border-gray-200"
//               >
//                 <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a237e] to-[#0d1757] flex items-center justify-center text-white font-bold text-sm shadow-sm">
//                   A
//                 </div>
//                 <ChevronDown
//                   size={16}
//                   className={`text-gray-400 transition-transform duration-200 ${
//                     profileDropdownOpen ? 'rotate-180' : ''
//                   }`}
//                 />
//               </button>

//               <AnimatePresence>
//                 {profileDropdownOpen && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -8, scale: 0.96 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -8, scale: 0.96 }}
//                     transition={{ duration: 0.15 }}
//                     className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 overflow-hidden"
//                   >
//                     {/* Profile header */}
//                     <div className="px-4 py-3 border-b border-gray-100">
//                       <div className="flex items-center gap-3">
//                         <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a237e] to-[#0d1757] flex items-center justify-center text-white font-bold text-sm">
//                           A
//                         </div>
//                         <div>
//                           <p className="text-sm font-semibold text-gray-900">Admin</p>
//                           <p className="text-xs text-gray-500">Super Administrator</p>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Menu items */}
//                     <div className="py-1">
//                       <Link
//                         href="/admin/dashboard"
//                         className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
//                         onClick={() => setProfileDropdownOpen(false)}
//                       >
//                         <LayoutDashboard size={16} className="text-blue-500" />
//                         Dashboard
//                       </Link>
//                       <Link
//                         href="/admin/payments"
//                         className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
//                         onClick={() => setProfileDropdownOpen(false)}
//                       >
//                         <CreditCard size={16} className="text-indigo-500" />
//                         Payment History
//                       </Link>
//                     </div>

//                     <div className="border-t border-gray-100 py-1">
//                       <button
//                         onClick={handleAdminLogout}
//                         className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition w-full text-left"
//                       >
//                         <LogOut size={16} />
//                         Logout
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* ─── Mobile Menu Toggle ───────────────────── */}
//             <button
//               onClick={() => setSidebarOpen(true)}
//               className="md:hidden p-2 rounded-full hover:bg-gray-100 transition"
//             >
//               <Menu size={22} className="text-gray-700" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ─── Mobile Sidebar ────────────────────────────── */}
//       <AnimatePresence>
//         {sidebarOpen && (
//           <>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={() => setSidebarOpen(false)}
//               className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
//             />
//             <motion.aside
//               initial={{ x: '-100%' }}
//               animate={{ x: 0 }}
//               exit={{ x: '-100%' }}
//               transition={{ type: 'spring', damping: 28, stiffness: 300 }}
//               className="fixed top-0 left-0 bottom-0 w-80 bg-white shadow-2xl z-50 flex flex-col"
//             >
//               <div className="flex items-center justify-between p-4 border-b">
//                 <span className="text-lg font-bold text-gray-900">Admin Menu</span>
//                 <button
//                   onClick={() => setSidebarOpen(false)}
//                   className="p-2 rounded-full hover:bg-gray-100 transition"
//                 >
//                   <X size={20} />
//                 </button>
//               </div>
//               <nav className="flex-1 overflow-y-auto p-4 space-y-1">
//                 {adminNavItems.map((item) => {
//                   const Icon = item.icon;
//                   const isActive = pathname === item.href;
//                   return (
//                     <Link
//                       key={item.name}
//                       href={item.href}
//                       className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
//                         isActive
//                           ? 'bg-[#1a237e]/10 text-[#1a237e]'
//                           : 'text-gray-700 hover:bg-gray-50'
//                       }`}
//                       onClick={() => setSidebarOpen(false)}
//                     >
//                       <Icon size={18} />
//                       {item.name}
//                     </Link>
//                   );
//                 })}
//                 <hr className="my-2 border-gray-200" />
//                 <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700">
//                   <Users size={18} className="text-[#1a237e]" />
//                   <span>Total Users: <span className="font-bold">{userCount}</span></span>
//                 </div>
//                 <Link
//                   href="/admin/payments"
//                   className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
//                   onClick={() => setSidebarOpen(false)}
//                 >
//                   <CreditCard size={18} className="text-indigo-500" />
//                   Payment History
//                 </Link>
//                 <button
//                   onClick={handleAdminLogout}
//                   className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition w-full text-left"
//                 >
//                   <LogOut size={18} />
//                   Logout
//                 </button>
//               </nav>
//               <div className="p-4 border-t text-xs text-gray-400 text-center">
//                 Logged in as Admin
//               </div>
//             </motion.aside>
//           </>
//         )}
//       </AnimatePresence>

//       {/* ─── Bottom Mobile Bar ────────────────────────────── */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
//         <div className="flex items-center justify-around px-2 py-1.5">
//           <Link
//             href="/admin/products"
//             className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition hover:bg-gray-100"
//           >
//             <Package size={20} className="text-gray-700" />
//             <span className="text-[9px] font-medium text-gray-600 mt-0.5">Products</span>
//           </Link>
//           <Link
//             href="/admin/products/add"
//             className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition hover:bg-gray-100"
//           >
//             <PlusCircle size={20} className="text-gray-700" />
//             <span className="text-[9px] font-medium text-gray-600 mt-0.5">Add</span>
//           </Link>
//           <Link
//             href="/admin/orders"
//             className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition hover:bg-gray-100"
//           >
//             <ClipboardList size={20} className="text-gray-700" />
//             <span className="text-[9px] font-medium text-gray-600 mt-0.5">Orders</span>
//           </Link>
//           <Link
//             href="/admin/payments"
//             className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition hover:bg-gray-100"
//           >
//             <CreditCard size={20} className="text-gray-700" />
//             <span className="text-[9px] font-medium text-gray-600 mt-0.5">Payments</span>
//           </Link>
//           <button
//             onClick={handleAdminLogout}
//             className="flex flex-col items-center justify-center px-2 py-1 rounded-lg transition hover:bg-gray-100 text-red-600"
//           >
//             <LogOut size={20} className="text-red-600" />
//             <span className="text-[9px] font-medium text-gray-600 mt-0.5">Logout</span>
//           </button>
//         </div>
//       </div>
//     </header>
//   );
// }