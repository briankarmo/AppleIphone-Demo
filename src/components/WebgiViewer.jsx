import React, {
    useRef,
    useState,
    useCallback,
    forwardRef,
    useImperativeHandle,
    useEffect
} from "react";
import {
    ViewerApp,
    AssetManagerPlugin,
    GBufferPlugin,
    ProgressivePlugin,
    TonemapPlugin,
    SSRPlugin,
    SSAOPlugin,
    BloomPlugin,
    GammaCorrectionPlugin,
    mobileAndTabletCheck,
} from "webgi";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollAnimation } from "../lib/scroll-animation";

gsap.registerPlugin(ScrollTrigger);

const WebgiViewer = forwardRef((props, ref) => {
    const canvasRef = useRef(null);
    const [viewerRef, setViewerRef] = useState(null);
    const [targetRef, setTargetRef] = useState(null);
    const [cameraRef, setCameraRef] = useState(null);
    const [positionRef, setPositionRef] = useState(null);
    const canvasContainerRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    // Store initial camera position and target
    const initialPosition = useRef({ x: 0, y: 0, z: 0 });
    const initialTarget = useRef({ x: 0, y: 0, z: 0 });

    useImperativeHandle(ref, () => ({
        triggerPreview() {
            if (!canvasContainerRef.current || !props.contentRef.current) return;
            
            canvasContainerRef.current.style.pointerEvents = "all";
            props.contentRef.current.style.opacity = "0";
            setIsPreviewMode(true);
            
            if (positionRef && targetRef && viewerRef && cameraRef) {
                gsap.to(positionRef, {
                    x: 13.04,
                    y: -2.01,
                    z: 2.29,
                    duration: 2,
                    onUpdate: () => {
                        viewerRef.setDirty();
                        cameraRef.positionTargetUpdated(true);
                    },
                });
                gsap.to(targetRef, { x: 0.11, y: 0.0, z: 0.0, duration: 2 });
                viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
            }
        }
    }));

    const handleExitPreview = () => {
        if (!canvasContainerRef.current || !props.contentRef.current) return;
        
        canvasContainerRef.current.style.pointerEvents = "none";
        props.contentRef.current.style.opacity = "1";
        setIsPreviewMode(false);
        
        if (positionRef && targetRef && viewerRef && cameraRef) {
            // Animate back to the initial camera position and target (default movement)
            gsap.to(positionRef, {
                x: initialPosition.current.x,
                y: initialPosition.current.y,
                z: initialPosition.current.z,
                duration: 2,
                onUpdate: () => {
                    viewerRef.setDirty();
                    cameraRef.positionTargetUpdated(true);
                },
            });
            gsap.to(targetRef, { 
                x: initialTarget.current.x, 
                y: initialTarget.current.y, 
                z: initialTarget.current.z, 
                duration: 2,
                onComplete: () => {
                    viewerRef.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
                }
            });
        }
    };

    const memoizedScrollAnimation = useCallback(
        (position, target, onUpdate) => {
            if (position && target && onUpdate) {
                scrollAnimation(position, target, onUpdate);
            }
        }, []
    );

    const setupViewer = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            if (!canvasRef.current) {
                throw new Error("Canvas reference not found");
            }

            const viewer = new ViewerApp({
                canvas: canvasRef.current,
            });

            setViewerRef(viewer);

            const manager = await viewer.addPlugin(AssetManagerPlugin);

            const camera = viewer.scene.activeCamera;
            const position = camera.position;
            const target = camera.target;

            setCameraRef(camera);
            setPositionRef(position);
            setTargetRef(target);

            // Store the initial camera position and target
            initialPosition.current = { x: position.x, y: position.y, z: position.z };
            initialTarget.current = { x: target.x, y: target.y, z: target.z };

            // Add plugins
            await viewer.addPlugin(GBufferPlugin);
            await viewer.addPlugin(new ProgressivePlugin(32));
            await viewer.addPlugin(new TonemapPlugin(true));
            await viewer.addPlugin(GammaCorrectionPlugin);
            await viewer.addPlugin(BloomPlugin);
            await viewer.addPlugin(SSRPlugin);
            await viewer.addPlugin(SSAOPlugin);

            viewer.renderer.refreshPipeline();

            // Load the 3D model
            try {
                await manager.addFromPath("scene-black.glb");
            } catch (modelError) {
                console.error("Error loading 3D model:", modelError);
                setError("Failed to load 3D model");
                return;
            }

            viewer.getPlugin(TonemapPlugin).config.clipBackground = true;
            viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

            window.scrollTo(0, 0);

            let needsUpdate = true;

            const onUpdate = () => {
                needsUpdate = true;
                viewer.setDirty();
            };

            viewer.addEventListener("preFrame", () => {
                if (needsUpdate) {
                    camera.positionTargetUpdated(true);
                    needsUpdate = false;
                }
            });

            memoizedScrollAnimation(position, target, onUpdate);
            setIsLoading(false);
        } catch (err) {
            console.error("Error setting up viewer:", err);
            setError("Failed to initialize 3D viewer");
            setIsLoading(false);
        }
    }, [memoizedScrollAnimation]);

    useEffect(() => {
        setupViewer();
        return () => {
            if (viewerRef) {
                viewerRef.dispose();
            }
        };
    }, [setupViewer]);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div ref={canvasContainerRef} id="webgi-canvas-container">
            <canvas id="webgi-canvas" ref={canvasRef} />
            {isLoading && <div className="loading-indicator">Loading 3D Viewer...</div>}
            {isPreviewMode && (
                <button 
                    className="exit-preview-button"
                    onClick={handleExitPreview}
                >
                    Exit Preview
                </button>
            )}
        </div>
    );
});

export default WebgiViewer;
