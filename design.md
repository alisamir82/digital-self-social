# YouTube Clone Mobile App - Design Plan

## Overview
This mobile app is a comprehensive video-sharing platform similar to YouTube, designed for **mobile portrait orientation (9:16)** with **one-handed usage** in mind. The app follows **Apple Human Interface Guidelines (HIG)** to feel like a first-party iOS app while maintaining cross-platform compatibility.

## Core Principles
- **Mobile-first**: All interactions optimized for portrait orientation and thumb-reach zones
- **Native feel**: Follows iOS design patterns (bottom sheets, swipe gestures, native navigation)
- **Content-focused**: Video content takes center stage with minimal UI chrome
- **Performance**: Smooth scrolling, lazy loading, and efficient video playback

## Color Scheme
- **Primary Brand**: `#FF0000` (YouTube Red) - Used for key actions (subscribe, like, upload)
- **Background**: `#FFFFFF` (light) / `#0F0F0F` (dark) - Main app background
- **Surface**: `#F9F9F9` (light) / `#212121` (dark) - Cards and elevated surfaces
- **Foreground**: `#030303` (light) / `#FFFFFF` (dark) - Primary text
- **Muted**: `#606060` (light) / `#AAAAAA` (dark) - Secondary text, metadata
- **Border**: `#E5E5E5` (light) / `#3F3F3F` (dark) - Dividers and borders

## Screen List & Functionality

### 1. Home Feed (Tab 1)
**Primary Content:**
- Infinite scrolling feed of video thumbnails
- Each card shows: thumbnail, title, channel name, view count, upload time
- Pull-to-refresh for latest videos
- Horizontal category chips for filtering (All, Gaming, Music, News, etc.)

**Functionality:**
- Tap video card → Video Player screen
- Tap channel avatar → Channel screen
- Long press → Quick actions (Save, Share, Not interested)

**Layout:**
- Single column of video cards
- Each card: 16:9 thumbnail, 3 lines of metadata below
- Bottom tab bar always visible

### 2. Shorts Feed (Tab 2)
**Primary Content:**
- Full-screen vertical video feed (TikTok-style)
- One video per screen with vertical swipe navigation
- Overlay UI: like, dislike, comment, share buttons on right
- Channel info and description at bottom

**Functionality:**
- Swipe up/down to navigate videos
- Tap screen to pause/play
- Tap like/dislike/comment/share buttons
- Tap channel avatar → Channel screen

**Layout:**
- Full-screen video (9:16)
- Floating UI elements over video
- No tab bar (immersive experience)

### 3. Upload (Tab 3 - Center)
**Primary Content:**
- Large circular upload button in center
- Quick access to camera and gallery
- Recent uploads list below

**Functionality:**
- Tap camera icon → Record video
- Tap gallery icon → Select from library
- After selection → Upload Editor screen

**Layout:**
- Prominent centered upload button
- Two-column grid of recent uploads

### 4. Subscriptions (Tab 4)
**Primary Content:**
- Feed of videos from subscribed channels
- Grouped by channel with horizontal scrolling
- "All" tab shows chronological feed

**Functionality:**
- Tap video → Video Player
- Tap "All" → See all subscriptions feed
- Pull-to-refresh for new content

**Layout:**
- Channel sections with horizontal video carousels
- Channel avatar + name header for each section

### 5. Library (Tab 5)
**Primary Content:**
- User's personal collections
- Sections: History, Watch Later, Liked Videos, Playlists
- Quick stats (total videos, watch time)

**Functionality:**
- Tap section → List of videos
- Tap video → Video Player
- Swipe to delete from history/watch later

**Layout:**
- List of sections with preview thumbnails
- Each section shows count and last updated

### 6. Video Player (Modal)
**Primary Content:**
- Full-width video player (16:9 or fills width)
- Video title, channel info, view count, upload date
- Like/Dislike buttons, Share, Save
- Description (expandable)
- Comments section below
- Recommended videos at bottom

