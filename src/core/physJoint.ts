import { drawSling } from "../views/drawSling";
import { PhysPoint  } from "./physPoint";
import { SolidLine } from "./solidLine";

export class PhysJoint{
    a: PhysPoint;
    b: PhysPoint;
    targetLength: number;
    strength: number;
    friction: number;
    constructor(){
        this.a;
        this.b;
        this.targetLength = 150;
        this.strength = 1;
        this.friction = 0.9999;//99;
    }

    getCurrentLength(){
        return Math.hypot(this.a.pos.x - this.b.pos.x, this.a.pos.y - this.b.pos.y);
    }

    step(lines: SolidLine[]){
        const nextDist = Math.hypot(this.a.pos.x - this.b.pos.x, this.a.pos.y - this.b.pos.y);
        const nextPoint = this.b;
        const curDist = this.targetLength
        const dir = {
            x: -(nextDist - curDist) * (this.a.pos.x - nextPoint.pos.x)/curDist,
            y: -(nextDist - curDist) * (this.a.pos.y - nextPoint.pos.y)/curDist,
        }
        //const p = (this.a.mass + this.b.mass) * 
        //it.force.x+=dir.x/ 3000;
        //it.force.y+=dir.y/ 3000;
        const strength = this.strength*1000;
        this.a.vel.x = this.a.vel.x *this.friction + (dir.x/ strength)*this.b.mass / (this.a.mass + this.b.mass);
        this.a.vel.y = this.a.vel.y *this.friction + (dir.y /strength)*this.b.mass / (this.a.mass + this.b.mass); 

        this.b.vel.x = this.b.vel.x *this.friction - (dir.x/ strength)*this.a.mass / (this.a.mass + this.b.mass);
        this.b.vel.y = this.b.vel.y *this.friction - (dir.y /strength)*this.a.mass / (this.a.mass + this.b.mass); 

       // this.solidStep(lines); // works bad
    }

    solidStep(lines:SolidLine[]){
        const solid = new SolidLine();
        solid.a = this.a;
        solid.b = this.b;
        solid.step(lines);
        if (solid.sects.length){
           //solid.sects.length > 1 &&console.log(solid.sects.length);
            [solid.a, solid.b].forEach(p=>{
                const speed = p.vel;
                const mnorm = solid.sects.reduce((acc, sc)=>{
                    const nn = {
                        x: (acc.x + sc.obj.normal.x) /2, 
                        y: (acc.y + sc.obj.normal.y) /2, 
                    }
                    const len = Math.hypot(nn.x, nn.y);
                   // (len <1) && console.log({x:nn.x/len, y: nn.y/len}, len,  Math.hypot(nn.x/len, nn.y/len));
                    //(len ==1) && console.log('shit');
                    return {x:nn.x/len, y: nn.y/len}
                }, solid.sects[0].obj.normal);
                const norm = mnorm;//solid.sects[0].obj.normal
                const dot = norm.x*speed.x + norm.y*speed.y;
                const reflected = {
                    x: speed.x - (norm.x * 2 * dot),
                    y: speed.y - (norm.y * 2 * dot),
                }
                //speed = reflected;
        
                p.vel.x = reflected.x *0.995 ;
                p.vel.y = reflected.y *0.995;
                p.step();
            })
        }
    }

    render(ctx: CanvasRenderingContext2D){
        drawSling(ctx, this.a.pos, this.b.pos, this.targetLength, 5);
        ctx.strokeStyle = '#f90';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();

    }
}