import { NextRequest, NextResponse } from 'next/server';
import { remixAPI, clipAPI, royaltyAPI } from '@/lib/api';
import { pinata } from '@/lib/pinata';
import { storyProtocol, storyUtils } from '@/lib/story-protocol';
import { generateRemixTitle, generateContentTags } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clipIds,
      creatorId,
      title,
      description,
      remixData, // Base64 encoded remix file or processing instructions
      style,
      mood
    } = body;

    if (!clipIds || !Array.isArray(clipIds) || clipIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one clip ID is required' },
        { status: 400 }
      );
    }

    if (!creatorId) {
      return NextResponse.json(
        { error: 'Creator ID is required' },
        { status: 400 }
      );
    }

    // Fetch original clips to get their metadata and Story Protocol IDs
    const originalClips = await Promise.all(
      clipIds.map(async (id: string) => {
        try {
          const clips = await clipAPI.search(id);
          return clips[0] || null;
        } catch (error) {
          console.error(`Error fetching clip ${id}:`, error);
          return null;
        }
      })
    );

    const validClips = originalClips.filter(clip => clip !== null);
    
    if (validClips.length === 0) {
      return NextResponse.json(
        { error: 'No valid clips found' },
        { status: 400 }
      );
    }

    // Generate remix title if not provided
    let remixTitle = title;
    if (!remixTitle) {
      const originalTitles = validClips.map(clip => clip.title);
      const generatedTitles = await generateRemixTitle(originalTitles, style, mood);
      remixTitle = generatedTitles[0] || `Remix of ${originalTitles[0]}`;
    }

    // Process the remix (this would involve actual audio/video processing)
    // For now, we'll simulate the processing and create a placeholder
    const remixBlob = await processRemix(validClips, remixData);
    
    // Upload remix to IPFS
    const uploadResult = await pinata.uploadFile(
      remixBlob,
      {
        name: remixTitle,
        keyvalues: {
          type: 'remix',
          creator: creatorId,
          originalClips: clipIds.join(','),
          platform: 'RemixRite'
        }
      }
    );

    const remixUrl = pinata.getIPFSUrl(uploadResult.IpfsHash);

    // Generate tags for the remix
    const tags = await generateContentTags(
      remixTitle,
      description || `Remix created from ${validClips.length} original clips`,
      'video' // Assuming remixes are video by default
    );

    // Register remix as derivative work on Story Protocol
    const parentIPIds = validClips.map(clip => clip.story_protocol_id);
    const remixMetadata = storyUtils.generateMetadata(
      remixTitle,
      description || `Remix created from original works`,
      remixUrl,
      {
        originalClips: clipIds,
        style,
        mood,
        tags,
        createdAt: new Date().toISOString()
      }
    );

    const { ipId: remixIPId, txHash } = await storyProtocol.registerRemix(
      parentIPIds,
      remixMetadata
    );

    // Save remix to database
    const remix = await remixAPI.create({
      creator_id: creatorId,
      original_clip_ids: clipIds,
      output_url: remixUrl,
      story_protocol_tx_hash: txHash
    });

    // Calculate and create royalty distributions
    const remixFee = 0.5; // $0.50 as specified in PRD
    const royaltyDistributions = await calculateRoyalties(
      validClips,
      remixFee,
      remix.id
    );

    // Create royalty distribution records
    await Promise.all(
      royaltyDistributions.map(distribution =>
        royaltyAPI.create({
          remix_id: remix.id,
          original_owner_address: distribution.owner,
          amount: distribution.amount
        })
      )
    );

    return NextResponse.json({
      success: true,
      remix: {
        id: remix.id,
        title: remixTitle,
        output_url: remix.output_url,
        story_protocol_id: remixIPId,
        story_protocol_tx_hash: remix.story_protocol_tx_hash,
        original_clips: validClips.map(clip => ({
          id: clip.id,
          title: clip.title,
          owner: clip.owner_address
        })),
        royalty_distributions: royaltyDistributions,
        created_at: remix.created_at
      }
    });

  } catch (error) {
    console.error('Remix creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create remix' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creator');

    let remixes;
    if (creatorId) {
      remixes = await remixAPI.getByCreator(creatorId);
    } else {
      remixes = await remixAPI.getAll();
    }

    // Enrich remixes with additional data
    const enrichedRemixes = await Promise.all(
      remixes.map(async (remix) => {
        // Get original clips info
        const originalClips = await Promise.all(
          remix.original_clip_ids.map(async (clipId: string) => {
            try {
              const clips = await clipAPI.search(clipId);
              return clips[0] || null;
            } catch (error) {
              return null;
            }
          })
        );

        // Get royalty distributions
        const distributions = await royaltyAPI.getByRemix(remix.id);

        return {
          ...remix,
          original_clips: originalClips.filter(clip => clip !== null),
          royalty_distributions: distributions
        };
      })
    );

    return NextResponse.json({
      success: true,
      remixes: enrichedRemixes
    });

  } catch (error) {
    console.error('Error fetching remixes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch remixes' },
      { status: 500 }
    );
  }
}

// Helper function to simulate remix processing
async function processRemix(clips: any[], remixData?: string): Promise<File> {
  // In a real implementation, this would:
  // 1. Download the original clips from IPFS
  // 2. Process them according to the remix instructions
  // 3. Combine/edit the audio/video
  // 4. Return the processed file
  
  // For now, create a placeholder file
  const placeholderContent = JSON.stringify({
    type: 'remix',
    originalClips: clips.map(clip => ({
      id: clip.id,
      title: clip.title,
      url: clip.source_url
    })),
    processedAt: new Date().toISOString(),
    note: 'This is a placeholder. In production, this would be the actual processed remix file.'
  });

  const blob = new Blob([placeholderContent], { type: 'application/json' });
  return new File([blob], 'remix.json', { type: 'application/json' });
}

// Helper function to calculate royalty distributions
async function calculateRoyalties(
  originalClips: any[],
  totalFee: number,
  remixId: string
): Promise<Array<{ owner: string; amount: number }>> {
  // Simple equal distribution for now
  // In production, this would use Story Protocol's royalty calculation
  const royaltyPerClip = totalFee / originalClips.length;
  
  return originalClips.map(clip => ({
    owner: clip.owner_address,
    amount: royaltyPerClip
  }));
}
