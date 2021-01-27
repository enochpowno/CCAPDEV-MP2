export const mustLogin = (_req, admin = false) => {
  if (_req.session.user) {
    if (_req.session.user.admin === admin) {
      return true;
    }
  }

  return false;
};

export const querify = (string) => new RegExp(string.trim().replace(/\s+/, ' ').split(' ').join('|'), 'i');
