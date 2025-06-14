// Función de inicialización para cargar datos
const init = () => {
    return Promise.all([
        getLocations(),
        getCharacters(),
        getPackages(),
        getProducts(),
    ])
    .then(data => {
        locations = data[0];
        characters = data[1];
        packages = data[2];
        products = data[3];
        //console.log('Datos cargados:', { locations, characters, packages, products });
    })
    .catch(error => {
        console.error('Error al iniciar:', error);
        throw error; // Propagar el error para que pueda ser manejado por quien llame a init
    });
};


// Cargar endpoints e iniciar la aplicación
(() => {    
    fetch(`${API}/xyz.php`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        }
    })
    .then(res => res.json())
    .then(response => {
        endpoints = response.message || {};
        $("#checkAvailabilityBtn, #checkAvailabilityMobBtn").attr("disabled", false);
        init();
    })
    .catch(err => {
        console.error('Error al cargar endpoints:', err);
    });
})();