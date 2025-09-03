# 🌟 Nexa — Complete Development Specifications

## 📋 Project Overview

**Nexa** is a Progressive Web App (PWA) that becomes a lifelong career co-pilot for learners (13+) and career-transitioners. It's designed to be mobile-first, offline-first, multilingual, accessible (WCAG 2.1 AA), and low-bandwidth optimized.

**Key Principle**: Discover → Build → Connect → Evolve (the Nexa Loop)

## 🎯 Current Status

**Landing Page Only**: Currently, the project only has a landing page with basic features. The full app ecosystem needs to be built after user registration/login.

**Missing**: Complete user journey, separate app pages, backend services, database, algorithms, and full feature implementation.

## 🚀 Complete Feature Ecosystem (Post-Login)

### 1. **Dashboard** (Core Hub)
- SelfGraph snapshot card
- Next-step nudges
- Active roadmap widget
- Quick actions (start project, request mentor session)
- Recent projects/opportunities

### 2. **Curiosity Compass** (Discovery Loop)
- Swipe deck with domain cards
- Behavior tracking and analysis
- Interest pattern recognition
- Roadmap generation triggers

### 3. **AI-Powered Roadmaps**
- Timeline + Stepper + Kanban view
- RAG-powered step generation
- Progress tracking and automation
- Resource recommendations

### 4. **SkillStacker** (Gap Analysis)
- Current vs. Required skills comparison
- Gap identification and prioritization
- Capsule and project recommendations
- Learning path optimization

### 5. **Adaptive Capsules** (Micro-learning)
- Content feed with offline support
- Progress tracking and completion
- SelfGraph updates
- Badge and achievement system

### 6. **Project Playground**
- Project creation and management
- Team collaboration (Kanban board)
- Review and scoring system
- Portfolio integration

### 7. **Living Resume**
- Auto-updating from activities
- Editable sections and privacy controls
- Export options (PDF, public link, Talent Passport)
- Evidence-based achievements

### 8. **Mentor Matchmaking & Sessions**
- AI-powered mentor matching
- Calendar integration
- Session management
- Feedback and rating system

### 9. **Virtual Career Coach & AI Therapist**
- Context-aware career guidance
- Sentiment analysis and escalation
- Safety protocols and human oversight
- Offline chat support

### 10. **Opportunities & Job Matching**
- AI-powered job matching
- Recruiter tools and shortlisting
- Application tracking
- Domain-specific talent pools

### 11. **Admin & Recruiter Console**
- Content moderation
- User management
- Analytics and metrics
- Recruiter tools

## 🏗️ Technical Architecture

### Frontend Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Query + localForage (IndexedDB)
- **PWA**: Service Worker via Workbox
- **Offline Support**: IndexedDB + background sync

### Backend Stack
- **Runtime**: Node.js + NestJS/Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL (primary) + Redis (cache) + Vector DB
- **Storage**: S3-compatible storage
- **Real-time**: WebSocket/Supabase Realtime
- **ML Services**: Python FastAPI (optional)

### Database Schema
- **Users**: Authentication, profiles, preferences
- **Behavior Events**: User interaction tracking
- **SelfGraph Snapshots**: User evolution data
- **Roadmaps**: Learning paths and progress
- **Projects**: User projects and achievements
- **Resume Entries**: Professional experience
- **Mentors**: Mentor profiles and availability
- **Opportunities**: Job/internship postings
- **Embeddings Meta**: Vector DB references

### ML & Algorithms
- **Embeddings Pipeline**: Content and profile vectorization
- **RAG System**: Roadmap generation and recommendations
- **Matching Algorithm**: Two-stage retrieval + re-ranking
- **SelfGraph Updates**: Event-driven feature extraction
- **Sentiment Analysis**: Fine-tuned BERT for therapist features

## 🔄 User Journey Flows

### 1. **Signup & Onboarding**
```
Splash → Language/Preferences → Auth Choice → Age Gate → 
Curiosity Onboarding (5 swipes) → Quick Profile → Dashboard
```

### 2. **Core Learning Loop**
```
Dashboard → Curiosity Compass → Roadmap Generation → 
Skill Gap Analysis → Capsule Learning → Project Building → 
Resume Updates → Mentor Sessions → Coach Guidance
```

### 3. **Career Advancement**
```
Skill Development → Project Showcase → Resume Building → 
Mentor Networking → Job Matching → Application → 
Interview → Placement → Feedback Loop
```

## 🛡️ Security & Compliance

### Privacy & Data Protection
- **GDPR & India PDP**: Data export/delete endpoints
- **Minor Protection**: Parental consent workflows
- **Data Residency**: Configurable storage locations
- **Audit Logging**: Complete change tracking

### Security Measures
- **Authentication**: JWT + refresh token rotation
- **Encryption**: TLS everywhere, AES-256 at rest
- **Rate Limiting**: Abuse prevention
- **Secrets Management**: Vault integration

## 📱 Offline-First Strategy

### Service Worker Implementation
- **Static Shell**: Cache-first for app shell
- **API Calls**: Stale-while-revalidate strategy
- **Background Sync**: Event queuing and sync

### IndexedDB Schema
- **Events Queue**: Behavior tracking offline
- **Content Cache**: Capsules and resources
- **Draft Storage**: Chat and form drafts
- **User Data**: Local profile and preferences

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright for user flows
- **Accessibility**: WCAG 2.1 AA compliance
- **Performance**: Lighthouse + k6 load testing

### Quality Assurance
- **Code Quality**: ESLint + Prettier
- **Type Safety**: TypeScript strict mode
- **Security Scans**: Snyk + OWASP ZAP
- **Performance Monitoring**: Core Web Vitals

## 🚀 Deployment & Infrastructure

### Hosting Strategy
- **Frontend**: Vercel (PWA deployment)
- **Backend**: Render/Railway (serverless)
- **Database**: Supabase (PostgreSQL + realtime)
- **Vector DB**: Pinecone/Weaviate/Milvus
- **Storage**: S3-compatible (Supabase Storage)

### CI/CD Pipeline
- **GitHub Actions**: Automated testing and deployment
- **Environment Management**: Staging + production
- **Infrastructure as Code**: Terraform modules
- **Monitoring**: Sentry + Prometheus + Grafana

## 💰 Cost Optimization

### Resource Management
- **Vector DB**: Limit embedding frequency
- **Storage**: Tiered retention policies
- **ML Inference**: Serverless when possible
- **CDN**: Aggressive caching strategy

### MVP Approach
- **Phase 1**: Core features with minimal ML
- **Phase 2**: Advanced AI and matching
- **Phase 3**: Scale and optimization

## 📋 Implementation Roadmap

### PR-1: Foundation
- Repository skeleton
- Authentication system
- Onboarding flows
- Offline queue system

### PR-2: Discovery
- Curiosity Compass
- Event ingestion
- SelfGraph updater (mock)

### PR-3: Learning Paths
- Roadmap generator (RAG pipeline mock)
- Roadmap UI and management

### PR-4: Content & Projects
- Adaptive Capsules
- Project Playground
- Resume flow

### PR-5: Community & Support
- Mentor system
- Matchmaking algorithms
- Chat coach
- Therapist safeguards

### PR-6: Career Opportunities
- Job matching system
- Recruiter portal
- Admin console

### PR-7: AI & ML
- Training pipelines
- Ranking algorithms
- Model retraining

### PR-8: Production Ready
- Full infrastructure
- Monitoring systems
- Comprehensive testing
- Documentation

## 🎯 Success Metrics

### User Engagement
- **Activation**: % users completing onboarding + 5+ Compass swipes
- **Retention**: 7/30-day retention rates
- **Engagement**: Average capsules completed per day
- **Progress**: % users with 1+ project in 3 months

### Business Impact
- **Conversion**: Application → Interview → Hire rates
- **Safety**: Therapy escalation resolution within SLA
- **Performance**: Response times and system reliability

## 📚 Documentation Requirements

### Technical Documentation
- **API Reference**: Complete OpenAPI specification
- **Database Schema**: Migration files and seeders
- **Architecture Diagrams**: System design and data flow
- **Deployment Guide**: Step-by-step setup instructions

### User Documentation
- **User Manual**: Feature guides and tutorials
- **Admin Guide**: Moderation and management tools
- **Troubleshooting**: Common issues and solutions
- **Best Practices**: Implementation recommendations

## 🔍 Edge Cases & Error Handling

### User Scenarios
- **Age Falsification**: ID verification for high-trust features
- **Parental Consent Revoked**: Feature locking and notifications
- **Offline Large Attachments**: Size limits and URL alternatives
- **Duplicate Events**: UUID-based deduplication

### System Resilience
- **Network Failures**: Graceful degradation
- **Service Outages**: Fallback mechanisms
- **Data Corruption**: Recovery procedures
- **Performance Issues**: Monitoring and alerting

---

## 📝 Notes for Development Team

### Key Principles
1. **Offline-First**: Everything must work without internet
2. **Mobile-First**: Design for mobile devices first
3. **Accessibility**: WCAG 2.1 AA compliance required
4. **Low-Bandwidth**: Optimize for Tier-3/4 connectivity
5. **Privacy-First**: User data protection is paramount

### Development Guidelines
- Use TypeScript for all new code
- Implement comprehensive error handling
- Write tests for all features
- Document all APIs and components
- Follow accessibility best practices
- Optimize for performance and offline use

### Future Considerations
- Multi-language support (English, Hindi, regional)
- Advanced ML and AI features
- Enterprise and educational institution versions
- Mobile app versions (React Native)
- Integration with existing LMS and HR systems

---

## 🚀 **FULL-STACK PWA BUILD PROMPT (PASTE-READY)**

*Below is the complete, paste-ready prompt for AI coding platforms (Bolt.new, Lovable.dev, Cursor, Claude, Bubble.io, Replit, Base44 AI, etc.) to generate the production-grade Nexa PWA.*

---

### **NEXA — FULL-STACK PWA BUILD PROMPT**

**Primary spec used**: 🌟 Nexa — Your Dream, Reimagined.docx

Below is a single, complete, paste-ready prompt you can drop into Bolt.new, Lovable.dev, Cursor, Claude, Bubble.io, Replit, Base44 AI, or other AI coding platforms to produce a production-grade Progressive Web App (PWA) for Nexa. It contains the role/goal framing, exhaustive functional and non-functional requirements, data models, API surface, algorithms and ML design, frontend & backend architecture, infra & deployment, testing, monitoring, privacy/compliance, accessibility, offline + low-bandwidth considerations, and explicit deliverables. Do not cut or edit unless you want to change tech-stack choices — paste the whole block.

