'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Sparkles, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { questions, recommendProducts } from '@/lib/chatbot';
import { getProducts } from '@/lib/api';
import { usePathname } from 'next/navigation';

// ─── Animation variants ──────────────────────
const fadeSlideUp = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};

const chatWindowVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', damping: 28, stiffness: 300 },
  },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

// ─── Keyword detection ────────────────────────
const parseKeywords = (text) => {
  const lower = text.toLowerCase();
  const result = { skin_type: null, concern: null };

  if (/\boily\b/.test(lower)) result.skin_type = 'Oily';
  else if (/\bdry\b/.test(lower)) result.skin_type = 'Dry';
  else if (/\bcombination\b/.test(lower)) result.skin_type = 'Combination';
  else if (/\bnormal\b/.test(lower)) result.skin_type = 'Normal';
  else if (/\bsensitive\b/.test(lower)) result.skin_type = 'Sensitive';

  if (/\bacne\b|\bpimple\b|\bbreakout\b/.test(lower)) result.concern = 'Acne';
  else if (/\bwrinkle\b|\baging\b|\bfine line\b/.test(lower)) result.concern = 'Aging / Wrinkles';
  else if (/\bpigment\b|\bdark spot\b|\buneven tone\b/.test(lower)) result.concern = 'Dark Spots / Pigmentation';
  else if (/\bdryness\b|\bdehydrat\b/.test(lower)) result.concern = 'Dryness / Dehydration';
  else if (/\bbrighten\b|\bdull\b|\bglow\b/.test(lower)) result.concern = 'Dullness / Brightening';
  else if (/\bredness\b|\birritat\b|\bsoothe\b/.test(lower)) result.concern = 'Sensitivity / Redness';

  return result;
};

