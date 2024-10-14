import { IVector } from "../core/IVector";

export class CanvasEditMode {
    ctx: CanvasRenderingContext2D;
    tool: string = 'joint';
    points: (IVector & { st?: boolean, mass?: number})[] = [];
    ropes: { a: IVector, b: IVector }[] = [];
    joints: { a: IVector, b: IVector }[] = [];

    onAction: (name: string, data: any)=>void;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    hoveredPoint: IVector = null;
    downPoint: IVector = null;
    movePoint: IVector = null;
    clickScale = 1;

    roundGrid = (x: number) => {
        return Math.round(x / 10) * 10;
    }

    handleDown = (e: MouseEvent) => {
        const mpos = { x: e.offsetX * this.clickScale, y: e.offsetY * this.clickScale };
        if (this.tool == 'joint' || this.tool == 'rope') {
            if (this.hoveredPoint) {
                this.downPoint = this.hoveredPoint
            } else {
                this.downPoint = {
                    x: this.roundGrid(mpos.x),
                    y: this.roundGrid(mpos.y)
                }
            }
            this.movePoint = { ...this.downPoint }
        } else if (this.tool == 'remove') {
            this.points = this.points.filter(it => it != this.hoveredPoint);
            this.joints = this.joints.filter(it => it.a != this.hoveredPoint && it.b != this.hoveredPoint);
            this.ropes = this.ropes.filter(it => it.a != this.hoveredPoint && it.b != this.hoveredPoint);
        } else if (this.tool == 'select') {
            this.onAction?.('select', this.hoveredPoint);
        }
    }

    handleMove = (e: MouseEvent) => {
        this.hoveredPoint = null;
        const mpos = { x: e.offsetX * this.clickScale, y: e.offsetY * this.clickScale };
        this.points.forEach(it => {
            if (Math.hypot(it.x - mpos.x, it.y - mpos.y) < 10) {
                this.hoveredPoint = it;
            }
        });
        if (this.hoveredPoint) {
            this.movePoint = this.hoveredPoint
        } else {
            this.movePoint = {
                x: this.roundGrid(mpos.x),
                y: this.roundGrid(mpos.y)
            }
        }
    }

    handleUp = () => {
        if (this.tool == 'joint' || this.tool == 'rope') {
            if (this.downPoint.x == this.movePoint.x && this.downPoint.y == this.movePoint.y) {
                this.downPoint = null;
                this.movePoint = null;
                return;
            }
            if (!this.points.includes(this.downPoint)) {
                this.points.push(this.downPoint);
            }
            if (!this.points.includes(this.movePoint)) {
                this.points.push(this.movePoint);
            }
            if (this.tool == 'rope') {
                this.ropes.push({ a: this.downPoint, b: this.movePoint });
            } else {
                this.joints.push({ a: this.downPoint, b: this.movePoint });
            }
            this.downPoint = null;
            this.movePoint = null;
        } else {
            this.hoveredPoint = null;
        }
    }

    initMode() {
        const canvas = this.ctx.canvas;
        console.log('init edit mode');

        canvas.addEventListener('mousedown', this.handleDown);
        canvas.addEventListener('mousemove', this.handleMove);
        canvas.addEventListener('mouseup', this.handleUp);
    }

    resetMode() {
        const canvas = this.ctx.canvas;
        console.log('reset edit mode');

        canvas.removeEventListener('mousedown', this.handleDown);
        canvas.removeEventListener('mousemove', this.handleMove);
        canvas.removeEventListener('mouseup', this.handleUp);
    }

    render() {
        //this.grid.render(ctx);
        //tpa+=0.0003;

        //this.solidLines.forEach(it=>it.render(ctx));
        const ctx = this.ctx;
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
        this.ropes.forEach((joint)=>{
            if (!(joint.a && joint.b)){
                return;
            }
            ctx.strokeStyle = '#f90';
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
        if (this.hoveredPoint){
            ctx.fillStyle = '#f06';
            ctx.fillRect(this.hoveredPoint.x-5, this.hoveredPoint.y-5, 10, 10);
        }
        if (this.downPoint && this.movePoint){
            ctx.strokeStyle = '#9f0';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(this.downPoint.x, this.downPoint.y);
            ctx.lineTo(this.movePoint.x, this.movePoint.y);
            ctx.stroke();
        }
    }
}
