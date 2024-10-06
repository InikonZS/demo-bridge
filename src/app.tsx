import React, { useEffect, useRef, useState } from "react";
import { IVector } from "./core/IVector";
import "./style.css";
import { CanvasView } from "./views/canvasView";

export const App = () => {
    const canvasRef = useRef<HTMLCanvasElement>();
    const [canvasView, setCanvasView] = useState<CanvasView>();
    const [tool, setTool] = useState('joint');
    const [scale, setScale] = useState(1);

    useEffect(()=>{
        if (canvasRef.current && !canvasView){
            console.log(canvasRef.current, 'found canvas');
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

    useEffect(() => {
        const resize = () => {
          const width = window.innerWidth;
          const height = window.innerHeight;
          let w = 800;
          let h = 700;
          //always use MAX-, not MIN- its important for == state
          /*if (matchMedia('(max-aspect-ratio: 1/1)').matches){
            w = 780;
            h = 1130;
          }*/
          const aspect = h / w;
          const size = Math.min(height / aspect, width);
          setScale(size / w);
        }
        window.addEventListener('resize', resize);
        //window.onresize = resize;
        resize();
        return () => {
          window.removeEventListener('resize', resize);
        }
      }, []);
    
      useEffect(() => {
        document.body.style.setProperty('--base', scale.toString() + 'px');
        canvasView?.resize();
      }, [scale, canvasView]);

    return (
        <div className="main_screen">
            <div className="canvas_wrap">
                <canvas className="canvas" ref={canvasRef}></canvas>
            </div>
            <div className="control_panel">
                <div className="tools_panel">
                    <button className={`tool_button ${tool == 'joint' ? 'tool_button_active': ''}`} onClick={()=>setTool('joint')}>add joint</button>
                    <button className={`tool_button ${tool == 'rope' ? 'tool_button_active': ''}`} onClick={()=>setTool('rope')}>add rope</button>
                    <button className={`tool_button ${tool == 'remove' ? 'tool_button_active': ''}`} onClick={()=>setTool('remove')}>remove</button>
                </div>
                <div className="run_wrapper">
                    <button className="run_button" onClick={simulate}>run</button>
                </div>
            </div>
        </div>
    )
}