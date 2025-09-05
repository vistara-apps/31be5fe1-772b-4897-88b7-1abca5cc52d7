import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

// USDC contract address on Base
const USDC_CONTRACT = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, currency } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!currency || !['ETH', 'USDC'].includes(currency)) {
      return NextResponse.json(
        { error: 'Currency must be ETH or USDC' },
        { status: 400 }
      );
    }

    let balance = '0';

    if (currency === 'ETH') {
      // Get ETH balance
      const ethBalance = await publicClient.getBalance({
        address: address as `0x${string}`
      });
      balance = formatEther(ethBalance);
    } else if (currency === 'USDC') {
      // Get USDC balance
      try {
        const usdcBalance = await publicClient.readContract({
          address: USDC_CONTRACT as `0x${string}`,
          abi: [
            {
              name: 'balanceOf',
              type: 'function',
              stateMutability: 'view',
              inputs: [{ name: 'account', type: 'address' }],
              outputs: [{ name: '', type: 'uint256' }]
            }
          ],
          functionName: 'balanceOf',
          args: [address as `0x${string}`]
        });
        
        // USDC has 6 decimals
        balance = (Number(usdcBalance) / 1e6).toString();
      } catch (error) {
        console.error('Error fetching USDC balance:', error);
        balance = '0';
      }
    }

    return NextResponse.json({
      success: true,
      address,
      currency,
      balance
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}
