CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION versal(varchar)
RETURNS varchar AS
$$
    SELECT upper(unaccent($1));
$$ LANGUAGE SQL IMMUTABLE;

CREATE INDEX usuario_codigo_idx ON usuario USING btree(versal(codigo));
CREATE INDEX usuario_nome_idx ON usuario USING btree(versal(nome));
