import { Purchases, LogLevel } from '@revenuecat/purchases-js';

// Initialize RevenueCat
export const initializeRevenueCat = (userId?: string) => {
  try {
    // Replace with your actual RevenueCat public API key from the dashboard
    const apiKey = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY || 'YOUR_REVENUECAT_WEB_API_KEY';

    // Debug logging (without exposing the key)
    console.log('API Key present:', !!apiKey && apiKey !== 'YOUR_REVENUECAT_WEB_API_KEY');
    console.log('API Key starts with strp_:', apiKey?.startsWith('strp_'));

    if (!apiKey || apiKey === 'YOUR_REVENUECAT_WEB_API_KEY') {
      console.error('RevenueCat API key is missing or not configured');
      return false;
    }

    Purchases.setLogLevel(LogLevel.Debug);

    // Configure with your API key
    const config: any = { apiKey };
    if (userId) {
      config.appUserId = userId;
    }
    Purchases.configure(config);

    console.log('RevenueCat initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    return false;
  }
};

// Get available offerings (subscription plans)
export const getOfferings = async (): Promise<any | null> => {
  try {
    const offerings = await Purchases.getSharedInstance().getOfferings();

    if (offerings.current !== null) {
      return offerings.current;
    }

    console.warn('No current offering available');
    return null;
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return null;
  }
};

// Purchase a package
export const purchasePackage = async (pkg: any) => {
  try {
    const result: any = await Purchases.getSharedInstance().purchase(pkg);
    const customerInfo = result.customerInfo;

    // Check if user now has active subscription
    if (customerInfo.entitlements.active['team_license']) {
      console.log('Purchase successful! User has active team license');
      return {
        success: true,
        customerInfo,
      };
    }

    return {
      success: false,
      error: 'Purchase completed but entitlement not active',
    };
  } catch (error: any) {
    console.error('Purchase failed:', error);

    // Handle user cancellation
    if (error.userCancelled) {
      return {
        success: false,
        error: 'Purchase cancelled by user',
        cancelled: true,
      };
    }

    return {
      success: false,
      error: error.message || 'Purchase failed',
    };
  }
};

// Get customer info
export const getCustomerInfo = async () => {
  try {
    const customerInfo: any = await Purchases.getSharedInstance().getCustomerInfo();
    return {
      success: true,
      customerInfo,
    };
  } catch (error: any) {
    console.error('Failed to get customer info:', error);
    return {
      success: false,
      error: error.message || 'Failed to get customer info',
    };
  }
};

// Additional functions can be implemented as needed:
// - restorePurchases()
// - identifyUser()
// - logoutUser()
// Refer to RevenueCat documentation for latest API methods

// Type definitions for team license packages
export interface TeamLicensePackage {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  rcPackage?: any; // RevenueCat package object
}

// Map your plan IDs to RevenueCat package identifiers
export const TEAM_PLANS = {
  BASIC: 'team-basic',
  PRO: 'team-pro',
  ELITE: 'team-elite',
} as const;
