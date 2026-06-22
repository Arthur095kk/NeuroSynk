const express = require('express');
const usuario= express();
const porta = 3000;

usuario.get('/usuario:email', (req, res)=>{
    const email = req.params.email;
    res.send(`O email do usuário é: ${email}`);
});

usuario.listen(porta, ()=>{
    console.log(`Servidor rodando na porta ${porta}`);
});