var model = {
    selectedCount: 0,
    selectedCellIds: [],

    baseSpeed: undefined,
    baseNumberOfCells: undefined,
    speedIncrement: undefined,
    numberOfCellsIncrement: undefined,

    numberOfCells: undefined,
    cellIds: [],
    speed: undefined,

    currentLevel: 1,
    numberOfLevels: undefined,
    
    updateCellsOrder: function(index) {
        let numberOfSelectedCells = this.selectedCellIds.length;

        for(let i = numberOfSelectedCells - 1, j = 0; i >= index; i--, j++) {
            let cellId = model.selectedCellIds[i];
            let cell = document.getElementById(cellId);
            view.setNumber(cell, model.selectedCount- j);
        }
    },  

    generateCellId: function() {
        let x = Math.floor(Math.random() * 5);
        let y = Math.floor(Math.random() * 5);
        return x + '' + y;
    },

    checkDuplicateId: function(cellId) {
        return this.cellIds.some(function(existedCellId) {
            return cellId == existedCellId;
        }) 
    },

    generateCells: function() {
        for(let i = 0; i < this.numberOfCells; i++) {
            let cellId;
            do {
                cellId = this.generateCellId();
            }
            while(this.checkDuplicateId(cellId));

            this.cellIds.push(cellId); 
        }
        view.demonstrate(this.cellIds);
    },

    checkAnswer: function() {
        controller.disableMouseInteract();
        controller.mode = 2;
        view.showAnswer();
        controller.checkWin();
        for(let i = 0; i < model.numberOfCells; i++) {
            if(model.selectedCellIds[i] != model.cellIds[i]) {
                controller.levelSuccess = false;
                view.display(controller.mode);
                return;
            }
        }
        controller.levelSuccess = true;
        view.display(controller.mode);
    },

    reset: function() {
        for(let i = 0; i < model.selectedCellIds.length; i++) {
            let selectedCellId = model.selectedCellIds[i];
            let selectedCell = document.getElementById(selectedCellId); 
            view.setDefaultColor(selectedCell);
            view.removeNumber(selectedCell);
            
            if(controller.mode == 2) {
                let cellId = model.cellIds[i];
                let cell = document.getElementById(cellId); 
                
                view.setDefaultColor(cell);
                view.removeNumber(cell);
            }
        }
        
        model.selectedCellIds = [];
        model.selectedCount = 0;
        if(controller.mode == 2) {
            model.cellIds = [];
        }
    },

}

