// =============================================================================
// OPCIONES DE GESTIÓN DE RIESGOS - DATOS DE AUTORELLENADO
// =============================================================================
// Este archivo contiene las opciones de gestión de riesgos para autocompletar
// información en los formularios
// =============================================================================

export const riskManagementOptions = {
  // Dificultades principales
  dificultadesPrincipales: [
    'Terreno técnico',
    'Pendiente pronunciada',
    'Terreno expuesto',
    'Grietas en glaciar',
    'Distancia larga',
    'Carga pesada',
    'Falta de refugio',
    'Problemas de comunicación',
    'Avalancha',
    'Hipotermia',
    'Mal de altura',
    'Lesión de participante',
    'Condiciones climáticas adversas',
    'Falta de agua',
    'Problemas de navegación',
    'Retrasos en itinerario',
    'Problemas de equipamiento',
    'Problemas de salud',
    'Problemas de transporte',
    'Problemas de logística',
    'Aproximación al cerro',
    'Ascenso por sendero',
    'Descenso por ladera',
    'Travesía por cresta',
    'Cruce de río',
    'Ascenso por canaleta',
    'Descenso por canaleta',
    'Travesía por glaciar',
    'Cruce de quebrada',
    'Ascenso por arista',
    'Descenso por arista',
    'Travesía por valle',
    'Cruce de puente',
    'Ascenso por chimenea',
    'Descenso por chimenea',
    'Travesía por meseta',
    'Cruce de vado',
    'Ascenso por pared',
    'Descenso por pared',
    'Travesía por bosque'
  ],

  // Supuestos clave
  supuestos: [
    'Todos los participantes en buen estado de salud',
    'Terreno técnico dentro de las capacidades del grupo',
    'Terreno estable y seguro para el grupo',
    'Glaciar estable sin grietas peligrosas',
    'Itinerario realizable en el tiempo planificado',
    'Carga adecuada para las capacidades del grupo',
    'Disponibilidad de refugio o campamento adecuado',
    'Comunicación efectiva con base durante toda la actividad',
    'Ausencia de riesgo de avalancha en zona de paso',
    'Temperatura adecuada y equipamiento térmico disponible',
    'Aclimatación adecuada para la altura',
    'Equipamiento en buen estado',
    'Condiciones climáticas favorables',
    'Disponibilidad de fuentes de agua',
    'Navegación clara y sin complicaciones',
    'Cumplimiento del itinerario planificado',
    'Funcionamiento correcto de todo el equipamiento',
    'Salud óptima de todos los participantes',
    'Transporte disponible y funcional',
    'Logística organizada y eficiente'
  ],

  // Tipos de supuestos
  tipoSupuestos: [
    { value: 'grupo_humano', label: 'Grupo Humano' },
    { value: 'condiciones', label: 'Condiciones' },
    { value: 'itinerario', label: 'Itinerario' }
  ],

  // Probabilidades
  probabilidades: [
    { value: 'muy_improbable', label: 'Muy improbable' },
    { value: 'poco_probable', label: 'Poco probable' },
    { value: 'algo_probable', label: 'Algo probable' },
    { value: 'muy_probable', label: 'Muy probable' }
  ],

  // Impactos
  impactos: [
    { value: 'minimo', label: 'Mínimo' },
    { value: 'manejable', label: 'Manejable' },
    { value: 'significativo', label: 'Significativo' },
    { value: 'critico', label: 'Crítico' }
  ],

  // Peligros (fuentes del riesgo - lo que está presente)
  peligros: [
    'Terreno expuesto',
    'Pendiente pronunciada',
    'Terreno resbaladizo',
    'Rocas sueltas',
    'Grietas en glaciar',
    'Condiciones climáticas adversas',
    'Temperatura extrema',
    'Viento fuerte',
    'Tormenta',
    'Nieve',
    'Niebla',
    'Visibilidad reducida',
    'Altitud significativa',
    'Ascenso rápido',
    'Carga pesada',
    'Distancia larga',
    'Falta de refugio',
    'Falta de agua',
    'Equipamiento defectuoso',
    'Problemas de comunicación',
    'Retrasos en itinerario',
    'Problemas de navegación',
    'Pérdida de ruta',
    'Problemas de transporte',
    'Condiciones sanitarias deficientes',
    'Problemas de alimentación',
    'Lesiones preexistentes',
    'Enfermedades preexistentes',
    'Problemas de salud',
    'Avalancha',
    'Terreno irregular oculto'
  ],

  // Riesgos (consecuencias - lo que nos puede pasar)
  riesgos: [
    'Caída',
    'Resbalón',
    'Torcedura',
    'Lesión por impacto',
    'Caída en grieta',
    'Hipotermia',
    'Golpe de calor',
    'Deshidratación',
    'Mal de altura',
    'Sepultamiento',
    'Lesión por caída de rocas',
    'Lesión por tormenta',
    'Problemas por viento',
    'Problemas por lluvia',
    'Problemas por nieve',
    'Pérdida de orientación',
    'Retraso crítico',
    'Problemas de comunicación',
    'Falla crítica de equipamiento',
    'Accidente vehicular',
    'Problemas de salud agudos',
    'Enfermedad por exposición',
    'Agravamiento de lesión',
    'Problemas nutricionales',
    'Falta de agua potable',
    'Problemas sanitarios',
    'Lesión por esfuerzo',
    'Fatiga extrema',
    'Estrés térmico'
  ]
};

export default riskManagementOptions; 