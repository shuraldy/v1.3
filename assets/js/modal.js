const checkAvailabilityAction = () => {    

    const dt = document.querySelector("#dt");
    const dtValue = dt.value;
    const locationSelect = document.querySelector("#locationSelect");
    const locationSelectValue = locationSelect.value;    
    if(dtValue === "" || locationSelectValue === "" || packageSelected === undefined){return};
    checkAvailability();
};

const dtSelector = () => {
    
    // Configuración inicial del input de fecha y hora
    const dt = document.querySelector('#dt');
    const now = new Date();
    // Redondear minutos al múltiplo de 30 más cercano (00 o 30)
    const minutes = now.getMinutes();
    const roundedMinutes = Math.round(minutes / 30) * 30;
    now.setMinutes(roundedMinutes);
    now.setSeconds(0);
    const nowFormatted = now.toDatetimeLocal();
    const maxDate = new Date(now);
    maxDate.setMonth(maxDate.getMonth() + 2);
    const maxFormatted = maxDate.toDatetimeLocal();

    dt.setAttribute('min', nowFormatted);
    dt.setAttribute('max', maxFormatted);
    dt.setAttribute('step', 1800); // 1800 segundos = 30 minutos
    dt.value = nowFormatted;

    // Asegurar que las selecciones de hora sean solo en minutos 00 o 30
    dt.addEventListener('change', () => {

        const selectedDate = new Date(dt.value);
        const selectedMinutes = selectedDate.getMinutes();
        const adjustedMinutes = Math.round(selectedMinutes / 30) * 30;
        selectedDate.setMinutes(adjustedMinutes);
        selectedDate.setSeconds(0);
        dt.value = selectedDate.toDatetimeLocal();
        checkAvailabilityAction();
    });
}

const packageSelection = elem => {

    const pkCards = $(".package-cards");
    $.each(pkCards, function () {$(this).removeClass("border-danger")})
    $(elem).closest(".package-cards").addClass("border-danger");
    packageSelected = $(elem).attr("data-id");

    checkAvailabilityAction();
};

// Función para poblar las opciones del modal
const populateModalOptions = () => {

    const language = getLanguage();    
    // Llenar el selector de ubicaciones
    const locationSelect = document.getElementById('locationSelect');

    const selectOption = language === "es" ? "Seleccione una ubicación" : "Select a location";
    const selectedPackage = language === "es" ? "Seleccionar" : "Select";

    locationSelect.innerHTML = `<option value="" disabled selected>${selectOption}</option>`; // Resetear opciones
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location.location_id;
        option.textContent = location.name;
        locationSelect.appendChild(option);
    });

    const packageOptions = document.getElementById('packageOptions');
    
    let packageOptionsInner = "";

    packages.forEach((pkg, index) => {
                
        const descriptionItems = pkg[`${language}_description`].split(',');        
        
        let descriptionElems = "";
        descriptionItems.forEach(di => { descriptionElems += `<li class="border-0 list-group-item text-bg-dark bg-transparent px-0">${di.trim()}</li>` });

        let selectedClass = pkg.package_id === packageSelected ? "border-danger" : "";

        packageOptionsInner += `<div class="${selectedClass} bg-dark border-3 border-secondary card mb-3 w-100 package-cards"> <div class="card-body"> <h5 class="align-items-center card-title d-flex text-light"> <div class="align-items-center d-grid border rounded-5 text-center" style="width: 40px; height: 40px;"> <span> <i class="fa-solid fa-${pkg.package_id}"></i> </span> </div> <span class="mx-3">${pkg[`${language}_package_name`]}</span> </h5> <div class="card-text mb-3"> 
        <div><span class="fs-1 text-light">$${pkg.total_price}</span></div><ol class="list-group list-group-numbered">${descriptionElems}</ol></div> <div class="text-start"> <button class="btn btn-primary" data-id="${pkg.package_id}" onclick="packageSelection(this)">${selectedPackage}</button> </div> </div> </div>`;

    });
    $(packageOptions).empty().append(packageOptionsInner);
};