var view = {

    setRandomColor: function(cell) {
        let randomRed = Math.ceil(Math.random() * 255 + 1);
        let randomGreen = Math.ceil(Math.random() * 255 + 1);
        let randomBlue = Math.ceil(Math.random() * 255 + 1);

        // Event when hover or click on cells
        if(this.id) {
            this.style.backgroundColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;
        }
        else { // During demonstration
            cell.style.backgroundColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;
        }
    },

    setDefaultColor: function(cell) {
        if(this.id) {
            this.style.backgroundColor = 'white';
        }
        else {
            cell.style.backgroundColor = 'white';
        }
    },

    setNumber: function(cell, number = model.selectedCount) {
        cell.innerText = number;
    },

    removeNumber: function(cell) {
        cell.innerText = '';
    },

    demonstrate: function(cellIds) {
        // Wait until all cells are rendered
        this.renderCells(cellIds).then(function() {
            // Hide cells and let user select cells after 1 second
            setTimeout(view.hide, 1000, cellIds);
            setTimeout(controller.enableMouseInteract, 1000);
        })
    },

    hide: function(cellIds) {
        for(let cellId of cellIds) {
            let cell = document.getElementById(cellId);
            cell.style.backgroundColor = 'white';
        }
    },

    showAnswer: function() {
        for(let i = 0; i < model.numberOfCells; i++) {
            let selectedCell = document.getElementById(model.selectedCellIds[i]);
            let cell = document.getElementById(model.cellIds[i]); 

            if(cell == selectedCell) {
                selectedCell.style.backgroundColor = 'green';
            }
            else {
                selectedCell.style.backgroundColor = 'red';
                cell.style.backgroundColor = 'red';
            }

            cell.innerText += `[${i+1}]`
            
        }
    },

    renderCells: function(cellIds) {
        let time = Math.ceil(1000 / parseInt(model.speed));

        return new Promise(function(resolve) {
            for(let i = 0; i < model.numberOfCells; i++) {
                let cellId = cellIds[i];
                let cell = document.getElementById(cellId);
                setTimeout(view.setRandomColor, time * i, cell);
            }
            setTimeout(resolve, time * parseInt(model.numberOfCells));
        })
    },

    displayBtn: function(btnId, status) {
        let btn = document.getElementById(btnId);
        if(status == 1) {
            btn.style.display = 'inline';
        } 
        else {
            btn.style.display = 'none';
        }
    },

    displayDifficulty: function(difficulty) {
        let difficultyElement = document.getElementById('difficulty');
        difficultyElement.innerText = difficulty.toUpperCase();
        switch(difficulty) {
            case 'easy':
                difficultyElement.style.backgroundColor = 'rgb(43, 160, 43)';
                break;
            case 'medium':
                difficultyElement.style.backgroundColor = 'rgb(61, 167, 216)';
                break;
            case 'hard':
                difficultyElement.style.backgroundColor = 'red';
                break;
            case 'insane':
                difficultyElement.style.backgroundColor = 'purple';
                break;
            default:
                difficultyElement.style.backgroundColor = '#FDAC53';
        }
    },

    displayMessage: function(message) {
        let messageElement = document.getElementById('message');
        messageElement.innerText = message;
        if(controller.isWin || controller.levelSuccess) {
            messageElement.style.color = 'green';
        }
        else {
            messageElement.style.color = 'red';
        }
    },

    displayLevel: function(level) {
        let levelElement = document.getElementById('level');
        levelElement.innerText = `Level ${level}`;
    },

    displayMode: function(mode) {
        let modeElement = document.getElementById('mode');
        if(mode == 0) {
            modeElement.innerText = 'WARM UP';
        }
        else if(mode == 1) {
            modeElement.innerText = 'PLAY';
        }
        else {
            modeElement.innerText = 'RESULT';
        }
    },
    
    display: function(mode = 0) {
        view.displayMode(mode);
        view.displayLevel(model.currentLevel);
        view.displayDifficulty(controller.difficulty);
    
        switch(mode) {
            case 0:
                if(model.currentLevel == 1) {
                    view.displayBtn('easy', 1);
                    view.displayBtn('medium', 1);
                    view.displayBtn('hard', 1);
                    view.displayBtn('insane', 1);
                }
                view.displayBtn('try-again', 0);
                view.displayBtn('next', 0);
                view.displayBtn('clear', 1);
                break;
            case 1:
                view.displayBtn('easy', 0);
                view.displayBtn('medium', 0);
                view.displayBtn('hard', 0);
                view.displayBtn('insane', 0);
                view.displayBtn('try-again', 0);
                view.displayBtn('next', 0);
                view.displayBtn('clear', 1);
                break;
            case 2:
                view.displayBtn('easy', 0);
                view.displayBtn('medium', 0);
                view.displayBtn('hard', 0);
                view.displayBtn('insane', 0);
                if(controller.levelSuccess && controller.isWin == false) {
                    view.displayBtn('next', 1);
                    view.displayBtn('try-again', 0);
                    view.displayMessage('Level completed. Amazing good job :D');
                }
                else if(controller.isWin){
                    view.displayBtn('next', 0);
                    view.displayBtn('try-again', 1);
                    view.displayMessage('You win. Play another game?');
                }
                else {
                    view.displayBtn('next', 0);
                    view.displayBtn('try-again', 1);
                    view.displayMessage('You failed. Try again :(');

                }
                view.displayBtn('clear', 0);
                break;
        }
    }

}

