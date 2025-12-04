---
name: Bug Report
about: Create a report to help us improve the API
title: '[BUG] '
labels: bug
assignees: ''
---

## Bug Description
A clear and concise description of what the bug is.

## API Endpoint
Which API endpoint is affected?
- **Method**: [e.g. GET, POST, PUT, DELETE]
- **Endpoint**: [e.g. /v1/campaigns]

## Steps to Reproduce
Steps to reproduce the behavior:
1. Send request to '...'
2. With body '....'
3. See error

## Request Details
Provide the request details:

```bash
curl -X POST https://visual-data-api.onrender.com/v1/endpoint \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"field": "value"}'
```

## Expected Response
What you expected to receive:

```json
{
  "success": true,
  "data": {}
}
```

## Actual Response
What you actually received:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Environment
- **API URL**: [e.g. https://visual-data-api.onrender.com or http://localhost:3000]
- **Node Version**: [e.g. 18.17.0]
- **Database**: [e.g. PostgreSQL 14.x]

## Server Logs
If you have access to server logs, paste relevant error messages:

```
Paste server logs here
```

## Additional Context
Add any other context about the problem here.

## Possible Solution
If you have suggestions on how to fix the bug, please describe them here.

## Database State
If relevant, describe the state of the database when the error occurs.
