import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Usuario from './Usuario.js'; // Você importa o arquivo base

const Paciente = sequelize.define('Paciente', {
    // A chave primária aqui é o mesmo ID do Usuário
    usuarioId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: Usuario,
            key: 'id'
        }
    },
    tipo_neurodivergencia: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cuidado_especial: {
        type: DataTypes.TEXT
    }
});

// Aqui você cria o vínculo: "O Paciente PERTENCE a um Usuário"
Paciente.belongsTo(Usuario, { foreignKey: 'usuarioId' });
Usuario.hasOne(Paciente, { foreignKey: 'usuarioId' });

export default Paciente;