import { DataTypes } from "sequelize";
import sequelize from '../database/sequelize.js';
import Paciente from './paciente.js';
import Cuidador from './cuidador.js';

const TarefaVisual = sequelize.define('TarefaVisual', {
    idTarefa: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
    },
    descriçaoTarefa: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tituloTarefa:{
        type:DataTypes.STRING,
        allowNull: false
    },
    imagem_Url:{
        type:DataTypes.STRING,
        allowNull: false
    },
    statusTravado:{
        type: DataTypes.BOOLEAN,
        defaultValue: false  
  }
})

Paciente.hasMany(TarefaVisual, { foreignKey: 'idPaciente', as: 'tarefas' });
TarefaVisual.belongsTo(Paciente, { foreignKey: 'idPaciente', as: 'paciente' });

Cuidador.hasMany(TarefaVisual, { foreignKey: 'idCuidador', as: 'tarefasCriadas' });
TarefaVisual.belongsTo(Cuidador, { foreignKey: 'idCuidador', as: 'criador' });

export default TarefaVisual;