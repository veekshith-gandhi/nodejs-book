# AWS Storage & Databases — Interview Guide From Absolute Zero

> **Audience:** Backend developer learning AWS storage and databases from scratch.
>
> **Goal:** Understand S3, RDS/PostgreSQL, DynamoDB, and ElastiCache/Redis deeply enough to answer beginner, intermediate, scenario-based, and tricky backend interview questions.
>
> **Important:** The goal is not to memorize AWS definitions. Learn the mental model, then use it to reason through production problems.

---

# PART 1 — THE BIG PICTURE

Before learning each service, understand what problem each one solves.

A backend application usually needs different kinds of storage:

```text
                    Backend Application
                           |
        +------------------+------------------+
        |                  |                  |
        v                  v                  v
      S3              PostgreSQL           DynamoDB
   File/Object        Relational          NoSQL / Key-Value
    Storage            Database             Database
                           |
                           v
                       Redis
                        Cache
```

Think:

```text
S3
↓
"Store files/objects."

PostgreSQL / RDS
↓
"Store relational application data."

DynamoDB
↓
"Store data with predictable, high-scale key-based access."

Redis / ElastiCache
↓
"Keep frequently needed data in memory so we can access it quickly."
```

---

# PART 2 — S3

# 1. What is S3?

S3 = **Amazon Simple Storage Service**.

S3 is object storage.

It is commonly used to store:

```text
Images
Videos
PDFs
Documents
Backups
Logs
Data files
Static assets
```

Instead of storing a large image directly inside PostgreSQL:

```text
Database
  ↓
1 GB image
```

you might store:

```text
Image
 ↓
S3
 ↓
S3 URL/key stored in PostgreSQL
```

Example:

```text
PostgreSQL

user_id = 101
profile_image_key = users/101/profile.jpg
```

The actual file:

```text
S3
└── users/
    └── 101/
        └── profile.jpg
```

---

# 2. Bucket

A **bucket** is a container for S3 objects.

Think:

```text
Bucket
 |
 +-- image.jpg
 +-- document.pdf
 +-- video.mp4
```

Example:

```text
my-production-files
```

The bucket is where your objects live.

---

# 3. Object

An **object** is the actual stored item.

For example:

```text
profile.jpg
invoice.pdf
video.mp4
```

An S3 object has important pieces such as:

```text
Key
Data
Metadata
```

The **key** identifies where the object is located within the bucket's namespace.

Example:

```text
users/101/profile.jpg
```

Here:

```text
Bucket:
my-production-files

Object key:
users/101/profile.jpg
```

---

# 4. Bucket vs Object

Very common interview question.

### Question

> What is the difference between an S3 bucket and an S3 object?

### Answer

> A bucket is the container in which S3 objects are stored. An object is the actual data being stored, identified by its key.

Simple:

```text
Bucket = Container

Object = File/data
```

---

# 5. S3 Is Object Storage

This distinction is important.

```text
S3
 ↓
Object storage

EBS
 ↓
Block storage

File system
 ↓
File storage
```

You shouldn't think of S3 as a normal disk attached to your application.

Your application interacts with S3 through APIs.

Conceptually:

```text
Node.js
  ↓
S3 API
  ↓
Object
```

---

# 6. Why Not Store Images in PostgreSQL?

You technically can store binary data in a relational database, but for many application architectures it is better to store large files in object storage.

Why?

```text
Large files
 ↓
S3
```

and keep only metadata/reference information in PostgreSQL:

```text
PostgreSQL
-------------------------
id
user_id
file_key
file_name
content_type
created_at
```

Benefits can include:

```text
Database remains focused on relational data
Object storage is designed for large objects
Easier file delivery
Independent storage scaling
Potentially lower database storage pressure
```

---

# 7. Presigned URLs

This is one of the most important S3 interview topics.

Suppose your S3 bucket is private.

You don't want:

```text
Everyone
  ↓
Direct access to S3
```

Instead, your backend can generate a temporary URL.

That is a **presigned URL**.

Conceptually:

```text
Client
  ↓
Backend
  ↓
Generate presigned URL
  ↓
Client
  ↓
Temporary S3 URL
  ↓
S3
```

---

# 8. Why Use Presigned URLs?

Suppose a user wants to upload a 100 MB video.

Bad architecture:

```text
Client
  ↓
Node.js server
  ↓
Node.js receives 100 MB
  ↓
Node.js uploads to S3
```

Now your backend becomes a file-transfer middleman.

Better:

```text
Client
  ↓
Node.js
  ↓
Presigned upload URL
  ↓
Client uploads directly to S3
```

The backend handles authorization and URL generation, while S3 handles the file transfer.

---

# 9. Presigned URL Flow — Upload

```text
1. Client asks backend:
   "I want to upload a file."

2. Backend authenticates user.

3. Backend generates presigned URL.

4. Backend returns URL to client.

5. Client uploads directly to S3.

6. Backend can store metadata/reference.
```

Diagram:

```text
             Client
                |
                | 1. Request upload
                v
             Backend
                |
                | 2. Generate URL
                v
             Client
                |
                | 3. PUT file
                v
               S3
```

---

# 10. Presigned URL Flow — Download

Similarly:

```text
Client
  ↓
Backend
  ↓
Authorize request
  ↓
Generate temporary download URL
  ↓
Client
  ↓
S3
```

This lets you keep the bucket private while giving temporary access.

---

# 11. Presigned URL Interview Question

### Question

> Why would you use a presigned URL instead of uploading the file through your backend?

### Answer

> It allows the client to upload or download directly from S3 without making the application server handle the entire file transfer. This reduces backend bandwidth and processing load while still allowing controlled, time-limited access.

---

# 12. Presigned URL Trick Question

### Question

> Does a presigned URL make a private S3 bucket public?

No.

It grants temporary access to a specific operation/object according to the permissions and conditions used to generate the URL.

Mental model:

```text
Private bucket
     ↓
Temporary authorized URL
     ↓
Limited access
```

---

# 13. Multipart Upload

Suppose a user uploads a huge file:

```text
10 GB
```

Uploading it as one giant request is less resilient.

Multipart upload allows the file to be divided into parts.

```text
10 GB file

       ↓

+------+------+------+------+
| Part | Part | Part | Part |
+------+------+------+------+
```

Each part can be uploaded separately.

---

# 14. Why Multipart Upload?

Benefits:

```text
Large files
 ↓
Split into parts
 ↓
Upload parts independently
 ↓
Retry failed parts
 ↓
Complete upload
```

Suppose:

```text
Part 1 → success
Part 2 → success
Part 3 → failure
Part 4 → success
```

You can retry Part 3 instead of restarting the entire upload.

This is a major advantage.

---

