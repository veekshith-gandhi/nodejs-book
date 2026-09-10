# Boston Scientific-Style ERP Platform — Architecture & Interview Guide

> **Purpose:** Interview preparation for understanding and explaining a large internal ERP-style application from zero.
>
> **Important:** This is a realistic interview architecture based on the project description provided (React + Node.js microservices + SAP/ERP + asynchronous bulk processing + AWS). It is **not a claim that Boston Scientific's private production architecture is exactly this**. Only describe components as things you personally used if you actually used them.

---

# 1. The Big Picture

The easiest way to understand the system is:

```text
                         INTERNAL USERS
                              |
                              v
                     +------------------+
                     |   React Frontend |
                     +--------+---------+
                              |
                         HTTPS / REST
                              |
                              v
                  +-----------------------+
                  | AWS Edge / Security   |
                  | Route53 / WAF /       |
                  | API Gateway / ALB     |
                  +-----------+-----------+
                              |
                              v
       +------------------------------------------------+
       |             NODE.JS MICROSERVICES              |
       |                                                |
       | +-------------+  +-------------+  +----------+|
       | | Order       |  | Inventory   |  | Pricing  ||
       | | Service     |  | Service     |  | Service  ||
       | +------+------+  +------+------+  +----------+|
       |        |                |                       |
       | +------+------+  +------+------+               |
       | | SAP         |  | Bulk        |               |
       | | Integration |  | Processing  |               |
       | | Service     |  | Service     |               |
       | +-------------+  +-------------+               |
       +--------------------+---------------------------+
                            |
              +-------------+-------------+
              |             |             |
              v             v             v
        +-----------+  +-----------+  +-----------+
        |PostgreSQL |  |   Redis   |  |    S3     |
        |           |  |   Cache   |  |Bulk Files |
        |App State  |  |Fast Data  |  |CSV/Excel  |
        +-----------+  +-----------+  +-----+-----+
                                           |
                                           | Event / Job
                                           v
                                  +------------------+
                                  |    RabbitMQ      |
                                  |  Message Broker  |
                                  |                  |
                                  | Order Queue      |
                                  | Inventory Queue  |
                                  | Bulk Queue       |
                                  | Retry / DLQ      |
                                  +--------+---------+
                                           |
                              +------------+------------+
                              |            |             |
                              v            v             v
                         +---------+  +---------+  +---------+
                         | Worker 1|  | Worker 2|  | Worker 3|
                         | Node.js |  | Node.js |  | Node.js |
                         +----+----+  +----+----+  +----+----+
                              |            |             |
                              +------------+-------------+
                                           |
                                           v
                                  +------------------+
                                  |    SAP / ERP     |
                                  |                  |
                                  | Orders           |
                                  | Inventory        |
                                  | Pricing          |
                                  | Fulfillment      |
                                  | Master Data      |
                                  +------------------+

 CROSS-CUTTING:
 Authentication / Authorization / IAM / Secrets / Logging / Metrics /
 Tracing / Monitoring / Alerts / CI-CD / Docker / ECS-EKS-Kubernetes
```

---

# 2. What Is This Application?

Think of the application as an **internal enterprise business platform**.

Employees use it to manage things such as:

- Orders
- Inventory
- Pricing
- Data processing
- Bulk uploads
- Business workflows

The application communicates with **SAP/ERP** for downstream enterprise processing.

A simple mental model:

```text
User
  |
  v
React
  |
  v
Node.js Microservices
  |
  +----> Database
  |
  +----> Cache
  |
  +----> Queue
           |
           v
         Workers
           |
           v
          SAP
```

The Node.js application is therefore **not necessarily replacing SAP**.

It provides APIs, business logic, validation, orchestration, asynchronous processing, and integration around enterprise systems.

---

# 3. What Does "Microservices" Mean?

Instead of having one giant Node.js application:

```text
One Big Application
|
+-- Orders
+-- Inventory
+-- Pricing
+-- Bulk Processing
+-- SAP Integration
```

the business capabilities are separated:

```text
Order Service
Inventory Service
Pricing Service
Bulk Processing Service
SAP Integration Service
```

Each service is independently deployable and scalable.

Example:

