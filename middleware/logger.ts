import type { Request, Response, NextFunction } from 'express';

export const logRequest = (req: Request, res: Response, next: NextFunction) => {
    console.log(`📥 [${req.method}] ${req.path}`);
    console.log('  Headers:', req.headers);
    console.log('  Body:', req.body);
    console.log('  Files:', req.file);
    next();
};