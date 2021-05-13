var model = {
    guessesCount: 0,
    selectedCells: [],
    
    updateCellsOrder: function(index) {
        let numberOfSelectedCells = this.selectedCells.length;

        for(let i = numberOfSelectedCells - 1, j = 0; i >= index; i--, j++) {
            let cell = model.selectedCells[i];
            view.setNumber(cell, model.guessesCount - j);
        }
    }  

}

var view = {

    setRandomColor: function() {
        let randomRed = Math.ceil(Math.random() * 255 + 1);
        let randomGreen = Math.ceil(Math.random() * 255 + 1);
        let randomBlue = Math.ceil(Math.random() * 255 + 1);
        this.style.backgroundColor = `rgb(${randomRed}, ${randomGreen}, ${randomBlue})`;
    },

    setDefaultColor: function() {
        this.style.backgroundColor = 'white';
    },

    setNumber: function(cell, number = model.guessesCount) {
        cell.innerText = number;
    },

    removeNumber: function(cell) {
        cell.innerText = '';
    }

}

var controller = {

    processGuess: function(e) {
        let cell = e.target;
        if(cell.onmouseenter) {
            controller.selectCell(cell);
        }
        else {
            controller.deselectCell(cell);
        }
    },
    
    selectCell: function(cell) {
        cell.onmouseenter = undefined;
        cell.onmouseleave = undefined; 
        model.guessesCount++;
        view.setNumber(cell);
        model.selectedCells.push(cell);
    },
    
    deselectCell: function(cell) {
        let index = model.selectedCells.indexOf(cell);

        model.guessesCount--;
        // Remove cell from array
        model.selectedCells.splice(index, 1);
        model.updateCellsOrder(index);

        // Set deselected cell to default
        cell.onmouseenter = view.setRandomColor;
        cell.onmouseleave = view.setDefaultColor; 
        view.removeNumber(cell);
    }
}

window.onload = function() {
    let cells = document.getElementsByTagName('th');
    
    for(let cell of cells) {
        cell.onmouseenter = view.setRandomColor;
        cell.onmouseleave = view.setDefaultColor;
        cell.onclick = controller.processGuess;
    }
     
}
