import { ApplicationError } from '@/protocols';

export function cannotBuyTicketIfEnrollmentNotExistsError(): ApplicationError {
  return {
    name: 'CannotBuyTicketIfEnrollmentNotExistsError',
    message: 'User cannot buy ticket because he is not enrolled in the event.',
  };
}
