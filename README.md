This project is 'Alumni Meet- Rest Api'
Getting started

# To get the Node server running locally:

    Clone this repo
    @ npm install to install all required dependencies
    @ Create MongoDb Cluster and Get Connection MongoDb URI
    @ Set environment variables in config.env under ./config/env
        # Server Variables
            PORT = 
            NODE_ENV =
        # MongoDB Variables
            MONGO_URI = 
        # Json Web Token
            JWT_SECRET_KEY = 
            JWT_EXPIRE =
        #Token Cookie
            COOKIE_EXPIRE =
        #Reset Password
            RESET_PASSWORD_EXPIRE =
        #SendGrid Mail
            SENDGRID_API_KEY =
            SENDGRID_MAIL = 
    @ npm run dev to start the local server

### Code Overview
# Dependencies

    expressjs - The server for handling and routing HTTP requests
    jsonwebtoken - For generating JWTs used by authentication
    mongoose - For modeling and mapping MongoDB data to JavaScript
    bcryptjs - Hashing Password
    dotenv - Zero-Dependency module that loads environment variables
    multer - Node.js middleware for uploading files
    @sendgrid/mail - Send e-mails from Node.js

# Application Structure

    server.js - The entry point to our application. This file defines our express server and connects it to MongoDB using mongoose. It also inncludes the routes we'll be using in the application.
    config/ - This folder contains configuration for central location environment variables and other configurations.
    routes/ - This folder contains the route definitions (answer, question etc. ) for our API.
    models/ - This folder contains the schema definitions for our Mongoose models (User, Question).
    controllers/ - This folder contains controllers for our API.
    public/ - This folder contains static files for our API.
    middlewares/ - This folder contains middlewares for our API.
    helpers/ - This folder contains helper functions for adapting 3rd party libraries for our API.
    
# Error Handling

In middlewares/errors/errorHandler.js, we define a error-handling middleware for handling Mongoose's errors and our own errors.

# Authentication

Requests are authenticated using the Authorization header and value Bearer: {{token}}. with a valid JWT.

We define express middlewares in middlewares/authorization/auth.js that can be used to authenticate requests. The required middlewares returns 401 or 403.
