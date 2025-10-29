# Travel Expense Tracker

A modern web application to track travel expenses with AI-powered receipt scanning.

## Features

- 📊 **Dashboard**: View total spend by category and daily expense summaries
- 📝 **Expense List**: Chronologically organized list of all expenses
- 📸 **Receipt Scanning**: Upload receipt images and automatically extract expense details using OCR
- ✅ **Smart Extraction**: AI-powered extraction of amount, merchant name, and date
- 🗑️ **Delete Expenses**: Remove individual expense records
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Add an Expense**: Click the floating "+" button on the dashboard
2. **Upload Receipt**: Select a receipt image file
3. **Review & Edit**: The app will automatically extract amount, merchant, and date. Review and edit as needed
4. **Select Category**: Choose the appropriate expense category
5. **Save**: Click "Save Expense" to add it to your records

## Technical Details

- **Framework**: Next.js 14 with React
- **OCR**: Tesseract.js for optical character recognition
- **Storage**: Local Storage (browser-based, no backend required)
- **Styling**: Tailwind CSS
- **Date Handling**: date-fns

## Project Structure

```
app/
├── page.tsx          # Dashboard (home page)
├── expenses/
│   └── page.tsx     # Expenses list page
├── add/
│   └── page.tsx     # Add expense page
├── types.ts         # TypeScript types and constants
├── utils/
│   ├── storage.ts   # Local storage utilities
│   └── ocr.ts       # OCR and receipt parsing logic
└── globals.css      # Global styles

```

## Development

- All data is stored locally in the browser's localStorage
- No authentication required
- No backend server needed for MVP

## Future Enhancements

- Export expenses to CSV/PDF
- Multiple currency support
- Trip grouping
- Cloud sync
- Advanced receipt parsing with better accuracy

