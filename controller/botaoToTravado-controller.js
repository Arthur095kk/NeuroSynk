import BotaoToTravado from '../model/BotaoToTravado.js';
import Paciente from '../model/paciente.js';
import TarefaVisual from '../model/tarefa_Visual.js';
import Usuario from '../model/usuario.js';

export async function registrarTravamento(req, res) {
    try {
        const { pacienteId, tarefaId } = req.body;
        
        const novoTravamento = await BotaoToTravado.create({
            pacienteId,
            tarefaId
        });
        
        res.status(201).json(novoTravamento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function obterHistoricoTravamentos(req, res) {
    try {
        const { pacienteId } = req.params;
        
        const historico = await BotaoToTravado.findAll({
            where: { pacienteId },
            include: [
                {
                    model: TarefaVisual,
                    as: 'tarefa',
                    attributes: ['tituloTarefa', 'descriçaoTarefa'] 
                }
            ],
            order: [['createdAt', 'DESC']] 
        });
        
        res.json(historico);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}