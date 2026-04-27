# LLM-Based Website Generation & Deployment Manual

> **Version:** 1.0  
> **Last Updated:** 2026-02-03  
> **Audience:** Developers, AI Agents, DevOps  
> **Scope:** End-to-end guide for generating, building, and deploying hotel websites using the LangGraph orchestration engine.

---

## 1. System Overview

This system utilizes a **LangGraph-based Multi-Agent Architecture** to autonomously generate high-quality, high-performance hotel websites. It transforms raw hotel parameters (name, type, vibe) into a complete Next.js website configuration, including component selection, copywriting, and design tokens.

### Key Capabilities
- **Autonomous Generation**: Agents handle analysis, design, and coding.
- **Cost-Optimized**: Designed to generate a site for <$2.00 (LLM costs).
- **Production-Ready**: Outputs valid Next.js code, Tailwind config, and optimized assets.

### Architecture Flow
The generation process follows a linear graph workflow:
1.  **Component Selector**: Selects optimal UI components from the library.
2.  **Styling Agent**: Generates design tokens and variants.
3.  **Content Generator**: Writes copy and content.
4.  **Assembly Agent**: Assembles the configuration.
5.  **Quality Validator**: Ensures the output meets basic integrity checks.

### Monitoring Progress
When running the generation script, you will see the agents executing in sequence:
1.  **ComponentSelector**: Picks the 5-8 sections for your page.
2.  **StylingAgent**: Selects visual variants (modern, classic, etc.).
3.  **ContentGenerator**: Writes the actual copy (headlines, descriptions).
4.  **AssemblyAgent**: Combines everything into one final JSON.
5.  **QualityValidator**: Checks everything against business rules and Zod schemas.

### Resilience & Fallbacks
The system includes robust features to ensure generation success:
- **Graceful Degradation**: If an agent fails (e.g., Styling), it falls back to safe defaults rather than crashing.
- **Timeout Protection**: A strict 30-minute timeout prevents hung processes.
- **Budget Enforcement**: Checks budget after each agent execution, terminating early if limits are exceeded.

For deep technical details on the agents and graph state, refer to:
👉 [LangGraph Workflows](../architecture/langgraph-workflows.md)

---

## 2. Getting Started

### Prerequisites
- **Node.js**: v18+ architecture.
- **OS**: Linux (Ubuntu/Debian recommended) or macOS.
- **API Keys**: OpenRouter API key for LLM access.

### Configuration
The system behavior is controlled by environment variables (in `web-app/.env`):
- `LLM_PROVIDER`: Set to `openrouter` (default) or `anthropic`.
- `MAX_GENERATION_COST`: Max budget in USD (default: `2.00`).

### Installation
Ensure dependencies for both the platform and the web application are installed.

```bash
# 1. Install Project Dependencies
npm install

# 2. Install Web App Dependencies
cd web-app
npm install
cd ..

# 3. Environment Setup
# Create .env or ensure web-app/.env contains:
# OPENROUTER_API_KEY=your_key_here
```

---

## 3. Website Generation

The core generation is triggered via a CLI script that invokes the LangGraph workflow.

### Usage
Run the `generate-homepage` script using `npx tsx`.

> **Note:** We must point `tsx` to the web-app's `tsconfig.json` to resolve path aliases (e.g., `@/lib/...`).

```bash
npx tsx --tsconfig web-app/tsconfig.json scripts/generate-homepage.ts \
  --name "The Grand Azure" \
  --type "luxury" \
  --audience "couples" \
  --personality "elegant" \
  --location "Maldives"
```

### Parameters
| Flag | Description | Example |
|------|-------------|---------|
| `--name` | Name of the hotel | "Seaside Resort" |
| `--type` | Classification | "luxury", "budget", "boutique", "resort", "business" |
| `--audience` | Target demographic | "business", "leisure", "family", "couples", "backpackers" |
| `--personality` | Brand voice/vibe | "elegant", "modern", "friendly", "professional", "adventurous" |
| `--location` | Physical location | "Tokyo, Japan" |
| `--output-dir` | (Optional) Custom output path | "my-generations" |

### Outputs
Artifacts are generated in the `output/` directory:
1.  **Config File**: `output/homepage-config-{hotel-id}-{timestamp}.json` (The complete site definition).
2.  **Content Files**: `output/content/{hotel-id}/` (JSON content and media manifests).

---

## 4. Building the Website

Once a configuration is generated, use the build script to compile it into a deployable static site.

### Script: `scripts/build-from-config.sh`

This script takes the generated JSON config, applies it to the `web-app` reference implementation, and builds a production-ready static site.

### Usage Examples

**Quick Build (Latest Config):**
```bash
# Shortcut script
./scripts/quick-build.sh

# Or using the main script
./scripts/build-from-config.sh
```

**Build a specific config file:**
```bash
./scripts/build-from-config.sh -c output/homepage-config-the-grand-azure-v12345.json
```

**Build ALL configs in the output directory:**
```bash
./scripts/build-from-config.sh --all
```

**Production Build (Minified & Optimized):**
```bash
./scripts/build-from-config.sh --production
```

