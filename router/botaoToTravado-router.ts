import { Router } from 'express';
import { 
    registrarTravamento, 
    obterHistoricoTravamentos,
    obterEstatisticasTravamentos
} from '../controller/botaoToTravado-controller.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', authorize('Paciente', 'Cuidador'), registrarTravamento);
router.get('/historico/:pacienteId', authorize('Paciente', 'Cuidador', 'Terapeuta'), obterHistoricoTravamentos);
router.get('/estatisticas/:pacienteId', authorize('Cuidador', 'Terapeuta'), obterEstatisticasTravamentos);
export default router;