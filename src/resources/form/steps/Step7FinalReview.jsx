'use client';
import React, { useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import PrintView from '../components/PrintView';
import EmergencyContactsForm from '../components/EmergencyContactsForm';

export default function Step7FinalReview() {
  const { formData, checkFormCompletion, updateItem, addItem, removeItem } = useFormContext();
  const [showPrintView, setShowPrintView] = useState(false);
  const [showEmergencyContactsEditor, setShowEmergencyContactsEditor] = useState(false);

  // Ensure all arrays are properly initialized
  const participantes = Array.isArray(formData.participantes) ? formData.participantes : [];
  const itinerario = Array.isArray(formData.itinerario) ? formData.itinerario : [];
  // Obtener riesgos de los supuestos del itinerario que están incluidos
  const riesgos = [];
  formData.itinerario.forEach((day) => {
    (day.supuestos || []).forEach((assumption) => {
      if ((assumption.accion === 'gestionar' || assumption.accion === 'monitoreo_intenso') && assumption.incluir === true && assumption.causas) {
        assumption.causas.forEach((causa) => {
          if (causa.riesgo && causa.peligro) {
            riesgos.push({
              supuesto: assumption.supuesto,
              riesgo: causa.riesgo,
              peligro: causa.peligro,
              lugar: causa.lugar || ''
            });
          }
        });
      }
    });
  });
  const equipo = Array.isArray(formData.equipo) ? formData.equipo : [];
  const transporte = Array.isArray(formData.transporte) ? formData.transporte : [];
  const cuerposRescate = Array.isArray(formData.cuerposRescate) ? formData.cuerposRescate : [];

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'No especificada';
    return new Date(dateTimeString).toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEquipmentSummary = () => {
    const categories = {};
    // Only show checked equipment
    const checkedEquipment = equipo.filter(item => item.checked);
    checkedEquipment.forEach(item => {
      if (item.categoria && item.item) {
        if (!categories[item.categoria]) {
          categories[item.categoria] = [];
        }
        categories[item.categoria].push(`${item.item} (${item.cantidad || 1})`);
      }
    });
    return categories;
  };

  const getTransportSummary = () => {
    return transporte.map(t => ({
      tipo: t.tipo,
      conductor: t.conductor,
      vehiculo: `${t.marca} ${t.modelo} ${t.color}`.trim(),
      patente: t.patente,
      distancia: t.distancia
    }));
  };

  const getMedicalSummary = () => {
    return participantes.filter(p => 
      p.grupoSanguineo || p.alergias || p.enfermedades || p.medicamentos || p.condicionesEspeciales
    );
  };

  const getValidationErrors = () => {
    const errors = [];
    
    // Basic Info validation
    if (!formData.basicInfo.contactoCAU) errors.push('Contacto CAU');
    if (!formData.basicInfo.telefonoContacto) errors.push('Teléfono de contacto');
    if (!formData.basicInfo.emailContacto) errors.push('Email de contacto');
    if (!formData.basicInfo.fechaHoraReporteRegreso) errors.push('Fecha de reporte de regreso');
    if (!formData.basicInfo.actividad) errors.push('Actividad');
    if (!formData.basicInfo.cerroOSector) errors.push('Cerro o sector');
    
    // InReach validation
    if (formData.basicInfo.llevaInreach) {
      if (!formData.basicInfo.numeroInreach) errors.push('Número de InReach');
      if (!formData.basicInfo.codigoInreach) errors.push('Código de InReach');
    }
    
    // Participants validation
    if (participantes.length === 0) {
      errors.push('Al menos un participante');
    } else {
      participantes.forEach((participant, index) => {
        if (!participant.nombre) errors.push(`Nombre del participante "${participant.nombre || `#${index + 1}`}"`);
        if (!participant.rut) errors.push(`RUT del participante "${participant.nombre || `#${index + 1}`}"`);
        if (!participant.telefono) errors.push(`Teléfono del participante "${participant.nombre || `#${index + 1}`}"`);
        if (!participant.contactoEmergencia) errors.push(`Contacto de emergencia del participante "${participant.nombre || `#${index + 1}`}"`);
        if (!participant.telefonoEmergencia) errors.push(`Teléfono de contacto de emergencia del participante "${participant.nombre || `#${index + 1}`}"`);
      });
    }
    
    // Itinerary validation
    if (itinerario.length === 0) {
      errors.push('Al menos un tramo de itinerario');
    } else {
      itinerario.forEach((day, dayIndex) => {
        if (!day.tramo) errors.push(`Tramo ${dayIndex + 1}`);
        if (!day.fecha) errors.push(`Fecha del tramo ${dayIndex + 1}`);
        if (!day.actividades || day.actividades.length === 0) errors.push(`Actividades del tramo ${dayIndex + 1}`);
        if (!day.horaInicio) errors.push(`Hora inicio del tramo ${dayIndex + 1}`);
        if (!day.horaFin) errors.push(`Hora fin del tramo ${dayIndex + 1}`);
        
        // Validar supuestos si existen - solo los que se incluyen en el aviso
        if (day.supuestos && day.supuestos.length > 0) {
          day.supuestos.forEach((supuesto, supuestoIndex) => {
            // Solo validar supuestos que se van a incluir en el aviso de salida
            if (supuesto.accion === 'gestionar' || 
                (supuesto.accion === 'monitoreo_intenso' && supuesto.incluir === true) ||
                (supuesto.accion === 'monitoreo_normal' && supuesto.incluir === true)) {
              
              // Validar que tenga causas (requerido para supuestos de gestión)
              if (!supuesto.causas || supuesto.causas.length === 0) {
                errors.push(`Tramo ${dayIndex + 1} - Supuesto ${supuestoIndex + 1}: Falta agregar causas/peligros`);
              } else {
                // Validar cada causa - solo campos obligatorios para el aviso
                supuesto.causas.forEach((causa, causaIndex) => {
                  if (!causa.lugar || !causa.lugar.trim()) {
                    errors.push(`Tramo ${dayIndex + 1} - Supuesto ${supuestoIndex + 1} - Causa ${causaIndex + 1}: Falta lugar o coordenadas`);
                  }
                  if (!causa.riesgos || causa.riesgos.length === 0 || causa.riesgos.every(r => !r.trim())) {
                    errors.push(`Tramo ${dayIndex + 1} - Supuesto ${supuestoIndex + 1} - Causa ${causaIndex + 1}: Faltan riesgos`);
                  }
                  if (!causa.peligros || causa.peligros.length === 0 || causa.peligros.every(p => !p.trim())) {
                    errors.push(`Tramo ${dayIndex + 1} - Supuesto ${supuestoIndex + 1} - Causa ${causaIndex + 1}: Faltan peligros`);
                  }
                });
              }
            }
          });
        }
      });
    }
    
    // Contar supuestos de gestión para el resumen
    const supuestosGestionar = [];
    itinerario.forEach((day, dayIndex) => {
      (day.supuestos || []).forEach((assumption, assumptionIndex) => {
        if (assumption.accion === 'gestionar' || 
            (assumption.accion === 'monitoreo_intenso' && assumption.incluir === true) ||
            (assumption.accion === 'monitoreo_normal' && assumption.incluir === true)) {
          supuestosGestionar.push(assumption);
        }
      });
    });
    
    // Equipment validation - solo si hay equipos agregados
    if (equipo.length > 0) {
      const validEquipo = equipo.filter(e => e.categoria && e.item && e.cantidad);
      if (validEquipo.length === 0) {
        errors.push('Todos los equipos agregados deben tener categoría, item y cantidad');
      } else {
        // Verificar campos específicos de cada equipo
        equipo.forEach((item, index) => {
          if (!item.categoria) errors.push(`Categoría del equipo "${item.item || `#${index + 1}`}"`);
          if (!item.item) errors.push(`Item del equipo en categoría "${item.categoria || `#${index + 1}`}"`);
          if (!item.cantidad) errors.push(`Cantidad del equipo "${item.item || item.categoria || `#${index + 1}`}"`);
        });
      }
    }
    
    // Transport validation - solo si hay transportes agregados
    if (transporte.length > 0) {
      const validTransporte = transporte.filter(t => t.tipo && t.conductor);
      if (validTransporte.length === 0) {
        errors.push('Todos los transportes agregados deben tener tipo y conductor');
      } else {
        // Verificar campos específicos de cada transporte
        transporte.forEach((item, index) => {
          if (!item.tipo) errors.push(`Tipo del transporte "${item.conductor || `#${index + 1}`}"`);
          if (!item.conductor) errors.push(`Conductor del transporte "${item.tipo || `#${index + 1}`}"`);
        });
      }
    }
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isFormComplete = validationErrors.length === 0;

  // Emergency contacts management functions
  const updateEmergencyContact = (index, field, value) => {
    updateItem('cuerposRescate', index, { [field]: value });
  };

  const addEmergencyContact = (newContact) => {
    addItem('cuerposRescate', newContact);
  };

  const removeEmergencyContact = (index) => {
    removeItem('cuerposRescate', index);
  };

  const toggleEmergencyContactInclude = (index, include) => {
    updateItem('cuerposRescate', index, { incluir: include });
  };

  // Get included emergency contacts
  const includedEmergencyContacts = cuerposRescate.filter(contact => contact.incluir);

  if (showPrintView) {
    return (
      <PrintView 
        formData={formData} 
        onClose={() => setShowPrintView(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Revisión Final y Generación del Aviso
        </h2>
        <p className="text-gray-600">
          Revise toda la información antes de generar el aviso de salida para imprimir
        </p>
      </div>



      {/* Data Summary */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Resumen de la Información
        </h3>

        {/* Basic Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-blue-900 mb-3">
            Información Básica
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div><strong>Contacto CAU:</strong> {formData.basicInfo.contactoCAU || 'No especificado'}</div>
            <div><strong>Actividad:</strong> {formData.basicInfo.actividad || 'No especificada'}</div>
            <div><strong>Cerro/Sector:</strong> {formData.basicInfo.cerroOSector || 'No especificado'}</div>
            <div><strong>Fecha de regreso:</strong> {formatDateTime(formData.basicInfo.fechaHoraReporteRegreso)}</div>
            <div><strong>Ruta:</strong> {formData.basicInfo.ruta || 'No especificada'}</div>
            <div><strong>Teléfono:</strong> {formData.basicInfo.telefonoContacto || 'No especificado'}</div>
            <div><strong>Email:</strong> {formData.basicInfo.emailContacto || 'No especificado'}</div>
            <div><strong>Imágenes del clima:</strong> {formData.basicInfo.weatherImages?.length || 0} imágenes
              {formData.basicInfo.weatherImages?.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  {formData.basicInfo.weatherImages.map((img, idx) => (
                    <div key={idx}>
                      {img.name} {img.fechaObtencion && `(${new Date(img.fechaObtencion + 'T00:00:00').toLocaleDateString('es-CL')})`}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {formData.basicInfo.llevaInreach && (
              <div><strong>InReach:</strong> Sí - Número: {formData.basicInfo.numeroInreach}, Código: {formData.basicInfo.codigoInreach}</div>
            )}
          </div>
        </div>

        {/* Participants */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="text-md font-semibold text-green-900 mb-3">
            Participantes ({participantes.length})
          </h4>
          <div className="space-y-2">
            {participantes.map((participant, index) => (
              <div key={index} className="text-sm">
                <strong>{participant.nombre}</strong> - {participant.rut}
                <div className="text-xs text-gray-600 ml-2">
                  Tel: {participant.telefono} | Emergencia: {participant.contactoEmergencia} ({participant.telefonoEmergencia})
                </div>
                {(participant.grupoSanguineo || participant.alergias || participant.enfermedades || participant.medicamentos || participant.condicionesEspeciales) && (
                  <div className="text-xs text-blue-600 ml-2">
                    {participant.grupoSanguineo && `Grupo: ${participant.grupoSanguineo} | `}
                    {participant.alergias && `Alergias: ${participant.alergias} | `}
                    {participant.enfermedades && `Condiciones: ${participant.enfermedades}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Itinerary */}
        {itinerario.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-yellow-900 mb-3">
              Itinerario ({itinerario.length} tramos)
            </h4>
            <div className="space-y-2">
              {itinerario.map((day, index) => (
                <div key={index} className="text-sm">
                  <strong>{day.tramo}</strong> - {(day.actividades || []).join(', ')}
                  {day.horaInicio && day.horaFin && ` (${day.horaInicio} - ${day.horaFin})`}
                  {day.altitudInicio && day.altitudFin && ` [${day.altitudInicio} - ${day.altitudFin} msnm]`}
                  {day.dificultadesPrincipales && day.dificultadesPrincipales.filter(d => d && d.trim()).length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      Dificultades: {day.dificultadesPrincipales.filter(d => d && d.trim()).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Management */}
        {riesgos.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-red-900 mb-3">
              Gestión de Riesgos ({riesgos.length} supuestos)
            </h4>
            <div className="space-y-2">
              {riesgos.map((risk, index) => (
                <div key={index} className="text-sm">
                  <strong>{risk.supuesto}</strong> - {risk.riesgo} ({risk.peligro})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Equipment */}
        {equipo.length > 0 && (
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-purple-900 mb-3">
              Equipo ({equipo.length} items)
            </h4>
            <div className="space-y-2">
              {Object.entries(getEquipmentSummary()).map(([category, items]) => (
                <div key={category} className="text-sm">
                  <strong>{category}:</strong> {items.join(', ')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transport */}
        {transporte.length > 0 && (
          <div className="bg-indigo-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-indigo-900 mb-3">
              Transporte ({transporte.length} vehículos)
            </h4>
            <div className="space-y-2">
              {getTransportSummary().map((transport, index) => (
                <div key={index} className="text-sm">
                  <strong>{transport.tipo}</strong> - {transport.conductor} - {transport.vehiculo}
                  {transport.patente && ` (${transport.patente})`}
                  {transport.distancia && ` - ${transport.distancia} km`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts Section */}
      <div className="space-y-6 mt-8">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            Cuerpos de Rescate Oficiales
          </h3>
          <button
            type="button"
            onClick={() => setShowEmergencyContactsEditor(!showEmergencyContactsEditor)}
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            {showEmergencyContactsEditor ? 'Ocultar Editor' : 'Editar Contactos'}
          </button>
        </div>

        {showEmergencyContactsEditor ? (
          <EmergencyContactsForm
            cuerposRescate={cuerposRescate}
            onUpdate={updateEmergencyContact}
            onAdd={addEmergencyContact}
            onRemove={removeEmergencyContact}
            onToggleInclude={toggleEmergencyContactInclude}
          />
        ) : (
          <div className="bg-red-50 rounded-lg p-4">
            <h4 className="text-md font-semibold text-red-900 mb-3">
              CUERPOS DE RESCATE OFICIALES ({includedEmergencyContacts.length} contactos)
            </h4>
            <div className="space-y-2">
              {includedEmergencyContacts.map((contact, index) => (
                <div key={index} className="text-sm">
                  <strong>{contact.nombre}:</strong> {contact.telefono}
                </div>
              ))}
              {includedEmergencyContacts.length === 0 && (
                <p className="text-red-600 italic">
                  No hay cuerpos de rescate seleccionados. Haga clic en "Editar Contactos" para configurar.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Validation Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-md font-semibold text-gray-900 mb-3">
          Estado de Validación
        </h4>
        <div className="space-y-2">
          {isFormComplete ? (
            <div className="text-green-600 font-medium">
              ✅ Todos los campos requeridos están completos
            </div>
          ) : (
            <div className="text-red-600 font-medium">
              ⚠️ Algunos campos requeridos están incompletos:
              <ul className="list-disc ml-5 mt-2 text-sm text-red-800">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Generate Print View Button */}
      <div className="text-center">
        <button
          onClick={() => setShowPrintView(true)}
          disabled={!isFormComplete}
          className="px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-green-700 flex items-center gap-2 justify-center mx-auto disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2V9a2 2 0 012-2h16a2 2 0 012 2v7a2 2 0 01-2 2h-2m-6 0v4m0 0h4m-4 0H8" /></svg>
          Ver aviso para imprimir
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-indigo-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-indigo-900 mb-3">
          ✅ Consejos para la revisión final:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-indigo-800">
          <div>
            <p className="font-medium mb-1">Antes de generar el documento:</p>
            <ul className="space-y-1 ml-2">
              <li>• Revise que toda la información esté correcta</li>
              <li>• Verifique que los participantes estén completos</li>
              <li>• Confirme que el equipo marcado es el que porta</li>
              <li>• Asegúrese de que los datos de contacto sean correctos</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Al generar el aviso para imprimir:</p>
            <ul className="space-y-1 ml-2">
              <li>• Se abrirá una nueva ventana optimizada para impresión</li>
              <li>• Solo aparecerá el equipo y supuestos marcados</li>
              <li>• Las imágenes del clima se incluyen automáticamente</li>
              <li>• Use Ctrl+P o Cmd+P para imprimir desde la nueva ventana</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Información incluida en el documento:</p>
            <ul className="space-y-1 ml-2">
              <li>• Datos básicos de la actividad y contacto CAU</li>
              <li>• Lista completa de participantes y datos médicos</li>
              <li>• Itinerario detallado (si fue completado)</li>
              <li>• Supuestos de riesgo seleccionados</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Recordatorio importante:</p>
            <ul className="space-y-1 ml-2">
              <li>• Complete el itinerario detallado de su expedición</li>
              <li>• Solo los supuestos marcados aparecen en el aviso</li>
              <li>• Identifique las dificultades principales de cada tramo</li>
              <li>• Configure los cuerpos de rescate relevantes para su región</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Cuerpos de rescate:</p>
            <ul className="space-y-1 ml-2">
              <li>• Edite los contactos según su región o país</li>
              <li>• Marque solo los cuerpos de rescate relevantes</li>
              <li>• Agregue contactos locales específicos si es necesario</li>
              <li>• Verifique que los números estén actualizados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Important Reminders */}
      <div className="mt-8 bg-orange-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-orange-900 mb-3">
          📋 Recordatorios importantes sobre el uso del aviso:
        </h4>
        <ul className="list-disc pl-5 text-orange-900 text-sm space-y-1">
          <li>El aviso debe ser entregado antes de la salida</li>
          <li>Mantenga una copia para el grupo</li>
          <li>Reporte su regreso en la fecha/hora indicada</li>
          <li>En caso de cambios, comunique al contacto CAU</li>
        </ul>
      </div>
    </div>
  );
} 