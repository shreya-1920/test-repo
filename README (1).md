# CampusAV — College AV Equipment Rental System

CampusAV is a full-stack web application for managing a college's audiovisual (AV) equipment rental process.

The system replaces a paper-based register with a centralized digital workflow for checking equipment availability, creating rental requests, tracking due dates, processing returns, calculating late fees, and determining refundable deposits.

## Problem

A college AV room has multiple units of equipment such as:

- DSLR / mirrorless cameras
- Projectors
- Wireless microphones
- Tripods

A paper register can become stale because it does not reliably reflect which units are currently available or already booked.

CampusAV provides a live inventory and rental record system so students and administrators can track equipment digitally.

## Core Features

### Equipment Management

- View all AV equipment.
- View total and currently available quantity.
- Categorize equipment.
- Add new equipment.
- Store refundable security deposit.
- Store late fee per day per unit.

### Rental Management

- Create a rental request with borrower name and email.
- Select the equipment and quantity.
- Select borrow and due dates.
- Calculate the required security deposit automatically.
- Track active and returned rentals.
- Enforce a maximum of 3 active rental records per borrower.
- Check availability for the requested date range.

### Date-wise Availability

The application does not simply reject a rental because another rental exists for the same equipment.

For overlapping rental periods, it calculates the quantity already booked and checks whether enough units remain:

`remaining units = total quantity - overlapping booked quantity`

This allows different units of the same equipment to be rented by different people during the same period.

### Returns

When equipment is returned:

- Return date is recorded.
- Late days are calculated.
- Late fee is calculated per day and per unit.
- Refund is calculated as:

`refund = max(0, deposit - late fee)`

- Equipment quantity is returned to available inventory.
- Rental status changes to `returned`.

### Validation

- Equipment must exist.
- Requested quantity cannot exceed available quantity for the requested dates.
- Due date cannot be before borrow date.
- A borrower cannot have more than 3 active rental records.

## Technology Stack

### Frontend

- React
- Vite
- Tailwind CSS
- react-hot-toast

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS
- dotenv

### Development

- GitHub Codespaces
- GitHub
- MongoDB Atlas

## Project Structure

```text
test-repo/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── models/
│   │   ├── Equipment.js
│   │   ├── Rental.js
│   │   └── User.js
│   ├── routes/
│   │   ├── equipmentRoutes.js
│   │   └── rentalRoutes.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
├── README.md
├── REASONING.md
├── AI_LOGS.md
└── .gitignore
```

## Running Locally

### Backend

```bash
cd server
npm install
npm run dev
```

The API runs on:

```text
http://localhost:5000
```

### Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

The Vite development server runs on port `5173`.

The frontend uses the Vite proxy, so API requests use:

```text
/api
```

instead of hard-coding the backend URL.

## Main API Endpoints

### Equipment

```text
GET    /api/equipment
GET    /api/equipment/:id
POST   /api/equipment
```

### Rentals

```text
GET    /api/rentals
POST   /api/rentals
PUT    /api/rentals/:id/return
```

## Rental Flow

```text
View Equipment
      ↓
Select Equipment
      ↓
Enter Borrower Details
      ↓
Select Quantity + Dates
      ↓
Check Date-wise Availability
      ↓
Create Rental Request
      ↓
Inventory Availability Updates
      ↓
Return Equipment
      ↓
Calculate Late Fee
      ↓
Calculate Refund
      ↓
Restore Available Quantity
```

## Example Business Rules

For an equipment type with 8 total units:

- Existing overlapping rentals = 2 units
- New request = 2 units
- Remaining units for those dates = 6

The new request is therefore allowed.

If a new request requires 7 units instead, it is rejected because only 6 units remain for the selected dates.

## Security / Configuration

Environment variables are stored in `.env` and are excluded from Git using `.gitignore`.

Example:

```text
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

Do not commit real credentials or secrets.

## Testing Completed

The implemented workflow has been manually tested for:

- Equipment creation
- Equipment availability
- Multiple-unit rentals
- Date-overlap quantity checking
- Borrowing limit
- Normal return
- Late return
- Late fee calculation
- Deposit refund calculation
- Toast-based success/error feedback

Example late-return test:

- Due date: 12 Sept 2026
- Return date: 16 Sept 2026
- Deposit: ₹500
- Late fee: ₹250
- Refund: ₹250

## Future Improvements

With more development time, the system could be extended with:

- Authentication and role-based admin access
- Admin approval/rejection screens
- Email notifications
- Reservation cancellation
- Equipment maintenance status
- Audit history
- Dashboard analytics
- More granular borrowing limits based on total units rather than rental transactions

## Assessment Priorities

The implementation prioritizes the main requested workflow:

1. Borrowing
2. Availability
3. Returns
4. Late fees and deposits
5. Borrowing limits
6. User-facing feedback and documentation