var controller = {
    // 0: warm up mode, 1: play mode, 2: Result
    mode: 0,
    isWin: false,
    levelSuccess: false,
    difficulty: '',

    instantiateLevel: function(difficulty) {
        switch(difficulty) {
            case 'easy':
                model.baseSpeed = 1;
                model.baseNumberOfCells = 3;
                model.speedIncrement = 0.5;
                model.numberOfCellsIncrement = 1;
                model.numberOfLevels = 10;
                controller.difficulty = 'easy';
                break;
            case 'medium':
                model.baseSpeed = 1;
                model.baseNumberOfCells = 4;
                model.speedIncrement = 0.8;
                model.numberOfCellsIncrement = 1;
                model.numberOfLevels = 10;
                controller.difficulty = 'medium';
                break;
            case 'hard':
                model.baseSpeed = 1.5;
                model.baseNumberOfCells = 4;
                model.speedIncrement = 1;
                model.numberOfCellsIncrement = 1;
                model.numberOfLevels = 15;
                controller.difficulty = 'hard';
                break;
            case 'insane':
                model.baseSpeed = 1.8;
                model.baseNumberOfCells = 4;
                model.speedIncrement = 1.5;
                model.numberOfCellsIncrement = 2;
                model.numberOfLevels = 20;
                controller.difficulty = 'insane';
                break;
        }
        controller.start();
    },

    start: function() {
        model.speed = model.baseSpeed;
        model.numberOfCells = model.baseNumberOfCells; 
        model.reset();
        controller.disableMouseInteract();
        controller.mode = 1;
        model.generateCells();
        view.display(controller.mode);
    },

    processGuess: function(e) {
        let cell = e.target;
        if(cell.onmouseenter) {
            controller.selectCell(cell);
        }
        else {
            controller.deselectCell(cell);
        }

        if(model.selectedCellIds.length == model.numberOfCells && controller.mode == 1) {
            model.checkAnswer();
        }
    },

    levelUp: function() {
        model.currentLevel++;    
        controller.increaseSpeed(model.currentLevel);
        controller.increaseNumberOfCells(model.currentLevel);
    },

    checkWin: function() {
        if(model.currentLevel == model.numberOfLevels) {
            controller.isWin = true;
        }
    },
    
    resetGame: function() {
        controller.levelSuccess = false;
        controller.difficulty = '';
        model.currentLevel = 1;
        model.speed = model.baseSpeed;
        model.numberOfCells = model.baseNumberOfCells;
    },

    increaseSpeed: function(level) {
        if(level % 3 == 0) {
            model.speed += model.speedIncrement;
        }
    },

    increaseNumberOfCells: function(level) {
        if(level % 4 == 0) {
            model.numberOfCells += model.numberOfCellsIncrement;
        }
    },
    
    selectCell: function(cell) {
        cell.onmouseenter = undefined;
        cell.onmouseleave = undefined; 
        model.selectedCount++;
        view.setNumber(cell);
        model.selectedCellIds.push(cell.id);
    },
    
    deselectCell: function(cell) {
        let cellId = cell.id;
        let index = model.selectedCellIds.indexOf(cellId);

        model.selectedCount--;
        // Remove cell from array
        model.selectedCellIds.splice(index, 1);
        model.updateCellsOrder(index);

        // Set deselected cell to default
        cell.onmouseenter = view.setRandomColor;
        cell.onmouseleave = view.setDefaultColor; 
        view.removeNumber(cell);
    },


    disableMouseInteract: function() {
        let cells = document.getElementsByTagName('th');
        let clearBtn = document.getElementById('clear');
        clearBtn.disabled = true;
        for(let cell of cells) {
            cell.onmouseenter = undefined;
            cell.onmouseleave = undefined;
            cell.onclick = undefined;
        }
    },

    enableMouseInteract: function() {
        let cells = document.getElementsByTagName('th');
        let clearBtn = document.getElementById('clear');
        clearBtn.disabled = false;
        for(let cell of cells) {
            cell.onmouseenter = view.setRandomColor;
            cell.onmouseleave = view.setDefaultColor;
            cell.onclick = controller.processGuess;
        }
    },

    clearSelectedCell: function() {
        model.reset();   
        controller.enableMouseInteract();
    }

}

window.onload = function() {
    let startBtns = document.getElementsByClassName('start');
    let nextLevelBtn = document.getElementById('next');
    let tryAgainBtn = document.getElementById('try-again');
    let clearBtn = document.getElementById('clear');
    let messageElement = document.getElementById('message');
    
    let detailsBtn = document.getElementById('details');
    let nextTutorialBtn = document.getElementById('next-tutorial');
    let closeBtn = document.getElementById('close-popup');
    
    let numberOfTutorials = 3;
    let currentTutorial = 1;
    
    view.display();
    controller.enableMouseInteract();
    
    for(let startBtn of startBtns) {
        startBtn.onclick = function() {
            let difficulty = this.id;
            controller.instantiateLevel(difficulty);
        }
    }
    
    nextLevelBtn.onclick = function() {
        model.reset();
        controller.disableMouseInteract();
        controller.mode = 1;
        controller.levelUp();
        messageElement.innerText = '';
        model.generateCells();
        view.display(controller.mode);
    }
    
    tryAgainBtn.onclick = function() {
        model.reset();
        controller.enableMouseInteract();
        controller.mode = 0;
        controller.resetGame();
        view.display(controller.mode);
        messageElement.innerText = '';
        controller.isWin = false;
    }
    
    clearBtn.onclick = function() {
        controller.clearSelectedCell();        
    }
    
    detailsBtn.onclick = openPopup; 
    closeBtn.onclick = closePopup;
    
    nextTutorialBtn.onclick = function() {
        currentTutorial++;
        let imgElement = document.getElementById('tutorial-image');
        imgElement.src = `/tutorial images/tutorial${currentTutorial}.png`;

        if(currentTutorial == numberOfTutorials) {
            this.style.display = 'none';
            closeBtn.style.display = 'block';
        }
    }
    
    function closePopup() {
        let popup = document.getElementById('popup');
        popup.classList.remove('active');
    }
    
    function openPopup() {
        let popup = document.getElementById('popup');
        let imgElement = document.getElementById('tutorial-image');

        currentTutorial = 1;
        imgElement.src = `/tutorial images/tutorial${currentTutorial}.png`;
        popup.classList.add('active');

        nextTutorialBtn.style.display = 'block';
        closeBtn.style.display = 'none';
    }
}
