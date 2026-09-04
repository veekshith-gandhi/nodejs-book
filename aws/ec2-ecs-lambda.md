# AWS Compute — EC2, ECS & Lambda
## Interview Guide From Absolute Zero

> **Goal:** Learn AWS Compute from scratch and become capable of answering beginner, intermediate, scenario-based, and tricky backend interview questions.
>
> **Topics:** EC2, AMI, EBS, Security Groups, SSH, Auto Scaling, Load Balancer, ECS, Docker, ECS Cluster, Task Definition, Service, Fargate, ALB, Lambda, API Gateway, S3, SQS, Cold Starts, Concurrency.

---

# PART 1 — The Big Picture

Before learning individual AWS services, understand what **compute** means.

Your backend code needs somewhere to run.

For example:

```text
Node.js application
        ↓
Needs a computer
        ↓
AWS Compute
```

AWS gives you several ways to run your code.

The three important ones here are:

```text
EC2
 ↓
You manage a virtual server

ECS
 ↓
You run containers

Lambda
 ↓
You run functions without managing servers
```

Think:

```text
             AWS COMPUTE
                  |
       +----------+----------+
       |          |          |
      EC2        ECS       Lambda
       |          |          |
    Server     Docker      Function
```

---

# PART 2 — EC2

# 1. What is EC2?

EC2 stands for **Elastic Compute Cloud**.

The easiest way to understand EC2:

> EC2 gives you a virtual server in AWS.

Imagine you buy a computer:

```text
CPU
RAM
Disk
Operating System
Network
```

You install:

```text
Node.js
Your application
Dependencies
```

and run:

```bash
node server.js
```

EC2 is essentially a virtualized server that you rent from AWS.

Conceptually:

```text
AWS
 |
 +---- EC2 Instance
         |
         +---- CPU
         +---- RAM
         +---- Disk
         +---- OS
         +---- Network
         +---- Node.js
         +---- Your Application
```

---

# 2. Why Do We Need EC2?

Suppose you have:

```text
Node.js Backend
```

You need somewhere to run it.

One option:

```text
Your laptop
```

But that isn't appropriate for production.

Instead:

```text
Node.js Application
       ↓
EC2 Instance
       ↓
Internet
       ↓
Users
```

---

# 3. EC2 Instance

An **instance** is the virtual server you launch.

Example:

```text
EC2 Instance
IP: 10.0.1.25
CPU: 2 vCPU
RAM: 4 GB
OS: Ubuntu
```

You can install software and run applications on it.

---

# 4. EC2 Instance Types

This is a common interview topic.

AWS offers different instance types because applications have different resource requirements.

Think:

```text
Different applications
        ↓
Different hardware needs
        ↓
Different instance types
```

Common categories:

```text
General Purpose
Compute Optimized
Memory Optimized
Storage Optimized
Accelerated Computing
```

---

# 5. General Purpose

General-purpose instances provide a balance between:

```text
CPU
Memory
Network
```

Useful for:

```text
Web servers
APIs
Typical backend applications
Development environments
```

Mental model:

```text
Normal application
     ↓
General purpose
```

---

# 6. Compute Optimized

These are designed for workloads needing relatively more CPU.

Examples:

```text
CPU-heavy calculations
High-performance application servers
Some batch processing
```

Mental model:

```text
CPU-heavy
   ↓
Compute optimized
```

---

# 7. Memory Optimized

Designed for workloads that need lots of RAM.

Examples:

```text
Large in-memory workloads
Caching
Some databases
Real-time analytics
```

Mental model:

```text
RAM-heavy
  ↓
Memory optimized
```

---

# 8. Storage Optimized

Designed for workloads with high storage I/O requirements.

Examples:

```text
Large data processing
High local storage I/O
Some analytics workloads
```

---

# 9. Instance Type Interview Question

### Question

> How would you choose an EC2 instance type?

### Short answer

> I'd look at the application's CPU, memory, network, and storage requirements, then choose an instance family that matches the bottleneck and validate the choice using actual workload metrics.

Don't say:

> "I'll always use the largest instance."

The correct answer is:

```text
Measure
 ↓
Identify bottleneck
 ↓
Choose instance
 ↓
Monitor
 ↓
Adjust
```

---

# 10. What is an AMI?

AMI = **Amazon Machine Image**.

This is easier if you think about installing an operating system.

Suppose you want an Ubuntu server.

Instead of manually building:

```text
Operating System
+
Configuration
+
Installed software
```

you can launch an EC2 instance from an image.

That image is an **AMI**.

Think:

```text
AMI
 ↓
Blueprint/template
 ↓
EC2 Instance
```

---

# 11. AMI Example

Imagine you create a server:

```text
Ubuntu
Node.js
Docker
Your configuration
Your application setup
```

You can create an image from that configuration.

Later:

```text
AMI
 |
 +---- EC2 #1
 +---- EC2 #2
 +---- EC2 #3
```

This is especially useful when launching multiple similar servers.

---

# 12. AMI Interview Question

### Question

> What is an AMI?

### Answer

> An AMI is a template used to launch EC2 instances. It contains the information needed to configure the instance's operating system and software environment.

### Trick question

> Is an AMI the EC2 server itself?

No.

```text
AMI = Blueprint

EC2 = Running instance created from that blueprint
```

---

# 13. What is EBS?

EBS = **Elastic Block Store**.

Think of EBS as a disk attached to your EC2 instance.

```text
EC2
 |
 +---- CPU
 +---- RAM
 |
 +---- EBS
        |
        +---- Files
        +---- Application data
        +---- OS/data depending on setup
```

It is block storage.

---

# 14. Why EBS?

Suppose your Node.js application needs:

```text
Files
Database data
Application artifacts
Logs
```

You need storage.

