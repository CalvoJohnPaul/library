# Library

## Schema

- **Book**
  - `id`
  - `title`
  - `author`
  - `genre`
  - `yearPublished`
  - `image`
  - `dateTimeCreated`
  - `dateTimeUpdated`
- **BookCopy**
  - `id`
  - `isbn`
  - `bookId`
  - `status` (_available_, _borrowed_)
  - `dateTimeCreated`
  - `dateTimeUpdated`
- **Transaction**
  - `id`
  - `type` (_borrow_, _return_)
  - `accountId`
  - `bookCopyId`
  - `dateTimeCreated`
- **Account**
  - `id`
  - `type` (_admin_, _student_)
  - `name`
  - `image`
  - `username`
  - `password`
  - `studentId`
  - `course`
  - `yearAndSection`
  - `dateTimeCreated`
  - `dateTimeUpdated`
