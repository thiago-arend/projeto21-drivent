import { Payment, Ticket, TicketType } from '@prisma/client';

export type ApplicationError = {
  name: string;
  message: string;
};

export type RequestError = {
  status: number;
  data: object | null;
  statusText: string;
  name: string;
  message: string;
};

export type ViaCEPAddressError = {
  error: boolean;
};

export type AddressEnrollment = {
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
};

export type CEP = {
  cep: string;
};

export type TicketAndType = Ticket & { TicketType: TicketType };

export type CreateTicket = Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>;

export type PaymentBody = {
  ticketId: number;
  cardData: {
    issuer: string;
    number: number;
    name: string;
    expirationDate: Date;
    cvv: number;
  };
};

export type CreatePayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
