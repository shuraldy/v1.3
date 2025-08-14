(async () => {
    try {


        // Obtener los productos
        const data = await window.getEventFeedback();
        console.log('comentarios', data);

    } catch (error) {
        console.error('error al traer comentarios:', error);
    }
})();