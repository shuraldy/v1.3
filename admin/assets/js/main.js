// data json localhost
const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

//Controller
const Controller = () => {
    return {
        homeController : async() => {
            
            try {
                
                const dataResponse = await getMainData(token);

                const data = [
                    {
                        theadTheme : getTheme() ? "table-dark" : "table-light"
                    }
                ];
                
                await DOM_CONSTRUCTOR("main-table-outlet", "components/utils/mainTable.component.html", data);

                //En caso de que no lleguen datos
                if(dataResponse.length === 0){
                    console.warn("No hay datos para mostrar");
                    return;
                };

                const object = dataResponse; //prod
                //const object = dataTest; //dev
                console.log(object);
                

                let allEvents = object.length;
                let upComingEvents = 0;
                let finishedEvents = 0;                

                //Con datos
                let trElems = "";
                object.forEach(el => {

                    !el.estado ? upComingEvents++ : finishedEvents++;
                    let status = !el.estado ? `<span class="badge text-bg-warning">Pendiente</span>` : `<span class="badge text-bg-success">Finalizado</span>`;

                    trElems += `<tr onclick="location.hash = 'event-detail/${el.id_evento}'"><td>${el.nombre_cliente}</td> <td>${el.fecha_evento}</td>  <td>${el.ciudad}</td> <td>$${el.precio}</td> <td> ${status} </td> </tr>`;
                });

                $("#allEventsTarget").empty().append(allEvents);
                $("#upComingEventsTarget").empty().append(upComingEvents);
                $("#finishedEventsTarget").empty().append(finishedEvents);
                $('tbody').empty().append(trElems);


                new DataTable('#main-table', {
                    responsive: true,
                    order: [],
                    lengthMenu: [
                      [10, 25, 50, -1],
                      [10, 25, 50, 'Todos']
                    ],
                    layout: {
                        topStart: {
                          buttons: [
                            {
                              extend: 'csv',
                              className: 'btn btn-outline-secondary btn-sm me-2',
                              text: '<i class="fa-solid fa-file-csv"></i> CSV'
                            },
                            {
                              extend: 'excel',
                              className: 'btn btn-outline-success btn-sm me-2',
                              text: '<i class="fa-solid fa-file-excel"></i> Excel'
                            },
                            {
                              extend: 'pdf',
                              className: 'btn btn-outline-danger btn-sm me-2',
                              text: '<i class="fa-solid fa-file-pdf"></i> PDF'
                            },
                            {
                              extend: 'print',
                              className: 'btn btn-outline-primary btn-sm',
                              text: '<i class="fa-solid fa-print"></i> Imprimir'
                            }
                          ]
                        },
                        bottomStart: 'pageLength',
                        bottomEnd: ['info', 'paging']
                    },
                    language: {
                      decimal: ",",
                      thousands: ".",
                      processing: "Procesando...",
                      search: "Buscar:",
                      lengthMenu: "Mostrar _MENU_ registros",
                      info: "_START_ al _END_ de _TOTAL_ registros",
                      infoEmpty: "Mostrando 0 registros",
                      infoFiltered: "(filtrado de _MAX_ registros totales)",
                      loadingRecords: "Cargando...",
                      zeroRecords: "No se encontraron resultados",
                      emptyTable: "No hay datos disponibles",
                      paginate: {
                        first: `<i class="fa-solid fa-angles-left"></i>`,
                        previous: `<i class="fa-solid fa-angle-left"></i>`,
                        next: `<i class="fa-solid fa-angle-right"></i>`,
                        last: `<i class="fa-solid fa-angles-right"></i>`
                      },
                      aria: {
                        sortAscending: ": activar para ordenar ascendente",
                        sortDescending: ": activar para ordenar descendente"
                      }
                    }
                });



            } catch (error) {
                console.error("Error:", error);
            }
            
        },


        dashboardController: async () => {
            const canvasHeight = isMobile() ? 400 : 200;
            const salesChartContainer = document.querySelector("#salesChartContainer");
            $(salesChartContainer).empty().append(`<canvas id="salesChart" width="400" height="${canvasHeight}"></canvas>`);

            const yearSelect = document.getElementById('yearSelect');
            if (yearSelect) {
                // Obtener el año actual
                const currentYear = new Date().getFullYear().toString();
                
                const options = yearSelect.options;
                for (let i = 0; i < options.length; i++) {
                    if (options[i].value === currentYear) {
                        options[i].selected = true;
                        console.log(currentYear); 
                        break;
                    }
                }

                // Función para obtener el reporte del año, actualizar el gráfico y las cards
                const fetchReport = async (year) => {
                    const id = year ? parseInt(year) : 0; // Convertir a entero o usar 0
                    try {
                        const dataResponse = await getReportYear(id);
                        console.log(dataResponse); // Imprimir los datos obtenidos

                        // Actualizar las cards con los datos del elemento en la posición 12 (Total Año)
                        if (dataResponse && dataResponse.length > 12) {
                            const totalData = dataResponse[12]; // Elemento "Total Año"
                            const totalSales = parseFloat(totalData.total_mensual).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
                            const totalEvents = totalData.cantidad_eventos;
                            $('#totalSales').text(totalSales); // Actualizar Total ventas
                            $('#totalEvents').text(totalEvents); // Actualizar Total eventos
                        } else {
                            $('#totalSales').text('$0'); // Valor por defecto si no hay datos
                            $('#totalEvents').text('0');
                        }

                        // Actualizar el gráfico
                        drawChart(dataResponse);
                    } catch (error) {
                        console.error('Error al obtener el reporte:', error);
                        // Mostrar valores por defecto en caso de error
                        $('#totalSales').text('$0');
                        $('#totalEvents').text('0');
                        drawChart([]); // Dibujar gráfico vacío
                    }
                };

        // Ejecutar la llamada inicial con el valor del selector
        fetchReport(yearSelect.value);

        // Escuchar cambios en el selector
        yearSelect.addEventListener('change', function() {
            const selectedYear = this.value ? parseInt(this.value) : 0; // Convertir a entero o usar 0
            console.log(selectedYear); // Imprimir el año seleccionado
            fetchReport(this.value); // Llamar a la API con el nuevo valor
        });
    } else {
        console.error('Elemento con ID "yearSelect" no encontrado');
        $('#totalSales').text('$0'); // Valor por defecto
        $('#totalEvents').text('0');
        drawChart([]); // Dibujar gráfico vacío
    }
},


configController: async () => {
    const isDarkMode = getTheme();

    // Configuración del interruptor de modo oscuro
    const switchDarkModeChecked = document.querySelector("#switchDarkModeChecked");
    switchDarkModeChecked.checked = isDarkMode;
    switchDarkModeChecked.addEventListener("change", function(e) {
        localStorage.setItem("dark-mode", e.target.checked ? "true" : "false");
        themeConfig(e.target.checked);
    });

    // Cargar el modal (solo la estructura inicial)
    await DOM_CONSTRUCTOR("modal-outlet", "components/utils/createLocationModal.component.html", []);

    // Construir la tabla de ubicaciones
    try {
        const data = [
            {
                theadTheme: isDarkMode ? "table-dark" : "table-light"
            }
        ];

        // Cargar la tabla con placeholders
        await DOM_CONSTRUCTOR("#locations-table-outlet", "components/utils/locationsTable.component.html", data);

        // Obtener los datos de ubicaciones
        const dataResponse = await getLocationsData(token);

        // Limpiar el tbody (eliminar placeholders)
        $('#locations-table tbody').empty();

        // En caso de que no lleguen datos
        if (!dataResponse || dataResponse.length === 0) {
            console.warn("No hay ubicaciones para mostrar");
            $('#locations-table tbody').append(
                `<tr><td colspan="3" class="text-center">No hay datos disponibles</td></tr>`
            );
            return;
        }

        // Construir filas de la tabla con numeración ascendente alineada a la izquierda y acciones
        let trElems = "";
        dataResponse.forEach((el, index) => {
            trElems += `
                <tr>
                    <td class="text-start">${index + 1}</td>
                    <td>${el.name}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2 edit-btn" data-id="${el.location_id}" data-name="${el.name}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-btn" data-id="${el.location_id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`;
        });

        $('#locations-table tbody').append(trElems);

        // Inicializar DataTable
        new DataTable('#locations-table', {
            responsive: true,
            order: [],
            lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'Todos']],
            layout: {
                topStart: {
                    buttons: [
                        { extend: 'csv', className: 'btn btn-outline-secondary btn-sm me-2', text: '<i class="fa-solid fa-file-csv"></i> CSV' },
                        { extend: 'excel', className: 'btn btn-outline-success btn-sm me-2', text: '<i class="fa-solid fa-file-excel"></i> Excel' },
                        { extend: 'pdf', className: 'btn btn-outline-danger btn-sm me-2', text: '<i class="fa-solid fa-file-pdf"></i> PDF' },
                        { extend: 'print', className: 'btn btn-outline-primary btn-sm', text: '<i class="fa-solid fa-print"></i> Imprimir' }
                    ]
                },
                bottomStart: 'pageLength',
                bottomEnd: ['info', 'paging']
            },
            language: {
                decimal: ",",
                thousands: ".",
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "_START_ al _END_ de _TOTAL_ registros",
                infoEmpty: "Mostrando 0 registros",
                infoFiltered: "(filtrado de _MAX_ registros totales)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "No hay datos disponibles",
                paginate: {
                    first: `<i class="fa-solid fa-angles-left"></i>`,
                    previous: `<i class="fa-solid fa-angle-left"></i>`,
                    next: `<i class="fa-solid fa-angle-right"></i>`,
                    last: `<i class="fa-solid fa-angles-right"></i>`
                },
                aria: {
                    sortAscending: ": activar para ordenar ascendente",
                    sortDescending: ": activar para ordenar descendente"
                }
            }
        });

        // Manejar el botón de "Crear Nueva Ubicación"
        const createLocationBtn = document.querySelector('[data-bs-target="#createLocationModal"]');
        if (createLocationBtn) {
            createLocationBtn.addEventListener('click', () => {
                const locationIdInput = document.getElementById('locationId');
                const locationNameInput = document.getElementById('locationName');
                const saveBtn = document.getElementById('saveLocationBtn');
                const modalTitle = document.getElementById('createLocationModalLabel');
                if (locationIdInput && locationNameInput && saveBtn && modalTitle) {
                    locationIdInput.value = '';
                    locationNameInput.value = '';
                    modalTitle.textContent = 'Nueva Ubicación';
                    saveBtn.textContent = 'Crear';
                    new bootstrap.Modal(document.getElementById('createLocationModal')).show();
                } else {
                    console.error('Uno o más elementos del modal no se encontraron');
                }
            });
        }

        // Manejar el botón de editar
        $(document).on('click', '.edit-btn', function() {
            const locationId = $(this).data('id');
            const locationName = $(this).data('name');
            const locationIdInput = document.getElementById('locationId');
            const locationNameInput = document.getElementById('locationName');
            const saveBtn = document.getElementById('saveLocationBtn');
            const modalTitle = document.getElementById('createLocationModalLabel');
            if (locationIdInput && locationNameInput && saveBtn && modalTitle) {
                locationIdInput.value = locationId;
                locationNameInput.value = locationName;
                modalTitle.textContent = 'Editar Ubicación';
                saveBtn.textContent = 'Guardar';
                new bootstrap.Modal(document.getElementById('createLocationModal')).show();
            } else {
                console.error('Uno o más elementos del modal no se encontraron');
            }
        });

        // Manejar el botón de eliminar
        $(document).on('click', '.delete-btn', function() {
            if (confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
                const locationId = $(this).data('id');
                deleteLocation(locationId)
                    .then(() => window.location.reload())
                    .catch(error => {
                        console.error('Error al eliminar ubicación:', error);
                        alert('Error al eliminar la ubicación. Por favor, intenta de nuevo.');
                    });
            }
        });

        // Manejar el botón de guardar (crear/editar)
        const saveLocationBtn = document.getElementById('saveLocationBtn');
        if (saveLocationBtn) {
            saveLocationBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const locationId = document.getElementById('locationId')?.value || '';
                const locationName = document.getElementById('locationName').value.trim();
                if (locationName) {
                    try {
                        if (locationId) {
                            await updateLocation(locationId, locationName);
                            document.getElementById('createLocationModalLabel').textContent = 'Nueva Ubicación';
                            document.getElementById('saveLocationBtn').textContent = 'Crear';
                            document.getElementById('locationId').value = '';
                        } else {
                            await createLocation(locationName);
                        }
                        bootstrap.Modal.getInstance(document.getElementById('createLocationModal')).hide();
                        window.location.reload();
                    } catch (error) {
                        console.error('Error al guardar ubicación:', error);
                        alert('Error al guardar la ubicación. Por favor, intenta de nuevo.');
                    }
                } else {
                    alert('Por favor, ingresa un nombre de ubicación.');
                }
            });
        }
    } catch (error) {
        console.error("Error al cargar ubicaciones:", error);
        $('#locations-table tbody').empty().append(
            `<tr><td colspan="3" class="text-center">Error al cargar los datos</td></tr>`
        );
    }


