import { ApplicationError } from '@/protocols';

export function cannotBuyMoreThanOneTicketError(): ApplicationError {
  return {
    name: 'CannotBuyMoreThanOneTicketError',
    message: 'User cannot buy more than one ticket.',
  };
}
