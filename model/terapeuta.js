import { DataTypes } from "sequelize";
import sequelize from '../database/sequelize.js';
import Usuario from'./usuario.js';

const Terapeuta = sequelize.define('Terapeuta', {
    usuarioId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references: {
            model: Usuario,
            key:'id'
        }
    },
    crefito: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true
    }
})

Terapeuta.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasOne(Terapeuta, { foreignKey: 'usuarioId', as: 'terapeuta' });

export default Terapeuta;