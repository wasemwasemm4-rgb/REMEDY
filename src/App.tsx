import React, { useState, useEffect } from 'react';
import { auth, db, googleProvider, OperationType, handleFirestoreError } from './firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc, getDocs, collection, query, where, addDoc, updateDoc, deleteDoc, increment, serverTimestamp } from 'firebase/firestore';
import { User, PlanInvestment, Transaction, Trade, Notification } from './types';
import { ReferralView } from './components/ReferralView';
import { SupportView } from './components/SupportView';
import { 
  ArrowUp,
  ArrowDownCircle,
  ArrowUpCircle,
  Briefcase,
  HelpCircle,
  LayoutDashboard as DashboardIcon, 
  Bot as BotIcon, 
  Users, 
  Wallet, 
  Settings, 
  Shield, 
  LogOut, 
  Menu, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  AlertCircle, 
  Search, 
  Volume2, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft,
  Globe,
  Banknote,
  LifeBuoy,
  Home,
  Copy,
  RefreshCcw,
  Newspaper,
  ArrowDown,
  Gift,
  Calendar,
  UserPlus,
  UserCheck,
  Link as LinkIcon,
  PlusCircle,
  MinusCircle,
  CandlestickChart,
  Users2,
  Radio,
  ArrowLeftRight,
  CreditCard,
  FilePlus,
  Star,
  FileText,
  UserCircle,
  ShieldAlert,
  ShieldCheck,
  Headphones,
  ChevronDown,
  ChevronLeft,
  X,
  CheckCircle,
  BarChart3,
  Power,
  ArrowDownRight,
  Sun,
  Moon,
  Receipt,
  Target,
  PieChart,
  Info,
  Zap,
  User as UserIcon,
  Layout,
  Clock,
  Filter,
  Download,
  Cpu,
  Camera,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  UploadCloud,
  Send,
  AlertTriangle,
  Check,
  Upload,
  ChevronUp,
  Unlock,
  MessageSquare,
  Mail,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { getMarketAnalysis, textToSpeech, getTechnicalAnalysis } from './services/geminiService';
import ReactMarkdown from 'react-markdown';
import LandingPage from './components/LandingPage';

// --- Error Boundary ---
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-4">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-zinc-400 text-sm">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-medium transition-colors"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Components ---

const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl space-y-4">
    <div className="flex justify-between items-start">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div>
      <p className="text-zinc-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
    </div>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active, onClick, badge, badgeColor }: any) => (
  <li>
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-150 group",
        active 
          ? "bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium" 
          : "text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/50"
      )}
    >
      <Icon className={cn("w-5 h-5 mr-3", active ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400")} />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className={cn("ml-auto px-2 py-0.5 text-[10px] font-bold text-white rounded-full", badgeColor || "bg-blue-500")}>
          {badge}
        </span>
      )}
    </button>
  </li>
);

const NavSection = ({ title, icon: Icon, children }: any) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{title}</span>
    </div>
    <ul className="space-y-1">
      {children}
    </ul>
  </div>
);

// --- Assets Data ---

