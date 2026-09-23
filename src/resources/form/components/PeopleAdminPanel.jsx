'use client';
import React, { useState } from 'react';
import { peopleData } from '../../constants/peopleData';
import { exportDataToJSON, createBackup } from '../../constants/dataExportUtils';

export default function PeopleAdminPanel() {
  const [people, setPeople] = useState(peopleData);
  const [editMode, setEditMode] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPerson, setNewPerson] = useState({});

  const handleExportPeople = () => {
    const data = {
      people: people,
      timestamp: new Date().toISOString(),
      description: 'Datos de personas exportados'
    };
    exportDataToJSON(data, 'people_export.json');
  };

  const handleCreateBackup = () => {
    const backupData = {
      originalData: { people },
      timestamp: new Date().toISOString(),
      type: 'backup'
    };
    exportDataToJSON(backupData, 'people_backup.json');
  };

  const handleEditPerson = (personName, personData) => {
    setEditingPerson({ name: personName, data: personData });
    setEditMode(true);
  };

  const handleSavePerson = (updatedPerson) => {
    setPeople(prev => ({
      ...prev,
      [updatedPerson.name]: updatedPerson.data
    }));
    setEditMode(false);
    setEditingPerson(null);
  };

  const handleDeletePerson = (personName) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${personName}?`)) {
      setPeople(prev => {
        const newPeople = { ...prev };
        delete newPeople[personName];
        return newPeople;
      });
    }
  };

  const handleAddPerson = (personData) => {
    setPeople(prev => ({
      ...prev,
      [personData.name]: personData.data
    }));
    setShowAddForm(false);
    setNewPerson({});
  };

  const renderPeopleList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Participantes</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Agregar Participante
          </button>
          <button
            onClick={handleExportPeople}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Exportar Participantes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(people).map(([name, person]) => (
          <div key={name} className="bg-white p-6 rounded-lg border shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900 text-lg">{name}</h4>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEditPerson(name, person)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletePerson(name)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>RUT:</strong> {person.rut}</p>
              <p><strong>Teléfono:</strong> {person.telefono}</p>
              {person.email && <p><strong>Email:</strong> {person.email}</p>}
              <p><strong>Grupo Sanguíneo:</strong> {person.grupoSanguineo}</p>
              {person.alergias && person.alergias !== 'Ninguna' && <p><strong>Alergias:</strong> {person.alergias}</p>}
              {person.enfermedades && person.enfermedades !== 'Ninguna' && <p><strong>Enfermedades:</strong> {person.enfermedades}</p>}
              {person.medicamentos && person.medicamentos !== 'Ninguno' && <p><strong>Medicamentos:</strong> {person.medicamentos}</p>}
              {person.condicionesEspeciales && person.condicionesEspeciales !== 'Ninguna' && <p><strong>Condiciones:</strong> {person.condicionesEspeciales}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditModal = () => {
    if (!editMode || !editingPerson) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            Editar Participante
          </h3>
          <PersonForm
            person={editingPerson}
            onSave={handleSavePerson}
            onCancel={() => {
              setEditMode(false);
              setEditingPerson(null);
            }}
          />
        </div>
      </div>
    );
  };

  const renderAddModal = () => {
    if (!showAddForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            Agregar Participante
          </h3>
          <PersonForm
            person={{ name: '', data: {} }}
            onSave={handleAddPerson}
            onCancel={() => setShowAddForm(false)}
            isNew={true}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Participantes</h1>
        <p className="text-gray-600">Administra todos los participantes del CAU</p>
      </div>

      <div className="mb-8 flex space-x-4">
        <button
          onClick={handleCreateBackup}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md font-medium"
        >
          Crear Backup
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8">
        {renderPeopleList()}
      </div>

      {renderEditModal()}
      {renderAddModal()}
    </div>
  );
}

// Componente para editar/agregar persona
function PersonForm({ person, onSave, onCancel, isNew = false }) {
  const [formData, setFormData] = useState({
    name: isNew ? '' : person.name,
    data: isNew ? {} : person.data
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {/* Información Básica */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Información Básica</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">RUT</label>
              <input
                type="text"
                value={formData.data.rut || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, rut: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="text"
                value={formData.data.telefono || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, telefono: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.data.email || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, email: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grupo Sanguíneo</label>
              <select
                value={formData.data.grupoSanguineo || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, grupoSanguineo: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Seleccionar</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Contacto de Emergencia</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Contacto</label>
              <input
                type="text"
                value={formData.data.contactoEmergencia || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, contactoEmergencia: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono de Contacto de Emergencia</label>
              <input
                type="text"
                value={formData.data.telefonoEmergencia || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, telefonoEmergencia: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Información Médica */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-3">Información Médica</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alergias</label>
              <textarea
                value={formData.data.alergias || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, alergias: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Ej: Polen, Látex, Frutos secos"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Enfermedades</label>
              <textarea
                value={formData.data.enfermedades || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, enfermedades: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Ej: Asma, Diabetes, Hipertensión"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Medicamentos</label>
              <textarea
                value={formData.data.medicamentos || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, medicamentos: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Ej: Broncodilatadores, Metformina, Insulina"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Condiciones Especiales</label>
              <textarea
                value={formData.data.condicionesEspeciales || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  data: { ...formData.data, condicionesEspeciales: e.target.value }
                })}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                rows="2"
                placeholder="Ej: Problemas de aclimatación, Control de azúcar"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          {isNew ? 'Agregar' : 'Guardar'}
        </button>
      </div>
    </form>
  );
} 