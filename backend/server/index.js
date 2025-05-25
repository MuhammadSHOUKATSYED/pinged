const express = require("express");
const cors = require("cors");
const {authenticate} = require("./middleware/middleware");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', require('./apis/auth')); // Login, signup, etc.

// Protected routes
app.use('/api/comments', authenticate, require('./apis/comments'));
app.use('/api/follow', authenticate, require('./apis/follow'));
app.use('/api/likes', authenticate, require('./apis/likes'));
app.use('/api/posts', authenticate, require('./apis/posts'));
app.use('/api/replies', authenticate, require('./apis/replies'));
app.use('/api/shares', authenticate, require('./apis/shares'));

// Protected admin routes
app.use('/api/users', authenticate, require('./apis/users'));

app.listen(5000, () => {
  console.log("Server is running on port 5000");
});