// Construir la tabla de personajes
try {
    const characterData = [
        {
            theadTheme: isDarkMode ? "table-dark" : "table-light"
        }
    ];

    await DOM_CONSTRUCTOR("#characters-table-outlet", "components/utils/charactersTable.component.html", characterData);

    const charactersResponse = await getCharactersData();

    $('#characters-table tbody').empty();

    if (!charactersResponse || charactersResponse.length === 0) {
        $('#characters-table tbody').append(
            `<tr><td colspan="5" class="text-center">No hay personajes disponibles</td></tr>`
        );
        return;
    }

    let trElems = "";
    charactersResponse.forEach((el, index) => {
        trElems += `
            <tr>
                <td class="text-start">${index + 1}</td>
                <td>${el.es_name}</td>
                <td>${el.en_name}</td>
                <td>$${parseFloat(el.price_hours).toFixed(2)}</td>
                <td>${el.is_active === "1" ? "Sí" : "No"}</td>
            </tr>`;
    });

    $('#characters-table tbody').append(trElems);

    new DataTable('#characters-table', {
        responsive: true,
        order: [],
        lengthMenu: [[10, 25, 50, -1], [10, 25, 50, 'Todos']],
        layout: {
            topStart: {
                buttons: [
                    { extend: 'csv', className: 'btn btn-outline-secondary btn-sm me-2', text: '<i class="fa-solid fa-file-csv"></i> CSV' },
                    { extend: 'excel', className: 'btn btn-outline-success btn-sm me-2', text: '<i class="fa-solid fa-file-excel"></i> Excel' },
                    { extend: 'pdf', className: 'btn btn-outline-danger btn-sm me-2', text: '<i class="fa-solid fa-file-pdf"></i> PDF' },
                    { extend: 'print', className: 'btn btn-outline-primary btn-sm', text: '<i class="fa-solid fa-print"></i> Imprimir' }
                ]
            },
            bottomStart: 'pageLength',
            bottomEnd: ['info', 'paging']
        },
        language: {
            decimal: ",",
            thousands: ".",
            processing: "Procesando...",
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "_START_ al _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 registros",
            infoFiltered: "(filtrado de _MAX_ registros totales)",
            loadingRecords: "Cargando...",
            zeroRecords: "No se encontraron resultados",
            emptyTable: "No hay datos disponibles",
            paginate: {
                first: `<i class="fa-solid fa-angles-left"></i>`,
                previous: `<i class="fa-solid fa-angle-left"></i>`,
                next: `<i class="fa-solid fa-angle-right"></i>`,
                last: `<i class="fa-solid fa-angles-right"></i>`
            },
            aria: {
                sortAscending: ": activar para ordenar ascendente",
                sortDescending: ": activar para ordenar descendente"
            }
        }
    });
} catch (error) {
    console.error("Error al cargar personajes:", error);
    $('#characters-table tbody').empty().append(
        `<tr><td colspan="5" class="text-center">Error al cargar los datos</td></tr>`
    );
}
},

        

        eventDetailController: async () => {
            const id = location.hash.substring(1).split("/")[1];
        
            try {
                const dataResponse = await getEventData(parseInt(id));

                console.log(dataResponse);
        
                const isDarkMode = getTheme();

                // Método para formatear hora de 24h a 12h con AM/PM
                const formatTimeTo12Hour = (time) => {
                    if (!time) return "";
                    const [hours, minutes] = time.split(":").map(Number);
                    const period = hours >= 12 ? "PM" : "AM";
                    const adjustedHours = hours % 12 || 12; // Convierte 0 a 12 para medianoche
                    return `${adjustedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
                };
        
                // Procesar descripción del paquete
                const descripcionPaqueteArray = dataResponse.descripcion_paquete
                    ? dataResponse.descripcion_paquete.split(",").map(item => item.trim())
                    : [];
                const descripcionPaqueteHTML = descripcionPaqueteArray.length > 0
                    ? descripcionPaqueteArray
                          .map(item => `<li class="list-group-item border-0 description-package ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">${item}</li>`)
                          .join("")
                    : `<li class="list-group-item border-0 description-package ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">Sin descripción</li>`;
        
                // Procesar productos adicionales
                let productosAdicionalesHTML = `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">Sin productos adicionales</li>`;
                let subtotalProductos = 0;
        
                if (dataResponse.productos_adicionales) {
                    const productosArray = dataResponse.productos_adicionales.split(",").map(item => item.trim());
                    const productosConPrecios = productosArray.map(item => {
                        // Extraer nombre y precio usando una expresión regular
                        const match = item.match(/^(.+)\s\(\$(\d+\.\d{2})\)$/);
                        if (match) {
                            return {
                                nombre: match[1],
                                precio: parseFloat(match[2])
                            };
                        }
                        return null;
                    }).filter(item => item !== null);
        
                    // Generar HTML de la lista
                    productosAdicionalesHTML = productosConPrecios.length > 0
                        ? productosConPrecios
                              .map(item => `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">${item.nombre} - $${item.precio.toFixed(2)}</li>`)
                              .join("")
                        : `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">Sin productos adicionales</li>`;
        
                    // Calcular subtotal
                    subtotalProductos = productosConPrecios.reduce((sum, item) => sum + item.precio, 0);
                }

                // Procesar personajes adicionales

                        let personajesAdicionalesHTML = `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">Sin personajes adicionales</li>`;
                        let subtotalPersonajes = 0;

                        if (dataResponse.personajes_adicionales) {
                            const personajesArray = dataResponse.personajes_adicionales.split(",").map(item => item.trim());
                            const personajesConPrecios = personajesArray.map(item => {
                                const match = item.match(/^(.+)\s\(\$(\d+\.\d{2})\)$/);
                                if (match) {
                                    return {
                                        nombre: match[1],
                                        precio: parseFloat(match[2])
                                    };
                                }
                                return null;
                            }).filter(item => item !== null);

                            personajesAdicionalesHTML = personajesConPrecios.length > 0
                                ? personajesConPrecios
                                    .map(item => `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">${item.nombre} - $${item.precio.toFixed(2)}</li>`)
                                    .join("")
                                : `<li class="list-group-item border-0 ${isDarkMode ? "text-bg-dark" : "text-bg-light"}">Sin personajes adicionales</li>`;

                            subtotalPersonajes = personajesConPrecios.reduce((sum, item) => sum + item.precio, 0);
                        }
        
                const data = [
                    {
                        nombre_cliente: dataResponse.nombre_cliente,
                        correo_cliente: dataResponse.correo_cliente,
                        telefono_cliente: dataResponse.telefono_cliente,
                        button_class: dataResponse.estado === 1 ? "btn btn-success" : "btn btn-warning",
                        button_text: dataResponse.estado === 1 ? "Finalizado" : "Pendiente",
                        button_disabled: dataResponse.estado === 1 ? "disabled" : "",
                        event_id: parseInt(id),
                        nombre_ciudad: dataResponse.nombre_ciudad,
                        direccion_evento: dataResponse.direccion_evento,
                        fecha_evento: dataResponse.fecha_evento,
                        hora_inicio: formatTimeTo12Hour(dataResponse.hora_inicio),
                        hora_fin: formatTimeTo12Hour(dataResponse.hora_fin),
                        duracion_hora: dataResponse.duracion_hora,
                        nombre_personaje_principal: dataResponse.nombre_personaje_principal,
                        precio_evento: dataResponse.precio_evento,
                        valor_paquete: dataResponse.valor_paquete,
                        nombre_paquete: dataResponse.nombre_paquete,
                        productos_adicionales_html: productosAdicionalesHTML,
                        subtotal_productos: subtotalProductos.toFixed(2),
                        personajes_adicionales_html: personajesAdicionalesHTML,
                        subtotal_personajes: subtotalPersonajes.toFixed(2),
                        descripcion_paquete: descripcionPaqueteHTML
                    }
                ];

                // Función para manejar la confirmación del cambio de estado
                    window.confirmStatusChange = async (eventId) => {
                        try {
                            await updateStatusEvent(eventId);
                            const button = document.getElementById("state");
                            button.className = "btn btn-success";
                            button.textContent = "Finalizado";
                            button.disabled = true;
                            const modal = bootstrap.Modal.getInstance(document.getElementById("confirmStatusModal"));
                            modal.hide();
                        } catch (error) {
                            console.error("Error updating status:", error);
                            alert("Error al actualizar el estado. Por favor, intenta de nuevo.");
                        }
                    };

                    document.addEventListener('show.bs.modal', (event) => {
                        if (event.target.id === 'confirmStatusModal') {
                            const button = event.relatedTarget;
                            const eventId = button.getAttribute('data-event-id');
                            const confirmButton = document.getElementById('confirmStatusButton');
                            confirmButton.onclick = () => confirmStatusChange(parseInt(eventId));
                        }
                    });

                await DOM_CONSTRUCTOR("#ed-card1", "components/utils/ed-card1.component.html", data);
                await DOM_CONSTRUCTOR("#ed-card2", "components/utils/ed-card2.component.html", data);
        
        
               
        
        } catch (error) {
                console.error(error);
            };
        }

        
    }

    
};