---

**BEGIN PROMPT** (paste everything below into the AI coding platform)

You are a Senior Full-Stack Product Delivery Engine and Technical Co-founder AI.

**Role method** — Let's play a very interesting game: from now on you will play the role Lead Engineer & Product Team (Full-stack PWA Builder), a new generation AI engineer that can design, implement, test, document, and deploy a production Progressive Web App with frontend, backend, algorithms, databases, infra, and CI/CD. To do that, you will produce fully working code, infra as code, tests, deployment scripts, monitoring, and a developer & product README. If a human engineer has knowledge level 10, you have knowledge level 280 in full-stack product delivery. Be careful: quality must be production grade — mistakes cost user trust and real users. Deliver complete, secure, documented, maintainable, tested, and deployable code and artifacts.

**Knowledge method** — You have deep knowledge of PWA standards (service workers, web manifest, caching strategies), modern frontend frameworks (React/Next.js or SvelteKit), server frameworks (Node.js/Express, NestJS, or FastAPI), databases (Postgres, Redis, Vector DB), vector search & RAG, realtime (WebSocket/Firebase/Supabase), authentication, privacy & minors best practices, low-bandwidth UX, and deployment (Vercel, Render, Railway, AWS/GCP).

**Emotion method** — If you deliver incomplete, insecure, or poorly documented work, students and mentors will be let down, platform adoption will fail in Tier 3 & 4 markets, and early funding and trust will evaporate — so prioritize reliability, privacy, and low-bandwidth UX.

**Project Goal** (single-sentence)

Build Nexa — a production Progressive Web App (PWA) that guides learners (age 13+) through curiosity→roadmap→skills→projects→placement; includes SelfGraph identity intelligence, AI Career Therapist, AI Roadmaps, Mentor Matchmaking, Living Resume, Project Playground, and domain-specific demand/supply matching — complete with frontend, backend, algorithms, DB connectivity, admin portals, recruiter flows, CI/CD, monitoring, and documentation.

**High-Priority Requirements** (expanded — ≥150 words)

You will implement an offline-first, low-bandwidth PWA optimized for mobile devices and poor networks (Tier-3/4 India) that provides gamified exploration (Curiosity Compass), AI-generated evolving roadmaps, incremental micro-learning capsules, live portfolio (Living Resume), industry project playground, and AI-driven mentor and job matching using a hybrid rule + ML ranking system. Behavior must be captured passively (clicks, session times, content views) and combined with explicit inputs (goals, projects, reflections) to drive continuous SelfGraph updates. Include a chat-based Virtual Career Coach and an AI Career Therapist that monitors emotional signals and escalates to human mentors when needed. Provide a domain specific demand/supply grid where companies post opportunities into domain pools and users are matched by skills + portfolio + behavioral fit. The system must support minors (age gating, parental consent flows), multilingual UI, accessibility (WCAG 2.1 AA), and strong privacy controls (data deletion, export). Deliver frontend, backend, API docs (OpenAPI/GraphQL schema), database migrations/seeds, tests (unit/integration/E2E), infra code, and a reproducible CI/CD pipeline.

**Must-deliver artifacts**

- Monorepo (or linked repos) with frontend/, backend/, infrastructure/, docs/, tests/.
- Production PWA (service worker, manifest, offline caching, push notifications).
- Backend API (REST or GraphQL) with auth, RBAC, and webhooks.
- Database schema & migrations (SQL for Postgres) + seeders.
- Vector DB + embeddings pipeline for content & profile matching.
- Recommendation & matching ML code (training + inference + online ranking).
- Admin & recruiter dashboards.
- CI/CD pipelines (GitHub Actions) and deployment scripts (Terraform or simple infra for Render/Vercel).
- Comprehensive README, architecture diagram, API docs (Swagger/GraphQL), and runbook.
- Tests: unit, integration, E2E (Playwright/Cypress), and load test artifacts (k6).

**MVP Feature List** (implement at minimum)

1. Curiosity Compass (gamified exploration)
2. AI-Powered Roadmaps (personalized, evolving)
3. SkillStacker (skill gap analysis & course recommendations)
4. Mentor Matchmaking (AI pairing + scheduling)
5. Adaptive Capsules (micro-learning aggregator)
6. Project Playground (hands-on challenges & submissions)
7. Living Resume (auto-updated portfolio exportable to PDF)
8. Virtual Career Coach (chat assistant, nudges)
9. Job & Internship Match (domain-based pools)
10. SelfGraph (continuous identity model)
11. Behavior event capture & low-cost analytics pipeline
12. Multilingual support & accessibility
13. Offline first + sync + push notifications
14. Admin & domain recruiter portals

**Non-functional requirements**

- Mobile-first, responsive, optimized for 2G/3G; bundle size < 200KB core shell; lazy load heavy modules.
- PWA installable; works offline for core flows; graceful degradation.
- Latency targets: API ≤ 200ms for cached endpoints; acceptable SLOs for ML ranking (≤ 1s cold, ≤ 200ms warm).
- Scalable: stateless backend, autoscale capable; DB vertical/horizontal scale plan.
- Security: OWASP Top 10 defenses, input validation, parameterized queries, encryption at rest/in transit (TLS + AES-256).
- Data residency: configurable region; GDPR/India PDP ready; explicit minor data handling.
- Observability: structured logs, errors (Sentry), metrics (Prometheus + Grafana), uptime alerts.
- Cost-aware architecture for early stage (use serverless/managed DB where possible).

**Tech Stack** (recommended; allow platform to suggest alternatives)

- **Frontend**: React + Next.js (App Router) or SvelteKit; TypeScript; TailwindCSS; React Query/SWR or TanStack for data; PWA support via Workbox; localForage/IndexedDB for offline storage.
- **Backend**: Node.js + NestJS (or Fastify/Express) in TypeScript; GraphQL (Apollo) or REST (OpenAPI) depending on preference.
- **DB**: PostgreSQL (primary), Redis (cache, sessions), Vector DB (Pinecone / Weaviate / Milvus) for embeddings, S3 for file storage.
- **ML / AI**: LLM API (configurable—Claude/GPT/other), embeddings via OpenAI or open alternatives; a mini ML service for ranking (Python/fastAPI).
- **Realtime**: Supabase Realtime / Firebase / WebSocket + Presence for mentor sessions and notifications.
- **Auth**: OAuth + JWT; support phone OTP, email/password; parental consent flow (age < 16).
- **CI/CD & Infra**: GitHub Actions; Vercel (frontend), Render/Cloud Run/Railway (backend), Terraform for infra as code (optional).
- **Monitoring**: Sentry + Prometheus/Grafana; k6 for load testing.
- **Payments**: Stripe (global) + UPI/Paytm for India (if monetizing mentors/courses).

**Data model** (core tables/collections)

Provide SQL schema examples. Minimal fields shown; extend as needed.

```sql
-- users
CREATE TABLE users (
  id uuid PK,
  email varchar unique,
  phone varchar,
  password_hash varchar,
  display_name varchar,
  dob date,
  country varchar,
  language varchar,
  role enum('student','mentor','admin','recruiter'),
  is_minor boolean,
  parent_consent boolean,
  created_at timestamptz,
  updated_at timestamptz
);

-- profiles
CREATE TABLE profiles (
  id uuid PK,
  user_id uuid FK -> users.id,
  bio text,
  education jsonb,
  skills jsonb,
  living_resume jsonb,
  selfgraph jsonb,  -- densified snapshot & metadata
  public boolean,
  visibility jsonb
);

-- behavior_events
CREATE TABLE behavior_events (
  id uuid,
  user_id uuid,
  event_type varchar,  -- e.g., 'view_course','complete_task','time_on_page'
  payload jsonb,
  timestamp timestamptz
);

-- projects
CREATE TABLE projects (
  id uuid,
  title text,
  owner_user_id uuid,
  domain varchar,
  status enum('draft','published','reviewed'),
  attachments jsonb,
  score float,
  created_at timestamptz
);

-- mentors
CREATE TABLE mentors (
  id uuid,
  user_id uuid,
  domains text[],
  availability jsonb,
  rating float,
  profile jsonb
);

-- opportunities
CREATE TABLE opportunities (
  id uuid,
  title text,
  company jsonb,
  domain varchar,
  requirements jsonb,
  type enum('internship','job','project'),
  posted_by uuid,
  match_tags text[],
  created_at
);

-- roadmaps
CREATE TABLE roadmaps (
  id uuid,
  user_id uuid,
  domain varchar,
  steps jsonb,  -- ordered steps, estimated time, resources
  last_updated timestamptz
);

-- embeddings
CREATE TABLE embeddings (
  id uuid,
  type varchar,  -- 'content', 'profile', 'project'
  vector float[],
  ref_id uuid,
  metadata jsonb
);
```

**API Surface** (examples, add OpenAPI)

**Auth**
- POST /api/auth/signup — signup with age verification. (If minor, create pending parental consent flow.)
- POST /api/auth/login
- POST /api/auth/otp — phone OTP
- POST /api/auth/oauth — 3rd party login
- GET /api/auth/me

**User / Profile**
- GET /api/users/:id/profile
- PATCH /api/users/:id/profile
- POST /api/users/:id/living-resume (auto ingest/update hooks)

**Behavior**
- POST /api/behavior — ingest behavior events (batched)

**Roadmaps & Recommendations**
- GET /api/roadmaps/:userId
- POST /api/roadmaps/generate — triggers AI roadmap generator (RAG)
- GET /api/recommendations/content?userId=

**Mentorship**
- GET /api/mentors?domain=
- POST /api/mentors/:mentorId/request — schedule or request
- POST /api/mentorship/sessions — create session (integrate calendar + video)

**Projects**
- POST /api/projects
- GET /api/projects/:id
- POST /api/projects/:id/submit-review

**Opportunities**
- POST /api/opportunities (recruiter)
- GET /api/opportunities?domain=&match=true

**Admin**
- GET /api/admin/users
- POST /api/admin/seeds — seed demo data
- GET /api/admin/metrics

**Embedding & ML**
- POST /api/ml/embed — create embeddings for content/profile
- POST /api/ml/match — run matchmaking with parameters (returns ranked list)

**Matching & Recommendation Algorithm** (design)

