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

                const canvasHeight = isMobile() ? 400 : 200;
                const salesChartContainer = document.querySelector("#salesChartContainer");
                $(salesChartContainer).empty().append(`<canvas id="salesChart" width="400" height="${canvasHeight}"></canvas>`);

                const yearSelect = document.getElementById('yearSelect');
                if (yearSelect) {
                    const startYear = 2025;
                    const currentYear = new Date().getFullYear();

                    // Generar opciones de año dinámicamente
                    for (let year = startYear; year <= currentYear; year++) {
                        const option = document.createElement('option');
                        option.value = year;
                        option.textContent = year;
                        yearSelect.appendChild(option);
                    }

                    // Establecer el año actual como seleccionado por defecto
                    yearSelect.value = currentYear.toString();

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

                    fetchReport(yearSelect.value);

                    // Escuchar cambios en el selector
                    yearSelect.addEventListener('change', function() {
                        const selectedYear = this.value ? parseInt(this.value) : 0; 
                        console.log(selectedYear); 
                        fetchReport(this.value); 
                    });
                } else {
                    console.error('Elemento con ID "yearSelect" no encontrado');
                    $('#totalSales').text('$0'); // Valor por defecto
                    $('#totalEvents').text('0');
                    drawChart([]); // Dibujar gráfico vacío
                }
            } catch (error) {
                console.error("Error:", error);
            }
            
        },


        configController: async () => {
          const isDarkMode = getTheme();

          // Configurar tema oscuro
          const switchDarkModeChecked = document.querySelector("#switchDarkModeChecked");
          switchDarkModeChecked.checked = isDarkMode;
          switchDarkModeChecked.addEventListener("change", function(e) {
            localStorage.setItem("dark-mode", e.target.checked ? "true" : "false");
            themeConfig(e.target.checked);
          });

            // Cargar ambos modales createPackageModal.component.html
            const [locationModalHTML, characterModalHTML, productModalHTML, packageModalHTML, categoryModalHTML, productPartyModalHTML] = await Promise.all([
                fetch("components/utils/createLocationModal.component.html").then(r => r.text()),
                fetch("components/utils/charactersModal.component.html").then(r => r.text()),
                fetch("components/utils/createProductModal.component.html").then(r => r.text()),
                fetch("components/utils/createPackageModal.component.html").then(r => r.text()),
                fetch("components/utils/createCategoryModal.component.html").then(r => r.text()),
                fetch("components/utils/createProductPartyModal.component.html").then(r => r.text())
            ]);
            document.getElementById("modal-outlet").innerHTML = locationModalHTML + characterModalHTML + productModalHTML + packageModalHTML + categoryModalHTML + productPartyModalHTML;   

          // Funciones reutilizables
          const getTableConfig = (tableId) => ({
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

 // CRUD Ubicaciones
  try {
    await DOM_CONSTRUCTOR("#locations-table-outlet", "components/utils/locationsTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
    const locations = await getLocationsData(token);
    const tbody = $('#locations-table tbody');
    tbody.empty();

    if (!locations.length) {
      tbody.append(`<tr><td colspan="3" class="text-center">No hay datos disponibles</td></tr>`);
    } else {
      locations.forEach((el, index) => {
        tbody.append(`
          <tr>
            <td class="text-start">${index + 1}</td>
            <td>${el.name}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2 edit-location-btn" data-id="${el.location_id}" data-name="${el.name}"><i class="fa-solid fa-edit"></i></button>
              <button class="btn btn-danger btn-sm delete-location-btn" data-id="${el.location_id}"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>`);
      });
    }

    new DataTable('#locations-table', getTableConfig('locations-table'));

    // Botones de modal ubicación
    document.querySelector('[data-bs-target="#createLocationModal"]')?.addEventListener('click', () => {
      const modal = document.getElementById('createLocationModal');
      if (!modal) return console.error('Modal de ubicación no encontrado');
      document.getElementById('locationId').value = '';
      document.getElementById('locationName').value = '';
      document.getElementById('createLocationModalLabel').textContent = 'Nueva Ubicación';
      document.getElementById('saveLocationBtn').textContent = 'Crear';
      new bootstrap.Modal(modal).show();
    });

    $(document).on('click', '.edit-location-btn', function() {
      const modal = document.getElementById('createLocationModal');
      if (!modal) return console.error('Modal de ubicación no encontrado');
      document.getElementById('locationId').value = $(this).data('id');
      document.getElementById('locationName').value = $(this).data('name');
      document.getElementById('createLocationModalLabel').textContent = 'Editar Ubicación';
      document.getElementById('saveLocationBtn').textContent = 'Guardar';
      new bootstrap.Modal(modal).show();
    });

    $(document).on('click', '.delete-location-btn', function() {
      const id = $(this).data('id');
      if (confirm('¿Estás seguro de que deseas eliminar esta ubicación?')) {
        deleteLocation(id)
          .then(() => window.location.reload())
          .catch(err => {
            console.error(err);
            alert('Error al eliminar la ubicación.');
          });
      }
    });

    document.getElementById('saveLocationBtn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = document.getElementById('locationId').value;
      const name = document.getElementById('locationName').value.trim();
      if (!name) return alert('Por favor, ingresa un nombre.');
      try {
        const modal = bootstrap.Modal.getInstance(document.getElementById('createLocationModal'));
        id ? await updateLocation(id, name) : await createLocation(name);
        if (modal) modal.hide(); // Cerrar el modal solo si está instanciado
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Error al guardar la ubicación.');
      }
    });

    // Manejar el cierre del modal para evitar bloqueos
    const locationModal = document.getElementById('createLocationModal');
    locationModal.addEventListener('hidden.bs.modal', () => {
      try {
        // Limpiar el formulario
        const form = document.getElementById('createLocationForm');
        if (form) form.reset();
        document.getElementById('locationId').value = '';
        document.getElementById('locationName').value = '';
        // Forzar la eliminación de la máscara si persiste
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) backdrop.remove();
      } catch (err) {
        console.error('Error al limpiar modal de ubicación:', err);
      }
    });
  } catch (err) {
    console.error("Error al cargar ubicaciones:", err);
  }

  // CRUD Personajes
  try {
    await DOM_CONSTRUCTOR("#characters-table-outlet", "components/utils/charactersTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
    const characters = await getCharactersData();
    const tbody = $('#characters-table tbody');
    tbody.empty();

    if (!characters.length) {
      tbody.append(`<tr><td colspan="6" class="text-center">No hay personajes disponibles</td></tr>`);
    } else {
      characters.forEach((el, index) => {
        tbody.append(`
          <tr>
            <td class="text-start">${index + 1}</td>
            <td>${el.es_name}</td>
            <td>${el.en_name}</td>
            <td>$${parseFloat(el.price_hours).toFixed(2)}</td>
            <td>${el.is_active == 1 ? "Sí" : "No"}</td>
            <td>
              <button class="btn btn-warning btn-sm me-2 edit-character-btn" data-id="${el.character_id}" data-es-name="${el.es_name}" data-en-name="${el.en_name}" data-price-hours="${el.price_hours}" data-is-active="${el.is_active}"><i class="fa-solid fa-edit"></i></button>
              <button class="btn btn-danger btn-sm delete-character-btn" data-id="${el.character_id}"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>`);
      });
    }

    new DataTable('#characters-table', getTableConfig('characters-table'));

    // Crear personaje
    document.getElementById('createCharacterBtn')?.addEventListener('click', () => {
      const modal = document.getElementById('charactersModal');
      if (!modal) return console.error('Modal de personajes no encontrado');
      ['characterIdInput','esNameInput','enNameInput','priceHoursInput','isActiveInput'].forEach(id => document.getElementById(id).value = '');
      document.getElementById('charactersModalTitle').textContent = 'Nuevo Personaje';
      document.getElementById('saveCharacterButton').textContent = 'Crear';
      new bootstrap.Modal(modal).show();
    });

    $(document).on('click', '.edit-character-btn', function () {
      const modal = document.getElementById('charactersModal');
      if (!modal) return console.error('Modal de personajes no encontrado');
      document.getElementById('characterIdInput').value = $(this).data('id');
      document.getElementById('esNameInput').value = $(this).data('es-name');
      document.getElementById('enNameInput').value = $(this).data('en-name');
      document.getElementById('priceHoursInput').value = $(this).data('price-hours');
      document.getElementById('isActiveInput').value = $(this).data('is-active');
      document.getElementById('charactersModalTitle').textContent = 'Editar Personaje';
      document.getElementById('saveCharacterButton').textContent = 'Guardar';
      new bootstrap.Modal(modal).show();
    });

    $(document).on('click', '.delete-character-btn', function () {
      const id = $(this).data('id');
      if (confirm('¿Eliminar personaje?')) {
        deleteCharacter(id)
          .then(() => window.location.reload())
          .catch(err => {
            console.error(err);
            alert('Error al eliminar personaje.');
          });
      }
    });

    document.getElementById('saveCharacterButton')?.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = document.getElementById('characterIdInput').value;
      const es = document.getElementById('esNameInput').value.trim();
      const en = document.getElementById('enNameInput').value.trim();
      const price = parseFloat(document.getElementById('priceHoursInput').value.trim());
      const active = parseInt(document.getElementById('isActiveInput').value);

      if (!es || !en || isNaN(price)) return alert('Completa los campos correctamente.');

      try {
        id ? await updateCharacter(parseInt(id), es, en, price.toFixed(2), active)
           : await createCharacter(es, en, price.toFixed(2), active);
        bootstrap.Modal.getInstance(document.getElementById('charactersModal')).hide();
        window.location.reload();
      } catch (err) {
        console.error(err);
        alert('Error al guardar personaje.');
      }
    });

  } catch (err) {
    console.error("Error al cargar personajes:", err);
  }

// CRUD Productos
try {
    await DOM_CONSTRUCTOR("#products-table-outlet", "components/utils/productsTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
    const products = await getProductsData();
    const tbody = $('#products-table tbody');
    tbody.empty();

    if (!products.length) {
        tbody.append(`<tr><td colspan="9" class="text-center">No hay productos disponibles</td></tr>`);
    } else {
        products.forEach((el, index) => {
            tbody.append(`
                <tr>
                    <td class="text-start">${index + 1}</td>
                    <td>${el.es_name}</td>
                    <td>${el.en_name}</td>
                    <td>${el.es_description}</td>
                    <td>${el.en_description}</td>
                    <td>$${parseFloat(el.price).toFixed(2)}</td>
                    <td>${el.duration_hours}</td>
                    <td>${el.is_active == "1" ? "Sí" : "No"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2 edit-product-btn" 
                            data-id="${el.product_id}" 
                            data-es-name="${el.es_name}" 
                            data-en-name="${el.en_name}" 
                            data-es-desc="${el.es_description}" 
                            data-en-desc="${el.en_description}" 
                            data-price="${el.price}" 
                            data-duration="${el.duration_hours}" 
                            data-is-active="${el.is_active}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-product-btn" data-id="${el.product_id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`);
        });
    }

    new DataTable('#products-table', getTableConfig('products-table'));

    // Crear producto
    document.getElementById('createProductBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('createProductModal');
        if (!modal) return console.error('Modal de productos no encontrado');
        ['productId', 'esProductName', 'enProductName', 'esProductDesc', 'enProductDesc', 'productPrice', 'productDuration', 'productActive'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('createProductModalLabel').textContent = 'Nuevo Producto';
        document.getElementById('saveProductButton').textContent = 'Crear';
        new bootstrap.Modal(modal).show();
    });

   // Editar producto
    $(document).on('click', '.edit-product-btn', function () {
        const modal = document.getElementById('createProductModal');
        if (!modal) return console.error('Modal de productos no encontrado');
        document.getElementById('productId').value = $(this).data('id');
        document.getElementById('esProductName').value = $(this).data('es-name');
        document.getElementById('enProductName').value = $(this).data('en-name');
        document.getElementById('esProductDesc').value = $(this).data('es-desc');
        document.getElementById('enProductDesc').value = $(this).data('en-desc');
        document.getElementById('productPrice').value = $(this).data('price');
        document.getElementById('productDuration').value = $(this).data('duration');
        document.getElementById('productActive').value = $(this).data('is-active');
        document.getElementById('createProductModalLabel').textContent = 'Editar Producto';
        document.getElementById('saveProductButton').textContent = 'Guardar';
        new bootstrap.Modal(modal).show();
    });

    // Eliminar producto
    $(document).on('click', '.delete-product-btn', function () {
        const id = $(this).data('id');
        if (confirm('¿Eliminar producto?')) {
            deleteProduct(id)
                .then(response => {
                    if (response.code === 200) {
                        alert('Producto eliminado exitosamente.');
                        window.location.reload();
                    } else {
                        alert(response.message || 'Error al eliminar el producto');
                        window.location.reload();
                    }
                })
                .catch(err => {
                    console.error(err);
                    alert('Error al eliminar producto');
                    window.location.reload();
                });
        }
    });

    // Guardar producto
    document.getElementById('saveProductButton')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productId').value;
        const esName = document.getElementById('esProductName').value.trim();
        const enName = document.getElementById('enProductName').value.trim();
        const esDesc = document.getElementById('esProductDesc').value.trim();
        const enDesc = document.getElementById('enProductDesc').value.trim();
        const price = parseFloat(document.getElementById('productPrice').value.trim());
        const duration = parseInt(document.getElementById('productDuration').value.trim());
        const isActive = parseInt(document.getElementById('productActive').value);

        if (!esName || !enName || !esDesc || !enDesc || isNaN(price) || isNaN(duration)) {
            return alert('Completa los campos correctamente.');
        }

        try {
            let response;
            if (id) {
                response = await updateProduct(id, esName, enName, esDesc, enDesc, price.toFixed(2), duration, isActive);
            } else {
                response = await createProduct(esName, enName, esDesc, enDesc, price.toFixed(2), duration, "imagen", isActive);
            }
            if (response.code === 200) {
                alert('Producto guardado exitosamente.');
                window.location.reload();
            } else {
                throw new Error(response.message || 'Error al guardar el producto.');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error al guardar producto.');
            window.location.reload();
        }
    });

} catch (err) {
    console.error("Error al cargar productos:", err);
    $('#products-table tbody').empty().append(
        `<tr><td colspan="9" class="text-center">Error al cargar los productos</td></tr>`
    );
}

            // CRUD Paquetes
            try {
                await DOM_CONSTRUCTOR("#packages-table-outlet", "components/utils/packageTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
                const packages = await getPackagesData();
                const tbody = $('#packages-table tbody');
                tbody.empty();

                if (!packages.length) {
                    tbody.append(`<tr><td colspan="10" class="text-center">No hay paquetes disponibles</td></tr>`);
                } else {
                    packages.forEach((el, index) => {
                        const productNames = el.products.map((product, idx) => `${idx + 1}. ${product.es_name}`).join(', ');
                        tbody.append(`
                            <tr>
                                <td class="text-start">${index + 1}</td>
                                <td>${el.es_package_name}</td>
                                <td>${el.en_package_name}</td>
                                <td>$${parseFloat(el.total_price).toFixed(2)}</td>
                                <td>${el.duration_hours}</td>
                                <td>${el.es_description.replace(/\n/g, ' ').replace(/,\s+/g, ', ')}</td>
                                <td>${el.en_description.replace(/\n/g, ' ').replace(/,\s+/g, ', ')}</td>
                                <td>${productNames}</td>
                                <td>${el.is_active == "1" ? "Sí" : "No"}</td>
                                <td>
                                    <button class="btn btn-warning btn-sm me-2 edit-package-btn" 
                                        data-package-id="${el.package_id}" 
                                        data-es-package-name="${el.es_package_name}" 
                                        data-en-package-name="${el.en_package_name}" 
                                        data-total-price="${el.total_price}" 
                                        data-duration-hours="${el.duration_hours}" 
                                        data-es-description="${el.es_description}" 
                                        data-en-description="${el.en_description}" 
                                        data-is-active="${el.is_active}">
                                        <i class="fa-solid fa-edit"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm delete-package-btn" data-package-id="${el.package_id}">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>`);
                    });
                }

                new DataTable('#packages-table', getTableConfig('packages-table'));

                // Cargar productos disponibles en el select
                const products = await getProductsData();
                const productSelect = document.getElementById('productSelect');
                productSelect.innerHTML = '<option value="">Seleccione un producto</option>';
                products.forEach(product => {
                    const option = document.createElement('option');
                    option.value = product.product_id;
                    option.textContent = product.es_name;
                    productSelect.appendChild(option);
                });

                // Manejar agregar productos al paquete
                const selectedProductsList = document.getElementById('selectedProducts');
                const addProductBtn = document.getElementById('addProductBtn');

                addProductBtn.addEventListener('click', () => {
                    const productId = productSelect.value;

                    if (productId) {
                        const product = products.find(p => p.product_id == productId);
                        if (product) {
                            const listItem = document.createElement('li');
                            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                            listItem.dataset.productId = productId;
                            listItem.dataset.quantity = 1; // Cantidad por defecto
                            listItem.innerHTML = `
                                ${product.es_name} (Cantidad: 1)
                                <button type="button" class="btn btn-danger btn-sm remove-product-btn">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            `;
                            selectedProductsList.appendChild(listItem);

                            // Limpiar selección
                            productSelect.value = '';
                        }
                    }
                });

                // Manejar eliminación de productos seleccionados
                selectedProductsList.addEventListener('click', (e) => {
                    if (e.target.classList.contains('remove-product-btn') || e.target.classList.contains('fa-trash')) {
                        e.target.closest('li').remove();
                    }
                });

                // Manejar guardar paquete (crear o actualizar)
                let isEditing = false;
                let editingPackageId = null;

                document.getElementById('savePackageButton').addEventListener('click', async () => {
                    const form = document.getElementById('createPackageForm');
                    if (form.checkValidity()) {
                        const selectedProducts = Array.from(selectedProductsList.children).map(item => ({
                            product_id: item.dataset.productId,
                            quantity: parseInt(item.dataset.quantity)
                        }));

                        // Validar que haya al menos un producto
                        if (selectedProducts.length === 0) {
                            alert('Debe agregar al menos un producto al paquete.');
                            return;
                        }

                        const packageData = {
                            package_id: isEditing ? editingPackageId : undefined,
                            es_package_name: document.getElementById('esPackageName').value.trim(),
                            en_package_name: document.getElementById('enPackageName').value.trim(),
                            total_price: parseFloat(document.getElementById('totalPrice').value.trim()),
                            duration_hours: parseInt(document.getElementById('durationHours').value.trim()),
                            es_description: document.getElementById('esDescription').value.trim(),
                            en_description: document.getElementById('enDescription').value.trim(),
                            image_url: "imagen",
                            allows_character_selection: 1,
                            is_active: parseInt(document.getElementById('isActive').value),
                            products: selectedProducts
                        };

                        try {
                            let response;
                            if (isEditing) {
                                response = await updatePackage(packageData);
                            } else {
                                response = await createPackage(packageData);
                            }
                            if (response.code === 200) {
                                alert(`${isEditing ? 'Paquete actualizado' : 'Paquete creado'} exitosamente.`);
                                window.location.reload();
                            } else {
                                throw new Error(response.message || `Error al ${isEditing ? 'actualizar' : 'crear'} el paquete`);
                            }
                        } catch (err) {
                            console.error(err);
                            alert(err.message || `Error al ${isEditing ? 'actualizar' : 'crear'} paquete.`);
                            window.location.reload();
                        }
                    } else {
                        form.reportValidity();
                    }
                });

                // Manejar edición de paquete
                document.querySelectorAll('.edit-package-btn').forEach(button => {
                    button.addEventListener('click', async () => {
                        isEditing = true;
                        editingPackageId = parseInt(button.getAttribute('data-package-id'));
                        document.getElementById('createPackageForm').reset();
                        selectedProductsList.innerHTML = '';

                        // Llenar el formulario con los datos del paquete
                        document.getElementById('esPackageName').value = button.getAttribute('data-es-package-name');
                        document.getElementById('enPackageName').value = button.getAttribute('data-en-package-name');
                        document.getElementById('totalPrice').value = button.getAttribute('data-total-price');
                        document.getElementById('durationHours').value = button.getAttribute('data-duration-hours');
                        document.getElementById('esDescription').value = button.getAttribute('data-es-description');
                        document.getElementById('enDescription').value = button.getAttribute('data-en-description');
                        document.getElementById('isActive').value = button.getAttribute('data-is-active');

                        // Obtener productos del paquete
                        try {
                            const packageProducts = await getPackageProducts();
                            const packageProductData = packageProducts.filter(p => parseInt(p.package_id) === editingPackageId);
                            if (!packageProductData || packageProductData.length === 0) {
                                throw new Error('No se encontraron productos para este paquete');
                            }

                            // Agregar los productos del paquete al modal
                            packageProductData.forEach(product => {
                                const listItem = document.createElement('li');
                                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                                listItem.dataset.productId = product.product_id;
                                listItem.dataset.quantity = parseInt(product.quantity); // Usar la cantidad del JSON
                                listItem.innerHTML = `
                                    ${product.product_name_es} (Cantidad: ${product.quantity})
                                    <button type="button" class="btn btn-danger btn-sm remove-product-btn">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                `;
                                selectedProductsList.appendChild(listItem);
                            });
                        } catch (err) {
                            console.error("Error al cargar productos del paquete:", err);
                            alert('Error al cargar los productos del paquete.');
                        }

                        // Abrir el modal
                        new bootstrap.Modal(document.getElementById('createPackageModal')).show();
                    });
                });

                // Manejar eliminación de paquete
                document.querySelectorAll('.delete-package-btn').forEach(button => {
                    button.addEventListener('click', async () => {
                        const packageId = parseInt(button.getAttribute('data-package-id'));
                        if (confirm(`¿Estás seguro de eliminar el paquete con ID: ${packageId}?`)) {
                            try {
                                const response = await deletePackage({ package_id: packageId });
                                if (response.code === 200) {
                                    alert('Paquete eliminado exitosamente.');
                                    window.location.reload();
                                } else {
                                    throw new Error(response.message || 'Error al eliminar el paquete');
                                }
                            } catch (err) {
                                console.error(err);
                                alert(err.message || 'Error al eliminar paquete.');
                                window.location.reload();
                            }
                        }
                    });
                });

                // Abrir modal al hacer clic en el botón
                document.getElementById('createPackageBtn').addEventListener('click', () => {
                    isEditing = false;
                    editingPackageId = null;
                    document.getElementById('createPackageForm').reset();
                    selectedProductsList.innerHTML = '';
                    new bootstrap.Modal(document.getElementById('createPackageModal')).show();
                });

            } catch (err) {
                console.error("Error al cargar paquetes:", err);
                $('#packages-table tbody').empty().append(
                    `<tr><td colspan="10" class="text-center">Error al cargar los paquetes</td></tr>`
                );
            }

// CRUD Categorías
try {
    await DOM_CONSTRUCTOR("#categories-table-outlet", "components/utils/categoryTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
    const categories = await getCategoriesData();
    const tbody = $('#categories-table tbody');
    tbody.empty();

    if (!categories.length) {
        tbody.append(`<tr><td colspan="5" class="text-center">No hay categorías disponibles</td></tr>`);
    } else {
        categories.forEach((el, index) => {
            tbody.append(`
                <tr>
                    <td class="text-start">${index + 1}</td>
                    <td>${el.name_category_es}</td>
                    <td>${el.name_category_en}</td>
                    <td>${el.is_active == "1" ? "Sí" : "No"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2 edit-category-btn" 
                            data-id="${el.id}" 
                            data-es-name="${el.name_category_es}" 
                            data-en-name="${el.name_category_en}" 
                            data-is-active="${el.is_active}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-category-btn" data-id="${el.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`);
        });
    }

    new DataTable('#categories-table', getTableConfig('categories-table'));

    // Crear categoría
    document.getElementById('createCategoryBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('createCategoryModal');
        if (!modal) return console.error('Modal de categorías no encontrado');
        ['categoryId', 'esCategoryName', 'enCategoryName', 'categoryActive'].forEach(id => document.getElementById(id).value = '');
        document.getElementById('createCategoryModalLabel').textContent = 'Nueva Categoría';
        document.getElementById('saveCategoryButton').textContent = 'Crear';
        new bootstrap.Modal(modal).show();
    });

    // Editar categoría
    $(document).on('click', '.edit-category-btn', function () {
        const modal = document.getElementById('createCategoryModal');
        if (!modal) return console.error('Modal de categorías no encontrado');
        document.getElementById('categoryId').value = $(this).data('id');
        document.getElementById('esCategoryName').value = $(this).data('es-name');
        document.getElementById('enCategoryName').value = $(this).data('en-name');
        document.getElementById('categoryActive').value = $(this).data('is-active');
        document.getElementById('createCategoryModalLabel').textContent = 'Editar Categoría';
        document.getElementById('saveCategoryButton').textContent = 'Guardar';
        new bootstrap.Modal(modal).show();
    });


$(document).on('click', '.delete-category-btn', function () {
    const id = $(this).data('id');
    if (confirm('¿Eliminar categoría?')) {
        deleteCategory(id)
            .then(response => {
                alert(response.message || 'Categoría eliminada exitosamente.');
                window.location.reload();
            })
            .catch(err => {
                console.error('Error al procesar eliminación:', err);
                alert('Error al eliminar categoría: ' + (err.message || 'Intenta de nuevo'));
                window.location.reload();
            });
    }
});

    // Guardar categoría
    document.getElementById('saveCategoryButton')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = document.getElementById('categoryId').value;
        const esName = document.getElementById('esCategoryName').value.trim();
        const enName = document.getElementById('enCategoryName').value.trim();
        const isActive = parseInt(document.getElementById('categoryActive').value);

        if (!esName || !enName) {
            return alert('Completa los campos correctamente.');
        }

        try {
            let response;
            if (id) {
                response = await updateCategory(id, esName, enName, isActive);
            } else {
                response = await createCategory(esName, enName, isActive);
            }
            if (response.code === 200) {
                alert('Categoría guardada exitosamente.');
                window.location.reload();
            } else {
                throw new Error(response.message || 'Error al guardar la categoría.');
            }
        } catch (err) {
            console.error(err);
            alert(err.message || 'Error al guardar categoría.');
            window.location.reload();
        }
    });

    // Manejar el cierre del modal
    const categoryModal = document.getElementById('createCategoryModal');
    categoryModal.addEventListener('hidden.bs.modal', () => {
        try {
            const form = document.getElementById('createCategoryForm');
            if (form) form.reset();
            document.getElementById('categoryId').value = '';
            document.getElementById('esCategoryName').value = '';
            document.getElementById('enCategoryName').value = '';
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        } catch (err) {
            console.error('Error al limpiar modal de categoría:', err);
        }
    });
} catch (err) {
    console.error("Error al cargar categorías:", err);
    $('#categories-table tbody').empty().append(
        `<tr><td colspan="5" class="text-center">Error al cargar las categorías</td></tr>`
    );
}

