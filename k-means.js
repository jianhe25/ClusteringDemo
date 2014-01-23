
/*
    A approximate multi-variable normal distribution:

    1. Use single normal distribution to generate a radius (regard as r) from center
    2. Uniformly generate a theta in the circle whose distance from center is r
    3. Use (r, theta) as polar coordinates to determine point
*/

function generate2dNormalDistribution(meanX, meanY, stdev, dataNum) {
    function rnd_snd() {
        return (Math.random()*2-1)+(Math.random()*2-1)+(Math.random()*2-1);
    }
    function rnd(mean, stdev) {
       return Math.round(rnd_snd()*stdev+mean);
    }
    data = []
    for (var i = 0; i < dataNum; ++i) {
        radius = rnd(0, stdev);
        theta = Math.random() * 2 * Math.PI;
        x = meanX + Math.cos(theta) * radius;
        y = meanY + Math.sin(theta) * radius;
        data.push([x,y])
    }
    return data;
}


var canvas; 
var ctx1;
var height;
var width;
var data = [] 
var means = [];
var assignments = [];
var dataExtremes;
var dataRange;
var drawDelay = 800;
var history_means = [];
var stopRunning = false;
var isBindingEvents = false;

function setUp() {
    data = generate2dNormalDistribution(0, 0, stdev=20, dataNum=100);
    data = data.concat(generate2dNormalDistribution(0, 50, stdev=20, dataNum=100));
    data = data.concat(generate2dNormalDistribution(50, 50, stdev=20, dataNum=100));
    data = data.concat(generate2dNormalDistribution(100, 100, stdev=20, dataNum=100));
    /*
    data = data.concat(generate2dNormalDistribution(0, 200, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(100, 0, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(100, 150, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(100, 100, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(200, 0, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(200, 50, stdev=10, dataNum=100));
    data = data.concat(generate2dNormalDistribution(600, 600, stdev=10, dataNum=100));
    */
    history_means = new Array();
    means = [];
    assignments = [];
    stopRunning = false;
}

function getDataRanges(extremes) {
    var ranges = [];
    for (var dimension in extremes)
    {
        ranges[dimension] = extremes[dimension].max - extremes[dimension].min;
    }
    return ranges;
}

function getDataExtremes(points) {
    var extremes = [];
    for (var i in data) {
        var point = data[i];
        for (var dimension in point) {
            if ( ! extremes[dimension] )
            {
                extremes[dimension] = {min: 1000, max: -1000};
            }
            if (point[dimension] < extremes[dimension].min)
            {
                extremes[dimension].min = point[dimension];
            }
            if (point[dimension] > extremes[dimension].max)
            {
                extremes[dimension].max = point[dimension];
            }
        }
    }
    return extremes;
}

function initMeans(k) {
    while (k--)
    {
        var mean = [];
        for (var dimension in dataExtremes)
        {
            mean[dimension] = dataExtremes[dimension].min + ( Math.random() * dataRange[dimension] );
        }
        means.push(mean);
    }
    history_means.push(means);
    return means;
};

function makeAssignments() {
    for (var i in data)
    {
        var point = data[i];
        var distances = [];
        for (var j in means)
        {
            var mean = means[j];
            var sum = 0;
            for (var dimension in point)
            {
                var difference = point[dimension] - mean[dimension];
                difference *= difference;
                sum += difference;
            }
            distances[j] = Math.sqrt(sum);
        }
        assignments[i] = distances.indexOf( Math.min.apply(null, distances) );
    }
}

