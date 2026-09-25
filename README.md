# Library

## Schema

- Book
  - id
  - title
  - author
  - genre
  - yearPublished
  - image
  - dateTimeCreated
  - dateTimeUpdated
- BookCopy
  - id
  - isbn
  - bookId
  - status (available, borrowed)
  - dateTimeCreated
  - dateTimeUpdated
- Transaction
  - id
  - type (borrow, return)
  - accountId
  - bookCopyId
  - dateTimeCreated
- Account
  - id
  - type (admin, member)
  - name
  - email
  - image
  - password
  - studentId
  - firstName
  - lastName
  - course
  - yearAndSection
  - dateTimeCreated
  - dateTimeUpdated