EBS provides persistent block storage volumes for EC2.

---

# 15. EBS vs Instance RAM

Very important.

RAM:

```text
Fast
Temporary
```

EBS:

```text
Persistent storage
```

Simple mental model:

```text
RAM
 ↓
Temporary working memory

EBS
 ↓
Disk/storage
```

---

# 16. EBS Interview Question

> What happens to application data if an EC2 instance stops?

It depends on where the data is stored and the volume's configuration.

The important distinction is:

```text
Instance memory → lost when instance stops

EBS volume → generally persists independently of instance lifecycle,
             subject to its deletion configuration
```

Do not say:

> "Everything disappears when EC2 stops."

That's incorrect.

---

# 17. Security Groups

A Security Group is a virtual firewall associated with resources such as EC2.

It controls network traffic using rules.

Example:

```text
Internet
   ↓
Security Group
   ↓
EC2
```

Suppose your Node.js server listens on:

```text
Port 3000
```

You need the appropriate inbound network rule if clients are supposed to reach it directly.

---

# 18. Inbound vs Outbound

### Inbound

Traffic coming **into** the instance.

Example:

```text
Internet
   ↓
EC2
```

### Outbound

Traffic going **out** of the instance.

Example:

```text
EC2
 ↓
Database / API
```

---

# 19. Security Group Example

Suppose:

```text
SSH = port 22
HTTP = port 80
HTTPS = port 443
```

You might configure:

```text
Inbound
22   → restricted administration source
80   → allowed web traffic
443  → allowed HTTPS traffic
```

Don't blindly open everything.

Avoid:

```text
0.0.0.0/0
```

for sensitive administrative ports unless there is a strong reason and appropriate controls.

---

# 20. Security Group Interview Question

> Why is a security group needed?

### Answer

> It acts as a virtual firewall that controls allowed network traffic to and from resources such as EC2 instances.

---

# 21. SSH

SSH = **Secure Shell**.

It allows you to remotely connect to a server securely.

Example:

```bash
ssh user@server-ip
```

Conceptually:

```text
Your Laptop
     |
     | SSH
     ↓
EC2 Instance
```

Once connected:

```bash
cd /app
npm start
```

You can administer the server.

---

# 22. How Does SSH Work With EC2?

Typical flow:

```text
Laptop
  ↓
Internet
  ↓
Security Group
  ↓
Port 22
  ↓
EC2
```

You also need appropriate authentication, commonly involving an SSH key pair depending on the OS and setup.

---

# 23. SSH Interview Scenario

### Question

> You launched an EC2 instance but cannot SSH into it. What would you check?

Think systematically:

```text
1. Is the instance running?
2. Is the IP/address correct?
3. Is port 22 allowed?
4. Is the security-group source correct?
5. Is the subnet/network path configured correctly?
6. Is the instance reachable from the internet if required?
7. Is the SSH service running?
8. Is the correct username being used?
9. Is the correct private key being used?
10. Are network ACLs/routing/security controls blocking traffic?
```

This is much better than saying:

> "I'll restart the server."

---

# 24. Auto Scaling

Suppose you have one EC2:

```text
Users
  ↓
EC2
```

Traffic increases:

```text
100 users
 ↓
10,000 users
 ↓
EC2 overloaded
```

Instead of manually launching servers, you can use **Auto Scaling** to adjust capacity according to configured policies.

Conceptually:

```text
Normal traffic
    ↓
2 EC2

Traffic increases
    ↓
4 EC2

Traffic decreases
    ↓
2 EC2
```

---

# 25. Auto Scaling Group

An **Auto Scaling Group (ASG)** manages a group of EC2 instances.

Conceptually:

```text
              Auto Scaling Group
                      |
             +--------+--------+
             |        |        |
            EC2      EC2      EC2
```

It can maintain desired capacity and replace unhealthy instances.

---

# 26. Scaling Out vs Scaling Up

### Scaling out

Add more servers.

```text
2 EC2
 ↓
5 EC2
```

### Scaling up

Use a larger server.

```text
2 CPU / 4 GB
      ↓
4 CPU / 8 GB
```

Remember:

```text
Scale OUT = more machines

Scale UP = bigger machine
```

For highly available web applications, scaling out is often important.

---

# 27. Auto Scaling Interview Question

> CPU is consistently 85%. What would you do?

Don't automatically say:

> Increase EC2 size.

First ask:

```text
Is the workload CPU-bound?
Can we scale horizontally?
Is traffic increasing?
Is the application inefficient?
```

Possible solutions:

```text
Optimize application
OR
Scale out
OR
Scale up
```

---

# 28. Load Balancer

Suppose you now have:

```text
EC2 #1
EC2 #2
EC2 #3
```

How does traffic know where to go?

A **Load Balancer** distributes incoming traffic across healthy targets.

```text
             Users
                |
                v
        +----------------+
        | Load Balancer  |
        +----------------+
          /      |      \
         v       v       v
       EC2-1   EC2-2   EC2-3
```

---

# 29. Why Use a Load Balancer?

Without a load balancer:

```text
Users
  ↓
One EC2
```

That server can become a bottleneck.

With a load balancer:

```text
Users
  ↓
Load Balancer
  ↓
Multiple EC2
```

Benefits include:

```text
Traffic distribution
High availability
Health checking
Integration with scaling
```

---

# 30. Health Checks

A load balancer can check whether targets are healthy.

For example:

```text
GET /health
```

Suppose:

```text
EC2-1 → healthy
EC2-2 → unhealthy
EC2-3 → healthy
```

The load balancer can stop sending new traffic to the unhealthy target, depending on configuration.

---

# 31. EC2 Architecture

A common production architecture:

