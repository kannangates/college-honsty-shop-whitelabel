# Getting Started

Welcome to the Student Access Login System! This guide will help you get up and running quickly.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**
- **Supabase account** (free tier available)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd student-access-login
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note**: This project uses some packages that may require the `--legacy-peer-deps` flag due to version conflicts. If you encounter issues, run:

```bash
npm install --legacy-peer-deps
```

### Step 3: Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Developer Backdoor Login (for development only)
VITE_BACKDOOR_ENABLED=true
VITE_BACKDOOR_USERNAME=admin
VITE_BACKDOOR_PASSWORD=admin123
```

### Step 4: Start Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:5173](http://localhost:5173).

## 🔑 Authentication

### Student Login
Students can log in using their student ID and password provided by the institution.

### Developer Login (Backdoor)
For development and testing purposes, you can use the backdoor login:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Important**: This backdoor login should only be used in development. It will be automatically disabled in production builds.

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:ci` | Run tests in CI mode |
| `npm run audit:performance` | Run performance audit |

## 🧪 Testing

The project includes comprehensive testing infrastructure:

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (recommended for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **Hook Tests**: Test custom React hooks
- **Accessibility Tests**: Ensure WCAG compliance

### Writing Tests

Tests are located in `__tests__` folders alongside the components they test. The project uses:

- **Jest** as the test runner
- **React Testing Library** for component testing
- **jest-axe** for accessibility testing

Example test structure:
```typescript
// src/components/auth/__tests__/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import { LoginForm } from '../LoginForm';

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/student id/i)).toBeInTheDocument();
  });
});
```

## 📊 Performance Monitoring

### Running Performance Audit

```bash
# Build the project first
npm run build

# Run performance audit
npm run audit:performance
```

This will generate:
- Lighthouse performance reports
- Core Web Vitals analysis
- Accessibility compliance check
- Performance budget validation

### Performance Targets

The application targets these performance metrics:

- **First Contentful Paint (FCP)**: < 2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Performance Score**: > 90
- **Accessibility Score**: > 95

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin-specific components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── dashboard/      # Dashboard components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
├── routes/             # Route definitions
├── utils/              # Utility functions
├── test/               # Test utilities and setup
└── integrations/       # External service integrations
```

## 🎨 UI Components

The project uses **shadcn/ui** for all UI components, providing:

- **Consistent Design**: All components follow the same design system
- **Accessibility**: WCAG 2.1 compliant components
- **TypeScript**: Full type safety
- **Customization**: Easy theming and customization

### Key Components

- **DataTable**: Advanced table with sorting, filtering, and pagination
- **Dialog**: Modal dialogs for forms and confirmations
- **Form**: React Hook Form integration with validation
- **Button**: Consistent button styling and variants
- **Input**: Form inputs with validation states
- **Toast**: Notification system using Sonner

## 🔧 Development Guidelines

### Code Quality

- **TypeScript**: Use strict type checking
- **ESLint**: Follow code quality rules
- **Prettier**: Consistent code formatting
- **Testing**: Write tests for new features

### Component Development

1. **Use shadcn/ui components** when possible
2. **Write TypeScript interfaces** for all props
3. **Add accessibility attributes** (aria-labels, roles)
4. **Write tests** for component functionality
5. **Follow naming conventions** (PascalCase for components)

### State Management

- **React Context** for global state
- **React Hook Form** for form state
- **SWR** for server state management
- **Local state** for component-specific state

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to your hosting provider
# The built files are in the 'dist' directory
```

## 🐛 Troubleshooting

### Common Issues

**Installation Issues**
```bash
# If npm install fails, try:
npm install --legacy-peer-deps
```

**TypeScript Errors**
```bash
# Check for type errors
npm run type-check
```

**Test Failures**
```bash
# Clear Jest cache
npm run test -- --clearCache
```

**Build Issues**
```bash
# Clear build cache
rm -rf node_modules/.vite
npm run build
```

### Getting Help

- Check the [documentation](./README.md)
- Review the [troubleshooting guide](./development/troubleshooting.md)
- Contact the development team

## 📈 Next Steps

After getting started, consider:

1. **Explore the Documentation**: Read the user guides for students and admins
2. **Run Tests**: Ensure everything is working correctly
3. **Performance Audit**: Check your application's performance
4. **Customization**: Modify the configuration for your needs
5. **Deployment**: Deploy to your preferred hosting platform

## 🤝 Contributing

We welcome contributions! Please see the [Contributing Guide](./CONTRIBUTING.md) for details on:

- Code style guidelines
- Testing requirements
- Pull request process
- Development workflow

---

Happy coding! 🎉 