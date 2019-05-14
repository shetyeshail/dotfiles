/*
 zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function(){function t(a){throw a;}function r(a,h){var f=a.split("."),e=F;f[0]in e||!e.execScript||e.execScript("var "+f[0]);for(var m;f.length&&(m=f.shift());)f.length||void 0===h?e=e[m]?e[m]:e[m]={}:e[m]=h}function u(a,h,f){var e;"number"===typeof h||(h=0);var m="number"===typeof f?f:a.length;f=-1;for(e=m&7;e--;++h)f=f>>>8^c[(f^a[h])&255];for(e=m>>3;e--;h+=8)f=f>>>8^c[(f^a[h])&255],f=f>>>8^c[(f^a[h+1])&255],f=f>>>8^c[(f^a[h+2])&255],f=f>>>8^c[(f^a[h+3])&255],f=f>>>8^c[(f^a[h+4])&255],f=f>>>8^c[(f^
a[h+5])&255],f=f>>>8^c[(f^a[h+6])&255],f=f>>>8^c[(f^a[h+7])&255];return(f^4294967295)>>>0}function p(){}function A(a){var h=a.length,f=0,e=Number.POSITIVE_INFINITY,m,b,C,c,d,g,n,v,p;for(v=0;v<h;++v)a[v]>f&&(f=a[v]),a[v]<e&&(e=a[v]);m=1<<f;b=new (k?Uint32Array:Array)(m);C=1;c=0;for(d=2;C<=f;){for(v=0;v<h;++v)if(a[v]===C){g=0;n=c;for(p=0;p<C;++p)g=g<<1|n&1,n>>=1;n=C<<16|v;for(p=g;p<m;p+=d)b[p]=n;++c}++C;c<<=1;d<<=1}return[b,f,e]}function w(a,h){this.M=[];this.N=32768;this.d=this.m=this.c=this.n=0;this.input=
k?new Uint8Array(a):a;this.$=!1;this.k=v;this.z=!1;if(h||!(h={}))h.index&&(this.c=h.index),h.bufferSize&&(this.N=h.bufferSize),h.sa&&(this.k=h.sa),h.resize&&(this.z=h.resize);switch(this.k){case d:this.a=32768;this.b=new (k?Uint8Array:Array)(32768+this.N+258);break;case v:this.a=0;this.b=new (k?Uint8Array:Array)(this.N);this.e=this.la;this.q=this.ia;this.O=this.ka;break;default:t(Error("invalid inflate mode"))}}function q(a,h){for(var f=a.m,e=a.d,m=a.input,b=a.c,c=m.length;e<h;)b>=c&&t(Error("input buffer is broken")),
f|=m[b++]<<e,e+=8;a.m=f>>>h;a.d=e-h;a.c=b;return f&(1<<h)-1}function x(a,h){for(var f=a.m,e=a.d,m=a.input,b=a.c,c=m.length,C=h[0],d=h[1];e<d&&!(b>=c);)f|=m[b++]<<e,e+=8;m=C[f&(1<<d)-1];c=m>>>16;a.m=f>>c;a.d=e-c;a.c=b;return m&65535}function z(a){function h(a,m,h){var f,e=this.ea,b,c;for(c=0;c<a;)switch(f=x(this,m),f){case 16:for(b=3+q(this,2);b--;)h[c++]=e;break;case 17:for(b=3+q(this,3);b--;)h[c++]=0;e=0;break;case 18:for(b=11+q(this,7);b--;)h[c++]=0;e=0;break;default:e=h[c++]=f}this.ea=e;return h}
var f=q(a,5)+257,e=q(a,5)+1,m=q(a,4)+4,b=new (k?Uint8Array:Array)(n.length),c;for(c=0;c<m;++c)b[n[c]]=q(a,3);if(!k)for(c=m,m=b.length;c<m;++c)b[n[c]]=0;m=A(b);b=new (k?Uint8Array:Array)(f);c=new (k?Uint8Array:Array)(e);a.ea=0;a.O(A(h.call(a,f,m,b)),A(h.call(a,e,m,c)))}function y(a){this.input=a;this.c=0;this.P=[];this.ba=!1}var F=this,k="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView,g;for(g=0;256>g;++g)for(var a=g,
b=7,a=a>>>1;a;a>>>=1)--b;g=[0,1996959894,3993919788,2567524794,124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,
1172266101,3705015759,2882616665,651767980,1373503546,3369554304,3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,
1658658271,366619977,2362670323,4224994405,1303535960,984961486,2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,
2053790376,3826175755,2466906013,167816743,2097651377,4027552580,2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,
733239954,1555261956,3268935591,3050360625,752459403,1541320221,2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,
3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];var c=k?new Uint32Array(g):g;p.prototype.S=function(){return this.name};p.prototype.A=function(){return this.data};p.prototype.U=function(){return this.ma};r("Zlib.GunzipMember",p);r("Zlib.GunzipMember.prototype.getName",p.prototype.S);r("Zlib.GunzipMember.prototype.getData",
p.prototype.A);r("Zlib.GunzipMember.prototype.getMtime",p.prototype.U);g=[];for(a=0;288>a;a++)switch(!0){case 143>=a:g.push([a+48,8]);break;case 255>=a:g.push([a-144+400,9]);break;case 279>=a:g.push([a-256+0,7]);break;case 287>=a:g.push([a-280+192,8]);break;default:t("invalid literal: "+a)}g=function(){function a(a){switch(!0){case 3===a:return[257,a-3,0];case 4===a:return[258,a-4,0];case 5===a:return[259,a-5,0];case 6===a:return[260,a-6,0];case 7===a:return[261,a-7,0];case 8===a:return[262,a-8,0];
case 9===a:return[263,a-9,0];case 10===a:return[264,a-10,0];case 12>=a:return[265,a-11,1];case 14>=a:return[266,a-13,1];case 16>=a:return[267,a-15,1];case 18>=a:return[268,a-17,1];case 22>=a:return[269,a-19,2];case 26>=a:return[270,a-23,2];case 30>=a:return[271,a-27,2];case 34>=a:return[272,a-31,2];case 42>=a:return[273,a-35,3];case 50>=a:return[274,a-43,3];case 58>=a:return[275,a-51,3];case 66>=a:return[276,a-59,3];case 82>=a:return[277,a-67,4];case 98>=a:return[278,a-83,4];case 114>=a:return[279,
a-99,4];case 130>=a:return[280,a-115,4];case 162>=a:return[281,a-131,5];case 194>=a:return[282,a-163,5];case 226>=a:return[283,a-195,5];case 257>=a:return[284,a-227,5];case 258===a:return[285,a-258,0];default:t("invalid length: "+a)}}var h=[],f,e;for(f=3;258>=f;f++)e=a(f),h[f]=e[2]<<24|e[1]<<16|e[0];return h}();k&&new Uint32Array(g);var d=0,v=1;w.prototype.F=function(){for(;!this.$;){var a=q(this,3);a&1&&(this.$=!0);a>>>=1;switch(a){case 0:var a=this.input,h=this.c,f=this.b,e=this.a,b=a.length,c,
g=f.length;this.d=this.m=0;h+1>=b&&t(Error("invalid uncompressed block header: LEN"));c=a[h++]|a[h++]<<8;h+1>=b&&t(Error("invalid uncompressed block header: NLEN"));b=a[h++]|a[h++]<<8;c===~b&&t(Error("invalid uncompressed block header: length verify"));h+c>a.length&&t(Error("input buffer is broken"));switch(this.k){case d:for(;e+c>f.length;){b=g-e;c-=b;if(k)f.set(a.subarray(h,h+b),e),e+=b,h+=b;else for(;b--;)f[e++]=a[h++];this.a=e;f=this.e();e=this.a}break;case v:for(;e+c>f.length;)f=this.e({t:2});
break;default:t(Error("invalid inflate mode"))}if(k)f.set(a.subarray(h,h+c),e),e+=c,h+=c;else for(;c--;)f[e++]=a[h++];this.c=h;this.a=e;this.b=f;break;case 1:this.O(J,K);break;case 2:z(this);break;default:t(Error("unknown BTYPE: "+a))}}return this.q()};g=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];var n=k?new Uint16Array(g):g;g=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258];var G=k?new Uint16Array(g):g;g=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,
3,4,4,4,4,5,5,5,5,0,0,0];var D=k?new Uint8Array(g):g;g=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];var H=k?new Uint16Array(g):g;g=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];var E=k?new Uint8Array(g):g;g=new (k?Uint8Array:Array)(288);a=0;for(b=g.length;a<b;++a)g[a]=143>=a?8:255>=a?9:279>=a?7:8;var J=A(g);g=new (k?Uint8Array:Array)(30);a=0;for(b=g.length;a<b;++a)g[a]=5;var K=A(g);w.prototype.O=function(a,
h){var f=this.b,b=this.a;this.r=a;for(var c=f.length-258,d,k,l;256!==(d=x(this,a));)if(256>d)b>=c&&(this.a=b,f=this.e(),b=this.a),f[b++]=d;else for(d-=257,l=G[d],0<D[d]&&(l+=q(this,D[d])),d=x(this,h),k=H[d],0<E[d]&&(k+=q(this,E[d])),b>=c&&(this.a=b,f=this.e(),b=this.a);l--;)f[b]=f[b++-k];for(;8<=this.d;)this.d-=8,this.c--;this.a=b};w.prototype.ka=function(a,h){var b=this.b,c=this.a;this.r=a;for(var d=b.length,k,g,l;256!==(k=x(this,a));)if(256>k)c>=d&&(b=this.e(),d=b.length),b[c++]=k;else for(k-=257,
l=G[k],0<D[k]&&(l+=q(this,D[k])),k=x(this,h),g=H[k],0<E[k]&&(g+=q(this,E[k])),c+l>d&&(b=this.e(),d=b.length);l--;)b[c]=b[c++-g];for(;8<=this.d;)this.d-=8,this.c--;this.a=c};w.prototype.e=function(){var a=new (k?Uint8Array:Array)(this.a-32768),b=this.a-32768,f,c,d=this.b;if(k)a.set(d.subarray(32768,a.length));else for(f=0,c=a.length;f<c;++f)a[f]=d[f+32768];this.M.push(a);this.n+=a.length;if(k)d.set(d.subarray(b,b+32768));else for(f=0;32768>f;++f)d[f]=d[b+f];this.a=32768;return d};w.prototype.la=function(a){var b,
c=this.input.length/this.c+1|0,e,d,g,v=this.input,l=this.b;a&&("number"===typeof a.t&&(c=a.t),"number"===typeof a.ha&&(c+=a.ha));2>c?(e=(v.length-this.c)/this.r[2],g=e/2*258|0,d=g<l.length?l.length+g:l.length<<1):d=l.length*c;k?(b=new Uint8Array(d),b.set(l)):b=l;return this.b=b};w.prototype.q=function(){var a=0,b=this.b,c=this.M,e,d=new (k?Uint8Array:Array)(this.n+(this.a-32768)),g,v,l,n;if(0===c.length)return k?this.b.subarray(32768,this.a):this.b.slice(32768,this.a);g=0;for(v=c.length;g<v;++g)for(e=
c[g],l=0,n=e.length;l<n;++l)d[a++]=e[l];g=32768;for(v=this.a;g<v;++g)d[a++]=b[g];this.M=[];return this.buffer=d};w.prototype.ia=function(){var a,b=this.a;k?this.z?(a=new Uint8Array(b),a.set(this.b.subarray(0,b))):a=this.b.subarray(0,b):(this.b.length>b&&(this.b.length=b),a=this.b);return this.buffer=a};y.prototype.A=function(){this.ba||this.F();return this.P.slice()};y.prototype.F=function(){for(var a=this.input.length;this.c<a;){var b=new p,c,e,d;d=void 0;var g,v,l=this.input;e=this.c;b.ca=l[e++];
b.da=l[e++];31===b.ca&&139===b.da||t(Error("invalid file signature:"+b.ca+","+b.da));b.p=l[e++];switch(b.p){case 8:break;default:t(Error("unknown compression method: "+b.p))}b.G=l[e++];c=l[e++]|l[e++]<<8|l[e++]<<16|l[e++]<<24;b.ma=new Date(1E3*c);b.Fa=l[e++];b.Ea=l[e++];0<(b.G&4)&&(b.na=l[e++]|l[e++]<<8,e+=b.na);if(0<(b.G&8)){v=[];for(g=0;0<(c=l[e++]);)v[g++]=String.fromCharCode(c);b.name=v.join("")}if(0<(b.G&16)){v=[];for(g=0;0<(c=l[e++]);)v[g++]=String.fromCharCode(c);b.Ba=v.join("")}0<(b.G&2)&&
(b.ja=u(l,0,e)&65535,b.ja!==(l[e++]|l[e++]<<8)&&t(Error("invalid header crc16")));c=l[l.length-4]|l[l.length-3]<<8|l[l.length-2]<<16|l[l.length-1]<<24;l.length-e-4-4<512*c&&(d=c);e=new w(l,{index:e,bufferSize:d});b.data=d=e.F();e=e.c;b.Ca=c=(l[e++]|l[e++]<<8|l[e++]<<16|l[e++]<<24)>>>0;u(d,void 0,void 0)!==c&&t(Error("invalid CRC-32 checksum: 0x"+u(d,void 0,void 0).toString(16)+" / 0x"+c.toString(16)));b.Da=c=(l[e++]|l[e++]<<8|l[e++]<<16|l[e++]<<24)>>>0;(d.length&4294967295)!==c&&t(Error("invalid input size: "+
(d.length&4294967295)+" / "+c));this.P.push(b);this.c=e}this.ba=!0;a=this.P;b=d=e=0;for(l=a.length;b<l;++b)d+=a[b].data.length;if(k)for(d=new Uint8Array(d),b=0;b<l;++b)d.set(a[b].data,e),e+=a[b].data.length;else{d=[];for(b=0;b<l;++b)d[b]=a[b].data;d=Array.prototype.concat.apply([],d)}return d};r("Zlib.Gunzip",y);r("Zlib.Gunzip.prototype.decompress",y.prototype.F);r("Zlib.Gunzip.prototype.getMembers",y.prototype.A)}).call(this);var I=function(){function t(a){var b=new q,c=!0;if(a){if("number"===typeof a)b.buffer=new z(a);else{if("writeByte"in a)return a;b.buffer=a}c=!1}else b.buffer=new z(16384);b.f=0;b.H=function(a){if(c&&this.f>=this.buffer.length){var b=new z(2*this.buffer.length);this.buffer.Y(b);this.buffer=b}this.buffer[this.f++]=a};b.L=function(){if(this.f!==this.buffer.length){if(!c)throw new TypeError("outputsize does not match decoded input");var a=new z(this.f);this.buffer.Y(a,0,0,this.f);this.buffer=a}return this.buffer};
b.Ia=!0;return b}function r(a){if("readByte"in a)return a;var b=new q;b.f=0;b.u=function(){return a[this.f++]};b.seek=function(a){this.f=a};b.j=function(){return this.f>=a.length};return b}function u(a,b){this.ga=this.fa=this.w=0;this.X(a,b)}function p(a,b){var c=g[a]||"unknown error";b&&(c+=": "+b);c=new TypeError(c);c.errorCode=a;throw c;}function A(a,b){var c=a[b],d;for(d=b;0<d;d--)a[d]=a[d-1];return a[0]=c}function w(){var a=4294967295;this.Z=function(){return~a>>>0};this.ya=function(b,c){for(;0<
c--;)a=a<<8^F[(a>>>24^b)&255]}}function q(){}function x(a){this.stream=a;this.K=this.h=0;this.o=!1}var z=Uint8Array;z.prototype.Y=function(a,b,c,d){a.set(this.subarray(c,d),b)};var y=[0,1,3,7,15,31,63,127,255];x.prototype.ra=function(){this.o||(this.K=this.stream.u(),this.o=!0)};x.prototype.read=function(a){for(var b=0;0<a;){this.ra();var c=8-this.h;a>=c?(b<<=c,b|=y[c]&this.K,this.o=!1,this.h=0,a-=c):(b<<=a,c-=a,b|=(this.K&y[a]<<c)>>c,this.h+=a,a=0)}return b};x.prototype.seek=function(a){var b=a%
8;this.h=b;this.stream.seek((a-b)/8);this.o=!1};x.prototype.xa=function(){var a=new z(6),b;for(b=0;b<a.length;b++)a[b]=this.read(8);return a.reduce(function(a,b){return a+b.toString(16)},"")};q.prototype.u=function(){throw Error("abstract method readByte() not implemented");};q.prototype.read=function(a,b,c){for(var d=0;d<c;){var g=this.u();if(0>g)return d?d:-1;a[b++]=g;d++}return d};q.prototype.seek=function(){throw Error("abstract method seek() not implemented");};q.prototype.H=function(){throw Error("abstract method readByte() not implemented");
};q.prototype.write=function(a,b,c){var d;for(d=0;d<c;d++)this.H(a[b++]);return c};var F=new Uint32Array([0,79764919,159529838,222504665,319059676,398814059,445009330,507990021,638119352,583659535,797628118,726387553,890018660,835552979,1015980042,944750013,1276238704,1221641927,1167319070,1095957929,1595256236,1540665371,1452775106,1381403509,1780037320,1859660671,1671105958,1733955601,2031960084,2111593891,1889500026,1952343757,2552477408,2632100695,2443283854,2506133561,2334638140,2414271883,2191915858,
2254759653,3190512472,3135915759,3081330742,3009969537,2905550212,2850959411,2762807018,2691435357,3560074640,3505614887,3719321342,3648080713,3342211916,3287746299,3467911202,3396681109,4063920168,4143685023,4223187782,4286162673,3779000052,3858754371,3904687514,3967668269,881225847,809987520,1023691545,969234094,662832811,591600412,771767749,717299826,311336399,374308984,453813921,533576470,25881363,88864420,134795389,214552010,2023205639,2086057648,1897238633,1976864222,1804852699,1867694188,1645340341,
1724971778,1587496639,1516133128,1461550545,1406951526,1302016099,1230646740,1142491917,1087903418,2896545431,2825181984,2770861561,2716262478,3215044683,3143675388,3055782693,3001194130,2326604591,2389456536,2200899649,2280525302,2578013683,2640855108,2418763421,2498394922,3769900519,3832873040,3912640137,3992402750,4088425275,4151408268,4197601365,4277358050,3334271071,3263032808,3476998961,3422541446,3585640067,3514407732,3694837229,3640369242,1762451694,1842216281,1619975040,1682949687,2047383090,
2127137669,1938468188,2001449195,1325665622,1271206113,1183200824,1111960463,1543535498,1489069629,1434599652,1363369299,622672798,568075817,748617968,677256519,907627842,853037301,1067152940,995781531,51762726,131386257,177728840,240578815,269590778,349224269,429104020,491947555,4046411278,4126034873,4172115296,4234965207,3794477266,3874110821,3953728444,4016571915,3609705398,3555108353,3735388376,3664026991,3290680682,3236090077,3449943556,3378572211,3174993278,3120533705,3032266256,2961025959,
2923101090,2868635157,2813903052,2742672763,2604032198,2683796849,2461293480,2524268063,2284983834,2364738477,2175806836,2238787779,1569362073,1498123566,1409854455,1355396672,1317987909,1246755826,1192025387,1137557660,2072149281,2135122070,1912620623,1992383480,1753615357,1816598090,1627664531,1707420964,295390185,358241886,404320391,483945776,43990325,106832002,186451547,266083308,932423249,861060070,1041341759,986742920,613929101,542559546,756411363,701822548,3316196985,3244833742,3425377559,
3370778784,3601682597,3530312978,3744426955,3689838204,3819031489,3881883254,3928223919,4007849240,4037393693,4100235434,4180117107,4259748804,2310601993,2373574846,2151335527,2231098320,2596047829,2659030626,2470359227,2550115596,2947551409,2876312838,2788305887,2733848168,3165939309,3094707162,3040238851,2985771188]),k={Ga:0,oa:-1,B:-2,pa:-3,qa:-4,g:-5,OUT_OF_MEMORY:-6,T:-7,Aa:-8},g={};g[k.oa]="Bad file checksum";g[k.B]="Not bzip data";g[k.pa]="Unexpected input EOF";g[k.qa]="Unexpected output EOF";
g[k.g]="Data error";g[k.OUT_OF_MEMORY]="Out of memory";g[k.T]="Obsolete (pre 0.9.5) bzip format not supported.";u.prototype.W=function(){if(!this.V())return this.w=-1,!1;this.C=new w;return!0};u.prototype.X=function(a,b){var c=new z(4);4===a.read(c,0,4)&&"BZh"===String.fromCharCode(c[0],c[1],c[2])||p(k.B,"bad magic");c=c[3]-48;(1>c||9<c)&&p(k.B,"level out of range");this.l=new x(a);this.i=1E5*c;this.wa=b;this.v=0};u.prototype.V=function(){var a,b,c,d=this.l,g=d.xa();if("177245385090"===g)return!1;
"314159265359"!==g&&p(k.B);this.R=d.read(32)>>>0;this.v=(this.R^(this.v<<1|this.v>>>31))>>>0;d.read(1)&&p(k.T);g=d.read(24);g>this.i&&p(k.g,"initial position out of bounds");var n=d.read(16),t=new z(256),u=0;for(a=0;16>a;a++)if(n&1<<15-a){var r=16*a;c=d.read(16);for(b=0;16>b;b++)c&1<<15-b&&(t[u++]=r+b)}var q=d.read(3);(2>q||6<q)&&p(k.g);c=d.read(15);0===c&&p(k.g);r=new z(256);for(a=0;a<q;a++)r[a]=a;var w=new z(c);for(a=0;a<c;a++){for(b=0;d.read(1);b++)b>=q&&p(k.g);w[a]=A(r,b)}var x=u+2,C=[],h;for(b=
0;b<q;b++){var f=new z(x),e=new Uint16Array(21),n=d.read(5);for(a=0;a<x;a++){for(;;){(1>n||20<n)&&p(k.g);if(!d.read(1))break;d.read(1)?n--:n++}f[a]=n}var m,B;m=B=f[0];for(a=1;a<x;a++)f[a]>B?B=f[a]:f[a]<m&&(m=f[a]);h={};C.push(h);h.aa=new Uint16Array(258);h.s=new Uint32Array(22);h.J=new Uint32Array(21);h.va=m;h.ua=B;var y=0;for(a=m;a<=B;a++)for(n=e[a]=h.s[a]=0;n<x;n++)f[n]===a&&(h.aa[y++]=n);for(a=0;a<x;a++)e[f[a]]++;y=n=0;for(a=m;a<B;a++)y+=e[a],h.s[a]=y-1,y<<=1,n+=e[a],h.J[a+1]=y-n;h.s[B+1]=Number.MAX_VALUE;
h.s[B]=y+e[B]-1;h.J[m]=0}e=new Uint32Array(256);for(a=0;256>a;a++)r[a]=a;B=q=m=0;f=this.ta=new Uint32Array(this.i);for(x=0;;){x--||(x=49,B>=c&&p(k.g),h=C[w[B++]]);a=h.va;for(b=d.read(a);;a++){a>h.ua&&p(k.g);if(b<=h.s[a])break;b=b<<1|d.read(1)}b-=h.J[a];(0>b||258<=b)&&p(k.g);a=h.aa[b];if(0===a||1===a)m||(m=1,n=0),n=0===a?n+m:n+2*m,m<<=1;else{if(m)for(m=0,q+n>this.i&&p(k.g),b=t[r[0]],e[b]+=n;n--;)f[q++]=b;if(a>u)break;q>=this.i&&p(k.g);--a;b=A(r,a);b=t[b];e[b]++;f[q++]=b}}(0>g||g>=q)&&p(k.g);for(a=
b=0;256>a;a++)c=b+e[a],e[a]=b,b=c;for(a=0;a<q;a++)b=f[a]&255,f[e[b]]|=a<<8,e[b]++;n=h=d=0;q&&(d=f[g],h=d&255,d>>=8,n=-1);this.ga=d;this.fa=h;this.w=q;this.za=n;return!0};u.prototype.I=function(){var a,b,c;if(!(0>this.w)){for(var d=this.ta,g=this.ga,n=this.fa,q=this.w,r=this.za;q;){q--;b=n;g=d[g];n=g&255;g>>=8;3===r++?(a=n,c=b,n=-1):(a=1,c=n);for(this.C.ya(c,a);a--;)this.wa.H(c);n!=b&&(r=0)}this.w=q;this.C.Z()!==this.R&&p(k.g,"Bad block CRC (got "+this.C.Z().toString(16)+" expected "+this.R.toString(16)+
")")}};u.A=k;u.decode=function(a,b){for(var c=r(a),d=t(b),g=new u(c,d);!("eof"in c&&c.j());)if(g.W())g.I();else{c=g.l.read(32)>>>0;c!==g.v&&p(k.g,"Bad stream CRC (got "+g.v.toString(16)+" expected "+c.toString(16)+")");break}return d.L&&d.L()};u.U=function(a,b,c){a=r(a);c=t(c);a=new u(a,c);a.l.seek(b);a.V()&&(a.C=new w,a.Ja=0,a.I());if("getBuffer"in c)return c.L()};u.Ha=function(a,b,c){var d=new q;d.D=r(a);d.f=0;d.u=function(){this.f++;return this.D.u()};d.D.j&&(d.j=d.D.j.bind(d.D));a=new q;a.f=0;
a.H=function(){this.f++};for(var g=new u(d,a),k=g.i;!("eof"in d&&d.j());){var p=8*d.f+g.l.h;g.l.o&&(p-=8);if(g.W()){var t=a.f;g.I();b(p,a.f-t)}else if(g.l.read(32),c&&"eof"in d&&!d.j())g.X(d,a),console.assert(g.i===k,"shouldn't change block size within multistream file");else break}};u.S=q;return u}();function L(t,r,u){u?self.postMessage({cmd:"resp",_id_:t,err:r,buf:u},[u]):self.postMessage({cmd:"resp",_id_:t,err:r})}self.addEventListener("message",function(t){var r=t.data;t=r._id_;switch(r.cmd){case "uz_b":var r=r.buf,u,p;try{var A=I.decode(new Uint8Array(r),void 0);p=A.buffer}catch(w){u=w&&w.toString()}L(t,u,p);break;case "uz_g":r=r.buf;try{A=(new Zlib.Gunzip(new Uint8Array(r))).decompress(),p=A.buffer}catch(w){u=w&&w.toString()}L(t,u,p)}},!1);
