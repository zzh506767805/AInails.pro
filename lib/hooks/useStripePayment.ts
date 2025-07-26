import { useState, useCallback } from 'react';

// 支付配置接口
interface PaymentConfig {
  amount: number;
  currency?: string;
  productName: string;
  productDescription?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  mode: 'payment' | 'subscription';
  priceId?: string;
}

// 支付Hook的状态类型
interface PaymentState {
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  paymentUrl: string | null;
}

// 支付Hook的返回类型
interface UseStripePaymentReturn {
  // 状态
  loading: boolean;
  error: string | null;
  sessionId: string | null;
  paymentUrl: string | null;
  
  // 方法
  createPayment: (config: PaymentConfig) => Promise<void>;
  createSubscription: (config: SubscriptionConfig) => Promise<void>;
  resetState: () => void;
  
  // 便捷方法
  createOneTimePayment: (amount: number, productName: string, options?: OneTimePaymentOptions) => Promise<void>;
}

// 订阅配置接口
interface SubscriptionConfig {
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
  customerEmail?: string;
}

// 一次性支付选项
interface OneTimePaymentOptions {
  currency?: string;
  productDescription?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

// 默认配置
const defaultOptions = {
  currency: 'usd',
  successUrl: '/success',
  cancelUrl: '/cancel',
};

export function useStripePayment(): UseStripePaymentReturn {
  const [state, setState] = useState<PaymentState>({
    loading: false,
    error: null,
    sessionId: null,
    paymentUrl: null,
  });

  // 重置状态
  const resetState = useCallback(() => {
    setState({
      loading: false,
      error: null,
      sessionId: null,
      paymentUrl: null,
    });
  }, []);

  // 创建支付会话
  const createPayment = useCallback(async (config: PaymentConfig) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('Creating payment session with config:', config);
      
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment session');
      }

      const data = await response.json();
      console.log('Payment session created:', data);

      setState(prev => ({
        ...prev,
        loading: false,
        sessionId: data.sessionId,
        paymentUrl: data.url,
      }));

      // 自动跳转到支付页面
      if (data.url) {
        window.location.href = data.url;
      }

    } catch (error) {
      console.error('Payment creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
    }
  }, []);

  // 创建订阅
  const createSubscription = useCallback(async (config: SubscriptionConfig) => {
    const paymentConfig: PaymentConfig = {
      mode: 'subscription',
      priceId: config.priceId,
      productName: 'Subscription',
      successUrl: config.successUrl || defaultOptions.successUrl,
      cancelUrl: config.cancelUrl || defaultOptions.cancelUrl,
      metadata: config.metadata,
      amount: 0, // 订阅模式不需要金额
      currency: 'usd', // 订阅模式不需要货币，但API需要
    };

    await createPayment(paymentConfig);
  }, [createPayment]);

  // 创建一次性支付的便捷方法
  const createOneTimePayment = useCallback(async (
    amount: number,
    productName: string,
    options: OneTimePaymentOptions = {}
  ) => {
    const config: PaymentConfig = {
      amount,
      currency: options.currency || defaultOptions.currency,
      productName,
      productDescription: options.productDescription,
      successUrl: options.successUrl || defaultOptions.successUrl,
      cancelUrl: options.cancelUrl || defaultOptions.cancelUrl,
      metadata: options.metadata,
      mode: 'payment',
    };

    await createPayment(config);
  }, [createPayment]);

  return {
    // 状态
    loading: state.loading,
    error: state.error,
    sessionId: state.sessionId,
    paymentUrl: state.paymentUrl,
    
    // 方法
    createPayment,
    createSubscription,
    resetState,
    createOneTimePayment,
  };
}

// 预设支付配置的便捷Hook
export function useQuickPayment() {
  const { createOneTimePayment, ...rest } = useStripePayment();

  // 预设金额的快捷支付方法
  const paymentMethods = {
    // 小额支付
    paySmall: (productName: string, options?: OneTimePaymentOptions) => 
      createOneTimePayment(100, productName, options), // $1.00
    
    // 中等金额支付
    payMedium: (productName: string, options?: OneTimePaymentOptions) => 
      createOneTimePayment(999, productName, options), // $9.99
    
    // 大额支付
    payLarge: (productName: string, options?: OneTimePaymentOptions) => 
      createOneTimePayment(2999, productName, options), // $29.99
    
    // 自定义金额支付
    payCustom: createOneTimePayment,
  };

  return {
    ...rest,
    ...paymentMethods,
  };
}

// 导出类型
export type { 
  PaymentState, 
  UseStripePaymentReturn, 
  SubscriptionConfig, 
  OneTimePaymentOptions 
}; 