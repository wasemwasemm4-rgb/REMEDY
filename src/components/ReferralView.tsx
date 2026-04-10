import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, QrCode, DollarSign, Users, User, Star, Copy, CheckCircle2, Facebook, Twitter, Linkedin, MessageCircle, X } from 'lucide-react';
import { User as UserType } from '../types';

interface ReferralViewProps {
  user: UserType | null;
}

export function ReferralView({ user }: ReferralViewProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'referrals'>('summary');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const referralId = user?.uid?.substring(0, 8) || 'user123';
  const referralLink = `https://remedy-sage.vercel.app/?ref=${referralId}`;

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('تم نسخ رابط الإحالة بنجاح!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(referralId);
    setCopiedId(true);
    showToast('تم نسخ معرف الإحالة بنجاح!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg font-cairo text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-cairo">برنامج الإحالة</h1>
          <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm mt-1">وسع شبكتك واربح مكافآت مع ريميدي</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-cairo text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <QrCode className="w-4 h-4" />
            رمز الاستجابة السريعة
          </button>
          <button 
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-cairo text-sm hover:bg-blue-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            برنامج المشاركة
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-1">إجمالي الأرباح</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0.00 دولار</h3>
              <p className="text-xs text-emerald-500 font-cairo mt-2">+8.3% هذا الشهر</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-1">إجمالي الإحالات</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
              <p className="text-xs text-emerald-500 font-cairo mt-2">+12% هذا الشهر</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-1">تمت الإحالة بواسطة</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">باطل</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo mb-1">مستواك</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1">بداية</h3>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-4">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '10%' }}></div>
          </div>
        </div>
      </div>

      {/* Referral Tools */}
      <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white font-cairo mb-4">أدوات الإحالة</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-cairo mb-2">رابط الإحالة الخاص بك</label>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 dark:bg-[#0f1115] border border-gray-200 dark:border-gray-700 rounded-r-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                {referralLink}
              </div>
              <button 
                onClick={handleCopyLink}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-l-lg transition-colors flex items-center justify-center border border-blue-600"
              >
                {copiedLink ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-500 dark:text-gray-400 font-cairo mb-2">معرف الإحالة الخاص بك</label>
            <div className="flex items-center">
              <div className="flex-1 bg-gray-50 dark:bg-[#0f1115] border border-gray-200 dark:border-gray-700 rounded-r-lg px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap" dir="ltr">
                {referralId}
              </div>
              <button 
                onClick={handleCopyId}
                className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-l-lg transition-colors flex items-center justify-center border border-gray-200 dark:border-gray-700 border-r-0"
              >
                {copiedId ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-3 font-cairo text-sm font-bold transition-colors relative ${
            activeTab === 'summary' 
              ? 'text-blue-600 dark:text-blue-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          ملخص
          {activeTab === 'summary' && (
            <motion.div layoutId="referralTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`px-6 py-3 font-cairo text-sm font-bold transition-colors relative ${
            activeTab === 'referrals' 
              ? 'text-blue-600 dark:text-blue-500' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          إحالاتي
          {activeTab === 'referrals' && (
            <motion.div layoutId="referralTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' ? (
        <div className="space-y-6">
          {/* How it works */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-cairo mb-4">كيف يعمل؟</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-blue-900/30 text-blue-500 flex items-center justify-center font-bold mb-3">1</div>
                <h4 className="font-bold text-gray-900 dark:text-white font-cairo mb-2">شارك رابطك</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo">شارك رابط الإحالة الخاص بك مع الأصدقاء والعائلة</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-500 flex items-center justify-center font-bold mb-3">2</div>
                <h4 className="font-bold text-gray-900 dark:text-white font-cairo mb-2">ينضمون</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo">عندما يقوم شخص ما بالتسجيل باستخدام رابطك، يصبح هو الشخص الذي أحلته.</p>
              </div>
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-10 h-10 rounded-full bg-purple-900/30 text-purple-500 flex items-center justify-center font-bold mb-3">3</div>
                <h4 className="font-bold text-gray-900 dark:text-white font-cairo mb-2">اكسب مكافآت</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-cairo">احصل على عمولة من أنشطتهم التجارية ومعاملاتهم</p>
              </div>
            </div>
          </div>

          {/* Referral Levels */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white font-cairo mb-4">مستويات الإحالة</h3>
            <div className="space-y-3">
              {[
                { level: 'بداية', range: '0-9 إحالات', commission: '5%', icon: 'S', color: 'bg-gray-500' },
                { level: 'البرونز', range: '10-24 إحالة', commission: '7%', icon: 'ب', color: 'bg-orange-600' },
                { level: 'فضي', range: '25-49 إحالة', commission: '10%', icon: 'S', color: 'bg-gray-400' },
                { level: 'ذهب', range: '50-99 إحالة', commission: '12%', icon: 'ج', color: 'bg-yellow-500' },
                { level: 'نخبة', range: 'أكثر من 100 إحالة', commission: '15%', icon: 'هـ', color: 'bg-purple-500' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white dark:bg-[#1a1d24] p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white font-bold text-sm`}>
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white font-cairo text-sm">{item.level}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-cairo">{item.range}</p>
                    </div>
                  </div>
                  <div className="text-yellow-500 font-bold font-cairo text-sm">
                    عمولة {item.commission}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1d24] rounded-xl p-8 border border-gray-100 dark:border-gray-800 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white font-cairo mb-2">لا توجد إحالات بعد</h3>
          <p className="text-gray-500 dark:text-gray-400 font-cairo text-sm">شارك رابطك للبدء في كسب المكافآت</p>
        </div>
      )}

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1a1d24] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              dir="rtl"
            >
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 dark:text-white font-cairo text-lg">برنامج إحالة الأسهم</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a91da] text-white py-3 px-4 rounded-lg font-cairo transition-colors"
                  >
                    <Twitter className="w-5 h-5" />
                    تغريد
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white py-3 px-4 rounded-lg font-cairo transition-colors"
                  >
                    <Facebook className="w-5 h-5" />
                    فيسبوك
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0958a8] text-white py-3 px-4 rounded-lg font-cairo transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    لينكد إن
                  </button>
                  <button 
                    onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}`, '_blank')}
                    className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#22c35e] text-white py-3 px-4 rounded-lg font-cairo transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    واتساب
                  </button>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    onClick={() => setIsShareModalOpen(false)}
                    className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-cairo hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    يغلق
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
