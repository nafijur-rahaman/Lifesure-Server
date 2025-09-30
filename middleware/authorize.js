const authorize = (roles = []) => (req, res, next) => {
  // If roles array is empty, just allow any authenticated user
  if (roles.length && !roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Forbidden: Access denied" });
  }
  next();
};

module.exports = authorize;
