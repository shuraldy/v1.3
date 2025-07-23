/**
 * Módulo para manejar la visualización de productos de KL Partys
 */
(async () => {
    try {
        // Verificar que getProductsPartys esté disponible
        if (window.getProductsPartys) {
            const products = await window.getProductsPartys();
            console.log('Productos de KL Partys:', products);
            // Aquí puedes añadir más funcionalidades en el futuro
        } else {
            console.warn('Función getProductsPartys no encontrada. Asegúrate de que main.js esté cargado primero.');
        }
    } catch (error) {
        console.error('Error al obtener productos de KL Partys:', error);
    }
})();