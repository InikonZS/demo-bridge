import { IVector } from "./IVector";
import { getNormal, solveCutted } from "./linear";
import { PhysPoint } from "./physPoint";

export class SolidLine{
    a: PhysPoint;
    b: PhysPoint;
    normal: IVector;
    sects: {pos:IVector, obj: SolidLine}[];
    constructor(){
        this.a;
        this.b;
        this.sects = [];
    }

    step(lines: Array<SolidLine>){
        this.normal = getNormal(this.a.pos, this.b.pos);
        this.sects = [];
        lines.forEach(other =>{
            if (other == this) {
                return;
            }
            const pos = solveCutted(this.a.pos, this.b.pos, other.a.pos, other.b.pos);
            if (pos){
                this.sects.push({
                    pos,
                    obj: other
                });
            }
        });
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.strokeStyle = '#9f0';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();

        this.sects.forEach(_it=>{
            const it = _it.pos;
            ctx.strokeStyle = '#f0f';
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.ellipse(it.x, it.y, 4, 4, 0 ,0, Math.PI*2);
            ctx.stroke();
            ctx.fillRect(it.x-1, it.y-1, 2, 2);
        });

        const centerPoint = {
            x: (this.a.pos.x + this.b.pos.x) / 2,
            y: (this.a.pos.y + this.b.pos.y) / 2,
        }
        ctx.strokeStyle = '#407';
        ctx.beginPath();
        ctx.moveTo(centerPoint.x, centerPoint.y);
        ctx.lineTo(centerPoint.x + this.normal.x * 10, centerPoint.y + this.normal.y * 10);
        ctx.stroke();
    }
}