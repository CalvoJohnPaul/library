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
  - `type` (_admin_, _member_)
  - `name`
  - `email`
  - `image`
  - `password`
  - `studentId`
  - `firstName`
  - `lastName`
  - `course`
  - `yearAndSection`
  - `dateTimeCreated`
  - `dateTimeUpdated`
