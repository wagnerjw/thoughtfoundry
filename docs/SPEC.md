# ThoughtFoundry — Product Specification & Build Plan

_Version 2.0 — February 2026_

---

## What ThoughtFoundry Is

ThoughtFoundry is a knowledge operating system for non-technical teams. It gives teams the ability to define and govern exactly what their AI knows (a **Knowledge Stack**), build **agents** that reason and act on that knowledge automatically, and **share** working operational systems with the rest of their organization — without writing a line of code or waiting on engineering.

---

## The Problem We're Solving

AI tools like Claude and Copilot are extraordinarily capable — in the hands of someone who knows how to use them. A technical person writes detailed system prompts, pastes the right context, iterates on outputs. They're doing invisible work that makes the AI useful.

A non-technical CS lead gets a chat box. They type a question, get an answer that might be right or hallucinated, with no way to tell which. No sources cited. No institutional context. Every conversation starts from zero. Nothing is repeatable. Nothing is automated.

ThoughtFoundry fills the gap between what AI _can_ do and what it _actually does_ for the knowledge workers who need it most. It's not competing with Claude. It's the layer that makes Claude actually work for people who can't engineer their own context.

**The precise thesis:** AI at work fails not because of the model — but because of the context. ThoughtFoundry fixes the context.

---

## What Makes ThoughtFoundry Different

Every competitor separates the three layers that need to work together:

- **Search tools** (Glean, Guru) — own the knowledge layer, no agent or automation layer
- **Agent builders** (Relevance AI, Stack AI) — own the agent layer, knowledge is an afterthought
- **General AI** (Copilot, Gemini) — single-window, no institutional context, resets every conversation

ThoughtFoundry is the only product where all three layers — governed knowledge, intelligent agents, and real outputs — are **first-class, co-designed, and shipped together as a single artifact called a Knowledge Stack.**

The order of operations is the differentiator. Competitors go: _build agent → point it at data._ ThoughtFoundry goes: _define and govern your knowledge → build agents that act on it._ That inversion is the whole product.

---

## Beachhead User

**Customer Success / Support Ops leads at SaaS companies.**

Why this user:

- Knowledge-intensive by definition — their whole job is knowing the answer to things
- Non-technical but process-minded — they think in workflows and runbooks already
- Constantly rebuilding from scratch — new hires, new products, new processes
- Measurable outcomes — ticket deflection, onboarding speed, resolution time
- No engineering resources of their own — stuck using Gemini while the product team builds internal tools
- Their knowledge is what the rest of the company needs — CS is the knowledge hub most companies don't know they have

**Secondary beachhead:** Revenue Operations / Sales Ops (pulled in organically when CS shares stacks with Sales).

---

## The Knowledge Stack Model

A Knowledge Stack is a governed, versionable, shareable unit that contains three layers:

**1. Data Layer** — the governed knowledge context. Documents, live connectors, scoped data sources. Explicitly scoped: this stack covers X for use by Y. Versioned: changes are tracked, agent runs are tied to the stack version active at time of run.

**2. Agent Layer** — autonomous roles that operate on the knowledge. Each agent has a definition (what it is, what it knows, what it produces) and trigger logic (when it runs). Agents don't query generic AI knowledge — they're scoped to the stack. Constrained context produces trustworthy outputs.

**3. Output Layer** — where the work lands. Structured documents, Slack messages, dashboard insights, chained agent calls. The stack doesn't just think — it does things.

All three layers travel together when a stack is shared or forked. When a CS team shares their Customer Onboarding Stack, the recipient gets the knowledge, the agents, and the outputs — a working operational system, not just a knowledge base.

---

## The Aha Moment

**Sharing a stack another team actually uses.**

When Team A builds a stack and Team B imports it, uses it, and trusts it — ThoughtFoundry becomes infrastructure. It's not a productivity tool anymore. It's the thing the company's operational knowledge runs on.

The preview experience is critical: the recipient sees what's in the stack, what the agents do, and what outputs they produce before they commit. Like a GitHub repo preview — structure, readme, last updated, activity — before you fork.

