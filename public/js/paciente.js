// js/paciente.js - VERSÃO COMPLETA COM TAREFAS + MICRO-PASSOS
// ============================================================

// ============================================================
// 1. VALIDAÇÃO DE ACESSO
// ============================================================
function validarAcessoPaciente() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || '';
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    if (!token) {
        alert('Faça login para acessar o sistema.');
        window.location.href = '/index.html';
        return false;
    }

    if (role.toLowerCase() !== 'paciente') {
        alert(`Acesso negado! Você é um(a) ${role}, não um paciente.`);
        window.location.href = '/index.html';
        return false;
    }

    if (!userId) {
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/index.html';
        return false;
    }

    const nome = localStorage.getItem('userName') || 'Paciente';
    const el = document.getElementById('user-name');
    if (el) {
        el.innerHTML = `<i class="fa-regular fa-circle-user"></i> Olá, ${nome}`;
    }

    return true;
}

// ============================================================
// 2. LOGOUT
// ============================================================
function fazerLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('paciente_id');
    localStorage.removeItem('neurosync_sos_status');
    window.location.href = '/index.html';
}

// ============================================================
// 3. INICIALIZAÇÃO
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (!validarAcessoPaciente()) return;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            fazerLogout();
        });
    }

    carregarCuidador();
    carregarTarefas();
    configurarBotaoSOS();
});

// ============================================================
// 4. CARREGAR CUIDADOR
// ============================================================
async function carregarCuidador() {
    const container = document.getElementById('info-cuidador');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/pacientes/perfil/${pacienteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const dados = await response.json();

            if (dados.cuidador) {
                container.innerHTML = `
                    <p><strong>👤 Nome:</strong> ${dados.cuidador.nome || 'Não informado'}</p>
                    <p><strong>📧 E-mail:</strong> ${dados.cuidador.email || 'Não informado'}</p>
                    <p style="font-size: 13px; color: var(--text-secondary); margin-top: 8px;">
                        <i class="fa-solid fa-circle-check" style="color: var(--success);"></i> Cuidador vinculado
                    </p>
                `;
            } else {
                container.innerHTML = `
                    <p style="color: var(--warning);">
                        <i class="fa-solid fa-triangle-exclamation"></i> Você ainda não está vinculado a nenhum cuidador.
                    </p>
                `;
            }
        } else {
            container.innerHTML = `<p style="color: var(--text-secondary);">Erro ao carregar cuidador.</p>`;
        }
    } catch (error) {
        console.error('Erro ao buscar cuidador:', error);
        container.innerHTML = `<p style="color: var(--danger);">Erro de conexão.</p>`;
    }
}

