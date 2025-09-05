import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

const publicClient = createPublicClient({
  chain: base,
  transport: http()
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }

    const nonce = await publicClient.getTransactionCount({
      address: address as `0x${string}`,
      blockTag: 'pending'
    });

    return NextResponse.json({
      success: true,
      address,
      nonce
    });

  } catch (error) {
    console.error('Nonce fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nonce' },
      { status: 500 }
    );
  }
}
