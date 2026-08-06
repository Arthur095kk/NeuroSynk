import PacienteController from '../controller/paciente-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';
import { Router } from 'express';
import { upload } from '../config/multer.js';
import { 
    salvarRotinaECarta, 
    buscarPerfilPacienteComCuidador,
    buscarRotinasDoPaciente
} from '../controller/paciente-rotina-controller.js';


const apiRouter = Router();

apiRouter.post('/pacientes/:pacienteId/rotina', upload.single('foto'), salvarRotinaECarta);
apiRouter.get('/pacientes/perfil/:id', buscarPerfilPacienteComCuidador);
apiRouter.get('/pacientes/:pacienteId/rotinas', buscarRotinasDoPaciente);
apiRouter.post(
  '/:pacienteId/rotina',
  authorize('Cuidador', 'Terapeuta'),
  upload.single('foto'),
  PacienteController.salvarRotina
);

apiRouter.get(
  '/perfil/:id',
  authorize('Paciente', 'Cuidador', 'Terapeuta'),
  PacienteController.buscarPerfilPaciente
);

apiRouter.get(
  '/:pacienteId/rotinas',
  authorize('Paciente', 'Cuidador', 'Terapeuta'),
  PacienteController.buscarRotinas
);


export default apiRouter;