**Functionality:**
- Tap to show/hide controls
- Swipe down to minimize to picture-in-picture
- Tap like/dislike to interact
- Tap comment icon → Comments sheet
- Tap share → Native share sheet
- Scroll down to see comments and recommendations

**Layout:**
- Video player at top (fixed)
- Scrollable content below (metadata, comments, recommendations)
- Floating subscribe button (if not subscribed)

### 7. Comments Sheet (Bottom Sheet)
**Primary Content:**
- List of comments with avatars
- Sort options (Top, Newest)
- Reply threads (indented)
- Like counts on comments

**Functionality:**
- Tap comment to expand replies
- Tap like to upvote
- Tap reply → Reply input field
- Swipe down to dismiss

**Layout:**
- Bottom sheet (70% screen height)
- Comment input at bottom
- Scrollable comment list

### 8. Upload Editor (Full Screen)
**Primary Content:**
- Video preview player
- Title input field
- Description input (expandable)
- Visibility selector (Public, Unlisted, Private)
- Category selector
- Thumbnail selector (auto-generated + custom upload)

**Functionality:**
- Edit title and description
- Select thumbnail from options
- Choose visibility and category
- Tap "Publish" → Upload progress screen

**Layout:**
- Video preview at top (16:9)
- Form fields below in scrollable area
- "Publish" button fixed at bottom

### 9. Channel Screen (Push Navigation)
**Primary Content:**
- Channel banner image
- Channel avatar, name, subscriber count
- Subscribe button (prominent)
- Tabs: Videos, Shorts, About
- Grid of video thumbnails

**Functionality:**
- Tap subscribe/unsubscribe
- Tap bell icon for notifications
- Switch between tabs
- Tap video → Video Player

**Layout:**
- Header with banner and channel info (collapsible)
- Tab bar below header
- Grid of videos (2 columns for mobile)

### 10. Search Screen (Modal)
**Primary Content:**
- Search input at top
- Search suggestions while typing
- Recent searches
- Trending searches
- Search results (videos, channels, playlists)

**Functionality:**
- Type to search
- Tap suggestion → Execute search
- Tap recent search → Re-run search
- Filter results (Upload date, Duration, Features)

**Layout:**
- Search bar at top (always visible)
- Scrollable results below
- Filter chips below search bar

### 11. Profile Screen (Push Navigation)
**Primary Content:**
- User avatar and name
- Account stats (subscribers if creator)
- Settings sections: Account, Privacy, Notifications, Playback
- Sign out button

**Functionality:**
- Edit profile
- Manage subscriptions
- Adjust settings
- Sign out

**Layout:**
- Profile header at top
- List of settings sections
- Sign out button at bottom

### 12. Live Feed (Tab or Section)
**Primary Content:**
- Grid of live streaming thumbnails
- "LIVE" badge on thumbnails
- Viewer count
- Stream title and channel name

**Functionality:**
- Tap live stream → Live Player screen
- Pull-to-refresh for new streams

**Layout:**
- 2-column grid of live stream cards
- Each card shows thumbnail with LIVE badge

### 13. Live Player (Full Screen)
**Primary Content:**
- Full-screen video player
- Live chat overlay (scrolling messages)
- Viewer count
- Like button with animation
- Share button

**Functionality:**
- Watch live stream
- Send chat messages
- Like stream (heart animation)
- Share stream link

**Layout:**
- Full-screen video
- Chat overlay on right side (can be hidden)
- Input field at bottom for chat

### 14. Chat Room (Bottom Sheet or Full Screen)
**Primary Content:**
- Real-time message list
- User avatars next to messages
- Timestamp on messages
- Online user count

**Functionality:**
- Send text messages
- React to messages (emoji reactions)
- Mention users (@username)
- Auto-scroll to latest message

**Layout:**
- Message list (scrollable)
- Input field at bottom with send button
- Online users count at top

## Key User Flows

