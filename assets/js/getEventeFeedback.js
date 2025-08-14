(async () => {
    try {
        // Obtener los comentarios
        const response = await window.getEventFeedback();
        
        if (!response.ok || !response.data) {
            console.error('No se pudieron obtener los comentarios');
            return;
        }

        const testimonialsContainer = document.querySelector('.main-sec-3 .row.g-4');
        if (!testimonialsContainer) {
            console.error('No se encontró el contenedor de testimonios');
            return;
        }

        // Limpiar el contenedor
        testimonialsContainer.innerHTML = '';

        // Función para generar estrellas basadas en el rating
        const generateStars = (rating) => {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= rating) {
                    stars += '<i class="fas fa-star text-warning me-1"></i>'; // Estrella llena con margen
                } else {
                    stars += '<i class="far fa-star text-warning me-1"></i>'; // Estrella vacía con margen
                }
            }
            return stars;
        };

        // Tomar los últimos 5 comentarios
        const latestFeedbacks = response.data.slice(-5);

        // Crear dos filas: una para las primeras 3 cards y otra para las 2 últimas
        const firstRow = document.createElement('div');
        firstRow.className = 'row g-4 mb-4';
        
        const secondRow = document.createElement('div');
        secondRow.className = 'row g-4 justify-content-center';

        latestFeedbacks.forEach((feedback, index) => {
            const testimonialCard = `
                <div class="col-md-4">
                    <div class="card p-4 rounded-4 shadow-sm border-0">
                        <div class="mb-3">
                            <i class="fa-solid fa-quote-left fa-xl text-primary"></i>
                        </div>
                        <div class="mb-2">
                            ${generateStars(parseInt(feedback.rating))}
                        </div>
                        <p class="fs-kl-14px text-muted">
                            "${feedback.comments}"
                        </p>
                        <div class="fw-bold mt-3">${feedback.customer_name}</div>
                    </div>
                </div>
            `;
            
            if (index < 3) {
                firstRow.innerHTML += testimonialCard;
            } else {
                secondRow.innerHTML += testimonialCard;
            }
        });

        testimonialsContainer.appendChild(firstRow);
        testimonialsContainer.appendChild(secondRow);

    } catch (error) {
        console.error('Error al traer comentarios:', error);
    }
})();