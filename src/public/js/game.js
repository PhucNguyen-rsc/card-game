// game.js
const gameElement = document.querySelector('.game');
gameElement.classList.add("hidden");
const resultElement = document.querySelector('.result');
resultElement.classList.add("hidden");
const resetElement = document.querySelector('.reset');
resetElement.classList.add("hidden");
const errorMessageElement = document.querySelector('.error-message');
errorMessageElement.classList.add("hidden");

const gameStartButn = document.querySelector('.play-btn');

const scoreStored = localStorage.getItem("scores"); // {'turn: max turn'}
let scores = {};
const scorePrevShow = document.createElement("div");
scorePrevShow.className = "prev-score-show";
scorePrevShow.innerHTML = "<p>Previous Score:<p>";
scorePrevShow.innerHTML += "<p>Turn / Max Turn<p>";

if (scoreStored !== null) {
    scores = JSON.parse(scoreStored);
    if (Object.keys(scores).length > 0) {
        for (const [turn, maxTurn] of Object.entries(scores)) {
            scorePrevShow.innerHTML += `<li>${turn} / ${maxTurn}</li>`;
        }
    }
}

const startPg = document.body.querySelector(".start");
startPg.appendChild(scorePrevShow);

function checkSymbols(arr) {
    const count = {};
    for (const element of arr) {
        count[element] = (count[element] || 0) + 1;
    }
    for (const value of Object.values(count)) {
        if (value !== 2) {
            return false;
        }
    }
    
    return true;
}

function gameValidation(){
    let showError = false;
    let cardFacesList = [];

    const totalCards = document.getElementById('total-cards').value;
    const maxTurns = document.getElementById('max-turns').value;
    const cardFaces = document.getElementById('card-faces').value;

    if (totalCards < 2 || totalCards % 2 !== 0 || totalCards > 36){
        showError = true;
    }
    if (maxTurns < totalCards/2){
        showError = true;
    }
    if (cardFaces !== ''){ //present
        cardFacesList = cardFaces.split(",");
        if (cardFacesList.length !== totalCards * 2){
            showError = true;
        }

        else if (!checkSymbols(cardFacesList)){
            showError = true;
        }
    }
    else { // create and shuffle array
        for (let i = 1; i <= totalCards; i++){
            cardFacesList.push(i);
            cardFacesList.push(i);
        }

        for (let i = cardFacesList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardFacesList[i], cardFacesList[j]] = [cardFacesList[j], cardFacesList[i]];
        }
    }

    if (showError){
        errorMessageElement.classList.remove("hidden"); //visible
    }
    else{
        errorMessageElement.classList.add("hidden");
        startGame(maxTurns, cardFacesList);
    }
}

gameStartButn.addEventListener('click', gameValidation);

function endingPage(winning){
    if (winning){
        resultElement.textContent = "YOU WIN:";
    }
    else{
        resultElement.textContent = "YOU LOST:";
    }
        
    const quitBtn= document.querySelector(".quit-button");
    const okayBtn = document.querySelector(".okay-button");

    okayBtn.classList.add('hidden');
    gameElement.innerHTML = '';
    gameElement.classList.add("hidden");
    quitBtn.classList.add('hidden');
    resetElement.classList.remove("hidden");
    resultElement.classList.remove('hidden');
    resetElement.style.margin = "10px";
}

function updateTurn(turn, maxTurns){
    const count = document.querySelector('.turn-counter');
    count.innerHTML = `TURN ${turn}/${maxTurns}`;
}


function checkMatch(keepTrack, matchedCard){
    const okayBtn = document.querySelector('.okay-button');
    const matchResult = document.querySelector('.match-result');

    const keepTrackValues = Object.values(keepTrack);
    const keepTrackIdx = Object.keys(keepTrack);
    const allSame = keepTrackValues.every(value => value === keepTrackValues[0]);

    if (allSame){ 
        matchedCard = [...matchedCard, ...keepTrackIdx];
    }
    else{ // oops not this match
        matchResult.innerHTML = "<p>No Match! Press Okay!</p>";
        matchResult.classList.remove('hidden');
    }

    okayBtn.classList.remove('hidden');

    return [matchedCard, allSame];
}