function moveMeans() {
    makeAssignments();
    var sums = Array( means.length );
    var counts = Array( means.length );
    var moved = false;

    for (var j in means)
    {
        counts[j] = 0;
        sums[j] = Array( means[j].length );
        for (var dimension in means[j])
        {
            sums[j][dimension] = 0;
        }
    }

    for (var point_index in assignments)
    {
        var mean_index = assignments[point_index];
        var point = data[point_index];
        var mean = means[mean_index];

        counts[mean_index]++;

        for (var dimension in mean)
        {
            sums[mean_index][dimension] += point[dimension];
        }
    }

    for (var mean_index in sums)
    {
        if ( 0 === counts[mean_index] ) 
        {
            sums[mean_index] = means[mean_index];
            //console.log("Mean with no points");
            //console.log(sums[mean_index]);

            // If mean has no assigned points, then change it to a random new point
            for (var dimension in dataExtremes)
            {
                sums[mean_index][dimension] = dataExtremes[dimension].min + ( Math.random() * dataRange[dimension] );
            }
            continue;
        }
        for (var dimension in sums[mean_index])
        {
            sums[mean_index][dimension] /= counts[mean_index];
        }
    }

    if (means.toString() !== sums.toString())
    {
        moved = true;
    }

    means = sums;
    return moved;
}

function run() {
    var moved = moveMeans();
    draw(means, assignments, ctx1);
    if (moved && !stopRunning)
    {
        history_means.push(means);
        setTimeout(run, drawDelay);
    }
}

var colorPools = ['blue', 'green', 'yellow', 'magenta', 'pink', 'Lime', 'MidnightBlue', 'Olive']
function draw(means, assignments, ctx) {
    $("#iteration-times").html(history_means.length);
    ctx.clearRect(0,0,width, height);

    ctx.globalAlpha = 0.3;
    for (var point_index in assignments)
    {
        var mean_index = assignments[point_index];
        var point = data[point_index];
        var mean = means[mean_index];

        ctx.save();

        ctx.strokeStyle = 'dark';
        ctx.beginPath();
        ctx.moveTo(
            (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) ),
            (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) )
        );
        ctx.lineTo(
            (mean[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) ),
            (mean[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) )
        );
        ctx.stroke();
        ctx.closePath();
    
        ctx.restore();
    }
    ctx.globalAlpha = 1;

    for (var i in data)
    {
        ctx.save();

        var point = data[i];

        var x = (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) );
        var y = (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) );

        ctx.fillStyle = colorPools[ assignments[i] % colorPools.length ];
        ctx.translate(x, y);
        ctx.beginPath();

        ctx.arc(0, 0, 5, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }

    for (var i in means)
    {
        ctx.save();

        var point = means[i];

        var x = (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) );
        var y = (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) );

        ctx.fillStyle = 'red';
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();

        ctx.restore();

    }
}

$(document).ready(function() {

function bindingEvents() {
    isBindingEvents = true;
    $(".slidesjs-next").click( function(e) {
        console.log("click next button");
        var moved = moveMeans();
        if (moved) {
            history_means.push(means);
            draw(means, assignments, ctx1);
        }
        return;
    });

    $(".slidesjs-previous").click( function() {
        if (history_means.length > 1) {
            history_means.pop();
            means = history_means[history_means.length - 1];
            draw(means, assignments, ctx1);
        }
    });

    $(".slidesjs-play").click( function() {
        stopRunning = false;
        setTimeout(run, drawDelay);
    });

    $(".slidesjs-stop").click( function() {
        stopRunning = true;
    });

    $("#cluster-number").bind("enterKey", function(e) {
        console.log("camre here");
        jsMain(); 
    });
    
    $('#cluster-number').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });

    $("#submit").click( function() {
        jsMain();
    });
}

function jsMain() {
    height = $(window).height() - 200;
    width = ($(window).width() - 100) / 2;    

    console.log("height = ", height, " ", width);
    var canvas = document.getElementById('canvas');
    canvas.width  = width;
    canvas.height = height;

    var canvas2 = document.getElementById('canvas2');
    canvas2.width  = width;
    canvas2.height = height;
    setUp();

    canvas = $("#canvas")
    ctx1 = canvas[0].getContext('2d');

    ctx2 = $("#canvas2")[0].getContext('2d');

    clusterNumber = $("#cluster-number").val();

    dataExtremes = getDataExtremes(data);
    dataRange = getDataRanges(dataExtremes);
    means = initMeans(clusterNumber);
    makeAssignments();
    draw(means, assignments, ctx1);

    means_and_assignments = runSLC(data, 50);
    console.log(means_and_assignments);
    draw(means_and_assignments[0], means_and_assignments[1], ctx2);
}

jsMain();
bindingEvents();

});

