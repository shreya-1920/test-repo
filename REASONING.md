# REASONING.md

## 1. Understanding the Problem

The college currently relies on a paper register to track AV equipment. The main issue is that a paper register can become stale when multiple people borrow or return equipment.

The system therefore needs a single source of truth for equipment inventory and rental records.

The most important workflow is:

**availability → borrowing → return**

Deposits, late fees, and borrowing limits are secondary rules built around that workflow.

## 2. Data Model Decisions

Three MongoDB models were used:

### Equipment

The Equipment model stores:

- name
- category
- totalQuantity
- availableQuantity
- deposit
- lateFeePerDay

`totalQuantity` represents the physical number of units owned by the college.

`availableQuantity` represents the current inventory that is not currently checked out.

### Rental

The Rental model stores:

- equipment reference
- borrower name
- borrower email
- quantity
- borrow date
- due date
- return date
- deposit amount
- late fee
- refund amount
- rental status

Keeping the rental as a separate document makes it possible to maintain a history of borrowing and returns.

### User

A simple User model was created with:

- name
- email
- role

The role supports the future distinction between students and administrators.

## 3. Availability Logic

A simple `availableQuantity` check is not enough for future-dated bookings.

Example:

An equipment type has 8 units.

Rental A books 3 units from September 20 to September 22.

Rental B books 2 units from September 21 to September 23.

A new request during September 21–22 must consider both overlapping rentals.

Therefore the backend:

1. Finds active rentals for the same equipment.
2. Filters them to rentals whose dates overlap the requested period.
3. Adds their quantities.
4. Calculates remaining units.
5. Rejects the request only when the requested quantity exceeds the remaining quantity.

The core calculation is:

```text
bookedQuantity = sum(quantity of overlapping active rentals)

remainingForDates = totalQuantity - bookedQuantity
```

This is more accurate than rejecting the request whenever any overlapping rental exists.

## 4. Rental Status

The Rental model supports:

- pending
- approved
- borrowed
- returned
- rejected

The current creation flow starts a request as `pending`.

Active records are considered when enforcing availability and the borrowing limit.

Returned and rejected rentals are excluded from active-rental calculations.

## 5. Borrowing Limit

A maximum of 3 active rental records per borrower was implemented.

The rule is:

```text
active rentals >= 3
→ reject new request
```

The current implementation counts rental transactions rather than individual physical units.

This keeps the rule simple and predictable within the assessment time limit.

A future version could instead limit the total number of units currently borrowed by a person.

## 6. Deposit and Late Fee

The security deposit is calculated from the equipment deposit and requested quantity:

```text
deposit = equipment deposit × quantity
```

When an item is returned, late days are calculated from the due date and actual return date.

The late fee is:

```text
late fee =
late days × late fee per day × quantity
```

The refund is:

```text
refund =
max(0, deposit - late fee)
```

Using `max(0, ...)` prevents the refund from becoming negative.

## 7. Date Validation

A rental with a due date before its borrow date is invalid.

The backend validates:

```text
dueDate >= borrowDate
```

This validation is implemented on the server rather than relying only on the frontend.

## 8. Backend Architecture

Express routes are separated by responsibility:

```text
/api/equipment
/api/rentals
```

Mongoose models handle MongoDB data structures.

The backend also uses:

- CORS
- JSON request parsing
- environment variables
- error responses with HTTP status codes

## 9. Frontend Architecture

The frontend is implemented with React.

The UI includes:

- navigation
- equipment cards
- search
- category filtering
- availability indicators
- rental modal
- equipment creation modal
- rental records
- return actions
- toast notifications

Tailwind CSS was used for responsive styling.

The Vite proxy allows the frontend to call `/api/...` without hard-coding the Codespace's changing forwarded backend URL.

## 10. Error Handling

The API returns meaningful error messages for cases such as:

- equipment not found
- insufficient availability
- overlapping bookings exceeding inventory
- borrowing limit reached
- invalid dates
- rental not found
- equipment already returned

The frontend displays these errors using toast notifications.

## 11. Trade-offs

Because the assessment has a limited implementation window, the solution focuses on the core business workflow instead of implementing a full authentication and administration system.

The most important correctness concerns were prioritized:

1. Inventory
2. Date-wise availability
3. Borrowing
4. Returns
5. Late fees/refunds
6. Borrowing limits

Authentication, advanced admin workflows, notifications, and analytics can be added later.

## 12. Testing Strategy

The system was manually tested through the UI and API.

Important scenarios tested:

### Normal borrowing

A user borrows available equipment and the inventory changes.

### Overlapping bookings

Multiple units of the same equipment can be booked for overlapping dates as long as the total requested quantity does not exceed the physical inventory.

### Borrowing limit

A fourth active rental request from the same borrower is rejected when the maximum is 3.

### Normal return

The equipment is returned and the full deposit is refundable when there is no late fee.

### Late return

A past due date produces a late fee and reduces the refundable deposit.

These tests cover the primary acceptance criteria of the application.