```text
Order Service       -> 3 instances
Inventory Service   -> 3 instances
Bulk Service        -> 10 instances
```

If bulk processing becomes very busy, you can scale the bulk workers without scaling every service.

**Important:** Node.js does not automatically mean microservices. Node.js is the technology used to implement the services.

---

# 4. React Frontend

React is the presentation layer.

It could contain:

```text
Dashboard
Orders
  - Create Order
  - Search Order
  - Update Order
  - Order Status

Inventory
  - Search Inventory
  - Availability
  - Stock Movement

Pricing
  - Search Price
  - Pricing Details

Bulk Processing
  - Upload File
  - Job Status
  - Error Report
```

React should normally communicate with backend APIs rather than directly connecting to SAP or PostgreSQL.

```text
React
  |
  | HTTPS REST API
  v
Node.js
```

Interview statement:

> "The React application acted as the presentation layer and communicated with the Node.js backend through secured REST APIs. Business logic and downstream integrations were kept inside the backend."

---

# 5. AWS Edge Layer

A common enterprise flow can be:

```text
User
  |
  v
Route 53
  |
  v
WAF
  |
  v
API Gateway / Load Balancer
  |
  v
Node.js Services
```

### Route 53

DNS service.

It helps resolve a domain name to the appropriate endpoint.

### WAF

Web Application Firewall.

It can protect against common web attacks and unwanted traffic.

### API Gateway

Provides an API entry point and can handle things such as:

- Routing
- Authentication integration
- Rate limiting
- API management

### Load Balancer

Distributes traffic across multiple application instances.

```text
             Load Balancer
              /    |    \
             v     v     v
          Node 1 Node 2 Node 3
```

If Node 1 fails, other instances can continue serving traffic.

---

# 6. Node.js Microservices

A realistic logical split:

```text
+-------------------------+
| Order Service           |
| - Create order          |
| - Update order          |
| - Order status          |
+-------------------------+

+-------------------------+
| Inventory Service       |
| - Availability          |
| - Stock                 |
| - Inventory lookup      |
+-------------------------+

+-------------------------+
| Pricing Service         |
| - Price lookup          |
| - Pricing rules         |
+-------------------------+

+-------------------------+
| SAP Integration Service |
| - SAP communication     |
| - Mapping               |
| - Error handling        |
+-------------------------+

+-------------------------+
| Bulk Processing Service |
| - Jobs                  |
| - Chunking              |
| - Validation            |
| - Transformation        |
+-------------------------+
```

These are logical service boundaries. Your actual production boundaries may have been different.

---

# 7. PostgreSQL — Why Do We Need It?

PostgreSQL stores persistent application data.

Possible tables:

```text
orders
order_items
customers
products
inventory
pricing
processing_jobs
audit_logs
```

Example:

```text
orders
--------------------------------
id
customer_id
status
total
created_at
updated_at
```

For an order:

```text
Order ID: 12345
Status: PROCESSING
Customer: ABC
Total: 5000
```

### Important concept

Do not automatically say:

> "PostgreSQL was the source of truth for everything."

In an enterprise integration system, some business data may be mastered by SAP or another enterprise system.

A safer interview statement:

> "We maintained application-specific transactional state in the application database while integrating with SAP for enterprise business processes and downstream system-of-record data."

---

# 8. Redis — Why?

Redis is commonly used as a fast cache.

Without cache:

```text
Node.js
   |
   v
PostgreSQL
```

With cache:

```text
Node.js
   |
   v
Redis
   |
   +---- Cache Hit ----> Return quickly
   |
   +---- Cache Miss ----> PostgreSQL
                              |
                              v
                            Redis
```

Useful for frequently requested, relatively stable data such as:

- Product information
- Pricing information
- Configuration
- Reference data

Redis reduces repeated database queries.

---

# 9. S3 — Why?

S3 is object storage.

It is suitable for large files:

```text
CSV
Excel
JSON
Migration files
Bulk data
Reports
```

Instead of:

```text
React
 |
 | 500 MB file
 v
Node.js memory
```

prefer:

```text
React
 |
 v
S3
 |
 v
Bulk processing
```

The application doesn't need to keep the entire file in Node.js memory.

---