function checkGameEnd(matchedCard, cards, turn, maxTurns) {
    if (matchedCard.length === cards.length) { // winning        
        scores[turn] = maxTurns;
        localStorage.setItem("scores", JSON.stringify(scores));

        endingPage(true); 
    } else if (turn >= maxTurns) {
        endingPage(false); // render losing page
    }
}

function gameBoard(cards, maxTurns){
    let turn = 0;
    let match = false;
    let clickOkBtn = true;
    let keepTrack = {}; // index : value
    let matchedCard = [];

    const matchResult = document.createElement('div'); //display message
    matchResult.className = 'match-result';
    matchResult.style.margin = "10px";

    const quitBtn = document.querySelector('.quit-button');

    const okayBtn = document.createElement('button'); //okay button to keep going on
    okayBtn.className = 'okay-button';
    okayBtn.textContent = "OK";
    okayBtn.style.margin = "10px";
    okayBtn.addEventListener('click', function(){
        clickOkBtn = true;
        if (!matchResult.classList.contains('hidden')) {
            matchResult.classList.add('hidden');
        }
        okayBtn.classList.add('hidden');
        quitBtn.classList.remove('hidden');

        //flipping the cards down
        if (!match){
            Object.keys(keepTrack).forEach(key => {
                const flipCard = gameElement.children[parseInt(key, "10")];
                flipCard.textContent = '';
            });
        }
        keepTrack = {};
        match = false;
    });

    document.body.insertBefore(matchResult, quitBtn);
    document.body.insertBefore(okayBtn, quitBtn);

    matchResult.classList.add('hidden');
    okayBtn.classList.add('hidden');


    let rows = Math.floor(Math.sqrt(cards.length));
    let cols = Math.ceil(cards.length / rows);

    while (cards.length % rows !== 0) {
        rows--;
        cols = Math.ceil(cards.length / rows);
    }

    gameElement.style.display = 'grid';
    gameElement.style.gridTemplateColumns = `repeat(${cols}, auto)`;
    gameElement.style.gridTemplateRows = `repeat(${rows}, auto)`;
    gameElement.style.gap = '5px';
    gameElement.style.justifyContent = 'center';
    gameElement.style.alignContent = 'center';

    gameElement.innerHTML = ''; //clearing the grid

    for (let i = 0; i < cards.length; i++) {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('orderID', `${i}`); // each card will have id to keep track of
        card.setAttribute('secretText', `${cards[i]}`);
        card.textContent = ``;

        card.addEventListener('click', function (){
            if (clickOkBtn){
                if (!matchedCard.includes(this.getAttribute('orderID'))) { // if matched already -->freeze
                    if (this.textContent !== this.getAttribute('secretText')) { //down to up
                        this.textContent = this.getAttribute('secretText');
                        keepTrack[this.getAttribute('orderID')] = this.getAttribute('secretText');
                    } 
                    else { //up to down
                        delete keepTrack[this.getAttribute('orderID')];
                        this.textContent = '';
                    }
                
                    if (Object.keys(keepTrack).length === 2){
                        turn +=1;               
                        clickOkBtn = false;
                        [matchedCard, match] = checkMatch(keepTrack, matchedCard);
                        checkGameEnd(matchedCard, cards, turn, maxTurns);
                        updateTurn(turn, maxTurns);
                    }
                }
            }
        });
        gameElement.appendChild(card);
    }

    gameElement.classList.remove('hidden');
}

function startGame(maxTurns, cards){
    const startPage = document.querySelector('.start');
    startPage.classList.add("hidden");

    const quitBtn = document.createElement('button');

    const turnCount = document.createElement('div');
    turnCount.className = "turn-counter";
    turnCount.innerHTML = `TURN 0/${maxTurns}`;

    const referenceElement = document.body.children[3];
    document.body.insertBefore(turnCount, referenceElement);

    quitBtn.className = 'quit-button';
    quitBtn.style.margin = '20px';
    quitBtn.textContent = 'Quit';
    document.body.appendChild(quitBtn);

    quitBtn.addEventListener('click', function() {
        startPage.classList.remove('hidden'); //show inital page
        gameElement.innerHTML = '';
        gameElement.classList.add("hidden");
        quitBtn.classList.add('hidden');
        turnCount.classList.add('hidden');
    });

    gameBoard(cards, maxTurns);
}