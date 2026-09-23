'use client';
import React from 'react';
import { useFormContext } from '../../contexts/FormContext';
import { basicFormOptions } from '../../constants/basicFormOptions';
import { riskManagementOptions } from '../../constants/riskManagementOptions';
import AutocompleteInput from './AutocompleteInput';

export default function ItineraryDayForm({ 
  day, 
  dayIndex, 
  onUpdate, 
  onRemove,
  onAddAssumption, 
  onRemoveAssumption, 
  onUpdateAssumption,
  onAddDifficulty,
  onRemoveDifficulty,
  onUpdateDifficulty,
  onAddSuggestedAssumptions,
  getActionColor,
  getActionLabel,
  fechaReporteRegreso
}) {
  return (
    <details
      className="border border-gray-200 rounded-lg p-0 transition-colors bg-gray-50"
    >
      <summary className="flex items-center gap-2 cursor-pointer px-4 md:px-6 py-3 text-gray-900 font-semibold">
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
              Tramo {dayIndex + 1}
            </span>
            <span className="truncate">{day.tramo || 'Sin tramo'}</span>
            <span className="hidden sm:inline mx-2">-</span>
            <span className="truncate">
              {day.fecha ? 
                (() => {
                  const date = new Date(day.fecha + 'T00:00:00');
                  return date.toLocaleDateString('es-CL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/-/g, '/');
                })()
                : 'Sin fecha'
              }
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(dayIndex);
            }}
            className="text-red-600 text-xs font-semibold hover:underline hover:font-bold"
          >
            <span className="hidden sm:inline">Eliminar tramo</span>
            <span className="sm:hidden">Eliminar</span>
          </button>
        </div>
      </summary>
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <AutocompleteInput
            label="Tramo"
            value={day.tramo || ''}
            onChange={(value) => onUpdate(dayIndex, 'tramo', value)}
            placeholder="Escriba el nombre del tramo"
            required
          />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Fecha *</label>
            <input
              type="date"
              value={day.fecha || ''}
              onChange={(e) => onUpdate(dayIndex, 'fecha', e.target.value)}
              min={new Date().toLocaleDateString('sv-SE')}
              max={fechaReporteRegreso ? new Date(fechaReporteRegreso).toLocaleDateString('sv-SE') : undefined}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            {day.fecha && (
              <>
                {new Date(day.fecha) < new Date(new Date().toLocaleDateString('sv-SE')) && (
                  <p className="text-red-500 text-xs mt-1">
                    La fecha del tramo debe ser hoy o posterior
                  </p>
                )}
                {fechaReporteRegreso && new Date(day.fecha) > new Date(fechaReporteRegreso) && (
                  <p className="text-red-500 text-xs mt-1">
                    La fecha del tramo no puede ser posterior a la fecha de reporte de regreso
                  </p>
                )}
              </>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Actividades *</label>
            <div className="space-y-2">
              {(day.actividades || []).map((actividad, actividadIndex) => (
                <div key={actividadIndex} className="flex items-center gap-2">
                  <div className="flex-1">
                    <AutocompleteInput
                      value={actividad}
                      onChange={(value) => {
                        const updatedActividades = [...(day.actividades || [])];
                        updatedActividades[actividadIndex] = value;
                        onUpdate(dayIndex, 'actividades', updatedActividades);
                      }}
                      options={basicFormOptions.actividadesEspecificas}
                      placeholder="Ej: Ascenso al campamento"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedActividades = (day.actividades || []).filter((_, index) => index !== actividadIndex);
                      onUpdate(dayIndex, 'actividades', updatedActividades);
                    }}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const updatedActividades = [...(day.actividades || []), ''];
                  onUpdate(dayIndex, 'actividades', updatedActividades);
                }}
                className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                + Agregar Actividad
              </button>
              {(!day.actividades || day.actividades.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  No se han agregado actividades. Haga clic en "Agregar Actividad" para comenzar.
                </p>
              )}
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Principales dificultades</label>
              <div className="flex items-center gap-2">
                {day.dificultadesPrincipales && day.dificultadesPrincipales.filter(d => d.trim()).length > 0 && (
                  <button
                    type="button"
                    onClick={() => onAddSuggestedAssumptions(dayIndex)}
                    className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                    title="Agregar supuestos sugeridos basados en las dificultades seleccionadas"
                  >
                    💡 Sugerir Supuestos
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onAddDifficulty(dayIndex)}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  + Agregar Dificultad
                </button>
              </div>
            </div>
            {/* Difficulties List */}
            <div className="space-y-2">
              {(day.dificultadesPrincipales || []).map((difficulty, difficultyIndex) => (
                <div key={difficultyIndex} className="flex items-center gap-2">
                  <div className="flex-1">
                    <AutocompleteInput
                      value={difficulty}
                      onChange={(value) => onUpdateDifficulty(dayIndex, difficultyIndex, value)}
                      options={riskManagementOptions.dificultadesPrincipales || []}
                      placeholder="Seleccione o escriba una dificultad"
                      className="text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveDifficulty(dayIndex, difficultyIndex)}
                    className="px-2 py-1 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              {(!day.dificultadesPrincipales || day.dificultadesPrincipales.length === 0) && (
                <p className="text-sm text-gray-500 italic">
                  No se han agregado dificultades. Haga clic en "Agregar Dificultad" para comenzar.
                </p>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Agregue las principales dificultades del tramo una por una. El sistema sugerirá supuestos automáticamente basados en su selección.
            </p>
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Hora Inicio *</label>
            <input
              type="time"
              value={day.horaInicio || ''}
              onChange={(e) => onUpdate(dayIndex, 'horaInicio', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Hora Fin *</label>
            <input
              type="time"
              value={day.horaFin || ''}
              onChange={(e) => onUpdate(dayIndex, 'horaFin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Altitud Inicio (msnm)</label>
            <input
              type="number"
              value={day.altitudInicio || ''}
              onChange={(e) => onUpdate(dayIndex, 'altitudInicio', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Altitud Fin (msnm)</label>
            <input
              type="number"
              value={day.altitudFin || ''}
              onChange={(e) => onUpdate(dayIndex, 'altitudFin', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="space-y-4 mt-6">
          {(day.supuestos || []).map((sup, supIdx) => (
            <div key={supIdx} className="border border-gray-200 rounded bg-blue-50 mb-2 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-blue-800">Supuesto {supIdx + 1}</h4>
              </div>
              <div className="space-y-6">
                <div className="mb-4">
                  <AutocompleteInput
                    label="Supuesto clave"
                    value={sup.supuesto || ''}
                    onChange={(value) => onUpdateAssumption(dayIndex, supIdx, 'supuesto', value)}
                    options={riskManagementOptions.supuestos}
                    placeholder="Seleccione o escriba el supuesto clave"
                    required
                  />
                </div>
                <select
                  value={sup.tipoSupuesto || ''}
                  onChange={(e) => onUpdateAssumption(dayIndex, supIdx, 'tipoSupuesto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Seleccionar tipo</option>
                  {riskManagementOptions.tipoSupuestos.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sup.probabilidad || ''}
                  onChange={(e) => onUpdateAssumption(dayIndex, supIdx, 'probabilidad', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Seleccionar probabilidad que se cumpla</option>
                  {riskManagementOptions.probabilidades.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={sup.impacto || ''}
                  onChange={(e) => onUpdateAssumption(dayIndex, supIdx, 'impacto', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  required
                >
                  <option value="">Seleccionar impacto si no se cumple</option>
                  {riskManagementOptions.impactos.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Acción Requerida
                </label>
                <div className={`px-3 py-2 rounded-md border text-sm font-medium ${getActionColor(sup.accion)}`}>
                  {getActionLabel(sup.accion)}
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">No incluir</span>
                  <button
                    type="button"
                    onClick={() => onUpdateAssumption(dayIndex, supIdx, 'incluir', !sup.incluir)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      sup.incluir ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                    aria-pressed={sup.incluir}
                    disabled={sup.accion === 'gestionar'}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        sup.incluir ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs ${sup.accion === 'gestionar' ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                    {sup.accion === 'gestionar' ? 'Incluir en aviso (automático)' : 'Incluir en aviso'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveAssumption(dayIndex, supIdx)}
                  className="text-red-600 text-xs font-semibold hover:underline hover:font-bold"
                >
                  Eliminar supuesto
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => onAddAssumption(dayIndex)}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors text-sm"
          >
            + Agregar Supuesto
          </button>
        </div>
      </div>
    </details>
  );
} 