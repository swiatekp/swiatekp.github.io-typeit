function Router(target) {
    //parameter - a referention to the DOM element - container for the views
    try {
        if(target===undefined || target===null) {
            throw "Wrong parameter for Router constructor. Must be a refferention to DOM Element. Undefined or null given";
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
    this.readHTML();
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
    if(this.checkHashValidity(this.newHash)) {
        this.hash = this.newHash.toLowerCase();
        this.readHTML();
    }
    else {
        window.location.hash = this.hash; //if the given hash is wrong, set it to the previous one
    }
}
Router.prototype.readHTML=function() {
    //puts the HTML content in this.target
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
                //this.transition(page404);
                this.target.innerHTML = page404;
            });
            return `Błąd ${resp.status}`;
        }
    })
    .then(resp=>resp.text())
    .then(resp => {
        //this.transition(resp);
        this.target.innerHTML = resp;
        document.dispatchEvent(new Event("routercontentloaded")); //Let the other scripts know, that the content is loaded
    });
}
/*
Router.prototype.transition = function(html) {
    if(this.target.innerHTML!=="") {    
        this.transitionFadeOut()
        .then(()=>{
            this.target.innerHTML = html;
            this.transitionFadeIn().then(()=>{
                this.target.removeEventListener("animationend", this.resolveBinded);
                this.target.classList.remove("container-fadein");
            });
        });
    }
    else {
        this.target.classList.add("container-non-appearent");
        this.target.innerHTML=html;
        this.transitionFadeIn().then(()=>{
            this.target.removeEventListener("animationend", this.resolveBinded);
            this.target.classList.remove("container-fadein");
        });
    }
}
Router.prototype.transitionFadeOut = function() {
    this.fadeOutPromise = new Promise((resolve, reject) => {
        this.resolveBinded = this.resolve(0).bind(this);
        this.target.classList.add("container-fadeout"); //Animation - container disappears
        this.target.offsetWidth = this.target.offsetWidth;//Force the browser to reflow
        this.target.addEventListener("animationend", this.resolveBinded); //resolve if animationend is triggered
    });
    return this.fadeOutPromise;
}
Router.prototype.transitionFadeIn = function() {
    this.fadeInPromise = new Promise((resolve, reject)=> {
        this.resolveBinded = this.resolve(1).bind(this);
        this.target.addEventListener("animationend", this.resolveBinded);

        this.target.classList.remove("container-fadeout");
        this.target.classList.remove("container-non-appearent");
        this.target.classList.add("container-fadein");
        this.target.offsetWidth = this.target.offsetWidth;
    });
    return this.fadeInPromise;
}
Router.prototype.resolve = function(which) {
    if(which===0) {
        this.fadeOutPromise.resolve("OK");
    }
    else if(which===1) {
        this.fadeInPromise.resolve("OK");
    }
}*/
const t = document.querySelector("main");
new Router(t);