```text
                 Internet
                    |
                    v
             Load Balancer
                    |
          +---------+---------+
          |         |         |
          v         v         v
        EC2       EC2       EC2
          \         |         /
           \        |        /
              Auto Scaling
                    |
                    v
                 Backend
```

---

# PART 3 — EC2 INTERVIEW SCENARIOS

# Scenario 1 — API Server Is Down

### Question

> Your EC2-hosted API is down. How do you investigate?

### Answer

```text
1. Check EC2 instance state.
2. Check load balancer health.
3. Check security groups/networking.
4. Check application process.
5. Check CloudWatch CPU/memory/disk metrics.
6. Check application logs.
7. Check dependencies such as DB/Redis.
```

Don't jump directly to restarting.

---

# Scenario 2 — EC2 CPU = 100%

### Question

> EC2 CPU suddenly reaches 100%. What do you do?

```text
CPU = 100%
   ↓
When did it start?
   ↓
Traffic increased?
   ↓
Recent deployment?
   ↓
CPU-heavy application process?
   ↓
Background job?
   ↓
Optimize / scale / mitigate
```

---

# Scenario 3 — One EC2 Is Unhealthy

```text
Load Balancer
     |
 +---+---+
 |   |   |
 A   B   C
     |
    BAD
```

Check:

```text
Health check
Application process
CPU/memory
Logs
Networking
Recent deployment
```

If the ASG is configured correctly, an unhealthy instance may be replaced.

---

# Scenario 4 — Traffic Suddenly Doubles

Check:

```text
Request volume
CPU
Memory
Latency
Error rate
```

Then:

```text
Expected traffic?
     |
     +-- Yes → scale capacity
     |
     +-- No → investigate source
```

---

# PART 4 — ECS

# 32. What is ECS?

ECS = **Amazon Elastic Container Service**.

ECS is used to run and manage **Docker containers** on AWS.

If EC2 means:

> Give me a server.

ECS means:

> Help me run/manage my containers.

---

# 33. Why Containers?

Suppose your application requires:

```text
Node.js 22
npm dependencies
Environment configuration
Application code
```

You package them into a Docker image.

```text
Docker Image
     |
     +-- Node.js
     +-- Dependencies
     +-- Application
```

Then run the image as a container.

---

# 34. Docker → ECS

Typical flow:

```text
Your Code
   ↓
Dockerfile
   ↓
Docker Image
   ↓
Container Registry
   ↓
ECS
   ↓
Running Container
```

A common AWS registry is **Amazon ECR**.

So:

```text
Code
 ↓
docker build
 ↓
Docker image
 ↓
ECR
 ↓
ECS
```

---

# 35. ECS Cluster

An ECS **cluster** is a logical grouping of ECS resources/services/tasks.

Think:

```text
ECS Cluster
     |
 +---+---+
 |       |
Service Service
 |       |
Tasks   Tasks
```

Don't think of a cluster as "one server."

The cluster is an organizational/runtime boundary for ECS workloads.

---

# 36. ECS Task

A **task** is a running instantiation of a task definition.

Simple:

```text
Task Definition
      ↓
Instructions
      ↓
Task
      ↓
Running container(s)
```

---

# 37. Task Definition

This is one of the most important ECS concepts.

A task definition is essentially the configuration/blueprint that tells ECS how to run your container workload.

It can specify things such as:

```text
Container image
CPU
Memory
Ports
Environment variables
Logging
IAM task role
Networking configuration
```

Think:

```text
Task Definition
      ↓
"How should this workload run?"
```

---

# 38. Task Definition Example

Conceptually:

```text
Task Definition
|
├── Image: payment-service:v10
├── CPU: ...
├── Memory: ...
├── Container Port: 3000
├── Environment
├── Logs
└── IAM permissions
```

Then ECS launches a task using that definition.

---

# 39. ECS Service

This is another critical concept.

An ECS **Service** helps keep a desired number of tasks running and manages the deployment of those tasks.

Suppose:

```text
Desired count = 3
```

The service tries to maintain:

```text
Task 1
Task 2
Task 3
```

If one stops unexpectedly:

```text
Task 1 → stopped
```

the service can launch another task to restore desired capacity, subject to the configuration and available resources.

---

# 40. Task Definition vs Service

Very common interview question.

```text
Task Definition
    ↓
How to run the workload

Service
    ↓
How many should run and how they should be maintained/deployed
```

Example:

```text
Task Definition
Image = payment:v5
CPU = X
Memory = Y

Service
Desired tasks = 3
```

---

# 41. Fargate

Now an important question:

> Where do the ECS containers actually run?

Two broad ECS capacity approaches are:

```text
ECS on EC2
ECS on Fargate
```

### ECS on EC2

You manage the EC2 instances that provide the compute capacity.

```text
ECS
 ↓
EC2 instances
 ↓
Containers
```

### ECS Fargate

AWS manages the underlying server infrastructure for the container compute.

You focus more on:

```text
Container
Task definition
Service
Networking
IAM
Scaling
```

Mental model:

```text
ECS + EC2
→ You manage servers

ECS + Fargate
→ AWS manages underlying servers
```

---

# 42. Fargate Interview Question

> Why would you use Fargate instead of ECS on EC2?

### Answer

> Fargate removes the need to manage the underlying EC2 instances, so the team can focus on containers, task configuration, networking, scaling, and application operations.

---

# 43. ECS + ALB

A very common architecture:

```text
                 Internet
                    |
                    v
                   ALB
                    |
          +---------+---------+
          |         |         |
          v         v         v
       ECS Task ECS Task ECS Task
          |         |         |
          +---------+---------+
                    |
                   DB
```

ALB distributes traffic across healthy ECS tasks.

---

# 44. ECS Deployment Flow

Suppose you release version 2.

Current:

```text
v1
v1
v1
```

You build:

```text
payment:v2
```

Push it to ECR.

