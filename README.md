# Lynx - Customizable Link Preview Generator

A customizable link preview generator that creates Twitter Cards with user-uploaded images and custom metadata. Built with Node.js, Express, TypeScript, React, and Prisma.

## 🚀 Features

- **Image Upload & Processing**: Upload images and automatically optimize them for Twitter Cards
- **Multiple Card Formats**: Support for Portrait, Landscape, and Square Twitter Card formats
- **Smart Image Analysis**: Automatic format recommendations based on image dimensions
- **Interactive Cropping**: User-controlled image cropping with real-time preview
- **Click Tracking**: Analytics for card views and clicks
- **Rate Limiting**: Built-in abuse prevention
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Database**: PostgreSQL (production), SQLite (development)
- **ORM**: Prisma
- **Image Processing**: Sharp
- **Deployment**: Railway

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for production)

## 🚀 Quick Start

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/LampByLit/lynx.git
   cd lynx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NODE_ENV="development"
   PORT=3000
   ```

4. **Initialize the database**
   ```bash
   npm run init-db
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

### Production Deployment (Railway)

1. **Connect your GitHub repository to Railway**

2. **Add a PostgreSQL service in Railway dashboard**

3. **Set environment variables in Railway:**
   - `DATABASE_URL`: Provided automatically by Railway PostgreSQL service
   - `NODE_ENV`: `production`
   - `PORT`: `3000` (Railway will set this automatically)

4. **Deploy**: Railway will automatically deploy when you push to your main branch

## 📁 Project Structure

```
lynx/
├── src/
│   ├── app.ts                 # Main Express server
│   ├── routes/                # API routes
│   │   ├── upload.ts          # Image upload endpoint
│   │   └── cards.ts           # Card page rendering
│   ├── services/              # Business logic
│   │   ├── imageProcessing.ts # Image optimization
│   │   └── imageAnalysis.ts   # Format recommendations
│   ├── middleware/            # Express middleware
│   │   ├── upload.ts          # File upload handling
│   │   └── rateLimit.ts       # Rate limiting
│   ├── components/            # React components
│   │   ├── CropTool.tsx       # Image cropping interface
│   │   └── FormatPreview.tsx  # Format selection
│   └── utils/                 # Utility functions
│       └── slugGenerator.ts   # URL slug generation
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   └── index.html             # React app entry point
├── data/
│   └── uploads/               # Processed images
└── scripts/
    ├── start.js               # Production startup script
    └── init-db.js             # Database initialization
```

## 🎯 API Endpoints

### Upload Image
```
POST /api/upload
Content-Type: multipart/form-data

Fields:
- image: Image file (required)
- link: Destination URL (required)
- title: Card title (optional)
- description: Card description (optional)
- imageFormat: 'portrait' | 'landscape' | 'square' (required)
- cropData: JSON string with crop coordinates (optional)
```

### View Card
```
GET /:slug
Returns: HTML page with Twitter Card metadata
```

### Health Check
```
GET /health
Returns: { status: 'ok', timestamp: '...' }
```

## 🖼️ Image Formats

| Format | Dimensions | Aspect Ratio | Twitter Card Type |
|--------|------------|--------------|-------------------|
| Portrait | 400×600 | 2:3 | Summary Card |
| Landscape | 1200×600 | 2:1 | Summary Card with Large Image |
| Square | 400×400 | 1:1 | App Card |

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `file:./dev.db` |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `120000` (2 minutes) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `1` |
| `UPLOAD_MAX_SIZE` | Max file size | `10485760` (10MB) |
| `TWITTER_SITE_HANDLE` | Twitter handle for cards | `@lampbylit` |
| `SITE_NAME` | Site name | `Lynx by LampByLit` |

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run all tests
npm run test:all
```

## 📊 Database Schema

### Cards Table
- `id`: Unique identifier
- `slug`: URL slug
- `targetUrl`: Destination URL
- `title`: Card title
- `description`: Card description
- `imageUrl`: Processed image path
- `imageFormat`: Card format type
- `createdAt`: Creation timestamp
- `clickCount`: Total clicks

### Clicks Table
- `id`: Unique identifier
- `cardSlug`: Reference to card
- `timestamp`: Click timestamp
- `ipAddress`: User IP
- `userAgent`: Browser info
- `referrer`: Referrer URL

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL service is connected in Railway
   - Check `DATABASE_URL` environment variable

2. **Image Upload Fails**
   - Verify file size is under 10MB
   - Check file format (JPG, PNG, GIF, WebP only)

3. **Rate Limit Exceeded**
   - Wait for the rate limit window to reset
   - Adjust rate limit settings in environment variables

### Railway Deployment Issues

1. **SQLite instead of PostgreSQL**
   - Connect PostgreSQL service in Railway dashboard
   - Ensure `DATABASE_URL` is set correctly

2. **Startup Script Fails**
   - Check that `dist/app.js` exists (run `npm run build`)
   - Verify all dependencies are installed

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Repository**: https://github.com/LampByLit/lynx
- **Website**: https://lampbylit.com
- **Twitter**: @lampbylit

---

Built with ❤️ by [LampByLit](https://lampbylit.com)
