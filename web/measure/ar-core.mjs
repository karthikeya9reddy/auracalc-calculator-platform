export function distance3d(a, b) {
  const coordinates = [a?.x, a?.y, a?.z, b?.x, b?.y, b?.z];
  if (!coordinates.every(value => typeof value === 'number' && Number.isFinite(value))) throw new TypeError('Two valid tracked points are required.');
  const distance = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
  if (!Number.isFinite(distance)) throw new RangeError('Tracked distance exceeds the supported range.');
  return distance;
}

// A steady aim gate, not a claim about sensor accuracy.
export function createHitStabilizer({ duration = 350, drift = .02, samples = 6 } = {}) {
  let anchor=null, since=null, last=null, count=0;
  const reset=()=>{anchor=null;since=null;last=null;count=0;};
  return {reset,update(p,time){
    if(!p||![p.x,p.y,p.z,time].every(Number.isFinite)){reset();return null;}
    if(!anchor||time<last||distance3d(anchor,p)>drift){anchor={...p};since=time;count=0;}
    last=time;count++;
    return time-since>=duration&&count>=samples?{...p}:null;
  }};
}
