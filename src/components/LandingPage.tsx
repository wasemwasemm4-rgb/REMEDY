import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Globe, ChartLine, Shield, Headset, Zap, BarChart3, 
  Search, Layout, Monitor, Smartphone, Mail, Twitter, Linkedin, 
  ChevronDown, Menu, X, CheckCircle2, GraduationCap, Video, 
  ArrowRight, PlayCircle, Wallet, UserCircle, Lock, Trophy, 
  ShieldCheck, Star, Bolt, HandCoins, 
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('monthly');
  const [showMoreTestimonials, setShowMoreTestimonials] = useState(false);

  // TradingView Widget for Heatmap
  const [showHeatmap, setShowHeatmap] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowHeatmap(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const NavItem = ({ label, items }: { label: string, items?: string[] }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
        <button className="group inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-200 hover:text-white focus:outline-none">
          <span>{label}</span>
          {items && <ChevronDown className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-300" />}
        </button>
        {items && isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-dark-300 ring-1 ring-black ring-opacity-5 z-50 border border-gray-800"
          >
            {items.map((item, i) => (
              <a key={i} href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-dark-200">{item}</a>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className="antialiased text-gray-200 bg-gray-900 font-sans min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">REMEDY <span className="text-blue-500">ALGO TRADE</span></span>
              </a>
            </div>

            {/* Main Navigation - Desktop */}
            <nav className="hidden md:flex space-x-8 rtl:space-x-reverse">
              <NavItem label="تجارة" items={['العملات المشفرة', 'الفوركس', 'الأسهم', 'المؤشرات', 'صناديق المؤشرات']} />
              <NavItem label="نظام" items={['تجارة', 'نسخ التداول', 'التداول الآلي']} />
              <NavItem label="شركة" items={['معلومات عنا', 'لماذا نحن؟', 'التعليمات', 'الشؤون القانونية']} />
              <a href="#" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-200 hover:text-white">اتصال</a>
            </nav>

            {/* Right Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center space-x-4 rtl:space-x-reverse">
                <button onClick={onLogin} className="text-gray-200 hover:text-white flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </button>
                <button onClick={onLogin} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  اشتراك
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-b border-gray-800 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">تجارة</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">نظام</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">شركة</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700">اتصال</a>
                <div className="pt-4 pb-3 border-t border-gray-700">
                  <div className="flex flex-col gap-2 px-4">
                    <button onClick={onLogin} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md text-sm font-medium">تسجيل الدخول</button>
                    <button onClick={onLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">اشتراك</button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Market Ticker Widget */}
      <div className="bg-dark-300 border-b border-gray-800 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <iframe 
            src="https://widget.coinlib.io/widget?type=horizontal_v2&theme=dark&pref_coin_id=1505&invert_hover=no" 
            width="100%" 
            height="36px" 
            scrolling="auto" 
            frameBorder="0" 
            className="w-full"
          />
        </div>
      </div>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 py-20 lg:py-32">
          {/* Abstract Background Elements */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
              <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="a" x1="50%" x2="50%" y1="0%" y2="100%">
                    <stop stopColor="#3B82F6" stopOpacity=".25" offset="0%"></stop>
                    <stop stopColor="#10B981" stopOpacity=".2" offset="100%"></stop>
                  </linearGradient>
                </defs>
                <path fill="url(#a)" d="M400,115 C515.46,115 615,214.54 615,330 C615,445.46 515.46,545 400,545 C284.54,545 185,445.46 185,330 C185,214.54 284.54,115 400,115 Z" transform="translate(0 -50)"></path>
                <path fill="url(#a)" d="M400,115 C515.46,115 615,214.54 615,330 C615,445.46 515.46,545 400,545 C284.54,545 185,445.46 185,330 C185,214.54 284.54,115 400,115 Z" transform="translate(350 150)"></path>
              </svg>
            </div>
            <div className="absolute bottom-0 right-0 w-full h-full opacity-10">
              <svg width="100%" height="100%" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
                <g fill="none" stroke="#6366F1" strokeWidth="2">
                  <path d="M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764"></path>
                  <path d="M-4 44L190 190 731 737 520 660 309 538 40 599 295 764"></path>
                  <path d="M-4 44L190 190 731 737M490 85L309 538 40 599 295 764"></path>
                  <path d="M733 738L520 660M603 493L731 737M520 660L309 538"></path>
                </g>
              </svg>
            </div>
          </div>

          <div className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-12 lg:flex-row">
              {/* Left Column - Text Content */}
              <div className="w-full lg:w-1/2 text-center lg:text-right">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-block px-3 py-1 mb-6 text-xs font-semibold tracking-wider text-primary uppercase bg-blue-900 bg-opacity-30 rounded-full"
                >
                  منصة تداول مبتكرة
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight"
                >
                  تداول الأسواق العالمية <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">بثقة مطلقة</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="max-w-lg mt-8 text-xl text-gray-300 mx-auto lg:mr-0"
                >
                  يمكنك الوصول إلى أدوات التداول المتقدمة للفوركس والعملات المشفرة والسلع والمؤشرات وغيرها مع فروق أسعار تنافسية وتنفيذ سريع للغاية.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap justify-center lg:justify-start gap-4 mt-10"
                >
                  <button onClick={onLogin} className="px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-xl hover:bg-blue-700 shadow-xl shadow-blue-600/30">
                    إنشاء حساب مجاني
                  </button>
                  <button onClick={onLogin} className="px-8 py-4 text-lg font-bold text-gray-200 transition-all duration-200 bg-dark-200 border border-gray-700 rounded-xl hover:bg-dark-100">
                    تسجيل الدخول
                  </button>
                </motion.div>
              </div>

              {/* Right Column - Advanced Chart Visualization */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="w-full lg:w-1/2"
              >
                <div className="relative overflow-hidden backdrop-blur-sm bg-opacity-60 bg-gray-800 rounded-[2rem] border border-gray-700 shadow-2xl">
                  <div className="bg-gray-800 bg-opacity-90 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live Market</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-gray-700 rounded text-[10px] font-bold text-gray-300">BTC/USD</div>
                      <div className="px-2 py-1 bg-blue-600/20 rounded text-[10px] font-bold text-blue-400">Remedy Pro v2.4</div>
                    </div>
                  </div>
                  <div className="h-[450px]">
                    <iframe 
                      src="https://s.tradingview.com/widgetembed/?symbol=BITSTAMP:BTCUSD&interval=D&theme=dark" 
                      className="w-full h-full border-0"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Market Ticker Tape */}
        <div className="py-0 bg-gray-800 border-y border-gray-700">
          <iframe 
            src="https://www.tradingview-widget.com/embed-widget/ticker-tape/?colorTheme=dark&locale=en" 
            className="w-full h-[46px] border-0"
          />
        </div>

        {/* Features Section */}
        <section className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">لماذا تتعامل معنا؟</h2>
              <p className="mt-4 text-gray-400">كل ما تحتاجه لتداول ناجح في منصة واحدة متكاملة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'أدوات التداول', desc: 'خطط لتداولاتك بفعالية باستخدام مجموعتنا الواسعة من أدوات التداول الاحترافية المجانية', icon: ChartLine, color: 'from-blue-600 to-blue-800' },
                { title: 'منتجات التداول', desc: 'فرص متنوعة لتحسين محفظة التداول الخاصة بك عبر أسواق متعددة وعالمية', icon: Layout, color: 'from-green-500 to-green-700' },
                { title: 'منصات التداول', desc: 'منصات قوية تناسب جميع أساليب واحتياجات التداول على أي جهاز وفي أي وقت', icon: Monitor, color: 'from-blue-500 to-blue-700' },
                { title: 'طرق التمويل', desc: 'طرق متعددة سريعة وسهلة وآمنة لتمويل حساب التداول الخاص بك وسحب أرباحك', icon: Wallet, color: 'from-yellow-500 to-yellow-700' },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="flex flex-col items-center p-8 bg-gray-800/50 rounded-3xl border border-gray-700 hover:border-blue-500 transition-all text-center"
                >
                  <div className={cn("flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br shadow-lg", feature.color)}>
                    <feature.icon className="text-white w-8 h-8" />
                  </div>
                  <h3 className="mb-4 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Market Analysis Section */}
        <section className="py-24 bg-dark-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-emerald-400 uppercase bg-emerald-900/30 rounded-full shadow-lg">
                الذكاء في الوقت الحقيقي
              </span>
              <h2 className="mt-6 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">تحليل السوق ورؤى معمقة</h2>
              <p className="mt-4 text-gray-300 max-w-2xl mx-auto">ابقَ في الصدارة بفضل بيانات السوق الآنية، والرؤى المدعومة بالذكاء الاصطناعي، وتحليلات الخبراء.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-gray-800 p-2 rounded-[2rem] border border-gray-700 shadow-2xl">
                <iframe 
                  src="https://www.tradingview-widget.com/embed-widget/market-overview/?colorTheme=dark&locale=en" 
                  className="w-full h-[500px] rounded-[1.8rem] border-0"
                />
              </div>

              <div className="space-y-6">
                {[
                  { title: 'تحديثات السوق اليومية', desc: 'استقبل تحليلات السوق اليومية مباشرةً في بريدك الإلكتروني. يقدم فريقنا من المحللين الخبراء رؤى عملية حول اتجاهات السوق.', icon: BarChart3, color: 'text-emerald-400' },
                  { title: 'أدوات التداول المتميزة', desc: 'استفد من أدوات التداول المتقدمة المصممة لتناسب جميع مستويات الخبرة. توفر منصتنا حلولاً قابلة للتخصيص.', icon: Zap, color: 'text-blue-400' },
                  { title: 'حماية الأموال', desc: 'أمنكم هو أولويتنا. نوفر حماية تأمينية رائدة في هذا المجال لأموال عملائنا حتى مليون دولار.', icon: Shield, color: 'text-indigo-400' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: -10 }}
                    className="bg-gray-800/80 p-8 rounded-2xl border border-gray-700 hover:border-emerald-500 shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-6 rtl:flex-row-reverse">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-700">
                          <item.icon className={cn("w-7 h-7", item.color)} />
                        </div>
                      </div>
                      <div className="text-right">
                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Trading Products Section */}
        <section className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">منتجات تجارية متنوعة</h2>
              <p className="mt-4 text-gray-400">الوصول إلى الأسواق العالمية بشروط تنافسية وأدوات متطورة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'الفوركس', desc: 'تداول أكثر من 70 زوج عملات رئيسي وثانوي ونادر بفروقات أسعار وشروط تنافسية', icon: Globe, color: 'from-blue-600 to-blue-400', link: 'استكشف سوق الفوركس' },
                { title: 'الأسهم', desc: 'الوصول إلى مئات الشركات العامة من الولايات المتحدة والمملكة المتحدة وألمانيا وغيرها', icon: ChartLine, color: 'from-green-600 to-green-400', link: 'استكشف الأسهم' },
                { title: 'الطاقات', desc: 'اكتشف فرص الاستثمار في النفط الخام والغاز الطبيعي بهوامش ربح ضيقة جداً', icon: Zap, color: 'from-yellow-600 to-yellow-400', link: 'استكشف الطاقات' },
                { title: 'المؤشرات', desc: 'تداول عقود الفروقات على المؤشرات العالمية الرئيسية والثانوية بشروط تنافسية', icon: BarChart3, color: 'from-blue-600 to-blue-400', link: 'استكشف المؤشرات' },
              ].map((product, i) => (
                <div key={i} className="relative group">
                  <div className={cn("absolute inset-0 bg-gradient-to-r rounded-2xl transform rotate-1 group-hover:rotate-0 transition-all duration-300 opacity-20", product.color)}></div>
                  <div className="relative bg-dark-400 p-8 rounded-2xl border border-gray-800 group-hover:border-blue-500 transition-all h-full flex flex-col">
                    <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                      <product.icon className="text-blue-400 w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{product.title}</h3>
                    <p className="text-gray-400 text-sm mb-8 flex-grow">{product.desc}</p>
                    <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center gap-2 text-sm font-bold">
                      {product.link} <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Crypto Trading Cards */}
        <section className="py-24 bg-dark-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-secondary uppercase bg-green-900/30 rounded-full">
                فئة الأصول الشائعة
              </div>
              <h2 className="text-4xl font-bold text-white">تداول العملات المشفرة</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">تداول الأصول الرقمية الأكثر شعبية في العالم بفروق أسعار تنافسية وأدوات متطورة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'بيتكوين', symbol: 'BTC/USD', logo: 'https://algo.phpdemo.name.ng/dash/bitcoin-btc-logo.png', color: 'from-orange-500 to-yellow-500', desc: 'البيتكوين عملة رقمية لامركزية بدون بنك مركزي، تسمح بمعاملات من نظير إلى نظير.' },
                { name: 'إيثيريوم', symbol: 'ETH/USD', logo: 'https://algo.phpdemo.name.ng/dash/ethereum-eth-logo.png', color: 'from-blue-500 to-indigo-600', desc: 'إيثيريوم عبارة عن سلسلة كتل لامركزية ومفتوحة المصدر مزودة بوظائف العقود الذكية.' },
                { name: 'ريبل', symbol: 'XRP/USD', logo: 'XRP', color: 'from-blue-500 to-blue-700', desc: 'نظام تسوية إجمالية فورية وشبكة لتبادل العملات وتحويل الأموال دولياً بسرعة.' },
                { name: 'كاردانو', symbol: 'ADA/USD', logo: 'ADA', color: 'from-blue-800 to-indigo-800', desc: 'منصة بلوك تشين تعتمد على آلية إثبات الحصة، تهدف للاستدامة والتوسع.' },
              ].map((coin, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-dark-400 rounded-3xl overflow-hidden border border-gray-800 group hover:shadow-2xl transition-all"
                >
                  <div className={cn("h-32 flex items-center justify-center bg-gradient-to-r", coin.color)}>
                    {coin.logo.startsWith('http') ? (
                      <img src={coin.logo} alt={coin.name} className="h-20 w-20 object-contain drop-shadow-xl" />
                    ) : (
                      <span className="text-white text-4xl font-black">{coin.logo}</span>
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">{coin.name}</h3>
                      <span className="text-[10px] font-black px-2 py-1 bg-gray-800 rounded-lg text-gray-400">{coin.symbol}</span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 h-20 overflow-hidden">{coin.desc}</p>
                    <button onClick={onLogin} className="w-full py-3 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-sm font-bold transition-all">
                      تداول الآن
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Trading Advantage Section */}
        <section className="py-24 bg-dark-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-primary uppercase bg-blue-900/30 rounded-full">
                تجربة تداول متميزة
              </span>
              <h2 className="mt-6 text-4xl font-bold text-white">هوامش ربح أضيق. تنفيذ أسرع.</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">استمتع بتجربة ظروف تداول مؤسسية مصممة خصيصاً للمتداولين المحترفين.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="bg-dark-300 rounded-[2.5rem] p-10 border border-gray-800 shadow-2xl">
                  <h3 className="text-2xl font-bold text-white mb-8">شروط التداول المميزة</h3>
                  <ul className="space-y-6">
                    {[
                      'فروق أسعار منخفضة للغاية تبدأ من 0.0 نقطة',
                      'تنفيذ فائق السرعة مع أدنى حد من التأخير',
                      'سيولة فائقة وأسعار رائدة على مدار الساعة',
                      'لا يوجد مكتب تداول ولا إعادة تسعير أبداً',
                    ].map((text, i) => (
                      <li key={i} className="flex items-start gap-4 rtl:flex-row-reverse">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-gray-300 font-medium">{text}</p>
                      </li>
                    ))}
                  </ul>
                  <button onClick={onLogin} className="mt-10 w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all">
                    اطلع على الشروط التفصيلية
                  </button>
                </div>
              </div>

              <div className="bg-dark-300 rounded-[2.5rem] p-4 border border-gray-800 shadow-2xl">
                <iframe 
                  src="https://www.tradingview-widget.com/embed-widget/forex-cross-rates/?colorTheme=dark&locale=en" 
                  className="w-full h-[400px] rounded-[1.8rem] border-0"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Trusted Brand Section */}
        <section className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-900/30 rounded-full shadow-lg">
                غلوبال تراست
              </span>
              <h2 className="mt-6 text-4xl font-bold text-white">لماذا تُعدّ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">ريميدي</span> واحدة من أكثر العلامات التجارية موثوقية؟</h2>
              <p className="mt-4 text-gray-300 max-w-2xl mx-auto">استمتع بالموثوقية والأمان اللذين يثق بهما عملاؤنا العالميون.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="bg-gray-800 rounded-3xl overflow-hidden border border-gray-700 shadow-2xl h-[450px]">
                <div className="p-6 bg-gray-800/50 border-b border-gray-700">
                  <h3 className="text-xl font-bold text-white">تحليل السوق في الوقت الفعلي</h3>
                </div>
                <div className="h-full">
                  <iframe 
                    src="https://www.tradingview-widget.com/embed-widget/forex-heat-map/?colorTheme=dark&locale=en" 
                    className="w-full h-full border-0"
                  />
                </div>
              </div>

              <div className="bg-gray-800 rounded-3xl p-10 border border-gray-700 shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-8 border-b border-gray-700 pb-4">سمعتنا الموثوقة</h3>
                <ul className="space-y-6">
                  {[
                    { title: 'خاضعة للتنظيم العالمي', desc: 'نعمل وفقاً لأنظمة مالية صارمة لضمان أمان أصولك.', icon: ShieldCheck },
                    { title: 'أكثر من 40 جائزة دولية', desc: 'تقديرًا للتميز في خدمات التداول وتكنولوجيا المنصات.', icon: Trophy },
                    { title: 'دعم 24/7 بـ 20 لغة', desc: 'مساعدة الخبراء متاحة على مدار الساعة بلغات متعددة.', icon: Headset },
                    { title: 'أموال عملاء منفصلة', desc: 'يتم الاحتفاظ باستثماراتك في حسابات منفصلة تماماً.', icon: Shield },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-5 rtl:flex-row-reverse text-right">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                        <item.icon className="text-blue-400 w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold">{item.title}</h4>
                        <p className="text-gray-400 text-sm mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Copy Trading Section */}
        <section className="py-24 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-green-400 uppercase bg-green-900/30 rounded-full">
                التداول الاجتماعي
              </span>
              <h2 className="mt-6 text-4xl font-bold text-white">نسخ المتداولين المحترفين</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">دع المتداولين ذوي الخبرة يقومون بالعمل نيابةً عنك من خلال نظام نسخ التداول المتقدم.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: 'انسخ +400 استراتيجية', desc: 'يمكنك الوصول إلى مئات الاستراتيجيات لأكثر من 1000 أداة عبر 7 فئات أصول.', icon: Zap },
                { title: 'اختر أفضل المؤدين', desc: 'استخدم أدواتنا لتصنيف الاستراتيجيات وفقاً للأداء واختيار الأنسب لك.', icon: ChartLine },
                { title: 'ابقَ آمناً ومحمياً', desc: 'يستخدم النظام حسابات متطورة للحفاظ على مستوى تعرضك الأمثل لحسابك.', icon: ShieldCheck },
                { title: 'طرق دمج مرنة', desc: 'تتيح لك منصتنا الجمع بين النسخ والتداول اليدوي والآلي حسب تفضيلاتك.', icon: Layout },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="bg-dark-400 rounded-[2rem] p-8 border border-gray-800 hover:border-green-500 transition-all text-right"
                >
                  <div className="w-14 h-14 bg-green-600/10 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="text-green-500 w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-24 bg-dark-400" id="pricing">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-900/30 rounded-full shadow-lg">
                خطط التداول
              </span>
              <h2 className="mt-6 text-4xl font-bold text-white">فرص استثمارية حصرية</h2>
              <p className="mt-4 text-gray-400 max-w-2xl mx-auto">اختر الخطة المثالية التي تناسب استراتيجيتك الاستثمارية وأهدافك المالية.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'امتحان', roi: '150%', min: '500', max: '2,999', premium: true },
                { name: 'خطة المبتدئين', roi: '16%', min: '100', max: '25,000', premium: false },
                { name: 'الخطة القياسية', roi: '2.5%', min: '25,000', max: '100,000', premium: false },
                { name: 'خطة العمل', roi: '3.1%', min: '100,000', max: '1,000,000', premium: false },
              ].map((plan, i) => (
                <div key={i} className="relative group">
                  <div className={cn("absolute inset-0 bg-gradient-to-b rounded-3xl transform rotate-1 group-hover:rotate-0 transition-all duration-300 opacity-20", plan.premium ? "from-blue-600 to-blue-800" : "from-gray-700 to-gray-900")}></div>
                  <div className="relative bg-gray-800 bg-opacity-90 rounded-3xl overflow-hidden border border-gray-700 group-hover:border-blue-600 transition-all h-full flex flex-col">
                    <div className={cn("h-24 flex items-center justify-center", plan.premium ? "bg-blue-600" : "bg-gray-700")}>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">{plan.name}</h3>
                    </div>
                    <div className="p-8 text-center flex-grow flex flex-col">
                      <div className="mb-8">
                        <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">{plan.roi}</span>
                        <span className="text-gray-400 block mt-2 text-xs font-bold uppercase tracking-widest">عائد متوقع / تداول</span>
                      </div>
                      <ul className="space-y-4 mb-10 text-sm font-medium text-gray-300">
                        <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-blue-500" /> سحب فوري</li>
                        <li className="flex items-center justify-center gap-2"><Check className="w-4 h-4 text-blue-500" /> دعم 24/7</li>
                        <li className="border-t border-gray-700 pt-4 mt-4 text-white">الحد الأدنى: <span className="text-blue-400">${plan.min}</span></li>
                        <li className="text-white">الأعلى: <span className="text-blue-400">${plan.max}</span></li>
                      </ul>
                      <button onClick={onLogin} className="mt-auto w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/20">
                        اختر الخطة
                      </button>
                    </div>
                    {plan.premium && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] px-3 py-1 font-black rounded-bl-xl rounded-tr-xl uppercase tracking-widest">غالي</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-emerald-400/5"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <span className="inline-block px-4 py-1 text-sm font-semibold tracking-wider text-blue-400 uppercase bg-blue-900/30 rounded-full">قصص نجاح</span>
              <h2 className="mt-6 text-4xl font-bold text-white">شهادات العملاء</h2>
              <p className="mt-4 text-gray-400">استمع إلى عملائنا الراضين الذين حققوا نتائج مبهرة.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'مالكوم 47', role: 'تاجر موثق', text: 'منذ أن بدأت استخدام ريميدي، أصبحت أحقق أرباحًا لم أشهدها من قبل. لديكم أفضل الإشارات.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100' },
                { name: 'كريستي', role: 'مستثمر النخبة', text: 'لقد ربحت أكثر من 200 ألف دولار خلال شهر واحد فقط من استثماري مع شركة ريميدي.', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100' },
                { name: 'لينداي 8', role: 'تاجر محترف', text: 'تمكنت من زيادة أرباحي بمقدار 30 ألف دولار. إنه لأمر رائع، أنتم الأفضل.', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100&h=100' },
                { name: 'كريان', role: 'متداول نشط', text: 'كانت هذه عملية سهلة للغاية، واستلمت أموالي بسرعة لأنني كنت بحاجة إليها!', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100' },
              ].map((t, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-gray-800/80 p-8 rounded-[2rem] border border-gray-700 hover:border-blue-500 transition-all relative"
                >
                  <div className="flex text-yellow-400 mb-6 gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-8 italic">"{t.text}"</p>
                  <div className="flex items-center gap-4 rtl:flex-row-reverse">
                    <img src={t.img} alt={t.name} className="w-12 h-12 rounded-full object-cover border-2 border-blue-500" />
                    <div className="text-right">
                      <h4 className="text-white font-bold text-sm">{t.name}</h4>
                      <p className="text-blue-400 text-xs">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Crypto Logos */}
        <section className="py-16 bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-16 transition-all duration-500">
              {[
                { name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=024' },
                { name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=024' },
                { name: 'Dogecoin', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=024' },
                { name: 'Bitcoin Cash', logo: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.svg?v=024' },
                { name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=024' },
                { name: 'BNB', logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=024' },
                { name: 'Litecoin', logo: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=024' }
              ].map(coin => (
                <div key={coin.name} className="group cursor-pointer relative">
                  <img 
                    src={coin.logo} 
                    alt={coin.name} 
                    className="w-14 h-14 object-contain transition-all duration-300 group-hover:scale-125 group-hover:drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap">
                    {coin.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark-400 text-gray-300 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16 text-right">
            <div className="space-y-8">
              <div className="flex items-center justify-end gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black text-white tracking-tighter uppercase">REMEDY <span className="text-blue-500">ALGO</span></span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500">
                تقدم شركة Remedy تداول العقود مقابل الفروقات على الأسهم والعملات الأجنبية والمؤشرات والسلع والعملات المشفرة مع فروق أسعار تنافسية وأدوات تداول متقدمة.
              </p>
              <div className="flex justify-end gap-4">
                {[Twitter, Linkedin, Mail].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all border border-gray-700">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8">روابط سريعة</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['معلومات عنا', 'لماذا تختارنا؟', 'اتصال'].map((link, i) => (
                  <li key={i} className="hover:text-blue-500 cursor-pointer transition-colors">{link}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8">تجارة</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['العملات المشفرة', 'الفوركس', 'الأسهم', 'المؤشرات'].map((link, i) => (
                  <li key={i} className="hover:text-blue-500 cursor-pointer transition-colors">{link}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-8">حسابك</h3>
              <ul className="space-y-4 text-sm font-medium">
                {['تسجيل الدخول', 'إنشاء حساب', 'حساب تجريبي', 'مركز المساعدة'].map((link, i) => (
                  <li key={i} className="hover:text-blue-500 cursor-pointer transition-colors" onClick={onLogin}>{link}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-8 text-[10px] font-bold uppercase tracking-widest text-gray-600">
              <span className="flex items-center gap-2"><Monitor className="w-4 h-4" /> Web Platform</span>
              <span className="flex items-center gap-2"><Smartphone className="w-4 h-4" /> Mobile App</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[10px] text-gray-600 max-w-2xl leading-relaxed mb-2">
                تحذير المخاطر: التداول في الأسواق المالية ينطوي على مخاطر عالية. قد تخسر رأس مالك بالكامل. يرجى التأكد من فهمك للمخاطر قبل البدء.
              </p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                © ٢٠٢٦ ريميدي ألغو تريد. جميع الحقوق محفوظة.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky Market Ticker Widget */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-dark-400 border-t border-gray-800 hidden md:block">
        <iframe 
          src="https://www.tradingview-widget.com/embed-widget/ticker-tape/?colorTheme=dark&locale=en" 
          className="w-full h-[46px] border-0"
        />
      </div>
    </div>
  );
}
