// Extensión para formatear fechas al formato datetime-local
Date.prototype.toDatetimeLocal = function () {
    
    const pad = i => String(i).padStart(2, "0");
  
    const date = new Date(this);
    date.setSeconds(0, 0); // Quitar segundos y milisegundos
  
    // Redondear minutos al múltiplo de 30 más cercano
    const mins = date.getMinutes();
    date.setMinutes(mins < 15 ? 0 : mins < 45 ? 30 : 0);
    if (mins >= 45) date.setHours(date.getHours() + 1);
  
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const HH = pad(date.getHours());
    const II = pad(date.getMinutes());
  
    return `${YYYY}-${MM}-${DD}T${HH}:${II}`;
};

const rezise = () => {

    if($("#offcanvasMenu").hasClass("show")){
        $("#offcanvasMenuCloseBtn").click();
        return
    };
};

const getLanguage = () => { return localStorage.getItem("language") };
const setLoader = state => { !state ? $("#loader").addClass("d-none") : $("#loader").removeClass("d-none") };

const G_DATA = (e, t) => {
    res = e;
    for (n in t) {
        res = res.replace(/\{\{(.*?)\}\}/g, function (e, r) {
            r = r.trim();
            return t[n][r]
        })
    };
    return res
};

const sendOrderData = (endpoint, data) => {
    return new Promise((resolve, reject) => {
        fetch(endpoint, {
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            body : JSON.stringify(data)
        })
        .then(res => res.json())
        .then(response => {
            resolve(response)
        })
        .catch(error => {
            console.error(error);
            reject(error)
        })
    })
};

// Obtener ubicaciones
const getLocations = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_locations.php`)
            .then(res => res.json())
            .then(response => resolve(response))
            .catch(err => {
                console.error('Error al obtener ubicaciones:', err);
                resolve([]); // Devolver un array vacío en caso de error
            });
    });
};

// Obtener personajes
const getCharacters = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_characters.php`)
            .then(res => res.json())
            .then(response => resolve(response))
            .catch(err => {
                console.error('Error al obtener personajes:', err);
                resolve([]); // Devolver un array vacío en caso de error
            });
    });
};

// Obtener paquetes
const getPackages = () => {
    return new Promise((resolve, reject) => {
        fetch(`${API}/get_packages.php`)
            .then(res => res.json())
            .then(response => resolve(response))
            .catch(err => {
                console.error('Error al obtener paquetes:', err);
                resolve([]); // Devolver un array vacío en caso de error
            });
    });
};

const getAdditionalCharacters = data => {
    return fetch(`${API}/check_characters_availability.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .catch(error => {
        console.error('Error al obtener personajes adicionales:', error);
        return [];
    });
};

const getProducts = (data) => {
    return fetch(`${API}/get_products.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
};

// Consultar disponibilidad
const checkAvailabilityRequest = (data) => {
    return fetch(`${API}/availability.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
};

// Consultar personajes disponibles
const checkCharactersAvailability = (data) => {
    return fetch(`${API}/check_characters_availability.php`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
};


// Animación del header al hacer scroll
let headerMoved = false; // Definición única de headerMoved

window.addEventListener("scroll", () => {

    const scrollTop = window.scrollY;    

    if (scrollTop > 50 && !headerMoved) {
        $(".kl-header-container").stop().animate({ top: 0 }, "fast").addClass("bg-light");
        headerMoved = true;
    }

    if (scrollTop <= 50 && headerMoved) {
        $(".kl-header-container").stop().animate({ top: 0 }, "fast").removeClass("bg-light");
        headerMoved = false;
    }
});

const buildScheduleModal = pathname => {

    return new Promise((resolve, reject) => {
        try {
            const modalOutlet = "modal-outlet";
            const modalScheduleComponent = pathname === "" ? "components/schedule-modal.component.html" :  "../components/schedule-modal.component.html";
            $.get(modalScheduleComponent, mscHTML => {$(modalOutlet).empty().append(mscHTML)})
            resolve(true);

        } catch (error) {
            console.log(error);
            reject(false);
        };
    })
};


// Metodo autoinvocado para todas las paginas
(async () => {

    // $("#mobileMenuBtn").attr("disabled", false);

    const pathname = window.location.pathname.split("/")[1];
    const offcanvasOutlet = "offcanvas-outlet";
    const offcanvasMenuComponent = pathname === "" ? "components/offcanvas-menu.component.html" :  "../components/offcanvas-menu.component.html";
    
    $.get(offcanvasMenuComponent, ocmcHTML => {$(offcanvasOutlet).empty().append(ocmcHTML)})
   
    try {
        const buildScheduleModalRes = await buildScheduleModal(pathname);
        if(buildScheduleModalRes){
            setTimeout(() => {
                initScheduleModal();
            }, 1000);
        }

    } catch (error) {
        console.log(error);
    };
    
    //Revisar pag actual

    // const pathname = window.location.pathname;
    // console.log(pathname);
    

    // $.each($(".nav-link-kl"), function(){
    //     const activeElem = $(this).attr("data-active");
    //     console.log(activeElem);
        
    //     if(pathname.includes(activeElem)){
    //         console.log($(this));
    //         return
            
    //     }
        
    // })

    //Renderizacion del menu para mobiles

    // if(window.innerWidth >= 992){
    //     return;
    // };


})();