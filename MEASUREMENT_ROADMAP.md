# AuraCalc measurement roadmap

## Present capabilities

- Local image or camera frame capture, user-marked same-plane calibration, length and area estimates, and dimension-compatible calculator handoffs.
- Optional browser location speedometer. It reports only a finite non-negative speed actually supplied by the device; missing speed is displayed as unavailable. It does not infer speed from location changes or upload location.
- A browser capability check for camera, location, and immersive AR. Session support does not establish that a depth sensor is available or that a measurement is accurate.
- An optional local-only OpenAI vision endpoint provides photo identification and measurement guidance after an explicit user action. It needs an API key on the server. It does not automatically measure the pictured object.
- An experimental WebXR mode uses surface hit testing and two user-selected points to estimate a 3D distance. It requires an immersive AR session with hit testing and DOM overlay; no physical-device validation has been performed.

## Work required for automatic measurement

1. Extend photo guidance with a validated vision model that identifies candidate boundaries and prompt targets. Establish a public-service privacy and cost model, consent, retention, upload limits, and model/version provenance. A recognized class or bounding box alone supplies no physical scale.
2. Add calibrated metric geometry. Obtain known reference dimensions, camera calibration, multiple calibrated views, or supported depth data. Ask the user for missing scale or viewpoints. Explicitly state which object, face, and dimension were measured and refuse metric output when the evidence is insufficient.
3. Extend the hit-test AR mode with feature-specific depth negotiation and no-depth fallback where supported. Check depth data for each frame; immersive AR support by itself is not a depth-sensing guarantee. See the [WebXR depth sensing specification](https://immersive-web.github.io/depth-sensing/).
4. Track moving objects over timestamped frames. Calculate real-world speed only when scene scale, object tracking, camera motion, and the relevant plane or depth are sufficiently known. Report uncertainty and tracking loss; do not substitute device GPS speed for object speed.
5. Connect validated measurement outputs to the existing unit and dimension-aware calculator handoff. Let the user select the target input and inspect the measurement assumptions.
6. Evaluate against surveyed measurements and timed motion on representative phones, browsers, lighting, distance, object material, perspective, and occlusion. Set and publish measured error bounds by supported scenario. No camera system can guarantee 100% accuracy for every photo, device, or environment.

Sources: [W3C WebXR Device API](https://www.w3.org/TR/webxr/), [WebXR depth sensing](https://immersive-web.github.io/depth-sensing/), and [MDN Geolocation speed](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/speed).
