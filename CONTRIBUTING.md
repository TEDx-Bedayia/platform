# CONTRIBUTING GUIDELINES - READ BEFORE YOU START

Hey, congratulations for making it onto the team! Quick reminder to use `npm run dev` while developing to check your changes in real time and fix any bugs before opening a pull request. Don't forget to use the .env file provided by your head.

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

#### 3. Merging
* Once approved, the Team Head will merge your PR.
* **Vercel will automatically deploy** the new version to the live site immediately.

---

*Keep the legacy alive. Don't break the build.*

## Installing Git

### For Windows
1. Download [Git for Windows Installer](https://git-scm.com/install/windows).
2. After it downloads, run it.
3. Click next for the Terms and Conditions.
4. Click next for the installation place.
5. Click next twice until your reach choosing the default editor. Make sure you choose Visual Studio Code or whichever your preferred editor is.
6. Keep clicking next and adjusting any settings you need until you install the software.
7. Verify by opening Command Prompt from the search menu and typing `git --version`. Press enter and it should display the installed git version.

### For MacOS
1. Install [HomeBrew](https://brew.sh/).
2. Open Terminal and type `brew install git`.
3. Once it is done, run `git --version` to verify the installation. It should display the installed git version.