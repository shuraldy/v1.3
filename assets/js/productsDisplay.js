/**
 * Módulo para manejar la visualización de productos de KL Partys
 */
(async () => {
    try {
        // Verificar que getProductsPartys esté disponible
        if (!window.getProductsPartys) {
            console.warn('Función getProductsPartys no encontrada. Asegúrate de que main.js esté cargado primero.');
            return;
        }

        // Obtener los productos
        const products = await window.getProductsPartys();
        console.log('Productos de KL Partys:', products);

        // Seleccionar el contenedor donde se renderizarán los productos
        const productsContainer = document.querySelector('.row.row-cols-1.row-cols-md-3');
        if (!productsContainer) {
            console.warn('Contenedor de productos no encontrado en el DOM.');
            return;
        }

        // Limpiar el contenedor
        productsContainer.innerHTML = '';

        // Verificar si hay productos
        if (!products || products.length === 0) {
            productsContainer.innerHTML = '<p class="text-center">No hay productos disponibles.</p>';
            return;
        }

        // Obtener el idioma actual
        const language = window.getLanguage ? window.getLanguage() : 'en';
        const categoryKey = language === 'es' ? 'name_category_es' : 'name_category_en';

        // Agrupar productos por categoría
        const groupedProducts = {};
        products.forEach(product => {
            if (product.is_active === "1" && product.category_active === "1") {
                const category = product[categoryKey];
                if (!groupedProducts[category]) {
                    groupedProducts[category] = [];
                }
                groupedProducts[category].push(product);
            }
        });

        // Renderizar cada categoría con sus productos
        for (const [category, productsList] of Object.entries(groupedProducts)) {
            // Contenedor para cada categoría
            productsContainer.innerHTML += `
                <div class="category-block mb-4">
                    <h2 class="text-center mb-2">${category}</h2>
                    <div class="row row-cols-1 row-cols-md-3 g-2">
            `;

            // Renderizar tarjetas de la categoría
            productsList.forEach(product => {
                let imageSrc = product.image;
                if (imageSrc && imageSrc.startsWith('/9j/')) {
                    imageSrc = `data:image/jpeg;base64,${imageSrc}`;
                } else if (!imageSrc) {
                    imageSrc = ''; // Omite la imagen si no está disponible
                }

                const card = `
                    <div class="col">
                        <div class="card h-100">
                            ${imageSrc ? `<img src="${imageSrc}" class="card-img-top img-fluid" style="object-fit: cover; height: 300px;" alt="${product.product_name}">` : ''}
                            <div class="card-body text-center">
                                <h5 class="card-title">${product.product_name}</h5>
                                <p class="card-text"><strong>Price:</strong> $${product.price}</p>
                            </div>
                        </div>
                    </div>
                `;
                productsContainer.innerHTML += card;
            });

            // Cerrar el contenedor de la categoría
            productsContainer.innerHTML += `</div></div>`;
        }

    } catch (error) {
        console.error('Error al obtener o renderizar productos de KL Partys:', error);
    }
})();