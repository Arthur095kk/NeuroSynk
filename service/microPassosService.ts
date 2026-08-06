import MicroPassos from '../model/micro_Passos.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import Cuidador from '../model/cuidador.js';
import { AppError } from '../middleware/errorHandler.js';

export class MicroPassosService {
  async criarMicroPasso(dados: {
    descricaoPasso: string;
    ordemPasso: number;
    imagemPassos?: string;
    idTarefa: string;
    idCuidador?: string;
  }) {
    // Verifica tarefa
    const tarefa = await TarefaVisual.findByPk(dados.idTarefa);
    if (!tarefa) {
      throw new AppError('Tarefa não encontrada.', 404);
    }
    if (dados.idCuidador) {
      const cuidador = await Cuidador.findByPk(dados.idCuidador);
      if (!cuidador) {
        throw new AppError('Cuidador não encontrado.', 404);
      }
    }

    const microPasso = await MicroPassos.create({
      ...dados,
      concluido: false
    });

    return microPasso;
  }

  async listarPorTarefa(tarefaId: string) {
    const microPassos = await MicroPassos.findAll({
      where: { idTarefa: tarefaId },
      order: [['ordemPasso', 'ASC']]
    });

    return microPassos;
  }

  async buscarPorId(id: string) {
    const microPasso = await MicroPassos.findByPk(id);
    if (!microPasso) {
      throw new AppError('Micro passo não encontrado.', 404);
    }
    return microPasso;
  }

  async atualizar(id: string, dados: any) {
    const microPasso = await MicroPassos.findByPk(id);
    if (!microPasso) {
      throw new AppError('Micro passo não encontrado.', 404);
    }

    await microPasso.update(dados);
    return microPasso;
  }

  async alternarConcluido(id: string) {
    const microPasso = await MicroPassos.findByPk(id);
    if (!microPasso) {
      throw new AppError('Micro passo não encontrado.', 404);
    }

    await microPasso.update({
      concluido: !microPasso.concluido
    });

    return microPasso;
  }
  async deletar(id: string) {
    const microPasso = await MicroPassos.findByPk(id);
    if (!microPasso) {
      throw new AppError('Micro passo não encontrado.', 404);
    }

    await microPasso.destroy();
  }
  async reordenar(tarefaId: string, novaOrdem: string[]) {
    for (let i = 0; i < novaOrdem.length; i++) {
      await MicroPassos.update(
        { ordemPasso: i + 1 },
        { where: { idMicroPassos: novaOrdem[i], idTarefa: tarefaId } }
      );
    }
  }
}

export default new MicroPassosService();