---

## Build Stages

### Stage 1 — Core Loop (Current Build)

Prove the thesis: a non-technical person can build a stack, run an agent, and share it with someone who uses it immediately.

### Stage 1.5 — CS Power Features

Add the two highest-value agents for the beachhead user. Triage and Response Drafter. Proves automation of real work, not just Q&A.

### Stage 2 — Full Platform

Complete agent taxonomy, ReactFlow visual builder, Stack Marketplace, additional connectors, advanced governance, self-hosted deployment.

---

## Tech Stack

| Layer            | Technology                    | Notes                                 |
| ---------------- | ----------------------------- | ------------------------------------- |
| Frontend         | Next.js 14 (App Router)       | TypeScript, Tailwind CSS              |
| Backend API      | FastAPI (Python)              | All AI and agent logic                |
| Database         | PostgreSQL via Supabase       | Auth, storage, structured data        |
| Vector Store     | pgvector (Supabase extension) | No separate vector DB needed in V1    |
| File Storage     | Supabase Storage              | Document uploads                      |
| AI Orchestration | LangChain (Python)            | RAG pipelines, agent execution        |
| Embeddings       | OpenAI text-embedding-3-small | Fast, cost-effective                  |
| LLM              | Anthropic Claude API          | Primary model; code is model-agnostic |
| Scheduling       | APScheduler (Python)          | In-process cron for scheduled agents  |
| Auth             | Supabase Auth                 | Email/password + magic link           |

### Local Dev (No Docker)

```
/thoughtfoundry
  /frontend    ← Next.js (port 3000)
  /backend     ← FastAPI (port 8000)
  .env         ← shared environment variables
```

Commands:

- `cd backend && uvicorn main:app --reload`
- `cd frontend && npm run dev`
- `supabase start` (Supabase CLI for local Postgres + Auth)

---

## Data Model

### `profiles`

```sql
profiles (
  id uuid PRIMARY KEY REFERENCES auth.users,
  display_name text,
  email text,
  org_id uuid REFERENCES organizations(id),
  created_at timestamptz DEFAULT now()
)
```

### `organizations`

Multi-tenant isolation unit. All data is scoped to an org.

```sql
organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

### `knowledge_stacks`

```sql
knowledge_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  owner_id uuid REFERENCES profiles(id),
  name text NOT NULL,
  description text,
  scope_statement text,         -- "This stack covers X for use by Y"
  version int DEFAULT 1,        -- increments on significant knowledge changes
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### `stack_versions`

Immutable record of stack state at each version — enables full provenance on agent runs.

```sql
stack_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id),
  version int NOT NULL,
  document_snapshot jsonb,      -- list of documents + chunk counts at this version
  published_by uuid REFERENCES profiles(id),
  published_at timestamptz DEFAULT now(),
  notes text
)
```

### `stack_documents`

```sql
stack_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id) ON DELETE CASCADE,
  filename text NOT NULL,
  storage_path text NOT NULL,
  file_type text,               -- pdf | md | txt | docx
  status text DEFAULT 'pending',-- pending | processing | ready | error
  chunk_count int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### `stack_connectors`

```sql
stack_connectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id) ON DELETE CASCADE,
  connector_type text NOT NULL, -- 'google_drive' in V1
  config jsonb NOT NULL,        -- encrypted reference to credentials, folder_id
  last_synced_at timestamptz,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
)
```

### `document_chunks`

```sql
document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id) ON DELETE CASCADE,
  document_id uuid REFERENCES stack_documents(id) ON DELETE CASCADE,
  chunk_index int NOT NULL,
  content text NOT NULL,
  embedding vector(1536),       -- pgvector, OpenAI embedding dim
  metadata jsonb,               -- page, source, heading context
  created_at timestamptz DEFAULT now()
)

CREATE INDEX ON document_chunks
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

### `agents`

