import { ticketsService } from "@/services/tickets-service";
import { Request, Response } from "express";
import httpStatus from "http-status";

async function getTicketsTypes(req: Request, res: Response): Promise<void> {
    const ticketsTypes = await ticketsService.getTicketsTypes();
    res.status(httpStatus.OK).send(ticketsTypes);
}

export const ticketsController = { getTicketsTypes };