// CRUD Productos Party
try {
    await DOM_CONSTRUCTOR("#product-party-table-outlet", "components/utils/productPartyTable.component.html", [{ theadTheme: isDarkMode ? "table-dark" : "table-light" }]);
    const products = await getProductPartyData();
    const tbody = $('#product-party-table tbody');
    tbody.empty();

    if (!products.length) {
        tbody.append(`<tr><td colspan="7" class="text-center">No hay productos disponibles</td></tr>`);
    } else {
        products.forEach((el, index) => {
            tbody.append(`
                <tr>
                    <td>${index + 1}</td>
                    <td>${el.product_name}</td>
                    <td>${el.name_category_es}</td>
                    <td>${el.price}</td>
                    <td><img src="data:image/jpeg;base64,${el.image}" style="max-width: 50px;" alt="Imagen"></td>
                    <td>${el.is_active == "1" ? "Sí" : "No"}</td>
                    <td>
                        <button class="btn btn-warning btn-sm me-2 edit-product-party-btn" 
                            data-id="${el.id}" 
                            data-id-category="${el.id_category}" 
                            data-product-name="${el.product_name}" 
                            data-price="${el.price}" 
                            data-image="${el.image}" 
                            data-is-active="${el.is_active}">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-product-party-btn" data-id="${el.id}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>`);
        });
    }

    new DataTable('#product-party-table', getTableConfig('product-party-table'));

    // Cargar categorías para el selector
    const categories = await getCategoriesData();
    const categorySelect = document.getElementById('productPartyCategory');
    if (categorySelect) {
        categorySelect.innerHTML = '<option value="">Selecciona una categoría</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name_category_es;
            categorySelect.appendChild(option);
        });
    }

    // Crear producto
    document.getElementById('createProductPartyBtn')?.addEventListener('click', () => {
        const modal = document.getElementById('createProductPartyModal');
        if (!modal) return console.error('Modal de productos no encontrado');
        document.getElementById('productPartyId').value = '';
        document.getElementById('productPartyCategory').value = '';
        document.getElementById('productPartyName').value = '';
        document.getElementById('productPartyPrice').value = '';
        document.getElementById('productPartyImage').value = '';
        document.getElementById('productPartyImagePreview').src = '';
        document.getElementById('productPartyActive').value = '1';
        document.getElementById('createProductPartyModalLabel').textContent = 'Nuevo Producto';
        document.getElementById('saveProductPartyButton').textContent = 'Crear';
        new bootstrap.Modal(modal).show();
    });

    // Editar producto
    $(document).on('change', '#productPartyImage', function () {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('productPartyImagePreview').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    $(document).on('click', '.edit-product-party-btn', function () {
        const modal = document.getElementById('createProductPartyModal');
        if (!modal) return console.error('Modal de productos no encontrado');
        document.getElementById('productPartyId').value = $(this).data('id');
        document.getElementById('productPartyCategory').value = $(this).data('id-category');
        document.getElementById('productPartyName').value = $(this).data('product-name');
        document.getElementById('productPartyPrice').value = $(this).data('price');
        document.getElementById('productPartyImagePreview').src = `data:image/jpeg;base64,${$(this).data('image')}`;
        document.getElementById('productPartyActive').value = $(this).data('is-active');
        document.getElementById('createProductPartyModalLabel').textContent = 'Editar Producto';
        document.getElementById('saveProductPartyButton').textContent = 'Guardar';
        new bootstrap.Modal(modal).show();
    });

    // Eliminar producto
    $(document).on('click', '.delete-product-party-btn', function () {
        const id = $(this).data('id');
        if (confirm('¿Eliminar producto?')) {
            deleteProductParty(id)
                .then(response => {
                    alert(response.message || 'Producto eliminado exitosamente.');
                    window.location.reload();
                })
                .catch(err => {
                    console.error('Error al procesar eliminación:', err);
                    alert('Error al eliminar producto: ' + (err.message || 'Intenta de nuevo'));
                    window.location.reload();
                });
        }
    });

    // Guardar producto
    document.getElementById('saveProductPartyButton')?.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = document.getElementById('productPartyId').value;
        const idCategory = document.getElementById('productPartyCategory').value;
        const productName = document.getElementById('productPartyName').value.trim();
        const price = document.getElementById('productPartyPrice').value.trim();
        const imageInput = document.getElementById('productPartyImage');
        let image = document.getElementById('productPartyImagePreview').src.split(',')[1] || '';
        const isActive = parseInt(document.getElementById('productPartyActive').value);

        if (!idCategory || !productName || !price) {
            return alert('Completa los campos requeridos.');
        }

        if (imageInput.files[0]) {
            const reader = new FileReader();
            reader.onload = async function (e) {
                image = e.target.result.split(',')[1];
                try {
                    let response;
                    if (id) {
                        response = await updateProductParty(id, idCategory, productName, price, image, isActive);
                    } else {
                        response = await createProductParty(idCategory, productName, price, image, isActive);
                    }
                    if (response.ok === true) {
                        alert(response.message || 'Producto guardado exitosamente.');
                        window.location.reload();
                    } else {
                        throw new Error(response.error || 'Error al guardar el producto.');
                    }
                } catch (err) {
                    console.error(err);
                    alert(err.message || 'Error al guardar producto.');
                    window.location.reload();
                }
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            try {
                let response;
                if (id) {
                    response = await updateProductParty(id, idCategory, productName, price, image, isActive);
                } else {
                    response = await createProductParty(idCategory, productName, price, image, isActive);
                }
                if (response.ok === true) {
                    alert(response.message || 'Producto guardado exitosamente.');
                    window.location.reload();
                } else {
                    throw new Error(response.error || 'Error al guardar el producto.');
                }
            } catch (err) {
                console.error(err);
                alert(err.message || 'Error al guardar producto.');
                window.location.reload();
            }
        }
    });

    // Manejar el cierre del modal
    const productPartyModal = document.getElementById('createProductPartyModal');
    productPartyModal.addEventListener('hidden.bs.modal', () => {
        try {
            const form = document.getElementById('createProductPartyForm');
            if (form) form.reset();
            document.getElementById('productPartyId').value = '';
            document.getElementById('productPartyImagePreview').src = '';
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) backdrop.remove();
        } catch (err) {
            console.error('Error al limpiar modal de producto:', err);
        }
    });
} catch (err) {
    console.error("Error al cargar productos:", err);
    $('#product-party-table tbody').empty().append(
        `<tr><td colspan="7" class="text-center">Error al cargar los productos</td></tr>`
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

//obtener productos

const getProductsData = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_products.php`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (!response || response.length === 0) {
                reject(new Error('No se encontraron productos'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener productos:", err);
            reject(err);
        });
    });
};

const createProduct = (esName, enName, esDescription, enDescription, price, durationHours, imageUrl, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_products.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                es_name: esName,
                en_name: enName,
                es_description: esDescription,
                en_description: enDescription,
                price: parseFloat(price).toFixed(2),
                duration_hours: parseInt(durationHours),
                image_url: imageUrl,
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al crear el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al crear producto:", err);
            reject(err);
        });
    });
};

// Nueva función para actualizar un producto
const updateProduct = (productId, esName, enName, esDescription, enDescription, price, durationHours, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_products.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                product_id: productId,
                es_name: esName,
                en_name: enName,
                es_description: esDescription,
                en_description: enDescription,
                price: parseFloat(price).toFixed(2),
                duration_hours: parseInt(durationHours),
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al actualizar el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al actualizar producto:", err);
            reject(err);
        });
    });
};

// Nueva función para eliminar un producto
const deleteProduct = (productId) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_products.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId })
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al eliminar el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al eliminar producto:", err);
            reject(err);
        });
    });
};

// Nueva función para obtener los datos de los paquetes
const getPackagesData = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_packages.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (!response || response.length === 0) {
                reject(new Error('No se encontraron paquetes'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener paquetes:", err);
            reject(err);
        });
    });
};

const getPackageProducts = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_package_products.php`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (!response || response.length === 0) {
                reject(new Error('No se encontraron productos de paquetes'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener productos de paquetes:", err);
            reject(err);
        });
    });
};

