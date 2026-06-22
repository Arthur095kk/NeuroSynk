import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';

const BotaoSos = sequelize.define('BotaoSos', {
    id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    latitude: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    longitude: {
        type: DataTypes.STRING,
        allowNull: false
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
    },
    pushEnviado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

Paciente.hasMany(BotaoSos, { foreignKey: 'pacienteId', as: 'alertasSos' });
BotaoSos.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });

export default BotaoSos;