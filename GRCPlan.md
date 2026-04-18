This is a highly ambitious, complex, but entirely achievable project. Given that this tool will serve as the backbone of your compliance framework for an FCA-regulated firm, **security, auditability, and precision** must guide every single decision.

The proposed stack (Laravel/PHP, Python, MS SQL) is robust and suitable. Laravel provides excellent scaffolding for web applications, while Python can handle complex data analysis, NLP (for root cause descriptions), and sophisticated reporting that PHP might struggle with. Using a local Nutanix cluster ensures the high level of control required by regulated industries.

Here is a comprehensive project plan, broken down into phases, architectural decisions, and technical recommendations.

---

## 🛡️ Architecture & Technical Decisions

### 1. Technology Stack Allocation
| Component | Tool/Language | Why it's used | Focus Area |
| :--- | :--- | :--- | :--- |
| **Backend Logic** | Laravel PHP | Rapid development, MVC structure, strong API management. Ideal for the internal CRUD workflows and business logic enforcement. | Internal Portal, APIs, Business Rules |
| **Database** | MS SQL Server | Highly reliable enterprise database. Excellent integration with Windows/Azure services often used in regulated environments. | Data Persistence (Registers) |
| **Data Analysis/Automation** | Python | Ideal for complex calculations (e.g., inherent risk scores, trend analysis), machine learning (for RCA suggestions), and connecting external data sources. | Dashboarding, Reporting Engine, Advanced Analytics |
| **Authentication** | OAuth2 via Entra ID | Industry standard for secure enterprise SSO. Ensures users only access resources they are authorized for (Role-Based Access Control - RBAC). | Security Core |

### 2. Database Schema Design Strategy
*   **Crucial Step:** Before writing code, spend dedicated time modeling the relationships between the three core registers:
    1.  **Information Asset Register $\rightarrow$ Risk Register:** An asset is *exposed to* a risk. This creates a one-to-many relationship.
    2.  **Risk Register $\rightarrow$ Control Register:** A specific risk requires corresponding controls (from Annex).
    3.  **Compliance Evidence/Documentation:** The control implementation links back to evidence (documents, policy IDs).

### 3. Security Principles Built-In
*   **Separation of Concerns:** Implement two distinct backend APIs and UIs: **Internal Portal** (Full functionality) and **External Client API** (Read-only, highly filtered data).
*   **RBAC:** Every user must be assigned a role that dictates what they see (e.g., *Analyst*, *Process Owner*, *Management*, *Client User*).
*   **Auditing:** Implement robust logging on the backend to track **who** changed **what**, and **when**. This is non-negotiable for ISO 27001 compliance.

---

## 🏗️ Project Phasing Plan (The Agile Approach)

We will structure this project into four phases, ensuring that a Minimum Viable Product (MVP) can be deployed internally before tackling the complexity of external client access.

### Phase 0: Discovery, Planning, and Setup (4-6 Weeks)
**Goal:** Define scope, establish technical foundation, model data, and secure development environment.
*   **Compliance Gap Analysis:** Map existing internal policies and controls against ISO 27001:2022 and FCA Handbook requirements. This defines the *minimum required features*.
*   **Detailed Requirements Gathering:** Interview stakeholders (Risk Managers, Compliance Officers, IT Security) for every workflow step (e.g., "When a risk is identified, what fields must be populated?").
*   **Database Modeling:** Finalize the MS SQL schema design.
*   **Infrastructure Setup:** Set up the Laravel project structure on the Nutanix cluster. Implement initial OAuth2 integration and basic user authentication testing.

### Phase 1: Internal MVP Core - The GRC Engine (3-4 Months)
**Goal:** Build the core internal functionality for asset and risk management. Focus on *process adherence* over polish.
*   **Module 1: Information Asset Register (LAR):** CRUD interface for assets. Includes data classification, ownership assignment, location mapping.
    *   *Tech Focus:* Laravel forms/APIs interacting with MS SQL.
*   **Module 2: Risk Register:** Core risk definition and tracking. Fields must include: Inherent Risk Score, Threat, Vulnerability, Likelihood, Impact.
    *   *Workflow:* Guide users through the formal identification process (e.g., identifying a vulnerability $\rightarrow$ assessing impact).