# 15. Multipart Upload Interview Question

> Why would you use multipart upload?

### Answer

> For large objects, multipart upload allows the file to be uploaded in independent parts, improving resilience and potentially allowing parallel uploads. Failed parts can be retried without restarting the entire upload.

---

# 16. Multipart Upload Trick Question

### Question

> Does multipart upload mean S3 permanently stores the file as separate files?

No.

The parts are uploaded as part of a multipart upload process and then S3 assembles them into the resulting object when the multipart upload is completed.

---

# 17. S3 Lifecycle Policies

Imagine you have:

```text
100 million old files
```

Some are accessed frequently.

Some haven't been touched for years.

You don't necessarily want every object in the same storage class forever.

A lifecycle policy can automate actions based on object age or other supported conditions.

Conceptually:

```text
New file
   ↓
Frequently accessed storage
   ↓
After some time
   ↓
Move to cheaper storage class
   ↓
After longer time
   ↓
Archive/delete according to policy
```

---

# 18. Why Lifecycle Policies?

They help with:

```text
Cost optimization
Automated data management
Retention policies
Automatic deletion/transition
```

Example:

```text
Day 0
 ↓
Standard storage

After 30 days
 ↓
Different storage class

After 365 days
 ↓
Archive/delete according to requirements
```

Exact transitions should be selected based on access patterns and business requirements.

---

# 19. Lifecycle Interview Question

> Why use an S3 lifecycle policy?

### Answer

> To automatically transition objects between storage classes or expire objects according to defined retention and cost-management rules.

---

# 20. Versioning

Suppose you have:

```text
report.pdf
```

Someone accidentally overwrites it.

Without versioning:

```text
Old version
   ↓
Overwritten
```

With S3 Versioning:

```text
report.pdf
 |
 +-- Version 1
 +-- Version 2
 +-- Version 3
```

You can preserve previous versions.

---

# 21. Why Use Versioning?

Useful for:

```text
Accidental deletion protection
Accidental overwrite protection
Recovery
Data history
```

Important:

> Versioning can increase storage usage because old versions remain stored until lifecycle/retention rules remove them.

---

# 22. Versioning Interview Question

> What is S3 versioning?

### Answer

> Versioning allows multiple versions of an object to be retained in a bucket, helping recover from accidental overwrites or deletions.

---

# 23. S3 Delete Is a Trick Topic

With versioning enabled, deleting an object doesn't necessarily mean all historical versions are physically gone.

S3 can create a **delete marker** for a versioned object.

Conceptually:

```text
Version 1
Version 2
Delete request
    ↓
Delete marker
```

Older versions can still exist.

This is why lifecycle policies and version management matter.

---

# 24. S3 Interview Scenarios

# Scenario 1 — User Uploads a 500 MB Video

### Question

> How would you design the upload?

Bad:

```text
Client
 ↓
Node.js
 ↓
S3
```

Better:

```text
Client
 ↓
Node.js
 ↓
Presigned URL
 ↓
S3
```

For sufficiently large files:

```text
Presigned multipart upload
```

Potential flow:

```text
Client
 ↓
Backend authorization
 ↓
Multipart upload initiated
 ↓
Presigned URLs/part upload authorization
 ↓
Client uploads parts directly to S3
 ↓
Complete multipart upload
```

---

# Scenario 2 — S3 Bucket Is Public

### Question

> Would you make a production bucket public so users can download images?

Usually not by default.

Prefer:

```text
Private bucket
    ↓
Controlled access
    ↓
Presigned URLs / appropriate AWS access mechanisms
```

The correct design depends on whether the content is intentionally public, such as truly public static assets.

---

# Scenario 3 — User Can Upload but Shouldn't Access Other Users' Files

### Question

> How would you prevent User A from downloading User B's file?

You need authorization.

Don't trust only a filename sent by the client.

Conceptually:

```text
User A
 ↓
Backend
 ↓
Check ownership
 ↓
Generate URL only if authorized
 ↓
S3
```

Your database might contain:

```text
file_id
owner_id
s3_key
```

Then:

```text
request.user.id == file.owner_id
```

before generating access.

---

# Scenario 4 — Large Upload Frequently Fails

### Question

> A 10 GB upload frequently fails near the end. What would you do?

Use multipart upload.

Why?

```text
10 GB
 ↓
Parts
 ↓
Upload independently
 ↓
Retry failed part
 ↓
Complete
```

This avoids restarting the entire upload after one failure.

---

# Scenario 5 — Accidentally Deleted Files

### Question

> Users accidentally delete important S3 files. What would you consider?

Potential controls:

```text
Versioning
Lifecycle policies
Appropriate access control
Deletion safeguards
Backup/retention strategy
```

Versioning can help recover from accidental deletion or overwrite.

---

# PART 3 — RDS / POSTGRESQL

# 25. What is RDS?

RDS = **Amazon Relational Database Service**.

It is a managed database service.

Instead of manually managing everything on an EC2 server:

```text
EC2
 ↓
Install PostgreSQL
 ↓
Configure database
 ↓
Backups
 ↓
Patching
 ↓
Monitoring
 ↓
Failover
```

RDS handles many infrastructure-management tasks for you.

You still manage database-level concerns such as:

```text
Schema
Queries
Indexes
Users/permissions
Transactions
Application design
```

---

# 26. RDS PostgreSQL

You can run PostgreSQL using RDS.

Architecture:

```text
Node.js
   ↓
RDS PostgreSQL
   ↓
Tables
```

Example:

```text
users
orders
payments
products
```

---

# 27. Database Connections

This is very important for backend developers.

When your application talks to PostgreSQL, it uses a database connection.

Conceptually:

```text
Node.js
   |
   +---- Connection 1 ----> DB
   +---- Connection 2 ----> DB
   +---- Connection 3 ----> DB
```

Opening a database connection has overhead.

So backend applications usually use a **connection pool**.

---

# 28. Connection Pool

Instead of:

```text
Request
 ↓
Create DB connection
 ↓
Query
 ↓
Close connection
```

for every request, use:

```text
Connection Pool
 |
 +-- Connection 1
 +-- Connection 2
 +-- Connection 3
 +-- Connection 4
```

Requests borrow connections:

```text
Request
 ↓
Pool
 ↓
Available connection
 ↓
Query
 ↓
Return connection to pool
```

This is more efficient.

---

# 29. Connection Pool Scenario

### Question

> API suddenly becomes slow and database CPU is normal. What if the connection pool is exhausted?

Possible chain:

```text
Requests ↑
   ↓
Connections occupied
   ↓
Pool exhausted
   ↓
Requests wait
   ↓
API latency ↑
```

So:

> Database CPU being normal does not prove the database connection layer is healthy.

---

