import Paciente from '../model/paciente.js';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';

export class PacienteService {
    async create(data: any) {
        const usuario = await UsuarioMongo.findById(data.usuarioId);
       if (!usuario) {
    throw new AppError('Usuário não encontrado', 404);
}
        
        return await Paciente.create(data);
    }

    async findById(id: string) {
        return await Paciente.findByPk(id);
    }

    async findAll() {
        return await Paciente.findAll();
    }

    async update(id: string, data: any) {
        const paciente = await Paciente.findByPk(id);
        if (!paciente) {
            throw new AppError('Paciente não encontrado', 404);
        }
        return await paciente.update(data);
    }

    async delete(id: string) {
        const paciente = await Paciente.findByPk(id);
        if (!paciente) {
            throw new Error('Paciente não encontrado');
        }
        await paciente.destroy();
        return { message: 'Paciente removido com sucesso' };
    }
    async findWithCuidador(usuarioId: string): Promise<any> {
    // Busca no PostgreSQL
    const paciente = await Paciente.findByPk(usuarioId);
    if (!paciente) {
      throw new AppError('Paciente não encontrado', 404);
    }
    const usuario = await UsuarioMongo.findById(usuarioId).select('-senha');
    if (!usuario) {
      throw new AppError('Usuário não encontrado no MongoDB', 404);
    }
    const cuidador = await UsuarioMongo.findOne({
      pacientesVinculados: usuarioId
    }).select('nome email');

    return {
      paciente: paciente.toJSON ? paciente.toJSON() : paciente,
      usuario: usuario.toObject(),
      cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
    };
  }
}

export default new PacienteService();