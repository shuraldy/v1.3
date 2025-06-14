const loginService = (obj)=> {
   
    fetch(`${API}/login.php`, {
        method : "POST",
        headers : {
             "Content-Type" : "application/json"
        },
        body : JSON.stringify(obj)
    })
    .then( res => res.json()
    .then( response => {

        if(!response.ok){
            console.warn(response.message);
            return
        };

        console.log(response);

        const value = {
            username : response.username,
            token : response.token
        }

        createCookie("session", JSON.stringify(value), "1d");
        location.reload();


     }))
    .catch(err => { console.log(err) })


};

const handleLogin = () => {
    
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();


    if(username === "" || password === ""){
        console.warn("Campos vacios");
        return
    };

    const loginServiceResponse = loginService({username, password});
    console.log(loginServiceResponse);
    
    
};


const setLoginComponent = async () => {

    await DOM_CONSTRUCTOR("admin-outlet", "components/pages/login.component.html", []);

    const loginModalBtn = document.getElementById("loginModalBtn");

    loginModalBtn.addEventListener("click", function(){

        const myModal = new bootstrap.Modal('#scheduleModal');
        myModal.toggle();

        const adminLoginBtn = document.getElementById("adminLoginBtn");
        adminLoginBtn.addEventListener("click", handleLogin)

    });

};

const setAdminComponent = async () => {

    const cookie = JSON.parse(getCookieValue());
    console.log(cookie);

    await DOM_CONSTRUCTOR("admin-outlet", "components/pages/admin.component.html", []);

    
};


(()=>{

    !checkCookie() ? setLoginComponent() : setAdminComponent();
    
})()