# Server Setup Instructions

## Installation

1. Install Node.js dependencies:
```bash
npm install
```

2. Create a `.env` file in the project root with the following content:
```env
# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Email address to receive notifications
NOTIFICATION_EMAIL=your-email@gmail.com

# Server Port
PORT=3000
```

3. Configure your email settings in `.env`:
   - For Gmail, you'll need to use an App Password (not your regular password)
   - Go to Google Account > Security > 2-Step Verification > App passwords
   - Generate an app password and use it in `SMTP_PASS`
   - Set `SMTP_USER` to your Gmail address
   - Set `NOTIFICATION_EMAIL` to the email address where you want to receive notifications

## Running the Server

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

## API Endpoint

- `POST /api/consultation` - Submits consultation form data
  - Body: `{ name, email, phone, country, employees }`
  - Saves data to `consultations.json`
  - Sends email notification

## Data Storage

All consultation submissions are saved to `consultations.json` in the project root.

