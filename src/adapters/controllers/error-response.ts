import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Sends the standard error envelope `{ status, success: false, message }`.
 * Domain exceptions carry their HTTP status in `statusCode`; anything else
 * is reported as 400, like the existing controllers do.
 */
export const sendError = (res: Response, error: unknown): void => {
  const statusCode =
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof error.statusCode === 'number'
      ? error.statusCode
      : HttpStatus.BAD_REQUEST;
  const message = error instanceof Error ? error.message : String(error);

  res.status(statusCode).send({ status: statusCode, success: false, message });
};
