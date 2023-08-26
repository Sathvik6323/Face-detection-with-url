import React, { useState, useRef } from "react";
import './FaceRecognition.css';

const FaceRecognition = ({ imageUrl, box }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const imageRef = useRef(null);

    const displayedWidth = 500;
    const displayedHeight = imageLoaded ? (imageRef.current.naturalHeight / imageRef.current.naturalWidth) * displayedWidth : 0;
    
    const scaledBox = {
        topRow: imageLoaded ? (box.topRow * displayedHeight) / imageRef.current.naturalHeight : 0,
        rightCol: imageLoaded ? (box.rightCol * displayedWidth) / imageRef.current.naturalWidth : 0,
        bottomRow: imageLoaded ? (box.bottomRow * displayedHeight) / imageRef.current.naturalHeight : 0,
        leftCol: imageLoaded ? (box.leftCol * displayedWidth) / imageRef.current.naturalWidth : 0
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img
                    ref={imageRef}
                    alt=''
                    src={imageUrl}
                    width={displayedWidth}
                    height={displayedHeight}
                    onLoad={handleImageLoad}
                />
                {imageLoaded && (
                    <div className='bounding-box' style={{
                        top: scaledBox.topRow,
                        right: scaledBox.rightCol,
                        bottom: scaledBox.bottomRow,
                        left: scaledBox.leftCol
                    }}></div>
                )}
            </div>
        </div>
    );
}

export default FaceRecognition;
