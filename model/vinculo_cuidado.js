import { DataTypes } from "sequelize";
import sequelize from '../database/sequelize.js';
import Paciente from './Paciente.js';
import Cuidador from './Cuidador.js';
import Terapeuta from './Terapeuta.js';


const VinculoCuidado = sequelize.define('VinculoCuidado',{
    idVinculo: {
        type: DataTypes.UUID,
        primaryKey:true,
        defaultValue: DataTypes.UUIDV4
    },
    data_Inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    nivel_Permissao: {
        type: DataTypes.ENUM('Rotina','Localização','Tudo'),
        allowNull: false
    },
    statusCompartilhamento: {
        type: DataTypes.BOOLEAN
    }

})

VinculoCuidado.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });
VinculoCuidado.belongsTo(Cuidador, { foreignKey: 'cuidadorId', as: 'cuidador' });
VinculoCuidado.belongsTo(Terapeuta, { foreignKey: 'terapeutaId', as: 'terapeuta' });

export default VinculoCuidado;