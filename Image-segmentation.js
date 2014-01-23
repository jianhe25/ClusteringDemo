function loadImages() {
  displayImage("c1", "chinaFlag.jpeg");
}

function displayImage(canvasId, url) {
  var j = new JpegImage();
  j.onload = function() {
    var c = document.getElementById(canvasId);
    c.width = j.width;
    c.height = j.height;
    var ctx = c.getContext("2d");
    var d = ctx.getImageData(0,0,j.width,j.height);
    j.copyToImageData(d);
    ctx.putImageData(d, 0, 0);
  };
  j.load(url);
}

function convertOneDimToMultiDim(img) {
      var width = img.width, height = img.height;
      var data = img.getData(width, height);
      var i = 0, j = 0, x, y;
      var Y, K, C, M, R, G, B;
      var multiDimData = [];
      switch (img.components.length) {
        case 1:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              Y = data[i++];
              multiDimData[j++] = Y;
            }
          }
          break;
        case 3:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              R = data[i++];
              G = data[i++];
              B = data[i++];
              multiDimData[j++] = [R, G, B];
            }
          }
          break;
        case 4:
          for (y = 0; y < height; y++) {
            for (x = 0; x < width; x++) {
              C = data[i++];
              M = data[i++];
              Y = data[i++];
              K = data[i++];

              R = 255 - clampTo8bit(C * (1 - K / 255) + K);
              G = 255 - clampTo8bit(M * (1 - K / 255) + K);
              B = 255 - clampTo8bit(Y * (1 - K / 255) + K);

              multiDimData[j++] = [R, G, B]; 
            }
          }
          break;
        default:
          throw 'Unsupported color mode';
    }
    return multiDimData;
}

function copyMultiDimDataToBlankCanvas(multiDim, blankCanvas) {
    var width = blankCanvas.width, height = blankCanvas.height;
    var blankCanvasArray = blankCanvas.data;
    var j = 0, x, y;
    var R, G, B;

    console.log(multiDim);
    var test = multiDim[0];
    console.log(test);


    for (var i = 0; i < multiDim.length; ++i) {
        var test = multiDim[i];
        R = test[0];
        G = test[1];
        B = test[2];
        blankCanvasArray[j++] = R;
        blankCanvasArray[j++] = G;
        blankCanvasArray[j++] = B;
        blankCanvasArray[j++] = 255;
    }
    
}

function kmeansSegmentation(img, blankCanvas) {
  // Note data is a global variable, shared in K-means.js, very dangerous variable
  data = convertOneDimToMultiDim(img);

  dataExtremes = getDataExtremes(data);
  dataRange = getDataRanges(dataExtremes);
  means = initMeans(6);
  makeAssignments();

  while (true) {
    var moved = moveMeans();
    if (!moved)
      break;
  }
  console.log(means);

  RGBPools = [ [0,0,0], [155,155,155], [250,235,215], [0,0,255], [255,0,0], [0,255,0] ];

  for (var i in data) {
      data[i] = RGBPools[ assignments[i] % RGBPools.length ];        
  }
  
  var blankCanvasArray = blankCanvas.data;
  // Fold data to one dimension
  //copyMultiDimDataToBlankCanvas(data, blankCanvas);
  var j = 0;
  for (var i = 0; i < data.length; ++i) {
        var test = data[i];
        if (test) {
          R = test[0];
          G = test[1];
          B = test[2];
          blankCanvasArray[j++] = R;
          blankCanvasArray[j++] = G;
          blankCanvasArray[j++] = B;
          blankCanvasArray[j++] = 255;
        }
    }
}

function imageSegmentation() {
  canvasId = "c2"
  url = "chinaFlag.jpeg"
  var j = new JpegImage();
  j.onload = function() {
    var c = document.getElementById(canvasId);
    c.width = j.width;
    c.height = j.height;
    var ctx = c.getContext("2d");
    var d = ctx.getImageData(0,0,j.width,j.height);
    kmeansSegmentation(j, d);
    ctx.putImageData(d, 0, 0);
  };
  j.load(url);
}
