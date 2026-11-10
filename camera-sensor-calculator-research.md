# Camera and sensor based calculator research

**Research snapshot:** 10 November 2026  
**Purpose:** Explore live camera, video, device sensors, and science data as input modes for the calculator platform. This document defines opportunities and technical boundaries; it does not approve a specific calculator, promise universal accuracy, or authorize use for driving, diagnosis, safety control, or professional measurement.

## The product concept

The camera should be a **measurement and navigation interface** that feeds the reviewed calculation engine. It should not be treated as an all-knowing calculator or as proof of physical scale. The platform can help a person point at a scene, select or track an object, observe movement, and see a calculation update live—but the result depends on what the camera and sensors actually know.

Use this pipeline:

```text
Camera / video / GNSS / IMU / depth / time / location / reference data
                          ↓
          Calibration, target selection, quality checks
                          ↓
    Measured values + uncertainty + capture provenance
                          ↓
        Reviewed calculator definitions and workflows
                          ↓
   Live visualization + explanation + result/report
```

The sensor layer outputs a typed, qualified **measurement**, not an unqualified “answer.” Every downstream calculator inherits its uncertainty, source version, and risk class.

## What can be calculated from live video

### Motion of an object

Video analysis can track an object’s image coordinates across frames. A physics education tool, Tracker, explicitly supports calibrated scales and coordinate systems and computes position, velocity, and acceleration overlays from tracked video. [Tracker Video Analysis](https://opensourcephysics.github.io/tracker-website/index.html). OpenCV’s optical-flow documentation describes motion as a **2D image displacement field** between frames; it depends on assumptions about image appearance and neighboring motion, and large motion can require special handling. [OpenCV Optical Flow](https://docs.opencv.org/4.x/d4/dee/tutorial_optical_flow.html).

That supports a useful product path:

1. User selects or confirms a target and the coordinate origin.
2. User places a known-length calibration marker in the target’s plane, or chooses a supported calibrated depth/AR method.
3. The platform reads real frame timestamps/rate, detects tracking loss, and maps pixel motion into calibrated coordinates.
4. It graphs position over time; it derives velocity and acceleration with a documented numerical method and uncertainty range.
5. The user can pause, correct missed tracks, choose a time interval, compare a model, and export the data and assumptions.

### The critical scale boundary

Pixels alone do not give metres or metres per second. A camera can show that an object moved across the image, but physical speed needs a real-world scale and a correctly timed sequence. Camera calibration must account for device-specific focal parameters and lens distortion; OpenCV’s calibration tutorial describes those camera intrinsics and the use of known real-world points to establish scale. [OpenCV Camera Calibration](https://docs.opencv.org/4.x/dc/dbb/tutorial_py_calibration.html).

AR depth can help on supported devices, but it is an estimate with quality limits. Google’s ARCore Depth API produces depth from device movement and optional depth sensors; Google reports strongest performance at roughly 0.5–5 metres and warns that low-texture surfaces can be imprecise. [ARCore Depth API](https://developers.google.com/ar/develop/depth). Apple’s ARKit scene-depth path requires LiDAR-capable hardware and can provide depth-confidence maps. [Apple ARKit scene depth](https://developer.apple.com/documentation/arkit/arframe/scenedepth?changes=_7_2).

### Vehicle speed

There are two distinct tasks:

- **Device/vehicle speed estimate:** use GNSS speed if the device reports it, show its reported accuracy/availability, and label it as an estimate. The web geolocation interface defines speed in metres per second and allows the value to be unavailable; location accuracy is separately exposed with a stated confidence meaning. [Geolocation speed](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/speed), [Geolocation accuracy](https://developer.mozilla.org/en-US/docs/Web/API/GeolocationCoordinates/accuracy).
- **Camera-estimated speed of a visible object:** requires a scale source, calibrated scene geometry and frame timing. If the phone/camera itself is moving, camera motion, depth, target motion, mounting orientation, and perspective must be disentangled. Optical flow alone is not a speedometer.

We should **not** build or market an interactive camera speedometer for someone who is driving. Any vehicle experiment must be set up while parked and run without driver interaction, or be operated by a passenger in a lawful, safe context. NHTSA describes phone interaction as a serious distraction and advises drivers to put the phone away. [NHTSA Distracted Driving](https://www.nhtsa.gov/risky-driving/distracted-driving). Do not use a phone-derived estimate for legal enforcement, collision reconstruction, vehicle control, or safety decisions.

### Acceleration and physics experiments

Acceleration can be estimated by tracking position over time and differentiating the trajectory, but differentiation amplifies measurement noise. A trustworthy educational view should show the tracked points, curve fit/smoothing choice, sampling interval, uncertainty band, and whether the result came from camera tracking or an accelerometer. An accelerometer measures specific force in a device coordinate frame; using it for world acceleration requires orientation/gravity treatment and sensor calibration. The platform should present this as a lab/learning workflow, not an instrument replacement.

Candidate physics and maths experiences:

- position-time, velocity-time, acceleration-time and projectile-motion graphs;
- pendulum period and oscillation measurements;
- wheel rotation, angular speed, rolling distance, and frame-by-frame timing;
- angle, slope, dimensions, area, circle/triangle fitting, and geometry from a visible reference;
- graph digitization from an image, with user-confirmed axes and units;
- compare measured motion with a selected equation/model, showing residuals and assumptions.

For every one, the live overlay should be paired with a data table and accessible text equivalent. Do not infer hidden physical scale from arbitrary footage.

## Astronomy and cosmology: point, identify, calculate, explain

This is a strong **cross-field branch** connecting physics, astronomy, geospatial orientation, image processing, and education. A camera-facing sky map can align an overlay using time, location, device orientation, camera field of view, and a versioned catalog/ephemeris. A photo of a star field can alternatively be **plate-solved** to estimate its celestial coordinates and field of view, then matched to catalogued objects. Astrometry.net documents an asynchronous image-upload and result workflow for this type of astronomical calibration. [Astrometry.net API documentation](https://astrometry.net/doc/net/api.html).

The interpretation needs to be accurate:

- The IAU recognizes 88 constellations and defines each as a bounded area of sky in celestial coordinates; the familiar connecting lines are figures/asterisms and can vary by tradition. [IAU Constellations](https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx).
- NASA explains that a sky map depends on the observer’s location and date/time; a mobile sky guide helps users identify visible objects from where they are. [NASA Skywatching FAQ](https://science.nasa.gov/skywatching/faq/).
- ESA’s Gaia archive includes star positions, parallaxes, proper motions, radial velocities, brightness information, and other source data. [Gaia ESA Archive](https://gea.esac.esa.int/archive/). These need coordinate epoch, data-release, and proper-motion handling where appropriate.
- The overlay should distinguish **catalogued stars**, **planets/solar-system objects**, **satellites/transients where data is available**, **constellation boundaries**, and **cultural asterism artwork**. “This star is in this constellation” means a coordinate falls within its defined sky boundary; it does not mean the stars are near each other in three-dimensional space.

Candidate astronomy calculators and workflows to research:

- live identify: star/planet/object candidate from camera pointing, time and location;
- photo solve: star-field coordinate/field-of-view calibration and object annotation;
- visibility planner: rise/set, altitude/azimuth, twilight and moonlight windows;
- telescope setup: magnification, true field of view, exit pupil, image scale, sampling and exposure candidates;
- orbital calculations: period, orbital elements, escape/transfer speed and basic two-body estimates;
- astronomical scales: angular size, parallax/distance, light travel time, apparent/absolute magnitude, redshift conversions;
- cosmology models: expansion/age/distance calculations parameterized by a named cosmological model and parameters, with the parameter source/version and assumptions shown;
- visual explainers: compare apparent sky position to a 3D distance scale or show how scale and perspective change a star pattern.

Do not call every point of light a star. Identification confidence should be lower or show alternatives when the sky is cloudy, light-polluted, the phone compass is disturbed, the view is moving, the field of view is unknown, or the object is not in the selected catalog. The application should ask the user to calibrate/align when necessary, permit manual time/location correction, and explain that the sky overlay is a guide rather than an observatory-grade instrument.

## Chemistry and camera-based measurement

Camera-assisted chemistry can support **controlled colorimetry** when the chemical method itself creates a calibrated color response. Research describes smartphone digital-image colorimetry for quantitative assays, but sample concentration is inferred using calibration standards and image/color correction; phone cameras do not measure a full optical spectrum. [Color-correction study](https://doi.org/10.1007/s00216-025-06021-9), [smartphone colorimetry review](https://www.sciencedirect.com/science/article/pii/S0263224120313221).

Potential flows include a named assay with reagent/protocol selection, known calibration standards, a fixed light enclosure or reference card, camera exposure/white-balance controls, calibration curve, blank/control, and replicate readings. Show the sampled image region, calibration points, fit, residuals, detection range, and uncertainty. Validate each assay/device/protocol combination with qualified lab owners before publication.

Camera color alone should **not** claim to identify an unknown chemical, verify purity, determine concentration without a method-specific calibration, or assess dangerous substances. A color change can be affected by lighting, camera response, exposure, sample path length, turbidity, temperature, reagent age, and mixtures. The interface must not tell users to smell, touch, or mix unknown samples.

## Mathematics and image understanding

Camera input can make math more interactive without letting OCR become the answer engine:

- capture a printed equation or handwritten expression, show the parsed expression, and ask the user to confirm it before solving;
- identify a graph’s axes/scale and let the user correct points and units before computing slope, intercept, area, or a fit;
- outline a geometric figure and ask for known sides/angles or a physical scale before returning real dimensions;
- use AR overlays to explain vectors, rotations, geometric constructions, and coordinate frames;
- convert a real experiment’s measured points into a maths/physics model with uncertainty.

Uncertain handwriting or image parsing must be shown as a candidate transcription, with easy correction; it must never silently alter a numeric expression.

## Cross-field camera/sensor opportunities

| Field/task | Inputs beyond the shared formula engine | Dynamic output | Key limitation |
|---|---|---|---|
| Photo/AR measuring | camera, calibration marker, depth, device pose | length, area, volume, fit/quantity handoff | pixel scale, perspective, depth, sensor quality |
| Physics lab motion | video timestamps, tracked points, calibration stick, optional IMU | position/velocity/acceleration graph | camera frame, frame rate, scale, noise, occlusion |
| Sports biomechanics | calibrated video, body landmarks, ground plane | stride, cadence, jump/flight time, joint-angle estimates | camera angle, occlusion, population/model validation; not medical diagnosis |
| Vehicle/machine observation | static camera or safely captured video, known scene geometry | object speed, cycle time, rotation, throughput | moving camera/ego-motion, calibration, legal and safety boundaries |
| Astronomy and cosmology | location, UTC/time, device attitude, camera FOV, catalog/ephemeris, optional plate solve | live sky labels, coordinate/visibility outputs, selected science calculations | compass/orientation uncertainty, light/weather, dataset/model and epoch |
| Chemistry/lab | camera, controlled light/reference, assay calibration samples | color channel/absorbance proxy and calibrated concentration estimate | camera ≠ spectrometer; method- and device-specific validation |
| Agriculture/environment | photo plus map/location, calibrated sampling, weather/soil datasets | area/plant count/condition or sensor-linked environmental estimate | sampling bias, image classification uncertainty, local conditions |
| Construction/trades | camera, plane/depth, known dimension or AR scan | dimensions, area/quantity, then cost or material workflow | code and installation decisions need physical verification |
| VFX/CGI | camera/video, tracked markers/pose, timecode/frame rate | match-motion tracks, retiming, camera path, physical scale estimate | project frame-rate convention, lens distortion, artistic abstraction |

## Sensor and evidence record

Any camera/sensor-produced input must carry at least:

- measurement ID, capture timestamp, frame/timebase, device/camera model when available, and capture mode;
- source type (manual point, tracked pixel, GNSS, inertial sensor, depth camera, plate solve, downloaded catalog/data);
- calibration object/method and its measurement/source; camera intrinsics/lens/zoom metadata if available;
- target identity and user-confirmation state; coordinate frame and axis convention;
- raw units and normalized units; uncertainty interval or documented confidence metric; tracking/depth/sensor quality state;
- algorithm and model version, dataset/catalog release and epoch, plus processing steps;
- image retention/upload choice and privacy status; default behavior should keep capture processing local when practical and never upload without a clear user action/consent;
- downstream calculator/workflow IDs and whether quality/risk gates allow that handoff.

Camera access should be requested only after the user starts a feature that needs it, on a secure context with clear permission rationale. Browser camera access involves privacy/permission handling and requires a secure context. [MDN `getUserMedia`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia).

## Product and architecture implications

1. Add a **Sensor & Vision Input Layer** beside the shared calculation engine. It produces calibrated observations; it does not own engineering/clinical/business equations.
2. Introduce measurement types for pixel point, ray, angle, depth, pose, coordinate, timestamped track, GNSS speed, inertial sample, RGB/color sample, and celestial coordinate.
3. Attach uncertainty and quality flags to values. A downstream definition declares its minimum acceptable input quality; failures block calculation rather than silently producing a confident-looking number.
4. Make camera work progressive: start with user-uploaded or recorded video and manual scale confirmation; then live browser camera tracking; then native AR/depth and specialized science integrations only where platform support and monthly maintenance are viable.
5. Keep calculation logic identical whether a value came from manual entry, camera tracking, or a sensor. Show the source path and allow correction.
6. Provide accessible alternatives: keyboard-entry mode, visible tracked points, numeric data table, textual graph summary, pause/step controls, reduced motion, and downloadable CSV where appropriate.
7. Treat science catalogs, ephemerides, sensor APIs, device support lists, and calibration models as versioned dependencies with status, review dates, and fallback behavior.
8. Do not let a camera feature inherit a low risk class merely because it is “just a measurement.” It inherits the highest risk of the downstream workflow and may need to block that use.

## Recommendation and research gaps

Add **camera and sensor calculations** as a cross-cutting capability and add **astronomy, astrophysics, and cosmology** as an explicit research branch under physics (it can later become its own top-level navigation field if search and practitioner research support that). The first research candidates are education-safe video motion analysis, live star/planet/constellation guidance, calibrated photo dimensions, and controlled colorimetry. This is a feature opportunity, not a launch shortlist.

Before selecting any feature, investigate browser/native support by device, measurement error under real lighting/motion conditions, privacy and storage, accessibility, catalog/API licenses and update burden, competitor experience, user demand by region, and qualified reviewers. For speed/acceleration specifically, validate against an independent instrument and multiple known scenes; for astronomy, validate overlays against known observation times and sky positions; for chemistry, use laboratory standards and a qualified assay owner.
