function FormValidator(emailjsConfig, form, honeypot, ...inputs ) {
    //The script requests an Email JS API to work correctly - https://www.emailjs.com 
    //To get it working properly, add certain lines to your index.html first - find out more in emailjs documentation
    //First parameter - object - email JS config
    //Example:
    //{
    //  serviceId: '<YOUR SERVICE ID>
    //  templateId: '<YOUR TEMPLATE ID> 
    //}
    //Second parameter - a refferention to the form
    //Third parameter - a refferention to a field, which is a honeypot
    //Fourth and the next ones - refferention to the form fields, that should be validated
    this.emailjsConfig = emailjsConfig;
    this.form = form;
    this.form.errors =[];
    this.honeypot = honeypot;
    this.honeypot.classList.add("hp"); //hide the honeypot
    this.inputs = inputs;

    this.form.addEventListener("submit", this.submitHandler.bind(this));
    this.inputs.forEach(input=>{
        input.addEventListener("focusout", this.validateField.bind(this));
        input.errors = []; //This array will gather input errors - as refferentions to divs that will display error texts
    });
}
FormValidator.prototype.validateField = function(e) {
    e.stopPropagation();

    this.removeError(e.target, 0); //remove the old errors
    this.removeError(e.target, 1);
    this.removeError(e.target, 2);
    
    //Validation common for all the types of fields
    if(e.target.value === "") {
        this.displayError(e.target, `Pole <i>${e.target.name}</i> powinno zostać wypełnione`, 0);
        return false;
    }
    else {
        this.removeError(e.target, 0); //this.removeError checks if there were errors displayed and eventually removes them
        if(e.target.type === "text") {
            if(this.validateValue(e.target, 150, /^[a-zęóąśłżźćń0-9 .!%()-_=+;:,.?]+$/i)) {
                return true;
            }
            else {
                return false;
            }
        }
        else if(e.target.type==="email") {
            if(this.validateValue(e.target, 254, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i)) {
                return true;
            }
            else {
                return false;
            }
        }
        else if(e.target.tagName==="TEXTAREA") {
            if(this.validateValue(e.target, 255, /^[a-zęóąśłżźćń0-9 .!%()-_=+;:,.?]+$/i)) {
                return true;
            }
            else {
                return false;
            }
        }
    }
}
FormValidator.prototype.validateValue=function(target, maxLength, regEx) {
    //Input length
    if(target.value.length > maxLength) {
        this.displayError(target, `Pole <i>${target.name}</i>: Maksymalna długość wynosi ${maxLength} znaków`, 1);
        this.lengthOK = false;
    }
    else {
        this.removeError(target, 1)
        this.lengthOK = true; 
    }

    //Input regex
    if(regEx.test(target.value)) {
        if(this.lengthOK===true) {
            this.removeError(target, 2)
        }
        this.regeExOK = true;
    }
    else {
        this.displayError(target, `Pole <i>${target.name}</i>: Nieprawidłowa zawartość`, 2);
        this.regExOK = false;
    }
    if(this.lengthOK===true && this.regExOK ===true) {
        return true;
    }
    else {
        return false;
    }
}
FormValidator.prototype.displayError=function(field, errorText, errType) {
    //First parameter - refferention to form field
    //Second parameter - error Text 
    //Third parameter - error type (0 for no input, 1 for max length exceedeed, 2 for wrong regex 3 for form sending error) 
    //Error type is necessary for error removal

    
    if(field.errors.length===0 || field.errors.find((el)=>{
        if(el[1]===errType) {
            return true; //looking for the same type error. If there is one, there is no need to add another error
        }
    })===undefined ) {
        field.classList.add("input-error"); //the field with an error gets a style

        this.errDiv=document.createElement("div"); //create the container for the error message;
        this.errDiv.classList.add("contact-error-container");
    
        this.warningPic = document.createElement("object");
        this.warningPic.type = "image/svg+xml";
        this.warningPic.data ="img/warning2.svg";
        this.warningPic.classList.add("contact-warning-pic");

        this.errDiv.appendChild(this.warningPic);
        this.errDiv.innerHTML+= `<span>${errorText}</span>`;
        this.form.appendChild(this.errDiv);
   
        field.errors.push([this.errDiv, errType]); //Add error to the error array (errors of certain type and related to certain fields must be removed when field is correct)
    }
}
FormValidator.prototype.removeError=function(field, type) {
    if(field.errors.length>0) {
        field.errors.forEach((el, count) => {
            if(el[1]===type) {
                el[0].remove(); //Remove error from the DOM
                field.errors.splice(count, 1); //Remove error from array
            }
        });
    }
    field.classList.remove("input-error");
} 
FormValidator.prototype.submitHandler = function(e) {
    e.preventDefault();
    if(this.honeypot.value === "") {
        this.popupMessage = document.querySelector(".contact-popup-container");
        this.popupCloseButton = document.querySelector(".contact-close-button");
        this.removePopupBinded = this.removePopup.bind(this);
        this.popupCloseButton.addEventListener("click", this.removePopupBinded);    
        this.loading = document.querySelector(".loading");
        this.loading.classList.remove("hidden"); //Show an animation of loading

        emailjs.sendForm(this.emailjsConfig.serviceId, this.emailjsConfig.templateId, this.form)
        .then(()=>{
            this.removeError(this.form, 3); //Removes the sending error if one previously occured
            this.loading.classList.add("hidden");
            this.popupMessage.classList.remove("hidden");
            this.popupMessage.classList.add("container-fadein");
            this.fadeInAnimationEndBinded=this.fadeInAnimationEnd.bind(this);
            this.popupMessage.addEventListener("animationend", this.fadeInAnimationEndBinded);
            this.popupMessage.offsetWidth=this.popupMessage.offsetWidth; //Force the browser to reflow
        })
        .catch((error) => {
            console.log(error);
            this.loading.classList.add("hidden");
            this.displayError(this.form, "Błąd wysyłania formularza", 3);
        })
    }
}
FormValidator.prototype.fadeInAnimationEnd = function() {
    this.popupMessage.removeEventListener("animationend", this.fadeInAnimationEndBinded);
    this.popupMessage.classList.remove("container-fadein");
    console.log("fade in animation end");
}
FormValidator.prototype.fadeOutAnimationEnd = function() {
    console.log("fade out animation end");
    this.popupMessage.classList.add("hidden");
    this.popupMessage.classList.remove("container-fadeout");
    this.popupMessage.removeEventListener("animationend", this.fadeOutAnimationEndBinded);
}
FormValidator.prototype.removePopup = function(e) {
    e.stopPropagation();
    this.popupMessage.classList.add("container-fadeout");
    this.popupMessage.offsetWidth = this.popupMessage.offsetWidth; //force the browser to reflow
    this.fadeOutAnimationEndBinded = this.fadeOutAnimationEnd.bind(this);
    this.popupMessage.addEventListener("animationend", this.fadeOutAnimationEndBinded);
}
document.addEventListener("routercontentloaded", ()=> {
    //routercontentloaded is a custom event that is triggered when a subpage is loaded by router.js
    //you need to wait for it to be triggered to catch refferentions to DOM elements that are in the subpages
    
    const mailjsConf = {
        serviceId: "contact",
        templateId: "contact_form"
    }
    const formRef = document.querySelector(".contact-form");
    const honeypotRef = document.querySelector("#contact-surname");
    const nameRef = document.querySelector("#contact-name");
    const subjectRef = document.querySelector("#contact-subject");
    const emailRef = document.querySelector("#contact-email");
    const contentRef = document.querySelector("#contact-content");

    new FormValidator(mailjsConf, formRef, honeypotRef, nameRef, subjectRef, emailRef, contentRef);
});