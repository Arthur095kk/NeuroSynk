import type { Request, Response, NextFunction } from 'express';
import MicroPassos from '../model/micro_Passos.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import { AppError } from '../middleware/errorHandler.js';

function getParamValue(param: string | string[] | undefined, field: string): string {
    if (!param) {
        throw new AppError(`${field} é obrigatório`, 400);
    }
    const value = Array.isArray(param) ? param[0] : param;
    if (!value) {
        throw new AppError(`${field} é obrigatório`, 400);
    }
    return value;
}

export class MicroPassosController {
    async criarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const { descricaoPasso, ordemPasso, idTarefa, idCuidador } = req.body;
            const imagemPassos = req.file ? `/uploads/${req.file.filename}` : '';

            if (!idTarefa) {
                throw new AppError('ID da tarefa é obrigatório', 400);
            }

            const tarefa = await TarefaVisual.findByPk(idTarefa);
            if (!tarefa) {
                throw new AppError('Tarefa não encontrada', 404);
            }

            const microPasso = await MicroPassos.create({
                descricaoPasso,
                ordemPasso,
                imagemPassos,
                idTarefa,
                idCuidador,
                concluido: false
            });

            return res.status(201).json({
                mensagem: 'Micro passo criado com sucesso!',
                dados: microPasso
            });
        } catch (error) {
            next(error);
        }
    }

    async listarMicroPassosPorTarefa(req: Request, res: Response, next: NextFunction) {
        try {
            const tarefaId = getParamValue(req.params.tarefaId, 'tarefaId');
            
            const microPassos = await MicroPassos.findAll({
                where: { idTarefa: tarefaId },
                order: [['ordemPasso', 'ASC']]
            });

            return res.status(200).json(microPassos);
        } catch (error) {
            next(error);
        }
    }

    async atualizarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParamValue(req.params.id, 'id');
            const dados = req.body;
            
            const microPasso = await MicroPassos.findByPk(id);
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            if (req.file) {
                dados.imagemPassos = `/uploads/${req.file.filename}`;
            }

            await microPasso.update(dados);
            return res.status(200).json({
                mensagem: 'Micro passo atualizado com sucesso!',
                dados: microPasso
            });
        } catch (error) {
            next(error);
        }
    }

    async alternarConcluido(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParamValue(req.params.id, 'id');
            
            console.log('🔄 Alternando concluído para micro-passo:', id);
            
            const microPasso = await MicroPassos.findByPk(id);
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            await microPasso.update({
                concluido: !microPasso.concluido
            });

            console.log(`✅ Micro passo ${microPasso.concluido ? 'concluído' : 'pendente'}`);

            return res.status(200).json({
                mensagem: `Micro passo ${microPasso.concluido ? 'concluído' : 'pendente'}`,
                dados: microPasso
            });
        } catch (error) {
            console.error('❌ Erro em alternarConcluido:', error);
            next(error);
        }
    }

    async deletarMicroPasso(req: Request, res: Response, next: NextFunction) {
        try {
            const id = getParamValue(req.params.id, 'id');
            
            const microPasso = await MicroPassos.findByPk(id);
            if (!microPasso) {
                throw new AppError('Micro passo não encontrado', 404);
            }

            await microPasso.destroy();
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default new MicroPassosController();