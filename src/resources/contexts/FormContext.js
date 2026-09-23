'use client';
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

// Initial form state
const initialFormState = {
  currentStep: 1,
  basicInfo: {
    contactoCAU: '',
    telefonoContacto: '',
    emailContacto: '',
    fechaHoraReporteRegreso: '',
    actividad: '',
    cerroOSector: '',
    ruta: '',
    linkPronostico: '',
    linkRuta: '',
    weatherImages: []
  },
  participantes: [],
  itinerario: [],
  equipo: [],
  transporte: [],
  cuerposRescate: [
    { nombre: 'Socorro Andino Santiago', telefono: '226994764 - 226989094', incluir: true },
    { nombre: 'Carabineros', telefono: '133', incluir: true },
    { nombre: 'Bomberos', telefono: '132', incluir: true },
    { nombre: 'FACH (Fuerza Aérea - Rescate Aéreo)', telefono: '+56 2 2690 1000', incluir: true },
    { nombre: 'Socorro Andino Magallanes', telefono: '+56 9 6594 4314', incluir: false },
    { nombre: 'SAMU (Servicio de Atención Médica de Urgencia)', telefono: '131', incluir: false },
    { nombre: 'PDI (Policía de Investigaciones)', telefono: '134', incluir: false },
    { nombre: 'Socorro Andino Los Andes', telefono: '+56 9 9442 4294', incluir: false },
    { nombre: 'Socorro Andino Valparaíso', telefono: '+56 9 8225 7085', incluir: false },
    { nombre: 'Cuerpo de Socorro Andino Aconcagua', telefono: '+56 9 9164 5890', incluir: false },
    { nombre: 'CONAF (Emergencias en Parques Nacionales)', telefono: '+56 2 2663 0000', incluir: false },
    { nombre: 'Armada de Chile (Rescate Marítimo)', telefono: '+56 32 220 8888', incluir: false }
  ]
};

// Form reducer
const formReducer = (state, action) => {
  switch (action.type) {
    case 'UPDATE_FORM_FIELD':
      return {
        ...state,
        [action.section]: {
          ...state[action.section],
          [action.field]: action.value
        }
      };
    
    case 'ADD_ITEM':
      // Ensure the section exists and is an array
      const currentSection = Array.isArray(state[action.section]) ? state[action.section] : [];
      return {
        ...state,
        [action.section]: [...currentSection, action.item]
      };
    
    case 'REMOVE_ITEM':
      // Ensure the section exists and is an array
      const sectionToRemoveFrom = Array.isArray(state[action.section]) ? state[action.section] : [];
      return {
        ...state,
        [action.section]: sectionToRemoveFrom.filter((_, index) => index !== action.index)
      };
    
    case 'UPDATE_ITEM':
      // Ensure the section exists and is an array
      const sectionToUpdate = Array.isArray(state[action.section]) ? state[action.section] : [];
      const updatedSection = [...sectionToUpdate];
      if (updatedSection[action.index]) {
        if (action.field) {
          // Single field update
          updatedSection[action.index] = { ...updatedSection[action.index], [action.field]: action.value };
        } else if (action.updates) {
          // Multiple field update
          updatedSection[action.index] = { ...updatedSection[action.index], ...action.updates };
        }
      }
      return {
        ...state,
        [action.section]: updatedSection
      };
    
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.step
      };
    
    case 'RESET_FORM':
      return initialFormState;
    
    case 'UPDATE_WEATHER_IMAGES':
      return {
        ...state,
        basicInfo: {
          ...state.basicInfo,
          weatherImages: action.images
        }
      };
    
    case 'LOAD_SAVED_DATA':
      // Ensure all array fields exist in the loaded data
      const loadedData = {
        ...initialFormState,
        ...action.data,
        currentStep: action.data.currentStep || 1, // Preserve current step
        basicInfo: {
          ...initialFormState.basicInfo,
          ...(action.data.basicInfo || {})
        },
        participantes: Array.isArray(action.data.participantes) ? action.data.participantes : [],
        itinerario: Array.isArray(action.data.itinerario) ? action.data.itinerario : [],
        equipo: Array.isArray(action.data.equipo) ? action.data.equipo : [],
        transporte: Array.isArray(action.data.transporte) ? action.data.transporte : [],
        cuerposRescate: Array.isArray(action.data.cuerposRescate) ? action.data.cuerposRescate : initialFormState.cuerposRescate
      };
      return loadedData;
    
    default:
      return state;
  }
};

