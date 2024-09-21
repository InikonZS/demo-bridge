import { IVector } from "../core/IVector";

class PhysPoint{
    pos: IVector;
    vel: IVector;
    acc: IVector;
    mass: number;

    constructor(){
        this.pos = {x: 0, y:0};
        this.vel = {x: 0, y:0};
        this.acc = {x: 0, y:0};
        this.mass = 1;
    }

    step(){
        this.pos.x = this.pos.x + this.vel.x;
        this.pos.y = this.pos.y + this.vel.y;
        if (this.pos.y> 590){
            this.pos.y = 590;
            this.vel.y = -this.vel.y * 0.99995;
        }
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.fillStyle = '#f00';
        ctx.fillRect(this.pos.x-3, this.pos.y-3, 6, 6);
    }
}

class PhysJoint{
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
        this.friction = 0.9999;
    }

    step(){
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
    }

    render(ctx: CanvasRenderingContext2D){
        ctx.strokeStyle = '#f90';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();
    }
}
export class CanvasView{
    isEditMode: boolean = true;

    points: IVector[] = [];
    joints: {a:IVector, b:IVector}[] = [];

    physPoints: PhysPoint[] = [];
    physJoints: PhysJoint[] = [];

    constructor(canvas: HTMLCanvasElement){
        //const points:IVector[] = [];
        //const joints: {a:IVector, b:IVector}[] = [];
        let hoveredPoint: IVector = null;

        //const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        let downPoint: IVector = null;
        let movePoint: IVector = null;
        canvas.width = 800;
        canvas.height = 600;
        canvas.onmousedown = (e)=>{
            if (hoveredPoint){
                downPoint = hoveredPoint
            } else {
                downPoint = {
                    x: e.offsetX,
                    y: e.offsetY
                }
            }
            movePoint = {...downPoint}
        }

        canvas.onmousemove = (e)=>{
            hoveredPoint = null;
            this.points.forEach(it=>{
                if (Math.hypot(it.x - e.offsetX, it.y - e.offsetY)<10){
                    hoveredPoint = it;
                }
            });
            if (hoveredPoint){
                movePoint = hoveredPoint
            } else {
                movePoint = {
                    x: e.offsetX,
                    y: e.offsetY
                }
            }
        }
    
        canvas.onmouseup = (e)=>{
            if (!this.points.includes(downPoint)){
                this.points.push(downPoint);
            }
            if (!this.points.includes(movePoint)){
                this.points.push(movePoint);
            }
            this.joints.push({a: downPoint, b: movePoint});
            downPoint = null;
            movePoint = null;
        }

        const calcStep = ()=>{
            if (!this.isEditMode){
                this.physPoints.forEach(it=>{
                    it.vel.y+=0.0001;
                });
                this.physJoints.forEach(it=>it.step());
                this.physPoints.forEach(it=>it.step());
            }
        }

        const clear = ()=>{
            ctx.fillStyle = '#00000020';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        }
    
        const draw = ()=>{
            if (this.isEditMode){
                this.joints.forEach((joint)=>{
                    ctx.strokeStyle = '#9f0';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(joint.a.x, joint.a.y);
                    ctx.lineTo(joint.b.x, joint.b.y);
                    ctx.stroke();
                });
                this.points.forEach((point)=>{
                    ctx.fillStyle = '#f0f';
                    ctx.fillRect(point.x-3, point.y-3, 6, 6);
                })
                if (hoveredPoint){
                    ctx.fillStyle = '#f06';
                    ctx.fillRect(hoveredPoint.x-5, hoveredPoint.y-5, 10, 10);
                }
                if (downPoint && movePoint){
                    ctx.strokeStyle = '#9f0';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(downPoint.x, downPoint.y);
                    ctx.lineTo(movePoint.x, movePoint.y);
                    ctx.stroke();
                }
            } else {
                this.physJoints.forEach(it=>it.render(ctx));
                this.physPoints.forEach(it=>it.render(ctx));
            }
        }

        const render = ()=>{
            clear();
            for (let i=0; i<40; i++){
                calcStep();
                draw();
            }
            requestAnimationFrame(()=>{
                render();
            });
        }
    
        render();
    }
    
    simulate(){
        this.isEditMode = false;
        this.physPoints = this.points.map(p=>{
            const point = new PhysPoint();
            point.pos = {...p}
            return point;
        });

        this.physJoints = this.joints.map((p)=>{
            const joint = new PhysJoint();
            joint.a = this.physPoints[this.points.indexOf(p.a)];
            joint.b = this.physPoints[this.points.indexOf(p.b)];
            joint.targetLength =  Math.hypot(p.a.x - p.b.x, p.a.y - p.b.y);
            joint.strength = 10;
            return joint;
        });
    }

    toEditMode(){
        this.isEditMode = true;
    }
}