CREATE EXTENSION unaccent SCHEMA public;

ALTER FUNCTION unaccent(text) IMMUTABLE;

CREATE FUNCTION versal(character varying)
    RETURNS character varying
    LANGUAGE 'sql'
AS $BODY$
    SELECT UPPER(unaccent($1));
$BODY$;

SELECT versal('a');

CREATE SCHEMA sistema;

CREATE TABLE sistema.servidor
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (3) with time zone,
    versao integer NOT NULL,
    codigo varchar(20),
    nome varchar(80),
    imagem varchar(800),
    situacao smallint NOT NULL,
    atuante boolean NOT NULL,
    legendas varchar(40)[],
    super boolean NOT NULL,
    principal varchar(80),
    "replica" varchar(80)
);
CREATE INDEX "servidor_codigo_idx" ON sistema.servidor(UPPER(UNACCENT(codigo)));
CREATE INDEX "servidor_nome_idx" ON sistema.servidor(UPPER(UNACCENT(nome)));

CREATE SCHEMA administrativo;

CREATE TABLE administrativo.usuario
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (3) with time zone,
    versao integer NOT NULL,
    codigo varchar(20),
    nome varchar(80),
    imagem varchar(800),
    situacao smallint NOT NULL,
    atuante boolean NOT NULL,
    legendas varchar(40)[],
    super boolean NOT NULL,
    administrador boolean NOT NULL
);
CREATE INDEX "usuario_codigo_idx" ON administrativo.usuario(UPPER(UNACCENT(codigo)));
CREATE INDEX "usuario_nome_idx" ON administrativo.usuario(UPPER(UNACCENT(nome)));

CREATE TABLE administrativo."usuarioCredencial"
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (3) with time zone,
    versao integer NOT NULL,
    "usuarioId" uuid REFERENCES administrativo.usuario(id),
    chave varchar(200) NOT NULL,
    senha varchar(200) NOT NULL
);
CREATE INDEX usuarioCredencial_usuarioId_idx ON administrativo."usuarioCredencial"("usuarioId");

CREATE TABLE administrativo.empresa
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (3) with time zone,
    versao integer NOT NULL,
    codigo varchar(20),
    nome varchar(80),
    imagem varchar(800),
    situacao smallint NOT NULL,
    atuante boolean NOT NULL,
    legendas varchar(40)[],
    super boolean NOT NULL,
	"servidorId" uuid REFERENCES sistema.servidor(id)
);
CREATE INDEX "empresa_codigo_idx" ON administrativo.empresa(UPPER(UNACCENT(codigo)));
CREATE INDEX "empresa_nome_idx" ON administrativo.empresa(UPPER(UNACCENT(nome)));

CREATE SCHEMA seguranca;

CREATE TABLE seguranca.autorizacao
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (3) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (3) with time zone,
    versao integer NOT NULL,
    situacao smallint NOT NULL,
    atuante boolean NOT NULL,
	"empresaId" uuid REFERENCES administrativo.empresa(id) NOT NULL,
	"usuarioId" uuid REFERENCES administrativo.usuario(id) NOT NULL,
	ip varchar(40) NOT NULL,
	aplicativo smallint NOT NULL, -- caixa, front, postman
	navegador varchar(40) NOT NULL,
	horario varchar(20) NOT NULL,
    inicio timestamp (3) with time zone NOT NULL,
	conclusao timestamp (3) with time zone NOT NULL
);
CREATE INDEX autorizacao_empresaId_idx ON seguranca.autorizacao("empresaId");
CREATE INDEX autorizacao_usuarioId_idx ON seguranca.autorizacao("usuarioId");

CREATE TABLE seguranca.auditoria
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (0) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (0) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (0) with time zone,
    versao integer NOT NULL,
	"usuarioId" uuid REFERENCES administrativo.usuario(id),
	"autorizacaoId" uuid REFERENCES seguranca.autorizacao(id),
	horario varchar(20) NOT NULL,
	momento timestamp (0) with time zone NOT NULL,
	procedimento smallint NOT NULL,
	instancia json NOT NULL,
	"instanciaId" uuid NOT NULL,
	"instanciaModelo" smallint NOT NULL,
	"instanciaDescricao" VARCHAR(80) NOT NULL
);
CREATE INDEX auditoria_usuarioId ON seguranca.auditoria("usuarioId");
CREATE INDEX auditoria_autorizacaoId ON seguranca.auditoria("autorizacaoId");
CREATE INDEX auditoria_instanciaId ON seguranca.auditoria("instanciaId", versao DESC);

CREATE TABLE administrativo.filial
(
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    adicao timestamp (0) with time zone NOT NULL DEFAULT now(),
    edicao timestamp (0) with time zone NOT NULL DEFAULT now(),
    remocao timestamp (0) with time zone,
    versao integer NOT NULL,
	"empresaId" uuid REFERENCES administrativo.empresa(id) NOT NULL,
    codigo varchar(20),
    nome varchar(80),
    situacao smallint NOT NULL,
    atuante boolean NOT NULL,
    etiquetas varchar(40)[],
    super boolean NOT NULL
);
CREATE INDEX ON administrativo.empresa(UPPER(UNACCENT(codigo))) WHERE remocao IS NULL;
CREATE INDEX ON administrativo.empresa(UPPER(UNACCENT(nome))) WHERE remocao IS NULL;
