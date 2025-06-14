document.addEventListener('DOMContentLoaded', () => {    
    // Idioma por defecto
    const defaultLang = 'en';
    // Obtener idioma guardado o usar el predeterminado
    let currentLang = localStorage.getItem('language') || defaultLang;
    
    let translations = {};

    // Función para cargar traducciones
    const loadTranslations = async () => {
        try {
            const response = await fetch('../assets/js/translations.json');
            if (!response.ok) {
                throw new Error('No se pudo cargar translations.json');
            }
            translations = await response.json();
            return translations;
        } catch (error) {
            console.error('Error al cargar traducciones:', error);
            return {};
        }
    };

    // Función para aplicar traducciones (expuesta globalmente)
    window.applyTranslations = (lang) => {
        const elements = document.querySelectorAll('.lang-elem');
        const langFlag = $(".lang-flag");
        
        $.each(langFlag, function(){
            $(this).attr("src", `/assets/images/icons/flag-${lang}.png`);
        });
        
        elements.forEach(elem => {            
            const key = elem.getAttribute('data-lang');
            if (translations[lang] && translations[lang][key]) {
                // Reemplazar \n por <br> en cualquier texto que contenga saltos de línea
                const text = translations[lang][key];
                if (typeof text === 'string' && text.includes('\n')) {
                    elem.innerHTML = text.replace(/\n/g, '<br>');
                } else {
                    elem.textContent = text;
                }
            }
        });

        // Actualizar el texto del menú desplegable
        const dropdownToggle = document.querySelector('#languageDropdown');
        if (dropdownToggle) {
            dropdownToggle.textContent = lang === 'en' ? 'En' : 'Es';
        }
    };

    // Función para cambiar el idioma
    const changeLanguage = (lang) => {
        setLoader(true);
        localStorage.setItem('language', lang);
        currentLang = lang;
        setTimeout(async() => {
            await loadTranslations();
            window.applyTranslations(lang);
            location.reload();
        }, 300);
    };

    // Cargar traducciones iniciales
    loadTranslations().then(() => {
        window.applyTranslations(currentLang);
    });

    // Añadir eventos a las opciones de idioma
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');            
            changeLanguage(lang);
        });
    });

    if(!localStorage.getItem('language')){
        localStorage.setItem('language', defaultLang);
        return;
    };
});

// Extensión para formatear fecha en datetime-local
Date.prototype.toDatetimeLocal = function () {
    const dt = new Date(this.getTime() - (this.getTimezoneOffset() * 60000));
    return dt.toISOString().slice(0, 16);
};