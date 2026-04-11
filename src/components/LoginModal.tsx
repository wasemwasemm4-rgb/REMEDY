import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Fingerprint, ScanFace, QrCode, Shield, Zap, Activity, X, Globe, Check, Info, ChevronDown, Users, ArrowRight, ArrowLeft, Moon, User, Phone, Languages, Key, ShieldCheck, UserPlus } from 'lucide-react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [captchaCode] = useState('7 D 9 7 8 7');
  const [country, setCountry] = useState('الولايات المتحدة الأمريكية');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: 'AR', name: 'Arabic', flag: '🇸🇦' });
  const [showLangMenu, setShowLangMenu] = useState(false);

  const languages = [
    { code: 'AF', name: 'Afrikaans', flag: '🇿🇦' },
    { code: 'SQ', name: 'Albanian', flag: '🇦🇱' },
    { code: 'AM', name: 'Amharic', flag: '🇪🇹' },
    { code: 'AR', name: 'Arabic', flag: '🇸🇦' },
    { code: 'HY', name: 'Armenian', flag: '🇦🇲' },
    { code: 'AZ', name: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'EN', name: 'EN', flag: '🇺🇸' },
  ];

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleFinalSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    
    if (!isLogin) {
      if (password !== confirmPassword) {
        setError('كلمات المرور غير متطابقة');
        return;
      }
      if (!termsAccepted) {
        setError('يجب الموافقة على الشروط والأحكام');
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth Error:", err);
      const errorCode = err.code || (err.message?.includes('auth/email-already-in-use') ? 'auth/email-already-in-use' : '');
      
      switch (errorCode) {
        case 'auth/network-request-failed':
          setError(selectedLang.code === 'AR' ? 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.' : 'Network request failed. Please check your internet connection.');
          break;
        case 'auth/invalid-email':
          setError(selectedLang.code === 'AR' ? 'البريد الإلكتروني غير صالح.' : 'Invalid email address.');
          break;
        case 'auth/user-disabled':
          setError(selectedLang.code === 'AR' ? 'هذا الحساب تم تعطيله.' : 'This account has been disabled.');
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setError(selectedLang.code === 'AR' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' : 'Invalid email or password.');
          break;
        case 'auth/email-already-in-use':
          setError(selectedLang.code === 'AR' ? 'البريد الإلكتروني مستخدم بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.' : 'Email already in use. Please login instead.');
          setIsLogin(true); // Automatically switch to login mode
          setStep(1);
          break;
        case 'auth/weak-password':
          setError(selectedLang.code === 'AR' ? 'كلمة المرور ضعيفة جداً.' : 'Password is too weak.');
          break;
        case 'auth/operation-not-allowed':
          setError(selectedLang.code === 'AR' ? 'تسجيل الدخول بالبريد الإلكتروني غير مفعل.' : 'Email sign-in is not enabled.');
          break;
        default:
          setError(err.message || (selectedLang.code === 'AR' ? 'حدث خطأ أثناء المصادقة' : 'An error occurred during authentication'));
      }
      if (!isLogin && errorCode !== 'auth/email-already-in-use') setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/network-request-failed') {
        setError(selectedLang.code === 'AR' ? 'فشل الاتصال بالشبكة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.' : 'Network request failed. Please check your internet connection.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError(selectedLang.code === 'AR' ? 'يوجد حساب بالفعل بنفس البريد الإلكتروني ولكن تم إنشاؤه باستخدام طريقة تسجيل دخول مختلفة.' : 'An account already exists with the same email address but was created using a different sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(selectedLang.code === 'AR' ? 'تم إغلاق نافذة تسجيل الدخول قبل إكمال العملية.' : 'The login popup was closed before completing the process.');
      } else {
        setError(err.message || (selectedLang.code === 'AR' ? 'حدث خطأ أثناء تسجيل الدخول بجوجل' : 'An error occurred during Google login'));
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setStep(1);
    setError('');
  };

  const countries = [
    "أفغانستان", "ألبانيا", "الجزائر", "أندورا", "أنغولا", "أنتيغوا وبربودا", "الأرجنتين", "أرمينيا", "أستراليا", "النمسا",
    "أذربيجان", "جزر البهاما", "البحرين", "بنجلاديش", "باربادوس", "بيلاروسيا", "بلجيكا", "بليز", "بنين", "بوتان",
    "بوليفيا", "البوسنة والهرسك", "بوتسوانا", "البرازيل", "بروناي", "بلغاريا", "بوركينا فاسو", "بوروندي", "كابو فيردي", "كمبوديا",
    "الكاميرون", "كندا", "جمهورية أفريقيا الوسطى", "تشاد", "تشيلي", "الصين", "كولومبيا", "جزر القمر", "الكونغو", "كوستاريكا",
    "كرواتيا", "كوبا", "قبرص", "التشيك", "الدنمارك", "جيبوتي", "دومينيكا", "جمهورية الدومينيكان", "تيمور الشرقية", "الإكوادور",
    "مصر", "السلفادور", "غينيا الاستوائية", "إريتريا", "إستونيا", "إسواتيني", "إثيوبيا", "فيجي", "فنلندا", "فرنسا",
    "الغابون", "غامبيا", "جورجيا", "ألمانيا", "غانا", "اليونان", "غرينادا", "غواتيمالا", "غينيا", "غينيا بيساو",
    "غويانا", "هايتي", "هندوراس", "المجر", "آيسلندا", "الهند", "إندونيسيا", "إيران", "العراق", "أيرلندا",
    "إيطاليا", "جاميكا", "اليابان", "الأردن", "كازاخستان", "كينيا", "كيريباتي", "كوريا الشمالية", "كوريا الجنوبية", "الكويت",
    "قيرغيزستان", "لاوس", "لاتفيا", "لبنان", "ليسوتو", "ليبيريا", "ليبيا", "ليختنشتاين", "ليتوانيا", "لوكسمبورغ",
    "مدغشقر", "ملاوي", "ماليزيا", "جزر المالديف", "مالي", "مالطا", "جزر مارشال", "موريتانيا", "موريشيوس", "المكسيك",
    "ميكرونيزيا", "مولدوفا", "موناكو", "منغوليا", "الجبل الأسود", "المغرب", "موزمبيق", "ميانمار", "ناميبيا", "ناورو",
    "نيبال", "هولندا", "نيوزيلندا", "نيكاراغوا", "النيجر", "نيجيريا", "مقدونيا الشمالية", "النرويج", "عمان", "باكستان",
    "بالاو", "فلسطين", "بنما", "بابوا غينيا الجديدة", "باراغواي", "بيرو", "الفلبين", "بولندا", "البرتغال", "قطر",
    "رومانيا", "روسيا", "رواندا", "سانت كيتس ونيفيس", "سانت لوسيا", "سانت فينسنت والغرينادين", "ساموا", "سان مارينو", "ساو تومي وبرينسيب", "المملكة العربية السعودية",
    "السنغال", "صربيا", "سيشل", "سيراليون", "سنغافورة", "سلوفاكيا", "سلوفينيا", "جزر سليمان", "الصومال", "جنوب أفريقيا",
    "جنوب السودان", "إسبانيا", "سريلانكا", "السودان", "سورينام", "السويد", "سويسرا", "سوريا", "تايوان", "طاجيكستان",
    "تنزانيا", "تايلاند", "توغو", "تونغا", "ترينيداد وتوباغو", "تونس", "تركيا", "تركمانستان", "توفالو", "أوغندا",
    "أوكرانيا", "الإمارات العربية المتحدة", "المملكة المتحدة", "الولايات المتحدة الأمريكية", "أوروغواي", "أوزبكستان", "فانواتو", "الفاتيكان", "فنزويلا", "فيتنام",
    "اليمن", "زامبيا", "زيمبابوي"
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0f1e] rounded-[2rem] shadow-2xl border border-gray-800/50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 left-6 text-gray-500 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="p-6 sm:p-12">
              {/* Top Line */}
              <div className="w-12 h-0.5 bg-gray-800 mx-auto mb-6 opacity-50" />

              {/* Header */}
              <div className="text-center mb-8 relative">
                {/* Language Selector */}
                <div className="absolute -top-10 -right-4 sm:-top-12 sm:-right-6 z-20">
                  <div className="relative">
                    <button 
                      onClick={() => setShowLangMenu(!showLangMenu)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-[#161b2c] border border-gray-800 rounded-lg text-xs font-bold text-gray-400 hover:text-white transition-all"
                    >
                      <ChevronDown className={`w-3 h-3 transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
                      <span>{selectedLang.code}</span>
                      <span>{selectedLang.flag}</span>
                    </button>

                    <AnimatePresence>
                      {showLangMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full right-0 mt-2 w-40 bg-[#161b2c] border border-gray-800 rounded-xl shadow-2xl overflow-hidden z-30"
                        >
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => {
                                setSelectedLang(lang);
                                setShowLangMenu(false);
                              }}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-bold text-gray-400 hover:text-white hover:bg-gray-800 transition-all border-b border-gray-800/50 last:border-0"
                            >
                              <span>{lang.name}</span>
                              <span>{lang.flag}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Theme Toggle Placeholder */}
                <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6">
                  <Moon className="w-5 h-5 text-gray-600" />
                </div>

                
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? 'مرحباً بك مجدداً' : (
                    <>
                      <span className="text-[#3b82f6]">ريميدي</span> انضم إلى
                    </>
                  )}
                </h2>
                <p className="text-sm text-gray-400">
                  {isLogin ? 'قم بالدخول إلى لوحة تحكم التداول الخاصة بك' : 'ابدأ رحلتك الاحترافية في مجال التداول'}
                </p>
              </div>

              {!isLogin && (
                <>
                  {/* Badge */}
                  <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2 px-4 py-2 bg-[#1e293b]/50 rounded-xl border border-gray-800">
                      <Users className="w-4 h-4 text-[#3b82f6]" />
                      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">أكثر من مليون متداول مجتمع</span>
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center justify-between max-w-xs mx-auto mb-10 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-800 -translate-y-1/2 z-0" />
                    
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          s < step ? 'bg-[#22c55e] text-white' : 
                          s === step ? 'bg-[#3b82f6] text-white ring-4 ring-[#3b82f6]/20' : 
                          'bg-[#1e293b] text-gray-500 border border-gray-700'
                        }`}>
                          {s < step ? <Check className="w-4 h-4" /> : s}
                        </div>
                        <div className="flex flex-col items-center">
                          <span className={`text-[9px] font-bold whitespace-nowrap ${s === step ? 'text-white' : 'text-gray-500'}`}>
                            {s === 1 ? 'المعلومات الشخصية' : s === 2 ? 'موقع' : 'حماية الحساب'}
                          </span>
                          <span className="text-[7px] text-gray-600 font-medium whitespace-nowrap">
                            {s === 1 ? 'التفاصيل الأساسية' : s === 2 ? 'الإعدادات الإقليمية' : 'حماية الحساب'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Form Content */}
              <form onSubmit={isLogin ? handleFinalSubmit : handleNextStep} className="space-y-6">
                {error && (
                  <div className="p-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl text-center">
                    {error}
                  </div>
                )}

                {isLogin ? (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 mr-1">البريد الإلكتروني</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                          placeholder="your.email@example.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 mr-1">كلمة المرور</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-500" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pr-12 pl-12 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                          placeholder="••••••••"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <div className="space-y-6">
                    {/* Step 1 Header Card */}
                    <div className="p-5 bg-[#3b82f6]/10 rounded-2xl border border-[#3b82f6]/20 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">معلومات شخصية</h4>
                        <p className="text-xs text-gray-500">أنشئ ملف تعريف التداول الخاص بك</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">الاسم الكامل <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="أدخل الاسم الكامل"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">اسم المستخدم للتداول <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="اختر اسم المستخدم"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">رقم التليفون <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">عنوان البريد الإلكتروني <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : step === 2 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Step 2 Header Card */}
                    <div className="p-5 bg-[#1e293b]/30 rounded-2xl border border-gray-800/50 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#3b82f6]/10 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-[#3b82f6]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">موقع</h4>
                        <p className="text-xs text-gray-500">حدد تفضيلاتك التجارية الإقليمية</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 mr-1">دولة <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                            <span className="text-[10px]">🇺🇸</span>
                          </div>
                        </div>
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="block w-full pr-12 pl-10 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                        >
                          {countries.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 bg-[#3b82f6]/5 rounded-2xl border border-[#3b82f6]/20 flex gap-3">
                      <Info className="w-5 h-5 text-[#3b82f6] shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-[#3b82f6]">معلومات التداول الإقليمية</h5>
                        <p className="text-[10px] leading-relaxed text-gray-400">
                          يساعدنا موقعك الجغرافي في توفير ميزات خاصة بالمنطقة، والامتثال، والاتصالات الخادم المحلي لتنفيذ عمليات التداول بشكل أسرع.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : step === 3 ? (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Step 3 Header Card */}
                    <div className="p-5 bg-[#22c55e]/10 rounded-2xl border border-[#22c55e]/20 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#22c55e]/20 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-[#22c55e]" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">أمان الحساب</h4>
                        <p className="text-xs text-gray-500">قم بتأمين حساب التداول الخاص بك</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">كلمة المرور <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="••••••••"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 mr-1">تأكيد كلمة المرور <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Key className="h-5 w-5 text-gray-500" />
                          </div>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pr-12 pl-4 py-3.5 border border-gray-800 rounded-2xl leading-5 bg-[#161b2c] text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/50 focus:border-[#3b82f6] transition-all"
                            placeholder="أكد كلمة مرورك"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="p-5 bg-[#1e293b]/20 rounded-2xl border border-gray-800/30 space-y-3">
                      <h5 className="text-xs font-bold text-white">متطلبات كلمة المرور:</h5>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Check className="w-3 h-3 text-[#22c55e]" />
                          <span>يجب ألا يقل طوله عن 8 أحرف.</span>
                        </li>
                        <li className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Check className="w-3 h-3 text-[#22c55e]" />
                          <span>يحتوي على أحرف كبيرة وصغيرة.</span>
                        </li>
                        <li className="flex items-center gap-2 text-[10px] text-gray-400">
                          <Check className="w-3 h-3 text-[#22c55e]" />
                          <span>يتضمن رقماً واحداً على الأقل أو رمزاً خاصاً.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Terms Checkbox */}
                    <div className="p-4 bg-[#3b82f6]/5 rounded-2xl border border-[#3b82f6]/20 flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-gray-800 bg-[#161b2c] text-[#3b82f6] focus:ring-[#3b82f6]/50"
                        required
                      />
                      <label htmlFor="terms" className="text-[10px] leading-relaxed text-gray-400">
                        أوافق على <button type="button" className="text-[#3b82f6] font-bold hover:underline">سياسة الخصوصية</button> شركة ريميدي، وأقر بأنني قد قرأت وفهمت <button type="button" className="text-[#3b82f6] font-bold hover:underline">شروط وأحكام</button>.
                        <br />
                        <span className="text-[9px] opacity-70">بإنشاء حساب، فإنك تؤكد أن عمرك لا يقل عن 18 عاماً وتوافق على تلقي تحديثات التداول ورؤى السوق.</span>
                      </label>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6 py-4 text-center"
                  >
                    <div className="w-20 h-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-[#22c55e]" />
                    </div>
                    <h4 className="text-xl font-bold text-white">حماية حسابك</h4>
                    <p className="text-sm text-gray-400 px-4">
                      أنت على وشك الانتهاء. سيتم تأمين حسابك بأحدث تقنيات التشفير لضمان سلامة استثماراتك.
                    </p>
                  </motion.div>
                )}

                <div className="flex flex-col gap-6 pt-4">
                  <div className="flex items-center justify-between gap-4">
                    {!isLogin && step > 1 ? (
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-all"
                      >
                        <ArrowRight className="w-4 h-4" />
                        الخطوة السابقة
                      </button>
                    ) : <div className="w-24" />}

                    {!isLogin && (
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">الخطوة {step} من 3</span>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className={`flex justify-center items-center gap-2 py-3 px-6 border border-transparent rounded-2xl shadow-lg text-sm font-bold text-white transition-all disabled:opacity-50 ${
                        !isLogin && step === 3 ? 'bg-[#22c55e] hover:bg-[#16a34a]' : 'bg-[#3b82f6] hover:bg-[#2563eb]'
                      }`}
                    >
                      {loading ? 'جاري المعالجة...' : (isLogin ? 'دخول لوحة التحكم' : (!isLogin && step === 3 ? 'إنشاء حساب تداول' : 'يكمل'))}
                      {!isLogin && step === 3 ? <UserPlus className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-gray-400">
                      {isLogin ? 'جديد في التداول؟ ' : 'هل لديك حساب بالفعل؟ '}
                      <button 
                        type="button"
                        onClick={toggleMode}
                        className="font-bold text-[#3b82f6] hover:text-[#2563eb] transition-colors"
                      >
                        {isLogin ? 'أنشئ حسابك الآن' : 'سجل دخولك هنا'}
                      </button>
                    </p>
                  </div>
                </div>
              </form>

              {/* Quick Access for Login */}
              {isLogin && (
                <div className="mt-10">
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800/50" />
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                      <span className="px-4 bg-[#0a0f1e] text-gray-500">دخول سريع</span>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button onClick={handleGoogleLogin} className="p-4 rounded-2xl border border-gray-800 bg-[#161b2c] text-gray-400 hover:text-white hover:border-gray-600 transition-all group">
                      <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </button>
                    <button className="p-4 rounded-2xl border border-gray-800 bg-[#161b2c] text-gray-400 hover:text-white hover:border-gray-600 transition-all group">
                      <Fingerprint className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="p-4 rounded-2xl border border-gray-800 bg-[#161b2c] text-gray-400 hover:text-white hover:border-gray-600 transition-all group">
                      <ScanFace className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                    <button className="p-4 rounded-2xl border border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e] hover:bg-[#22c55e]/20 transition-all group">
                      <QrCode className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-10 text-center space-y-6">
                <div className="flex items-center justify-center gap-6 text-[8px] uppercase tracking-wider font-bold text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-[#22c55e]" />
                    منصة منظمة
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-[#3b82f6]" />
                    تشفير 256 بت
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3 h-3 text-[#0ea5e9]" />
                    مؤمن بشهادة SSL
                  </div>
                </div>

                <p className="text-[9px] text-gray-700 font-medium">
                  © {new Date().getFullYear()} ريميدي. جميع الحقوق محفوظة. | منصة تداول مرخصة ومنظمة.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