Update the ECS task definition:

```text
v1 → v2
```

The ECS service deploys the new tasks according to its deployment configuration.

Conceptually:

```text
Code
 ↓
Docker Build
 ↓
Image v2
 ↓
ECR
 ↓
Task Definition v2
 ↓
ECS Service
 ↓
New Tasks
 ↓
ALB
 ↓
Users
```

---

# PART 5 — ECS INTERVIEW SCENARIOS

# Scenario 5 — ECS Task Keeps Stopping

### Question

> An ECS task starts and immediately stops. How do you debug it?

Think:

```text
Task stopped
   ↓
Why?
```

Check:

```text
Task stopped reason
Container exit code
Container logs
CPU/memory limits
Environment variables
Secrets/configuration
IAM permissions
Network connectivity
Application startup
```

Common application reason:

```text
Node.js application crashes
      ↓
Container exits
      ↓
ECS task stops
```

---

# Scenario 6 — ECS Service Has 3 Tasks but Only 2 Are Healthy

Check:

```text
ALB target health
ECS task status
Container logs
Health-check path
Port mapping
Security groups
Application startup
```

A classic issue:

```text
ALB health check
      ↓
GET /health
      ↓
Application doesn't expose /health
      ↓
Target unhealthy
```

---

# Scenario 7 — ECS Task Has High Memory

Check:

```text
Memory utilization
Traffic
Application behavior
Recent deployment
Large payloads
Caching
Memory leak
```

If tasks repeatedly hit memory limits:

```text
Task killed / unstable
      ↓
Increase task memory if appropriate
OR
Fix application memory usage
```

Do not blindly increase memory without understanding the cause.

---

# Scenario 8 — ECS Deployment Causes Errors

Timeline:

```text
12:00 → v1 healthy
12:10 → deploy v2
12:12 → errors increase
```

Check:

```text
New task logs
Task health
ALB target health
Environment variables
Secrets
IAM
Database compatibility
Application startup
```

Potential response:

```text
Mitigate
 ↓
Rollback to v1 if appropriate
 ↓
Investigate v2
```

---

# Scenario 9 — ECS Task Cannot Reach Database

Architecture:

```text
ECS Task
   ↓
Database
```

Check:

```text
Security groups
Subnets
Routes
Network ACLs
Database endpoint
Port
Credentials
DNS
Application logs
```

Important interview principle:

> Security groups need to allow the correct source-to-destination traffic.

---

# Scenario 10 — ECS Service Needs More Capacity

If:

```text
Traffic ↑
   ↓
Task CPU ↑
   ↓
Latency ↑
```

you can consider ECS service auto scaling.

Conceptually:

```text
2 tasks
 ↓
4 tasks
 ↓
8 tasks
```

Again:

```text
Measure
 ↓
Identify bottleneck
 ↓
Scale
```

---

# PART 6 — LAMBDA

# 45. What is Lambda?

AWS Lambda lets you run code without managing the underlying servers.

Instead of:

```text
Launch server
Install OS
Install Node.js
Deploy application
Manage server
```

you provide a function.

```text
Event
 ↓
Lambda Function
 ↓
Code executes
 ↓
Result
```

---

# 46. Why Is Lambda Called Event-Driven?

Lambda usually runs because something happens.

Examples:

```text
HTTP request
     ↓
API Gateway
     ↓
Lambda
```

or:

```text
File uploaded to S3
     ↓
Lambda
```

or:

```text
Message in SQS
     ↓
Lambda
```

So:

```text
EVENT
 ↓
FUNCTION
 ↓
EXECUTION
```

---

# 47. API Gateway → Lambda

A common serverless API:

```text
Client
  ↓
API Gateway
  ↓
Lambda
  ↓
Database
```

User sends:

```http
POST /users
```

API Gateway receives it and invokes Lambda.

Lambda executes:

```javascript
exports.handler = async (event) => {
    // business logic
};
```

Then returns a response.

---

# 48. Why API Gateway?

API Gateway provides the API-facing layer.

It can handle things such as:

```text
Routing
HTTP APIs
Authentication/authorization integrations
Throttling
Request handling
Integration with Lambda
```

Mental model:

```text
API Gateway
     ↓
"How does the outside world call my backend?"

Lambda
     ↓
"What code runs when called?"
```

---

# 49. S3 → Lambda

Suppose a user uploads:

```text
profile.jpg
```

to S3.

You can configure an event so that an upload triggers Lambda.

```text
User
 ↓
S3
 ↓
Object Created Event
 ↓
Lambda
 ↓
Process image
```

For example, Lambda could:

```text
Resize image
Generate thumbnail
Extract metadata
Validate file
```

---

# 50. SQS → Lambda

Suppose you have:

```text
Producer
   ↓
SQS
   ↓
Lambda
```

Messages arrive in the queue.

Lambda can poll the SQS queue and invoke your function with batches of messages.

Conceptually:

```text
SQS
 ↓
Messages
 ↓
Lambda polls
 ↓
Batch
 ↓
Function executes
```

This is useful for asynchronous processing.

---

# 51. Why SQS → Lambda?

Suppose an API receives an order.

Instead of doing everything synchronously:

```text
API
 ↓
Create order
 ↓
Send email
 ↓
Generate report
 ↓
Process notification
 ↓
Response
```

You can make some work asynchronous:

```text
API
 ↓
SQS
 ↓
Lambda
 ↓
Background processing
```

The API can respond without waiting for all background work.

---

# 52. Lambda Cold Start

This is a very common interview question.

A **cold start** happens when Lambda needs to initialize a new execution environment before running your function.

Conceptually:

```text
Request
 ↓
No warm execution environment
 ↓
Create/init environment
 ↓
Load runtime
 ↓
Load application
 ↓
Run handler
```

