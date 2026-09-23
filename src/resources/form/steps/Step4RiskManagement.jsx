'use client';
import React, { useState } from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { riskManagementOptions } from '../../constants/riskManagementOptions';
import AutocompleteInput from '../components/AutocompleteInput';
import ConfirmationModal from '../components/ConfirmationModal';

export default function Step4RiskManagement() {
  const { formData, updateItem } = useFormContext();
  
  // Estado para el modal de confirmación
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  // Funciones para manejar el modal
  const showConfirmationModal = (title, message, onConfirm, type = 'danger') => {
    setModalState({
      isOpen: true,
      title,
      message,
      onConfirm,
      type
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
    });
  };

  const handleConfirm = () => {
    if (modalState.onConfirm) {
      modalState.onConfirm();
    }
    closeModal();
  };

  // Obtener supuestos a gestionar del itinerario
  const supuestosGestionar = [];
  formData.itinerario.forEach((day, dayIndex) => {
    (day.supuestos || []).forEach((assumption, assumptionIndex) => {
      // Incluir supuestos que tengan:
      // - accion === 'gestionar' (automático) 
      // - accion === 'monitoreo_intenso' Y incluir === true
      // - accion === 'monitoreo_normal' Y incluir === true
      if (assumption.accion === 'gestionar' || 
          (assumption.accion === 'monitoreo_intenso' && assumption.incluir === true) ||
          (assumption.accion === 'monitoreo_normal' && assumption.incluir === true)) {
        supuestosGestionar.push({
          key: `${dayIndex}-${assumptionIndex}`,
          tramo: day.tramo,
          supuesto: assumption.supuesto,
          indexItinerario: dayIndex,
          indexSupuesto: assumptionIndex,
          causas: assumption.causas || []
        });
      }
    });
  });

  // Asegurar que todos los supuestos tengan al menos una causa
  React.useEffect(() => {
    supuestosGestionar.forEach(sup => {
      ensureCausaExists(sup.key);
    });
  }, [supuestosGestionar.length]); // Solo cuando cambie el número de supuestos

  // Agregar causa/peligro a un supuesto (automático)
  const addCausa = (supKey) => {
    const [dayIndex, assumptionIndex] = supKey.split('-').map(Number);
    const updatedItinerario = [...formData.itinerario];
    const sup = updatedItinerario[dayIndex].supuestos[assumptionIndex];
    if (!sup.causas) sup.causas = [];
    sup.causas.push({
      lugar: '',
      accionProbabilidad: '',
      accionExposicion: '',
      accionConsecuencias: '',
      peligros: [],
      riesgos: []
    });
    updateItem('itinerario', dayIndex, updatedItinerario[dayIndex]);
  };

  // Agregar causa automáticamente si no existe
  const ensureCausaExists = (supKey) => {
    const [dayIndex, assumptionIndex] = supKey.split('-').map(Number);
    const sup = formData.itinerario[dayIndex].supuestos[assumptionIndex];
    if (!sup.causas || sup.causas.length === 0) {
      addCausa(supKey);
    }
  };

  // Actualizar causa/peligro
  const updateCausa = (supKey, causaIndex, field, value) => {
    try {
      const [dayIndex, assumptionIndex] = supKey.split('-').map(Number);
      
      // Validar que los índices sean válidos
      if (isNaN(dayIndex) || isNaN(assumptionIndex) || isNaN(causaIndex)) {
        console.error('Índices inválidos para actualizar causa:', supKey, causaIndex);
        return;
      }
      
      // Validar que el día existe
      if (!formData.itinerario[dayIndex]) {
        console.error('Día de itinerario no encontrado:', dayIndex);
        return;
      }
      
      // Validar que el supuesto existe
      if (!formData.itinerario[dayIndex].supuestos || 
          !formData.itinerario[dayIndex].supuestos[assumptionIndex]) {
        console.error('Supuesto no encontrado:', dayIndex, assumptionIndex);
        return;
      }
      
      const updatedItinerario = [...formData.itinerario];
      const sup = updatedItinerario[dayIndex].supuestos[assumptionIndex];
      if (!sup.causas) sup.causas = [];
      
      // Validar que la causa existe
      if (!sup.causas[causaIndex]) {
        console.error('Causa no encontrada:', dayIndex, assumptionIndex, causaIndex);
        return;
      }
      
      sup.causas[causaIndex][field] = value;
      updateItem('itinerario', dayIndex, updatedItinerario[dayIndex]);
    } catch (error) {
      console.error('Error al actualizar causa:', error);
    }
  };

  // Eliminar causa/peligro
  const removeCausa = (supKey, causaIndex) => {
    try {
      const [dayIndex, assumptionIndex] = supKey.split('-').map(Number);
      
      // Validar que los índices sean válidos
      if (isNaN(dayIndex) || isNaN(assumptionIndex) || isNaN(causaIndex)) {
        console.error('Índices inválidos para eliminar causa:', supKey, causaIndex);
        return;
      }
      
      // Validar que el día existe
      if (!formData.itinerario[dayIndex]) {
        console.error('Día de itinerario no encontrado:', dayIndex);
        return;
      }
      
      // Validar que el supuesto existe
      if (!formData.itinerario[dayIndex].supuestos || 
          !formData.itinerario[dayIndex].supuestos[assumptionIndex]) {
        console.error('Supuesto no encontrado:', dayIndex, assumptionIndex);
        return;
      }
      
      const updatedItinerario = [...formData.itinerario];
      const sup = updatedItinerario[dayIndex].supuestos[assumptionIndex];
      if (!sup.causas) sup.causas = [];
      
      // Validar que la causa existe
      if (!sup.causas[causaIndex]) {
        console.error('Causa no encontrada:', dayIndex, assumptionIndex, causaIndex);
        return;
      }
      
      sup.causas.splice(causaIndex, 1);
      updateItem('itinerario', dayIndex, updatedItinerario[dayIndex]);
    } catch (error) {
      console.error('Error al eliminar causa:', error);
    }
  };

  // Eliminar supuesto completo
  const removeSupuesto = (supKey) => {
    try {
      const [dayIndex, assumptionIndex] = supKey.split('-').map(Number);
      
      // Validar que los índices sean válidos
      if (isNaN(dayIndex) || isNaN(assumptionIndex)) {
        console.error('Índices inválidos para eliminar supuesto:', supKey);
        return;
      }
      
      // Validar que el día existe
      if (!formData.itinerario[dayIndex]) {
        console.error('Día de itinerario no encontrado:', dayIndex);
        return;
      }
      
      // Validar que el supuesto existe
      if (!formData.itinerario[dayIndex].supuestos || 
          !formData.itinerario[dayIndex].supuestos[assumptionIndex]) {
        console.error('Supuesto no encontrado:', dayIndex, assumptionIndex);
        return;
      }
      
      const updatedItinerario = [...formData.itinerario];
      updatedItinerario[dayIndex].supuestos.splice(assumptionIndex, 1);
      updateItem('itinerario', dayIndex, updatedItinerario[dayIndex]);
    } catch (error) {
      console.error('Error al eliminar supuesto:', error);
    }
  };

  // UI
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Supuestos</h2>
        <p className="text-gray-600">Para cada supuesto crítico, identifique y gestione los peligros que pueden surgir si no se cumple el supuesto.</p>
      </div>

      <div className="space-y-4">
        {supuestosGestionar.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-500 italic mb-2">
              No hay supuestos críticos para gestionar.
            </div>
            <div className="text-sm text-gray-400">
              Los supuestos aparecerán aquí solo si:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Su acción requerida es "Gestionar" (inclusión automática)</li>
                <li>Su acción es "Monitoreo Intenso" Y están marcados como "Incluir en aviso"</li>
                <li>Su acción es "Monitoreo Normal" Y están marcados como "Incluir en aviso"</li>
              </ul>
            </div>
          </div>
        )}
        {supuestosGestionar.map((sup, supIndex) => {
          return (
            <details key={sup.key} className="border border-blue-200 rounded-lg bg-blue-50 mb-4">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer">
              <div className="flex items-center space-x-3">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                  Tramo {sup.indexItinerario + 1}
                </span>
                <span className="font-semibold text-blue-900">{sup.tramo}</span>
                <span className="text-blue-700">-</span>
                <span className="text-blue-800">{sup.supuesto}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  showConfirmationModal(
                    'Eliminar Supuesto',
                    `¿Estás seguro de que quieres eliminar el supuesto "${sup.supuesto}" del tramo "${sup.tramo}"? Esta acción no se puede deshacer.`,
                    () => removeSupuesto(sup.key),
                    'danger'
                  );
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Eliminar supuesto
              </button>
            </summary>
            <div className="p-4 border-t border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-800">Supuesto {sup.indexSupuesto + 1}</h4>
              </div>
              <div className="space-y-4">
                {sup.causas.map((causa, causaIndex) => (
                  <div key={causaIndex} className="bg-blue-50 mb-2 p-4" data-causa-item={`${sup.key}-${causaIndex}`}>
                    <div className="space-y-4">
                      {/* 1. Ubicación */}
                      <div className="border-b border-gray-200 pb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Ubicación</h4>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                            Lugar o coordenadas (WGS 84) *
                            <span className="relative group">
                              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help">i</span>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                ¿Dónde específicamente puede ocurrir este riesgo?<br/>
                                <span className="text-gray-300">Ej: Coordenadas GPS, nombre del sector, punto específico del recorrido</span>
                              </span>
                            </span>
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            value={causa.lugar}
                            onChange={e => updateCausa(sup.key, causaIndex, 'lugar', e.target.value)}
                            placeholder="Ej: -33.4489, -70.6693 o 'Sector Laguna Negra'"
                          />
                        </div>
                      </div>

                      {/* 2. Prevención Primaria */}
                      <div className="border-b border-gray-200 pb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Prevención Primaria</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                              Probabilidad
                              <span className="relative group">
                                <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help">i</span>
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                  ¿Qué acciones aumentan la probabilidad de que el supuesto se cumpla?<br/>
                                  <span className="text-gray-300">Ej: Verificar condiciones climáticas, entrenar técnicas específicas, revisar equipamiento</span>
                                </span>
                              </span>
                            </label>
                            <textarea
                              value={causa.accionProbabilidad}
                              onChange={e => updateCausa(sup.key, causaIndex, 'accionProbabilidad', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="¿Qué acciones aumentan la probabilidad de que el supuesto se cumpla?"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                              Exposición
                              <span className="relative group">
                                <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help">i</span>
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                  ¿Cómo disminuyo el impacto si el supuesto no se cumple?<br/>
                                  <span className="text-gray-300">Ej: Usar equipos de seguridad, establecer puntos de retorno, tener planes alternativos</span>
                                </span>
                              </span>
                            </label>
                            <textarea
                              value={causa.accionExposicion}
                              onChange={e => updateCausa(sup.key, causaIndex, 'accionExposicion', e.target.value)}
                              rows={2}
                              className="w-full px-2 py-1 border border-gray-300 rounded"
                              placeholder="¿Cómo disminuyo el impacto si el supuesto no se cumple?"
                            />
                          </div>
                        </div>
                      </div>

                      {/* 3. Identificación del Problema */}
                      <div className="border-b border-gray-200 pb-3">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Identificación del Problema</h4>
                        
                        {/* Peligros */}
                        <div className="space-y-1 mb-4">
                          <label className="block text-sm font-medium text-gray-700">Peligros o causas subyacentes *</label>
                          <div className="space-y-2">
                            {(causa.peligros || []).map((peligro, peligroIndex) => (
                              <div key={peligroIndex} className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <AutocompleteInput
                                    value={peligro}
                                    onChange={(value) => {
                                      const updatedPeligros = [...(causa.peligros || [])];
                                      updatedPeligros[peligroIndex] = value;
                                      updateCausa(sup.key, causaIndex, 'peligros', updatedPeligros);
                                    }}
                                    options={riskManagementOptions.peligros}
                                    placeholder="Seleccione o escriba el peligro"
                                    required
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showConfirmationModal(
                                      'Eliminar Peligro',
                                      `¿Estás seguro de que quieres eliminar el peligro "${peligro}"?`,
                                      () => {
                                        const updatedPeligros = (causa.peligros || []).filter((_, index) => index !== peligroIndex);
                                        updateCausa(sup.key, causaIndex, 'peligros', updatedPeligros);
                                      },
                                      'warning'
                                    );
                                  }}
                                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0 mt-1"
                                >
                                  Eliminar
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPeligros = [...(causa.peligros || []), ''];
                                updateCausa(sup.key, causaIndex, 'peligros', updatedPeligros);
                              }}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              + Agregar Peligro
                            </button>
                            {(!causa.peligros || causa.peligros.length === 0) && (
                              <p className="text-sm text-gray-500 italic">
                                No se han agregado peligros. Haga clic en "Agregar Peligro" para comenzar.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Riesgos */}
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700">Riesgos asociados *</label>
                          <div className="space-y-2">
                            {(causa.riesgos || []).map((riesgo, riesgoIndex) => (
                              <div key={riesgoIndex} className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <AutocompleteInput
                                    value={riesgo}
                                    onChange={(value) => {
                                      const updatedRiesgos = [...(causa.riesgos || [])];
                                      updatedRiesgos[riesgoIndex] = value;
                                      updateCausa(sup.key, causaIndex, 'riesgos', updatedRiesgos);
                                    }}
                                    options={riskManagementOptions.riesgos}
                                    placeholder="Describa el riesgo"
                                    required
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    showConfirmationModal(
                                      'Eliminar Riesgo',
                                      `¿Estás seguro de que quieres eliminar el riesgo "${riesgo}"?`,
                                      () => {
                                        const updatedRiesgos = (causa.riesgos || []).filter((_, index) => index !== riesgoIndex);
                                        updateCausa(sup.key, causaIndex, 'riesgos', updatedRiesgos);
                                      },
                                      'warning'
                                    );
                                  }}
                                  className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex-shrink-0 mt-1"
                                >
                                  Eliminar
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedRiesgos = [...(causa.riesgos || []), ''];
                                updateCausa(sup.key, causaIndex, 'riesgos', updatedRiesgos);
                              }}
                              className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              + Agregar Riesgo
                            </button>
                            {(!causa.riesgos || causa.riesgos.length === 0) && (
                              <p className="text-sm text-gray-500 italic">
                                No se han agregado riesgos. Haga clic en "Agregar Riesgo" para comenzar.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* 4. Mitigación */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">Mitigación</h4>
                        <div>
                          <label className="flex items-center gap-1 text-sm font-medium text-gray-700">
                            Consecuencias
                            <span className="relative group">
                              <span className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs cursor-help">i</span>
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                ¿Qué hago para mitigar los efectos de los riesgos?<br/>
                                <span className="text-gray-300">Ej: Llevar equipos de rescate, establecer comunicación de emergencia, entrenar primeros auxilios</span>
                              </span>
                            </span>
                          </label>
                          <textarea
                            value={causa.accionConsecuencias}
                            onChange={e => updateCausa(sup.key, causaIndex, 'accionConsecuencias', e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded"
                            placeholder="¿Qué acciones mitigan las consecuencias si ocurre el riesgo?"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-xs text-gray-500 break-words">
                        {causa.riesgos && causa.riesgos.length > 0 ? 
                          `Riesgos: ${causa.riesgos.filter(r => r.trim()).join(', ')}` : 
                          'Sin riesgos definidos'
                        }
                      </span>
                    </div>
                  </div>
                ))}
                

              </div>
            </div>
          </details>
          );
        })}
      </div>

      {/* Instrucciones al final */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Instrucciones para la Gestión de Supuestos
          </h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            <strong>¿Qué es la Gestión de Supuestos?</strong> Es el proceso de identificar y controlar los peligros 
            que pueden surgir cuando los supuestos del itinerario no se cumplen, afectando la seguridad de la expedición.
          </p>
          <p>
            <strong>¿Qué supuestos aparecen aquí?</strong> Solo los supuestos del itinerario que están marcados como 
            "Gestionar" o "Monitoreo Intenso" y que están incluidos en el aviso de salida.
          </p>
          <p>
            <strong>¿Cómo gestionar cada supuesto crítico?</strong> Para cada supuesto que requiere gestión, debe completar:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Identificación del Peligro:</strong> ¿Qué puede salir mal si no se cumple el supuesto?</li>
            <li><strong>Evaluación del Supuesto:</strong> ¿Qué tan probable es que no se cumpla el supuesto?</li>
            <li><strong>Ubicación del Peligro:</strong> ¿En qué lugar específico puede ocurrir si no se cumple?</li>
            <li><strong>Acciones de Mitigación:</strong> ¿Qué medidas tomar para asegurar que se cumpla el supuesto?</li>
          </ul>
          <p>
            <strong>Tipos de Acciones:</strong>
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><strong>Prevención Primaria:</strong> Acciones para asegurar que se cumpla el supuesto</li>
            <li><strong>Control de Exposición:</strong> Medidas para reducir el impacto si no se cumple el supuesto</li>
            <li><strong>Mitigación de Consecuencias:</strong> Acciones para minimizar los daños si no se cumple el supuesto</li>
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            <strong>Recomendación:</strong> Cuanto más específicas y detalladas sean sus acciones de mitigación, 
            más efectiva será la gestión del supuesto y mayor será la seguridad de la expedición.
          </p>
        </div>
      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onConfirm={handleConfirm}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
} 