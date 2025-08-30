# MongoQuick ⚡

**Simple MongoDB connection tester and database initializer for Node.js**

Zero-config database connection testing and initialization. Get your MongoDB up and running in 30 seconds.

## Quick Start

```bash
npm install -g @derikhie/mongoquick
mongoquick
```

The interactive setup will guide you through database creation and connection testing.

## What It Does

**Connection Testing**: Verifies MongoDB connectivity and measures latency to ensure your database is accessible.

**Database Setup**: Creates and initializes your MongoDB database with proper configuration.

**Health Monitoring**: Provides detailed connection health information and diagnostics.

## Commands

```bash
mongoquick          # Interactive setup (recommended)
mongoquick test     # Test MongoDB connection
mongoquick init     # Initialize database with defaults
mongoquick help     # Show available commands
```

## Usage Examples

### Interactive Setup (Recommended)

```bash
mongoquick
# Follow the prompts to:
# 1. Test your MongoDB connection
# 2. Name your database
# 3. Confirm and create
```

### Quick Database Initialization

```bash
mongoquick init --database my_app
# Creates 'my_app' database
```

### Connection Testing

```bash
mongoquick test
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
import { initializeMongo, testConnection } from '@derikhie/mongoquick';

// Test connection
const health = await testConnection();
console.log('Connected:', health.isConnected);

// Setup database
await initializeMongo({
  config: {
    uri: 'mongodb://localhost:27017',
    database: 'my_app',
  },
  createDatabase: true,
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

## Features

**Simple & Fast**: Just test connections and create databases - no complex setup
**Zero Dependencies**: Minimal footprint with only essential MongoDB operations
**Environment Friendly**: Automatically detects connection settings from environment variables

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

---

**Simple MongoDB connection testing and database initialization for developers who want things to just work.**