That initialization adds latency.

---

# 53. Warm vs Cold Lambda

### Cold

```text
Request
 ↓
Create/init environment
 ↓
Run function
```

Higher startup latency can occur.

### Warm

```text
Request
 ↓
Existing environment
 ↓
Run function
```

Usually lower startup overhead.

---

# 54. What Causes Cold Starts?

Potential contributors include:

```text
Runtime initialization
Large deployment package
Large dependencies
Initialization code
Network-related setup
```

For example:

```javascript
// Runs during initialization
const hugeLibrary = require("huge-library");
const client = initializeExpensiveClient();
```

Heavy initialization can increase startup latency.

---

# 55. How Can You Reduce Cold Start Impact?

Possible approaches:

```text
Keep deployment package/dependencies reasonable
Keep initialization efficient
Avoid unnecessary work during startup
Use appropriate runtime configuration
Use provisioned concurrency when predictable low startup latency is required
```

Don't say:

> "Cold starts can always be completely eliminated."

The correct answer is about **reducing or managing** their impact.

---

# 56. Lambda Concurrency

Concurrency means:

> How many Lambda executions are running at the same time.

Example:

```text
10 requests
 ↓
10 concurrent Lambda executions
```

If:

```text
100 requests arrive
```

Lambda may run many executions concurrently, subject to account/function limits and configuration.

---

# 57. Why Is Concurrency Important?

Suppose Lambda calls your database.

```text
100 Lambda executions
       ↓
100 DB connections
```

That could overwhelm the database.

So Lambda concurrency isn't only a Lambda problem.

It affects downstream systems.

```text
Lambda concurrency
      ↓
Database connections
      ↓
Database load
```

This is a **very important backend interview concept**.

---

# 58. Reserved Concurrency

Reserved concurrency can be used to reserve and cap concurrency for a Lambda function.

Simple mental model:

```text
Lambda
 ↓
Reserved concurrency = 20
 ↓
Function cannot exceed that reserved concurrency allocation
```

The exact behavior and interaction with account limits should be understood when designing production systems.

Why use it?

One reason is to protect a downstream dependency.

Example:

```text
Lambda
  ↓
Database
```

If the DB can safely handle only a limited amount of concurrent work, you may constrain Lambda concurrency.

---

# 59. Provisioned Concurrency

Provisioned concurrency keeps a configured number of execution environments initialized and ready to respond.

Mental model:

```text
Without provisioned concurrency:
Request → initialize environment → run

With provisioned concurrency:
Ready environment → run
```

It is useful when you need predictable low startup latency.

---

# PART 7 — LAMBDA INTERVIEW SCENARIOS

# Scenario 11 — Lambda Is Slow

### Question

> Lambda normally takes 100ms but sometimes takes 2 seconds. What would you check?

Think:

```text
Duration
 ↓
Cold start?
 ↓
Dependency latency?
 ↓
Database?
 ↓
External API?
 ↓
Large payload?
 ↓
Application code?
```

Also check whether the slow invocations correlate with cold starts or particular downstream operations.

---

# Scenario 12 — Lambda Has High Concurrency

### Question

> Lambda concurrency suddenly increases and the database starts failing. What happened?

Likely chain:

```text
Traffic ↑
   ↓
Lambda invocations ↑
   ↓
Concurrency ↑
   ↓
Many DB operations/connections
   ↓
Database overloaded
   ↓
Errors/timeouts
```

Possible mitigation:

```text
Control Lambda concurrency
+
Optimize DB usage
+
Use connection-management patterns appropriate for Lambda
+
Reduce unnecessary invocations
```

---

# Scenario 13 — SQS + Lambda Is Falling Behind

### Question

> Your SQS queue keeps growing even though Lambda is connected. Why?

Possible causes:

```text
Lambda processing is slow
Lambda errors
Concurrency too low
Downstream dependency is slow
Batch configuration
Throttling
Poison messages
```

Think:

```text
Messages arriving
       ↓
Messages processed
       ↓
If arrival > processing
       ↓
Queue grows
```

---

# Scenario 14 — Lambda Fails for Only Some SQS Messages

### Question

> Some messages succeed, some fail. What would you investigate?

Check:

```text
Lambda logs
Message contents
Error type
Batch behavior
Visibility timeout
Retry behavior
Dead-letter handling
Idempotency
```

Important:

> SQS-based processing should be designed with retries and duplicate delivery in mind.

---

# Scenario 15 — S3 Upload Does Not Trigger Lambda

Check:

```text
S3 event configuration
Lambda permissions
Correct bucket
Correct event type
Object key filters
Lambda logs
```

For example, your configuration might trigger only:

```text
ObjectCreated
```

but you're testing a different event/operation.

---

# Scenario 16 — API Gateway → Lambda Returns 500

Architecture:

```text
Client
 ↓
API Gateway
 ↓
Lambda
```

Check:

```text
API Gateway logs/metrics
Lambda invocation/errors
Lambda logs
Permissions
Input event
Application exception
Timeout
Downstream dependency
```

Determine whether:

```text
API Gateway problem
OR
Lambda problem
OR
Dependency problem
```

---

# PART 8 — ADVANCED TRICK QUESTIONS

# Trick 1

### Interviewer:

> EC2 and Lambda both run code. Why not always use Lambda?

### Answer:

> Lambda is excellent for event-driven and short-lived workloads, but it has execution, concurrency, runtime, networking, and operational characteristics that may not fit every workload. EC2 gives much more control over the server and is suitable for long-running or specialized workloads.

---

# Trick 2

### Interviewer:

> If Fargate is serverless, does Fargate mean there are no servers?

### Answer:

> No. Servers still exist underneath. The difference is that AWS manages the underlying compute infrastructure for you.

This is an important distinction.

