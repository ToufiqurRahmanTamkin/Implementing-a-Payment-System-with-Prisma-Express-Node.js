# Payment System

This project implements a payment system using Prisma, Express, and Node.js. It supports features like auto-payments, Stripe integration, and JWT-based authentication.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)
- A PostgreSQL database (or any other database supported by Prisma)
- A Stripe account

### Installation

1. **Clone the Repository**

   ```sh
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. **Install Dependencies**

`npm install`

3. **Set Up Environment Variables**

```
DATABASE_URL=your-database-url
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret
JWT_SECRET=your-jwt-secret
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-email-app-password
```

4. **Set Up the Database**

`npx prisma migrate dev`

5. **Start the Application**

`npm run dev`

6. **Access the Application**

`http://localhost:3000`
