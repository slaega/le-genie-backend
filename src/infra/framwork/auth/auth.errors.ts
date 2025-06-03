export class AuthErrors {
  static readonly INVALID_CREDENTIALS = {
    code: 'AUTH-001',
    message: 'Invalid credentials.',
  };
  static readonly USER_NOT_FOUND = {
    code: 'AUTH-002',
    message: 'User not found.',
  };
  static readonly EMAIL_ALREADY_EXISTS = {
    code: 'AUTH-003',
    message: 'Email already exists.',
  };
  static readonly INVALID_TOKEN = {
    code: 'AUTH-004',
    message: 'Invalid token.',
  };
  static readonly TOKEN_EXPIRED = {
    code: 'AUTH-005',
    message: 'Token expired.',
  };
  static readonly UNAUTHORIZED = {
    code: 'AUTH-006',
    message: 'Unauthorized.',
  };
  static readonly ACCESS_DENIED = {
    code: 'AUTH-007',
    message: 'Access denied.',
  };
  static readonly USER_NOT_VERIFIED = {
    code: 'AUTH-008',
    message: 'User not verified.',
  };
  static readonly USER_ALREADY_VERIFIED = {
    code: 'AUTH-009',
    message: 'User already verified.',
  };
  static readonly INVALID_REFRESH_TOKEN = {
    code: 'AUTH-010',
    message: 'Invalid refresh token provided.',
  };
  static readonly UNKNOWN_ERROR = {
    code: 'AUTH-099',
    message: 'Unknown error.',
  };
}