const createPackage = (packageData) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_packages.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(packageData)
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al crear el paquete'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al crear paquete:", err);
            reject(err);
        });
    });
};
const updatePackage = (packageData) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_packages.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(packageData)
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al actualizar el paquete'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al actualizar paquete:", err);
            reject(err);
        });
    });
};

const deletePackage = (packageData) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_packages.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(packageData)
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al eliminar el paquete'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al eliminar paquete:", err);
            reject(err);
        });
    });
};

const getCategoriesData = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_category.php`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => res.json())
        .then(response => {
            if (!response || response.length === 0) {
                reject(new Error('No se encontraron categorías'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener categorías:", err);
            reject(err);
        });
    });
};

const createCategory = (esName, enName, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_category.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                name_category_es: esName,
                name_category_en: enName,
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al crear la categoría'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al crear categoría:", err);
            reject(err);
        });
    });
};

const updateCategory = (categoryId, esName, enName, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_category.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id: parseInt(categoryId),
                name_category_es: esName,
                name_category_en: enName,
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.code !== 200) {
                reject(new Error(response.message || 'Error al actualizar la categoría'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al actualizar categoría:", err);
            reject(err);
        });
    });
};

const deleteCategory = (categoryId) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_category.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id: parseInt(categoryId) })
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(response => {
            if (response.ok === true) {
                resolve({ code: 200, message: response.message || 'Categoría eliminada' });
            } else {
                reject(new Error(response.error || 'Error al eliminar la categoría'));
            }
        })
        .catch(err => {
            console.error('Error en la solicitud:', err);
            reject(err);
        });
    });
};

// Funciones para manejar productos de fiesta
const getProductPartyData = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_product_party.php`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            if (!res.ok) {
                throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
            }
            return res.json();
        })
        .then(response => {
            if (!response.length) {
                reject(new Error('No se encontraron productos'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al obtener productos:", err);
            reject(err);
        });
    });
};

