import { ApplicationError } from '@/protocols';

export function cannotCreateBookingError(): ApplicationError {
  return {
    name: 'CannotCreateBookingError',
    message: 'User must have an in-person ticket, which includes accommodation and is paid.',
  };
}
