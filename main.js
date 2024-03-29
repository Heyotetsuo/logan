var round=Math.round,floor=Math.floor,abs=Math.abs,sqrt=Math.sqrt,asin=Math.asin,acos=Math.acos,sin=Math.sin,cos=Math.cos,PI=Math.PI,min=Math.min,max=Math.max,pow=Math.pow;
var doc=document,win=window,hidden, imgBuff,lp,key,seed,t,b, rvrb,song,soundLoaded=false,SEEDS=[];
var CVS,SZ,CTR,CD;

// RANDOMNESS
function urandint(n)
{
        return abs( randint(n) );
}
function randint(i)
{
        if ( i )
        {
                SEEDS[i] ^= SEEDS[i] << 13;
                SEEDS[i] ^= SEEDS[i] >> 17;
                SEEDS[i] ^= SEEDS[i] << 5;
                return SEEDS[i];
        } else {
                seed ^= seed << 13;
                seed ^= seed >> 17;
                seed ^= seed << 5;
                return seed;
        }
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
function chooseAtRandom( arr, i ){
        var n = urandint(i);
        return arr[n%arr.length];
}
function initSeeds( n )
{
        SEEDS = [];
        for( var i=0; i<n; i++ )
        {
                SEEDS.push( urandint() );
        }
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
function displaySong()
{
        var el = doc.createElement( "div" );
        el.innerText = JSON.stringify(song,null,4);
        el.style.textAlign = "left";
        el.style.padding = "2%";
        el.style.cursor = "pointer";
        el.style.position = "absolute";
        el.style.zIndex = "1";
        el.style.top = "100vh";
        el.style.whiteSpace = "pre-wrap";
        el.style.fontFamily = "monospace";
        doc.body.appendChild( el );
}
function countNotes()
{
        var voice, bar, tot=0, i,j,k;
        for( i=0; i<song.voices.length; i++ )
        {
                voice = song.voices[i];
                for( j=0; j<voice.bars.length; j++ )
                {
                        bar = voice.bars[j];
                        for( k=0; k<bar.notes.length; k++ )
                        {
                                tot++;
                        }
                }
        }
        return tot*4;
}
function getIndexes()
{
        var max = countNotes();
        var arr=[], i=0;
        for( i=0; i<max; i++ )
        {
                arr.push( i );
        }
        return arr;
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

        for( i=0; i<hex.length; i+=2 )
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
function toHex( a )
{
        var s = '', hex, i;
        for( i=0; i<a.length; i++ )
        {
                hex = parseInt(a[i]).toString(16);
                s += String( "00" + hex ).slice(-2);
        }
        return s;
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
function getPointOnCircle( deg, x, y, r )
{
        var rad = deg * (PI/180);
        return [
                x + r * sin(rad),
                y + r * cos(rad)
        ];
}
function scratchCircle( x, y, r, j )
{
        var strokes=min(r,100);
        var w = r/strokes, i;
        C.lineWidth = w*3;
        for( i=strokes-1; i>=0; i-=w )
        {
                sketchCircle( x, y, i, j );
                C.stroke();
        }
        drawCircle( x, y, r/5 );
        C.fill();
}
function sketchCircle( x, y, r, j )
{
        C.beginPath();
        C.moveTo( x, y-r );
        var angs = [], R, a, b, i;
        for( i=0; i<=30; i++ )
        {
                angs.push( i * (360/30) );
        }
        a = getPointOnCircle( angs[0], x, y, r );
        C.moveTo( a[0], a[1] );
        for( i=1; i<angs.length; i+=2 )
        {
                R = r + (r/50)*rand( j );
                a = getPointOnCircle( angs[i], x, y, R*1.02 );
                b = getPointOnCircle( angs[i+1], x, y, R );
                C.quadraticCurveTo( a[0], a[1], b[0], b[1] );
        }
}
function drawCircle( x, y, r )
{
        C.beginPath();
        C.arc( x, y, r, 0, 2*PI );
}


// FX
function addGrain( amount )
{
        C.save();
        var imgData = C.getImageData(0,0,SZ,SZ);
        var c, i=imgData.data.length-1;
        while( i>=0 )
        {
                c = urandint()%(amount*2)-amount;
                imgData.data[i] += c;
                imgData.data[i+1] += c;
                imgData.data[i+2] += c;
                i -= 4;
        }
        C.putImageData( imgData, 0, 0 );
        C.restore();
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
        addGrain(4);
        fastBlur(1);
        addGrain(2);
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

        return urandint()%keys.length;
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
                        case 2:
                                notes[i] += 2;
                                break;
                        case 3:
                                notes[i] += 4;
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
function checkQuery( query )
{
        if ( !query ){ return false; }
        var i=query[0], j=query[1], k=query[2];
        return (
                song.voices.length > i &&
                song.voices[i].bars.length > j &&
                song.voices[i].bars[j].notes.length > k
        );

}
function getQuery( query )
{
        var i=query[0], j=query[1], k=query[2];
        var voice = song.voices[i];
        var bar = voice.bars[j];

        if ( bar.notes.length > k+1 )
        {
                return [i,j,k+1];
        } else if ( voice.bars.length > j+1 ) {
                return [i,j+1,0];
        } else if ( song.voices.length > i+1 ) {
                return [i+1,0,0];
        } else {
                return null;
        }
}
function querySong( query )
{
        switch( query.length )
        {
                case 3:
                        var i=query[0], j=query[1], k=query[2];
                        return song.voices[i].bars[j].notes[k];
                case 2:
                        var i=query[0], j=query[1];
                        return song.voices[i].bars[j];
                case 1:
                        var i=query[0];
                        return song.voices[i];
                default:
                        return false;
        }
}
function isInRange( a, b )
{
        var a1=a.start, a2=a.end;
        var b1=b.start, b2=b.end;
        return (
                a1>=b1 && a1<b2+0.25 ||
                a2+0.25>=b1 && a2+0.25<b2+0.25
        );
}
function getNoteRange( bar, i )
{
        var delay = bar.delays[i];
        var hold = bar.holds[i];
        return {
                start: delay,
                end: delay + hold
        };
}
function isBanned( a, b )
{
        var c = [a,b].join();
        var banned = [
                "AG#", "G#A",
                "A#A", "AA#",
                "A#E", "EA#",
                "BA#", "A#B",
                "BC", "CB",
                "CC#", "C#C",
                "C#D", "DC#",
                "CF#", "F#C",
                "C#G", "GC#",
                "DD#", "D#D",
                "D#A", "AD#",
                "D#E", "ED#",
                "DG#", "G#D",
                "EF", "FE",
                "FB", "BF",
                "FF#", "F#F",
                "F#G", "GF#",
                "GG#", "G#G"
        ]
        return banned.includes(c);
}
function revise()
{
        var voiceA, voiceB;
        var barA, barB;
        var noteA, noteB;
        var rangeA, rangeB;
        var queryA = [0,0,0], queryB = [0,0,0];
        var i, j, k, l, m, n;

        // for each NOTE_A and NOTE_B
        while( checkQuery(queryA) )
        {
                i=queryA[0], j=queryA[1], k=queryA[2];
                barA = querySong( [i,j] );
                rangeA = getNoteRange( barA, k );
                noteA = querySong( queryA );

                while( checkQuery(queryB) )
                {
                        l=queryB[0], m=queryB[1], n=queryB[2];
                        barB = querySong( [l,m] );
                        rangeB = getNoteRange( barB, n );
                        noteB = querySong( queryB );

                        if ( isInRange(rangeA,rangeB) )
                        {
                                while( isBanned(noteA,noteB) )
                                {
                                        barA.notes[k] = getNote();
                                }
                        }
                        queryB = getQuery( queryB );
                }
                queryA = getQuery( queryA );
        }
}
function compose()
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
        var pals = [
                [ "#ffff4d", "#ffff4d", "#4d7aff", "#3655b3", "#ff4d4d" ],
                [ "#ffff4d", "#ffff4d", "#8936b3", "#4d7aff", "#3655b3", "#ff4d4d" ],
                [ "#ff2c00", "#7e31ab", "#37b6a1", "#f2797f", "#2632b3", "#869cbe" ],
                [ "#ffa586", "#ffdb61", "#4e9bde", "#85ccb9", "#aee467", "#ff86cd", "#397dff" ],
                [ "#1f306e", "#553772", "#8f3b76", "#c7417b", "#f5487f", "#e3e4ef", "#27141a" ],
                [ "#1f306e", "#553772", "#8f3b76", "#c7417b", "#f5487f", "#fff", "#000" ],
                [ "#b30000", "#ff4f00", "#ffb200", "#c81343", "#ff0062", "#fff", "#000" ],
                [ "#b30000", "#ff4f00", "#ffb200", "#c81343", "#ff0062", "#fff", "#000" ]
        ];
        var bgs = [ "#e0e0e0", "#101010", "#ddeeff", "#ffff4d", "#1f306e", "#b30000" ];
        var n = urandint()%keys.length;
        CD.colors = pals[n];
        CD.bgC = bgs[urandint()%bgs.length];
        song = {
                key: keys[n],
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
                        }, {
                                instrument: null,
                                hand: 2,
                                bars: []
                        }, {
                                instrument: null,
                                hand: 3,
                                bars: []
                        }
                ],
        };
        var numBars = urandint()%8+4, voice, i, j;
        for( i=0; i<numBars; i++ )
        {
                for( j=0; j<song.voices.length; j++ )
                {
                        // first bar gets reused as a "riff"
                        voice = song.voices[j];
                        if ( (voice.bars.length+1)%2 === 0 )
                        {
                                riff( voice, voice.bars[0] );
                        } else {
                                getBar( voice );
                        }
                }
        }
        revise();
}



// VISUALIZATION
function getNextPoint( i )
{
        var n, x, y;
        var idxArr = CD.visuals[i].idx_arr;
        switch ( CD.visuals[i].sort_method )
        {
                case 0:
                        n = idxArr.splice( urandint(i)%idxArr.length, 1 );
                        break;
                case 1:
                        n = idxArr.splice( 0, 1 );
                        break;
                case 2:
                        n = idxArr.splice( idxArr.length-1, 1 );
                        break;
                default:
                        log( "Error: sort method should be and int between 0 and 2" );
                        break;
        }
        x = sin( n*(2*PI/CD.visuals[i].spokes) ) * n;
        y = cos( n*(2*PI/CD.visuals[i].spokes) ) * n;
        return [CTR+x,CTR+y];
}
function getRandColor( i )
{
        var c = chooseAtRandom( CD.colors, i );
        var timeout = 1000, j;
        while( c === CD.bgC )
        {
                if ( j >= 25 )
                {
                        log( "Error: getRandColor() timed out." );
                        return c;
                }
                c = chooseAtRandom( CD.colors, i );
                j++;
        }
        return c;
}
function visualize( note, velo, delay, hold, i )
{
        var numClrs = CD.colors.length;
        var color = getRandColor( i );
        var numClrs = CD.colors.length;
        var r = CD.visuals[i].basesz;
        var p = getNextPoint( i );
        var numClrs = CD.colors.length;
        var x = p[0], y = p[1];
        var a = floor( (1-(r/SZ))*256 ).toString(16);
        var ahex = String( "00" + a ).slice(-2);
        var cb = hexMath( CD.bgC, 0.95, '*' );

        C.fillStyle = color + ahex;
        C.strokeStyle = color + ahex;
        scratchCircle( x, y, r, i );
        var numClrs = CD.colors.length;
}
function initVisuals( i )
{
        var n = urand(i)*SZ/2.5, viz={};
        viz.basesz = Math.pow(n,3) / Math.pow(SZ,2) + 5;
        viz.sz_range = urand(i) * viz.basesz;
        viz.spokes = urandint(i) % 30 + 2;
        viz.sort_method = urandint(i) % 3;
        if ( song ) viz.idx_arr = getIndexes();
        CD.visuals[ (i||0) ] = viz;
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
function playAll()
{
        uiFeedback();
        initSound();
        resetSeed();
        initSeeds( 2 );
        addBG();
        play();
        for( var i=0; i<SEEDS.length; i++ )
        {
                drawAll( i, timed=true );
        }
}
function play()
{
        for ( l=0; l<song.voices.length; l++ )
        {
                var voice = song.voices[l];
                var len = voice.bars.length;
                var bars = voice.bars, i,j,k,l;
                var note, velo, delay, hold, idx;
                for ( i=0; i<4; i++ )
                {
                        for ( j=0; j<bars.length; j++ )
                        {
                                for( k=0; k<bars[j].notes.length; k++ )
                                {
                                        note = bars[j].notes[k];
                                        velo = bars[j].velos[k];
                                        delay = bars[j].delays[k];
                                        hold = bars[j].holds[k];

                                        // (note offset + bar offset + (loop offset * (len-1))) * tempo offset
                                        fullDelay = ( delay + j + i * (len-1) ) * ( song.tempo/60 );
                                        voice.instrument.play( note, velo, fullDelay, hold );
                                }
                        }
                }
        }
}
function drawAll( m, timed )
{
        initVisuals( m );
        for ( l=0; l<song.voices.length; l++ )
        {
                var voice = song.voices[l];
                var len = voice.bars.length;
                var bars = voice.bars, i,j,k,l;
                var note, velo, delay, hold, idx;
                for ( i=0; i<4; i++ )
                {
                        for ( j=0; j<bars.length; j++ )
                        {
                                for( k=0; k<bars[j].notes.length; k++ )
                                {
                                        note = bars[j].notes[k];
                                        velo = bars[j].velos[k];
                                        delay = bars[j].delays[k];
                                        hold = bars[j].holds[k];

                                        if ( timed )
                                        {
                                                // (note offset + bar offset + (loop offset * (len-1))) * tempo offset
                                                fullDelay = ( delay + j + i * (len-1) ) * ( song.tempo/60 );
                                                setTimeout( ()=>visualize(note,velo,delay,hold,m), fullDelay*1000 );
                                        } else {
                                                visualize( note, velo, delay, hold, m );
                                        }
                                }
                        }
                }
        }
}



// GOVERNANCE
function render( blink )
{
        resetSeed();
        initSeeds(2);
        addBG();
        for( var i=0; i<2; i++ )
        {
                drawAll( i );
        }
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
                colors: [],
                bgC: "#ddeeff",
                visuals: []
        };

        initVisuals();

        n ? tokenData.hash = n : newHash() ;
        resetSeed();
}
function main(n)
{
        init(n);
        compose();
        displaySong();
        render();
        CVS.addEventListener( "click", playAll );
}
main();
