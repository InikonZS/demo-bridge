import { IVector } from "./IVector";
import { SolidLine } from "./solidLine";

export class PhysPoint{
    pos: IVector;
    vel: IVector;
    acc: IVector;
    mass: number;
    nograv: boolean = false;

    constructor(){
        this.pos = {x: 0, y:0};
        this.vel = {x: 0, y:0};
        this.acc = {x: 0, y:0};
        this.mass = 1;
    }

    step(lines?: SolidLine[]){
        this.pos.x = this.pos.x + this.vel.x;
        this.pos.y = this.pos.y + this.vel.y;
        /*if (this.pos.y> 590){
            this.pos.y = 590;
            this.vel.y = -this.vel.y * 0.99995;
        }*/
       if (lines){
        this.solidStep(lines);
       }
    }

    solidStep(lines: SolidLine[]){
        const lastPoint = new PhysPoint();
        lastPoint.pos = {
            x: this.pos.x - this.vel.x,
            y: this.pos.y - this.vel.y
        }
        const solid = new SolidLine();
        solid.a = lastPoint;
        solid.b = this;
        solid.step(lines);
        if (!solid.sects.length){
            return;
        }
        const norm = solid.sects[0].obj.normal
        const speed = this.vel;
        const dot = norm.x*speed.x + norm.y*speed.y;
        const reflected = {
            x: speed.x - (norm.x * 2 * dot) * 0.999995,
            y: speed.y - (norm.y * 2 * dot) * 0.999995,
        }
        this.pos.x = solid.sects[0].pos.x + reflected.x;
        this.pos.y = solid.sects[0].pos.y + reflected.y;
        this.vel = reflected;
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.pos.x-3, this.pos.y-3, 6, 6);
    }
}