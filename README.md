# 🧠 NeuroSync

Assistente Cognitivo e de Segurança para Pessoas Neurodivergentes (Autismo e TDAH)

_Categoria_: Saúde e Tecnologias Assistivas

## 📌 Sobre o Projeto

O NeuroSync é uma plataforma desenvolvida para transformar a forma como pessoas com Autismo e TDAH lidam com rotinas e disfunções executivas. 

Em vez de usar agendas e ícones genéricos que geram ansiedade e falta de engajamento, o NeuroSync adota uma rotina visual baseada em imagens reais enviadas pelos próprios cuidadores (ex: a escova de dentes do paciente, a porta do seu quarto). 

O sistema conta com duas travas de segurança essenciais:

1. Botão "Tô Travado" (Pânico Cognitivo): Fatia tarefas complexas em micro-passos visuais/sonoros quando o paciente entra em disfunção executiva.
2. Botão "SOS de Rastreio": Dispara a geolocalização em tempo real para a rede de apoio em casos de crises sensoriais (meltdowns/shutdowns) ou desorientação na rua.

## 👥 Perfis de Usuário

| Usuário | Funções Principais |
| :--- | :--- |
| **Paciente (Neurodivergente)** | Acompanha a rotina visual por imagens reais, aciona o botão **"Tô Travado"** para ajuda em tarefas e o botão **"SOS"** em emergências na rua. |
| **Cuidador** | Configura a rotina com uploads de fotos reais, recebe alertas *push* e monitora a localização em tempo real no mapa. |
| **Profissional de Saúde (Psicólogo/Terapeuta)** | Acessa o dashboard web com histórico de crises, uso do botão SOS e tarefas pendentes para identificar gatilhos e ajustar a terapia. |

# ⚙️ Regras de Negócio Importantes

* Uso Obrigatório de Imagens Reais (Rotina Visual): O sistema prioriza o upload de fotos reais do cotidiano em vez de ícones genéricos para facilitar a previsibilidade e a compreensão.  

* Algoritmo do "Tô Travado": Ao acionar o botão, a API oculta a tarefa principal e entrega uma esteira sequencial de micro-passos (ex: "1. Pegar a toalha", "2. Tirar a roupa", "3. Ligar o chuveiro") com apoio de áudio e/ou imagem.

* Rastreamento de Emergência Telemétrico: Durante um evento de SOS, a API envia atualizações de GPS via PUT a cada 30 segundos até o evento ser marcado como "Resolvido".

* Privacidade e LGPD: O terapeuta só tem acesso aos dados de crises se houver um Vínculo de Cuidado digitalmente aprovado pelo paciente ou seu responsável legal.

## 🛠️ Entidades & Modelagem de Dados
* Usuário (Base): id, nome, email, senha (hashed), telefone, papel (paciente, cuidador, profissional), foto_perfil_url, latitude_atual, longitude_atual.

* Vinculo_Cuidado: id, paciente_id, cuidador_id, nivel_permissao (apenas_rotina, rotina_e_localizacao, acesso_terapeutico).

* Tarefa_Visual: id, paciente_id, titulo, horario_previsto, imagem_ilustrativa_url, status (pendente, concluida, travou), data_criacao.

* Micro_Passo: id, tarefa_id, descricao, ordem, imagem_passo_url, concluido (boolean).

* Evento_SOS: id, paciente_id, lat_inicial, long_inicial, data_hora_inicio, data_hora_fim, status (ativo, resolvido).

* Log_Rastreio: id, evento_sos_id, latitude, longitude, timestamp.

# 💻 Como Rodar o Projeto

### Clone o repositório
git clone https://github.com/seu-usuario/neurosync.git

### Entre no diretório do projeto
cd neurosync

### Instale as dependências
npm install # ou yarn / pip / cargo

### Configure as variáveis de ambiente (.env)
cp .env.example .env

### Execute a aplicação
npm run dev

