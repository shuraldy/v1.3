// Función para crear una tarjeta de producto
function createProductCard(product, language, priceLabel, categoryName) {
    let imageSrc = product.image;
    if (imageSrc && imageSrc.startsWith('/9j/')) {
        imageSrc = `data:image/jpeg;base64,${imageSrc}`;
    }
    
    const message = encodeURIComponent(
        `*${language === 'es' ? 'Detalles del Producto:' : 'Product Details:'}*\n` +
        `${language === 'es' ? 'Categoría:' : 'Category:'} ${categoryName}\n` +
        `${language === 'es' ? 'Nombre:' : 'Name:'} ${product.product_name}\n` +
        `${priceLabel} $${product.price}`
    );
    const whatsappUrl = `https://web.whatsapp.com/send?phone=+18645172916&text=${message}`;

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
}

// Mapeo de categorías
const categoryMapping = {
    'decoration': {
        es: 'Decoración',
        en: 'Decoration',
        modalId: 'decorationProductsModal'
    },
    'rental': {
        es: 'Alquileres',
        en: 'Rentals',
        modalId: 'rentalProductsModal'
    },
    'breakfast': {
        es: 'Desayunos sorpresa',
        en: 'Surprise Breakfast',
        modalId: 'breakfastProductsModal',
        subcategories: [
            {
                es: 'Desayunos sorpresa para hombre',
                en: 'Surprise breakfast men'
            },
            {
                es: 'Desayunos sorpresa para mujer',
                en: 'Surprise breakfast women'
            }
        ]
    },
    'picnic': {
        es: 'Mesas de picnic',
        en: 'Tables picnic',
        modalId: 'picnicProductsModal'
    },
    'gifts': {
        es: 'Regalos personalizados',
        en: 'Personalized Gifts',
        modalId: 'giftsProductsModal',
        subcategories: [
            {
                es: 'Detalles personalizados para mujer',
                en: 'Personal gift for woman'
            },
            {
                es: 'Desayunos sorpresa para mujer',
                en: 'Surprice breakfast woman'
            }
        ]
    }
};

// Función para obtener y mostrar productos por categoría
async function showProducts(category) {
    try {
        if (!window.getProductsPartys) {
            console.warn('Función getProductsPartys no encontrada');
            return;
        }

        const products = await window.getProductsPartys();
        const language = localStorage.getItem("language") || 'en';
        
        const categoryConfig = categoryMapping[category];
        if (!categoryConfig) {
            console.error('Categoría no configurada:', category);
            return;
        }

        let filteredProducts = [];
        if (categoryConfig.subcategories) {
            filteredProducts = products.filter(product => 
                product.is_active === "1" && 
                product.category_active === "1" && 
                categoryConfig.subcategories.some(sub => 
                    product.name_category_es === sub.es || 
                    product.name_category_en === sub.en
                )
            );
        } else {
            filteredProducts = products.filter(product => 
                product.is_active === "1" && 
                product.category_active === "1" && 
                (product.name_category_es === categoryConfig.es || 
                 product.name_category_en === categoryConfig.en)
            );
        }

        const priceLabel = language === 'es' ? 'Precio:' : 'Price:';
        const modalTitle = language === 'es' ? categoryConfig.es : categoryConfig.en;

        let modalElement = document.getElementById(categoryConfig.modalId);
        if (!modalElement) {
            modalElement = document.createElement('div');
            modalElement.id = categoryConfig.modalId;
            modalElement.className = 'modal fade';
            modalElement.setAttribute('tabindex', '-1');
            modalElement.setAttribute('aria-hidden', 'true');
            document.body.appendChild(modalElement);
        }

        let modalContent = `
            <div class="modal-dialog modal-xl modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${modalTitle}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="container-fluid">`;

        if (categoryConfig.subcategories) {
            categoryConfig.subcategories.forEach(subcategory => {
                const subcategoryProducts = filteredProducts.filter(product => 
                    product.name_category_es === subcategory.es || 
                    product.name_category_en === subcategory.en
                );

                if (subcategoryProducts.length > 0) {
                    const subcategoryTitle = language === 'es' ? subcategory.es : subcategory.en;
                    modalContent += `
                        <h4 class="mb-4">${subcategoryTitle}</h4>
                        <div class="row row-cols-1 row-cols-md-3 g-4 mb-5">
                            ${subcategoryProducts.map(product => 
                                createProductCard(product, language, priceLabel, subcategoryTitle)
                            ).join('')}
                        </div>`;
                }
            });
        } else {
            const categoryTitle = language === 'es' ? categoryConfig.es : categoryConfig.en;
            modalContent += `
                <div class="row row-cols-1 row-cols-md-3 g-4">
                    ${filteredProducts.map(product => 
                        createProductCard(product, language, priceLabel, categoryTitle)
                    ).join('')}
                </div>`;
        }

        modalContent += `
                        </div>
                    </div>
                </div>
            </div>`;

        modalElement.innerHTML = modalContent;

        const modal = new bootstrap.Modal(modalElement);
        modal.show();

    } catch (error) {
        console.error('Error al cargar los productos:', error);
    }
}

// Inicializar los event listeners cuando el documento esté listo
document.addEventListener('DOMContentLoaded', () => {
    const productButtons = document.querySelectorAll('[data-lang="see-more"]');
    
    productButtons.forEach(button => {
        button.addEventListener('click', async (e) => {
            e.preventDefault();
            const serviceDescription = button.closest('.service-description');
            if (!serviceDescription) return;
            
            const titleElement = serviceDescription.querySelector('[data-lang^="kltitle"]');
            if (!titleElement) return;

            const titleDataLang = titleElement.getAttribute('data-lang');
            const categoryMap = {
                'kltitle1': 'decoration',
                'kltitle5': 'rental',
                'kltitle3': 'breakfast',
                'kltitle4': 'picnic',
                'kltitle2': 'gifts'
            };

            const category = categoryMap[titleDataLang];
            if (category) {
                await showProducts(category);
            }
        });
    });
});
