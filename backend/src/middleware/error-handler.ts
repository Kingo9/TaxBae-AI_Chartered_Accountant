import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ValidationError } from 'express-validator';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  error: CustomError | Prisma.PrismaClientKnownRequestError | ValidationError[],
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this information already exists',
          details: error.meta,
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not Found',
          message: 'The requested resource was not found',
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Foreign key constraint failed',
        });
      default:
        return res.status(500).json({
          error: 'Database Error',
          message: 'A database error occurred',
          code: error.code,
        });
    }
  }

  // Validation errors
  if (Array.isArray(error) && error.length > 0 && 'msg' in error[0]) {
    return res.status(400).json({
      error: 'Validation Failed',
      message: 'Invalid input data',
      details: error.map((err: any) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  }

  // Custom errors with status codes
  if ((error as CustomError).statusCode) {
    return res.status((error as CustomError).statusCode!).json({
      error: error.name || 'Error',
      message: error.message,
    });
  }

  // Default server error
  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Something went wrong on our end',
  });
};
