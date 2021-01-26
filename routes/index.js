import AR from './AdminRoute';
import UR from './UserRoute';
import MR from './MovieRoute';

export const AdminRoute = AR;
export const UserRoute = UR;
export const MovieRoute = MR;

export const mustLogin = (_req, admin = false) => {
  if (_req.session.user) {
    if (_req.session.user.admin === admin) {
      return true;
    }
  }

  return false;
};
