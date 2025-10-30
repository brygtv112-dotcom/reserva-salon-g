// ** CONFIGURACIÓN DE EMAILJS (FINAL) **
const PUBLIC_KEY = 'ned9EKMTU9yZDJHke'; // Clave pública
const SERVICE_ID = 'service_qmmnf6v'; // 🚨 ¡VERIFICA QUE ESTE SEA TU SERVICE ID REAL!
const TEMPLATE_ID = 'template_s1ec70a'; // Tu ID de Plantilla

const MSG_RESERVADA = "❌ Lo sentimos, esa hora ya está reservada. Elige otra.";
const MSG_OK = "✅ ¡Cita reservada exitosamente! Revisa tu correo electrónico para la confirmación.";
const MSG_FALTAN = "⚠️ Por favor, completa todos los campos.";

// 1. INICIALIZACIÓN DE EMAILJS (¡CORRECTO!)
emailjs.init(PUBLIC_KEY); 

// ====== CONFIGURACIÓN DE BLOQUEOS ======
const horasBloqueadasRecurrentes = ["09:00", "13:30", "16:00"];
const bloquesEspecificos = ["2025-09-25T10:00", "2025-09-25T15:00"];

// ====== REFERENCIAS A ELEMENTOS HTML ======
const $form = document.getElementById('formulario-cita');
const $nombre = document.getElementById('nombre');
const $email = document.getElementById('email');
const $servicio = document.getElementById('servicio'); // ⬅️ NUEVA REFERENCIA
const $fecha = document.getElementById('fecha');
const $hora = document.getElementById('hora');
const $msg = document.getElementById('mensaje-confirmacion');
const $button = $form.querySelector('button[type="submit"]');

const hoyISO = new Date().toISOString().slice(0,10);
$fecha.min = hoyISO;

// ====== FUNCIONES DE APOYO ======
function pad(n){ return String(n).padStart(2, "0"); }
function toLocalISO(date){
  const y = date.getFullYear();
  const m = pad(date.getMonth()+1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

function esHoraBloqueadaRecurrente(hhmm){
  return horasBloqueadasRecurrentes.includes(hhmm);
}
function esBloqueEspecifico(isoLocal){
  return bloquesEspecificos.includes(isoLocal);
}

function estaReservada(fechaStr, horaStr){
  if(!fechaStr || !horaStr) return false;
  if (esHoraBloqueadaRecurrente(horaStr)) return true;
  const d = new Date(`${fechaStr}T${horaStr}`);
  const isoLocal = toLocalISO(d);
  return esBloqueEspecifico(isoLocal);
}

function mostrarConfirmacion(texto, ok=false){
  $msg.textContent = texto;
  $msg.style.display = 'block';
  $msg.style.padding = '15px';
  $msg.style.marginTop = '20px';
  $msg.style.borderRadius = '8px';
  $msg.style.fontWeight = '600';
  $msg.style.textAlign = 'center';
  $msg.style.backgroundColor = ok ? '#e6ffed' : '#ffe6e6'; 
  $msg.style.color = ok ? '#008744' : '#d11a2a';
  
  setTimeout(() => {
    $msg.style.display = 'none';
  }, 7000);
}

// ====== FUNCIÓN PRINCIPAL ======
$form.addEventListener('submit', function(e){
  e.preventDefault();
  const nombre = $nombre.value.trim();
  const email = $email.value.trim();
  const servicio = $servicio.value; // ⬅️ EXTRAEMOS EL VALOR
  const fecha = $fecha.value;
  const hora = $hora.value;

  // Validación de campos y horarios
  // ⬇️ AÑADIMOS 'servicio' a la validación de campos vacíos ⬇️
  if(!nombre || !email || !servicio || !fecha || !hora){ 
    mostrarConfirmacion(MSG_FALTAN, false);
    return;
  }
  if(estaReservada(fecha, hora)){
    mostrarConfirmacion(MSG_RESERVADA, false);
    return;
  }

  // Comienza el envío de EmailJS
  $button.textContent = 'Enviando...';
  
  // 2. ENVÍO DE CORREO usando sendForm
  // El método 'sendForm' toma el nuevo campo name="servicio" automáticamente.
  emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this) 
  .then(() => {
      $button.textContent = 'Reservar'; 
      mostrarConfirmacion(MSG_OK, true);
      $form.reset();
  })
  .catch(err => {
      console.error('Error al enviar correo (EmailJS):', err);
      $button.textContent = 'Reservar'; 
      mostrarConfirmacion('⚠️ Cita guardada. **ADVERTENCIA:** Falló el envío de confirmación. Revisa la consola (F12).', false);
      $form.reset(); 
  });
});
