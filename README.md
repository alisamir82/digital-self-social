# Digital Self Social

A full-featured video sharing mobile application built with React Native and Supabase, inspired by YouTube. This app provides a complete social video platform experience with video upload, streaming, comments, likes, subscriptions, live streaming, and real-time chat functionality.

## 🚀 Features

### Core Features
- **User Authentication**: Sign up, sign in, and OAuth integration (Google, Apple)
- **Video Upload & Streaming**: Upload videos with metadata, thumbnails, and visibility settings
- **Video Player**: Custom video player with playback controls
- **Home Feed**: Infinite scroll video feed with pull-to-refresh
- **Search**: Search videos by title with trending and recent searches
- **Comments**: Real-time commenting system with likes and sorting
- **Likes & Dislikes**: Video engagement with real-time updates
- **Subscriptions**: Subscribe to channels and view subscription feed
- **Library**: Watch history and liked videos

### Advanced Features
- **Live Streaming**: Real-time live video streaming with chat
- **Chat Rooms**: Community chat rooms with real-time messaging and presence
- **Channel Pages**: Dedicated channel pages with videos, shorts, and about sections
- **User Profiles**: Customizable user profiles with bio and avatar
- **Real-time Updates**: Live updates for likes, comments, chat messages, and viewer counts
- **Shorts**: Support for short-form vertical videos

## 🛠 Tech Stack

