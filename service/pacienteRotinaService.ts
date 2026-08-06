import { UsuarioMongo } from '../model/usuarioMongo.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import BotaoSos from '../model/BotaoSos.js';
import MicroPassos from '../model/micro_Passos.js';
import { AppError } from '../middleware/errorHandler.js';

export class PacienteRotinaService {
  async salvarRotina(pacienteId: string, dados: {
    titulo: string;
    descricao: string;
    proxima_medicacao?: string;
    imagemUrl?: string;
  }) {
    const paciente = await UsuarioMongo.findById(pacienteId);
    if (!paciente) {
      throw new AppError('Paciente não encontrado.', 404);
    }

    const novaTarefa = await TarefaVisual.create({
      idPaciente: pacienteId,
      tituloTarefa: dados.titulo || 'Nova Tarefa',
      descriçaoTarefa: dados.descricao || dados.titulo || 'Sem descrição',
      imagem_Url: dados.imagemUrl || '',
      statusTravado: false
    });
    if (dados.proxima_medicacao) {
      await UsuarioMongo.findByIdAndUpdate(pacienteId, {
        proxima_medicacao: dados.proxima_medicacao
      });
    }

    return novaTarefa;
  }

  async buscarPerfilPaciente(pacienteId: string) {
    const paciente = await UsuarioMongo.findById(pacienteId).select('-senha');
    if (!paciente) {
      throw new AppError('Paciente não encontrado.', 404);
    }
    const cuidador = await UsuarioMongo.findOne({
      pacientesVinculados: pacienteId
    }).select('nome email');

    return {
      paciente: paciente.toObject(),
      cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
    };
  }

  async buscarSosAtivo(pacienteId: string) {
    const sos = await BotaoSos.findOne({
      where: { pacienteId, pushEnviado: false }
    });
    return sos;
  }

  async buscarRotinas(pacienteId: string) {
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
}

export default new PacienteRotinaService();