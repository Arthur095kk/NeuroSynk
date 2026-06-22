import express from 'express';

import { getUsuarios, getUsuarioByEmail, criarUsuario, atualizarUsuario,
    deletarUsuario } from 
    '../controller/usuario-controller.js';

const UsuarioRouter = express.Router();

UsuarioRouter.get('/', getUsuarios);
UsuarioRouter.get('/:email', getUsuarioByEmail);
UsuarioRouter.post('/', criarUsuario);
UsuarioRouter.put('/:email', atualizarUsuario);
UsuarioRouter.delete('/:email', deletarUsuario);

export default UsuarioRouter;