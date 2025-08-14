let decorationModal;

// Función para obtener y mostrar productos de decoración
async function showDecorationProducts() {
    try {
        // Verificar que getProductsPartys esté disponible
        if (!window.getProductsPartys) {
            console.warn('Función getProductsPartys no encontrada');
            return;
        }

        // Obtener los productos
        const products = await window.getProductsPartys();
        
        // Filtrar solo los productos de decoración
        const decorationProducts = products.filter(product => 
            product.is_active === "1" && 
            product.category_active === "1" && 
            (product.name_category_es === "Decoración" || product.name_category_en === "Decoration")
        );

        // Obtener el idioma actual
        const language = localStorage.getItem("language") || 'en';
        const priceLabel = language === 'es' ? 'Precio:' : 'Price:';
        const modalTitle = language === 'es' ? 'Productos de Decoración' : 'Decoration Products';

        // Actualizar el contenido del modal
        const modalElement = document.getElementById('decorationProductsModal');
        modalElement.innerHTML = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="container-fluid">
                            <div class="row row-cols-1 row-cols-md-3 g-4">
                                ${decorationProducts.map(product => {
                                    let imageSrc = product.image;
                                    if (imageSrc && imageSrc.startsWith('/9j/')) {
                                        imageSrc = `data:image/jpeg;base64,${imageSrc}`;
                                    }
                                    
                                    // Construir el mensaje para WhatsApp
                                    const message = encodeURIComponent(
                                        `*${language === 'es' ? 'Detalles del Producto:' : 'Product Details:'}*\n` +
                                        `${language === 'es' ? 'Nombre:' : 'Name:'} ${product.product_name}\n` +
                                        `${priceLabel} $${product.price}`
                                    );
                                        const phoneNumber = '18645172916';
                                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

                                    return `
                                        <div class="col">
                                            <div class="card h-100">
                                                ${imageSrc ? `<img src="${imageSrc}" class="card-img-top" alt="${product.product_name}" style="object-fit: cover; height: 250px;">` : ''}
                                                <div class="card-body text-center">
                                                    <h5 class="card-title">${product.product_name}</h5>
                                                    <p class="card-text"><strong>${priceLabel}</strong> $${product.price}</p>
                                                    <a href="${whatsappUrl}" class="btn btn-kl-2" target="_blank">
                                                        ${language === 'es' ? 'Agendar ahora' : 'Schedule now'}
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mostrar el modal
        if (!decorationModal) {
            decorationModal = new bootstrap.Modal(modalElement);
        }
        decorationModal.show();

    } catch (error) {
        console.error('Error al cargar los productos de decoración:', error);
    }
}

// Agregar event listener cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Botón para mostrar productos de decoración
    const decorationBtn = document.querySelector('[data-lang="see-more"]');
    if (decorationBtn) {
        decorationBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await showDecorationProducts();
        });
    }
});
