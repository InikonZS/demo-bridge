import { IVector } from "../core/IVector";
import { solveCutted } from "../core/linear";
import { Grid } from "./grid";
import { drawSling } from "./drawSling";
import { PhysJoint } from "../core/physJoint";
import { PhysPoint } from "../core/physPoint";
import { SolidLine } from "../core/solidLine";
import { CanvasEditMode } from "./canvasEditMode";
import { CanvasSimulateMode } from "./canvasSimulateMode";

export class CanvasView{
    isEditMode: boolean = true;
    //tool: string = 'joint';

    points: (IVector & {st?: boolean})[] = [];
    ropes: {a:IVector, b:IVector}[] =[];
    joints: {a:IVector, b:IVector}[] = [];

    physPoints: PhysPoint[] = [];
    physJoints: PhysJoint[] = [];
    solidLines: SolidLine[] = [];
    grid: Grid;
    editMode: CanvasEditMode;
    simulateMode: CanvasSimulateMode;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement){
        const ctx = canvas.getContext("2d");
        this.ctx = ctx;
        canvas.width = 800;
        canvas.height = 600;
        //canvas.style.width = canvas.width / window.devicePixelRatio +'px';
        //canvas.style.height = canvas.height / window.devicePixelRatio +'px';
        const clickScale =  canvas.width/ canvas.getBoundingClientRect().width;
        this.grid = new Grid();
        this.editMode = new CanvasEditMode(ctx);
        this.editMode.clickScale = clickScale;
        this.editMode.initMode();

        this.simulateMode = new CanvasSimulateMode(ctx);
        this.simulateMode.clickScale = clickScale;

        this.levelPreset();

        this.editMode.joints = this.joints;
        this.editMode.points = this.points;
        this.editMode.ropes = this.ropes;

        canvas.onmousedown = (e)=>{
        }

        canvas.onmousemove = (e)=>{
        }
    
        canvas.onmouseup = (e)=>{
        }

        const calcStep = ()=>{
            if (!this.isEditMode){
                this.simulateMode.calcStep();
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
                this.grid.render(ctx);
                this.solidLines.forEach(it=>it.render(ctx));
                this.editMode.render();
            } else {
                this.simulateMode.render();
            }
        }

        const render = ()=>{
            clear();
            for (let i=0; i<40; i++){
                calcStep();
                
            }draw();
            requestAnimationFrame(()=>{
                render();
            });
        }
    
        render();
    }

    levelPreset(){
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
    }
    
    simulate(){

        this.joints =this.editMode.joints;
        this.points = this.editMode.points;
        this.ropes = this.editMode.ropes;

        this.editMode.resetMode();
        this.simulateMode.initMode();
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

        this.ropes.forEach(rope=>{
            const ropeLen = Math.hypot(rope.a.x - rope.b.x, rope.a.y - rope.b.y);
            const ropePoints = [];
            const sclen = 20;
            for (let i = 0; i< (ropeLen / sclen); i++){
                if (i==0){
                    //ropePoints.push(rope.a);
                } else {
                    ropePoints.push({
                        x: rope.a.x - (rope.a.x - rope.b.x) / ropeLen * i * sclen,
                        y: rope.a.y - (rope.a.y - rope.b.y) / ropeLen * i * sclen,
                    });
                }
            }
            //ropePoints.push(rope.b);
            let lastPoint: PhysPoint = this.physPoints.find(it=> it.pos.x == rope.a.x &&  it.pos.y == rope.a.y);
            ropePoints.forEach((it, i)=>{
                const point = new PhysPoint();
                point.pos = {...it}
                point.mass = 0.01;
                this.physPoints.push(point);
                const joint = new PhysJoint();
                joint.a = point;
                joint.b = lastPoint;
                joint.targetLength =  Math.hypot(point.pos.x - lastPoint.pos.x, point.pos.y - lastPoint.pos.y);
                joint.strength = 0.01;
                this.physJoints.push(joint);
                lastPoint = point;
            });
            let endPoint: PhysPoint = this.physPoints.find(it=> it.pos.x == rope.b.x &&  it.pos.y == rope.b.y);
            const joint = new PhysJoint();
            joint.a = endPoint;
            joint.b = lastPoint;
            joint.targetLength =  Math.hypot(endPoint.pos.x - lastPoint.pos.x, endPoint.pos.y - lastPoint.pos.y);
            joint.strength = 0.01;
            this.physJoints.push(joint);
        })

        this.simulateMode.physJoints = this.physJoints;
        this.simulateMode.physPoints = this.physPoints;
        this.simulateMode.solidLines = this.solidLines;
    }

    setTool(tool: string){
        //this.tool = tool;
        this.editMode.tool = tool;
    }

    toEditMode(){
        this.isEditMode = true;
        this.simulateMode.resetMode();
        this.editMode.initMode();
    }

    resize(){
        const canvas = this.ctx.canvas;
        const clickScale =  canvas.width/ canvas.getBoundingClientRect().width;
        this.editMode.clickScale = clickScale;
        this.simulateMode.clickScale = clickScale;
    }
}
