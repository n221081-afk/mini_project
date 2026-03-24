const ROLE_ALIASES = {
  hr_manager: 'hr',
};

const normalizeRole = (role) => ROLE_ALIASES[role] || role;

const roleMiddleware = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const normalizedUserRole = normalizeRole(req.user.role);
    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }

    req.user.role = normalizedUserRole;
    next();
  };
};

module.exports = roleMiddleware;
