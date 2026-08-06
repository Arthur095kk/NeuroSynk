import { Router } from 'express';
import { 
    cadastrarPaciente,
    obterPacientePorUsuarioId,
    atualizarPaciente,
    deletarPaciente
} from '../controller/paciente-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { pacienteSchema, updatePacienteSchema } from '../validators/pacienteValidator.js';

const router = Router();

router.use(authMiddleware);

// CRUD de pacientes
router.post(
    '/',
    authorize('Cuidador', 'Terapeuta'),
    validate(pacienteSchema),
    cadastrarPaciente
);

router.get(
    '/:usuarioId',
    authorize('Paciente', 'Cuidador', 'Terapeuta'),
    obterPacientePorUsuarioId
);

router.put(
    '/:usuarioId',
    authorize('Cuidador', 'Terapeuta'),
    validate(updatePacienteSchema),
    atualizarPaciente
);

router.delete(
    '/:usuarioId',
    authorize('Cuidador', 'Terapeuta'),
    deletarPaciente
);

export default router;