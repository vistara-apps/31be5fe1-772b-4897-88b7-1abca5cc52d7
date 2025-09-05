import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export async function GET(request: NextRequest) {
  try {
    const gasPrice = await publicClient.getGasPrice();

    return NextResponse.json({
      success: true,
      gasPrice: gasPrice.toString(),
      gasPriceGwei: (Number(gasPrice) / 1e9).toFixed(2)
    });

  } catch (error) {
    console.error('Gas price fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gas price' },
      { status: 500 }
    );
  }
}
