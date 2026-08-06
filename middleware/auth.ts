import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UsuarioMongo } from '../model/usuarioMongo.js';

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token não fornecido"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: string };

        const user = await UsuarioMongo.findById(decoded.id).select('-senha');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Usuário não encontrado"
            });
        }

        const userObject = user.toObject();

        req.user = {
            ...userObject,
            id: userObject._id,
            nome: userObject.nome,
            email: userObject.email,
            tipo_usuario: userObject.tipo_usuario,
            status: userObject.status || 'Ativo',
            proxima_medicacao: userObject.proxima_medicacao || '',
            diagnostico: userObject.diagnostico || '',
            observacoes: userObject.observacoes || '',
            ultimaRevisao: userObject.ultimaRevisao || '',
            localizacao: userObject.localizacao,
            pacientesVinculados: userObject.pacientesVinculados || []
        };

        delete req.user.senha;

        next();
    } catch (error) {
        console.error('❌ Erro na autenticação:', error);
        return res.status(401).json({
            success: false,
            message: "Token inválido ou expirado"
        });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Não autenticado"
            });
        }

        const userRole = (req.user.tipo_usuario || '').toLowerCase();
        const allowedRoles = roles.map(r => r.toLowerCase());

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Permissão negada. Requer: ${roles.join(', ')}. Seu role: ${req.user.tipo_usuario}`
            });
        }

        next();
    };
};