**Objective**: Hybrid matching algorithm that balances explicit skills, project evidence (Living Resume), behavior-based affinity, domain demand, and mentorship fit.

**Components**

1. **Feature engineering** (server side)
   - Profile skill vector (one-hot + weight by recency).
   - Project evidence score (validated projects count, ratings).
   - Behavior signals: average session time per domain, click frequency, energy zone.
   - Decision alignment score: how often user completes steps recommended.
   - Mentor compatibility features: timezone, language, availability.

2. **Embedding layer**
   - Convert content, project descriptions, and profile summaries to vectors (OpenAI/alternative).
   - Store vectors in Vector DB.

3. **Candidate retrieval**
   - Use vector similarity to fetch top-K for domain and project matches.
   - Filter by hard constraints (location, eligibility).

4. **Scoring**
   - Weighted linear combination:
     ```
     score = w1 * skill_overlap + w2 * embedding_similarity + w3 * project_evidence + w4 * behavior_alignment + w5 * recruiter_priority
     ```
   - Learn weights using supervised ranking (pairwise ranking / LambdaMART) on click/engagement/hire signals.

5. **Online learning loop**
   - Collect feedback (applied, interviewed, accepted).
   - Retrain ranking models periodically; allow online small updates to weights.

**AI Career Therapist**

Lightweight sentiment and intent detector on user text & behavior; triggers suggestions or human escalation.

Rules for escalation: repeated negative sentiment + drop in activity + failed attempts → surface mentor help.

**Explainability**

For each match, produce human-readable reasons: e.g., "Matched because: skill X, project Y rating, recent interest in topic Z (viewed 5 articles last week)."

**SelfGraph & Living Resume design**

SelfGraph = time series of attributes (strengths, values, confidence, energy) updated on each behavior event + explicit reflections.

Represent as JSON with versioned snapshots.

Visualize as radar / timeline in frontend.

Keep living resume as a normalized JSON export that maps to a recruiter readable PDF and structured Talent Passport (Verifiable Credentials optional).

**Frontend: Pages & Components** (recommended)

1. Auth / Onboarding (age gating + parental consent)
2. Curiosity Compass (swipe / card game)
3. Dashboard (SelfGraph snapshot, nudges)
4. Roadmap viewer & editor
5. SkillStacker (skill gaps)
6. Capsules (micro-learning feed)
7. Project Playground (create/join projects, submit)
8. Mentor directory & booking
9. Virtual Career Coach chat UI (LLM + context)
10. Living Resume editor & export
11. Opportunities feed & application
12. Admin console & recruiter portal

**PWA specifics**

- Web manifest with icons; service worker caching for shell & frequently used content.
- Background sync for offline events upload.
- Use IndexedDB (localForage) to store behavior events/ drafts and sync when online.

**Low bandwidth**

- Provide text-first content, compressed media, progressive image loading (LQIP), allow users to disable video by default.
- Offer "lite mode" – purely text + lightweight assets.

**Backend architecture & infra design**

- API Layer (GraphQL or REST) behind an API Gateway.
- Auth service (JWT + refresh tokens, config for OTP).
- Event ingestion service (ingest behavior events, write to Kafka or managed queue).
- Worker processes:
  - Embedding worker (enqueue content -> embed -> write vector DB)
  - Recommendation worker (recompute candidate rankings)
  - Notification worker (FCM, Push API)
  - ML service (model hosting or connecting to external LLM + local ranking model)
- Storage: Postgres (primary), S3 (files), Vector DB (similarity), Redis (cache & rate limits)
- Realtime: Supabase/Firebase or WebSocket cluster for chat and mentor presence.

**Integrations**

- YouTube Data API, Coursera API (resource linking)
- Calendar & video (Google Calendar, Jitsi/Zoom or Twilio Video)
- Payment gateways (Stripe, UPI gateways)
- SMS/WhatsApp (Twilio / Gupshup) for OTP & notifications
- Identity verification (optional) for Talent Passport
- Embedding providers (OpenAI, Cerebras, or open alternatives)

**Security & Privacy**

- Enforce TLS everywhere. Use HTTP security headers.
- Encrypt sensitive fields at rest (passwords with Argon2/Bcrypt).
- Implement rate limiting & abuse detection on behavior ingestion.
- Age gating & parental consent flows; data deletion and export per user request.
- Privacy dashboard: allow users to view and toggle tracking & sharing preferences.
- Data retention policy: default retention of behavior data configurable; anonymize after X months.
- Store production secrets in vault (HashiCorp / cloud secret manager).

**Accessibility & Localization**

- WCAG 2.1 AA compliance: keyboard nav, screen reader labels, contrast, adjustable font.
- Provide UI translations (i18n) — start with English + Hindi + one regional language; implement translation keys.
- Simple vocabulary mode for low literacy users; iconography heavy UI.

**Testing & QA**

- Unit tests for frontend (Jest/RTL) & backend (Jest / pytest).
- Integration tests for API endpoints.
- E2E tests (Playwright or Cypress) covering onboarding, roadmap generation, project submission, and job application flow.
- Load tests with k6: simulate concurrent users ingesting behavior events and matchmaking.
- Security tests: static analysis and dependency scanning (Snyk), run OWASP ZAP scan in CI.

**CI/CD & Deploy**

- GitHub Actions workflows:
  - PR checks: lint, unit tests, build.
  - Main branch: build + deploy to staging.
  - Release: promote to production with migrations, DB backups.
- Infrastructure as Code (Terraform) for production; small deployments can use Render/Vercel + managed Postgres for MVP.
- Automated DB migrations using Flyway/TypeORM/Prisma Migrate.
- Canary deployments for backend ML service.

**Monitoring & Observability**

- Error tracking: Sentry.
- Metrics: Prometheus + Grafana dashboards for request latency, queue depth, ML inference times.
- Logs: structured logs (JSON) to ELK or managed provider.
- Alerting: pager/sms/email on SLO violations.
- Business metrics: engagement, DAU/WAU, mentor acceptance rate, application→interview conversion.

**Admin & Recruiter Features**

- Recruiter portal to post opportunities into domain pools; advanced matching filters; bulk shortlist.
- Admin dashboard to:
  - Seed demo data and moderate content
  - Monitor unusual behavior/signals
  - Escalate AI therapist cases
  - Manage domain taxonomies and mentor verification

**Prioritized MVP Scope** (must ship)

1. Onboarding + age gating + living resume basic
2. Curiosity Compass + behavior capture and SelfGraph snapshot
3. AI Roadmap generator (RAG-based simple)
4. Project Playground basics (create, submit, review)
5. Mentor directory + request scheduling (no video in MVP)
6. Opportunity posting + basic matching (vector retrieval + simple scoring)
7. PWA offline caching + local event queue + sync
8. Admin console w/ user moderation

(Everything else is "v1+" scope.)

**Acceptance Criteria / Example Test Cases**

- New user signs up (age <16): parental consent workflow created; no access to mentor chat until consent granted.
- Behavior events queued offline while device offline; syncs and appears in analytics when back online.
- Roadmap generation returns a structured JSON of steps with resources and estimated times.
- SkillStacker shows at least 3 recommended micro-courses per identified gap.
- Mentor matchmaking returns at least 5 ranked mentors for a sample domain, with human-readable reasons.

**Deliverable Checklist** (what the AI must output)

- Repo skeleton with frontend/backend/infrastructure + scripts to run locally (docker-compose for dev).
- Dockerfiles and dev container support.
- OpenAPI/GraphQL schema file.
- Postgres migrations & seed data.
- Example env file and guardian/consent test accounts.
- README with architecture diagram, setup, and deploy steps.
- Postman collection / GraphQL queries.
- E2E test suite and instructions to run load tests.

**Developer notes & implementation guidance**

- Use feature flags for ML features; default to safe heuristics if LLM not available.
- Design the SelfGraph as an append-only event log with periodic densification (batch job) into a snapshot table for fast reads.
- For low-cost MVP hosting: use Vercel for frontend + Railway or Render for backend + Supabase Postgres to speed dev.
- Always store user consent & privacy flags as first-class fields.
- Keep vector DB usage cost-efficient by limiting embedding frequency (e.g., embed new content + major profile updates, not every click).

**Tone & Developer Instructions** (how the AI should write code & docs)

- Code style: idiomatic TypeScript (strict mode) for frontend & backend. Use ESLint + Prettier.
- Documentation: concise + example first. Provide code comments for non-trivial algorithms.
- UX writing: supportive, non-judgemental, encouraging tone for career therapist messaging.
- Tests: exhaustive for business logic; higher coverage on ranking, matching, and privacy handling.

**Tips for Implementation**

- Start with a small domain taxonomy (4 domains) and mock data to validate the matching pipeline.
- Use server-side rendering for initial pages for SEO & first paint performance.
- Batch behavior events on the client and flush every N seconds or on visibilitychange to minimize network overhead.
- Implement soft-delete and data retention toggles early.

**How to run this prompt in different platforms**

1. Paste entire block into the platform prompt field.
2. Ask the platform to produce a Git repository with frontend/ + backend/ + infra/ and run scripts to bootstrap dev environment.
3. Request the platform to produce incremental PRs for each major artifact (e.g., PR1: repo skeleton, PR2: auth & onboarding, PR3: Curiosity Compass, PR4: Roadmap generator, etc.) — but if the platform cannot do PRs, request a zipped repo.

**Final explicit instructions for the AI builder**

Use the spec file as primary source of truth: "🌟 Nexa — Your Dream, Reimagined.docx" .

Produce a runnable monorepo with working PWA and backend service that satisfies the MVP Scope above.

Include CI, tests, infra as code, and deployment to a staging environment.

Provide a "runbook" for production rollout, cost considerations, and local language / low-bandwidth notes.

Provide developer tasks / tickets (Jira/GitHub issues) and a README for next milestones.

**OUTPUT FORMAT** (required)

Return a single compressed artifact (Git repo or .zip) and the following artifacts in the repo root:

- README.md with architecture diagram and run instructions.
- frontend/ (PWA) plus frontend/manifest.json, service-worker.js.
- backend/ (API) with migrations and seeds.
- infrastructure/ (Terraform or deploy scripts).
- docs/ with API docs (OpenAPI/GraphQL), data model, and ML design doc.
- tests/ with scripts to run unit/integration/E2E and load tests.

**Notes**

