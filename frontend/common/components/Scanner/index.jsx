import React, { useCallback } from 'react';
import jsQR from 'jsqr';

export const Scanner = ({ onData }) => {
    const ref = useCallback(async (node) => {
        if (!node) {
            return;
        }
        const video = document.createElement("video");
        const canvas = node.getContext("2d");
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        const tick = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                node.height = video.videoHeight / video.videoWidth * node.width;
                canvas.drawImage(video, 0, 0, node.width, node.height);
                const { data, width, height } = canvas.getImageData(0, 0, node.width, node.height);
                const code = jsQR(data, width, height, {
                    inversionAttempts: "dontInvert",
                });
                if (code) {
                    const { location: { topRightCorner, bottomRightCorner, bottomLeftCorner, topLeftCorner }, binaryData } = code;
                    canvas.beginPath();
                    canvas.moveTo(topLeftCorner.x, topLeftCorner.y);
                    [topRightCorner, bottomRightCorner, bottomLeftCorner, topLeftCorner].forEach(({ x, y }) => canvas.lineTo(x, y));
                    canvas.lineWidth = 4;
                    canvas.strokeStyle = "#FF3B58";
                    canvas.stroke();
                    if (onData(new Uint8Array(binaryData))) {
                        stream.getTracks().forEach(track => track.stop());
                        return;
                    }
                }
            }
            requestAnimationFrame(tick);
        };
        video.srcObject = stream;
        video.play();
        requestAnimationFrame(tick);
    }, []);
    return <canvas ref={ref} height={0} style={{ display: 'block', width: '100%' }} />;
};