// Create context
const FormContext = createContext();

// Provider component
export const FormContextProvider = ({ children }) => {
  const [formData, dispatch] = useReducer(formReducer, initialFormState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('formData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Limpiar URLs de objetos para imágenes cargadas desde localStorage
        if (parsedData.basicInfo?.weatherImages) {
          parsedData.basicInfo.weatherImages = parsedData.basicInfo.weatherImages.map(img => ({
            ...img,
            url: img.base64 || '' // Usar base64 en lugar de URL de objeto
          }));
        }
        
        // Use the new LOAD_SAVED_DATA action to properly merge data
        dispatch({ type: 'LOAD_SAVED_DATA', data: parsedData });
      } catch (error) {
        console.error('Error loading form data from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save data to localStorage whenever formData changes (but not during initial load)
  useEffect(() => {
    if (!isInitialized) {
      return; // Don't save during initial load
    }
    
    // Save weather images to localStorage (now compressed)
    const dataToSave = {
      ...formData,
      basicInfo: {
        ...formData.basicInfo,
        weatherImages: formData.basicInfo.weatherImages || [] // Save compressed images
      }
    };

    try {
      localStorage.setItem('formData', JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving form data to localStorage:', error);

      // localStorage has a per-origin size limit (~5-10MB). Large weather image
      // uploads can push the payload over that limit and throw QuotaExceededError.
      // Fall back to persisting everything except the images so the app doesn't
      // crash and the rest of the form data isn't lost.
      try {
        const { weatherImages, ...basicInfoWithoutImages } = dataToSave.basicInfo;
        localStorage.setItem('formData', JSON.stringify({
          ...dataToSave,
          basicInfo: basicInfoWithoutImages
        }));
      } catch (fallbackError) {
        console.error('Error saving form data to localStorage (fallback without images):', fallbackError);
      }
    }
  }, [formData, isInitialized]);

  // Context functions
  const updateFormField = (section, field, value) => {
    dispatch({ type: 'UPDATE_FORM_FIELD', section, field, value });
  };

  const addItem = (section, item) => {
    dispatch({ type: 'ADD_ITEM', section, item });
  };

  const removeItem = (section, index) => {
    dispatch({ type: 'REMOVE_ITEM', section, index });
  };

  const updateItem = (section, index, updatedItem) => {
    if (typeof updatedItem === 'object' && Object.keys(updatedItem).length === 1) {
      // Single field update (backward compatibility)
      const field = Object.keys(updatedItem)[0];
      const value = Object.values(updatedItem)[0];
      dispatch({ type: 'UPDATE_ITEM', section, index, field, value });
    } else if (typeof updatedItem === 'object') {
      // Multiple field update - single dispatch
      dispatch({ type: 'UPDATE_ITEM', section, index, updates: updatedItem });
    } else {
      dispatch({ type: 'UPDATE_ITEM', section, index, field: 'value', value: updatedItem });
    }
  };

  const goToStep = (step) => {
    dispatch({ type: 'SET_STEP', step });
  };

  const resetForm = () => {
    dispatch({ type: 'RESET_FORM' });
    localStorage.removeItem('formData');
  };

  const updateWeatherImages = (images) => {
    dispatch({ type: 'UPDATE_WEATHER_IMAGES', images });
  };

  // Check if current step is valid - UPDATED FOR INTEGRATED MEDICAL DATA
  const isStepValid = (step) => {
    const participantes = Array.isArray(formData.participantes) ? formData.participantes : [];
    const equipo = Array.isArray(formData.equipo) ? formData.equipo : [];
    const transporte = Array.isArray(formData.transporte) ? formData.transporte : [];
    const itinerario = Array.isArray(formData.itinerario) ? formData.itinerario : [];

    switch (step) {
      case 1: // Basic Info
        const basicValid = formData.basicInfo.contactoCAU &&
                          formData.basicInfo.telefonoContacto &&
                          formData.basicInfo.emailContacto &&
                          formData.basicInfo.fechaHoraReporteRegreso &&
                          formData.basicInfo.actividad &&
                          formData.basicInfo.cerroOSector;
        
        // If InReach is enabled, check those fields too
        const inReachValid = !formData.basicInfo.llevaInreach || 
                           (formData.basicInfo.numeroInreach && formData.basicInfo.codigoInreach);
        
        return basicValid && inReachValid;
      case 2: // Participants (now includes medical data)
        return participantes.length > 0 &&
               participantes.every(p => p.nombre && p.rut && p.telefono && p.contactoEmergencia && p.telefonoEmergencia);
      case 3: // Itinerary & Assumptions
        return itinerario.length > 0 && itinerario.every(day => {
          const hasRequiredFields = day.tramo && day.actividades && day.actividades.length > 0 && day.horaInicio && day.horaFin;
          if (!hasRequiredFields) return false;
          
          // Verificar que la fecha del tramo esté entre hoy y la fecha de reporte de regreso
          if (day.fecha) {
            const today = new Date(new Date().toISOString().split('T')[0]);
            const tramoDate = new Date(day.fecha);
            const reporteDate = formData.basicInfo.fechaHoraReporteRegreso ? 
              new Date(formData.basicInfo.fechaHoraReporteRegreso) : null;
            
            // La fecha del tramo debe ser hoy o posterior
            if (tramoDate < today) return false;
            
            // La fecha del tramo no puede ser posterior a la fecha de reporte de regreso
            if (reporteDate && tramoDate > reporteDate) return false;
          }
          
          return true;
        });
      case 4: // Risk Management
        // Verificar que todos los supuestos con acción 'gestionar' (automático) o 'monitoreo_intenso' e incluir: true tengan causas completas
        const supuestosGestionar = [];
        const supuestosIncompletos = [];
        
        itinerario.forEach((day) => {
          (day.supuestos || []).forEach((assumption) => {
            // Incluir supuestos con acción 'gestionar' (automático) o 'monitoreo_intenso' e incluir: true
            if (assumption.accion === 'gestionar' || (assumption.accion === 'monitoreo_intenso' && assumption.incluir === true)) {
              supuestosGestionar.push(assumption);
              
              // Verificar que el supuesto tenga causas con peligros y riesgos
              if (!assumption.causas || assumption.causas.length === 0) {
                supuestosIncompletos.push(assumption);
              } else {
                // Verificar que todas las causas tengan al menos un peligro y un riesgo
                const hasIncompleteCausas = assumption.causas.some(causa => 
                  !causa.peligros || causa.peligros.length === 0 || 
                  !causa.riesgos || causa.riesgos.length === 0 ||
                  causa.peligros.some(p => !p.trim()) ||
                  causa.riesgos.some(r => !r.trim())
                );
                if (hasIncompleteCausas) {
                  supuestosIncompletos.push(assumption);
                }
              }
            }
          });
        });
        
        // Si hay supuestos de gestión, todos deben estar completos
        const risksComplete = supuestosGestionar.length === 0 || supuestosIncompletos.length === 0;
      case 5: // Equipment & Transport
        // Solo validar si hay equipos o transportes agregados
        const validEquipo = equipo.filter(e => e.categoria && e.item && e.cantidad);
        
        // Validar transportes según el tipo
        const validTransporte = transporte.filter(t => {
          if (!t.tipo || !t.distancia) return false;
          
          const tipo = t.tipo.toLowerCase();
          
          // Para auto particular, requiere conductor
          if (tipo === 'auto particular') {
            return t.conductor;
          }
          
          // Para otros tipos, solo requiere distancia
          return true;
        });
        
        // Si no hay equipos ni transportes, el paso es válido (son opcionales)
        if (equipo.length === 0 && transporte.length === 0) {
          return true;
        }
        
        // Si hay equipos, todos deben ser válidos
        if (equipo.length > 0 && validEquipo.length !== equipo.length) {
          return false;
        }
        
        // Si hay transportes, todos deben ser válidos
        if (transporte.length > 0 && validTransporte.length !== transporte.length) {
          return false;
        }
        
        return true;
      case 6: // Final Review (removed medical data step)
        return checkFormCompletion();
      default:
        return false;
    }
  };

  // Check if form is complete for PDF generation - UPDATED FOR INTEGRATED MEDICAL DATA
  const checkFormCompletion = () => {
    const participantes = Array.isArray(formData.participantes) ? formData.participantes : [];
    const equipo = Array.isArray(formData.equipo) ? formData.equipo : [];
    const transporte = Array.isArray(formData.transporte) ? formData.transporte : [];
    const itinerario = Array.isArray(formData.itinerario) ? formData.itinerario : [];

    const basicInfoComplete = formData.basicInfo.contactoCAU &&
                             formData.basicInfo.telefonoContacto &&
                             formData.basicInfo.emailContacto &&
                             formData.basicInfo.fechaHoraReporteRegreso &&
                             formData.basicInfo.actividad &&
                             formData.basicInfo.cerroOSector;

    const inReachComplete = !formData.basicInfo.llevaInreach || 
                           (formData.basicInfo.numeroInreach && formData.basicInfo.codigoInreach);

    const participantsComplete = participantes.length > 0 &&
                               participantes.every(p => p.nombre && p.rut && p.telefono && p.contactoEmergencia && p.telefonoEmergencia);

    const itineraryComplete = itinerario.length > 0 && itinerario.every(day => {
      const hasRequiredFields = day.tramo && day.actividades && day.actividades.length > 0 && day.horaInicio && day.horaFin;
      if (!hasRequiredFields) return false;
      
      // Verificar que la fecha del tramo esté entre hoy y la fecha de reporte de regreso
      if (day.fecha) {
        const today = new Date(new Date().toISOString().split('T')[0]);
        const tramoDate = new Date(day.fecha);
        const reporteDate = formData.basicInfo.fechaHoraReporteRegreso ? 
          new Date(formData.basicInfo.fechaHoraReporteRegreso) : null;
        
        // La fecha del tramo debe ser hoy o posterior
        if (tramoDate < today) return false;
        
        // La fecha del tramo no puede ser posterior a la fecha de reporte de regreso
        if (reporteDate && tramoDate > reporteDate) return false;
      }
      
      return true;
    });

    // Verificar que todos los supuestos con acción 'gestionar' o 'monitoreo_intenso' e incluir: true tengan causas completas
    const supuestosGestionar = [];
    const supuestosIncompletos = [];
    
    itinerario.forEach((day) => {
      (day.supuestos || []).forEach((assumption) => {
        if ((assumption.accion === 'gestionar' || assumption.accion === 'monitoreo_intenso') && assumption.incluir === true) {
          supuestosGestionar.push(assumption);
          
          // Verificar que el supuesto tenga causas con riesgo y peligro
          if (!assumption.causas || assumption.causas.length === 0) {
            supuestosIncompletos.push(assumption);
          } else {
            // Verificar que todas las causas tengan riesgo y peligro
            const hasIncompleteCausas = assumption.causas.some(causa => !causa.riesgo || !causa.peligro);
            if (hasIncompleteCausas) {
              supuestosIncompletos.push(assumption);
            }
          }
        }
      });
    });
    
    // Si hay supuestos de gestión, todos deben estar completos
    const risksComplete = supuestosGestionar.length === 0 || supuestosIncompletos.length === 0;

    const validEquipo = equipo.filter(e => e.categoria && e.item && e.cantidad);
    const validTransporte = transporte.filter(t => t.tipo && t.conductor);
    
    // Equipment y transporte son opcionales, pero si se agregan deben estar completos
    const equipmentComplete = equipo.length === 0 || validEquipo.length === equipo.length;
    const transportComplete = transporte.length === 0 || validTransporte.length === transporte.length;

    return basicInfoComplete && inReachComplete && participantsComplete && itineraryComplete && risksComplete && equipmentComplete && transportComplete;
  };

  const value = {
    formData,
    updateFormField,
    addItem,
    removeItem,
    updateItem,
    goToStep,
    resetForm,
    updateWeatherImages,
    isStepValid,
    checkFormCompletion
  };

  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
};

// Hook to use form context
export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
}; 