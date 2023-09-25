import { ApplicationError } from '@/protocols';

export function cannotGetTicketIfEnrollmentNotExistsError(): ApplicationError {
  return {
    name: 'CannotGetTicketIfEnrollmentNotExistsError',
    message: 'User cannot get ticket because he is not enrolled in the event.',
  };
}
