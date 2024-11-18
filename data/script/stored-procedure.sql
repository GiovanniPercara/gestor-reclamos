BEGIN
    DECLARE reclamosTotales INT;
    DECLARE reclamosNoFinalizados INT;
    DECLARE reclamosFinalizados INT;
    DECLARE descripcionTipoReclamoFrecuente VARCHAR(255);
    DECLARE cantidadTipoReclamoFrecuente INT;

    -- Datos para el PDF
    SELECT COUNT(*) INTO reclamosTotales FROM reclamos;

    SELECT COUNT(*) INTO reclamosNoFinalizados 
    FROM reclamos 
    WHERE reclamos.idReclamoEstado <> 4;

    SELECT COUNT(*) INTO reclamosFinalizados 
    FROM reclamos 
    WHERE reclamos.idReclamoEstado = 4;

    SELECT rt.descripcion, COUNT(*) 
    INTO descripcionTipoReclamoFrecuente, cantidadTipoReclamoFrecuente
    FROM reclamos AS r
    INNER JOIN reclamos_tipo AS rt ON rt.idReclamoTipo = r.idReclamoTipo
    GROUP BY r.idReclamoTipo
    ORDER BY COUNT(*) DESC
    LIMIT 1;

    -- Primer conjunto de resultados: datos para PDF
    SELECT 
        reclamosTotales AS TotalReclamos,
        reclamosNoFinalizados AS ReclamosNoFinalizados,
        reclamosFinalizados AS ReclamosFinalizados,
        descripcionTipoReclamoFrecuente AS TipoReclamoMasFrecuente,
        cantidadTipoReclamoFrecuente AS CantidadReclamoMasFrecuente;

    -- Segundo conjunto de resultados: datos para CSV
    SELECT 
        r.idReclamo,
        rt.descripcion AS TipoReclamo,
        re.descripcion AS Estado,
        r.fechaDeCreado
    FROM reclamos AS r
    INNER JOIN reclamos_tipo AS rt ON rt.idReclamoTipo = r.idReclamoTipo
    INNER JOIN reclamos_estado AS re ON re.idReclamoEstado = r.idReclamoEstado;
END