CREATE PROCEDURE datosPDF()
BEGIN    
    DECLARE reclamosTotales INT;
    DECLARE reclamosNoFinalizados INT;
    DECLARE reclamosFinalizados INT;
    DECLARE descripcionTipoRreclamoFrecuente VARCHAR(255);
    DECLARE cantidadTipoRreclamoFrecuente INT;

    
    SELECT COUNT(*) INTO reclamosTotales FROM reclamos;
    SELECT COUNT(*) INTO reclamosNoFinalizados FROM reclamos WHERE reclamos.idReclamoEstado <> 4;
    SELECT COUNT(*) INTO reclamosFinalizados FROM reclamos WHERE reclamos.idReclamoEstado = 4;

    SELECT rt.descripcion, COUNT(*) INTO descripcionTipoRreclamoFrecuente, cantidadTipoRreclamoFrecuente
    FROM reclamos AS r
    INNER JOIN reclamos_tipo AS rt ON rt.idReclamoTipo = r.idReclamoTipo
    GROUP BY r.idReclamoTipo
    ORDER BY cantidadTipoRreclamoFrecuente DESC 
    LIMIT 1;

    
    SELECT 
        reclamosTotales,
        reclamosNoFinalizados,
        reclamosFinalizados,
        descripcionTipoRreclamoFrecuente,
        cantidadTipoRreclamoFrecuente;
END