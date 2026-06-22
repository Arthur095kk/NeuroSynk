import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Terapeuta from './terapeuta.js';
import Paciente from './paciente.js';

const Insight = sequelize.define('Insight', {
    idInsight: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    dashboard: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    periodo_semana: {
        type: DataTypes.STRING,
        allowNull: true
    },
    periodo_Mes: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

Terapeuta.hasMany(Insight, { foreignKey: 'terapeutaId', as: 'insightsGerados' });
Insight.belongsTo(Terapeuta, { foreignKey: 'terapeutaId', as: 'terapeuta' });

Paciente.hasMany(Insight, { foreignKey: 'pacienteId', as: 'historicoInsights' });
Insight.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'pacienteAnalisado' });

export default Insight;