import React, { useEffect, useRef, useState } from "react";
import { IVector } from "./core/IVector";
import "./style.css";
import { CanvasView } from "./views/canvasView";

export const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>();
    const [canvasView, setCanvasView] = useState<CanvasView>();
    const [tool, setTool] = useState('joint');

    useEffect(()=>{
        if (canvasRef.current){
            const _canvasView = new CanvasView(canvasRef.current);
            setCanvasView(_canvasView);
        }
    }, [canvasRef.current]);

    const simulate = ()=>{
        if (canvasView.isEditMode){
        canvasView.simulate();
        } else {
            canvasView.toEditMode();
        }
    }

    useEffect(()=>{
        if (!canvasView) {
            return;
        }
        canvasView.setTool(tool);
    }, [tool, canvasView]);

    return (
        <div>
            <canvas ref={canvasRef}></canvas>
            <button onClick={simulate}>run</button>
            <div>
                <button onClick={()=>setTool('joint')}>add joint</button>
                <button onClick={()=>setTool('rope')}>add rope</button>
                <button onClick={()=>setTool('remove')}>remove</button>
            </div>
        </div>
    )
}