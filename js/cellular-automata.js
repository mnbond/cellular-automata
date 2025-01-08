class CellularAutomata {
    constructor(containerId, cellSizePx=10, speedMs=1000) {
        // Check arguments
        if (!CellularAutomata.checkConstructorArguments(containerId, cellSizePx, speedMs)) return;
        
        // Set properties
        this.setDefaultProperties();
        this.container = document.getElementById(containerId);
        this.cellSizePx = cellSizePx;
        this.cellsCountX = Math.floor(this.container.offsetWidth / cellSizePx);
        this.cellsCountY = Math.floor(this.container.offsetHeight / cellSizePx);
        this.speedMs = speedMs;
        this.createCanvas();
        
        // Set events
        this.setEvents();
        
        this.loadType(0);
    }
    
    static checkConstructorArguments(containerId, cellSizePx, speedMs) {
        // Check arguments
        let isCorrectFlag = true;
        if (!document.getElementById(containerId)) isCorrectFlag = false;
        if (isNaN(cellSizePx) || cellSizePx < 3) isCorrectFlag = false;
        if (isNaN(speedMs) || speedMs < 1) isCorrectParameters = false;
        
        // Throw error
        if (!isCorrectFlag) throw new Error("Incorrect arguments");
        
        return true;
    }
    
    calcNeighbors() {
        // Reset count of neighbors
        for (let x = 0; x < this.cellsCountX; x++) {
            for (let y = 0; y < this.cellsCountY; y++) {
                this.cells[x][y][1] = 0;
            }
        }

        // Calculate count of neighbors
        let left, right, top, bottom;
        for (let x = 0; x < this.cellsCountX; x++) {
            left = (x - 1 < 0 ? this.cellsCountX - 1 : x - 1);
            right = (x + 1 > this.cellsCountX - 1 ? 0 : x + 1);

            for (let y = 0; y < this.cellsCountY; y++) {
                if (this.cells[x][y][0] !== 1) continue;

                top = (y - 1 < 0 ? this.cellsCountY - 1 : y - 1);
                bottom = (y + 1 > this.cellsCountY - 1 ? 0 : y + 1);

                this.cells[left][top][1]++;
                this.cells[x][top][1]++;
                this.cells[right][top][1]++;
                this.cells[left][y][1]++;
                this.cells[right][y][1]++;
                this.cells[left][bottom][1]++;
                this.cells[x][bottom][1]++;
                this.cells[right][bottom][1]++;
            }
        }
    }
    
    createCanvas() {
        // Clear container
        while (this.container.firstChild) {
            this.container.firstChild.remove();
        }
        
        // Create new canvas
        const canvas = document.createElement("canvas");
        canvas.id = this.container.id + "-canvas";
        canvas.width = this.cellsCountX * this.cellSizePx;
        canvas.height = this.cellsCountY * this.cellSizePx;
        
        // Append new canvas to the container
        this.container.append(canvas);
    }
    
    loadType(typeIndex) {
        this.currentTypeIndex = typeIndex;
        
        if (this.cellsCountX === 0 || this.cellsCountY === 0) return;
            
        // Create/clear cells
        this.cells = new Array(this.cellsCountX).fill(0).map(() => new Array(this.cellsCountY).fill(0).map(() => [0, 0])); // [cell_state, count_of_neighbors]
        
        // Generate first state of cells
        this.settings.types[typeIndex].genFirstState(this.cells, this.cellsCountX, this.cellsCountY);
        
        this.render();
    }
    
    nextType() {
        this.stop();
        
        // Set cycle type numeration
        this.loadType((this.currentTypeIndex + 1) % this.settings.types.length);
        
        this.start();
    }
    
    prevType() {
        this.stop();
        
        // Set cycle type numeration
        this.loadType(this.currentTypeIndex > 0 ? this.currentTypeIndex - 1 : this.settings.types.length - 1);
        
        this.start();
    }
    
    render() {
        const canvas = this.container.firstChild;
        const context = canvas.getContext("2d");
        
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Render cells
        for (let x = 0; x < this.cellsCountX; x++) {
            for (let y = 0; y < this.cellsCountY; y++) {
                const cell = this.cells[x][y];
                if (cell[0] !== 0) {
                    context.fillStyle = (cell[0] === 1 ? this.settings.cellColors.active : this.settings.cellColors.notActive);
                    context.fillRect(x * this.cellSizePx + 1, y * this.cellSizePx + 1, this.cellSizePx - 2, this.cellSizePx - 2);
                }
            }
        }
    }
    
    setDefaultProperties() {
        // Set settings
        this.settings = {
            cellColors: {active: "#333", notActive: "#aaa"},
            types: [
                {
                    name: "B3S23",
                    rules: { 
                        born: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                        survive: [0, 0, 1, 1, 0, 0, 0, 0, 0, 0]
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        const probability = 30;
                        for (let x = 0; x < cellsCountX; x++) {
                            for (let y = 0; y < cellsCountY; y++) {
                                if (Math.floor(Math.random() * 100) < probability) cells[x][y][0] = 1;
                            }
                        }
                    }
                },
                {
                    name: "B1S012345678",
                    rules: { 
                        born: [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
                        survive: [1, 1, 1, 1, 1, 1, 1, 1, 1, 0]
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        cells[Math.floor((cellsCountX - 1) / 2)][Math.floor((cellsCountY - 1) / 2)][0] = 1;
                    }
                },
                {
                    name: "B3S12345",
                    rules: {
                        born: [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
                        survive: [0, 1, 1, 1, 1, 1, 0, 0, 0, 0]
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        const probability = 30;
                        let areaSize = 10;
                        if (areaSize > Math.min(cellsCountX, cellsCountY)) areaSize = Math.min(cellsCountX, cellsCountY);
                        for (let x = 0; x < areaSize; x++) {
                            for (let y = 0; y < areaSize; y++) {
                                if (Math.floor(Math.random() * 100) < probability) cells[Math.floor((cellsCountX - areaSize) / 2) + x][Math.floor((cellsCountY - areaSize) / 2) + y][0] = 1;
                            }
                        }
                    }
                },
                {
                    name: "B35678S5678",
                    rules: { 
                        born: [0, 0, 0, 1, 0, 1, 1, 1, 1, 0],
                        survive: [0, 0, 0, 0, 0, 1, 1, 1, 1, 0]
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        const probability = 50;
                        for (let x = 0; x < cellsCountX; x++) {
                            for (let y = 0; y < cellsCountY; y++) {
                                if (Math.floor(Math.random() * 100) < probability) cells[x][y][0] = 1;
                            }
                        }
                    }
                },
                {
                    name: "B2S0345G10",
                    rules: {
                        born: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                        survive: [1, 0, 0, 1, 1, 1, 0, 0, 0, 0],
                        lifetime: 10
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        let areaSize = 2;
                        if (areaSize > Math.min(cellsCountX, cellsCountY)) areaSize = Math.min(cellsCountX, cellsCountY);
                        for (let x = 0; x < areaSize; x++) {
                            for (let y = 0; y < areaSize; y++) {
                                cells[Math.floor((cellsCountX - areaSize) / 2) + x][Math.floor((cellsCountY - areaSize) / 2) + y][0] = 1;
                            }
                        }
                    }
                },
                {
                    name: "B34S1234G48",
                    rules: {
                        born: [0, 0, 0, 1, 1, 0, 0, 0, 0, 0],
                        survive: [0, 1, 1, 1, 1, 0, 0, 0, 0, 0],
                        lifetime: 48
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        let areaSize = 3;
                        if (areaSize > Math.min(cellsCountX, cellsCountY)) areaSize = Math.min(cellsCountX, cellsCountY);
                        for (let x = 0; x < areaSize; x++) {
                            for (let y = 0; y < areaSize; y++) {
                                cells[Math.floor((cellsCountX - areaSize) / 2) + x][Math.floor((cellsCountY - areaSize) / 2) + y][0] = 1;
                            }
                        }
                    }
                },
                {
                    name: "B234S2G5",
                    rules: {
                        born: [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
                        survive: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
                        lifetime: 5 
                    },
                    genFirstState: (cells, cellsCountX, cellsCountY) => {
                        const probability = 10;
                        for (let x = 0; x < cellsCountX; x++) {
                            for (let y = 0; y < cellsCountY; y++) {
                                if (Math.floor(Math.random() * 100) < probability) cells[x][y][0] = 1;
                            }
                        }
                    }
                }
            ]
        };
        
        // Set default properties
        this.cells = [];
        this.cellsCountX = 0;
        this.cellsCountY = 0;
        this.cellSizePx = 0;
        this.container = null
        this.currentTypeIndex = 0;
        this.speedMs = 0;
        this.timerId = 0;
    }
    
    setEvents() {
        this.container.addEventListener("click", (event) => {
            const coordX = event.clientX - this.container.offsetLeft;
            if (coordX > this.container.offsetWidth / 2) {
                this.nextType();
            } else {
                this.prevType();
            }
        });
        
        document.addEventListener("keydown", (event) => {
            switch (event.code) {
                case "ArrowRight":
                    this.nextType();
                    break;
                case "KeyA":
                case "ArrowLeft":
                    this.prevType();
                    break;
                case "Space":
                case "Enter":
                    if (this.timerId === 0) {
                        this.start();
                    } else {
                        this.stop();
                    }
                    break;
            }
        });
    }
    
    start() {
        this.timerId = setInterval(() => this.step(), this.speedMs);
    }
    
    step() {
        this.calcNeighbors();
        
        const rules = this.settings.types[this.currentTypeIndex].rules;
        const lifetime = (rules.hasOwnProperty("lifetime") ? rules.lifetime : 2);
        for (let x = 0; x < this.cellsCountX; x++) {
            for (let y = 0; y < this.cellsCountY; y++) {
                let cell = this.cells[x][y];
                if (cell[0] === 0) {
                    if (rules.born[cell[1]] === 1) cell[0] = 1;
                } else {
                    if (rules.survive[cell[1]] !== 1 || cell[0] > 1) cell[0]++;
                    if (cell[0] >= lifetime) cell[0] = 0;
                }
            }
        }

        this.render();
    }
    
    stop() {
        clearTimeout(this.timerId);
        this.timerId = 0;
    }
}
