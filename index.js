var model = {
    guessesCount: 0,
    selectedCells: [],
    
    updateOrderCells: function(index) {
        model.selectedCells.splice(index, 1);

        let j = 0;
        for(let i = model.selectedCells.length - 1; i >= index; i--) {
            let cell = model.selectedCells[i];
            view.setNumber(cell, model.guessesCount - j);
            j++;
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
            let index = model.selectedCells.indexOf(cell);
            model.updateOrderCells(index);
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
        cell.onmouseenter = view.setRandomColor;
        cell.onmouseleave = view.setDefaultColor; 
        model.guessesCount--;
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
