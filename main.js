var round=Math.round,floor=Math.floor,abs=Math.abs,sqrt=Math.sqrt,asin=Math.asin,acos=Math.acos,sin=Math.sin,cos=Math.cos,PI=Math.PI,min=Math.min,max=Math.max,pow=Math.pow;
var CVS,SZ,CTR,CD, doc=document,win=window,hidden;
var imgBuff,lp,key,seed,t,b, rvrb,song,soundLoaded=false;

// RANDOMNESS
function urandint(n)
{
        return abs( randint(n) );
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
function rand(n){ return urand(n)*2-1; }
function newHash()
{
        var a = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
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



// HELPERS
const log = console.log;
function logf( s, a ) { console.log( printf(s,a) ); }
function alertf( s, a ) { alert( printf(s,a) ); }
function printf( s, a )
{
	var S=s, i;
	for( i=0; i<a.length; i++ )
	{
		S = S.replace( "%s", a[i].toString() );
	}
	return S;
}
function vardump( o, brief )
{
	s = '';
	for(var p in o)
	{
		if ( brief )
		{
			s += p + '\n';
		} else {
			s += printf( "%s: %s\n", [p,o[p]] );
		}
	}
	return s;
}
function tryFunc( func, args )
{
	try {
		args ? func( ...args ) : func() ;
	} catch(e) {
		alert( e.toString() );
	}
}
function saveImg(i)
{
	var url = CVS.toDataURL();
	var img = doc.createElement("img");
	img.src = url;
	if( i )
	{
		imgBuff[i]=img;
		hidden.appendChild(img);
	}
}
function uiFeedback()
{
	document.body.style.backgroundColor = "gray";
	setTimeout( function()
	{
		document.body.style.backgroundColor = "white";
	}, 100);
}
function copyArray( a, b )
{
	b = b || [];
	for( var i=0; i<a.length; i++ )
	{
		b[i] = a[i];
	}
	return b;
}



// MATH
function normInt(s){ return parseInt(s,32)-SZ; }
function d2r(n){ return n*PI/180; }
function r2d(n){ return n*180/PI; }
function to1(n){ return n/255; }
function to1N(n){ return n/128-1; }
function getVec( a, b ){ return [ a[0]-b[0], a[1]-b[1] ]; }
function getVecLen( v ){ return sqrt( pow(v[0],2) + pow(v[1],2) ); }
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
function d2r( deg ){ return deg*PI/180; }
function r2d( rad ){ return rad*180/PI; }
function getHypo(a,b){ return sqrt(abs(a*a+b*b)); }
function getAngle(a,b,c){ return Math.acos(abs(a/c))*(180/PI); }
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
        var w=SZ, h=SZ, c=[], i, j;
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
                x2=pos[0];
		y2=pos[1];
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
        var ca, cb, i;
        var grad = C.createRadialGradient(
                CTR, CTR, 0, 
                CTR, CTR, SZ
        );
        ca = CD.bgC;
	cb = hexMath( ca, 0.95, '*' );
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



// COMPOSITION
function getTempo()
{
	var tempos = [ 54, 66, 80, 120, 156 ];
	return tempos[ urandint()%tempos.length ];
}
function getTimeSig()
{
	var sigs = [ "3/4", "4/4", "6/8", "8/16" ];
	return sigs[ urandint()%sigs.length ];
}
function getKey()
{
	var keys = [
		[ "C", "D", "E", "G", "A"],
		[ "C", "D", "D#", "E", "G", "A"],
		[ "A", "B", "C", "D#", "E", "F#"],
		[ "D", "E", "F#", "G", "A", "B", "C#"],
		[ "E", "F#", "G", "A", "B", "C", "D"],
		[ "F", "G", "G#", "A#", "C", "C#", "E"],
		[ "A#", "C", "C#", "E", "F", "G", "G#"],
		[ "G", "G#", "A#", "C", "C#", "E", "F"]
	];
	return keys[ urandint()%keys.length ];
}
function getNote()
{
	return song.key[ urandint()%song.key.length ];
}
function getHold( rem )
{
	// NOTE: consider "staccato" "glissando" and "legato"
	var holds = [ 1, 1/2, 1/4, 1/8 ];
	return holds[ urandint()%holds.length ];
}
function getVelo( rem )
{
	// NOTE: consider "piano", "mezzo", "forte"
	// NOTE: consider "none", "crescendo", "decresceno"
	return urand()*0.9+0.1;
}
function riff( voice, bar )
{
	var note, i;
	var newBar = {
		notes: copyArray( bar.notes ),
		delays: copyArray( bar.delays ),
		holds: copyArray( bar.holds ),
		velos: copyArray( bar.velos )
	};
	for( i=0; i<newBar.notes.length; i++ )
	{
		// can be a "breath"
		if ( urandint()%2 === 0 )
		{
			note = getNote() + (voice.hand ? 3 : 5);
			newBar.notes[i] = note;
		}

		i++;
	}
	voice.bars.push({
		notes: newBar.notes,
		delays: newBar.delays,
		holds: newBar.holds,
		velos: newBar.velos
	});
}
function getBar( voice )
{
	var notes=[], delays=[], holds=[], velos=[], rem=1, i=0;
	while( rem > 0 )
	{
		notes.push( getNote() ); // can be a "breath"
		delays.push( 1-rem );
		holds.push( getHold(rem) );
		velos.push( getVelo(rem) );
		rem -= holds[holds.length-1];

		// handle "breaths" and octaves
		switch( voice.hand )
		{
		case 0:
			notes[i] += 5;
			break;
		case 1:
			notes[i] += 3;
			break;
		default:
			break;
		}

		i++;
	}
	voice.bars.push({
		notes: notes,
		delays: delays,
		holds: holds,
		velos: velos
	});
}
function compose()
{
	song = {
		key: getKey(),
		tempo: getTempo(),
		timeSig: getTimeSig(),
		voices: [
			{
				instrument: null,
				hand: 0,
				bars: []
			}, {
				instrument: null,
				hand: 1,
				bars: []
			}
		]
	};
	var numBars = urandint()%8+1, voice, i, j;
	for( i=0; i<numBars; i++ )
	{
		for( j=0; j<song.voices.length; j++ )
		{
			// first bar gets reused as a "riff"
			voice = song.voices[j];
			if ( voice.bars.length > 0 )
			{
				riff( voice, voice.bars[0] );
			} else {
				getBar( voice );
			}
		}
	}
	return song;
}



// SOUND
function initSound()
{
	rvrb = new p5.Reverb();
	rvrb.set( 1, 1 );
	rvrb.drywet( 1 );
	for( var i=0; i<song.voices.length; i++ )
	{
		song.voices[i].instrument = new p5.PolySynth();
		song.voices[i].instrument.connect( rvrb );
	}
	soundLoaded = true;
}
function play()
{
	uiFeedback();
	initSound();
	for ( l=0; l<song.voices.length; l++ )
	{
		var voice = song.voices[l];
		var len = voice.bars.length;
		var bars = voice.bars, i,j,k,l;
		for ( i=0; i<4; i++ )
		{
			for ( j=0; j<bars.length; j++ )
			{
				for( k=0; k<bars[j].notes.length; k++ )
				{
					voice.instrument.play(
						bars[j].notes[k],
						bars[j].velos[k],
						(
							bars[j].delays[k] + // note offset
							j + // bar offset
							i * (len-1) // loop offset
						) * (song.tempo/60), // tempo offset
						bars[j].holds[k]
					);
				}
			}
		}
	}
}



// GOVERNANCE
function render( blink )
{
        resetSeed();
	addBG();
}
function init(n)
{
        CVS = doc.querySelector( "canvas" );
        C = CVS.getContext( "2d" );

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
	n ? tokenData.hash = n : newHash() ;
	resetSeed();
}
function main(n)
{
        init(n);
	compose();
        render();
	CVS.addEventListener( "click", play );
}
main();
