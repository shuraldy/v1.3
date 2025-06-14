let availableCharacters = [];
let orderPackages;
let orderCharacters;
let orderLocations;
let orderProducts;
let activeProducts;
let additionalCharacters;
let paymentTotal;
const addedProductsItems = [];
const addedCharactersItems = [];

// -------
let product_name;
let nombre_cliente;
let apellido_cliente;
let email_cliente;
let telefono_cliente;
let paquete_id;
let defaultCharacter;
let personajes = [];
let productos = [];
let total_price;
let nombre_evento;
let nombre_personaje;
let descripcion_evento;
let fecha_evento;
let hora_inicio;
let hora_fin;
let duracion_horas;
let direccion;
let location_id;
let payment_method;
const language = getLanguage();



const checkout = async data => {    
    const endpoint = data.payment_method === "2" ? `${API}/checkout_paypal.php` : `${API}/checkout_stripe.php`;
    
    try {

        // console.log(data);
        

        // return;

        const response = await sendOrderData(endpoint, data);
        const url = response.url;
        setLoader(true);
        window.location.replace(url);
    } catch (error) {
        console.error(error);
    }
};

const paymentValidation = () => {
    const payBtn = document.querySelector("#payBtn");
    payBtn.addEventListener("click", function () {
        const data = {
            unit_amount: paymentTotal * 100,
            product_name,
            nombre_cliente : `${nombre_cliente} ${apellido_cliente}`,
            telefono_cliente,
            email_cliente,
            paquete_id,
            personajes: addedCharactersItems.map(p => parseInt(p.character_id)).concat([parseInt(defaultCharacter)]),
            productos: addedProductsItems.map(p => parseInt(p.product_id)),
            total_price: paymentTotal,
            nombre_evento: product_name,
            descripcion_evento: `${product_name}, personaje : ${nombre_personaje}`,
            fecha_evento,
            hora_inicio,
            hora_fin,
            duracion_horas,
            direccion,
            location_id,
            payment_method
        };

        const keysToValidate = Object.keys(data).filter(key => key !== "personajes" && key !== "productos");
        const emptyKeys = keysToValidate.filter(key => {
            const value = data[key];
            return (
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "")
            );
        });

        if (emptyKeys.length > 0) {
            console.error(emptyKeys);
            return;
        }

        checkout(data);
    });
};

