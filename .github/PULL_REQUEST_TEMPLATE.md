## Description
Brief description of the changes in this PR.

## Type of Change
Please delete options that are not relevant.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Database schema change
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement
- [ ] Security fix

## Related Issue
Fixes #(issue number)

## Changes Made
List the main changes:
- Change 1
- Change 2
- Change 3

## API Changes
If this PR adds or modifies API endpoints, list them:

### New Endpoints
- `[METHOD] /v1/resource` - Description

### Modified Endpoints
- `[METHOD] /v1/resource` - What changed

### Removed Endpoints
- `[METHOD] /v1/resource` - Reason for removal

## Database Changes
If this PR includes database changes:

- [ ] Prisma schema updated
- [ ] Migration files created
- [ ] Seed data updated (if needed)

```prisma
// Describe schema changes
```

## Testing
Describe how you tested these changes:

### Manual Testing
```bash
# Example API calls to test the changes
curl -X POST http://localhost:3000/v1/endpoint \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Test Results
- [ ] All existing tests pass
- [ ] New tests added (if applicable)
- [ ] Tested with Postman/curl
- [ ] Tested with admin dashboard (if applicable)

## Checklist
Please check all that apply:

- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have removed all console.log() statements
- [ ] TypeScript compilation passes (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] I have updated the API documentation (if needed)
- [ ] Database migrations are reversible (if applicable)

## Security Checklist
If this PR handles sensitive data or authentication:

- [ ] Input validation implemented
- [ ] SQL injection protection verified
- [ ] XSS protection verified
- [ ] Authentication/authorization checks added
- [ ] Sensitive data is not logged
- [ ] No hardcoded secrets or credentials

## Performance Impact
Does this PR affect performance?

- [ ] No impact
- [ ] Minor improvement
- [ ] Significant improvement
- [ ] Potential degradation (explain below)

## Breaking Changes
If this PR introduces breaking changes, describe them here:

### Migration Path
Provide instructions for users to migrate:

```bash
# Example migration commands
```

## Dependencies
Does this PR add any new dependencies?

- [ ] No new dependencies
- [ ] New production dependencies (list below)
- [ ] New development dependencies (list below)

### New Dependencies
- `package-name@version` - Reason for adding

## Deployment Notes
Any special instructions for deployment?

- [ ] Requires environment variable changes
- [ ] Requires database migration
- [ ] Requires service restart
- [ ] None

### Environment Variables
If new environment variables are needed:

```env
NEW_VAR=value  # Description
```

## Screenshots/Logs
If applicable, add screenshots of API responses or server logs.

## Additional Notes
Add any additional notes, concerns, or questions for reviewers.
