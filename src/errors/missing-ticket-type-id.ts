import { ApplicationError } from '@/protocols';

export function missingTicketTypeIdError(): ApplicationError {
  return {
    name: 'MissingTicketTypeIdError',
    message: 'The property ticketTypeId is missing!',
  };
}
