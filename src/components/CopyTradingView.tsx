import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users2, DollarSign, Wallet, TrendingUp, Copy, Search, HelpCircle, Check, Shield } from 'lucide-react';

const CopyTradingView = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight">نسخ لوحة معلومات التداول</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">قم بإدارة محفظة التداول بالنسخ الخاصة بك وتتبع الأداء.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => setActiveTab('copy-experts')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Users2 className="w-5 h-5" />
            <span>تصفح الخبراء</span>
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      {/* Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Active Copies */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">النسخ النشطة</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">0</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">يتم تقليد الخبراء</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex-shrink-0">
              <Users2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Invested */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">إجمالي الاستثمار</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">$0.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">رأس المال المستثمر</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex-shrink-0">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Current Value */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">القيمة الحالية</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">$0.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">قيمة المحفظة</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl flex-shrink-0">
              <Wallet className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Total P&L */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">إجمالي الأرباح والخسائر</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1 truncate">+$0.00</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">عائد الاستثمار 0%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 text-center py-20 px-6 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <Copy className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">ابدأ بنسخ التداول</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-lg mx-auto text-lg leading-relaxed">
            لم تبدأ بعد بنسخ استراتيجيات أي متداولين. تصفح قائمة المتداولين الخبراء لدينا وابدأ بنسخ استراتيجياتهم الرابحة لتحقيق الأرباح تلقائيًا.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users2 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">متداولون خبراء</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">نسخ من متداولين محترفين موثوقين ذوي سجلات أداء مثبتة</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">تداول السيارات</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">يتم تنفيذ الصفقات تلقائيًا عندما يقوم الخبراء بتحركاتهم</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-2">إدارة المخاطر</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">حدد حدود المخاطر ومعايير وقف الخسارة الخاصة بك</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <button 
              onClick={() => setActiveTab('copy-experts')}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Search className="w-5 h-5" />
              <span>تصفح المتداولين الخبراء</span>
            </button>
            <button 
              onClick={() => setShowHowItWorks(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <HelpCircle className="w-5 h-5" />
              <span>كيف يعمل</span>
            </button>
          </div>
        </div>
      </div>

      {/* How It Works Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                كيف تعمل عملية نسخ التداول
              </h3>
              <button 
                onClick={() => setShowHowItWorks(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">اختر خبيرًا</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">تصفح قائمة المتداولين الخبراء المعتمدين لدينا واختر أحدهم بناءً على أدائه واستراتيجيته ومستوى تحمله للمخاطر.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">حدد استثمارك</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">حدد المبلغ الذي ترغب في استثماره وحدد معايير المخاطرة الخاصة بك بما في ذلك مستويات وقف الخسارة وجني الأرباح.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">نسخ الصفقات تلقائيًا</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">يقوم نظامنا تلقائيًا بنسخ صفقات الخبير إلى حسابك في الوقت الفعلي، بما يتناسب مع استثمارك.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">المراقبة والربح</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">تابع أداءك في الوقت الفعلي وشاهد استثمارك ينمو بينما يقوم المتداول الخبير بإجراء صفقات مربحة.</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4">فوائد نسخ التداول</h4>
                  <ul className="space-y-4">
                    <li className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">لا يشترط وجود خبرة في التداول</span>
                    </li>
                    <li className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">تعلم من استراتيجيات الخبراء</span>
                    </li>
                    <li className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">نوّع محفظتك الاستثمارية</span>
                    </li>
                    <li className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">التداول الآلي على مدار الساعة طوال أيام الأسبوع</span>
                    </li>
                    <li className="flex items-center space-x-3 rtl:space-x-reverse">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400 text-sm">تحكم كامل في أموالك</span>
                    </li>
                  </ul>

                  <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-xl">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      <strong>تحذير من المخاطر:</strong> ينطوي التداول بالنسخ على مخاطر. الأداء السابق لا يضمن النتائج المستقبلية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default CopyTradingView;
