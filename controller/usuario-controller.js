import Usuario from '../model/usuario.js';

export async function getUsuarios(req, res) {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function getUsuarioByEmail(req, res) {
    try {
        const { email } = req.params;
        const usuario = await Usuario.findOne({ where: { email: email } });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function criarUsuario(req, res) {
    try {
        const usuario = await Usuario.create(req.body);
        res.status(201).json(usuario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

export async function atualizarUsuario(req, res) {
    try {
        const { email } = req.params;
        const usuario = await Usuario.findOne({ where: { email: email } });
        
        if (!usuario) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        
        await usuario.update(req.body); 
        res.json(usuario);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}