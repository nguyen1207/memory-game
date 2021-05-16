var model = {
    selectedCount: 0,
    selectedCellIds: [],

    baseSpeed: 1,
    baseNumberOfCells: 3,

    numberOfCells: 3,
    cellIds: [],
    speed: 1,

    currentLevel: 1,
    numberOfLevels: 10,
    
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
        console.log(this.cellIds);
        view.demonstrate(this.cellIds);
    },

    checkAnswer: function() {
        controller.disableMouseInteract();
        controller.mode = 2;
        view.display(controller.mode);
        view.showAnswer();
        for(let i = 0; i < model.numberOfCells; i++) {
            if(model.selectedCellIds[i] != model.cellIds[i]) {
                controller.resetGame();
                return false;
            }
        }
        controller.levelUp();
        return true;
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
            console.log('done');

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
            btn.style.display = 'block';
        } 
        else {
            btn.style.display = 'none';
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

        switch(mode) {
            case 0:
                view.displayBtn('start', 1);
                view.displayBtn('try-again', 0);
                view.displayBtn('clear', 1);
                break;
            case 1:
                view.displayBtn('start', 0);
                view.displayBtn('try-again', 0);
                view.displayBtn('clear', 1);
                break;
            case 2:
                view.displayBtn('start', 0);
                view.displayBtn('try-again', 1);
                view.displayBtn('clear', 0);
                break;
        }
    }

}

var controller = {
    // 0: warm up mode, 1: play mode, 2: Result
    mode: 0,
    isWin: false,

    processGuess: function(e) {
        let cell = e.target;
        if(cell.onmouseenter) {
            controller.selectCell(cell);
        }
        else {
            controller.deselectCell(cell);
        }

        if(model.selectedCellIds.length == model.numberOfCells && controller.mode == 1) {
            console.log(model.checkAnswer());
        }
    },

    levelUp: function() {
        if(model.currentLevel == model.numberOfLevels) {
            controller.resetGame();
        }
        else {
            model.currentLevel++;    
            controller.increaseSpeed(model.currentLevel);
            controller.increaseNumberOfCells(model.currentLevel);
        }
    },

    resetGame: function() {
        model.currentLevel = 1;
        model.speed = model.baseSpeed;
        model.numberOfCells = model.baseNumberOfCells;
    },

    increaseSpeed: function(level) {
        if(level % 3 == 0) {
            model.speed += 0.5;
        }
    },

    increaseNumberOfCells: function(level) {
        if(level % 4 == 0) {
            model.numberOfCells += 1;
        }
    },
    
    selectCell: function(cell) {
        cell.onmouseenter = undefined;
        cell.onmouseleave = undefined; 
        model.selectedCount++;
        view.setNumber(cell);
        model.selectedCellIds.push(cell.id);
        console.log(model.selectedCellIds);
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
        console.log(model.selectedCellIds);
    },


    disableMouseInteract: function() {
        let cells = document.getElementsByTagName('th');
        for(let cell of cells) {
            cell.onmouseenter = undefined;
            cell.onmouseleave = undefined;
            cell.onclick = undefined;
        }
    },

    enableMouseInteract: function() {
        let cells = document.getElementsByTagName('th');
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
    let startBtn = document.getElementById('start');
    let tryAgainBtn = document.getElementById('try-again');
    let clearBtn = document.getElementById('clear');
    let messageElement = document.getElementById('message');
    
    view.display();
    controller.enableMouseInteract();

    startBtn.onclick = function() {
        model.reset();
        controller.disableMouseInteract();
        controller.mode = 1;
        model.generateCells();
        view.display(controller.mode);
    }

    tryAgainBtn.onclick = function() {
        model.reset();
        controller.enableMouseInteract();
        controller.mode = 0;
        view.display(controller.mode);

        if(controller.isWin) {
            messageElement.innerText = '';
        }
    }

    clearBtn.onclick = function() {
        controller.clearSelectedCell();        
    }
    
}