```text
Serverless
≠
No physical servers
```

It means:

> You don't manage the underlying servers directly.

---

# Trick 3

### Interviewer:

> ECS and Docker are the same thing?

No.

```text
Docker
 ↓
Container technology/tooling

ECS
 ↓
AWS container orchestration service
```

Docker packages/runs containers.

ECS manages container workloads on AWS.

---

# Trick 4

### Interviewer:

> Is an ECS task the same as a Docker image?

No.

```text
Docker Image
 ↓
Package/template

ECS Task
 ↓
Running workload created from a task definition
```

---

# Trick 5

### Interviewer:

> Is a task definition a running container?

No.

```text
Task Definition
 ↓
Instructions/configuration

Task
 ↓
Running instance of that configuration
```

---

# Trick 6

### Interviewer:

> ECS Service and ECS Cluster are the same?

No.

```text
Cluster
 ↓
Logical environment/grouping

Service
 ↓
Manages a desired set of tasks
```

Example:

```text
Cluster
 |
 +-- User Service
 |     +-- Task
 |     +-- Task
 |
 +-- Payment Service
       +-- Task
       +-- Task
```

---

# Trick 7

### Interviewer:

> If EC2 CPU is low, can the application still be slow?

Absolutely.

CPU isn't the only bottleneck.

Possible causes:

```text
Database latency
Redis latency
External API latency
Network issues
Disk I/O
Connection pool exhaustion
Application locks/contention
Event-loop blocking
```

This is a very important backend mindset.

---

# Trick 8

### Interviewer:

> If Lambda scales automatically, why do we care about concurrency?

Because downstream systems may not scale as quickly.

Example:

```text
1000 Lambda executions
        ↓
1000 DB operations
        ↓
Database overloaded
```

So:

> Serverless scaling can move the bottleneck downstream.

---

# Trick 9

### Interviewer:

> Does Lambda execute forever?

No.

Lambda is designed for function executions with service limits, rather than arbitrary long-running server processes.

If you need a continuously running workload, consider services such as ECS/Fargate or EC2 depending on requirements.

---

# Trick 10

### Interviewer:

> If an EC2 instance dies, does the application automatically recover?

Not necessarily.

This depends on your architecture.

With an Auto Scaling Group:

```text
EC2 dies
 ↓
ASG detects unhealthy/missing capacity
 ↓
Replacement instance can be launched
```

But if you have only one manually managed EC2 instance, there may be no automatic replacement.

---

# Trick 11

### Interviewer:

> Why use both ALB and Auto Scaling?

They solve different problems.

```text
ALB
 ↓
Distributes traffic

Auto Scaling
 ↓
Changes number of instances/tasks
```

Together:

```text
Users
 ↓
ALB
 ↓
EC2/Tasks
 ↑
Auto Scaling
```

---

# Trick 12

### Interviewer:

> Can a load balancer send traffic to an unhealthy EC2?

With proper health checks, the load balancer should stop routing new traffic to targets that fail its health checks, subject to the load balancer configuration and behavior.

So you need:

```text
Correct health check
+
Correct target configuration
```

---

# Trick 13

### Interviewer:

> Why would an ECS task be running but still not receive traffic?

Possible reasons:

```text
ALB target unhealthy
Wrong port
Security group issue
Incorrect target group
Health check failure
Networking issue
Listener/routing rule issue
```

"Task is running" does not automatically mean:

> "Users can reach it."

---

# Trick 14

### Interviewer:

> Lambda is connected to a database. Why might the database still become overloaded?

Because Lambda can scale concurrency quickly.

Example:

```text
10 requests
 ↓
10 DB operations

10,000 requests
 ↓
Potentially many concurrent DB operations
```

The database may become the bottleneck.

---

# Trick 15

### Interviewer:

> Would you put a database password directly inside a Docker image?

No.

Avoid baking secrets into images.

Use an appropriate secret/configuration mechanism, such as AWS Secrets Manager or another secure secret-management solution.

Conceptually:

```text
ECS Task
   ↓
Secret reference
   ↓
Secrets Manager
   ↓
Credential
```

---

# Trick 16

### Interviewer:

> What happens if an ECS container crashes?

The container stops.

Then what happens depends on how it is run.

For an ECS Service:

```text
Task crashes
   ↓
Service detects task is no longer running
   ↓
Attempts to maintain desired count
   ↓
Replacement task
```

Assuming the service has sufficient capacity and is configured appropriately.

---

# Trick 17

### Interviewer:

> What's the difference between EC2 Auto Scaling and ECS Service Auto Scaling?

Conceptually:

```text
EC2 Auto Scaling
 ↓
Changes number of EC2 instances

ECS Service Auto Scaling
 ↓
Changes number of ECS tasks
```

With ECS on Fargate:

```text
ECS Service Auto Scaling
 ↓
More/fewer tasks
```

You don't manage the underlying EC2 fleet.

---

# Trick 18

### Interviewer:

> Can ECS run without Docker?

ECS is designed around container workloads. Historically Docker terminology is common, but ECS supports container images and runtimes without requiring you to think of ECS itself as "Docker."

For interview purposes:

```text
Docker → build/package container image

ECS → deploy/manage container workloads
```

---

# PART 9 — END-TO-END PRODUCTION ARCHITECTURES

# Architecture 1 — EC2 Backend

```text
                     Internet
                         |
                         v
                  Load Balancer
                         |
             +-----------+-----------+
             |           |           |
             v           v           v
           EC2         EC2         EC2
             |           |           |
             +-----------+-----------+
                         |
                       Redis
                         |
                      Database

              Auto Scaling Group
                     ↑
              manages EC2 capacity
```

Use this mental model:

```text
ALB = traffic distribution

EC2 = compute

ASG = capacity management

Security Group = network access control

EBS = storage

AMI = server blueprint
```

