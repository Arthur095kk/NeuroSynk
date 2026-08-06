import type { Request, Response, NextFunction } from 'express';
import Terapeuta from '../model/terapeuta.js';
import { UsuarioMongo } from '../model/usuarioMongo.js';
import { AppError } from '../middleware/errorHandler.js';
import terapeutaService from '../service/terapeutaService.js';

export class TerapeutaController {
  async cadastrarTerapeuta(req: Request, res: Response, next: NextFunction) {
    try {
      const { usuarioId, crefito } = req.body;

      if (!usuarioId || !crefito) {
        throw new AppError('O ID do usuário e o CREFITO são obrigatórios.', 400);
      }

      const terapeuta = await terapeutaService.criarTerapeuta(usuarioId, crefito);

      return res.status(201).json({
        success: true,
        message: 'Perfil de Terapeuta cadastrado com sucesso!',
        data: terapeuta
      });
    } catch (error) {
      next(error);
    }
  }

  async obterTerapeutaPorUsuarioId(req: Request, res: Response, next: NextFunction) {
    try {
      const rawUsuarioId = req.params.usuarioId;
      const usuarioId = Array.isArray(rawUsuarioId) ? rawUsuarioId[0] : rawUsuarioId;

      if (!usuarioId) {
        throw new AppError('O parâmetro usuarioId é obrigatório.', 400);
      }

      const terapeuta = await terapeutaService.buscarPorId(usuarioId);

      return res.status(200).json({
        success: true,
        data: terapeuta
      });
    } catch (error) {
      next(error);
    }
  }

  async vincularPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const { emailPaciente } = req.body;
      const terapeutaId = req.user?.id || req.user?._id;

      if (!emailPaciente) {
        throw new AppError('E-mail do paciente é obrigatório.', 400);
      }

      if (!terapeutaId) {
        throw new AppError('Usuário não autenticado.', 401);
      }

      const terapeuta = await UsuarioMongo.findById(terapeutaId);
      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const tipo = terapeuta.tipo_usuario?.toLowerCase();
      if (tipo !== 'terapeuta' && tipo !== 'medico') {
        throw new AppError('Apenas terapeutas e médicos podem vincular pacientes.', 403);
      }

      const paciente = await UsuarioMongo.findOne({ email: emailPaciente });
      if (!paciente) {
        throw new AppError('Paciente não encontrado com este e-mail.', 404);
      }

      if ((paciente.tipo_usuario || '').toLowerCase() !== 'paciente') {
        throw new AppError('O usuário com este e-mail não é um paciente.', 400);
      }

      if (terapeuta.pacientesVinculados?.includes(paciente._id as any)) {
        throw new AppError('Este paciente já está vinculado a você.', 409);
      }

      const terapeutaAtualizado = await UsuarioMongo.findByIdAndUpdate(
        terapeutaId,
        { $addToSet: { pacientesVinculados: paciente._id } },
        { new: true }
      ).populate('pacientesVinculados');

