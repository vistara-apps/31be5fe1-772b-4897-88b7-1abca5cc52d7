import { NextRequest, NextResponse } from 'next/server';
import { pinata, fileUtils } from '@/lib/pinata';
import { clipAPI } from '@/lib/api';
import { generateContentTags } from '@/lib/openai';
import { storyProtocol, storyUtils } from '@/lib/story-protocol';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const ownerAddress = formData.get('ownerAddress') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!ownerAddress) {
      return NextResponse.json(
        { error: 'Owner address is required' },
        { status: 400 }
      );
    }

    // Validate file
    const validation = fileUtils.validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get file metadata
    const fileType = fileUtils.getFileType(file);
    let duration = '0:00';
    
    try {
      if (fileType === 'audio') {
        const durationSeconds = await fileUtils.getAudioDuration(file);
        duration = fileUtils.formatDuration(durationSeconds);
      } else if (fileType === 'video') {
        const durationSeconds = await fileUtils.getVideoDuration(file);
        duration = fileUtils.formatDuration(durationSeconds);
      }
    } catch (error) {
      console.warn('Could not get file duration:', error);
    }

    // Upload to IPFS via Pinata
    const uploadResult = await pinata.uploadFile(
      file,
      {
        name: title || file.name,
        keyvalues: {
          type: fileType,
          owner: ownerAddress,
          platform: 'RemixRite'
        }
      }
    );

    const ipfsUrl = pinata.getIPFSUrl(uploadResult.IpfsHash);

    // Generate tags using AI
    const tags = await generateContentTags(
      title || file.name,
      description || '',
      fileType
    );

    // Register IP on Story Protocol
    const metadata = storyUtils.generateMetadata(
      title || file.name,
      description || `${fileType} content uploaded to RemixRite`,
      ipfsUrl,
      {
        fileType,
        duration,
        fileSize: file.size,
        tags
      }
    );

    const ipId = await storyProtocol.registerIPAsset(
      '0x...', // NFT contract address (would be actual contract)
      Date.now().toString(), // tokenId
      metadata
    );

    // Attach default license terms
    const licenseTerms = storyUtils.createDefaultLicenseTerms(10); // 10% royalty
    const licenseTermsId = await storyProtocol.attachLicenseTerms(ipId, licenseTerms);

    // Save to database
    const clip = await clipAPI.create({
      title: title || file.name,
      source_url: ipfsUrl,
      metadata: {
        duration,
        type: fileType,
        artist: 'User Upload',
        thumbnail: '', // Could generate thumbnail for videos
        tags,
        fileSize: file.size,
        ipfsHash: uploadResult.IpfsHash
      },
      owner_address: ownerAddress,
      story_protocol_id: ipId
    });

    return NextResponse.json({
      success: true,
      clip: {
        id: clip.id,
        title: clip.title,
        source_url: clip.source_url,
        metadata: clip.metadata,
        story_protocol_id: clip.story_protocol_id,
        ipfs_hash: uploadResult.IpfsHash
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') as 'audio' | 'video' | undefined;

    let clips;
    if (query) {
      clips = await clipAPI.search(query, type);
    } else {
      clips = await clipAPI.getAll();
    }

    return NextResponse.json({
      success: true,
      clips: clips.map(clip => ({
        id: clip.id,
        title: clip.title,
        source_url: clip.source_url,
        metadata: clip.metadata,
        owner_address: clip.owner_address,
        story_protocol_id: clip.story_protocol_id
      }))
    });

  } catch (error) {
    console.error('Error fetching clips:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clips' },
      { status: 500 }
    );
  }
}
