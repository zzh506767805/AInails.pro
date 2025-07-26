import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

// 支付验证响应类型
interface VerifyResponse {
  success: boolean;
  amount?: number;
  currency?: string;
  customerEmail?: string;
  error?: string;
}

// 支付状态Hook的状态类型
interface PaymentStatusState {
  loading: boolean;
  error: string | null;
  status: VerifyResponse | null;
}

// 支付状态Hook的返回类型
interface UsePaymentStatusReturn {
  loading: boolean;
  error: string | null;
  status: VerifyResponse | null;
  
  // 方法
  verifyPayment: (sessionId: string) => Promise<void>;
  resetStatus: () => void;
  
  // 便捷属性
  isPaymentSuccessful: boolean;
  paymentAmount: number | null;
  paymentCurrency: string | null;
  customerEmail: string | null;
}

// 配置选项
interface PaymentStatusOptions {
  autoVerify?: boolean;
  sessionIdFromUrl?: boolean;
  onSuccess?: (status: VerifyResponse) => void;
  onError?: (error: string) => void;
}

export function usePaymentStatus(options: PaymentStatusOptions = {}) {
  const { 
    autoVerify = true, 
    sessionIdFromUrl = true,
    onSuccess,
    onError
  } = options;

  const router = useRouter();
  const [state, setState] = useState<PaymentStatusState>({
    loading: false,
    error: null,
    status: null,
  });

  // 重置状态
  const resetStatus = useCallback(() => {
    setState({
      loading: false,
      error: null,
      status: null,
    });
  }, []);

  // 验证支付状态
  const verifyPayment = useCallback(async (sessionId: string) => {
    if (!sessionId) {
      const error = 'Session ID is required';
      setState(prev => ({ ...prev, loading: false, error }));
      if (onError) onError(error);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('Verifying payment status for session:', sessionId);
      
      const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }

      const data: VerifyResponse = await response.json();
      console.log('Payment verification result:', data);

      setState(prev => ({
        ...prev,
        loading: false,
        status: data,
      }));

      // 调用成功回调
      if (data.success && onSuccess) {
        onSuccess(data);
      }

    } catch (error) {
      console.error('Payment verification error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));

      if (onError) onError(errorMessage);
    }
  }, [onSuccess, onError]);

  // 自动验证支付状态
  useEffect(() => {
    if (autoVerify && sessionIdFromUrl) {
      const { session_id } = router.query;
      if (session_id && typeof session_id === 'string') {
        verifyPayment(session_id);
      }
    }
  }, [router.query, autoVerify, sessionIdFromUrl, verifyPayment]);

  // 计算便捷属性
  const isPaymentSuccessful = state.status?.success || false;
  const paymentAmount = state.status?.amount || null;
  const paymentCurrency = state.status?.currency || null;
  const customerEmail = state.status?.customerEmail || null;

  return {
    // 状态
    loading: state.loading,
    error: state.error,
    status: state.status,
    
    // 方法
    verifyPayment,
    resetStatus,
    
    // 便捷属性
    isPaymentSuccessful,
    paymentAmount,
    paymentCurrency,
    customerEmail,
  };
}

// 专用于成功页面的Hook
export function usePaymentSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);
  const [redirecting, setRedirecting] = useState(false);
  
  const paymentStatus = usePaymentStatus({
    autoVerify: true,
    sessionIdFromUrl: true,
    onSuccess: (status) => {
      console.log('Payment successfully verified on success page:', status);
    },
    onError: (error) => {
      console.error('Payment verification failed on success page:', error);
    }
  });

  // 自动跳转功能
  const startCountdown = useCallback((seconds: number, redirectUrl: string) => {
    if (seconds <= 0) return;
    
    setCountdown(seconds);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRedirecting(true);
          router.push(redirectUrl);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  // 手动跳转
  const redirectTo = useCallback((url: string) => {
    setRedirecting(true);
    router.push(url);
  }, [router]);

  return {
    ...paymentStatus,
    
    // 跳转相关
    countdown,
    redirecting,
    startCountdown,
    redirectTo,
  };
}

// 专用于订阅状态的Hook
export function useSubscriptionStatus(subscriptionId?: string) {
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionInfo = useCallback(async (subId: string) => {
    setLoading(true);
    setError(null);

    try {
      // 这里需要实现获取订阅信息的API
      // const response = await fetch(`/api/subscription/${subId}`);
      // const data = await response.json();
      // setSubscriptionInfo(data);
      
      console.log('Fetching subscription info for:', subId);
      // 暂时返回模拟数据
      setSubscriptionInfo({
        id: subId,
        status: 'active',
        current_period_start: Date.now(),
        current_period_end: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天后
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch subscription info';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subscriptionId) {
      fetchSubscriptionInfo(subscriptionId);
    }
  }, [subscriptionId, fetchSubscriptionInfo]);

  return {
    subscriptionInfo,
    loading,
    error,
    fetchSubscriptionInfo,
  };
}

// 导出类型
export type { 
  PaymentStatusState, 
  UsePaymentStatusReturn, 
  PaymentStatusOptions 
}; 