// js/medico.js - VERSÃO COMPLETA CORRIGIDA
// ============================================================
// MÉDICO / TERAPEUTA - DASHBOARD
// ============================================================

function validarAcessoMedico() {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole') || '';
    const userId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');
    const roleLower = role.toLowerCase();

    console.log('🔍 Verificando acesso médico:', { token: !!token, role, userId });

    if (!token) {
        console.warn('❌ Token não encontrado');
        alert('Faça login para acessar o sistema.');
        window.location.href = '/index.html';
        return false;
    }

    if (roleLower !== 'terapeuta' && roleLower !== 'medico') {
        console.warn('❌ Role inválida:', role);
        alert(`Acesso negado! Você é um(a) ${role}, não um médico/terapeuta.`);
        window.location.href = '/index.html';
        return false;
    }

    if (!userId) {
        console.warn('❌ userId não encontrado');
        alert('Erro: ID do usuário não encontrado. Faça login novamente.');
        window.location.href = '/index.html';
        return false;
    }

    const nome = localStorage.getItem('userName') || 'Doutor(a)';
    const el = document.getElementById('user-name');
    if (el) {
        const icone = roleLower === 'medico' ? 'fa-solid fa-user-doctor' : 'fa-solid fa-user-graduate';
        el.innerHTML = `<i class="${icone}"></i> Olá, Dr(a). ${nome}`;
    }

    console.log('✅ Acesso validado para médico:', nome);
    return true;
}

function fazerLogout() {
    console.log('🔴 Fazendo logout...');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('paciente_id');
    localStorage.removeItem('neurosync_sos_status');
    window.location.href = '/index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 Página do médico carregada');
    if (!validarAcessoMedico()) return;

    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔴 Botão de sair clicado!');
            fazerLogout();
        });
    }

    document.getElementById('btn-novo-diagnostico')?.addEventListener('click', () => {
        abrirModalDiagnostico();
    });

    document.getElementById('btn-vincular-paciente')?.addEventListener('click', vincularPacienteMedico);
    document.getElementById('email-paciente-vincular')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') vincularPacienteMedico();
    });

    carregarPacientesMedico();
});