# 30. Connection Pool Interview Question

> Why use a database connection pool?

### Answer

> Creating database connections has overhead. A connection pool reuses a controlled number of connections, reducing connection setup cost and preventing the application from creating an uncontrolled number of database connections.

---

# 31. Connection Pool Trick Question

> Should I set the connection pool to 1,000 because I have 1,000 concurrent users?

No.

Concurrent users do not necessarily mean 1,000 simultaneous database connections.

You need to consider:

```text
Request concurrency
Query duration
Application instances
Database capacity
Workload
Connection usage
```

Example:

```text
10 EC2 instances
 ×
20 DB connections each
 =
200 possible DB connections
```

The total across all application instances matters.

---

# 32. Multi-AZ

Multi-AZ = **Multi-Availability Zone**.

It is primarily about **high availability**.

Conceptually:

```text
              RDS
               |
       +-------+-------+
       |               |
     AZ-A            AZ-B
   Primary          Standby
```

The exact implementation depends on the RDS engine/deployment configuration.

The goal is to reduce the impact of an Availability Zone failure.

---

# 33. Multi-AZ Does Not Mean Read Scaling

This is a very important trick question.

### Interviewer:

> Does Multi-AZ give me more read capacity?

Not as its primary purpose.

Think:

```text
Multi-AZ
 ↓
High availability / failover

Read Replica
 ↓
Read scaling
```

---

# 34. Failover

Suppose:

```text
Primary
 ↓
Failure
```

With an appropriate Multi-AZ deployment, RDS can fail over to the standby.

Conceptually:

```text
Primary
   X
   ↓
Failure detected
   ↓
Standby becomes primary
   ↓
Application reconnects
```

The exact failover time depends on the architecture and conditions.

---

# 35. Read Replicas

A read replica is a separate database instance that receives replicated data from the source database and can serve read traffic.

Conceptually:

```text
                Primary DB
                /        \
               /          \
              v            v
        Read Replica 1  Read Replica 2
```

Your application can send:

```text
Writes → Primary

Reads → Replicas
```

if the workload and consistency requirements allow it.

---

# 36. Why Read Replicas?

Suppose:

```text
10% writes
90% reads
```

The primary database is doing lots of read work.

You can move some reads to replicas.

```text
Writes
  ↓
Primary

Reads
  ↓
Read Replicas
```

This can increase read capacity.

---

# 37. Read Replica vs Multi-AZ

Memorize this table:

| Multi-AZ | Read Replica |
|---|---|
| High availability | Read scaling |
| Failover | Distribute read workload |
| Primarily HA | Primarily performance/scaling |
| Standby generally not used as normal read target in the same way | Designed to serve read traffic |
| Helps with AZ/instance failure | Helps with read-heavy workloads |

---

# 38. Read Replica Trick Question

### Question

> If my primary database fails, will my read replica automatically become the primary?

Not necessarily.

A read replica and Multi-AZ standby solve different problems.

Depending on the architecture, a read replica may require an explicit promotion process.

Don't confuse:

```text
Read Replica
```

with:

```text
Multi-AZ Standby
```

---

# 39. Replication Lag

Read replicas can have replication lag.

Example:

```text
Primary:
order_status = PAID

Replica:
order_status = PENDING
```

for a short period.

Why?

Because changes must be replicated.

This creates a consistency consideration.

---

# 40. Replication Lag Scenario

### Question

> User updates their profile, then immediately reads it and sees old data. Why?

Possible architecture:

```text
Write
 ↓
Primary

Read
 ↓
Read Replica
```

The replica hasn't received the latest change yet.

This is a form of **eventual consistency between primary and replica**.

One solution is to route certain read-after-write operations to the primary when strong/read-your-writes behavior is required.

---

# 41. Backups

RDS supports automated backups and snapshots.

Backups help recover from:

```text
Data corruption
Accidental deletion
Operational mistakes
Disaster scenarios
```

Don't confuse:

```text
Backup
```

with:

```text
High availability
```

Backups help recovery.

Multi-AZ helps availability/failover.

---

# 42. Backup vs Read Replica

Another interview question.

```text
Backup
 ↓
Recovery

Read Replica
 ↓
Read scaling / replication

Multi-AZ
 ↓
High availability / failover
```

These are different purposes.

---

# 43. RDS Failover Scenario

### Question

> Primary RDS instance fails. What happens in a Multi-AZ setup?

Conceptually:

```text
Primary
  X
  ↓
Failure
  ↓
Standby
  ↓
Becomes primary
```

Your application should be designed to reconnect appropriately.

A strong answer:

> "RDS handles the infrastructure-level failover, but the application still needs sensible connection handling and retry/reconnect behavior."

---

# 44. RDS Scenario — Too Many Connections

### Question

> PostgreSQL is rejecting new connections. What would you investigate?

Check:

```text
Current connections
Connection pool size
Number of application instances
Long-running queries
Idle connections
Connection leaks
Database max connection configuration
Traffic increase
```

Potential chain:

```text
10 application instances
 ×
100 connections
 =
1,000 potential connections
```

The database may not be configured to handle that many.

---

# 45. RDS Scenario — Slow Query

### Question

> API is slow but CPU is normal. PostgreSQL query latency increased. What do you investigate?

Check:

```text
Slow queries
Indexes
Execution plans
Locks
Connection pool
I/O
Query changes
Data growth
```

For PostgreSQL, tools/concepts include:

```sql
EXPLAIN
EXPLAIN ANALYZE
```

These help understand query execution.

---

# 46. RDS Scenario — Database Is Down

Check:

```text
RDS instance status
Connectivity
Security groups
Subnet/networking
DNS/endpoint
Application connection errors
Database events
Multi-AZ/failover state
```

Don't immediately assume:

> "The database itself is broken."

The application may simply be unable to reach it.

---

# PART 4 — DYNAMODB

# 47. What is DynamoDB?

DynamoDB is AWS's managed NoSQL database.

It is designed for highly scalable, low-latency access patterns.

Instead of designing tables primarily around joins like relational databases, DynamoDB design starts with:

> **How will I access the data?**

This is one of the most important DynamoDB concepts.

---

# 48. Basic DynamoDB Item

Think of a DynamoDB table as storing items.

Example:

```text
Users

{
  userId: 101,
  name: "Alex",
  city: "Bengaluru"
}
```

Another:

```text
{
  userId: 102,
  name: "John",
  city: "Mumbai"
}
```

DynamoDB is flexible about item attributes.

---

# 49. Partition Key

The **partition key** determines how DynamoDB distributes items across partitions and is fundamental to how data is accessed.

Example:

```text
userId
```

If:

```text
userId = 101
```

DynamoDB uses the partition key value as part of determining where the item is stored.

