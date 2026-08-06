import type { Request, Response, NextFunction } from 'express';
import BotaoToTravado from '../model/BotaoToTravado.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import Paciente from '../model/paciente.js';
import botaoToTravadoService from '../service/botaoToTravadoService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function registrarTravamento(req: Request, res: Response) {
    try {
        console.log('📥 Body recebido:', req.body);
        
        const { pacienteId, tarefaId } = req.body;
        
        if (!pacienteId) {
            console.error('❌ pacienteId ausente');
            return res.status(400).json({ 
                error: 'pacienteId é obrigatório',
                recebido: req.body 
            });
        }
        
        if (!tarefaId) {
            console.error('❌ tarefaId ausente');
            return res.status(400).json({ 
                error: 'tarefaId é obrigatório',
                recebido: req.body 
            });
        }
        console.log('🔍 Verificando paciente:', pacienteId);
        const paciente = await Paciente.findByPk(pacienteId);
        if (!paciente) {
            console.error('❌ Paciente não encontrado:', pacienteId);
            return res.status(404).json({ 
                error: 'Paciente não encontrado. Cadastre o paciente primeiro.',
                pacienteId 
            });
        }
        console.log('✅ Paciente encontrado:', paciente.usuarioId);
        console.log('🔍 Verificando tarefa:', tarefaId);
        const tarefa = await TarefaVisual.findByPk(tarefaId);
        if (!tarefa) {
            console.error('❌ Tarefa não encontrada:', tarefaId);
            return res.status(404).json({ 
                error: 'Tarefa não encontrada',
                tarefaId 
            });
        }
        console.log('✅ Tarefa encontrada:', tarefa.idTarefa);
        console.log(`✅ Criando travamento: paciente=${pacienteId}, tarefa=${tarefaId}`);
        
        const novoTravamento = await BotaoToTravado.create({
            pacienteId: pacienteId,
            tarefaId: tarefaId
        });
        
        console.log('✅ Travamento criado com sucesso! ID:', novoTravamento.id);
        
        return res.status(201).json({
            mensagem: 'Travamento registrado com sucesso!',
            dados: novoTravamento
        });
        
    } catch (error: any) {
        console.error('❌ Erro ao registrar travamento:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ 
                error: 'Paciente ou tarefa não existe no banco de dados.',
                detalhe: error.message
            });
        }
        
        return res.status(400).json({ 
            error: error.message || 'Erro ao registrar travamento' 
        });
    }
}

export async function obterHistoricoTravamentos(req: Request, res: Response) {
    try {
        const pacienteId = Array.isArray(req.params.pacienteId) ? req.params.pacienteId[0] : req.params.pacienteId;
        
        console.log(' Buscando histórico de travamentos para:', pacienteId);
        
        const historico = await BotaoToTravado.findAll({
            where: { pacienteId },
            include: [
                {
                    model: TarefaVisual,
                    as: 'tarefa',
                    attributes: ['tituloTarefa', 'descriçaoTarefa'] 
                }
            ],
            order: [['createdAt', 'DESC']] 
        });
        
        console.log(`✅ ${historico.length} travamentos encontrados`);
        return res.json(historico);
        
    } catch (error: any) {
        console.error('❌ Erro ao buscar histórico:', error);
        return res.status(400).json({ error: error.message });
    }
}
export async function obterEstatisticasTravamentos(req: Request, res: Response, next: NextFunction) {
    try {
      const pacienteId = Array.isArray(req.params.pacienteId) ? req.params.pacienteId[0] : req.params.pacienteId;

      if (!pacienteId) {
        throw new AppError('ID do paciente é obrigatório.', 400);
      }

      const estatisticas = await botaoToTravadoService.obterEstatisticas(pacienteId);

      return res.status(200).json({
        success: true,
        data: estatisticas
      });
    } catch (error) {
      next(error);
    }
  }
