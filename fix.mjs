import fs from 'fs';

const filePath = 'supabase/functions/create-order/index.ts';
let content = fs.readFileSync(filePath, 'utf8');

// The exact strings we know are corrupted
content = content.replace('AHola', '¡Hola');
content = content.replace('dY"', '📦');
content = content.replace('dY" Enviar', '📲 Enviar');
content = content.replace('envA-alo', 'envíalo');
content = content.replace('AGracias', '¡Gracias');
content = content.replace('Compra Asnica', 'Compra Única');
content = content.replace('AReserva', '¡Reserva');

// Also some fallback in case the console output hid the  character
content = content.replace('AHola', '¡Hola');
content = content.replace('dY"', '📦');
content = content.replace('AGracias', '¡Gracias');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed file');
