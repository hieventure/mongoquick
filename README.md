# MongoKit ⚡

**Professional MongoDB toolkit for Node.js**

Zero-config database initialization with optimized indexes. Get from zero to production-ready MongoDB in 30 seconds.

## Quick Start

```bash
npm install -g mongokit
mongokit
```

The interactive setup will guide you through database creation, index optimization, and connection testing.

## What It Does

**Database Setup**: Creates and initializes your MongoDB database with production-ready configuration.

**Smart Indexes**: Automatically creates optimized indexes for common patterns:

- User authentication (email uniqueness, login performance)
- Session management (token lookups, auto-expiry)
- Event systems (status filtering, date queries)
- Team structures (unique codes, member lookups)
- Voting systems (user-vote constraints, result aggregation)

**Connection Testing**: Verifies MongoDB connectivity and measures latency before setup.

## Commands

```bash
mongokit          # Interactive setup (recommended)
mongokit test     # Test MongoDB connection
mongokit init     # Initialize database with defaults
mongokit help     # Show available commands
```

## Usage Examples

### Interactive Setup (Recommended)

```bash
mongokit
# Follow the prompts to:
# 1. Test your MongoDB connection
# 2. Name your database
# 3. Choose optimization features
# 4. Confirm and create
```

### Quick Database Initialization

```bash
mongokit init --database my_app
# Creates 'my_app' database with standard indexes
```

### Connection Testing

```bash
mongokit test
# Output: ✅ Connection successful! Latency: 5ms
```

## Framework Integration

### NestJS

```typescript
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/my_app')],
})
export class AppModule {}
```

### Express with Mongoose

```javascript
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/my_app');
```

### Pure MongoDB Driver

```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
await client.db('my_app').collection('users').findOne({});
```

## Programmatic API

```typescript
import { initializeMongo, testConnection } from 'mongokit';

// Test connection
const health = await testConnection();
console.log('Connected:', health.isConnected);

// Setup database with custom indexes
await initializeMongo({
  config: {
    uri: 'mongodb://localhost:27017',
    database: 'my_app',
  },
  createDatabase: true,
  createIndexes: [
    {
      collection: 'users',
      indexes: [
        { keys: { email: 1 }, options: { unique: true } },
        { keys: { createdAt: 1 }, options: { name: 'created_desc' } },
      ],
    },
  ],
  verbose: true,
});
```

## Environment Configuration

Create a `.env` file for custom settings:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=my_app
```

The toolkit automatically detects these variables and uses them as defaults.

## Index Optimization Details

**User Collections**: Email uniqueness, creation date sorting, login performance
**Session Collections**: Token uniqueness with TTL, user session lookups
**Event Collections**: Status filtering, date range queries, participant lookups
**Team Collections**: Unique team codes, member management, event associations
**Vote Collections**: User-vote uniqueness, result aggregation, audit trails

## Requirements

- Node.js 16 or higher
- MongoDB 4.4 or higher (local or remote)
- Write access to target database

## Troubleshooting

**Connection Failed**: Ensure MongoDB is running

```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Docker
docker run -d -p 27017:27017 mongo
```

**Permission Denied**: Check database user permissions or use admin credentials

**Index Creation Failed**: Ensure no conflicting indexes exist or drop existing ones

---

**Professional MongoDB toolkit for developers who want setup to work perfectly, immediately.**
