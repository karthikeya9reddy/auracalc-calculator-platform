# VFX, CGI, animation, and motion calculation research

**Research snapshot:** 10 November 2026  
**Purpose:** Establish why VFX/CGI users calculate, what families of motion-related calculations recur, and where a cross-field calculator platform might add value. This is discovery research, not selection or implementation of individual tools.

## Executive summary

VFX and CGI work uses numbers to coordinate **time, frames, motion, cameras, simulations, image sequences, and render resources**. A result is often passed into another step or another application, so frame-rate conventions, frame-range inclusivity, units, and software-specific semantics matter as much as the arithmetic.

The clearest opportunity is not another isolated “frames to seconds” form. Many small sites already offer frame/FPS conversion and basic shutter calculations. A more distinctive approach is a **shot and motion calculation workspace** that connects timing, retiming, motion/shutter, render-range, storage, and cost estimates; displays assumptions and rounding; and offers application-aware presets with versioned conventions. Artist intent must remain in control: motion is also an aesthetic choice, and a physical model is not automatically the desired animation.

Public documentation confirms that major tools treat timing, frame rate, simulation timestep, retiming, and shutter behavior as meaningful settings. For example, Maya represents time in ticks and warns that fractional frame rates may need approximation; Houdini distinguishes global frames from simulation frames/timesteps; Nuke documents retiming and shutter sampling; Blender documents shutter time in frames and simulation bake considerations. [Maya time](https://help.autodesk.com/cloudhelp/2022/ENU/Maya-Animation/files/GUID-A9F91D81-3149-47AF-9E37-83A89242D870.htm) · [Houdini animation options](https://www.sidefx.com/docs/houdini/ref/windows/global_anim_opts.html) · [Houdini simulation timestep](https://www.sidefx.com/docs/houdini/nodes/dop/fluidobject.html) · [Nuke retiming](https://learn.foundry.com/nuke/current/content/comp_environment/temporal_operations/simple_retiming.html) · [Blender motion blur](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/motion_blur.html)

## Why VFX/CGI users calculate

1. **To hit a delivery duration:** Convert shot duration, frame count, frame rate, timecode, handles, and edit ranges without off-by-one or fractional-rate errors.
2. **To preserve or intentionally change motion timing:** Retiming between frame rates or playback speeds, matching beats/audio, or translating frame windows into seconds.
3. **To plan visible motion:** Convert position changes into speed/acceleration, relate a path to timing, or explore easing and motion spacing.
4. **To match camera exposure:** Relate frame rate, shutter angle/time, exposure duration, and motion-blur interval; sometimes synchronize shutter behavior with pulsing light frequency.
5. **To manage simulation behavior:** Relate scene scale, time scale, frame rate, timestep/substeps, and physical units so a simulation behaves as intended.
6. **To budget production:** Estimate frame count, render time, storage, transfer, render-farm cost, and schedule across a sequence or multiple shots.
7. **To communicate across departments/software:** Transfer frame ranges, handles, speed changes, units, camera metadata, and conventions between editorial, animation, FX, lighting, and compositing.

## Calculation families to investigate

| Family | Typical input/output concepts | Why it matters | Evidence / caveat |
|---|---|---|---|
| Time, frames, and timecode | FPS, frame count/range, seconds, duration, start code, handles, inclusive/exclusive ranges | Timing errors propagate to editorial and render submissions. | Existing online tools show this is a known utility category; those examples do not establish market size. Fractional/drop-frame conventions must be handled explicitly. |
| Retiming and speed changes | Source/output FPS, playback multiplier, in/out frame ranges, preserved duration vs preserved frame positions | Users need to decide whether to preserve timing, frames, or motion feel. | Nuke describes retiming as dropping/duplicating frames or using higher-quality optical-flow methods; a simple calculation cannot predict all visual artifacts. [Foundry](https://learn.foundry.com/nuke/current/content/comp_environment/temporal_operations/simple_retiming.html) |
| Motion path and kinematics | Positions, distance, duration, velocity, acceleration, path length, arc/rotation timing | Helps convert blocking or a reference into timing/value estimates. | Needs a declared coordinate space and interpolation model; artistic curves and constraints can diverge from simple physical motion. |
| Keyframe/interpolation timing | Key times, value changes, ease curves, tangent/hold, sample cadence | Lets teams reason about timing, spacing, and in-betweens. | Blender’s keyframes interpolate property values between keys using selected interpolation. [Blender](https://docs.blender.org/manual/en/3.4/animation/keyframes/introduction.html) A curve visualizer/simulator may be more helpful than a scalar output. |
| Camera shutter and motion blur | FPS, shutter angle, shutter duration, open/close offset, samples | Aligns blur with action, camera footage, and renderer settings. | Blender, Maya, and Foundry expose related controls but not identical semantics. [Blender](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/motion_blur.html) · [Maya](https://help.autodesk.com/cloudhelp/2025/ENU/Maya-Basics/files/GUID-35B872B1-840E-4DEE-B80F-F2715B1E8BF0.htm) · [Foundry](https://learn.foundry.com/nuke/17.0/content/comp_environment/kronos_motionblur/adding_motion_blur.html) |
| Simulation scale and timestep | World scale, units, gravity, frame rate, timestep, substeps, time scale | Scene scale and integration step affect apparent speed, stability, and simulation behavior. | Houdini explicitly distinguishes simulation timestep/frame from global time. A calculator can expose relationships, but it cannot certify solver stability without solver-specific validated models. [SideFX](https://www.sidefx.com/docs/houdini/nodes/dop/fluidobject.html) |
| Projected motion / screen-space | World movement, camera distance/lens/FOV, image resolution, pixel displacement, frame interval | Helps estimate how movement reads in the image or match a plate. | Requires camera model, coordinate conventions, lens assumptions, and often tracking data; treat outputs as model estimates. |
| Motion capture / animation sampling | Capture rate, target rate, sample/interpolation method, clip duration, event frames | Transfers timing between capture and animation/game pipelines. | Sampling/resampling can alias or alter motion; disclose method and recommend checking the actual application. |
| Render workload planning | Resolution, frames, samples, render time/frame, machine count, utilization, deadline | Supports schedule and capacity choices. | Estimates vary with content, renderer, hardware, and settings; infer from measured test frames and show range/variance. |
| Image sequence storage and transfer | Width/height, channels, bit depth, compression, frames, layers, transfer bandwidth | Production teams budget disk, cache, and transfer windows. | Theoretical sizes can be exact under a declared encoding; real file sizes depend on format/content/compression. |
| Multi-shot planning | Shot list, rates, handles, work ranges, versions, render estimates | Helps create sequence-level duration, storage, and cost plans. | This is a workflow/report opportunity; project schedules require human overrides and should not imply guaranteed render completion. |

## Existing landscape and differentiation

Basic free tools already cover some frame/time conversions, animation FPS/duration, and shutter-angle/blur calculations. Examples include a frame calculator for frame/timecode conversion and a shutter-angle calculator. [Fuke’s Media frame calculator](https://www.fukesmedia.com/apps/frame-calc) · [Filmmaking Lifestyle shutter calculator](https://filmlifestyle.com/tools/shutter-angle-calculator/). Their presence establishes competition in the simple utility layer, but not exact traffic or saturation levels.

Potential differentiation areas:

- **End-to-end shot workflow:** start from edit duration/timecode, add handles, choose a retime, inspect resulting frame ranges, then estimate render and storage needs.
- **Convention-aware calculations:** distinguish integer from rational frame rates (e.g. 24000/1001), drop-frame from non-drop-frame timecode, frame labels from elapsed intervals, and inclusive/exclusive range counting. Never round a fractional rate silently.
- **DCC-aware semantic presets:** explain how the same concept is named/treated in Blender, Maya, Houdini, Nuke, or a chosen renderer. Label software/version and source; avoid claiming compatibility beyond reviewed documentation.
- **Visual motion response:** show a timing curve or position/velocity graph and play a lightweight preview for simple models. Let artists adjust easing and compare motion variants; keep the chosen curve editable/exportable.
- **Shot-level data handoff:** copy/export a concise JSON/CSV/clipboard summary with units, FPS as rational, timecode convention, frame range, shutter, assumptions, and provenance.
- **Render-range and resource estimator:** use measured test-frame time and variability, number of workers and utilization assumptions, output format/bit depth/layers, and transfer speed to report ranges rather than false precision.
- **Unit-scale and timestep explainer:** expose scene units, time scaling, solver timestep and substeps in plain language; flag combinations needing software-specific validation.
- **Artist intent vs physics:** provide a physics-based mode and an art-directed mode, clearly separated. The platform should never insist that visually desired motion be physically realistic.
- **Interoperability without lock-in:** neutral terminology first, then documented mappings and exports for common DCC tools; no requirement to upload scene/project files.
- **Privacy:** run ordinary calculations in-browser and do not collect unreleased shot details or client/project metadata by default.

## Multi-calculator workflow opportunities

These are workflow shapes for validation, not a commitment to build them:

1. **Shot timing handoff:** duration ↔ frames ↔ timecode → handles and edit range → retime conversion → downstream frame range.
2. **Motion design planning:** path distance/positions + timing → speed/acceleration graph → easing variants → optional camera/shutter interpretation.
3. **Plate-to-CGI match:** plate FPS/timecode + camera metadata + tracked movement → frame alignment → shutter/motion-blur interval → notes for compositing handoff.
4. **FX simulation setup review:** scene scale + desired real-world motion + FPS + timestep/substeps → unit/time-scale relationships → warnings and application-specific validation checklist.
5. **Sequence render plan:** shot frame ranges + handles + test-render timing + resolution/layers → total render-hour range → worker capacity/schedule → storage/transfer estimate.

Each stage should pass typed values forward, retain versions and assumptions, permit editing any prior step, and produce one traceable shot sheet. Keep every step usable by itself. Don't make the workflow longer just to increase session time.

## Safety, accuracy, and user-experience risks

- Frame-range off-by-one conventions can create missing/extra frames. Show both frame count and elapsed duration, and state endpoint convention.
- Fractional frame rates and drop-frame timecode are not interchangeable. Represent rates exactly where possible as rational values and test long-duration drift.
- “Shutter angle to shutter speed” assumes a defined camera/frame timing convention; show the formula and applicability.
- Motion/physics models need coordinate system, scale, interpolation, and initial conditions. Show these or decline to overstate the result.
- Simulation stability and visual quality cannot be guaranteed from a generic calculation. Output guidance, not certification.
- Render time and file size are estimates. Ask for measured benchmarks/settings and report uncertainty ranges.
- Changing a project frame rate can preserve frame positions or elapsed timing depending on software settings; the user must choose intent explicitly.
- Account for accessibility: use text descriptions with graphs, keyboard-editable curve controls, reduced-motion preference, and non-color cues.

## Research questions before prioritizing this field

1. Which roles have the most frequent handoff pain: animators, motion designers, editors, compositors, FX artists, technical directors, indie creators, or game developers?
2. Which workflows currently require spreadsheets, scripts, repeated manual conversion, or team messages?
3. Which terms do users search in different communities and languages (animation timing, FPS calculator, retime, frame range, shutter angle, render farm estimate)?
4. How much is already solved inside DCC applications, plugins, calculators, and production tracking tools? What gaps remain between them?
5. Which outputs do users want to paste into software, a render submission, a shot note, or a client/team report?
6. What is demand by audience: students/hobbyists, freelancers, studios, or game teams? Validate with search data and interviews; current search results alone do not quantify use.
7. Which features remain possible as a low-maintenance, monthly-maintained website, and which require rapidly changing vendor APIs or scene integrations?

## Evidence and sources

- Autodesk Maya, [How Maya counts time](https://help.autodesk.com/cloudhelp/2022/ENU/Maya-Animation/files/GUID-A9F91D81-3149-47AF-9E37-83A89242D870.htm)
- SideFX Houdini, [Global animation options](https://www.sidefx.com/docs/houdini/ref/windows/global_anim_opts.html) and [Fluid Object timestep variables](https://www.sidefx.com/docs/houdini/nodes/dop/fluidobject.html)
- Foundry Nuke, [Simple retiming](https://learn.foundry.com/nuke/current/content/comp_environment/temporal_operations/simple_retiming.html), [timecode metadata](https://modosdk.foundry.com/nuke/15.2/content/comp_environment/metadata/adding_timecode_metadata.html), and [motion blur controls](https://learn.foundry.com/nuke/17.0/content/comp_environment/kronos_motionblur/adding_motion_blur.html)
- Blender, [keyframe interpolation](https://docs.blender.org/manual/en/3.4/animation/keyframes/introduction.html) and [Cycles motion blur](https://docs.blender.org/manual/en/latest/render/cycles/render_settings/motion_blur.html)
- Autodesk Maya, [camera shutter angle and motion blur](https://help.autodesk.com/cloudhelp/2025/ENU/Maya-Basics/files/GUID-35B872B1-840E-4DEE-B80F-F2715B1E8BF0.htm)
- Existing utility examples: [Fuke’s Media frame calculator](https://www.fukesmedia.com/apps/frame-calc) and [Filmmaking Lifestyle shutter calculator](https://filmlifestyle.com/tools/shutter-angle-calculator/)

## Recommendation for the project

Add **VFX, CGI, animation, and motion design** as an explicit field group in the catalog. Keep it in research/prioritization until audience interviews, keyword and competitor review, and workflow walkthroughs establish the best unmet task. The most promising product direction to test is a connected, transparent shot-planning workflow, with timing/frame math as a foundation and motion/shutter/render planning as linked stages—not a generic solver or a claim to replace DCC software.
