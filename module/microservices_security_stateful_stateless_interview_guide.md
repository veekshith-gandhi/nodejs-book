# Microservices Security, Stateful vs Stateless Architecture

## From Zero --- Deep Reference + Interview Cross-Questions

> **Purpose:** This is a future-reference guide for understanding
> authentication, authorization, sessions, JWT, XSS, CSRF, CORS,
> service-to-service security, stateful/stateless architecture, Redis,
> scaling, and related microservice concepts from absolute zero.
>
> Examples use **Node.js + AWS + Redis + PostgreSQL + API Gateway + Load
> Balancer**, but the concepts apply to most microservice systems.

------------------------------------------------------------------------

# Table of Contents

1.  [Start Here: What Is a
    Microservice?](#1-start-here-what-is-a-microservice)
2.  [Why Security Becomes More Complicated in
    Microservices](#2-why-security-becomes-more-complicated-in-microservices)
3.  [What Is State?](#3-what-is-state)
4.  [Stateful Architecture](#4-stateful-architecture)
5.  [Stateless Architecture](#5-stateless-architecture)
6.  [Stateful vs Stateless --- Core
    Difference](#6-stateful-vs-stateless--core-difference)
7.  [Why Microservices Prefer Stateless Application
    Instances](#7-why-microservices-prefer-stateless-application-instances)
8.  [Where State Actually Lives](#8-where-state-actually-lives)
9.  [Sessions](#9-sessions)
10. [Session-Based Authentication in
    Microservices](#10-session-based-authentication-in-microservices)
11. [Redis and Shared Sessions](#11-redis-and-shared-sessions)
12. [Sticky Sessions](#12-sticky-sessions)
13. [JWT](#13-jwt)
14. [JWT Authentication in
    Microservices](#14-jwt-authentication-in-microservices)
15. [JWT Signing: Symmetric vs
    Asymmetric](#15-jwt-signing-symmetric-vs-asymmetric)
16. [Public/Private Keys in
    Microservices](#16-publicprivate-keys-in-microservices)
17. [JWT Revocation Problem](#17-jwt-revocation-problem)
18. [Access Tokens and Refresh
    Tokens](#18-access-tokens-and-refresh-tokens)
19. [Session vs JWT](#19-session-vs-jwt)
20. [Authentication vs
    Authorization](#20-authentication-vs-authorization)
21. [Authorization in Microservices](#21-authorization-in-microservices)
22. [User Authentication vs Service
    Authentication](#22-user-authentication-vs-service-authentication)
23. [Service-to-Service
    Authentication](#23-service-to-service-authentication)
24. [mTLS](#24-mtls)
25. [API Gateway](#25-api-gateway)
26. [Load Balancer](#26-load-balancer)
27. [Horizontal Scaling](#27-horizontal-scaling)
28. [Caching and Redis](#28-caching-and-redis)
29. [Rate Limiting](#29-rate-limiting)
30. [XSS in Microservice
    Applications](#30-xss-in-microservice-applications)
31. [CSRF in Microservice
    Applications](#31-csrf-in-microservice-applications)
32. [XSS vs CSRF](#32-xss-vs-csrf)
33. [CORS](#33-cors)
34. [SQL Injection](#34-sql-injection)
35. [Input Validation](#35-input-validation)
36. [HTTPS/TLS](#36-httpstls)
37. [Secrets Management](#37-secrets-management)
38. [Database Security](#38-database-security)
39. [Network Security](#39-network-security)
40. [Security Headers](#40-security-headers)
41. [Encryption at Rest](#41-encryption-at-rest)
42. [Least Privilege](#42-least-privilege)
43. [Logging and Monitoring](#43-logging-and-monitoring)
44. [DDoS](#44-ddos)
45. [SSRF](#45-ssrf)
46. [File Upload Security](#46-file-upload-security)
47. [Complete Microservices Authentication
    Flow](#47-complete-microservices-authentication-flow)
48. [Complete Request Flow](#48-complete-request-flow)
49. [Failure Scenarios](#49-failure-scenarios)
50. [Design Example: Instagram-Like
    Application](#50-design-example-instagram-like-application)
51. [Interview Cross-Questions](#51-interview-cross-questions)
52. [Advanced Interview
    Cross-Questions](#52-advanced-interview-cross-questions)
53. [30-Second Interview Summary](#53-30-second-interview-summary)
54. [Final Cheat Sheet](#54-final-cheat-sheet)

------------------------------------------------------------------------

# 1. Start Here: What Is a Microservice?

Imagine one large application.

A monolith might look like:

``` text
                 One Large Node.js Application
                          |
          +---------------+---------------+
          |               |               |
        Login           Orders         Payments
```

Everything is inside one application.

A microservice architecture splits business functionality into smaller
services.

``` text
                       API Gateway
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      Auth Service     User Service     Order Service
                                             |
                                             v
                                      Payment Service
```

Each service owns a specific business capability.

For example:

``` text
Auth Service
  -> login
  -> logout
  -> password
  -> token/session

User Service
  -> profile
  -> user preferences

Post Service
  -> create post
  -> update post
  -> comments

Order Service
  -> create order
  -> cancel order

Payment Service
  -> payment processing

Notification Service
  -> email
  -> push notification
```

## Why use microservices?

Common reasons include:

-   Independent deployment
-   Independent scaling
-   Team ownership
-   Fault isolation
-   Technology flexibility
-   Separating large business domains

But microservices also introduce complexity:

``` text
Network calls
Authentication between services
Authorization
Distributed transactions
Retries
Timeouts
Service discovery
Observability
Consistency
Security
```

------------------------------------------------------------------------

# 2. Why Security Becomes More Complicated in Microservices

In a monolith:

``` text
Browser
   |
   v
Node.js
   |
   v
Database
```

There may be one main application boundary.

In microservices:

``` text
Browser
   |
   v
API Gateway
   |
   +--> Auth Service
   |
   +--> User Service
   |
   +--> Order Service
   |       |
   |       v
   |   Payment Service
   |
   +--> Notification Service
```

Now security exists at multiple boundaries.

You need to ask:

``` text
Who is the user?
Who is the calling service?
Can this user access this resource?
Can this service call that service?
Can this request cross network boundaries?
Is the request valid?
Is the traffic malicious?
```

This leads to a defense-in-depth design.

------------------------------------------------------------------------

# 3. What Is State?

The simplest definition:

> **State is information that must be remembered.**

Example:

Alice logs in.

The system remembers:

``` text
Alice
  |
  v
logged in
  |
  v
session = ABC123
```

That is state.

Other examples:

``` text
Shopping cart
Current workflow step
Session
User preferences
Order status
Payment status
Job progress
```

## State can be different types

### Authentication state

``` text
session ABC123 -> user 101
```

### Business state

``` text
order 500 -> PAID
```

### Temporary state

``` text
OTP -> expires in 5 minutes
```

### Cache state

``` text
user:101 -> cached profile
```

------------------------------------------------------------------------

# 4. Stateful Architecture

A stateful service remembers something about previous requests.

Imagine Node.js stores sessions in memory:

``` javascript
const sessions = {};

sessions["ABC123"] = {
  userId: 101
};
```

Now:

``` text
Browser
   |
   | session=ABC123
   v
Node Server 1
   |
   v
Memory:
ABC123 -> User 101
```

Server 1 knows Alice.

But suppose the next request goes to Server 2:

``` text
Browser
   |
   v
Node Server 2
```

Server 2 has different memory:

``` text
{}
```

It doesn't know `ABC123`.

This is the fundamental problem with local state in a horizontally
scaled application.

------------------------------------------------------------------------

# 5. Stateless Architecture

A stateless service does not need state stored in that specific server
instance to process the next request.

Imagine a JWT:

``` text
Browser
   |
   | Authorization: Bearer <JWT>
   v
Node Server 1
```

Node 1 verifies the token.

Next request:

``` text
Browser
   |
   v
Node Server 3
```

Node 3 can also verify the same token.

The request does not depend on:

``` text
"User must return to Server 1."
```

That is why JWT-based authentication is commonly described as stateless.

------------------------------------------------------------------------

# 6. Stateful vs Stateless --- Core Difference

Remember this:

## Stateful

``` text
Client
  |
  | session ID
  v
Server
  |
  v
Session store
  |
  v
User state
```

The system remembers you server-side.

## Stateless

``` text
Client
  |
  | signed token
  v
Server
  |
  v
Verify token
  |
  v
User identity
```

The server can authenticate the request without looking up a server-side
session for every request.

## Easy mental model

### Stateful

> **"Server remembers me."**

### Stateless

> **"I carry proof of who I am."**

------------------------------------------------------------------------

# 7. Why Microservices Prefer Stateless Application Instances

Imagine 3 instances:

``` text
               Load Balancer
              /      |      \
             v       v       v
          Node 1   Node 2   Node 3
```

If services are stateless:

``` text
Request 1 -> Node 1
Request 2 -> Node 3
Request 3 -> Node 2
Request 4 -> Node 1
```

Any healthy instance can process the request.

This makes:

-   Horizontal scaling easier
-   Deployments easier
-   Auto scaling easier
-   Instance replacement easier
-   Load balancing easier

Suppose Node 2 crashes:

``` text
Node 2 ❌
```

The load balancer can send requests to:

``` text
Node 1
Node 3
```

without losing local authentication state.

------------------------------------------------------------------------

# 8. Where State Actually Lives

A stateless application does **not** mean the whole system has no state.

This is one of the most important concepts.

A common architecture is:

``` text
                Load Balancer
               /      |      \
              v       v       v
            Node1   Node2   Node3
              \       |       /
               \      |      /
                +-----+-----+
                      |
             +--------+--------+
             |                 |
             v                 v
           Redis           PostgreSQL
```

Node.js instances are designed to be stateless.

But the system still stores state in:

``` text
PostgreSQL -> permanent business data
Redis      -> cache/session/rate-limit data
S3         -> files
Kafka      -> event/message history
```

## Very important

``` text
Stateless service
       !=
Stateless entire system
```

------------------------------------------------------------------------

# 9. Sessions

A session is a way to remember an authenticated user's login state.

Example:

``` text
User logs in
    |
    v
Server creates session
    |
    v
session_id = ABC123
```

The browser stores:

``` text
session=ABC123
```

The server-side system stores:

``` text
ABC123 -> userId 101
```

Then future requests include:

``` text
Cookie: session=ABC123
```

The server finds the session and knows the user.

------------------------------------------------------------------------

# 10. Session-Based Authentication in Microservices

A common architecture:

``` text
                         Browser
                            |
                            | Cookie
                            v
                       API Gateway
                            |
                            v
                       Auth Service
                            |
                            v
                          Redis
```

Redis:

``` text
ABC123 -> {
  userId: 101,
  expiresAt: ...
}
```

Now Alice calls:

``` text
GET /profile
```

Request:

``` text
Cookie: session=ABC123
```

Possible flow:

``` text
Browser
  |
  v
API Gateway
  |
  v
User Service
  |
  v
Redis
  |
  v
ABC123 -> User 101
  |
  v
User Service
  |
  v
PostgreSQL
```

The service can identify Alice.

------------------------------------------------------------------------

# 11. Redis and Shared Sessions

If sessions are stored in local Node.js memory:

``` text
Node1 -> session
Node2 -> no session
Node3 -> no session
```

This doesn't work well with load balancing.

Instead:

``` text
Node1 \
Node2  ---> Redis
Node3 /
```

Redis contains:

``` text
session:ABC123 -> user 101
```

Now any service instance can access the session.

## Is this stateful?

Yes.

Even though Node.js doesn't store the session locally, the
authentication architecture depends on server-side session state.

Therefore:

``` text
Session + Redis = Stateful authentication
```

## Redis becomes an infrastructure dependency

If Redis is unavailable:

``` text
Application
    |
    v
Redis ❌
```

session-based authentication can be affected.

Therefore Redis needs:

-   High availability
-   Monitoring
-   Capacity planning
-   Appropriate expiration/TTL
-   Failure handling

------------------------------------------------------------------------

# 12. Sticky Sessions

Sticky sessions are also called session affinity.

Imagine:

``` text
               Load Balancer
                  /     \
                 v       v
              Node 1   Node 2
```

The load balancer keeps sending Alice to Node 1:

``` text
Alice -> Node1
Alice -> Node1
Alice -> Node1
```

This can allow local session state to work.

But there are disadvantages:

### Node failure

``` text
Node1 ❌
```

Local sessions may disappear.

### Uneven load

One node may receive more traffic.

### Scaling becomes less flexible

Traffic isn't distributed as freely.

For large systems, a shared external session store is often preferable
if sessions are required.

------------------------------------------------------------------------

# 13. JWT

JWT = JSON Web Token.

A JWT is a signed token containing claims.

Example conceptual payload:

``` json
{
  "sub": "101",
  "role": "user",
  "exp": 1790000000
}
```

The token is signed by the authentication/identity system.

After login:

``` text
Browser
   |
   | access token
   v
API Gateway
```

Future request:

``` http
Authorization: Bearer <JWT>
```

The service verifies the token.

------------------------------------------------------------------------

# 14. JWT Authentication in Microservices

Imagine:

``` text
                         Client
                           |
                           v
                      API Gateway
                           |
                           v
                      Auth Service
                           |
                           v
                          JWT
                           |
          +----------------+----------------+
          |                |                |
          v                v                v
      User Service    Order Service    Payment Service
```

Each service can verify the token.

Example:

``` text
JWT
 |
 +--> sub = 101
 +--> role = user
 +--> exp = future
```

Order Service:

``` text
Signature valid?     YES
Token expired?       NO
User = 101
       |
       v
Authorization check
```

------------------------------------------------------------------------

# 15. JWT Signing: Symmetric vs Asymmetric

There are two broad signing approaches.

## Symmetric signing

The same secret is used to sign and verify.

``` text
Auth Service
    |
    | shared secret
    v
   JWT
    |
    v
Order Service
    |
    | same secret
    v
 Verify
```

Problem:

Every verifier needs the shared secret.

If many services know the secret:

``` text
Service A
Service B
Service C
Service D
```

the secret has a larger blast radius.

## Asymmetric signing

Use:

``` text
Private key -> signing
Public key  -> verification
```

Architecture:

``` text
                    Auth Service
                         |
                  Private key 🔐
                         |
                       sign
                         |
                         v
                        JWT
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
    User Service    Order Service    Payment Service
        |                |                |
    Public key       Public key       Public key
```

Services can verify the JWT without possessing the private signing key.

------------------------------------------------------------------------

# 16. Public/Private Keys in Microservices

This connects directly to SSH.

## SSH

``` text
Private key -> kept secret
Public key  -> used for verification
```

## JWT asymmetric signing

``` text
Auth Service
   |
   | private key
   v
sign JWT
   |
   v
Other services
   |
   | public key
   v
verify JWT
```

The public key is not a secret.

The private signing key is extremely sensitive.

## Why asymmetric signing is attractive

If Order Service is compromised:

``` text
Attacker
   |
   v
Order Service
   |
   v
Public key
```

The attacker can verify tokens but cannot normally create a valid token
signature without the private key.

------------------------------------------------------------------------

# 17. JWT Revocation Problem

Suppose Alice receives:

``` text
JWT expires in 1 hour
```

At 10:00:

``` text
JWT issued
```

At 10:10:

``` text
Account compromised
```

You want to immediately invalidate the token.

In a purely stateless system, there may be no session record to simply
delete.

This is a major JWT design consideration.

Common strategies include:

``` text
Short-lived access tokens
+
Refresh tokens
+
Refresh-token rotation
+
Revocation/denylist mechanisms when needed
```

The exact strategy depends on the security requirements.

------------------------------------------------------------------------

# 18. Access Tokens and Refresh Tokens

A common pattern:

``` text
Access token
  -> short lifetime
```

and:

``` text
Refresh token
  -> longer lifetime
```

Example:

``` text
Access token: 15 minutes
Refresh token: longer lifetime
```

When the access token expires:

``` text
Client
  |
  | refresh token
  v
Auth Service
  |
  v
New access token
```

## Why?

If an access token is stolen:

``` text
Attacker
   |
   v
Stolen access token
```

its useful lifetime can be limited.

Refresh tokens require especially careful storage, rotation, replay
detection, and revocation design.

------------------------------------------------------------------------

# 19. Session vs JWT

  -----------------------------------------------------------------------
  Feature                 Session                 JWT
  ----------------------- ----------------------- -----------------------
  Server-side             Usually yes             Usually no
  authentication state                            

  Stateless auth          No                      Commonly yes

  Redis often used        Yes                     Not required for basic
                                                  verification

  Easy immediate          Yes                     Harder
  revocation                                      

  Any instance can verify With shared session     Yes
                          store                   

  Token contains claims   Usually no              Yes

  Token can be large      Usually small cookie ID Potentially larger

  Scaling                 Requires shared session Often simpler
                          strategy                

  Logout                  Delete/invalidate       Usually
                          session                 revoke/expire/rotate
                                                  strategy

  Complexity              Session infrastructure  Token lifecycle
  -----------------------------------------------------------------------

## Important interview point

Do not say:

> "JWT is always better."

Instead:

> "The choice depends on requirements. Sessions provide centralized
> server-side control and easy revocation, while JWTs can simplify
> distributed stateless request authentication."

------------------------------------------------------------------------

# 20. Authentication vs Authorization

These are different.

## Authentication

> Who are you?

``` text
Login
  |
  v
Authentication
  |
  v
Alice
```

## Authorization

> What are you allowed to do?

``` text
Alice
  |
  +--> View own profile       YES
  +--> Edit own profile       YES
  +--> Delete another user    NO
  +--> Admin dashboard        NO
```

Memory:

``` text
Authentication = WHO?
Authorization  = WHAT CAN YOU DO?
```

------------------------------------------------------------------------

# 21. Authorization in Microservices

Suppose Alice sends:

``` text
DELETE /orders/500
```

Order Service should not simply trust:

``` json
{
  "userId": 101
}
```

from the request body.

Instead, it should establish identity from trusted authentication
information and then check authorization.

Conceptual flow:

``` text
Request
  |
  v
Verify authentication
  |
  v
User = 101
  |
  v
Find order 500
  |
  v
Does order belong to user 101?
  |
 +---+---+
 |       |
 YES     NO
 |       |
 v       v
Allow   403
```

Authorization can use:

-   Roles
-   Permissions
-   Resource ownership
-   Scopes
-   Policy engines
-   Attribute-based rules

------------------------------------------------------------------------

# 22. User Authentication vs Service Authentication

There are two identities in a microservice system.

## User identity

``` text
Alice
  |
  | user access token
  v
Order Service
```

Question:

``` text
Who is Alice?
```

## Service identity

``` text
Order Service
      |
      | service credential
      v
Payment Service
```

Question:

``` text
Is this really Order Service?
```

A mature architecture may need both.

------------------------------------------------------------------------

# 23. Service-to-Service Authentication

Microservices communicate:

``` text
Order Service
      |
      | "Process payment"
      v
Payment Service
```

Payment Service should not blindly trust any caller.

It can require:

``` text
OAuth 2.0 access token
mTLS
Cloud IAM/service identity
Signed service credentials
API keys for suitable use cases
```

Conceptual:

``` text
Order Service
     |
     | service token
     v
Payment Service
     |
     v
Verify service identity
     |
     v
Authorize operation
```

------------------------------------------------------------------------

# 24. mTLS

mTLS = mutual TLS.

Normal TLS:

``` text
Client
  |
  | verifies server
  v
Server
```

mTLS:

``` text
Client <-----> Server
  |               |
  | certificates  |
  +---------------+
```

Both sides authenticate using certificates.

This can be useful for service-to-service communication.

Conceptually:

``` text
Order Service
    |
    | client certificate
    v
Payment Service
    |
    | verifies certificate
    v
Trusted service
```

mTLS provides transport encryption and strong service identity.

------------------------------------------------------------------------

# 25. API Gateway

The API Gateway is a common entry point for client requests.

``` text
                    Internet
                       |
                       v
                  API Gateway
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
      User           Order         Payment
    Service         Service        Service
```

Possible gateway responsibilities:

-   Routing
-   TLS termination
-   Authentication checks
-   Rate limiting
-   Request size limits
-   CORS policy
-   Observability
-   API versioning
-   Sometimes authorization/policy enforcement

## Important

Do not put every business rule into the gateway.

Business authorization often still belongs in the relevant service.

------------------------------------------------------------------------

# 26. Load Balancer

A load balancer distributes traffic across healthy instances.

``` text
                 Load Balancer
                /      |      \
               v       v       v
            Node1    Node2    Node3
```

If Node 2 fails:

``` text
Node1 -> traffic
Node2 -> unhealthy
Node3 -> traffic
```

The load balancer can use health checks.

Example:

``` text
GET /health
```

If a target fails health checks, it can be removed from normal traffic
routing.

------------------------------------------------------------------------

# 27. Horizontal Scaling

Vertical scaling:

``` text
Small server
     |
     v
Bigger server
```

Horizontal scaling:

``` text
One server
     |
     v
Multiple servers
```

Example:

``` text
             Load Balancer
            /      |      \
           v       v       v
         Node1   Node2   Node3
```

Traffic increases:

``` text
Node1 Node2 Node3
       |
       v
Auto Scaling
       |
       v
Node4 Node5 ...
```

Stateless services make this easier because requests can move between
instances.

------------------------------------------------------------------------

# 28. Caching and Redis

Redis is an in-memory data store commonly used for:

-   Caching
-   Sessions
-   Rate limiting
-   Distributed locks
-   Temporary data
-   Some queues/work coordination patterns

Example cache:

``` text
Node.js
   |
   | GET user 101
   v
Redis
   |
   +--> found -> return quickly
   |
   +--> miss
          |
          v
      PostgreSQL
```

## Cache-aside pattern

``` text
Request
  |
  v
Check Redis
  |
 +---+---+
 |       |
hit     miss
 |       |
 v       v
return  DB
          |
          v
        Redis
          |
          v
        return
```

## Important

Redis is not automatically a replacement for PostgreSQL.

They solve different problems.

------------------------------------------------------------------------

# 29. Rate Limiting

Suppose attacker sends:

``` text
POST /login
POST /login
POST /login
...
```

Rate limiting controls request frequency.

Example:

``` text
5 failed login attempts
       |
       v
temporary block/challenge
```

Redis is commonly used for distributed counters:

``` text
login:attempts:account:101 = 5
```

or other carefully designed keys.

For large systems, rate limiting can be implemented at multiple layers:

``` text
Edge/WAF
   |
   v
API Gateway
   |
   v
Application
   |
   v
Redis
```

## Important

Do not rate-limit only by IP blindly.

Many users can share one IP, while attackers can rotate IPs.

Use appropriate signals:

``` text
IP
Account
Endpoint
Device/session
Request frequency
Risk signals
```

------------------------------------------------------------------------

# 30. XSS in Microservice Applications

XSS = Cross-Site Scripting.

Simple meaning:

> An attacker gets malicious JavaScript to execute in another user's
> browser in the context of your application.

Architecture:

``` text
Attacker
   |
   | malicious input
   v
Backend
   |
   v
Database
   |
   v
Frontend
   |
   v
Victim browser
   |
   v
Malicious script executes
```

## Example

Comment field:

``` text
Hello!
```

Normal.

Attacker submits malicious HTML/JavaScript.

If the application renders it as raw HTML:

``` text
Stored content
    |
    v
HTML page
    |
    v
Browser executes script
```

## XSS types

### Stored XSS

Malicious content is stored:

``` text
Attacker -> DB -> Victim
```

### Reflected XSS

Attacker input is reflected in a response:

``` text
Attacker input -> Request -> Response -> Browser
```

### DOM-based XSS

Client-side JavaScript creates the vulnerability.

Dangerous conceptual example:

``` javascript
element.innerHTML = userInput;
```

Safer when HTML isn't needed:

``` javascript
element.textContent = userInput;
```

## XSS defenses

``` text
Output encoding
+
Safe framework rendering
+
HTML sanitization when rich HTML is required
+
CSP
+
HttpOnly cookies
```

### HttpOnly

If authentication uses an HttpOnly cookie:

``` text
JavaScript
    |
    | document.cookie
    v
Authentication cookie
    |
    v
Not directly accessible
```

But:

> HttpOnly does NOT prevent XSS.

It mainly reduces direct cookie theft through JavaScript.

------------------------------------------------------------------------

# 31. CSRF in Microservice Applications

CSRF = Cross-Site Request Forgery.

Simple meaning:

> An attacker tricks a victim's browser into making an unwanted request
> to a site where the victim is already authenticated.

Example:

``` text
Victim logged into bank.com
        |
        v
session cookie = ABC123
```

Victim visits:

``` text
evil.com
```

Attacker tries to cause a request to:

``` text
bank.com
```

If the browser sends the bank cookie and the application lacks adequate
CSRF protection:

``` text
evil.com
    |
    v
Victim browser
    |
    | authenticated request
    v
bank.com
```

The server may interpret the request as authenticated.

## CSRF token

Server provides:

``` text
CSRF token = XYZ789
```

Sensitive request must contain:

``` text
Cookie: session=ABC123
CSRF-Token: XYZ789
```

Server checks both.

Attacker's request:

``` text
Session may be present
CSRF token missing/invalid
        |
        v
       403
```

## SameSite cookies

Appropriate SameSite settings can prevent/reduce many cross-site cookie
scenarios.

## CSRF and JWT

If a bearer access token is explicitly placed into:

``` http
Authorization: Bearer <token>
```

by application code, classic cookie-based CSRF is generally less
applicable because another website cannot simply cause the browser to
attach that custom Authorization header.

But XSS/token-storage risks still matter.

------------------------------------------------------------------------

# 32. XSS vs CSRF

  ---------------------------------------------------------------------------
                          XSS                         CSRF
  ----------------------- --------------------------- -----------------------
  Full name               Cross-Site Scripting        Cross-Site Request
                                                      Forgery

  Main idea               Execute malicious script    Trick browser into
                                                      making authenticated
                                                      request

  Attacker code executes  Typically yes               Not necessarily
  in target origin?                                   

  Main target             Browser/page                Authenticated action

  Cookie authentication   Yes                         Especially
  relevant?                                           

  Main defense            Encoding/sanitization/CSP   SameSite/CSRF tokens

  HttpOnly helps          Cookie protection           Not primary defense

  HTTPS alone fixes       No                          No
  ---------------------------------------------------------------------------

Memory:

``` text
XSS:
"Run my malicious code in your website."

CSRF:
"Make your browser perform an action for me."
```

------------------------------------------------------------------------

# 33. CORS

CORS = Cross-Origin Resource Sharing.

It is primarily a browser security mechanism.

Suppose:

``` text
Frontend:
https://app.example.com

API:
https://api.example.com
```

Browser JavaScript wants to call the API.

The API can specify allowed origins.

Conceptual response:

``` http
Access-Control-Allow-Origin: https://app.example.com
```

## CORS is NOT authentication

Wrong:

``` text
CORS = API authentication
```

Correct:

``` text
CORS = browser cross-origin access control
```

A non-browser client is not constrained by browser CORS rules in the
same way.

------------------------------------------------------------------------

# 34. SQL Injection

Bad:

``` javascript
const query =
  "SELECT * FROM users WHERE email = '" +
  email +
  "'";
```

The problem is mixing:

``` text
SQL instructions
+
user-controlled data
```

Use parameterized queries:

``` javascript
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

Now the database understands the supplied value as data.

## Defense

``` text
Input validation
+
Parameterized queries
+
Least-privilege DB account
```

ORMs can help, but unsafe raw SQL can still be vulnerable.

------------------------------------------------------------------------

# 35. Input Validation

Never trust incoming data.

Example API expects:

``` json
{
  "age": 29,
  "email": "alice@example.com"
}
```

Attacker might send:

``` json
{
  "age": {},
  "email": [],
  "unexpected": "data"
}
```

Validate with a schema.

``` text
Request
   |
   v
Schema validation
   |
 +---+---+
 |       |
valid   invalid
 |       |
 v       v
continue 400
```

Validation should check:

-   Type
-   Format
-   Length
-   Range
-   Required fields
-   Allowed values
-   Business constraints where appropriate

Validation is not a substitute for parameterized SQL or output encoding.

------------------------------------------------------------------------

# 36. HTTPS/TLS

HTTPS protects data in transit.

``` text
Browser
   |
   | encrypted TLS connection
   v
Server
```

TLS provides:

-   Confidentiality
-   Integrity
-   Server authentication through certificates

Typical AWS architecture:

``` text
Browser
   |
   | HTTPS
   v
Load Balancer / Edge
   |
   v
Node.js
```

## HTTPS does not solve

``` text
XSS
CSRF
SQL Injection
Weak passwords
Broken authorization
```

It protects the communication channel, not application logic.

------------------------------------------------------------------------

# 37. Secrets Management

Applications need secrets:

``` text
Database password
API keys
Signing keys
Third-party credentials
```

Bad:

``` javascript
const password = "MyRealPassword";
```

Never commit production secrets to Git.

Better:

``` text
AWS Secrets Manager
        |
        v
Node.js service
```

## Secret vs password hash

User password:

``` text
Hash it
```

Database credential:

``` text
Store securely as a secret
```

Why?

The application needs to retrieve its database credential to connect.

A user's password does not need to be retrievable; it is verified
against a password hash.

------------------------------------------------------------------------

# 38. Database Security

Bad:

``` text
Internet
   |
   v
PostgreSQL
```

Better:

``` text
Internet
   |
   v
Load Balancer
   |
   v
Backend
   |
   v
Private PostgreSQL
```

Database should normally not be directly accessible from the public
internet.

Use:

-   Private subnets
-   Security groups/firewalls
-   Least-privilege DB users
-   Encryption
-   Backups
-   Monitoring

------------------------------------------------------------------------

# 39. Network Security

A simplified AWS VPC:

``` text
                         VPC
                          |
            +-------------+-------------+
            |                           |
       Public subnet              Private subnet
            |                           |
            v                           v
      Load Balancer                  Node.js
                                        |
                                        v
                                    PostgreSQL
```

Security groups can restrict communication.

Example:

``` text
Internet
   |
   | HTTPS :443
   v
ALB

ALB
   |
   | app port
   v
Node.js

Node.js
   |
   | PostgreSQL port
   v
Database
```

The database should not accept traffic directly from the internet.

------------------------------------------------------------------------

# 40. Security Headers

Useful browser security headers include:

``` text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

## HSTS

Tells supporting browsers to prefer HTTPS for the domain for a
configured period.

## CSP

Restricts where scripts/resources can come from.

CSP can significantly reduce the impact of some XSS attacks.

## nosniff

``` http
X-Content-Type-Options: nosniff
```

Helps prevent MIME-type sniffing.

------------------------------------------------------------------------

# 41. Encryption at Rest

Two different situations:

## In transit

``` text
Browser
   |
   | HTTPS/TLS
   v
Server
```

## At rest

``` text
Database
   |
   v
Encrypted storage
```

Encryption at rest protects stored data if storage media is accessed
improperly.

But it does not replace authorization.

If an attacker has valid application/database credentials, the
application may still be able to read the data.

------------------------------------------------------------------------

# 42. Least Privilege

Give every component only the permissions it needs.

Bad:

``` text
Node.js
   |
   v
DB ADMIN
```

Better:

``` text
Node.js
   |
   v
Application DB user
   |
   +--> SELECT
   +--> INSERT
   +--> UPDATE
```

Likewise for AWS IAM.

Bad:

``` text
Node.js
   |
   v
Full AWS account permissions
```

Better:

``` text
Node.js IAM role
   |
   +--> S3 access to required bucket
   +--> Secrets Manager access to required secrets
```

------------------------------------------------------------------------

# 43. Logging and Monitoring

Security requires detection as well as prevention.

Example:

``` text
Login failed
Login failed
Login failed
Login failed
Login failed
...
```

Monitoring may detect:

``` text
1000 failed attempts/minute
       |
       v
Suspicious activity
```

Possible responses:

``` text
Alert
Rate limit
Challenge
Block
Investigate
```

Useful observability components:

``` text
Logs
Metrics
Traces
Alerts
```

AWS commonly provides:

``` text
CloudWatch
CloudTrail
```

for different monitoring/auditing needs.

Never log:

``` text
Passwords
Private keys
API secrets
Session tokens
```

------------------------------------------------------------------------

# 44. DDoS

DDoS = Distributed Denial of Service.

Attacker sends a huge amount of traffic from many sources.

``` text
Many sources
  \  |  |  /
   \ |  | /
    \|  |/
     Internet
        |
        v
   Application
```

Protection may involve:

``` text
CDN / Edge
   |
   v
DDoS protection
   |
   v
WAF
   |
   v
Load Balancer
   |
   v
Backend
```

AWS Shield provides DDoS protection capabilities.

## Rate limiting vs DDoS protection

``` text
Rate limiting:
Controls abusive request rates.

DDoS protection:
Protects availability against large-scale attacks.
```

They complement each other.

------------------------------------------------------------------------

# 45. SSRF

SSRF = Server-Side Request Forgery.

Suppose your API lets the server fetch a URL:

``` text
POST /fetch

{
  "url": "https://example.com/image.jpg"
}
```

Node.js:

``` text
fetch(url)
```

Now attacker supplies a URL pointing to something internal.

``` text
Attacker
   |
   v
Your API
   |
   v
Internal service
```

The attacker is abusing the server's network access.

## Defenses

-   Allowlist destinations where possible
-   Validate URL schemes
-   Restrict outbound network access
-   Block private/internal destinations where appropriate
-   Validate redirects
-   Use cloud metadata-service protections
-   Avoid unnecessary server-side fetching

SSRF is particularly important in cloud environments.

------------------------------------------------------------------------

# 46. File Upload Security

Suppose:

``` text
POST /profile-picture
```

Do not trust:

``` text
filename.jpg
```

just because it ends with `.jpg`.

A safer pipeline:

``` text
Upload
  |
  v
Authentication
  |
  v
Size limit
  |
  v
Content/type validation
  |
  v
Malware scanning where appropriate
  |
  v
Safe object storage
  |
  v
Controlled serving
```

Consider:

-   File size limits
-   Allowed content types
-   Generated filenames
-   Content validation
-   Malware scanning
-   Private storage
-   Signed URLs
-   Access control
-   Avoiding executable upload paths

------------------------------------------------------------------------

# 47. Complete Microservices Authentication Flow

Let's use a JWT architecture.

``` text
                         Browser
                            |
                            | HTTPS
                            v
                     CDN / Edge / WAF
                            |
                            v
                     API Gateway
                            |
                            v
                       Auth Service
                            |
                            v
                       PostgreSQL
                            |
                    Password hash verify
                            |
                            v
                       JWT issued
                            |
                            v
                         Browser
```

Now Alice requests her profile:

``` text
Browser
   |
   | Authorization: Bearer JWT
   v
API Gateway
   |
   v
User Service
   |
   | verify JWT
   v
Authorization
   |
   v
PostgreSQL
   |
   v
Profile
```

------------------------------------------------------------------------

# 48. Complete Request Flow

Suppose Alice creates an order.

``` http
POST /orders
Authorization: Bearer <JWT>
```

## Step 1 --- HTTPS

``` text
Browser
   |
   | TLS
   v
Infrastructure
```

## Step 2 --- Edge/WAF

``` text
Request
   |
   v
WAF
   |
   +--> suspicious -> block
   |
   +--> normal -> continue
```

## Step 3 --- API Gateway

Gateway routes:

``` text
POST /orders
   |
   v
Order Service
```

## Step 4 --- Authentication

Order Service or trusted gateway/auth layer validates the token.

``` text
JWT
 |
 +--> signature valid?
 +--> expired?
 +--> issuer correct?
 +--> audience correct?
```

## Step 5 --- Authorization

``` text
User = 101
   |
   v
Can User 101 create an order?
   |
   v
YES
```

## Step 6 --- Validation

``` text
Product ID valid?
Quantity valid?
Currency valid?
```

## Step 7 --- Business logic

``` text
Order Service
    |
    v
PostgreSQL
```

## Step 8 --- Service-to-service call

``` text
Order Service
    |
    | authenticated service request
    v
Payment Service
```

## Step 9 --- Event

After successful payment:

``` text
Payment Service
    |
    v
Kafka
    |
    +--> Notification Service
    |
    +--> Analytics Service
```

This separates synchronous business operations from asynchronous
downstream processing.

------------------------------------------------------------------------

# 49. Failure Scenarios

Interviewers frequently ask:

> "What happens if X fails?"

## Redis fails

If Redis stores sessions:

``` text
Node.js
   |
   X
 Redis
```

Authentication/session operations may fail.

Mitigations:

-   Redis high availability
-   Failover
-   Monitoring
-   Sensible TTLs
-   Graceful degradation where safe

If Redis is only a cache, you may be able to fall back to PostgreSQL.

If Redis is the source of session state, fallback depends on your
architecture.

------------------------------------------------------------------------

## One Node.js instance fails

With stateless instances:

``` text
Node1 ❌
Node2
Node3
```

Load balancer sends traffic to healthy nodes.

Usually minimal impact.

------------------------------------------------------------------------

## Database fails

``` text
Node.js
   |
   X
Database
```

Business operations requiring the DB may fail.

Mitigations:

-   Multi-AZ database
-   Failover
-   Backups
-   Read replicas where appropriate
-   Connection pooling
-   Timeouts
-   Retries with care

------------------------------------------------------------------------

## Auth Service fails

Existing stateless access tokens may still be verifiable by services if
verification does not require contacting Auth Service for every request.

New logins/token refreshes may fail.

This is one benefit of locally verifiable signed access tokens.

------------------------------------------------------------------------

## JWT signing key compromise

This is severe.

If the private signing key is compromised:

``` text
Attacker
   |
   v
Private signing key
   |
   v
Can potentially create valid-looking tokens
```

Mitigations:

-   Protect signing keys
-   Key rotation
-   Short-lived tokens
-   Key IDs (`kid`)
-   Key versioning
-   Secure key storage
-   Incident response/revocation strategy

------------------------------------------------------------------------

# 50. Design Example: Instagram-Like Application

Let's design a simplified system.

``` text
                         Users
                           |
                           v
                       Internet
                           |
                           v
                    CDN / Edge / WAF
                           |
                           v
                     API Gateway
                           |
       +-------------------+-------------------+
       |                   |                   |
       v                   v                   v
   Auth Service       User Service         Post Service
       |                   |                   |
       v                   v                   v
   PostgreSQL          PostgreSQL          PostgreSQL
       |
       v
     Redis

Post Service
     |
     v
   Kafka
     |
     +---------> Notification Service
     |
     +---------> Analytics Service
```

## Authentication

Use:

``` text
Access token
```

## Token signing

Use:

``` text
Asymmetric signing
Private key -> Auth Service
Public key  -> services
```

## Application instances

Make them:

``` text
Stateless
```

## Shared state

Use:

``` text
PostgreSQL
Redis
Kafka
S3
```

as appropriate.

------------------------------------------------------------------------

# 51. Interview Cross-Questions

## Q1. What is state?

**Answer:**

> State is information that must be remembered between requests or
> operations, such as a login session, shopping cart, workflow state, or
> order status.

------------------------------------------------------------------------

## Q2. What is a stateless service?

**Answer:**

> A stateless service does not depend on state stored in a particular
> application instance to process the next request. Any healthy instance
> can generally handle the request.

------------------------------------------------------------------------

## Q3. Does stateless mean there is no database?

**Answer:**

> No. A service can be stateless while using PostgreSQL, Redis, S3, or
> other external systems. Stateless refers to state maintained by the
> application instance, not the absence of persistent data in the
> system.

------------------------------------------------------------------------

## Q4. Is Redis stateful?

**Answer:**

> Redis is a stateful data store because it stores data. But a Node.js
> service can remain stateless by using Redis as an external shared
> store.

------------------------------------------------------------------------

## Q5. Why are stateless services good for microservices?

**Answer:**

> They make horizontal scaling, load balancing, deployments, and
> instance replacement easier because requests don't depend on state
> stored in one particular instance.

------------------------------------------------------------------------

## Q6. Why do sessions make authentication stateful?

**Answer:**

> Because the server-side system stores a mapping such as
> `sessionId -> userId`, so the server needs access to that stored state
> to authenticate the session.

------------------------------------------------------------------------

## Q7. If sessions are stored in Redis, is the Node.js service stateless?

**Answer:**

> The Node.js process may be stateless locally, but the authentication
> architecture is still stateful because it depends on server-side
> session state stored in Redis.

------------------------------------------------------------------------

## Q8. Why use Redis for sessions?

**Answer:**

> Redis provides a fast shared store that all application instances can
> access, allowing any instance behind a load balancer to resolve the
> same session.

------------------------------------------------------------------------

## Q9. Why not store sessions in Node.js memory?

**Answer:**

> Because each instance has separate memory. Requests can reach
> different instances, and restarting or replacing an instance can lose
> local sessions.

------------------------------------------------------------------------

## Q10. What are sticky sessions?

**Answer:**

> Sticky sessions keep a user's requests routed to the same application
> instance. They can support local sessions, but they reduce flexibility
> and can cause session loss if that instance fails.

------------------------------------------------------------------------

## Q11. Why is JWT considered stateless?

**Answer:**

> A service can validate the signed token locally and derive the user's
> identity and claims without looking up a server-side session for every
> request.

------------------------------------------------------------------------

## Q12. Is JWT always stateless?

**Answer:**

> JWT itself is a token format. A system can still maintain server-side
> state for revocation, refresh tokens, risk checks, or other purposes.
> So "JWT-based authentication" is commonly stateless for access-token
> verification, but the entire system does not have to be stateless.

------------------------------------------------------------------------

## Q13. Why is JWT useful in microservices?

**Answer:**

> Multiple services can independently validate a signed access token,
> which avoids a centralized session lookup on every request and makes
> distributed request handling easier.

------------------------------------------------------------------------

## Q14. What is the JWT revocation problem?

**Answer:**

> If a valid access token is issued for a period of time, a purely
> stateless verifier does not automatically have a central session
> record to delete when the account should be immediately invalidated.
> Short-lived tokens, refresh-token rotation, and explicit revocation
> mechanisms can address this depending on requirements.

------------------------------------------------------------------------

## Q15. Why use refresh tokens?

**Answer:**

> They allow short-lived access tokens while providing a controlled
> mechanism for obtaining new access tokens without repeatedly asking
> the user for credentials.

------------------------------------------------------------------------

## Q16. What is the difference between access and refresh tokens?

**Answer:**

> Access tokens are presented to APIs and are usually short-lived.
> Refresh tokens are used with the identity system to obtain new access
> tokens and require stronger lifecycle and storage controls.

------------------------------------------------------------------------

## Q17. Symmetric vs asymmetric JWT signing?

**Answer:**

> Symmetric signing uses the same secret to sign and verify. Asymmetric
> signing uses a private key to sign and a public key to verify.
> Asymmetric signing can reduce the need to distribute a signing secret
> to every microservice.

------------------------------------------------------------------------

## Q18. Why is a private key more sensitive than a public key?

**Answer:**

> The private key can create signatures. The public key is designed to
> verify signatures and can normally be distributed.

------------------------------------------------------------------------

## Q19. Can an attacker create a JWT if they have the public key?

**Answer:**

> Not normally, if the cryptographic algorithm and implementation are
> correct. The public key is used for verification; the private signing
> key is required to produce valid signatures.

------------------------------------------------------------------------

## Q20. Authentication vs authorization?

**Answer:**

> Authentication determines who the caller is. Authorization determines
> what that caller is allowed to do.

------------------------------------------------------------------------

## Q21. Why is authorization needed if the JWT is valid?

**Answer:**

> A valid token proves identity or token validity, but it doesn't
> automatically mean the user is allowed to access every resource. The
> service still needs authorization checks.

------------------------------------------------------------------------

## Q22. Where should authorization happen?

**Answer:**

> Some coarse-grained policy can be enforced at the gateway, but the
> business service should enforce authorization close to the resource
> and business operation because it understands ownership and business
> rules.

------------------------------------------------------------------------

## Q23. How do microservices authenticate each other?

**Answer:**

> Common approaches include mTLS, OAuth 2.0 service access tokens, cloud
> IAM/service identities, and other service credentials depending on the
> environment.

------------------------------------------------------------------------

## Q24. User authentication vs service authentication?

**Answer:**

> User authentication proves the identity of the human/client. Service
> authentication proves that a request really came from a trusted
> service such as Order Service.

------------------------------------------------------------------------

## Q25. What is mTLS?

**Answer:**

> Mutual TLS authenticates both sides of a TLS connection using
> certificates, providing encrypted transport plus service identity.

------------------------------------------------------------------------

## Q26. What happens if one Node.js instance dies?

**Answer:**

> In a stateless architecture, the load balancer can route requests to
> other healthy instances. Because important request state isn't stored
> only in the failed instance, the application can continue serving
> traffic.

------------------------------------------------------------------------

## Q27. Why are sticky sessions not ideal at large scale?

**Answer:**

> They create instance affinity, which can reduce load-distribution
> flexibility and cause problems when the assigned instance fails.
> Shared external state is usually more resilient when sessions are
> required.

------------------------------------------------------------------------

## Q28. What is horizontal scaling?

**Answer:**

> Adding more application instances to handle more traffic.

------------------------------------------------------------------------

## Q29. Horizontal vs vertical scaling?

**Answer:**

``` text
Vertical -> bigger machine
Horizontal -> more machines
```

------------------------------------------------------------------------

## Q30. What is XSS?

**Answer:**

> XSS occurs when attacker-controlled content causes malicious
> JavaScript to execute in another user's browser in the context of the
> application.

------------------------------------------------------------------------

## Q31. How do you prevent XSS?

**Answer:**

> Use context-appropriate output encoding, safe framework rendering,
> sanitize HTML when HTML is required, use CSP, and protect
> authentication cookies with HttpOnly where appropriate.

------------------------------------------------------------------------

## Q32. Does HttpOnly prevent XSS?

**Answer:**

> No. HttpOnly prevents JavaScript from directly reading that cookie. An
> XSS vulnerability can still be dangerous because injected JavaScript
> may perform actions within the victim's authenticated session.

------------------------------------------------------------------------

## Q33. What is CSRF?

**Answer:**

> CSRF tricks an authenticated user's browser into making an unwanted
> request to the target application, particularly relevant to
> cookie-based authentication.

------------------------------------------------------------------------

## Q34. How do you prevent CSRF?

**Answer:**

> Use appropriate SameSite cookie settings and CSRF tokens for
> state-changing cookie-authenticated requests. Origin/Referer
> validation can also be useful.

------------------------------------------------------------------------

## Q35. XSS vs CSRF?

**Answer:**

> XSS executes attacker-controlled code in the target application's
> browser context. CSRF tricks the browser into making an authenticated
> request to the target application.

------------------------------------------------------------------------

## Q36. What is CORS?

**Answer:**

> CORS is a browser mechanism that controls which origins can access
> resources across origins. It is not an authentication mechanism.

------------------------------------------------------------------------

## Q37. Does CORS protect an API from Postman?

**Answer:**

> CORS is a browser enforcement mechanism. Tools such as Postman are not
> constrained by browser CORS rules in the same way, so APIs still need
> real authentication and authorization.

------------------------------------------------------------------------

## Q38. What is SQL injection?

**Answer:**

> SQL injection occurs when untrusted input changes the intended SQL
> command. Parameterized queries separate SQL instructions from data and
> are a primary defense.

------------------------------------------------------------------------

## Q39. Why validate input if you already use parameterized queries?

**Answer:**

> They solve different problems. Parameterized queries protect SQL
> interpretation, while validation ensures the data has the expected
> type, shape, range, and business constraints.

------------------------------------------------------------------------

## Q40. Why rate-limit login?

**Answer:**

> To reduce brute-force, credential-stuffing, and abusive login attempts
> and protect application resources.

------------------------------------------------------------------------

## Q41. Why use Redis for rate limiting?

**Answer:**

> In a multi-instance system, Redis provides shared counters so all
> application instances can enforce a consistent distributed limit.

------------------------------------------------------------------------

## Q42. What is WAF?

**Answer:**

> A Web Application Firewall filters HTTP requests and can block known
> malicious patterns, abusive traffic, and other unwanted requests
> according to configured rules.

------------------------------------------------------------------------

## Q43. Does WAF replace application security?

**Answer:**

> No. WAF is one defense layer. Secure coding, authentication,
> authorization, validation, parameterized queries, and proper
> infrastructure security are still required.

------------------------------------------------------------------------

## Q44. What is DDoS?

**Answer:**

> A distributed denial-of-service attack attempts to overwhelm a
> service's availability with traffic or requests from many sources.

------------------------------------------------------------------------

## Q45. Rate limiting vs DDoS protection?

**Answer:**

> Rate limiting controls request rates at application or edge layers,
> while DDoS protection focuses on defending availability against
> large-scale distributed attacks. They complement each other.

------------------------------------------------------------------------

## Q46. Why put the database in a private subnet?

**Answer:**

> To reduce direct exposure to the public internet and restrict database
> access to trusted application/network paths.

------------------------------------------------------------------------

## Q47. What is least privilege?

**Answer:**

> Give each user, service, or workload only the permissions it needs and
> nothing more.

------------------------------------------------------------------------

## Q48. Where should secrets be stored?

**Answer:**

> In a dedicated secret-management system or appropriately secured
> secret configuration, not in source code or Git repositories.

------------------------------------------------------------------------

## Q49. What happens if Redis goes down?

**Answer:**

> It depends on what Redis stores. If it is only a cache, the
> application may fall back to the database. If it stores authentication
> sessions or other critical state, those capabilities may fail unless
> the architecture provides high availability or a safe fallback.

------------------------------------------------------------------------

## Q50. What happens if Auth Service goes down in a JWT architecture?

**Answer:**

> Existing access tokens may continue to be locally verified by services
> if they don't require Auth Service for each request. New logins and
> token refresh operations may fail.

------------------------------------------------------------------------

# 52. Advanced Interview Cross-Questions

## Q51. Why not use JWT everywhere?

Because JWT introduces:

-   Revocation complexity
-   Token theft risk
-   Token size
-   Key management
-   Refresh-token complexity
-   Potentially stale authorization claims

Use it when its benefits fit the architecture.

------------------------------------------------------------------------

## Q52. If JWT is stateless, why do we need Redis?

Possible reasons:

``` text
Caching
Rate limiting
Refresh-token state
Session-based auth
Distributed locks
Temporary data
```

JWT doesn't eliminate the need for all state.

------------------------------------------------------------------------

## Q53. Can a JWT contain roles?

Yes.

Example:

``` json
{
  "sub": "101",
  "role": "admin"
}
```

But role information can become stale.

If authorization changes immediately, you may need additional
server-side checks or short token lifetimes/revocation strategies.

------------------------------------------------------------------------

## Q54. Should every microservice verify JWT independently?

It can.

Common patterns include:

``` text
Gateway verifies
+
Services verify important security boundaries
```

or:

``` text
Each service verifies
```

The exact architecture depends on trust boundaries.

Do not blindly assume that gateway authentication means every downstream
service can trust every request forever.

------------------------------------------------------------------------

## Q55. Why not let every microservice call Auth Service for every request?

You can, but it introduces:

``` text
Every request
   |
   v
Auth Service
```

This creates:

-   Latency
-   Extra network calls
-   A central dependency
-   Potential bottleneck
-   Failure coupling

Locally verifiable signed access tokens can reduce this dependency.

------------------------------------------------------------------------

## Q56. What is the downside of gateway-only authentication?

If a downstream service can be reached through another path, or if
internal trust boundaries are weak, a service may accidentally accept
unauthenticated or incorrectly authenticated requests.

Important services should enforce their own security boundaries as
appropriate.

------------------------------------------------------------------------

## Q57. What if the JWT says role=admin but the user was demoted?

This is the stale-claims problem.

Solutions can include:

``` text
Short token lifetime
+
Authorization lookup for sensitive operations
+
Token versioning
+
Revocation/denylist
+
Central policy check
```

------------------------------------------------------------------------

## Q58. What if a JWT is stolen?

It is a bearer credential.

Whoever possesses it may be able to use it until it expires or is
otherwise rejected.

Defenses:

``` text
Short access-token lifetime
Secure transport
Secure token storage
Refresh-token rotation
Revocation mechanisms
MFA/risk controls
```

------------------------------------------------------------------------

## Q59. Is storing JWT in localStorage always safe?

No.

If an application has XSS, JavaScript may be able to read a token stored
in localStorage.

Token storage must be chosen based on the application architecture and
threat model.

Cookie-based authentication with HttpOnly/Secure/SameSite settings can
reduce some token-theft risks, but introduces cookie/CSRF
considerations.

------------------------------------------------------------------------

## Q60. Session or JWT for browser application?

There is no universal answer.

For many browser applications, secure cookie-based sessions are simple
and robust.

JWT access tokens can be useful for APIs and distributed identity
architectures.

Choose based on:

``` text
Architecture
Revocation requirements
Client types
Service boundaries
Operational complexity
Threat model
```

------------------------------------------------------------------------

## Q61. Can microservices share one database?

Technically yes, but it creates coupling.

A common microservice principle is:

``` text
Service
   |
   v
Own data boundary
```

Shared databases can make deployments and ownership harder.

The right choice depends on domain boundaries and operational needs.

------------------------------------------------------------------------

## Q62. Why is database-per-service discussed in microservices?

It helps establish:

``` text
Service A -> Data A
Service B -> Data B
```

and reduces direct coupling.

But it introduces distributed data consistency challenges.

------------------------------------------------------------------------

## Q63. If services have separate databases, how do they communicate?

Through:

``` text
Synchronous APIs
+
Asynchronous events
```

Example:

``` text
Order Service
    |
    v
Kafka
    |
    v
Notification Service
```

------------------------------------------------------------------------

## Q64. Why Kafka instead of directly calling every service?

Events can reduce synchronous coupling.

Example:

``` text
Order created
     |
     v
Kafka
  /  |  \
 v   v   v
Email Analytics Inventory
```

The order operation doesn't necessarily have to wait for every
downstream consumer.

------------------------------------------------------------------------

## Q65. What happens if Kafka sends the same event twice?

Microservice consumers should often be designed with idempotency.

Example:

``` text
eventId = 123
```

Consumer records that event as processed.

If it receives event 123 again:

``` text
Already processed
     |
     v
Do not duplicate side effect
```

------------------------------------------------------------------------

## Q66. What is idempotency?

An operation is idempotent if repeating it produces the same intended
final effect.

For example:

``` text
Set order status = PAID
```

repeatedly can remain:

``` text
PAID
```

instead of charging the card multiple times.

Idempotency is extremely important in distributed systems.

------------------------------------------------------------------------

## Q67. Why do microservices need timeouts?

Without a timeout:

``` text
Order Service
     |
     | waiting...
     v
Payment Service
     |
     | waiting...
```

Threads/connections/resources can remain occupied.

Use appropriate timeouts and failure handling.

------------------------------------------------------------------------

## Q68. Why retries can be dangerous?

Suppose payment request times out:

``` text
Order -> Payment
        |
        | payment succeeded
        |
        X response lost
```

Order Service retries.

``` text
Order -> Payment
```

Without idempotency, the user could potentially be charged twice.

Therefore:

``` text
Timeouts
+
Retries
+
Idempotency
```

must be designed together.

------------------------------------------------------------------------

## Q69. Why use correlation/request IDs?

A request may travel:

``` text
Gateway
  |
  v
Order
  |
  v
Payment
  |
  v
Kafka
  |
  v
Notification
```

A request ID lets you connect logs across services.

``` text
requestId = abc123
```

Search logs for:

``` text
abc123
```

and see the whole journey.

------------------------------------------------------------------------

## Q70. What is defense in depth?

It means using multiple independent security controls.

``` text
HTTPS
+
WAF
+
Rate limiting
+
Authentication
+
Authorization
+
Validation
+
Private DB
+
Least privilege
+
Monitoring
```

If one layer fails, others still provide protection.

------------------------------------------------------------------------

# 53. 30-Second Interview Summary

If the interviewer asks:

> "Explain how you would secure a high-traffic microservices
> application."

Say:

> "I would use defense in depth. Client traffic would use HTTPS/TLS and
> pass through edge/DDoS protection, WAF, and an API Gateway or load
> balancer. Application services would be stateless where practical so
> they can scale horizontally. For authentication, I could use secure
> sessions with a shared Redis store or short-lived signed access tokens
> such as JWTs, depending on requirements. With asymmetric JWT signing,
> the Auth Service keeps the private signing key while services verify
> tokens with the public key.
>
> Authentication and authorization would be separate: authentication
> establishes identity, while each relevant service enforces
> authorization and resource ownership. Service-to-service calls would
> use service identities such as OAuth tokens or mTLS. I would validate
> input, use parameterized queries, apply rate limiting, protect browser
> applications against XSS and CSRF where applicable, and use secure
> cookies when using cookie-based authentication.
>
> Databases would be private, secrets would be stored in a secrets
> manager, and workloads would follow least privilege. Finally, I would
> use logging, metrics, tracing, and alerting for detection and
> troubleshooting."

------------------------------------------------------------------------

# 54. Final Cheat Sheet

## Microservices

``` text
Split large application
into independently deployable business services.
```

## State

``` text
Information the system needs to remember.
```

## Stateful

``` text
Server-side state
     |
     v
Session / stored state
```

Memory:

> Server remembers me.

## Stateless

``` text
Request
   |
   v
Self-contained authentication proof
```

Memory:

> I carry proof.

## Session

``` text
Browser
  |
  | session ID
  v
Redis
  |
  v
User
```

## JWT

``` text
Browser
  |
  | signed token
  v
Service
  |
  v
Verify
```

## Asymmetric JWT

``` text
Private key -> Sign
Public key  -> Verify
```

## Authentication

``` text
WHO are you?
```

## Authorization

``` text
WHAT are you allowed to do?
```

## Service authentication

``` text
Is this really Order Service?
```

## XSS

``` text
Attacker
   |
   v
Malicious script
   |
   v
Victim browser
```

## CSRF

``` text
Attacker site
   |
   v
Victim browser
   |
   v
Authenticated target
```

## CORS

``` text
Browser cross-origin access control
```

## SQL Injection

``` text
User input
   |
   v
Parameterized query
   |
   v
Database
```

## Rate limiting

``` text
Too many requests
       |
       v
Block / 429 / challenge
```

## WAF

``` text
HTTP traffic
    |
    v
WAF
    |
 +--+--+
bad   good
 |     |
block allow
```

## Load balancing

``` text
           Load Balancer
          /      |      \
         v       v       v
       Node1   Node2   Node3
```

## Horizontal scaling

``` text
More instances
```

## Redis

``` text
Cache
Sessions
Rate limits
Temporary state
Locks/work coordination
```

## Database

``` text
Private network
+
Least privilege
+
Encryption
+
Backups
```

## Secrets

``` text
Secrets Manager
      |
      v
Application
```

## Monitoring

``` text
Logs
+
Metrics
+
Traces
+
Alerts
```

------------------------------------------------------------------------

# The One Diagram to Remember

``` text
                              USERS
                                |
                                | HTTPS
                                v
                       +----------------+
                       | CDN / EDGE     |
                       +-------+--------+
                               |
                       +-------v--------+
                       | DDoS Protection|
                       +-------+--------+
                               |
                       +-------v--------+
                       | WAF            |
                       +-------+--------+
                               |
                       +-------v--------+
                       | API Gateway    |
                       +-------+--------+
                               |
                       +-------v--------+
                       | Load Balancer  |
                       +-------+--------+
                               |
              +----------------+----------------+
              |                |                |
              v                v                v
         Auth Service      User Service     Order Service
              |                |                |
              |                |                |
              v                v                v
         PostgreSQL        PostgreSQL        PostgreSQL
              |
              v
            Redis
              |
              +--> Sessions
              +--> Cache
              +--> Rate limits

Order Service
      |
      | authenticated service call
      v
Payment Service
      |
      v
    Kafka
      |
      +---------> Notification Service
      |
      +---------> Analytics Service

All services:
      |
      +--> Secrets Manager
      |
      +--> Logging / Metrics / Tracing
      |
      +--> Least-privilege IAM
```

## Final mental model

The entire topic can be reduced to these questions:

``` text
1. Who is calling?
       -> Authentication

2. What are they allowed to do?
       -> Authorization

3. How does the system remember login?
       -> Session OR token

4. Can any instance handle the request?
       -> Stateless design

5. Where does shared state live?
       -> Redis / DB / other external stores

6. How do services trust each other?
       -> Service identity / OAuth / mTLS

7. How do we protect the browser?
       -> HTTPS / XSS / CSRF / secure cookies / CSP

8. How do we protect the API?
       -> Authentication / authorization / validation / rate limiting / WAF

9. How do we protect the database?
       -> Private network / IAM / least privilege / encryption

10. How do we survive high traffic?
       -> Load balancing / horizontal scaling / caching

11. How do we detect attacks/failures?
       -> Logs / metrics / tracing / alerts

12. What happens when one component fails?
       -> Timeouts / retries / circuit breaking / failover / graceful degradation
```

> **Core principle:** Keep application instances as stateless as
> practical, move shared/persistent state to dedicated systems,
> authenticate every trust boundary, authorize every sensitive
> operation, and use multiple security layers instead of depending on
> one security mechanism.
