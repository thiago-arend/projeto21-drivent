import { ApplicationError } from '@/protocols';

export function userHasNoTicketIdError(): ApplicationError {
  return {
    name: 'UserHasNoTicketIdError',
    message: 'User has no ticketId.',
  };
}
