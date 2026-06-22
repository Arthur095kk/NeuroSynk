import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';
import TarefaVisual from './tarefa_Visual.js';

const BotaoToTravado = sequelize.define('BotaoToTravado', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    data: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
    hora: {
        type: DataTypes.TIME,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
});

Paciente.hasMany(BotaoToTravado, { foreignKey: 'pacienteId', as: 'travamentos' });
BotaoToTravado.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

TarefaVisual.hasMany(BotaoToTravado, { foreignKey: 'tarefaId', as: 'logsDeTravamento' });
BotaoToTravado.belongsTo(TarefaVisual, { foreignKey: 'tarefaId', as: 'tarefa' });

export default BotaoToTravado;