      return res.status(200).json({
        success: true,
        message: 'Paciente vinculado com sucesso!',
        data: {
          terapeuta: {
            id: terapeutaAtualizado?._id,
            nome: terapeutaAtualizado?.nome
          },
          paciente: {
            id: paciente._id,
            nome: paciente.nome,
            email: paciente.email
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async listarPacientesVinculados(req: Request, res: Response, next: NextFunction) {
    try {
      const terapeutaId = req.user?.id || req.user?._id;

      if (!terapeutaId) {
        throw new AppError('ID do terapeuta não encontrado.', 401);
      }

      const terapeuta = await UsuarioMongo.findById(terapeutaId)
        .populate('pacientesVinculados');

      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const pacientes = terapeuta.pacientesVinculados || [];

      return res.status(200).json({
        success: true,
        data: pacientes,
        total: pacientes.length
      });
    } catch (error) {
      console.error('❌ Erro em listarPacientesVinculados:', error);
      next(error);
    }
  }

  async salvarDiagnostico(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId } = req.params;
      const { diagnostico, observacoes } = req.body;
      const terapeutaId = req.user?.id || req.user?._id;

      if (!pacienteId) {
        throw new AppError('ID do paciente é obrigatório.', 400);
      }

      if (!diagnostico) {
        throw new AppError('Diagnóstico é obrigatório.', 400);
      }

      const terapeuta = await UsuarioMongo.findById(terapeutaId);
      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const tipo = terapeuta.tipo_usuario?.toLowerCase();
      if (tipo !== 'terapeuta' && tipo !== 'medico') {
        throw new AppError('Apenas terapeutas e médicos podem salvar diagnósticos.', 403);
      }

      const paciente = await UsuarioMongo.findById(pacienteId);
      if (!paciente) {
        throw new AppError('Paciente não encontrado.', 404);
      }

      if ((paciente.tipo_usuario || '').toLowerCase() !== 'paciente') {
        throw new AppError('O usuário não é um paciente.', 400);
      }

      const estaVinculado = terapeuta.pacientesVinculados?.some(
        (id: any) => id.toString() === pacienteId
      );
      if (!estaVinculado) {
        throw new AppError('Este paciente não está vinculado a você.', 403);
      }

      const pacienteAtualizado = await UsuarioMongo.findByIdAndUpdate(
        pacienteId,
        {
          diagnostico,
          observacoes: observacoes || '',
          ultimaRevisao: new Date().toLocaleDateString('pt-BR')
        },
        { new: true }
      ).select('-senha');

      return res.status(200).json({
        success: true,
        message: 'Diagnóstico salvo com sucesso!',
        data: pacienteAtualizado
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPacienteComDiagnostico(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId } = req.params;
      const terapeutaId = req.user?.id || req.user?._id;

      if (!req.user || !terapeutaId) {
        throw new AppError('Usuário não autenticado.', 401);
      }

      if (!pacienteId) {
        throw new AppError('ID do paciente é obrigatório.', 400);
      }

      const terapeuta = await UsuarioMongo.findById(terapeutaId);
      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const paciente = await UsuarioMongo.findById(pacienteId).select('-senha');
      if (!paciente) {
        throw new AppError('Paciente não encontrado.', 404);
      }

      if ((paciente.tipo_usuario || '').toLowerCase() !== 'paciente') {
        throw new AppError('O usuário não é um paciente.', 400);
      }

      const estaVinculado = terapeuta.pacientesVinculados?.some(
        (id: any) => id.toString() === pacienteId
      );
      if (!estaVinculado) {
        throw new AppError('Este paciente não está vinculado a você.', 403);
      }

      const cuidador = await UsuarioMongo.findOne({
        pacientesVinculados: paciente._id
      }).select('nome email');

      return res.status(200).json({
        success: true,
        data: {
          ...paciente.toObject(),
          cuidador: cuidador ? { nome: cuidador.nome, email: cuidador.email } : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async atualizarStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { pacienteId } = req.params;
      const { status } = req.body;
      const terapeutaId = req.user?.id || req.user?._id;

      if (!terapeutaId) {
        throw new AppError('Usuário não autenticado.', 401);
      }

      if (!pacienteId) {
        throw new AppError('ID do paciente é obrigatório.', 400);
      }

      const statusValidos = ['Ativo', 'Em observação', 'Internado', 'Alta'];
      if (!status || !statusValidos.includes(status)) {
        throw new AppError(`Status inválido. Use: ${statusValidos.join(', ')}.`, 400);
      }

      const terapeuta = await UsuarioMongo.findById(terapeutaId);
      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const paciente = await UsuarioMongo.findById(pacienteId);
      if (!paciente) {
        throw new AppError('Paciente não encontrado.', 404);
      }

      const estaVinculado = terapeuta.pacientesVinculados?.some(
        (id: any) => id.toString() === pacienteId
      );
      if (!estaVinculado) {
        throw new AppError('Este paciente não está vinculado a você.', 403);
      }

      paciente.status = status;
      await paciente.save();

      return res.status(200).json({
        success: true,
        message: 'Status do paciente atualizado com sucesso!',
        data: {
          id: paciente._id,
          nome: paciente.nome,
          status: paciente.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async obterEstatisticas(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('Usuário não autenticado.', 401);
      }

      const terapeutaId = req.user.id || req.user._id;

      const terapeuta = await UsuarioMongo.findById(terapeutaId)
        .populate('pacientesVinculados');

      if (!terapeuta) {
        throw new AppError('Terapeuta não encontrado.', 404);
      }

      const pacientes = terapeuta.pacientesVinculados || [];
      const totalPacientes = pacientes.length;

      const comDiagnostico = pacientes.filter((p: any) => p.diagnostico && p.diagnostico !== '').length;

      const statusCount: Record<string, number> = {};
      pacientes.forEach((p: any) => {
        const status = p.status || 'Ativo';
        statusCount[status] = (statusCount[status] || 0) + 1;
      });

      return res.status(200).json({
        success: true,
        data: {
          totalPacientes,
          comDiagnostico,
          semDiagnostico: totalPacientes - comDiagnostico,
          porStatus: statusCount
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cadastrarTerapeuta = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.cadastrarTerapeuta(req, res, next);
};

export const obterTerapeutaPorUsuarioId = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.obterTerapeutaPorUsuarioId(req, res, next);
};

export const vincularPaciente = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.vincularPaciente(req, res, next);
};

export const listarPacientesVinculados = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.listarPacientesVinculados(req, res, next);
};

export const salvarDiagnostico = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.salvarDiagnostico(req, res, next);
};

export const buscarPacienteComDiagnostico = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.buscarPacienteComDiagnostico(req, res, next);
};

export const atualizarStatus = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.atualizarStatus(req, res, next);
};

export const obterEstatisticas = async (req: Request, res: Response, next: NextFunction) => {
  const controller = new TerapeutaController();
  await controller.obterEstatisticas(req, res, next);
};

export default new TerapeutaController();