//config
const CONTROLLER = Controller();
const modalID = "adminModal";
const offcanvasID = "";
const modalComponent = "components/utils/modal.component.html";
const offCanvasComponent = "";
const notFoundComponent = "components/pages/not_found.component.html";
const modalOutlet = "modal-outlet";
const offcanvasOutlet = "offcanvas-outlet";

const routes = [
    {
        path : "",
        component : "components/pages/home.component.html",
        outlet : "content-outlet",
        controller : "homeController"
    },
    {
        path : "dashboard",
        component : "components/pages/dashboard.component.html",
        outlet : "content-outlet",
        controller : "dashboardController"
    },
    {
        path : "config",
        component : "components/pages/config.component.html",
        outlet : "content-outlet",
        controller : "configController"
    },
    {
        path : "event-detail",
        component : "components/pages/event-detail.component.html",
        outlet : "content-outlet",
        controller : "eventDetailController"
    }
];

// services
const loginService = obj => {

    return new Promise((resolve, reject) => {

        fetch(`${API}/login.php`, {
            method : "POST",
            headers : {
                 "Content-Type" : "application/json"
            },
            body : JSON.stringify(obj)
        })
        .then( res => res.json()
        .then( response => {
            if(!response.ok){
                reject(response);
                return
            };
            resolve(response);
         }))
        .catch(err => {
            console.log(err);
            reject(err);
        })
    });

};

