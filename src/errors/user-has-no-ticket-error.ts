import { ApplicationError } from '@/protocols';

export function userHasNoTicketError(): ApplicationError {
  return {
    name: 'UserHasNoTicketError',
    message: 'User has no ticket.',
  };
}
