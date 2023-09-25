import { ApplicationError } from '@/protocols';

export function incompletePaymentInformationError(): ApplicationError {
  return {
    name: 'IncompletePaymentInformationError',
    message: 'ticketId and/or cardData is missing in request body.',
  };
}
