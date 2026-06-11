import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const connectionString = `postgres://postgres:${process.env.SUPABASE_DB_PASSWORD}@db.xhqqjungilusfiyvmhcg.supabase.co:5432/postgres`;

async function main() {
  console.log('Iniciando conexão com o Supabase Postgres...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Conectado com sucesso!');

    // 1. Criar tabelas
    console.log('Criando tabela: tenants...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS tenants (
        id VARCHAR(255) PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        limite_alunos INTEGER DEFAULT 10,
        plano VARCHAR(100) DEFAULT 'Básico',
        subdomain VARCHAR(255) UNIQUE NOT NULL
      );
    `);

    console.log('Criando tabela: users...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        role VARCHAR(100) NOT NULL,
        plano_vip BOOLEAN DEFAULT FALSE,
        dados_pessoais JSONB DEFAULT '{}'::jsonb
      );
    `);

    console.log('Criando tabela: avaliacoes...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS avaliacoes (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        medidas JSONB DEFAULT '{}'::jsonb,
        fotos_urls JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Criando tabela: treinos_html...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS treinos_html (
        id VARCHAR(255) PRIMARY KEY,
        tenant_id VARCHAR(255) NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        html_content TEXT NOT NULL
      );
    `);

    // 2. Limpar dados anteriores (opcional, para garantir um seed limpo)
    console.log('Limpando dados anteriores...');
    await client.query('TRUNCATE TABLE treinos_html, avaliacoes, users, tenants CASCADE;');

    // 3. Inserir Tenants (Mocks Iniciais)
    console.log('Semeando tenants...');
    const defaultTenants = [
      { id: 't1', nome: 'Academia Vibe & Energia', limite_alunos: 50, plano: 'Grow', subdomain: 'academia-vibe' },
      { id: 't2', nome: 'Cross Pulse Studio', limite_alunos: 20, plano: 'Start', subdomain: 'cross-pulse' },
      { id: 'master', nome: 'Fit Seven Corporate', limite_alunos: 9999, plano: 'Scale', subdomain: 'master' }
    ];

    for (const t of defaultTenants) {
      await client.query(
        `INSERT INTO tenants (id, nome, limite_alunos, plano, subdomain) VALUES ($1, $2, $3, $4, $5)`,
        [t.id, t.nome, t.limite_alunos, t.plano, t.subdomain]
      );
    }

    // 4. Inserir Usuários (Mocks Iniciais)
    console.log('Semeando users...');
    const defaultUsers = [
      { id: 'u1', name: 'Alice Silva (Estabelec.)', email: 'admin@vibe.com', tenantId: 't1', role: 'estabelecimento', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
      { id: 'u2', name: 'Prof. Carlos Santos', email: 'carlos@vibe.com', tenantId: 't1', role: 'professor', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', plano: 'Básico', limiteAlunos: 10 },
      { id: 'u3', name: 'Lucas Aluno', email: 'lucas@vibe.com', tenantId: 't1', role: 'aluno', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', isVip: true, data_ativacao_vip: '2026-06-01T12:00:00.000Z' },
      { id: 'u4', name: 'Mariana Lima (Estabelec.)', email: 'admin@pulse.com', tenantId: 't2', role: 'estabelecimento', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
      { id: 'u5', name: 'Prof. Pedro Souza', email: 'pedro@pulse.com', tenantId: 't2', role: 'professor', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', plano: 'Básico', limiteAlunos: 10 },
      { id: 'u6', name: 'Juliana Aluna', email: 'juliana@pulse.com', tenantId: 't2', role: 'aluno', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z', isVip: false },
      { id: 'u7', name: 'Suporte Master System', email: 'master@fitseven.com', tenantId: 'master', role: 'master', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' },
      { id: 'u8', name: 'Tony (MASTER)', email: 'tony@fitseven.com', tenantId: 'master', role: 'master', password: '123', data_cadastro: '2026-05-10T12:00:00.000Z' }
    ];

    for (const u of defaultUsers) {
      const dadosPessoais = {
        name: u.name,
        email: u.email,
        password: u.password,
        data_cadastro: u.data_cadastro || new Date().toISOString(),
        data_ativacao_vip: u.data_ativacao_vip || null,
        plano: u.plano || null,
        limiteAlunos: u.limiteAlunos || null
      };

      await client.query(
        `INSERT INTO users (id, tenant_id, role, plano_vip, dados_pessoais) VALUES ($1, $2, $3, $4, $5)`,
        [u.id, u.tenantId, u.role, !!u.isVip, JSON.stringify(dadosPessoais)]
      );
    }

    // 5. Inserir Treinos Iniciais (HTML de exemplo para Lucas Aluno)
    console.log('Semeando treinos_html de exemplo...');
    const defaultTreinoHtml = `
      <div class="workout-plan">
        <h3>Treino Especializado A - Hipertrofia Peitoral</h3>
        <p><strong>Foco:</strong> Hipertrofia e Força de Empurrar</p>
        <ul>
          <li><strong>Supino Reto com Barra:</strong> 4 séries de 10 reps (30kg de cada lado)</li>
          <li><strong>Crossover na Polia Média:</strong> 3 séries de 12 reps (15kg de cada lado)</li>
          <li><strong>Supino Inclinado com Halteres:</strong> 4 séries de 10 reps (22kg cada halter)</li>
        </ul>
      </div>
    `;

    await client.query(
      `INSERT INTO treinos_html (id, tenant_id, user_id, html_content) VALUES ($1, $2, $3, $4)`,
      ['t_html_u3', 't1', 'u3', defaultTreinoHtml]
    );

    console.log('Banco de dados semeado e tabelas criadas com sucesso!');
  } catch (err) {
    console.error('Erro na execução do script:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
