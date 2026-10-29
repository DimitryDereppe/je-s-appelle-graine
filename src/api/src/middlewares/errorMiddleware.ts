import type { NextFunction, Request, Response } from "express";
import { HttpClientError, NotFoundError } from "../lib/errors.ts";

// aucune route trouvée, on lance une erreur
export function notFoundMiddleware() {
  throw new NotFoundError("Resource not found");
}

// Plusieurs façon d'appeler ce middleware :
// - dans un controlleur en amont, `next(error)`
// - depuis Express 5, il suffit de throw une erreur dans un controlleur async pour que l'erreur soit transmise ici
export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) {
  // 4 arguments, c'est spécifique à Express et c'est obligatoire

  //  Erreurs HttpClientError (../lib/errors.ts)
  // Gère tous les HttpClientError --> attrape toutes les classes filles de HttClientError
  // - ex : throw new NotFoundError()
  // - ex : throw new ConflictError()
  if (error instanceof HttpClientError) {
    console.error("HTTP Client error ", {
      error: error.message,
      status: error.status ?? "",
      stack: error.stack ?? "",
    });

    return res.status(error.status).json({
      error: error.message,
      status: error.status,
    });
  }

  // Si l'erreur arrive à ce stade, il faut la logger avec un niveau approprié

  console.error("HTTP Client error", {
    error: error.message,
    cause: error.cause ?? "",
    stack: error.stack ?? "",
  });

  //  Gérer toutes les erreurs suivantes : code 500
  // Toutes les erreurs non traitées au dessus
  // - ex : la BDD plante
  // - ex : on a fait une erreur de syntaxe
  res.status(500).json({
    error: "Internal server error",
    status: 500,
  });
}
