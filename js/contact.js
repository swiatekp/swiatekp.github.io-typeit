function FormValidator(apiUrl, form, ...inputs ) {
    //First parameter - an url to an API, that will process the form
    //Second parameter - a refferention to the form
    //Third and the next ones - refferention to the form fields, that should be validated
    this.apiUrl = apiUrl;
    this.form = form,
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
            if(this.validateValue(e.target, 20, /^[a-zęóąśłżźćń0-9 .!%()-_=+;:,.?]+$/i)) {
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
    //Third parameter - error type (0 for no input, 1 for max length exceedeed and 2 for wrong regex) 
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
    this.formIsReady = true;
    this.inputs.forEach(el => {
        
    })
}
document.addEventListener("routercontentloaded", ()=> {
    const formRef = document.querySelector(".contact-form");
    new FormValidator("http://dupa.pl", formRef, document.querySelector("#contact-name"), document.querySelector("#contact-subject"), document.querySelector("#contact-email"), document.querySelector("#contact-content"));
});