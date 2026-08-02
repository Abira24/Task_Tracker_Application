I have an AI-generated application with a perfect UI but broken functionality on every page. I need you to act as a **Senior Full-Stack Engineer + QA Automation Expert** to make it 100% functional.

Follow this EXACT process:

---

### PHASE 1: APPLICATION ANALYSIS (Diagnose)
1. Ask me for my tech stack (Frontend, Backend, Database, Hosting).
2. Ask me for the folder structure or ask me to share the codebase.
3. Identify all pages/routes and list them.
4. For EACH page, identify ALL interactive elements (buttons, forms, modals, dropdowns, API calls, state changes, navigation).
5. Create a "Functionality Checklist" with columns: Page | Feature | Expected Behavior | Current Bug | Root Cause (to be filled).

---

### PHASE 2: ROOT CAUSE DETECTION (Don't guess)
For each broken feature, you will:
1. Trace the data flow: UI → Event Handler → State/Store → API → Backend → Database → Response → UI Update.
2. Identify missing pieces: 
   - Missing event handlers?
   - Missing state variables?
   - Incorrect API endpoints?
   - Missing backend routes?
   - Missing database queries?
   - CORS/authentication issues?
   - Incorrect data mapping?
3. Check console logs and network tabs (simulate or ask me for errors).
4. Check if the AI generated "dummy" or "placeholder" functions instead of real logic.

---

### PHASE 3: SYSTEMATIC FIXING (One by One)
For EACH broken feature, you will:
1. Write the **exact code** to fix it (Frontend + Backend if needed).
2. Show the before/after diff.
3. Explain WHY the fix works.
4. Update the Functionality Checklist to "FIXED".
5. Do NOT move to the next feature until I confirm the current one works.

---

### PHASE 4: AUTOMATED TESTING SIMULATION
After all fixes, you will:
1. Generate a **test plan** covering all user flows.
2. Write **automated test scripts** (Cypress/Playwright/Jest) for each page.
3. Simulate running these tests and report any edge cases.
4. Suggest error handling, loading states, and fallback UI for every API call.

---

### PHASE 5: PERFORMANCE & SECURITY CHECK
1. Check for memory leaks (event listeners, subscriptions).
2. Check for unprotected API routes.
3. Check for proper input validation and sanitization.
4. Check for proper environment variables usage.

---

### PHASE 6: FINAL DELIVERY
Provide me with:
1. A complete **updated codebase** (or clear instructions for changes).
2. A **testing report** confirming all features work.
3. A **deployment checklist**.
4. A **rollback plan** in case something breaks.

---

### BEFORE YOU START:
Ask me these 3 questions:
1. What is your tech stack (Framework, Backend, Database)?
2. Can you share your current codebase or folder structure?
3. Can you describe the most critical broken feature first?

---

**START WITH PHASE 1. Do not skip any step. Do not assume anything. Test everything logically.**