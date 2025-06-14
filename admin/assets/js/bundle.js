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

const DOM_CONSTRUCTOR = (outlet, component, data) =>{
    var lateral = 'lateral-outlet';
    return new Promise((res, rej) => {
        $.get(component, componentHTML => {
            $(`${outlet}`).empty().append(G_DATA(componentHTML, data));

            if (outlet === lateral) {
                $(`${lateral}`).removeClass('d-none').css({
                    left: '0%'
                })
            } else {
                $(`${lateral}`).queue(function (n) {
                    $(`${lateral}`).css({
                        left: '100%'
                    });
                    n()
                }).addClass('d-none')
            };
            res(true);
        });
    });
};

const isMobile = () => {
    const anchoPantalla = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const umbralMovil = 768;
    return anchoPantalla < umbralMovil;
};

const checkCookie = () => {

    const match = document.cookie.match(new RegExp('(^| )' + 'session' + '=([^;]+)'));
    if (match) {
        return true
    } else {
        return false
    }
};

const createCookie = (name, value, days) => {
    let expires = "";

    if (days) {
        let date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }

    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

const getCookieValue = () => {
    const name = 'session' + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};

const killCookie = () => {
    document.cookie = 'session' + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
};