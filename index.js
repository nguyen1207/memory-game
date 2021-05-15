var model = {
    selectedCount: 0,
    selectedCellIds: [],

    numberOfCells: 5,
    cellIds: [],
    speed: 3,
    
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
        for(let i = 0; i < model.numberOfCells; i++) {
            if(model.selectedCellIds[i] != model.cellIds[i]) {
                view.displayTryAgain();
                view.showAnswer();
                return false;
            }
        }
        view.showAnswer();
        view.displayTryAgain();
        return true;
    },

    reset: function() {
        for(let i = 0; i < model.selectedCellIds.length; i++) {
            let selectedCellId = model.selectedCellIds[i];
            let selectedCell = document.getElementById(selectedCellId); 
            view.setDefaultColor(selectedCell);
            view.removeNumber(selectedCell);
            
            if(controller.mode == 1) {
                let cellId = model.cellIds[i];
                let cell = document.getElementById(cellId); 
                
                view.setDefaultColor(cell);
                view.removeNumber(cell);
            }
        }
        
        model.cellIds = [];
        model.selectedCellIds = [];
        model.selectedCount = 0;
    }
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

    displayTryAgain: function() {
        let tryAgainBtn = document.getElementById('try-again');
        tryAgainBtn.style.display = 'block';
    },

    displayMode: function() {
        let modeElement = document.getElementById('mode');
        if(controller.mode == 0) {
            modeElement.innerText = 'WARM UP';
        }
        else {
            modeElement.innerText = 'PLAY';
        }
    }

}

var controller = {
    // 0: warm up mode, 1: play mode
    mode: 0,

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

}

window.onload = function() {
    let startBtn = document.getElementById('start');
    let tryAgainBtn = document.getElementById('try-again');
    
    view.displayMode();
    controller.enableMouseInteract();

    startBtn.onclick = function() {
        model.reset();
        controller.disableMouseInteract();
        controller.mode = 1;
        view.displayMode();
        model.generateCells();
        startBtn.style.display = 'none';
        tryAgainBtn.style.display = 'none';
    }

    tryAgainBtn.onclick = function() {
        model.reset();
        controller.enableMouseInteract();
        controller.mode = 0;
        view.displayMode();
        startBtn.style.display = 'block';
        tryAgainBtn.style.display = 'none';
    }
    
}
