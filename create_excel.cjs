const ExcelJS = require('exceljs');

async function createFudiClubSheet() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Fudi Club';
  workbook.lastModifiedBy = 'Fudi Club';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colores de la marca Fudi Club
  const colors = {
    lila: 'C79FEF',
    rosa: 'FFB7D5',
    turquesa: '4EBABA',
    verde: 'D1FF5E',
    amarillo: 'FFF4BD'
  };

  function applyHeaderStyle(worksheet, hexColor) {
    const row = worksheet.getRow(1);
    row.font = { bold: true, color: { argb: '000000' } };
    row.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: hexColor }
    };
    row.alignment = { vertical: 'middle', horizontal: 'center' };
    row.height = 25;
  }

  // 1. Proveedores
  const wsProveedores = workbook.addWorksheet('Proveedores');
  wsProveedores.columns = [
    { header: 'ID Proveedor', key: 'id', width: 15 },
    { header: 'Nombre Fantasía', key: 'nombre', width: 25 },
    { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Contacto (Nombre)', key: 'contacto', width: 20 },
    { header: 'Teléfono / WhatsApp', key: 'telefono', width: 20 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Días de Entrega', key: 'dias_entrega', width: 15 },
    { header: 'Pedido Mínimo', key: 'pedido_minimo', width: 20 },
    { header: 'Notas', key: 'notas', width: 35 }
  ];
  applyHeaderStyle(wsProveedores, colors.turquesa);

  // 2. Artículos y Cajas
  const wsArticulos = workbook.addWorksheet('Ediciones y Cajas');
  wsArticulos.columns = [
    { header: 'Edición (Mes/Año)', key: 'edicion', width: 20 },
    { header: 'Cupo Total', key: 'cupo', width: 15 },
    { header: 'Artículo 1', key: 'art1', width: 25 },
    { header: 'Artículo 2', key: 'art2', width: 25 },
    { header: 'Artículo 3', key: 'art3', width: 25 },
    { header: 'Artículo 4', key: 'art4', width: 25 },
    { header: 'Artículo 5', key: 'art5', width: 25 },
    { header: 'Artículo 6', key: 'art6', width: 25 },
    { header: 'Artículo 7', key: 'art7', width: 25 },
    { header: 'Artículo 8', key: 'art8', width: 25 },
    { header: 'Artículo 9', key: 'art9', width: 25 },
    { header: 'Artículo 10', key: 'art10', width: 25 },
    { header: 'Costo Total Estimado', key: 'costo', width: 20 }
  ];
  applyHeaderStyle(wsArticulos, colors.rosa);

  // 3. Clientes Backup
  const wsClientes = workbook.addWorksheet('Clientes (Backup)');
  wsClientes.columns = [
    { header: 'ID Cliente (Supabase)', key: 'id', width: 35 },
    { header: 'Nombre Completo', key: 'nombre', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'WhatsApp', key: 'whatsapp', width: 20 },
    { header: 'Zona / Dirección', key: 'direccion', width: 40 },
    { header: 'Alergias / Restricciones', key: 'alergias', width: 30 },
    { header: 'Fecha Registro', key: 'fecha', width: 20 }
  ];
  applyHeaderStyle(wsClientes, colors.lila);

  // 4. Pedidos Backup
  const wsPedidos = workbook.addWorksheet('Pedidos (Backup)');
  wsPedidos.columns = [
    { header: 'ID Pedido', key: 'id', width: 35 },
    { header: 'Fecha Compra', key: 'fecha', width: 20 },
    { header: 'Cliente', key: 'cliente', width: 25 },
    { header: 'Mes Asignado', key: 'mes', width: 15 },
    { header: 'Estado Pago', key: 'estado_pago', width: 15 },
    { header: 'Método Pago', key: 'metodo_pago', width: 15 },
    { header: 'Total Cobrado', key: 'total', width: 15 },
    { header: 'Estado Envío', key: 'estado_envio', width: 15 },
    { header: 'Tracking', key: 'tracking', width: 20 },
    { header: 'Dirección de Envío', key: 'direccion', width: 40 }
  ];
  applyHeaderStyle(wsPedidos, colors.verde);

  // 5. Configuración Stock
  const wsConfig = workbook.addWorksheet('Config');
  wsConfig.columns = [
    { header: 'Llave (Key)', key: 'key', width: 20 },
    { header: 'Valor', key: 'valor', width: 20 },
    { header: 'Descripción', key: 'desc', width: 40 }
  ];
  applyHeaderStyle(wsConfig, colors.amarillo);
  wsConfig.addRow({ key: 'CUPO_MES_ACTUAL', valor: 30, desc: 'Límite operativo máximo para la edición actual' });

  // Guardar archivo
  await workbook.xlsx.writeFile('Fudi_Club_Operaciones.xlsx');
  console.log('Archivo creado exitosamente: Fudi_Club_Operaciones.xlsx');
}

createFudiClubSheet().catch(console.error);
