import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, Mail, Send, ExternalLink, Bot, MessageCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface SupportViewProps {
  user: UserType | null;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function SupportView({ user, showToast }: SupportViewProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('');
      if (showToast) {
        showToast('تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.', 'success');
      }
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
          <Headphones className="w-6 h-6 text-blue-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-cairo">مركز الدعم</h2>
          <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">نحن هنا لمساعدتك في أي أسئلة أو استفسارات</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Chatbot Support Card */}
        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex flex-col h-full w-full">
              <h3 className="font-bold text-gray-900 dark:text-white font-cairo mb-1">روبوت الدردشة الذكي</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-3">احصل على إجابات فورية</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-cairo mb-4 leading-relaxed flex-1">
                تحدث مع المساعد الذكي الخاص بنا المتاح على مدار الساعة للإجابة على أسئلتك الشائعة.
              </p>
              <a 
                href="https://t.me/rexconai"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-cairo text-sm transition-colors w-full sm:w-auto mt-auto"
              >
                بدء المحادثة
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Email Support Card */}
        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 flex flex-col h-full">
          <div className="flex items-start gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex flex-col h-full w-full">
              <h3 className="font-bold text-gray-900 dark:text-white font-cairo mb-1">دعم عبر البريد الإلكتروني</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-3">احصل على المساعدة عبر البريد الإلكتروني</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-cairo mb-4 leading-relaxed flex-1">
                التواصل المباشر عبر البريد الإلكتروني للاستفسارات التفصيلية وطلبات الدعم.
              </p>
              <a 
                href="mailto:support@remedycodes.site" 
                className="inline-flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-4 py-2.5 rounded-xl font-cairo text-sm transition-colors w-full sm:w-auto mt-auto"
              >
                إرسال بريد
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Contact Form */}
        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-cairo mb-2">أرسل لنا رسالة</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo">
              هل لديك سؤال محدد أو تحتاج إلى مساعدة؟ املأ النموذج أدناه وسيتواصل معك فريق الدعم لدينا في أقرب وقت ممكن.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-cairo">اسمك</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-6 h-6 rounded-full bg-blue-500 shrink-0"></div>
                  <span className="font-cairo text-gray-900 dark:text-white">{user?.displayName || 'أرخص نظام'}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-cairo">بريدك الإلكتروني</label>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-2 h-2 bg-gray-400 shrink-0"></div>
                  <span className="font-cairo text-gray-900 dark:text-white">{user?.email || 'email@example.com'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 font-cairo">
                رسالة <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="...يرجى وصف مشكلتك أو سؤالك بالتفصيل"
                  required
                  rows={6}
                  maxLength={1000}
                  className="w-full p-4 bg-transparent border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-cairo text-gray-900 dark:text-white resize-none"
                />
                <div className="absolute bottom-3 left-3 text-xs text-gray-400 font-cairo">
                  {message.length}/1000
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-cairo mt-2">
                يرجى تقديم أكبر قدر ممكن من التفاصيل لمساعدتنا على تقديم خدمة أفضل لكم.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting || message.trim().length === 0}
                className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-cairo font-bold transition-colors"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال رسالة'}
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-cairo">
                عادةً ما نرد خلال 24 ساعة خلال أيام العمل.
              </p>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
