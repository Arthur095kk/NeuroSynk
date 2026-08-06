import TarefaVisual from '../model/tarefa_Visual.js';
import Paciente from '../model/paciente.js';
import MicroPassos from '../model/micro_Passos.js';
import { AppError } from '../middleware/errorHandler.js';

export class TarefaService {
  async criarTarefa(dados: {
    descriçaoTarefa: string;
    tituloTarefa: string;
    imagem_Url: string;
    idPaciente: string;
    idCuidador?: string | null;
  }) {
    const paciente = await Paciente.findByPk(dados.idPaciente);
    if (!paciente) {
      throw new AppError('Paciente não encontrado.', 404);
    }

    const tarefa = await TarefaVisual.create({
      ...dados,
      statusTravado: false
    });

    return tarefa;
  }

  async listarPorPaciente(pacienteId: string) {
    const tarefas = await TarefaVisual.findAll({
      where: { idPaciente: pacienteId },
      include: [
        {
          model: MicroPassos,
          as: 'microPassos',
          order: [['ordemPasso', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return tarefas;
  }

  async listarPorCuidador(cuidadorId: string) {
    const tarefas = await TarefaVisual.findAll({
      where: { idCuidador: cuidadorId },
      include: [
        {
          model: MicroPassos,
          as: 'microPassos',
          order: [['ordemPasso', 'ASC']]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return tarefas;
  }

  async buscarPorId(id: string) {
    const tarefa = await TarefaVisual.findByPk(id, {
      include: [
        {
          model: MicroPassos,
          as: 'microPassos',
          order: [['ordemPasso', 'ASC']]
        }
      ]
    });

    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }

    return tarefa;
  }
  async atualizarTarefa(id: string, dados: any) {
    const tarefa = await TarefaVisual.findByPk(id);
    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }

    await tarefa.update(dados);
    return tarefa;
  }
  async deletarTarefa(id: string) {
    const tarefa = await TarefaVisual.findByPk(id);
    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }
    await MicroPassos.destroy({ where: { idTarefa: id } });
    await tarefa.destroy();
  }

  async alternarStatusTravado(id: string) {
    const tarefa = await TarefaVisual.findByPk(id);
    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }

    await tarefa.update({
      statusTravado: !tarefa.statusTravado
    });

    return tarefa;
  }
}

export default new TarefaService();