```sql
agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  agent_type text NOT NULL,
  -- Stage 1:   'qa' | 'synthesis'
  -- Stage 1.5: + 'triage' | 'response_drafter'
  -- Stage 2:   + 'watch' | 'gap_detector' | 'briefing' | 'digest' |
  --              'decision_support' | 'escalation' | 'onboarding' |
  --              'document_drafter' | 'playbook'
  trigger_type text NOT NULL,   -- 'manual' | 'scheduled' | 'event'
  cron_expression text,         -- if trigger_type = 'scheduled'
  event_source text,            -- if trigger_type = 'event' (e.g. 'webhook')
  system_prompt text,           -- editable by stack owner
  output_type text NOT NULL,    -- 'document' | 'slack_webhook' | 'review_queue'
  output_config jsonb,          -- { webhook_url } | { requires_approval: true }
  confidence_threshold float DEFAULT 0.6,  -- below this → flag for review
  requires_approval boolean DEFAULT false, -- human-in-the-loop agents
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
)
```

### `agent_runs`

```sql
agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents(id) ON DELETE CASCADE,
  stack_id uuid REFERENCES knowledge_stacks(id),
  stack_version int,            -- version active at time of run — provenance
  triggered_by text NOT NULL,   -- 'manual' | 'schedule' | 'event'
  triggered_by_user_id uuid REFERENCES profiles(id),
  status text DEFAULT 'running',-- running | completed | failed | pending_review
  input jsonb,                  -- { query } for qa, { raw_input } for triage
  output text,                  -- agent's response
  sources jsonb,                -- [{ chunk_id, document_name, updated_at, score }]
  confidence_score float,
  gap_flags jsonb,              -- questions agent couldn't answer
  approved_by uuid REFERENCES profiles(id), -- for human-in-the-loop runs
  approved_at timestamptz,
  duration_ms int,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
)
```

### `stack_shares`

```sql
stack_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id uuid REFERENCES knowledge_stacks(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES profiles(id),
  shared_with_email text NOT NULL,
  shared_with_user_id uuid REFERENCES profiles(id),
  role text DEFAULT 'viewer',   -- 'viewer' | 'editor' | 'auditor' (V1: viewer only)
  status text DEFAULT 'pending',-- pending | accepted | declined
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz
)
```

### `review_queue`

For human-in-the-loop agents — holds outputs pending approval before delivery.

```sql
review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_run_id uuid REFERENCES agent_runs(id),
  stack_id uuid REFERENCES knowledge_stacks(id),
  draft_output text NOT NULL,
  sources jsonb,
  assigned_to uuid REFERENCES profiles(id),
  status text DEFAULT 'pending',-- pending | approved | rejected | edited
  reviewer_edits text,          -- if reviewer modifies before approving
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
)
```

### `audit_log`

Append-only. No update or delete routes. Enforced at RLS level.

```sql
audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id),
  stack_id uuid REFERENCES knowledge_stacks(id),
  user_id uuid REFERENCES profiles(id),
  action text NOT NULL,
  -- 'stack.created' | 'stack.updated' | 'stack.version.published'
  -- 'document.uploaded' | 'document.deleted'
  -- 'agent.created' | 'agent.run.started' | 'agent.run.completed'
  -- 'agent.run.approved' | 'agent.run.rejected'
  -- 'stack.shared' | 'share.accepted' | 'share.declined'
  -- 'connector.synced' | 'user.added' | 'user.removed'
  metadata jsonb,
  created_at timestamptz DEFAULT now()
)
```

---

## Agent Type Reference

### Stage 1 — Ship These First

**Q&A Agent**
Answers questions from the stack. Returns answer, sources with freshness, confidence level, and explicit gap flags when it doesn't know. Never hallucinates — states clearly when context is insufficient.

- Trigger: Manual
- Output: In-app document
- Autonomy: Fully manual — user asks, agent answers
- Key feature: Confidence signal + gap flagging is as important as the answer itself

**Synthesis Agent**
Runs on a schedule, analyzes the full stack, produces a structured report: key themes, coverage, gaps, freshness issues, recommended actions. The analyst that runs whether or not anyone remembers to ask.