# 10. RabbitMQ — The Most Important Concept

RabbitMQ is a **message broker**.

Its job is to hold messages/tasks until workers process them.

Think of it as a waiting line.

```text
Producer
   |
   v
RabbitMQ
   |
   v
Consumer / Worker
```

Example:

```text
Order Service
     |
     | "Process order 12345"
     v
 RabbitMQ
     |
     v
 Order Worker
     |
     v
    SAP
```

RabbitMQ is not the database.

PostgreSQL stores data.

RabbitMQ transports asynchronous work.

---

# 11. Why Do We Need RabbitMQ?

Suppose SAP takes 5 seconds.

A synchronous design:

```text
User
 |
 v
Node.js
 |
 v
SAP
 |
 | 5 seconds
 v
Node.js
 |
 v
User
```

The user waits.

With asynchronous processing:

```text
User
 |
 v
Node.js
 |
 +------> PostgreSQL
 |
 +------> RabbitMQ
             |
             v
           Worker
             |
             v
            SAP
```

The API can respond:

```text
Order accepted.
Status: PROCESSING
```

The worker continues the SAP operation in the background.

---

# 12. PostgreSQL and RabbitMQ Are NOT a Simple Chain

This is a common misunderstanding.

Do not imagine:

```text
PostgreSQL -> RabbitMQ
```

as though RabbitMQ is simply the next database.

Instead:

```text
                  Node.js Service
                  /             \
                 /               \
                v                 v
         PostgreSQL           RabbitMQ
         Store data           Send work
                                  |
                                  v
                               Worker
                                  |
                                  v
                                 SAP
```

They have different responsibilities.

| Component | Main job |
|---|---|
| PostgreSQL | Persist application data |
| Redis | Fast cache |
| S3 | Store large files |
| RabbitMQ | Deliver asynchronous messages |
| Worker | Execute background processing |
| SAP | Downstream ERP/business processing |

---

# 13. Complete Order Creation Flow

Imagine a user creates an order.

## Step 1 — User

```text
Employee
   |
   v
React
```

## Step 2 — API

```text
React
   |
   | POST /orders
   v
Order Service
```

## Step 3 — Authentication

The backend verifies the user's identity/token.

```text
Who are you?
```

## Step 4 — Authorization

Check permissions.

```text
Can this user create an order?
```

Example:

```text
Admin      -> YES
Operations -> YES
Viewer     -> NO
```

## Step 5 — Validation

Check:

```text
Required fields
Product exists
Quantity valid
Customer valid
Business rules
```

## Step 6 — Save state

```text
Order Service
     |
     v
PostgreSQL

Order 12345
Status = PROCESSING
```

## Step 7 — Publish work

```text
Order Service
     |
     v
RabbitMQ

"Process Order 12345"
```

## Step 8 — Worker consumes

```text
RabbitMQ
    |
    v
Order Worker
```

## Step 9 — Worker calls SAP

```text
Order Worker
    |
    v
SAP
```

## Step 10 — SAP responds

```text
SAP
 |
 +--> Success
 |
 +--> Failure
```

## Step 11 — Update status

```text
Worker
  |
  v
PostgreSQL

Order 12345
Status = CONFIRMED
```

The complete flow:

```text
React
  |
  v
API Gateway / LB
  |
  v
Order Service
  |
  +--------------------> PostgreSQL
  |                       Save state
  |
  +--------------------> RabbitMQ
                              |
                              v
                         Order Worker
                              |
                              v
                             SAP
                              |
                              v
                         Worker receives
                           response
                              |
                              v
                         PostgreSQL
                         Update status
```

---

# 14. Why Asynchronous Processing?

Use asynchronous processing when work:

- Takes a long time
- Does not need to finish before the API responds
- Has large volume
- Can be retried
- Needs controlled processing
- Depends on a slower downstream system

Example:

```text
10,000 requests
       |
       v
    RabbitMQ
       |
       v
Workers process at controlled rate
       |
       v
      SAP
```

This prevents your backend from overwhelming SAP.

---

# 15. Worker Architecture

A worker is simply a backend process that consumes jobs from a queue.

```text
RabbitMQ
    |
    +--> Worker 1
    +--> Worker 2
    +--> Worker 3
```

