# Before vs After Cloud Computing

## ☁️ Overview
- Before Cloud: Companies managed everything on their own (on-premise)
- After Cloud: Infrastructure is rented and managed by cloud providers

---

## 🏢 Before Cloud (On-Premise)

### ⚙️ How it Worked
- Owned physical servers and data centers
- Installed and maintained software manually
- Managed storage, networking, and security
- Required dedicated IT teams

### ✅ Pros
- Full control over systems and data
- Better for highly sensitive environments
- No dependency on internet for internal systems

### ❌ Cons
- High upfront cost (hardware, setup)
- Maintenance cost is high
- Scaling is slow (need to buy new servers)
- Manual backups and updates
- Downtime risk if hardware fails
- Disaster recovery is complex

---

## ☁️ After Cloud (Cloud Computing)

### ⚙️ How it Works
- Rent servers and services (AWS, Azure, GCP)
- Access via internet
- Auto-scaling and managed services
- Pay-as-you-use model

### ✅ Pros
- Low upfront cost
- Easy scalability (auto-scale)
- High availability and reliability
- Managed backups and security
- Faster deployment
- Global access

### ❌ Cons
- Dependency on internet
- Ongoing cost (can increase over time)
- Less control over infrastructure
- Vendor lock-in risk

---

## ⚡ Key Difference

| Feature        | Before Cloud        | After Cloud        |
|---------------|-------------------|-------------------|
| Cost          | High upfront      | Pay-as-you-go     |
| Scaling       | Slow              | Instant           |
| Maintenance   | Manual            | Managed           |
| Reliability   | Lower             | High              |
| Control       | Full              | Limited           |

---

## 🧠 Summary
- Before Cloud = Own and manage everything
- After Cloud = Rent and scale easily

---
## what is cloud ?
- cloud with unlimted space with all the services avilable!
- local system with limited space 

---
## cloud computing ?
- using internet to rent servers , storage , databases instead of owning them!

---
## Cloud Service Models
- IaaS: Rent infrastructure, you manage most (Virtual machines (servers) ex : EC2)
- PaaS: Platform provided, manage only code  (Runtime environment)
- SaaS: Ready software, no management  (Ready-to-use software)

---
## Deployment Models
- Public: Shared, internet-based  
- Private: Dedicated, secure  
- Hybrid: Mix of public + private  
- Community: Shared by similar orgs 

---
## Cloud Providers

### AWS
- AWS: Amazon’s cloud platform (most popular, wide services)  
- Pros: Most services, highly scalable, mature ecosystem  
- Cons: Complex, can be expensive  

### Azure
- Azure: Microsoft cloud (best for enterprise & Windows ecosystem) 
- Pros: Best for Microsoft stack, strong enterprise support  
- Cons: UI complexity, pricing confusion  

### GCP
- GCP: Google cloud (strong in data, AI/ML) 
- Pros: Best for AI/ML & data, simple pricing  
- Cons: Fewer services, smaller market share  

---
## Advantages of AWS
- Highly scalable (auto-scale anytime)  
- Pay-as-you-go pricing  
- Global infrastructure (low latency)  
- Wide range of services  
- High reliability & availability  
- Strong security & compliance  
- Easy integration with tools  

---
## AWS Architecture (Simple)

- Region: Geographic area (e.g., us-east-1)  
- Availability Zone (AZ): Isolated data centers within a region  
- VPC: Private network in AWS  
- Subnets: Public & private network segments  
- EC2: Virtual servers  
- S3: Storage service  
- RDS: Managed database  
- Load Balancer: Distributes traffic  
- Auto Scaling: Adjusts servers automatically  
- IAM: Access & security control  

---
### EC2 (Elastic Compute Cloud)
- Raw virtual server (VM)  
- You install and manage everything  
- Full control, more effort  

### Elastic Beanstalk
- Upload code, AWS handles infra  
- Auto scaling, load balancing included  
- Less control, easy to use  

## ⚡ Key Difference
- EC2: You manage server  
- Beanstalk: AWS manages server  

---

## ☁️ What is AWS Lambda?
- Serverless compute service  
- Run code without managing servers  

## ✅ Advantages
- No server management  
- Auto scaling  
- Pay only for execution time  
- Fast deployment  

## ❌ Limitations
- Timeout limit (short-running tasks)  
- Cold start latency  
- Limited control over environment  

## ⚡ Use Cases
- Backend APIs  
- File processing  
- Automation scripts  
- Event-driven apps  

## 🧠 Summary
- Lambda = Run code without servers (serverless)  
