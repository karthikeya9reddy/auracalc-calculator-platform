# Fieldwork product prototype

This is a responsive, dependency-free interaction prototype for the shared calculator platform. It demonstrates the requested product experiences without selecting or implementing an individual field calculator.

## Included interactions

- Local task-to-workflow suggestions with an explicit AI-service-not-connected label.
- A three-step guided workspace with back, continue, reset, and review actions.
- An illustrative scenario slider and accessible chart description.
- Browser camera preview, demo scene, user-marked reference length, planar pixel scaling, and a measurement handoff. This prototype does not provide AR depth, perspective correction, AI object detection, or production-grade measurement accuracy.
- Learner, professional, and everyday guidance profiles.
- A traceability panel showing the review gate instead of inventing formula sources.
- Clickable captioned walkthrough steps and a full text transcript.
- A downloadable prototype summary.
- Device-local calculation history for saved scenario examples and completed camera-measurement demos, with restore, delete, clear-all, and pause controls.
- Privacy messaging; history values remain in browser storage on this device, and camera frames are never saved.

## Open it

Open `index.html` in a browser. Most interactions work directly from the file. Camera access may require a secure context; if it is unavailable, select **Try demo scene**. Camera permission is requested only after pressing **Open camera**.

## Important implementation boundary

This proves the interaction shape, not the production intelligence or measurement system. The “AI” response is a local keyword-based mock; no AI model is connected. Live AR depth requires platform APIs and supported devices. The camera measurement uses a user-marked scale and a same-plane assumption with no perspective correction; treat it as a UI demonstration only. The scenario values are illustrative. No reviewed calculation definitions are included. History entries are local demo snapshots, not verified calculator outputs; restoring camera values does not restore an image or old camera calibration for a new view.

For production, build and evaluate these as separable services: reviewed calculation/workflow registry, AI retrieval and input-mapping service, device AR measurement adapter, validated formula modules, consent/privacy controls, and accessible content/video publishing workflow.
