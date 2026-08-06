import { Router } from 'express';
import {
  cadastrarTerapeuta,
  obterTerapeutaPorUsuarioId,
  vincularPaciente,
  listarPacientesVinculados,
  salvarDiagnostico,
  buscarPacienteComDiagnostico,
  atualizarStatus,
  obterEstatisticas
} from '../controller/terapeuta-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { z } from 'zod';

const router = Router();

const cadastroSchema = z.object({
  body: z.object({
    usuarioId: z.string().min(1, 'ID do usuário é obrigatório'),
    crefito: z.string().min(1, 'CREFITO é obrigatório')
  })
});

const vincularSchema = z.object({
  body: z.object({
    emailPaciente: z.string().email('E-mail inválido')
  })
});

const diagnosticoSchema = z.object({
  body: z.object({
    diagnostico: z.string().min(1, 'Diagnóstico é obrigatório'),
    observacoes: z.string().optional()
  }),
  params: z.object({
    pacienteId: z.string().min(1, 'ID do paciente é obrigatório')
  })
});

const statusSchema = z.object({
  body: z.object({
    status: z.enum(['Ativo', 'Em observação', 'Internado', 'Alta'])
  }),
  params: z.object({
    pacienteId: z.string().min(1, 'ID do paciente é obrigatório')
  })
});

const pacienteIdSchema = z.object({
  params: z.object({
    pacienteId: z.string().min(1, 'ID do paciente é obrigatório')
  })
});

const usuarioIdSchema = z.object({
  params: z.object({
    usuarioId: z.string().min(1, 'ID do usuário é obrigatório')
  })
});

router.use(authMiddleware);

router.get(
  '/estatisticas',
  authorize('Terapeuta', 'Medico'),
  obterEstatisticas
);

router.get(
  '/pacientes',
  authorize('Terapeuta', 'Medico'),
  listarPacientesVinculados
);

router.post(
  '/vincular',
  authorize('Terapeuta', 'Medico'),
  validate(vincularSchema),
  vincularPaciente
);

router.get(
  '/diagnostico/:pacienteId',
  authorize('Terapeuta', 'Medico'),
  validate(pacienteIdSchema),
  buscarPacienteComDiagnostico
);

router.put(
  '/diagnostico/:pacienteId',
  authorize('Terapeuta', 'Medico'),
  validate(diagnosticoSchema),
  salvarDiagnostico
);

router.patch(
  '/status/:pacienteId',
  authorize('Terapeuta', 'Medico'),
  validate(statusSchema),
  atualizarStatus
);

router.post(
  '/',
  authorize('Terapeuta', 'Medico'),
  validate(cadastroSchema),
  cadastrarTerapeuta
);

router.get(
  '/:usuarioId',
  authorize('Terapeuta', 'Medico', 'Cuidador', 'Paciente'),
  validate(usuarioIdSchema),
  obterTerapeutaPorUsuarioId
);

export default router;