/**
 * schema.ts
 * ---------------------------------------------------------------
 * Contém o SQL de criação do banco, organizado em MIGRAÇÕES.
 *
 * Cada item do array MIGRACOES é uma versão do schema:
 *   índice 0 -> versão 1, índice 1 -> versão 2, ...
 * O database.ts compara com o `PRAGMA user_version` do aparelho e
 * executa apenas as migrações que faltam. Para alterar o banco no
 * futuro, NUNCA edite uma migração existente: adicione uma nova.
 *
 * Obs.: PRAGMA foreign_keys é ligado no database.ts (não funciona
 * dentro de transação, por isso não aparece aqui).
 */

const V1 = `
-- 1. USUÁRIO
CREATE TABLE IF NOT EXISTS usuario (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nome          TEXT    NOT NULL CHECK (length(trim(nome)) > 0),
    email         TEXT    UNIQUE,
    criado_em     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    atualizado_em TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

-- 2. TABELAS DE DOMÍNIO
CREATE TABLE IF NOT EXISTS fonte (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL UNIQUE,
    disponivel INTEGER NOT NULL DEFAULT 1 CHECK (disponivel IN (0,1))
);

CREATE TABLE IF NOT EXISTS esquema_cor (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL UNIQUE,
    cor_fundo  TEXT    NOT NULL,
    cor_texto  TEXT    NOT NULL,
    cor_borda  TEXT    NOT NULL
);

INSERT OR IGNORE INTO fonte (id, nome) VALUES
    (1, 'Lexend'),
    (2, 'Andika'),
    (3, 'OpenDyslexic');

INSERT OR IGNORE INTO esquema_cor (id, nome, cor_fundo, cor_texto, cor_borda) VALUES
    (1, 'azul',    '#E3F0FB', '#0077B6', '#9CC7E8'),
    (2, 'roxo',    '#F0E9FA', '#6A1FC2', '#B79BE0'),
    (3, 'laranja', '#FBEFE3', '#B8690F', '#EDAA6E'),
    (4, 'verde',   '#E6F4EE', '#0E9F7E', '#8FD0B8');

-- 3. PREFERÊNCIAS (1:1 com usuário)
CREATE TABLE IF NOT EXISTS preferencia (
    usuario_id      INTEGER PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    fonte_id        INTEGER NOT NULL DEFAULT 1 REFERENCES fonte(id),
    tamanho_fonte   INTEGER NOT NULL DEFAULT 20 CHECK (tamanho_fonte BETWEEN 12 AND 48),
    espacamento     TEXT    NOT NULL DEFAULT 'confortavel'
                    CHECK (espacamento IN ('normal','confortavel','amplo')),
    esquema_cor_id  INTEGER NOT NULL DEFAULT 1 REFERENCES esquema_cor(id),
    atualizado_em   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TRIGGER IF NOT EXISTS trg_usuario_preferencia_padrao
AFTER INSERT ON usuario
BEGIN
    INSERT INTO preferencia (usuario_id) VALUES (NEW.id);
END;

CREATE TRIGGER IF NOT EXISTS trg_usuario_atualizado
AFTER UPDATE ON usuario
BEGIN
    UPDATE usuario SET atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_preferencia_atualizada
AFTER UPDATE ON preferencia
BEGIN
    UPDATE preferencia SET atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ','now')
    WHERE usuario_id = NEW.usuario_id;
END;

-- 4. CATEGORIA
CREATE TABLE IF NOT EXISTS categoria (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    nome       TEXT    NOT NULL CHECK (length(trim(nome)) > 0),
    cor        TEXT,
    UNIQUE (usuario_id, nome)
);

-- 5. DOCUMENTO
CREATE TABLE IF NOT EXISTS documento (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id        INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    categoria_id      INTEGER REFERENCES categoria(id) ON DELETE SET NULL,
    titulo            TEXT    NOT NULL CHECK (length(trim(titulo)) > 0),
    origem            TEXT    NOT NULL CHECK (origem IN ('camera','imagem','pdf','texto')),
    texto_original    TEXT,
    texto_adaptado    TEXT,
    arquivo_origem    TEXT,
    arquivo_exportado TEXT,
    status            TEXT    NOT NULL DEFAULT 'concluido'
                      CHECK (status IN ('pendente','processando','concluido','erro')),
    mensagem_erro     TEXT,
    cor_capa          TEXT,
    favorito          INTEGER NOT NULL DEFAULT 0 CHECK (favorito IN (0,1)),
    posicao_leitura   INTEGER NOT NULL DEFAULT 0 CHECK (posicao_leitura >= 0),
    progresso         INTEGER NOT NULL DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    ultima_leitura_em TEXT,
    criado_em         TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
    atualizado_em     TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_doc_usuario_criado ON documento (usuario_id, criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_doc_continue
    ON documento (usuario_id, ultima_leitura_em DESC) WHERE ultima_leitura_em IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_doc_favorito ON documento (usuario_id) WHERE favorito = 1;
CREATE INDEX IF NOT EXISTS idx_doc_categoria ON documento (categoria_id);

CREATE TRIGGER IF NOT EXISTS trg_documento_atualizado
AFTER UPDATE ON documento
BEGIN
    UPDATE documento SET atualizado_em = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = NEW.id;
END;

-- 6. VIEWS
CREATE VIEW IF NOT EXISTS v_continue_lendo AS
SELECT id, usuario_id, titulo, cor_capa, progresso, ultima_leitura_em
FROM   documento
WHERE  status = 'concluido' AND ultima_leitura_em IS NOT NULL AND progresso < 100
ORDER  BY ultima_leitura_em DESC;

CREATE VIEW IF NOT EXISTS v_biblioteca AS
SELECT d.id, d.usuario_id, d.titulo, d.cor_capa, d.favorito, d.criado_em,
       d.progresso, c.id AS categoria_id, c.nome AS categoria
FROM   documento d
LEFT JOIN categoria c ON c.id = d.categoria_id
WHERE  d.status = 'concluido';

CREATE VIEW IF NOT EXISTS v_preferencia_completa AS
SELECT p.usuario_id, f.nome AS fonte, p.tamanho_fonte, p.espacamento,
       e.nome AS esquema_cor, e.cor_fundo, e.cor_texto, e.cor_borda
FROM   preferencia p
JOIN   fonte f       ON f.id = p.fonte_id
JOIN   esquema_cor e ON e.id = p.esquema_cor_id;
`;

/** Lista ordenada de migrações. Para evoluir o banco, adicione V2, V3... aqui. */
export const MIGRACOES: string[] = [V1];
