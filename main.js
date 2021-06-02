var round=Math.round,floor=Math.floor,abs=Math.abs,sqrt=Math.sqrt,asin=Math.asin,acos=Math.acos,sin=Math.sin,cos=Math.cos,PI=Math.PI,min=Math.min,max=Math.max,pow=Math.pow;
var imgBuff,lp,key,seed,t,b,rvrb;
var doc=document,win=window,hidden;
var CVS,SZ,CTR,CD,C,EASTER=false;

// RANDOMNESS
function urandint(n)
{
        return abs( randint(n) )
}
function randint(n)
{
        if (n) seed = n;
        seed ^= seed << 13;
        seed ^= seed >> 17;
        seed ^= seed << 5;
        return seed;
}
function urand(n)
{
        var seed = randint( n );
        return ((seed<0 ? ~seed+1 : seed) % 1024) / 1024;
}
function rand(n){ return urand(n)*2-1 };
function newHash()
{
        var a = [0,1,2,3,4,5,6,7,8,9,"a","b","c","d","e","f"];
        var s="", i;
        for( i=0; i<64; i++ )
        {
                s += a[ floor(rnd() * a.length) ];
        }
        tokenData.hash = "0x" + s;
}
function resetSeed()
{
        seed = parseInt(
                tokenData.hash.slice( 0, 16 ),
                16
        );
}



// STRING MANIPULATION AND LOGGING
function logf( s, a ) { console.log( printf(s,a) ) }
function printf( s, a )
{
	var S=s, i;
	for( i=0; i<a.length; i++ )
	{
		S = S.replace( "%s", a[i] );
	}
	return S;
}



// MATH
function normInt(s){ return parseInt(s,32)-SZ };
function d2r(n){ return n*PI/180 };
function r2d(n){ return n*180/PI };
function to1(n){ return n/255 };
function to1N(n){ return n/128-1 };
function getVec( a, b ){ return [ a[0]-b[0], a[1]-b[1] ] }
function getVecLen( v ){ return sqrt( pow(v[0],2) + pow(v[1],2) ) }
function doOp( a, b, op )
{
	return (
		( op==='+'&&a+b ) ||
		( op==='-'&&a-b ) ||
		( op==='*'&&a*b ) ||
		( op==='/'&&a/b ) ||
		( op==='^'&&pow(a,b) )
	);
}
function arrMath( a, b, op )
{
	var c=[], i;
	var chcode = (op).charCodeAt();
	for( i=0; i<a.length; i++ )
	{
		c[i] = doOp( a[i], b[i], op );
	}
	return c;
}
function hexMath( hex, num, op )
{
	var n, i;
	var chcode = (op).charCodeAt();

	var hex2 = '#';
	hex = hex.slice(1);

	for( i=0; i<hex.length/2; i++ )
	{
		n = doOp(
			parseInt( hex.slice(i,i+2), 16 ),
			num, op
		);
		n = Math.floor( n );
		hex2 += ( "00" + n.toString(16) ).slice(-2);
	}
	return hex2;
}
function d2r( deg ){ return deg*PI/180 }
function r2d( rad ){ return rad*180/PI }
function getHypo(a,b){ return sqrt(abs(a*a+b*b)) }
function getAngle(a,b,c){ return Math.acos(abs(a/c))*(180/PI) }
function getPointInCircle( x, y, Rx, Ry )
{
        var r = urand();
        var rx = Rx*sqrt(r);
        var ry = Ry*sqrt(r);
        var t = urand() * 2 * PI;
        return [
                x + rx*cos(t),
                y + ry*sin(t)
        ];
}



// DEBUGGING
function saveImg( i )
{
        var url = CVS.toDataURL();
        var img = doc.createElement( "img" );
        img.src = url;
        if ( i )
        {
                imgBuff[i] = img;
                hidden.appendChild( img );
        }
}
function testHash( n )
{
        if ( n )
        {
                // for testing
                tokenData.hash = n;
        }
}



// TRANSFORMATION
function scaleShape( s, n )
{
        var p, i, j, v;
        for( p in s )
        {
                for( i=0; i<s[p].length; i++ )
                {
                        for( j=0; j<2; j++ )
                        {
                                v = s[p][i][j];
                                s[p][i][j] *= n;
                        }
                }
        }
}



