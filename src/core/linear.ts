import { IVector } from "./IVector";

export function getAngle(_a: IVector, _b: IVector, c: IVector){
    const a = {x: _a.x - c.x, y: _a.y - c.y}
    const b = {x: _b.x - c.x, y: _b.y - c.y}
    if ((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)) <-1){
       return Math.acos(-1);
    }
    if ((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)) >1){
        return Math.acos(1);
     }
    const det = Math.sign(a.x*b.y - b.x*a.y); //z-coordinate of vector product
    return det* Math.acos((a.x*b.x + a.y*b.y) / (Math.hypot(a.x, a.y)* Math.hypot(b.x,b.y)))
}

export function getEquation(v1: IVector, v2:IVector){
    let v = {x: v2.x - v1.x, y: v2.y - v1.y};
    let k = v.y/v.x;
    let b = -(v1.x*k-v1.y);
    return {k, b}
}
/*function inBox(x1: number, y1: number, x2: number, y2:number, x3: number, y3:number) {
    let n = 0;
    var bou = ((x3 <= x1 + n) && (x3 > x2 - n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 <= y1 + n) && (y3 > y2 - n) ||
        (x3 <= x1 + n) && (x3 > x2 - n) && (y3 > y1 - n) && (y3 <= y2 + n) ||
        (x3 > x1 - n) && (x3 <= x2 + n) && (y3 > y1 - n) && (y3 <= y2 + n));
    return bou;
}*/

function inBox(x1: number, y1: number, x2: number, y2:number, x3: number, y3:number) {
    let n = 0;
    const minx = Math.min(x1, x2);
    const maxx = Math.max(x1, x2);
    const miny = Math.min(y1, y2);
    const maxy = Math.max(y1, y2);
    var bou = (
        x3 <= maxx && x3 >= minx && y3 <= maxy && y3 >= miny
        //x3 < maxx && x3 > minx && y3 < maxy && y3 > miny
    )
    return bou;
}

function inBoxLine(v1: IVector,v2: IVector, nv: IVector){
    return inBox(v1.x, v1.y, v2.x, v2.y, nv.x, nv.y)
}

export function rotate(v: IVector, ang: number){
    return {x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: v.y * Math.cos(ang) - v.x * Math.sin(ang)}
}

function mod(a:number, b: number){
    if (b< 0){
        return;
    }
    let br = 0;
    while (a>b){
        br+=1;
        if (br >100){
            console.log('breaked');
            return;
        }
        a = a - b
    }
    return a;
}

export function solveCutted(v1: IVector, v2: IVector, v3: IVector, v4: IVector){
    const ang1 = getAngle(v1, v2, {...v2, x: v2.x +1});
    const ang2 = getAngle(v3, v4, {...v4, x: v4.x +1});
    const med = Math.abs(mod((ang1 + Math.PI *2),(Math.PI /2)) - mod((ang2 + Math.PI *2), (Math.PI /2))) /2;
    const rv1 = rotate(v1, med);
    const rv2 = rotate(v2, med);
    const rv3 = rotate(v3, med);
    const rv4 = rotate(v4, med);

    let e1 = getEquation(rv1,rv2);
    let e2 = getEquation(rv3,rv4);
    let nv = solveEquation(e1,e2);
    let res:IVector = null;
    if (inBoxLine(rv1,rv2, nv)&& inBoxLine(rv3, rv4, nv)){
        res = rotate(nv, -med);
    }
    return res;
}
  
function solveEquation(e1: {k: number, b: number}, e2: {k: number, b: number}){
    let cx = -(e1.b-e2.b)/ (e1.k-e2.k);
    let cy = cx*e2.k+e2.b;
    return {x:cx, y: cy};
}

function test(){
    console.log('test linear')
    console.log(solveCutted({x:0, y: 10}, {x:0, y: 100}, {x:-10, y: 20}, {x:10, y: 20}));
    console.log('end test linear')
}
test();