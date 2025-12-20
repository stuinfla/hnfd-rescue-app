# Multi-Tenant Implementation Plan

## Overview

Transform HNFD Rescue App into a white-label solution that any fire/rescue department can deploy with their own branding, equipment inventory, and admin access.

---

## Architecture Options

### Option A: Single Repo + Environment Variables (Simplest)
Each town gets their own Vercel deployment from the same codebase, configured via environment variables.

**Pros:**
- Minimal code changes
- Easy to maintain single codebase
- Each town has isolated deployment

**Cons:**
- Manual setup per town
- Code updates need to propagate to all deployments

### Option B: Database-Backed Multi-Tenant (Scalable)
Single deployment serves all towns, data stored in database with tenant isolation.

**Pros:**
- Single deployment to maintain
- Centralized updates
- Better for 50+ towns

**Cons:**
- More complex architecture
- Requires backend infrastructure
- Potential single point of failure

### **Recommended: Option A** for initial rollout (10-20 towns), migrate to Option B if scale demands.

---

## Implementation Checklist

### Phase 1: Configuration System (2-3 days work)

- [ ] **Create config.js template**
  ```javascript
  // config.js - Each town customizes this
  const TENANT_CONFIG = {
    // Branding
    orgName: "Harpswell Neck Fire & Rescue",
    orgShortName: "HNFR",
    orgLogo: "/images/logo.png",
    primaryColor: "#DC2626",  // Red
    secondaryColor: "#1E3A5F", // Navy

    // Contact
    adminEmail: "admin@example.com",
    supportPhone: "207-XXX-XXXX",

    // Features
    enableVoiceSearch: true,
    enableLocationGuides: true,
    enableAdminPanel: true
  };
  ```

- [ ] **Update index.html** to use config values
  - Replace hardcoded "HNFR RESCUE" with `TENANT_CONFIG.orgShortName`
  - Replace logo path with `TENANT_CONFIG.orgLogo`
  - Use CSS variables for colors from config

- [ ] **Update app.js** to use config values
  - Replace all "HNFR" references with config values
  - Replace all "Harpswell" references with config values

### Phase 2: Equipment Data Separation (1-2 days work)

- [ ] **Create equipment-data.js template**
  ```javascript
  // equipment-data.js - Each town maintains their own
  const INVENTORY_DATABASE = {
    items: [
      // Town-specific equipment list
    ]
  };
  ```

- [ ] **Move INVENTORY_DATABASE** from app.js to separate file
- [ ] **Create data validation script** to verify equipment format
- [ ] **Create sample data template** for new towns

### Phase 3: Admin Authentication (2-3 days work)

- [ ] **Simple auth option:** Environment variable for admin PIN
  ```javascript
  // Stored in Vercel environment variables
  ADMIN_PIN=123456
  ```

- [ ] **Better auth option:** Supabase authentication
  - Free tier: 50,000 monthly active users
  - Magic link or email/password login
  - Role-based access (admin vs viewer)

- [ ] **Update admin panel** to require authentication
- [ ] **Add admin-only features:**
  - Edit equipment data
  - Upload images
  - Change branding

### Phase 4: Deployment Automation (1-2 days work)

- [ ] **Create deployment script**
  ```bash
  # deploy-new-town.sh
  # 1. Clone template repo
  # 2. Set environment variables
  # 3. Upload town logo and images
  # 4. Deploy to Vercel
  ```

- [ ] **Vercel project naming convention**
  - `hnfd-rescue.vercel.app` → Template
  - `brunswick-fd-rescue.vercel.app` → Brunswick FD
  - `{town-slug}-rescue.vercel.app` → Pattern

- [ ] **Custom domain support**
  - Allow towns to use their own domains
  - `rescue.brunswickfire.org`

### Phase 5: Image Management (2-3 days work)

- [ ] **Create image upload system**
  - Admin can upload equipment photos
  - Admin can upload location guide photos
  - Automatic image optimization

- [ ] **Storage options:**
  - Vercel Blob Storage (simple, integrated)
  - Cloudflare R2 (cheap, fast)
  - AWS S3 (enterprise-grade)

- [ ] **Image naming convention**
  ```
  /images/equipment/{item-id}.jpg
  /images/locations/{item-id}/step-{1,2,3}.jpg
  /images/branding/logo.png
  ```

---

## New Town Onboarding Process

### Step 1: Information Gathering
Town provides:
- [ ] Organization name (full and short)
- [ ] Logo (PNG, at least 192x192)
- [ ] Primary brand colors (hex codes)
- [ ] Admin email address
- [ ] Equipment list (spreadsheet)
- [ ] Equipment photos
- [ ] Location guide photos (3-step sequences)

