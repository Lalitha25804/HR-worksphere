module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      // 🔴 Check auth first
      if (!req.user || !req.user.role) {
        return res.status(401).json({
          error: "Unauthorized: No user data"
        });
      }

      // 🔥 FIX: Flatten roles (handles ["HR","Manager"] AND "HR","Manager")
      const roles = allowedRoles
        .flat() // ✅ removes nested array issue
        .map(role => String(role).trim().toLowerCase());

      const userRole = String(req.user.role).trim().toLowerCase();

      // 🔴 Validate roles input (debug safety)
      if (roles.length === 0) {
        return res.status(500).json({
          error: "No roles defined in middleware"
        });
      }

      // 🔴 Check access
      if (!roles.includes(userRole)) {
        return res.status(403).json({
          error: `Access denied for role: ${req.user.role}`
        });
      }

      // ✅ Allowed
      next();

    } catch (err) {
      console.error("ROLE MIDDLEWARE ERROR:", err);
      res.status(500).json({
        error: "Server error in role middleware"
      });
    }
  };
};