const getMainData = token => {

    return new Promise((resolve, reject) => {

        fetch(`${API}/get_all_events.php`, {
            method : "POST",
            headers : {
                 "Content-Type" : "application/json",
                 "Authorization" : `Bearer ${token}`
            }
        })
        .then( res => res.json()
        .then( response => {
            if(!response.ok){
                reject(response);
                return;
            };
            resolve(response.data);

         }))
        .catch(err => {
            console.log(err);
            reject(err);
        })
    });
    
};

//get locations

const getLocationsData = token => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_locations.php`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            // Si el endpoint devuelve directamente el arreglo
            if (Array.isArray(response)) {
                resolve(response);
            } else if (response.ok && response.data) {
                resolve(response.data);
            } else {
                reject(response);
            }
        })
        .catch(err => {
            console.error("Error al obtener ubicaciones:", err);
            reject(err);
        });
    });
};

// Función para crear una nueva ubicación
const createLocation = (name) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_locations.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name: name })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al crear la ubicación'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al crear ubicación:", err);
            reject(err);
        });
    });
};

// Función para actualizar una ubicación
const updateLocation = (locationId, name) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_locations.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ location_id: locationId, name: name })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al actualizar la ubicación'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al actualizar ubicación:", err);
            reject(err);
        });
    });
};

// Función para eliminar una ubicación
const deleteLocation = (locationId) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_locations.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ location_id: locationId })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al eliminar la ubicación'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al eliminar ubicación:", err);
            reject(err);
        });
    });
};

// Función para obtener personajes
const getCharactersData = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_characters2.php`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (!response || response.length === 0) {
                reject(new Error('No se encontraron personajes'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener personajes:", err);
            reject(err);
        });
    });
};