- Trigger: Scheduled (cron)
- Output: In-app document or Slack webhook
- Autonomy: Fully autonomous

---

### Stage 1.5 — Add These Next

**Triage Agent**
Event-triggered on new input (ticket, Slack message, form submission via webhook). Classifies by type, severity, and likely resolution path based on _the team's documented processes in the stack_ — not generic categories. Routes to a person, channel, or another agent.

- Trigger: Event (inbound webhook)
- Output: Slack message or structured routing decision
- Autonomy: Fully autonomous
- What makes it ThoughtFoundry: classifies against your team's actual taxonomy, not generic AI categories

**Response Drafter Agent**
Given an incoming message or ticket, drafts a response grounded in the stack's knowledge. Returns draft, sources, confidence, caveats. Human reviews before sending.

- Trigger: Manual or event
- Output: Review queue (human approves before delivery)
- Autonomy: Human-in-the-loop — draft is always reviewed
- What makes it ThoughtFoundry: draft is grounded in your product knowledge and processes, not generic AI. Sources are cited so the reviewer immediately knows whether to trust it.

---

### Stage 2 — Full Taxonomy

**Watch Agent** — monitors connected sources for meaningful changes relative to the stack's scope. Alerts owner or triggers another agent when something significant changes.

**Gap Detector Agent** — passively monitors Q&A runs, aggregates low-confidence and failed answers over time, surfaces prioritized knowledge gap report to stack owner. Makes the stack self-improving.

**Briefing Agent** — ingests new information from connected sources since last run, produces a briefing contextualizing new info against existing stack knowledge. The stack's morning standup.

**Digest Agent** — scheduled, produces formatted digest of stack activity and key knowledge for stakeholders who don't log into ThoughtFoundry. How a stack radiates value to people who never use the product.

**Decision Support Agent** — given a situation, reasons step by step from the stack's knowledge to produce a structured recommendation with options, risks, and alignment with team's documented approach. Always human-in-the-loop.

**Escalation Reasoning Agent** — specialized Decision Support for CS/Support. Takes a ticket or customer situation, reasons against escalation criteria in the stack, recommends escalate/not with full context brief. Human-in-the-loop.

**Onboarding Agent** — triggered manually or on new team member add. Produces structured onboarding plan from the stack: what to read first, what to know cold, top questions new people ask with answers. Human reviews before sending.

**Document Drafter Agent** — given a topic or a gap flagged by Gap Detector, drafts a new document for the stack in the context of what already exists. Human reviews and adds to stack.

**Playbook Agent** — given an issue category, drafts a step-by-step resolution playbook grounded in stack knowledge and past resolution patterns from run history. Human reviews.

---

## Agent Autonomy Map

| Agent                | Category      | Autonomy                      | Stage |
| -------------------- | ------------- | ----------------------------- | ----- |
| Q&A                  | Query         | Manual invoke                 | 1     |
| Synthesis            | Scheduled     | Fully autonomous              | 1     |
| Triage               | Monitor/React | Fully autonomous              | 1.5   |
| Response Drafter     | Drafting      | Human-in-the-loop             | 1.5   |
| Watch                | Monitor/React | Autonomous detect, human acts | 2     |
| Gap Detector         | Monitor/React | Fully autonomous              | 2     |
| Briefing             | Scheduled     | Fully autonomous              | 2     |
| Digest               | Scheduled     | Fully autonomous              | 2     |
| Decision Support     | Reasoning     | Human-in-the-loop             | 2     |
| Escalation Reasoning | Reasoning     | Human-in-the-loop             | 2     |
| Onboarding           | Reasoning     | Human reviews                 | 2     |
| Document Drafter     | Drafting      | Human reviews                 | 2     |
| Playbook             | Drafting      | Human reviews                 | 2     |

---

## Agent Prompt Templates

### Q&A Agent

