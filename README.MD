### Pre-Installation

Please ensure these were installed :
* Node
* Git

### Installation

* Fork this repository
* run `npm install` in root folder.

### Development server

* run `npm start` in root folder. It will start the development server in port 2121

### API

Please check following resources description :

| Resources | | Verb |    | Description   |
|----------|:---:|:------------|:----:|------|
| ---------------------- |--| -----------------|--|---------------------------------|
| /users |  |   GET       |     |  Get all users |
| /users | |     POST  |     |   Register new user |
| /users/{id} |  |  GET  |  |  Get one user |
| /users/{id} | |  PATCH|  |  Update specific user |
| /users/{id} | |  DELETE|  |  Delete specific user |
| /users/signin |  |  POST|  |  User sign in|
| ---------------------- |--| -----------------|--|---------------------------------|
Example URL:

* *[localhost:2121/users](localhost:2121/users)*

* *[localhost:2121/users/1](localhost:2121/users/1)*