### Build Artifacts & Output Structure
The built sites are stored in `dist/`.

```
dist/
├── unknown-hotel/                    # Website 1
│   ├── index.html                    # Homepage
│   ├── contact.html                  # Contact page
│   ├── rooms.html                    # Rooms page
│   ├── preview.html                  # Config preview
│   ├── _next/                        # Next.js assets
│   └── homepage-config.json          # Reference config
├── ocean-breeze-resort/              # Website 2 (if --all)
│   └── ...
└── index.html                        # Dashboard listing all built sites
```

---

## 5. Deployment

### Local Testing

#### Option 1: Live Preview (Dev Server)
To preview a generated site with hot reload:

```bash
# 1. Provide the config to the web app
cp output/latest-homepage-config.json web-app/public/homepage-config.json

# 2. Run the dev server
cd web-app
npm run dev
# Visit http://localhost:3000
```

#### Option 2: Serving Built Artifacts (Recommended)
After building to `dist/`, you can serve the static files directly.

**Python HTTP Server:**
```bash
# View a specific hotel
cd dist/the-grand-azure && python3 -m http.server 8000
# Visit http://localhost:8000

# OR View the dashboard of all sites
cd dist && python3 -m http.server 8000
# Visit http://localhost:8000 and click the hotel folder
```

**Open Directly in Browser:**
```bash
# Linux
xdg-open dist/the-grand-azure/index.html

# macOS
open dist/the-grand-azure/index.html
```

### Remote Deployment
Since the output is a static site (HTML/CSS/JS), it can be deployed to any static hosting service or standard web server (Nginx/Apache).

#### Deploying to Connected Server (via SSH/SCP)
Assuming you have a remote server connected and accessible via SSH:

1.  **Build the site locally**:
    ```bash
    ./scripts/build-from-config.sh --production
    ```

2.  **Transfer the files**:
    Use `scp` or `rsync` to upload the `dist/{hotel-id}` folder to your server's web root.
    ```bash
    # Example: Deploying to /var/www/html/my-hotel
    rsync -avz dist/the-grand-azure/ user@remote-server:/var/www/html/the-grand-azure/
    ```

3.  **Server Configuration (Nginx Example)**:
    Ensure your web server is configured to serve static files from that directory.
    ```nginx
    server {
        listen 80;
        server_name thegrandazure.com;
        root /var/www/html/the-grand-azure;
        index index.html;
        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

---

## 5.3 Dynamic Config Preview (Dev Only)

For rapid iteration without moving files, use the dynamic preview route. This loads configuration fixtures directly from `web-app/fixtures/configs/`.

1.  **Start the dev server**:
    ```bash
    cd web-app && npm run dev
    ```

2.  **Visit the preview URL**:
    *   **Luxury Demo**: `http://localhost:3000/preview?config=luxury-boutique`
    *   **Budget Demo**: `http://localhost:3000/preview?config=budget-hostel`
    *   **Business Demo**: `http://localhost:3000/preview?config=business-hotel`

**Features:**
*   **Hot Reload**: Edit the JSON in `web-app/fixtures/configs/` and see changes instantly.
*   **Debug Overlay**: Press `Ctrl+D` (or `Cmd+D`) to view generation metadata.

---

## 6. Context for Developers & AI Agents

This section provides a map of the codebase for agents or developers modifying the system.

### Key Directories
- **`docs/architecture/langgraph-workflows.md`**: **Truth Source** for LangGraph logic.
- **`scripts/`**: **Operational Scripts**.
    - `generate-homepage.ts`: Entry point for generation.
    - `build-from-config.sh`: Entry point for building.
- **`web-app/`**: **Reference Implementation**. The Next.js app that acts as the "template" which gets hydrated by the generated config.
- **`web-app/app/langgraph/`**: **Agent Code**. Contains the actual TypeScript implementation of the agents (ComponentSelector, StylingAgent, etc.).

### Relevant Files Linkage
- **End-to-End Architecture**: [end-to-end-architecture.md](./end-to-end-architecture.md) (Config → rendering → website)
- **Component Architecture**: [component-architecture.md](./component-architecture.md) (Router pattern, contracts, CVA)
- **Component Inventory**: [component-inventory.md](./component-inventory.md) (All 12 components)
- **Build Guide**: [BUILD_GUIDE.md](../../BUILD_GUIDE.md) (Detailed Next.js build specifics)
- **Workflow Architecture**: [langgraph-workflows.md](../architecture/langgraph-workflows.md)
- **Project Requirements**: [PRD](../architecture/prd.md)

### Common Troubleshooting

**Issue: Generation Fails Validation**
- **Check**: `HotelParametersSchema` in `web-app/app/langgraph/agents/schemas.ts`.
- **Action**: Ensure input prompts or CLI args match the schema strictness.

**Issue: "Multiple Lockfiles" during Build**
- **Context**: The `web-app` is an isolated package.
- **Action**: Always run `npm install` inside `web-app/` independently of the root.

**Issue: Remote Deploy 404s**
- **Check**: Trailing slashes in `next.config.ts`.
- **Action**: Ensure `output: 'export'` is set if doing a pure static deploy (handled by `build-from-config.sh`).
