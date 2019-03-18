function Menu(menu, buttonShow, buttonHide) {
    //A function, that shows and hides the navigation menu
    //First parameter - referention to the menu
    //Menu and button must have classes menu-hidden, that hides the menu with CSS. Might be done anyhow
    //Second parameter - refferention to the hamburger button that shows the menu
    //Third parameter - refferention to the close buttton that hides the menu
    //CAUTION - ALL ELEMENTS OF THE MENU MUST HAVE A menu-part CLASS
    this.menu = menu;
    this.buttonShow = buttonShow;
    this.buttonHide = buttonHide;

    //buttons "show" and "hide" trigger functions that show or hide the menu
    this.buttonShow.addEventListener("click", this.show.bind(this));
    this.buttonHide.addEventListener("click", this.hide.bind(this))
}
Menu.prototype.show = function() {
    this.menu.classList.remove("menu-hidden"); //showing the menu
    this.menu.classList.add("aside-animation-show"); //animating the menu
    this.menu.offsetWidth=this.menu.offsetWidth; //a pollyfill for a bug - animation won't work more than once if you don't trigger reflow
    this.removeShowAnimationBinded=this.removeShowAnimation.bind(this);
    this.menu.addEventListener("animationend", this.removeShowAnimationBinded); //menu class must be removed when animation ends
    this.buttonShow.classList.add("button-hidden");

    //By clicking anywhere outside the menu user hides the menu
    this.bindedClickOutsideMenu = this.clickOutsideMenu.bind(this); //The bind must be assigned to a const, because event remover won't work with it written directly
    document.addEventListener("click", this.bindedClickOutsideMenu, true);
}
Menu.prototype.removeShowAnimation = function() {
    //An auxilliary method used in method show - could't do an arrow function because the event listener should be removed
    //remove the animation
    this.menu.classList.remove("aside-animation-show");
    //clean up
    this.menu.removeEventListener("animationend", this.removeShowAnimationBinded);
}
Menu.prototype.hide = function() {
    this.buttonShow.classList.remove("button-hidden");
    this.menu.classList.add("aside-animation-hide");
    this.menu.offsetWidth=this.menu.offsetWidth; //Forcing the browser to reflow
    this.removeHideAnimationBinded = this.removeHideAnimation.bind(this); //event listener should be removed afterwards, and it won't work with bind written directly
    this.menu.addEventListener("animationend", this.removeHideAnimationBinded);
    document.removeEventListener("click", this.bindedClickOutsideMenu, true); //Remove the event listener that closes the menu after clicking anywhere
}
Menu.prototype.removeHideAnimation= function() {
    this.menu.classList.add("menu-hidden"); //hide menu
    this.menu.classList.remove("aside-animation-hide"); //remove the animation
    this.menu.removeEventListener("animationend", this.removeHideAnimationBinded);
}
Menu.prototype.clickOutsideMenu = function(e) {
    if(!e.target.classList.contains("menu-part")) {
        //All the elements of the menu are labelled  with a "menu-part"
        //Clicking outside the menu = clicking an element without class "menu-part"
        this.hide();
    }
}
document.addEventListener("DOMContentLoaded", ()=>{
    const m = document.querySelector("aside");
    const bS = document.querySelector(".hamburger-btn");
    const bH = document.querySelector(".close-button");

    new Menu(m, bS, bH);
});