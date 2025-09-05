import { NextRequest, NextResponse } from 'next/server';
import { storyProtocol } from '@/lib/story-protocol';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenContract, tokenId, metadataURI } = body;

    if (!tokenContract || !tokenId || !metadataURI) {
      return NextResponse.json(
        { error: 'tokenContract, tokenId, and metadataURI are required' },
        { status: 400 }
      );
    }

    // For development, use mock registration
    const ipId = await storyProtocol.mockRegisterIP({
      tokenContract,
      tokenId,
      metadataURI
    });

    return NextResponse.json({
      success: true,
      ipId,
      tokenContract,
      tokenId,
      metadataURI
    });

  } catch (error) {
    console.error('IP registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register IP asset' },
      { status: 500 }
    );
  }
}