- Prioritize privacy, safety, and low-bandwidth design for Tier-3/4 users.
- Keep the architecture modular so ML/LLM providers can be swapped without rewriting core APIs.
- Provide sensible defaults for provider choices (Vercel + Render + Supabase) but make them configurable.

---

**END PROMPT**

---

*This comprehensive prompt can be copied and pasted directly into any AI coding platform to generate the complete Nexa PWA with frontend, backend, algorithms, and infrastructure.*

---

## 📖 **COMPLETE PRODUCT BRIEF: NEXA — YOUR DREAM, REIMAGINED**

*Below is the complete product brief that serves as the foundation for all development work. This document contains the vision, problem statement, user journey, and detailed feature breakdown.*

---

### **🌟 NEXA — YOUR DREAM, REIMAGINED**

**Job Career Edition**

#### **🚨 The Problem**

Every student has faced it:

- They finish school or college confused, lost, and unclear — making career choices based on pressure, hearsay, or sheer lack of exposure.
- They're expected to "figure it out" after the degree. But by then, it's already too late.
- Or worse, you're 3–5 years into a job and realize: This isn't what I want.
- Career choices are made by chance, not choice.
- The system offers generic aptitude tests, outdated advice, and zero real-world exploration.
- Career transitions feel risky, lonely, and unsupported — especially in Tier 3, 4 & rural India, where many don't even know they're stuck in a problem until it's too late.

Today's career counseling is outdated, expensive, judgmental, and painfully linear. A couple of generic aptitude tests or a one-time expert session cannot define an entire life.

Gen Z and Gen Alpha demand more — freedom to explore, room to fail, power to choose, and a system that evolves with them.

And while Tier 1 & Tier 2 cities are beginning to speak about this... In Tier 3, Tier 4, and rural India, the silence is deafening. These students don't even realize they're facing this problem — because no one's ever asked them.

- No one asked about their dreams.
- No one showed them what's possible.
- They're told what to become — not guided toward what they would love to be.

**The result?**
- Career planning & career transitioning starts too late
- Generic tests decide your future like roulette
- No exposure, no roadmap, no clarity
- Just noise, pressure, and regret
- No exposure. No roadmap. No second chance.
- Most people don't choose their careers — they stumble into them.

#### **🌈 The Vision**

To build a guided, tech-first, emotionally intelligent ecosystem that guides students from age 13 to their first job, and even after that, if the path needs a pivot — with clarity, confidence, and creativity.

> "We're not here to decide for you. We're here to help you design your own path. We help you build a life you'll actually want to live."

**What if we didn't wait until the end?**
- What if we started at 14, not 24?
- What if a student could:
  - Discover who they are — not just their marks
  - Explore real-world domains, not vague labels
  - Make informed decisions, not panic picks
  - Build a living resume — from class 8 onwards
  - Connect with real people, real projects, real futures

And what if it all happened in one ecosystem — made for short attention spans, deep identity discovery, and real growth?

#### **🚀 The Product: Nexa**

A Progressive Web App that becomes a student's lifelong career co-pilot — starting from school, growing with them through college, and guiding them into the real world.

A powerful Progressive Web App (PWA) that evolves with you:
- From Class 8 to 25+ years of age
- Whether you're exploring, committing, or transitioning
- With deep personalization, emotional safety, and real-world context

It's not a quiz. Not a one-time session. It's a living, breathing journey that evolves with them.

#### **💡 Key Features (By Phase)**

| Phase | Feature | What It Does |
|-------|---------|---------------|
| **Discovery** | Curiosity Compass | Gamified, pressure-free exploration of interests, strengths & learning styles |
| **Direction** | AI-Powered Roadmaps | Personalized, evolving paths based on goals, behavior & exploration history |
| **Development** | SkillStacker | Recommends real-world skills aligned with industry trends and personal gaps |
| **Support** | Mentor Matchmaking | AI-paired mentors and role models who check in, not just check boxes |
| **Learning** | Adaptive Capsules | Curated micro-learning from YouTube, Coursera, and peer-generated resources |
| **Real-World Prep** | Project Playground | Hands-on challenges, industry-linked projects and hackathons |
| **Identity** | Living Resume | Auto-updated portfolio tracking all clicks, courses, projects & paths taken |
| **Navigation** | Virtual Career Coach | Chat-based assistant suggesting next steps, solving doubts, guiding choices |
| **Opportunities** | Job & Internship Match | AI-matched roles based on years of behavioral and academic data |
| **Opportunities** | Domain specific demand & supply system | Unlike generic job boards, Nexa creates domain-focused talent pools matched to real-time industry needs |

**Domain Specific Demand & Supply System:**
Unlike generic job boards, Nexa creates domain-focused talent pools matched to real-time industry needs. Companies, startups, and recruiters post niche-specific opportunities, while users are automatically recommended to these based on skills, portfolio, and behavioral data. This ensures the right people meet the right opportunities without noise.

**Identity:**
- **🧬 SelfGraph**: A real-time, AI-powered identity mirror that evolves with every click, choice, reflection, and project. It visualizes the user's evolving strengths, values, confidence, and decision-making patterns across their journey.

**Support:**
- **AI Career Therapist**: Nexa's AI Career Therapist silently tracks behavior and emotions to offer real-time, judgment-free guidance during confusion or setbacks. It gently supports decision-making and escalates to real mentors when deeper help is needed.

#### **✨ Our USPs**

- **End-to-End Journey**: From class 8 to first job — no reset, no confusion, just guided growth
- **Identity over Aptitude**: Not tests — but storytelling, creativity, and behavior tracking
- **Built for Gen Z & Alpha**: Gamified, visual, swipe-first UX — not boring dashboards
- **Real-World Learning**: Actual industry tools and problems — not textbook fluff
- **Inclusive by Design**: Especially for Tier 3, Tier 4, and rural India — where students don't even know they're being left behind
- **Living Resume**: Every choice and project gets logged automatically — recruiter-ready and ever-growing
- **AI That Actually Knows You**: Constantly learns your preferences, patterns, and inclinations — and gently nudges you toward the paths, mentors, projects, and courses you'd actually love
- **Hands-On Industry Training**: Projects, tools, challenges tied to current market demands
- **Powerful Domain Mentorship**: Real professionals. Real networks. No gatekeeping.
- **Dynamic SelfGraph™ Intelligence**: Unlike traditional aptitude tests or personality quizzes, Nexa features a continuously evolving identity intelligence layer that understands who the user is becoming, not just what they've done.
- **Your AI Career Therapist**: Unlike platforms that leave you overwhelmed with choices, Nexa gives you a deeply empathetic AI counselor who understands your emotions, monitors your indecision, and gently guides you out of career confusion.

#### **🧭 Nexa User Journey: Feature Timeline by Age**

| Age / Stage | Feature / Milestone Activated |
|-------------|------------------------------|
| **Age 13–14 (8th–9th Std)** | - Early Discovery Mode: Curiosity-based exploration across domains via visual stories & interactive micro-content<br>- Personal Journal & Mood Board: Capture dreams, interests, inspirations<br>- Gamified Behavior-Based Assessments (not traditional aptitude): Understand learning style, strengths, identity patterns<br>- AI Onboarding Begins: Passive behavior tracking starts<br>- Begin Living Resume: Every click starts building a lifelong portfolio<br>- Soft Exposure to Mentors & Role Models |
| **Age 15–16 (10th–11th Std)** | - Exploratory Paths Unlocked: Full access to domains with deep data<br>- AI-Powered Personalized Guidance (light-touch nudges)<br>- Start Thematic Project Work (optional): Creative, small domain-specific challenges<br>- Interactive Learning Modules<br>- Community Layer Introduced<br>- Pre-Mentorship Matchmaking Begins |
| **Age 17–18 (12th Std / Pre-college)** | - Decision Support Mode: Compare career paths, evaluate based on lifestyle alignment & interest trajectory<br>- Personalized Roadmap Generator: Based on 3 years of actions, Odyssey suggests best-fit domains and their learning maps<br>- Mini-Mentorship Sessions: Direct access to short career Q&A with verified professionals<br>- First Exposure to Industry Challenges: Participate in beginner-level team-based tasks<br>- Skill Discovery Tools: Suggests hands-on, online courses & starter certifications |
| **Age 18–19 (1st Year UG)** | - AI Journey Optimizer: Every action now reshapes a real-time learning & career map<br>- Activate Hands-On Project Portal: Work on live, real-world problems with industry mentors<br>- Launch Domain-Based Networking: Join verified communities of students & professionals<br>- Contextual Nudges: Odyssey recommends opportunities, mentors, and projects based on evolving interests |
| **Age 20–22 (2nd–4th Year UG)** | - Advanced Mentorship: Regular 1:1 and group sessions with domain experts<br>- Career Playbooks: Custom execution plans for jobs, startups, research, or freelancing<br>- Resume Export & Branding: Living Resume converts into a beautiful digital + PDF portfolio<br>- Talent Passport: Verified skill records, projects, credentials shared directly with recruiters & companies<br>- Access Hiring Pool + Internships: Based on AI-fit + user goals<br>- Portfolio Showcases: Appear in spotlight features to recruiters, funders, and domain networks |

**Career Transitions - Age 25+**
- **Profile Reassessment Engine**: AI reviews your existing career, skillset, patterns, and restlessness
- **Live Identity Reconstruction**: The system evolves with your selections, actions, and pauses
- **Transition Tracks**: Domain-specific micro-pathways designed to help you pivot
- **Real-Time Demand-Supply Grid**: Shows live demand for roles in new domains
- **Emotional Safety Layer**: Community for career changers

#### **🚀 Nexa Feature Rollout by Educational & Career Stage**

| User Stage | Duration | Rollout Strategy |
|------------|----------|------------------|
| **🏫 School Level** | 8 Years (Age 13–20) | Slow-burn discovery journey — focused on gradual self-awareness, exploration, light mentorship, and low-pressure experimentation. Builds the strongest foundation. |
| **🎓 Secondary College** | 6 Years (Age 15–20) | Compressed start, faster discovery — assumes slightly better clarity but still enough time for experimentation and guidance. |
| **🧑‍🎓 Undergrad College** | 4 Years (Age 17–21) | Fast-tracked orientation + project-based growth. Strong mentorship, skill-building, and job alignment in later years. |
| **🎓 Postgrad College** | 2 Years (Age 21–23) | Hyper-focused path clarity, portfolio development, and direct job-readiness. Mentorship plays a large role. |
| **🔄 Career Transitioners** | 1 Year (Any Age) | Intensive career re-alignment sprint. All nudges, AI systems, resume, mentors, skill learning run in parallel. |

