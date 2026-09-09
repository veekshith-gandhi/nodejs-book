# Web Application Security --- From Zero to Production

> A beginner-friendly reference for understanding how a large web
> application protects users, passwords, sessions, APIs, databases, and
> infrastructure.
>
> Examples use an **Instagram-like application with React + Node.js +
> AWS + PostgreSQL/Redis**, but the concepts apply broadly.

------------------------------------------------------------------------

## Table of Contents

1.  [The Big Picture](#1-the-big-picture)
2.  [SSH vs Web Application
    Authentication](#2-ssh-vs-web-application-authentication)
3.  [HTTPS / TLS](#3-https--tls)
4.  [Passwords and Password Hashing](#4-passwords-and-password-hashing)
5.  [Authentication vs
    Authorization](#5-authentication-vs-authorization)
6.  [Sessions](#6-sessions)
7.  [JWT](#7-jwt)
8.  [Cookies and Secure Cookie
    Settings](#8-cookies-and-secure-cookie-settings)
9.  [XSS](#9-xss)
10. [CSRF](#10-csrf)
11. [XSS vs CSRF](#11-xss-vs-csrf)
12. [CORS](#12-cors)
13. [SQL Injection](#13-sql-injection)
14. [Rate Limiting](#14-rate-limiting)
15. [WAF](#15-waf)
16. [DDoS](#16-ddos)
17. [Load Balancer](#17-load-balancer)
18. [Horizontal Scaling](#18-horizontal-scaling)
19. [Database Security](#19-database-security)
20. [Secrets Management](#20-secrets-management)
21. [API Security](#21-api-security)
22. [Input Validation](#22-input-validation)
23. [Security Headers](#23-security-headers)
24. [Encryption at Rest](#24-encryption-at-rest)
25. [Logging, Monitoring, and
    Alerting](#25-logging-monitoring-and-alerting)
26. [MFA / 2FA](#26-mfa--2fa)
27. [Brute Force, Credential Stuffing, and Account
    Takeover](#27-brute-force-credential-stuffing-and-account-takeover)
28. [SSRF](#28-ssrf)
29. [File Upload Security](#29-file-upload-security)
30. [Least Privilege](#30-least-privilege)
31. [Typical AWS Architecture](#31-typical-aws-architecture)
32. [Complete Login Flow](#32-complete-login-flow)
33. [What Happens During an Attack?](#33-what-happens-during-an-attack)
34. [How to Explain This in an
    Interview](#34-how-to-explain-this-in-an-interview)
35. [Quick Revision Cheat Sheet](#35-quick-revision-cheat-sheet)

------------------------------------------------------------------------

# 1. The Big Picture

Imagine we build an application like Instagram:

``` text
                         USERS
                           |
                           | HTTPS
                           v
                  +------------------+
                  | CDN / Edge       |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | DDoS Protection  |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | AWS WAF          |
                  +--------+---------+
                           |
                           v
                  +------------------+
                  | Load Balancer    |
                  +--------+---------+
                           |
                +----------+----------+
                |          |          |
                v          v          v
             Node.js    Node.js    Node.js
             Server 1   Server 2   Server 3
                |          |          |
                +----------+----------+
                           |
                    +------+------+
                    |             |
                    v             v
                  Redis       PostgreSQL
                    |
                    v
             Sessions / Cache /
             Rate-limit data
```

Security is **not one feature**.

It is a collection of layers:

``` text
HTTPS              -> protects data while travelling
Password hashing   -> protects passwords if DB is stolen
Authentication     -> proves who the user is
Authorization      -> decides what the user can do
Sessions/JWT       -> keeps user logged in
HttpOnly cookies   -> reduce cookie theft through JavaScript
XSS protection     -> prevents malicious scripts from executing
CSRF protection    -> prevents unwanted authenticated actions
CORS               -> controls browser cross-origin access
Input validation   -> rejects unexpected data
SQL parameterizing -> prevents SQL injection
Rate limiting      -> slows abusive requests
WAF                -> blocks many malicious web requests
DDoS protection    -> handles large traffic attacks
Database isolation -> prevents direct internet DB access
Secrets Manager    -> protects passwords/API keys
Logging/monitoring -> detects suspicious behavior
MFA                -> adds another authentication factor
```

------------------------------------------------------------------------

# 2. SSH vs Web Application Authentication

SSH is commonly used to securely access a server.

``` text
Your computer
     |
     | SSH
     v
Linux server
```

SSH can use a public/private key pair.

``` text
Private key = secret
Public key  = shareable
```

The server stores the public key:

``` text
~/.ssh/authorized_keys
```

Your computer keeps the private key.

During authentication, the server challenges the client to prove
possession of the private key. The private key is **not sent to the
server**.

Simplified:

``` text
Server -> challenge
Client -> signs challenge using private key
Server -> verifies signature using public key
         |
         +--> valid   -> login
         +--> invalid -> reject
```

## Web applications are different

A typical web application might use:

``` text
Browser
   |
   | HTTPS
   v
Backend
   |
   v
Password hash verification
   |
   v
Session / token
```

SSH key authentication and web login authentication are different
mechanisms, although both use cryptography.

------------------------------------------------------------------------

# 3. HTTPS / TLS

## What problem does HTTPS solve?

Suppose you enter:

``` text
email = alice@gmail.com
password = Hello123
```

Without encrypted transport:

``` text
Browser --------------------> Server
          password
             |
             +---- Hacker may intercept traffic
```

With HTTPS:

``` text
Browser
   |
   | encrypted TLS connection
   v
Server
```

A network observer cannot simply read the request as plaintext.

## HTTP vs HTTPS

``` text
HTTP
http://example.com

HTTPS
https://example.com
```

HTTPS uses TLS to provide:

1.  Confidentiality --- others cannot simply read the traffic.
2.  Integrity --- traffic cannot be silently modified without detection.
3.  Server authentication --- the browser can verify it is communicating
    with the intended server based on certificates.

## AWS implementation

A common architecture:

``` text
Browser
   |
   | HTTPS :443
   v
Application Load Balancer
   |
   | HTTP or HTTPS internally, depending on design
   v
Node.js
```

AWS Certificate Manager can manage TLS certificates, and the certificate
can be attached to an Application Load Balancer.

## Important

HTTPS does **not** solve:

``` text
XSS
CSRF
SQL Injection
Weak passwords
Broken authorization
```

HTTPS protects the communication channel; it does not automatically make
the application itself secure.

------------------------------------------------------------------------

# 4. Passwords and Password Hashing

## Never store passwords as plaintext

Bad:

``` text
users

email              password
--------------------------------
alice@gmail.com    Hello123
```

If the database is stolen:

``` text
Hacker
  |
  v
Database
  |
  v
Hello123
```

The real password is immediately exposed.

## Hash the password

Use a password-hashing algorithm such as:

-   Argon2id
-   bcrypt
-   scrypt

Conceptually:

``` text
Hello123
   |
   v
Password hashing algorithm
   |
   v
$argon2id$v=19$...
```

Database:

``` text
email              password_hash
--------------------------------------
alice@gmail.com    $argon2id$v=19$...
```

## Hashing vs encryption

Encryption is designed to be reversible with a key:

``` text
plaintext
   |
   v
encryption + key
   |
   v
ciphertext
   |
   v
decryption + key
   |
   v
plaintext
```

Password hashing is intended to be one-way:

``` text
password
   |
   v
password hash
```

You normally do not decrypt a password hash.

## Login verification

User enters:

``` text
Hello123
```

Backend gets the stored hash:

``` text
$argon2id$v=19$...
```

Then:

``` text
entered password
       |
       v
password verifier
       |
       v
compare against stored hash
       |
   +---+---+
   |       |
 valid   invalid
   |       |
   v       v
 login    reject
```

### Node.js conceptual example

``` javascript
const hash = await argon2.hash(password);

// Store hash, not password.
await db.query(
  'INSERT INTO users(email, password_hash) VALUES($1, $2)',
  [email, hash]
);
```

Verification:

``` javascript
const valid = await argon2.verify(
  storedHash,
  password
);
```

## Salt

Modern password-hashing algorithms use a salt.

Conceptually:

``` text
password + unique salt
          |
          v
       hash
```

This helps prevent attackers from efficiently using precomputed hash
tables against many accounts.

With Argon2/bcrypt, the salt and relevant parameters are typically
encoded into the stored hash string.

## Why slow password hashing?

If an attacker steals hashes, you want each password guess to be
expensive.

``` text
Fast hash:
1,000,000 guesses -> very fast

Password hashing:
1,000,000 guesses -> much more expensive
```

The goal is to make offline password cracking harder.

------------------------------------------------------------------------

# 5. Authentication vs Authorization

These two are frequently confused.

## Authentication

Question:

> Who are you?

Example:

``` text
Email + password
       |
       v
Authentication
       |
       v
Alice
```

## Authorization

Question:

> What are you allowed to do?

Example:

``` text
Alice
  |
  +--> View own profile      YES
  +--> Edit own profile      YES
  +--> Delete another user   NO
  +--> Admin dashboard       NO
```

Easy memory trick:

``` text
Authentication = WHO?
Authorization  = WHAT can you do?
```

------------------------------------------------------------------------

# 6. Sessions

After successful login:

``` text
Email + password
       |
       v
Authentication successful
       |
       v
Create session
       |
       v
Browser receives session cookie
```

Example:

``` text
session_id = abc123
```

Future request:

``` http
GET /profile
Cookie: session_id=abc123
```

Server:

``` text
abc123
  |
  v
Find session
  |
  v
Alice
  |
  v
Return profile
```

## Server-side sessions

The session data can be stored in Redis:

``` text
Redis

abc123 -> {
    userId: 1001,
    expiresAt: ...
}
```

Browser only holds the session identifier.

## Why Redis?

If you have many Node.js servers:

``` text
             Load Balancer
             /     |     \
            v      v      v
         Node 1  Node 2  Node 3
```

A user can hit any server.

All servers can access the shared session store:

``` text
Node 1 \
Node 2  ---> Redis
Node 3 /
```

------------------------------------------------------------------------

# 7. JWT

JWT = JSON Web Token.

Instead of keeping the complete session on the server, the application
can issue a signed token.

Conceptually:

``` text
Login
  |
  v
Authentication
  |
  v
JWT
```

The client sends:

``` http
Authorization: Bearer <token>
```

The backend verifies the token.

A JWT commonly contains claims such as:

``` json
{
  "sub": "1001",
  "role": "user",
  "exp": 1790000000
}
```

## Important

Do not put sensitive secrets into a JWT merely because it is encoded.

JWT payloads are commonly readable by the holder of the token.

A JWT's signature helps prove that the token was issued by a trusted
signer and has not been altered.

## JWT vs session

### Session

``` text
Browser -> session ID
Server  -> session data
```

### JWT

``` text
Browser -> signed token
Server  -> verifies token
```

Neither is automatically "more secure."

Security depends on the complete implementation.

------------------------------------------------------------------------

# 8. Cookies and Secure Cookie Settings

A cookie can carry a session identifier.

Example:

``` javascript
res.cookie('session', sessionId, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
});
```

## HttpOnly

``` text
HttpOnly
```

JavaScript cannot directly access that cookie through `document.cookie`.

This helps reduce the chance that an XSS vulnerability can directly
steal the authentication cookie.

**Important:** HttpOnly does not prevent XSS itself.

## Secure

``` text
secure: true
```

The browser sends the cookie only over HTTPS.

## SameSite

Controls when the browser sends cookies in cross-site situations.

Common values:

``` text
Strict
Lax
None
```

`SameSite` is an important CSRF defense, but exact behavior depends on
the request and browser context.

------------------------------------------------------------------------

# 9. XSS

XSS = Cross-Site Scripting.

## Simple definition

> An attacker manages to get malicious JavaScript executed in another
> user's browser in the context of your application.

Imagine a comments feature.

Normal input:

``` text
Hello everyone!
```

Your application displays:

``` html
<div>Hello everyone!</div>
```

Now an attacker submits HTML/JavaScript.

If your application incorrectly inserts it as executable HTML:

``` text
attacker input
     |
     v
database
     |
     v
HTML page
     |
     v
victim browser
     |
     v
malicious JavaScript executes
```

## Why XSS is dangerous

Depending on the application, malicious script may be able to:

``` text
read sensitive page content
perform actions as the user
modify the page
send data to an attacker-controlled destination
```

The exact impact depends on browser controls, authentication design,
CSP, and what data the page exposes.

## Stored XSS

Malicious content is stored in the database.

``` text
Attacker
   |
   v
Comment
   |
   v
Database
   |
   v
Victim opens comments
   |
   v
Script executes
```

## Reflected XSS

Malicious input is reflected immediately into a response/page without
safe output handling.

``` text
Attacker-controlled input
        |
        v
Request
        |
        v
Server response
        |
        v
Browser executes unsafe content
```

## DOM-based XSS

The vulnerability exists primarily in client-side JavaScript.

Example conceptual problem:

``` javascript
element.innerHTML = userInput;
```

If `userInput` is attacker-controlled, this can become dangerous.

Prefer safe APIs such as:

``` javascript
element.textContent = userInput;
```

when HTML is not actually required.

## XSS defenses

### 1. Output encoding

Treat user input as text, not HTML.

### 2. Safe frontend rendering

Frameworks such as React escape normal interpolated values.

Be careful with APIs designed to render raw HTML.

### 3. HTML sanitization

If rich HTML is genuinely required:

``` text
User HTML
   |
   v
Sanitizer
   |
   v
Allowed HTML only
```

### 4. Content Security Policy

CSP tells browsers which scripts and other resources are allowed.

### 5. HttpOnly cookies

Reduces direct cookie theft through JavaScript.

------------------------------------------------------------------------

# 10. CSRF

CSRF = Cross-Site Request Forgery.

## Simple definition

> An attacker tricks a user's browser into making an unwanted request to
> a website where the user is already authenticated.

Imagine:

``` text
You are logged into bank.com
```

Your browser has:

``` text
session=ABC123
```

Then you visit:

``` text
evil.com
```

The attacker tries to cause your browser to send a request to:

``` text
bank.com
```

If the browser sends the bank's authentication cookie and the bank has
no adequate CSRF protection, the server may interpret the request as
coming from the authenticated user.

## Important point

The attacker may not know your session cookie.

The browser itself may attach it.

That is why cookie-based authentication needs appropriate cross-site
request defenses.

## CSRF token

Server provides a token:

``` text
CSRF token = XYZ789
```

Sensitive request:

``` http
POST /transfer

Cookie: session=ABC123
CSRF-Token: XYZ789
```

Server checks:

``` text
Session valid?     YES
CSRF token valid?  YES
                    |
                    v
                 Process
```

Attacker's cross-site request:

``` text
Cookie may be present
CSRF token missing/invalid
        |
        v
       REJECT
```

## SameSite cookies

A strong SameSite configuration can prevent many cross-site cookie
scenarios and is an important CSRF defense.

## When CSRF is especially relevant

CSRF is particularly associated with **cookie-based authentication**,
because browsers automatically manage cookies.

If an application uses an `Authorization: Bearer ...` token that
JavaScript explicitly adds to requests, classic CSRF risk is different
because an attacker's unrelated site generally cannot simply cause the
browser to attach that custom authorization header.

However, token storage and XSS risks still matter.

------------------------------------------------------------------------

# 11. XSS vs CSRF

  -----------------------------------------------------------------------
                          XSS                     CSRF
  ----------------------- ----------------------- -----------------------
  Full name               Cross-Site Scripting    Cross-Site Request
                                                  Forgery

  Main idea               Execute                 Trick browser into
                          attacker-controlled     making an authenticated
                          script in your          request
                          application's context   

  Attacker code runs      Typically yes           Not necessarily
  inside target origin?                           

  Main target             Browser/page            Authenticated actions

  Common defense          Output encoding,        SameSite cookies, CSRF
                          sanitization, CSP       tokens

  HttpOnly helps?         Helps protect cookies   Not primary defense

  HTTPS alone fixes it?   No                      No
  -----------------------------------------------------------------------

Memory trick:

``` text
XSS:
"Run my malicious code in your website."

CSRF:
"Make your browser perform an action for me."
```

------------------------------------------------------------------------

# 12. CORS

CORS = Cross-Origin Resource Sharing.

This is a browser security mechanism.

## What is an origin?

An origin is broadly:

``` text
scheme + host + port
```

For example:

``` text
https://myapp.com
https://api.myapp.com
```

are different origins because their hosts differ.

## Problem

Suppose:

``` text
Frontend:
https://app.example.com

API:
https://api.example.com
```

Browser JavaScript from one origin wants to call another.

The API can explicitly allow trusted origins.

Example response header:

``` http
Access-Control-Allow-Origin: https://app.example.com
```

## Important

CORS is **not authentication**.

It does not mean:

``` text
CORS = secure API
```

It mainly controls what browser JavaScript is allowed to read across
origins.

Non-browser clients are not constrained by browser CORS rules in the
same way.

------------------------------------------------------------------------

# 13. SQL Injection

Suppose your backend builds SQL like this:

``` javascript
const query =
  "SELECT * FROM users WHERE email = '" +
  email +
  "'";
```

This is dangerous if `email` is attacker-controlled.

The attacker may provide SQL syntax instead of normal data.

The application can accidentally treat data as SQL instructions.

## Correct approach

Use parameterized queries:

``` javascript
await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

Now the database understands:

``` text
$1 = data
```

rather than treating the supplied value as SQL code.

## Defense

``` text
Input
  |
  v
Validation
  |
  v
Parameterized query
  |
  v
Database
```

ORMs/query builders can help, but unsafe raw SQL can still introduce
vulnerabilities if values are concatenated into SQL.

------------------------------------------------------------------------

# 14. Rate Limiting

## Problem

Attacker sends:

``` text
POST /login
POST /login
POST /login
...
```

Thousands or millions of times.

This can cause:

-   brute-force password attempts
-   resource exhaustion
-   abuse of expensive endpoints
-   API scraping
-   credential stuffing

## Simple rate limit

``` text
5 failed login attempts
       |
       v
temporary block/challenge
```

## Redis-based implementation

A distributed application might maintain counters in Redis:

``` text
login_attempts:IP:1.2.3.4 = 5
```

Conceptually:

``` javascript
const attempts = await redis.incr(key);

if (attempts > LIMIT) {
  return res.status(429).json({
    message: 'Too many requests'
  });
}
```

In production, use an appropriate time window/TTL and carefully choose
the keys.

Do not rely only on IP address: many legitimate users can share an IP,
and attackers can rotate IPs.

Useful signals can include:

``` text
IP
Account
Device/session
Endpoint
Request frequency
Risk signals
```

------------------------------------------------------------------------

# 15. WAF

WAF = Web Application Firewall.

Think:

``` text
Internet
   |
   v
WAF
   |
   v
Application
```

The WAF examines HTTP requests and applies rules.

Conceptually:

``` text
Request
   |
   v
WAF rules
   |
 +---+---+
 |       |
bad     good
 |       |
 v       v
block   allow
```

AWS WAF can help protect against common web attack patterns and abusive
traffic.

It can be used for rules involving:

-   malicious request patterns
-   SQL injection patterns
-   XSS patterns
-   IP reputation
-   rate-based rules
-   bot-related controls

A WAF is another layer; it does not replace secure application code.

------------------------------------------------------------------------

# 16. DDoS

DDoS = Distributed Denial of Service.

The objective is generally to overwhelm availability using traffic or
requests from many sources.

Example:

``` text
Attacker infrastructure
  \   |   |   |   /
   \  |   |   |  /
    \ |   |   | /
      Internet
         |
         v
     Application
```

If your application normally handles:

``` text
10,000 requests/sec
```

and suddenly receives a huge volume, infrastructure can become
unavailable.

## Defense

A typical AWS architecture may use:

``` text
Internet
   |
   v
Edge / CDN
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

AWS Shield is part of AWS's DDoS protection capabilities.

## Important

DDoS protection and rate limiting are related but different.

``` text
Rate limiting:
Control how much traffic an individual client/request pattern can send.

DDoS protection:
Protect infrastructure from large-scale availability attacks.
```

------------------------------------------------------------------------

# 17. Load Balancer

Without a load balancer:

``` text
Users
  |
  v
One Node.js server
```

If traffic grows:

``` text
Users
  |
  v
One server
  |
  v
Overloaded
```

With a load balancer:

``` text
              Load Balancer
             /      |      \
            v       v       v
         Node 1  Node 2  Node 3
```

The load balancer distributes requests.

AWS Application Load Balancer (ALB) is a common choice for HTTP/HTTPS
applications.

## Health checks

The load balancer can check:

``` text
GET /health
```

If Node 2 is unhealthy:

``` text
Node 1 -> traffic
Node 2 -> unhealthy
Node 3 -> traffic
```

Traffic is not sent to unhealthy targets.

------------------------------------------------------------------------

# 18. Horizontal Scaling

Suppose one Node.js server handles:

``` text
1,000 requests/sec
```

If traffic becomes:

``` text
10,000 requests/sec
```

you might run multiple instances.

``` text
          Load Balancer
         /   /   \   \
        v   v     v   v
       N1  N2    N3  N4
```

Traffic increases further:

``` text
N1 N2 N3 N4
      |
      v
Auto Scaling
      |
      v
N5 N6 N7 ...
```

This is horizontal scaling.

## Why Node.js works well here

A Node.js API server can be replicated across multiple instances as long
as state that must be shared is externalized.

For example:

``` text
Node 1 \
Node 2  ---> Redis
Node 3 /

Node 1 \
Node 2  ---> PostgreSQL
Node 3 /
```

Avoid storing important shared session state only in one server's memory
if requests can reach other servers.

------------------------------------------------------------------------

# 19. Database Security

Your PostgreSQL database should generally not be directly exposed to the
public internet.

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

## AWS VPC

A common architecture:

``` text
                 VPC
                  |
       +----------+----------+
       |                     |
   Public subnet        Private subnet
       |                     |
       v                     v
   Load Balancer          Node.js
                             |
                             v
                         PostgreSQL
```

The exact subnet design varies.

## Security groups

A simplified policy:

``` text
ALB:
Internet -> HTTPS allowed

Backend:
Only ALB -> application port

Database:
Only backend -> PostgreSQL port
```

This creates network-level isolation.

------------------------------------------------------------------------

# 20. Secrets Management

Your application needs secrets:

``` text
DATABASE_PASSWORD
API_KEY
JWT_SIGNING_KEY
THIRD_PARTY_SECRET
```

Bad:

``` javascript
const dbPassword = "SuperSecretPassword";
```

Never commit real secrets to Git.

Better:

``` text
AWS Secrets Manager
        |
        v
Node.js application
        |
        v
Retrieve secret securely
```

Environment variables can also be used, but production secret
lifecycle/rotation/access control often benefits from a dedicated
secrets manager.

## Secret vs password hash

Do not confuse these:

``` text
User password:
hash it

Database password/API secret:
store it securely as a secret
```

A database password must be retrievable by the application, so it is not
handled like a user's login password.

------------------------------------------------------------------------

# 21. API Security

Suppose you have:

``` text
GET  /users/me
POST /posts
DELETE /posts/:id
```

Every protected endpoint should ask:

``` text
Who is making this request?
Is authentication valid?
Is this user allowed to perform this action?
Is the input valid?
```

Example:

``` text
Request
  |
  v
Authentication middleware
  |
  v
Authorization
  |
  v
Validation
  |
  v
Business logic
  |
  v
Database
```

## Middleware example

``` javascript
app.use(authenticate);
```

Conceptually:

``` javascript
function authenticate(req, res, next) {
  // Verify session/token
  // Set req.user
  // Reject if unauthenticated
  next();
}
```

Then authorization:

``` javascript
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }

  next();
}
```

------------------------------------------------------------------------

# 22. Input Validation

Never assume users send valid data.

Suppose an API expects:

``` json
{
  "age": 29,
  "email": "alice@example.com"
}
```

Attacker may send:

``` json
{
  "age": "hello",
  "email": {},
  "unexpectedField": "something"
}
```

Validate the input.

Conceptually:

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

Common Node.js validation libraries include schema-based tools such as
Zod, Joi, and Ajv.

Validation helps prevent:

-   malformed data
-   unexpected types
-   oversized inputs
-   invalid business data
-   some classes of injection

Validation is not a replacement for parameterized SQL or output
encoding.

------------------------------------------------------------------------

# 23. Security Headers

HTTP response headers can provide additional browser-side protections.

Examples:

``` text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
```

## HSTS

``` text
Strict-Transport-Security
```

Tells supporting browsers to prefer HTTPS for your site for the
configured period.

## Content-Type protection

``` text
X-Content-Type-Options: nosniff
```

Helps prevent MIME-type sniffing in supported browsers.

## CSP

CSP controls where scripts/resources can come from and can significantly
reduce the impact of some XSS attacks.

------------------------------------------------------------------------

# 24. Encryption at Rest

HTTPS protects data **while travelling**.

Encryption at rest protects stored data.

``` text
During network transfer:
HTTPS/TLS 🔐

Stored:
Disk/database encryption 🔐
```

For example:

``` text
Application
   |
   v
Encrypted database storage
```

Cloud providers commonly provide encryption for:

-   database storage
-   object storage
-   disks
-   backups

## Important

Encryption at rest does not replace access control.

If an attacker has legitimate application/database credentials,
encryption at rest alone does not magically prevent the application from
reading data.

------------------------------------------------------------------------

# 25. Logging, Monitoring, and Alerting

Security is not only prevention.

You also need to detect suspicious behavior.

Example logs:

``` text
2026-09-09 21:00 login success user=1001
2026-09-09 21:01 login failed user=1001
2026-09-09 21:01 login failed user=1001
2026-09-09 21:01 login failed user=1001
...
```

Monitoring can detect:

``` text
1000 failed logins/minute
        |
        v
Suspicious
        |
        v
Alert / block / challenge
```

AWS services commonly used include:

``` text
CloudWatch
CloudTrail
```

depending on what you need to monitor.

## What to log

Useful:

``` text
request ID
timestamp
endpoint
status code
latency
user/account identifier where appropriate
security event
error category
```

Do not log secrets or plaintext passwords.

------------------------------------------------------------------------

# 26. MFA / 2FA

MFA = Multi-Factor Authentication.

Password alone:

``` text
Something you know
      |
      v
Password
```

MFA adds another factor.

Example:

``` text
Password
   +
Authenticator code
   |
   v
Login
```

Factors can include:

``` text
Something you know     -> password
Something you have     -> phone/security key
Something you are      -> biometric
```

The idea is:

``` text
Password stolen
     +
Second factor still required
     |
     v
Harder to take over account
```

------------------------------------------------------------------------

# 27. Brute Force, Credential Stuffing, and Account Takeover

## Brute force

Attacker repeatedly guesses one account's password.

``` text
Alice
  |
  +-- password1
  +-- password2
  +-- password3
  +-- ...
```

Defense:

``` text
Rate limiting
MFA
Strong passwords
Risk detection
Temporary challenges
```

## Credential stuffing

Attacker gets username/password combinations from another breach and
tries them on your site.

``` text
Site A breach
   |
   v
email + password list
   |
   v
Try against Site B
```

This is why **unique passwords per site** matter.

Applications can also use breached-password detection and risk controls.

## Account takeover

If an attacker successfully gets into an account:

``` text
Credentials compromised
       |
       v
Login
       |
       v
Account takeover
```

MFA and suspicious-login detection help reduce this risk.

------------------------------------------------------------------------

# 28. SSRF

SSRF = Server-Side Request Forgery.

## Basic idea

Your server can make HTTP requests.

Suppose your API accepts:

``` text
POST /fetch-image

{
  "url": "https://example.com/image.jpg"
}
```

Your server does:

``` text
Node.js server
     |
     | fetch(url)
     v
example.com
```

Now imagine an attacker provides a URL that points somewhere the server
should not access.

``` text
Attacker
   |
   v
Your API
   |
   v
Internal resource
```

The attacker is abusing **your server's network access**.

## Defense

-   Allowlist trusted destinations where possible.
-   Validate URL schemes.
-   Resolve and validate destination addresses carefully.
-   Block access to internal/private network ranges where appropriate.
-   Restrict outbound network access.
-   Be careful with redirects.
-   Use cloud metadata-service protections.

SSRF is especially important in cloud environments because internal
services may have more access than an internet client.

------------------------------------------------------------------------

# 29. File Upload Security

Suppose your application allows:

``` text
Upload profile picture
```

Never assume the file is safe because its extension says:

``` text
.jpg
```

A secure upload pipeline may include:

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
Type/content validation
  |
  v
Malware scanning where appropriate
  |
  v
Safe object storage
  |
  v
Serve safely
```

Consider:

-   maximum file size
-   allowed file types
-   generated filenames
-   content validation
-   malware scanning
-   storage outside executable web directories
-   access control
-   signed URLs for private files

------------------------------------------------------------------------

# 30. Least Privilege

Give every component only the permissions it needs.

Bad:

``` text
Node.js
   |
   v
Database admin account
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

and perhaps not:

``` text
DROP DATABASE
CREATE USER
```

Similarly, an AWS application role should have only the permissions it
needs.

Example:

``` text
Image service
   |
   +--> Read/write specific S3 bucket/prefix
```

rather than:

``` text
Full AWS account access
```

This is the **principle of least privilege**.

------------------------------------------------------------------------

# 31. Typical AWS Architecture

A production-style simplified architecture:

``` text
                         USERS
                           |
                           v
                    Route 53 / DNS
                           |
                           v
                    CloudFront / CDN
                           |
                           v
                    AWS WAF / Shield
                           |
                           v
                Application Load Balancer
                           |
                  +--------+--------+
                  |        |        |
                  v        v        v
               Node.js  Node.js  Node.js
                  |        |        |
                  +--------+--------+
                           |
             +-------------+-------------+
             |                           |
             v                           v
           Redis                     PostgreSQL
             |                           |
             |                      Private subnet
             |
             +--> Sessions
             +--> Cache
             +--> Rate limits

                    AWS Secrets Manager
                           |
                           v
                      Application

                    CloudWatch / CloudTrail
                           |
                           v
                   Logs / Monitoring
```

This is conceptual. A real architecture can be much more complex.

------------------------------------------------------------------------

# 32. Complete Login Flow

Let's walk through everything.

Suppose Alice opens:

``` text
https://myapp.com
```

## Step 1 --- DNS

The domain resolves to the appropriate infrastructure.

``` text
myapp.com
   |
   v
DNS
   |
   v
Application endpoint
```

## Step 2 --- HTTPS

Browser establishes TLS.

``` text
Browser
   |
   | HTTPS 🔐
   v
Infrastructure
```

## Step 3 --- WAF / edge checks

The request passes through edge/security controls.

``` text
WAF
 |
 +--> suspicious -> block
 |
 +--> normal ----> continue
```

## Step 4 --- Load balancer

The load balancer selects a healthy backend.

``` text
ALB
 |
 +--> Node 1
 +--> Node 2
 +--> Node 3
```

## Step 5 --- Login request

``` http
POST /login
Content-Type: application/json

{
  "email": "alice@gmail.com",
  "password": "Hello123"
}
```

## Step 6 --- Input validation

Backend validates:

``` text
email -> valid format?
password -> valid input?
```

## Step 7 --- Rate limiting

Check whether the request/account/IP is being abused.

``` text
Allowed?
  |
 +--NO--> 429 / challenge
 |
 YES
 |
 v
Continue
```

## Step 8 --- Find user

Node.js queries PostgreSQL using a parameterized query.

``` text
email
 |
 v
PostgreSQL
 |
 v
password_hash
```

## Step 9 --- Verify password

``` text
Entered password
       |
       v
Argon2id/bcrypt verification
       |
       v
Stored password hash
```

Result:

``` text
valid -> continue
invalid -> reject
```

## Step 10 --- Create authentication state

Either:

``` text
Server-side session
```

or:

``` text
Signed access token/JWT
```

## Step 11 --- Send secure cookie if using cookie auth

Example:

``` text
HttpOnly
Secure
SameSite
```

## Step 12 --- Future request

``` http
GET /profile
Cookie: session=ABC123
```

## Step 13 --- Authenticate

Backend checks:

``` text
Is session/token valid?
```

## Step 14 --- Authorize

``` text
Is Alice allowed to access this resource?
```

## Step 15 --- Database access

Backend retrieves only the data Alice is permitted to see.

## Step 16 --- Response

``` text
Node.js
   |
   v
Load Balancer
   |
   v
HTTPS
   |
   v
Browser
```

------------------------------------------------------------------------

# 33. What Happens During an Attack?

## Attack 1 --- Hacker watches Wi-Fi traffic

``` text
Browser
   |
   | HTTPS 🔐
   v
Server
```

HTTPS protects the contents of the connection from simple passive
interception.

------------------------------------------------------------------------

## Attack 2 --- Hacker steals database

They see:

``` text
alice@gmail.com
$argon2id$...
```

not:

``` text
alice@gmail.com
Hello123
```

Strong password hashing makes offline guessing harder.

------------------------------------------------------------------------

## Attack 3 --- Hacker tries thousands of passwords

``` text
POST /login
POST /login
POST /login
...
```

Rate limiting/risk controls can slow or block abusive behavior.

------------------------------------------------------------------------

## Attack 4 --- Hacker injects JavaScript

``` text
Attacker input
     |
     v
Application
     |
     v
Browser
```

Safe rendering, output encoding, sanitization, CSP, and secure cookie
design reduce XSS risk.

------------------------------------------------------------------------

## Attack 5 --- Hacker tricks browser into making a request

``` text
evil.com
    |
    v
Victim browser
    |
    v
myapp.com
```

SameSite cookies and CSRF tokens can protect sensitive
cookie-authenticated actions.

------------------------------------------------------------------------

## Attack 6 --- Hacker floods application

``` text
Huge traffic
     |
     v
DDoS protection / edge
     |
     v
WAF
     |
     v
Application
```

The goal is to prevent the application from being overwhelmed.

------------------------------------------------------------------------

## Attack 7 --- Hacker tries SQL injection

Bad:

``` javascript
"SELECT ... WHERE email = '" + email + "'"
```

Better:

``` javascript
db.query(
  'SELECT ... WHERE email = $1',
  [email]
)
```

Parameterized queries keep data separate from SQL instructions.

------------------------------------------------------------------------

## Attack 8 --- Hacker tries to access database directly

``` text
Internet
   |
   v
Private DB
   |
   v
Blocked
```

Private networking and security groups reduce direct exposure.

------------------------------------------------------------------------

## Attack 9 --- Hacker steals an API key

If the key is stored securely:

``` text
Secrets Manager
```

rather than committed to Git, access and rotation can be controlled.

If a secret is exposed, rotate/revoke it as appropriate.

------------------------------------------------------------------------

# 34. How to Explain This in an Interview

If an interviewer asks:

> "How would you secure a high-traffic Node.js application?"

A strong structured answer is:

> "I would use a defense-in-depth approach. First, all client
> communication would use HTTPS/TLS. At the edge, I would use DDoS
> protection and a WAF to filter malicious or abusive traffic. An
> Application Load Balancer would distribute traffic across multiple
> Node.js instances, with autoscaling for increased traffic.
>
> For authentication, passwords would never be stored in plaintext; I
> would use a password hashing algorithm such as Argon2id or bcrypt.
> After authentication, I would use secure session cookies or an
> appropriately designed token-based system. For cookie authentication,
> I would use HttpOnly, Secure, and appropriate SameSite settings, with
> CSRF protection where applicable.
>
> On the API layer, I would validate input, use parameterized database
> queries to prevent SQL injection, apply rate limiting, and enforce
> authorization on every protected resource. The database would be
> placed in a private network and accessible only by the backend.
> Secrets would be stored in a secrets-management service rather than
> source code.
>
> Finally, I would add security headers, encryption at rest, centralized
> logging, monitoring, alerting, MFA for sensitive accounts, and
> least-privilege IAM/database permissions."

That answer demonstrates that you understand **security as layers**,
rather than thinking "JWT = security."

------------------------------------------------------------------------

# 35. Quick Revision Cheat Sheet

## Transport

``` text
HTTPS/TLS
    |
    +--> encrypts data in transit
```

## Password

``` text
Password
    |
    v
Argon2id / bcrypt / scrypt
    |
    v
Password hash
    |
    v
Database
```

## Authentication

``` text
Who are you?
```

## Authorization

``` text
What are you allowed to do?
```

## Session

``` text
Login
  |
  v
Session ID
  |
  v
Redis/server-side session
```

## JWT

``` text
Login
  |
  v
Signed token
  |
  v
Backend verifies token
```

## Cookie

``` text
HttpOnly -> JavaScript cannot directly read it
Secure   -> HTTPS only
SameSite -> reduces cross-site cookie sending
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

Defense:

``` text
Output encoding
+
Sanitization
+
CSP
+
HttpOnly cookies
```

## CSRF

``` text
Attacker website
       |
       v
Victim browser
       |
       v
Authenticated target
```

Defense:

``` text
SameSite cookies
+
CSRF tokens where appropriate
+
Origin/Referer validation where appropriate
```

## CORS

``` text
Controls browser cross-origin access
```

Not authentication.

## SQL Injection

``` text
User input
   |
   v
Parameterized SQL
   |
   v
Database
```

## Rate limiting

``` text
Too many requests
       |
       v
429 / block / challenge
```

## WAF

``` text
HTTP request
    |
    v
WAF
    |
 +--+--+
 |     |
bad   good
 |     |
block allow
```

## DDoS

``` text
Massive malicious traffic
          |
          v
DDoS protection / edge
```

## Load balancer

``` text
Users
  |
  v
ALB
 /|\
v v v
N1 N2 N3
```

## Database

``` text
Internet
   X
   |
Backend
   |
Private DB
```

## Secrets

``` text
API keys / DB passwords
          |
          v
Secrets Manager
```

## Least privilege

``` text
Give only the permissions required.
```

## Monitoring

``` text
Logs
  |
  v
Metrics
  |
  v
Alerts
  |
  v
Incident response
```

------------------------------------------------------------------------

# Final Mental Model

When you see a large web application, think in layers:

``` text
                         USER
                           |
                           v
                     HTTPS / TLS
                           |
                           v
                 CDN / Edge / DDoS
                           |
                           v
                         WAF
                           |
                           v
                    Load Balancer
                           |
                           v
                  Node.js API servers
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        Authentication  Rate limit   Validation
             |
             v
        Session / JWT
             |
             v
        Authorization
             |
             v
        Business Logic
             |
        +----+----+
        |         |
        v         v
      Redis    PostgreSQL
        |         |
        +----+----+
             |
             v
       Private network

       Secrets Manager
             |
             v
        Application

       Monitoring / Logs
             |
             v
       Detection / Alerts
```

The most important principle is:

> **No single security feature protects the entire application. Good
> security is defense in depth: multiple independent layers reduce the
> chance that one mistake becomes a complete compromise.**
