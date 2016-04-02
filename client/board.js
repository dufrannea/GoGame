var d3 = require("d3");

var board = function(elementSelector, playerIndex, size) {
    var marginTop = 30,
        marginLeft = 30,
        boardSize = 700,
        margin = 40,
        circleradius = (boardSize - 2*margin)/(2*size);

    var scale = d3.scale.linear()
        .domain([0, size - 1])
        .range([margin, boardSize - margin]);

    // creates an array
    // of the board's number of cells.
    var items = [];
    for (var i = 0; i < size; i++) {
        items.push(i);
    }

    var circles;
    var frozen = false;

    /**
     * Creates the initial board
     */
    function create(positions, playcallback) {
        var div = d3.select(elementSelector)
            .append("div")
            .style("width", boardSize + "px")
            .style("height", boardSize + "px");

        var svg = div.append("svg")
            .attr("width", boardSize + "px")
            .attr("height", boardSize + "px")

        // baord
        svg.append("rect")
            .style("fill", "tan")
            .attr("rx", "10px")
            .attr("x", "0px")
            .attr("y", "0px")
            .attr("width", boardSize + "px")
            .attr("height", boardSize + "px")

        svg.append("g")
            .selectAll("line")
            .data(items)
            .enter()
            .append("line")
            .attr("class", "xline")
            .attr("x1", function(d) { return scale(d) + "px" })
            .attr("y1", function(d) { return scale(0) + "px" })
            .attr("x2", function(d) { return scale(d) + "px" })
            .attr("y2", function(d) { return scale(size - 1) + "px" })
            .attr("style", "stroke:rgb(0,0,0);stroke-width:1")

        svg.append("g")
            .selectAll("line")
            .data(items)
            .enter()
            .append("line")
            .attr("x1", function(d) { return scale(0) + "px" })
            .attr("y1", function(d) { return scale(d) + "px" })
            .attr("x2", function(d) { return scale(size - 1) + "px" })
            .attr("y2", function(d) { return scale(d) + "px" })
            .attr("style", "stroke:rgb(0,0,0);stroke-width:1")

        circles = svg.append("g");
        circles.selectAll("circle")
            .data(positions)
            .enter()
            .append("circle")
                .attr("cx", function(d) { return scale(d[0]) })
                .attr("cy", function(d) { return scale(d[1]) })
                .attr("r", circleradius)
                .attr("fill", function(d) { return d[2] === 1 ? "white" : "black" });

        var hoverGroup = svg.append("g");

        var updateHoverPosition = function(position) {
            var hovercircles = hoverGroup.selectAll("circle")
                .data(position);

            hovercircles.enter()
                .append("circle")
                .attr("cx", function(d) { return scale(d[0]) })
                .attr("cy", function(d) { return scale(d[1]) })
                .attr("r", circleradius)
                .attr("fill", function(d) { return d[2] === 1 ? "white" : "black" });

            hovercircles
                .attr("cx", function(d) { return scale(d[0]) })
                .attr("cy", function(d) { return scale(d[1]) })
                .attr("r", circleradius)
                .attr("fill", function(d) { return d[2] === 1 ? "white" : "black" });
            hovercircles.exit().remove();
        }

        document.querySelector(elementSelector)
            .querySelector("svg")
            .addEventListener("mousemove", function() {
                if (!frozen) {
                    var xpos = Math.round((arguments[0].offsetX - margin) * (size - 1) / (boardSize - 2 * margin))
                    var ypos = Math.round((arguments[0].offsetY - margin) * (size - 1) / (boardSize - 2 * margin))


                    // if position is within the grid
                    if (xpos >= 0 && xpos < size && ypos >= 0 && ypos < size) {
                        updateHoverPosition([[xpos, ypos, playerIndex]])
                    }
                    else {
                        updateHoverPosition([]);
                    }
                }
            });

        document.querySelector(elementSelector)
            .querySelector("svg")
            .addEventListener("click", function() {
                if (!frozen) {
                    //console.info(arguments)
                    var xpos = Math.round((arguments[0].offsetX - margin) * (size - 1) / (boardSize - 2 * margin))
                    var ypos = Math.round((arguments[0].offsetY - margin) * (size - 1) / (boardSize - 2 * margin))

                    // if position is within the grid
                    if (xpos >= 0 && xpos < size && ypos >= 0 && ypos < size) {
                        playcallback([xpos, ypos]);
                    }
                }
            });
    }

    /**
     * Updates positions
     */
    function update(positions) {
        var localCircles = circles.selectAll("circle")
            .data(positions)

        localCircles.enter()
            .append("circle")
            .attr("cx", function(d) { return scale(d[0]) })
            .attr("cy", function(d) { return scale(d[1]) })
            .attr("r", circleradius)
            .attr("fill", function(d) { return d[2] === 1 ? "white" : "black" });

        localCircles
            .attr("cx", function(d) { return scale(d[0]) })
            .attr("cy", function(d) { return scale(d[1]) })
            .attr("r", circleradius)
            .attr("fill", function(d) { return d[2] === 1 ? "white" : "black" });
        
        localCircles.exit().remove();
    }

    function freeze() {
        frozen = true;
    }

    function unfreeze() {
        frozen = false;
    }
    
    return {
        create: create,
        update: update,
        freeze: freeze,
        unfreeze : unfreeze
    }
}

module.exports.board = board