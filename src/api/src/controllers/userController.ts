import type { Request, Response } from "express";

export function register(_req: Request, res: Response) {
  res.status(201).json({ message: "route OK" });
}
