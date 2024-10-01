import {IVector} from '../core/IVector';
import { getAngle, rotate } from '../core/linear';

export function drawSling(ctx: CanvasRenderingContext2D, start: IVector, finish: IVector, length: number, width: number){
    const ang = getAngle(start, finish, {x:start.x +1, y:start.y});
    const spoint = {x:0, y:0};//{x:100, y:110}
    const tpoint = rotate({x:finish.x - start.x, y: finish.y - start.y}, Math.PI + ang);//{x:200, y:110}
    const mpoint = {x: (spoint.x + tpoint.x) / 2, y: (spoint.y + tpoint.y) / 2}
    const jdist = Math.hypot(spoint.x - tpoint.x, spoint.y - tpoint.y);
    
    let kThin = 2;
    let dk = (jdist - length) / kThin;
    let df = 0;
    let dwidth = width * 2;
    if (dk>dwidth*0.7){
        df = Math.max((dwidth*0.7 - dk)*20, -jdist / 3);
        dk = dwidth*0.7
    }
    ctx.strokeStyle = '#f00';
    ctx.fillStyle = '#400';
    ctx.beginPath();
    //ctx.moveTo(100,100);
    const pbuf = [
        {
            x: mpoint.x + df, 
            y: mpoint.y - width + dk
        },
        { 
            x: mpoint.x - df, 
            y: mpoint.y - width + dk, 
        },
        {
            x: tpoint.x, 
            y: tpoint.y - width
        },

        {
            x: tpoint.x + width*2 * 0.7, 
            y: tpoint.y- width +5,
        }, 
        { 
            x: tpoint.x + width*2* 0.7,
            y: tpoint.y+ width - 5, 
        },
        { 
            x: tpoint.x, 
            y: tpoint.y + width
        },
        
        {x:mpoint.x-df, y:mpoint.y + width -dk},{x:mpoint.x + df, y:mpoint.y + width -dk}, {x: spoint.x, y:spoint.y + width},
        {x:spoint.x - width*2 * 0.7, y: spoint.y+ width -5},{x: spoint.x - width*2* 0.7, y:spoint.y- width + 5}, {x:spoint.x, y:spoint.y - width}
    ].map(it=>{
        const rt = rotate(it, Math.PI - ang);
        return {x:rt.x + start.x, y: rt.y+start.y}
    })
    /*ctx.bezierCurveTo(mpoint.x +df, mpoint.y - width + dk, mpoint.x-df, mpoint.y - width + dk, tpoint.x, tpoint.y - width);
    ctx.bezierCurveTo(tpoint.x + 20 * 0.7, tpoint.y- width +5, tpoint.x + 20* 0.7, tpoint.y+ width - 5, tpoint.x, tpoint.y + width);
    ctx.bezierCurveTo(mpoint.x-df, mpoint.y + width -dk, mpoint.x + df, mpoint.y + width -dk, spoint.x, spoint.y + width);
    ctx.bezierCurveTo(spoint.x - 20 * 0.7, spoint.y+ width -5, spoint.x - 20* 0.7, spoint.y- width + 5, spoint.x, spoint.y - width);*/
    ctx.moveTo(pbuf[pbuf.length-1].x,pbuf[pbuf.length-1].y);
    for (let i=0; i< pbuf.length; i+=3){
        ctx.bezierCurveTo(pbuf[0 + i].x, pbuf[0 + i].y, pbuf[1 + i].x, pbuf[1 +i].y,pbuf[2+i].x, pbuf[2+i].y);
    }
    
    ctx.fill();
    ctx.stroke();
}