```
You are a knowledge assistant for the {stack_name} knowledge stack.

Scope: {scope_statement}

Answer questions using ONLY the context provided. Do not use outside knowledge.

Rules:
- Clear answer in context → answer with specific citations
- Partial answer → provide what you know, explicitly state what is missing
- No relevant context → say so clearly, do not guess
- Rate confidence: HIGH (clear answer) | MEDIUM (partial) | LOW (insufficient)
- Flag specific gaps when confidence is MEDIUM or LOW

Response format:
ANSWER: [your answer]
SOURCES: [document names and last updated dates]
CONFIDENCE: [HIGH | MEDIUM | LOW]
GAP: [what is missing, if anything]
```

### Synthesis Agent

```
You are a knowledge analyst for the {stack_name} knowledge stack.

Scope: {scope_statement}

Review the knowledge stack contents and produce a structured report.

Include:
1. KEY THEMES: Main topics and patterns in this knowledge base
2. COVERAGE SUMMARY: What this stack covers well
3. GAPS IDENTIFIED: Topics missing or underrepresented
4. FRESHNESS NOTES: Content that appears outdated
5. RECOMMENDED ACTIONS: Suggested additions or updates

Reference actual document names. This report is for the team maintaining this stack.
```

### Triage Agent

```
You are a triage specialist for the {stack_name} team.

Scope: {scope_statement}

You will receive an incoming request. Using the team's documented processes,
classify and route it.

Classify:
- TYPE: [category based on team's taxonomy in the stack]
- SEVERITY: [High | Medium | Low] with reasoning
- RESOLUTION PATH: [likely steps based on documented processes]
- ROUTING: [who or where this should go, per team's routing rules]
- CONFIDENCE: [HIGH | MEDIUM | LOW]

If confidence is LOW, flag for human review rather than routing autonomously.
Only use routing rules documented in this stack. Never invent categories.
```

### Response Drafter Agent

```
You are a response specialist for the {stack_name} team.

Scope: {scope_statement}

Draft a response to the incoming message using ONLY the team's documented
knowledge in this stack.

Your draft should:
- Directly address the question or issue raised
- Use the team's documented tone and terminology
- Cite specific processes or policies where relevant
- Flag anything you're uncertain about

Response format:
DRAFT: [your response draft]
SOURCES: [documents you drew from, with last updated dates]
CONFIDENCE: [HIGH | MEDIUM | LOW]
CAVEATS: [anything the reviewer should check before sending]

This is a draft for human review. Do not present it as final.
```

---

## Governance Model

Governance is a product feature, not a compliance checkbox. It's what makes ThoughtFoundry trustworthy at the organizational level.

### Knowledge Provenance

Every agent output is traceable to:

- Exact documents used
- Chunk-level sources with relevance scores
- Document freshness at time of run
- Stack version active at time of run

When someone asks "what did the agent know when it made that recommendation?" — the answer is precise and auditable. No other product in this space can say that.

### Stack Versioning

Stacks have versions. When documents change significantly, the owner publishes a new version. Agent runs are tied to the version active at time of run. Prior versions are preserved. This enables complete reconstruction of any agent's knowledge state at any point in time.

### Access Roles (V1: Owner + Viewer. V2: Full model)

- **Owner** — full control: edit knowledge, modify agents, manage shares
- **Editor** — add documents, update knowledge; cannot change agents or shares (V2)
- **Viewer** — invoke agents, see outputs; cannot see raw document content
- **Auditor** — read-only access to full audit log and run history; cannot invoke agents (V2)

### Agent Guardrails

- **Confidence thresholds** — below threshold, output goes to review queue instead of delivering autonomously
- **Approval requirements** — configurable per agent; some agents always require human sign-off
- **Scope enforcement** — agents only query knowledge within their assigned stack
- **Rate limits** — agents cannot be invoked more than N times per hour per user

### Audit Log

Append-only. No update or delete routes. Enforced at RLS level. Every meaningful action is recorded. Queryable and exportable for compliance review.

### Security Architecture (Non-Negotiable Even in V1)

