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
    tool: string = 'joint';

    points: (IVector & {st?: boolean})[] = [];
    ropes: {a:IVector, b:IVector}[] =[];
    joints: {a:IVector, b:IVector}[] = [];

    physPoints: PhysPoint[] = [];
    physJoints: PhysJoint[] = [];
    solidLines: SolidLine[] = [];
    grid: Grid;
    editMode: CanvasEditMode;
    simulateMode: CanvasSimulateMode;

    constructor(canvas: HTMLCanvasElement){
        const ctx = canvas.getContext("2d");
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.width = canvas.width / window.devicePixelRatio +'px';
        canvas.style.height = canvas.height / window.devicePixelRatio +'px';
        const clickScale =  canvas.width/ canvas.getBoundingClientRect().width ;
        this.grid = new Grid();
        this.editMode = new CanvasEditMode(ctx);
        this.editMode.clickScale = clickScale;
        this.editMode.initMode();

        this.simulateMode = new CanvasSimulateMode(ctx);
        this.simulateMode.clickScale = clickScale;
        //this.editMode.initMode();
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

        this.levelPreset();

        this.editMode.joints = this.joints;
        this.editMode.points = this.points;
        this.editMode.ropes = this.ropes;

        //const points:IVector[] = [];
        //const joints: {a:IVector, b:IVector}[] = [];
        let hoveredPoint: IVector = null;

        //const canvas = canvasRef.current;
        let downPoint: IVector = null;
        let movePoint: IVector = null;
        const roundGrid = (x: number)=>{
            return Math.round(x / 10) *10;
        }
        canvas.onmousedown = (e)=>{
            /*const mpos = {x: e.offsetX * clickScale, y: e.offsetY * clickScale};
            if (this.tool == 'joint' || this.tool == 'rope'){
                if (hoveredPoint){
                    downPoint = hoveredPoint
                } else {
                    downPoint = {
                        x: roundGrid(mpos.x),
                        y: roundGrid(mpos.y)
                    }
                }
                movePoint = {...downPoint}
            } else if (this.tool == 'remove'){
                this.points = this.points.filter(it=>it!=hoveredPoint);
                this.joints = this.joints.filter(it=> it.a != hoveredPoint && it.b != hoveredPoint);
            }*/
        }

        canvas.onmousemove = (e)=>{
            hoveredPoint = null;
            const mpos = {x: e.offsetX * clickScale, y: e.offsetY * clickScale};
            /*this.points.forEach(it=>{
                if (Math.hypot(it.x - mpos.x, it.y - mpos.y)<10){
                    hoveredPoint = it;
                }
            });
            if (hoveredPoint){
                movePoint = hoveredPoint
            } else {
                movePoint = {
                    x: roundGrid(mpos.x),
                    y: roundGrid(mpos.y)
                }
            }*/

            if (!this.isEditMode){
                this.physPoints.forEach(it=>{
                    if (!it.nograv){
                        const dist = Math.hypot(it.pos.x - mpos.x, it.pos.y - mpos.y);
                        it.vel.x+=Math.sign(it.pos.x - mpos.x)*Math.min(10/(dist*dist), 0.1);
                        it.vel.y+=Math.sign(it.pos.y - mpos.y)*Math.min(10/(dist*dist), 0.1);
                    }
                });
            }
        }
    
        canvas.onmouseup = (e)=>{
            /*if (this.tool == 'joint' || this.tool == 'rope'){
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
                if (this.tool == 'rope'){
                    this.ropes.push({a: downPoint, b: movePoint});
                } else {
                    this.joints.push({a: downPoint, b: movePoint});
                }
                downPoint = null;
                movePoint = null;
            } else {
                hoveredPoint = null;
            }*/
        }

        const calcStep = ()=>{
            if (!this.isEditMode){
                /*this.physPoints.forEach(it=>{
                    if (!it.nograv){
                        it.vel.y+=0.0001;
                    }
                });
                this.physJoints.forEach(it=>it.step(this.solidLines));
                this.physPoints.forEach(it=>it.step(this.solidLines));
                this.solidLines.forEach(it=>it.step([]));*/
                this.simulateMode.calcStep();
            } else {
                this.solidLines.forEach(it=>it.step([]));
            }
        }

        const clear = ()=>{
            ctx.fillStyle = '#00000020';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
        }
        
        let tpa = -40;
        const draw = ()=>{
            if (this.isEditMode){
                this.grid.render(ctx);
                tpa+=0.0003;
                //drawSling(ctx, {x:330, y:310}, {x:300 *Math.sin(tpa), y:190* Math.cos(tpa)}, 200, 10);
                /*const spoint = {x:100, y:110}
                const tpoint = {x:200 + tpa, y:110}
                const mpoint = {x: (spoint.x + tpoint.x) / 2, y: (spoint.y + tpoint.y) / 2}
                const jdist = Math.hypot(spoint.x - tpoint.x, spoint.y - tpoint.y);
                let dk = (jdist - 100) / 10;
                let df = 0;
                if (dk>20*0.7){
                    df = Math.max((20*0.7 - dk)*20, -jdist / 3);
                    dk = 20*0.7
                }

                tpa+=0.03;
                ctx.strokeStyle = '#f00';
                ctx.fillStyle = '#400';
                ctx.beginPath();
                ctx.moveTo(100,100);
                ctx.bezierCurveTo(mpoint.x +df, 100+ dk, mpoint.x-df, 100 + dk, tpoint.x, 100);
                ctx.bezierCurveTo(tpoint.x + 20 * 0.7, 100 +5, tpoint.x + 20* 0.7, 120 - 5, tpoint.x, 120);
                //ctx.moveTo(100,120);
                ctx.bezierCurveTo(mpoint.x-df, 120 -dk, mpoint.x + df, 120 -dk,100, 120);
                ctx.bezierCurveTo(100 - 20 * 0.7, 120 -5, 100 - 20* 0.7, 100 + 5, 100, 100);
                ctx.fill();
                ctx.stroke();
                */
                this.solidLines.forEach(it=>it.render(ctx));
                this.editMode.render();
                /*this.joints.forEach((joint)=>{
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
                }*/
            } else {
                this.simulateMode.render();
                /*this.physJoints.forEach(it=>it.render(ctx));

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
                this.solidLines.forEach(it=>it.render(ctx));*/
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
        this.tool = tool;
    }

    toEditMode(){
        this.isEditMode = true;
        this.simulateMode.resetMode();
        this.editMode.initMode();
    }
}
