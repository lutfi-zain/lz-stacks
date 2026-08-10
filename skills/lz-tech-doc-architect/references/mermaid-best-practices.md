# Mermaid Diagram Best Practices & Rules

When generating Mermaid diagrams for technical documentation, you **MUST** follow these structural and syntactical rules to ensure high-quality, readable, and error-free visualizations.

## 1. Syntax & Safety Rules (CRITICAL)

AI-generated Mermaid code often fails to render due to syntax errors. Strictly adhere to these safety checks:

- **Escape Special Characters**: If a node label contains parentheses `()`, brackets `[]`, braces `{}`, or colons `:`, you MUST wrap the label in quotes. 
  - ❌ `A[getUser(id)]` -> *Will break rendering*
  - ✅ `A["getUser(id)"]`
- **No HTML Tags**: Do not use raw HTML (`<b>`, `<br>`) inside node labels unless you are absolutely sure the environment supports `HTMLLabels`. Use standard Markdown or Mermaid's native line break syntax if necessary.
- **Direction**: Always explicitly define the direction for graphs. Use `TD` (Top-Down) for architectures and component trees, and `LR` (Left-Right) for data pipelines.

## 2. Diagram Specific Best Practices

### A. System Architecture (C4 Context & Container) `graph TD`
**Purpose**: Map high-level systems interacting with a feature or endpoint.
**Rules**:
- Distinguish internal vs external systems (use subgraph for internal domain).
- **Edge Labels (CRITICAL)**: When tracing HTTP/API calls between services, you **MUST** label the edge with the exact `[METHOD] [URL PATH]`. Do NOT use generic labels like "HTTP Request" or "Signature Header".
  - ❌ `ServiceA -- "HTTP POST" --> ServiceB`
  - ✅ `ServiceA -- "POST /api/v1/wrapper" --> ServiceB`
- Do NOT include function names or variables here. Keep it high-level but precise on network boundaries.

### B. Component Design (Component Tree) `graph TD`
**Purpose**: Map Frontend frameworks (React, Angular, Astro) DOM/Component hierarchy.
**Rules**:
- The root node is the Page/Route.
- Leaf nodes are UI atomic components.
- Use dashed lines `-.->` to indicate state/prop drilling or Context API injections.

### C. Cross-Service Request Flow (Sequence Diagram) `sequenceDiagram`
**Purpose**: Map the chronological lifecycle of a request, including cross-service integrations and internal layers.
**Rules**:
- Declare participants explicitly.
- **Service Grouping**: When an endpoint hits downstream services, use `box` syntax to group participants by Service (e.g., `box Primary Service`, `box Downstream Service`).
- For Event-Driven architecture, explicitly label the `Message Broker` (e.g., Kafka) as a participant.
- Show the return path back to the client or acknowledgment path (e.g., `ACK` for queues).
- Use `alt`/`else` blocks for branching logic.

### D. Data Mutation (ER Diagram) `erDiagram`
**Purpose**: Map specific database tables and columns mutated by an action.
**Rules**:
- Exact table names as found in the schema.
- Only list columns relevant to the specific documentation scope.
- If tracing cross-service, use comments `%% Service A DB` to group the tables logically.
- Clearly show cardinality (e.g., `||--o{` for one-to-many).
