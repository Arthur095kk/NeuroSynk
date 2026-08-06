import { DataTypes, Model, type Optional } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Terapeuta from './terapeuta.js';
import Paciente from './paciente.js';

interface InsightAttributes {
    idInsight: string;
    dashboard: string;
    periodo_semana?: string;
    periodo_Mes?: string;
    terapeutaId?: string;
    pacienteId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

interface InsightCreationAttributes extends Optional<InsightAttributes, 'idInsight' | 'periodo_semana' | 'periodo_Mes' | 'createdAt' | 'updatedAt'> {}

class Insight extends Model<InsightAttributes, InsightCreationAttributes> implements InsightAttributes {
    public idInsight!: string;
    public dashboard!: string;
    public periodo_semana?: string;
    public periodo_Mes?: string;
    public terapeutaId?: string;
    public pacienteId?: string;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Insight.init({
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
        type: DataTypes.STRING(20), 
        allowNull: true
    },
    periodo_Mes: {
        type: DataTypes.STRING(10), 
        allowNull: true
    },
    terapeutaId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Terapeutas',
            key: 'usuarioId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    },
    pacienteId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'Pacientes',
            key: 'usuarioId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
    }
}, {
    sequelize,
    modelName: 'Insight',
    tableName: 'Insights',
    timestamps: true
});

export default Insight;