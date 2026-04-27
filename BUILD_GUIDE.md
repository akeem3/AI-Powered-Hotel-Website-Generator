# 🏨 LLM-Driven Hotel Website Generator - Build Guide

This guide explains how to build and develop the Sterling Executive reference implementation within the larger LLM generation platform.

## 📁 Project Structure

```
/home/ric/et-llm-websites/          # Platform workspace (Git root)
├── .bmad-core/                     # BMAD framework
├── docs/                          # Documentation & PRD
├── web-app/                       # ✅ Next.js reference implementation
│   ├── package.json               # Web app dependencies
│   ├── package-lock.json          # Web app lock file
│   ├── next.config.ts             # Next.js configuration
│   └── ...                        # Next.js app files
├── web-bundles/                   # BMAD agent bundles
├── build.sh                       # 🚀 Platform build script
└── BUILD_GUIDE.md                 # This guide
```

**Key Principle**: `web-app/` is an **independent Next.js application** within a larger platform workspace.

## 🚀 Quick Start

### Option 1: Use the Platform Build Script (Recommended)
```bash
# From anywhere in the project
./build.sh dev     # Start development server
./build.sh build   # Build for production
./build.sh test    # Run tests
./build.sh validate # Validate project structure
```

### Option 2: Direct Next.js Commands
```bash
# Navigate to web-app directory
cd web-app

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🔧 Build Configuration

### Next.js Configuration (`web-app/next.config.ts`)
- **Workspace Isolation**: `outputFileTracingRoot: process.cwd()` prevents parent workspace detection
- **Image Optimization**: Configured for hotel website images
- **Package Optimization**: Optimizes imports for better performance
- **TypeScript & ESLint**: Strict validation maintained

### Package Management Isolation
- **Independent Dependencies**: `web-app/` has its own `package.json` and `node_modules/`
- **No Global Dependencies**: Build process uses only local packages
- **Clean Separation**: Platform workspace has no Node.js dependencies

## 📦 Build Output

### Development
```bash
./build.sh dev
# Starts dev server at http://localhost:3000
# Hot reload enabled
# TypeScript and ESLint checking
```

### Production Build
```bash
./build.sh build
# Output: web-app/.next/
# Optimized and minified
# Static pages pre-rendered
# Ready for deployment
```

### Build Metrics
- **Build Time**: ~2 seconds (as demonstrated)
- **Bundle Size**: 102 kB First Load JS
- **Static Pages**: 4 pages pre-rendered
- **Performance**: Optimized for Core Web Vitals

## 🎯 Common Build Issues & Solutions

### Issue 1: "Multiple lockfiles detected"
**Problem**: Next.js detects conflicting lock files
**Solution**: Fixed by `outputFileTracingRoot: process.cwd()` in next.config.ts

### Issue 2: "Workspace root detection"
**Problem**: Next.js thinks parent directory is workspace root
**Solution**: Explicit tracing root configuration prevents this

### Issue 3: ESLint errors
**Problem**: Linting failures during build
**Solution**: Fix linting issues (like unused imports) or configure as needed

### Issue 4: Global npm interference
**Problem**: Using global npm packages instead of local
**Solution**: Build script ensures `NODE_PATH` points to local node_modules

## 🧪 Testing

### Run Tests
```bash
./build.sh test
# or
cd web-app && npm test
```

### Test Configuration
- **Framework**: Jest with React Testing Library
- **Coverage**: Component testing with accessibility validation
- **Mocking**: Proper API mocking for development

## 🚀 Deployment

### Static Export (Future)
Add to `next.config.ts` when ready for static deployment:
```typescript
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};
```

### Deployment Options
1. **Vercel**: Automatic deployment from Git
2. **Netlify**: Static site deployment
3. **CloudFlare Pages**: Static site with CDN
4. **Docker**: Containerized deployment

## 🔍 Project Validation

The build script includes comprehensive validation:
```bash
./build.sh validate
```

**Validates**:
- ✅ Required files exist
- ✅ Project structure integrity
- ✅ Configuration files present
- ✅ Documentation completeness

## 📚 Development Workflow

### Daily Development
1. Navigate to project root: `cd /home/ric/et-llm-websites`
2. Start development: `./build.sh dev`
3. Make changes in `web-app/`
4. Tests run automatically
5. Build process validates changes

### Feature Development
1. Create feature branch
2. Make changes in `web-app/`
3. Test thoroughly: `./build.sh test`
4. Validate build: `./build.sh build`
5. Commit changes

### Release Process
1. Validate structure: `./build.sh validate`
2. Run full test suite: `./build.sh test`
3. Build production: `./build.sh build`
4. Deploy build output
5. Monitor performance

## 🎉 Success Indicators

✅ **Build passes without errors or warnings**
✅ **Development server starts at http://localhost:3000**
✅ **All pages load correctly**
✅ **ESLint and TypeScript validation passes**
✅ **Bundle size is optimized (<150KB initial JS)**
✅ **Project structure validation passes**

## 🆘 Troubleshooting

### Build Failures
```bash
# Clean and rebuild
cd web-app
rm -rf node_modules .next
npm install
cd ..
./build.sh build
```

### Dependency Issues
```bash
# Fresh dependency install
cd web-app
rm -rf node_modules package-lock.json
npm install
```

### Port Conflicts
```bash
# Kill processes on port 3000
lsof -ti:3000 | xargs kill -9
./build.sh dev
```

## 📖 Additional Resources

- **PRD**: `/docs/prd.md` - Complete project requirements
- **Architecture**: `/docs/02-architecture/` - Technical specifications
- **Components**: `/docs/03-component-system/` - Component library docs
- **BMAD Framework**: `/.bmad-core/` - Agent and workflow documentation

---

**Note**: This structure supports both the immediate hotel website development and the future LLM-driven generation platform. The `web-app/` serves as the reference implementation that demonstrates all patterns and components needed for autonomous generation.