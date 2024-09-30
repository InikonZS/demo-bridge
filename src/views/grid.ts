export class Grid{
    render(ctx: CanvasRenderingContext2D){
        const step = 10;
        const width = ctx.canvas.width / step;
        const height = ctx.canvas.height / step;
        ctx.strokeStyle = "#222";
        for (let i = 0; i< width; i++){
            ctx.strokeStyle = i % 5 ? "#222": "#333";
            ctx.beginPath();
            ctx.moveTo(i* step, 0);
            ctx.lineTo(i* step, ctx.canvas.height);
            ctx.stroke();
        }
        for (let j = 0; j< height; j++){
            ctx.strokeStyle = j % 5 ? "#222": "#333";
            ctx.beginPath();
            ctx.moveTo(0, j* step);
            ctx.lineTo(ctx.canvas.width, j* step);
            ctx.stroke();
        }
    }
}