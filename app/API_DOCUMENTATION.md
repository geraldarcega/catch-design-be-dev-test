# Customer API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Get Customers (Paginated)

**Endpoint:** `GET /customers`

**Description:** Retrieve a paginated list of customers with optional filtering.

**Query Parameters:**

| Parameter | Type   | Default | Max | Description                          |
|-----------|--------|---------|-----|--------------------------------------|
| `page`    | number | 1       | -   | Page number (minimum: 1)             |
| `limit`   | number | 10      | 100 | Items per page                       |
| `search`  | string | -       | -   | Search by name or email              |
| `gender`  | string | -       | -   | Filter by gender (Male/Female/Other) |

**Example Requests:**

```bash
# Get first page with default limit (10)
GET /customers

# Get page 2 with 25 items
GET /customers?page=2&limit=25

# Search for customers
GET /customers?search=john

# Filter by gender
GET /customers?gender=Female

# Combined filters
GET /customers?page=1&limit=20&search=smith&gender=Male
```

**Response Format:**

```json
{
  "data": [
    {
      "id": "1",
      "first_name": "Laura",
      "last_name": "Richards",
      "email": "laura@example.com",
      "gender": "Female",
      "ip_address": "192.168.1.1",
      "company": "Acme Corp",
      "city": "New York",
      "title": "Software Engineer",
      "website": "www.example.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1001,
    "totalPages": 101,
    "hasNext": true,
    "hasPrevious": false
  }
}
```

### 2. Get Customer by ID

**Endpoint:** `GET /customers/:id`

**Description:** Retrieve a specific customer by their ID.

**Parameters:**

| Parameter | Type   | Description      |
|-----------|--------|------------------|
| `id`      | string | Customer ID      |

**Example Request:**

```bash
GET /customers/1
```

**Response Format:**

```json
{
  "id": "1",
  "first_name": "Laura",
  "last_name": "Richards",
  "email": "laura@example.com",
  "gender": "Female",
  "ip_address": "192.168.1.1",
  "company": "Acme Corp",
  "city": "New York",
  "title": "Software Engineer",
  "website": "www.example.com"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid customer ID"
}
```

### 404 Not Found
```json
{
  "error": "Customer not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Failed to fetch customers",
  "message": "Error details..."
}
```

## Security Features

- **Input Validation:** All inputs are validated and sanitized
- **SQL Injection Prevention:** Parameterized queries prevent SQL injection
- **Rate Limiting:** Consider implementing rate limiting in production
- **CORS:** Configure CORS policies based on your client requirements

## Performance Considerations

- **Caching:** Responses are cached for 60 seconds (list) or 5 minutes (single item)
- **Pagination Limits:** Maximum 100 items per page to prevent overload
- **Database Indexing:** Ensure proper indexes on frequently queried columns