import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny | any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (schema.shape?.body || schema.shape?.params || schema.shape?.query) {
                await schema.parseAsync({
                    body: req.body,
                    query: req.query,
                    params: req.params,
                });
            } else if (schema.parse && typeof schema.parse === 'function') {
                await schema.parseAsync(req.body);
            } else {
                return next();
            }
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: "Erro de validação",
                    errors: error.issues.map(e => ({
                        path: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            console.error('Erro na validação:', error);
            return res.status(500).json({ message: "Erro interno no servidor" });
        }
    };
};