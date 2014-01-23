/*
	Definition of Cluster
	center : cluster center;
	numPoint : number of points in cluster
*/
function Cluster(center, numPoint) {
	this.center = center;
	this.numPoint = numPoint;
}


function distance(center, point) {
	var sum = 0;
	for (dimension in center) {
		sum += (center[dimension] - point[dimension]) * (center[dimension] - point[dimension]);
	}
	return Math.sqrt(sum);
}

function updateCluster(cluster, point) {
	var center = cluster.center;
	for (dimension in center) {
		center[dimension] = 
			(center[dimension] * cluster.numPoint + point[dimension]) / (cluster.numPoint + 1);
	}
	cluster.numPoint += 1;
}

function runSLC(data, threshold) {
	var clusters = []
	var assignments = []
	for (var i in data) {
		var point = data[i];
		var findAssignment = false;
		for (var j in clusters) {
			var center = clusters[j].center;
			if (distance(center, point) < threshold) {
				assignments[i] = j;
				findAssignment = true;
				break;
			}
		}
		// Add new cluster 
		if (!findAssignment) {
			clusters.push( new Cluster(point, 1) );
			assignments[i] = clusters.length - 1;
		}
		// Update old cluster 
		else {
			updateCluster(clusters[ assignments[i] ], point);
		}
	}

	console.log(clusters);
	var means = [];
	for (i in clusters)
		means[i] = clusters[i].center;
	return [means, assignments];
}