export default function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: 'Hi! I’m your skincare advisor. Tell me about your skin type and main concern, or tap below:',
      options: ['🌿 Oily', '🌵 Dry', '⚖️ Combination', '🌼 Normal', '💎 Sensitive'],
    },
  ]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // All hooks are above this line – no returns before them

  useEffect(() => {
    if (isOpen && allProducts.length === 0) {
      getProducts().then(setAllProducts).catch(() => {});
    }
  }, [isOpen, allProducts.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;

    const newMessages = [...messages, { from: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsTyping(true);

    const extracted = parseKeywords(text);
    const updatedAnswers = { ...answers, ...extracted };

    if (!updatedAnswers.skin_type && !updatedAnswers.concern) {
      setAnswers(updatedAnswers);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            from: 'bot',
            text: "I'm not sure about that, but I can help you find skincare products! 😊 What's your skin type?",
            options: ['🌿 Oily', '🌵 Dry', '⚖️ Combination', '🌼 Normal', '💎 Sensitive'],
          },
        ]);
        setIsTyping(false);
      }, 800);
      return;
    }

    if (updatedAnswers.skin_type && updatedAnswers.concern) {
      setAnswers(updatedAnswers);
      setTimeout(() => {
        const recommendations = recommendProducts(allProducts, updatedAnswers);
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: 'Based on what you told me, here are some perfect picks for you:', products: recommendations },
          { from: 'bot', text: 'Need more help? You can restart or refine your search.', action: 'restart' },
        ]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    setAnswers(updatedAnswers);
    setTimeout(() => {
      let nextText = '';
      let nextOptions = [];
      if (!updatedAnswers.skin_type) {
        nextText = "I didn't catch your skin type. Could you tell me?";
        nextOptions = ['Oily', 'Dry', 'Combination', 'Normal', 'Sensitive'];
      } else if (!updatedAnswers.concern) {
        nextText = "What's your main skin concern?";
        nextOptions = ['Acne', 'Aging', 'Dark Spots', 'Dryness', 'Brightening', 'Sensitivity'];
      }
      setMessages(prev => [...prev, { from: 'bot', text: nextText, options: nextOptions }]);
      setIsTyping(false);
    }, 800);
  };

  const handleOption = (option) => {
    const newMessages = [...messages, { from: 'user', text: option }];
    setMessages(newMessages);

    const currentQuestion = questions[step];
    const updatedAnswers = { ...answers, [currentQuestion.id]: option };
    setAnswers(updatedAnswers);

    if (step === questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        const recommendations = recommendProducts(allProducts, updatedAnswers);
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: 'Here are your personalised picks:', products: recommendations },
          { from: 'bot', text: 'Want to try again?', action: 'restart' },
        ]);
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        const nextQuestion = questions[step + 1];
        setMessages(prev => [
          ...prev,
          { from: 'bot', text: nextQuestion.text, options: nextQuestion.options },
        ]);
        setStep(step + 1);
        setIsTyping(false);
      }, 800);
    }
  };

  const restart = () => {
    setMessages([
      {
        from: 'bot',
        text: 'Fresh start! What’s your skin type?',
        options: ['🌿 Oily', '🌵 Dry', '⚖️ Combination', '🌼 Normal', '💎 Sensitive'],
      },
    ]);
    setStep(0);
    setAnswers({});
    setInputText('');
    inputRef.current?.focus();
  };

  const ProductCard = ({ product }) => (
    <a
      href={`/products/${product._id}`}
      className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100 hover:border-[#1a237e]/20 hover:shadow-md transition-all duration-200 active:scale-98 group"
    >
      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
        <img
          src={product.images?.[0] || '/placeholder.png'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">₹{product.price}</p>
      </div>
      <CheckCircle size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );

  // Early bail-out is now safe because all hooks have already been called
  if (pathname === '/checkout') return null;

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[#1a237e] to-[#0d1757] text-white shadow-2xl flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#1a237e]/30 ${
          isOpen ? 'hidden' : ''
        }`}
        aria-label="Open skincare chat"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <MessageCircle size={24} />
        <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            {/* Chat window */}
            <motion.div
              variants={chatWindowVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed z-50 flex flex-col bg-white shadow-2xl
                         bottom-4 sm:bottom-6 right-4 sm:right-6 lg:right-8
                         w-[92vw] max-w-[380px] sm:max-w-[400px] lg:max-w-[420px]
                         h-auto max-h-[70vh] sm:max-h-[600px]
                         rounded-3xl"
              style={{ willChange: 'transform' }}
            >
              {/* Header */}
              <div className="flex-shrink-0 p-4 bg-gradient-to-r from-[#1a237e] to-[#0d1757] text-white rounded-t-3xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                  <Bot size={22} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">Skin Advisor</h3>
                  <p className="text-xs text-blue-100/80">Online · Replies instantly</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    variants={fadeSlideUp}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-[#1a237e] text-white rounded-br-md'
                          : 'bg-white border border-gray-100 shadow-sm rounded-bl-md text-gray-800'
                      }`}
                    >
                      {msg.from === 'bot' && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles size={12} className="text-yellow-500" />
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">SkinBot</span>
                        </div>
                      )}
                      <p className="text-[15px] whitespace-pre-wrap">{msg.text}</p>

                      {msg.options && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {msg.options.map((opt) => (
                            <motion.button
                              key={opt}
                              whileHover={{ scale: 1.05, backgroundColor: '#e8eaf6' }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => handleOption(opt)}
                              className="px-3.5 py-1.5 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-full transition-colors"
                            >
                              {opt}
                            </motion.button>
                          ))}
                        </div>
                      )}

                      {msg.products && (
                        <div className="mt-3 space-y-2">
                          {msg.products.map((prod) => (
                            <motion.div
                              key={prod._id}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <ProductCard product={prod} />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      {msg.action === 'restart' && (
                        <button
                          onClick={restart}
                          className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-800 underline underline-offset-2 transition"
                        >
                          Start over
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="flex-shrink-0 p-3 bg-white border-t border-gray-100 flex items-center gap-2 rounded-b-3xl">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask about your skin..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-gray-100 text-black rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#1a237e]/30 transition-all placeholder:text-gray-400"
                />
                <motion.button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#1a237e] to-[#0d1757] text-white flex items-center justify-center disabled:opacity-50 shadow-md"
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}