- **Row-Level Security on all Supabase tables** — no cross-tenant data access is architecturally possible
- **JWT validation on every FastAPI route** — no unauthenticated routes except `/preview/{shareId}`
- **Stack preview exposes metadata only** — document names, agent descriptions; never raw content
- **Connector credentials encrypted** — stored via pgcrypto reference, never plaintext in config
- **Agent outputs isolated per run** — shared users see only their own run outputs
- **Tenant isolation tested explicitly** — automated tests verify cross-org queries are impossible

---

## Application Architecture

```
Browser (Next.js 14)
    │
    ├── Next.js API routes          ← auth validation, lightweight proxying
    │
    └── FastAPI (Python)
          │
          ├── /stacks               ← CRUD, versioning, sharing
          ├── /agents               ← CRUD, run invocation
          ├── /ingest               ← document processing pipeline
          ├── /webhooks             ← inbound event triggers (Stage 1.5)
          ├── /review               ← review queue management
          └── /scheduler            ← APScheduler cron management
                │
                ├── LangChain
                │     ├── RecursiveCharacterTextSplitter (chunk_size=1000, overlap=200)
                │     ├── OpenAI Embeddings (text-embedding-3-small)
                │     └── pgvector retrieval (cosine similarity, top-K=5)
                │
                ├── Claude API (Anthropic)
                │     └── All agent prompt chains
                │
                └── Supabase
                      ├── PostgreSQL + pgvector
                      ├── Storage (document files)
                      └── Auth (JWT)
```

---

## API Routes

```
# Auth
POST   /auth/session

# Stacks
GET    /stacks
POST   /stacks
GET    /stacks/{id}
PATCH  /stacks/{id}
DELETE /stacks/{id}
POST   /stacks/{id}/version          ← publish new version

# Documents
POST   /stacks/{id}/documents        ← upload + trigger ingestion
DELETE /stacks/{id}/documents/{docId}

# Connectors
POST   /stacks/{id}/connectors
POST   /stacks/{id}/connectors/{connId}/sync

# Agents
GET    /stacks/{id}/agents
POST   /stacks/{id}/agents
PATCH  /stacks/{id}/agents/{agentId}
DELETE /stacks/{id}/agents/{agentId}
POST   /stacks/{id}/agents/{agentId}/run
GET    /stacks/{id}/agents/{agentId}/runs

# Webhooks (Stage 1.5)
POST   /webhooks/{agentId}           ← inbound event trigger (public, HMAC verified)

# Review Queue
GET    /review
GET    /review/{runId}
POST   /review/{runId}/approve
POST   /review/{runId}/reject
PATCH  /review/{runId}/edit

# Sharing
POST   /stacks/{id}/share
GET    /stacks/{id}/shares
PATCH  /shares/{shareId}/accept
PATCH  /shares/{shareId}/decline
GET    /preview/{shareId}            ← public, no auth, metadata only

# Audit
GET    /stacks/{id}/audit
GET    /org/audit                    ← org-wide audit (auditor role, V2)
```

---

## Frontend Routes

| Route                               | Description                                             |
| ----------------------------------- | ------------------------------------------------------- |
| `/`                                 | Landing / login redirect                                |
| `/login`                            | Supabase Auth UI                                        |
| `/dashboard`                        | All stacks — owned and shared                           |
| `/stacks/new`                       | Create stack                                            |
| `/stacks/[id]`                      | Stack detail: documents, agents, audit, version history |
| `/stacks/[id]/share`                | Share management                                        |
| `/stacks/[id]/agents/new`           | Add agent                                               |
| `/stacks/[id]/agents/[agentId]`     | Agent detail + run history                              |
| `/stacks/[id]/agents/[agentId]/run` | Manual invocation UI                                    |
| `/review`                           | Review queue — pending human approvals                  |
| `/review/[runId]`                   | Review a specific draft output                          |
| `/preview/[shareId]`                | Public stack preview (pre-auth)                         |
| `/shared`                           | Stacks shared with current user                         |

---

## Core User Journeys

### Journey 1: Create a Stack and Upload Documents

1. User logs in → creates new Knowledge Stack (name, description, scope statement)
2. Uploads documents via drag-and-drop (PDF, MD, TXT, DOCX)
3. Ingestion pipeline: extract text → chunk → embed → store in pgvector
4. Stack status: "Ready — 12 documents, 847 chunks indexed"
5. Document list shows each file with status and chunk count