Mental model:

```text
Partition Key
     ↓
Distribution + direct lookup
```

---

# 50. Simple Primary Key

A DynamoDB table can have a primary key consisting only of a partition key.

Example:

```text
PK = userId
```

Then:

```text
Get user 101
```

can directly identify the item.

---

# 51. Composite Primary Key

A DynamoDB table can also use:

```text
Partition Key
+
Sort Key
```

Example:

```text
PK = userId
SK = orderId
```

Data:

```text
userId    orderId
101       order-1
101       order-2
101       order-3
102       order-4
```

All items with:

```text
userId = 101
```

belong to the same logical partition-key group.

The sort key orders and helps query items within that partition-key value.

---

# 52. Why Sort Key?

Suppose you want:

```text
All orders for user 101
```

Use:

```text
PK = userId
```

and:

```text
PK = 101
```

then query the items.

The sort key can also support conditions such as:

```text
orderId begins_with ...
```

or time-based designs such as:

```text
PK = userId
SK = timestamp
```

Then you can query a user's records over a time range.

---

# 53. Partition Key + Sort Key Mental Model

Think:

```text
Partition Key
 ↓
Which logical group?

Sort Key
 ↓
Which item/order within that group?
```

Example:

```text
PK = CUSTOMER#101
SK = ORDER#001
```

---

# 54. DynamoDB Query

A **Query** retrieves items based on a specific partition key value, with optional conditions on the sort key.

Example:

```text
PK = userId
userId = 101
```

DynamoDB can efficiently find that partition-key group.

---

# 55. DynamoDB Scan

A **Scan** examines every item in a table or index, subject to pagination and filters.

Conceptually:

```text
Table
 |
 +-- Item 1
 +-- Item 2
 +-- Item 3
 +-- ...
 +-- Item 1,000,000
```

Scan can be expensive for large tables.

---

# 56. Query vs Scan

Very common interview question.

| Query | Scan |
|---|---|
| Uses key-based access | Examines items broadly |
| More efficient for known access pattern | Potentially expensive |
| Designed for targeted retrieval | Useful when you don't have a suitable key condition |
| Preferred for normal application reads | Avoid for frequent large-table reads |

Memory:

```text
Query = "I know what partition I need."

Scan = "Look through the table."
```

---

# 57. GSI

GSI = **Global Secondary Index**.

Suppose your main table uses:

```text
PK = userId
```

But your application also needs:

```text
Find users by email
```

Email isn't the primary key.

You can create a GSI with:

```text
GSI PK = email
```

Then query the GSI.

Conceptually:

```text
Main Table
PK = userId

GSI
PK = email
```

---

# 58. Why GSI?

Because applications often need multiple access patterns.

Example:

```text
Access Pattern 1:
Get user by userId

Access Pattern 2:
Find user by email

Access Pattern 3:
Find orders by customer
```

A single primary key may not efficiently support all of them.

Indexes provide additional access paths.

---

# 59. LSI

LSI = **Local Secondary Index**.

An LSI keeps the same partition key as the base table but uses a different sort key.

Example:

```text
Base table:
PK = userId
SK = orderId

LSI:
PK = userId
SK = orderDate
```

The partition key remains:

```text
userId
```

but the sort key differs.

---

# 60. GSI vs LSI

Very common interview question.

| GSI | LSI |
|---|---|
| Can have different partition key | Must use same partition key as base table |
| Separate index | Local to same partition-key value |
| More flexible | More constrained |
| Can be created after table creation | Must be defined when creating the table |
| Has its own capacity behavior/configuration depending on mode | Shares base table's provisioned throughput in provisioned mode |

For interviews, memorize:

```text
GSI
→ Different partition key possible

LSI
→ Same partition key, different sort key
```

---

# 61. DynamoDB Capacity

DynamoDB must handle reads and writes.

Two broad capacity modes are:

```text
On-demand
Provisioned
```

## On-demand

DynamoDB automatically handles capacity based on workload, with pricing based on requests.

Useful when:

```text
Traffic is unpredictable
Workload changes significantly
You don't want to manage provisioned capacity
```

## Provisioned

You specify expected read/write capacity and can configure auto scaling.

Useful when:

```text
Traffic is predictable
You want more control over capacity planning
```

---

# 62. Read and Write Capacity

Think:

```text
Reads → read capacity

Writes → write capacity
```

The exact billing/throughput behavior depends on table configuration and item sizes.

For interviews, don't reduce DynamoDB capacity to:

> "One request = one unit."

Capacity consumption depends on factors such as operation type, item size, and consistency.

---

# 63. Hot Partition

This is a major DynamoDB interview topic.

Suppose your partition key is:

```text
country
```

and most requests are:

```text
country = India
```

A disproportionate amount of traffic can concentrate on a limited partition-key value.

Conceptually:

```text
Partition
    |
    +---- India → 90% traffic
    |
    +---- US    → 5%
    |
    +---- UK    → 5%
```

This is a hot-partition risk.

---

# 64. How Do You Avoid Hot Partitions?

Use a partition key with good distribution.

Bad:

```text
country
```

Potentially better:

```text
userId
```

or another key with high cardinality and good access-pattern alignment.

Sometimes applications use sharding/bucketing strategies when one logical entity receives extreme traffic.

The important principle:

> Avoid concentrating too much traffic on one partition-key value.

---

# 65. DynamoDB Scenario — Traffic Spike

### Question

> DynamoDB suddenly starts throttling. What would you investigate?

Check:

```text
Capacity mode
Consumed capacity
Throttled requests
Partition-key distribution
Hot partitions
Item size
Traffic increase
Access patterns
```

Possible cause:

```text
Traffic ↑
   ↓
One partition-key value gets huge traffic
   ↓
Hot partition
   ↓
Throttling
```

---

# 66. DynamoDB Scenario — Need Search by Email

### Question

> Table primary key is userId. Now you need to find users by email. What would you do?

Don't scan the entire table for every request.

Create a suitable GSI:

```text
Base table:
PK = userId

GSI:
PK = email
```

Then:

```text
Query GSI by email
```

---

# 67. DynamoDB Scenario — Need All Orders for User

Design:

```text
PK = userId
SK = orderId
```

Then:

```text
Query
PK = userId
```

This is a natural DynamoDB access pattern.

---

# 68. DynamoDB Scenario — Need Orders by Date

You might design:

```text
PK = userId
SK = orderTimestamp
```

Then query:

```text
PK = userId
SK BETWEEN start AND end
```

This enables efficient time-range queries within the user's partition key.

---

# 69. DynamoDB Trick Question

### Question

> Why not just use Scan and filter the results?

Because Scan still examines the table/index broadly before applying filtering behavior.