Worker logic:

```text
Consume message
      |
      v
Validate message
      |
      v
Perform processing
      |
      v
Call SAP / DB
      |
      v
Success?
   /       \
 YES       NO
  |         |
  v         v
ACK       Retry
            |
            v
          DLQ
```

---

# 16. Retry and Dead Letter Queue

Suppose SAP is temporarily unavailable.

```text
Worker
  |
  v
SAP
  |
  X Timeout
```

Don't necessarily give up immediately.

Example:

```text
Attempt 1 -> FAIL
     |
     v
Retry
     |
Attempt 2 -> FAIL
     |
     v
Retry
     |
Attempt 3 -> FAIL
     |
     v
Dead Letter Queue
```

DLQ means:

> "This message could not be successfully processed after the allowed attempts. Keep it separately for investigation or later recovery."

---

# 17. Idempotency — Very Important

Imagine the worker sends:

```text
Create Order 12345
```

to SAP.

SAP successfully creates it, but the network response is lost.

The worker thinks:

```text
SAP failed
```

and retries.

Now SAP might receive:

```text
Create Order 12345
Create Order 12345
```

Potentially creating duplicates.

So we need **idempotency**.

The idea:

> Processing the same request more than once should not create duplicate business effects.

Possible mechanisms:

```text
Idempotency Key
Order ID
Request ID
Unique DB constraint
Processed-message table
```

Example:

```text
Order ID = 12345

First processing -> SUCCESS
Second processing -> Already processed
```

---

# 18. The Transactional Outbox Problem

There is a subtle problem with:

```text
1. Save DB
2. Publish RabbitMQ message
```

Suppose:

```text
PostgreSQL -> SUCCESS
RabbitMQ -> FAILURE
```

Now the order exists in the DB but no worker knows about it.

Or:

```text
RabbitMQ -> SUCCESS
PostgreSQL -> FAILURE
```

The worker may process something that wasn't committed.

A common solution is the **Transactional Outbox Pattern**.

Conceptually:

```text
Order Service
     |
     v
Database Transaction
     |
     +--> orders table
     |
     +--> outbox table
```

Both are committed together.

Then a publisher process reads the outbox:

```text
Outbox Table
     |
     v
Publisher
     |
     v
RabbitMQ
```

This gives stronger reliability between DB state and message publishing.

---

# 19. Bulk Processing Architecture

Now consider a huge file:

```text
5,000,000 records
```

Do NOT do:

```text
React
  |
  v
Node.js
  |
  v
Load all 5 million into memory
```

Instead:

```text
React
  |
  v
S3
  |
  v
File Uploaded
  |
  v
Lambda / Event Handler
  |
  v
Create Processing Job
  |
  v
RabbitMQ
  |
  +----------+----------+----------+
  |          |          |          |
  v          v          v          v
Worker 1  Worker 2   Worker 3   Worker 4
  |          |          |          |
  +----------+----------+----------+
             |
             v
      Read / Chunk / Validate
             |
             v
        Transform / Batch
             |
             v
          SAP / DB
```

---

# 20. Why Chunking?

Suppose:

```text
5,000,000 records
```

Break them into chunks:

```text
Chunk 1 -> 10,000
Chunk 2 -> 10,000
Chunk 3 -> 10,000
...
Chunk 500 -> 10,000
```

Workers can process chunks independently.

```text
RabbitMQ
 |
 +--> Chunk 1 -> Worker 1
 +--> Chunk 2 -> Worker 2
 +--> Chunk 3 -> Worker 3
 +--> Chunk 4 -> Worker 4
```

This improves:

- Memory usage
- Throughput
- Fault isolation
- Scalability

---

# 21. Lambda — Where Does It Fit?

Lambda is useful for **short, event-driven tasks**.

A realistic example:

```text
React
  |
  | Upload
  v
S3
  |
  | ObjectCreated event
  v
AWS Lambda
  |
  +--> Validate file metadata
  +--> Generate Job ID
  +--> Create processing-job record
  +--> Publish job to messaging system
  |
  v
RabbitMQ
  |
  v
Node.js Workers
```

Lambda should not necessarily process the entire 5-million-record file.