// Función para crear un personaje
const createCharacter = (esName, enName, priceHours, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_characters.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ es_name: esName, en_name: enName, price_hours: priceHours, is_active: isActive })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al crear el personaje'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al crear personaje:", err);
            reject(err);
        });
    });
};

// Función para actualizar un personaje
const updateCharacter = (characterId, esName, enName, priceHours, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_characters.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ character_id: characterId, es_name: esName, en_name: enName, price_hours: priceHours, is_active: isActive })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al actualizar el personaje'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al actualizar personaje:", err);
            reject(err);
        });
    });
};

// Función para eliminar un personaje
const deleteCharacter = (characterId) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_characters.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ character_id: characterId })
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(new Error(response.message || 'Error al eliminar el personaje'));
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.error("Error al eliminar personaje:", err);
            reject(err);
        });
    });
};

const getEventData = id => {

    const data = { event_id : id }
    
    return new Promise((resolve, reject) => {

        fetch(`${API}/get_event.php`, {
            method : "POST",
            headers : {
                 "Content-Type" : "application/json",
                 "Authorization" : `Bearer ${token}`
            },
            body : JSON.stringify(data)
        })
        .then( res => res.json()
        .then( response => {
            if(!response.ok){
                reject(response);
                return;
            };
            resolve(response.data);

         }))
        .catch(err => {
            console.log(err);
            reject(err);
        })
    });
};

