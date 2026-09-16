# AI_LOGS.md

# AI-Assisted Development Log



## 1. Assessment Understanding

**Prompt:**

Help me build the Auriga IT Round 2 Builder assessment. The project is a College AV Equipment Rental system. The system needs to manage DSLR cameras, projectors, microphones, tripods and multiple units of each item. It should support availability, borrowing, returns, due dates, late fees, refundable deposits and a limit on how much one person can borrow.

---

## 2. Backend Project Setup

**Prompt:**

Help me set up the backend for this project using Node.js, Express, MongoDB and Mongoose, including the project structure, environment variables, server setup and API routes.

---

## 3. Database Models

**Prompt:**

Create the MongoDB/Mongoose models needed for the AV rental system. I need models for equipment, rentals and users, including quantities, deposits, late fees, borrower details, dates and rental status.

---

## 4. Equipment API

**Prompt:**

Help me create the equipment API so I can add equipment and retrieve all equipment and individual equipment records. When equipment is added, available quantity should initially equal total quantity.

---

## 5. Rental API

**Prompt:**

Help me implement the rental API for creating rental requests and retrieving rental records. The system should validate equipment availability, borrower limits and rental dates.

---

## 6. Date-wise Availability Logic

**Prompt:**

The current overlap logic rejects a rental whenever any rental exists for the same equipment and dates. Change the backend logic so it checks the total quantity already booked during overlapping dates. A new rental should be allowed when enough physical units remain.

---

## 7. Borrowing Limit

**Prompt:**

Add a borrowing limit so that one borrower can have a maximum of 3 active rental records. Pending, approved and borrowed rentals should count as active.

---

## 8. Return Logic

**Prompt:**

Implement the equipment return workflow. When equipment is returned, restore the available quantity, record the return date and change the rental status to returned. Prevent an already returned rental from being returned again.

---

## 9. Late Fee and Deposit Refund

**Prompt:**

Add late-fee and refundable-deposit calculations to the return workflow. Calculate late days from the due date and return date, calculate the fee per day and per unit, and refund the deposit minus the late fee without allowing a negative refund.

---

## 10. Date Validation

**Prompt:**

Add backend validation so that a rental cannot have a due date earlier than its borrow date. Return a clear error message when the dates are invalid.

---

## 11. Frontend UI

**Prompt:**

Create a polished React frontend for the AV equipment rental system with equipment cards, availability information, search, category filters, statistics, borrowing, returning, rental records and an add-equipment form.

---

## 12. Tailwind CSS Setup

**Prompt:**

Help me configure Tailwind CSS with Vite and React for the frontend and set up the Vite API proxy so the frontend can call the backend using /api.

---

## 13. Toast Notifications

**Prompt:**

Replace browser alert messages with react-hot-toast notifications for successful and failed borrowing, returning and equipment creation. Also make sure the Toaster component is placed in the main application layout so notifications work outside the loading state.

---

## 14. Codespaces Port Issue

**Prompt:**

My GitHub Codespaces frontend URL says the page cannot be found. Help me troubleshoot the forwarded port and make sure the Vite frontend is running correctly.

---

## 15. Testing Date-wise Availability

**Prompt:**

Help me test the date-wise availability logic to make sure multiple units of the same equipment can be rented during overlapping dates as long as the total booked quantity does not exceed the total inventory.

---

## 16. Testing Borrowing Limit

**Prompt:**

Help me test the borrowing limit by creating multiple active rentals for the same borrower and verifying that the fourth active rental is rejected.

---

## 17. Testing Return Workflow

**Prompt:**

Help me test the normal return workflow and verify that the equipment quantity is restored, the rental becomes returned and the full deposit is refundable when there is no late fee.

---

## 18. Testing Late Return

**Prompt:**

Help me create a test rental with a past due date so I can verify the late-day calculation, late fee and refundable deposit calculation when the equipment is returned.

---

## 19. Finding Equipment ID

**Prompt:**

How do I get the MongoDB equipment ID so I can use it to create a rental through the API for testing?

---

## 20. Documentation

**Prompt:**

Create complete README.md and REASONING.md files for the assessment. The README should document the problem, features, architecture, technology stack, project structure, APIs, database models, setup, business rules, testing and future improvements. The reasoning document should explain the important technical and business-rule decisions.

---

## 21. Final Assessment Preparation

**Prompt:**

Help me prepare the project for final submission by checking the core workflow, documentation, AI log, Git status and final GitHub repository structure.
