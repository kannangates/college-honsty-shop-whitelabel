# Shasun College Honesty Shop 🏫

A modern honesty shop management system built specifically for **Shasun College**. This application promotes integrity and trust by allowing students to purchase items on an honor system, tracking their honesty points and badges.

## ✨ Features

### Core Features
- **Self-service shopping**: Students browse and purchase products without a cashier
- **Honesty-based payments**: Multiple payment options including Pay Now and Pay Later
- **Points & Gamification**: Earn honesty points for timely payments
- **Badge System**: Unlock achievement badges based on behavior
- **Real-time Dashboard**: Live statistics on sales, top students, and departments

### Admin Features
- **Inventory Management**: Track shelf and warehouse stock levels
- **Student Management**: Manage student accounts and points
- **Order Management**: View and manage all orders
- **Payment Reports**: Generate detailed payment reports
- **Stock Operations**: Daily stock reconciliation and auditing
- **Audit Logs**: Complete audit trail for admin actions

### Security Features
- **Role-based Access Control**: Admin, Developer, Student, and Teacher roles
- **Row Level Security (RLS)**: Database-level security policies
- **Multi-factor Authentication**: Optional MFA for enhanced security
- **Session Management**: Secure session handling with automatic timeouts

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Supabase (PostgreSQL, Edge Functions, Authentication)
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: React Query (TanStack Query)
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account and project

## 🚀 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd shasun-honesty-shop
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

### 3. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run database migrations**: The migrations in `supabase/migrations/` will set up:
   - User tables with role-based access
   - Product and inventory tables
   - Order management tables
   - Gamification tables (badges, points)
   - RLS policies for security

3. **Configure Authentication**:
   - Go to Authentication → Settings
   - Disable "Confirm email" for faster testing (optional)
   - Set Site URL to your deployment URL

4. **Set up Edge Functions secrets** in Supabase Dashboard → Settings → Functions:
   - `SUPABASE_SERVICE_ROLE_KEY` (Required)
   - `HCAPTCHA_SECRET_KEY` (Optional, for captcha)
   - `GMAIL_*` secrets (Optional, for email notifications)

### 4. Create Initial Admin User

1. Sign up through the application with your college email
2. In Supabase Dashboard → SQL Editor, run:

```sql
-- Update user role to admin
UPDATE public.users 
SET role = 'admin' 
WHERE student_id = 'YOUR_STUDENT_ID';

-- Add to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin' FROM public.users 
WHERE student_id = 'YOUR_STUDENT_ID';
```

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
├── src/
│   ├── components/       # React components
│   │   ├── admin/       # Admin-specific components
│   │   ├── auth/        # Authentication components
│   │   ├── common/      # Shared components
│   │   ├── dashboard/   # Dashboard components
│   │   └── ui/          # UI primitives (shadcn)
│   ├── contexts/        # React contexts (Auth, Product)
│   ├── features/        # Feature modules (gamification)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   │   └── admin/       # Admin pages
│   ├── services/        # API services
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
└── public/              # Static assets
```

## 🔐 User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all features including user management, inventory, and system settings |
| **Developer** | Same as Admin, plus access to developer tools and system diagnostics |
| **Teacher** | Standard access with ability to view reports |
| **Student** | Browse products, make purchases, view own orders and points |

## 🎮 Gamification System

### Points System
- **Immediate Payment**: +10 points
- **Payment within 30 hours**: +8 points
- **Payment within 48 hours**: +5 points
- **Payment within 72 hours**: +2 points
- **Late Payment (after 72h)**: -5 points

### Badges
Badges are awarded based on achievements such as:
- First purchase
- Consistent timely payments
- Department rankings
- Point milestones

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

### Deploy to Netlify

1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Deploy to Vercel

1. Import your repository to Vercel
2. Framework preset: Vite
3. Add environment variables in project settings

### Edge Functions Deployment

Edge functions in `supabase/functions/` are automatically deployed when you push to your Supabase project. Ensure you have:

1. Linked your project: `supabase link --project-ref your-project-id`
2. Set up secrets: `supabase secrets set SECRET_NAME=value`

## 🔧 Configuration

### Email Domain
The application uses `@shasuncollege.edu.in` as the email domain for student authentication. This is configured in `src/services/authService.ts`.

### Points Configuration
Point values are stored in the `points_config` table and can be modified through the admin panel.

### Session Timeout
Default session timeout is configured in the application settings. Modify in `src/config.ts` if needed.

## 📊 Database Schema

Key tables:
- `users` - User profiles and points
- `user_roles` - Role-based access control
- `products` - Product catalog
- `orders` / `order_items` - Order management
- `badges` / `user_badges` - Gamification
- `daily_stock_operations` - Inventory tracking
- `admin_audit_log` - Audit trail

## 🐛 Troubleshooting

### Common Issues

1. **"Failed to load students"**: Ensure edge functions are deployed and secrets are configured
2. **Authentication errors**: Check Supabase authentication settings and email domain
3. **Permission denied**: Verify RLS policies and user roles

### Debug Mode

Check browser console and Supabase logs for detailed error messages.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For technical support or questions, contact the IT department at Shasun College.

---

**Built with ❤️ for Shasun College**

*No Cameras 📷 | No Cashiers 💳 | Just Character 🫡*
