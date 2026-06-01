-- Esquema de Banco de Dados - Fit Seven (Multi-Tenant)
-- Requisito Crítico: Todas as tabelas possuem obrigatoriamente a coluna tenant_id para isolamento.

-- 1. Tabela de Tenants (Academias/Estabelecimentos parceiros)
CREATE TABLE tenants (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela de Usuários (Todos os usuários do ecossistema vinculados a um tenant)
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'estabelecimento', 'professor', 'aluno', 'master'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    UNIQUE (tenant_id, email) -- Garante unicidade do email dentro do mesmo tenant
);

-- 3. Tabela de Perfis de Alunos
CREATE TABLE alunos (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Tabela de Perfis de Professores/Treinadores
CREATE TABLE professores (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    specialization VARCHAR(255),
    cref VARCHAR(50) NOT NULL, -- Registro profissional
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Tabela de Exercícios (Cada academia pode ter seus exercícios customizados)
CREATE TABLE exercicios (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'Peito', 'Costas', 'Perna', etc.
    description TEXT,
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- 6. Tabela de Treinos (Prescritos para alunos)
CREATE TABLE treinos (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    aluno_id VARCHAR(36) NOT NULL,
    professor_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE,
    FOREIGN KEY (professor_id) REFERENCES professores(id) ON DELETE CASCADE
);

-- 7. Tabela de Exercícios nos Treinos
CREATE TABLE treino_exercicios (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    treino_id VARCHAR(36) NOT NULL,
    exercicio_id VARCHAR(36) NOT NULL,
    series INT DEFAULT 3,
    repeticoes VARCHAR(50) DEFAULT '12',
    carga VARCHAR(50), -- ex: '15kg'
    descanso VARCHAR(50) DEFAULT '60s',
    ordem INT DEFAULT 0,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE,
    FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
);

-- 8. Tabela de Pagamentos/Mensalidades
CREATE TABLE pagamentos (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36) NOT NULL,
    aluno_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    payment_date DATE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'overdue'
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES alunos(id) ON DELETE CASCADE
);

-- Índices recomendados para otimização de consultas filtradas por tenant_id
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_alunos_tenant ON alunos(tenant_id);
CREATE INDEX idx_professores_tenant ON professores(tenant_id);
CREATE INDEX idx_exercicios_tenant ON exercicios(tenant_id);
CREATE INDEX idx_treinos_tenant ON treinos(tenant_id);
CREATE INDEX idx_pagamentos_tenant ON pagamentos(tenant_id);