### Step 2: Setup (30 mins - 1 hour)
- [ ] Create new Vercel project from template
- [ ] Configure environment variables
- [ ] Upload logo and images
- [ ] Import equipment data
- [ ] Set admin credentials

### Step 3: Verification
- [ ] Test all equipment search
- [ ] Test A-Z browse
- [ ] Test location guides
- [ ] Test admin login
- [ ] Test offline functionality
- [ ] Test voice search

### Step 4: Handoff
- [ ] Provide admin login credentials
- [ ] Training on admin panel
- [ ] Documentation for adding/editing equipment

---

## Technical Requirements

### Environment Variables (per deployment)
```bash
# Required
TENANT_NAME="Brunswick Fire Department"
TENANT_SHORT_NAME="BFD"
TENANT_SLUG="brunswick-fd"
ADMIN_PIN="secure-pin-here"

# Optional
PRIMARY_COLOR="#DC2626"
SECONDARY_COLOR="#1E3A5F"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_ANON_KEY="xxx"
```

### Files to Customize Per Town
```
/config.js           # Branding and settings
/equipment-data.js   # Equipment inventory
/images/branding/    # Logo and brand assets
/images/equipment/   # Equipment photos
/images/locations/   # Location guide photos
/manifest.json       # PWA name and icons
/icons/              # PWA icons (various sizes)
```

### Files Shared (Don't Modify)
```
/app.js              # Core application logic
/index.html          # UI structure (uses config)
/sw.js               # Service worker
```

---

## Cost Estimate Per Town

### Free Tier (Vercel Hobby)
- **Hosting:** $0/month (100GB bandwidth)
- **Domain:** $0 (use .vercel.app subdomain)
- **Storage:** $0 (static files in repo)
- **Auth:** $0 (simple PIN or Supabase free tier)

### Production Tier (Vercel Pro)
- **Hosting:** $20/month (1TB bandwidth, team features)
- **Domain:** $10-15/year (custom domain)
- **Storage:** ~$5/month (Vercel Blob)
- **Auth:** $0-25/month (Supabase paid tier)

### One-Time Setup
- Initial setup labor: 1-2 hours
- Equipment data entry: Depends on inventory size
- Photo processing: Depends on number of items

---

## Database Schema (If Using Option B)

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY,
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(50) NOT NULL,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment items
CREATE TABLE equipment (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  item_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(500) NOT NULL,
  compartment VARCHAR(50),
  critical BOOLEAN DEFAULT FALSE,
  critical_rank INTEGER,
  description TEXT,
  notes TEXT,
  image_url VARCHAR(500),
  aliases TEXT[], -- Array of search aliases
  search_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Location guides
CREATE TABLE location_guides (
  id UUID PRIMARY KEY,
  equipment_id UUID REFERENCES equipment(id),
  step_number INTEGER NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  description TEXT
);

-- Admins
CREATE TABLE admins (
  id UUID PRIMARY KEY,
  org_id UUID REFERENCES organizations(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Migration Path

### Current State (v2.9.0)
- Single tenant (HNFD)
- Hardcoded branding
- Embedded equipment data
- PIN-based admin

### Phase 1: Config Extraction
- Extract branding to config.js
- Extract equipment to equipment-data.js
- Template ready for duplication

### Phase 2: First External Deployment
- Test with second fire department
- Refine onboarding process
- Document common issues

### Phase 3: Streamlined Onboarding
- Automated deployment script
- Self-service admin panel
- Image upload system

### Phase 4: Scale (If Needed)
- Migrate to database-backed
- Centralized management dashboard
- Usage analytics per tenant

---

## Questions to Decide Before Starting

1. **Authentication:** Simple PIN vs. email login vs. full user system?
2. **Image hosting:** Keep in repo vs. external storage?
3. **Updates:** How to push app updates to all tenants?
4. **Support:** Who handles support for each town?
5. **Pricing:** Free for all vs. subscription model?
6. **Data ownership:** Who owns the equipment data?

---

## Estimated Timeline

| Phase | Effort | Description |
|-------|--------|-------------|
| 1 | 2-3 days | Configuration system |
| 2 | 1-2 days | Equipment data separation |
| 3 | 2-3 days | Admin authentication |
| 4 | 1-2 days | Deployment automation |
| 5 | 2-3 days | Image management |
| **Total** | **8-13 days** | Full multi-tenant ready |

---

## Next Steps

1. **Decide on architecture** (Option A vs B)
2. **Extract config.js** from current hardcoded values
3. **Test with one additional fire department** as pilot
4. **Iterate based on pilot feedback**
5. **Scale to more departments**

---

*This plan is for reference only - implementation not started yet.*
