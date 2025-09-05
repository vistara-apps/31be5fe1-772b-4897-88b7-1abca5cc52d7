// Turnkey wallet integration for seamless Web3 interactions
import { createWalletClient, custom, parseEther, formatEther } from 'viem';
import { base } from 'viem/chains';

export interface TurnkeyWallet {
  address: string;
  publicKey: string;
  walletId: string;
}

export interface PaymentRequest {
  to: string;
  amount: string;
  currency: 'ETH' | 'USDC';
  description?: string;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  effectiveGasPrice?: string;
}

class TurnkeyService {
  private apiKey: string;
  private baseUrl = 'https://api.turnkey.com';
  private walletClient: any;
  private currentWallet: TurnkeyWallet | null = null;

  constructor() {
    this.apiKey = process.env.TURNKEY_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Turnkey API key not found. Wallet functionality will be limited.');
    }
  }

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async createWallet(userId: string): Promise<TurnkeyWallet> {
    if (!this.apiKey) {
      throw new Error('Turnkey API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/v1/submit/create_wallet`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'ACTIVITY_TYPE_CREATE_WALLET',
          organizationId: process.env.TURNKEY_ORGANIZATION_ID,
          parameters: {
            walletName: `remixrite-${userId}`,
            accounts: [{
              curve: 'CURVE_SECP256K1',
              pathFormat: 'PATH_FORMAT_BIP32',
              path: "m/44'/60'/0'/0/0",
              addressFormat: 'ADDRESS_FORMAT_ETHEREUM'
            }]
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`);
      }

      const result = await response.json();
      const wallet: TurnkeyWallet = {
        address: result.activity.result.addresses[0],
        publicKey: result.activity.result.publicKeys[0],
        walletId: result.activity.result.walletId
      };

      this.currentWallet = wallet;
      return wallet;
    } catch (error) {
      console.error('Error creating Turnkey wallet:', error);
      throw error;
    }
  }

  async connectWallet(walletId: string): Promise<TurnkeyWallet> {
    if (!this.apiKey) {
      throw new Error('Turnkey API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/v1/query/get_wallet`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          organizationId: process.env.TURNKEY_ORGANIZATION_ID,
          walletId
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to connect wallet: ${response.statusText}`);
      }

      const result = await response.json();
      const wallet: TurnkeyWallet = {
        address: result.wallet.accounts[0].address,
        publicKey: result.wallet.accounts[0].publicKey,
        walletId: result.wallet.walletId
      };

      this.currentWallet = wallet;
      
      // Create wallet client for transactions
      this.walletClient = createWalletClient({
        chain: base,
        transport: custom({
          async request({ method, params }) {
            return this.handleRPCRequest(method, params);
          }
        })
      });

      return wallet;
    } catch (error) {
      console.error('Error connecting Turnkey wallet:', error);
      throw error;
    }
  }

  private async handleRPCRequest(method: string, params: any[]): Promise<any> {
    if (!this.currentWallet) {
      throw new Error('No wallet connected');
    }

    switch (method) {
      case 'eth_accounts':
        return [this.currentWallet.address];
      
      case 'eth_requestAccounts':
        return [this.currentWallet.address];
      
      case 'eth_sendTransaction':
        return this.sendTransaction(params[0]);
      
      case 'personal_sign':
        return this.signMessage(params[0]);
      
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }

  async sendTransaction(txParams: {
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
  }): Promise<string> {
    if (!this.apiKey || !this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/v1/submit/sign_transaction`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'ACTIVITY_TYPE_SIGN_TRANSACTION_V2',
          organizationId: process.env.TURNKEY_ORGANIZATION_ID,
          parameters: {
            signWith: this.currentWallet.address,
            type: 'TRANSACTION_TYPE_ETHEREUM',
            unsignedTransaction: {
              to: txParams.to,
              value: txParams.value || '0x0',
              data: txParams.data || '0x',
              nonce: await this.getNonce(),
              gasLimit: txParams.gas || '0x5208',
              gasPrice: txParams.gasPrice || await this.getGasPrice(),
              chainId: '0x2105' // Base chain ID
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Transaction failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.activity.result.signedTransaction;
    } catch (error) {
      console.error('Error sending transaction:', error);
      throw error;
    }
  }

  async signMessage(message: string): Promise<string> {
    if (!this.apiKey || !this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch(`${this.baseUrl}/public/v1/submit/sign_raw_payload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          type: 'ACTIVITY_TYPE_SIGN_RAW_PAYLOAD_V2',
          organizationId: process.env.TURNKEY_ORGANIZATION_ID,
          parameters: {
            signWith: this.currentWallet.address,
            payload: Buffer.from(message).toString('hex'),
            encoding: 'PAYLOAD_ENCODING_HEXADECIMAL',
            hashFunction: 'HASH_FUNCTION_KECCAK256'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Message signing failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.activity.result.signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  }

  async getBalance(address?: string): Promise<{ eth: string; usdc: string }> {
    const walletAddress = address || this.currentWallet?.address;
    if (!walletAddress) {
      throw new Error('No wallet address provided');
    }

    try {
      // Get ETH balance
      const ethResponse = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          currency: 'ETH'
        })
      });

      // Get USDC balance
      const usdcResponse = await fetch('/api/wallet/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: walletAddress,
          currency: 'USDC'
        })
      });

      const ethData = await ethResponse.json();
      const usdcData = await usdcResponse.json();

      return {
        eth: ethData.balance || '0',
        usdc: usdcData.balance || '0'
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return { eth: '0', usdc: '0' };
    }
  }

  async payForRemix(amount: string, currency: 'ETH' | 'USDC' = 'ETH'): Promise<TransactionResult> {
    if (!this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const paymentRequest: PaymentRequest = {
        to: process.env.NEXT_PUBLIC_PAYMENT_RECIPIENT || '0x...', // Platform payment address
        amount,
        currency,
        description: 'RemixRite - Remix Creation Fee'
      };

      const txHash = await this.sendPayment(paymentRequest);
      
      return {
        hash: txHash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error processing remix payment:', error);
      throw error;
    }
  }

  async sendPayment(payment: PaymentRequest): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    const value = payment.currency === 'ETH' 
      ? parseEther(payment.amount).toString()
      : '0';

    const txParams = {
      to: payment.to,
      value: `0x${BigInt(value).toString(16)}`,
      data: payment.currency === 'USDC' ? this.encodeUSDCTransfer(payment.to, payment.amount) : '0x'
    };

    return this.sendTransaction(txParams);
  }

  private encodeUSDCTransfer(to: string, amount: string): string {
    // This would encode the USDC transfer function call
    // For now, returning placeholder
    return '0xa9059cbb' + // transfer function selector
           to.slice(2).padStart(64, '0') + // to address
           BigInt(parseEther(amount)).toString(16).padStart(64, '0'); // amount
  }

  private async getNonce(): Promise<string> {
    if (!this.currentWallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const response = await fetch('/api/wallet/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: this.currentWallet.address })
      });

      const { nonce } = await response.json();
      return `0x${nonce.toString(16)}`;
    } catch (error) {
      console.error('Error fetching nonce:', error);
      return '0x0';
    }
  }

  private async getGasPrice(): Promise<string> {
    try {
      const response = await fetch('/api/wallet/gas-price');
      const { gasPrice } = await response.json();
      return `0x${gasPrice.toString(16)}`;
    } catch (error) {
      console.error('Error fetching gas price:', error);
      return '0x3b9aca00'; // 1 gwei fallback
    }
  }

  async disconnect(): Promise<void> {
    this.currentWallet = null;
    this.walletClient = null;
  }

  getCurrentWallet(): TurnkeyWallet | null {
    return this.currentWallet;
  }

  isConnected(): boolean {
    return this.currentWallet !== null;
  }

  // Utility functions
  formatAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  formatBalance(balance: string, decimals: number = 18): string {
    const formatted = formatEther(BigInt(balance));
    return parseFloat(formatted).toFixed(4);
  }

  validateAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  // Mock functions for development
  async mockCreateWallet(userId: string): Promise<TurnkeyWallet> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockWallet: TurnkeyWallet = {
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      publicKey: `0x${Math.random().toString(16).substr(2, 128)}`,
      walletId: `wallet_${Math.random().toString(16).substr(2, 16)}`
    };

    this.currentWallet = mockWallet;
    return mockWallet;
  }

  async mockSendPayment(payment: PaymentRequest): Promise<TransactionResult> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      status: 'confirmed',
      gasUsed: '21000',
      effectiveGasPrice: '1000000000'
    };
  }
}

// Export singleton instance
export const turnkey = new TurnkeyService();

// Helper functions for wallet operations
export const walletUtils = {
  formatCurrency(amount: string, currency: 'ETH' | 'USDC'): string {
    const formatted = parseFloat(amount).toFixed(currency === 'ETH' ? 6 : 2);
    return `${formatted} ${currency}`;
  },

  calculateRemixFee(basePrice: number = 0.5): string {
    // Base price in USD, convert to ETH (mock conversion rate)
    const ethPrice = 2000; // Mock ETH price
    return (basePrice / ethPrice).toFixed(6);
  },

  validatePaymentAmount(amount: string, currency: 'ETH' | 'USDC'): boolean {
    try {
      const parsed = parseFloat(amount);
      return parsed > 0 && parsed < (currency === 'ETH' ? 10 : 10000);
    } catch {
      return false;
    }
  }
};