---

# Architecture 2 — ECS Fargate Backend

```text
                    Internet
                        |
                        v
                       ALB
                        |
             +----------+----------+
             |          |          |
             v          v          v
          ECS Task   ECS Task   ECS Task
             |          |          |
             +----------+----------+
                        |
                      Redis
                        |
                     Database
```

Deployment:

```text
Developer
   ↓
Git
   ↓
Docker Build
   ↓
Docker Image
   ↓
ECR
   ↓
Task Definition
   ↓
ECS Service
   ↓
Fargate Tasks
   ↓
ALB
```

---

# Architecture 3 — Serverless API

```text
User
 ↓
API Gateway
 ↓
Lambda
 ↓
Database
```

No application server is directly managed by you.

---

# Architecture 4 — Async Processing

```text
Client
  ↓
API
  ↓
SQS
  ↓
Lambda
  ↓
Database / External Service
```

Benefits:

```text
Decoupling
Asynchronous processing
Buffering
Independent scaling
Retry capability
```

---

# Architecture 5 — File Processing

```text
User
 ↓
S3
 ↓
Object Created Event
 ↓
Lambda
 ↓
Image processing
 ↓
S3
```

---

# PART 10 — END-TO-END DEBUGGING QUESTIONS

# Scenario 17 — Entire API Is Slow

### Interviewer

> Your production API became slow. Walk me through your debugging process.

### Strong short answer

> I'd first check latency, request volume, error rate, CPU, and memory. Then I'd establish when the problem started and correlate it with traffic spikes, deployments, or infrastructure changes. Next I'd inspect application logs and dependency health for database, Redis, queues, or external API issues. Finally I'd identify the bottleneck, mitigate it, and verify recovery.

Detailed thought process:

```text
API slow
  ↓
Metrics
  ↓
Latency ↑?
  ↓
Traffic ↑?
  ↓
CPU ↑?
  ↓
Memory ↑?
  ↓
Error rate ↑?
  ↓
Logs
  ↓
Dependency?
  ↓
DB / Redis / External API
  ↓
Root cause
```

---

# Scenario 18 — CPU Spike

```text
CPU ↑
 ↓
Traffic ↑?
 ↓
Recent deployment?
 ↓
CPU-heavy code?
 ↓
Background job?
 ↓
Scale or optimize
```

---

# Scenario 19 — Memory Spike

```text
Memory ↑
 ↓
Traffic ↑?
 ↓
Large payload?
 ↓
Cache growth?
 ↓
Memory leak?
 ↓
Recent deployment?
 ↓
Optimize / scale
```

---

# Scenario 20 — API Error Rate Increased

```text
5xx ↑
 ↓
Which endpoint?
 ↓
When?
 ↓
Logs
 ↓
Exception?
 ↓
Dependency?
 ↓
DB / Redis / API
 ↓
Root cause
```

---

# Scenario 21 — ECS Task Keeps Restarting

```text
Task restarts
 ↓
Why did container exit?
 ↓
Exit code
 ↓
Logs
 ↓
Memory?
 ↓
Application crash?
 ↓
Configuration?
 ↓
Dependency?
```

---

# Scenario 22 — Lambda Is Timing Out

```text
Lambda timeout
 ↓
Check duration
 ↓
Logs
 ↓
What is it waiting for?
 ↓
DB?
 ↓
External API?
 ↓
Network?
 ↓
Application code?
```

---

# Scenario 23 — SQS Queue Is Growing

```text
Queue depth ↑
 ↓
Messages arriving faster than processed?
 ↓
Lambda processing slow?
 ↓
Lambda errors?
 ↓
Concurrency too low?
 ↓
Downstream dependency slow?
 ↓
Fix bottleneck / increase processing capacity carefully
```

---

# Scenario 24 — Database Overloaded After Lambda Deployment

```text
New Lambda deployment
       ↓
Traffic
       ↓
Lambda concurrency ↑
       ↓
Many DB operations
       ↓
DB overloaded
```

Possible solutions:

```text
Limit/control concurrency
Optimize database access
Reduce unnecessary invocations
Batch work where appropriate
Use appropriate caching/architecture
```

---

# PART 11 — RAPID-FIRE INTERVIEW QUESTIONS

## EC2

### Q1. What is EC2?

> A virtual server/service for running workloads in AWS.

### Q2. What is an AMI?

> A template used to launch EC2 instances.

### Q3. What is EBS?

> Persistent block storage that can be attached to EC2.

### Q4. What is a Security Group?

> A virtual firewall controlling allowed network traffic.

### Q5. What is SSH?

> A secure protocol for remotely administering a server.

### Q6. What is Auto Scaling?

> Automatically adjusting compute capacity based on configured policies and desired capacity.

### Q7. What is a Load Balancer?

> Distributes incoming traffic across healthy targets.

---

# ECS

### Q8. What is ECS?

> AWS service for running and managing containerized workloads.

### Q9. What is an ECS Cluster?

> A logical grouping/environment for ECS workloads.

### Q10. What is a Task Definition?

> Configuration/blueprint describing how an ECS task should run.

### Q11. What is a Task?

> A running instantiation of a task definition.

### Q12. What is an ECS Service?

> Maintains a desired number of tasks and manages their deployment/lifecycle.

### Q13. What is Fargate?

> A serverless compute option for ECS where AWS manages the underlying compute infrastructure.

### Q14. What is ECR?

> AWS container image registry used to store container images.

---

# Lambda

### Q15. What is Lambda?

> Event-driven serverless compute that runs functions without you managing servers.

### Q16. What is a cold start?

> Initialization delay when Lambda needs a new execution environment.

### Q17. What is concurrency?

> Number of Lambda function executions running at the same time.

