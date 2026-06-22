import { DataTypes } from 'sequelize';
import sequelize from '../database/sequelize.js';
import Usuario from './usuario.js';

const Cuidador = sequelize.define('Cuidador',{
    usuarioId: {
        type:DataTypes.UUID,
        primaryKey:true,
        references:{
            model: Usuario,
            key: 'id'
        }
    }
});
Cuidador.belongsTo(Usuario, { foreignKey: 'usuarioId'})
Usuario.hasOne(Cuidador, { foreignKey: 'usuarioId'});

export default Cuidador;