#### **🧩 Full Feature Matrix by Stage & Timeline**

| Feature | 🏫 School (8 yrs) | 🎓 Secondary (6 yrs) | 🧑‍🎓 Undergrad (4 yrs) | 🎓 Postgrad (2 yrs) | 🔄 Career Switch (1 yr) |
|---------|-------------------|----------------------|----------------------|---------------------|-------------------------|
| Curiosity Compass | Y1–Y2 (deep) | Y1–Y2 (medium) | Y1 (intensive) | First 2 months | Month 1 (1-week sprint) |
| Behavioral Tracking | Begins Y1 | Begins Y1 | Begins Y1 | First month | Immediately |
| Living Resume | Starts Y1 | Starts Y1 | Starts Y1 | Starts Day 1 | Starts Day 1 |
| Micro-Experiments | Y2–Y4 | Y2–Y3 | Y1–Y2 | Month 2–6 | Month 1–2 |
| Domain Exposure Paths | Y3–Y5 | Y2–Y4 | Y1–Y2 | Month 2–6 | Month 2–4 |
| AI Nudges Begin | Y3–Y4 | Y2–Y3 | Y1 | Month 1 | Week 1 |
| SkillStacker | Y4–Y6 | Y3–Y5 | Y2–Y3 | Month 3–12 | Month 2–4 |
| Mentor Matchmaking | Y5–Y6 | Y4–Y5 | Y2–Y3 | Month 4–12 | Month 2–5 |
| Project Playground | Y5–Y7 | Y4–Y6 | Y2–Y4 | Month 4–12 | Month 3–6 |
| Peer Communities | Starts Y2 | Starts Y2 | Starts Y1 | Month 1 | Month 1 |
| Virtual Career Coach | Y6–Y8 | Y5–Y6 | Y3–Y4 | Month 6–12 | Month 2 onwards |
| Talent Passport / Resume | Auto-updates Y4+ | Auto-updates Y3+ | Full by Y4 | Full by Month 10 | Built by Month 6 |
| Internship Matching | Y7–Y8 | Y5–Y6 | Y3–Y4 | Month 10–12 | Month 6–10 |
| Job Matching & Showcases | Y8 | Y6 | Y4 | Final Month | Final Month |

#### **🧠 Core Philosophy**

> "Don't wait for students to reach the battlefield. Train them from childhood to master their weapons, understand their purpose, and love the fight — and when needed, make changing the battlefield as graceful and powerful as entering it the first time."

#### **🌍 The Mission**

To ensure that every student — from Tier 1 cities to remote villages — gets a fair shot at discovering who they are and becoming who they're meant to be.

To make sure no student is ever left alone to figure out their future at the very end. Not in class 12. Not after a wrong degree.

We start before the confusion begins — and walk with them till clarity becomes action.

---

### **🚀 Startup, Business, Entrepreneurship Edition**

#### **🚨 The Problem (Entrepreneurship Edition)**

Most people in Tier 3, 4, and rural India (and even many in urban India) don't grow up knowing that entrepreneurship is a real option. Most people don't grow up hearing the word "startup." They hear "job," "government exam," or "do what your uncle did."

- Startups? Founders? Business models? These are alien words — associated with rich, tech-savvy, urban elites, not "ordinary students."
- In Tier 3, Tier 4, and rural India — entrepreneurship is seen as risky, elite, or just confusing.
- No one teaches you how to build your own thing — not in school, not in college. You're told to become something — never to create something.
- Yet, some of the world's most powerful solutions can emerge from local problems — if people are empowered to solve them.

But the system never shows them how.

Gen Z and Gen Alpha aren't just job seekers. They're idea-seekers, freedom-lovers, and impact-hunters. They want to solve problems, build things, and write their own playbook — but have no clue where to start.

**Today's system doesn't offer that journey:**
- Entrepreneurship is glamorized for Shark Tank, not demystified for grassroots.
- "Business" is seen as risky, unstructured, or reserved for those with money or family legacy.
- No platform systematically teaches students to think like builders, problem-solvers, and value creators — from school level itself.
- Even when someone has an idea, they don't know how to test, build, or validate it — especially without capital, team, or tech skills.
- There's no guided system to incubate entrepreneurial identity as it forms — especially outside Tier 1 circles.

So students grow up consuming products, not creating them. And many natural founders die inside jobs they were never meant to do.

#### **🌈 The Vision (Entrepreneurship Edition)**

To build a creator-first ecosystem that plants the seed of entrepreneurship early, nurtures the startup mindset with exposure, helps build real-world projects, connects budding founders to a peer creator community, and walks with them from idea to venture — whether they want to build a company, join one, or simply think like a founder.

To rebuild how India discovers and develops entrepreneurs. Not through jargon, but through exposure, curiosity, real projects, and hands-on experience — from school to postgrad.

We won't ask students to "start a company." We'll guide them to think like creators, solve real problems, test ideas, and build meaningful value.

**What if:**
- Students learned about the startup world in Class 8?
- Side projects and curiosity could evolve into companies?
- Tier 3 kids had access to the same startup literacy as IIT grads?
- Anyone could become a builder — no matter their English, city, or marks?

Nexa will guide them with:
- Behavioral signals
- Emotional safety
- Domain-specific pathways
- Startup mentors & founders
- No-pressure experiments
- Real-world launch pads

> "You don't need money or MBA jargon to be a founder. You need curiosity, clarity, courage — and a support system that believes in you before the world does."

> "Don't just chase jobs. Learn how to create them — for yourself and for others."

#### **🚀 The Product: Nexa (Entrepreneurship Edition)**

A Progressive Web App that becomes your personal venture co-pilot — planting the seed of entrepreneurship early, growing your builder mindset through projects and community, and guiding you from your first idea to your first launch.

A powerful, evolving platform designed for:
- Students from Class 8 to College
- Professionals exploring entrepreneurship for the first time
- Curious minds in Tier 3, 4, and rural India who've never been introduced to the startup world

Whether you're just discovering what a startup is, building your first idea, or transitioning into your founder era — Nexa evolves with you with:
- Deep personalization
- Community-based startup literacy
- Real-world builder tools
- Emotional safety, encouragement, and clarity

It's not a startup course. Not a one-time bootcamp. It's a living, breathing venture journey — made for those who never thought they could be builders. And especially for those who've always wanted to be.

#### **🔁 The Nexa Loop**

**💭 Discover → 🔧 Build → 🌐 Connect → 🔁 Evolve**

The journey doesn't end — it adapts as you grow.

---

### **📌 TL;DR**

Nexa isn't just a platform. Nexa is the world's first full-spectrum career platform for:
- Students from class 8 to college
- Professionals wanting to transition meaningfully
- People who want clarity, not confusion

It's a lifelong companion that helps you discover what you love, who you are, and how to become that — before the world tells you what you "should" be.

And it evolves with you — nudging you gently toward a future that feels truly your own.

---

### **🌌 Nexa**

**The Future of Career Discovery. Reimagined from Day One.**

**Your Career. Your Path. Your Time. Made for who you really are.**

---

---

## 🚀 **COMPLETE, EXHAUSTIVE PRODUCT PROMPT (BUILD-READY)**

*Below is the comprehensive, build-ready product prompt that describes every user journey, feature start/finish, UI layout, frontend behavior, backend services, DB schema, algorithms, integrations, security/compliance, testing, observability, deploy & cost notes, edge cases, and deliverables.*

---

### **NEXA — COMPLETE, EXHAUSTIVE PRODUCT PROMPT (BUILD-READY)**

**Primary source**: use the uploaded product brief "🌟 Nexa — Your Dream Career, Reimagined.docx" as the canonical spec.

Below is a single, comprehensive, build-ready product prompt describing every user journey, feature start/finish, UI layout, frontend behavior (offline + automation), backend services, DB schema, algorithms, integrations, security/compliance, testing, observability, deploy & cost notes, edge cases, and deliverables. Paste it into an engineering / AI generation platform (Bolt.new, Cursor, Lovables, Claude, Replit, etc.) to generate code, workflows, infra, docs, and tests.

**NOTE**: this is intentionally exhaustive. If the target platform can't produce everything at once, request incremental PRs following the prioritized feature list below.

#### **Scope & Objectives**

Build Nexa, a Progressive Web App (PWA) that becomes a lifelong career co-pilot for learners (13+) and career-transitioners.

Deliver frontend (PWA) + backend APIs & workers + DB schema + ML pipelines + integrations + CI/CD + tests + docs.

UX must be mobile-first, offline-first, multilingual, accessible (WCAG 2.1 AA) and low-bandwidth optimized (Tier-3/4 focus).

**Key principle**: Discover → Build → Connect → Evolve (the Nexa Loop).

#### **High-Level User Journeys (Explicit Start → End, Triggers, Automations)**

For each feature below: Entry points, UI screens, client actions/state, network calls, backend effects, completion / exit conditions.

**1. Signup & Onboarding (Start)**

- **Entry**: first open or install PWA → Splash → "Get started"
- **Screens**: Splash → Language & Data Mode → Auth Choice → Age Gate → Soft Curiosity Onboarding (5 swipes) → Quick Profile → Dashboard
- **Client-state**: ui_prefs (localStorage), auth_token (secure), local_event_queue (IndexedDB)
- **Network calls**:
  - POST /api/auth/signup (email/phone/OAuth)
  - POST /api/auth/otp/request / verify
  - POST /api/users/prefs (async)
- **Automation rules**:
  - If DOB < configured_minor_age → create user with is_minor=true, set status=pending_consent, lock mentor/video/some community features. Trigger POST /api/notifications/parent_consent_request and send email/SMS webhook.
  - On first 5 Curiosity swipes, batch and POST /api/events/batch. If offline, queue; background sync on reconnect.
- **Completion**: user lands on Dashboard; SelfGraph created (seeded) on backend.

**2. Dashboard (Core Hub)**

- **Entry**: login/onboarding complete or returning user
- **UI components**: header (search/notifications), SelfGraphCard (mini), NudgeCard, Current Roadmap card, Quick Actions, Recent Projects/Opportunities
- **Client behavior**: optimistic UI + cached snapshot load from IndexedDB while fetching /api/users/:id/summary.
- **Automations**: schedule daily GET /api/nudges on client; background push of important nudges via push service.
- **Exit**: clicking any CTA opens relevant page (Compass, Roadmap, Projects, Resume, Coach).

