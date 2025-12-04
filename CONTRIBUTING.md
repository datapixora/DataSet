# Contributing to Visual Data Platform API

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Need Help?](#need-help)

## 🤝 Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/DataSet.git
cd DataSet
```

### 3. Add Upstream Remote

```bash
git remote add upstream https://github.com/datapixora/DataSet.git
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch Naming Convention:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding tests
- `chore/` - Maintenance tasks

## 💻 Development Workflow

### 1. Setup Development Environment

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run prisma:generate
npm run db:push

# Start development server
npm run dev
```

### 2. Make Your Changes

- Write clean, readable code
- Follow the coding standards
- Add comments for complex logic
- Update documentation if needed

### 3. Test Your Changes

```bash
# Run tests
npm test

# Check TypeScript
npm run build

# Test API manually
curl http://localhost:3000/v1/health
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add amazing feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create Pull Request

Go to GitHub and create a Pull Request from your branch to `main`.

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all code
- Define interfaces for all data structures
- Avoid `any` type when possible
- Use meaningful variable names

```typescript
// Good
interface UserProfile {
  id: string;
  email: string;
  fullName: string;
}

async function getUserProfile(userId: string): Promise<UserProfile> {
  // ...
}

// Bad
async function getUser(id: any): Promise<any> {
  // ...
}
```

### File Organization

```
src/
├── controllers/    # Handle HTTP requests/responses
├── services/       # Business logic
├── routes/         # API route definitions
├── middleware/     # Express middleware
├── utils/          # Helper functions
└── types/          # TypeScript type definitions
```

**Guidelines:**
- One controller per resource
- Keep controllers thin, move logic to services
- Services should be reusable
- Middleware should be single-purpose

### Error Handling

```typescript
// Use AppError class for consistent errors
throw new AppError(404, 'User not found');

// Handle errors in controllers
try {
  const result = await userService.getUser(userId);
  res.json({ success: true, data: result });
} catch (error) {
  next(error); // Pass to error middleware
}
```

### API Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Error description"
}

// Paginated
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Database

- Use Prisma for all database operations
- Never write raw SQL (use Prisma queries)
- Always use transactions for multi-step operations
- Index frequently queried fields

```typescript
// Good
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { uploads: true }
});

// Use transactions
await prisma.$transaction([
  prisma.upload.update({ ... }),
  prisma.user.update({ ... }),
  prisma.transaction.create({ ... })
]);
```

## ✍️ Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/).

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(uploads): handle missing campaign ID"

# Documentation
git commit -m "docs: update API documentation for campaigns"

# With body
git commit -m "feat(campaigns): add campaign filtering

- Add filter by status
- Add filter by date range
- Add pagination support"
```

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] Self-review of code completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No console.log() statements
- [ ] Tests pass
- [ ] TypeScript compiles without errors

### PR Title Format

```
<type>: <description>
```

Examples:
- `feat: Add campaign search functionality`
- `fix: Resolve upload approval bug`
- `docs: Update contributing guidelines`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
[Add screenshots]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-reviewed
- [ ] Documentation updated
- [ ] Tests added/updated
```

### Review Process

1. Automated checks run (TypeScript, tests)
2. Code review by maintainers
3. Address feedback
4. Approval by 1+ maintainers
5. Merge to main

## 📁 Project Structure

```
visual-data-platform-api/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── campaigns.controller.ts
│   │   └── uploads.controller.ts
│   ├── services/            # Business logic
│   │   ├── auth.service.ts
│   │   ├── campaign.service.ts
│   │   └── upload.service.ts
│   ├── routes/              # API routes
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   └── campaigns.routes.ts
│   ├── middleware/          # Express middleware
│   │   ├── auth.ts
│   │   ├── validation.ts
│   │   └── errorHandler.ts
│   ├── utils/               # Helpers
│   │   ├── validators.ts
│   │   └── helpers.ts
│   └── index.ts             # App entry
├── prisma/
│   └── schema.prisma        # Database schema
└── package.json
```

## 🧪 Testing

### Writing Tests

```typescript
describe('UserService', () => {
  it('should create a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Test@123',
      fullName: 'Test User'
    };

    const user = await userService.createUser(userData);

    expect(user.email).toBe(userData.email);
    expect(user.fullName).toBe(userData.fullName);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test auth.test.ts

# Run with coverage
npm run test:coverage
```

## 🔧 Common Tasks

### Adding a New Endpoint

1. **Create Route** (`src/routes/resource.routes.ts`)
```typescript
router.post('/', authenticate, validate, controller.create);
```

2. **Create Controller** (`src/controllers/resource.controller.ts`)
```typescript
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.create(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
```

3. **Create Service** (`src/services/resource.service.ts`)
```typescript
async create(data: CreateData) {
  return await prisma.resource.create({ data });
}
```

4. **Add Validation** (`src/utils/validators.ts`)
```typescript
export const createValidation = [
  body('field').notEmpty().withMessage('Field is required'),
];
```

### Updating Database Schema

1. **Edit** `prisma/schema.prisma`
2. **Generate migration** (production)
```bash
npx prisma migrate dev --name description
```
3. **Or push directly** (development)
```bash
npm run db:push
```

### Adding Middleware

```typescript
// src/middleware/yourMiddleware.ts
export const yourMiddleware = (req, res, next) => {
  // Your logic
  next();
};

// Use in routes
router.get('/', yourMiddleware, controller.get);
```

## 🐛 Reporting Bugs

Use the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md)

**Include:**
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Screenshots if applicable

## 💡 Requesting Features

Use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md)

**Include:**
- Use case description
- Proposed solution
- Alternatives considered
- Additional context

## 📞 Need Help?

- **Questions**: [GitHub Discussions](https://github.com/datapixora/DataSet/discussions)
- **Bugs**: [GitHub Issues](https://github.com/datapixora/DataSet/issues)
- **Chat**: [Discord](#)
- **Email**: dev@visualdata.com

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [REST API Best Practices](https://restfulapi.net/)

## 🙏 Thank You!

Your contributions make this project better. We appreciate your time and effort!

---

**Happy Coding!** 🚀