async function carregarPacientesMedico() {
    const tbody = document.getElementById('lista-pacientes-medico');
    const countEl = document.getElementById('count-pacientes');
    const countDiag = document.getElementById('count-diagnosticos');

    if (!tbody) return;

    try {
        const token = localStorage.getItem('token');
        console.log('📤 Buscando meus pacientes...');

        const response = await fetch('/terapeutas/pacientes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('📥 Resposta:', response.status);

        if (response.ok) {
            const result = await response.json();
            console.log('📋 Resultado completo:', result);

            const pacientes = result.data || [];
            console.log('✅ Pacientes carregados:', pacientes.length);

            if (countEl) countEl.textContent = pacientes.length || 0;

            const diagnosticos = pacientes.filter((p) => p.diagnostico && p.diagnostico !== '');
            if (countDiag) countDiag.textContent = diagnosticos.length || 0;

            window.pacientesCarregados = pacientes;

            if (!pacientes || pacientes.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; color: var(--text-secondary); padding: 20px;">
                            <i class="fa-regular fa-face-frown" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                            Nenhum paciente vinculado a você ainda.
                            <br><small>Use o campo "Vincular Paciente" para adicionar.</small>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = pacientes.map((p) => {
                const id = p._id || p.id;
                const nome = p.nome || 'Paciente';
                const email = p.email || '';
                const diagnostico = p.diagnostico || 'Não informado';
                const status = p.status || 'Ativo';
                const ultimaRevisao = p.ultimaRevisao || 'Nunca';

                const statusColors = {
                    'Ativo': '#D1FAE5, #065F46',
                    'Em observação': '#FEF3C7, #92400E',
                    'Internado': '#FEE2E2, #991B1B',
                    'Alta': '#DBEAFE, #1E40AF'
                };
                const [bg, color] = (statusColors[status] || '#F3F4F6, #374151').split(', ');

                return `
                    <tr>
                        <td>
                            <strong>${nome}</strong>
                            <br><small style="color: var(--text-secondary);">${email}</small>
                        </td>
                        <td>
                            <span style="
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                background: ${diagnostico !== 'Não informado' ? '#D1FAE5' : '#FEF3C7'};
                                color: ${diagnostico !== 'Não informado' ? '#065F46' : '#92400E'};
                            ">
                                ${diagnostico}
                            </span>
                        </td>
                        <td>
                            <span style="
                                padding: 4px 12px;
                                border-radius: 20px;
                                font-size: 12px;
                                background: ${bg};
                                color: ${color};
                            ">
                                ${status}
                            </span>
                        </td>
                        <td>${ultimaRevisao}</td>
                        <td>
                            <button class="btn-acao" onclick="verProntuario('${id}')" title="Ver Prontuário">
                                <i class="fa-solid fa-folder-open"></i> Prontuário
                            </button>
                            <button class="btn-acao" onclick="abrirModalDiagnostico('${id}')" title="Editar Diagnóstico" style="background: #DBEAFE; color: #1E40AF;">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn-acao" onclick="abrirModalStatus('${id}', '${nome}')" title="Alterar Status" style="background: #FEF3C7; color: #92400E;">
                                <i class="fa-solid fa-heart-pulse"></i>
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');

        } else {
            const erro = await response.json().catch(() => ({}));
            console.error('❌ Erro:', erro);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--danger); padding: 20px;">
                        ❌ Erro ao carregar pacientes: ${erro.message || 'Tente novamente.'}
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('❌ Erro ao carregar pacientes:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: var(--danger); padding: 20px;">
                    ❌ Erro de conexão ao carregar pacientes.
                </td>
            </tr>
        `;
    }
}

async function vincularPacienteMedico() {
    const input = document.getElementById('email-paciente-vincular');
    const email = input?.value?.trim();

    if (!email) {
        alert('⚠️ Digite o e-mail do paciente.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        console.log('📤 Vinculando paciente:', email);

        const response = await fetch('/terapeutas/vincular', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ emailPaciente: email })
        });

        const data = await response.json();
        console.log('📥 Resposta vínculo:', data);

        if (response.ok) {
            alert('✅ ' + (data.message || 'Paciente vinculado com sucesso!'));
            if (input) input.value = '';
            carregarPacientesMedico();
        } else {
            alert('❌ ' + (data.message || data.error || 'Erro ao vincular paciente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao vincular:', error);
        alert('❌ Erro de conexão.');
    }
}

window.verProntuario = async function(idPaciente) {
    console.log('🔍 Buscando prontuário para paciente:', idPaciente);

    if (!idPaciente) {
        alert('❌ ID do paciente não encontrado.');
        return;
    }

    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`/usuarios/paciente/${idPaciente}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert('❌ Erro ao carregar dados do paciente.');
            return;
        }

        const paciente = await response.json();
        console.log('✅ Paciente carregado:', paciente.nome);

        const insightsResponse = await fetch(`/insights/paciente/${idPaciente}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        let insights = [];
        if (insightsResponse.ok) {
            const dados = await insightsResponse.json();
            insights = dados.data || dados || [];
            console.log(`✅ ${insights.length} insights encontrados`);
        } else {
            console.log('ℹ️ Nenhum insight encontrado para este paciente');
        }

        const modalExistente = document.getElementById('modal-prontuario');
        if (modalExistente) modalExistente.remove();

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.id = 'modal-prontuario';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 750px; max-height: 90vh; overflow-y: auto;">
                <button class="modal-close" onclick="fecharModal('modal-prontuario')">&times;</button>
                <div class="modal-header">
                    <h2><i class="fa-solid fa-folder-open"></i> Prontuário</h2>
                    <p><strong>${paciente.nome || 'Paciente'}</strong></p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; background: var(--background); padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                    <div>
                        <p style="font-size: 12px; color: var(--text-secondary);">E-mail</p>
                        <p style="font-weight: 600;">${paciente.email || '-'}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-secondary);">Diagnóstico</p>
                        <p style="font-weight: 600;">${paciente.diagnostico || 'Não informado'}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-secondary);">Tipo</p>
                        <p style="font-weight: 600;">${paciente.tipo_usuario || '-'}</p>
                    </div>
                    <div>
                        <p style="font-size: 12px; color: var(--text-secondary);">Próxima Medicação</p>
                        <p style="font-weight: 600;">${paciente.proxima_medicacao || 'Não informado'}</p>
                    </div>
                </div>
                <h4 style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                    <i class="fa-solid fa-brain" style="color: var(--primary);"></i>
                    Insights Registrados
                    <span style="font-size: 12px; color: var(--text-secondary); font-weight: normal;">
                        (${insights.length})
                    </span>
                </h4>
                ${insights.length === 0 ? `
                    <div style="text-align: center; color: var(--text-secondary); padding: 20px; background: var(--background); border-radius: 8px;">
                        <i class="fa-regular fa-face-smile" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                        Nenhum insight registrado para este paciente.
                        <br><small>Insights são gerados pelo terapeuta durante as sessões.</small>
                    </div>
                ` : `
                    <div style="max-height: 300px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;">
                        ${insights.map(i => `
                            <div style="
                                background: var(--background);
                                padding: 14px 16px;
                                border-radius: 8px;
                                border-left: 4px solid var(--primary);
                            ">
                                <p style="font-size: 14px; margin: 0; color: var(--text-primary);">
                                    ${i.dashboard || 'Sem descrição'}
                                </p>
                                <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 12px; color: var(--text-secondary);">
                                    ${i.periodo_semana ? `<span>📅 Semana: ${i.periodo_semana}</span>` : ''}
                                    ${i.periodo_Mes ? `<span>📆 Mês: ${i.periodo_Mes}</span>` : ''}
                                    ${i.createdAt ? `<span>🕐 ${new Date(i.createdAt).toLocaleDateString('pt-BR')}</span>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
                <div style="margin-top: 16px; display: flex; gap: 10px;">
                    <button onclick="fecharModal('modal-prontuario')" class="btn-primary" style="flex: 1;">
                        <i class="fa-solid fa-xmark"></i> Fechar
                    </button>
                    <button onclick="criarInsightParaPaciente('${idPaciente}')" class="btn-primary" style="flex: 1; background: var(--secondary);">
                        <i class="fa-solid fa-plus"></i> Novo Insight
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('❌ Erro ao buscar prontuário:', error);
        alert('❌ Erro de conexão ao carregar prontuário.');
    }
};

window.abrirModalDiagnostico = function(idPaciente = '') {
    console.log('📋 Abrindo modal diagnóstico...', { idPaciente });

    const existente = document.getElementById('modal-diagnostico');
    if (existente) existente.remove();

    const pacientes = window.pacientesCarregados || [];

    let options = '<option value="">-- Selecione um paciente --</option>';

    if (pacientes.length === 0) {
        options += '<option value="" disabled>Nenhum paciente disponível</option>';
    } else {
        options += pacientes.map(p => {
            const id = p._id || p.id;
            const nome = p.nome || p.email || 'Paciente';
            const selected = (id === idPaciente) ? 'selected' : '';
            return `<option value="${id}" ${selected}>${nome}</option>`;
        }).join('');
    }

    const modal = document.createElement('div');
    modal.id = 'modal-diagnostico';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card">
            <button class="modal-close" onclick="fecharModal('modal-diagnostico')">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-notes-medical"></i> Diagnóstico</h2>
                <p>Registre ou atualize o diagnóstico do paciente.</p>
            </div>
            <form id="form-diagnostico" onsubmit="salvarDiagnostico(event)">
                <div class="form-group">
                    <label>Paciente</label>
                    <select id="select-paciente" required>
                        ${options}
                    </select>
                </div>
                <div class="form-group">
                    <label>Diagnóstico</label>
                    <textarea id="input-diagnostico" rows="4" placeholder="Digite o diagnóstico..." required style="
                        padding: 10px;
                        border: 2px solid var(--border);
                        border-radius: 8px;
                        resize: vertical;
                        font-family: inherit;
                        width: 100%;
                    "></textarea>
                </div>
                <div class="form-group">
                    <label>Observações (opcional)</label>
                    <textarea id="input-observacoes" rows="2" placeholder="Observações adicionais..." style="
                        padding: 10px;
                        border: 2px solid var(--border);
                        border-radius: 8px;
                        resize: vertical;
                        font-family: inherit;
                        width: 100%;
                    "></textarea>
                </div>
                <button type="submit" class="btn-primary btn-full">
                    <i class="fa-solid fa-save"></i> Salvar Diagnóstico
                </button>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    if (idPaciente) {
        const input = document.getElementById('input-diagnostico');
        if (input) input.focus();
    }
};

window.salvarDiagnostico = async function(event) {
    event.preventDefault();

    const idPaciente = document.getElementById('select-paciente').value;
    const diagnostico = document.getElementById('input-diagnostico').value.trim();
    const observacoes = document.getElementById('input-observacoes')?.value.trim() || '';

    if (!idPaciente) {
        alert('⚠️ Selecione um paciente.');
        return;
    }

    if (!diagnostico) {
        alert('⚠️ Digite o diagnóstico.');
        return;
    }

    console.log('📤 Salvando diagnóstico:', { idPaciente, diagnostico });

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/terapeutas/diagnostico/${idPaciente}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                diagnostico: diagnostico,
                observacoes: observacoes
            })
        });

        const data = await response.json();
        console.log('📥 Resposta:', data);

        if (response.ok) {
            alert('✅ Diagnóstico salvo com sucesso!');
            fecharModal('modal-diagnostico');
            carregarPacientesMedico();
        } else {
            alert('❌ Erro: ' + (data.message || data.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao salvar diagnóstico:', error);
        alert('❌ Erro de conexão.');
    }
};

window.salvarStatus = async function(event) {
    event.preventDefault();

    const pacienteId = document.getElementById('status-paciente-id')?.value;
    const status = document.getElementById('select-status').value;

    if (!pacienteId) {
        alert('⚠️ ID do paciente não encontrado.');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/terapeutas/status/${pacienteId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();
        console.log('📥 Resposta status:', data);

        if (response.ok) {
            alert('✅ Status atualizado com sucesso!');
            fecharModal('modal-status');
            carregarPacientesMedico();
        } else {
            alert('❌ Erro: ' + (data.message || data.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar status:', error);
        alert('❌ Erro de conexão.');
    }
};

window.fecharModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) modal.remove();
};

window.abrirModalStatus = function(pacienteId, nomePaciente) {
    console.log('📋 Abrindo modal status para:', { pacienteId, nomePaciente });

    const existente = document.getElementById('modal-status');
    if (existente) existente.remove();

    const modal = document.createElement('div');
    modal.id = 'modal-status';
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
        <div class="modal-card" style="max-width: 450px;">
            <button class="modal-close" onclick="fecharModal('modal-status')">&times;</button>
            <div class="modal-header">
                <h2><i class="fa-solid fa-heart-pulse"></i> Alterar Status</h2>
                <p>Paciente: <strong>${nomePaciente || 'Carregando...'}</strong></p>
            </div>
            <form id="form-status" onsubmit="salvarStatus(event)">
                <input type="hidden" id="status-paciente-id" value="${pacienteId}">
                <div class="form-group">
                    <label>Status do Paciente</label>
                    <select id="select-status" required style="
                        padding: 10px 14px;
                        border: 2px solid var(--border);
                        border-radius: 8px;
                        width: 100%;
                        font-size: 14px;
                    ">
                        <option value="Ativo">✅ Ativo</option>
                        <option value="Em observação">🔍 Em observação</option>
                        <option value="Internado">🏥 Internado</option>
                        <option value="Alta">✅ Alta</option>
                    </select>
                </div>
                <div style="display: flex; gap: 10px; margin-top: 16px;">
                    <button type="button" onclick="fecharModal('modal-status')" style="
                        flex: 1;
                        padding: 10px;
                        border: 1px solid var(--border);
                        border-radius: 8px;
                        background: transparent;
                        cursor: pointer;
                    ">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary" style="flex: 2;">
                        <i class="fa-solid fa-save"></i> Salvar Status
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
};

window.criarInsightParaPaciente = async function(idPaciente) {
    console.log('📝 Criando insight para paciente:', idPaciente);

    if (!idPaciente) {
        alert('❌ ID do paciente não encontrado.');
        return;
    }

    fecharModal('modal-prontuario');

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/usuarios/paciente/${idPaciente}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            alert('❌ Erro ao buscar dados do paciente.');
            return;
        }

        const paciente = await response.json();

        const existente = document.getElementById('modal-insight');
        if (existente) existente.remove();

        const modal = document.createElement('div');
        modal.id = 'modal-insight';
        modal.className = 'modal-overlay active';
        modal.innerHTML = `
            <div class="modal-card" style="max-width: 600px;">
                <button class="modal-close" onclick="fecharModal('modal-insight')">&times;</button>
                <div class="modal-header">
                    <h2><i class="fa-solid fa-brain"></i> Novo Insight</h2>
                    <p>Paciente: <strong>${paciente.nome || 'Paciente'}</strong></p>
                </div>
                <form id="form-insight" onsubmit="salvarInsight(event, '${idPaciente}')">
                    <div class="form-group">
                        <label>Dashboard / Descrição</label>
                        <textarea id="insight-dashboard" rows="4" placeholder="Digite o insight sobre o paciente..." required style="
                            padding: 10px;
                            border: 2px solid var(--border);
                            border-radius: 8px;
                            resize: vertical;
                            font-family: inherit;
                            width: 100%;
                        "></textarea>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                        <div class="form-group">
                            <label>Período (Semana)</label>
                            <input type="text" id="insight-semana" placeholder="Ex: 2024-W01" style="
                                padding: 10px;
                                border: 2px solid var(--border);
                                border-radius: 8px;
                                width: 100%;
                            ">
                        </div>
                        <div class="form-group">
                            <label>Período (Mês)</label>
                            <input type="text" id="insight-mes" placeholder="Ex: 2024-01" style="
                                padding: 10px;
                                border: 2px solid var(--border);
                                border-radius: 8px;
                                width: 100%;
                            ">
                        </div>
                    </div>
                    <button type="submit" class="btn-primary btn-full">
                        <i class="fa-solid fa-save"></i> Salvar Insight
                    </button>
                </form>
            </div>
        `;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('❌ Erro ao criar insight:', error);
        alert('❌ Erro de conexão.');
    }
};

window.salvarInsight = async function(event, idPaciente) {
    event.preventDefault();

    const dashboard = document.getElementById('insight-dashboard').value.trim();
    const periodo_semana = document.getElementById('insight-semana').value.trim() || undefined;
    const periodo_Mes = document.getElementById('insight-mes').value.trim() || undefined;
    const terapeutaId = localStorage.getItem('userId') || localStorage.getItem('usuarioId');

    if (!dashboard) {
        alert('⚠️ Digite a descrição do insight.');
        return;
    }

    if (!terapeutaId) {
        alert('⚠️ ID do terapeuta não encontrado. Faça login novamente.');
        return;
    }

    console.log('📤 Salvando insight:', { idPaciente, dashboard, periodo_semana, periodo_Mes, terapeutaId });

    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/insights', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pacienteId: idPaciente,
                terapeutaId: terapeutaId,
                dashboard: dashboard,
                periodo_semana: periodo_semana,
                periodo_Mes: periodo_Mes
            })
        });

        const data = await response.json();
        console.log('📥 Resposta do insight:', data);

        if (response.ok) {
            alert('✅ Insight salvo com sucesso!');
            fecharModal('modal-insight');
            setTimeout(() => {
                verProntuario(idPaciente);
            }, 300);
        } else {
            alert('❌ Erro ao salvar insight: ' + (data.mensagem || data.error || 'Tente novamente.'));
        }
    } catch (error) {
        console.error('❌ Erro ao salvar insight:', error);
        alert('❌ Erro de conexão ao salvar insight.');
    }
};

setInterval(carregarPacientesMedico, 60000);