**3. Curiosity Compass**

- **Entry**: Dashboard → Compass CTA or onboarding
- **UI**: swipe deck (cards with domain title, one-liner, tags); fallback list view for low-memory devices.
- **Events**: each swipe creates {event_type: "swipe", card_id, response, confidence, timestamp}. Stored in local_event_queue and batched to /api/events (behavior pipeline).
- **Backend effects**: behavior events appended to event stream → consumed by selfgraph_updater worker that updates evolving SelfGraph snapshot (densified periodically).
- **Trigger automations**: if a domain receives 3+ "strong interest" swipes in X days → auto-open "Start Roadmap" modal. If user abandons compass 3 sessions in a row → coach nudges to re-engage.
- **Exit**: after N swipes or manual close: user returns to Dashboard or Roadmap generator run.

**4. AI-Powered Roadmaps**

- **Entry**: from Compass hint, Dashboard CTA, or explicit "Generate Roadmap" button.
- **UI**: Timeline + Stepper + Kanban view (To Do, In Progress, Done) with inline edits. Each step has title, time_est, resources, difficulty, prereqs, evidence_type.
- **Automation lifecycle**:
  - **Generate**: POST /api/roadmaps/generate {user_id, seed_domains, constraints} triggers roadmap_generator worker (RAG). Worker: fetch user snapshot + domain taxonomy + curated resource corpus → retrieve top-k → LLM fuse into ordered steps. Store roadmap JSON and step embeddings in DB.
  - **Start Step**: client PATCH /api/roadmaps/:rid/steps/:sid {status:"in_progress", started_at} → optimistic UI. Worker acknowledges and creates task_timer if user opts.
  - **Complete Step**: PATCH status:"done", create resume_entry if flagged, award badges, push behavior event. If step had project, create project_draft skeleton.
  - **Auto-replan**: periodic job recalculates roadmap priorities using recent event decay model (recent events more weight).
- **Completion**: roadmap status=completed when all mandatory steps done; archived version stored.

**5. SkillStacker (Gap Analysis)**

- **Entry**: Roadmap page → "Analyze skills" or dedicated SkillStacker view
- **UI**: side-by-side bars: Current vs Required, detailed suggestions list of capsules/projects.
- **Algorithm**:
  - Compose skill_vector_user (skills + proficiency + recency_decay).
  - Compose skill_vector_domain (required by roadmap or job).
  - gap = domain − user → sort by magnitude. For each gap select capsules/projects scored by score = α * content_similarity + β * estimated_time_fit + γ * popularity + δ * recency.
- **Automation**: "Add to Roadmap" appends capsule/project as a step. Auto-schedule reminders and instantiate short accountability tasks.

**6. Adaptive Capsules**

- **Entry**: Capsules feed or inserted step in roadmap/skillstacker
- **UI**: card list with title, estimated time, source, saving/downloading toggles. Allow "Text only" preview for low bandwidth.
- **Client behavior**: on download: store transcript + thumbnails in IndexedDB + cache static resources; limit per-user p2p storage (config). On complete: POST /api/capsules/:id/complete.
- **Automation**: completion updates SelfGraph (confidence + competence), triggers mini-recommendation re-score; if capsule linked to step → mark step progress.

**7. Project Playground**

- **Entry**: Dashboard → Projects or Roadmap step prompting project
- **UI**: project list, create wizard (idea → plan → tasks → upload → submit), team board (kanban for members), review flow.
- **Backend**: projects table + project_participation join. File uploads to S3; attachments metadata stored in DB.
- **Workflows**:
  - **Create**: POST /api/projects → worker creates skeleton and notifies domain community.
  - **Submit**: POST /api/projects/:id/submit → status submitted, notifies reviewers (mentors & peers) → on review compute project_score (weighted rubric).
  - **Showcase**: high-scoring projects auto-suggested in Opportunities feed.
- **Completion**: project archived with outcomes and added to Living Resume as project_entry.

**8. Living Resume**

- **Entry**: auto-update from projects/roadmap/capsules or manual edits
- **UI**: editable sections (summary, skills, projects, achievements), preview (public/private), export buttons (PDF / link / Talent Passport JSON).
- **Automation**: event-driven: workers transform behavior_events and resume_entries into structured resume object. Auto-suggestions appear in UI; user approves before public exposure. Export uses headless rendering (Puppeteer) and signed shareable URLs.
- **Privacy**: visibility controls; audit log for changes; export records.

**9. Mentor Matchmaking & Sessions**

- **Entry**: Mentor page, Roadmap suggestion, Coach escalation
- **UI**: mentor cards (bio, domains, languages, rating, availability, "Why match" explanation).
- **Matching pipeline**:
  - **Candidate retrieval**: vector similarity (profile embedding ↔ mentor embedding).
  - **Filter**: language, timezone, price, availability.
  - **Score**: score = w1*skill_overlap + w2*embedding_similarity + w3*availability_fit + w4*mentor_rating + w5*behavioral_alignment.
  - **Explainability**: return top reasons for match (e.g., "Completed similar project X, interested in robotics, prefers mentor language Hindi").
- **Workflows**: book via calendar integration (Google Calendar/Jitsi/Twilio). On completion, feedback updates mentor rating and user's trust score.

**10. Virtual Career Coach & AI Career Therapist**

- **Entry**: Dashboard chat, coach notifications, or therapist escalation
- **UI**: chat window with context cards (current roadmap, mood, recent projects). Emotion detection overlays and recommended actions.
- **Engine & rules**:
  - **Coach (LLM + tools)**: LLM receives user message + context window (SelfGraph snapshot, recent events, roadmap). Provide suggestive actions (micro-tasks, capsules, mentor matches). Use system prompt templates (see below).
  - **Therapist (classifier + LLM)**: sentiment classifier (fine-tuned BERT) flags sustained negative sentiment or dropout signals. Rules:
    - If negative_sentiment_count ≥ 3 in 14 days AND activity_drop > 40% → show supportive content + suggest mentor.
    - If severe risk keywords → show crisis resources & flag admin/moderator.
- **Safety**: never provide clinical advice; escalate to human mentor/moderator as appropriate. Chat drafts saved locally and synced.

**11. Opportunities (Jobs/Internships) & Domain Demand-Supply**

- **Entry**: Opportunity feed, recruiter dashboard, job-match notifications
- **UI**: job cards with match_strength and explanation, recruiter tools for posting/shortlisting.
- **Pipeline**: recruiter posts → vectorize job desc → nightly match job ↔ candidate embeddings → rank by score = α * skill_overlap + β*project_evidence + γ*behavioral_fit + δ*profile_completeness + ε*recruiter_priority. Present top-K with reasons. Recruiter can short-list and invite.
- **Automation**: tracked signals: applied → interviewed → hired feed back to reweight ranking. Also support domain pools (talent pools per domain) for curated hiring.

**12. Admin & Recruiter Console**

- **Functions**: seed demo data, moderate content, review flagged events, manage taxonomy, view metrics, export candidates. Admin workflows control content taxonomy, domain mappings, moderation flows, and escalations from AI therapist.

#### **Detailed UI / Frontend Architecture & Components**

**Monorepo Suggested Structure**

```
/frontend (Next.js + TS)
  /app
    /(auth)/signup/page.tsx
    /dashboard/page.tsx
    /compass/page.tsx
    /roadmaps/[id]/page.tsx
    /capsules/page.tsx
    /projects/page.tsx
    /resume/page.tsx
    /mentors/page.tsx
    /coach/page.tsx
    /opportunities/page.tsx
  /components
    /ui (buttons, modals, forms)
    SelfGraphCard.tsx
    SwipeDeck.tsx
    RoadmapTimeline.tsx
    CapsuleCard.tsx
    ProjectBoard.tsx
    ChatWindow.tsx
  /hooks
    useOfflineQueue.ts
    useSelfGraph.ts
    useEmbeddings.ts
  /lib
    apiClient.ts (React Query)
    idb.ts (localForage wrappers)
    swRegister.ts
  /styles
  manifest.json
  service-worker.js
```

**Key Frontend Patterns**

- **Offline queue (IndexedDB)**: structured store events, drafts, attachments. Background sync worker flushes on navigator.onLine or visibility change. Limit daily upload size; drop oldest local caches after threshold.
- **Data fetching**: React Query with stale-while-revalidate; critical endpoints pre-fetched on login.
- **Optimistic UI**: roadmap step toggles, capsule completion, project joins. Undo UX for destructive ops.
- **Accessibility**: semantic elements, ARIA labels, keyboard navigation, color contrast tokens.
- **Low-bandwidth UX**: text-first views, LQIP images, defer video, allow "lite mode" toggles.

#### **Backend Architecture & Services (Detailed)**

**Microservices & Responsibilities**

- **API Gateway** (routing, auth, rate limit)
- **Auth Service** (JWT, OTP, OAuth, parental consent enforcement)
- **User Profile Service** (CRUD, preferences)
- **Event Ingest Service** (accepts events/batches → writes to Kafka/Redis Stream + Postgres)
- **SelfGraph Updater Worker** (consumes event stream → feature extraction → update snapshots)
- **Embeddings Worker** (call embedding provider → store in vector DB)
- **Roadmap Generator Service (RAG)** (retrieval from vector DB + LLM orchestration)
- **Matchmaker Service** (job/mentor matching pipelines + retraining hooks)
- **Project Service** (projects CRUD, uploads, review scoring)
- **Resume Service** (compose/approve/export)
- **Notification Service** (push, email, SMS via providers)
- **ML Service** (training & model serving for ranking, sentiment)
- **Admin & Analytics Services** (metrics, dashboards)

**Inter-service comms**: Kafka (event-driven) + gRPC/REST for synchronous APIs.

#### **Database Schema (Expanded, with Indexes & Purpose)**

Provide Postgres tables (DDL snippets), plus vector DB usage.

**Core Tables (Abridged)**

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE,
  phone text UNIQUE,
  display_name text,
  dob date,
  is_minor boolean DEFAULT false,
  parent_consent boolean DEFAULT false,
  language text,
  role text,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON users (email);

CREATE TABLE behavior_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  event_type text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);
CREATE INDEX ON behavior_events (user_id, created_at);

CREATE TABLE selfgraph_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  snapshot jsonb,
  version int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE roadmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  domain text,
  title text,
  steps jsonb,
  status text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);
CREATE INDEX ON roadmaps (user_id);

