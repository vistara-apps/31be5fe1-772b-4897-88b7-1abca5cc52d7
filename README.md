# RemixRite - Create & Earn: Remix Audio & Video with Automated Royalties

RemixRite is a Base mini-app that enables creators to easily remix existing royalty-free or licensed audio and video content, with automated royalty distribution to original rights holders through Story Protocol integration.

## 🚀 Features

### Core Features
- **AI-Powered Content Curation**: Leverages AI to help creators discover and import licensed audio and video clips relevant to their search queries
- **Intuitive Visual Remixing Editor**: Simple drag-and-drop interface for combining clips, adding text overlays, and applying transitions
- **Automated Royalty Tracking & Distribution**: Integrates with Story Protocol to automatically track usage and distribute royalties to original rights holders

### Technical Features
- **IPFS Storage**: Decentralized file storage via Pinata
- **Blockchain Integration**: Built on Base with Story Protocol for IP management
- **Wallet Integration**: Seamless Web3 interactions via Turnkey
- **AI Enhancement**: OpenAI integration for content suggestions and analysis
- **Real-time Processing**: Live remix creation and processing

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Base (Ethereum L2), Story Protocol, OnchainKit
- **Storage**: IPFS via Pinata, Supabase (metadata)
- **AI**: OpenAI GPT-4 for content curation
- **Wallet**: Turnkey for seamless Web3 UX
- **UI**: Framer Motion, Lucide React, Recharts

## 📋 Prerequisites

Before running the application, you'll need:

1. **Supabase Project**: For metadata storage
2. **Pinata Account**: For IPFS file storage
3. **OpenAI API Key**: For AI-powered features
4. **Turnkey Account**: For wallet management
5. **OnchainKit API Key**: For Base blockchain integration

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/vistara-apps/31be5fe1-772b-4897-88b7-1abca5cc52d7.git
cd 31be5fe1-772b-4897-88b7-1abca5cc52d7
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and configuration:

```env
# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OnchainKit Configuration
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_onchainkit_api_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret

# Turnkey Configuration
TURNKEY_API_KEY=your_turnkey_api_key
TURNKEY_ORGANIZATION_ID=your_turnkey_organization_id

# Payment Configuration
NEXT_PUBLIC_PAYMENT_RECIPIENT=0x_your_payment_recipient_address
```

### 4. Database Setup

Set up your Supabase database with the required tables:

```sql
-- Users table
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clips table
CREATE TABLE clips (
  clip_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url TEXT NOT NULL,
  metadata JSONB NOT NULL,
  owner_address TEXT NOT NULL,
  story_protocol_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Remixes table
CREATE TABLE remixes (
  remix_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  original_clip_ids TEXT[] NOT NULL,
  output_url TEXT NOT NULL,
  story_protocol_tx_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Royalty distributions table
CREATE TABLE royalty_distributions (
  distribution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  remix_id UUID REFERENCES remixes(remix_id),
  original_owner_address TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/
│   ├── api/                 # API routes
│   │   ├── upload/         # File upload endpoints
│   │   ├── remix/          # Remix processing endpoints
│   │   ├── wallet/         # Wallet interaction endpoints
│   │   └── story/          # Story Protocol endpoints
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main page
│   └── providers.tsx       # Context providers
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── ClipCard.tsx        # Clip display component
│   ├── ContentLibrary.tsx  # Content browsing interface
│   ├── Dashboard.tsx       # Main dashboard
│   ├── DragDropEditor.tsx  # Remix editor interface
│   ├── Header.tsx          # App header
│   ├── MediaPreview.tsx    # Media preview component
│   ├── RoyaltyChart.tsx    # Royalty visualization
│   └── Sidebar.tsx         # Navigation sidebar
├── lib/
│   ├── api.ts              # Database API functions
│   ├── openai.ts           # AI integration
│   ├── pinata.ts           # IPFS storage
│   ├── story-protocol.ts   # IP management
│   ├── supabase.ts         # Database client
│   ├── turnkey.ts          # Wallet integration
│   └── utils.ts            # Utility functions
└── public/                 # Static assets
```

## 🔧 API Endpoints

### Upload API (`/api/upload`)
- `POST`: Upload audio/video files to IPFS and register IP
- `GET`: Retrieve all clips or search clips

### Remix API (`/api/remix`)
- `POST`: Create a new remix from selected clips
- `GET`: Retrieve remixes (all or by creator)

### Wallet API (`/api/wallet/*`)
- `/balance`: Get ETH/USDC balance
- `/nonce`: Get transaction nonce
- `/gas-price`: Get current gas price

### Story Protocol API (`/api/story/*`)
- `/register-ip`: Register IP asset
- `/attach-license`: Attach license terms
- `/calculate-royalties`: Calculate royalty distributions

## 🎨 Design System

The application uses a cohesive design system with:

- **Colors**: Primary blue, accent teal, dark backgrounds
- **Typography**: Clean, modern font hierarchy
- **Components**: Consistent button styles, cards, and inputs
- **Motion**: Smooth transitions and animations
- **Layout**: Responsive grid system

## 🔐 Security Features

- **File Validation**: Comprehensive file type and size validation
- **Wallet Security**: Secure wallet management via Turnkey
- **IP Protection**: Blockchain-based IP registration and tracking
- **API Security**: Rate limiting and input validation

## 🚀 Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](https://github.com/vistara-apps/31be5fe1-772b-4897-88b7-1abca5cc52d7/issues) page
2. Create a new issue with detailed information
3. Join our community discussions

## 🔮 Roadmap

- [ ] Advanced video editing features
- [ ] Mobile app development
- [ ] Additional blockchain integrations
- [ ] Enhanced AI capabilities
- [ ] Community features and social sharing
- [ ] Advanced royalty distribution models

---

Built with ❤️ for the creator economy on Base