const createProductParty = (idCategory, productName, price, image, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/create_product_party.php`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id_category: parseInt(idCategory),
                product_name: productName,
                price: parseFloat(price),
                image: image,
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.ok !== true) {
                reject(new Error(response.error || 'Error al crear el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al crear producto:", err);
            reject(err);
        });
    });
};

const updateProductParty = (id, idCategory, productName, price, image, isActive) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/update_product_party.php`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                id: parseInt(id),
                id_category: parseInt(idCategory),
                product_name: productName,
                price: parseFloat(price),
                image: image,
                is_active: parseInt(isActive)
            })
        })
        .then(res => res.json())
        .then(response => {
            if (response.ok !== true) {
                reject(new Error(response.error || 'Error al actualizar el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al actualizar producto:", err);
            reject(err);
        });
    });
};

const deleteProductParty = (id) => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/delete_product_party.php`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id: parseInt(id) })
        })
        .then(res => res.json())
        .then(response => {
            if (response.ok !== true) {
                reject(new Error(response.error || 'Error al eliminar el producto'));
                return;
            }
            resolve(response);
        })
        .catch(err => {
            console.error("Error al eliminar producto:", err);
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
    if (logOutWebBtn) {
        logOutWebBtn.addEventListener("click", modalHandleLogOut);
    }

    const mobLogoutBtn = document.getElementById("mobLogoutBtn");
    if (mobLogoutBtn) {
        mobLogoutBtn.addEventListener("click", modalHandleLogOut);
    }

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