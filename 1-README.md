# MENAGERIE

A robot zoo that runs in your browser. Four real robots from the
[MuJoCo Menagerie](https://github.com/google-deepmind/mujoco_menagerie),
loaded from their actual MJCF models and animated live.

**[Open the zoo](https://jacobegarcia.github.io/menagerie/)**

| Nº | Robot | DOF | Interactions |
|----|-------|-----|--------------|
| 01 | Unitree Go2 | 12 (4 legs x 3) | live trot gait, gait-speed control |
| 02 | Franka Panda | 7 + gripper | per-joint pose sliders, presets, gripper |
| 03 | Allegro Hand | 16 (4 fingers x 4) | per-finger curl, pinch / point / fist presets |
| 04 | Unitree G1 | 29 | pose presets, waist control, wave |

## How it works

- The MJCF XML for each robot (`go2.xml`, `panda.xml`, `right_hand.xml`, `g1.xml`)
  is parsed offline: body tree, hinge/slide joints with real axes and ranges,
  visual geoms, materials.
- Meshes are converted to GLB (vertex colors baked from MJCF materials) and
  decimated where the CAD tolerates it - the Panda ships full-fidelity.
- In the browser, three.js loads each GLB and joints.json; joints are driven
  through their true ranges from the model files.

## Credits

Models from google-deepmind/mujoco_menagerie. Unitree Go2 and G1 (c) Unitree
Robotics, Franka Panda (c) Franka Emika, Allegro Hand (c) Wonik Robotics /
Simlab - see LICENSE-* files. Rendering: three.js (MIT).
