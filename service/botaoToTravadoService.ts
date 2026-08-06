
import BotaoToTravado from '../model/BotaoToTravado.js';
import Paciente from '../model/paciente.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import { AppError } from '../middleware/errorHandler.js';
import { Op, fn, col, literal } from 'sequelize';

export class BotaoToTravadoService {
  async registrarTravamento(pacienteId: string, tarefaId: string) {
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) {
      throw new AppError('Paciente não encontrado.', 404);
    }
    const tarefa = await TarefaVisual.findByPk(tarefaId);
    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }
    const travamento = await BotaoToTravado.create({
      pacienteId,
      tarefaId
    });
    await tarefa.update({ statusTravado: true });

    return travamento;
  }

  async listarHistoricoPorPaciente(pacienteId: string) {
    const historico = await BotaoToTravado.findAll({
      where: { pacienteId },
      include: [
        {
          model: TarefaVisual,
          as: 'tarefa',
          attributes: ['tituloTarefa', 'descriçaoTarefa', 'imagem_Url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return historico;
  }

  async obterEstatisticas(pacienteId: string) {
    const total = await BotaoToTravado.count({ where: { pacienteId } });
    const porTarefa = await BotaoToTravado.findAll({
      where: { pacienteId },
      attributes: [
        'tarefaId',
        [fn('COUNT', col('tarefaId')), 'quantidade']
      ],
      group: ['tarefaId'],
      include: [
        {
          model: TarefaVisual,
          as: 'tarefa',
          attributes: ['tituloTarefa']
        }
      ],
      order: [[literal('quantidade'), 'DESC']],
      limit: 5
    });
    const hoje = new Date();
    const seteDiasAtras = new Date(hoje);
    seteDiasAtras.setDate(hoje.getDate() - 7);

    const where: any = {
      pacienteId,
      createdAt: { [Op.gte]: seteDiasAtras }
    };

    const porDia = await BotaoToTravado.findAll({
      where,
      attributes: [
        [fn('DATE', col('createdAt')), 'dia'],
        [fn('COUNT', col('id')), 'quantidade']
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[literal('dia'), 'ASC']]
    });

    return { total, porTarefa, porDia };
  }
}

export default new BotaoToTravadoService();