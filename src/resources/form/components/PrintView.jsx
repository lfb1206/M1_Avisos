'use client';
import React, { useRef, useEffect } from 'react';

export default function PrintView({ formData, onClose }) {
  const printRef = useRef();
  const participantes = Array.isArray(formData.participantes) ? formData.participantes : [];
  const itinerario = Array.isArray(formData.itinerario) ? formData.itinerario : [];
  
  // Estado para manejar tamaños de imágenes
  const [imageSizes, setImageSizes] = React.useState({});
  const [hoveredImage, setHoveredImage] = React.useState(null);
  const [imageNaturalWidths, setImageNaturalWidths] = React.useState({});
  
  // Función para obtener el tamaño de una imagen
  const getImageSize = (index) => {
    return imageSizes[index] || 150; // Tamaño por defecto: 150px
  };
  
  // Función para actualizar el tamaño de una imagen
  const updateImageSize = (index, newSize) => {
    setImageSizes(prev => ({
      ...prev,
      [index]: Math.max(50, Math.min(680, newSize)) // Limitar entre 50px y 680px (ancho máximo del documento)
    }));
  };
  // Obtener riesgos de los supuestos del itinerario que están incluidos
  const riesgos = [];
  formData.itinerario.forEach((day) => {
    (day.supuestos || []).forEach((assumption) => {
      if ((assumption.accion === 'gestionar' || assumption.accion === 'monitoreo_intenso') && assumption.incluir === true && assumption.causas) {
        assumption.causas.forEach((causa) => {
          // Procesar peligros (fuente del riesgo)
          if (causa.peligros && causa.peligros.length > 0) {
            causa.peligros.forEach((peligro) => {
              if (peligro && peligro.trim()) {
                riesgos.push({
                  supuesto: assumption.supuesto,
                  riesgo: 'Peligro presente',
                  peligro: peligro,
                  lugar: causa.lugar || '',
                  accionProbabilidad: causa.accionProbabilidad || '',
                  accionExposicion: causa.accionExposicion || '',
                  accionConsecuencias: causa.accionConsecuencias || ''
                });
              }
            });
          }
          
          // Procesar riesgos (lo que nos puede pasar)
          if (causa.riesgos && causa.riesgos.length > 0) {
            causa.riesgos.forEach((riesgo) => {
              if (riesgo && riesgo.trim()) {
                riesgos.push({
                  supuesto: assumption.supuesto,
                  riesgo: riesgo,
                  peligro: 'Consecuencia del peligro',
                  lugar: causa.lugar || '',
                  accionProbabilidad: causa.accionProbabilidad || '',
                  accionExposicion: causa.accionExposicion || '',
                  accionConsecuencias: causa.accionConsecuencias || ''
                });
              }
            });
          }
        });
      }
    });
  });
  const equipo = Array.isArray(formData.equipo) ? formData.equipo : [];
  const transporte = Array.isArray(formData.transporte) ? formData.transporte : [];
  const weatherImages = formData.basicInfo.weatherImages || [];
  const cuerposRescate = Array.isArray(formData.cuerposRescate) ? formData.cuerposRescate : [];

  // Función para formatear valores (quitar guiones bajos, capitalizar)
  const formatValue = (value) => {
    if (!value) return '';
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para agrupar equipo por categoría con rowspan
  const getGroupedEquipmentWithRowspan = () => {
    const grouped = {};
    const checkedEquipment = equipo.filter(item => item.checked);
    
    checkedEquipment.forEach(item => {
      if (item.categoria && item.item) {
        if (!grouped[item.categoria]) {
          grouped[item.categoria] = [];
        }
        grouped[item.categoria].push(`${item.item} (${item.cantidad || 1})`);
      }
    });
    
    // Convertir a array con categoría e items separados por coma
    const result = [];
    Object.entries(grouped).forEach(([categoria, items]) => {
      result.push({
        categoria: categoria,
        items: items.join(', ')
      });
    });
    
    return result;
  };

  // Función para agrupar itinerario por tramo con rowspan
  const getGroupedItineraryWithRowspan = () => {
    const grouped = {};
    
    itinerario.forEach(day => {
      if (day.tramo) {
        if (!grouped[day.tramo]) {
          grouped[day.tramo] = [];
        }
        grouped[day.tramo].push({
          fecha: day.fecha,
          actividad: (day.actividades || []).join(', '),
          horaInicio: day.horaInicio,
          horaFin: day.horaFin,
          altitudInicio: day.altitudInicio,
          altitudFin: day.altitudFin
        });
      }
    });
    
    // Convertir a array plano con información de rowspan
    const result = [];
    Object.entries(grouped).forEach(([tramo, items]) => {
      items.forEach((item, index) => {
        result.push({
          tramo: index === 0 ? tramo : null,
          tramoRowspan: index === 0 ? items.length : 0,
          ...item
        });
      });
    });
    
    return result;
  };

  // Función para agrupar supuestos por tramo con rowspan
  const getGroupedAssumptionsWithRowspan = () => {
    const grouped = {};
    
    itinerario.forEach(day => {
      if (day.supuestos) {
        day.supuestos.forEach(assumption => {
          // Incluir supuestos con acción 'gestionar' (automático) o marcados como incluir: true
          if (assumption.accion === 'gestionar' || assumption.incluir) {
            const key = day.tramo;
            if (!grouped[key]) {
              grouped[key] = [];
            }
            grouped[key].push({
              supuesto: assumption.supuesto,
              tipo: assumption.tipoSupuesto,
              probabilidad: assumption.probabilidad,
              impacto: assumption.impacto,
              accion: assumption.accion
            });
          }
        });
      }
    });
    
    // Convertir a array plano con información de rowspan
    const result = [];
    Object.entries(grouped).forEach(([tramo, items]) => {
      items.forEach((item, index) => {
        result.push({
          tramo: index === 0 ? tramo : null,
          tramoRowspan: index === 0 ? items.length : 0,
          ...item
        });
      });
    });
    
    return result;
  };

  // Función para agrupar riesgos por supuesto con rowspan
  const getGroupedRisksWithRowspan = () => {
    const grouped = {};
    
    // Procesar supuestos de gestión de riesgos
    formData.itinerario.forEach((day, dayIndex) => {
      (day.supuestos || []).forEach((assumption, assumptionIndex) => {
        if ((assumption.accion === 'gestionar' || 
             (assumption.accion === 'monitoreo_intenso' && assumption.incluir === true) ||
             (assumption.accion === 'monitoreo_normal' && assumption.incluir === true)) && 
            assumption.causas && assumption.causas.length > 0) {
          
          // Usar una clave única que incluya el índice del supuesto para evitar conflictos
          const uniqueKey = `${assumption.supuesto}_${dayIndex}_${assumptionIndex}`;
          const displayKey = assumption.supuesto; // Para mostrar en la tabla
          
          if (!grouped[uniqueKey]) {
            grouped[uniqueKey] = {
              displayKey: displayKey,
              items: []
            };
          }
          
          // Procesar cada causa del supuesto
          assumption.causas.forEach((causa) => {
            // Combinar peligros y riesgos en formato "riesgo 1 / peligro 1, riesgo 2 / peligro 2"
            const peligros = (causa.peligros || []).filter(p => p.trim());
            const riesgos = (causa.riesgos || []).filter(r => r.trim());
            
            let riesgosRelevantes = '';
            if (peligros.length > 0 && riesgos.length > 0) {
              // Si hay ambos, combinar en pares
              const maxLength = Math.max(peligros.length, riesgos.length);
              const combinados = [];
              for (let i = 0; i < maxLength; i++) {
                const riesgo = riesgos[i] || '';
                const peligro = peligros[i] || '';
                if (riesgo || peligro) {
                  combinados.push(`${riesgo} / ${peligro}`);
                }
              }
              riesgosRelevantes = combinados.join(', ');
            } else if (peligros.length > 0) {
              // Solo peligros
              riesgosRelevantes = peligros.join(', ');
            } else if (riesgos.length > 0) {
              // Solo riesgos
              riesgosRelevantes = riesgos.join(', ');
            }
            
            grouped[uniqueKey].items.push({
              supuesto: displayKey,
              riesgosRelevantes: riesgosRelevantes,
              lugar: causa.lugar || '',
              accionProbabilidad: causa.accionProbabilidad || '',
              accionExposicion: causa.accionExposicion || '',
              accionConsecuencias: causa.accionConsecuencias || ''
            });
          });
        }
      });
    });
    
    // Convertir a array plano con información de rowspan
    const result = [];
    Object.entries(grouped).forEach(([uniqueKey, group]) => {
      group.items.forEach((item, index) => {
        result.push({
          supuesto: index === 0 ? group.displayKey : null,
          supuestoRowspan: index === 0 ? group.items.length : 0,
          ...item
        });
      });
    });
    
    return result;
  };

  // En el componente PrintView, agrega un useEffect para cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handlePrint = () => {
    // Create a new window/iframe for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    // Crear contenido de impresión con tamaños personalizados de imágenes
    const printContent = printRef.current.cloneNode(true);
    
    // Actualizar tamaños de imágenes en el contenido de impresión
    const images = printContent.querySelectorAll('.weather-image-container img');
    images.forEach((img, index) => {
      const size = getImageSize(index);
      img.style.width = `${size}px`;
      img.style.height = 'auto';
    });
    
    // Remover controles de redimensionamiento del contenido de impresión
    const controls = printContent.querySelectorAll('.image-controls');
    controls.forEach(control => control.remove());
    
    const finalPrintContent = printContent.innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Aviso de Salida - ${formData.basicInfo.cerroOSector || 'Montaña'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 16px;
              line-height: 1.5;
              color: #000;
              background: white;
            }
            
            .print-content {
              padding: 15mm;
              max-width: none;
              width: 100%;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
            }
            
            .logo img {
              height: 64px;
              width: auto;
            }
            
            .title {
              flex-grow: 1;
              text-align: center;
              padding: 0 20px;
            }
            
            .title h1 {
              font-size: 18px;
              font-weight: bold;
              margin: 0;
            }
            
            .contact-box {
              width: 45mm;
              border: 1px solid #000;
              padding: 4px;
              font-size: 6px;
            }
            
            .contact-item {
              margin-bottom: 4px;
              font-size: 13px;
            }
            
            .section {
              margin-bottom: 15px;
            }
            
            .section h2 {
              font-size: 14px;
              font-weight: bold;
              margin: 0 0 8px 0;
            }
            
            .section h2.centered {
              text-align: center;
              font-size: 12px;
              margin-bottom: 15px;
            }
            
            .activity-details {
              font-size: 14px;
            }
            
            .detail-row {
              display: flex;
              margin-bottom: 3px;
            }
            
            .label {
              width: 45mm;
              font-weight: normal;
            }
            
            .value {
              flex-grow: 1;
            }
            
            .data-table {
              width: 100%;
              border-collapse: collapse;
              font-size: 13px;
              margin-bottom: 10px;
            }
            
            .data-table th,
            .data-table td {
              border: 1px solid #000;
              padding: 2px;
              text-align: left;
              vertical-align: top;
            }
            
            .data-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            
            .medical-table {
              font-size: 12px;
            }
            
            .medical-table th,
            .medical-table td {
              padding: 1px;
            }
            
            .weather-images {
              margin-bottom: 10px;
            }
            
            .weather-image {
              margin-bottom: 10px;
              page-break-inside: avoid;
            }
            
            .weather-image-container img {
              height: auto;
              object-fit: contain;
              border: 1px solid #ddd;
              display: block;
            }
            
            .empty-weather,
            .empty-section {
              padding: 10px;
              background-color: #f9f9f9;
              border: 1px dashed #ccc;
              text-align: center;
              margin-bottom: 10px;
            }
            
            .emergency-contacts-box {
              border: 1px solid #000;
              padding: 5px;
              font-size: 13px;
            }
            
            .emergency-contacts p {
              margin: 2px 0;
            }
            
            .responsibility-list {
              font-size: 13px;
              padding-left: 20px;
            }
            
            .responsibility-list li {
              margin-bottom: 5px;
            }
            
            .protocol-section h3 {
              font-size: 13px;
              font-weight: bold;
              margin-top: 10px;
              margin-bottom: 5px;
            }
            
            .protocol-list {
              font-size: 12px;
              padding-left: 20px;
            }
            
            .protocol-list li {
              margin-bottom: 3px;
              text-align: justify;
            }
            
            .footer {
              margin-top: 20px;
              font-size: 12px;
            }
            
            @page {
              margin: 15mm;
              size: A4;
            }
            
            @media print {
              .print-content {
                padding: 0;
              }
              
              .empty-weather,
              .empty-section {
                background-color: transparent;
                border: 1px dashed #999;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-content">
            ${finalPrintContent}
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for images to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('es-CL', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatItineraryDate = (dateString) => {
    if (!dateString) return '';
    // dateString is a date-only value (YYYY-MM-DD); parsing it directly would
    // be interpreted as UTC midnight and can roll back a day in local time.
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const defaultEquipment = [
    { item: 'Radio en frecuencia CAU 145.350', cantidad: '1', descripcion: 'Comunicación de emergencia' },
    { item: 'GPS', cantidad: '1', descripcion: 'Navegación' },
    { item: 'Teléfono', cantidad: '1', descripcion: 'Comunicación' },
    { item: 'Linterna', cantidad: '1', descripcion: 'Iluminación' },
    { item: 'Botiquín', cantidad: '1', descripcion: 'Primeros auxilios' },
    { item: 'Ropa personal', cantidad: '1', descripcion: 'Vestuario técnico' }
  ];

  // Filter only checked equipment, or show default if no equipment is checked
  const checkedEquipment = equipo.filter(item => item.checked);
  const equipmentToShow = checkedEquipment.length > 0 ? checkedEquipment : 
                         (equipo.length === 0 ? defaultEquipment : []);

  // Ensure we always have at least empty rows for transport and participants
  const participantesToShow = participantes.length > 0 ? participantes : [
    { nombre: '', telefono: '', rut: '', contactoEmergencia: '', telefonoEmergencia: '', grupoSanguineo: '', alergias: '', medicamentos: '', enfermedades: '', condicionesEspeciales: '' }
  ];

  const transportToShow = transporte.length > 0 ? transporte : [
    { conductor: '', tipo: '', marca: '', modelo: '', color: '', patente: '', anioVehiculo: '', capacidad: '', distancia: '', huellaCarbono: '' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
      {/* Print Controls - Hidden when printing */}
      <div className="no-print fixed top-6 right-6 z-10">
        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg transition-all duration-200 font-medium text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir Documento
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 shadow-lg transition-all duration-200 font-medium text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cerrar Vista
          </button>
        </div>
      </div>

      {/* Print Content - Continuous Layout */}
      <div className="print-container">
        <div ref={printRef} className="print-content">
          {/* Header */}
          <div className="header">
            <div className="logo">
              <img src="/Logo.png" alt="CAU Logo" className="h-16 w-auto" />
            </div>
            <div className="title">
              <h1>AVISO DE ACTIVIDAD DE MONTAÑA</h1>
            </div>
                        <div className="contact-box">
              <div className="contact-item">
                <strong>Contacto CAU:</strong><br />
                {formData.basicInfo.contactoCAU || ''}<br />
                {formData.basicInfo.telefonoContacto || ''}<br />
                {formData.basicInfo.emailContacto || ''}
              </div>
              <div className="contact-item">
                <strong>Reporte de regreso:</strong><br />
                {new Date(formData.basicInfo.fechaHoraReporteRegreso).toLocaleDateString('es-CL', { 
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <div className="contact-item">
                <strong>Generación:</strong><br />
                {new Date().toLocaleDateString('es-CL', { 
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>

          {/* Activity Details */}
          <div className="section">
            <h2>DETALLES DE LA ACTIVIDAD</h2>
            <div className="activity-details">
              <div className="detail-row">
                <span className="label">ACTIVIDAD:</span>
                <span className="value">{formData.basicInfo.actividad || ''}</span>
              </div>
              <div className="detail-row">
                <span className="label">Nombre cerro o sector:</span>
                <span className="value">{formData.basicInfo.cerroOSector || ''}</span>
              </div>
              <div className="detail-row">
                <span className="label">Ruta:</span>
                <span className="value">{formData.basicInfo.ruta || ''}</span>
              </div>
              <div className="detail-row">
                <span className="label">Link Pronóstico del Tiempo:</span>
                <span className="value">{formData.basicInfo.linkPronostico || ''}</span>
              </div>
              <div className="detail-row">
                <span className="label">Link a la ruta:</span>
                <span className="value">{formData.basicInfo.linkRuta || ''}</span>
              </div>
              {formData.basicInfo.llevaInreach && (
                <>
                  <div className="detail-row">
                    <span className="label">Dispositivo InReach:</span>
                    <span className="value">Sí</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Número InReach:</span>
                    <span className="value">{formData.basicInfo.numeroInreach || ''}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Código InReach:</span>
                    <span className="value">{formData.basicInfo.codigoInreach || ''}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="section">
            <h2>PARTICIPANTES</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>RUT</th>
                  <th>Contacto Emergencia</th>
                  <th>Teléfono Contacto Emergencia</th>
                </tr>
              </thead>
              <tbody>
                {participantesToShow.map((p, index) => (
                  <tr key={index}>
                    <td>{p.nombre || ''}</td>
                    <td>{p.telefono || ''}</td>
                    <td>{p.rut || ''}</td>
                    <td>{p.contactoEmergencia || ''}</td>
                    <td>{p.telefonoEmergencia || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Itinerary - Show even if empty */}
          <div className="section">
            <h2>ITINERARIO</h2>
            {itinerario.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tramo</th>
                    <th>Fecha</th>
                    <th>Actividad</th>
                    <th>Hora Inicio</th>
                    <th>Hora Fin</th>
                    <th>Altitud Inicio (msnm)</th>
                    <th>Altitud Fin (msnm)</th>
                  </tr>
                </thead>
                <tbody>
                  {getGroupedItineraryWithRowspan().map((item, index) => (
                    <tr key={index}>
                      {item.tramo && (
                        <td rowSpan={item.tramoRowspan}>{item.tramo}</td>
                      )}
                      <td>{formatItineraryDate(item.fecha)}</td>
                      <td>{item.actividad}</td>
                      <td>{item.horaInicio}</td>
                      <td>{item.horaFin}</td>
                      <td>{item.altitudInicio || ''}</td>
                      <td>{item.altitudFin || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-section">
                <p className="text-gray-500 italic">No se ha especificado itinerario</p>
              </div>
            )}
          </div>

          {/* Risk Management - Show only detailed risks */}
          <div className="section">
            <h2>GESTIÓN DE RIESGOS</h2>
            
            {/* Riesgos Detallados */}
            {riesgos.length > 0 && (
              <div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Supuesto clave</th>
                      <th>Riesgos relevantes (si no se cumple el supuesto, amenazan a la seguridad y/o a los objetivos)</th>
                      <th>Lugar o coordenadas (WGS 84)</th>
                      <th>Acciones de mitigación de riesgos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getGroupedRisksWithRowspan().map((risk, index) => (
                                              <tr key={index}>
                          {risk.supuesto && (
                            <td rowSpan={risk.supuestoRowspan} style={{ fontWeight: 'bold' }}>{risk.supuesto}</td>
                          )}
                          <td>{risk.riesgosRelevantes || ''}</td>
                          <td>{risk.lugar || ''}</td>
                          <td>{[risk.accionProbabilidad, risk.accionExposicion, risk.accionConsecuencias].filter(action => action && action.trim()).join(' / ') || ''}</td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Weather Forecast with Images */}
          <div className="section">
            <h2>PRONÓSTICO DE TIEMPO</h2>
            {weatherImages.length > 0 ? (
              <div className="weather-images">
                {weatherImages.map((image, index) => (
                  <div 
                    key={index} 
                    className="weather-image-container"
                    onMouseEnter={() => setHoveredImage(index)}
                    onMouseLeave={() => setHoveredImage(null)}
                    style={{ position: 'relative', display: 'inline-block', marginBottom: '20px' }}
                  >
                    <img 
                      src={image.base64 || image.url || image} 
                      alt={`Pronóstico del tiempo ${index + 1}`}
                      style={{
                        width: `${getImageSize(index)}px`,
                        height: 'auto',
                        objectFit: 'contain',
                        border: '1px solid #ddd',
                        display: 'block',
                        transition: 'all 0.2s ease',
                        imageRendering: 'high-quality'
                      }}
                      onLoad={(e) => {
                        // Store natural width to track upscaling
                        const naturalWidth = e.target.naturalWidth;
                        setImageNaturalWidths(prev => ({
                          ...prev,
                          [index]: naturalWidth
                        }));
                        if (naturalWidth < getImageSize(index)) {
                          console.log(`Image ${index + 1} natural width: ${naturalWidth}px, requested: ${getImageSize(index)}px - may appear pixelated`);
                        }
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    
                    {/* Controles de redimensionamiento (estilo PowerPoint) */}
                    {hoveredImage === index && (
                      <div className="image-controls" style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '-10px',
                        background: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 10,
                        minWidth: '200px'
                      }}>
                        <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                          Tamaño de imagen
                          {imageNaturalWidths[index] && getImageSize(index) > imageNaturalWidths[index] && (
                            <span style={{ 
                              color: '#ff6b6b', 
                              fontSize: '10px', 
                              marginLeft: '8px',
                              fontWeight: 'normal'
                            }}>
                              ⚠️ Puede verse pixelada
                            </span>
                          )}
                        </div>
                        
                        {/* Slider para ajustar tamaño */}
                        <div style={{ marginBottom: '8px' }}>
                          <input
                            type="range"
                            min="50"
                            max="680"
                            value={getImageSize(index)}
                            onChange={(e) => updateImageSize(index, parseInt(e.target.value))}
                            style={{ width: '100%' }}
                          />
                          <div style={{ fontSize: '10px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
                            {getImageSize(index)}px
                          </div>
                        </div>
                        
                        {/* Botones de tamaño rápido */}
                        <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => updateImageSize(index, 100)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 100 ? '#007bff' : 'white',
                              color: getImageSize(index) === 100 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            S
                          </button>
                          <button
                            onClick={() => updateImageSize(index, 150)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 150 ? '#007bff' : 'white',
                              color: getImageSize(index) === 150 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            M
                          </button>
                          <button
                            onClick={() => updateImageSize(index, 200)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 200 ? '#007bff' : 'white',
                              color: getImageSize(index) === 200 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            L
                          </button>
                          <button
                            onClick={() => updateImageSize(index, 300)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 300 ? '#007bff' : 'white',
                              color: getImageSize(index) === 300 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            XL
                          </button>
                          <button
                            onClick={() => updateImageSize(index, 450)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 450 ? '#007bff' : 'white',
                              color: getImageSize(index) === 450 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            XXL
                          </button>
                          <button
                            onClick={() => updateImageSize(index, 680)}
                            style={{
                              padding: '2px 4px',
                              fontSize: '9px',
                              border: '1px solid #ccc',
                              borderRadius: '2px',
                              background: getImageSize(index) === 680 ? '#007bff' : 'white',
                              color: getImageSize(index) === 680 ? 'white' : 'black',
                              cursor: 'pointer'
                            }}
                          >
                            MAX
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {(image.name || image.fechaObtencion) && (
                      <div style={{ fontSize: '6px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
                        {image.name && <p style={{ margin: '0 0 2px 0' }}>{image.name}</p>}
                        {image.fechaObtencion && (
                          <p style={{ margin: '0', fontWeight: 'bold' }}>
                            Fecha: {new Date(image.fechaObtencion + 'T00:00:00').toLocaleDateString('es-CL', { month: '2-digit', day: '2-digit' })}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-weather">
                <p className="text-gray-500 italic">No se han adjuntado imágenes del pronóstico del tiempo</p>
              </div>
            )}
          </div>

          {/* Equipment */}
          <div className="section">
            <h2>EQUIPO</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {getGroupedEquipmentWithRowspan().map((item, index) => (
                  <tr key={index}>
                    <td>{item.categoria}</td>
                    <td>{item.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transport */}
          <div className="section">
            <h2>TRANSPORTE</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Conductor</th>
                  <th>Detalles</th>
                  <th>Distancia</th>
                  <th>Huella de Carbono (kg CO2)</th>
                </tr>
              </thead>
              <tbody>
                {transportToShow.map((t, index) => {
                  const isAutoParticular = t.tipo === 'auto particular';
                  const needsVehicleDetails = isAutoParticular || ['bus'].includes(t.tipo?.toLowerCase());
                  
                  let detalles = '';
                  if (needsVehicleDetails) {
                    const parts = [];
                    if (t.marca) parts.push(t.marca);
                    if (t.modelo) parts.push(t.modelo);
                    if (t.color) parts.push(t.color);
                    if (t.patente) parts.push(`(${t.patente})`);
                    if (isAutoParticular && t.anioVehiculo) parts.push(`- ${t.anioVehiculo}`);
                    if (isAutoParticular && t.capacidad) parts.push(`- ${t.capacidad} pasajeros`);
                    detalles = parts.join(' ');
                  } else {
                    detalles = '-';
                  }

                  // Calcular huella por persona si hay capacidad
                  let huellaDisplay = '';
                  if (t.huellaCarbono) {
                    const huellaTotal = parseFloat(t.huellaCarbono);
                    const capacidad = parseInt(t.capacidad);
                    const tipo = t.tipo?.toLowerCase();
                    
                    // Solo calcular por persona para auto particular y bus
                    if ((tipo === 'auto particular' || tipo === 'bus') && capacidad && capacidad > 1) {
                      const huellaPorPersona = (huellaTotal / capacidad).toFixed(2);
                      huellaDisplay = `${t.huellaCarbono} kg CO2 total (${huellaPorPersona} kg CO2/persona)`;
                    } else if (tipo === 'helicóptero' || tipo === 'barco privado') {
                      huellaDisplay = `${t.huellaCarbono} kg CO2 total (transporte privado)`;
                    } else {
                      huellaDisplay = `${t.huellaCarbono} kg CO2 por viaje individual`;
                    }
                  }

                  return (
                    <tr key={index}>
                      <td>{t.tipo || ''}</td>
                      <td>{isAutoParticular ? (t.conductor || '') : '-'}</td>
                      <td>{detalles}</td>
                      <td>{t.distancia ? `${t.distancia} km` : ''}</td>
                      <td>{huellaDisplay}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Medical Data */}
          <div className="section">
            <h2>DATOS MÉDICOS IMPORTANTES</h2>
            <table className="data-table medical-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Enfermedades, alergias a medicamentos, otras alergias</th>
                  <th>Medicamentos habituales</th>
                  <th>Grupo de sangre</th>
                  <th>Enfermedad y lesiones</th>
                  <th>Riesgo / comentarios</th>
                </tr>
              </thead>
              <tbody>
                {participantesToShow.map((p, index) => (
                  <tr key={index}>
                    <td>{p.nombre || ''}</td>
                    <td>{p.alergias || ''}</td>
                    <td>{p.medicamentos || ''}</td>
                    <td>{p.grupoSanguineo || ''}</td>
                    <td>{p.enfermedades || ''}</td>
                    <td>{p.condicionesEspeciales || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Page Break */}
          <div className="page-break-before" style={{ height: '0', pageBreakBefore: 'always', breakBefore: 'page' }}></div>

          {/* Emergency Contacts */}
          <div className="section">
            <h2>CUERPOS DE RESCATE OFICIALES:</h2>
            <div className="emergency-contacts-box">
              <div className="emergency-contacts">
                {cuerposRescate.filter(cuerpo => cuerpo.incluir).map((cuerpo, index) => (
                  <p key={index}>
                    <strong>{cuerpo.nombre}:</strong> {cuerpo.telefono}
                  </p>
                ))}
                {cuerposRescate.filter(cuerpo => cuerpo.incluir).length === 0 && (
                  <p className="text-gray-500 italic">No hay cuerpos de rescate configurados</p>
                )}
              </div>
            </div>
          </div>

          {/* Responsibilities */}
          <div className="section">
            <h2 className="centered">RESPONSABILIDAD DE LA CORDADA</h2>
            <ul className="responsibility-list">
              <li>Hacer su aviso de salida de forma completa y responsable y enviarlo al egroup Montañismo UC</li>
              <li>Buscar alguien responsable y que se encuentre disponible y dispuesto a ejercer la función de Contacto CAU para su salida</li>
              <li>Informar a su contacto CAU sobre los detalles de la salida, su motivación y sus ambiciones</li>
              <li>Tomar decisiones en terreno que respeten la hora de retorno señalada para evitar la activación de los protocolos de emergencia y el gasto de recursos económicos y humanos de forma innecesaria</li>
              <li>Dar aviso de su retorno antes de la hora señalada en el aviso de salida</li>
              <li>En caso de accidente dar primeros auxilios al accidentado y luego comunicarse directamente con el contacto CAU quién activará el protocolo de emergencia.</li>
            </ul>
          </div>

          <div className="section">
            <h2 className="centered">RESPONSABILIDAD DEL CONTACTO CAU</h2>
            <ul className="responsibility-list">
              <li>Informarse de los detalles de la salida de la cordada a monitorear</li>
              <li>Tener conocimiento del protocolo de emergencia a activar en caso de emergencia</li>
              <li>Estar disponible y "contactable" para verificar el retorno o no retorno de la cordada</li>
              <li>Dar aviso del retorno o no retorno de la cordada según corresponda</li>
              <li>En caso de no retorno o accidente confirmado activar el protocolo de emergencia</li>
            </ul>
          </div>

          <div className="section">
            <h2 className="centered">EN CASO DE NO RETORNO O ACCIDENTE CONFIRMADO ACTIVAR EL PROTOCOLO DE EMERGENCIA</h2>
          </div>

          <div className="section">
            <h2>PROTOCOLO DE EMERGENCIA PARA CONTACTO CAU:</h2>
            
            <div className="protocol-section">
              <h3>1. Caso de No Retorno:</h3>
              <ul className="protocol-list">
                <li>Intentar comunicación o seguimiento de la cordada a través del dispositivo InReach y de la página MapShare.</li>
                <li>En caso de no tener información, dar aviso a los cuerpos oficiales de rescate (CSA y GOPE) del no retorno de la cordada entregando toda la información recopilada en el aviso de salida.</li>
                <li>Preguntar a los cuerpos de rescate qué tipo de información, recursos humanos, técnicos o de equipo podría aportar el CAU en el procedimiento.</li>
                <li>Avisar a los contactos de emergencia de la situación, explicándoles que lo más posible es que se trate de un retraso y no de un accidente. Informar que ya se le dio aviso a los cuerpos de rescate y que el CAU está organizándose un grupo de apoyo para lo que sea requerido por los cuerpos de rescate.</li>
                <li>Dar aviso por email al e-group Montañismo UC de la situación y solicitar apoyo de señalada por los cuerpos de rescate.</li>
                <li>El DT se encargará de convocar en primera instancia un grupo de búsqueda que pueda prepararse y permanecer "en espera" en caso de ser requerido.</li>
                <li>Mantener al club informado a través del e-group de los acontecimientos importantes</li>
              </ul>
            </div>

            <div className="protocol-section">
              <h3>2. Caso de Accidente Confirmado</h3>
              <ul className="protocol-list">
                <li>Mantener la calma y obtener información de cómo sucedió el accidente, número de accidentados, lesiones diagnosticadas, ubicación geográfica, la atención de primeros auxilios entregada y de la gravedad de la situación.</li>
                <li>Pedir al que da aviso de accidente que en lo posible permanezca disponible como primera fuente en caso de requerir más información por los cuerpos de rescate.</li>
                <li>Dar aviso a los cuerpos oficiales de rescate (CSA y GOPE) del accidente de la cordada entregando toda la información entregada por la cordada y la recopilada en el aviso de salida.</li>
                <li>Preguntar a los cuerpos de rescate qué tipo de información, recursos humanos, técnicos o de equipo podría aportar el CAU en el procedimiento.</li>
                <li>Avisar a los contactos de emergencia de la situación. Informar que ya se le dio aviso a los cuerpos de rescate y que el CAU está organizándose un grupo de apoyo para lo que sea requerido por los cuerpos de rescate. Mantengán la calma</li>
                <li>Dar aviso por email al e-group Montañismo UC de la situación y solicitar apoyo de señalada por los cuerpos de rescate.</li>
                <li>El DT se encargará de convocar en primera instancia un grupo de rescate que pueda prepararse y permanecer "en espera" en caso de ser requerido.</li>
                <li>Mantener al club informado a través del e-group de los acontecimientos importantes</li>
              </ul>
            </div>
          </div>

          <div className="footer">
            <span>{new Date().toLocaleDateString('es-CL', { month: '2-digit', day: '2-digit' })}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .no-print {
          display: block;
        }

        .print-container {
          max-width: 210mm;
          margin: 20px auto;
          background: white;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          border: 2px solid #ccc;
          min-height: calc(100vh - 40px);
        }

        .print-content {
          padding: 15mm;
          font-family: Arial, sans-serif;
          font-size: 10px;
          line-height: 1.2;
          background: white;
          min-height: 100%;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          position: relative;
        }

        .logo {
          flex-shrink: 0;
        }

        .title {
          flex-grow: 1;
          text-align: center;
          padding: 0 20px;
        }

        .title h1 {
          font-size: 14px;
          font-weight: bold;
          margin: 0;
        }

        .contact-box {
          width: 45mm;
          border: 1px solid #000;
          padding: 4px;
          font-size: 6px;
          flex-shrink: 0;
        }

        .contact-item {
          margin-bottom: 3px;
        }

        .section {
          margin-bottom: 15px;
        }

        .section h2 {
          font-size: 10px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }

        .section h2.centered {
          text-align: center;
          font-size: 12px;
          margin-bottom: 15px;
        }

        .activity-details {
          font-size: 8px;
        }

        .detail-row {
          display: flex;
          margin-bottom: 3px;
        }

        .label {
          width: 45mm;
          font-weight: normal;
        }

        .value {
          flex-grow: 1;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7px;
          margin-bottom: 10px;
        }

        .data-table th,
        .data-table td {
          border: 1px solid #000;
          padding: 2px;
          text-align: left;
          vertical-align: top;
        }

        .data-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }

        .medical-table {
          font-size: 6px;
        }

        .medical-table th,
        .medical-table td {
          padding: 1px;
        }

        .weather-images {
          margin-bottom: 10px;
        }

        .weather-image-container img {
          height: auto;
          object-fit: contain;
          border: 1px solid #ddd;
        }

        .empty-weather,
        .empty-section {
          padding: 10px;
          background-color: #f9f9f9;
          border: 1px dashed #ccc;
          text-align: center;
          margin-bottom: 10px;
        }

        .responsibility-list {
          font-size: 9px;
          padding-left: 20px;
        }

        .responsibility-list li {
          margin-bottom: 5px;
        }

        .emergency-contacts {
          font-size: 8px;
        }

        .emergency-contacts p {
          margin: 2px 0;
        }

        .footer {
          margin-top: 20px;
          font-size: 8px;
        }

        .page-break-before {
          break-before: page !important;
          page-break-before: always !important;
          height: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .emergency-contacts-box {
          border: 1px solid #000;
          padding: 5px;
          font-size: 7px;
        }

        .protocol-section h3 {
          font-size: 9px;
          font-weight: bold;
          margin-top: 10px;
          margin-bottom: 5px;
        }

        .protocol-list {
          font-size: 8px;
          padding-left: 20px;
        }

                 .protocol-list li {
           margin-bottom: 3px;
           text-align: justify;
         }

         @media print {
          .no-print {
            display: none !important;
          }

          .print-container {
            max-width: none !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            min-height: auto !important;
          }

          .print-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-height: auto !important;
          }

          .empty-weather,
          .empty-section {
            background-color: transparent !important;
            border: 1px dashed #999 !important;
          }

          .emergency-contacts-box {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .data-table {
            page-break-inside: auto !important;
            width: 100% !important;
          }

          .data-table th,
          .data-table td {
            border: 1px solid #000 !important;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          .section {
            page-break-inside: auto !important;
            margin-bottom: 15px !important;
          }

          .page-break-before {
            break-before: page !important;
            page-break-before: always !important;
          }

          .protocol-section {
            page-break-inside: avoid !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }

          html {
            width: 100% !important;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          @page {
            margin: 15mm !important;
            size: A4 !important;
          }
        }
      `}</style>
    </div>
  );
} 