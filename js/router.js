function Router(target) {
    //parameter - a reference to the DOM element - container for the views
    try {
        if(target===undefined || target===null) {
            throw "Wrong parameter for Router constructor. Must be a reference to DOM Element. Undefined or null given";
        }
        else {
            this.target=target;
        }
    }
    catch(e) {
        console.error(e);
    }
    this.hash = window.location.hash.substr(1, window.location.hash.length-1); //remove the # sign from the start
    if(this.checkHashValidity(this.hash)) {
        this.hash=this.hash.toLowerCase();
    }
    else {
        this.hash = "home";
    }
    //listen if the hash changes
    window.addEventListener("hashchange", this.hashchangeHandler.bind(this));
    //read the html
    this.readHTML(true);
    this.blockHashchange = false; //you can not change the hash while the this.target is being animated
}
Router.prototype.checkHashValidity=function(hash) {
    //returns false if hash is invalid or not specified
    if(hash==="") {
        return false;
    }
    else {
        const reg = /^[a-zA-Z0-9/-]+$/;

        if(reg.test(hash)) { //check if the hash is valid - dashes, letters and numbers only allowed
            return true;
        }
        else {
            return false;
        }
    }
}
Router.prototype.hashchangeHandler = function() {
    //changes this.hash - triggered by hashchange event
    this.newHash = window.location.hash.substr(1, window.location.hash.length-1); //remove the # sign from the start
    if(this.blockHashchange === false) {   //while this.target is being animated, you cannot switch subpages
        if(this.checkHashValidity(this.newHash)) {
            this.hash = this.newHash.toLowerCase();
            this.readHTML(false);
        }
        else {
            window.location.hash = this.hash; //if the given hash is wrong, set it to the previous one
        }
    }
    else {
        window.location.hash = this.hash; //if you try to switch subpages while animation isn't yet over, nothing should change
    }
}
Router.prototype.readHTML=function(firstTimeAfterReload) {
    //puts the HTML content in this.target
    //the parameter is true, if the function is working for the first time after reload
    //it's important for the animation
    this.url = `views/${this.hash}.html`;

    fetch(this.url)
    .then(resp => {
        if(resp.ok) {
            return resp;
        }
        else {
            //Fetch a 404 page
            fetch("views/404.html")
            .then(page404 => page404.text())
            .then(page404 => {
                this.target.innerHTML = page404;
            });
            return `Błąd ${resp.status}`;
        }
    })
    .then(resp=>resp.text())
    .then(resp => {
        this.resp = resp; //need to use the resp in fadeout()
        this.blockHashchange = true; //you can not change the subpage while this.target is being animated
        if(firstTimeAfterReload === false) {
            this.target.classList.add("container-fadeout");
            this.target.offsetHeight = this.target.offsetHeight; //force the browser to reflow
            this.fadeoutBinded = this.fadeout.bind(this);
            this.target.addEventListener("animationend", this.fadeoutBinded);
        }
        else {
            this.target.classList.add("container-fadein");
            this.target.innerHTML = this.resp;
            this.target.offsetHeight = this.target.offsetHeight; //force the browser to reflow
            this.fadeinBinded = this.fadein.bind(this);
            this.target.addEventListener("animationend", this.fadeinBinded);
        }
    });
}
Router.prototype.fadeout = function() {
    this.target.innerHTML = this.resp;
    document.dispatchEvent(new Event("routercontentloaded")); //Let the other scripts know, that the content is loaded
    this.target.removeEventListener("animationend", this.fadeoutBinded);
    this.target.classList.remove("container-fadeout");
    this.target.classList.add("container-fadein");
    this.target.offsetHeight = this.target.offsetHeight; //force the browser to reflow
    this.fadeinBinded = this.fadein.bind(this);
    this.target.addEventListener("animationend", this.fadeinBinded);
}
Router.prototype.fadein = function() {
    this.target.removeEventListener("animationend", this.fadeinBinded);
    this.target.classList.remove("container-fadein");
    this.blockHashchange = false; //After the animation is over, pages can be switched
}
const t = document.querySelector("main");
new Router(t);