'use client';
import React, { useState } from 'react';
import { basicFormOptions } from '../../constants/basicFormOptions';

import { transportOptions } from '../../constants/transportOptions';
import { medicalOptions } from '../../constants/medicalOptions';
import { difficultyAssumptionRecommendations } from '../../constants/difficultyAssumptionRecommendations';
import { exportDataToJSON } from '../../constants/dataExportUtils';

export default function FormsAdminPanel() {
  const [activeTab, setActiveTab] = useState('basic');
  const [basicOptions, setBasicOptions] = useState(basicFormOptions);

  const [transportOpts, setTransportOpts] = useState(transportOptions);
  const [medicalOpts, setMedicalOpts] = useState(medicalOptions);
  const [assumptionRecs, setAssumptionRecs] = useState(difficultyAssumptionRecommendations);
  const [showAddAssumption, setShowAddAssumption] = useState(false);
  const [editingAssumption, setEditingAssumption] = useState(null);
  const [showAddDifficulty, setShowAddDifficulty] = useState(false);
  const [newDifficulty, setNewDifficulty] = useState('');
  
  // Estados para agregar datos básicos
  const [showAddBasic, setShowAddBasic] = useState(false);
  const [basicType, setBasicType] = useState('');
  const [newBasicItem, setNewBasicItem] = useState('');
  

  
  // Estados para agregar datos de transporte
  const [showAddTransport, setShowAddTransport] = useState(false);
  const [transportType, setTransportType] = useState('');
  const [newTransportItem, setNewTransportItem] = useState('');
  
  // Estados para agregar datos médicos
  const [showAddMedical, setShowAddMedical] = useState(false);
  const [medicalType, setMedicalType] = useState('');
  const [newMedicalItem, setNewMedicalItem] = useState('');

  const handleExportBasic = () => {
    const data = {
      basicFormOptions: basicOptions,
      timestamp: new Date().toISOString(),
      description: 'Opciones básicas de formulario exportadas'
    };
    exportDataToJSON(data, 'basic_form_options_export.json');
  };



  const handleExportTransport = () => {
    const data = {
      transportOptions: transportOpts,
      timestamp: new Date().toISOString(),
      description: 'Opciones de transporte exportadas'
    };
    exportDataToJSON(data, 'transport_options_export.json');
  };

  const handleExportMedical = () => {
    const data = {
      medicalOptions: medicalOpts,
      timestamp: new Date().toISOString(),
      description: 'Opciones médicas exportadas'
    };
    exportDataToJSON(data, 'medical_options_export.json');
  };

  const handleExportAssumptions = () => {
    const data = {
      difficultyAssumptionRecommendations: assumptionRecs,
      timestamp: new Date().toISOString(),
      description: 'Recomendaciones de supuestos exportadas'
    };
    exportDataToJSON(data, 'assumption_recommendations_export.json');
  };

  const handleExportAll = () => {
    const data = {
      formsData: {
        basicFormOptions: basicOptions,

        transportOptions: transportOpts,
        medicalOptions: medicalOpts,
        difficultyAssumptionRecommendations: assumptionRecs
      },
      timestamp: new Date().toISOString(),
      description: 'Todos los datos de formularios exportados'
    };
    exportDataToJSON(data, 'forms_data_export.json');
  };

  const handleSaveAssumption = (assumptionData) => {
    const updatedRecs = { ...assumptionRecs };
    
    if (editingAssumption) {
      // Editando supuesto existente
      updatedRecs[editingAssumption.difficulty][editingAssumption.index] = {
        supuesto: assumptionData.supuesto,
        tipoSupuesto: assumptionData.tipoSupuesto,
        probabilidad: assumptionData.probabilidad,
        impacto: assumptionData.impacto
      };
    } else {
      // Agregando nuevo supuesto
      if (!updatedRecs[assumptionData.difficulty]) {
        updatedRecs[assumptionData.difficulty] = [];
      }
      updatedRecs[assumptionData.difficulty].push({
        supuesto: assumptionData.supuesto,
        tipoSupuesto: assumptionData.tipoSupuesto,
        probabilidad: assumptionData.probabilidad,
        impacto: assumptionData.impacto
      });
    }
    
    setAssumptionRecs(updatedRecs);
    setShowAddAssumption(false);
    setEditingAssumption(null);
  };

  const handleDeleteAssumption = (difficulty, index) => {
    if (confirm('¿Eliminar este supuesto?')) {
      const updatedRecs = { ...assumptionRecs };
      updatedRecs[difficulty] = updatedRecs[difficulty].filter((_, i) => i !== index);
      setAssumptionRecs(updatedRecs);
    }
  };

  const handleAddDifficulty = () => {
    if (newDifficulty.trim()) {
      const updatedRecs = { ...assumptionRecs };
      updatedRecs[newDifficulty.trim()] = [];
      setAssumptionRecs(updatedRecs);
      setNewDifficulty('');
      setShowAddDifficulty(false);
    }
  };

  const handleDeleteDifficulty = (difficulty) => {
    if (confirm(`¿Eliminar la dificultad "${difficulty}" y todos sus supuestos?`)) {
      const updatedRecs = { ...assumptionRecs };
      delete updatedRecs[difficulty];
      setAssumptionRecs(updatedRecs);
    }
  };

  // Funciones para datos básicos
  const handleAddBasicItem = () => {
    if (newBasicItem.trim() && basicType) {
      const updatedOptions = { ...basicOptions };
      if (updatedOptions[basicType]) {
        updatedOptions[basicType].push(newBasicItem.trim());
        setBasicOptions(updatedOptions);
        setNewBasicItem('');
        setBasicType('');
        setShowAddBasic(false);
      }
    }
  };

  const handleDeleteBasicItem = (type, index) => {
    if (confirm('¿Eliminar este elemento?')) {
      const updatedOptions = { ...basicOptions };
      updatedOptions[type] = updatedOptions[type].filter((_, i) => i !== index);
      setBasicOptions(updatedOptions);
    }
  };



  // Funciones para datos de transporte
  const handleAddTransportItem = () => {
    if (newTransportItem.trim() && transportType) {
      const updatedOptions = { ...transportOpts };
      if (updatedOptions[transportType]) {
        if (transportType === 'transportTypes') {
          updatedOptions[transportType].push({ value: newTransportItem.trim().toLowerCase().replace(/\s+/g, '_'), label: newTransportItem.trim() });
        } else {
          updatedOptions[transportType].push(newTransportItem.trim());
        }
        setTransportOpts(updatedOptions);
        setNewTransportItem('');
        setTransportType('');
        setShowAddTransport(false);
      }
    }
  };

  const handleDeleteTransportItem = (type, index) => {
    if (confirm('¿Eliminar este elemento?')) {
      const updatedOptions = { ...transportOpts };
      updatedOptions[type] = updatedOptions[type].filter((_, i) => i !== index);
      setTransportOpts(updatedOptions);
    }
  };

  // Funciones para datos médicos
  const handleAddMedicalItem = () => {
    if (newMedicalItem.trim() && medicalType) {
      const updatedOptions = { ...medicalOpts };
      if (updatedOptions[medicalType]) {
        if (medicalType === 'bloodTypes') {
          updatedOptions[medicalType].push({ value: newMedicalItem.trim().toLowerCase().replace(/\s+/g, '_'), label: newMedicalItem.trim() });
        } else {
          updatedOptions[medicalType].push(newMedicalItem.trim());
        }
        setMedicalOpts(updatedOptions);
        setNewMedicalItem('');
        setMedicalType('');
        setShowAddMedical(false);
      }
    }
  };

  const handleDeleteMedicalItem = (type, index) => {
    if (confirm('¿Eliminar este elemento?')) {
      const updatedOptions = { ...medicalOpts };
      updatedOptions[type] = updatedOptions[type].filter((_, i) => i !== index);
      setMedicalOpts(updatedOptions);
    }
  };

  const renderBasicOptionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Datos de Autocompletado Básico</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddBasic(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Elemento
          </button>
          <button
            onClick={handleExportBasic}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Exportar Datos Básicos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Actividades Generales</h4>
          <div className="space-y-2">
            {basicOptions.actividades.map((actividad, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{actividad}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteBasicItem('actividades', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Actividades Específicas</h4>
          <div className="space-y-2">
            {basicOptions.actividadesEspecificas.map((actividad, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{actividad}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteBasicItem('actividadesEspecificas', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Cerros y Sectores</h4>
          <div className="space-y-2">
            {basicOptions.cerrosSectores.map((cerro, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{cerro}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteBasicItem('cerrosSectores', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );



  const renderTransportOptionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sugerencias de Transporte</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddTransport(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Elemento
          </button>
          <button
            onClick={handleExportTransport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Exportar Sugerencias de Transporte
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Tipos de Transporte</h4>
          <div className="space-y-2">
            {transportOpts.transportTypes.map((tipo, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{tipo.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteTransportItem('transportTypes', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Marcas de Vehículos</h4>
          <div className="space-y-2">
            {transportOpts.vehicleBrands.map((marca, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{marca}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteTransportItem('vehicleBrands', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderMedicalOptionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sugerencias Médicas</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddMedical(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Elemento
          </button>
          <button
            onClick={handleExportMedical}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Exportar Sugerencias Médicas
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Grupos Sanguíneos</h4>
          <div className="space-y-2">
            {medicalOpts.bloodTypes.map((grupo, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{grupo.label}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteMedicalItem('bloodTypes', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Alergias</h4>
          <div className="space-y-2">
            {medicalOpts.allergies.map((alergia, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{alergia}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteMedicalItem('allergies', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-3">Sugerencias de Condiciones Médicas</h4>
          <div className="space-y-2">
            {medicalOpts.medicalConditions.map((condicion, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm">{condicion}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Sugerencia</span>
                  <button
                    onClick={() => handleDeleteMedicalItem('medicalConditions', index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAssumptionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Sugerencias de Supuestos por Dificultad</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddDifficulty(true)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Dificultad
          </button>
          <button
            onClick={() => setShowAddAssumption(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Supuesto
          </button>
          <button
            onClick={handleExportAssumptions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Exportar Sugerencias de Supuestos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {Object.entries(assumptionRecs).map(([difficulty, recommendations]) => (
          <div key={difficulty} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-semibold text-gray-900">{difficulty}</h4>
              <button
                onClick={() => handleDeleteDifficulty(difficulty)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Eliminar Dificultad
              </button>
            </div>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded border">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-800">{rec.supuesto}</span>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setEditingAssumption({ difficulty, index, data: rec })}
                          className="text-blue-600 hover:text-blue-800 text-xs"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAssumption(difficulty, index)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Tipo:</span>
                        <span className="ml-1 text-gray-800">{rec.tipoSupuesto}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Probabilidad:</span>
                        <span className="ml-1 text-gray-800">{rec.probabilidad}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Impacto:</span>
                        <span className="ml-1 text-gray-800">{rec.impacto}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Datos de Autocompletado</h1>
        <p className="text-gray-600">Administra sugerencias y datos de autocompletado para formularios</p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', label: 'Datos Básicos' },

            { id: 'transport', label: 'Transporte' },
            { id: 'medical', label: 'Médico' },
            { id: 'assumptions', label: 'Supuestos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'basic' && renderBasicOptionsTab()}

        {activeTab === 'transport' && renderTransportOptionsTab()}
        {activeTab === 'medical' && renderMedicalOptionsTab()}
        {activeTab === 'assumptions' && renderAssumptionsTab()}
      </div>

      {/* Export All Button */}
      <div className="mt-6">
        <button
          onClick={handleExportAll}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Exportar Todos los Datos de Autocompletado
        </button>
      </div>

      {/* Modal para agregar dificultad */}
      {showAddDifficulty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Nueva Dificultad</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Dificultad</label>
                <input
                  type="text"
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ej: Terreno técnico avanzado"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddDifficulty(false);
                    setNewDifficulty('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddDifficulty}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                >
                  Agregar Dificultad
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar datos básicos */}
      {showAddBasic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Elemento Básico</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Elemento</label>
                <select
                  value={basicType}
                  onChange={(e) => setBasicType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="actividades">Actividades Generales</option>
                  <option value="actividadesEspecificas">Actividades Específicas</option>
                  <option value="cerrosSectores">Cerros y Sectores</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo Elemento</label>
                <input
                  type="text"
                  value={newBasicItem}
                  onChange={(e) => setNewBasicItem(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ej: Escalada en roca"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddBasic(false);
                    setNewBasicItem('');
                    setBasicType('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddBasicItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar Elemento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* Modal para agregar datos de transporte */}
      {showAddTransport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Elemento de Transporte</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Elemento</label>
                <select
                  value={transportType}
                  onChange={(e) => setTransportType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="transportTypes">Tipos de Transporte</option>
                  <option value="vehicleBrands">Marcas de Vehículos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo Elemento</label>
                <input
                  type="text"
                  value={newTransportItem}
                  onChange={(e) => setNewTransportItem(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ej: Camioneta 4x4"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddTransport(false);
                    setNewTransportItem('');
                    setTransportType('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddTransportItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar Elemento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para agregar datos médicos */}
      {showAddMedical && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Agregar Elemento Médico</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Elemento</label>
                <select
                  value={medicalType}
                  onChange={(e) => setMedicalType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  <option value="bloodTypes">Grupos Sanguíneos</option>
                  <option value="allergies">Alergias</option>
                  <option value="medicalConditions">Condiciones Médicas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nuevo Elemento</label>
                <input
                  type="text"
                  value={newMedicalItem}
                  onChange={(e) => setNewMedicalItem(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Ej: Alergia al polen"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowAddMedical(false);
                    setNewMedicalItem('');
                    setMedicalType('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddMedicalItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Agregar Elemento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modales para supuestos */}
      {(showAddAssumption || editingAssumption) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingAssumption ? 'Editar Supuesto' : 'Agregar Supuesto'}
            </h3>
            <AssumptionForm
              assumption={editingAssumption?.data || {}}
              difficulty={editingAssumption?.difficulty || ''}
              onSave={handleSaveAssumption}
              onCancel={() => {
                setShowAddAssumption(false);
                setEditingAssumption(null);
              }}
              difficulties={Object.keys(assumptionRecs)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para formulario de supuestos
function AssumptionForm({ assumption = {}, difficulty = '', onSave, onCancel, difficulties = [] }) {
  const [formData, setFormData] = useState({
    difficulty: difficulty,
    supuesto: assumption.supuesto || '',
    tipoSupuesto: assumption.tipoSupuesto || '',
    probabilidad: assumption.probabilidad || '',
    impacto: assumption.impacto || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Dificultad</label>
        <select
          value={formData.difficulty}
          onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Seleccionar dificultad</option>
          {difficulties.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Supuesto</label>
        <textarea
          value={formData.supuesto}
          onChange={(e) => setFormData({ ...formData, supuesto: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          rows="3"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo de Supuesto</label>
        <select
          value={formData.tipoSupuesto}
          onChange={(e) => setFormData({ ...formData, tipoSupuesto: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Seleccionar tipo</option>
          <option value="grupo_humano">Grupo Humano</option>
          <option value="condiciones">Condiciones</option>
          <option value="itinerario">Itinerario</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Probabilidad</label>
        <select
          value={formData.probabilidad}
          onChange={(e) => setFormData({ ...formData, probabilidad: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Seleccionar</option>
          <option value="muy_improbable">Muy improbable</option>
          <option value="poco_probable">Poco probable</option>
          <option value="algo_probable">Algo probable</option>
          <option value="muy_probable">Muy probable</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Impacto</label>
        <select
          value={formData.impacto}
          onChange={(e) => setFormData({ ...formData, impacto: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
          required
        >
          <option value="">Seleccionar</option>
          <option value="minimo">Mínimo</option>
          <option value="manejable">Manejable</option>
          <option value="significativo">Significativo</option>
          <option value="critico">Crítico</option>
        </select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Guardar
        </button>
      </div>
    </form>
  );
} 