// Función para poblar las opciones de personajes
const populateCharacterOptions = (characters) => {

    const language = getLanguage();
    
    const characterOptions = document.getElementById('characterOptions');
    characterOptions.innerHTML = ''; // Limpiar opciones anteriores

    characters.forEach((character) => {
        const isAvailable = character.disponible === "Si";
        const checkbox = document.createElement('div');
        checkbox.className = 'form-check form-switch';
        checkbox.innerHTML = `
            <input class="form-check-input" type="checkbox" role="switch" value="${character.character_id}" 
                id="char${character.character_id}" name="character" ${isAvailable ? '' : 'disabled'}>
            <label class="form-check-label" for="char${character.character_id}">
                ${character[`${language}_name`]}
            </label>
        `;

        $(characterOptions).append(checkbox);

    });

    // Asegurarse de que solo se pueda seleccionar un checkbox a la vez
    const checkboxes = document.querySelectorAll('.character-options .form-check-input');
    const continueBtn = document.getElementById('continueBtn');
    continueBtn.disabled = true; // Deshabilitar el botón inicialmente

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function () {
            if (this.checked) {
                // Desmarcar todos los demás checkboxes
                checkboxes.forEach(cb => {
                    if (cb !== this) {
                        cb.checked = false;
                    }
                });
                continueBtn.disabled = false; // Habilitar el botón si hay selección
            } else {
                // Si no hay ningún checkbox marcado, deshabilitar el botón
                const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
                continueBtn.disabled = !anyChecked;
            }
        });
    });
};

