export const mustLogin = (_req, admin = false) => {
  if (_req.session.user) {
    if (_req.session.user.admin === admin) {
      return true;
    }
  }

  return false;
};

export const escapeHTML = (str) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return str.replace(/[&<>"']/g, (m) => map[m]);
};

export const sanitize = (_req, _res, next) => {
  Object.keys(_req.body).forEach((key) => {
    if (typeof _req.body[key] === 'string') _req.body[key] = escapeHTML(_req.body[key].trim().replace(/[ \t]{2, }/g, ' '));
  });

  Object.keys(_req.query).forEach((key) => {
    if (typeof _req.query[key] === 'string') _req.query[key] = escapeHTML(_req.query[key].trim().replace(/[ \t]{2, }/g, ' '));
  });

  next();
};

export const querify = (string) => new RegExp(string.trim().replace(/\s+/, ' ').split(' ').join('|'), 'i');
