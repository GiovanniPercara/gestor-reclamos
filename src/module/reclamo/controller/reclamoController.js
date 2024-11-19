import { validateCreate } from "./validations.js";

export default class ReclamoController {
  constructor(reclamoService, authRequest, validationService, informeService) {
    this.reclamoService = reclamoService;
    this.authRequest = authRequest;
    this.validationService = validationService;
    this.informeService = informeService;
    this.ROUTE_BASE = "/reclamo";
  }

  configRoutes(app) {
    const ROUTE = this.ROUTE_BASE;

    app.get(this.ROUTE_BASE, this.authRequest(["Administrador"]), this.getAll.bind(this));
    app.get(`${ROUTE}/:id`, this.authRequest(["Administrador", "Cliente"]), this.getOneById.bind(this));
    app.get(`${ROUTE}/report/:format`, this.authRequest(["Administrador"]), this.generateReport.bind(this));
    app.post(
      ROUTE, this.authRequest(["Administrador", "Cliente"]),
      validateCreate(this.validationService),
      this.create.bind(this)
    );
    app.patch(`${ROUTE}/:id`, this.authRequest(["Administrador"]), this.update.bind(this));
    app.patch(`${ROUTE}/:id/cancel`, this.authRequest(["Administrador", "Cliente"]), this.cancel.bind(this));
  }

  async getAll(req, res) {
    try {
      const reclamo = await this.reclamoService.getAll();
      res.status(200);
      res.send({ data: reclamo });
    } catch (error) {
      res.status(500);
      res.send({ message: "Error al obtener los reclamos"});
    }
  }

  async getOneById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400);
        res.send({ message: "Debe indicar un id" });
        return;
      }

      const reclamo = await this.reclamoService.getOneById(id);

      if (!reclamo) {
        res.status(404);
        res.send({ message: "Reclamo no encontrada" });
        return;
      }

      res.status(200);
      res.send({ data: reclamo });
    } catch (error) {
      res.status(500);
      res.send({ message: "Error al obtener el reclamo"});
    }
  }

  async generateReport(req, res) {
    try {
      const { format } = req.params;
  
      // Verificar si el formato es pdf o csv
      if (format !== 'pdf' && format !== 'csv') {
        res.status(400).send({ message: "Formato no soportado. Solo se permite pdf o csv" });
        return;
      }
  
      const reportData = await this.reclamoService.getReportData(format);  // Pasar 'format'
  
      if (format === 'pdf') {
        const pdfBuffer = await this.informeService.generatePDF(reportData);
    
        res.set({
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="informe.pdf"',
        });
        res.end(pdfBuffer);
      } else if (format === 'csv') {
        const csvBuffer = await this.informeService.generateCSV(reportData);
    
        res.set({
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="informe.csv"',
        });
        res.end(csvBuffer);
      }
    } catch (error) {
      console.error("Error al generar el informe: ", error);
      res.status(500).send({
        message: "Error al generar el informe",
        details: error.message,
      });
    }
  }
  

  async create(req, res) {
    const errors = await this.validationService.validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { idUsuario } = req.user;
      const userData = { ...req.body, idUsuarioCreador: idUsuario };
      const reclamo = await this.reclamoService.create(userData);
      res.status(201);
      res.send({ data: reclamo });
    } catch (error) {
      res.status(500);
      res.send({ message: "Error al crear el reclamo"});
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400);
        res.send({ message: "Debe indicar un id" });
        return;
      }

      const reclamo = await this.reclamoService.update(id, req.body);

      if (!reclamo) {
        res.status(404);
        res.send({ message: "Reclamo no encontrado" });
        return;
      }

      res.status(200);
      res.send({ data: reclamo });
    } catch (error) {
      res.status(500);
      res.send({ message: "Error al actualizar el reclamo"});
    }
  }

  async cancel(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400);
        res.send({ message: "Debe indicar un id" });
        return;
      }

      const reclamo = await this.reclamoService.getOneById(id);

      if (!reclamo) {
        res.status(404);
        res.send({ message: "Reclamo no encontrado" });
        return;
      }

      if (reclamo.estado !== "Creado") {
        res.status(400);
        res.send({ message: "Solamente se pueden cancelar reclamos con estado Creado" });
        return;
      }

      const updatedReclamo = await this.reclamoService.update(id);

      res.status(200);
      res.send({ message: "Reclamo cancelado correctamente", data: updatedReclamo });
    } catch (error) {
      res.status(500);
      res.send({ message: "Error al cancelar el reclamo"});
    }
  }
}