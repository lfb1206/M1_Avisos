const docFields = [
  // Campos básicos de información
  { 
    name: 'contactoCAU', 
    label: 'Contacto CAU', 
    placeholder: 'Seleccione o escriba el nombre del contacto CAU', 
    type: 'text',
    required: true
  },
  { 
    name: 'telefonoContacto', 
    label: 'Teléfono de contacto', 
    placeholder: '+569xxxxxxxx', 
    type: 'tel',
    required: true
  },
  { 
    name: 'emailContacto', 
    label: 'Email de contacto', 
    placeholder: 'correo@gmail.com', 
    type: 'email',
    required: true
  },
  { 
    name: 'fechaHoraReporteRegreso', 
    label: 'Fecha y hora de reporte de regreso', 
    placeholder: 'DD/MM/YYYY HH:mm (hoy o posterior)', 
    type: 'datetime-local',
    required: true
  },
  { 
    name: 'actividad', 
    label: 'Actividad', 
    placeholder: 'Seleccione o escriba el tipo de actividad', 
    type: 'text',
    required: true
  },
  { 
    name: 'cerroOSector', 
    label: 'Cerro o Sector', 
    placeholder: 'Seleccione o escriba el cerro o sector', 
    type: 'text',
    required: true
  },
  { 
    name: 'ruta', 
    label: 'Ruta', 
    placeholder: 'Ej: Cara norte, Ruta normal', 
    type: 'text',
    required: false
  },
  { 
    name: 'linkPronostico', 
    label: 'Link al pronóstico del tiempo', 
    placeholder: 'https://weather.com', 
    type: 'url',
    required: false
  },
  { 
    name: 'linkRuta', 
    label: 'Link a la ruta', 
    placeholder: 'https://link-a-la-ruta.cl', 
    type: 'url',
    required: false
  },
  
  // Campos de InReach
  { 
    name: 'llevaInreach', 
    label: '¿Lleva dispositivo InReach?', 
    placeholder: '', 
    type: 'checkbox',
    required: false
  },
  { 
    name: 'numeroInreach', 
    label: 'Número de InReach', 
    placeholder: 'Ej: 1234567890', 
    type: 'text',
    required: false
  },
  { 
    name: 'codigoInreach', 
    label: 'Código InReach', 
    placeholder: 'Ej: ABC123', 
    type: 'text',
    required: false
  },
  
  // Campos de participantes
  { 
    name: 'participantes', 
    label: 'Participantes', 
    placeholder: 'Participantes', 
    type: 'dynamic-list', 
    fields: [
      { name: 'nombre', label: 'Nombre', placeholder: 'Nombre completo del participante', type: 'text', required: true },
      { name: 'rut', label: 'RUT', placeholder: 'RUT del participante', type: 'text', required: true },
      { name: 'telefono', label: 'Teléfono', placeholder: '+569xxxxxxxx', type: 'tel', required: true },
      { name: 'contactoEmergencia', label: 'Contacto de Emergencia', placeholder: 'Nombre del contacto de emergencia', type: 'text', required: true },
      { name: 'telefonoEmergencia', label: 'Teléfono de Contacto de Emergencia', placeholder: '+569xxxxxxxx', type: 'tel', required: true },
      { name: 'grupoSanguineo', label: 'Grupo sanguíneo', placeholder: 'Seleccione grupo sanguíneo', type: 'select', required: false },
      { name: 'alergias', label: 'Alergias', placeholder: 'Seleccione o escriba las alergias', type: 'text', required: false },
      { name: 'enfermedades', label: 'Enfermedades o condiciones', placeholder: 'Seleccione o escriba las condiciones', type: 'text', required: false },
      { name: 'medicamentos', label: 'Medicamentos que toma', placeholder: 'Seleccione o escriba los medicamentos', type: 'text', required: false },
      { name: 'condicionesEspeciales', label: 'Condiciones especiales', placeholder: 'Seleccione o escriba las condiciones especiales', type: 'text', required: false }
    ]
  },
  
  // Campos de itinerario
  { 
    name: 'itinerario', 
    label: 'Itinerario', 
    placeholder: 'Itinerario', 
    type: 'dynamic-list', 
    fields: [
      { name: 'tramo', label: 'Tramo', placeholder: 'Seleccione o escriba el tramo', type: 'text', required: true },
      { name: 'fecha', label: 'Fecha', placeholder: 'DD/MM/YYYY', type: 'date', required: true },
      { name: 'actividad', label: 'Actividad', placeholder: 'Ej: Ascenso al campamento', type: 'text', required: true },
      { name: 'horaInicio', label: 'Hora Inicio', placeholder: 'HH:mm', type: 'time', required: false },
      { name: 'horaFin', label: 'Hora Fin', placeholder: 'HH:mm', type: 'time', required: false },
      { name: 'altitudInicio', label: 'Altitud Inicio (msnm)', placeholder: '0', type: 'number', required: false },
      { name: 'altitudFin', label: 'Altitud Fin (msnm)', placeholder: '0', type: 'number', required: false }
    ]
  },
  
  // Campos de gestión de riesgos
  { 
    name: 'gestionRiesgos', 
    label: 'Gestión de Riesgos', 
    placeholder: 'Gestión de Riesgos', 
    type: 'dynamic-list', 
    fields: [
      { name: 'supuesto', label: 'Supuesto clave', placeholder: 'Seleccione o escriba el supuesto clave', type: 'text', required: true },
      { name: 'tipoSupuesto', label: 'Tipo de supuesto', placeholder: 'Seleccionar tipo', type: 'select', required: false },
      { name: 'probabilidad', label: 'Probabilidad', placeholder: 'Seleccionar probabilidad', type: 'select', required: true },
      { name: 'impacto', label: 'Impacto', placeholder: 'Seleccionar impacto', type: 'select', required: true },
      { name: 'incluir', label: 'Incluir en aviso', placeholder: '', type: 'checkbox', required: false }
    ]
  },
  
  // Campos de equipo
  { 
    name: 'equipo', 
    label: 'Equipo Portado', 
    placeholder: 'Equipo que se porta en la actividad', 
    type: 'dynamic-list', 
    fields: [
      { name: 'categoria', label: 'Categoría', placeholder: 'Seleccione o escriba la categoría', type: 'text', required: true },
      { name: 'item', label: 'Item', placeholder: 'Seleccione o escriba el item', type: 'text', required: true },
      { name: 'cantidad', label: 'Cantidad', placeholder: '1', type: 'number', required: true },
      { name: 'observaciones', label: 'Observaciones', placeholder: 'Observaciones adicionales', type: 'textarea', required: false },
      { name: 'checked', label: 'Se está portando', placeholder: '', type: 'checkbox', required: false }
    ]
  },
  
  // Campos de transporte
  { 
    name: 'transporte', 
    label: 'Transporte Utilizado', 
    placeholder: 'Transporte utilizado para llegar al lugar', 
    type: 'dynamic-list', 
    fields: [
      { name: 'tipo', label: 'Tipo de Transporte', placeholder: 'Seleccione o escriba el tipo de transporte', type: 'text', required: true },
      { name: 'conductor', label: 'Conductor', placeholder: 'Seleccione o escriba el conductor', type: 'text', required: false },
      { name: 'marca', label: 'Marca', placeholder: 'Seleccione o escriba la marca', type: 'text', required: false },
      { name: 'modelo', label: 'Modelo', placeholder: 'Modelo del vehículo', type: 'text', required: false },
      { name: 'color', label: 'Color', placeholder: 'Color del vehículo', type: 'text', required: false },
      { name: 'patente', label: 'Patente', placeholder: 'Patente del vehículo', type: 'text', required: false },
      { name: 'distancia', label: 'Distancia (km)', placeholder: 'Distancia total ida y vuelta', type: 'number', required: false }
    ]
  }
];

export default docFields;
    