For large tables and frequent application reads, this can be expensive and inefficient.

Prefer designing keys/indexes around your access patterns.

---

# 70. DynamoDB Trick Question

### Question

> DynamoDB is NoSQL, so you don't need to think about schema design.

Wrong.

DynamoDB often requires **very deliberate schema and access-pattern design**.

Relational mindset:

```text
Design normalized tables
 ↓
Figure out queries later
```

DynamoDB mindset:

```text
Identify access patterns
 ↓
Design keys/indexes
 ↓
Design item structure
```

---

# PART 5 — ELASTICACHE / REDIS

# 71. What is Redis?

Redis is an in-memory data store.

Because data is primarily kept in memory, access can be very fast.

A common use case is caching.

```text
Application
   ↓
Redis
   ↓
If hit → return quickly
   ↓
If miss → Database
```

---

# 72. What is ElastiCache?

Amazon ElastiCache is an AWS managed caching service that supports engines such as Redis/Valkey depending on AWS offerings and configuration.

For interview purposes, when someone says:

> "ElastiCache Redis"

think:

```text
AWS-managed in-memory cache
```

---

# 73. Why Use Redis?

Suppose your database query takes:

```text
100 ms
```

and the same data is requested:

```text
10,000 times
```

Instead of hitting PostgreSQL every time:

```text
10,000 requests
 ↓
10,000 DB queries
```

you can cache frequently requested data.

```text
First request
 ↓
Redis miss
 ↓
PostgreSQL
 ↓
Store result in Redis

Next requests
 ↓
Redis hit
 ↓
Fast response
```

---

# 74. Cache Hit

A cache hit means:

> The requested data is already in Redis.

```text
Request
 ↓
Redis
 ↓
Found
 ↓
Return
```

---

# 75. Cache Miss

A cache miss means:

> The requested data isn't in Redis.

```text
Request
 ↓
Redis
 ↓
Not found
 ↓
Database
 ↓
Store in Redis
 ↓
Return
```

This is called a common **cache-aside** pattern.

---

# 76. Cache-Aside Pattern

This is very important for backend interviews.

```text
Request
  ↓
Check Redis
  |
  +---- HIT ----→ Return data
  |
  +---- MISS
          ↓
       Database
          ↓
      Store Redis
          ↓
       Return
```

---

# 77. Cache-Aside Example

Suppose:

```text
GET /users/101
```

Backend:

```javascript
const cached = await redis.get("user:101");

if (cached) {
    return JSON.parse(cached);
}

const user = await db.query(...);

await redis.set("user:101", JSON.stringify(user));

return user;
```

Conceptually:

```text
Redis first
 ↓
DB if miss
 ↓
Redis store
```

---

# 78. TTL

TTL = **Time To Live**.

It defines how long cached data should remain before expiring.

Example:

```text
user:101
TTL = 300 seconds
```

After the TTL expires:

```text
Redis entry
 ↓
Expires
```

Then the next request may need to retrieve fresh data from the database.

---

# 79. Why Use TTL?

Without expiration:

```text
Cache
 ↓
Old data stays forever
```

With TTL:

```text
Cache
 ↓
Automatically expires
 ↓
Fresh data can be loaded
```

TTL helps limit stale data and unbounded cache growth, though it doesn't guarantee perfect freshness.

---

# 80. Cache Invalidation

This is one of the most famous backend problems.

> "There are only two hard things in Computer Science: cache invalidation and naming things..."

Suppose:

```text
Database:
username = Alex
```

Redis:

```text
username = Alex
```

User changes username:

```text
Database:
username = Bob
```

But Redis still has:

```text
username = Alex
```

Now the cache is stale.

---

# 81. Cache Invalidation Strategies

### Strategy 1 — Delete cache on update

```text
UPDATE DB
   ↓
DELETE Redis key
```

Next read:

```text
Redis miss
 ↓
DB
 ↓
New value
 ↓
Cache
```

### Strategy 2 — Update cache

```text
UPDATE DB
   ↓
UPDATE Redis
```

### Strategy 3 — TTL

Allow old value to expire automatically.

Each strategy has tradeoffs.

---

# 82. Cache Invalidation Interview Question

> User updates their profile, but GET /profile still returns old data. Why?

Likely:

```text
DB updated
 ↓
Redis still contains old value
 ↓
GET reads Redis
 ↓
Old response
```

Solution:

```text
Update DB
 ↓
Invalidate/update cache
```

---

# 83. Important Cache Ordering Question

### Question

> Should you update the database first or Redis first?

There is no universal answer, but a common cache-aside approach is:

```text
Update DB
   ↓
Invalidate cache
```

Why?

Because the database remains the source of truth.

If you update cache first and database update fails:

```text
Redis = new value
DB = old value
```

You can create inconsistency.

---

# 84. Cache Stampede

Suppose a very popular cache key expires.

```text
product:123
```

10,000 requests arrive at the same time.

Cache:

```text
MISS
MISS
MISS
MISS
...
```

All 10,000 requests hit PostgreSQL.

```text
10,000 requests
      ↓
10,000 DB queries
      ↓
Database overload
```

This is a **cache stampede** (also called a thundering herd problem in related contexts).

---

# 85. How Can You Reduce Cache Stampede?

Possible approaches:

```text
Request coalescing
Distributed lock
Jittered TTLs
Background refresh
Stale-while-revalidate style patterns
```

One simple approach:

```text
First request gets lock
       ↓
Loads DB
       ↓
Updates cache
       ↓
Other requests wait/use refreshed value
```

---

# 86. Distributed Locks

A distributed lock allows multiple application instances to coordinate around a shared resource.

Example:

```text
EC2-1
EC2-2
EC2-3
```

All receive the same request.

Without coordination:

```text
EC2-1 → DB
EC2-2 → DB
EC2-3 → DB
```

With a distributed lock:

```text
EC2-1 → acquires lock
EC2-2 → waits
EC2-3 → waits

EC2-1 → DB
EC2-1 → updates cache
EC2-1 → releases lock
```

---

# 87. Redis Distributed Lock

Redis can be used to implement distributed locking patterns.

Conceptually:

```text
SET lock:key unique-value NX PX ...
```

The exact implementation must handle:

```text
Unique lock ownership
Expiration
Safe release
Retries
Failure scenarios
Clock/network considerations
```

Do not implement a naive:

```text
SET lock = true
```

and assume it is safe.

---

# 88. Distributed Lock Interview Question

> Why would you use a distributed lock?

### Answer

> To ensure that only one application instance performs a critical operation at a time when multiple instances may process the same logical resource concurrently.

Examples:

```text
Prevent duplicate job execution
Protect cache refresh
Coordinate scheduled work
Avoid duplicate resource creation
```