CREATE TABLE projects ( ... ) ;
CREATE TABLE resume_entries ( ... );
CREATE TABLE mentors ( ... );
CREATE TABLE opportunities ( ... );

-- Embeddings stored in vector DB; keep metadata ref in Postgres
CREATE TABLE embeddings_meta (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref_type text,
  ref_id uuid,
  provider text,
  vector_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);
```

**Vector DB (Pinecone/Weaviate/Milvus)** holds high-dimensional vectors for:
- content resources
- user profile snapshots
- project descriptions
- job descriptions
- mentor profiles

#### **Algorithms & ML (Detailed Design)**

**Embeddings Pipeline**

- **Trigger**: new content / major profile update / new project / job posting
- **Process**: normalize text → call embedding provider → store vector in Vector DB and metadata in Postgres embeddings_meta.
- **Cost controls**: only embed major changes; sample minor clicks aggregated into daily digest.

**Roadmap Generator (RAG)**

- **Retrieval**: query vector DB for top-K resources relevant to user's SelfGraph & seed domain.
- **Prompt template (example)**:
  ```
  SYSTEM: You are Nexa Roadmap Builder. Compose an ordered roadmap for a learner with constraints below.
  USER: {user_snapshot_json}
  CONSTRAINTS: {max_steps}, {max_time_per_step_minutes}, {offline_preference}, {language}
  RESOURCES: {list of top_k resource metadata}
  INSTRUCTIONS: produce JSON: [{step_id, title, description, estimated_time_min, resources:[ids], difficulty, evidence_type}]
  ```
- **Safety**: instruct LLM to avoid paid-only resources if user set 'no paid content'.

**Matching & Ranking**

- **Two-stage**: retrieval (vector), re-rank (feature-based).
- **Feature vector includes**: skill_overlap, project_evidence_score, recency_weighted_interest, mentor/role language/timezone, profile completeness.
- **Scoring formula (example)**:
  ```
  score = 0.35*skill_overlap + 0.25*embedding_similarity + 0.15*project_score + 0.10*behavior_alignment + 0.10*profile_completeness + 0.05*recruiter_priority
  ```
- **Learning to rank**: collect training data (applied→interview→offer) and train LambdaMART / XGBoost pairwise ranking; update re-ranker weekly.

**SelfGraph Updates**

- **Event extraction**: events → feature extraction (e.g., time_on_topic, completion_rates, streaks) → append to event log.
- **Densification**: nightly batch compute snapshot: vectorized summary + semantic summary for UI. Keep versions for timeline.

**Therapist & Sentiment**

- **Classifier**: fine-tuned BERT for sentiment & intent; thresholded rules for escalations.
- **Privacy**: never share sensitive content outside secure channels; escalate only on consented paths.

#### **API Design (Key Endpoints + Sample Payloads)**

**Auth**
- POST /api/auth/signup
  - payload {email, phone, name, dob, method} → returns {user, token}

**Events**
- POST /api/events/batch
  - payload {user_id, events: [{type, payload, timestamp}] } → ack {ingested: true, batch_id}

**Roadmaps**
- POST /api/roadmaps/generate → {user_id, domains, constraints} returns {roadmap_id, status}

**Match**
- POST /api/match/opportunities → returns ranked list with reasons.

**Resume Export**
- GET /api/resume/:user_id/export?format=pdf → returns signed URL.

**(Full OpenAPI required in deliverables.)**

#### **Integrations & Third-Party Services**

- **Embeddings & LLMs**: OpenAI/Cohere/Anthropic or open self-hosted models.
- **Vector DB**: Pinecone, Weaviate, Milvus.
- **Storage**: AWS S3 / Supabase Storage.
- **Auth & OTP**: Auth0/Twilio.
- **Push & Notifications**: Firebase Cloud Messaging / OneSignal.
- **Video/Calls**: Jitsi / Twilio Video.
- **Payments (if mentor payments)**: Stripe + UPI gateway for India.
- **Email**: SendGrid / SES.
- **Analytics**: Snowplow/Segment for event warehousing; Matomo for privacy-first analytics.

#### **Security, Privacy & Compliance**

- **Encryption**: TLS in transit, AES-256 at rest.
- **Auth**: OAuth + JWT + refresh token rotation.
- **Secrets**: Vault (HashiCorp / cloud secret manager).
- **Minor protection**: parental consent flow—blocked features until consent; store consent logs and timestamps.
- **Data subject rights**: endpoints for data export and deletion (GDPR / India PDP).
- **Abuse detection**: rate limits, anomaly detection on event ingestion.

#### **Offline-First & Caching Strategies (Practical)**

**Service Worker (Workbox)**:
- **Static shell**: cache-first (v2 shell).
- **API calls**: stale-while-revalidate for /api/users/:id/summary; network-first for critical writes queued.

**IndexedDB schema**: stores events, drafts, resume_drafts, capsule_cache.

**Sync algorithm (pseudocode)**:
```
onConnectivityChange(true):
  for batch in readBatches('events'):
    try POST /api/events/batch
    if success: deleteBatch