// ============================================================
// 5. CARREGAR TAREFAS + MICRO-PASSOS - CORRIGIDO
// ============================================================
async function carregarTarefas() {
    const container = document.getElementById('tasks-container');
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-secondary);">ID do paciente não encontrado.</p>`;
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/tarefas/paciente/${pacienteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const tarefas = await response.json();

            if (!tarefas || tarefas.length === 0) {
                container.innerHTML = `
                    <div style="text-align: center; color: var(--text-secondary); padding: 30px;">
                        <i class="fa-regular fa-face-smile" style="font-size: 32px; display: block; margin-bottom: 12px;"></i>
                        Nenhuma tarefa cadastrada para você ainda.
                        <br><small>Seu cuidador irá adicionar suas atividades em breve.</small>
                    </div>
                `;
                return;
            }

            container.innerHTML = tarefas.map(tarefa => {
                const titulo = tarefa.tituloTarefa || 'Tarefa';
                const descricao = tarefa.descriçaoTarefa || '';
                const imagem = tarefa.imagem_Url || '';
                const id = tarefa.idTarefa || tarefa.id || '';
                const statusTravado = tarefa.statusTravado || false;
                const microPassos = tarefa.microPassos || [];
                const tarefaId = String(id);
                console.log(`📋 Renderizando tarefa: ${titulo} (ID: ${tarefaId})`);

                return `
                    <div class="task-card" data-tarefa-id="${tarefaId}" style="
                        background: var(--card-bg);
                        border-radius: 12px;
                        padding: 16px;
                        margin-bottom: 16px;
                        border: 1px solid var(--border);
                        box-shadow: var(--shadow);
                        ${statusTravado ? 'border-left: 4px solid var(--danger);' : ''}
                    ">
                        <div style="display: flex; gap: 16px; align-items: flex-start;">
                            ${imagem ? `
                                <img src="${imagem}" alt="${titulo}" style="
                                    width: 80px;
                                    height: 80px;
                                    object-fit: cover;
                                    border-radius: 8px;
                                    flex-shrink: 0;
                                ">
                            ` : `
                                <div style="
                                    width: 80px;
                                    height: 80px;
                                    background: var(--primary-light);
                                    border-radius: 8px;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    flex-shrink: 0;
                                    color: var(--primary-dark);
                                    font-size: 28px;
                                ">
                                    <i class="fa-solid fa-clipboard-list"></i>
                                </div>
                            `}
                            <div style="flex: 1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h4 style="margin: 0; font-size: 16px;">${titulo}</h4>
                                    ${statusTravado ? `
                                        <span style="
                                            background: var(--danger);
                                            color: white;
                                            padding: 2px 10px;
                                            border-radius: 12px;
                                            font-size: 11px;
                                            font-weight: 600;
                                        ">
                                            <i class="fa-solid fa-hand"></i> Travado
                                        </span>
                                    ` : ''}
                                </div>
                                ${descricao ? `<p style="margin: 4px 0 8px 0; font-size: 13px; color: var(--text-secondary);">${descricao}</p>` : ''}
                                
                                <!-- Micro-passos -->
                                ${microPassos.length > 0 ? `
                                    <div style="margin-top: 10px;">
                                        <p style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px;">
                                            <i class="fa-solid fa-list-check"></i> Passos:
                                        </p>
                                        <div style="display: flex; flex-direction: column; gap: 4px;">
                                            ${microPassos.sort((a, b) => a.ordemPasso - b.ordemPasso).map(passo => `
                                                <div style="
                                                    display: flex;
                                                    align-items: center;
                                                    gap: 8px;
                                                    font-size: 13px;
                                                    padding: 4px 8px;
                                                    border-radius: 6px;
                                                    background: ${passo.concluido ? 'var(--primary-light)' : 'var(--background)'};
                                                    color: ${passo.concluido ? 'var(--primary-dark)' : 'var(--text-primary)'};
                                                ">
                                                    <input type="checkbox" 
                                                        ${passo.concluido ? 'checked' : ''} 
                                                        onchange="toggleMicroPasso('${passo.idMicroPassos || passo.id}', this)"
                                                        style="accent-color: var(--primary); width: 16px; height: 16px; cursor: pointer;">
                                                    <span style="${passo.concluido ? 'text-decoration: line-through; opacity: 0.7;' : ''}">
                                                        ${passo.descricaoPasso}
                                                    </span>
                                                    ${passo.imagemPassos ? `
                                                        <img src="${passo.imagemPassos}" alt="passo" style="width: 24px; height: 24px; border-radius: 4px; object-fit: cover;">
                                                    ` : ''}
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                ` : `
                                    <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                                        <i class="fa-regular fa-circle"></i> Nenhum passo definido
                                    </p>
                                `}

                                <!-- Botões com onclick explícito -->
                                <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
                                    <button onclick="concluirTarefaCompleta('${tarefaId}')" style="
                                        padding: 6px 16px;
                                        border: none;
                                        border-radius: 6px;
                                        background: var(--success);
                                        color: white;
                                        cursor: pointer;
                                        font-size: 13px;
                                        transition: var(--transition);
                                    ">
                                        <i class="fa-solid fa-check"></i> Concluir Tudo
                                    </button>
                                    <button onclick="registrarTravamento('${tarefaId}')" style="
                                        padding: 6px 16px;
                                        border: none;
                                        border-radius: 6px;
                                        background: var(--danger);
                                        color: white;
                                        cursor: pointer;
                                        font-size: 13px;
                                        transition: var(--transition);
                                    ">
                                        <i class="fa-solid fa-hand"></i> Tô Travado
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

        } else {
            container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro ao carregar tarefas.</p>`;
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
        container.innerHTML = `<p style="text-align: center; color: var(--danger);">Erro de conexão.</p>`;
    }
}
// ============================================================
// 6. ALTERNAR MICRO-PASSO
// ============================================================
window.toggleMicroPasso = async function(microPassoId, checkbox) {
    try {
        const token = localStorage.getItem('token');
        console.log('🔄 Alternando micro-passo:', microPassoId);
        
        const response = await fetch(`/micro-passos/${microPassoId}/toggle-concluido`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const dados = await response.json();
            console.log('✅ Resposta:', dados);
            mostrarToast(dados.mensagem || 'Passo atualizado!', 'success');
            // Recarregar as tarefas após um breve delay
            setTimeout(carregarTarefas, 500);
        } else {
            const erro = await response.json().catch(() => ({}));
            console.error('❌ Erro:', erro);
            checkbox.checked = !checkbox.checked;
            mostrarToast('Erro ao atualizar passo: ' + (erro.message || 'Tente novamente.'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao alternar micro-passo:', error);
        checkbox.checked = !checkbox.checked;
        mostrarToast('Erro de conexão.', 'error');
    }
};

// ============================================================
// 7. CONCLUIR TAREFA COMPLETA
// ============================================================
async function concluirTarefaCompleta(tarefaId) {
    try {
        // Buscar todos os micro-passos da tarefa
        const token = localStorage.getItem('token');
        const response = await fetch(`/micro-passos/tarefa/${tarefaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const passos = await response.json();

            // Marcar todos como concluídos
            for (const passo of passos) {
                if (!passo.concluido) {
                    await fetch(`/micro-passos/${passo.idMicroPassos || passo.id}/toggle-concluido`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                }
            }

            mostrarToast('✅ Todas as tarefas concluídas! Parabéns!', 'success');
            setTimeout(carregarTarefas, 500);
        }
    } catch (error) {
        console.error('Erro ao concluir tarefa:', error);
        mostrarToast('Erro ao concluir tarefa.', 'error');
    }
}
// ============================================================
// REGISTRAR TRAVAMENTO E ABRIR MODAL COM MICRO-PASSOS - CORRIGIDO
// ============================================================
async function registrarTravamento(tarefaId) {
    console.log('registrarTravamento chamado com:', { tarefaId, tipo: typeof tarefaId });
    if (!tarefaId || tarefaId === 'undefined' || tarefaId === 'null') {
        const btn = document.activeElement;
        if (btn && btn.dataset && btn.dataset.id) {
            tarefaId = btn.dataset.id;
            console.log(' ID recuperado do dataset:', tarefaId);
        }
    }
    
    if (!tarefaId || tarefaId === 'undefined' || tarefaId === 'null') {
        mostrarToast('❌ ID da tarefa não encontrado.', 'error');
        console.error('❌ tarefaId é inválido:', tarefaId);
        return;
    }

    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');
    console.log('🔍 pacienteId do localStorage:', pacienteId);
    
    if (!pacienteId) {
        mostrarToast('❌ ID do paciente não encontrado. Faça login novamente.', 'error');
        console.error('❌ pacienteId não encontrado no localStorage');
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        mostrarToast('❌ Token não encontrado. Faça login novamente.', 'error');
        console.error('❌ Token não encontrado');
        return;
    }

    console.log('✅ Dados válidos para enviar:', { pacienteId, tarefaId });

    try {
        const body = JSON.stringify({
            pacienteId: pacienteId,
            tarefaId: tarefaId
        });
        console.log('📤 Body sendo enviado:', body);
        
        const response = await fetch('/botao-travado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: body
        });

        const data = await response.json();
        console.log('📥 Resposta do servidor:', { status: response.status, data });

        if (response.ok) {
            mostrarToast('🔄 Travamento registrado! Vamos te ajudar.', 'warning');
            await abrirModalPassosAjuda(tarefaId);
        } else {
            const mensagem = data.error || data.mensagem || 'Erro ao registrar travamento.';
            mostrarToast('❌ ' + mensagem, 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao registrar travamento:', error);
        mostrarToast('❌ Erro de conexão ao registrar travamento.', 'error');
    }
}

// ============================================================
// MODAL COM MICRO-PASSOS DA TAREFA
// ============================================================
async function abrirModalPassosAjuda(tarefaId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/tarefas/${tarefaId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            mostrarToast('Erro ao carregar passos da tarefa.', 'error');
            return;
        }

        const tarefa = await response.json();
        const passos = tarefa.microPassos || [];
        const tituloTarefa = tarefa.tituloTarefa || 'Tarefa';
        const existente = document.getElementById('modal-passos-ajuda');
        if (existente) existente.remove();

        if (passos.length === 0) {
            const modal = document.createElement('div');
            modal.id = 'modal-passos-ajuda';
            modal.className = 'modal-overlay active';
            modal.innerHTML = `
                <div class="modal-card" style="max-width: 500px;">
                    <button class="modal-close" onclick="fecharModalPassos()">&times;</button>
                    <div class="modal-header">
                        <h2><i class="fa-solid fa-hand-holding-heart" style="color: var(--primary);"></i> Vamos te ajudar!</h2>
                        <p><strong>${tituloTarefa}</strong></p>
                    </div>
                    <div style="text-align: center; padding: 30px 20px; background: var(--background); border-radius: 8px;">
                        <i class="fa-regular fa-face-smile" style="font-size: 48px; color: var(--primary); display: block; margin-bottom: 16px;"></i>
                        <p style="font-size: 16px; margin: 0;">Respire fundo e tente novamente com calma.</p>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 8px;">Se precisar, peça ajuda ao seu cuidador.</p>
                    </div>
                    <button class="btn-primary btn-full" onclick="fecharModalPassos()" style="margin-top: 16px;">
                        <i class="fa-solid fa-check"></i> Entendi
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
            return;
        }
        const passosOrdenados = [...passos].sort((a, b) => a.ordemPasso - b.ordemPasso);
        let passoAtual = 0;
        const totalPassos = passosOrdenados.length;
        const modal = document.createElement('div');
        modal.id = 'modal-passos-ajuda';
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 550px; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close" onclick="fecharModalPassos()">&times;</button>
                <div class="modal-header">
                    <h2><i class="fa-solid fa-list-check" style="color: var(--primary);"></i> ${tituloTarefa}</h2>
                    <p>Siga os passos com calma</p>
                </div>
                
                <!-- Progresso -->
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">
                        <span>Progresso</span>
                        <span id="passo-progresso-texto">1 de ${totalPassos}</span>
                    </div>
                    <div style="height: 6px; background: var(--border); border-radius: 4px; overflow: hidden;">
                        <div id="passo-progresso-bar" style="height: 100%; width: ${(1/totalPassos)*100}%; background: var(--primary); transition: width 0.3s ease; border-radius: 4px;"></div>
                    </div>
                </div>

                <!-- Passo atual -->
                <div id="passo-container" style="
                    background: var(--background);
                    border-radius: 12px;
                    padding: 24px 20px;
                    min-height: 160px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    margin-bottom: 16px;
                    border: 2px solid var(--border);
                    transition: border-color 0.3s;
                ">
                    <div style="
                        background: var(--primary-light);
                        color: var(--primary-dark);
                        padding: 4px 16px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                        margin-bottom: 12px;
                    ">
                        PASSO ${passoAtual + 1} DE ${totalPassos}
                    </div>
                    ${passosOrdenados[0].imagemPassos ? `
                        <img src="${passosOrdenados[0].imagemPassos}" alt="Passo" style="
                            width: 80px;
                            height: 80px;
                            object-fit: cover;
                            border-radius: 8px;
                            margin-bottom: 12px;
                        ">
                    ` : `
                        <div style="
                            width: 64px;
                            height: 64px;
                            background: var(--primary-light);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 28px;
                            color: var(--primary);
                            margin-bottom: 12px;
                        ">
                            <i class="fa-solid fa-${passoAtual + 1 === 1 ? 'one' : passoAtual + 1 === 2 ? 'two' : passoAtual + 1 === 3 ? 'three' : 'four'}"></i>
                        </div>
                    `}
                    <p id="passo-descricao" style="font-size: 18px; font-weight: 600; margin: 0;">
                        ${passosOrdenados[0].descricaoPasso}
                    </p>
                </div>

                <!-- Lista de todos os passos -->
                <div style="margin-bottom: 16px; max-height: 120px; overflow-y: auto; background: var(--background); border-radius: 8px; padding: 8px;">
                    ${passosOrdenados.map((p, i) => `
                        <div id="passo-item-${i}" style="
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 6px 10px;
                            border-radius: 6px;
                            font-size: 13px;
                            ${i === 0 ? 'background: var(--primary-light); color: var(--primary-dark); font-weight: 600;' : 'color: var(--text-secondary);'}
                            transition: all 0.3s;
                        ">
                            <span style="
                                width: 20px;
                                height: 20px;
                                border-radius: 50%;
                                background: ${i === 0 ? 'var(--primary)' : 'var(--border)'};
                                color: ${i === 0 ? 'white' : 'var(--text-secondary)'};
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 11px;
                                font-weight: 700;
                            ">${i + 1}</span>
                            <span>${p.descricaoPasso}</span>
                            ${p.concluido ? '<span style="color: var(--success); margin-left: auto;"><i class="fa-solid fa-check-circle"></i></span>' : ''}
                        </div>
                    `).join('')}
                </div>

                <!-- Botões -->
                <div style="display: flex; gap: 10px;">
                    <button onclick="fecharModalPassos()" style="
                        flex: 1;
                        padding: 12px;
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        background: transparent;
                        cursor: pointer;
                        font-weight: 600;
                    ">
                        <i class="fa-solid fa-xmark"></i> Fechar
                    </button>
                    <button id="btn-proximo-passo-ajuda" style="
                        flex: 2;
                        padding: 12px 24px;
                        border: none;
                        border-radius: 8px;
                        background: var(--primary);
                        color: white;
                        cursor: pointer;
                        font-weight: 600;
                        transition: var(--transition);
                    ">
                        Próximo passo <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const btnProximo = document.getElementById('btn-proximo-passo-ajuda');
        btnProximo.addEventListener('click', async () => {
            const passoAtualObj = passosOrdenados[passoAtual];
            if (passoAtualObj && !passoAtualObj.concluido) {
                try {
                    await fetch(`/micro-passos/${passoAtualObj.idMicroPassos || passoAtualObj.id}/toggle-concluido`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                } catch (e) {
                    console.warn('Erro ao marcar passo como concluído:', e);
                }
            }

            passoAtual++;

            if (passoAtual < totalPassos) {
                const passo = passosOrdenados[passoAtual];
                document.getElementById('passo-progresso-texto').textContent = `${passoAtual + 1} de ${totalPassos}`;
                document.getElementById('passo-progresso-bar').style.width = `${((passoAtual + 1) / totalPassos) * 100}%`;
                const container = document.getElementById('passo-container');
                container.style.borderColor = 'var(--primary)';
                container.innerHTML = `
                    <div style="background: var(--primary-light); color: var(--primary-dark); padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-bottom: 12px;">
                        PASSO ${passoAtual + 1} DE ${totalPassos}
                    </div>
                    ${passo.imagemPassos ? `
                        <img src="${passo.imagemPassos}" alt="Passo" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;">
                    ` : `
                        <div style="width: 64px; height: 64px; background: var(--primary-light); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; color: var(--primary); margin-bottom: 12px;">
                            <i class="fa-solid fa-${passoAtual + 1 === 1 ? 'one' : passoAtual + 1 === 2 ? 'two' : passoAtual + 1 === 3 ? 'three' : 'four'}"></i>
                        </div>
                    `}
                    <p style="font-size: 18px; font-weight: 600; margin: 0;">${passo.descricaoPasso}</p>
                `;
                document.querySelectorAll('[id^="passo-item-"]').forEach((el, i) => {
                    if (i === passoAtual) {
                        el.style.background = 'var(--primary-light)';
                        el.style.color = 'var(--primary-dark)';
                        el.style.fontWeight = '600';
                    } else if (i < passoAtual) {
                        el.style.background = 'var(--primary-light)';
                        el.style.color = 'var(--primary-dark)';
                        el.style.fontWeight = 'normal';
                        el.style.opacity = '0.7';
                    } else {
                        el.style.background = 'transparent';
                        el.style.color = 'var(--text-secondary)';
                        el.style.fontWeight = 'normal';
                    }
                });
                if (passoAtual === totalPassos - 1) {
                    btnProximo.innerHTML = '<i class="fa-solid fa-check"></i> Concluir Tudo';
                }

            } else {
                document.getElementById('passo-container').innerHTML = `
                    <div style="text-align: center; padding: 10px 0;">
                        <i class="fa-solid fa-circle-check" style="font-size: 48px; color: var(--success); display: block; margin-bottom: 12px;"></i>
                        <p style="font-size: 20px; font-weight: 700; color: var(--success); margin: 0;">🎉 Parabéns!</p>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: 4px;">Você concluiu todos os passos!</p>
                    </div>
                `;
                document.getElementById('passo-progresso-texto').textContent = `✅ Concluído!`;
                document.getElementById('passo-progresso-bar').style.width = '100%';
                btnProximo.textContent = 'Fechar';
                btnProximo.style.background = 'var(--success)';
                btnProximo.onclick = fecharModalPassos;
                try {
                    await fetch(`/tarefas/${tarefaId}/toggle-travado`, {
                        method: 'PATCH',
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    mostrarToast('✅ Tarefa concluída com sucesso!', 'success');
                    setTimeout(carregarTarefas, 1000);
                } catch (e) {
                    console.warn('Erro ao destravar tarefa:', e);
                }
            }
        });

    } catch (error) {
        console.error('❌ Erro ao abrir modal de passos:', error);
        mostrarToast('Erro ao carregar passos da tarefa.', 'error');
    }
}

// ============================================================
// FECHAR MODAL DE PASSOS
// ============================================================
window.fecharModalPassos = function() {
    const modal = document.getElementById('modal-passos-ajuda');
    if (modal) modal.remove();
};

// ============================================================
// 9. MODAL DE AJUDA (Tô Travado)
// ============================================================
function abrirModalAjuda(tarefaId) {
    const existente = document.getElementById('modal-ajuda');
    if (existente) existente.remove();

    const passos = [
        { icon: 'fa-solid fa-breath', text: 'Respire fundo e conte até 10.' },
        { icon: 'fa-solid fa-hand', text: 'Peça ajuda para alguém próximo.' },
        { icon: 'fa-solid fa-arrows-rotate', text: 'Tente novamente com calma.' },
        { icon: 'fa-solid fa-phone', text: 'Se ainda estiver difícil, chame seu cuidador.' }
    ];

    let passoAtual = 0;

    const modal = document.createElement('div');
    modal.id = 'modal-ajuda';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 500px;">
            <button class="modal-close" onclick="fecharModalAjuda()">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-hand-holding-heart" style="color: var(--primary);"></i> Vamos te ajudar!</h2>
                <p>Siga os passos com calma</p>
            </div>
            <div style="margin: 20px 0;">
                <div style="
                    background: var(--primary);
                    color: white;
                    padding: 10px 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    text-align: center;
                ">
                    <span id="passo-numero" style="font-weight: 600;">Passo 1 de ${passos.length}</span>
                </div>
                <div id="passo-conteudo" style="
                    text-align: center;
                    padding: 30px 20px;
                    background: var(--background);
                    border-radius: 8px;
                    min-height: 100px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                ">
                    <i class="${passos[0].icon}" style="font-size: 32px; color: var(--primary); margin-bottom: 12px;"></i>
                    <p style="font-size: 18px; margin: 0;">${passos[0].text}</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button onclick="fecharModalAjuda()" style="
                    padding: 10px 20px;
                    border: 1px solid var(--border);
                    background: transparent;
                    border-radius: 6px;
                    cursor: pointer;
                ">Fechar</button>
                <button id="btn-proximo-passo" style="
                    padding: 10px 24px;
                    border: none;
                    border-radius: 6px;
                    background: var(--primary);
                    color: white;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    Próximo passo <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('btn-proximo-passo')?.addEventListener('click', () => {
        passoAtual++;
        if (passoAtual < passos.length) {
            const passo = passos[passoAtual];
            document.getElementById('passo-numero').textContent = `Passo ${passoAtual + 1} de ${passos.length}`;
            document.getElementById('passo-conteudo').innerHTML = `
                <i class="${passo.icon}" style="font-size: 32px; color: var(--primary); margin-bottom: 12px;"></i>
                <p style="font-size: 18px; margin: 0;">${passo.text}</p>
            `;
        } else {
            document.getElementById('passo-conteudo').innerHTML = `
                <i class="fa-solid fa-circle-check" style="font-size: 48px; color: var(--success);"></i>
                <p style="margin-top: 12px; font-size: 18px; font-weight: 600; color: var(--success);">
                    🎉 Parabéns! Você concluiu todas as etapas!
                </p>
            `;
            document.getElementById('btn-proximo-passo').style.display = 'none';
            document.getElementById('passo-numero').textContent = '✅ Concluído!';
            salvarAjudaConcluida(tarefaId);
        }
    });
}

window.fecharModalAjuda = function() {
    const modal = document.getElementById('modal-ajuda');
    if (modal) modal.remove();
};

async function salvarAjudaConcluida(tarefaId) {
    try {
        const token = localStorage.getItem('token');
        await fetch(`/tarefas/${tarefaId}/toggle-travado`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log('✅ Ajuda concluída para tarefa:', tarefaId);
        setTimeout(carregarTarefas, 500);
    } catch (error) {
        console.error('Erro ao salvar ajuda concluída:', error);
    }
}

// ============================================================
// 10. BOTÃO SOS
// ============================================================
function configurarBotaoSOS() {
    const btn = document.getElementById('btn-sos');
    if (btn) {
        btn.addEventListener('click', dispararSOS);
    }
}

async function dispararSOS() {
    const pacienteId = localStorage.getItem('userId') || localStorage.getItem('paciente_id');

    if (!pacienteId) {
        mostrarToast('⚠️ ID do paciente não encontrado.', 'error');
        return;
    }

    mostrarToast('📍 Buscando sua localização...', 'info');

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                await enviarSOS(pacienteId, position.coords.latitude, position.coords.longitude);
            },
            async () => {
                await enviarSOS(pacienteId, -15.7801, -47.9292);
            }
        );
    } else {
        mostrarToast('Geolocalização não suportada.', 'error');
    }
}
async function enviarSOS(pacienteId, latitude, longitude) {
    try {
        const token = localStorage.getItem('token');
        
        // Salvar localmente para o cuidador
        const sosData = {
            ativo: true,
            lat: latitude,
            lng: longitude,
            pacienteId: pacienteId,
            dataHora: new Date().toLocaleString('pt-BR')
        };
        localStorage.setItem('neurosync_sos_status', JSON.stringify(sosData));

        console.log('📤 Enviando SOS para:', { pacienteId, latitude, longitude });
        
        const response = await fetch('/localizacao', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                usuarioId: pacienteId,
                latitude: latitude,
                longitude: longitude
            })
        });

        console.log('📥 Resposta SOS:', response.status);
        const data = await response.json().catch(() => ({}));

        if (response.ok) {
            mostrarToast('🚨 SOS enviado com sucesso! Cuidador notificado.', 'danger');
        } else {
            mostrarToast('⚠️ Erro ao enviar SOS: ' + (data.error || 'Tente novamente.'), 'error');
        }
    } catch (error) {
        console.error('❌ Erro ao enviar SOS:', error);
        mostrarToast('❌ Erro de conexão ao enviar SOS.', 'error');
    }
}
// ============================================================
// 11. TOAST (NOTIFICAÇÕES)
// ============================================================
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('sos-toast');
    if (!toast) {
        // Criar toast se não existir
        const newToast = document.createElement('div');
        newToast.id = 'sos-toast';
        newToast.style.cssText = `
            display: block;
            position: fixed;
            bottom: 100px;
            right: 30px;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 60;
            max-width: 350px;
            font-size: 14px;
        `;
        document.body.appendChild(newToast);
        const toastEl = document.getElementById('sos-toast');
        toastEl.textContent = mensagem;
        const cores = {
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
            error: '#EF4444',
            info: '#4F46E5'
        };
        toastEl.style.background = cores[tipo] || cores.info;
        toastEl.style.color = 'white';

        setTimeout(() => {
            toastEl.style.display = 'none';
        }, 5000);
        return;
    }

    const cores = {
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        error: '#EF4444',
        info: '#4F46E5'
    };

    toast.textContent = mensagem;
    toast.style.background = cores[tipo] || cores.info;
    toast.style.color = 'white';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 5000);
}

// ============================================================
// 12. RECARREGAR PERIODICAMENTE
// ============================================================
setInterval(carregarTarefas, 30000);