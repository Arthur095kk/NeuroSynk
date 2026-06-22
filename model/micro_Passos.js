import {DataTypes} from 'sequelize';
import sequelize from '../database/sequelize.js';
import TarefaVisual from './tarefa_Visual.js';
import Paciente from './paciente.js';
import Cuidador from './cuidador.js';

const MicroPassos = sequelize.define('MicroPassos', {
    idMicroPassos: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    descricaoPasso: {
        type:DataTypes.STRING,
        allowNull: false
    },
    ordemPasso: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    imagemPassos: {
        type: DataTypes.STRING,
        allowNull: true
    },
    concluido: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    }
})

TarefaVisual.hasMany(MicroPassos, { foreignKey: 'idTarefa', as: 'microPassos'})
MicroPassos.belongsTo(TarefaVisual, {foreignKey: 'idTarefa'})
Cuidador.hasMany(MicroPassos, {foreignKey: 'idCuidador', as: 'cuidador'})
MicroPassos.belongsTo(Cuidador, {foreignKey: 'idCuidador', as: 'autor'})

export default MicroPassos;