// Función para verificar la disponibilidad y manejar el modal
const checkAvailability = () => {

    setLoader(true);

    // Obtener los valores del modal
    const dateTimeInput = document.getElementById('dt').value; // Ejemplo: "2025-04-09T10:00"
    const locationSelect = document.getElementById('locationSelect').value; // Ejemplo: "1"
    const packageId = packageSelected;
    const availabilityMessage = document.getElementById('availabilityMessage');
    const characterSelector = document.getElementById('characterSelector');
    const continueBtn = document.getElementById('continueBtn');

    // Validar que todos los campos estén completos
    if (!dateTimeInput || !locationSelect || !packageId) {
        availabilityMessage.innerHTML = `
            <div class="alert alert-warning" role="alert">
                Por favor, completa todos los campos (fecha, ubicación y paquete).
            </div>`;
        characterSelector.style.display = 'none'; // Ocultar el selector de personajes
        continueBtn.style.display = 'none'; // Ocultar el botón Continuar
        return;
    }

    const [eventDate, startTime] = dateTimeInput.split('T');
    const formattedStartTime = `${startTime}:00`;

    // Preparar los datos para la solicitud
    const requestData = {
        location_id: parseInt(locationSelect),
        package_id: parseInt(packageId),
        event_date: eventDate,
        start_time: formattedStartTime
    };
    

    // Hacer la solicitud de disponibilidad usando la función del main.js
    checkAvailabilityRequest(requestData)
        .then(data => {

            setLoader(false);

            if(data.code === 400 || data.code === 4001 || data.code === 4002 || data.code === 4003 || data.code === 4004){
                // Caso de error
                availabilityMessage.innerHTML = `<div class="alert alert-danger" role="alert">${data.message} ${data.solution}</div>`;
                characterSelector.style.display = 'none'; // Ocultar el selector de personajes
                continueBtn.style.display = 'none'; // Ocultar el botón Continuar
                return;
            };

            availabilityMessage.innerHTML = ``;

            setLoader(true);

            getAdditionalCharacters({
                date: eventDate,
                start_time: formattedStartTime,
                package_id: parseInt(packageId),
                location_id: parseInt(locationSelect)
            })
            .then(characters => {

                    setLoader(false);
                    
                    // Mostrar el selector de personajes
                    characterSelector.style.display = 'block';
                    populateCharacterOptions(characters);
                    
                    // animacion del modal al agregar datos
                    $('#scheduleModal .modal-body').animate({
                        scrollTop: $('#scheduleModal .modal-body')[0].scrollHeight
                    }, 400); // 400ms de duración


                    // Mostrar el botón Continuar (pero deshabilitado hasta seleccionar personaje)
                    continueBtn.style.display = 'inline-block';
                    continueBtn.disabled = true; // Asegurar que esté deshabilitado
                })
                .catch(error => {
                    console.error('Error al consultar personajes:', error);
                    availabilityMessage.innerHTML = `
                        <div class="alert alert-danger" role="alert">
                            Error al consultar personajes disponibles. Por favor, intenta de nuevo.
                        </div>`;
                    characterSelector.style.display = 'none';
                    continueBtn.style.display = 'none';
                });

        })
        .catch(error => {
            console.error('Error al verificar disponibilidad:', error);
            availabilityMessage.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Error al conectar con el servidor. Por favor, intenta de nuevo.
                </div>`;
            characterSelector.style.display = 'none'; // Ocultar el selector de personajes
            continueBtn.style.display = 'none'; // Ocultar el botón Continuar
        });
};


const initScheduleModal = () => {

    dtSelector();

    setLoader(false);
    // Evento para el botón de disponibilidad
    const checkAvailabilityBtns = [
        document.getElementById("checkAvailabilityBtn"),
        document.getElementById("checkAvailabilityMobBtn")
    ];
    
    checkAvailabilityBtns.forEach(btn => {
        if (btn) {
          btn.addEventListener("click", function () {
            const myModal = new bootstrap.Modal('#scheduleModal');
      
            // Verificar si los datos ya están cargados
            if (locations && packages) {
              populateModalOptions();
              myModal.show(); // Asegura que el modal se abra
            } else {
              console.log('Esperando a que se carguen los datos...');
              Promise.all([getLocations(), getPackages()])
                .then(data => {
                  locations = data[0];
                  packages = data[1];
                  populateModalOptions();
                  myModal.show();
                })
                .catch(error => console.error('Error al cargar datos:', error));
            }
          });
        }
    });
    
    // Añadir el evento al botón "Continuar"
    const continueBtn = document.getElementById('continueBtn');    
    continueBtn.addEventListener('click', () => {
        // Obtener los valores seleccionados
        const dateTimeInput = document.getElementById('dt').value; // Ejemplo: "2025-04-09T10:00"
        const locationSelect = document.getElementById('locationSelect').value; // Ejemplo: "1"
        const selectedPackage = document.querySelector('input[name="package"]:checked'); // Radio button seleccionado
        const packageId = selectedPackage ? selectedPackage.value : null; // Ejemplo: "2"
        const selectedCharacter = document.querySelector('input[name="character"]:checked'); // Checkbox seleccionado
        const characterId = selectedCharacter ? selectedCharacter.value : null; // Ejemplo: "5"

        // Validar que se haya seleccionado un personaje
        if (!characterId) {
            const availabilityMessage = document.getElementById('availabilityMessage');
            availabilityMessage.innerHTML = `
                <div class="alert alert-warning" role="alert">
                    Por favor, selecciona un personaje antes de continuar.
                </div>`;
            return;
        }

        // Obtener los datos completos
        const [eventDate, startTime] = dateTimeInput.split('T'); // Separar fecha y hora
        const location = locations.find(loc => loc.location_id == locationSelect);
        const pkg = packages.find(p => p.package_id === packageSelected);
        const character = document.querySelector(`#char${characterId}`).nextElementSibling.textContent.trim(); // Nombre del personaje

        // Crear los parámetros de la URL
        const params = new URLSearchParams({
            eventDate: eventDate,
            startTime: startTime,
            locationId: locationSelect,
            packageId: packageSelected,
            characterId: characterId,
        });

        // const pathname = window.location.pathname.split("/")[1];
        // Redirigir a orders.html con los parámetros
        window.location.href = `../order.html?${params.toString()}`;
    });
}