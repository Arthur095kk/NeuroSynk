// controller/paciente-controller.ts
import type { Request, Response, NextFunction } from 'express';
import Paciente from '../model/paciente.js';
import pacienteRotinaService from '../service/pacienteRotinaService.js';
import { AppError } from '../middleware/errorHandler.js';

export class PacienteController {
  async salvarRotina(req: Request, res: Response, next: NextFunction) {
    try {
      const pacienteIdParam = req.params.pacienteId;
      const pacienteId = Array.isArray(pacienteIdParam) ? pacienteIdParam[0] : pacienteIdParam;
      const { titulo, descricao, proxima_medicacao } = req.body;
      const imagemUrl = req.file ? `/uploads/${req.file.filename}` : '';

      if (!pacienteId) {
        throw new AppError('ID do paciente é obrigatório.', 400);
      }

      const resultado = await pacienteRotinaService.salvarRotina(pacienteId, {
        titulo,
        descricao,
        proxima_medicacao,
        imagemUrl
      });

      return res.status(200).json({
        success: true,
        message: 'Rotina salva com sucesso!',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
  }

  async buscarPerfilPaciente(req: Request, res: Response, next: NextFunction) {
    try {
      const idParam = req.params.id;
      const id = Array.isArray(idParam) ? idParam[0] : idParam;

      if (!id) throw new AppError('ID do paciente é obrigatório.', 400);

      const resultado = await pacienteRotinaService.buscarPerfilPaciente(id);

      return res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async buscarRotinas(req: Request, res: Response, next: NextFunction) {
    try {
      const pacienteIdParam = req.params.pacienteId;
      const pacienteId = Array.isArray(pacienteIdParam) ? pacienteIdParam[0] : pacienteIdParam;

      if (!pacienteId) throw new AppError('ID do paciente é obrigatório.', 400);

      const rotinas = await pacienteRotinaService.buscarRotinas(pacienteId);

      return res.status(200).json(rotinas);
    } catch (error) {
      next(error);
    }
  }
}

// ============================================================
// FUNÇÕES EXPORTADAS PARA O ROUTER (mantendo compatibilidade)
// ============================================================

export async function cadastrarPaciente(req: Request, res: Response, next: NextFunction) {
  try {
    const { usuarioId, tipo_neurodivergencia, cuidado_especial } = req.body;

    if (!usuarioId) {
      throw new AppError('O ID do usuário é obrigatório.', 400);
    }

    if (!tipo_neurodivergencia) {
      throw new AppError('O tipo de neurodivergência é obrigatório.', 400);
    }

    const paciente = await Paciente.create({
      usuarioId,
      tipo_neurodivergencia,
      cuidado_especial
    });

    return res.status(201).json({
      success: true,
      message: 'Perfil de Paciente cadastrado com sucesso!',
      data: paciente
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function obterPacientePorUsuarioId(req: Request, res: Response, next: NextFunction) {
  try {
    const usuarioIdParam = req.params.usuarioId;
    const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;

    if (!usuarioId) {
      throw new AppError('O parâmetro usuarioId é obrigatório.', 400);
    }

    const paciente = await Paciente.findByPk(usuarioId);

    if (!paciente) {
      throw new AppError('Perfil de paciente não encontrado.', 404);
    }

    return res.status(200).json({
      success: true,
      data: paciente
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function atualizarPaciente(req: Request, res: Response, next: NextFunction) {
  try {
    const usuarioIdParam = req.params.usuarioId;
    const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;
    const { tipo_neurodivergencia, cuidado_especial } = req.body;

    if (!usuarioId) {
      throw new AppError('O parâmetro usuarioId é obrigatório.', 400);
    }

    const paciente = await Paciente.findByPk(usuarioId);

    if (!paciente) {
      throw new AppError('Perfil de paciente não encontrado.', 404);
    }

    await paciente.update({
      tipo_neurodivergencia,
      cuidado_especial
    });

    return res.status(200).json({
      success: true,
      message: 'Paciente atualizado com sucesso!',
      data: paciente
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function deletarPaciente(req: Request, res: Response, next: NextFunction) {
  try {
    const usuarioIdParam = req.params.usuarioId;
    const usuarioId = Array.isArray(usuarioIdParam) ? usuarioIdParam[0] : usuarioIdParam;

    if (!usuarioId) {
      throw new AppError('O parâmetro usuarioId é obrigatório.', 400);
    }

    const paciente = await Paciente.findByPk(usuarioId);

    if (!paciente) {
      throw new AppError('Perfil de paciente não encontrado.', 404);
    }

    await paciente.destroy();

    return res.status(200).json({
      success: true,
      message: 'Paciente removido com sucesso!'
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
}

export default new PacienteController();