// FILTERS
function boxBlurT( src, tgt, w, h, r, H )
{
        var i, j, ti, li, ri, fv, lv, val;
        var iarr = 1/(r*2+1);
        for( i=0; i<w; i++ )
        {
                ti = i;
                li = ti;
                ri = ti + r*w;
                fv = src[ti];
                lv = src[ ti+w*(h-1) ];
                val = ( r+1 )*fv;
                for( j=0; j<r; j++ )
                {
                        val += src[ ti + j*w ];
                }
                for( j=0; j<=r; j++ )
                {
                        val += src[ri] - fv;
                        tgt[ti] = round( val*iarr );
                        ri += w;
                        ti += w;
                }
                for( j=r+1; j<h-r; j++ )
                {
                        val += src[ri] - src[li];
                        tgt[ti] = round(val*iarr);
                        li += w;
                        ri += w;
                        ti += w;
                }
                for( j=h-r; j<h; j++ )
                {
                        val += lv - src[li];
                        tgt[ti] = round( val*iarr );
                        li += w;
                        ti += w;
                }
        }
}
function boxBlurH( src, tgt, w, h, r )
{
        var iarr = 1/(r*2+1);
        var i, j, ti, li, ri, fv, lv, val;
        for( i=0; i<h; i++ )
        {
                ti = i*w;
                li = ti;
                ri = ti+r;
                fv = src[ti];
                lv = src[ ti + w-1 ];
                val = ( r+1 )*fv;
                for( j=0; j<r; j++)
                {
                        val += src[ti+j];
                }
                for( j=0; j<=r; j++)
                {
                        val += src[ri++] - fv;
                        tgt[ti++] = round( val*iarr );
                }
                for( j=r+1; j<w-r; j++)
                {
                        val += src[ri++] - src[li++];
                        tgt[ti++] = round( val*iarr );
                }
                for( j=w-r; j<w; j++)
                {
                        val += lv - src[li++];
                        tgt[ti++] = round( val*iarr );
                }
        }
}
function boxBlur( src, tgt, w, h, r )
{
        for( var i=0; i<src.length; i++ )
        {
                tgt[i] = src[i];
        }
        boxBlurH( tgt, src, w, h, r );
        boxBlurT( src, tgt, w, h, r );
}
function boxesForGauss( sigma, n )
{
        var wIdeal, mIdeal;
        var wl, wu, m;
        var sizes=[], i;

        wIdeal = sqrt( (12*sigma*sigma/n)+1 );
        wl = floor( wIdeal );
        if ( wl%2 == 0 )
        {
                wl--;
        }
        wu = wl+2;
        mIdeal = (
                12*sigma*sigma -
                n*wl*wl -
                4*n*wl -
                3*n
        )/(
                -4*wl -
                4
        );
        m = round( mIdeal );
        for( i=0; i<n; i++ )
        {
                sizes.push( i<m ? wl : wu );
        }
        return sizes;
}
function gaussBlur( src, tgt, w, h, r )
{
        var bxs=boxesForGauss( r, 3 );
        boxBlur( src, tgt, w, h, (bxs[0]-1)/2 );
        boxBlur( tgt, src, w, h, (bxs[1]-1)/2 );
        boxBlur( src, tgt, w, h, (bxs[2]-1)/2 );
}
function fastBlur( amount )
{
        var w = h = SZ, c=[], i, j;
        var d = C.getImageData( 0, 0, w, h );
        for( i=0; i<3; i++ )
        {
                c.push(
                        new Uint8ClampedArray( d.data.length/4 )
                );
        }
        for( i=0; i<d.data.length; i+=4 )
        {
                for( j=0; j<c.length; j++ )
                {
                        c[j][i/4] = (d.data[i+j]);
                }
        }
        for( i=0; i<c.length; i++ )
        {
                gaussBlur( c[i], c[i], w, h, amount );
        }
        for( i=0; i<d.data.length; i+=4 )
        {
                for( j=0; j<c.length; j++ )
                {
                        d.data[i+j] = c[j][i/4];
                }
        }
        C.putImageData( d, 0, 0 );
}