---

# 89. Distributed Lock Trick Question

### Question

> If I use Redis for locking, can the lock remain forever?

It should not.

A lock should have an expiration/lease strategy so that if the owner crashes, another process can eventually make progress.

But expiration introduces its own correctness considerations, so lock design must be careful.

---

# PART 6 — REDIS INTERVIEW SCENARIOS

# Scenario 1 — Cache Is Always Missed

### Question

> Redis is running but cache hit rate is very low. What would you investigate?

Check:

```text
Cache keys
TTL
Key construction
Evictions
Expiration
Traffic patterns
Whether data is actually being cached
Serialization/deserialization
```

Potential bug:

```text
Write:
user:101

Read:
user_101
```

Different keys → cache miss.

---

# Scenario 2 — Cache Is Full

### Question

> Redis memory is almost full. What would you investigate?

Check:

```text
Key count
Value sizes
TTL
Evictions
Large objects
Cache usage pattern
Memory policy/configuration
```

Potential causes:

```text
No TTL
Huge cached values
Too much data
Unexpected key creation
```

---

# Scenario 3 — Redis Goes Down

### Question

> Redis goes down. Should the entire API go down?

Ideally, not necessarily.

If Redis is only a cache:

```text
Redis unavailable
 ↓
Cache miss
 ↓
Database
 ↓
Response
```

The application should often degrade gracefully if the architecture allows it.

But:

```text
Database load ↑
```

could become dangerous.

So you need:

```text
Timeouts
Fallback behavior
Circuit breaking where appropriate
Database protection
Monitoring
```

---

# Scenario 4 — Redis Failure Causes Database Overload

```text
Redis fails
   ↓
All requests miss cache
   ↓
Database receives huge traffic
   ↓
DB overloaded
   ↓
API slow/errors
```

This is a classic distributed-system failure cascade.

Potential mitigations:

```text
Fallback controls
Request coalescing
Rate limiting
Circuit breakers
Database capacity
Cache recovery
```

---

# Scenario 5 — Stale Data

### Question

> Product price changed in DB but API returns old price.

Likely:

```text
DB = ₹999
Redis = ₹799
```

The API reads Redis.

Solution:

```text
Update DB
 ↓
Invalidate/update cache
```

Also consider TTL as a safety net.

---

# Scenario 6 — Cache Stampede

### Question

> A popular cache key expires and DB CPU immediately jumps to 100%. Why?

Because many requests simultaneously missed the same cache key.

```text
Popular key expires
       ↓
Many cache misses
       ↓
Many DB queries
       ↓
DB overload
```

Use:

```text
Locking
Request coalescing
Jittered expiration
Background refresh
```

depending on the use case.

---

# PART 7 — COMPARISON QUESTIONS

# 90. S3 vs PostgreSQL

| S3 | PostgreSQL |
|---|---|
| Object storage | Relational database |
| Files/objects | Structured relational data |
| Images/videos/documents | Users/orders/payments |
| Object APIs | SQL |
| Not a relational query engine | Rich relational queries/transactions |

Typical architecture:

```text
Image
 ↓
S3

Image metadata
 ↓
PostgreSQL
```

---

# 91. PostgreSQL vs DynamoDB

### PostgreSQL

Good when you need:

```text
Complex relationships
Joins
Transactions
Flexible SQL queries
Strong relational modeling
```

### DynamoDB

Good when you need:

```text
Very high scale
Predictable key-based access
Low-latency access patterns
Managed NoSQL
```

Key difference:

```text
PostgreSQL
 ↓
General relational query flexibility

DynamoDB
 ↓
Access-pattern-driven design
```

---

# 92. Redis vs PostgreSQL

Redis:

```text
Fast in-memory access
Caching
Temporary/session-like data
Counters
Queues/coordination in some designs
```

PostgreSQL:

```text
Durable system-of-record data
Transactions
Relationships
SQL queries
```

Don't generally treat Redis as a replacement for your primary relational database just because Redis is faster.

---

# 93. DynamoDB vs Redis

DynamoDB:

```text
Primary persistent database
```

Redis:

```text
Primarily in-memory data store/cache
```

They can be used together:

```text
Application
   ↓
Redis
   ↓
DynamoDB
```

---

# PART 8 — ADVANCED SCENARIOS

# Scenario 7 — User Upload Architecture

### Question

> Design profile image upload for a large-scale application.

Good architecture:

```text
Client
  ↓
Backend
  ↓
Authorize user
  ↓
Generate presigned URL
  ↓
Client
  ↓
S3
```

Database:

```text
PostgreSQL
 |
 +-- user_id
 +-- image_key
 +-- metadata
```

For large files:

```text
Multipart upload
```

---

# Scenario 8 — API Is Slow Because Database Is Busy

```text
API latency ↑
   ↓
DB latency ↑
   ↓
Check queries
   ↓
Slow query?
   ↓
Missing index?
   ↓
Connection pool?
   ↓
Lock?
```

Do not immediately increase EC2 CPU.

---

# Scenario 9 — Read-Heavy PostgreSQL System

Suppose:

```text
Writes = 10%
Reads = 90%
```

Potential architecture:

```text
Writes
 ↓
Primary PostgreSQL

Reads
 ↓
Read Replicas
```

But consider:

```text
Replication lag
Read-after-write requirements
Load balancing
Failure handling
```

---

# Scenario 10 — High Availability PostgreSQL

```text
Application
     |
     v
RDS
 |
 +------ Primary
 |
 +------ Standby
        Different AZ
```

If primary fails:

```text
Failover
 ↓
Standby
 ↓
New primary
```

Application should reconnect using the appropriate RDS endpoint/configuration.

---

# Scenario 11 — DynamoDB Hot Partition

Suppose:

```text
PK = status
```

Most requests:

```text
status = ACTIVE
```

Then:

```text
ACTIVE
 ↓
Huge traffic concentration
 ↓
Hot partition risk
 ↓
Throttling
```

Better key design depends on access pattern.

Potentially:

```text
PK = userId
```

or a carefully designed composite/sharded key.

Don't blindly add random keys without understanding how queries will work.

---

# Scenario 12 — DynamoDB Query Needed

### Question

> You need to fetch all orders for a customer from a table containing 500 million items.

Bad:

```text
Scan 500 million items
 ↓
Filter customerId
```

Better:

```text
PK = customerId
SK = orderId/orderTimestamp
 ↓
Query customerId
```

This is the DynamoDB mindset.

---

# Scenario 13 — Redis Failure

### Question

> Redis fails at 2 AM. What happens to your API?

Answer depends on architecture.

If Redis is only a cache:

```text
Redis down
 ↓
Fallback to DB
```

But:

```text
DB load ↑
```

