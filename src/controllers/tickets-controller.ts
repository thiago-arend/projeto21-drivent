import { AuthenticatedRequest } from "@/middlewares";
import { ticketsService } from "@/services/tickets-service";
import { Response } from "express";
import httpStatus from "http-status";

async function getTicketsTypes(req: AuthenticatedRequest, res: Response): Promise<void> {
    const ticketsTypes = await ticketsService.getTicketsTypes();
    res.status(httpStatus.OK).send(ticketsTypes);
}

type TicketTypeId = {
    ticketTypeId: number
}

async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { ticketTypeId } = req.body as TicketTypeId;
    const { userId } = req;

    const ticketAndType = await ticketsService.create(ticketTypeId, userId);
    res.status(httpStatus.CREATED).send(ticketAndType);
}

export const ticketsController = { getTicketsTypes, create };