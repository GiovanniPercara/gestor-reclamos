export default class ReclamoService {
  constructor(reclamoRepository, usuarioService, emailService) {
    this.reclamoRepository = reclamoRepository;
    this.usuarioService = usuarioService;
    this.emailService = emailService;
  }

  async getAll() {
    return await this.reclamoRepository.getAll();
  }

  async getOneById(id) {
    return await this.reclamoRepository.getOneById(id);
  }

  async getReportData(format) {
    if (format === 'pdf') {
      return await this.reclamoRepository.getReportData1();  // Llamada para PDF
    } else if (format === 'csv') {
      return await this.reclamoRepository.getReportData2();  // Llamada para CSV
    } else {
      throw new Error("Formato no soportado");
    }
  }

  async create(reclamo) {
    if (!reclamo.idReclamoEstado) {
      reclamo.idReclamoEstado = 1;
    }

    return await this.reclamoRepository.create(reclamo);
  }

  async update(id, changes) {
    if (!changes) {
      changes = { idReclamoEstado: 3 };

      const reclamo = await this.getOneById(id);

      const idUsuarioCreador = reclamo.idUsuarioCreador;
      const usuarioCreador = await this.usuarioService.getOneById(idUsuarioCreador);
      const emailTo = usuarioCreador.correoElectronico;

      await this.emailService.send({
        from: process.env.EMAIL_FROM,
        to: emailTo,
        subject: "Cambio en el estado de su reclamo",
        template: "reclamoEstado",
        context: {
          nombre: usuarioCreador.nombre,
          apellido: usuarioCreador.apellido,
          idReclamo: id,
          estado: "Cancelado",
        }
      });
    }

    return await this.reclamoRepository.update(id, changes);
  }
}