const updateStatusEvent = id => {
    const data = { event_id: id };

    return new Promise((resolve, reject) => {
        fetch(`${API}/actualizar_estado.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(response);
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });
};


const getReportYear = id => {


    const data = { anio: id };

    return new Promise((resolve, reject) => {
        fetch(`${API}/reporte_anual.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            if (!response.ok) {
                reject(response);
                return;
            }
            resolve(response.data);
        })
        .catch(err => {
            console.log(err);
            reject(err);
        });
    });
};

// script
const themeConfig = isDarkMode => {
    
    if (isDarkMode) {
        $(".admin-component").removeClass("bg-light").addClass("text-bg-dark");
        $(".main-navbar").removeClass("bg-white").addClass("text-bg-dark");
        $(".screen-container").removeClass("bg-white").addClass("bg-black");
        $(".nav-main-btn").removeClass("btn-light").addClass("btn-dark");
        $("html").attr("data-bs-theme", "dark");
    } else {
        $(".admin-component").addClass("bg-light").removeClass("text-bg-dark");
        $(".main-navbar").addClass("bg-white").removeClass("text-bg-dark");
        $(".screen-container").addClass("bg-white").removeClass("bg-black");
        $(".nav-main-btn").addClass("btn-light").removeClass("btn-dark");
        $("html").attr("data-bs-theme", "");
    }
};

