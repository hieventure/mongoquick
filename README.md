# MongoQuick ⚡

**Smart MongoDB connection management with profiles, testing, and database initialization**

Zero-config MongoDB connection management and database setup. Switch between environments instantly, test connections with detailed diagnostics, and initialize databases with confidence.

## 🚀 Quick Start

```bash
npm install -g @derikhie/mongoquick
mongoquick profile add --name local --uri mongodb://localhost:27017
mongoquick profile list
```

## ✨ What It Does

**🔗 Smart Connection Management**: Save and switch between multiple MongoDB environments instantly

**🧪 Connection Testing**: Verify connectivity with detailed health diagnostics including latency, topology, and server version

**📊 Database Setup**: Create and initialize MongoDB databases with proper configuration

**🔒 Secure Storage**: Encrypted credential storage with AES-256-CBC encryption

## 📋 Commands

### Profile Management

```bash
mongoquick profile add --name <name> --uri <uri> [options]    # Add connection profile
mongoquick profile list [--verbose] [--json]                 # List all profiles
mongoquick profile use <profile-name>                        # Switch to profile
mongoquick profile test [profile-name] [--verbose]           # Test connections
mongoquick profile current                                   # Show current profile
mongoquick profile remove <profile-name> [--force]          # Remove profile
mongoquick profile export                                    # Export profiles
```

### Database Operations

```bash
mongoquick                    # Interactive setup wizard
mongoquick test               # Test current connection
mongoquick init --database   # Initialize database
mongoquick help               # Show all commands
```

## 🎯 Usage Examples

### Environment Management

```bash
# Add your development environment
mongoquick profile add --name dev --uri mongodb://localhost:27017 --env development

# Add staging with database specification
mongoquick profile add --name staging --uri mongodb://staging.company.com:27017 --database myapp_staging --env staging

# Add production (Atlas)
mongoquick profile add --name prod --uri mongodb+srv://cluster.mongodb.net --env production --default

# Switch between environments instantly
mongoquick profile use dev     # Switch to development
mongoquick profile use prod    # Switch to production
```

### Connection Testing

```bash
# Test current environment
mongoquick profile test

# Test specific environment
mongoquick profile test prod

# Test all environments with details
mongoquick profile test --verbose
```

### Profile Management

```bash
# List all your environments
mongoquick profile list
┌─────────────────────────────────────────────┐
│  MongoQuick Profiles (3)                   │
├─────────────────────────────────────────────┤
│  🌟 prod      🟥 production               │
│      URI: mongodb+srv://***:***@cluster... │
│      Database: myapp                       │
│                                             │
│     staging   🟨 staging                   │
│      URI: mongodb://staging.company...     │
│      Database: myapp_staging               │
│                                             │
│     dev       🟦 development               │
│      URI: mongodb://localhost:27017        │
└─────────────────────────────────────────────┘

# Show current environment
mongoquick profile current
```

## 🔧 Framework Integration

### NestJS

```typescript
import { MongooseModule } from '@nestjs/mongoose';

// Use your MongoQuick profile
@Module({
  imports: [MongooseModule.forRoot('mongodb://localhost:27017/myapp')],
})
export class AppModule {}
```

### Express with Mongoose

```javascript
const mongoose = require('mongoose');
// Connect using your MongoQuick profile
mongoose.connect('mongodb://localhost:27017/myapp');
```

### Pure MongoDB Driver

```javascript
const { MongoClient } = require('mongodb');
const client = new MongoClient('mongodb://localhost:27017');
await client.db('myapp').collection('users').findOne({});
```

## 🛠️ Programmatic API

```typescript
import { initializeMongo, testConnection } from '@derikhie/mongoquick';

// Test connection health
const health = await testConnection();
console.log('Connected:', health.isConnected);
console.log('Latency:', health.latency + 'ms');

// Initialize database
await initializeMongo({
  config: {
    uri: 'mongodb://localhost:27017',
    database: 'myapp',
  },
  createDatabase: true,
  verbose: true,
});
```

## ⚙️ Environment Configuration

Create a `.env` file for default settings:

```env
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=myapp
MONGOQUICK_KEY=your-encryption-key
```

The toolkit automatically detects these variables and uses them as defaults.

## ✨ Features

**🎯 Smart Environment Detection**: Automatically detects environment from profile names and URIs

**🔐 Secure Credential Storage**: AES-256-CBC encryption keeps your credentials safe

**⚡ Fast Connection Testing**: Concurrent testing with detailed diagnostics

**🎨 Beautiful CLI**: Intuitive interface with helpful error messages and suggestions

**📊 Rich Diagnostics**: Server version, topology, latency, and connection count

**🔄 Environment Switching**: One command to switch between dev, staging, and production

## 🏗️ Add Options

```bash
mongoquick profile add [options]

Options:
  --name, -n        Profile name (required)
  --uri, -u         MongoDB URI (required)
  --database, -d    Default database name
  --env, -e         Environment (local, dev, staging, prod)
  --default         Set as default profile
```

## 🧪 Connection Health

MongoQuick provides comprehensive connection diagnostics:

- ✅ **Connection Status**: Success/failure with detailed error messages
- ⚡ **Latency**: Real-time connection speed measurement
- 🏗️ **Topology**: Single, ReplicaSet, or Sharded cluster detection
- 📝 **Server Version**: MongoDB version information
- 🔢 **Active Connections**: Current connection pool status
- 🔁 **Replica Set**: Primary/secondary status and replica set name

## 🔒 Security

- **Encrypted Storage**: All URIs encrypted with AES-256-CBC
- **Credential Masking**: Passwords never shown in output or logs
- **Secure Defaults**: Safe file permissions and storage locations
- **No Network Leakage**: Credentials never transmitted unencrypted

## 📋 Requirements

- Node.js 16 or higher
- MongoDB 4.4 or higher (local or remote)
- Write access to home directory (for profile storage)

## 🚨 Troubleshooting

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

**Profile Not Found**: Use `mongoquick profile list` to see available profiles

---

**Smart MongoDB connection management for developers who want environment switching to just work.**