Instead:

> "Lambda handled lightweight event-driven orchestration, while resource-intensive processing remained in Node.js workers."

---

# 22. Lambda vs Node.js Worker

### Lambda

Good for:

```text
S3 event
Small transformation
Trigger workflow
Validate metadata
Create job
Publish message
```

### Node.js Worker

Good for:

```text
Long-running processing
Large files
Chunk processing
Complex business logic
SAP integration
Controlled concurrency
Retries
```

Mental model:

```text
Lambda = "Something happened; start the workflow."

Worker = "Do the actual heavy work."
```

---

# 23. Lambda vs Step Functions

For a simple event:

```text
S3
 |
 v
Lambda
 |
 v
RabbitMQ
```

Lambda can be enough.

For a complex stateful workflow:

```text
Upload
  |
  v
Validate
  |
  v
Transform
  |
  v
Process
  |
  v
Call SAP
  |
  v
Check result
  |
  +---- Failure -> Retry
  |
  v
Complete
```

AWS Step Functions can be appropriate for orchestration because it provides workflow state, branching, retries and sequencing.

Do not claim you used Step Functions unless you actually did.

---

# 24. Complete Bulk Example

Suppose an operations user uploads:

```text
orders.csv
500,000 records
```

### Flow

```text
1. React
      |
      v
2. S3
      |
      v
3. S3 Event
      |
      v
4. Lambda
      |
      +--> Validate file
      +--> Create Job ID
      +--> DB Job = QUEUED
      |
      v
5. RabbitMQ
      |
      v
6. Workers
      |
      +--> Read chunks
      +--> Validate
      +--> Transform
      +--> Batch
      +--> Send to SAP
      |
      v
7. SAP
      |
      v
8. Update PostgreSQL
      |
      v
9. React displays job status
```

Example final status:

```text
Job: JOB-10001

Total:       500,000
Processed:   500,000
Successful:  497,500
Failed:        2,500

Status: COMPLETED_WITH_ERRORS
```

---

# 25. SAP Integration

SAP is a downstream enterprise system.

Your Node.js service should not expose SAP directly to the React application.

Instead:

```text
React
  |
  v
Node.js
  |
  v
Integration Layer
  |
  v
SAP
```

The integration layer can handle:

- Request mapping
- Authentication
- SAP API calls
- Response mapping
- Timeouts
- Retries
- Error handling
- Correlation IDs
- Idempotency

---

# 26. Synchronous vs Asynchronous SAP Communication

### Synchronous

Use when the user immediately needs the answer.

```text
Node.js
   |
   | Request
   v
SAP
   |
   | Response
   v
Node.js
   |
   v
React
```

Example:

```text
GET inventory availability
```

### Asynchronous

Use for long-running/high-volume operations.

```text
Node.js
   |
   v
RabbitMQ
   |
   v
Worker
   |
   v
SAP
```

Example:

```text
Bulk order processing
Large data migration
Background order synchronization
```

---

# 27. Authentication and Authorization

Typical flow:

```text
User
 |
 v
Identity Provider
 |
 v
OAuth / OIDC
 |
 v
Access Token
 |
 v
API
 |
 v
Token Validation
 |
 v
RBAC
 |
 v
Business API
```

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

Example:

```text
Admin
  -> Create
  -> Update
  -> Delete
  -> Bulk Upload

Operations
  -> Create
  -> Update
  -> View

Viewer
  -> View only
```

---

# 28. Secrets

Never hardcode:

```text
SAP_PASSWORD
DATABASE_PASSWORD
API_KEY
```

inside source code.

Use a secrets/configuration service such as:

```text
AWS Secrets Manager
```

Conceptually:

```text
Node.js
  |
  v
Secrets Manager
  |
  v
SAP credentials
DB credentials
API secrets
```

---

# 29. Observability

Large systems need visibility.

Three important concepts:

### Logs

What happened?

```text
Order 12345 sent to SAP
```

### Metrics

How much/how fast?

```text
API latency = 200 ms
Queue depth = 5,000
Error rate = 2%
```

### Tracing

Where did a particular request travel?

```text
Request ID: ABC123

React
 |
 v
API
 |
 v
Order Service
 |
 v
RabbitMQ
 |
 v
Worker
 |
 v
SAP
```

