import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users2, DollarSign, Wallet, TrendingUp, Copy, Search, HelpCircle, Check, Shield, Pause, Play, StopCircle, Clock, ExternalLink } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { cn } from '../lib/utils';

const CopyTradingView = ({ setActiveTab, user }: { setActiveTab: (tab: string) => void, user: any }) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [copyTrades, setCopyTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'copyTrades'),
      where('followerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trades = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCopyTrades(trades);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'copyTrades');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const toggleStatus = async (tradeId: string, currentStatus: string) => {
    try {
      const tradeRef = doc(db, 'copyTrades', tradeId);
      await updateDoc(tradeRef, {
        status: currentStatus === 'active' ? 'paused' : 'active'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'copyTrades');
    }
  };

  const stopCopying = async (trade: any) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في إيقاف نسخ ${trade.traderName}؟ سيتم إعادة المبلغ المستثمر إلى رصيدك.`)) return;

    try {
      // Return balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(trade.amount + (trade.currentProfit || 0))
      });

      // Delete copy trade record
      await deleteDoc(doc(db, 'copyTrades', trade.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'copyTrades');
    }
  };

  const totalInvested = copyTrades.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalProfit = copyTrades.reduce((sum, t) => sum + (t.currentProfit || 0), 0);
  const currentValue = totalInvested + totalProfit;
  const totalRoi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

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
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">{copyTrades.length}</p>
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
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">${totalInvested.toLocaleString()}</p>
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
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1 truncate">${currentValue.toLocaleString()}</p>
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
              <p className={cn(
                "text-3xl font-bold mb-1 truncate",
                totalProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {totalProfit >= 0 ? '+' : ''}${totalProfit.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">عائد الاستثمار {totalRoi.toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : copyTrades.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">المتداولون الذين تنسخهم</h3>
              <div className="text-sm font-medium text-gray-500 px-3 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg">
                عدد {copyTrades.length} متداول
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 dark:bg-gray-700/30">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4">المتداول</th>
                    <th className="px-6 py-4">المبلغ المستثمر</th>
                    <th className="px-6 py-4">الربح/الخسارة</th>
                    <th className="px-6 py-4">عائد الاستثمار</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {copyTrades.map((trade) => (
                    <tr key={trade.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img src={trade.traderAvatar} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" alt="" />
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white">{trade.traderName}</div>
                            <div className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              بدأ منذ {new Date(trade.startDate).toLocaleDateString('ar-EG')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white tabular-nums">
                        ${trade.amount.toLocaleString()}
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap font-bold tabular-nums",
                        (trade.currentProfit || 0) >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {(trade.currentProfit || 0) >= 0 ? '+' : ''}${(trade.currentProfit || 0).toLocaleString()}
                      </td>
                      <td className={cn(
                        "px-6 py-4 whitespace-nowrap",
                        (trade.roi || 0) >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        <span className="px-2 py-1 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-bold">
                          {(trade.roi || 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit",
                          trade.status === 'active' ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                        )}>
                          {trade.status === 'active' ? (
                            <><Play className="w-3 h-3" /> نشط</>
                          ) : (
                            <><Pause className="w-3 h-3" /> متوقف مؤقتاً</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => toggleStatus(trade.id, trade.status)}
                            className={cn(
                              "w-8 h-8 flex items-center justify-center rounded-lg transition-all",
                              trade.status === 'active' ? "bg-orange-100 text-orange-600 hover:bg-orange-200" : "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                            )}
                            title={trade.status === 'active' ? "توقف مؤقت" : "استئناف"}
                          >
                            {trade.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => stopCopying(trade)}
                            className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                            title="إغلاق ووقف النسخ"
                          >
                            <StopCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Users2 className="w-32 h-32" />
            </div>
            <div className="relative z-10 space-y-2 text-center md:text-right">
              <h3 className="text-2xl font-black italic">زيد أرباحك بنسخ المزيد من المحترفين!</h3>
              <p className="text-blue-100">تنويع محفظتك بنسخ متداولين مختلفين يقلل المخاطر ويزيد فرص الربح.</p>
            </div>
            <button 
              onClick={() => setActiveTab('copy-experts')}
              className="relative z-10 px-8 py-4 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:shadow-white/20 transition-all active:scale-95 whitespace-nowrap"
            >
              اكتشف المزيد من الخبراء
            </button>
          </div>
        </div>
      ) : (
        /* Empty State */
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
      )}

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
