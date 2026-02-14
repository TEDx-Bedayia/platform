# CONTRIBUTING GUIDELINES - READ BEFORE YOU START

### 🚨 CRITICAL WARNING FOR FUTURE TEAMS
**DO NOT CREATE A NEW REPOSITORY FOR THIS PROJECT.**

This repository is tightly coupled with our production infrastructure (Vercel) and domain configurations.
* ❌ **If you clone this to a new repo:** The website will stop updating, and you will break the SSL certificates and domain connection.
* ✅ **Instead:** You should request access to **this specific repository** from your team head or mentor.

---

### 🛠 How to Work on This Project

#### 1. The Golden Rule: PROTECT `main`
The `main` branch is the **Live Website**.
* **NEVER** push directly to `main`.
* **ALWAYS** create a new branch for your features.

#### 2. How to Submit Changes (The Workflow)
1.  **Create a Branch:**
    ```bash
    git checkout -b feature/my-new-feature
    ```
2.  **Code & Push:**
    ```bash
    git push origin feature/my-new-feature
    ```
3.  **Open a Pull Request (PR):**
    * Go to the "Pull Requests" tab on GitHub.
    * Create a new PR from your branch to `main`.
    * **Request Review:** Assign the Team Head to review your code.

#### 4. Merging
* Once approved, the Team Head will merge your PR.
* **Vercel will automatically deploy** the new version to the live site immediately.

---

*Keep the legacy alive. Don't break the build.*