const getTheme = () =>{ return localStorage.getItem("dark-mode") === "true" };

const setMenuActiveItem = path => {

    const menuItems = $(".kl-menu-item");
    $.each(menuItems, function(){
        $(this).removeClass("active");
        
        if($(this).attr("data-path") === path){
            $(this).addClass("active");
            return;
        };
    });
};

const router = async () => {

    const path = location.hash.substring(1).split("/")[0];    
    const route = routes.find( r => r.path === path);    

    if(route === undefined){
        console.warn("Not found : 404");
        await DOM_CONSTRUCTOR("content-outlet", notFoundComponent, []);
        return;
    };

    const isDarkMode = getTheme();

    const data = [
        {
            themeClass : isDarkMode ? "bg-black" : "bg-white",
            cardTheme : isDarkMode ? "text-bg-dark" : "text-bg-light",
        }
    ];

    await DOM_CONSTRUCTOR(route.outlet, route.component, data);
    CONTROLLER[route.controller]();
    setMenuActiveItem(path);
    
};

const handleLogIn = async () => {
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if(username === "" || password === ""){
        console.warn("Campos vacios");
        return
    };

    try {

        const loginServiceResponse = await loginService({username, password});
        const value = {
            username : loginServiceResponse.username,
            token : loginServiceResponse.token
        };
    
        createCookie("session", JSON.stringify(value), "1d");
        location.reload();

    } catch (error) {
        console.warn(error);
    };
};

