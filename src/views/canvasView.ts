import { IVector } from "../core/IVector";
import { solveCutted } from "../core/linear";

function rotate(v: IVector, ang: number){
    return {x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: v.y * Math.cos(ang) - v.x * Math.sin(ang)}
}

const getNormal = (v1: IVector, v2: IVector)=>{
    const len = Math.hypot(v1.x - v2.x, v1.y - v2.y)
    const v = {
        x: (v1.x - v2.x) / len,
        y: (v1.y - v2.y) / len
    };
    return rotate(v, Math.PI / 2);
}


class SolidLine{
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

class PhysPoint{
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
        ctx.strokeStyle = '#f90';
        ctx.beginPath();
        ctx.moveTo(this.a.pos.x, this.a.pos.y);
        ctx.lineTo(this.b.pos.x, this.b.pos.y);
        ctx.stroke();
    }
}
export class CanvasView{
    isEditMode: boolean = true;
    tool: string = 'joint';

    points: (IVector & {st?: boolean})[] = [];
    joints: {a:IVector, b:IVector}[] = [];

    physPoints: PhysPoint[] = [];
    physJoints: PhysJoint[] = [];
    solidLines: SolidLine[] = [];

    constructor(canvas: HTMLCanvasElement){
        /*const solid = new SolidLine();
        solid.b = new PhysPoint();
        solid.b.pos = {x: 0, y: 500}
        solid.a = new PhysPoint();
        solid.a.pos = {x: 800, y: 300}
        this.solidLines.push(solid);

        const solid2 = new SolidLine();
        solid2.b = new PhysPoint();
        solid2.b.pos = {x: 0, y: 50}
        solid2.a = new PhysPoint();
        solid2.a.pos = {x: 30, y: 500}
        this.solidLines.push(solid2);*/
        const stp = [{x: 20, y:180}, {x: 210, y:200}, {x: 270, y:200}, {x:590, y:200}, {x:520, y:200} , {x:400, y:20}, {x: 780, y:140}];
        stp.forEach(it=>{
            this.points.push({...it, st: true});
        })
        const mapPoints = [{x: 0, y:200}, {x:200, y:200}, {x:200, y: 400}, {x:600, y:400}, {x:600, y: 200}, {x:800, y: 150}/*, {x:602, y: 198} , {x:607, y: 195},  {x:800, y: 195}*/];
        mapPoints.forEach((it, i)=>{
            if (i==0){
                return;
            }
            const solid = new SolidLine();
            solid.b = new PhysPoint();
            solid.b.pos = it;
            solid.a = new PhysPoint();
            solid.a.pos = mapPoints[i-1];
            this.solidLines.push(solid);
        })
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
            if (this.tool == 'joint'){
                if (hoveredPoint){
                    downPoint = hoveredPoint
                } else {
                    downPoint = {
                        x: e.offsetX,
                        y: e.offsetY
                    }
                }
                movePoint = {...downPoint}
            } else if (this.tool == 'remove'){
                this.points = this.points.filter(it=>it!=hoveredPoint);
                this.joints = this.joints.filter(it=> it.a != hoveredPoint && it.b != hoveredPoint);
            }
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

            if (!this.isEditMode){
                this.physPoints.forEach(it=>{
                    if (!it.nograv){
                        const dist = Math.hypot(it.pos.x - e.offsetX, it.pos.y - e.offsetY);
                        it.vel.x+=Math.sign(it.pos.x - e.offsetX)*Math.min(10/(dist*dist), 0.1);
                        it.vel.y+=Math.sign(it.pos.y - e.offsetY)*Math.min(10/(dist*dist), 0.1);
                    }
                });
            }
        }
    
        canvas.onmouseup = (e)=>{
            if (this.tool == 'joint'){
                if (downPoint.x == movePoint.x && downPoint.y == movePoint.y){
                    downPoint = null;
                    movePoint = null;
                    return;
                }
                if (!this.points.includes(downPoint)){
                    this.points.push(downPoint);
                }
                if (!this.points.includes(movePoint)){
                    this.points.push(movePoint);
                }
                this.joints.push({a: downPoint, b: movePoint});
                downPoint = null;
                movePoint = null;
            } else {
                hoveredPoint = null;
            }
        }

        const calcStep = ()=>{
            if (!this.isEditMode){
                this.physPoints.forEach(it=>{
                    if (!it.nograv){
                        it.vel.y+=0.0001;
                    }
                });
                this.physJoints.forEach(it=>it.step(this.solidLines));
                this.physPoints.forEach(it=>it.step(this.solidLines));
                this.solidLines.forEach(it=>it.step([]));
            } else {
                this.solidLines.forEach(it=>it.step([]));
            }
        }

        const clear = ()=>{
            ctx.fillStyle = '#00000020';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        }
    
        const draw = ()=>{
            if (this.isEditMode){
                this.solidLines.forEach(it=>it.render(ctx));
                this.joints.forEach((joint)=>{
                    if (!(joint.a && joint.b)){
                        return;
                    }
                    ctx.strokeStyle = '#9f0';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(joint.a.x, joint.a.y);
                    ctx.lineTo(joint.b.x, joint.b.y);
                    ctx.stroke();
                });
                this.points.forEach((point)=>{
                    ctx.fillStyle = point.st ? '#ff0': '#f0f';
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
                this.physPoints.forEach(it=>it.render(ctx));
                this.solidLines.forEach(it=>it.render(ctx));
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
            if (p.st){
                point.nograv = true;
                point.mass = 9999999;
            }
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

    setTool(tool: string){
        this.tool = tool;
    }

    toEditMode(){
        this.isEditMode = true;
    }
}