### Q18. What is reserved concurrency?

> A concurrency configuration that can reserve and cap concurrency for a function.

### Q19. What is provisioned concurrency?

> Pre-initialized Lambda execution environments kept ready to reduce startup latency.

### Q20. Why can high Lambda concurrency be dangerous?

> Because downstream systems such as databases can be overwhelmed by the resulting concurrent workload.

---

# PART 12 — ADVANCED INTERVIEW: "DESIGN THIS"

# Question 1

> Design a highly available Node.js API on AWS.

### Good architecture

```text
                    Internet
                        |
                        v
                       ALB
                        |
              +---------+---------+
              |         |         |
              v         v         v
             EC2       EC2       EC2
              |         |         |
              +---------+---------+
                        |
                      Redis
                        |
                     Database

                Auto Scaling Group
```

Mention:

```text
Multiple instances
Load balancing
Health checks
Auto scaling
Security groups
Monitoring
Centralized logs
```

---

# Question 2

> Design the same backend using containers.

```text
                    Internet
                        |
                        v
                       ALB
                        |
              +---------+---------+
              |         |         |
              v         v         v
            ECS       ECS       ECS
            Task      Task      Task
              \         |         /
               +--------+--------+
                        |
                    Fargate
```

Deployment:

```text
Code
 ↓
Docker
 ↓
ECR
 ↓
ECS Task Definition
 ↓
ECS Service
 ↓
Fargate
 ↓
ALB
```

---

# Question 3

> Design an asynchronous image-processing system.

```text
User
 ↓
S3
 ↓
Event
 ↓
Lambda
 ↓
Process image
 ↓
S3
```

Mention:

```text
Retries
Error handling
Idempotency
Logging
Monitoring
```

---

# Question 4

> Design an order-processing backend.

```text
Client
 ↓
API Gateway / ALB
 ↓
Node.js API
 ↓
Database
 ↓
SQS
 ↓
Lambda / ECS Worker
 ↓
External services
```

Why SQS?

```text
API doesn't need to wait
        ↓
Decoupling
        ↓
Retries
        ↓
Buffering
```

---

# PART 13 — THE MOST IMPORTANT COMPARISON

| Feature | EC2 | ECS + Fargate | Lambda |
|---|---|---|---|
| Basic idea | Virtual server | Managed container workload | Function execution |
| Server management | You manage it | AWS manages underlying compute | AWS manages infrastructure |
| Packaging | Application/server | Container | Function/package |
| Long-running workloads | Excellent | Excellent | Not designed for arbitrary long-running processes |
| Scaling | ASG | ECS service scaling | Automatic concurrency scaling subject to limits |
| Control | High | Medium/high | Lower |
| Operational overhead | Higher | Lower | Lowest for server management |
| Cold start concept | No Lambda-style cold start | Container startup/deployment latency can exist | Yes |
| Best for | Full server control | Containerized applications | Event-driven workloads |

---

# PART 14 — MASTER MENTAL MODEL

If you remember nothing else, remember this:

```text
EC2
 ↓
"I want a virtual server."

AMI
 ↓
"I want a blueprint for that server."

EBS
 ↓
"I need disk storage."

Security Group
 ↓
"I need to control network traffic."

SSH
 ↓
"I want to remotely access my server."

Auto Scaling
 ↓
"I need the number of servers to change automatically."

Load Balancer
 ↓
"I need to distribute traffic across servers."
```

Then:

```text
Docker
 ↓
"I package my application into a container."

ECR
 ↓
"I store my container image."

ECS
 ↓
"I want AWS to manage my containers."

Task Definition
 ↓
"Here is how my container workload should run."

Task
 ↓
"Here is a running instance of that configuration."

Service
 ↓
"Keep this many tasks running and manage deployments."

Fargate
 ↓
"Run ECS containers without me managing EC2 servers."

ALB
 ↓
"Send traffic to healthy ECS tasks."
```

And:

```text
Lambda
 ↓
"Run this function when an event happens."

API Gateway → Lambda
 ↓
"HTTP request triggers my function."

S3 → Lambda
 ↓
"File event triggers my function."

SQS → Lambda
 ↓
"Queue message triggers processing."

Cold Start
 ↓
"New Lambda environment needs initialization."

Concurrency
 ↓
"How many Lambda executions are running simultaneously?"
```

---

# FINAL INTERVIEW FRAMEWORK

When the interviewer gives you a production scenario, don't randomly name AWS services.

Use:

```text
1. Identify the symptom
        ↓
2. Check metrics
        ↓
3. Establish timeline
        ↓
4. Check logs
        ↓
5. Check dependencies
        ↓
6. Find bottleneck/root cause
        ↓
7. Mitigate
        ↓
8. Verify
        ↓
9. Prevent recurrence
```

For compute specifically:

```text
EC2 problem
 ↓
Instance
 ↓
CPU / Memory / Disk / Network
 ↓
Application
 ↓
Security Group / Networking
 ↓
Load Balancer
 ↓
Auto Scaling
 ↓
Dependencies
```

For ECS:

```text
ECS problem
 ↓
Service
 ↓
Task
 ↓
Task Definition
 ↓
Container
 ↓
Logs
 ↓
CPU / Memory
 ↓
ALB health
 ↓
Networking
 ↓
Dependencies
```

For Lambda:

```text
Lambda problem
 ↓
Invocation
 ↓
Duration
 ↓
Errors
 ↓
Cold start?
 ↓
Concurrency?
 ↓
Logs
 ↓
Dependency
 ↓
Database / API / SQS / S3
```

## The single most important interview principle

> **Don't just say what AWS service you would use. Explain what signal you would check, what that signal tells you, what you would check next, and how you would reach the root cause.**

That is what turns a memorized AWS answer into a strong backend-engineering answer.
