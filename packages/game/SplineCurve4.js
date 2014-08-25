/**************************************************************
 *	Spline 4D curve
 **************************************************************/


THREE.SplineCurve4 = THREE.Curve.create(

	function ( points /* array of Vector4 */) {

		this.points = (points == undefined) ? [] : points;

	},

	function ( t ) {

		var v = new THREE.Vector4();
		var c = [];
		var points = this.points, point, intPoint, weight;
		point = ( points.length - 1 ) * t;

		intPoint = Math.floor( point );
		weight = point - intPoint;

		c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
		c[ 1 ] = intPoint;
		c[ 2 ] = intPoint  > points.length - 2 ? points.length - 1 : intPoint + 1;
		c[ 3 ] = intPoint  > points.length - 3 ? points.length - 1 : intPoint + 2;

		var pt0 = points[ c[0] ],
			pt1 = points[ c[1] ],
			pt2 = points[ c[2] ],
			pt3 = points[ c[3] ];

		v.x = THREE.Curve.Utils.interpolate(pt0.x, pt1.x, pt2.x, pt3.x, weight);
		v.y = THREE.Curve.Utils.interpolate(pt0.y, pt1.y, pt2.y, pt3.y, weight);
		v.z = THREE.Curve.Utils.interpolate(pt0.z, pt1.z, pt2.z, pt3.z, weight);
		v.w = THREE.Curve.Utils.interpolate(pt0.w, pt1.w, pt2.w, pt3.w, weight);

		return v;

	}

);


// THREE.SplineCurve3.prototype.getTangent = function(t) {
// 		var v = new THREE.Vector3();
// 		var c = [];
// 		var points = this.points, point, intPoint, weight;
// 		point = ( points.length - 1 ) * t;

// 		intPoint = Math.floor( point );
// 		weight = point - intPoint;

// 		c[ 0 ] = intPoint == 0 ? intPoint : intPoint - 1;
// 		c[ 1 ] = intPoint;
// 		c[ 2 ] = intPoint  > points.length - 2 ? points.length - 1 : intPoint + 1;
// 		c[ 3 ] = intPoint  > points.length - 3 ? points.length - 1 : intPoint + 2;

// 		var pt0 = points[ c[0] ],
// 			pt1 = points[ c[1] ],
// 			pt2 = points[ c[2] ],
// 			pt3 = points[ c[3] ];

// 	// t = weight;
// 	v.x = THREE.Curve.Utils.tangentSpline( t, pt0.x, pt1.x, pt2.x, pt3.x );
// 	v.y = THREE.Curve.Utils.tangentSpline( t, pt0.y, pt1.y, pt2.y, pt3.y );
// 	v.z = THREE.Curve.Utils.tangentSpline( t, pt0.z, pt1.z, pt2.z, pt3.z );

// 	return v;

// }

/**************************************************************
 *	Closed Spline 3D curve
 **************************************************************/


THREE.ClosedSplineCurve4 = THREE.Curve.create(

	function ( points /* array of Vector3 */) {

		this.points = (points == undefined) ? [] : points;

	},

    function ( t ) {

        var v = new THREE.Vector4();
        var c = [];
        var points = this.points, point, intPoint, weight;
        point = ( points.length - 0 ) * t;
            // This needs to be from 0-length +1

        intPoint = Math.floor( point );
        weight = point - intPoint;

        intPoint += intPoint > 0 ? 0 : ( Math.floor( Math.abs( intPoint ) / points.length ) + 1 ) * points.length;
        c[ 0 ] = ( intPoint - 1 ) % points.length;
        c[ 1 ] = ( intPoint ) % points.length;
        c[ 2 ] = ( intPoint + 1 ) % points.length;
        c[ 3 ] = ( intPoint + 2 ) % points.length;

        v.x = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].x, points[ c[ 1 ] ].x, points[ c[ 2 ] ].x, points[ c[ 3 ] ].x, weight );
        v.y = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].y, points[ c[ 1 ] ].y, points[ c[ 2 ] ].y, points[ c[ 3 ] ].y, weight );
        v.z = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].z, points[ c[ 1 ] ].z, points[ c[ 2 ] ].z, points[ c[ 3 ] ].z, weight );
        v.w = THREE.Curve.Utils.interpolate( points[ c[ 0 ] ].w, points[ c[ 1 ] ].w, points[ c[ 2 ] ].w, points[ c[ 3 ] ].w, weight );

        return v;

    }

);