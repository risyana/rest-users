### Introduction

This is a REST API which serve the user management system. Currently only one resource available (which is : Users information)

### Pre-Installation

Please ensure these were installed :
* Node
* Git

### Installation

* Clone this repo to your local machine
* run `npm install` in root folder.

### Development server

* run `npm start` in root folder. It will start the development server in port 2121

### API

Please check following resources description :

| Resources | Verb | Description   |
|----------|------------|------|
| /users |   GET       |  Get all users |
| /users |   POST  |  Register new user |
| /users/{id} |    GET  |    Get one user |
| /users/{id} |  PATCH|    Update specific user |
| /users/{id} |  DELETE|  Delete specific user |
| /users/signin |   POST|   User sign in|


### Example URL:

http://localhost:2121/users

http://localhost:2121/users/1

### Front End Side

Please visit this repo : https://github.com/risyana/frontend-users

