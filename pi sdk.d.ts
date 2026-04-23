// Pi Network SDK Type Def
declare global {
    interface Window {
      Pi: PiSDK;
    }
  }
  
  export interface PiSDK {
    init(config: { version: string }): void;
    authenticate(
      scopes: string[],
      onIncompletePaymentFound?: (payment: PiPayment) => void
    ): Promise<PiAuthResult>;
    createPayment(
      paymentData: PiPaymentRequest,
      callbacks: PiPaymentCallbacks
    ): void;
    nativeFeaturesList(): Promise<string[]>;
    Ads: PiAdsSDK;
  }
  
  export interface PiAdsSDK {
    showAd(adType: 'interstitial' | 'rewarded' | 'banner'): Promise<PiAdShowResponse>;
    requestAd(adType: 'interstitial' | 'rewarded' | 'banner'): Promise<PiAdRequestResponse>;
    isAdReady(adType: 'interstitial' | 'rewarded' | 'banner'): Promise<PiAdReadyResponse>;
  }
  
  export interface PiAdShowResponse {
    result: 'AD_CLOSED' | 'AD_REWARDED' | 'AD_FAILED' | 'ADS_NOT_SUPPORTED';
    adId?: string; // Only present for rewarded ads
  }
  
  export interface PiAdRequestResponse {
    result: 'AD_LOADED' | 'AD_FAILED' | 'ADS_NOT_SUPPORTED';
  }
  
  export interface PiAdReadyResponse {
    ready: boolean;
  }
  
  export interface PiAuthResult {
    accessToken: string;
    user: PiUser;
  }
  
  export interface PiUser {
    uid: string;
    username: string;
  }
  
  export interface PiPayment {
    identifier: string;
    user_uid: string;
    amount: number;
    memo: string;
    metadata: Record<string, any>;
    from_address: string;
    to_address: string;
    direction: string;
    created_at: string;
    network: string;
    status: {
      developer_approved: boolean;
      transaction_verified: boolean;
      developer_completed: boolean;
      cancelled: boolean;
      user_cancelled: boolean;
    };
    transaction?: {
      txid: string;
      verified: boolean;
      _link: string;
    };
  }
  
  export interface PiPaymentRequest {
    amount: number;
    memo: string;
    metadata?: Record<string, any>;
  }
  
  export interface PiPaymentCallbacks {
    onReadyForServerApproval: (paymentId: string) => void;
    onReadyForServerCompletion: (paymentId: string, txid: string) => void;
    onCancel: (paymentId: string) => void;
    onError: (error: Error, payment?: PiPayment) => void;
  }
  
  export interface PiAdConfig {
    adUnitId: string;
    testMode?: boolean;
    onAdLoaded?: () => void;
    onAdFailedToLoad?: (error: Error) => void;
    onAdOpened?: () => void;
    onAdClosed?: () => void;
  }
  
  export {}; 