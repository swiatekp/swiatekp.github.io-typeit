// UWAGA
// Dodawać klasę quasi-input active do aktywnego quasi inputu!!
// KONIEC UWAGI ELO
function Game(gameContainer, resultsContainer, texts) {
    //First parameter - a reference to the container for the game
    //Second parameter - a reference to the container for results, steering etc
    //Third parameter - an url to a JSON with texts
        //The JSON keys should be numbers - starting with 0
        //Each value is an array
        //One line of text - one array element
    
    this.gameContainer = gameContainer;
    this.resultsContainer = resultsContainer;
    this.gameInfoHeader = this.resultsContainer.querySelector(".info-header");
    this.gameInfo = this.resultsContainer.querySelector('.game-info');
    this.resultHeader = this.resultsContainer.querySelector(".result-header");
    this.result = this.resultsContainer.querySelector(".result");
    this.resultSpeedContainer = this.result.querySelector(".speed-string");
    this.resultCommentContainer = this.result.querySelector(".speed-comment");
    
    //grade - images
    this.gradeImages = [];
    this.gradeImages.push(this.resultsContainer.querySelector(".grade-1"));
    this.gradeImages.push(this.resultsContainer.querySelector(".grade-2"));
    this.gradeImages.push(this.resultsContainer.querySelector(".grade-3"));
    this.gradeImages.push(this.resultsContainer.querySelector(".grade-4"));

    fetch(texts) //fetch the text
    .then(resp => {
        if(resp.ok) {
            return resp.json();
        }
        else {
            throw new Error("Błąd przy pobieraniu tekstu do gry");
        }
    })
    .then(resp=> {
        this.texts = resp;
        this.newGame();
    })
    .catch(error => {
        console.error(error)
        this.gameContainer.innerHTML+="Błąd ładowania pliku z tekstami";
    });
}
Game.prototype.newGame = function() {
    //Random text from json
    const random = Math.floor(Math.random()*Object.keys(this.texts).length); //Pseudo-random number from 0 to json length-1
    this.text = this.texts[`${random}`];

    this.createTextEditor();
    this.keydownHandlerBinded = this.keydownHandler.bind(this);
    document.addEventListener("keydown", this.keydownHandlerBinded);
    
    //Variables that define the state of application    
    this.isGameStarted = false;
    this.timeStarted = null;
    this.timeFinished = null;
    this.currentLine = 0;
    this.errorsCount = 0;
    this.firstLineVisible = 0;

    //Number of chars in the text - gonna need it to present the results
    this.numberOfCharsInText = 0;
    this.numberOfWordsInText = 0; 

    this.text.forEach(el => {
        this.numberOfCharsInText+=el.length; 
        let elSplitted = el.split(" "); //Separate words from text
        this.numberOfWordsInText += elSplitted.length;
    });

    //Hide the results and show the info
    this.gameInfoHeader.classList.remove("hidden");
    this.gameInfo.classList.remove("hidden");
    this.resultHeader.classList.add("hidden");
    this.result.classList.add("hidden");
}
Game.prototype.createTextEditor =  function() {
    //add everything that is now in game.html
    //text cursor
    this.documentFragment = document.createDocumentFragment();
    
    this.gameDiv = document.createElement("div"); //container
    this.gameDiv.classList.add("game");
    this.documentFragment.appendChild(this.gameDiv);

    this.promptH3 = document.createElement("h3"); //The prompt, that encourages to start typing
    this.promptH3.classList.add("gamestart-prompt");
    this.promptH3.innerText = "Zacznij pisać, gdy będziesz gotów";
    this.gameContainer.appendChild(this.promptH3);

    this.lineDivs = []; //array of references to the lines
    this.quasiInputs = []; //array of references to the quasi-inputs

    this.text.forEach((line, count) => { //iterate the text and create certains DOM elements for each line
        this.lineDivs[count] = document.createElement("div");
        this.lineDivs[count].classList.add("line");
        this.lineDivs.id = `div-line-${count}`;
        if(count>=5) {
            this.lineDivs[count].classList.add("line-hidden"); //Only 5 lines are displayed. As player progresses, first line visible will become invisible and first line invisible will become visible
        }
        this.gameDiv.appendChild(this.lineDivs[count]);

        const lineP = document.createElement("p");
        lineP.classList.add("line-text");
        lineP.innerText = line;
        this.lineDivs[count].appendChild(lineP);

        this.quasiInputs[count] = document.createElement("p");
        this.quasiInputs[count].classList.add("quasi-input");
        this.quasiInputs[count].classList.add("quasi-input-active");
        this.quasiInputs[count].charsTyped = []; //an array of references to the <span> elements that include the input letters
        this.lineDivs[count].appendChild(this.quasiInputs[count]);

    });
    this.quasiTextCursor = document.createElement("span"); //The blinking quasi text cursor is a span with certain CSS style
    this.quasiTextCursor.classList.add("quasi-text-cursor");
    this.quasiInputs[0].appendChild(this.quasiTextCursor);

    this.gameContainer.appendChild(this.documentFragment);
}
Game.prototype.keydownHandler = function(e) {
    if(this.isGameStarted === false) {
        this.startGame();
    }
    this.allowedKeysRegex = /^[a-z0-9ęóąśłżźćń\ ~!@#$%\^&\*()-\_\+\=\[\]\:;"'\|\\<,>\.\?\/]$/i
    //The regex must allow all typable chars - let the player make a mistake
    if(this.allowedKeysRegex.test(e.key)) {
        e.preventDefault();
        this.quasiInputs[this.currentLine].charsTyped.push(document.createElement("span"));
        let currentChar = this.quasiInputs[this.currentLine].charsTyped[this.quasiInputs[this.currentLine].charsTyped.length-1];
        currentChar.innerText = e.key;
        if(!this.validateChar(e.key)) {
            currentChar.classList.add("typing-error");
            this.errorsCount++;
        }
        this.quasiInputs[this.currentLine].insertBefore(currentChar, this.quasiTextCursor);

        if(this.quasiInputs[this.currentLine].charsTyped.length === this.text[this.currentLine].length) {
            //If the input length === the line length, go to the another line
            if(this.currentLine<this.text.length-1) {
                this.quasiInputs[this.currentLine].classList.remove("quasi-input-active");
                this.currentLine++;
                this.quasiInputs[this.currentLine].classList.add("quasi-input-active");
                this.updateCursorPosition();

                if(this.currentLine>=5) {
                    this.lineDivs[this.currentLine-5].classList.add("line-hidden"); 
                    this.lineDivs[this.currentLine].classList.remove("line-hidden");
                    this.firstLineVisible++;
                }
            }
            else {
                this.gameOver();
            }
        }
    }
    if(e.key === "Backspace") {
        if(this.quasiInputs[this.currentLine].charsTyped.length>0) {
            //If there's anything left in the input, remove it
            this.quasiInputs[this.currentLine].charsTyped[this.quasiInputs[this.currentLine].charsTyped.length-1].remove();
            this.quasiInputs[this.currentLine].charsTyped.pop();
        }
        else {
            //If the input is empty, return to the previous line, unless it's the first line
            if(this.currentLine>0) {
                this.quasiInputs[this.currentLine].classList.remove("quasi-input-active")
                this.currentLine--;
                this.quasiInputs[this.currentLine].classList.add("quasi-input-active");
                this.updateCursorPosition();

                //The lines rewind when you return to a hidden line
                if(this.currentLine<this.firstLineVisible) {
                    this.lineDivs[this.currentLine+5].classList.add("line-hidden"); 
                    this.lineDivs[this.currentLine].classList.remove("line-hidden");
                }
            }
        }
    }
}
Game.prototype.startGame = function() {
    this.isGameStarted = true;
    this.timeStarted = Date.now();
    this.promptH3.remove();
}
Game.prototype.validateChar = function(char) {
    if(this.text[this.currentLine].charAt(this.quasiInputs[this.currentLine].charsTyped.length-1) === char) {
        return true;
    }
    else {
        return false;
    }
}
Game.prototype.updateCursorPosition = function() {
    //Moves the cursor to the current line
    this.quasiTextCursor.remove(); //Remove the cursor from the previous line
    this.quasiInputs[this.currentLine].appendChild(this.quasiTextCursor) //Append the cursor to the next line
}
Game.prototype.gameOver = function() {
    this.timeFinished = Date.now();
    this.isGameStarted = false;
    document.removeEventListener("keydown", this.keydownHandlerBinded);
    this.quasiTextCursor.remove();
    this.quasiInputs[this.currentLine].classList.remove("quasi-input-active");

    this.minutes = (this.timeFinished-this.timeStarted)/60000;
    this.seconds = Math.floor(((this.timeFinished-this.timeStarted)%60000)/1000);
    
    //Add the leading zeros
    if(this.seconds<10) {
        this.seconds = `0${this.seconds}`;
    }
    this.thousandsOfASecond = Math.floor((this.timeFinished-this.timeStarted)%60000%1000);
    if(this.thousandsOfASecond < 10) {
        this.thousandsOfASecond = `00${this.thousandsOfASecond}`;
    }
    if(this.thousandsOfASecond>=10 && this.thousandsOfASecond<100) {
        this.thousandsOfASecond = `0${this.thousandsOfASecond}`;
    }
    this.charsPerMinute = Math.round(this.numberOfCharsInText/this.minutes);
    this.wordsPerMinute = Math.round(this.numberOfWordsInText/this.minutes);
    this.minutes = Math.floor(this.minutes);

    //Display the results 
    this.gameInfoHeader.classList.add("hidden");
    this.gameInfo.classList.add("hidden");
    
    if(this.charsPerMinute <= 50) {
        this.grade = 0;
        this.comment = "Niestety, jesteś bardzo wolny. Możesz poprawić się dzięki regularnemu korzystaniu z TypeIt!.";
    }
    else if(this.charsPerMinute>50 && this.charsPerMinute<=170) {
        this.grade = 1;
        this.comment = "Niestety, jesteś wolny. Możesz poprawić się dzięki regularnemu korzystaniu z TypeIt!.";
    }
    else if(this.charsPerMinute>170 && this.charsPerMinute<=250) {
        this.grade = 2;
        this.comment = "Gratulacje, jesteś szybki! Osiągnij mistrzowski poziom poprzez regularne korzystanie z TypeIt!."
    }
    else if(this.charsPerMinute>250) {
        this.grade = 3;
        this.comment = "Gratulacje, jesteś bardzo szybki!";
    }
    
    //Change the image color 
    this.gradeImages[this.grade].data = `img/speed-${this.grade+1}-blue.svg`;

    this.resultSpeedContainer.innerText = 
        `
        Twój czas to: ${this.minutes} m ${this.seconds} s ${this.thousandsOfASecond} ms. 
        Twoja prędkość to: ${this.charsPerMinute} znaków na minutę, ${this.wordsPerMinute} słów na minutę.
        Popełniłeś ${this.errorsCount} błędów.
        `;

    this.resultCommentContainer.innerText = this.comment;
    this.resultHeader.classList.remove("hidden");
    this.result.classList.remove("hidden");


}
document.addEventListener("routercontentloaded", ()=>{
    if(window.location.hash==="#game") {
        const g = document.querySelector(".game-container");
        const r = document.querySelector(".result-container");
        const texts = "js/texts-backup.json";
        new Game(g, r, texts);
    }
});