```

**Conflict resolution**: server authoritative; if patch conflict, client shows merge UI.

#### **Observability, Testing & QA**

- **Logging**: structured JSON logs to ELK.
- **Errors**: Sentry.
- **Metrics**: Prometheus + Grafana (request latency, queue depth, ML inference times, DAU/WAU/MAU, conversion funnel).
- **Tests**: unit (Jest), integration (Supertest), E2E (Playwright), accessibility (axe), performance (Lighthouse + k6).
- **SLA targets**: cached endpoints <200ms; warm ML inference <200ms; cold <1s.

#### **Deployment & Cost-Optimization**

- **MVP hosting**: Vercel (frontend), Render/Railway (backend), Supabase Postgres, Pinecone starter.
- **Infra as Code**: Terraform modules for prod.
- **Cost tips**: limit embedding frequency, tiered vector DB retention, serverless ML for inference, use caching & CDN aggressively.

#### **Edge Cases & Error Handling**

- **Age falsification**: require aadhar/ID verification optional for high-trust features.
- **Parental consent revoked**: mark is_minor=true & lock features; notify user & parent.
- **Offline huge attachments**: block large uploads offline; allow URL attachments only.
- **Duplicate events**: de-duplicate by event UUID.

#### **Acceptance Criteria & Deliverables**

**MVP Acceptance (Examples)**:
- Signup + age gate flows functioning with consent enforcement.
- Curiosity Compass swipe events reliably queued offline and synced.
- Roadmap generation returns structured JSON with steps & resources.
- Project creation + submission + review updates Living Resume.
- Mentor matchmaking returns explainable matches.
- Chat coach responds, therapist escalates per rules.
- PDF resume export works and respect visibility settings.
- Admin tools for moderation + domain pools + shortlisting.

**Deliverables**:
- Monorepo with frontend/, backend/, ml/, infra/, docs/, tests/.
- OpenAPI spec, DB migrations & seeders, vector DB schema, LLM prompt templates, CI pipelines (GitHub Actions), k6 load tests, architecture diagrams, runbook, monitoring dashboards.

#### **Operational KPIs & Experiments**

- **Activation**: % users completing onboarding & 5+ Compass swipes.
- **Retention**: 7/30-day retention.
- **Engagement**: avg capsules completed/day.
- **Progress**: % users with 1 project in 3 months.
- **Conversion (hiring)**: application→interview→hire rates.
- **Safety**: % therapy escalations resolved by mentors within SLA.

#### **Next Steps (How AI Builder Should Proceed)**

- **PR-1**: Repo skeleton + auth + onboarding + offline queue.
- **PR-2**: Compass + events ingestion + selfgraph updater (mock).
- **PR-3**: Roadmap generator (RAG pipeline mock) + roadmap UI.
- **PR-4**: Capsules + project playground + resume flow.
- **PR-5**: Mentors + matchmaking + chat coach + therapist safeguards.
- **PR-6**: Opportunities + recruiter portal + admin console.
- **PR-7**: ML training pipeline, ranking & retraining.
- **PR-8**: Full infra, monitoring, tests, and docs.

**This prompt must be executed end-to-end. If anything is underspecified, the builder should choose pragmatic, production-grade defaults and document all decisions. Use the uploaded Nexa brief as the product source of truth.**

---

## 🌟 **NEXA — PAGE-BY-PAGE PROMPT FOR POST-LOGIN PWA**

**Source of truth**: "🌟 Nexa — Your Dream Career, Reimagined.docx"

**Your task**: generate a Progressive Web App (PWA) where, after login, each feature has a dedicated page implementing its full journey.

#### **🔑 Core Pages After Login**

**1. Dashboard (Home Hub)**

- **Purpose**: quick overview of SelfGraph, nudges, ongoing roadmap, recent projects, and shortcuts.
- **UI layout**:
  - **Header**: search, notifications, profile dropdown.
  - **Main panel**:
    - Mini SelfGraph snapshot.
    - "Continue Roadmap" CTA.
    - Quick nudge carousel.
    - Recent projects list.
  - **Sidebar (desktop) / bottom nav (mobile)**: Compass, Roadmaps, Capsules, Projects, Resume, Mentors, Opportunities, Coach.
- **Automation**: prefetch roadmap summary, resume snapshot, mentor suggestions.
- **Navigation**: all widgets clickable → lead to their full page.

**2. Curiosity Compass Page**

- **Purpose**: gamified discovery of interests.
- **UI**: swipe deck (Yes/No/Maybe buttons), fallback list for accessibility.
- **Flow**:
  - Each swipe = event saved locally → sync to backend.
  - After N swipes, CTA "Generate Roadmap" appears.
  - Exit condition: roadmap created → redirects user to Roadmaps page.

**3. Roadmaps Page**

- **Purpose**: manage career journeys.
- **UI**:
  - Roadmap list view.
  - Timeline view for current roadmap.
  - Step cards with start/complete toggles.
- **Flow**:
  - Clicking a step opens its detail drawer → resources, capsules, add evidence.
  - Completing a step → auto-updates Living Resume + nudges next step.
- **Automation**: background job re-scores roadmap weekly.

**4. SkillStacker Page**

- **Purpose**: compare current vs required skills.
- **UI**: split view with bars (current vs required), list of recommended capsules/projects.
- **Flow**:
  - "Add to Roadmap" button injects capsule/project into roadmap.
- **Automation**: auto-suggests top 3 capsules whenever new opportunity/job match is detected.

**5. Capsules Page**

- **Purpose**: micro-learning hub.
- **UI**: scrollable feed of capsules (title, duration, offline toggle).
- **Flow**:
  - User opens capsule → content displayed inline (video/text).
  - Completion → mark capsule + update SelfGraph + roadmap step (if linked).
- **Offline mode**: toggle to download content.

**6. Project Playground Page**

- **Purpose**: create, join, and showcase projects.
- **UI**:
  - Project list (active, submitted, archived).
  - Project detail view → kanban tasks, attachments, team list.
- **Flow**:
  - Create project → form → saves to DB.
  - Submit project → sends to mentors for review.
  - Completed project → added to resume automatically.

**7. Living Resume Page**

- **Purpose**: evolving career portfolio.
- **UI**:
  - Editable sections: summary, skills, projects, achievements.
  - Export buttons: PDF, public link, Talent Passport.
- **Flow**:
  - Auto-suggestions appear in "Pending" tab → user approves/denies.
- **Automation**: every project/capsule/roadmap completion auto-suggests resume entries.

**8. Mentors Page**

- **Purpose**: mentor directory + matchmaking.
- **UI**: grid of mentor cards (photo, bio, availability, match score).
- **Flow**:
  - Click mentor → open profile → "Book session".
  - Session → stored in DB + calendar integration.
- **Automation**: coach nudges users to book mentor if stuck on roadmap.

**9. Virtual Career Coach Page**

- **Purpose**: AI assistant for nudges and guidance.
- **UI**: chat interface (threaded messages, suggestions panel).
- **Flow**:
  - User asks → coach provides actionables (capsule, roadmap step, mentor).
  - Nudges triggered by inactivity or behavior drops.
- **Automation**: sentiment tracking → escalate to therapist module if needed.

**10. Opportunities Page**

- **Purpose**: job & internship matches.
- **UI**: list of job cards with match_strength.
- **Flow**:
  - Click job → detail modal → "Apply with Resume".
  - Application auto-links project evidence + skills.
- **Automation**: daily re-matching; recruiter portal sync.

**11. AI Career Therapist Page**

- **Purpose**: emotional well-being support.
- **UI**: supportive chat view, mood selector, resource links.
- **Flow**:
  - Tracks streaks & sentiment.
  - Flags high-risk signals → escalate to human mentor/admin.

**12. Entrepreneurship Edition Page**

- **Purpose**: startup literacy & sandbox.
- **UI**: idea submission form, lean canvas templates, mentor matches.
- **Flow**:
  - User drafts idea → gets capsule & mentor suggestions.
  - Projects here tagged as "entrepreneurship" in resume.

**13. Profile & Settings Page**

- **Sections**:
  - Profile info (editable bio, photo, tagline).
  - Preferences (language, dark mode, offline mode, notification toggles).
  - Account (auth, parental consent logs, delete account).

#### **🗂 Navigation & Structure**

- **Persistent nav bar**: Dashboard | Compass | Roadmaps | Capsules | Projects | Resume | Mentors | Coach | Opportunities | More.
- **More →**: Profile, Settings, Help, Logout.
- **Routing**: Next.js App Router → each page under /[feature]/.

#### **⚙️ Tech Stack Notes**

- **Frontend**: Next.js (App Router, TS, TailwindCSS, React Query, IndexedDB for offline, Workbox SW).
- **Backend**: Node.js/NestJS API services, Postgres + Redis, Vector DB for embeddings.
- **Automation**: background workers for SelfGraph updates, roadmap re-scoring, mentor/job matching.
- **DB**: tables for users, events, roadmaps, projects, resume_entries, mentors, opportunities.

---

## 🎨 **NEXA — PAGE-BY-PAGE WIREFRAME SPECIFICATION**

*Below is the wireframe-level UI specification that provides detailed layout descriptions for each post-login page. This is detailed enough that AI coding tools can directly translate into Next.js + Tailwind components.*

---

### **🌟 NEXA — PAGE-BY-PAGE WIREFRAME SPECIFICATION**

**Perfect — let's expand Nexa's post-login pages into wireframe-level UI descriptions. This will be detailed enough that an AI coding tool can directly translate into layout components (Next.js + Tailwind). Each page includes:**

- Header/Navigation
- Main Sections & Components
- Actions & Modals
- State & Behavior

#### **1. Dashboard (Home Hub)**

**Header:**
- Logo (top-left)
- Search bar
- Notifications bell
- Profile avatar → dropdown (Profile, Settings, Logout)

**Main layout:**
- **Top section:**
  - Mini SelfGraph (radar chart snapshot of interests/skills)
  - "Continue Roadmap" card → CTA button
- **Middle section:**
  - Nudges carousel (AI suggestions, reminders)
  - Quick Actions: "Start Capsule", "Find Mentor", "Create Project"
- **Bottom section:**
  - Recent Projects preview (cards with thumbnail + status)
  - Upcoming Opportunities (shortlist feed)

**Actions/Modals:**
- Click SelfGraph → expands into full SelfGraph page
- Click "Continue Roadmap" → Roadmap detail page
- Click Notification → opens right-side drawer of recent events

#### **2. Curiosity Compass Page**

**Header:**
- Title: "Curiosity Compass"
- Progress bar (number of cards swiped today)

**Main layout:**
- Swipe deck: interactive card (Domain/Skill/Idea + tags)
- Buttons: "Yes", "Maybe", "No" below card
- Progress indicator (3 dots per card session)

**Actions/Modals:**
- "See My Interests" → opens modal showing top interests
- "Generate Roadmap" button appears after N swipes

#### **3. Roadmaps Page**

**Header:**
- Title: "My Roadmaps"
- New Roadmap button (+ icon)

**Main layout:**
- List view: all roadmaps as cards (domain, status, progress bar)
- Timeline view: current roadmap displayed horizontally with milestone markers
- Step detail drawer: opens when user clicks a roadmap step

**Actions/Modals:**
- New Roadmap → modal: choose domain, goals, time preference
- Step detail drawer:
  - Title, description, estimated time
  - Linked capsules/projects
  - Start/Mark as Done button

#### **4. SkillStacker Page**

**Header:**
- Title: "SkillStacker"

**Main layout:**
- Graph view: bar chart Current vs Required skills
- Recommendations panel: list of capsules/projects to close gaps

**Actions/Modals:**
- "Add to Roadmap" button on recommendation card → injects into Roadmap
- Hover skill bar → tooltip with explanation (e.g., "Current: Beginner, Required: Intermediate")

#### **5. Capsules Page**

**Header:**
- Title: "Learning Capsules"
- Filters: Topic, Duration, Difficulty

**Main layout:**
- Grid/list of capsules → card design: title, duration, offline toggle
- Capsule detail modal → opens inline player (video/text/quiz)

**Actions/Modals:**
- Offline toggle → saves content to IndexedDB
- "Mark Complete" button updates progress and SelfGraph

#### **6. Project Playground Page**

**Header:**
- Title: "Projects"
- Buttons: "Create Project", "Browse Projects"

**Main layout:**
- Tabs: Active | Submitted | Archived
- Project cards: title, team, status, score
- Project detail page:
  - Kanban board (To Do, In Progress, Done)
  - File upload panel
  - Team list (avatars + roles)

**Actions/Modals:**
- Create Project → wizard modal (Idea → Plan → Tasks → Team → Submit)
- Submit project → confirmation modal

#### **7. Living Resume Page**

**Header:**
- Title: "My Resume"
- Buttons: "Export PDF", "Share Link"

**Main layout:**
- Sections (accordion-style):
  - Profile summary
  - Skills (tag chips)
  - Projects (cards with link to showcase)
  - Achievements
- "Pending Suggestions" panel: auto-added experiences awaiting approval

**Actions/Modals:**
- Export → modal: choose format (PDF, Link, Talent Passport)
- Edit → inline editor modal for each section

#### **8. Mentors Page**

**Header:**
- Title: "Find Mentors"
- Filters: Domain, Language, Availability

**Main layout:**
- Mentor cards: photo, bio, domains, match score bar
- Mentor detail modal: profile, reviews, availability calendar

**Actions/Modals:**
- Book session → opens calendar modal → confirm slot
- Feedback modal after completed session

#### **9. Virtual Career Coach Page**

**Header:**
- Title: "Career Coach"

**Main layout:**
- Chat interface (left = user, right = AI coach)
- Suggestion panel with quick replies (e.g., "Find Mentor", "Start Capsule")
- Context cards on sidebar: current roadmap, recent projects, SelfGraph snapshot

**Actions/Modals:**
- Click suggestion → inserts into chat & executes (opens roadmap step, capsule, etc.)
- Escalation → if flagged, opens Therapist page

#### **10. Opportunities Page**

**Header:**
- Title: "Opportunities"
- Filters: Domain, Location, Match Strength

**Main layout:**
- Job cards: company, role, skills required, match score
- Job detail modal: description, requirements, "Apply with Resume" button

**Actions/Modals:**
- Apply → modal confirmation → selects which resume version to use

#### **11. AI Career Therapist Page**

**Header:**
- Title: "Well-being Support"

**Main layout:**
- Chat interface (empathetic design, calm colors)
- Mood selector (emoji scale)
- Resource links (stress tips, helplines, mentors)

**Actions/Modals:**
- If high-risk → escalation modal with mentor contact options

#### **12. Entrepreneurship Edition Page**

**Header:**
- Title: "Startup Sandbox"
- Buttons: "Submit Idea", "Explore Ideas"

**Main layout:**
- Idea cards: title, problem, solution sketch
- Idea detail modal: lean canvas fields, mentor suggestions

**Actions/Modals:**
- Submit idea → wizard form
- Request mentor → opens matchmaking modal

#### **13. Profile & Settings Page**

**Header:**
- Title: "Profile & Settings"

**Main layout:**
- Tabs: Profile | Preferences | Account | Security
- Profile tab: avatar, bio, tagline editor
- Preferences: language, dark mode, notification toggles
- Account: email/phone, parental consent logs
- Security: password, 2FA, data export/delete

**Actions/Modals:**
- Change photo → file upload modal
- Delete account → confirmation modal with extra step

#### **Navigation (Persistent)**

**Top bar (desktop) or bottom nav (mobile)** with icons:
Dashboard | Compass | Roadmaps | Capsules | Projects | Resume | Mentors | Coach | Opportunities | More.

---

---

*This document serves as the comprehensive specification for building the complete Nexa platform. All future development should reference this document and update it as requirements evolve.*