### Journey 2: Run a Q&A Agent

1. User opens stack → adds Q&A Agent (name, description, manual trigger)
2. Invokes: types question
3. Backend: embed query → retrieve top-5 chunks → build prompt → call Claude
4. Response rendered: answer + cited sources with last-updated dates + confidence indicator
5. If LOW confidence: "This looks like a gap. Want to add a document?"
6. Run stored in agent_runs with full provenance

### Journey 3: Schedule a Synthesis Agent

1. User adds Synthesis Agent → selects scheduled trigger → sets cron (e.g. Mondays 9am)
2. Provides Slack webhook URL
3. APScheduler registers cron job
4. At scheduled time: full stack context → synthesis prompt → structured report → Slack
5. Run stored; user can also trigger manually anytime

### Journey 4: Share a Stack (The Aha Moment)

1. User opens stack → Share → enters recipient email
2. Recipient receives email with link to preview
3. **Preview page** (no login required):
   - Stack name, description, scope statement
   - Document list (names + count, not content)
   - Agent list: type, description, last run time, last output preview
   - Owner name, last updated
4. Recipient clicks "Use this Stack" → prompted to log in
5. On accept: they see the stack in "Shared With Me"
6. They invoke agents — runs logged under their user ID, scoped to their view

### Journey 5: Review a Draft (Stage 1.5)

1. Response Drafter Agent is triggered (manual or inbound webhook)
2. Agent produces draft output → stored in `review_queue` (status: pending)
3. Reviewer notified (Slack or in-app)
4. Reviewer opens `/review/[runId]`: sees draft, sources, confidence, caveats
5. Options: Approve (sends as-is), Edit + Approve (modifies before sending), Reject
6. Action logged in audit_log; if approved, output delivered to configured destination

---

## Ingestion Pipeline

```python
async def ingest_document(document_id: str):
    doc = await get_document(document_id)
    await update_status(document_id, 'processing')

    # 1. Extract text
    text = extract_text(doc.file_type, doc.storage_path)
    # Supported: PDF (pypdf), MD (direct), TXT (direct), DOCX (python-docx)

    # 2. Chunk
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", ".", " "]
    )
    chunks = splitter.split_text(text)

    # 3. Embed (batched to respect rate limits)
    embeddings = await embed_chunks_batched(chunks, batch_size=100)

    # 4. Store chunks + embeddings
    await store_chunks(document_id, doc.stack_id, chunks, embeddings)

    # 5. Update document status
    await update_status(document_id, 'ready', chunk_count=len(chunks))

    # 6. Audit log
    await log_action('document.processed', stack_id=doc.stack_id,
                     metadata={'chunks': len(chunks), 'document': doc.filename})
```

---

## Recommended Build Order

Build in this sequence to always have something working and demonstrable:

**Step 1 — Project scaffold**
Next.js + FastAPI monorepo, Supabase local setup, env vars, auth flow working end to end. Nothing fancy — just the skeleton that proves the two services talk to each other with auth.

**Step 2 — Stack CRUD**
Create, list, view, edit stacks. No AI yet. Just the data model working in the UI. Establishes the core navigation and page structure.

**Step 3 — Document upload + ingestion**
File upload to Supabase Storage, text extraction, chunking, embedding, pgvector storage. Status tracking. This is the first time the product touches AI.

**Step 4 — Q&A Agent**
Agent creation form, manual invocation, RAG retrieval, Claude API call, response rendered with sources, confidence, and gap flags. This is the first real "wow" moment.

**Step 5 — Stack sharing + preview**
Share by email, preview page (metadata only), accept flow, viewer access to agents. This is the thesis validation step. If people share stacks here, the product is real.

**Step 6 — Synthesis Agent + scheduling**
Synthesis prompt, APScheduler cron registration, Slack webhook output. First autonomous agent.

