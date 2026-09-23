'use client';
import React from 'react';
import { medicalOptions } from '../../constants/medicalOptions';
import AutocompleteInput from './AutocompleteInput';

export default function ParticipantForm({ 
  participant, 
  index, 
  onUpdate, 
  onNameChange, 
  getSavedParticipantNames 
}) {
  const formatRUT = (rut) => {
    let value = rut.replace(/[^0-9kK]/g, '');
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    if (value.length > 1) {
      value = value.slice(0, -1) + '-' + value.slice(-1);
    }
    if (value.length > 4) {
      value = value.slice(0, -5) + '.' + value.slice(-5);
    }
    if (value.length > 8) {
      value = value.slice(0, -9) + '.' + value.slice(-9);
    }
    return value;
  };

  const handleRUTChange = (value) => {
    const formattedRUT = formatRUT(value);
    onUpdate(index, 'rut', formattedRUT);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Basic Information */}
      <div className="md:col-span-2">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-1">
          Información Básica
        </h4>
      </div>

      <div className="md:col-span-2 space-y-1">
        <label className="block text-sm font-medium text-gray-700">Nombre completo *</label>
        {participant.isDuplicate && (
          <p className="text-red-500 text-xs bg-white px-2 py-1 rounded shadow z-10 mb-1">Ya existe un participante con ese nombre.</p>
        )}
        <AutocompleteInput
          value={participant.nombre || ''}
          onChange={(value) => onNameChange(index, value)}
          options={getSavedParticipantNames()}
          placeholder="Nombre completo"
          required
          className={participant.isDuplicate ? 'border-red-500' : ''}
        />
      </div>

      {/* Si hay error, el campo de RUT debe ir en una línea aparte (no en la misma fila que nombre). */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          RUT *
        </label>
        <input
          type="text"
          value={participant.rut || ''}
          onChange={(e) => handleRUTChange(e.target.value)}
          placeholder="RUT *"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Teléfono *
        </label>
        <input
          type="tel"
          value={participant.telefono || ''}
          onChange={(e) => onUpdate(index, 'telefono', e.target.value)}
          placeholder="Teléfono *"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Contacto de emergencia *
        </label>
        <input
          type="text"
          value={participant.contactoEmergencia || ''}
          onChange={(e) => onUpdate(index, 'contactoEmergencia', e.target.value)}
          placeholder="Contacto de emergencia *"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Teléfono de contacto de emergencia *
        </label>
        <input
          type="tel"
          value={participant.telefonoEmergencia || ''}
          onChange={(e) => onUpdate(index, 'telefonoEmergencia', e.target.value)}
          placeholder="Teléfono de contacto de emergencia *"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* Medical Information */}
      <div className="md:col-span-2">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 border-b pb-1">
          Datos Médicos Importantes
        </h4>
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          Grupo sanguíneo
        </label>
        <select
          value={participant.grupoSanguineo || ''}
          onChange={(e) => onUpdate(index, 'grupoSanguineo', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar grupo sanguíneo</option>
                            {medicalOptions.bloodTypes.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <AutocompleteInput
        label="Alergias"
        value={participant.alergias || ''}
        onChange={(value) => onUpdate(index, 'alergias', value)}
                    options={medicalOptions.allergies}
        placeholder="Seleccione o escriba las alergias"
      />

      <AutocompleteInput
        label="Enfermedades o condiciones"
        value={participant.enfermedades || ''}
        onChange={(value) => onUpdate(index, 'enfermedades', value)}
                    options={medicalOptions.medicalConditions}
        placeholder="Seleccione o escriba las condiciones"
      />

      <AutocompleteInput
        label="Medicamentos que toma"
        value={participant.medicamentos || ''}
        onChange={(value) => onUpdate(index, 'medicamentos', value)}
                    options={medicalOptions.medications}
        placeholder="Seleccione o escriba los medicamentos"
      />

      <AutocompleteInput
        label="Condiciones especiales"
        value={participant.condicionesEspeciales || ''}
        onChange={(value) => onUpdate(index, 'condicionesEspeciales', value)}
                    options={medicalOptions.specialConditions}
        placeholder="Seleccione o escriba las condiciones especiales"
      />
    </div>
  );
} 