- **Frontend**: React Native 0.81 with Expo SDK 54
- **Styling**: NativeWind 4 (Tailwind CSS for React Native)
- **Backend**: Supabase (PostgreSQL database, Authentication, Storage, Realtime)
- **Video**: expo-video for playback
- **Navigation**: Expo Router 6
- **State Management**: React hooks and Supabase real-time subscriptions
- **TypeScript**: Full TypeScript support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- pnpm (v9.12.0 or higher)
- Expo CLI
- iOS Simulator (for Mac) or Android Studio (for Android development)
- A Supabase account

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd digital_self_social
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up Supabase**
   - Create a new project on [Supabase](https://supabase.com)
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Set up Storage buckets:
     - Create a `videos` bucket (public)
     - Create a `thumbnails` bucket (public)
   - Enable Authentication providers (Email, Google, Apple)

4. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Start the mobile app**
   - For iOS: `pnpm ios`
   - For Android: `pnpm android`
   - For Web: The dev server already runs on web
   - Scan QR code with Expo Go app on your device

## 📱 App Structure

```
digital_self_social/
├── app/                          # App screens (Expo Router)
│   ├── (tabs)/                  # Bottom tab navigation
│   │   ├── index.tsx           # Home feed
│   │   ├── shorts.tsx          # Shorts feed
│   │   ├── upload.tsx          # Video upload
│   │   ├── subscriptions.tsx   # Subscription feed
│   │   └── library.tsx         # Watch history & liked videos
│   ├── auth/                    # Authentication screens
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── video/[id].tsx          # Video player & details
│   ├── channel/[id].tsx        # Channel page
│   ├── live/[id].tsx           # Live streaming
│   ├── chat/[id].tsx           # Chat rooms
│   ├── search.tsx              # Search screen
│   └── profile.tsx             # User profile
├── components/                  # Reusable components
│   ├── video-player.tsx        # Custom video player
│   ├── video-card.tsx          # Video card for feeds
│   ├── comments-section.tsx    # Comments component
│   └── screen-container.tsx    # Layout wrapper
├── lib/                         # Utilities & services
│   ├── supabase.ts             # Supabase client
│   ├── video-upload.ts         # Video upload utilities
│   └── utils.ts                # Helper functions
├── hooks/                       # Custom React hooks
│   ├── use-supabase-auth.ts    # Authentication hook
│   └── use-colors.ts           # Theme colors hook
├── assets/                      # Static assets
│   └── images/                 # App icons & images
└── supabase-schema.sql         # Database schema
```

## 🗄 Database Schema

The app uses the following main tables:
- `profiles`: User profiles (username, avatar, bio)
- `channels`: Content creator channels
- `videos`: Video metadata and URLs
- `comments`: Video comments with threading support
- `likes`: Likes/dislikes for videos and comments
- `subscriptions`: Channel subscriptions
- `watch_history`: User watch history
- `live_streams`: Live streaming sessions
- `chat_messages`: Chat room messages
- `chat_rooms`: Community chat rooms

See `supabase-schema.sql` for the complete schema and `SUPABASE_SETUP.md` for detailed setup instructions.

## 🔐 Supabase Configuration

### Required Supabase Features

1. **Authentication**
   - Email/Password authentication
   - OAuth providers (Google, Apple)
   - Email confirmation (optional)

2. **Storage Buckets**
   - `videos`: For video files (public access)
   - `thumbnails`: For video thumbnails (public access)

3. **Realtime**
   - Enable Realtime for all tables
   - Used for comments, chat, likes, and viewer counts

4. **Row Level Security (RLS)**
   - Policies are defined in `supabase-schema.sql`
   - Ensures users can only modify their own content

### Storage Policies

Make sure to set up storage policies to allow:
- Public read access for videos and thumbnails
- Authenticated users can upload to their own folders
- Users can delete their own uploads

## 🎨 Customization

### Branding
- App name: Update `appName` in `app.config.ts`
- Logo: Replace files in `assets/images/`
- Colors: Modify `theme.config.js`

### Features
- Enable/disable features by commenting out routes
- Customize video player controls in `components/video-player.tsx`
- Adjust feed pagination in home screen

## 🚀 Deployment

### Mobile App Deployment

1. **Build for iOS**
   ```bash
   eas build --platform ios
   ```

2. **Build for Android**
   ```bash
   eas build --platform android
   ```

3. **Submit to App Stores**
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

### Web Deployment

The app can also run as a web application:
```bash
pnpm build
pnpm start
```

## 📝 Environment Variables

Required environment variables:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: OAuth (if using built-in Manus OAuth)
EXPO_PUBLIC_OAUTH_PORTAL_URL=
EXPO_PUBLIC_OAUTH_SERVER_URL=
EXPO_PUBLIC_APP_ID=
EXPO_PUBLIC_OWNER_OPEN_ID=
EXPO_PUBLIC_OWNER_NAME=
EXPO_PUBLIC_API_BASE_URL=
```

## 🔌 Recommended Connectors & Integrations

To enhance your Digital Self Social app, consider integrating these services:

### Video Processing
- **Mux**: Professional video encoding, streaming, and analytics
- **Cloudflare Stream**: Affordable video streaming with global CDN
- **AWS MediaConvert**: Enterprise-grade video transcoding

### Storage & CDN
- **Cloudflare R2**: Cost-effective object storage compatible with S3
- **AWS S3**: Scalable cloud storage for videos and thumbnails
- **Backblaze B2**: Affordable cloud storage alternative

### Analytics
- **Mixpanel**: User behavior analytics and engagement tracking
- **Amplitude**: Product analytics for mobile apps
- **PostHog**: Open-source product analytics

### Notifications
- **OneSignal**: Push notifications for iOS and Android
- **Firebase Cloud Messaging**: Free push notification service
- **Expo Push Notifications**: Built-in push notification service

### Moderation
- **AWS Rekognition**: AI-powered content moderation for videos
- **Clarifai**: Visual content moderation and tagging
- **Hive**: AI moderation for video, image, and text content

### Monetization
- **Stripe**: Payment processing for subscriptions and tips
- **RevenueCat**: In-app purchase and subscription management
- **AdMob**: Mobile advertising platform

### Live Streaming
- **Agora**: Real-time video streaming SDK
- **Twilio Live**: Programmable live video streaming
- **Mux Live**: Live streaming infrastructure

### Search
- **Algolia**: Fast and relevant search for videos and channels
- **Typesense**: Open-source search engine alternative
- **Meilisearch**: Lightning-fast search engine

## 🐛 Troubleshooting

### Common Issues

1. **Supabase connection errors**
   - Verify your environment variables are correct
   - Check that your Supabase project is active
   - Ensure RLS policies are properly configured

2. **Video upload failures**
   - Check storage bucket permissions
   - Verify file size limits (default 50MB in Supabase)
   - Ensure storage policies allow uploads

3. **Real-time features not working**
   - Enable Realtime in Supabase dashboard
   - Check that tables have Realtime enabled
   - Verify network connectivity

4. **Authentication issues**
   - Confirm OAuth providers are configured in Supabase
   - Check redirect URLs match your app scheme
   - Verify email templates are set up

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the `SUPABASE_SETUP.md` for detailed configuration help
- Review the `design.md` for app architecture details

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Backend powered by [Supabase](https://supabase.com)
- Styled with [NativeWind](https://www.nativewind.dev)
- Icons from [SF Symbols](https://developer.apple.com/sf-symbols/) and [Material Icons](https://fonts.google.com/icons)

---

**Happy coding! 🎉**