Use a correlation/request ID across services.

---

# 30. Failure Scenario

Interviewer:

> "SAP is down. What happens?"

Answer:

```text
Node.js
   |
   v
RabbitMQ
   |
   v
Worker
   |
   v
SAP X
```

The worker should not keep hammering SAP endlessly.

Instead:

```text
Retry with backoff
      |
      v
Still failing?
      |
      v
DLQ
      |
      v
Alert / Investigation
```

Meanwhile, the user-facing system can show:

```text
Order 12345
Status: PROCESSING
```

When SAP becomes available, queued/recoverable work can continue depending on the retry/recovery design.

---

# 31. What If RabbitMQ Is Down?

This is another interview question.

Your application should have a strategy.

For stronger reliability, the DB transaction can record an outbox event:

```text
Order Service
     |
     v
DB Transaction
     |
     +--> Order
     |
     +--> Outbox Event
```

When RabbitMQ becomes available:

```text
Outbox
  |
  v
Publisher
  |
  v
RabbitMQ
  |
  v
Worker
```

This prevents losing important work simply because the broker was temporarily unavailable.

---

# 32. What If a Worker Crashes?

Suppose:

```text
Worker
  |
  v
Processing Order
  |
  X CRASH
```

With proper message acknowledgement semantics, the message can become available for another consumer/retry.

But there is a second problem:

> What if the worker already performed the SAP operation before crashing?

This is why **idempotency** matters.

```text
Message
  |
  v
Worker
  |
  v
SAP SUCCESS
  |
  X Worker crashes before ACK
```

RabbitMQ may deliver the message again.

The second processing must not create a duplicate business effect.

---

# 33. AWS Compute / Deployment

The Node.js microservices can be containerized:

```text
Node.js
  |
  v
Docker
  |
  v
Container Registry
  |
  v
ECS / EKS / Kubernetes
```

Example:

```text
              Load Balancer
                   |
        +----------+----------+
        |          |          |
        v          v          v
     Node.js    Node.js    Node.js
     Container  Container  Container
```

Auto-scaling can add more instances when demand increases.

---

# 34. CI/CD

Typical pipeline:

```text
Developer
    |
    v
Git
    |
    v
CI/CD Pipeline
    |
    +--> Unit Tests
    +--> Integration Tests
    +--> Security Scan
    +--> Build
    +--> Docker Image
    |
    v
Container Registry
    |
    v
Deployment
    |
    +--> DEV
    +--> QA
    +--> PROD
```

Infrastructure can be managed using Infrastructure as Code such as Terraform.

---

# 35. Complete End-to-End Architecture

This is the diagram to memorize:

```text
                           INTERNAL USERS
                                |
                                v
                       +----------------+
                       | React Frontend |
                       +-------+--------+
                               |
                            HTTPS
                               |
                               v
                  +--------------------------+
                  | Route53 / WAF / API GW  |
                  | / Load Balancer          |
                  +------------+-------------+
                               |
                               v
       +--------------------------------------------------+
       |             NODE.JS MICROSERVICES                |
       |                                                  |
       |  +----------+  +-----------+  +--------------+ |
       |  | Orders   |  | Inventory |  | Pricing      | |
       |  | Service  |  | Service   |  | Service      | |
       |  +----+-----+  +-----+-----+  +--------------+ |
       |       |              |                         |
       |  +----+-------------+-----------------------+  |
       |  | SAP Integration / Bulk Processing        |  |
       |  +-------------------------------------------+  |
       +------------------+-----------------------------+
                          |
            +-------------+-------------+
            |             |             |
            v             v             v
       PostgreSQL       Redis           S3
       App State       Cache        Bulk Files
            |                           |
            |                           |
            |                           v
            |                     Lambda / Event
            |                           |
            |                           v
            |                      RabbitMQ
            |                           |
            |              +------------+------------+
            |              |            |            |
            |              v            v            v
            |           Worker 1     Worker 2     Worker 3
            |              |            |            |
            |              +------------+------------+
            |                           |
            |                           v
            |                         SAP / ERP
            |                           |
            +<--------------------------+
                 Update status/data


       CROSS-CUTTING
       +--------------------------------------------------+
       | Auth | IAM | Secrets | Logging | Metrics         |
       | Tracing | Monitoring | Alerts | CI/CD | Docker    |
       | ECS/EKS/Kubernetes | Terraform                    |
       +--------------------------------------------------+
```

