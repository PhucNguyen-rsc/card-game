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
gameStartButn.addEventListener('click', gameValidation);

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
    let card_faces_list = []

    const total_cards = document.getElementById('total-cards').value;
    const max_turns = document.getElementById('max-turns').value;
    const card_faces = document.getElementById('card-faces').value;

    if (total_cards < 2 || total_cards % 2 !== 0 || total_cards > 36){
        showError = true;
    }
    if (max_turns < total_cards/2){
        showError = true;
    }
    if (card_faces !== ''){ //present
        card_faces_list = card_faces.split(",");
        if (card_faces_list.length !== total_cards){
            showError = true;
        }

        else if (!checkSymbols(card_faces_list)){
            showError = true;
        }
    }
    else { // create and shuffle array
        for (let i = 1; i <= total_cards; i++){
            card_faces_list.push(i);
            card_faces_list.push(i);
        }

        for (let i = card_faces_list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [card_faces_list[i], card_faces_list[j]] = [card_faces_list[j], card_faces_list[i]];
        }
    }

    if (showError){
        errorMessageElement.classList.remove("hidden"); //visible
    }
    else{
        errorMessageElement.classList.add("hidden");
        startGame(max_turns, card_faces_list)
    }
}

function checkMatch(){

}

function gameBoard(cards, max_turns){
    let turn = 0
    let match = false;
    let keep_track = {}; // index : value
    let matchedCard = [];

    const matchResult = document.createElement('div') //display message
    matchResult.style.margin = "10px";

    const quitBtn = document.querySelector('.quit-button')

    const okayBtn = document.createElement('button') //okay button to keep going on
    okayBtn.textContent = "OK";
    okayBtn.style.margin = "10px";
    okayBtn.addEventListener('click', function(){
        if (!matchResult.classList.contains('hidden')) {
            matchResult.classList.add('hidden');
        }
        okayBtn.classList.add('hidden');
        quitBtn.classList.remove('hidden');

        //flipping the cards down
        if (!match){
            Object.keys(keep_track).forEach(key => {
                let flipCard = gameElement.children[parseInt(key, "10")];
                console.log("flipcard: ", flipCard);
                flipCard.textContent = '';
            });
        }
        keep_track = {};
        match = false
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
            console.log("KEEP TRACK: ", keep_track);
            if (!matchedCard.includes(this.getAttribute('orderID'))) { // if matched already -->freeze
                if ( Object.keys(keep_track).length < 2){
                    if (this.textContent !== this.getAttribute('secretText')) { //down to up
                        this.textContent = this.getAttribute('secretText');
                        keep_track[this.getAttribute('orderID')] = this.getAttribute('secretText');
                    } 
                    else { //up to down
                        delete keep_track[this.orderID]
                        this.textContent = '';
                    }
                }
        
                else{ //if more --> freeze
                    turn +=1;               
                    updateTurn(turn, max_turns);

                    const keep_track_values =  Object.values(keep_track);
                    const keep_track_idx = Object.keys(keep_track);
                    const allSame = keep_track_values.every(value => value === keep_track_values[0]);
                    if (allSame){
                        matchedCard = [...matchedCard, ...keep_track_idx];
                        match = true;
                    }
                    else{ // oops not this match
                        matchResult.innerHTML = "<p>No Match! Press Okay!</p>";
                        matchResult.classList.remove('hidden');
                    }
                    okayBtn.classList.remove('hidden');
                }
            }
            checkGameEnd(matchedCard, cards, turn, max_turns);
        });

        gameElement.appendChild(card);
    }

    gameElement.classList.remove('hidden');
}

function checkGameEnd(matchedCard, cards, turn, max_turns) {
    if (matchedCard.length === cards.length) {
        endingPage(true); // render winning page
    } else if (turn >= max_turns) {
        endingPage(false); // render losing page
    }
}

function updateTurn(turn, max_turns){
    const count = document.querySelector('.turn-counter');
    count.innerHTML = `TURN ${turn}/${max_turns}`;
}

function startGame(max_turns, cards){
    const startPage = document.querySelector('.start');
    startPage.classList.add("hidden");

    const quitBtn = document.createElement('button');

    const turnCount = document.createElement('div');
    turnCount.className = "turn-counter";
    turnCount.innerHTML = `TURN 0/${max_turns}`;

    const referenceElement = document.body.children[3];
    document.body.insertBefore(turnCount, referenceElement);

    quitBtn.className = 'quit-button';
    quitBtn.style.margin = '20px'
    quitBtn.textContent = 'Quit';
    document.body.appendChild(quitBtn);

    quitBtn.addEventListener('click', function() {
        startPage.classList.remove('hidden'); //show inital page
        gameElement.classList.add("hidden");
        turnCount.classList.add('hidden');
    });

    gameBoard(cards, max_turns);

}

function endingPage(winning){
    if (winning){
        console.log("WINNING");
    }
    else{
        console.log("LOSING");
    }
}
