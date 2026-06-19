'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  MapPin, Phone, Mail, Camera, Users, X, Play,
  Send, Clock, Globe, MessageCircle, CheckCircle, AlertCircle
} from 'lucide-react';

export default function ContactPage() {
  const sectionsRef = useRef([]);
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-visible');
          }
        });
      },
      { threshold: 0.2, triggerOnce: true }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const addToRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setFormSubmitted(true);
      setTimeout(() => setFormSubmitted(false), 3000);
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['123 Glow Street, Suite 100', 'New York, NY 10001, USA'],
      extra: 'Mon–Fri, 9am–6pm EST',
      gradient: 'from-rose-50 to-orange-50',
      iconBg: 'bg-rose-600',
      hoverBg: 'hover:bg-rose-700'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+1 (800) 123-4567'],
      extra: 'Toll‑free, 24/7 support',
      gradient: 'from-blue-50 to-indigo-50',
      iconBg: 'bg-blue-600',
      hoverBg: 'hover:bg-blue-700'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['hello@brand.com', 'support@brand.com'],
      extra: 'We reply within 24h',
      gradient: 'from-emerald-50 to-teal-50',
      iconBg: 'bg-emerald-600',
      hoverBg: 'hover:bg-emerald-700'
    },
    {
      icon: Globe,
      title: 'Follow Us',
      details: ['@brand', 'Join the conversation'],
      extra: 'Updates & skincare tips',
      gradient: 'from-purple-50 to-pink-50',
      iconBg: 'bg-purple-600',
      hoverBg: 'hover:bg-purple-700',
      social: true
    }
  ];

  const socialLinks = [
    { Icon: Camera, name: 'Instagram', href: 'https://instagram.com', color: 'hover:text-pink-600', bgHover: 'hover:bg-pink-50' },
    { Icon: Users, name: 'Facebook', href: 'https://facebook.com', color: 'hover:text-blue-700', bgHover: 'hover:bg-blue-50' },
    { Icon: X, name: 'X (Twitter)', href: 'https://twitter.com', color: 'hover:text-sky-500', bgHover: 'hover:bg-sky-50' },
    { Icon: Play, name: 'YouTube', href: 'https://youtube.com', color: 'hover:text-red-600', bgHover: 'hover:bg-red-50' }
  ];

  return (
    <div className="bg-white min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 md:py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold"
          >
            Contact Us
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-gray-300 text-sm sm:text-base md:text-lg mt-3 md:mt-4 max-w-2xl mx-auto px-4"
          >
            We’d love to hear from you. Whether it’s a question, feedback, or just a hello – reach out anytime.
          </motion.p>
        </div>
      </section>

      {/* Contact Grid */}
      <section ref={addToRefs} className="py-12 md:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-on-scroll">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Left side: Contact cards */}
          <div className="space-y-5 md:space-y-6 order-2 lg:order-1">
            {contactCards.map((card, idx) => {
              const Icon = card.icon;
              const isSocial = card.social;
              return (
                <motion.div
                  key={card.title}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-5 md:p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`${card.iconBg} text-white rounded-full p-2.5 md:p-3 shrink-0 transition-all duration-300 ${card.hoverBg} group-hover:scale-110`}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-gray-900">{card.title}</h3>
                      {card.details.map((line, i) => (
                        <p key={i} className="text-gray-700 text-sm md:text-base mt-0.5">{line}</p>
                      ))}
                      <p className="text-xs md:text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <Clock size={12} className="md:w-3.5 md:h-3.5" /> {card.extra}
                      </p>
                      {isSocial && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {socialLinks.map((social) => (
                            <a
                              key={social.name}
                              href={social.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`p-2 bg-white rounded-full shadow-sm border border-gray-200 transition-all duration-300 hover:scale-110 hover:shadow-md ${social.color} ${social.bgHover}`}
                              aria-label={social.name}
                            >
                              <social.Icon size={18} className="md:w-5 md:h-5" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right side: Contact Form */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -2 }}
            className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 order-1 lg:order-2"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Send a Message</h2>
            <p className="text-gray-600 text-sm sm:text-base mb-6">We’ll reply within 24 hours.</p>
            
            {formSubmitted && (
              <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 text-green-700 text-sm animate-fade-in">
                <CheckCircle size={18} /> Message sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" noValidate>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Full name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none ${
                    errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Email address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="hello@example.com"
                />
                {errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none ${
                    errors.subject ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="How can we help?"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">Message *</label>
                <textarea
                  rows={5}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 text-sm sm:text-base border rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition-all duration-200 outline-none resize-none ${
                    errors.message ? 'border-red-400 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Tell us more..."
                />
                {errors.message && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} /> {errors.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full group bg-gray-900 text-white py-3 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:bg-black hover:scale-[1.02] hover:shadow-lg active:scale-98 flex items-center justify-center gap-2"
              >
                Send Message
                <Send size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </motion.div>
        </motion.div>

        {/* Map Section – Improved with static Google Maps embed (no API key needed) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 md:mt-16 bg-white rounded-2xl overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-xl"
        >
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <iframe
              className="w-full h-full"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.215682631263!2d-74.006!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316f6c7b9b%3A0xc2c9a1e2c6e6e6e6!2sNew%20York%2C%20NY%2010001!5e0!3m2!1sen!2sus!4v1699999999999!5m2!1sen!2sus"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location Map"
            ></iframe>
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium shadow-md">
              📍 123 Glow Street, NY
            </div>
          </div>
          <div className="p-4 text-center text-gray-600 text-sm border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <MapPin size={14} /> 123 Glow Street, New York, NY 10001
            </div>
            <a
              href="https://maps.google.com/?q=123+Glow+Street+New+York+NY"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-gray-900 hover:text-black transition-all hover:underline inline-flex items-center gap-1"
            >
              Get Directions →
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}