---

# 36. How To Explain This Architecture in 60 Seconds

Memorize the structure, not every word:

> "The application was an internal ERP-style platform with a React frontend and a Node.js microservices backend. The frontend communicated with secured REST APIs through the AWS edge/load-balancing layer. The backend had domain-oriented services such as order management, inventory, pricing and data processing. Application state was maintained in the database, Redis was used for appropriate caching scenarios, and S3 was used for large bulk files. For long-running or high-volume operations, we used asynchronous messaging with RabbitMQ and Node.js workers. Those workers handled processing, retries and downstream SAP integration. Bulk files were uploaded to S3 and processed asynchronously in chunks so that large datasets didn't have to be loaded into application memory. The platform was secured with authentication/authorization and supported logging, monitoring, tracing and CI/CD."

---

# 37. How To Draw It on a Whiteboard

Don't draw 50 boxes immediately.

Start with:

```text
Users
  |
React
  |
API Gateway / LB
  |
Node.js Microservices
```

Then add:

```text
             Node.js
            /       \
           v         v
      PostgreSQL   Redis
```

Then:

```text
Node.js
   |
RabbitMQ
   |
Workers
   |
SAP
```

Then bulk:

```text
React -> S3 -> Lambda -> RabbitMQ -> Workers -> SAP
```

Finally add:

```text
Security
Monitoring
CI/CD
AWS infrastructure
```

This makes your explanation easy to follow.

---

# 38. Most Likely Interview Questions

### Architecture

1. Explain your project architecture.
2. Why did you choose microservices?
3. Why Node.js?
4. How do your microservices communicate?
5. Which calls are synchronous?
6. Which calls are asynchronous?

### RabbitMQ

7. Why RabbitMQ?
8. What is an exchange?
9. What is a queue?
10. What is an acknowledgement?
11. What happens when a consumer crashes?
12. How do you retry?
13. What is a DLQ?
14. How do you prevent duplicate processing?
15. Kafka vs RabbitMQ?

### Database

16. Why PostgreSQL?
17. How do you optimize slow queries?
18. How do you handle database failure?
19. How do you handle connection exhaustion?
20. Why Redis?

### SAP

21. How does Node.js communicate with SAP?
22. What happens if SAP is down?
23. How do you retry SAP calls?
24. How do you handle SAP timeout?
25. How do you prevent duplicate SAP orders?

### Bulk Processing

26. How would you process 5 million records?
27. Why S3?
28. Why Lambda?
29. Why not process everything inside Node.js?
30. How do you chunk data?
31. How do you control concurrency?
32. What happens when one chunk fails?

### AWS

33. How do you deploy Node.js?
34. How do you scale it?
35. What happens if one instance dies?
36. How do you monitor production?
37. How do you manage secrets?
38. How do you deploy without downtime?

---

# 39. The 8 Words You Should Remember

If you forget everything during an interview, remember:

```text
React
  ↓
Microservices
  ↓
Database
  ↓
Cache
  ↓
Queue
  ↓
Workers
  ↓
SAP
  ↓
Monitoring
```

And for bulk:

```text
S3
 ↓
Lambda
 ↓
Queue
 ↓
Workers
 ↓
SAP / DB
```

That is the bigger picture.

---

# 40. Final Mental Model

Think of the entire system like a company:

```text
React
=
Reception / User Interface

Node.js Microservices
=
Different departments

PostgreSQL
=
Filing cabinet

Redis
=
Desk / frequently used notes

S3
=
Large warehouse for files

RabbitMQ
=
Work queue / waiting line

Workers
=
Employees doing background work

SAP
=
Central enterprise ERP

Lambda
=
Event-triggered coordinator

Monitoring
=
Security cameras + control room

CI/CD
=
Automated delivery system
```

Once this mental model is clear, the detailed AWS, Node.js, RabbitMQ, database and SAP questions become much easier to understand.