const validationCustomerForm = () => {
    const fields = $(".customer-control");
    let allValid = true;

    fields.each(function () {
        const $field = $(this);
        const id = $field.attr("id");
        const value = $field.val()?.trim() || "";
        $field.removeClass("is-valid is-invalid");
        let isValid = true;

        switch (id) {
            case "firstName":
                isValid = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/.test(value);
                nombre_cliente = value;
            case "lastName":
                isValid = /^[A-Za-zÀ-ÿ\s'-]{2,50}$/.test(value);
                apellido_cliente = value;
                break;
            case "email":
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                email_cliente = value;
                break;
            case "phone":
                isValid = /^\d{10}$/.test(value);
                telefono_cliente = value;
                break;
            case "eventAddress":
                isValid = value.length >= 5;
                direccion = value;
                break;
            case "paymentMethod":
                isValid = value !== "";
                payment_method = value;
                break;
            default:
                isValid = value !== "";
        }

        if (!isValid) allValid = false;
        $field.addClass(isValid ? "is-valid" : "is-invalid");
    });

    $("#payBtn").prop("disabled", !allValid);
};

const productAction = elem => {    
    const totalPriceElem = document.querySelector("#totalPrice");
    const additionalProductsList = document.querySelector("#additionalProductsList");
    const subProducts = document.querySelector("#subProducts");
    const checkedState = $(elem).prop("checked");
    const productId = $(elem).val();
  
    const product = activeProducts.find(p => p.product_id === productId);
    if (!product) return;
  
    if (checkedState) {
        addedProductsItems.push(product);
        paymentTotal += parseInt(product.price);
    } else {
        const index = addedProductsItems.findIndex(p => p.product_id === productId);
        if (index !== -1) {
            addedProductsItems.splice(index, 1);
            paymentTotal -= parseInt(product.price);
        }
    }
  
    $(totalPriceElem).fadeOut(100, function () {
        $(this).text(`$${paymentTotal}.00`).fadeIn(100);
    });

    productos = addedProductsItems.map(p => p.product_id);    
    let productsElems = "";
    let productsPrice = 0;
    addedProductsItems.forEach(el => {
        // console.log(el);
        
        productsPrice += parseInt(el.price);
        productsElems += `<li class="list-group-item fs-kl-14px"> <p class="mb-0">${el[`${language}_name`]}</p> <p class="mb-0 fw-bold">$${el.price}</p> </li>`;
    });
    
    $(additionalProductsList).empty().append(` <ul class="list-group">${productsElems}</ul>`);
    $(subProducts).empty().append(`$${productsPrice}.00`);
};

const characterAction = elem => {
    const totalPriceElem = document.querySelector("#totalPrice");
    const additionalCharactersList = document.querySelector("#additionalCharactersList");
    const subCharacters = document.querySelector("#subCharacters");  
    const checkedState = $(elem).prop("checked");
    const characterId = $(elem).val();
  
    const character = additionalCharacters.find(c => c.character_id === characterId);
    if (!character) return;
  
    if (checkedState) {
        addedCharactersItems.push(character);
        paymentTotal += parseInt(character.price);
    } else {
        const index = addedCharactersItems.findIndex(c => c.character_id === characterId);
        if (index !== -1) {
            addedCharactersItems.splice(index, 1);
            paymentTotal -= parseInt(character.price);
        }
    }
  
    $(totalPriceElem).fadeOut(100, function () {
        $(this).text(`$${paymentTotal}.00`).fadeIn(100);
    });

    personajes = addedCharactersItems.map(p => p.character_id);
    personajes.push(defaultCharacter);

    let charactersElems = "";
    let charactersPrice = 0;
    addedCharactersItems.forEach(el => {
        charactersPrice += parseInt(el.price);
        charactersElems += `<li class="list-group-item fs-kl-14px"> <p class="mb-0">${el[`${language}_name`]}</p> <p class="mb-0 fw-bold">$${el.price}</p> </li>`;
    });
    
    $(additionalCharactersList).empty().append(` <ul class="list-group">${charactersElems}</ul>`);
    $(subCharacters).empty().append(`$${charactersPrice}.00`);
};

const endTimeCalculate = (horaInicioStr, duracionHoras) => {
    const [horas, minutos] = horaInicioStr.split(":").map(Number);
    const inicio = new Date();
    inicio.setHours(horas);
    inicio.setMinutes(minutos);
    inicio.setSeconds(0);
    inicio.setMilliseconds(0);
    inicio.setMinutes(inicio.getMinutes() + duracionHoras);
    const horaFin = inicio.toTimeString().substring(0, 5);
    return horaFin;
};

// const endTimeCalculate = (horaInicioStr, duracionHoras) => {
//     const [horas, minutos] = horaInicioStr.split(":").map(Number);
//     const inicio = new Date();
//     inicio.setHours(horas);
//     inicio.setMinutes(minutos);
//     inicio.setSeconds(0);
//     inicio.setMilliseconds(0);
//     inicio.setHours(inicio.getHours() + duracionHoras);
//     const horaFin = inicio.toTimeString().substring(0, 5);
//     return horaFin;
// };

// Función para renderizar la información seleccionada
(async () => {
    setLoader(true);
    const params = new URLSearchParams(window.location.search);    
    const eventDate = params.get('eventDate');
    const startTime = params.get('startTime');
    const locationId = params.get('locationId');
    const packageId = params.get('packageId');
    const characterId = params.get("characterId");

    const hoursLang = language === "es" ? "Min" : "Min";
    const includedLang = language === "es" ? "Incluido en el paquete" : "Included in the package";
    

    paquete_id = parseInt(packageId);
    fecha_evento = eventDate;
    hora_inicio = startTime;
    location_id = parseInt(locationId);
    defaultCharacter = characterId;

    try {
        orderCharacters = await getCharacters();
        orderPackages = await getPackages();
        orderLocations = await getLocations();
        orderProducts = await getProducts();        
        const fcId = orderCharacters.find(c => c.character_id === characterId);
        const fpId = orderPackages.find(p => p.package_id === packageId);
        const flId = orderLocations.find(l => l.location_id === locationId);
        activeProducts = orderProducts.filter(product => product.is_active == 1);

        additionalCharacters = await getAdditionalCharacters({
            date: eventDate, 
            start_time: `${params.get('startTime')}:00`,
            package_id: packageId,
            location_id: locationId
        });

        if (!fcId || !fpId || !flId) {
            setLoader(false);
            const component = "components/order-error.component.html";
            const outlet = "#order-container";
            $.get(component, componentHTML => {
                $(outlet).empty().append(componentHTML);
            });
            return;
        }

        const requestData = {
            location_id: locationId,
            package_id: packageId,
            event_date: eventDate,
            start_time: startTime
        };

        const response = await checkAvailabilityRequest(requestData);
        if (response.code === 400 || response.code === 404 || response.code === 4001 || response.code === 4002 || response.code === 4003 || response.code === 4004) {
            setLoader(false);
            const component = "components/order-error.component.html";
            const outlet = "#order-container";
            $.get(component, componentHTML => {
                $(outlet).empty().append(componentHTML);
            });
            return;
        };
        
        duracion_horas = parseInt(response.package.duration);
        hora_fin = endTimeCalculate(hora_inicio, duracion_horas);        
        setLoader(false);
        const component = "components/order-success.component.html";
        const outlet = "#order-container";

        const desArr = fpId[`${language}_description`].split(",");
        let listPackageElems = "";
        let listProductsElems = "";
        let listCharactersElems = "";

        desArr.forEach(el => {
            listPackageElems += `<li class="list-group-item fs-kl-14px">${el.trim()}</li>`;
        });

        activeProducts.forEach(el => {
            const duration = parseInt(el.duration_hours) > 0 ? `<span class="badge text-bg-primary">${el.duration_hours} ${hoursLang}</span>` : '';
            const name = el[`${language}_name`];
            const des = el.description;
            const price = el.price;
            listProductsElems += `
            <li class="list-group-item"> <div class="align-items-center d-flex form-check"> <input class="form-check-input" type="checkbox" value="${el.product_id}" id="product${el.product_id}" onchange="productAction(this)"> <label class="form-check-label w-100 mx-2" for="product${el.product_id}"> <div class="card border-0" style="max-width: 540px;"> <div class="row g-0"> <div class="col-md-12"> <div class="card-body p-0 px-2"> <h5 class="card-title mb-0 fs-kl-14px">${name}</h5> <h6 class="mb-0 fs-kl-14px">$${price}</h6> <p class="card-text fs-kl-14px"><small class="text-body-secondary">${duration}</small></p> </div> </div> </div> </div> </label> </div> </li>`;
        });

        additionalCharacters.forEach(el => {

            if(el.disponible === "No"){
                return
            };

            let disabled = el.character_id === params.get("characterId") ? "disabled" : "";
            let selected = el.character_id === params.get("characterId") ? `<span class="badge text-bg-primary"> ${includedLang}</span>` : '';
            listCharactersElems += `
            <li class="list-group-item"> <div class="align-items-center d-flex form-check"> <input class="form-check-input" type="checkbox" value="${el.character_id}" id="character${el.character_id}" onchange="characterAction(this)" ${disabled}> <label class="form-check-label w-100 mx-2" for="character${el.character_id}"> <div class="card border-0" style="max-width: 540px;"> <div class="row g-0"> <div class="col-md-12"> <div class="card-body p-0 px-2"> <h5 class="card-title mb-0 fs-kl-14px">${el[`${language}_name`]}</h5> <h6 class="mb-0 fs-kl-14px">$${el.price}</h6> <p class="card-text fs-kl-14px"><small class="text-body-secondary">${selected}</small></p> </div> </div> </div> </label> </li>`;
        });

        const productsList = `<ul class="list-group">${listProductsElems}</ul>`;
        const charactersList = `<ul class="list-group">${listCharactersElems}</ul>`;
        const packageDescription = `<ol class="list-group list-group-numbered">${listPackageElems}</ol>`;

        paymentTotal = parseInt(fpId.total_price);
        product_name = fpId.es_package_name;
        nombre_personaje = fcId[`${language}_name`];

        const data = [{
            eventDate: requestData.event_date,
            eventTime: requestData.start_time,
            locationName: flId.name,
            packageName: fpId[`${language}_package_name`],
            packagePrice: fpId.total_price,
            packageDuration: fpId.duration_hours,
            packageDescription,
            characterName: fcId[`${language}_name`],
            productsList,
            charactersList,
            totalPrice: `$${fpId.total_price}`
        }];

        $.get(component, componentHTML => {
            $(outlet).empty().append(G_DATA(componentHTML, data));
            paymentValidation();
            // Aplicar traducciones al componente recién renderizado
            const currentLang = localStorage.getItem('language') || 'en';
            console.log(currentLang);
            
            if (window.applyTranslations) {
                window.applyTranslations(currentLang);
            }
        });
    } catch (error) {
        console.error('Error al consultar personajes:', error);
    }
})();