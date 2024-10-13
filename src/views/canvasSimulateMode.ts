import { IVector } from "../core/IVector";
import { PhysJoint } from "../core/physJoint";
import { PhysPoint } from "../core/physPoint";
import { SolidLine } from "../core/solidLine";

export class CanvasSimulateMode {
    ctx: CanvasRenderingContext2D;
    
    physPoints: PhysPoint[] = [];
    physJoints: PhysJoint[] = [];
    solidLines: SolidLine[] = [];
    clickScale = 1;
    
    constructor(ctx: CanvasRenderingContext2D){
        this.ctx = ctx;
    }

    handleMove = (e: MouseEvent)=>{
        const mpos = {x: e.offsetX * this.clickScale, y: e.offsetY * this.clickScale};
        this.physPoints.forEach(it=>{
            if (!it.nograv){
                const dist = Math.hypot(it.pos.x - mpos.x, it.pos.y - mpos.y);
                it.vel.x+=Math.sign(it.pos.x - mpos.x)*Math.min(10/(dist*dist), 0.1);
                it.vel.y+=Math.sign(it.pos.y - mpos.y)*Math.min(10/(dist*dist), 0.1);
            }
        });
    }

    initMode(){
        const canvas = this.ctx.canvas;
        canvas.addEventListener('mousemove', this.handleMove);
    }

    resetMode(){
        const canvas = this.ctx.canvas;
        canvas.removeEventListener('mousemove', this.handleMove);
    }

    calcStep(){
        this.physPoints.forEach(it=>{
            if (!it.nograv){
                it.vel.y+=0.0001;
            }
        });
        this.physJoints.forEach(it=>it.step(this.solidLines));
        this.physPoints.forEach(it=>it.step(this.solidLines));
        this.solidLines.forEach(it=>it.step([]));
    }

    render(){
        this.physJoints.forEach(it=>it.render(this.ctx));

        const allowDestroy = true;
        const allowSplit = true;
        if (allowDestroy){
            const addPoints:PhysPoint[] = [];
            const addJoints:PhysJoint[] = [];
            this.physJoints = this.physJoints.filter(it=>{
                if (it.getCurrentLength() - it.targetLength > 25){
                    if (allowSplit && it.targetLength>30){
                        const p = new PhysPoint();
                        p.pos = {x: (it.a.pos.x + it.b.pos.x) /2 , y:(it.a.pos.y + it.b.pos.y) /2};
                        const p1 = new PhysPoint();
                        p1.pos = {...p.pos};
                        addPoints.push(p);
                        addPoints.push(p1);
                        const joint = new PhysJoint();
                        joint.a = it.a;
                        joint.b = p;
                        joint.targetLength =  it.targetLength /2;//Math.hypot(it.a.pos.x - p.pos.x, it.a.pos.y - p.pos.y) ;
                        joint.strength = 10;
                        const joint1 = new PhysJoint();
                        joint1.a = it.b;
                        joint1.b = p1;
                        joint1.targetLength =  it.targetLength /2;//Math.hypot(it.b.pos.x - p1.pos.x, it.b.pos.y - p1.pos.y);
                        joint1.strength = 10;
                        addJoints.push(joint);
                        addJoints.push(joint1);
                    }
                    return false;
                }
                
                return true;
            });
            if (allowSplit){
                addPoints.forEach(it=>this.physPoints.push(it));
                addJoints.forEach(it=>this.physJoints.push(it));
            }
        }
        this.physPoints.forEach(it=>it.render(this.ctx));
        this.solidLines.forEach(it=>it.render(this.ctx)); 
    }
}