*   **Module 3: Control/Annex Register:** Mapping of required controls (from ISO Annex A) to specific risks and assets. Tracks control owner and implementation date.
*   **Module 4: Risk Analysis & Treatment Plans:** Implementation of the workflow for root cause analysis and treatment plans (Mitigation, Acceptance, Transfer). This should be a multi-step form/wizard guided by the system.

### Phase 2: Enhancements, Dashboarding, and Externalization (3-4 Months)
**Goal:** Add sophistication, visualization, and prepare the tool for external consumption.
*   **Feature Enhancement 1: Automated Scoring & Dashboards (Python/Laravel):**
    *   Build the **Management GRC Dashboard** (Laravel frontend visualizing Python backend data). Key metrics include: Total Open Risks by Category, Top Control Deficiencies, Risk Score Trend over Time, Percentage of Assets Covered.
    *   Integrate basic reporting using Python scripting to aggregate SQL data and present trends.
*   **Feature Enhancement 2: Policy & Evidence Management:** Link policies (stored in a secure document repository) directly to controls for easy auditing. Implement version control for documents.
*   **Module 5: External Client Portal (The Vanta Model):**
    *   Develop a highly restricted, read-only frontend.
    *   API Layer: Build specific API endpoints that filter data heavily based on the client's scope/consent. The system must *mask* sensitive internal details while proving compliance status. (Example: "We are compliant with ISO 27001 A.14" and show the date of last audit, without revealing proprietary processes).

### Phase 3: Testing, Audit, and Deployment (2-3 Months)
**Goal:** Achieve operational readiness for regulatory use.
*   **User Acceptance Testing (UAT):** Involve Compliance Officers and Risk Managers in rigorous testing cycles. Test every workflow path.
*   **Security Penetration Testing:** Hire a third-party security firm to perform deep penetration tests on the application, focusing particularly on role segregation and data leakage points.
*   **Documentation & Training:** Create comprehensive operational manuals, disaster recovery plans, and formal training materials for all user roles.
*   **Go/No-Go Decision:** Final sign-off from internal compliance and risk committees before launch.

---

## 🚀 Key Technical Focus Areas (Implementation Tips)

| Area | Recommendation | Implementation Details |
| :--- | :--- | :--- |
| **User Experience (UX)** | Keep the interface highly guided. | For complex processes like RCA, do not present a blank form. Use wizards that ask step-by-step questions ("What is the symptom? $\rightarrow$ What is the possible cause? $\rightarrow$ How can we test this?"). |
| **Data Modeling** | Implement Scoring Engines. | Don't just store scores (High/Medium/Low). Store the *inputs* to the score (Impact Value, Likelihood Value) so that when an auditor asks, "Why is this risk High?", you can show the calculation. |
| **External Data Feed** | Plan for integration points. | If your firm uses ticketing systems (Jira, ServiceNOW) or vulnerability scanners, build APIs now to feed data automatically into the Risk Register, saving manual entry time and increasing accuracy. |
| **GDPR/ICO Compliance** | Build consent management into the database model. | For personal data (PII) used in assessments, ensure you track explicit legal basis for processing, retention policies, and clear deletion workflows. |

---

## Summary Checklist & Deliverables

### ✅ Before Writing Code:
*   $\square$ Finalized GRC Data Model (MS SQL Schema).
*   $\square$ Detailed User Workflow Maps (for internal users).
*   $\square$ Defined Role-Based Access Control Matrix (RBAC).

### 💻 Core Code Modules:
1.  **Authentication:** OAuth2/Entra ID Integration.
2.  **Asset & Risk Management:** Full CRUD workflows with automated scoring.
3.  **Control Management:** Mapping and evidence collection system.
4.  **Analytics Engine:** Python layer feeding the dashboard metrics.
5.  **External API Gateway:** Restricted, audited endpoints for clients.

### 📜 Documentation Deliverables:
*   Standard Operating Procedures (SOP) for using the tool.
*   Data Retention Policy Manual.
*   Audit Trail/Logging Requirements Document (Crucial for FCA).