**Step 7 — Audit log**
Instrument all meaningful actions, render in stack detail. Establishes the governance foundation.

**Step 8 — Review queue (Stage 1.5 prep)**
Build the review queue UI and approval flow before adding agents that need it.

**Step 9 — Triage Agent + Response Drafter (Stage 1.5)**
Inbound webhook endpoint (HMAC verified), Triage agent, Response Drafter with review queue integration.

**Step 10 — Google Drive connector**
OAuth flow, folder sync, documents treated identically to uploads post-ingestion. Save this for last — OAuth complexity can swallow time.

**Step 11 — Polish**
Loading states, error handling, empty states, confidence/gap UI, provenance display on every agent output.

---

## V2 Scope (Do Not Build in V1)

- ReactFlow visual agent builder (multi-step logic graphs)
- Agent chaining / multi-agent orchestration
- Stack Marketplace (public sharing, forking, community curation)
- Additional connectors (Slack ingestion, Notion, Confluence, Jira, Zendesk)
- Full role model (Editor, Auditor)
- Stack Graph (org-wide knowledge map — design data model for this now, render later)
- Self-hosted Docker deployment
- Model selection UI (let owners choose LLM per agent)
- Analytics dashboard
- SOC 2 Type I process
- Stage 2 agent types

---

## The Stack Graph — Design Now, Build in V2

The Stack Graph is the feature that turns ThoughtFoundry from a collection of team tools into a company-wide knowledge infrastructure product. It maps how stacks connect across an organization: which stacks reference each other, which agents query across stacks, where org-wide knowledge gaps are.

**Design implication for V1:** Capture stack-to-stack relationships in the data model now, even though you won't render them. When Agent A in Stack X retrieves from Stack Y (a future cross-stack query feature), that relationship should be recordable. Add a `stack_relationships` table to the schema now as an empty table — it costs nothing and prevents painful migration later.

```sql
stack_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_stack_id uuid REFERENCES knowledge_stacks(id),
  target_stack_id uuid REFERENCES knowledge_stacks(id),
  relationship_type text,       -- 'queries' | 'shares_with' | 'forked_from'
  created_at timestamptz DEFAULT now()
)
```

---

## Company-Wide Adoption Path

ThoughtFoundry spreads through the stacks, not through sales.

**Land:** CS team gets undeniable value — ticket deflection, onboarding speed, knowledge retention after turnover. Measurable outcomes that a manager notices.

**Expand organically:** CS shares their stack with Sales. Sales starts using it before calls. Sales builds their own stack. Marketing pulls from Sales. Each team that shares a stack pulls in the next team without a separate sales motion.

**Recognize:** At some point a VP of Operations notices three teams using ThoughtFoundry and asks what it is. That's the expansion conversation — not "let me sell you software" but "your teams have already built something valuable here, let me show you what it looks like across your whole organization."

**Lock in:** The Stack Graph makes ThoughtFoundry irreplaceable. Once a company can see their entire institutional knowledge mapped — what's covered, what's missing, what's stale, how teams depend on each other — ripping out ThoughtFoundry means losing that map. No individual agent feature creates that stickiness. The network of connected stacks does.

---

## What to Hand Claude Code

When starting the build, provide this document as context and use this as the first prompt:

> "Scaffold a Next.js 14 (App Router, TypeScript, Tailwind) + FastAPI (Python) monorepo called thoughtfoundry. Set up Supabase local development with the following PostgreSQL schema [paste Data Model section]. Wire up Supabase Auth end to end — login page, session handling in Next.js, JWT validation middleware in FastAPI. Follow the security architecture exactly as specified: RLS on all tables, JWT on all routes. No Docker. Local dev only. Confirm the auth flow works before touching anything else."

Build one step at a time. Confirm each step works before moving to the next. The build order in this document is the sequence to follow.

---

_Stack: Next.js 14 / FastAPI / Supabase / pgvector / LangChain / Claude API_
_Target user: CS/Support Ops leads at SaaS companies_
_Core thesis: AI at work fails not because of the model — but because of the context. ThoughtFoundry fixes the context._
