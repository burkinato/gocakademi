# Educational Platform Business Rules

## Authentication Rules
- Users must register with valid email and password
- Password must be at least 8 characters long
- Email must be unique across the system
- Users can have roles: student, instructor, admin
- Admin users have special privileges for system management

## Course Rules
- Only instructors and admins can create courses
- Courses must have title, description, category, and level
- Courses can be published/unpublished by admins and instructors
- Published courses are visible to all users
- Unpublished courses are only visible to instructors and admins

## Enrollment Rules
- Students can enroll in published courses
- Students cannot enroll in the same course twice
- Progress is tracked as percentage (0-100)
- Courses are considered complete when progress reaches 100%

## Review Rules
- Only enrolled students can review courses
- Students can only review each course once
- Rating must be between 1 and 5 stars
- Reviews can include optional comments

## Blog Rules
- Only instructors and admins can create blog posts
- Blog posts must have title, content, and category
- Posts can be published/unpublished
- Published posts are visible to all users

## Security Rules
- All passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Admin operations require admin role
- Database queries use parameterized statements to prevent SQL injection
- CORS is configured to allow only trusted origins