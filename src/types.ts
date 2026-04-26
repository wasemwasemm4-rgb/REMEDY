export interface User {
  uid: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  role: 'user' | 'admin';
  balance: number;
  profit: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'none';
  referralCode?: string | null;
  referredBy?: string | null;
  createdAt: string;
  lastLogin?: string | null;
  phone?: string | null;
  country?: string | null;
  isBlocked?: boolean;
  aiTrialExpires?: string | null;
  aegisTrialExpires?: string | null;
  onboardingCompleted?: boolean;
  points?: number;
  demoBalance?: number;
  isAccountReal?: boolean;
}

export interface Bot {
  id: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'commodity';
  strategy?: string;
  profitRate: number;
  riskLevel: 'low' | 'medium' | 'high';
  minInvestment: number;
  description?: string;
}

export interface Investment {
  id: string;
  userId: string;
  botId: string;
  amount: number;
  status: 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  totalRoi?: number;
  currentProfit?: number;
}

export interface PlanInvestment {
  id: string;
  userId: string;
  planId: string | number;
  planName: string;
  amount: number;
  returnRate: number;
  returnType: string;
  duration: string;
  status: 'active' | 'completed' | 'expired';
  startDate: string;
  endDate: string;
  totalEarned: number;
  userEmail?: string;
  tradesPerDay?: number;
  totalTrades?: number;
  lastPayoutDate?: string;
  isDemo?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'profit' | 'referral';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method?: string;
  timestamp: string;
  details?: string;
}

export interface Trader {
  id: string;
  name: string;
  performance: number;
  followersCount: number;
  assetFocus: string;
  photoURL?: string;
  description?: string;
}

export interface CopyTrade {
  id: string;
  followerId: string;
  traderId: string;
  amount: number;
  status: 'active' | 'paused' | 'stopped';
  startDate: string;
  isDemo?: boolean;
}

export interface Trade {
  id: string;
  userId: string;
  asset: string;
  type: 'Buy' | 'Sell';
  amount: number;
  lotSize: number;
  entryPrice: number;
  exitPrice?: number;
  leverage?: string;
  stopLoss?: number;
  status: 'WIN' | 'LOSE' | 'PENDING';
  duration?: string;
  profit: number;
  commission?: number;
  closedAt?: string;
  timestamp: string;
  isDemo?: boolean;
}

export interface KYCRequest {
  id: string;
  userId: string;
  userEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  state: string;
  country: string;
  documentType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
}
