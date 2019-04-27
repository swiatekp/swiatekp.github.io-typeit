TypeIt!
========
An application that helps you learn to type faster.  
For the project preview, check https://swiatekp.github.io/typeit.

## CSS
The CSS was written with SASS. The styles are divided to 5 files:
* app.scss - the main stylesheet for the whole layout; common for all the subpages;
* contact.scss - the stylesheet for the #contact subpage;
* game.scss - the stylesheet for the #game subpage;
* menu.scss - the stylesheet for the drop-down menu;
* router-animation.scss - the stylesheet that contains the animation, which is played when subpages are changed.

## Contact.js
Contact.js handles the contact form, which is avaiable on #contact subpage (if window.location.hash equals contact).  
The script sends e-mails through Email JS API. It demands putting the certain <script> line into index.html.    
The FormValidator constructor takes the following parameters:
* first parameter - an object, that contains Email JS connection parameters:
~~~~
  {
      serviceId: '<YOUR SERVICE ID>'
      templateId: '<YOUR TEMPLATE ID>' 
  }
~~~~
* second parameter - a reference to the form;
* third parameter - a reference to a field, which will be used as a honeypot;
* fourth and the next ones - references to the fields - text, textarea and e-mail allowed.   

The FormValidator class has the following methods:
* validateField() - is triggered with focusout event on the inputs;
* validateValue() - checks up the values - is triggered by validateField();
* displayError() - shows an input error; Errors are kept in Input.errors[] arrays; every input has its array;
* removeError() - removes errors;
* submitHandler() - handles the form submit event; if the form is sent properly, a popup is shown;
* fadeInAnimationEnd() - is triggered when the pop-up showing animation is finished;
* fadeOutAnimationEnd() - is triggered, when pop-up hiding animation is finished;
* removePopup() - removes the pop up. Is triggered with close-button click and Escape keydown. 

## game.js
This file handles the game.    
The constructor Game takes three parameters:
* first - a reference to the container, where the game will be played;
* second - a reference to the container, where the game results will be displayed;
* third - an URL to a JSON with texts to play with.  
The JSON keys should be numbers - starting with 0  
Each value is an array  
One line of text - one array element

~~~~
{
  "0" : [
      "The first line of text",
      "The second line of text",
      "The third line of text"
  ],
  "1" : [
      "The first line of text",
      "The second line of text",
      "The third line of text"
  ]
}
~~~~    
The constructor fetches the JSON and then calls newGame();. The newGame() draws a random text from the json and calls createTextEditor();

The constructor Game() has the following methods:
* newGame() - initiates a new game;
* createTextEditor() - creates all the html in game container
* keydownHandler() - handles the keydown event, checks if the user pressed the correct button, prints the typed text, updates cursor position, triggers gameOver() if neccessary;
* startGame() - initiates the game;
* updateCursorPosition() - updates the cursor position, when the line is changed;
* gameOver() - computes and displays the results.

## Menu.js
Menu.js handles the menu, that appears when the hamburger button is clicked.  
The Menu() constructor takes three parameters:
* first parameter - a reference to the menu HTML;
* second parameter - a reference to the to the hamburger button;
* third parameter - a reference to the close button;  
Important - every single HTML element of the menu must have a menu-part class!  
The Menu() contructor has the following methods:
* show() - shows the menu;
* removeShowAnimation() - an auxilliary method used by show() method to clean up the mess; it is triggered by animationend event; couldn't do it in a more elegant way, like an arrow function, because the animationend event listener has to be removed;
* hide() - hides the menu;
* removeHideAnimation() - an equivalent of removeShowAnimation() for hide();
* clickOutsideMenu() - triggers the hide() method when the user clicks anywhere outside the menu;

## Router.js
Router.js is the script that handles the subpages switching and makes the app a SPA (Single Page Application). It displays the html files from views directory using fetch().  

The script is informed which file should be displayed, using the #hashtag inside the URL.  

When a page is loaded, Router() triggers a routercontentloaded custom event, to inform the other scripts, that the DOM elements they need are already there. That's why contact.js and router.js call their constructors inside something like this:
~~~~
document.addEventListener("routercontentloaded", ()=> {
  ...
});
~~~~
The Router() takes one parameter - a reference to a DOM element, that shall contain the views.  
There are 5 methods in the Router() constructor:
* checkHashValidity() - checks, if the hash is passes the regex test; 
* hashChangeHandler() - changes the subpage, if the hash is correct. If it isn't, changes the hash back to the previous one;
* readHTML() - fetches the html file and puts it in the container;
* fadeout() - an auxilliary method used by readHTML to handle the animation; an equivalent of Menu.prototype.removeShowApplication(), which is described above; this one is used to make the previous content fade away;
* fadein() - an equivalent of fadeout(), that makes the next content fade in.

## Views directory
The views directory contains html files that are switched by Router().  

## Img directory
The img directory contains all of the images used in the project. 
