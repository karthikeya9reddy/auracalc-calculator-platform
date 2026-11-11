const UNIT_TO_METRE = Object.freeze({mm:.001,cm:.01,m:1,in:.0254,ft:.3048});
function finite(value, name) {if (!Number.isFinite(value)) throw new RangeError(name+' is outside the supported numeric range.'); return value;}
function positive(value,name) {const n=Number(value);if(!Number.isFinite(n)||n<=0)throw new RangeError(name+' must be a finite value greater than zero.');return n;}
function point(p) {if(!p || typeof p.x!=='number'||typeof p.y!=='number'||![p.x,p.y].every(Number.isFinite))throw new TypeError('Measurement points must have finite pixel coordinates.');return p;}
function unitFactor(unit) {if(!Object.hasOwn(UNIT_TO_METRE,unit))throw new RangeError('Choose a supported length unit: mm, cm, m, in, or ft.');return UNIT_TO_METRE[unit];}
export function pixelDistance(a,b) {point(a);point(b);return finite(Math.hypot(b.x-a.x,b.y-a.y),'Distance');}
export function scaleFromReference(pixels,length,unit) {return positive(finite(positive(length,'Reference length')*unitFactor(unit)/positive(pixels,'Reference pixel length'),'Scale'),'Scale');}
export function scaledDistance(a,b,scale,unit='m') {const metres=finite(pixelDistance(a,b)*positive(scale,'Scale'),'Distance');return Object.freeze({value:finite(metres/unitFactor(unit),'Distance'),unit,metres});}
const cross=(a,b,c)=>finite((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),'Polygon');
const onSegment=(a,b,p)=>p.x>=Math.min(a.x,b.x)&&p.x<=Math.max(a.x,b.x)&&p.y>=Math.min(a.y,b.y)&&p.y<=Math.max(a.y,b.y);
function intersects(a,b,c,d){const x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);return (Math.sign(x)!==Math.sign(y)&&Math.sign(z)!==Math.sign(w))||(x===0&&onSegment(a,b,c))||(y===0&&onSegment(a,b,d))||(z===0&&onSegment(c,d,a))||(w===0&&onSegment(c,d,b));}
export function polygonPixelArea(points) {
  if(!Array.isArray(points)||points.length<3||points.length>200)throw new RangeError('An area needs 3–200 boundary points.');
  points.forEach(point);
  for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++) {
    if(pixelDistance(points[i],points[j])===0)throw new RangeError('Area boundary points must be distinct.');
    if(j===i+1||(i===0&&j===points.length-1))continue;
    if(intersects(points[i],points[(i+1)%points.length],points[j],points[(j+1)%points.length]))throw new RangeError('Area edges cross. Undo points and trace the boundary in order.');
  }
  // Translate to the first vertex to reduce cancellation with large coordinates.
  let twice=0;for(let i=1;i<points.length-1;i++)twice+=cross(points[0],points[i],points[i+1]);
  return positive(finite(Math.abs(twice)/2,'Area'),'Area');
}
export function scaledArea(points,scale,unit='m') {const squareMetres=positive(finite(polygonPixelArea(points)*positive(scale,'Scale')**2,'Area'),'Area');return Object.freeze({value:positive(finite(squareMetres/unitFactor(unit)**2,'Area'),'Area'),unit:unit+'²',squareMetres});}
export function angleAt(a,vertex,b) {
  const u=pixelDistance(a,vertex),v=pixelDistance(b,vertex);if(!u||!v)throw new RangeError('An angle needs two distinct endpoints and a separate vertex.');
  const cosine=((a.x-vertex.x)/u)*((b.x-vertex.x)/v)+((a.y-vertex.y)/u)*((b.y-vertex.y)/v);
  return Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI;
}
export function supportedMeasurementUnits(){return Object.freeze(Object.keys(UNIT_TO_METRE));}