// BASIC SHAPES
function fillCircle( x, y, r )
{
        drawCircle( x, y, r );
        C.fill();
}
function drawEllipse( x, y, sx, sy, r )
{
        C.save();
        C.beginPath();
        C.translate( x, y );
        C.scale( sx, sy );
        C.arc( 0, 0, r, 0, 2*PI, false );
        C.restore();
}
function drawCircle( x, y, r )
{
        C.beginPath();
        C.arc( x, y, r, 0, 2*PI );
}



// COMPLEX SHAPES
function addBlob( p, size, spread, count, clip )
{
        var x=p[0], y=p[1], x2, y2;
        var pos, rad = ( (spread[0]+spread[1])/2 );
        for( i=0; i<count; i++ )
        {
                pos = getPointInCircle(
                        x, y,
                        spread[0],
                        spread[1]
                );
                x2=pos[0], y2=pos[1];
                fillCircle( x2, y2, size );
        }
	fillCircle( x, y, size*1.5 );
}
function addBG( bIdx )
{
        if ( bIdx && imgBuff && imgBuff[bIdx] )
        {
                C.drawImage( imgBuff[bIdx], 0, 0 );
                return;
        }
        var grad, ca, cb, i;
        var grad = C.createRadialGradient(
                CTR, CTR, 0, 
                CTR, CTR, SZ
        );
        ca = CD.bgC, cb = hexMath( ca, 0.95, '*' );
        grad.addColorStop( 0, ca );
        grad.addColorStop( 1, cb );
        C.fillStyle = grad;
        if ( !key )
        {
                C.fillRect( 0, 0, SZ, SZ );
        }
        saveImg( bIdx );
        if ( imgBuff ) imgBuff[0] = imgBuff[bIdx];
}



// SOUND
function initSound()
{
	t = {
		voice: new p5.PolySynth(),
		notes: [
			'C5', 'D5', 'E5', 'F5', 'G5'
		],
		delays: [
			1/4, 2/4, 3/4, 4/4, 5/4
		],
		holds: [
			2/4, 1/4, 2/4, 1/4, 3/4
		],
		velos: [
			1/10, 2/10, 3/10, 4/10, 5/10
		]
	}
	b = {
		voice: new p5.PolySynth(),
		notes: [
			'C2', 'G2', 'C2', 'C3'
		],
		delays: [
			1/4, 3/4, 5/4, 5/4
		],
		holds: [
			2/4, 2/4, 3/4, 3/4
		],
		velos: [
			1/10, 3/10, 3/10, 3/10
		]
	}
	rvrb = new p5.Reverb();
	rvrb.drywet( 100 );
	t.voice.connect( rvrb );
	b.voice.connect( rvrb );
}
function play()
{
	var hands = [t,b], h;
	for ( var i=0; i<hands.length; i++ )
	{
		h = hands[i];
		for( var j=0; j<h.notes.length; j++ )
		{
			h.voice.play(
				h.notes[j],
				h.velos[j],
				h.delays[j],
				h.holds[j]
			);
		}
	}
}



// GOVERNANCE
function render( blink )
{
        resetSeed();
	addBG();
}
function init()
{
        CVS = doc.querySelector( "canvas" );
        C = CVS.getContext( "2d" );
	initSound();

        hidden = doc.createElement( "div" );
        hidden.style.display = "none";
        doc.body.appendChild( hidden );

	// adaptive display
        var href = doc.location.href;
        if (
                href.match('localhost') ||
                href.match('github')
        ) {
                SZ = Math.min(
                        win.innerWidth,
                        win.innerHeight
                );
                doc.body.style.marginTop = "10vh";
        } else {
                SZ = Math.min(
                        win.innerWidth,
                        win.innerHeight
                );
        }

        CVS.width = CVS.height = SZ;
        CTR = SZ/2;
        CD = {
                colors: [
                        "#f2668b", "#23c7d9",
                        "#48d9a4", "#f2bf27"
                ],
                bgC: "#ddeeff"
        };
        newHash();
	resetSeed();
}
function main(n)
{
        if ( n )
        {
                testHash(n);
        }
        init();
        render();
	window.addEventListener( "click", ()=>play() );
}
main();