const handleLogOut = () => {

    history.replaceState(null, null, location.pathname + location.search);
    killCookie();
    location.reload();

};

const modalHandleLogOut = async () => {

    const config = {
        data : [
            {
                title : "Salir",
                body : "<p>¿Cerrar sesión?</p>",
                dissmissBtnText : "Cancelar",
                actionBtnText : "Si, salir",
                actionBtnColor : "danger"
            }
        ]
    };

    await DOM_CONSTRUCTOR(modalOutlet, modalComponent, config.data);

    const myModal = new bootstrap.Modal(`#${modalID}`);
    myModal.toggle();

    const actionBtn = document.getElementById("actionBtn");
    actionBtn.addEventListener("click", handleLogOut);

};

const modalHandleExpiredToken = async () => {

    const config = {
        data : [
            {
                title : "Salir",
                body : "<p>¿Cerrar sesión?</p>",
                dissmissBtnText : "Cancelar",
                actionBtnText : "Si, salir",
                actionBtnColor : "danger"
            }
        ]
    };

    await DOM_CONSTRUCTOR(modalOutlet, modalComponent, config.data);

    const myModal = new bootstrap.Modal(`#${modalID}`);
    myModal.toggle();

    const actionBtn = document.getElementById("actionBtn");
    actionBtn.addEventListener("click", handleLogOut);

};

const setLoginComponent = async () => {

    await DOM_CONSTRUCTOR("admin-outlet", "components/pages/login.component.html", []);

    const adminLoginBtn = document.getElementById("adminLoginBtn");
    adminLoginBtn.addEventListener("click", handleLogIn);

};

const setAdminComponent = async () => {

    token = JSON.parse(getCookieValue()).token;
    await DOM_CONSTRUCTOR("admin-outlet", "components/pages/admin.component.html", []);

    const isDarkMode = getTheme();
    themeConfig(isDarkMode);

    const logOutWebBtn = document.getElementById("logOutWebBtn");
    const menuMobBtn = document.getElementById("menuMobBtn");
    logOutWebBtn.addEventListener("click", modalHandleLogOut);

    menuMobBtn.addEventListener("click", function(){
        console.log("menuMobB");
    });

    router();
    window.addEventListener("hashchange", router);

};



let salesChartInstance = null;

const drawChart = (dataResponse) => {
    const ctx = document.getElementById('salesChart').getContext('2d');
    const isDarkMode = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const lineColor = isDarkMode ? '#0d6efd' : '#000'; // Azul Bootstrap en oscuro, negro en claro

    // Destruir el gráfico anterior si existe
    if (salesChartInstance) {
        salesChartInstance.destroy();
        salesChartInstance = null;
    }

    // Procesar los datos de la API: tomar los primeros 12 elementos (Enero a Diciembre) y parsear total_mensual a entero
    const salesData = dataResponse && dataResponse.length >= 12 
        ? dataResponse.slice(0, 12).map(item => parseInt(parseFloat(item.total_mensual)))
        : new Array(12).fill(0); // Usar ceros si no hay datos válidos

    // Crear el nuevo gráfico
    salesChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
                'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
            ],
            datasets: [{
                label: 'Ventas',
                data: salesData, // Usar los datos procesados de la API
                fill: false,
                borderColor: lineColor,
                backgroundColor: lineColor,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `$${context.parsed.y.toLocaleString()}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    },
                    grid: {
                        color: 'transparent' // Rejilla invisible
                    }
                },
                x: {
                    grid: {
                        color: 'transparent' // Rejilla invisible
                    }
                }
            }
        }
    });
};

// init
(()=>{ !checkCookie() ? setLoginComponent() : setAdminComponent() })();