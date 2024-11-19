export default class ReclamoRepository {
  constructor(database) {
    this.database = database;
  }

  async getAll() {
    try {
      const sqlQuery = "SELECT * FROM reclamos";
      const [result] = await this.database.query(sqlQuery);
      return result;
    } catch (error) {
      console.error("Error en la consulta de los reclamos: ", error);
      throw error;
    }
  }

  async getOneById(id) {
    try {
      const sqlQuery = `
      SELECT r.*, e.descripcion as estado, rt.descripcion as reclamoTipo 
      FROM reclamos r 
      INNER JOIN reclamos_estado e ON r.idReclamoEstado = e.idReclamoEstado 
      INNER JOIN reclamos_tipo rt ON r.idReclamoTipo = rt.idReclamoTipo 
      WHERE r.idReclamo = ?
    `;
      const [rows] = await this.database.query(sqlQuery, [id]);
      return rows[0];
    } catch (error) {
      console.error("Error en la consulta del reclamo: ", error);
      throw error;
    }
  }

  async getReportData1() {
    try {
      const sqlQuery = "CALL datosPDF()";
      const [result] = await this.database.query(sqlQuery);
      return result[0][0];
    } catch (error) {
      console.error("Error en la consulta de los reclamos: ", error);
      throw error;
    }
  }

  async getReportData2() {
    try {
      // Llamar al procedimiento almacenado para obtener los datos en formato de tabla
      const sqlQuery = "CALL datosCSV()";
      const [result] = await this.database.query(sqlQuery);
      
      // El resultado está en result[0] porque el resultado de la consulta es un arreglo
      return result[0]; // Retornar los datos de los reclamos
    } catch (error) {
      console.error("Error en la consulta de los reclamos: ", error);
      throw error;
    }
  }
  

  async create(reclamo) {
    try {
      const sqlQuery = "INSERT INTO reclamos SET ?, fechaCreado = NOW()";
      const [result] = await this.database.query(sqlQuery, [reclamo]);
      const reclamoCreado = await this.getOneById(result.insertId);
      return reclamoCreado;
    } catch (error) {
      console.error("Error en la creación del reclamo: ", error);
      throw error;
    }
  }

  async update(id, changes) {
    try {
      const sqlQuery = "UPDATE reclamos SET ? WHERE idReclamo = ?";
      await this.database.query(sqlQuery, [changes, id]);
      const reclamo = await this.getOneById(id);
      return reclamo;
    } catch (error) {
      console.error("Error en la actualización del reclamo: ", error);
      throw error;
    }
  }
}