/*
 (c) 2013, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function() {
  'use strict';

  // To suit your point format, run search/replace for '.timestamp' and '.average';
  // for 3D version, see 3d branch (configurability would draw significant performance overhead)

  // square distance between 2 points
  function getSqDist(p1, p2) {
    const dx = p1.timestamp - p2.timestamp;
    const dy = p1.average - p2.average;

    return dx * dx + dy * dy;
  }

  // Square distance from a point to a segment
  function getSqSegDist(p, p1, p2) {
    let x = p1.timestamp;
    let y = p1.average;
    let dx = p2.timestamp - x;
    let dy = p2.average - y;

    if (dx !== 0 || dy !== 0) {
      const t =
        ((p.timestamp - x) * dx + (p.average - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = p2.timestamp;
        y = p2.average;
      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.timestamp - x;
    dy = p.average - y;

    return dx * dx + dy * dy;
  }
  // Rest of the code doesn't care about point format

  // basic distance-based simplification
  function simplifyRadialDist(points, sqTolerance) {
    let prevPoint = points[0];
    let newPoints = [prevPoint];
    let point;

    for (var i = 1, len = points.length; i < len; i++) {
      point = points[i];

      if (getSqDist(point, prevPoint) > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }

    if (prevPoint !== point) {
      newPoints.push(point);
    }

    return newPoints;
  }

  function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    let maxSqDist = sqTolerance;
    let index;

    for (var i = first + 1; i < last; i++) {
      var sqDist = getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) {
        simplifyDPStep(points, first, index, sqTolerance, simplified);
      }
      simplified.push(points[index]);
      if (last - index > 1) {
        simplifyDPStep(points, index, last, sqTolerance, simplified);
      }
    }
  }

  // Simplification using Ramer-Douglas-Peucker algorithm
  function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
  }

  // Both algorithms combined for awesome performance
  function simplify(points, tolerance, highestQuality) {
    if (points.length <= 2) {
      return points;
    }

    const sqTolerance = tolerance === undefined ? 1 : tolerance * tolerance;

    points = highestQuality ? points : simplifyRadialDist(points, sqTolerance);
    points = simplifyDouglasPeucker(points, sqTolerance);

    return points;
  }

  // Export as AMD module / Node module / browser or worker variable
  module.exports = simplify;
})();