### Flow 1: Watch Video
1. User opens app → Home Feed
2. User scrolls and taps video thumbnail
3. Video Player opens (modal)
4. Video starts playing automatically
5. User can like, comment, share, or subscribe
6. User swipes down to return to feed (or minimize to PiP)

### Flow 2: Upload Video
1. User taps Upload tab (center tab)
2. User taps camera or gallery icon
3. User selects/records video
4. Upload Editor screen opens
5. User adds title, description, thumbnail
6. User taps "Publish"
7. Upload progress shown
8. Success message → Video published

### Flow 3: Subscribe to Channel
1. User watches video
2. User taps channel name or avatar
3. Channel screen opens
4. User taps "Subscribe" button
5. Button changes to "Subscribed" with bell icon
6. User can tap bell for notification preferences

### Flow 4: Comment on Video
1. User watches video
2. User taps comment icon
3. Comments sheet slides up
4. User taps comment input field
5. Keyboard appears, user types comment
6. User taps send button
7. Comment appears in list
8. User swipes down to dismiss sheet

### Flow 5: Watch Live Stream
1. User taps Live Feed tab
2. User sees grid of live streams
3. User taps live stream thumbnail
4. Live Player opens (full screen)
5. Video plays with live chat overlay
6. User can send chat messages
7. User can like stream (heart animation)
8. User swipes down or taps back to exit

### Flow 6: Join Chat Room
1. User navigates to Chat Room (from menu or tab)
2. Chat room opens with message history
3. User sees online user count
4. User types message in input field
5. User taps send button
6. Message appears in chat with timestamp
7. User can scroll to see message history

## Navigation Structure

### Bottom Tab Bar (5 tabs)
1. **Home** (house icon) - Home Feed
2. **Shorts** (play icon) - Shorts Feed
3. **Upload** (plus icon in circle) - Upload Center
4. **Subscriptions** (grid icon) - Subscriptions Feed
5. **Library** (bookmark icon) - User Library

### Modal Screens (slide up from bottom)
- Video Player
- Comments Sheet
- Search Screen
- Upload Editor
- Live Player

### Push Screens (slide from right)
- Channel Screen
- Profile Screen
- Settings Screen
- Playlist Screen
- Video List Screen

## Interaction Patterns

### Gestures
- **Swipe down**: Dismiss modal or minimize video to PiP
- **Swipe up** (on video): Open comments
- **Swipe left/right** (on Shorts): Navigate videos
- **Pull to refresh**: Refresh feed
- **Long press**: Show quick actions menu

### Haptic Feedback
- **Light**: Button taps (like, subscribe, send)
- **Medium**: Toggle switches (notifications)
- **Success**: Upload complete, comment posted
- **Error**: Upload failed, network error

### Animations
- **Fade in**: Content loading
- **Slide up**: Bottom sheets, modals
- **Scale**: Button press feedback (0.97)
- **Heart animation**: Like button (scale + color change)

## Performance Considerations

### Video Loading
- Lazy load thumbnails (only visible cards)
- Preload next 2 videos in feed
- Adaptive streaming quality based on network

### Feed Optimization
- Virtual scrolling for long lists
- Pagination (load 20 videos at a time)
- Cache video metadata locally

### Real-time Features
- WebSocket connection for live chat
- Supabase Realtime for live updates
- Optimistic UI updates for likes/comments

## Accessibility
- VoiceOver support for all interactive elements
- Dynamic type support for text scaling
- High contrast mode support
- Reduced motion option (disable animations)

## Platform-Specific Considerations

### iOS
- Use SF Symbols for icons
- Native share sheet
- Picture-in-Picture support
- Background audio playback

### Android
- Material Icons
- Android share intent
- PiP mode support
- Notification controls for playback

### Web
- Responsive breakpoints
- Keyboard shortcuts (Space = play/pause, Arrow keys = seek)
- Mouse hover states
- Desktop-optimized layout (wider screens)
