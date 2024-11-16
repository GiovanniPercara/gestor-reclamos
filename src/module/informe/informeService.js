import { fileURLToPath } from 'url';
import { dirname } from 'path';
import csvWriterModule from 'csv-writer';
const { createObjectCsvWriter } = csvWriterModule;

export default class InformeService {
  constructor(browserService, htmlCompilerService, pathService, fileSystemService) {
    this.browserService = browserService;
    this.htmlCompilerService = htmlCompilerService;
    this.pathService = pathService;
    this.fileSystemService = fileSystemService;
  }

  async generatePDF(data) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      const filePath = await this.pathService.join(__dirname, './template/informe.html');
      const htmlTemplate = await this.fileSystemService.promises.readFile(filePath, 'utf-8');

      const compiledTemplate = this.htmlCompilerService.compile(htmlTemplate);
      const renderedHtml = compiledTemplate(data);

      const browser = await this.browserService.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(renderedHtml, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10px', bottom: '10px' },
      });

      await browser.close();

      return pdfBuffer;
    } catch (error) {
      console.log("Error al generar el PDF: ", error);
    }
  }

  async generateCSV(data) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No hay datos disponibles para generar el CSV.");
      }
  
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
  
      // Define la ruta del archivo CSV temporal
      const filePath = await this.pathService.join(__dirname, './output/informe.csv');
  
      // Crear el csvWriter con encabezados personalizados
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'reclamo', title: 'RECLAMO' },
          { id: 'tipo', title: 'TIPO' },
          { id: 'estado', title: 'ESTADO' },
          { id: 'fechaDeCreado', title: 'FECHA DE CREADO' }
        ]
      });
  
      // Escribir los datos en el archivo CSV
      await csvWriter.writeRecords(data);
      console.log("CSV generado exitosamente en", filePath);
  
      // Leer el archivo generado como buffer
      const csvBuffer = await this.fileSystemService.promises.readFile(filePath);
  
      return csvBuffer;
    } catch (error) {
      console.log("Error al generar el CSV: ", error);
    }
  }  
}