So the real question becomes:

> Can the database handle the cache-miss storm?

A strong answer mentions:

```text
Timeouts
Fallback
Rate limiting
Circuit breaking
Request coalescing
Database protection
```

---

# Scenario 14 — Database Connection Storm

Suppose:

```text
20 ECS tasks
```

Each task has:

```text
50 PostgreSQL connections
```

Potential total:

```text
20 × 50 = 1,000 connections
```

If PostgreSQL cannot handle that many:

```text
Connection failures
 ↓
Requests wait/fail
 ↓
API latency/errors
```

This is why connection-pool sizing must consider the **entire fleet**, not one instance.

---

# PART 9 — ADVANCED TRICK QUESTIONS

# Trick 1

### Interviewer:

> Is S3 a file system?

### Answer

> No. S3 is object storage. Applications interact with objects through APIs rather than treating S3 like a traditional mounted disk.

---

# Trick 2

### Interviewer:

> Is S3 eventually consistent?

Be careful with this old interview question.

Modern Amazon S3 provides strong read-after-write consistency for object operations.

Don't repeat the outdated blanket statement:

> "S3 is eventually consistent."

---

# Trick 3

### Interviewer:

> Does a presigned URL make my bucket public?

No.

It provides temporary access to a specific object/operation according to the authorization used to create it.

---

# Trick 4

### Interviewer:

> Is Multi-AZ used for read scaling?

No.

```text
Multi-AZ → High availability/failover

Read Replica → Read scaling
```

---

# Trick 5

### Interviewer:

> Can a read replica always be used immediately after a write?

Not if your application requires strict read-after-write consistency.

Replication lag can cause stale reads.

---

# Trick 6

### Interviewer:

> Why not use Redis as the primary database for everything?

Because Redis is primarily an in-memory data store and caching/low-latency use cases have different durability, querying, and data-model requirements than a relational system of record.

---

# Trick 7

### Interviewer:

> If Redis is faster than PostgreSQL, should every request go through Redis?

No.

Caching should be based on:

```text
Access pattern
Data volatility
Memory cost
Consistency requirements
Cache hit rate
Failure behavior
```

Not simply:

> "Redis is faster."

---

# Trick 8

### Interviewer:

> If DynamoDB is highly scalable, can I choose any partition key?

No.

Partition-key design is critical.

Poor distribution can cause:

```text
Hot partitions
Throttling
Uneven utilization
```

---

# Trick 9

### Interviewer:

> Query is always better than Scan?

For normal key-based application access, Query is generally preferred.

But Scan has legitimate use cases:

```text
Maintenance
Backfills
Small tables
One-off analysis
Administrative tasks
```

Don't say:

> "Scan is never allowed."

---

# Trick 10

### Interviewer:

> GSI and LSI are basically the same?

No.

```text
GSI
→ Different partition key is allowed

LSI
→ Same partition key, different sort key
```

---

# Trick 11

### Interviewer:

> If cache has a TTL, can stale data never happen?

No.

TTL only controls expiration.

Before expiration:

```text
DB = new
Redis = old
```

can still happen.

TTL is a safety mechanism, not a perfect consistency mechanism.

---

# Trick 12

### Interviewer:

> If database CPU is low, the database can't be the bottleneck.

Wrong.

Possible bottlenecks include:

```text
Connections
Locks
I/O
Slow queries
Network
Storage
Query contention
```

---

# Trick 13

### Interviewer:

> If Redis goes down, the API should definitely go down.

No.

If Redis is only a cache, design the application to degrade gracefully where possible.

But you must protect the database from the resulting cache-miss storm.

---

# Trick 14

### Interviewer:

> If S3 versioning is enabled, deleted objects are gone forever?

No.

With versioning, a delete can create a delete marker while previous versions remain until removed according to the relevant lifecycle/version management behavior.

---

# Trick 15

### Interviewer:

> Can S3 multipart upload improve reliability?

Yes.

Failed parts can be retried independently.

---

# PART 10 — MASTER PRODUCTION DEBUGGING

When a storage/database problem occurs, don't randomly check services.

Use:

```text
SYMPTOM
   ↓
METRICS
   ↓
TIMELINE
   ↓
APPLICATION LOGS
   ↓
DATABASE / CACHE / STORAGE
   ↓
ACCESS PATTERN
   ↓
ROOT CAUSE
   ↓
MITIGATE
   ↓
VERIFY
```

---

# 94. API Suddenly Slow

```text
API latency ↑
       |
       v
Traffic ↑?
       |
       +---- Yes → capacity / scaling investigation
       |
       +---- No
             ↓
        DB latency?
             |
             +---- Yes → query/connections/locks/I/O
             |
             +---- No
                   ↓
                Redis?
                   |
                   +---- Yes → cache investigation
                   |
                   +---- No
                         ↓
                    External API?
```

---

# 95. API Returns Stale Data

```text
Request
 ↓
Redis
 ↓
Old value
 ↓
DB has new value
```

Investigate:

```text
Cache invalidation
TTL
Cache update logic
Race conditions
Read/write ordering
```

---

# 96. Database Is Overloaded

Check:

```text
Traffic
Queries
Connections
Connection pool
Indexes
Locks
Read/write ratio
Read replicas
Caching
Recent deployment
```

Possible architecture change:

```text
Cache frequent reads
+
Optimize queries
+
Read replicas
+
Scale database
```

---

# 97. DynamoDB Throttling

Check:

```text
Capacity
Traffic
Partition-key distribution
Hot partition
Item size
Access pattern
Provisioning/on-demand mode
```

Think:

```text
Too much traffic
      ↓
One key gets most traffic
      ↓
Hot partition
      ↓
Throttling
```

---

# 98. S3 Uploads Failing

Check:

```text
Bucket
Permissions
Presigned URL
Expiration
Object size
Multipart upload
Network
Client retry behavior
```

For very large files:

```text
Multipart
```

---

# 99. Redis Memory Increasing

Check:

```text
TTL
Key count
Value size
Evictions
Large objects
Unexpected keys
Cache policy
```

Potential root causes:

```text
No expiration
Too many keys
Large values
Application bug
```

---

# PART 11 — RAPID-FIRE INTERVIEW QUESTIONS

## S3

### Q1. What is S3?

> Object storage service.

### Q2. What is a bucket?

> Container for S3 objects.

### Q3. What is an object?

> Stored data identified by an object key.

### Q4. What is a presigned URL?

> A temporary URL granting controlled access to an S3 object operation.

### Q5. Why use presigned URLs?

> To allow clients to upload/download directly from S3 without routing the entire file through the backend.

### Q6. What is multipart upload?

> Uploading a large object in independent parts.

### Q7. What is an S3 lifecycle policy?

