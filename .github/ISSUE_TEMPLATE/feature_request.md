---
name: Feature Request
about: Suggest a new API feature or endpoint
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem Statement
Is your feature request related to a problem? Please describe.
Ex. I'm always frustrated when [...]

## Proposed Solution
A clear and concise description of what you want to happen.

### API Endpoint Design
If proposing a new endpoint:

**Endpoint**: `[METHOD] /v1/resource`

**Request Body**:
```json
{
  "field": "value"
}
```

**Response**:
```json
{
  "success": true,
  "data": {}
}
```

## Use Case
Describe the use case for this feature. Who will benefit from it?

## Database Changes
If this requires database schema changes, describe them:

```prisma
model NewModel {
  id String @id @default(cuid())
  // fields...
}
```

## Security Considerations
Are there any security concerns with this feature?
- [ ] Requires authentication
- [ ] Requires admin role
- [ ] Handles sensitive data
- [ ] None

## Alternatives Considered
A clear and concise description of any alternative solutions you've considered.

## Additional Context
Add any other context, code examples, or API documentation about the feature request.

## Breaking Changes
Will this introduce any breaking changes to existing endpoints?
- [ ] Yes - Describe them
- [ ] No

## Priority
How important is this feature?
- [ ] Critical - Blocking development
- [ ] High - Important for next release
- [ ] Medium - Nice to have
- [ ] Low - Future enhancement
