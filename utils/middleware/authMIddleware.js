const jwt = require("jsonwebtoken");

// Generate JWT token
function generateToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1w" });
}

// Authenticate JWT token
function authenticateToken(handler) {
  return async (req, res) => {
    const token = req.headers.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user; // Attach the user to the request object
      return handler(req, res); // Proceed to the route handler
    } catch (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
  };
}

async function authenticateUserToken(token) {
  const user = jwt.verify(token, process.env.JWT_SECRET);
  return user;
}

module.exports = { authenticateToken, generateToken, authenticateUserToken };
