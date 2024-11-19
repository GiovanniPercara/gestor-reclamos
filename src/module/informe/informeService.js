import { fileURLToPath } from 'url';
import { dirname } from 'path';
import csvWriterModule from 'csv-writer';
import { time } from 'console';
import { title } from 'process';
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
      let htmlTemplate = await this.fileSystemService.promises.readFile(filePath, 'utf-8');
      
      console.log("Datos a pasar al PDF:", data);

      htmlTemplate = htmlTemplate.replace(/{{(\w+)(?:\.(\w+))?}}/g, (_, key, subKey) => {
        const value = subKey ? data[key]?.[subKey] : data[key]; // Soporta claves anidadas (por ejemplo, 'user.name')
        if (value !== undefined) {
          return `<span class="value">${value}</span>`; // Coloca el valor en el HTML
        } else {
          console.warn(`Clave no encontrada: ${key}`); // Mostrar en consola si no se encuentra la clave
          return '<span class="value">-</span>'; // Mostrar un valor por defecto si no se encuentra la clave
        }
      });
      
      
      
      console.log("HTML con datos dinámicos:", htmlTemplate); // Verificar el HTML final
  
      const browser = await this.browserService.launch({ headless: true });
      const page = await browser.newPage();
  
      await page.setContent(htmlTemplate, { waitUntil: 'load' });
  
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10px', bottom: '10px' },
      });
  
      await browser.close();
  
      return pdfBuffer;
    } catch (error) {
      console.error("Error al generar el PDF:", error);
      throw error;
    }
  }
  

  async generateCSV(data) {
    try {
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("No hay datos disponibles para generar el CSV.");
      }

      // Agregar la fecha de creación a cada reclamo
      const dataWithDate = data.map(reclamo => ({
        ...reclamo, // Copia todas las propiedades actuales del objeto
        fechaDeCreado: new Date().toISOString() // Asigna la fecha actual
      }));

      console.log("Datos para CSV:", dataWithDate); 

      // Verifica los datos antes de pasarlos al CSV
      console.log("Datos recibidos para CSV:", data); // Verificar la estructura de data

      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);

      // Define la ruta del archivo CSV temporal
      const filePath = await this.pathService.join(__dirname, './output/informe.csv');

      // Crear el csvWriter con las claves correctas
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'idReclamo', title: 'ID RECLAMO' },
          { id: 'TipoReclamo', title: 'TIPO' },
          { id: 'Estado', title: 'ESTADO' },
          { id: 'fechaDeCreado',title: 'FECHA DE CREADO'}
        ]
      });

      // Escribir los datos en el archivo CSV
      await csvWriter.writeRecords(dataWithDate);

      console.log("CSV generado exitosamente en", filePath);

      // Leer el archivo generado como buffer
      const csvBuffer = await this.fileSystemService.promises.readFile(filePath);

      return csvBuffer;
    } catch (error) {
      console.log("Error al generar el CSV: ", error);
    }
  }
}