const ASSETS = [
  // Forex
  { id: 'eurusd', name: 'EUR/USD', symbol: 'EUR/USD', category: 'Currency', icon: '€', logo: 'https://flagcdn.com/w40/eu.png' },
  { id: 'gbpusd', name: 'GBP/USD', symbol: 'GBP/USD', category: 'Currency', icon: '£', logo: 'https://flagcdn.com/w40/gb.png' },
  { id: 'eurjpy', name: 'EUR/JPY', symbol: 'EUR/JPY', category: 'Currency', icon: '¥', logo: 'https://flagcdn.com/w40/eu.png' },
  { id: 'usdjpy', name: 'USD/JPY', symbol: 'USD/JPY', category: 'Currency', icon: '¥', logo: 'https://flagcdn.com/w40/us.png' },
  { id: 'usdcad', name: 'USD/CAD', symbol: 'USD/CAD', category: 'Currency', icon: 'C$', logo: 'https://flagcdn.com/w40/us.png' },
  { id: 'usdchf', name: 'USD/CHF', symbol: 'USD/CHF', category: 'Currency', icon: '₣', logo: 'https://flagcdn.com/w40/us.png' },
  { id: 'audusd', name: 'AUD/USD', symbol: 'AUD/USD', category: 'Currency', icon: 'A$', logo: 'https://flagcdn.com/w40/au.png' },
  { id: 'nzdusd', name: 'NZD/USD', symbol: 'NZD/USD', category: 'Currency', icon: 'NZ$', logo: 'https://flagcdn.com/w40/nz.png' },
  
  // Crypto
  { id: 'btcusd', name: 'Bitcoin', symbol: 'BTC/USD', category: 'Crypto', icon: '₿', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=025' },
  { id: 'ethusd', name: 'Ethereum', symbol: 'ETH/USD', category: 'Crypto', icon: 'Ξ', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=025' },
  { id: 'solusd', name: 'Solana', symbol: 'SOL/USD', category: 'Crypto', icon: 'S', logo: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=025' },
  { id: 'xrpusd', name: 'Ripple', symbol: 'XRP/USD', category: 'Crypto', icon: 'X', logo: 'https://cryptologos.cc/logos/xrp-xrp-logo.svg?v=025' },
  { id: 'adausd', name: 'Cardano', symbol: 'ADA/USD', category: 'Crypto', icon: '₳', logo: 'https://cryptologos.cc/logos/cardano-ada-logo.svg?v=025' },
  { id: 'dotusd', name: 'Polkadot', symbol: 'DOT/USD', category: 'Crypto', icon: 'P', logo: 'https://cryptologos.cc/logos/polkadot-new-dot-logo.svg?v=025' },
  { id: 'dogeusd', name: 'Dogecoin', symbol: 'DOGE/USD', category: 'Crypto', icon: 'Ð', logo: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=025' },
  { id: 'avaxusd', name: 'Avalanche', symbol: 'AVAX/USD', category: 'Crypto', icon: 'A', logo: 'https://cryptologos.cc/logos/avalanche-avax-logo.svg?v=025' },
  { id: 'linkusd', name: 'Chainlink', symbol: 'LINK/USD', category: 'Crypto', icon: 'L', logo: 'https://cryptologos.cc/logos/chainlink-link-logo.svg?v=025' },

  // Stocks
  { id: 'aapl', name: 'Apple', symbol: 'AAPL', category: 'Stocks', icon: '', logo: 'https://logo.clearbit.com/apple.com' },
  { id: 'googl', name: 'Google', symbol: 'GOOGL', category: 'Stocks', icon: 'G', logo: 'https://logo.clearbit.com/google.com' },
  { id: 'msft', name: 'Microsoft', symbol: 'MSFT', category: 'Stocks', icon: 'M', logo: 'https://logo.clearbit.com/microsoft.com' },
  { id: 'amzn', name: 'Amazon', symbol: 'AMZN', category: 'Stocks', icon: 'A', logo: 'https://logo.clearbit.com/amazon.com' },
  { id: 'tsla', name: 'Tesla', symbol: 'TSLA', category: 'Stocks', icon: 'T', logo: 'https://logo.clearbit.com/tesla.com' },
  { id: 'meta', name: 'Meta', symbol: 'META', category: 'Stocks', icon: 'M', logo: 'https://logo.clearbit.com/meta.com' },
  { id: 'nvda', name: 'Nvidia', symbol: 'NVDA', category: 'Stocks', icon: 'N', logo: 'https://logo.clearbit.com/nvidia.com' },
  { id: 'nflx', name: 'Netflix', symbol: 'NFLX', category: 'Stocks', icon: 'N', logo: 'https://logo.clearbit.com/netflix.com' },
  { id: 'amd', name: 'AMD', symbol: 'AMD', category: 'Stocks', icon: 'A', logo: 'https://logo.clearbit.com/amd.com' },
  { id: 'intc', name: 'Intel', symbol: 'INTC', category: 'Stocks', icon: 'I', logo: 'https://logo.clearbit.com/intel.com' },
  { id: 'dis', name: 'Disney', symbol: 'DIS', category: 'Stocks', icon: 'D', logo: 'https://logo.clearbit.com/disney.com' },
  { id: 'ba', name: 'Boeing', symbol: 'BA', category: 'Stocks', icon: 'B', logo: 'https://logo.clearbit.com/boeing.com' },
  { id: 'jpm', name: 'JPMorgan', symbol: 'JPM', category: 'Stocks', icon: 'J', logo: 'https://logo.clearbit.com/jpmorganchase.com' },
  { id: 'v', name: 'Visa', symbol: 'V', category: 'Stocks', icon: 'V', logo: 'https://logo.clearbit.com/visa.com' },
  { id: 'ma', name: 'Mastercard', symbol: 'MA', category: 'Stocks', icon: 'M', logo: 'https://logo.clearbit.com/mastercard.com' },
  { id: 'pypl', name: 'PayPal', symbol: 'PYPL', category: 'Stocks', icon: 'P', logo: 'https://logo.clearbit.com/paypal.com' },
  { id: 'adbe', name: 'Adobe', symbol: 'ADBE', category: 'Stocks', icon: 'A', logo: 'https://logo.clearbit.com/adobe.com' },
  { id: 'crm', name: 'Salesforce', symbol: 'CRM', category: 'Stocks', icon: 'S', logo: 'https://logo.clearbit.com/salesforce.com' },
  { id: 'nke', name: 'Nike', symbol: 'NKE', category: 'Stocks', icon: 'N', logo: 'https://logo.clearbit.com/nike.com' },
  { id: 'ko', name: 'Coca-Cola', symbol: 'KO', category: 'Stocks', icon: 'C', logo: 'https://logo.clearbit.com/coca-colacompany.com' },
  { id: 'pep', name: 'PepsiCo', symbol: 'PEP', category: 'Stocks', icon: 'P', logo: 'https://logo.clearbit.com/pepsico.com' },
  { id: 'wmt', name: 'Walmart', symbol: 'WMT', category: 'Stocks', icon: 'W', logo: 'https://logo.clearbit.com/walmart.com' },
  { id: 'mcd', name: 'McDonald\'s', symbol: 'MCD', category: 'Stocks', icon: 'M', logo: 'https://logo.clearbit.com/mcdonalds.com' },
  { id: 'sbux', name: 'Starbucks', symbol: 'SBUX', category: 'Stocks', icon: 'S', logo: 'https://logo.clearbit.com/starbucks.com' },
  { id: 'ibm', name: 'IBM', symbol: 'IBM', category: 'Stocks', icon: 'I', logo: 'https://logo.clearbit.com/ibm.com' },

  // Commodities
  { id: 'gold', name: 'Gold', symbol: 'XAU/USD', category: 'Commodities', icon: 'Au' },
  { id: 'silver', name: 'Silver', symbol: 'XAG/USD', category: 'Commodities', icon: 'Ag' },
  { id: 'platinum', name: 'Platinum', symbol: 'XPT/USD', category: 'Commodities', icon: 'Pt' },
  { id: 'copper', name: 'Copper', symbol: 'XCU/USD', category: 'Commodities', icon: 'Cu' },
  { id: 'oil', name: 'US Oil', symbol: 'WTI', category: 'Commodities', icon: '🛢️' },
  { id: 'brent', name: 'UK Oil', symbol: 'BRENT', category: 'Commodities', icon: '🛢️' },
  { id: 'natgas', name: 'Natural Gas', symbol: 'NGAS', category: 'Commodities', icon: '🔥' },

  // Bonds
  { id: 'us10y', name: 'US 10Y T-Note', symbol: 'US10Y', category: 'Bonds', icon: 'US', logo: 'https://flagcdn.com/w40/us.png' },
  { id: 'uk10y', name: 'UK 10Y Gilt', symbol: 'UK10Y', category: 'Bonds', icon: 'UK', logo: 'https://flagcdn.com/w40/gb.png' },
  { id: 'de10y', name: 'GER 10Y Bund', symbol: 'DE10Y', category: 'Bonds', icon: 'DE', logo: 'https://flagcdn.com/w40/de.png' },
];

const SearchableAssetSelector = ({ selectedAsset, onSelect }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssets = ASSETS.filter(asset => 
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 px-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-2xl text-sm font-bold hover:border-blue-500 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-lg overflow-hidden">
            {selectedAsset?.logo ? (
              <img src={selectedAsset.logo} alt={selectedAsset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              selectedAsset?.icon || '💰'
            )}
          </span>
          <div className="text-left">
            <div className="text-gray-900 dark:text-white">{selectedAsset?.symbol || 'اختر الأصل'}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{selectedAsset?.name || 'Asset Name'}</div>
          </div>
        </div>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="ابحث عن أصل..."
                  className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2 space-y-1">
              {filteredAssets.length > 0 ? (
                filteredAssets.map(asset => (
                  <button
                    key={asset.id}
                    onClick={() => {
                      onSelect(asset);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left",
                      selectedAsset?.id === asset.id 
                        ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-500/50" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <span className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-xl overflow-hidden">
                      {asset.logo ? (
                        <img src={asset.logo} alt={asset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        asset.icon
                      )}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-[10px] text-gray-500">{asset.name}</div>
                    </div>
                    <span className="text-[10px] font-black px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-md uppercase">
                      {asset.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500 text-sm">لا توجد نتائج</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- News Data ---

const MARKET_NEWS = [
  { id: 1, text: "البيتكوين يتجاوز حاجز 65,000 دولار وسط تفاؤل المستثمرين", type: "positive" },
  { id: 2, text: "الاحتياطي الفيدرالي يلمح إلى استقرار أسعار الفائدة في الاجتماع القادم", type: "neutral" },
  { id: 3, text: "أسعار الذهب تسجل مستويات قياسية جديدة نتيجة التوترات الجيوسياسية", type: "positive" },
  { id: 4, text: "انخفاض طفيف في مؤشرات الأسهم الأمريكية بعد تقرير الوظائف الأخير", type: "negative" },
  { id: 5, text: "إيثيريوم تظهر قوة شرائية كبيرة مع اقتراب التحديث الجديد للشبكة", type: "positive" },
  { id: 6, text: "سوق العملات الأجنبية يشهد تقلبات حادة في زوج اليورو/دولار", type: "neutral" },
];

const MarketNewsTicker = () => {
  return (
    <div className="bg-blue-600/5 dark:bg-blue-500/5 border-y border-blue-100 dark:border-blue-900/30 py-3 overflow-hidden relative">
      <div className="flex items-center gap-4 absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm border border-blue-100 dark:border-blue-800">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">أخبار السوق</span>
      </div>
      <motion.div 
        animate={{ x: [0, -2000] }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="flex items-center gap-12 whitespace-nowrap pr-[150px]"
      >
        {[...MARKET_NEWS, ...MARKET_NEWS].map((news, idx) => (
          <div key={`${news.id}-${idx}`} className="flex items-center gap-3">
            <span className={cn(
              "w-1.5 h-1.5 rounded-full",
              news.type === 'positive' ? "bg-emerald-500" : 
              news.type === 'negative' ? "bg-red-500" : "bg-blue-500"
            )}></span>
            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{news.text}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
};

// --- Views ---

const DashboardView = ({ user, btcPrice, ethPrice, setActiveTab, showToast, trades = [], botProfit = 0 }: any) => {
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [kycDetailsOpen, setKycDetailsOpen] = useState(false);
  const [walletPromptOpen, setWalletPromptOpen] = useState(true);
  const [amount, setAmount] = useState<string>('');
  const [lotSize, setLotSize] = useState<string>('0.01');
  const [leverage, setLeverage] = useState('1:10');
  const [duration, setDuration] = useState('1 دقيقة');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [isTrading, setIsTrading] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleGetAIAnalysis = async () => {
    setIsAnalyzing(true);
    setIsAnalysisModalOpen(true);
    setAnalysisContent(null);
    try {
      const analysis = await getTechnicalAnalysis(selectedAsset.symbol, currentPrice || 0);
      setAnalysisContent(analysis);
    } catch (error) {
      console.error("Analysis Error:", error instanceof Error ? error.message : String(error));
      setAnalysisContent("عذراً، حدث خطأ أثناء جلب التحليل. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeTradesCount = trades.filter((t: any) => t.status === 'PENDING').length;
  const todayTradesCount = trades.filter((t: any) => {
    const tradeDate = new Date(t.timestamp);
    const today = new Date();
    return tradeDate.getDate() === today.getDate() && tradeDate.getMonth() === today.getMonth() && tradeDate.getFullYear() === today.getFullYear();
  }).length;

  const handleTrade = async (type: 'Buy' | 'Sell') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      showToast?.('الرجاء إدخال مبلغ صحيح', 'error');
      return;
    }
    if (!lotSize || isNaN(Number(lotSize)) || Number(lotSize) <= 0) {
      showToast?.('الرجاء إدخال حجم عقد صحيح', 'error');
      return;
    }
    if (Number(amount) > user.balance) {
      showToast?.('رصيد غير كافٍ', 'error');
      return;
    }
    if (!currentPrice) return;

    setIsTrading(true);
    try {
      const tradeData = {
        userId: auth.currentUser?.uid,
        asset: selectedAsset.symbol,
        type,
        amount: Number(amount),
        lotSize: Number(lotSize),
        entryPrice: currentPrice,
        leverage,
        duration,
        stopLoss: stopLoss ? Number(stopLoss) : null,
        status: 'PENDING',
        profit: 0,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, 'trades'), tradeData);
      
      await addDoc(collection(db, 'notifications'), {
        userId: auth.currentUser?.uid,
        title: 'فتح صفقة جديدة',
        message: `لقد قمت بفتح صفقة ${type === 'Buy' ? 'شراء' : 'بيع'} على ${selectedAsset.symbol} بمبلغ $${Number(amount).toFixed(2)}.`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });
      
      const userRef = doc(db, 'users', auth.currentUser!.uid);
      await updateDoc(userRef, {
        balance: increment(-Number(amount))
      });

      setAmount('');
      setLotSize('0.01');
      setStopLoss('');
      showToast?.('تم تسجيل الصفقة بنجاح', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'trades');
    } finally {
      setIsTrading(false);
    }
  };

  useEffect(() => {
    let basePrice = 0;
    if (selectedAsset.id === 'btcusd') basePrice = btcPrice || 68376;
    else if (selectedAsset.id === 'ethusd') basePrice = ethPrice || 2126;
    else if (selectedAsset.category === 'Crypto') basePrice = Math.random() * 500 + 10;
    else if (selectedAsset.category === 'Currency') basePrice = 1.0 + Math.random() * 0.5;
    else if (selectedAsset.category === 'Commodities') basePrice = 2000 + Math.random() * 500;
    else if (selectedAsset.category === 'Stocks') basePrice = 150 + Math.random() * 300;

    setCurrentPrice(basePrice);

    const interval = setInterval(() => {
      setCurrentPrice(prev => {
        if (prev === null) return basePrice;
        const change = prev * (Math.random() * 0.002 - 0.001);
        return prev + change;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedAsset, btcPrice, ethPrice]);

  return (
    <motion.div 
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 sm:space-y-8"
    >
      <MarketNewsTicker />
      
      {/* Dashboard Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="text-center lg:text-left">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3 justify-center lg:justify-start">
            أهلاً بعودتك، {user.displayName}!
            {user.kycStatus === 'approved' && (
              <span title="حساب موثق">
                <ShieldCheck className="w-6 h-6 text-blue-500" />
              </span>
            )}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-600 dark:text-amber-500 transition-all hover:scale-105 cursor-default">
              <Star className="w-4 h-4 fill-amber-500" />
              <span className="text-xs sm:text-sm font-black tabular-nums">{user.points || 0}</span>
            </div>
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">نظرة عامة على لوحة معلومات الاستثمار الخاصة بك</p>
        </div>
        <div className="hidden sm:flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button onClick={() => setActiveTab('wallet')} className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg shadow hover:from-indigo-700 transition animate-pulse text-sm sm:text-base">
            <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5" /> محفظة Connect
          </button>
          <button onClick={() => setActiveTab('plans')} className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-3 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-sm sm:text-base">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" /> استثمر الآن
          </button>
        </div>
      </div>

      {/* Account Balance & Metrics Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Main Balance Card - Large */}
        <div className="md:col-span-2 lg:col-span-3 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl shadow-blue-500/20 group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-3xl group-hover:bg-indigo-500/30 transition-all duration-700"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="flex items-center gap-2 mb-2 opacity-80">
                  <Wallet className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">إجمالي الرصيد المتاح</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl sm:text-7xl font-black tracking-tighter tabular-nums">${user.balance.toLocaleString()}</span>
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black">
                    <ArrowUpRight className="w-3 h-3" /> 12.5%
                  </div>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:rotate-12 transition-transform duration-500">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pt-8 border-t border-white/10">
              <div>
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">الأرباح اليومية</div>
                <div className="text-xl font-black text-emerald-400">+$1,240.50</div>
              </div>
              <div>
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">إجمالي الاستثمار</div>
                <div className="text-xl font-black">$45,800.00</div>
              </div>
              <div className="hidden sm:block">
                <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">أرباح الروبوت الكمي</div>
                <div className="text-xl font-black text-amber-400">+${botProfit.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Sentiment Gauge */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col items-center justify-center text-center group hover:border-orange-500/50 transition-all">
          <div className="relative w-32 h-32 mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-gray-100 dark:text-gray-800"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={364.4}
                strokeDashoffset={364.4 * (1 - 0.78)}
                strokeLinecap="round"
                className="text-orange-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-gray-900 dark:text-white">78%</span>
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">شراء</span>
            </div>
          </div>
          <h4 className="text-sm font-black text-gray-900 dark:text-white mb-1">معنويات السوق</h4>
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">تفاؤل شديد</p>
        </div>

        {/* Active Trades Metric */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Activity className="w-7 h-7" />
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">نشط الآن</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mt-1"></div>
            </div>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الصفقات المفتوحة</div>
          <div className="text-3xl font-black text-gray-900 dark:text-white mb-2">{activeTradesCount}</div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
            <ArrowUpRight className="w-4 h-4" />
            <span>+{todayTradesCount} اليوم</span>
          </div>
        </div>

        {/* Quick Deposit Card */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 group hover:scale-[1.02] transition-all cursor-pointer" onClick={() => setActiveTab('wallet')}>
          <div className="flex items-center justify-between mb-8">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
              <Plus className="w-7 h-7" />
            </div>
            <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
          </div>
          <div className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">إيداع سريع</div>
          <div className="text-2xl font-black">أضف أموالاً</div>
        </div>

        {/* Copy Trade Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:border-indigo-500/50 transition-all flex flex-col justify-between cursor-pointer" onClick={() => setActiveTab('copy')}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Users2 className="w-7 h-7" />
              </div>
            </div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">نسخ التداول</div>
            <h4 className="text-sm font-black text-gray-900 dark:text-white mb-4">أفضل المتداولين</h4>
          </div>
          <div className="flex -space-x-3 rtl:space-x-reverse">
            {[1, 2, 3].map(i => (
              <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900" alt="Trader" />
            ))}
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[8px] font-black text-gray-400">+12</div>
          </div>
        </div>
      </div>

      {/* KYC Verification Card */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-1">التحقق من الهوية</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">أكمل عملية التحقق للوصول إلى جميع الميزات</p>
              </div>
            </div>
            <button 
              onClick={() => setKycDetailsOpen(!kycDetailsOpen)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>عرض التفاصيل</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", kycDetailsOpen && "rotate-180")} />
            </button>
          </div>
        </div>
        <AnimatePresence>
          {kycDetailsOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Complete Your Verification</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mb-6">Verify your identity to unlock higher limits and enhanced security features.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Shield className="w-5 h-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Enhanced Security</span>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2 text-gray-600 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Higher Limits</span>
                </div>
              </div>
              <button onClick={() => setActiveTab('kyc')} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <UserCheck className="w-4 h-4" />
                <span>Start Verification</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Wallet Connection Prompt */}
      {walletPromptOpen && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl p-4 sm:p-6 border border-indigo-200 dark:border-indigo-700 relative">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl mx-auto sm:mx-0">
              <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">قم بتوصيل محفظتك الإلكترونية وابدأ في الربح</h3>
              <p className="text-indigo-700 dark:text-indigo-300 text-sm mb-4">
                قم بربط محفظة العملات المشفرة الخاصة بك لفتح فرص ربح يومية تصل إلى <span className="font-semibold">3000 دولار</span> في اليوم.
              </p>
              <button onClick={() => setActiveTab('wallet')} className="inline-flex items-center gap-2 px-4 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] text-sm sm:text-base">
                <Plus className="w-4 h-4" /> قم بتوصيل المحفظة الآن
              </button>
            </div>
            <button onClick={() => setWalletPromptOpen(false)} className="text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 absolute top-2 right-2 sm:relative sm:top-auto sm:right-auto">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Trading Overview & Quick Trade */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Card */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2rem] p-4 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none overflow-hidden flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-lg text-gray-900 dark:text-white">تحليل السوق المباشر</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مباشر من TradingView</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-1 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-x-auto no-scrollbar">
              {['BTC/USDT', 'ETH/USDT', 'EUR/USD', 'XAU/USD'].map((pair) => (
                <button 
                  key={pair}
                  className={cn(
                    "px-4 py-2 text-[10px] font-black rounded-lg transition-all whitespace-nowrap",
                    selectedAsset.symbol === pair 
                      ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm" 
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  )}
                >
                  {pair}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 min-h-[450px] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
            <iframe 
              src={`https://s.tradingview.com/widgetembed/?symbol=${
                selectedAsset.symbol === 'XAU/USD' ? 'OANDA' :
                selectedAsset.category === 'Commodities' ? 'SAXO' : 
                selectedAsset.category === 'Currency' ? 'OANDA' : 
                selectedAsset.category === 'Stocks' ? 'NASDAQ' : 
                selectedAsset.category === 'Bonds' ? 'CBOT' : 
                'BINANCE'
              }:${selectedAsset.symbol.replace('/', '')}${selectedAsset.category === 'Crypto' ? 'T' : ''}&interval=1&theme=dark&style=1&timezone=Etc%2FUTC`} 
              className="w-full h-full border-0"
              allowFullScreen
            />
          </div>
        </div>

        {/* Quick Trade Card */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/20 dark:shadow-none flex flex-col">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-lg text-gray-900 dark:text-white">تداول سريع</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تنفيذ فوري للصفقات</p>
            </div>
          </div>
          
          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">اختر الأصل المالي</label>
              <SearchableAssetSelector selectedAsset={selectedAsset} onSelect={setSelectedAsset} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مبلغ الاستثمار</label>
                <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase">الرصيد: ${user.balance.toLocaleString()}</span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 pl-10 pr-20 sm:pr-24 text-base sm:text-lg font-black text-gray-900 dark:text-white transition-all"
                />
                <div className="absolute inset-y-0 right-0 pr-1.5 sm:pr-2 flex items-center gap-1">
                  <button 
                    onClick={() => {
                      const current = parseFloat(amount) || 0;
                      setAmount((current * 1.1).toFixed(2));
                    }}
                    className="px-1.5 py-1 sm:px-2 sm:py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    +10%
                  </button>
                  <button 
                    onClick={() => {
                      const current = parseFloat(amount) || 0;
                      setAmount((current * 0.9).toFixed(2));
                    }}
                    className="px-1.5 py-1 sm:px-2 sm:py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-bold transition-colors"
                  >
                    -10%
                  </button>
                </div>
              </div>
              <div className="flex justify-between px-1">
                <span className="text-[10px] font-black text-gray-400">الحد الأدنى: $50</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-black text-gray-400 uppercase">السعر الحالي:</span>
                  <span className="text-xs font-black font-mono text-gray-900 dark:text-white">
                    ${currentPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">حجم العقد (Lot Size)</label>
              <div className="relative group">
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="0.01 (مايكرو) - 1.00 (ستاندرد)" 
                  value={lotSize}
                  onChange={(e) => setLotSize(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 rounded-xl py-3 px-4 text-sm font-black text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">الرافعة المالية</label>
                <select 
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 rounded-xl py-3 px-3 sm:px-4 text-xs font-black text-gray-900 dark:text-white appearance-none"
                >
                  <option>1:10</option>
                  <option>1:50</option>
                  <option>1:100</option>
                  <option>1:500</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">مدة الصفقة</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 rounded-xl py-3 px-3 sm:px-4 text-xs font-black text-gray-900 dark:text-white appearance-none"
                >
                  <option>1 دقيقة</option>
                  <option>5 دقائق</option>
                  <option>15 دقيقة</option>
                  <option>1 ساعة</option>
                  <option>24 ساعة</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">إيقاف الخسارة (Stop Loss)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <DollarSign className="w-4 h-4 text-gray-400 group-focus-within:text-red-500 transition-colors" />
                </div>
                <input 
                  type="number" 
                  placeholder="0.00 (اختياري)" 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-red-500 rounded-xl py-3 pl-10 pr-4 text-sm font-black text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4">
              <button 
                onClick={() => handleTrade('Buy')}
                disabled={isTrading}
                className="group relative overflow-hidden bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">شراء</span>
                </div>
              </button>
              <button 
                onClick={() => handleTrade('Sell')}
                disabled={isTrading}
                className="group relative overflow-hidden bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-lg shadow-red-500/20 transition-all active:scale-95"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-2">
                  <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-sm sm:text-base">بيع</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Modal */}
      <AnimatePresence>
        {isAnalysisModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAnalysisModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-blue-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                    <BotIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white">تحليل الذكاء الاصطناعي</h3>
                    <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">تحليل فني مباشر لـ {selectedAsset.symbol}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAnalysisModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-6">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-purple-500 animate-pulse" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-gray-900 dark:text-white">جاري تحليل البيانات...</p>
                      <p className="text-sm text-gray-500 mt-1">نقوم بفحص المؤشرات الفنية واتجاهات السوق</p>
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-black prose-headings:text-gray-900 dark:prose-headings:text-white">
                    <ReactMarkdown>{analysisContent || ''}</ReactMarkdown>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>تحليل مدعوم بـ Gemini 3.0 Pro</span>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setIsAnalysisModalOpen(false)}
                    className="flex-1 sm:flex-none px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors"
                  >
                    إغلاق
                  </button>
                  <button 
                    onClick={() => {
                      setIsAnalysisModalOpen(false);
                    }}
                    className="flex-1 sm:flex-none px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                  >
                    بدء التداول الآن
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const DepositPaymentView = ({ user, onBack, showToast }: { user: User | null, onBack?: () => void, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('100');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'usdt'>('usdt');
  
  const methods = {
    usdt: {
      name: 'USDT (TRC20)',
      address: 'TEsA4boheAsnXdMsrLTVRKf8LmViM2jcKW',
      icon: CreditCard,
      qrCode: 'https://quickchart.io/qr?text=TEsA4boheAsnXdMsrLTVRKf8LmViM2jcKW&centerImageUrl=https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/usdt.png&size=300&ecLevel=Q'
    }
  };

  const method = methods[selectedMethod].name;
  const walletAddress = methods[selectedMethod].address;
  const qrCodeUrl = (methods[selectedMethod] as any).qrCode;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024 / 1024).toFixed(2)}MB`);
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFilePreview(compressedDataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const removeFile = () => {
    setFileName('');
    setFileSize('');
    setFilePreview(null);
  };

  const handleSubmit = async () => {
    if (!fileName || !amount || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create transaction first
      const transactionData = {
        userId: user.uid,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        timestamp: new Date().toISOString(),
        details: 'إيداع يدوي - قيد المراجعة',
        method: method // Added method field
      };
      const transRef = await addDoc(collection(db, 'transactions'), transactionData);

      // Save to Firestore 'deposits' collection with transactionId
      const depositData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        amount: parseFloat(amount),
        currency: 'USD',
        method: method,
        date: new Date().toISOString(),
        receipt: filePreview, // Base64 image
        status: 'pending',
        transactionId: transRef.id,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'deposits'), depositData);

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'طلب إيداع قيد المراجعة',
        message: `لقد تم استلام طلب الإيداع الخاص بك بقيمة $${parseFloat(amount).toFixed(2)}. سيتم مراجعته من قبل الإدارة قريباً.`,
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'deposits');
      setIsSubmitting(false);
      showToast?.("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.", 'error');
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center space-y-8 py-20"
      >
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black text-white">تم إرسال طلبك بنجاح!</h1>
          <p className="text-xl text-gray-400">يرجى انتظار مراجعة الإدارة. ستتم إضافة الرصيد إلى محفظتك فور التأكيد.</p>
        </div>
        <button 
          onClick={onBack}
          className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all"
        >
          العودة للمحفظة
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <span className="text-sm font-medium text-blue-300">بوابة دفع آمنة</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tight">إيداع يدوي للأموال</h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
          قم بتحويل المبلغ المطلوب وإرفاق صورة الإيصال للمراجعة
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/20">
              <Check className="w-5 h-5 text-white" />
            </div>
            <span className="mr-3 text-sm font-bold text-blue-400">طريقة الدفع</span>
          </div>
          <div className="w-12 h-0.5 bg-blue-600/30" />
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600/20 border-2 border-blue-600 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-sm font-black text-blue-400">2</span>
            </div>
            <span className="mr-3 text-sm font-bold text-white">إرسال الدفعة</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-700" />
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <span className="text-sm font-black text-gray-500">3</span>
            </div>
            <span className="mr-3 text-sm font-bold text-gray-500">تأكيد</span>
          </div>
        </div>
      </div>

      {/* Main Payment Card */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] border border-gray-800 shadow-2xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-gray-800 p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <CreditCard className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">تفاصيل الدفع</h2>
                <p className="text-gray-400 font-medium">إيداع عبر {method}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Shield className="w-3 h-3 mr-2" /> مؤمن بشهادة SSL
              </div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Clock className="w-3 h-3 mr-2" /> دعم متوفر 24/7
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Payment Details Card */}
          <div className="max-w-[400px] mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-500/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white p-10 rounded-[2.5rem] shadow-2xl text-black space-y-8" dir="rtl">
                {/* QR Code */}
                <div className="relative mx-auto w-full aspect-square">
                  <img 
                    src={qrCodeUrl} 
                    alt="Payment QR" 
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Network Info */}
                <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-sm font-bold">
                  <span className="text-gray-400">الشبكة</span>
                  <span className="text-gray-900">Tron (TRC20)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10">
            {/* Wallet & Upload Section */}
            <div className="space-y-8">
              {/* Wallet Address */}
              <div className="space-y-4">
                <label className="text-lg font-black text-white flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-blue-400" /> عنوان المحفظة ({method})
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl px-5 py-4 text-gray-300 font-mono text-sm truncate">
                    {walletAddress}
                  </div>
                  <button 
                    onClick={() => copyToClipboard(walletAddress)}
                    className={cn(
                      "px-6 rounded-2xl font-black text-sm transition-all flex items-center gap-2",
                      copied ? "bg-emerald-500 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                    )}
                  >
                    <Copy className="w-4 h-4" /> {copied ? 'تم النسخ!' : 'نسخ'}
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <label className="text-lg font-black text-white flex items-center gap-3">
                  <Upload className="w-5 h-5 text-blue-400" /> تحميل إثبات الدفع
                </label>
                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-[2rem] p-8 text-center transition-all group cursor-pointer overflow-hidden",
                    isDragOver ? "border-blue-500 bg-blue-500/5" : "border-gray-700 hover:border-blue-500/50 hover:bg-white/5",
                    fileName ? "border-emerald-500/50 bg-emerald-500/5" : ""
                  )}
                >
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  {filePreview ? (
                    <div className="relative z-0">
                      <img 
                        src={filePreview} 
                        alt="Preview" 
                        className="max-h-40 mx-auto rounded-xl shadow-lg cursor-zoom-in hover:scale-105 transition-transform" 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowZoomModal(true); }}
                      />
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-bold text-emerald-400">{fileName}</p>
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFile(); }} 
                          className="text-red-400 hover:text-red-300 text-xs font-black uppercase tracking-widest"
                        >
                          حذف الملف
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-colors">
                        <UploadCloud className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-bold text-white">اختر ملفاً أو اسحبه هنا</p>
                        <p className="text-sm text-gray-500">PNG, JPG حتى 10 ميجابايت</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button 
              onClick={handleSubmit}
              disabled={!fileName || isSubmitting}
              className={cn(
                "w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl",
                fileName && !isSubmitting
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-emerald-500/20" 
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <RefreshCcw className="w-6 h-6 animate-spin" />
              ) : (
                <Send className="w-6 h-6" />
              )}
              {isSubmitting ? 'جاري الإرسال...' : 'تقديم إثبات الدفع'}
            </button>
            <div className="mt-6 flex items-center justify-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> محمي بتشفير SSL 256 بت
            </div>
          </div>
        </div>
      </div>

      {onBack && (
        <div className="text-center">
          <button onClick={onBack} className="text-gray-500 hover:text-white font-black text-xs uppercase tracking-widest transition-colors">العودة إلى المحفظة</button>
        </div>
      )}

      {/* Zoom Modal */}
      <AnimatePresence>
        {showZoomModal && filePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowZoomModal(false)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={filePreview}
              alt="Zoomed Receipt"
              className="max-w-full max-h-full rounded-2xl shadow-2xl"
            />
            <button 
              onClick={() => setShowZoomModal(false)}
              className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const WithdrawView = ({ user, onBack, showToast }: { user: User, onBack: () => void, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('usdt');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !address) {
      showToast?.('يرجى ملء جميع الحقول', 'error');
      return;
    }
    if (parseFloat(amount) > user.balance) {
      showToast?.('رصيد غير كافٍ', 'error');
      return;
    }
    if (parseFloat(amount) < 10) {
      showToast?.('الحد الأدنى للسحب هو 10 دولار', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create transaction
      const transactionData = {
        userId: user.uid,
        type: 'withdrawal',
        amount: parseFloat(amount),
        status: 'pending',
        timestamp: new Date().toISOString(),
        details: `سحب عبر ${method.toUpperCase()} - ${address}`,
        method: method // Added method field
      };
      const transRef = await addDoc(collection(db, 'transactions'), transactionData);

      // Create withdrawal request
      const withdrawalData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        amount: parseFloat(amount),
        method: method,
        address: address,
        status: 'pending',
        transactionId: transRef.id,
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'withdrawals'), withdrawalData);

      // Deduct balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-parseFloat(amount))
      });

      setIsSuccess(true);
      showToast?.('تم إرسال طلب السحب بنجاح', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'withdrawals');
      showToast?.('حدث خطأ أثناء معالجة طلبك', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-md mx-auto text-center space-y-6 py-20"
      >
        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">تم إرسال الطلب!</h2>
        <p className="text-gray-500">تم استلام طلب السحب الخاص بك وهو قيد المراجعة الآن. سيتم تحويل الأموال خلال 24-48 ساعة.</p>
        <button 
          onClick={onBack} 
          className="w-full py-4 bg-blue-600 text-white rounded-xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all"
        >
          العودة للمحفظة
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-400">سحب الأموال</h2>
          <p className="text-gray-500 font-medium mt-1">اسحب أرباحك إلى محفظتك الخارجية بأمان</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          العودة
        </button>
      </div>

      <div className="bg-white dark:bg-[#0a0a0a] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900 dark:text-white">طريقة السحب</label>
            <select 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
            >
              <option value="usdt">USDT (TRC20)</option>
              <option value="bitcoin">Bitcoin (BTC)</option>
              <option value="ethereum">Ethereum (ERC20)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900 dark:text-white">المبلغ المراد سحبه (USD)</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <DollarSign className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl py-4 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="text-gray-500">الرصيد المتاح: ${user.balance.toLocaleString()}</span>
              <button type="button" onClick={() => setAmount(user.balance.toString())} className="text-blue-500 font-bold hover:underline">سحب الكل</button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-900 dark:text-white">عنوان المحفظة</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Wallet className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="أدخل عنوان محفظتك هنا"
                className="w-full bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl py-4 pr-12 pl-4 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">تأكد من صحة العنوان، لا يمكن استرداد الأموال المرسلة إلى عنوان خاطئ.</p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-blue-500/20"
          >
            {isSubmitting ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <>تأكيد السحب <Send className="w-5 h-5" /></>}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

const WalletView = ({ user, activeTab, showToast }: { user: User, activeTab: string, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const isKycApproved = user.kycStatus === 'approved';
  
  const [view, setView] = useState<'overview' | 'deposit' | 'withdraw'>(() => {
    if (activeTab === 'deposit' && isKycApproved) return 'deposit';
    if (activeTab === 'withdraw') return 'withdraw';
    return 'overview';
  });

  useEffect(() => {
    if (activeTab === 'deposit') {
      if (isKycApproved) setView('deposit');
      else {
        showToast?.("يجب توثيق الهوية أولاً قبل البدء بعملية الإيداع.", "error");
        setView('overview');
      }
    }
    else if (activeTab === 'withdraw') setView('withdraw');
    else if (activeTab === 'wallet') setView('overview');
  }, [activeTab, isKycApproved]);

  if (view === 'deposit') {
    return <DepositPaymentView user={user} onBack={() => setView('overview')} showToast={showToast} />;
  }

  if (view === 'withdraw') {
    return <WithdrawView user={user} onBack={() => setView('overview')} showToast={showToast} />;
  }

  const handleDepositClick = () => {
    if (user.kycStatus !== 'approved') {
      showToast?.("يجب توثيق الهوية أولاً قبل البدء بعملية الإيداع.", "error");
      return;
    }
    setView('deposit');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter">المحفظة المالية</h2>
          <p className="text-gray-500 font-medium">إدارة أصولك الرقمية وعمليات السحب والإيداع.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={handleDepositClick} className="flex-1 md:flex-none px-8 py-4 bg-blue-600 text-white rounded-[1.5rem] font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">إيداع</button>
          <button onClick={() => setView('withdraw')} className="flex-1 md:flex-none px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-[1.5rem] font-black border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-95">سحب</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Premium Card Design */}
          <div className="relative group perspective-1000">
            <div className="bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-black p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border border-white/10 transition-transform duration-700 group-hover:rotate-y-6">
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                <TrendingUp className="w-64 h-64" />
              </div>
              
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-white/5 pointer-events-none" />

              <div className="relative z-10 space-y-12">
                <div className="flex justify-between items-start">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <p className="text-blue-400 font-black uppercase tracking-[0.2em] text-[10px]">الرصيد الإجمالي</p>
                    </div>
                    <h3 className="text-7xl font-black tracking-tighter tabular-nums">${user.balance.toLocaleString()}</h3>
                  </div>
                  <div className="w-20 h-12 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 flex items-center justify-center font-black italic tracking-widest text-lg">VISA</div>
                </div>

                <div className="flex justify-between items-end pt-8">
                  <div className="space-y-2">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">صاحب الحساب</p>
                    <p className="text-2xl font-black tracking-tight">{user.displayName.toUpperCase()}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-white/30 text-[10px] font-black uppercase tracking-widest">رقم المحفظة</p>
                    <p className="font-mono text-xl tracking-[0.2em]">**** **** **** {user.uid.slice(-4)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black tracking-tight">آخر المعاملات</h3>
              <button className="text-blue-500 font-black text-xs uppercase tracking-widest hover:underline">عرض الكل</button>
            </div>
            
            <div className="space-y-4">
              {[
                { type: 'deposit', title: 'إيداع ناجح', date: '24 مارس 2026', time: '10:30 ص', amount: '+2,500', status: 'مكتمل' },
                { type: 'investment', title: 'استثمار في خطة', date: '22 مارس 2026', time: '02:15 م', amount: '-1,000', status: 'مكتمل' },
                { type: 'deposit', title: 'إيداع ناجح', date: '20 مارس 2026', time: '09:45 ص', amount: '+5,000', status: 'مكتمل' },
                { type: 'withdrawal', title: 'سحب أرباح', date: '18 مارس 2026', time: '11:20 ص', amount: '-500', status: 'قيد المعالجة' },
              ].map((tx, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-blue-500/30 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                      tx.type === 'deposit' ? "bg-emerald-500/10 text-emerald-500" : "bg-blue-500/10 text-blue-500"
                    )}>
                      {tx.type === 'deposit' ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="font-black text-lg text-gray-900 dark:text-white">{tx.title}</div>
                      <div className="text-xs text-gray-500 font-bold mt-0.5">{tx.date} • {tx.time}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-xl font-black tabular-nums", tx.amount.startsWith('+') ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                      {tx.amount}$
                    </div>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest mt-1",
                      tx.status === 'مكتمل' ? "text-gray-400" : "text-amber-500"
                    )}>{tx.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-10">
          {/* Payment Methods */}
          <div className="bg-white dark:bg-[#0a0a0a] p-10 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-white/5 space-y-10">
            <h3 className="text-2xl font-black tracking-tight">طرق الدفع</h3>
            <div className="space-y-4">
              {[
                { name: 'العملات المشفرة', icon: Zap },
                { name: 'التحويل البنكي', icon: Wallet },
                { name: 'البطاقة الائتمانية', icon: CreditCard },
              ].map(method => (
                <button 
                  key={method.name} 
                  onClick={() => setView('deposit')}
                  className="w-full flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 hover:border-blue-500 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <method.icon className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <span className="font-black text-gray-700 dark:text-gray-300">{method.name}</span>
                  </div>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </button>
              ))}
            </div>
            
            <div className="p-8 bg-blue-600/5 dark:bg-blue-500/5 rounded-[2.5rem] border border-blue-500/10 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldCheck className="w-16 h-16 text-blue-500" />
              </div>
              <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-black text-sm relative z-10">
                <Info className="w-5 h-5" /> نصيحة أمنية
              </div>
              <p className="text-xs text-blue-800/70 dark:text-blue-300/70 leading-relaxed font-bold relative z-10">
                تأكد دائماً من صحة عنوان المحفظة قبل إجراء أي عملية تحويل. العملات المشفرة لا يمكن استردادها بمجرد إرسالها.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-10 rounded-[3.5rem] text-white shadow-2xl shadow-blue-600/20">
            <h4 className="text-lg font-black mb-6">ملخص الأداء</h4>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">إجمالي الأرباح</span>
                <span className="text-xl font-black">+$12,450</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">العائد الشهري</span>
                <span className="text-xl font-black">+18.4%</span>
              </div>
              <div className="pt-6 border-t border-white/10">
                <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all">تحميل التقرير</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const KYCFormView = ({ user, onBack, showToast }: { user: User, onBack: () => void, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user.email || '',
    phone: '',
    dob: '',
    socialUsername: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    documentType: 'passport',
    agreedToTerms: false,
    frontImage: '',
    backImage: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          
          setFormData(prev => ({
            ...prev,
            [side === 'front' ? 'frontImage' : 'backImage']: dataUrl
          }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreedToTerms) {
      showToast?.("يجب الموافقة على شروط الخدمة وسياسة الخصوصية", 'error');
      return;
    }
    if (!formData.frontImage || !formData.backImage) {
      showToast?.("يجب تحميل صورتي المستند من الأمام والخلف", 'error');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create KYC request document
      await addDoc(collection(db, 'kyc_requests'), {
        userId: user.uid,
        userEmail: user.email || formData.email || 'no-email@example.com',
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dob: formData.dob,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        documentType: formData.documentType,
        frontImage: formData.frontImage,
        backImage: formData.backImage,
        status: 'pending',
        submittedAt: new Date().toISOString()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'طلب توثيق قيد المراجعة',
        message: 'لقد تم استلام طلب توثيق هويتك بنجاح. سيتم مراجعته من قبل الفريق المختص خلال 24-48 ساعة.',
        type: 'info',
        read: false,
        timestamp: new Date().toISOString()
      });

      // Update user's kycStatus and info
      await updateDoc(doc(db, 'users', user.uid), {
        kycStatus: 'pending',
        firstName: formData.firstName,
        lastName: formData.lastName,
        displayName: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
        country: formData.country,
        address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        dob: formData.dob,
        documentType: formData.documentType
      });
      
      // The parent component (KYCView) will automatically re-render and show the pending state
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'kyc_requests');
      showToast?.("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
          <ArrowRight className="w-6 h-6" />
        </button>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-500 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            عملية التحقق الآمنة
          </div>
          <h2 className="text-3xl font-black tracking-tighter">التحقق من الحساب</h2>
          <p className="text-gray-500 text-sm mt-1">أكمل عملية التحقق من هويتك (KYC) لفتح جميع ميزات التداول وضمان أمان حسابك</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="font-bold text-sm">تقدم عملية التحقق</span>
          <span className="text-sm text-gray-500">
            {currentStep === 1 ? 'الخطوة 1 من 3' : currentStep === 2 ? 'الخطوة الثانية من ثلاث خطوات' : 'الخطوة 3 من 3'}
          </span>
        </div>
        
        <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-8">
          <div 
            className="absolute top-0 right-0 h-full bg-blue-600 rounded-full transition-all duration-500" 
            style={{ width: currentStep === 1 ? '33.33%' : currentStep === 2 ? '66.66%' : '100%' }}
          />
        </div>

        <div className="flex justify-between relative">
          <div className="absolute top-1/2 right-0 w-full h-px bg-gray-100 dark:bg-white/5 -z-10" />
          
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] pr-0 pl-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
              {currentStep > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className={`text-sm font-bold ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-500'}`}>المعلومات الشخصية</span>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] px-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
              {currentStep > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className={`text-sm font-bold ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-500'}`}>عنوان</span>
          </div>
          
          <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] pl-0 pr-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
              3
            </div>
            <span className={`text-sm font-bold ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-500'}`}>وثائق</span>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          </div>
          <div>
            <h3 className="text-xl font-black">التحقق من الهوية</h3>
            <p className="text-sm text-gray-500">قم بتأمين حسابك من خلال التحقق من الهوية الصادرة عن جهة حكومية</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold">معلومات شخصية</h4>
                  <p className="text-xs text-gray-500">يرجى تقديم بياناتك الشخصية كما تظهر في بطاقة هويتك</p>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-blue-900 dark:text-blue-400 mb-1">إشعار هام</h5>
                  <p className="text-xs text-blue-800/80 dark:text-blue-300/80 leading-relaxed">
                    يرجى التأكد من تطابق جميع المعلومات تماماً مع بطاقة هويتك الصادرة من جهة حكومية. لا يمكن تعديل البيانات بعد الإرسال.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الاسم الأول <span className="text-red-500">*</span></label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اسم العائلة <span className="text-red-500">*</span></label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">عنوان البريد الإلكتروني <span className="text-red-500">*</span></label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">رقم التليفون <span className="text-red-500">*</span></label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">تاريخ الميلاد <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-right" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">اسم المستخدم على وسائل التواصل الاجتماعي (اختياري)</label>
                  <input type="text" name="socialUsername" value={formData.socialUsername} onChange={handleInputChange} placeholder="اسم المستخدم@" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setCurrentStep(2)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-2 transition-colors"
                >
                  مواصلة المعالجة <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div>
                  <h4 className="font-bold">معلومات العنوان</h4>
                  <p className="text-xs text-gray-500">عنوان سكنك الحالي للتحقق</p>
                </div>
              </div>

              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-sm font-bold text-yellow-900 dark:text-yellow-500 mb-1">التحقق من العنوان</h5>
                  <p className="text-xs text-yellow-800/80 dark:text-yellow-400/80 leading-relaxed">
                    تأكد من أن عنوانك يطابق مستنداتك الداعمة تماماً.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">عنوان الشارع <span className="text-red-500">*</span></label>
                  <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleInputChange} placeholder="أدخل عنوان الشارع بالكامل" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">مدينة <span className="text-red-500">*</span></label>
                  <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="أدخل مدينتك" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الولاية/المقاطعة <span className="text-red-500">*</span></label>
                  <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="أدخل ولايتك أو مقاطعتك" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">البلد/الجنسية <span className="text-red-500">*</span></label>
                  <input type="text" name="country" value={formData.country} onChange={handleInputChange} placeholder="أدخل بلدك" className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center gap-2 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" /> سابق
                </button>
                <button 
                  onClick={() => setCurrentStep(3)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-2 transition-colors"
                >
                  انتقل إلى المستندات <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                </div>
                <div>
                  <h4 className="font-bold">تحميل المستندات</h4>
                  <p className="text-xs text-gray-500">قم بتحميل صور واضحة لبطاقة هويتك الصادرة عن جهة حكومية</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">حدد نوع المستند <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, documentType: 'passport' }))}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.documentType === 'passport' ? 'border-blue-600 bg-blue-500/5' : 'border-gray-100 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.documentType === 'passport' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">جواز سفر دولي</h5>
                      <p className="text-xs text-gray-500">الأكثر قبولاً عالمياً</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, documentType: 'national_id' }))}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.documentType === 'national_id' ? 'border-blue-600 bg-blue-500/5' : 'border-gray-100 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.documentType === 'national_id' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">بطاقة الهوية الوطنية</h5>
                      <p className="text-xs text-gray-500">بطاقة هوية صادرة عن الحكومة</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setFormData(prev => ({ ...prev, documentType: 'drivers_license' }))}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 text-center transition-all ${formData.documentType === 'drivers_license' ? 'border-blue-600 bg-blue-500/5' : 'border-gray-100 dark:border-white/5 hover:border-blue-500/50 dark:hover:border-blue-500/50'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.documentType === 'drivers_license' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500'}`}>
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-sm">رخصة السائق</h5>
                      <p className="text-xs text-gray-500">رخصة قيادة سارية المفعول</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-5 h-5 text-orange-600" />
                  <h5 className="font-bold text-orange-900 dark:text-orange-500">متطلبات المستندات</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-orange-800/80 dark:text-orange-400/80">
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> جميع النصوص مرئية بوضوح</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> غير منتهي الصلاحية أو تالف</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> صورة عالية الدقة</div>
                  <div className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-500" /> لا يوجد وهج أو ظلال</div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الجانب الأمامي <span className="text-red-500">*</span></label>
                  <label className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'front')} />
                    {formData.frontImage ? (
                      <img src={formData.frontImage} alt="Front" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : null}
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center mb-4 transition-colors relative z-10">
                      {formData.frontImage ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />}
                    </div>
                    <h5 className="font-bold mb-1 relative z-10">{formData.frontImage ? 'تم تحميل الصورة الأمامية' : 'تحميل من الجهة الأمامية'}</h5>
                    <p className="text-xs text-gray-500 relative z-10">صور PNG و JPG حتى 10 ميجابايت</p>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 dark:text-gray-300">الجانب الخلفي <span className="text-red-500">*</span></label>
                  <label className="border-2 border-dashed border-gray-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group relative overflow-hidden">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'back')} />
                    {formData.backImage ? (
                      <img src={formData.backImage} alt="Back" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    ) : null}
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-white/5 group-hover:bg-blue-500/10 flex items-center justify-center mb-4 transition-colors relative z-10">
                      {formData.backImage ? <CheckCircle className="w-8 h-8 text-emerald-500" /> : <UploadCloud className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors" />}
                    </div>
                    <h5 className="font-bold mb-1 relative z-10">{formData.backImage ? 'تم تحميل الصورة الخلفية' : 'تحميل الجانب الخلفي'}</h5>
                    <p className="text-xs text-gray-500 relative z-10">صور PNG و JPG حتى 10 ميجابايت</p>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-4 flex items-start gap-3">
                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleInputChange} className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  أؤكد أن جميع المعلومات المقدمة دقيقة وأن المستندات أصلية. وأتفهم أن تقديم معلومات خاطئة قد يؤدي إلى تعليق الحساب. وأوافق على <a href="#" className="text-blue-600 hover:underline">شروط الخدمة</a> وسياسة <a href="#" className="text-blue-600 hover:underline">الخصوصية</a>.
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <button 
                  onClick={() => setCurrentStep(2)}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  <ArrowRight className="w-5 h-5" /> سابق
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري التقديم...' : 'تقديم الطلب'} <CheckCircle className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
        </div>
        <div>
          <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-1">خصوصيتك محمية</h4>
          <p className="text-sm text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
            يتم تشفير مستنداتك وتخزينها بشكل آمن. نستخدم إجراءات أمنية على مستوى البنوك لحماية معلوماتك الشخصية والامتثال للوائح حماية البيانات الدولية.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

const KYCView = ({ user, showToast }: { user: User, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [step, setStep] = useState<'intro' | 'form'>('intro');

  if (user.kycStatus === 'pending') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center py-12 space-y-6"
      >
        <div className="w-24 h-24 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-12 h-12 text-yellow-500" />
        </div>
        <h2 className="text-3xl font-black">طلبك قيد المراجعة</h2>
        <p className="text-gray-500 max-w-md mx-auto">نحن نقوم حالياً بمراجعة مستنداتك. قد تستغرق هذه العملية ما يصل إلى 24 ساعة. سنقوم بإعلامك بمجرد الانتهاء.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 font-bold">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          قيد المراجعة
        </div>
      </motion.div>
    );
  }

  if (user.kycStatus === 'approved') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto text-center py-12 space-y-6"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-3xl font-black">تم التحقق من حسابك</h2>
        <p className="text-gray-500 max-w-md mx-auto">حسابك موثق بالكامل. يمكنك الآن الاستمتاع بجميع ميزات المنصة بأمان.</p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 font-bold">
          <CheckCircle className="w-5 h-5" />
          حساب موثق
        </div>
      </motion.div>
    );
  }

  if (step === 'form') {
    return <KYCFormView user={user} onBack={() => setStep('intro')} showToast={showToast} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          التحقق مطلوب
        </div>
        <h2 className="text-3xl md:text-4xl font-black tracking-tighter">التحقق من الهوية (KYC)</h2>
        <p className="text-gray-500 font-medium">أكمل عملية التحقق من هويتك لفتح جميع ميزات المنصة</p>
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-xl">
        <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-yellow-600 dark:text-yellow-500" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-black">التحقق من الهوية مطلوب</h3>
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              أكمل عملية التحقق من هويتك (KYC) للامتثال للوائح والوصول إلى جميع الميزات.
            </p>
          </div>

          <button 
            onClick={() => setStep('form')}
            className="w-full max-w-md py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-2xl font-black shadow-xl shadow-yellow-600/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            بدء عملية التحقق الآن
            <ShieldCheck className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const generateChartData = (points: number, trend: 'up' | 'down' | 'mixed') => {
  let current = 100;
  return Array.from({ length: points }).map((_, i) => {
    const change = (Math.random() - (trend === 'up' ? 0.3 : trend === 'down' ? 0.7 : 0.5)) * 5;
    current += change;
    return { value: current };
  });
};

const BotCard = ({ bot, i, onSubscribe, isSubscribing }: { bot: any, i: number, onSubscribe: (bot: any, amount: number) => void, isSubscribing: boolean }) => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('7d');

  const chartData = React.useMemo(() => {
    const points = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
    return generateChartData(points, bot.profit.includes('+') ? 'up' : 'mixed');
  }, [timeframe, bot.profit]);

  return (
    <motion.div 
      key={bot.name}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.1 }}
      className="bot-card group relative bg-white dark:bg-gray-900 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/20 dark:border-gray-700/30 overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Bot Header */}
      <div className="relative p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-lg">
              <bot.icon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {bot.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{bot.strategy}</p>
            </div>
          </div>
          <span className="px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
            نسبة نجاح {bot.winRate}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
          {bot.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{bot.profit}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">الربح</div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="text-lg font-bold text-gray-900 dark:text-white">{bot.duration}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">المدة</div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">الأداء</span>
            <div className="flex gap-1">
              {[
                { id: '24h', label: '24 ساعة' },
                { id: '7d', label: '7 أيام' },
                { id: '30d', label: '30 يوم' }
              ].map(tf => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id as any)}
                  className={`px-2 py-1 text-[10px] rounded ${timeframe === tf.id ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`colorProfit-${bot.name.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={bot.profit.includes('+') ? '#22c55e' : '#3b82f6'} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={bot.profit.includes('+') ? '#22c55e' : '#3b82f6'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={bot.profit.includes('+') ? '#22c55e' : '#3b82f6'} 
                  fillOpacity={1} 
                  fill={`url(#colorProfit-${bot.name.replace(/\s+/g, '')})`} 
                  strokeWidth={2} 
                  isAnimationActive={true}
                />
                <YAxis domain={['dataMin', 'dataMax']} hide />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment Range */}
        <div className="flex items-center justify-between text-sm mb-4">
          <span className="text-gray-600 dark:text-gray-400">نطاق الاستثمار:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {bot.minInvestment} دولار
          </span>
        </div>

        {/* Trading Pairs */}
        <div className="mb-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">أزواج التداول:</div>
          <div className="flex flex-wrap gap-1">
            {bot.tradingPairs.map((pair: string) => (
              <span key={pair} className="px-2 py-1 text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                {pair}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => onSubscribe(bot, parseFloat(bot.minInvestment))}
          disabled={isSubscribing}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isSubscribing ? 'جاري الاشتراك...' : 'استثمر الآن'}</span>
        </button>
      </div>
    </motion.div>
  );
};

const AegisRescueTerminal = ({ user, isStopped }: { user: User, isStopped: boolean }) => {
  const [logs, setLogs] = useState<{ id: number, text: string, type: 'info' | 'success' | 'warn' | 'error' | 'rescue' }[]>([]);
  const [metrics, setMetrics] = useState({ 
    balance: user.balance, 
    equity: user.balance * 1.002, 
    risk: '0.0001%', 
    dd: '0.03%', 
    pnl: 0,
    trades: 842,
    direction: 'NEUTRAL',
    volatility: 'LOW'
  });
  const [pnlData, setPnlData] = useState<{ x: number, y: number }[]>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const logRef = React.useRef<HTMLDivElement>(null);

  // Simulation logic
  useEffect(() => {
    if (isStopped) return;

    const initialPnl = Array.from({ length: 40 }, (_, i) => ({ x: i, y: Math.max(0, i * 2 + (Math.random() * 10)) }));
    setPnlData(initialPnl);

    const logMessages = [
      'ARB_ENGINE: s1.btc_mkt update...',
      'BAYESIAN_UPDATE: prior_prob adjusted to 0.642',
      'KELLY_CRIT: resizing pos to 0.001 (min_risk)',
      'EXECUTION: buy_limit filled @ btc_spot_01',
      'ORDER_FLOW: detected micro-imbalance @ SOL/USDT',
      'ALPHA_SIGNAL: k-reversal detected (p=0.88)',
      'RECOVERY_LOG: secured +$0.021 profit',
      'SHIELD_UNIT: anti-spike filter activated',
      'NETWORK: latency 12ms (ams-node-04)',
      'SYSTEM: neural_layer_04 synced',
      'MARKET_DATA: vol_index 0.12 (stable)',
      'HEDGE_RATIO: 1:1 parity maintained',
    ];

    const interval = setInterval(async () => {
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [...prev.slice(-100), { id: Date.now(), text: msg, type: 'info' }]);
      
      const profit = 0.015;
      setMetrics(prev => ({
        ...prev,
        balance: prev.balance + profit,
        pnl: prev.pnl + profit,
        trades: prev.trades + 1,
        direction: Math.random() > 0.5 ? 'BULLISH' : 'BEARISH'
      }));

      // CREDIT PROFIT TO REAL BALANCE
      if (user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            balance: increment(profit)
          });
        } catch (error) {
          console.error("Error updating Aegis profit:", error instanceof Error ? error.message : String(error));
        }
      }

      setPnlData(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(-39), { x: last.x + 1, y: last.y + (Math.random() * 4) }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isStopped, user.balance]);

  // Particle Animation (The branching "tree")
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: { x: number, y: number, vx: number, vy: number, life: number, opacity: number, color: string, label?: string }[] = [];

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      if (!isStopped) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid lines
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 0.5;
        for(let i=0; i<canvas.width; i+=40) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
        }
        for(let j=0; j<canvas.height; j+=40) {
          ctx.beginPath(); ctx.moveTo(0, j); ctx.lineTo(canvas.width, j); ctx.stroke();
        }

        // Origin point
        const originX = canvas.width * 0.2;
        const originY = canvas.height * 0.5;

        // Emit
        if (Math.random() > 0.3) {
          const isWin = Math.random() > 0.2;
          particles.push({
            x: originX,
            y: originY,
            vx: Math.random() * 6 + 3,
            vy: (Math.random() - 0.5) * 5,
            life: 1,
            opacity: 0.8,
            color: isWin ? '#10b981' : '#f43f5e',
            label: Math.random() > 0.95 ? `${isWin ? '+' : '-'}$${(Math.random() * 0.05).toFixed(3)}` : undefined
          });
        }

        particles.forEach((p, i) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vx *= 0.997;
          p.life -= 0.004;
          p.opacity -= 0.004;

          ctx.beginPath();
          ctx.moveTo(p.x - p.vx, p.y - p.vy);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.lineWidth = 1;
          ctx.stroke();

          if (p.label && p.opacity > 0.5) {
             ctx.fillStyle = p.color;
             ctx.font = '9px Courier New';
             ctx.fillText(p.label, p.x + 5, p.y);
          }

          // Branching effect
          if (p.life > 0.6 && Math.random() > 0.97) {
            particles.push({
              ...p,
              vy: p.vy + (Math.random() - 0.5) * 3,
              life: p.life * 0.7,
              label: undefined
            });
          }
        });

        particles = particles.filter(p => p.life > 0);

        // Labels
        ctx.fillStyle = '#666';
        ctx.font = '11px Courier New';
        ctx.globalAlpha = 1;
        ctx.fillText('late-to-tomorrow', originX - 110, originY + 30);
        
        ctx.beginPath();
        ctx.arc(originX, originY, 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(originX, originY, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [isStopped]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-black text-[#888] font-mono h-[800px] rounded-[2rem] border border-zinc-900 shadow-2xl flex flex-col overflow-hidden relative" dir="ltr">
      {/* Top Header */}
      <div className="p-3 bg-[#0a0a0a] border-b border-zinc-900 flex justify-between items-center text-[10px] tracking-widest text-[#666]">
        <div className="flex gap-4">
          <span className="text-white font-bold">ARB ENGINE // 5-MIN BTC MARKETS</span>
          <span>BLOCK_HEIGHT: 839402</span>
        </div>
        <div className="flex gap-4 items-center">
           <span className="text-emerald-500 flex items-center gap-1">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             LIVE FEED ACCESS: ONLINE
           </span>
           <span className="bg-rose-600/20 text-rose-500 px-2 py-0.5 rounded text-[8px] font-black">REC</span>
        </div>
      </div>

      {/* Top Formulas Section */}
      <div className="grid grid-cols-3 border-b border-zinc-900 text-[10px] h-[150px] bg-[#050505]">
        {/* Bayesian Model */}
        <div className="p-5 border-r border-zinc-900 space-y-2">
          <div className="text-white font-black uppercase tracking-widest mb-3 opacity-90 border-b border-white/5 pb-1 w-fit">BAYESIAN MODEL</div>
          <div className="opacity-60 space-y-1 leading-relaxed">
            <p className="text-emerald-400">PRIOR: p(y|x) = p(f|x, t, delta, vol, book)</p>
            <p>P(H|D) = P(D|H) * P(H) / P(D)</p>
            <p>μ_n = (σ²_0 * μ_v + n * σ²_v * x) / (σ²_0 + n * σ²_v)</p>
            <p>λ_t = exp(-κ(t - τ))</p>
          </div>
        </div>

        {/* Edge + Spread */}
        <div className="p-5 border-r border-zinc-900 space-y-2">
          <div className="text-white font-black uppercase tracking-widest mb-3 opacity-90 border-b border-white/5 pb-1 w-fit">EDGE + SPREAD</div>
          <div className="opacity-60 space-y-1 leading-relaxed">
            <p>spread_edge = 1 - (p_yes + p_no) - c</p>
             <p className="text-blue-400">Z-score: Z = (x - μ_s) / σ_s</p>
            <p>z_imbalance = (V_bid - V_ask) / (V_bid + V_ask)</p>
            <p>E[x_t] = μ + exp(-κt)(x_0 - μ)</p>
          </div>
        </div>

        {/* Execution Layer */}
        <div className="p-5 space-y-2">
          <div className="text-white font-black uppercase tracking-widest mb-3 opacity-90 border-b border-white/5 pb-1 w-fit">EXECUTION LAYER</div>
          <div className="opacity-60 space-y-1 leading-relaxed">
            <p className="text-white">STRATEGY: RECOVERY_ALPHA_V3</p>
            <p className="text-orange-400 font-bold">f* = (p * b - q) / b</p>
            <p>Kelly % = Edge / Odds</p>
            <p>r = s * q * σ² * (T-t)</p>
          </div>
        </div>
      </div>

      {/* Central Visualizer */}
      <div className="flex-1 relative overflow-hidden bg-[#0a0a0a]">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute top-6 right-8 text-[9px] text-[#444] text-right pointer-events-none">
           CPU Load: 12% <br/>
           Engine: Aegis_Rescue_v1 <br/>
           Status: SYNCED
        </div>
        {isStopped && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="text-center space-y-4">
              <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">System Offline</h3>
                <p className="text-rose-500 text-sm font-bold">EMERGENCY SHUTDOWN ENGAGED</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Data Section */}
      <div className="h-[280px] border-t border-zinc-900 grid grid-cols-12 bg-[#050505]">
        {/* Trading Stream */}
        <div className="col-span-4 border-r border-zinc-900 flex flex-col">
          <div className="p-3 border-b border-zinc-900 text-[10px] font-black text-white uppercase opacity-40 tracking-widest">TRADING STREAM</div>
          <div ref={logRef} className="flex-1 overflow-y-auto p-4 space-y-1 text-[9px] custom-scrollbar scroll-smooth">
            {logs.map(log => (
              <div key={log.id} className="flex gap-3">
                <span className="text-[#333] font-bold">{new Date(log.id).toLocaleTimeString([], { hour12: false })}</span>
                <span className={cn(
                  log.text.includes('secured') ? 'text-emerald-500' : 'text-[#777]'
                )}>{log.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bot Metrics */}
        <div className="col-span-3 border-r border-zinc-900 flex flex-col p-6 space-y-5">
           <div className="text-[10px] font-black text-white uppercase opacity-40 tracking-widest">BOT METRICS</div>
           <div className="grid grid-cols-1 gap-3 text-[10px]">
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Balance</span>
                <span className="text-white font-bold text-xs">${metrics.balance.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Equity</span>
                <span className="text-white font-bold opacity-80">${metrics.equity.toFixed(3)}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Risk</span>
                <span className="text-emerald-500 font-bold">{metrics.risk}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Drawdown</span>
                <span className="text-blue-500 font-bold">{metrics.dd}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Trades</span>
                <span className="text-white font-bold">{metrics.trades}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Direction</span>
                <span className={cn("font-bold", metrics.direction === 'BULLISH' ? 'text-emerald-500' : 'text-rose-500')}>{metrics.direction}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="opacity-40">Volatility</span>
                <span className="text-blue-400 font-bold">{metrics.volatility}</span>
              </div>
           </div>
           <div className="pt-3 border-t border-zinc-900">
             <div className="flex justify-between items-center text-[10px]">
               <span className="opacity-40">Status</span>
               <span className={cn("font-black tracking-widest", !isStopped ? "text-emerald-500" : "text-rose-500")}>
                  {!isStopped ? 'RECOVERY_ACTIVE' : 'SYSTEM_HALTED'}
               </span>
             </div>
           </div>
        </div>

        {/* PNL Curve */}
        <div className="col-span-5 flex flex-col">
          <div className="p-3 border-b border-zinc-900 flex justify-between items-center">
            <div className="text-[10px] font-black text-white uppercase opacity-40 tracking-widest">PNL CURVE</div>
            <div className="flex items-baseline gap-2">
               <span className="text-[9px] opacity-40 uppercase">Total Profit</span>
               <span className="text-white font-black text-xl">${(user.balance - 10 + metrics.pnl).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#111" />
                <Line 
                  type="monotone" 
                  dataKey="y" 
                  stroke="#fff" 
                  strokeWidth={2} 
                  dot={false} 
                  animationDuration={0}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const RexconalCyberTerminal = ({ user, isStopped }: { user: User, isStopped: boolean }) => {
  const [logs, setLogs] = useState<{ id: number, text: string, type: 'info' | 'success' | 'warn' | 'error' | 'entry' | 'exit' }[]>([]);
  const [chartData, setChartData] = useState<{ time: string, value: number }[]>([]);
  const [metrics, setMetrics] = useState({ latency: '24ms', throughput: '1.2 GB/s', accuracy: '98.4%', threads: '128' });
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStopped) {
       setLogs(prev => [...prev.slice(-100), { id: Date.now(), text: 'TERMINATING CONNECTION TO MARKET EXCHANGES...', type: 'warn' }, { id: Date.now() + 1, text: 'REXCONAL CORE SUSPENDED', type: 'error' }]);
       setMetrics(prev => ({ ...prev, latency: '---', throughput: '0 GB/s', accuracy: '0%' }));
       return;
    }

    // Generate initial logs
    const initialLogs = [
      { id: Date.now() - 5000, text: 'REXCONAL v4.2.0 INITIALIZING...', type: 'info' },
      { id: Date.now() - 4000, text: 'SECURE HANDSHAKE ESTABLISHED WITH BINANCE-API-SECURE', type: 'success' },
      { id: Date.now() - 3000, text: 'LOADING NEURAL WEIGHTS: model_v9_optimized.h5', type: 'info' },
      { id: Date.now() - 2000, text: 'MARKET SCANNER ACTIVE: 420 PAIRS DETECTED', type: 'info' },
      { id: Date.now() - 1000, text: 'AI CORE ONLINE - MONITORING VOLATILITY', type: 'success' },
    ];
    // @ts-ignore
    setLogs(initialLogs);

    // Initial chart data
    const initialChart = Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      value: 50 + Math.random() * 20
    }));
    setChartData(initialChart);

    const logMessages = [
      { text: 'Scanning market signals...', type: 'info' },
      { text: 'ENTRY BTC/USDT LONG @ 64,231.5', type: 'entry' },
      { text: 'EXIT ETH/USDT PROFIT +$12.42', type: 'exit' },
      { text: 'Liquidity thin on GBP/JPY - skipping', type: 'warn' },
      { text: 'Whale movement detected: 4,200 BTC moved to Binance', type: 'info' },
      { text: 'Neural network adjusting stop-loss levels...', type: 'info' },
      { text: 'Whale movement detected: 1,500 ETH moved to Coinbase', type: 'info' },
      { text: 'ENTRY XAU/USD SHORT @ 2,342.1', type: 'entry' },
      { text: 'EXIT SOL/USDT PROFIT +$4.88', type: 'exit' },
      { text: 'Scanning Polkadot ecosystem...', type: 'info' },
      { text: 'High volatility detected on PEPE - ignoring junk signals', type: 'warn' },
      { text: 'Scanning Solana network data...', type: 'info' },
      { text: 'EXIT BTC/USDT PROFIT +$25.12', type: 'exit' },
    ];

    const logInterval = setInterval(async () => {
      if (isStopped) return;
      const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
      setLogs(prev => [...prev.slice(-100), { id: Date.now(), text: msg.text, type: msg.type as any }]);
      
      // If it's an exit log (profit), update real balance
      if (msg.type === 'exit' && msg.text.includes('PROFIT +$') && user.uid) {
        const profitMatch = msg.text.match(/PROFIT \+\$([0-9.]+)/);
        if (profitMatch && profitMatch[1]) {
          try {
            const profit = parseFloat(profitMatch[1]);
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, { balance: increment(profit) });
          } catch (error) {
            console.error("Error updating Rexconal profit:", error instanceof Error ? error.message : String(error));
          }
        }
      }

      setChartData(prev => {
        const lastVal = prev[prev.length - 1].value;
        const nextVal = lastVal + (Math.random() * 4 - 1.8);
        return [...prev.slice(-19), { time: Date.now().toString(), value: nextVal }];
      });

      setMetrics({
        latency: `${Math.floor(20 + Math.random() * 15)}ms`,
        throughput: `${(0.8 + Math.random() * 0.5).toFixed(1)} GB/s`,
        accuracy: `${(98 + Math.random() * 1.5).toFixed(1)}%`,
        threads: `${Math.floor(120 + Math.random() * 20)}`
      });
    }, 1500);

    return () => clearInterval(logInterval);
  }, [isStopped]);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-[#05060b] text-[#94a3b8] font-mono rounded-[2rem] border border-blue-500/30 overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)] mb-10 h-[800px] flex flex-col" dir="ltr">
      {/* HUD Header */}
      <div className="p-6 border-b border-blue-500/20 bg-[#0a0b14] flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-blue-500 font-bold tracking-widest uppercase">REXCONAL AI CORE</span>
            <span className="text-xl font-black text-white tracking-tight">STATUS: ONLINE</span>
          </div>
          <div className="h-10 w-px bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase">LIVE $ PROFIT</span>
            <span className="text-xl font-black text-emerald-400">+$4,885.20</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold">
          <div className="flex flex-col items-end">
            <span className="text-zinc-500">SYSTEM TIME</span>
            <span className="text-white">{new Date().toLocaleTimeString()}</span>
          </div>
          <Cpu className="w-8 h-8 text-blue-500/50 animate-pulse" />
        </div>
      </div>

      {/* Main Terminal Grid */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Side: Scanning Stream */}
        <div className="col-span-3 border-r border-blue-500/10 p-4 space-y-4 overflow-hidden hidden md:block">
          <div className="text-[10px] text-blue-400 font-bold border-b border-blue-500/20 pb-2 flex items-center gap-2">
            <Activity className="w-3 h-3" /> MARKET SCANNER
          </div>
          <div className="space-y-3 opacity-60 overflow-hidden text-[10px]">
            {['WHALE_TRACKER_01', 'LIQUIDITY_MAP_V2', 'ORDERFLOW_ANALYZER', 'SENTIMENT_ENGINE'].map((id) => (
              <div key={id} className="space-y-1">
                <div className="flex justify-between">
                  <span>{id}</span>
                  <span className="text-blue-400">SYNCED</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full">
                  <motion.div animate={{ width: ['0%', '100%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="h-full bg-blue-500" />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 space-y-2">
             <div className="text-[10px] text-orange-400 font-bold">WHALE WATCH</div>
             <div className="text-[9px] space-y-1">
                <div className="flex justify-between"><span>0x23b...</span> <span className="text-rose-500">-$240k</span></div>
                <div className="flex justify-between"><span>0xaff...</span> <span className="text-emerald-500">+$1.2M</span></div>
                <div className="flex justify-between"><span>0x882...</span> <span className="text-rose-500">-$85k</span></div>
             </div>
          </div>
        </div>

        {/* Center: Live Chart and Stats */}
        <div className="col-span-12 md:col-span-6 flex flex-col">
          {/* Metrics Bar */}
          <div className="p-4 grid grid-cols-4 gap-4 border-b border-blue-500/10 text-[10px]">
            <div><div className="text-zinc-500 uppercase">Latency</div><div className="text-blue-400 font-bold">{metrics.latency}</div></div>
            <div><div className="text-zinc-500 uppercase">Accuracy</div><div className="text-emerald-400 font-bold">{metrics.accuracy}</div></div>
            <div><div className="text-zinc-500 uppercase">Threads</div><div className="text-purple-400 font-bold">{metrics.threads}</div></div>
            <div><div className="text-zinc-500 uppercase">Uptime</div><div className="text-white font-bold">99.9%</div></div>
          </div>

          {/* Line Chart */}
          <div className="flex-1 min-h-[300px] p-6 relative">
            <div className="absolute top-4 right-6 p-2 bg-blue-500/10 rounded-lg text-[9px] text-blue-400 font-black tracking-widest z-10">
               NEURAL CLOUD COMPUTE
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Terminal Log */}
          <div 
            ref={logContainerRef}
            className="h-[250px] bg-black/40 border-t border-blue-500/10 p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar scroll-smooth"
          >
             {logs.map(log => (
               <div key={log.id} className="mb-1 flex gap-2">
                 <span className="text-zinc-600">[{new Date(log.id).toLocaleTimeString([], { hour12: false })}]</span>
                 <span className={cn(
                   "font-bold",
                   log.type === 'success' ? 'text-emerald-400' :
                   log.type === 'entry' ? 'text-blue-400' :
                   log.type === 'exit' ? 'text-purple-400' :
                   log.type === 'warn' ? 'text-orange-400' :
                   log.type === 'error' ? 'text-rose-500' : 'text-zinc-400'
                 )}>
                   {log.type === 'entry' ? '>> ' : log.type === 'exit' ? '<< ' : '> '}
                   {log.text}
                 </span>
               </div>
             ))}
          </div>
        </div>

        {/* Right Side: Data Visualization */}
        <div className="col-span-3 border-l border-blue-500/10 p-4 space-y-6 hidden lg:block overflow-hidden">
           <div className="space-y-2">
             <div className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Global Signals</div>
             <div className="space-y-3 opacity-70">
                {[
                  { pair: 'BTC-SHORT', prob: '84%', color: 'rose' },
                  { pair: 'ETH-LONG', prob: '92%', color: 'emerald' },
                  { pair: 'SOL-LONG', prob: '78%', color: 'emerald' },
                  { pair: 'BNB-MID', prob: '65%', color: 'zinc' },
                ].map((s, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between text-[9px]"><span>{s.pair}</span> <span>{s.prob}</span></div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={cn("h-full", s.color === 'emerald' ? 'bg-emerald-500' : s.color === 'rose' ? 'bg-rose-500' : 'bg-zinc-500')} style={{ width: s.prob }} />
                    </div>
                  </div>
                ))}
             </div>
           </div>

           <div className="space-y-3">
              <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Neural Nodes</div>
              <div className="grid grid-cols-4 gap-2">
                 {Array.from({ length: 12 }).map((_, i) => (
                   <motion.div 
                    key={i} 
                    animate={{ opacity: [1, 0.4, 1] }} 
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                    className="aspect-square bg-blue-500/20 rounded-sm border border-blue-500/30" 
                   />
                 ))}
              </div>
           </div>

           <div className="p-4 bg-blue-900/10 rounded-2xl border border-blue-500/20 text-center space-y-2">
              <div className="text-[10px] text-blue-500 font-bold">TOTAL DATA FLOW</div>
              <div className="text-xl font-black text-white">{metrics.throughput}</div>
           </div>
        </div>
      </div>
    </div>
  );
};

const AITradingDashboard = ({ user, showToast, initialBot }: { user: User, showToast: (msg: string, type: 'success' | 'error' | 'info') => void, initialBot?: 'rexconal' | 'aegis' | null }) => {
  const [isActivating, setIsActivating] = useState(false);
  const [activeBot, setActiveBot] = useState<'rexconal' | 'aegis'>(initialBot || 'rexconal');
  const [isStopped, setIsStopped] = useState(false);

  const [isBooting, setIsBooting] = useState(false);

  // Removed automatic overriding of activeBot to allow manual selection via FAB
  useEffect(() => {
    if (initialBot) {
      if (initialBot === 'aegis' && activeBot !== 'aegis') {
        setIsBooting(true);
        setTimeout(() => setIsBooting(false), 2000);
      }
      setActiveBot(initialBot);
    }
  }, [initialBot]);

  const handleBotSwitch = (bot: 'rexconal' | 'aegis') => {
    if (bot === 'aegis' && activeBot !== 'aegis') {
      setIsBooting(true);
      setTimeout(() => setIsBooting(false), 2000);
    }
    setActiveBot(bot);
    setIsStopped(false);
  };

  const handleActivateTrial = async (botType: 'rexconal' | 'aegis') => {
    if (!user.uid) return;
    setIsActivating(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);
      const updateData: any = {};
      if (botType === 'rexconal') {
        updateData.aiTrialExpires = expiresAt.toISOString();
      } else {
        updateData.aegisTrialExpires = expiresAt.toISOString();
      }
      
      await updateDoc(doc(db, 'users', user.uid), updateData);
      showToast(`تم تفعيل ${botType === 'rexconal' ? 'Rexconal' : 'Aegis AI'} المجاني لمدة 3 أيام!`, 'success');
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      showToast('فشل تفعيل التجربة المجانية', 'error');
    } finally {
      setIsActivating(false);
    }
  };

  const isRexconalActive = user.aiTrialExpires && new Date(user.aiTrialExpires) > new Date();
  const isAegisActive = user.aegisTrialExpires && new Date(user.aegisTrialExpires) > new Date();
  const isTrialActive = isRexconalActive || isAegisActive;

  // Mock data for the dashboard (matching Rexconal requirements)
  const weeklyPerformance = [
    { week: 'W16/2026', trades: 700, profit: 142.41, progress: 85 },
    { week: 'W15/2026', trades: 700, profit: 156.64, progress: 92 },
    { week: 'W14/2026', trades: 700, profit: 128.04, progress: 78 },
    { week: 'W13/2026', trades: 700, profit: 165.5, progress: 95 },
    { week: 'W12/2026', trades: 0, profit: 0, progress: 0 },
    { week: 'W11/2026', trades: 0, profit: 0, progress: 0 },
  ];

  const dailyPerformance = [
    { date: '2026-04-16', trades: 100, win: 85, loss: 15, profit: 22.55 },
    { date: '2026-04-15', trades: 100, win: 82, loss: 18, profit: 18.22 },
    { date: '2026-04-14', trades: 100, win: 78, loss: 22, profit: 12.10 },
    { date: '2026-04-13', trades: 100, win: 88, loss: 12, profit: 25.19 },
    { date: '2026-04-12', trades: 100, win: 84, loss: 16, profit: 21.52 },
    { date: '2026-04-11', trades: 100, win: 80, loss: 20, profit: 15.77 },
    { date: '2026-04-10', trades: 100, win: 86, loss: 14, profit: 24.83 },
  ];

  const [recentTrades, setRecentTrades] = useState([
    { pair: 'EUR/USD', type: 'BUY', result: 'WIN', amount: '$0.25', time: '14:25:31' },
    { pair: 'BTC/USDT', type: 'SELL', result: 'WIN', amount: '$0.42', time: '14:24:12' },
    { pair: 'GBP/JPY', type: 'BUY', result: 'LOSS', amount: '-$0.15', time: '14:22:55' },
    { pair: 'ETH/USDT', type: 'BUY', result: 'WIN', amount: '$0.31', time: '14:20:01' },
    { pair: 'XAU/USD', type: 'SELL', result: 'WIN', amount: '$0.88', time: '14:18:45' },
    { pair: 'AUD/USD', type: 'BUY', result: 'LOSS', amount: '-$0.08', time: '14:15:20' },
  ]);

  useEffect(() => {
    if (!isTrialActive) return;

    const pairs = ['BTC/USDT', 'ETH/USDT', 'EUR/USD', 'XAU/USD', 'GBP/JPY', 'SOL/USDT', 'AUD/USD', 'BRENT'];
    const types = ['BUY', 'SELL'];

    const interval = setInterval(() => {
      if (isStopped) return;
      const pair = pairs[Math.floor(Math.random() * pairs.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const result = Math.random() > 0.2 ? 'WIN' : 'LOSS';
      
      let amountValue;
      if (activeBot === 'aegis') {
        // Micro-trades logic for Aegis - strictly around 0.001 as requested
        amountValue = result === 'WIN' ? (Math.random() * 0.002 + 0.001).toFixed(3) : (Math.random() * 0.001 + 0.0005).toFixed(4);
      } else {
        // Normal trades for Rexconal
        amountValue = result === 'WIN' ? (Math.random() * 1.5 + 0.1).toFixed(2) : (Math.random() * 0.5 + 0.05).toFixed(2);
      }
      
      const amount = `${result === 'WIN' ? '+' : '-'}$${amountValue}`;
      const time = new Date().toLocaleTimeString('ar-EG', { hour12: false });

      const newTrade = { pair, type, result, amount, time };
      setRecentTrades(prev => [newTrade, ...prev.slice(0, 5)]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isTrialActive, isStopped, activeBot]);

  if (!isTrialActive) {
    return (
      <div className="max-w-4xl mx-auto mt-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-4xl font-black text-white">اختر نظام التداول الآلي</h2>
          <p className="text-zinc-500">ابدأ تجربتك المجانية لمدة 3 أيام مع أنظمة Rexconal المتطورة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
          {/* Rexconal Bot Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-zinc-900/50 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Rexconal AI</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  الروبوت القياسي للتداول اليومي المربح. ينفذ 100 صفقة يومياً بأرباح مستقرة.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg uppercase">100 Trades/Day</span>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg uppercase">$10-$26 Daily Profit</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleActivateTrial('rexconal')}
              disabled={isActivating}
              className="mt-8 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all disabled:opacity-50"
            >
              تفعيل Rexconal
            </button>
          </motion.div>

          {/* Aegis AI Bot Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="p-8 bg-zinc-900/50 backdrop-blur-xl border border-emerald-500/20 rounded-[2.5rem] flex flex-col justify-between"
          >
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">🛡️ Aegis Ai</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  روبوت إنقاذ الحسابات الضعيفة (أقل من $10). يقوم بصفقات مجهرية 0.001 للنمو التدريجي حتى $20.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-lg uppercase">Rescue Mode</span>
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded-lg uppercase">0.001 Lot Size</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleActivateTrial('aegis')}
              disabled={isActivating}
              className="mt-8 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black transition-all disabled:opacity-50"
            >
              تفعيل Aegis AI
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-white">
            {activeBot === 'rexconal' ? 'لوحة تحكم Rexconal AI' : '🛡️ Aegis AI Cyber Terminal'}
          </h2>
          <p className="text-zinc-500 font-medium">
            {activeBot === 'rexconal' 
              ? 'متابعة أداء خوارزمية التداول الكمي'
              : 'نظام الاستجابة التكتيكية والنمو المجهري'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900/80 backdrop-blur-md border border-zinc-800 p-1.5 rounded-2xl mr-4 shadow-xl">
            <button 
              onClick={() => handleBotSwitch('rexconal')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black transition-all duration-300",
                activeBot === 'rexconal' 
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              Rexconal
            </button>
            <button 
              onClick={() => handleBotSwitch('aegis')}
              className={cn(
                "px-6 py-2 rounded-xl text-xs font-black transition-all duration-300",
                activeBot === 'aegis' 
                  ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              🛡️ Aegis
            </button>
          </div>

          <button
            onClick={() => setIsStopped(!isStopped)}
            className={cn(
              "p-4 rounded-2xl font-black transition-all active:scale-95 flex items-center gap-2 border shadow-lg",
              isStopped 
                ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-500/50" 
                : "bg-rose-600 text-white hover:bg-rose-700 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.3)]"
            )}
          >
            <Power className={cn("w-5 h-5", !isStopped && "animate-pulse")} />
            <span className="hidden sm:inline">{isStopped ? 'تنشيط النظام' : 'إيقاف النظام'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isBooting ? (
          <motion.div
            key="booting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-[600px] bg-black rounded-[2.5rem] flex flex-col items-center justify-center space-y-8 relative overflow-hidden border border-emerald-500/20"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_70%)] animate-pulse" />
            <div className="relative">
              <ShieldCheck className="w-24 h-24 text-emerald-500 animate-[pulse_2s_infinite]" />
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-[-20px] inset-y-[-20px] border-2 border-emerald-500/30 border-t-emerald-500 rounded-full"
              />
            </div>
            <div className="text-center space-y-3 relative">
              <h3 className="text-3xl font-black text-white tracking-[0.2em] animate-pulse">BOOTING AEGIS_v4.2</h3>
              <div className="flex gap-1 justify-center">
                {Array.from({ length: 40 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 2, opacity: 0.1 }}
                    animate={{ 
                      height: [2, Math.random() * 20 + 5, 2],
                      opacity: [0.1, 0.8, 0.1]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      delay: i * 0.05
                    }}
                    className="w-1 bg-emerald-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-[10px] text-emerald-500/60 font-mono">NEURAL_SYNC_STATUS: 88% ... ENCRYPTING ...</p>
            </div>
          </motion.div>
        ) : activeBot === 'rexconal' ? (
          <motion.div
            key="rexconal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <RexconalCyberTerminal user={user} isStopped={isStopped} />
            
            <div className="bg-[#1a1c2e] rounded-3xl p-6 border border-zinc-800 shadow-2xl" dir="rtl">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  <span className="text-zinc-100 font-black text-xl">الأداء الأسبوعي</span>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-500/50" />
              </div>
              <div className="space-y-6">
                {weeklyPerformance.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[13px]">
                    <span className="text-zinc-500 font-bold w-16 text-right">{item.week}</span>
                    <div className="flex-1 h-[28px] bg-[#24273d] rounded-full overflow-hidden relative border border-white/5">
                      <div 
                        className="h-full bg-[#12b362] transition-all duration-1000 shadow-[0_0_15px_rgba(18,179,98,0.3)]" 
                        style={{ width: `${item.progress}%` }} 
                      />
                    </div>
                    <div className="min-w-[120px] text-left">
                      {item.profit > 0 && <span className="text-[#12b362] font-black ml-2">+${item.profit.toLocaleString()}</span>}
                      {item.trades > 0 && <span className="text-zinc-500 font-bold whitespace-nowrap">{item.trades} صفقات</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1c2e] rounded-3xl p-6 border border-zinc-800 shadow-2xl overflow-hidden" dir="rtl">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                  <span className="text-zinc-100 font-black text-xl">الأداء اليومي</span>
                </div>
                <Activity className="w-5 h-5 text-indigo-500/50" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="text-zinc-500 text-xs font-black uppercase tracking-wider">
                      <th className="pb-6 pr-4 border-b border-zinc-800/50">اليوم</th>
                      <th className="pb-6 border-b border-zinc-800/50">صفقات</th>
                      <th className="pb-6 border-b border-zinc-800/50 text-[#12b362]">رابح</th>
                      <th className="pb-6 border-b border-zinc-800/50 text-rose-500">خاسر</th>
                      <th className="pb-6 pl-4 border-b border-zinc-800/50">الربح اليومي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {dailyPerformance.map((item, idx) => (
                      <tr key={idx} className="text-[14px] hover:bg-white/[0.02] transition-colors group">
                        <td className="py-5 pr-4 text-zinc-400 font-bold">{item.date}</td>
                        <td className="py-5 text-zinc-300 font-black">{item.trades}</td>
                        <td className="py-5 text-[#12b362] font-black">{item.win}</td>
                        <td className="py-5 text-rose-500 font-black">{item.loss}</td>
                        <td className="py-5 pl-4 font-black text-[#12b362] text-left leading-none">
                          ${item.profit.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#1a1c2e] rounded-3xl p-6 border border-zinc-800 shadow-2xl overflow-hidden" dir="rtl">
              <div className="flex items-center justify-between mb-8 px-2">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <span className="text-zinc-100 font-black text-xl">أحدث الصفقات</span>
                </div>
                <Zap className="w-5 h-5 text-blue-500/50" />
              </div>
              <div className="space-y-4">
                {recentTrades.map((trade, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-[#24273d] rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
                        trade.result === 'WIN' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>
                        {trade.result === 'WIN' ? 'W' : 'L'}
                      </div>
                      <div>
                        <div className="font-black text-zinc-100">{trade.pair}</div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">{trade.type} • {trade.time}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "text-lg font-black",
                      trade.result === 'WIN' ? "text-[#12b362]" : "text-rose-500"
                    )}>
                      {trade.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="aegis"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full"
          >
            <AegisRescueTerminal user={user} isStopped={isStopped} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BotsView = ({ onSubscribe, isSubscribing }: { onSubscribe: (bot: any, amount: number) => void, isSubscribing: boolean }) => {
  const [activeCategory, setActiveCategory] = useState('جميع الروبوتات');
  const categories = ['جميع الروبوتات', 'العملات المشفرة', 'الفوركس', 'الأسهم', 'السلع'];

  const botsData = [
    // العملات المشفرة
    {
      name: 'ألفا سكالبر',
      category: 'العملات المشفرة',
      strategy: 'سكالبينج',
      description: 'تداول سريع وعالي التردد للعملات المشفرة للاستفادة من تقلبات الأسعار الصغيرة.',
      winRate: '92.4%', profit: '+12.4%', risk: 'Low', riskScore: 3, trades: '1,245', drawdown: '1.2%', color: 'blue', icon: Zap, minInvestment: '100', tradingPairs: ['BTC/USDT', 'ETH/USDT'], duration: '30 يومًا'
    },
    {
      name: 'صائد الاتجاه المشفر',
      category: 'العملات المشفرة',
      strategy: 'تتبع الاتجاه',
      description: 'يحلل الاتجاهات الكبرى في سوق الكريبتو لتحديد نقاط الدخول والخروج المثلى.',
      winRate: '88.7%', profit: '+15.2%', risk: 'Medium', riskScore: 5, trades: '342', drawdown: '4.5%', color: 'indigo', icon: TrendingUp, minInvestment: '500', tradingPairs: ['BTC/USDT', 'SOL/USDT'], duration: '45 يومًا'
    },
    {
      name: 'مراجحة البيتكوين',
      category: 'العملات المشفرة',
      strategy: 'مراجحة',
      description: 'يستفيد من فروق أسعار البيتكوين بين المنصات المختلفة بسرعة فائقة.',
      winRate: '95.1%', profit: '+8.1%', risk: 'Low', riskScore: 2, trades: '2,100', drawdown: '0.8%', color: 'green', icon: Cpu, minInvestment: '1000', tradingPairs: ['BTC/USDT', 'BTC/USDC'], duration: '15 يومًا'
    },
    {
      name: 'شبكة الإيثريوم',
      category: 'العملات المشفرة',
      strategy: 'تداول شبكي',
      description: 'يضع أوامر شراء وبيع متعددة على مستويات محددة مسبقاً لعملة الإيثريوم.',
      winRate: '85.2%', profit: '+10.5%', risk: 'Medium', riskScore: 4, trades: '890', drawdown: '5.2%', color: 'purple', icon: Activity, minInvestment: '250', tradingPairs: ['ETH/USDT'], duration: '60 يومًا'
    },
    {
      name: 'متأرجح العملات البديلة',
      category: 'العملات المشفرة',
      strategy: 'تداول متأرجح',
      description: 'يستهدف العملات البديلة ذات الإمكانات العالية لتحقيق أرباح على المدى المتوسط.',
      winRate: '76.4%', profit: '+18.3%', risk: 'High', riskScore: 7, trades: '120', drawdown: '8.1%', color: 'orange', icon: Star, minInvestment: '150', tradingPairs: ['ADA/USDT', 'DOT/USDT'], duration: '90 يومًا'
    },
    {
      name: 'مزارع العوائد',
      category: 'العملات المشفرة',
      strategy: 'زراعة العوائد',
      description: 'يبحث عن أفضل فرص زراعة العوائد في بروتوكولات التمويل اللامركزي (DeFi).',
      winRate: '98.2%', profit: '+9.7%', risk: 'Low', riskScore: 2, trades: '45', drawdown: '0.5%', color: 'emerald', icon: ShieldCheck, minInvestment: '500', tradingPairs: ['USDT', 'USDC'], duration: '30 يومًا'
    },

    // الفوركس
    {
      name: 'أوميغا تريند',
      category: 'الفوركس',
      strategy: 'تتبع الاتجاه',
      description: 'خوارزمية متقدمة لتتبع الاتجاهات طويلة المدى في أزواج العملات الرئيسية.',
      winRate: '82.1%', profit: '+8.2%', risk: 'Medium', riskScore: 4, trades: '210', drawdown: '3.2%', color: 'blue', icon: TrendingUp, minInvestment: '500', tradingPairs: ['EUR/USD', 'GBP/USD'], duration: '60 يومًا'
    },
    {
      name: 'قناص اليورو/دولار',
      category: 'الفوركس',
      strategy: 'سكالبينج',
      description: 'روبوت متخصص في التداول السريع لزوج اليورو/دولار خلال أوقات الذروة.',
      winRate: '89.5%', profit: '+6.5%', risk: 'Low', riskScore: 3, trades: '1,500', drawdown: '1.5%', color: 'indigo', icon: Zap, minInvestment: '100', tradingPairs: ['EUR/USD'], duration: '15 يومًا'
    },
    {
      name: 'مخترق الباوند',
      category: 'الفوركس',
      strategy: 'اختراق',
      description: 'يتداول بناءً على اختراق مستويات الدعم والمقاومة لزوج الجنيه الإسترليني.',
      winRate: '75.2%', profit: '+11.2%', risk: 'High', riskScore: 6, trades: '180', drawdown: '5.8%', color: 'purple', icon: Activity, minInvestment: '250', tradingPairs: ['GBP/USD', 'GBP/JPY'], duration: '30 يومًا'
    },
    {
      name: 'متداول الين',
      category: 'الفوركس',
      strategy: 'تداول محمول',
      description: 'يستفيد من فروق أسعار الفائدة بين الين الياباني والعملات الأخرى.',
      winRate: '91.4%', profit: '+10%', risk: 'Low', riskScore: 2, trades: '80', drawdown: '1.1%', color: 'green', icon: BarChart3, minInvestment: '1000', tradingPairs: ['USD/JPY', 'AUD/JPY'], duration: 'يومياً'
    },
    {
      name: 'شبكة الفوركس',
      category: 'الفوركس',
      strategy: 'تداول شبكي',
      description: 'يستخدم استراتيجية الشبكة للتداول في الأسواق العرضية (الجانبية).',
      winRate: '86.8%', profit: '+10%', risk: 'Medium', riskScore: 4, trades: '650', drawdown: '2.9%', color: 'orange', icon: Cpu, minInvestment: '300', tradingPairs: ['EUR/GBP', 'USD/CHF'], duration: 'يومياً'
    },
    {
      name: 'متداول الأخبار',
      category: 'الفوركس',
      strategy: 'تداول الأخبار',
      description: 'يتفاعل بسرعة فائقة مع الأخبار الاقتصادية والبيانات المالية الهامة.',
      winRate: '72.5%', profit: '+10%', risk: 'High', riskScore: 8, trades: '40', drawdown: '7.5%', color: 'red', icon: Star, minInvestment: '500', tradingPairs: ['EUR/USD', 'USD/JPY'], duration: 'يومياً'
    },

    // الأسهم
    {
      name: 'دلتا أربيتراج',
      category: 'الأسهم',
      strategy: 'مراجحة إحصائية',
      description: 'يستغل التسعير الخاطئ المؤقت بين الأسهم المرتبطة ببعضها البعض.',
      winRate: '88.1%', profit: '+10%', risk: 'Low', riskScore: 3, trades: '420', drawdown: '1.8%', color: 'blue', icon: Cpu, minInvestment: '2000', tradingPairs: ['AAPL/MSFT', 'GOOGL/META'], duration: 'يومياً'
    },
    {
      name: 'مؤشر إس آند بي',
      category: 'الأسهم',
      strategy: 'استثمار سلبي',
      description: 'يتتبع أداء مؤشر S&P 500 مع إعادة توازن تلقائية للمحفظة.',
      winRate: '99.9%', profit: '+10%', risk: 'Low', riskScore: 1, trades: '12', drawdown: '5.0%', color: 'green', icon: TrendingUp, minInvestment: '500', tradingPairs: ['SPY', 'VOO'], duration: 'يومياً'
    },
    {
      name: 'زخم التكنولوجيا',
      category: 'الأسهم',
      strategy: 'تداول الزخم',
      description: 'يستثمر في أسهم التكنولوجيا ذات الزخم الإيجابي القوي.',
      winRate: '78.5%', profit: '+10%', risk: 'High', riskScore: 7, trades: '150', drawdown: '9.2%', color: 'purple', icon: Zap, minInvestment: '1000', tradingPairs: ['NVDA', 'AMD', 'TSLA'], duration: 'يومياً'
    },
    {
      name: 'حاصد الأرباح',
      category: 'الأسهم',
      strategy: 'استثمار الأرباح',
      description: 'يستهدف الأسهم ذات التوزيعات النقدية العالية والمستقرة.',
      winRate: '94.2%', profit: '+10%', risk: 'Low', riskScore: 2, trades: '24', drawdown: '2.1%', color: 'indigo', icon: ShieldCheck, minInvestment: '5000', tradingPairs: ['JNJ', 'PG', 'KO'], duration: 'يومياً'
    },
    {
      name: 'قناص الأسهم الصغيرة',
      category: 'الأسهم',
      strategy: 'مضاربة',
      description: 'يتداول في الأسهم ذات القيمة السوقية الصغيرة (Penny Stocks) عالية التقلب.',
      winRate: '65.4%', profit: '+10%', risk: 'High', riskScore: 9, trades: '890', drawdown: '15.4%', color: 'red', icon: Activity, minInvestment: '100', tradingPairs: ['Penny Stocks'], duration: 'يومياً'
    },
    {
      name: 'فجوة الأرباح',
      category: 'الأسهم',
      strategy: 'تداول الفجوات',
      description: 'يتداول بناءً على الفجوات السعرية التي تحدث بعد إعلانات الأرباح.',
      winRate: '71.8%', profit: '+10%', risk: 'High', riskScore: 6, trades: '80', drawdown: '6.5%', color: 'orange', icon: Star, minInvestment: '1000', tradingPairs: ['US Equities'], duration: 'يومياً'
    },

    // السلع
    {
      name: 'سيغما جريد',
      category: 'السلع',
      strategy: 'تداول شبكي',
      description: 'استراتيجية شبكية مصممة خصيصاً لتداول السلع الأساسية.',
      winRate: '84.7%', profit: '+10%', risk: 'Medium', riskScore: 5, trades: '340', drawdown: '4.8%', color: 'blue', icon: Activity, minInvestment: '1000', tradingPairs: ['XAU/USD', 'XAG/USD'], duration: 'يومياً'
    },
    {
      name: 'متأرجح الذهب',
      category: 'السلع',
      strategy: 'تداول متأرجح',
      description: 'يستفيد من تقلبات أسعار الذهب على المدى القصير والمتوسط.',
      winRate: '79.3%', profit: '+10%', risk: 'Medium', riskScore: 4, trades: '110', drawdown: '3.5%', color: 'yellow', icon: TrendingUp, minInvestment: '500', tradingPairs: ['XAU/USD'], duration: 'يومياً'
    },
    {
      name: 'متتبع النفط',
      category: 'السلع',
      strategy: 'تتبع الاتجاه',
      description: 'يتتبع الاتجاهات الكبرى في أسعار النفط الخام.',
      winRate: '76.8%', profit: '+10%', risk: 'High', riskScore: 6, trades: '95', drawdown: '7.2%', color: 'gray', icon: Zap, minInvestment: '1000', tradingPairs: ['USOIL', 'UKOIL'], duration: 'يومياً'
    },
    {
      name: 'قناص الفضة',
      category: 'السلع',
      strategy: 'سكالبينج',
      description: 'تداول سريع وعالي التردد للفضة للاستفادة من تحركاتها السريعة.',
      winRate: '88.5%', profit: '+10%', risk: 'Medium', riskScore: 5, trades: '850', drawdown: '2.8%', color: 'slate', icon: Cpu, minInvestment: '250', tradingPairs: ['XAG/USD'], duration: 'يومياً'
    },
    {
      name: 'موسمي الزراعة',
      category: 'السلع',
      strategy: 'تداول موسمي',
      description: 'يتداول السلع الزراعية بناءً على الأنماط الموسمية التاريخية.',
      winRate: '81.2%', profit: '+6.2%', risk: 'Low', riskScore: 3, trades: '30', drawdown: '2.5%', color: 'green', icon: BarChart3, minInvestment: '2000', tradingPairs: ['CORN', 'WHEAT', 'SOYBEAN'], duration: '90 يومًا'
    },
    {
      name: 'مراجحة المعادن',
      category: 'السلع',
      strategy: 'مراجحة',
      description: 'يستغل فروق الأسعار بين المعادن الثمينة المختلفة.',
      winRate: '92.1%', profit: '+8.9%', risk: 'Low', riskScore: 2, trades: '150', drawdown: '1.5%', color: 'indigo', icon: ShieldCheck, minInvestment: '1500', tradingPairs: ['XAU/XAG'], duration: '60 يومًا'
    }
  ];

  const filteredBots = activeCategory === 'جميع الروبوتات' 
    ? botsData 
    : botsData.filter(bot => bot.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-5xl font-black tracking-tighter">روبوتات التداول الذكية</h2>
          <p className="text-gray-500 font-medium text-lg">خوارزميات متقدمة مدعومة بالذكاء الاصطناعي تتداول نيابة عنك.</p>
        </div>
        <div className="flex items-center gap-4 p-5 bg-blue-600/5 rounded-[2rem] border border-blue-500/10 backdrop-blur-xl">
          <div className="relative">
            <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-4 h-4 bg-emerald-500 rounded-full relative z-10" />
          </div>
          <span className="text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">{botsData.length} روبوت نشط حالياً</span>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="flex flex-wrap gap-3">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300",
              activeCategory === category 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30" 
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredBots.map((bot, i) => (
            <BotCard bot={bot} i={i} key={bot.name} onSubscribe={onSubscribe} isSubscribing={isSubscribing} />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const FeaturedSignalsView = ({ showToast }: { showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState({ id: '', name: '', price: '' });

  const openSubscriptionModal = (id: string, name: string, price: string) => {
    setSelectedSignal({ id, name, price });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const signals = [
    { id: '1', name: 'Monentum Signals', price: '1300', successRate: '63%', icon: Activity },
    { id: '2', name: 'Breakout Signals', price: '3000', successRate: '68.7%', icon: TrendingUp },
    { id: '4', name: 'Buying Oversold', price: '3800', successRate: '75%', icon: BarChart3 },
    { id: '5', name: 'Trend Signal', price: '4000', successRate: '78.4%', icon: TrendingUp },
    { id: '7', name: 'BTC Miner S9 Data Circuit', price: '5000', successRate: '83.4%', icon: Cpu },
    { id: '8', name: 'AntMiner-S7-4.8THs-1250w', price: '5300', successRate: '85.4%', icon: Cpu },
    { id: '9', name: 'S9 Mining Hardware ASIC Hash', price: '6000', successRate: '87.5%', icon: Cpu },
    { id: '10', name: 'Bitfury-B8-Bitcoin-50-THS', price: '7000', successRate: '93.4%', icon: Cpu },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            إشارات تداول مميزة
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">اشترك في إشارات التداول الاحترافية وعزز نجاحك في التداول</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{signals.length}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">إشارات متاحة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {signals.map((signal) => (
          <div key={signal.id} className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 hover:shadow-lg hover:ring-blue-300 dark:hover:ring-blue-700 transition-all duration-300 overflow-hidden flex flex-col">
            
            {/* Signal Header */}
            <div className="relative p-6 pb-4 flex-grow">
              {/* Premium Badge */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Star className="w-3 h-3 ml-1" />
                  مميز
                </span>
              </div>

              {/* Signal Icon & Name */}
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <signal.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{signal.name}</h3>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${parseFloat(signal.price).toLocaleString()}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">/شهرياً</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">اشتراك إشارات تداول احترافية</p>
              </div>

              {/* Features */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">نسبة النجاح: {signal.successRate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">إشعارات لحظية</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">تحليل خبراء</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">دعم على مدار الساعة</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="p-6 pt-0 mt-auto">
              <button 
                onClick={() => openSubscriptionModal(signal.id, signal.name, signal.price)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-5 h-5" />
                اشترك الآن
              </button>
            </div>

            {/* Hover Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">الاشتراك في الإشارة</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSignal.name}</p>
                  </div>
                </div>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    طريقة الدفع
                  </label>
                  <select className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
                    <option value="" disabled selected>اختر طريقة الدفع</option>
                    <option value="USDT">USDT (Tether)</option>
                    <option value="BTC">Bitcoin</option>
                    <option value="ETH">Ethereum</option>
                    <option value="Balance">رصيد الحساب</option>
                  </select>
                </div>

                {/* Amount Display */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    مبلغ الاشتراك ($)
                  </label>
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly 
                      value={selectedSignal.price}
                      className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-bold text-lg cursor-not-allowed"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">/شهرياً</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 flex items-center gap-1">
                    <Info className="w-4 h-4" />
                    اشتراك شهري متجدد
                  </p>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                <button 
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => {
                    showToast?.(`تم طلب الاشتراك في ${selectedSignal.name} بنجاح!`, 'success');
                    closeModal();
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  تأكيد الاشتراك
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MyPortfolioView = ({ investments }: { investments: PlanInvestment[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black tracking-tight">خططي الاستثمارية</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">تتبع وإدارة محافظك الاستثمارية النشطة</p>
        </div>
      </div>

      {investments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl border border-gray-100 dark:border-gray-700 p-16 text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto">
            <PieChart className="w-12 h-12 text-gray-300" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black">لم يتم العثور على أي خطط استثمارية</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">ليس لديك أي خطط استثمارية في الوقت الحالي. ابدأ استثمارك الأول الآن!</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {investments.map((inv) => {
            const start = new Date(inv.startDate).getTime();
            const end = new Date(inv.endDate).getTime();
            const now = new Date().getTime();
            const progress = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));

            return (
            <div key={inv.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden group hover:shadow-xl transition-all">
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black">{inv.planName}</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                      نشط
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">المبلغ المستثمر</div>
                    <div className="text-2xl font-black text-blue-600 dark:text-blue-400">${inv.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">إجمالي الأرباح</div>
                    <div className="text-lg font-black text-emerald-500">${inv.totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">معدل العائد</div>
                    <div className="text-lg font-black text-gray-900 dark:text-white">{inv.returnRate}% {inv.returnType === 'Daily' ? 'يومياً' : 'كل 10 دقائق'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">تاريخ البدء:</span>
                    <span className="font-black">{new Date(inv.startDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-bold">تاريخ الانتهاء:</span>
                    <span className="font-black">{new Date(inv.endDate).toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }} 
                      className="h-full bg-blue-600"
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>تقدم الاستثمار</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </motion.div>
  );
};

const PlanCard = ({ plan, isSelected, onSelect, onSubscribe, isSubscribing }: { plan: any, isSelected: boolean, onSelect: () => void, onSubscribe: (plan: any, amount: number) => void, isSubscribing: boolean }) => {
  const [amount, setAmount] = useState(plan.min.toString());
  const potentialReturn = (parseFloat(amount) * plan.return / 100).toFixed(2);

  return (
    <div 
      className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700",
        isSelected && "ring-4 ring-blue-500 dark:ring-blue-600"
      )}
      onClick={onSelect}
    >
      {/* ROI Badge */}
      <div className="absolute top-4 right-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
          <TrendingUp className="w-3 h-3 mr-1" />
          عائد استثمار بنسبة {plan.return}%
        </span>
      </div>
      
      {/* Card Header with Gradient */}
      <div className="pt-10 px-6 pb-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 text-center">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{plan.name}</h3>
        <div className="flex items-center justify-center mb-4">
          <div className="h-1 w-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">الحد الأدنى </span>
          ${plan.min.toLocaleString()}
        </div>
      </div>
      
      {/* Plan Features */}
      <div className="p-6 space-y-6">
        <ul className="space-y-4">
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5">
              <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-medium">الحد الأدنى للاستثمار: </span> 
              <span className="text-gray-900 dark:text-white">${plan.min.toLocaleString()}</span>
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5">
              <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-medium">الحد الأقصى للاستثمار: </span> 
              <span className="text-gray-900 dark:text-white">${plan.max.toLocaleString()}</span>
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5">
              <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-medium">معدل العائد: </span> 
              <span className="text-green-600 dark:text-green-400">{plan.return}% {plan.returnType === 'Daily' ? 'يومياً' : 'كل 10 دقائق'}</span>
            </p>
          </li>
          <li className="flex items-start">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 mt-0.5">
              <CheckCircle className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              <span className="font-medium">المدة: </span> 
              <span className="text-gray-900 dark:text-white">{plan.duration.replace('Days', 'أيام').replace('Day', 'يوم')}</span>
            </p>
          </li>
        </ul>
        
        {/* Investment Form */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              مبلغ الاستثمار ($)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400">$</span>
              </span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={plan.min} 
                max={plan.max} 
                className="pl-8 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-3 px-4 text-gray-900 dark:text-white shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-colors duration-200"
              />
            </div>
            
            {/* Range Input */}
            <div className="mt-4 px-1">
              <input 
                type="range" 
                min={plan.min} 
                max={plan.max} 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500" 
              />
              <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                <span>الحد الأدنى: ${plan.min.toLocaleString()}</span>
                <span>الحد الأقصى: ${plan.max.toLocaleString()}</span>
              </div>
            </div>
            
            <div className="mt-4 text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                العائد المحتمل: <span className="text-green-600 dark:text-green-400 font-bold text-sm">${potentialReturn}</span>
                <span className="block mt-1">{plan.returnType === 'Daily' ? 'يوميًا' : 'كل 10 دقائق'}</span>
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => onSubscribe(plan, parseFloat(amount))}
            disabled={isSubscribing}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg shadow-blue-500/20 transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubscribing ? 'جاري الاشتراك...' : 'انضم إلى خطة الاستثمار'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PlansView = ({ onSubscribe, isSubscribing }: { onSubscribe: (plan: any, amount: number) => void, isSubscribing: boolean }) => {
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const plans = [
    { id: 1, name: 'امتحان', min: 500, max: 2999, return: 150, returnType: 'Every 10 Minutes', duration: '5 Days', color: 'blue' },
    { id: 10, name: 'خطة المبتدئين', min: 100, max: 25000, return: 16, returnType: 'Daily', duration: '60 Days', color: 'indigo' },
    { id: 11, name: 'الخطة القياسية', min: 25000, max: 100000, return: 2.5, returnType: 'Daily', duration: '60 Days', color: 'purple' },
    { id: 12, name: 'خطة العمل', min: 100000, max: 1000000, return: 3.1, returnType: 'Daily', duration: '60 Days', color: 'emerald' },
    { id: 13, name: 'الخطة الأساسية', min: 3000, max: 29999, return: 25, returnType: 'Daily', duration: '5 Days', color: 'green' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">خطط استثمارية</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">قم بترقية حسابك من خلال فرص الاستثمار ذات العائد المرتفع لدينا</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
            <TrendingUp className="w-4 h-4 mr-2" />
            قم بتنمية محفظتك الاستثمارية
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.id} 
            plan={plan} 
            isSelected={selectedPlanId === plan.id}
            onSelect={() => setSelectedPlanId(plan.id)}
            onSubscribe={onSubscribe}
            isSubscribing={isSubscribing}
          />
        ))}
      </div>

      {/* Investment Guide Section */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md p-8 border border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <Info className="w-6 h-6 mr-3 text-blue-600 dark:text-blue-400" />
          دليل الاستثمار
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">اختر خطتك</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">اختر خطة استثمارية تتناسب مع أهدافك المالية وقدرتك على تحمل المخاطر.</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">استثمر بأمان</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">تتم إدارة أموالك بشكل آمن باستخدام أحدث استراتيجيات الاستثمار.</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">اربح عوائد</h4>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">شاهد استثمارك ينمو مع عوائد تنافسية تُودع مباشرة في حسابك.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SettingsView = ({ user, showToast }: { user: User, showToast?: (message: string, type?: 'success' | 'error' | 'info') => void }) => {
  const [activeSection, setActiveSection] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    const displayName = (document.getElementById('display-name') as HTMLInputElement)?.value;
    const phone = (document.getElementById('phone') as HTMLInputElement)?.value;
    const country = (document.getElementById('country-select') as HTMLSelectElement)?.value;

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName || user.displayName,
        phone: phone || user.phone || '',
        country: country || user.country || '',
      });
      showToast?.('تم تحديث الملف الشخصي بنجاح', 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'users');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-tight">إعدادات الحساب</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">إدارة ملفك الشخصي وتفضيلات الأمان والخصوصية.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Settings Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {[
            { id: 'profile', label: 'الملف الشخصي', icon: UserCircle },
            { id: 'security', label: 'الأمان والخصوصية', icon: Shield },
            { id: 'notifications', label: 'الإشعارات', icon: Bell },
            { id: 'payment', label: 'طرق الدفع', icon: CreditCard },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all text-right",
                activeSection === item.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Settings Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 p-8 sm:p-10">
          {activeSection === 'profile' && (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center gap-8 pb-10 border-b border-gray-100 dark:border-gray-700">
                <div className="relative group">
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="w-32 h-32 rounded-[2.5rem] shadow-2xl ring-4 ring-white dark:ring-gray-700 group-hover:opacity-80 transition-opacity" 
                    alt="Profile" 
                  />
                  <button className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center sm:text-right space-y-2">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">{user.displayName}</h3>
                  <p className="text-gray-500 dark:text-gray-400 font-bold">{user.email}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-black uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    حساب موثق
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الاسم الكامل</label>
                  <input 
                    type="text" 
                    id="display-name"
                    defaultValue={user.displayName}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold text-gray-900 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    id="phone"
                    defaultValue={user.phone}
                    placeholder="+966 50 000 0000"
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold text-gray-900 dark:text-white transition-all"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">الدولة</label>
                  <select 
                    id="country-select"
                    defaultValue={user.country || "المملكة العربية السعودية"}
                    className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold text-gray-900 dark:text-white appearance-none"
                  >
                    <option>المملكة العربية السعودية</option>
                    <option>الإمارات العربية المتحدة</option>
                    <option>الكويت</option>
                    <option>قطر</option>
                    <option>مصر</option>
                  </select>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-8">
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h4 className="text-lg font-black text-blue-900 dark:text-blue-100 mb-1">حماية الحساب ثنائية العامل (2FA)</h4>
                  <p className="text-blue-700 dark:text-blue-300 text-sm font-bold">أضف طبقة إضافية من الأمان لحسابك عن طريق تفعيل التحقق بخطوتين.</p>
                </div>
                <button className="mr-auto px-6 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-colors">تفعيل</button>
              </div>

              <div className="space-y-6">
                <h4 className="text-xl font-black px-2">تغيير كلمة المرور</h4>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">كلمة المرور الحالية</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">كلمة المرور الجديدة</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-2">تأكيد كلمة المرور</label>
                      <input type="password" placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 px-6 font-bold" />
                    </div>
                  </div>
                </div>
                <button className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl transition-all active:scale-95">تحديث كلمة المرور</button>
              </div>

              <div className="pt-10 border-t border-gray-100 dark:border-gray-700">
                <h4 className="text-xl font-black text-red-500 px-2 mb-4">منطقة الخطر</h4>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-bold mb-6 px-2">بمجرد حذف حسابك، لن تتمكن من استعادة أي بيانات أو أرصدة مرتبطة به. يرجى توخي الحذر.</p>
                <button className="px-8 py-4 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-black rounded-2xl transition-all active:scale-95">حذف الحساب نهائياً</button>
              </div>
            </div>
          )}

          {(activeSection === 'notifications' || activeSection === 'payment') && (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
              <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center">
                <Zap className="w-10 h-10 text-blue-600 animate-pulse" />
              </div>
              <h4 className="text-2xl font-black">قريباً جداً</h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-bold">هذه الإعدادات قيد التطوير حالياً وستكون متاحة في التحديث القادم.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const AccountHistoryView = () => {
  const [activeTab, setActiveTab] = useState('deposits');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="w-16 h-16 rounded-[2rem] bg-blue-600/10 flex items-center justify-center backdrop-blur-sm">
          <CreditCard className="w-8 h-8 text-blue-600" />
        </div>
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tight">سجل المعاملات</h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg font-bold">راقب جميع أنشطتك المالية وتتبع حركة أموالك.</p>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-gray-800 rounded-[3rem] shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-3 p-2 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem]">
            {[
              { id: 'deposits', label: 'الودائع', icon: ArrowDownCircle },
              { id: 'withdrawals', label: 'عمليات السحب', icon: ArrowUpCircle },
              { id: 'others', label: 'أخرى', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 min-w-[120px] flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black transition-all",
                  activeTab === tab.id 
                    ? "bg-white dark:bg-gray-800 text-blue-600 shadow-xl shadow-blue-500/10 ring-1 ring-gray-200 dark:ring-gray-700" 
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8 sm:p-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-2xl font-black">
                {activeTab === 'deposits' ? 'سجل الإيداعات' : activeTab === 'withdrawals' ? 'سجل السحب' : 'معاملات أخرى'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 font-bold">
                {activeTab === 'deposits' ? 'تتبع جميع عمليات شحن الرصيد الخاصة بك.' : activeTab === 'withdrawals' ? 'تتبع جميع عمليات سحب الأرباح.' : 'سجل العمليات المالية الإضافية.'}
              </p>
            </div>
            <div className="relative group lg:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text" 
                placeholder="ابحث في المعاملات..."
                className="w-full bg-gray-50 dark:bg-gray-900 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 pl-12 pr-6 font-bold transition-all text-right"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Empty State */}
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-6 bg-gray-50/50 dark:bg-gray-900/30 rounded-[2.5rem] border-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl flex items-center justify-center">
              {activeTab === 'deposits' ? (
                <ArrowDownCircle className="w-12 h-12 text-gray-300" />
              ) : activeTab === 'withdrawals' ? (
                <ArrowUpCircle className="w-12 h-12 text-gray-300" />
              ) : (
                <Activity className="w-12 h-12 text-gray-300" />
              )}
            </div>
            <div className="space-y-2">
              <h4 className="text-2xl font-black text-gray-400">لا توجد سجلات</h4>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto font-bold">
                لم يتم العثور على أي معاملات في هذا القسم حتى الآن.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const PerformanceHistoryView = ({ trades, globalSettings }: { trades: Trade[], globalSettings: any }) => {
  const [filter, setFilter] = useState('all');

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'WIN') return trade.status === 'WIN';
    if (filter === 'LOSE') return trade.status === 'LOSE';
    if (filter === 'Buy') return trade.type === 'Buy';
    if (filter === 'Sell') return trade.type === 'Sell';
    return true;
  });

  const stats = {
    total: trades.length,
    wins: trades.filter(t => t.status === 'WIN').length,
    losses: trades.filter(t => t.status === 'LOSE').length,
    active: trades.filter(t => t.status === 'PENDING').length,
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-8 sm:p-10 border-b border-gray-100 dark:border-gray-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div>
              <h2 className="text-4xl font-black tracking-tight">سجل التداول</h2>
              <p className="text-gray-500 dark:text-gray-400 text-lg mt-2">تتبع أنشطتك التجارية وأداء محفظتك</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'المجموع', value: stats.total, color: 'text-gray-900 dark:text-white' },
                { label: 'انتصارات', value: stats.wins, color: 'text-emerald-500' },
                { label: 'خسائر', value: stats.losses, color: 'text-red-500' },
                { label: 'نشيط', value: stats.active, color: 'text-blue-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-2xl text-center">
                  <div className={cn("text-2xl font-black", stat.color)}>{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            {[
              { id: 'all', label: 'الجميع', color: 'bg-blue-600' },
              { id: 'WIN', label: 'انتصارات', color: 'bg-emerald-600' },
              { id: 'LOSE', label: 'خسائر', color: 'bg-red-600' },
              { id: 'Buy', label: 'يشتري', color: 'bg-blue-500' },
              { id: 'Sell', label: 'يبيع', color: 'bg-orange-600' },
            ].map((btn) => (
              <button 
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  filter === btn.id 
                    ? `${btn.color} text-white shadow-lg` 
                    : "bg-gray-100 dark:bg-gray-900 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 sm:p-10">
          {filteredTrades.length === 0 ? (
            <div className="py-20 text-center space-y-6">
              <div className="w-24 h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto">
                <Activity className="w-12 h-12 text-gray-300" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">لا يوجد سجل تداول</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">ستظهر أنشطة التداول الخاصة بك هنا بمجرد البدء.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrades.map((trade) => (
                <div key={trade.id} className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-md transition-all">
                  <div className="flex items-center gap-6 w-full sm:w-auto">
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm",
                      trade.type === 'Buy' ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {trade.type === 'Buy' ? <ArrowDownCircle className="w-7 h-7" /> : <ArrowUpCircle className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="text-lg font-black">{trade.asset}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">{trade.type === 'Buy' ? 'شراء' : 'بيع'} • {new Date(trade.timestamp).toLocaleString('ar-EG')}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full sm:w-auto">
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">المبلغ</div>
                      <div className="text-lg font-black">${trade.amount.toLocaleString()}</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">حجم العقد</div>
                      <div className="text-lg font-black">{trade.lotSize || 0.01}</div>
                    </div>
                    <div className="text-center sm:text-right">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">السعر</div>
                      <div className="text-lg font-black">${trade.entryPrice.toLocaleString()}</div>
                    </div>
                    <div className="text-center sm:text-right col-span-2 sm:col-span-1">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">الربح/الخسارة</div>
                      <div className={cn("text-lg font-black", trade.profit >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {trade.profit >= 0 ? '+' : ''}${trade.profit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col gap-2">
                    <span className={cn(
                      "inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest",
                      trade.status === 'WIN' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
                      trade.status === 'LOSE' ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    )}>
                      {trade.status === 'WIN' ? 'ربح' : trade.status === 'LOSE' ? 'خسارة' : 'قيد التنفيذ'}
                    </span>
                    {trade.status === 'PENDING' && (
                      <button 
                        onClick={async () => {
                          try {
                            const tradeRef = doc(db, 'trades', trade.id);
                            
                            let finalStatus = trade.profit >= 0 ? 'WIN' : 'LOSE';
                            let finalProfit = trade.profit;

                            if (globalSettings.autoControl === 'win') {
                              finalStatus = 'WIN';
                              if (finalProfit <= 0) finalProfit = Math.max(1, trade.amount * 0.1);
                            } else if (globalSettings.autoControl === 'loss') {
                              finalStatus = 'LOSE';
                              if (finalProfit >= 0) finalProfit = -Math.max(1, trade.amount * 0.4); // Increased manual loss to 40%
                            }

                            await updateDoc(tradeRef, {
                              status: finalStatus,
                              profit: finalProfit,
                              exitPrice: trade.entryPrice // Simplification for manual close
                            });
                            
                            const userRef = doc(db, 'users', auth.currentUser!.uid);
                            await updateDoc(userRef, {
                              balance: increment(trade.amount + finalProfit)
                            });
                          } catch (error) {
                            console.error("Error closing trade:", error instanceof Error ? error.message : String(error));
                          }
                        }}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors"
                      >
                        إغلاق الصفقة
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const MarketsView = ({ setActiveTab }: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const getCategoryFromType = (type: string) => {
    switch (type) {
      case 'crypto': return 'Crypto';
      case 'stock': return 'Stocks';
      case 'forex': return 'Currency';
      case 'commodity': return 'Commodities';
      case 'bond': return 'Bonds';
      default: return 'all';
    }
  };

  const filteredAssets = ASSETS.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || asset.category === getCategoryFromType(selectedType);
    return matchesSearch && matchesType;
  });

  const groupedAssets = filteredAssets.reduce((acc, asset) => {
    if (!acc[asset.category]) acc[asset.category] = [];
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, typeof ASSETS>);

  const getTypeDisplayName = (category: string) => {
    switch (category) {
      case 'Crypto': return 'العملات المشفرة';
      case 'Stocks': return 'الأسهم';
      case 'Currency': return 'العملات الأجنبية';
      case 'Commodities': return 'السلع';
      case 'Bonds': return 'السندات';
      default: return category;
    }
  };

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'Crypto': return <div className="w-5 h-5 text-orange-500 flex items-center justify-center font-black">₿</div>;
      case 'Stocks': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'Currency': return <Globe className="w-5 h-5 text-blue-500" />;
      case 'Commodities': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'Bonds': return <Briefcase className="w-5 h-5 text-purple-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 pb-12"
    >
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">أسواق التداول</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">اختر من بين آلاف أدوات التداول عبر فئات أصول متعددة</p>
          </div>

          {/* Search and Stats */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="أدوات البحث..." 
                className="w-64 pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            <div className="hidden md:flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-900 dark:text-white font-semibold">{ASSETS.length}</div>
                <div className="text-gray-500 dark:text-gray-400">الآلات الموسيقية</div>
              </div>
              <div className="w-px h-8 bg-gray-300 dark:bg-gray-600"></div>
              <div className="text-center">
                <div className="text-green-600 dark:text-green-400 font-semibold">24/7</div>
                <div className="text-gray-500 dark:text-gray-400">تجارة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Type Filters */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5">
          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'جميع الأسواق', icon: <Activity className="w-4 h-4" /> },
              { id: 'crypto', label: 'العملات المشفرة', icon: <div className="w-4 h-4 flex items-center justify-center font-black">₿</div> },
              { id: 'stock', label: 'الأسهم', icon: <TrendingUp className="w-4 h-4" /> },
              { id: 'forex', label: 'الفوركس', icon: <Globe className="w-4 h-4" /> },
              { id: 'commodity', label: 'السلع', icon: <Zap className="w-4 h-4" /> },
              { id: 'bond', label: 'السندات', icon: <Briefcase className="w-4 h-4" /> },
            ].map(type => (
              <button 
                key={type.id}
                onClick={() => setSelectedType(type.id)} 
                className={cn(
                  "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                  selectedType === type.id 
                    ? "bg-blue-500 text-white shadow-md" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Instruments Grid */}
      <div className="space-y-6">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لم يتم العثور على أي أدوات</h3>
              <p className="text-gray-600 dark:text-gray-400">حاول تعديل معايير البحث أو التصفية</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedAssets).map(([category, assets]) => (
            <div key={category} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-3 px-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(category)}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{getTypeDisplayName(category)}</h2>
                  <span className="text-sm text-gray-500 dark:text-gray-400">({assets.length} أدوات)</span>
                </div>
              </div>

              {/* Instruments Grid */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                  <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    <div className="col-span-8 md:col-span-3">أصل</div>
                    <div className="col-span-2 text-right hidden md:block">سعر</div>
                    <div className="col-span-2 text-right hidden md:block">تغيير خلال 24 ساعة</div>
                    <div className="col-span-2 text-right hidden md:block">مقدار</div>
                    <div className="col-span-4 md:col-span-3 text-right">فعل</div>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-200 dark:divide-gray-600">
                  {assets.map(instrument => {
                    const price = category === 'Crypto' ? Math.random() * 50000 + 100 : 
                                  category === 'Stocks' ? Math.random() * 500 + 50 : 
                                  category === 'Currency' ? Math.random() * 1.5 + 0.5 : 
                                  Math.random() * 2000 + 10;
                    const changePercent = (Math.random() * 10 - 5);
                    const changeAmount = price * (changePercent / 100);
                    const volume = Math.random() * 1000000000 + 10000000;

                    return (
                      <div key={instrument.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Asset Info */}
                          <div className="col-span-8 md:col-span-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 text-lg font-bold overflow-hidden">
                                {instrument.logo ? (
                                  <img src={instrument.logo} alt={instrument.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                  instrument.icon
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-gray-900 dark:text-white truncate">{instrument.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{instrument.symbol}</div>
                              </div>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="col-span-2 text-right hidden md:block">
                            <div className="font-semibold text-gray-900 dark:text-white">
                              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: price < 1 ? 6 : 2 })}
                            </div>
                          </div>

                          {/* 24h Change */}
                          <div className="col-span-2 text-right hidden md:block">
                            <div className="flex flex-col items-end gap-1">
                              <span className={cn("font-semibold flex items-center gap-1", changePercent >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                {changePercent >= 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                              </span>
                              <span className={cn("text-sm", changeAmount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                                {changeAmount > 0 ? '+' : ''}${changeAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Volume */}
                          <div className="col-span-2 text-right hidden md:block">
                            <div className="text-gray-600 dark:text-gray-400">
                              ${(volume / 1000000).toFixed(1)}M
                            </div>
                          </div>

                          {/* Trade Button */}
                          <div className="col-span-4 md:col-span-3 text-right">
                            <button 
                              onClick={() => setActiveTab('dashboard')}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
                            >
                              <TrendingUp className="w-4 h-4" />
                              <span>تجارة</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

const CopyExpertsView = ({ setActiveTab, user, showToast }: { setActiveTab: (tab: string) => void, user: User, showToast?: (m: string, t?: any) => void }) => {
  const [selectedExpert, setSelectedExpert] = useState<any>(null);
  const [copyAmount, setCopyAmount] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const handleStartCopy = async () => {
    if (!selectedExpert || !copyAmount || isNaN(Number(copyAmount))) {
      showToast?.('الرجاء إدخال مبلغ صحيح', 'error');
      return;
    }

    const amount = Number(copyAmount);
    if (amount < Number(selectedExpert.minInvestment)) {
      showToast?.(`الحد الأدنى للاستثمار هو $${selectedExpert.minInvestment}`, 'error');
      return;
    }

    if (amount > user.balance) {
      showToast?.('رصيد غير كافٍ في محفظتك', 'error');
      return;
    }

    setIsCopying(true);
    try {
      const copyTradeData = {
        followerId: user.uid,
        traderId: selectedExpert.id.toString(),
        traderName: selectedExpert.name,
        traderAvatar: selectedExpert.avatar,
        amount: amount,
        status: 'active',
        startDate: new Date().toISOString(),
        currentProfit: 0,
        roi: 0
      };

      await addDoc(collection(db, 'copyTrades'), copyTradeData);

      // Deduct balance
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      // Add notification
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'بدء نسخ التداول',
        message: `لقد بدأت بنجاح في نسخ المتداول ${selectedExpert.name} بمبلغ $${amount}.`,
        type: 'success',
        read: false,
        timestamp: new Date().toISOString()
      });

      showToast?.(`تم البدء في نسخ ${selectedExpert.name} بنجاح!`, 'success');
      setSelectedExpert(null);
      setCopyAmount('');
      setActiveTab('copy');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'copyTrades');
      showToast?.('حدث خطأ أثناء بدء النسخ. يرجى المحاولة مرة أخرى.', 'error');
    } finally {
      setIsCopying(false);
    }
  };

  const experts = [
    { id: 1, name: 'إيزابيلا فوستر', strategy: 'الدخل الثابت', winRate: '93%', profit: '+124,500%', followers: '13802', risk: 'Low', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '3800.00', description: 'خبير في تداول الدخل الثابت والسندات بخلفية مؤسسية. متخصص في استراتيجيات منحنى العائد وتداول فروق الائتمان.' },
    { id: 2, name: 'أليكس طومسون', strategy: 'خبير في سوق الفوركس', winRate: '92%', profit: '+86%', followers: '235', risk: 'Medium', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '100.00', description: 'متداول فوركس ذو خبرة متخصص في أزواج العملات الرئيسية مع التركيز على إدارة المخاطر.' },
    { id: 3, name: 'ديفيد كيم', strategy: 'متداول متأرجح', winRate: '91%', profit: '+94%', followers: '178', risk: 'High', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '300.00', description: 'متخصص في التداول المتأرجح باستخدام التحليل الأساسي والفني للمراكز متوسطة الأجل.' },
    { id: 4, name: 'ليلى منصور', strategy: 'الاستثمار في التكنولوجيا', winRate: '89%', profit: '+112%', followers: '5420', risk: 'Medium', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '500.00', description: 'خبير في تحليل أسهم شركات التكنولوجيا والذكاء الاصطناعي مع رؤية طويلة الأجل.' },
    { id: 5, name: 'عمر فاروق', strategy: 'تداول السلع', winRate: '87%', profit: '+75%', followers: '3100', risk: 'High', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '250.00', description: 'متداول متخصص في الذهب والنفط والسلع الأساسية باستخدام التحليل الفني المتقدم.' },
    { id: 6, name: 'صوفيا رييس', strategy: 'تداول العقارات الرقمية', winRate: '95%', profit: '+205%', followers: '8900', risk: 'High', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '1000.00', description: 'خبير في تداول الأصول الرقمية والعقارات الافتراضية في الميتافيرس.' },
    { id: 7, name: 'ماركوس شولتز', strategy: 'تداول العملات المشفرة', winRate: '88%', profit: '+140%', followers: '4500', risk: 'Medium', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '200.00', description: 'متداول عملات مشفرة متخصص في استراتيجيات الزخم والتحوط.' },
    { id: 8, name: 'إيلينا فاسيليف', strategy: 'تداول المؤشرات', winRate: '90%', profit: '+98%', followers: '6200', risk: 'Low', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '500.00', description: 'خبير في تداول مؤشرات الأسهم العالمية مع التركيز على التحليل الكلي.' },
    { id: 9, name: 'جاكوب ميلر', strategy: 'تداول الخيارات', winRate: '86%', profit: '+160%', followers: '3800', risk: 'High', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '750.00', description: 'متداول خيارات محترف يستخدم استراتيجيات معقدة لتحقيق عوائد عالية.' },
    { id: 10, name: 'سارة جونسون', strategy: 'تداول الأسهم القيادية', winRate: '91%', profit: '+105%', followers: '5100', risk: 'Low', avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '1000.00', description: 'خبير في تداول أسهم الشركات الكبرى ذات القيمة السوقية العالية.' },
    { id: 11, name: 'أحمد حسن', strategy: 'تداول الذهب', winRate: '94%', profit: '+130%', followers: '7200', risk: 'Medium', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '400.00', description: 'متخصص في تداول الذهب والمعادن الثمينة بناءً على التحليل الجيوسياسي.' },
    { id: 12, name: 'ماريا غارسيا', strategy: 'تداول العملات الأجنبية', winRate: '85%', profit: '+90%', followers: '2900', risk: 'Medium', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200', minInvestment: '300.00', description: 'متداول فوركس يركز على أزواج العملات الناشئة واستراتيجيات التداول اليومي.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 p-6"
    >
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8 rounded-3xl">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-300 text-sm">30 متداولًا خبيرًا متاحين</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white mb-4">متداولون خبراء في نسخ التداولات</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">اختر من بين أفضل المتداولين أداءً لدينا، وقم بنسخ صفقاتهم تلقائيًا إلى محفظتك الاستثمارية.</p>
          <button onClick={() => setActiveTab('copy')} className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ArrowLeftRight className="w-4 h-4 rotate-180" />
            العودة إلى لوحة التحكم
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {experts.map((expert, i) => (
          <motion.div 
            key={expert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded text-xs font-medium">نشيط</span>
              </div>
              <div className="text-center">
                <img src={expert.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600 mx-auto mb-3" alt={expert.name} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{expert.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{expert.strategy}</p>
                <div className="flex items-center justify-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />)}
                  <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">(5)</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{expert.followers} متابع</div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{expert.winRate}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">نسبة الفوز</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">{expert.profit}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">العائد الإجمالي</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{expert.description}</p>
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">الحد الأدنى للاستثمار</span>
                  <span className="text-base font-semibold text-gray-900 dark:text-white">${expert.minInvestment}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedExpert(expert)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  ابدأ النسخ (${expert.minInvestment})
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Copy Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExpert(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-4 mb-8">
                <img src={selectedExpert.avatar} className="w-16 h-16 rounded-full object-cover border-2 border-blue-500" alt="" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">نسخ المتداول: {selectedExpert.name}</h3>
                  <p className="text-sm text-gray-500">{selectedExpert.strategy}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">مبلغ الاستثمار للنسخ</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input 
                      type="number" 
                      value={copyAmount}
                      onChange={(e) => setCopyAmount(e.target.value)}
                      placeholder={`الحد الأدنى $${selectedExpert.minInvestment}`}
                      className="w-full bg-gray-50 dark:bg-gray-800 border-none focus:ring-2 focus:ring-blue-500 rounded-2xl py-4 pl-12 pr-4 text-gray-900 dark:text-white font-black"
                    />
                  </div>
                  <div className="flex justify-between px-1 text-[10px] font-black uppercase">
                    <span className="text-gray-400 font-black">رصيدك المتاح:</span>
                    <span className="text-blue-500">${user.balance.toLocaleString()}</span>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">رسوم إدارة النسخ</span>
                    <span className="font-bold text-green-500">0% (مجاناً حالياً)</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">تنفيذ تلقائي</span>
                    <span className="font-bold text-blue-500">فوري</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setSelectedExpert(null)}
                    className="flex-1 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-2xl font-black transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    onClick={handleStartCopy}
                    disabled={isCopying}
                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isCopying ? 'جاري البدء...' : 'تأكيد النسخ'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ComingSoonView = ({ title }: { title: string }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center"
  >
    <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
      <Zap className="w-12 h-12 text-blue-600 animate-pulse" />
    </div>
    <div className="space-y-2">
      <h2 className="text-4xl font-black tracking-tight">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-lg max-w-md mx-auto">هذه الميزة قيد التطوير حالياً وستكون متاحة قريباً في التحديث القادم.</p>
    </div>
    <button onClick={() => window.location.reload()} className="px-8 py-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl font-black transition-all">العودة للرئيسية</button>
  </motion.div>
);

import CopyTradingView from './components/CopyTradingView';

// --- Main App ---

import { LoginModal } from './components/LoginModal';


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedAIBot, setSelectedAIBot] = useState<'rexconal' | 'aegis' | null>(null);
  const [marketAnalysis, setMarketAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [ethPrice, setEthPrice] = useState<number | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.bitcoin) setBtcPrice(data.bitcoin.usd);
        if (data.ethereum) setEthPrice(data.ethereum.usd);
      } catch (error) {
        // Fallback to realistic prices if API fails (common with rate limits)
        setBtcPrice(prev => prev || 64250.45 + (Math.random() * 100 - 50));
        setEthPrice(prev => prev || 3480.12 + (Math.random() * 10 - 5));
        console.warn('Using fallback prices due to API rate limits or network issues.');
      }
    };
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const ref = urlParams.get('ref');
    if (ref) {
      localStorage.setItem('referredBy', ref);
    }
  }, []);

  const [planInvestments, setPlanInvestments] = useState<PlanInvestment[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(true);

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    if (unreadNotifications.length === 0) return;

    try {
      const batch = unreadNotifications.map(n => 
        updateDoc(doc(db, 'notifications', n.id), { read: true })
      );
      await Promise.all(batch);
      showToast?.('تم تحديد جميع الإشعارات كمقروءة', 'success');
    } catch (err) {
      console.error('Error marking all as read:', err instanceof Error ? err.message : String(err));
      showToast?.('حدث خطأ أثناء تحديث الإشعارات', 'error');
    }
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) return;
    if (!confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) return;

    try {
      const batch = notifications.map(n => 
        deleteDoc(doc(db, 'notifications', n.id))
      );
      await Promise.all(batch);
      showToast?.('تم حذف جميع الإشعارات بنجاح', 'success');
    } catch (err) {
      console.error('Error clearing notifications:', err instanceof Error ? err.message : String(err));
      showToast?.('حدث خطأ أثناء حذف الإشعارات', 'error');
    }
  };
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<{ profitRate: number, autoControl: string }>({ profitRate: 85, autoControl: 'random' });
  const closingTradesRef = React.useRef<Set<string>>(new Set());
  const userRef = React.useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Simulate market prices for active trades and calculate profit
  useEffect(() => {
    if (!auth.currentUser) return;

    const interval = setInterval(() => {
      // Use the latest trades from state using a functional state update or a ref.
      // Since we can't easily access the latest state inside setInterval without adding it to deps,
      // we can just fetch the pending trades directly from Firestore or use a ref.
      // Actually, since this is a simulation, we can just let it re-run, but to avoid excessive writes,
      // let's only update if the profit change is significant or stop loss is hit.
      setTrades(currentTrades => {
        const pendingTrades = currentTrades.filter(t => t.status === 'PENDING');
        if (pendingTrades.length === 0) return currentTrades;

        pendingTrades.forEach(async (trade) => {
          const volatility = 0.0005;
          let simulatedCurrentPrice = trade.entryPrice * (1 + (Math.random() * volatility * 2 - volatility));
          
          let pipMultiplier = 10000;
          if (trade.asset.includes('XAU') || trade.asset.includes('Gold')) pipMultiplier = 100;
          else if (trade.asset.includes('JPY')) pipMultiplier = 100;
          else if (trade.asset.includes('BTC') || trade.asset.includes('ETH') || trade.asset.includes('Crypto')) pipMultiplier = 1;

          const priceDiff = simulatedCurrentPrice - trade.entryPrice;
          const pips = priceDiff * pipMultiplier;
          
          let profit = pips * (trade.lotSize || 0.01) * 10;
          if (trade.type === 'Sell') profit = -profit;

          // Calculate time-based multiplier for losses
          const tradeTime = trade.timestamp ? new Date(trade.timestamp).getTime() : new Date().getTime();
          const elapsedMinutes = (new Date().getTime() - tradeTime) / (1000 * 60);
          const timeMultiplier = Math.min(50, 1 + (elapsedMinutes * 0.5)); // 50% increase in loss per minute, capped at 50x

          let status = trade.status;

          // Apply Admin Auto-Control
          if (globalSettings.autoControl === 'win') {
            // Force profit: between 1 and 10 dollars
            profit = 1 + Math.random() * 9;
            
            // Adjust simulated price to match profit
            const targetPips = profit / ((trade.lotSize || 0.01) * 10);
            const targetPriceDiff = targetPips / pipMultiplier;
            simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? targetPriceDiff : -targetPriceDiff);
          } else if (globalSettings.autoControl === 'loss') {
            if (trade.stopLoss && trade.stopLoss > 0) {
              // New requirement: profit is stop loss multiplied by 100
              profit = -(trade.stopLoss * 100);
            } else {
              // Force loss: between 50 and 100 units
              const userBalance = userRef.current?.balance || 100;
              const targetLoss = 50 + Math.random() * 50;
              profit = -Math.min(targetLoss, userBalance * 0.9); // Cap at 90% of balance to avoid immediate liquidation if not intended, but still a heavy loss
            }
            
            // Adjust simulated price to match profit
            {
              const targetPips = Math.abs(profit) / ((trade.lotSize || 0.01) * 10);
              const targetPriceDiff = targetPips / pipMultiplier;
              simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? -targetPriceDiff : targetPriceDiff);
            }

            // Apply time multiplier to forced loss
            profit *= timeMultiplier;
            
            // Adjust simulated price to match loss
            {
              const targetPips = profit / ((trade.lotSize || 0.01) * 10);
              const targetPriceDiff = targetPips / pipMultiplier;
              simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? targetPriceDiff : -targetPriceDiff);
            }
          } else {
            // Natural simulation: if it's a loss, apply time multiplier
            if (profit < 0) {
              profit *= timeMultiplier;
              // Adjust simulated price to match increased loss
              const targetPipsNatural = profit / ((trade.lotSize || 0.01) * 10);
              const targetPriceDiffNatural = targetPipsNatural / pipMultiplier;
              simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? targetPriceDiffNatural : -targetPriceDiffNatural);
            }
          }

          if (trade.stopLoss && trade.stopLoss > 0) {
            // If profit is less than or equal to negative stopLoss amount, close the trade
            if (profit <= -trade.stopLoss) {
              status = 'LOSE';
              
              // If Always Loss mode is active, we allow the 100x loss, otherwise cap at stopLoss
              if (globalSettings.autoControl !== 'loss') {
                profit = -trade.stopLoss; // Cap the loss at the stop loss amount
              }
              
              // Adjust simulated price to match the final profit/loss
              const targetPips = profit / ((trade.lotSize || 0.01) * 10);
              const targetPriceDiff = targetPips / pipMultiplier;
              simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? targetPriceDiff : -targetPriceDiff);
            }
          }

          // Liquidation logic: if loss exceeds or equals current balance
          if (status === 'PENDING' && userRef.current && profit <= -userRef.current.balance) {
            status = 'LOSE';
            profit = -userRef.current.balance; // Cap loss at current balance
            
            // Adjust simulated price to match the liquidation amount
            const targetPips = profit / ((trade.lotSize || 0.01) * 10);
            const targetPriceDiff = targetPips / pipMultiplier;
            simulatedCurrentPrice = trade.entryPrice + (trade.type === 'Buy' ? targetPriceDiff : -targetPriceDiff);
          }

          if (status !== 'PENDING' && !closingTradesRef.current.has(trade.id)) {
            closingTradesRef.current.add(trade.id);
            try {
              const tradeRef = doc(db, 'trades', trade.id);
              await updateDoc(tradeRef, {
                profit: Number(profit.toFixed(2)),
                status,
                exitPrice: simulatedCurrentPrice,
                closedAt: new Date().toISOString()
              });

              const userRefDoc = doc(db, 'users', auth.currentUser!.uid);
              const isLiquidation = userRef.current && profit <= -userRef.current.balance;
              
              if (isLiquidation) {
                await updateDoc(userRefDoc, { balance: 0 });
              } else {
                await updateDoc(userRefDoc, {
                  balance: increment(trade.amount + profit)
                });
              }

              // Create notification for auto-close
              await addDoc(collection(db, 'notifications'), {
                userId: auth.currentUser!.uid,
                title: status === 'WIN' ? 'صفقة رابحة' : 'صفقة خاسرة',
                message: isLiquidation 
                  ? `تم إغلاق صفقتك على ${trade.asset} تلقائياً بسبب تصفير الرصيد (Liquidation).`
                  : `تم إغلاق صفقتك على ${trade.asset} تلقائياً ${status === 'LOSE' ? 'عند بلوغ وقف الخسارة' : ''}. النتيجة: ${status === 'WIN' ? 'ربح' : 'خسارة'} $${Math.abs(profit).toFixed(2)}`,
                type: status === 'WIN' ? 'success' : 'error',
                read: false,
                timestamp: new Date().toISOString()
              });
            } catch (error) {
              console.error("Error updating trade:", error instanceof Error ? error.message : String(error));
              closingTradesRef.current.delete(trade.id);
            }
          } else if (status === 'PENDING') {
            try {
              const tradeRef = doc(db, 'trades', trade.id);
              await updateDoc(tradeRef, {
                profit: Number(profit.toFixed(2))
              });
            } catch (error) {
              console.error("Error updating trade profit:", error instanceof Error ? error.message : String(error));
            }
          }
        });
        return currentTrades;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [auth.currentUser, globalSettings]);

  // Simulate investment profit generation
  useEffect(() => {
    if (!auth.currentUser) return;

    const interval = setInterval(() => {
      setPlanInvestments(currentInvestments => {
        const activeInvestments = currentInvestments.filter(inv => inv.status === 'active');
        if (activeInvestments.length === 0) return currentInvestments;

        activeInvestments.forEach(async (inv) => {
          try {
            const now = new Date();
            const startDate = new Date(inv.startDate);
            const endDate = new Date(inv.endDate);
            
            // Check if investment has expired
            if (now >= endDate) {
              const invRef = doc(db, 'planInvestments', inv.id);
              await updateDoc(invRef, {
                status: 'completed'
              });
              
              // Return only the initial investment amount (principal) to user balance
              // since profits were already paid out incrementally
              const userRef = doc(db, 'users', auth.currentUser!.uid);
              await updateDoc(userRef, {
                balance: increment(inv.amount)
              });
              
              // Create notification for completion
              await addDoc(collection(db, 'notifications'), {
                userId: auth.currentUser!.uid,
                title: 'اكتمل الاستثمار',
                message: `لقد اكتملت مدة استثمارك في "${inv.planName}". تم إعادة مبلغ الاستثمار ($${inv.amount.toLocaleString()}) إلى رصيدك.`,
                type: 'success',
                read: false,
                timestamp: new Date().toISOString()
              });
              return;
            }

            // Calculate profit based on elapsed time (simulation)
            // For a 10% daily return, we simulate it by adding a small fraction every 10 seconds
            const elapsedMs = now.getTime() - startDate.getTime();
            const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);
            
            let currentExpectedTotalProfit = 0;
            if (inv.planName?.includes('روبوت')) {
              // Specific logic for trading bots: $10 to $26 per day
              // Use a deterministic value based on the investment ID to ensure consistent daily profit
              const idHash = inv.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
              const dailyProfit = 10 + (Math.abs(idHash) % 17); // Results in 10-26 range
              currentExpectedTotalProfit = dailyProfit * elapsedDays;
            } else if (inv.returnType === 'Daily') {
              currentExpectedTotalProfit = inv.amount * (inv.returnRate / 100) * elapsedDays;
            } else {
              // For other types, just add a small amount for demo
              const elapsedPeriods = elapsedMs / (1000 * 60 * 10); // 10 minutes periods
              currentExpectedTotalProfit = inv.amount * (inv.returnRate / 100) * elapsedPeriods;
            }

            // Only update and pay out if the difference is noticeable (e.g., > $0.01)
            const profitIncrement = currentExpectedTotalProfit - inv.totalEarned;
            
            if (profitIncrement > 0.01) {
              const invRef = doc(db, 'planInvestments', inv.id);
              const roundedProfit = Number(currentExpectedTotalProfit.toFixed(4));
              const roundedIncrement = Number(profitIncrement.toFixed(4));
              
              // Update investment total earned
              await updateDoc(invRef, {
                totalEarned: roundedProfit
              });

              // ADD PROFIT TO USER BALANCE IMMEDIATELY
              const userRef = doc(db, 'users', auth.currentUser!.uid);
              await updateDoc(userRef, {
                balance: increment(roundedIncrement)
              });
            }
          } catch (error) {
            console.error("Error updating investment:", error instanceof Error ? error.message : String(error));
          }
        });
        return currentInvestments;
      });
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [auth.currentUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

    useEffect(() => {
    let unsubUser: (() => void) | null = null;
    let unsubInvestments: (() => void) | null = null;
    let unsubTrades: (() => void) | null = null;
    let unsubNotifications: (() => void) | null = null;
    let unsubSettings: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Cleanup previous listeners if they exist
      if (unsubUser) unsubUser();
      if (unsubInvestments) unsubInvestments();
      if (unsubTrades) unsubTrades();
      if (unsubNotifications) unsubNotifications();
      if (unsubSettings) unsubSettings();

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Sync user profile on login
        const syncUser = async () => {
          try {
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const existingData = docSnap.data();
              // Update existing user
              const updateData: any = {
                lastLogin: new Date().toISOString(),
              };
              
              if (firebaseUser.displayName) updateData.displayName = firebaseUser.displayName;
              if (firebaseUser.photoURL) updateData.photoURL = firebaseUser.photoURL;
              if (firebaseUser.email) updateData.email = firebaseUser.email;
              
              // Ensure required fields exist for legacy documents to pass security rules
              if (existingData.balance === undefined) updateData.balance = 0;
              if (existingData.profit === undefined) updateData.profit = 0;
              if (existingData.role === undefined) updateData.role = 'user';
              if (existingData.kycStatus === undefined) updateData.kycStatus = 'none';
              if (existingData.createdAt === undefined) updateData.createdAt = new Date().toISOString();
              if (existingData.uid === undefined) updateData.uid = firebaseUser.uid;
              if (existingData.email === undefined && !updateData.email) updateData.email = firebaseUser.email || '';
              if (existingData.points === undefined) updateData.points = 0;

              console.log('Syncing existing user:', firebaseUser.uid, updateData);
              await updateDoc(userDocRef, updateData);
            } else {
              // Create new user profile
              const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || '',
                displayName: firebaseUser.displayName || '',
                photoURL: firebaseUser.photoURL || '',
                role: firebaseUser.email === 'wasemwasemm4@gmail.com' ? 'admin' : 'user',
                balance: 0,
                profit: 0,
                kycStatus: 'none',
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                referredBy: localStorage.getItem('referredBy') || null,
                points: 0
              };
              console.log('Creating new user:', firebaseUser.uid, newUser);
              await setDoc(userDocRef, newUser);
              // Clear referral after use
              localStorage.removeItem('referredBy');
            }
          } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes('offline') || msg.includes('network-request-failed')) {
              console.warn('SyncUser postponed: Client is offline. Profile will sync when reconnected.');
            } else {
              console.error('SyncUser Error:', msg);
              handleFirestoreError(err, OperationType.WRITE, 'users');
            }
          }
        };
        syncUser();

        // Listen for user data changes
        unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data() as User;
            // Auto-upgrade to admin if email matches
            if (userData.email === 'wasemwasemm4@gmail.com' && userData.role !== 'admin') {
              updateDoc(userDocRef, { role: 'admin' }).catch((err) => console.error("Admin upgrade error:", err instanceof Error ? err.message : String(err)));
            }
            setUser(userData);
          }
          setLoading(false);
        }, (err) => handleFirestoreError(err, OperationType.GET, 'users'));

        // Listen for plan investments
        const investmentsQuery = query(collection(db, 'planInvestments'), where('userId', '==', firebaseUser.uid));
        unsubInvestments = onSnapshot(investmentsQuery, (snapshot) => {
          const investments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PlanInvestment));
          setPlanInvestments(investments);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'planInvestments'));

        // Listen for trades
        const tradesQuery = query(collection(db, 'trades'), where('userId', '==', firebaseUser.uid));
        unsubTrades = onSnapshot(tradesQuery, (snapshot) => {
          const tradesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trade));
          setTrades(tradesList);
        }, (err) => handleFirestoreError(err, OperationType.LIST, 'trades'));

        // Listen for notifications
        const notificationsQuery = query(
          collection(db, 'notifications'), 
          where('userId', '==', firebaseUser.uid)
        );
        unsubNotifications = onSnapshot(notificationsQuery, (snapshot) => {
          const notificationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
          // Sort by timestamp descending
          notificationsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(notificationsList);
          setIsNotificationsLoading(false);
        }, (err) => {
          setIsNotificationsLoading(false);
          handleFirestoreError(err, OperationType.LIST, 'notifications');
        });

        // Listen for global settings
        unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
          if (docSnap.exists()) {
            setGlobalSettings(docSnap.data() as any);
          }
        }, (err) => handleFirestoreError(err, OperationType.GET, 'settings/global'));

        // --- Copy Trading Simulation ---
        const intervalId = setInterval(async () => {
          const q = query(
            collection(db, 'copyTrades'),
            where('followerId', '==', firebaseUser.uid),
            where('status', '==', 'active')
          );
          
          try {
            const snapshot = await getDocs(q);
            snapshot.forEach(async (tradeDoc) => {
              const data = tradeDoc.data();
              // Simulate small profit fluctuation (-0.02% to +0.08%) every 30s
              const changeRate = (Math.random() * 0.1 - 0.02) / 100;
              const profitChange = data.amount * changeRate;
              const newProfit = (data.currentProfit || 0) + profitChange;
              const newRoi = (newProfit / data.amount) * 100;

              await updateDoc(tradeDoc.ref, {
                currentProfit: newProfit,
                roi: newRoi
              });
            });
          } catch (error) {
            console.warn("Copy profit simulation skipped (likely offline or permission denied)");
          }
        }, 30000);

        // Store intervalId for cleanup if needed outside or handle it in specific cleanup logic
        // For simplicity with the existing structure, we can just clear it when another user logs in or on unmount
        (window as any).copyTradeInterval = intervalId;

      } else {
        setUser(null);
        setPlanInvestments([]);
        setTrades([]);
        setLoading(false);
        if ((window as any).copyTradeInterval) {
          clearInterval((window as any).copyTradeInterval);
        }
      }
    });

    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
      if (unsubInvestments) unsubInvestments();
      if (unsubTrades) unsubTrades();
      if (unsubSettings) unsubSettings();
      if ((window as any).copyTradeInterval) {
        clearInterval((window as any).copyTradeInterval);
      }
    };
  }, []);

  const subscribeToBot = async (bot: any, amount: number) => {
    if (!user) return;
    if (user.balance < amount) {
      showToast("رصيدك غير كافٍ للاشتراك في هذا الروبوت.", 'error');
      return;
    }

    setIsSubscribing(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + 30); // 30 days duration

      const newInvestment: Omit<PlanInvestment, 'id'> = {
        userId: user.uid,
        planId: bot.name, // Using bot name as ID for simplicity
        planName: `روبوت: ${bot.name}`,
        amount: amount,
        returnRate: 10, // 10% daily
        returnType: 'Daily',
        duration: '30 يومًا',
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalEarned: 0,
      };

      // Add investment
      await addDoc(collection(db, 'planInvestments'), newInvestment);

      // Deduct balance and add transaction
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      const transaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'withdrawal',
        amount: amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: `الاشتراك في روبوت: ${bot.name}`,
      };
      await addDoc(collection(db, 'transactions'), transaction);

      showToast("تم الاشتراك في الروبوت بنجاح!", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'planInvestments');
    } finally {
      setIsSubscribing(false);
    }
  };

  const subscribeToPlan = async (plan: any, amount: number) => {
    if (!user) return;
    if (user.balance < amount) {
      showToast("رصيدك غير كافٍ للاشتراك في هذه الخطة.", 'error');
      return;
    }

    setIsSubscribing(true);
    try {
      const startDate = new Date();
      const durationDays = parseInt(plan.duration);
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + durationDays);

      const newInvestment: Omit<PlanInvestment, 'id'> = {
        userId: user.uid,
        planId: plan.id,
        planName: plan.name,
        amount: amount,
        returnRate: plan.return,
        returnType: plan.returnType,
        duration: plan.duration,
        status: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalEarned: 0,
      };

      // Add investment
      await addDoc(collection(db, 'planInvestments'), newInvestment);

      // Deduct balance and add transaction
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        balance: increment(-amount)
      });

      const transaction: Omit<Transaction, 'id'> = {
        userId: user.uid,
        type: 'withdrawal', // Or a new type 'investment'
        amount: amount,
        status: 'completed',
        timestamp: new Date().toISOString(),
        details: `الاشتراك في خطة: ${plan.name}`,
      };
      await addDoc(collection(db, 'transactions'), transaction);

      showToast("تم الاشتراك في الخطة بنجاح!", 'success');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'planInvestments');
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => signOut(auth);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await getMarketAnalysis("Current trends in BTC and EUR/USD");
    setMarketAnalysis(analysis);
    setIsAnalyzing(false);
    textToSpeech("Market analysis completed. Check your dashboard for insights.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onLogin={handleLogin} />
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </>
    );
  }

  if (user.isBlocked) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-2xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">تم حظر الحساب</h1>
            <p className="text-zinc-400 text-sm leading-relaxed">
              عذراً، لقد تم حظر وصولك إلى المنصة من قبل الإدارة لمخالفتك شروط الاستخدام. 
              إذا كنت تعتقد أن هذا خطأ، يرجى التواصل مع الدعم الفني.
            </p>
          </div>
          <button
            onClick={() => signOut(auth)}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" /> تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={cn("min-h-screen font-sans bg-gray-900 text-gray-100", isDarkMode && "dark")}>
        {/* Navbar */}
        <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 h-16 sm:h-20 flex items-center px-4 sm:px-6">
          <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
            {/* Left: Logo & Mobile Menu Toggle */}
            <div className="flex items-center gap-3 sm:gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tight">Remedy</span>
                  <span className="block text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest -mt-1">Professional Trading</span>
                </div>
              </div>
            </div>

            {/* Middle: Search Bar (Desktop) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  placeholder="ابحث عن أصول، متداولين، أو أخبار..." 
                  className="w-full bg-gray-100 dark:bg-gray-800/50 border-none focus:ring-2 focus:ring-blue-500/50 rounded-2xl py-2.5 pl-10 pr-4 text-sm font-medium text-gray-900 dark:text-white transition-all"
                />
              </div>
            </div>

            {/* Right: Actions & User */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Balance Display (Desktop) */}
              <div className="hidden xl:flex flex-col items-end px-4 border-r border-gray-100 dark:border-gray-800">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">رصيدك الحالي</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">${user.balance.toLocaleString()}</span>
              </div>

              {/* Quick Actions */}
              <div className="relative">
                <button 
                  onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                  className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <AnimatePresence>
                  {quickActionsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 p-2"
                    >
                      <button onClick={() => { setActiveTab('wallet'); setQuickActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                        <PlusCircle className="w-4 h-4 text-emerald-500" /> إيداع الأموال
                      </button>
                      <button onClick={() => { setActiveTab('wallet'); setQuickActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                        <MinusCircle className="w-4 h-4 text-red-500" /> سحب الأموال
                      </button>
                      <button onClick={() => { setActiveTab('plans'); setQuickActionsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                        <Target className="w-4 h-4 text-blue-500" /> خطط الاستثمار
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-black text-white bg-red-500 rounded-full px-1 border-2 border-white dark:border-gray-900">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">الإشعارات</h3>
                          {notifications.filter(n => !n.read).length > 0 && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded-full">
                              {notifications.filter(n => !n.read).length}
                            </span>
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="flex gap-3">
                            {notifications.filter(n => !n.read).length > 0 && (
                              <button 
                                onClick={markAllAsRead}
                                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                تحديد الكل كمقروء
                              </button>
                            )}
                            <button 
                              onClick={clearAllNotifications}
                              className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:underline"
                            >
                              مسح الكل
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map(notification => (
                            <div 
                              key={notification.id} 
                              onClick={async () => {
                                if (!notification.read) {
                                  try {
                                    await updateDoc(doc(db, 'notifications', notification.id), { read: true });
                                  } catch (err) {
                                    console.error('Error marking notification as read:', err instanceof Error ? err.message : String(err));
                                  }
                                }
                              }}
                              className={cn(
                                "p-4 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer",
                                !notification.read && "bg-blue-50/50 dark:bg-blue-900/10"
                              )}
                            >
                              <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                  notification.type === 'success' ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" :
                                  notification.type === 'error' ? "bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400" :
                                  notification.type === 'warning' ? "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400" :
                                  "bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                )}>
                                  {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                   notification.type === 'error' ? <AlertCircle className="w-4 h-4" /> :
                                   notification.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> :
                                   <Info className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{notification.title}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">{notification.message}</p>
                                  <p className="text-[9px] text-gray-400 mt-2 font-bold uppercase tracking-tighter">
                                    {new Date(notification.timestamp).toLocaleString('ar-EG', { 
                                      hour: 'numeric', 
                                      minute: 'numeric', 
                                      hour12: true,
                                      day: 'numeric',
                                      month: 'short'
                                    })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-gray-500 font-bold">لا توجد إشعارات حالياً</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark Mode Toggle */}
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 sm:p-2.5 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                {isDarkMode ? <Sun className="w-5 h-5 sm:w-6 sm:h-6" /> : <Moon className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>

              {/* User Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 sm:gap-3 p-1 sm:p-1.5 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-blue-500 transition-all"
                >
                  <img 
                    src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl shadow-sm" 
                    alt="Profile" 
                  />
                  <div className="hidden sm:block text-right">
                    <div className="text-xs font-black text-gray-900 dark:text-white truncate max-w-[100px] flex items-center justify-end gap-1">
                      {user.displayName}
                      {user.kycStatus === 'approved' && (
                        <span title="حساب موثق">
                          <ShieldCheck className="w-3 h-3 text-blue-500" />
                        </span>
                      )}
                    </div>
                    <div className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter">{user.role}</div>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", profileOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {profileOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-10 h-10 rounded-xl" alt="User" />
                          <div>
                            <div className="text-sm font-black text-gray-900 dark:text-white flex items-center gap-1">
                              {user.displayName}
                              {user.kycStatus === 'approved' && (
                                <span title="حساب موثق">
                                  <ShieldCheck className="w-4 h-4 text-blue-500" />
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">${user.balance.toLocaleString()}</div>
                              <div className="text-[10px] font-black text-amber-600 dark:text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 fill-amber-500" />
                                {user.points || 0}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button onClick={() => { setActiveTab('settings'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                          <UserCircle className="w-4 h-4" /> إعدادات الملف الشخصي
                        </button>
                        <button onClick={() => { setActiveTab('kyc'); setProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                          <ShieldCheck className="w-4 h-4" /> التحقق من الهوية
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-800 my-2 mx-2"></div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                          <LogOut className="w-4 h-4" /> تسجيل الخروج
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex min-h-screen bg-gray-900">
          {/* Sidebar */}
          <aside className={cn(
            "fixed z-50 md:z-40 top-0 left-0 w-72 h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl transform transition-transform duration-300 ease-in-out md:translate-x-0 overflow-y-auto border-r border-gray-100 dark:border-gray-800 pt-16 sm:pt-20 no-scrollbar",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            {/* Mobile Sidebar Header */}
            <div className="md:hidden p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-gray-900 dark:text-white">Remedy</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Profile Section */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-transparent to-gray-50/30 dark:to-gray-800/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="relative w-14 h-14 rounded-2xl shadow-md border-2 border-white dark:border-gray-800" alt="User" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-gray-900 rounded-full shadow-sm"></div>
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 dark:text-white truncate max-w-[140px] flex items-center gap-1">
                    {user.displayName}
                    {user.kycStatus === 'approved' && (
                      <span title="حساب موثق">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-0.5">مستوى المتداول: برونزي</div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest">{user.points || 0} نقطة مكافأة</span>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800/50 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">رصيد الحساب</div>
                <div className="text-xl font-black text-gray-900 dark:text-white tabular-nums">${user.balance.toLocaleString()}</div>
              </div>
            </div>

            {/* Live Market Marquee */}
            <div className="bg-gray-50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800 py-3 overflow-hidden group cursor-pointer">
              <div className="flex items-center gap-2 px-4 mb-2">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">أسعار السوق المباشرة</span>
              </div>
              <motion.div 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="flex items-center gap-8 whitespace-nowrap px-4"
              >
                {[
                  { s: 'BTC', p: btcPrice }, { s: 'ETH', p: ethPrice }, 
                  { s: 'EURUSD', p: 1.0842 }, { s: 'XAU', p: 2165.40 },
                  { s: 'BTC', p: btcPrice }, { s: 'ETH', p: ethPrice }, 
                  { s: 'EURUSD', p: 1.0842 }, { s: 'XAU', p: 2165.40 }
                ].map((m, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{m.s}</span>
                    <span className="text-[10px] font-black text-emerald-500">${m.p?.toLocaleString()}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            <nav className="p-4 space-y-6 text-sm pb-20">
              <NavSection title="ملخص" icon={Layout}>
                <SidebarItem icon={DashboardIcon} label="لوحة التحكم" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <SidebarItem icon={Receipt} label="كشف الحساب" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
              </NavSection>

              <NavSection title="المحفظة والاستثمارات" icon={Briefcase}>
                <SidebarItem icon={Target} label="خطط استثمارية" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
                <SidebarItem icon={PieChart} label="ملف أعمالي" active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
                <SidebarItem icon={Activity} label="تاريخ الأداء" active={activeTab === 'performance'} onClick={() => setActiveTab('performance')} />
              </NavSection>

              <NavSection title="التداول والأسواق" icon={TrendingUp}>
                <SidebarItem icon={CandlestickChart} label="الأسواق الحية" active={activeTab === 'markets'} onClick={() => setActiveTab('markets')} badge="يعيش" badgeColor="bg-green-500" />
                <SidebarItem icon={Users2} label="نسخ التداول" active={activeTab === 'copy'} onClick={() => setActiveTab('copy')} badge="محترف" badgeColor="bg-purple-600" />
                <SidebarItem icon={BotIcon} label="روبوتات التداول" active={activeTab === 'bots'} onClick={() => setActiveTab('bots')} badge="الذكاء الاصطناعي" badgeColor="bg-blue-600" />
              </NavSection>

              <NavSection title="إشارات التداول" icon={Radio}>
                <SidebarItem icon={Activity} label="إشارات مميزة" active={activeTab === 'signals'} onClick={() => setActiveTab('signals')} badge="جديد" badgeColor="bg-blue-500" />
              </NavSection>

              <NavSection title="المحفظة والأموال" icon={Wallet}>
                <SidebarItem 
                  icon={PlusCircle} 
                  label="إيداع الأموال" 
                  active={activeTab === 'deposit'} 
                  onClick={() => {
                    if (user.kycStatus !== 'approved') {
                      showToast("يجب توثيق الهوية أولاً", "error");
                      setActiveTab('kyc');
                      return;
                    }
                    setActiveTab('deposit');
                  }} 
                />
                <SidebarItem icon={MinusCircle} label="سحب الأموال" active={activeTab === 'withdraw'} onClick={() => setActiveTab('withdraw')} />
                <SidebarItem icon={ArrowLeftRight} label="نقل داخلي" active={activeTab === 'transfer'} onClick={() => setActiveTab('transfer')} />
              </NavSection>

              <NavSection title="الائتمان والتمويل" icon={CreditCard}>
                <SidebarItem icon={FilePlus} label="تقدم بطلب قرض" active={activeTab === 'loan'} badge="سريع" badgeColor="bg-green-600" onClick={() => setActiveTab('loan')} />
                <SidebarItem icon={FileText} label="التاريخ الائتماني" active={activeTab === 'credit-history'} onClick={() => setActiveTab('credit-history')} />
              </NavSection>

              <NavSection title="إدارة الحسابات" icon={UserCircle}>
                <SidebarItem icon={UserCircle} label="إعدادات الملف" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                <SidebarItem icon={ShieldAlert} label="التحقق من الهوية" active={activeTab === 'kyc'} onClick={() => setActiveTab('kyc')} />
                {user.role === 'admin' && (
                  <SidebarItem 
                    icon={Settings} 
                    label="لوحة الإدارة" 
                    active={false} 
                    onClick={() => { window.open('/admin.html', '_blank'); setIsSidebarOpen(false); }} 
                    badge="ADMIN"
                    badgeColor="bg-purple-500"
                  />
                )}
              </NavSection>

              <NavSection title="النمو والمكافآت" icon={TrendingUp}>
                <SidebarItem icon={Users} label="برنامج الإحالة" active={activeTab === 'referral'} badge="5%" badgeColor="bg-emerald-600" onClick={() => setActiveTab('referral')} />
              </NavSection>

              <NavSection title="الدعم والمساعدة" icon={HelpCircle}>
                <SidebarItem icon={Headphones} label="مركز الدعم" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
              </NavSection>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 ml-0 md:ml-72 p-4 pb-24 md:pb-8 overflow-x-hidden pt-20 sm:pt-24">
            <div className="max-w-6xl mx-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  <DashboardView 
                    key="dashboard" 
                    user={user} 
                    setActiveTab={setActiveTab} 
                    trades={trades} 
                    showToast={showToast}
                    botProfit={planInvestments
                      .filter(inv => inv.planName?.includes('روبوت'))
                      .reduce((sum, inv) => sum + (inv.totalEarned || 0), 0)
                    }
                  />
                )}
                {activeTab === 'history' && <AccountHistoryView key="history" />}
                {(activeTab === 'wallet' || activeTab === 'deposit' || activeTab === 'withdraw') && <WalletView key="wallet" user={user} activeTab={activeTab} showToast={showToast} />}
                {activeTab === 'kyc' && <KYCView key="kyc" user={user} showToast={showToast} />}
                {activeTab === 'bots' && <BotsView key="bots" onSubscribe={subscribeToBot} isSubscribing={isSubscribing} />}
                {activeTab === 'plans' && <PlansView key="plans" onSubscribe={subscribeToPlan} isSubscribing={isSubscribing} />}
                {activeTab === 'portfolio' && <MyPortfolioView key="portfolio" investments={planInvestments} />}
                {activeTab === 'performance' && <PerformanceHistoryView key="performance" trades={trades} globalSettings={globalSettings} />}
                {activeTab === 'markets' && <MarketsView key="markets" setActiveTab={setActiveTab} />}
                {activeTab === 'copy' && <CopyTradingView key="copy" setActiveTab={setActiveTab} user={user} />}
                {activeTab === 'copy-experts' && <CopyExpertsView key="copy-experts" setActiveTab={setActiveTab} user={user} showToast={showToast} />}
                {activeTab === 'settings' && <SettingsView key="settings" user={user} showToast={showToast} />}
                {activeTab === 'signals' && <FeaturedSignalsView key="signals" showToast={showToast} />}
                {activeTab === 'referral' && <ReferralView key="referral" user={user} />}
                {activeTab === 'support' && <SupportView key="support" user={user} showToast={showToast} />}
                {activeTab === 'ai-trading' && <AITradingDashboard key="ai-trading" user={user} showToast={showToast} initialBot={selectedAIBot} />}
                
                {/* Fallback for other tabs */}
                {!['dashboard', 'history', 'wallet', 'deposit', 'withdraw', 'kyc', 'bots', 'plans', 'portfolio', 'performance', 'markets', 'copy', 'copy-experts', 'settings', 'signals', 'referral', 'support', 'ai-trading'].includes(activeTab) && (
                  <ComingSoonView key="coming-soon" title={
                    activeTab === 'transfer' ? 'نقل داخلي' :
                    activeTab === 'loan' ? 'تقدم بطلب قرض' :
                    activeTab === 'credit-history' ? 'التاريخ الائتماني' :
                    activeTab === 'verify' ? 'التحقق من الهوية' : 'قريباً'
                  } />
                )}
              </AnimatePresence>
            </div>
          </main>
        </div>

        {/* Modern Mobile Navigation */}
        <div className="fixed bottom-0 w-full z-50 md:hidden">
          <div className="flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg px-6 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-gray-200/20 dark:border-gray-700/20">
            <button onClick={() => setActiveTab('dashboard')} className={cn("flex flex-col items-center gap-1", activeTab === 'dashboard' ? "text-blue-600" : "text-gray-500")}>
              <Home className="w-6 h-6" />
              <span className="text-[10px] font-bold">بيت</span>
            </button>
            <button 
              onClick={() => {
                if (user.kycStatus !== 'approved') {
                  showToast("يجب توثيق الهوية أولاً قبل الإيداع", "error");
                  setActiveTab('kyc');
                  return;
                }
                setActiveTab('deposit');
              }} 
              className={cn("flex flex-col items-center gap-1", activeTab === 'deposit' ? "text-blue-600" : "text-gray-500")}
            >
              <Banknote className="w-6 h-6" />
              <span className="text-[10px] font-bold">إيداع</span>
            </button>
            
            {/* FAB */}
            <button 
              onClick={() => setFabOpen(!fabOpen)}
              className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-gray-900 transition-transform active:scale-90"
            >
              <Zap className="w-8 h-8" />
              <span className="absolute w-full h-full rounded-full bg-blue-500 animate-ping opacity-20"></span>
            </button>

            <button onClick={() => setActiveTab('settings')} className={cn("flex flex-col items-center gap-1", activeTab === 'settings' ? "text-blue-600" : "text-gray-500")}>
              <UserCircle className="w-6 h-6" />
              <span className="text-[10px] font-bold">حساب</span>
            </button>
            <button onClick={() => setActiveTab('support')} className={cn("flex flex-col items-center gap-1", activeTab === 'support' ? "text-blue-600" : "text-gray-500")}>
              <LifeBuoy className="w-6 h-6" />
              <span className="text-[10px] font-bold">الدعم</span>
            </button>
          </div>

          {/* FAB Menu */}
          <AnimatePresence>
            {fabOpen && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 w-72 bg-gray-900 border border-gray-700 rounded-[2rem] p-6 shadow-2xl z-50 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { setActiveTab('plans'); setFabOpen(false); }} className="flex flex-col items-center p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:bg-gray-700 transition-all">
                    <TrendingUp className="w-6 h-6 text-blue-400 mb-2" />
                    <span className="text-xs font-bold">يستثمر</span>
                  </button>
                  <button onClick={() => { setActiveTab('withdraw'); setFabOpen(false); }} className="flex flex-col items-center p-4 bg-gray-800 rounded-2xl border border-gray-700 hover:bg-gray-700 transition-all">
                    <Wallet className="w-6 h-6 text-green-400 mb-2" />
                    <span className="text-xs font-bold">ينسحب</span>
                  </button>
                </div>
                <div className="space-y-2">
                  <button onClick={() => { setActiveTab('copy'); setFabOpen(false); }} className="w-full flex items-center gap-3 p-3 text-gray-200 hover:bg-gray-800 rounded-xl transition-all">
                    <Copy className="w-5 h-5 text-blue-400" /> <span className="text-sm font-bold">نسخ التداول</span>
                  </button>
                  <button onClick={() => { setActiveTab('bots'); setFabOpen(false); }} className="w-full flex items-center gap-3 p-3 text-gray-200 hover:bg-gray-800 rounded-xl transition-all">
                    <BotIcon className="w-5 h-5 text-purple-400" /> <span className="text-sm font-bold">روبوتات التداول</span>
                  </button>
                  <button onClick={() => { setActiveTab('referral'); setFabOpen(false); }} className="w-full flex items-center gap-3 p-3 text-gray-200 hover:bg-gray-800 rounded-xl transition-all">
                    <Users className="w-5 h-5 text-orange-400" /> <span className="text-sm font-bold">برنامج الإحالة</span>
                  </button>
                </div>
                <button onClick={() => setFabOpen(false)} className="absolute top-4 right-4 text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rexconal AI Floating Button */}
          <button
            onClick={() => {
              setSelectedAIBot('rexconal');
              setActiveTab('ai-trading');
            }}
            className={cn(
              "fixed bottom-[230px] sm:bottom-24 right-6 sm:right-auto sm:left-6 z-[60] p-0.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group",
              user.aiTrialExpires ? "bg-gradient-to-r from-blue-600 to-indigo-600" : "bg-gradient-to-r from-orange-500 to-amber-500"
            )}
          >
            <div className="bg-[#1a1c2e] rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", user.aiTrialExpires ? "bg-emerald-500 animate-pulse" : "bg-orange-500")} />
              <span className="text-white text-[10px] sm:text-sm font-black whitespace-nowrap">
                {user.aiTrialExpires ? "Rexconal AI ⚡" : "تجربة Rexconal 🎁"}
              </span>
              <Sparkles className={cn("w-4 h-4 group-hover:rotate-12 transition-transform", user.aiTrialExpires ? "text-blue-400" : "text-orange-400")} />
            </div>
          </button>

          {/* Aegis AI Floating Button */}
          <button
            onClick={() => {
              setSelectedAIBot('aegis');
              setActiveTab('ai-trading');
            }}
            className={cn(
              "fixed bottom-[170px] sm:bottom-24 right-6 z-[60] p-0.5 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group",
              user.aegisTrialExpires ? "bg-gradient-to-r from-emerald-600 to-teal-600" : "bg-gradient-to-r from-blue-500 to-cyan-500"
            )}
          >
            <div className="bg-[#1a1c2e] rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 border border-white/5">
              <div className={cn("w-2 h-2 rounded-full", user.aegisTrialExpires ? "bg-emerald-500 animate-pulse" : "bg-blue-400")} />
              <span className="text-white text-[10px] sm:text-sm font-black whitespace-nowrap">
                {user.aegisTrialExpires ? "🛡️ Aegis AI نشط" : "🛡️ Aegis AI مجاني"}
              </span>
              <ShieldCheck className={cn("w-4 h-4 group-hover:scale-110 transition-transform", user.aegisTrialExpires ? "text-emerald-400" : "text-blue-400")} />
            </div>
          </button>

          {/* Toast Notification */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 50, x: '-50%' }}
                animate={{ opacity: 1, y: 0, x: '-50%' }}
                exit={{ opacity: 0, y: 20, x: '-50%' }}
                className={cn(
                  "fixed bottom-24 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold text-sm min-w-[300px]",
                  toast.type === 'success' ? "bg-emerald-500 text-white" : 
                  toast.type === 'error' ? "bg-red-500 text-white" : 
                  "bg-blue-500 text-white"
                )}
              >
                {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : 
                 toast.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
                 <Info className="w-5 h-5" />}
                {toast.message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </ErrorBoundary>
  );
}