> Rules that automatically transition or expire objects based on conditions such as age.

### Q8. Why enable versioning?

> To retain previous object versions and help recover from accidental overwrites/deletions.

---

# RDS

### Q9. What is RDS?

> Managed relational database service.

### Q10. What is a connection pool?

> A reusable pool of database connections.

### Q11. What is Multi-AZ?

> A high-availability deployment using multiple Availability Zones and failover capability.

### Q12. What is a read replica?

> A replicated database instance primarily used to serve read traffic and scale reads.

### Q13. Multi-AZ vs Read Replica?

> Multi-AZ is primarily HA/failover; read replicas are primarily for read scaling.

### Q14. What is replication lag?

> Delay between a change on the source and its availability on a replica.

### Q15. Why do backups matter?

> They provide a way to recover data after accidental deletion, corruption, or other failures.

---

# DynamoDB

### Q16. What is DynamoDB?

> Managed NoSQL database designed for highly scalable, low-latency access patterns.

### Q17. What is a partition key?

> A key used to identify/distribute items and form the basis of efficient key-based access.

### Q18. What is a sort key?

> A key used with the partition key to organize and query items within the same partition-key value.

### Q19. Query vs Scan?

> Query targets a partition-key value; Scan examines the table/index broadly.

### Q20. What is a GSI?

> Global Secondary Index providing an additional access path with its own key schema.

### Q21. What is an LSI?

> Local Secondary Index using the same partition key as the base table with a different sort key.

### Q22. What is a hot partition?

> A situation where traffic is disproportionately concentrated on one partition-key value.

---

# Redis

### Q23. What is Redis?

> An in-memory data store commonly used for caching and other low-latency workloads.

### Q24. What is cache-aside?

> Application checks cache first, reads from database on miss, then stores the result in cache.

### Q25. What is TTL?

> Time To Live; how long a cache entry should remain before expiration.

### Q26. What is cache invalidation?

> Removing or updating cached data when the underlying source data changes.

### Q27. What is a cache stampede?

> Many requests simultaneously miss an expired popular key and overload the backing system.

### Q28. What is a distributed lock?

> A coordination mechanism allowing multiple application instances to ensure only one performs a critical operation at a time.

---

# PART 12 — "DESIGN THIS" QUESTIONS

# Question 1

> Design a profile-picture upload system.

Answer:

```text
Client
 ↓
Backend authentication
 ↓
Presigned S3 URL
 ↓
Client
 ↓
S3
```

Database:

```text
PostgreSQL
 ↓
userId
imageKey
metadata
```

For large uploads:

```text
Multipart upload
```

---

# Question 2

> Design a highly available PostgreSQL backend.

```text
Application
     |
     v
RDS PostgreSQL
 |
 +---- Primary
 |
 +---- Standby
       Different AZ
```

Mention:

```text
Multi-AZ
Backups
Monitoring
Connection pooling
Failover/reconnect handling
```

---

# Question 3

> Design a read-heavy application.

```text
Application
     |
     +------ Writes ------> Primary DB
     |
     +------ Reads -------> Cache
                              |
                              v
                         Read Replica
```

Potentially:

```text
Redis
 ↓
Read Replica
 ↓
Primary
```

depending on consistency and workload.

---

# Question 4

> Design an application using DynamoDB.

Start with:

```text
What are my access patterns?
```

Example:

```text
Get user
 ↓
PK = userId

Get user's orders
 ↓
PK = userId
SK = orderId

Find user by email
 ↓
GSI PK = email
```

This is much better than designing a relational schema first and trying to adapt it.

---

# Question 5

> Design caching for a product API.

```text
Request
 ↓
Redis
 |
 +--- HIT ---> Return
 |
 +--- MISS
       ↓
   PostgreSQL
       ↓
   Store Redis
       ↓
     Return
```

Set:

```text
TTL
```

On product update:

```text
Update DB
 ↓
Invalidate cache
```

---

# PART 13 — MASTER MENTAL MODEL

Memorize this:

```text
S3
 ↓
Files / objects

RDS PostgreSQL
 ↓
Relational system of record

DynamoDB
 ↓
High-scale key-based NoSQL access

Redis
 ↓
Fast in-memory cache
```

Then:

```text
S3
├── Bucket
├── Object
├── Presigned URL
├── Multipart upload
├── Lifecycle
└── Versioning
```

```text
RDS PostgreSQL
├── Connections
├── Connection Pool
├── Multi-AZ
├── Read Replica
├── Backups
└── Failover
```

```text
DynamoDB
├── Partition Key
├── Sort Key
├── Query
├── Scan
├── GSI
├── LSI
├── Capacity
└── Hot Partitions
```

```text
Redis / ElastiCache
├── Cache
├── Cache Hit
├── Cache Miss
├── TTL
├── Invalidation
├── Cache Stampede
└── Distributed Lock
```

---

# FINAL INTERVIEW FRAMEWORK

When the interviewer gives you a scenario:

```text
1. What is the symptom?
        ↓
2. What metric would I check?
        ↓
3. When did it start?
        ↓
4. What changed?
        ↓
5. What logs/errors exist?
        ↓
6. Which dependency is involved?
        ↓
7. What is the bottleneck?
        ↓
8. What is the root cause?
        ↓
9. How do I mitigate it?
        ↓
10. How do I prevent it happening again?
```

For databases:

```text
Performance
 ↓
Queries
 ↓
Connections
 ↓
Locks
 ↓
Indexes
 ↓
Read/write pattern
 ↓
Capacity
```

For DynamoDB:

```text
Access pattern
 ↓
Partition key
 ↓
Sort key
 ↓
Index
 ↓
Capacity
 ↓
Partition distribution
```

For Redis:

```text
Cache hit/miss
 ↓
TTL
 ↓
Invalidation
 ↓
Memory
 ↓
Eviction
 ↓
Stampede
 ↓
Database protection
```

For S3:

```text
Object
 ↓
Access control
 ↓
Presigned URL
 ↓
Upload strategy
 ↓
Multipart
 ↓
Lifecycle
 ↓
Versioning
```

# THE MOST IMPORTANT INTERVIEW PRINCIPLE

> **Don't answer only with the AWS service name. Explain why you chose it, what problem it solves, what happens when it fails, and what trade-off it introduces.**

For example, don't say:

> "I'll use Redis."

Say:

> "I'd use Redis as a cache for frequently accessed data to reduce database load and latency. I'd use TTL and invalidate the relevant key when the source data changes. I'd also design a fallback for Redis failure so a cache outage doesn't automatically take down the API, while protecting the database from a cache-miss storm."

That is the difference between:

```text
"I know AWS services."
```

and:

```text
"I understand backend system design."
```
