# Stogie Backend API

A secure Node.js/Express backend for the Stogie cigar tracking mobile app, using Supabase as the database.

## 🚀 Features

- **Authentication**: Secure JWT-based auth with Supabase
- **Cigars**: CRUD operations for cigar database
- **Reviews**: User reviews and ratings system
- **Humidor**: Personal cigar collection management
- **Profiles**: User profile management
- **Security**: Rate limiting, CORS, input validation
- **Database**: PostgreSQL via Supabase with Row Level Security

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Railway

## 🏗️ Project Structure

```
backend/
├── server.js              # Main server file
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── cigars.js          # Cigar management routes
│   ├── humidor.js         # Humidor management routes
│   ├── reviews.js         # Review system routes
│   └── profiles.js        # User profile routes
├── middleware/
│   └── auth.js            # Authentication middleware
├── package.json           # Dependencies and scripts
├── railway.json           # Railway deployment config
└── README.md             # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your values:

```bash
cp env.example .env
```

Required environment variables:

```env
NODE_ENV=development
PORT=3000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=http://localhost:8081,exp://192.168.1.100:8081
```

### 3. Run Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### 4. Test the API

Visit `http://localhost:3000/health` to verify the server is running.

## 📱 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signout` - Sign out user
- `POST /api/auth/refresh` - Refresh access token

### Cigars
- `GET /api/cigars` - Get all cigars (with filtering)
- `GET /api/cigars/:id` - Get single cigar
- `POST /api/cigars` - Create new cigar (authenticated)
- `PUT /api/cigars/:id` - Update cigar (authenticated)
- `DELETE /api/cigars/:id` - Delete cigar (authenticated)
- `GET /api/cigars/search/advanced` - Advanced search

### Humidor
- `GET /api/humidor/:userId` - Get user's humidor
- `POST /api/humidor` - Add cigar to humidor (authenticated)
- `PUT /api/humidor/:entryId` - Update humidor entry (authenticated)
- `DELETE /api/humidor/:entryId` - Remove from humidor (authenticated)
- `GET /api/humidor/:userId/stats` - Get humidor statistics

### Reviews
- `GET /api/reviews` - Get recent reviews (public feed)
- `GET /api/reviews/cigar/:cigarId` - Get reviews for specific cigar
- `GET /api/reviews/user/:userId` - Get reviews by user
- `GET /api/reviews/:reviewId` - Get single review
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/:reviewId` - Update review (authenticated)
- `DELETE /api/reviews/:reviewId` - Delete review (authenticated)

### Profiles
- `GET /api/profiles/:userId` - Get user profile
- `GET /api/profiles/me` - Get current user profile (authenticated)
- `PUT /api/profiles/me` - Update profile (authenticated)
- `DELETE /api/profiles/me` - Delete account (authenticated)
- `GET /api/profiles/search` - Search profiles
- `GET /api/profiles/:userId/stats` - Get profile statistics
- `GET /api/profiles/:userId/activity` - Get user activity

## 🔒 Authentication

The API uses Supabase authentication with JWT tokens. Include the token in requests:

```javascript
Authorization: Bearer your-jwt-token
```

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**:
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Select the `backend` folder as the root

2. **Environment Variables**:
   Add these in the Railway dashboard:
   ```
   NODE_ENV=production
   SUPABASE_URL=your-supabase-url
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   JWT_SECRET=your-jwt-secret
   CORS_ORIGINS=https://yourapp.com
   ```

3. **Deploy**:
   Railway will automatically deploy when you push to your main branch.

### Manual Deployment

```bash
# Build and start
npm start
```

## 🧪 Testing

Test the health endpoint:

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "version": "1.0.0"
}
```

## 📊 Database Schema

The backend expects these Supabase tables:

- `profiles` - User profiles (extends auth.users)
- `cigars` - Cigar database
- `reviews` - User reviews and ratings
- `humidor_entries` - User's cigar collections
- `smoking_sessions` - Smoking session tracking

See the Supabase migration SQL in your project documentation.

## 🔧 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Code Style

- ES6 modules
- Async/await for promises
- Consistent error handling
- Input validation on all endpoints

## 🛡️ Security Features

- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **JWT Verification**: Secure authentication
- **Row Level Security**: Database-level access control

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
