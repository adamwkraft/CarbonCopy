import * as bodyPix from '@tensorflow-models/body-pix';
import { useRef, useState, useEffect, useCallback } from "react";

import { useWebcam } from "../context/webcam";

export const useBodyPixController = () => {
  const webcam = useWebcam();

  const loadRef = useRef();
  const [net, setNet] = useState(null);

  // load the model on the first mount
  useEffect(() => {
    if (!loadRef.current && webcam.ready) {
      loadRef.current = true;
      bodyPix.load({
        architecture: 'ResNet50', //'MobileNetV1',
        outputStride: 16,
        multiplier: 1,
        quantBytes: 4,
      })
        .then((loadedNet) => {
          console.log('BodyPix loaded');
          setNet(loadedNet);
        })
        .catch(console.error);
    }
  }, [webcam]);

  // TODO: Make it possible to tweak bodyPix settings
  const predict = useCallback(async () => {
    if (!net) {
      throw new Error('Please wait for the model to load before calling "predict"');
    }

    const segmentation = await net.segmentPerson(webcam.videoRef.current, {internalResolution: 'medium'});

    // console.log({segmentation});
    
    return segmentation;
  }, [net, webcam]);

  return net ? predict : null;
};
