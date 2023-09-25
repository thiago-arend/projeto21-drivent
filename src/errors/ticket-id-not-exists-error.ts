import { ApplicationError } from '@/protocols';

export function ticketIdNotExistsError(): ApplicationError {
  return {
    name: 'TicketIdNotExistsError',
    message: 'ticketId does not exists.',
  };
}
