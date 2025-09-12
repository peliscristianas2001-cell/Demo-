
import React from 'react';

export const guides = {
  trips: {
    title: 'Guía de la Sección de Viajes',
    description: 'Aprende a crear y gestionar los viajes de la agencia.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Crear Viaje:</strong> Usa el botón "Crear Viaje" para abrir el formulario y añadir un nuevo destino. Debes completar la información básica como destino, fecha y precio.</li>
          <li><strong>Editar Viaje:</strong> Haz clic en el menú de acciones (los tres puntos) de un viaje y selecciona "Editar" para modificar sus detalles.</li>
          <li><strong>Eliminar Viaje:</strong> Desde el mismo menú, puedes eliminar un viaje. Ten cuidado, esta acción es irreversible.</li>
          <li><strong>Observaciones Globales:</strong> Este texto se añade a todos los viajes. Es ideal para información que se repite, como políticas de equipaje o requisitos generales.</li>
          <li><strong>Política Global:</strong> Define la política de cancelación que se aplicará por defecto a todos los viajes nuevos.</li>
        </ul>
        <h3>Tabla de Viajes</h3>
        <p>La tabla muestra todos los viajes activos (aquellos cuya fecha aún no ha pasado). Puedes ver rápidamente:</p>
        <ul>
            <li>El destino y la fecha.</li>
            <li>El precio base.</li>
            <li>La capacidad total, cuántos asientos están ocupados y cuántos quedan disponibles.</li>
            <li>La cantidad de unidades de transporte (vehículos, aviones, etc.) asignadas.</li>
        </ul>
      </>
    ),
  },
  reservations: {
    title: 'Guía de la Sección de Reservas',
    description: 'Aquí puedes gestionar todas las reservas de los viajes activos.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Agregar Reserva:</strong> Dentro de cada viaje, usa el botón "Agregar Reserva" para crear una nueva venta. Primero, busca un pasajero existente o crea uno nuevo.</li>
          <li><strong>Gestionar Reserva:</strong> Haz clic en "Gestionar" en una reserva existente para abrir el editor detallado.</li>
        </ul>
        <h3>Editor de Reservas</h3>
        <p>Desde el diálogo de gestión, puedes:</p>
        <ul>
            <li><strong>Asignar Vendedor/a:</strong> Elige quién realizó la venta.</li>
            <li><strong>Gestionar Pagos:</strong> Define el precio final, la cantidad de cuotas y marca cuáles han sido pagadas y con qué método. El saldo se calcula automáticamente.</li>
            <li><strong>Servicios Adicionales:</strong> Asigna el tipo de pensión, habitación, y marca si los pasajeros tienen seguro médico o si son "liberados" (exentos de pago).</li>
            <li><strong>Asignación de Lugares:</strong> En la columna derecha, puedes asignar visualmente los asientos o camarotes a los pasajeros de la reserva. El sistema te impedirá sobre-asignar lugares.</li>
        </ul>
        <h3>Visualización</h3>
        <p>Cada reserva muestra un resumen rápido con el pasajero principal, el estado del pago, la asignación de lugares y los servicios contratados, como seguro y tipo de pensión.</p>
      </>
    ),
  },
  passengers: {
    title: 'Guía de la Sección de Pasajeros',
    description: 'Administra la base de datos de todos los pasajeros de la agencia.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Crear Pasajero:</strong> Usa el botón "Nuevo Pasajero" para añadir una persona al sistema. El DNI y el nombre son obligatorios.</li>
          <li><strong>Buscar Pasajeros:</strong> Utiliza la barra de búsqueda para encontrar pasajeros por nombre, DNI o grupo familiar.</li>
          <li><strong>Organización por Familia:</strong> El sistema agrupa automáticamente a los pasajeros por el campo "Familia". Puedes editar el nombre de la familia directamente en el título del grupo.</li>
          <li><strong>Añadir Integrante a Familia:</strong> Dentro de un grupo familiar, puedes usar el botón "Añadir Integrante" para crear un nuevo pasajero que pertenecerá automáticamente a esa familia.</li>
          <li><strong>Editar y Eliminar:</strong> En el menú de acciones de cada pasajero, puedes editar su información o eliminarlo permanentemente del sistema.</li>
        </ul>
      </>
    ),
  },
   employees: {
    title: 'Guía de la Sección de Empleados',
    description: 'Gestiona a los empleados y ex-empleados de la agencia.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Nuevo Empleado:</strong> Añade un nuevo empleado al sistema. Puedes definir su nombre, DNI, teléfono y un sueldo fijo si corresponde.</li>
          <li><strong>Link de Registro:</strong> Una vez creado un empleado, puedes copiar su "Link de Registro Único". Debes compartir este enlace con el empleado para que pueda crear su propia contraseña y acceder a su panel.</li>
          <li><strong>Archivar Empleado:</strong> Al "archivar", el empleado pasa a la lista de ex-empleados. Sus datos se conservan, pero ya no podrá iniciar sesión.</li>
          <li><strong>Recontratar:</strong> Desde el menú desplegable "Recontratar", puedes seleccionar un ex-empleado para volver a activarlo en el sistema. Se abrirá el formulario para que confirmes sus datos y puedas compartir un nuevo link de registro si es necesario.</li>
        </ul>
      </>
    ),
  },
  sellers: {
    title: 'Guía de la Sección de Vendedores',
    description: 'Administra a los vendedores externos y sus esquemas de comisiones.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Nuevo Vendedor:</strong> Añade un nuevo vendedor al sistema.</li>
          <li><strong>Tipo de Comisión:</strong> Para cada vendedor, puedes elegir entre dos tipos de comisión:
            <ul>
                <li><strong>Por Rangos:</strong> La comisión se calcula según las reglas definidas en "Configurar Comisiones".</li>
                <li><strong>Fija:</strong> Se le aplica un porcentaje de comisión fijo a todas sus ventas, ignorando los rangos globales.</li>
            </ul>
          </li>
          <li><strong>Configurar Comisiones:</strong> Este diálogo te permite definir un esquema de comisiones basado en la cantidad de pasajes vendidos en una reserva. Por ejemplo, "de 1 a 4 pasajes, un 5%; de 5 en adelante, un 10%".</li>
        </ul>
      </>
    ),
  },
  flyers: {
    title: 'Guía de la Sección de Flyers',
    description: 'Sube y gestiona el material promocional para cada viaje.',
    content: (
       <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Subir Nuevo Flyer:</strong> Haz clic en este botón para abrir el formulario de subida.</li>
          <li><strong>Asignación a Viaje:</strong> En el formulario, primero debes seleccionar a qué viaje activo pertenece el flyer que vas a subir.</li>
          <li><strong>Archivos Soportados:</strong> Puedes subir tanto imágenes (JPG, PNG, etc.) como videos cortos (MP4). El sistema detectará el tipo de archivo automáticamente.</li>
          <li><strong>Gestión de Flyers:</strong> Los flyers se agrupan por viaje. Puedes ver todos los materiales promocionales de un destino en un solo lugar.</li>
          <li><strong>Eliminar Flyer:</strong> Simplemente pasa el mouse sobre un flyer y haz clic en el ícono de la papelera para eliminarlo.</li>
        </ul>
      </>
    ),
  },
  tickets: {
    title: 'Guía de la Sección de Tickets',
    description: 'Visualiza y descarga los pases de abordo para los pasajeros.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Generación Automática:</strong> Los tickets se generan automáticamente para cada pasajero con una reserva en estado "Confirmado".</li>
          <li><strong>Filtrar por Viaje:</strong> Usa el menú desplegable para ver los tickets de un viaje específico o de todos los viajes activos.</li>
          <li><strong>Visualizar Ticket:</strong> Expande la sección de un pasajero para ver una vista previa de su ticket, incluyendo el código QR.</li>
          <li><strong>Descargar PDF:</strong> Haz clic en "Descargar PDF" para generar un archivo PDF del ticket, listo para imprimir o enviar al pasajero.</li>
        </ul>
        <p><strong>Nota Importante:</strong> Si el logo de la empresa no ha sido cargado en la sección de Configuración, la descarga del PDF podría fallar. Asegúrate de que el logo esté configurado.</p>
      </>
    ),
  },
  calendar: {
    title: 'Guía de la Sección de Calendario',
    description: 'Usa el calendario para anotaciones, recordatorios y organización visual.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Crear Anotación (Burbuja):</strong>
            <ul>
                <li><strong>Arrastrando:</strong> Haz clic en un día y, sin soltar, arrastra el mouse hasta otro día para crear una burbuja que abarque ese período.</li>
                <li><strong>Selección Múltiple:</strong> Activa el modo "Selección Múltiple", haz clic en los días que desees (no necesitan ser consecutivos) y luego presiona "Crear Burbuja".</li>
            </ul>
          </li>
          <li><strong>Editar Texto:</strong> Haz clic dentro de una burbuja para escribir o editar su contenido.</li>
          <li><strong>Cambiar Color:</strong> Pasa el mouse sobre una burbuja, haz clic en el círculo de color y elige uno nuevo.</li>
          <li><strong>Expandir:</strong> Usa el ícono de expandir para hacer una burbuja más alta y tener más espacio para escribir.</li>
          <li><strong>Eliminar:</strong> Usa el ícono de la papelera para borrar una burbuja.</li>
          <li><strong>Imprimir:</strong> Genera una versión imprimible del calendario del mes actual.</li>
          <li><strong>Historial:</strong> Guarda y recupera versiones pasadas de tus calendarios.</li>
        </ul>
      </>
    ),
  },
  reports: {
    title: 'Guía de la Sección de Reportes',
    description: 'Analiza las finanzas de tus viajes y los ingresos y gastos mensuales.',
    content: (
      <>
        <h3>Funciones Principales</h3>
        <ul>
          <li><strong>Reporte Mensual (Tarjetas Superiores):</strong>
            <ul>
                <li><strong>Gastos Mensuales:</strong> Suma de todos los costos fijos de viajes del mes, comisiones pagadas y gastos varios. Haz clic para ver el desglose.</li>
                <li><strong>Ingresos por Comisión:</strong> Ganancias por comisiones de servicios de terceros. Haz clic para añadir o eliminar.</li>
                <li><strong>Ingresos por Excursión:</strong> Ganancias por excursiones adicionales vendidas. Haz clic para añadir o eliminar.</li>
                <li><strong>Ingresos Mensuales (Neto):</strong> El resultado final de todos los ingresos menos todos los gastos del mes. Haz clic para ver el resumen.</li>
            </ul>
          </li>
          <li><strong>Reporte por Viaje:</strong>
            <p>Cada tarjeta representa un viaje activo y muestra un resumen financiero:</p>
            <ul>
                <li><strong>Ingresos Totales:</strong> Suma de todas las reservas confirmadas para ese viaje.</li>
                <li><strong>Comisiones Pagadas:</strong> Total de comisiones a pagar a vendedores por ese viaje. Haz clic para ver el detalle por vendedor.</li>
                <li><strong>Gastos Fijos:</strong> Suma de costos de transporte, hotel y extras definidos en la configuración del viaje.</li>
                <li><strong>Ganancia Neta:</strong> El resultado final del viaje (Ingresos - Comisiones - Gastos Fijos).</li>
            </ul>
          </li>
          <li><strong>Historial de Reportes:</strong> Los reportes de viajes cuya fecha ya ha pasado se archivan automáticamente aquí para consulta futura.</li>
        </ul>
      </>
    ),
  },
  settings: {
    title: 'Guía de la Sección de Configuración',
    description: 'Personaliza todos los aspectos fundamentales de la aplicación.',
    content: (
      <>
        <h3>Áreas de Configuración</h3>
        <ul>
          <li><strong>Configuración General:</strong> Sube el logo de la empresa y define el número de WhatsApp principal.</li>
          <li><strong>Seguridad de la Cuenta:</strong> Vincula tu cuenta de administrador con un email o una cuenta de Google para un inicio de sesión más seguro y la posibilidad de recuperar la contraseña.</li>
          <li><strong>Datos de Contacto:</strong> La información que ingreses aquí se mostrará en la página pública de "Contacto".</li>
          <li><strong>Puntos de Embarque:</strong> Crea la lista de paradas que se podrán seleccionar al crear pasajeros o reservas.</li>
          <li><strong>Tipos de Pensión y Habitación:</strong> Define los servicios de alojamiento que se pueden asignar a las reservas.</li>
          <li><strong>Zona Geográfica:</strong> Dibuja en el mapa el área de servicio de tu agencia. Los clientes fuera de esta zona verán un aviso especial.</li>
          <li><strong>Tipos de Transporte:</strong> Crea y diseña los layouts (distribución de asientos/camarotes) para tus vehículos, aviones o cruceros. Estos layouts se usarán para la asignación de lugares en las reservas.</li>
        </ul>
      </>
    ),
  },
};
