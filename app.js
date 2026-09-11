import * as THREE from 'three';
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';

/* ---------------- rig ---------------- */
class Rig {
  constructor(root, defs){
    this.map = {};
    for (const d of defs){
      const node = root.getObjectByName(d.body);
      if (!node){ console.warn('missing body', d.body); continue; }
      this.map[d.name] = { ...d, node,
        baseQ: node.quaternion.clone(), baseP: node.position.clone(),
        cur: 0, target: 0 };
    }
  }
  set(name, v){ const j = this.map[name]; if (j) j.target = v; }
  get(name){ return this.map[name]; }
  tick(dt){
    const k = 1 - Math.exp(-dt * 7);
    for (const name in this.map){
      const j = this.map[name];
      j.cur += (j.target - j.cur) * k;
      if (j.type === 'slide'){
        const a = new THREE.Vector3(...j.axis).normalize();
        j.node.position.copy(j.baseP).addScaledVector(a, j.cur);
      } else {
        const q = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(...j.axis).normalize(), j.cur);
        j.node.quaternion.copy(j.baseQ).multiply(q);
      }
    }
  }
}

const JOINTS = {"go2": [{"name": "FL_hip_joint", "body": "FL_hip", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.0472, 1.0472]}, {"name": "FL_thigh_joint", "body": "FL_thigh", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.5708, 3.4907]}, {"name": "FL_calf_joint", "body": "FL_calf", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.7227, -0.83776]}, {"name": "FR_hip_joint", "body": "FR_hip", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.0472, 1.0472]}, {"name": "FR_thigh_joint", "body": "FR_thigh", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.5708, 3.4907]}, {"name": "FR_calf_joint", "body": "FR_calf", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.7227, -0.83776]}, {"name": "RL_hip_joint", "body": "RL_hip", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.0472, 1.0472]}, {"name": "RL_thigh_joint", "body": "RL_thigh", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.5236, 4.5379]}, {"name": "RL_calf_joint", "body": "RL_calf", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.7227, -0.83776]}, {"name": "RR_hip_joint", "body": "RR_hip", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.0472, 1.0472]}, {"name": "RR_thigh_joint", "body": "RR_thigh", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.5236, 4.5379]}, {"name": "RR_calf_joint", "body": "RR_calf", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.7227, -0.83776]}], "panda": [{"name": "joint1", "body": "link1", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.8973, 2.8973]}, {"name": "joint2", "body": "link2", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-1.7628, 1.7628]}, {"name": "joint3", "body": "link3", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.8973, 2.8973]}, {"name": "joint4", "body": "link4", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-3.0718, -0.0698]}, {"name": "joint5", "body": "link5", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.8973, 2.8973]}, {"name": "joint6", "body": "link6", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-0.0175, 3.7525]}, {"name": "joint7", "body": "link7", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.8973, 2.8973]}, {"name": "finger_joint1", "body": "left_finger", "type": "slide", "axis": [0.0, 1.0, 0.0], "range": [0.0, 0.04]}, {"name": "finger_joint2", "body": "right_finger", "type": "slide", "axis": [0.0, 1.0, 0.0], "range": [0.0, 0.04]}], "allegro": [{"name": "ffj0", "body": "ff_base", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-0.47, 0.47]}, {"name": "ffj1", "body": "ff_proximal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.196, 1.61]}, {"name": "ffj2", "body": "ff_medial", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.174, 1.709]}, {"name": "ffj3", "body": "ff_distal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.227, 1.618]}, {"name": "mfj0", "body": "mf_base", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-0.47, 0.47]}, {"name": "mfj1", "body": "mf_proximal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.196, 1.61]}, {"name": "mfj2", "body": "mf_medial", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.174, 1.709]}, {"name": "mfj3", "body": "mf_distal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.227, 1.618]}, {"name": "rfj0", "body": "rf_base", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-0.47, 0.47]}, {"name": "rfj1", "body": "rf_proximal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.196, 1.61]}, {"name": "rfj2", "body": "rf_medial", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.174, 1.709]}, {"name": "rfj3", "body": "rf_distal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.227, 1.618]}, {"name": "thj0", "body": "th_base", "type": "hinge", "axis": [-1.0, 0.0, 0.0], "range": [0.263, 1.396]}, {"name": "thj1", "body": "th_proximal", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-0.105, 1.163]}, {"name": "thj2", "body": "th_medial", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.189, 1.644]}, {"name": "thj3", "body": "th_distal", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.162, 1.719]}], "g1": [{"name": "left_hip_pitch_joint", "body": "left_hip_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.5307, 2.8798]}, {"name": "left_hip_roll_joint", "body": "left_hip_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-0.5236, 2.9671]}, {"name": "left_hip_yaw_joint", "body": "left_hip_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.7576, 2.7576]}, {"name": "left_knee_joint", "body": "left_knee_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.087267, 2.8798]}, {"name": "left_ankle_pitch_joint", "body": "left_ankle_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.87267, 0.5236]}, {"name": "left_ankle_roll_joint", "body": "left_ankle_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-0.2618, 0.2618]}, {"name": "right_hip_pitch_joint", "body": "right_hip_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-2.5307, 2.8798]}, {"name": "right_hip_roll_joint", "body": "right_hip_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-2.9671, 0.5236]}, {"name": "right_hip_yaw_joint", "body": "right_hip_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.7576, 2.7576]}, {"name": "right_knee_joint", "body": "right_knee_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.087267, 2.8798]}, {"name": "right_ankle_pitch_joint", "body": "right_ankle_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.87267, 0.5236]}, {"name": "right_ankle_roll_joint", "body": "right_ankle_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-0.2618, 0.2618]}, {"name": "waist_yaw_joint", "body": "waist_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.618, 2.618]}, {"name": "waist_roll_joint", "body": "waist_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-0.52, 0.52]}, {"name": "waist_pitch_joint", "body": "torso_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-0.52, 0.52]}, {"name": "left_shoulder_pitch_joint", "body": "left_shoulder_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-3.0892, 2.6704]}, {"name": "left_shoulder_roll_joint", "body": "left_shoulder_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.5882, 2.2515]}, {"name": "left_shoulder_yaw_joint", "body": "left_shoulder_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.618, 2.618]}, {"name": "left_elbow_joint", "body": "left_elbow_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.0472, 2.0944]}, {"name": "left_wrist_roll_joint", "body": "left_wrist_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.97222, 1.97222]}, {"name": "left_wrist_pitch_joint", "body": "left_wrist_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.61443, 1.61443]}, {"name": "left_wrist_yaw_joint", "body": "left_wrist_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-1.61443, 1.61443]}, {"name": "right_shoulder_pitch_joint", "body": "right_shoulder_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-3.0892, 2.6704]}, {"name": "right_shoulder_roll_joint", "body": "right_shoulder_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-2.2515, 1.5882]}, {"name": "right_shoulder_yaw_joint", "body": "right_shoulder_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-2.618, 2.618]}, {"name": "right_elbow_joint", "body": "right_elbow_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.0472, 2.0944]}, {"name": "right_wrist_roll_joint", "body": "right_wrist_roll_link", "type": "hinge", "axis": [1.0, 0.0, 0.0], "range": [-1.97222, 1.97222]}, {"name": "right_wrist_pitch_joint", "body": "right_wrist_pitch_link", "type": "hinge", "axis": [0.0, 1.0, 0.0], "range": [-1.61443, 1.61443]}, {"name": "right_wrist_yaw_joint", "body": "right_wrist_yaw_link", "type": "hinge", "axis": [0.0, 0.0, 1.0], "range": [-1.61443, 1.61443]}]};

/* ---------------- robot configs ---------------- */
const ROBOTS = [
  { id:'go2', no:'01', name:'UNITREE GO2', kind:'QUADRUPED · 12 DOF',
    glb:'go2.glb', joints:'go2.joints.json', x:-3.05, scale:1.0, yaw:-Math.PI/2,
    cam:{pos:[-2.0,0.8,2.3], tgt:[-3.05,0.32,0]},
    spec:{MAKER:'Unitree Robotics', DOF:'12 (4 legs × 3)', HEIGHT:'0.40 m', MESHES:'16 visual OBJ meshes, decimated', SOURCE:'MJCF · unitree_go2/go2.xml'} },
  { id:'panda', no:'02', name:'FRANKA PANDA', kind:'ROBOT ARM · 7 + 2 DOF',
    glb:'panda.glb', joints:'panda.joints.json', x:-1.0, scale:1.0, yaw:0,
    cam:{pos:[-1.0,1.05,2.3], tgt:[-1.0,0.55,0]},
    spec:{MAKER:'Franka Emika', DOF:'7 arm + 2-finger gripper', REACH:'0.86 m', MESHES:'Visual OBJ set, decimated', SOURCE:'MJCF · franka_emika_panda/panda.xml'} },
  { id:'allegro', no:'03', name:'ALLEGRO HAND', kind:'DEXTEROUS HAND · 16 DOF',
    glb:'allegro.glb', joints:'allegro.joints.json', x:0.72, scale:2.6, yaw:-0.5, dy:0.42, euler:[-Math.PI/2,0,0],
    cam:{pos:[0.72,0.75,1.75], tgt:[0.72,0.5,0]},
    spec:{MAKER:'Wonik Robotics / Simlab', DOF:'16 (4 fingers × 4)', SPAN:'0.21 m', MESHES:'14 visual STL meshes', SOURCE:'MJCF · wonik_allegro/right_hand.xml'} },
  { id:'g1', no:'04', name:'UNITREE G1', kind:'HUMANOID · 29 DOF',
    glb:'g1.glb', joints:'g1.joints.json', x:2.75, scale:1.0, yaw:Math.PI/2 - 0.35,
    cam:{pos:[2.75,1.0,3.0], tgt:[2.75,0.75,0]},
    spec:{MAKER:'Unitree Robotics', DOF:'29 (legs 12 · waist 3 · arms 14)', HEIGHT:'1.32 m', MESHES:'Visual STL set, decimated', SOURCE:'MJCF · unitree_g1/g1.xml'} },
];

/* ---------------- scene ---------------- */
const stage = document.getElementById('stage');
const renderer = new THREE.WebGLRenderer({ antialias:true, logarithmicDepthBuffer:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.14;
stage.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x121214);
scene.fog = new THREE.Fog(0x121214, 7, 16);

const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, 0.05, 60);
const HOME_POS = new THREE.Vector3(-0.15, 1.7, 7.7);
const HOME_TGT = new THREE.Vector3(-0.15, 0.5, 0);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TGT);
controls.enableDamping = true; controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minDistance = 0.5; controls.maxDistance = 25;

/* lights */
scene.add(new THREE.HemisphereLight(0xf2e8d8, 0x1a1a1e, 0.8));
const fill = new THREE.DirectionalLight(0xf5ede0, 0.55);
fill.position.set(0, 2.5, 7); scene.add(fill);
const key = new THREE.DirectionalLight(0xfff2e0, 2.4);
key.position.set(2.5, 5.5, 3.5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -6; key.shadow.camera.right = 6;
key.shadow.camera.top = 6; key.shadow.camera.bottom = -3;
key.shadow.camera.far = 20; key.shadow.bias = -0.0004; key.shadow.radius = 6;
scene.add(key);
const rim = new THREE.DirectionalLight(0x9fb4d8, 0.9);
rim.position.set(-4, 3, -5); scene.add(rim);

/* floor + plinth line */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color:0x17171a, roughness:0.96, metalness:0 }));
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(60, 120, 0x232326, 0x1d1d20);
grid.position.y = 0.001; scene.add(grid);
const line = new THREE.Mesh(
  new THREE.BoxGeometry(7.6, 0.006, 0.012),
  new THREE.MeshBasicMaterial({ color:0xd8a24a }));
line.position.set(0, 0.004, 0.62); scene.add(line);
for (const r of ROBOTS){
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(r.id==='allegro'?0.34:0.55, r.id==='allegro'?0.34:0.55, 0.012, 48),
    new THREE.MeshStandardMaterial({ color:0x1c1c1f, roughness:0.9 }));
  disc.position.set(r.x, 0.006, 0); disc.receiveShadow = true; scene.add(disc);
}

/* ---------------- loading ---------------- */
const loader = new GLTFLoader();
const loadbar = document.getElementById('loadbar');
let loaded = 0;
const rigs = {}, roots = {};

async function loadRobot(r){
  const gltf = await loader.loadAsync(r.glb);
  const jdefs = JOINTS[r.id];
  const upfix = new THREE.Group();
  upfix.rotation.x = -Math.PI/2;               // MJCF Z-up -> three Y-up
  const disp = new THREE.Group();
  if (r.euler) disp.rotation.set(r.euler[0], r.euler[1], r.euler[2]);
  disp.add(gltf.scene);
  upfix.add(disp);
  const inner = upfix;
  const holder = new THREE.Group();
  holder.add(inner);
  holder.rotation.y = r.yaw;                   // yaw in world Y-up, after conversion
  holder.scale.setScalar(r.scale);
  holder.position.set(r.x, r.dy || 0, 0);
  inner.traverse(o => {
    if (o.isMesh){
      o.castShadow = true; o.receiveShadow = false;
      const ca = o.geometry.attributes.COLOR_0;
      if (ca){  // lift pure blacks to charcoal so dark panels read under warm light
        for (let i=0;i<ca.count;i++){
          ca.setXYZ(i, 0.07 + ca.getX(i)*0.93, 0.07 + ca.getY(i)*0.93, 0.075 + ca.getZ(i)*0.925);
        }
        ca.needsUpdate = true;
      }
      if (o.material){
        o.material.roughness = 0.7; o.material.metalness = 0.05;
        if (o.material.map) o.material.map = null;
        if (o.material.color && o.material.color.getHex() === 0xffffff &&
            !(o.geometry.attributes.COLOR_0)) o.material.color.setHex(0xd8d8da);
      }
    }
  });
  scene.add(holder);
  roots[r.id] = holder;
  rigs[r.id] = new Rig(inner, jdefs);
  loaded++; loadbar.style.width = (loaded / ROBOTS.length * 100) + '%';
}

/* ---------------- behaviours ---------------- */
const S = { t:0, go2playing:true, go2speed:1.4, g1wave:false, pandawave:false };

function go2Pose(t){
  const r = rigs.go2; if (!r) return;
  if (!S.go2playing){
    for (const L of ['FL','FR','RL','RR']){
      r.set(`${L}_thigh_joint`, 0.03*Math.sin(t*1.2));
      r.set(`${L}_calf_joint`, 0.04*Math.sin(t*1.2+1));
      r.set(`${L}_hip_joint`, 0);
    }
    const base = r.get('FL_hip_joint'); // breathe via base node
    return;
  }
  const f = S.go2speed, ph = 2*Math.PI*f*t;
  const legs = { FL:0, RR:0, FR:Math.PI, RL:Math.PI };
  for (const L in legs){
    const p = ph + legs[L];
    r.set(`${L}_thigh_joint`, 0.5*Math.sin(p));
    r.set(`${L}_calf_joint`, -0.55*Math.sin(p - Math.PI/2) - 0.12);
    r.set(`${L}_hip_joint`, L[1]==='L' ? 0.06 : -0.06);
  }
  const holder = roots.go2;
  if (holder) holder.position.y = 0.018*Math.abs(Math.sin(ph));
}

function allegroCurl(finger, c){
  const r = rigs.allegro; if (!r) return;
  if (finger === 'th'){
    r.set('thj0', 0.26 + c*0.9); r.set('thj1', c*0.9);
    r.set('thj2', c*1.2); r.set('thj3', c*1.1);
  } else {
    r.set(`${finger}j1`, c*1.45); r.set(`${finger}j2`, c*1.5); r.set(`${finger}j3`, c*1.35);
  }
}
const allegro = { thumb:0, ff:0, mf:0, rf:0 };
function applyAllegro(){
  allegroCurl('th', allegro.thumb); allegroCurl('ff', allegro.ff);
  allegroCurl('mf', allegro.mf); allegroCurl('rf', allegro.rf);
}

const PANDA_HOME = { joint1:0, joint2:-0.35, joint3:0, joint4:-1.9, joint5:0, joint6:1.9, joint7:0.78 };
function pandaSet(p){ for (const k in p) rigs.panda.set(k, p[k]); }
const G1_HOME = {};
function g1Set(p){ for (const k in p) rigs.g1.set(k, p[k]); }

/* per-frame animated behaviours */
function behaviours(t){
  go2Pose(t);
  if (rigs.allegro){
    const r = rigs.allegro, w = 0.05*Math.sin(t*1.4);
    r.set('ffj0', w); r.set('mfj0', 0); r.set('rfj0', -w);
  }
  if (S.pandawave && rigs.panda){
    rigs.panda.set('joint7', 0.7*Math.sin(t*5));
  }
  if (rigs.g1){
    const breathe = 0.03*Math.sin(t*1.1);
    rigs.g1.set('waist_pitch_joint', breathe);
    if (S.g1wave){
      g1Set({ right_shoulder_roll_joint:-1.9, right_shoulder_pitch_joint:0,
        right_elbow_joint: 1.1 + 0.55*Math.sin(t*6) });
    }
  }
}

/* ---------------- panel / nav ---------------- */
const panel = document.getElementById('panel');
const nav = document.getElementById('nav');
let focus = null;

function slider(label, min, max, step, val, oninput, fmt){
  const id = 's' + Math.random().toString(36).slice(2,8);
  const fmtv = fmt || (v => v.toFixed(2));
  setTimeout(() => {
    const el = document.getElementById(id);
    const out = document.getElementById(id+'o');
    el.addEventListener('input', () => { oninput(parseFloat(el.value)); out.textContent = fmtv(parseFloat(el.value)); });
  });
  return `<div class="ctl"><label>${label}<output id="${id}o">${fmtv(val)}</output></label>
    <input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${val}"></div>`;
}
function buttons(list){
  const h = list.map((b,i)=>`<button data-b="${i}">${b[0]}</button>`).join('');
  setTimeout(() => {
    panel.querySelectorAll('[data-b]').forEach(el =>
      el.addEventListener('click', () => {
        panel.querySelectorAll('[data-b]').forEach(x=>x.classList.remove('on'));
        el.classList.add('on');
        list[parseInt(el.dataset.b)][1]();
      }));
  });
  return `<div class="btns">${h}</div>`;
}

const PANELS = {
  go2: () => `
    <div class="placard-no">Nº 01 — QUADRUPED</div><h2>UNITREE GO2</h2>
    <div class="sub">TROT GAIT · LIVE</div>
    ${buttons([['▶ TROT', ()=>{S.go2playing=true;}],['STAND', ()=>{S.go2playing=false;}]])}
    ${slider('GAIT SPEED', 0.4, 2.6, 0.05, S.go2speed, v=>S.go2speed=v, v=>v.toFixed(2)+' Hz')}`,
  panda: () => `
    <div class="placard-no">Nº 02 — ROBOT ARM</div><h2>FRANKA PANDA</h2>
    <div class="sub">POSE THE ARM · REAL JOINT RANGES</div>
    ${[1,2,3,4,5,6,7].map(i=>{
      const j = rigs.panda.get('joint'+i);
      return slider('JOINT '+i, j.range[0], j.range[1], 0.01, j.target,
        v=>{S.pandawave=false; rigs.panda.set('joint'+i,v);});
    }).join('')}
    ${slider('GRIPPER', 0, 0.04, 0.001, 0, v=>{rigs.panda.set('finger_joint1',v);rigs.panda.set('finger_joint2',v);}, v=>(v*1000).toFixed(0)+' mm')}
    ${buttons([['HOME', ()=>{S.pandawave=false;pandaSet(PANDA_HOME);}],
               ['REACH', ()=>{S.pandawave=false;pandaSet({joint1:0.4,joint2:0.5,joint3:-0.3,joint4:-1.4,joint5:0.2,joint6:1.6,joint7:0.5});}],
               ['WAVE', ()=>{S.pandawave=false;pandaSet({joint1:0,joint2:-0.35,joint3:0,joint4:-2.1,joint5:0,joint6:2.1,joint7:0});S.pandawave=true;}]])}`,
  allegro: () => `
    <div class="placard-no">Nº 03 — DEXTEROUS HAND</div><h2>ALLEGRO HAND</h2>
    <div class="sub">CURL EACH FINGER · 16 DOF</div>
    ${slider('THUMB', 0, 1, 0.01, allegro.thumb, v=>{allegro.thumb=v;applyAllegro();})}
    ${slider('INDEX', 0, 1, 0.01, allegro.ff, v=>{allegro.ff=v;applyAllegro();})}
    ${slider('MIDDLE', 0, 1, 0.01, allegro.mf, v=>{allegro.mf=v;applyAllegro();})}
    ${slider('RING', 0, 1, 0.01, allegro.rf, v=>{allegro.rf=v;applyAllegro();})}
    ${buttons([['OPEN', ()=>{Object.assign(allegro,{thumb:0,ff:0,mf:0,rf:0});applyAllegro();}],
               ['PINCH', ()=>{Object.assign(allegro,{thumb:0.62,ff:0.5,mf:0.15,rf:0});applyAllegro();}],
               ['POINT', ()=>{Object.assign(allegro,{thumb:0.4,ff:0,mf:0.95,rf:0.95});applyAllegro();}],
               ['FIST', ()=>{Object.assign(allegro,{thumb:0.85,ff:0.95,mf:0.95,rf:0.95});applyAllegro();}]])}`,
  g1: () => `
    <div class="placard-no">Nº 04 — HUMANOID</div><h2>UNITREE G1</h2>
    <div class="sub">29 DOF · POSE PRESETS</div>
    ${slider('WAIST YAW', -1.2, 1.2, 0.01, 0, v=>rigs.g1.set('waist_yaw_joint', v))}
    ${buttons([['STAND', ()=>{S.g1wave=false;g1Set({left_hip_pitch_joint:0,right_hip_pitch_joint:0,left_knee_joint:0,right_knee_joint:0,left_ankle_pitch_joint:0,right_ankle_pitch_joint:0,left_shoulder_pitch_joint:0,right_shoulder_pitch_joint:0,left_shoulder_roll_joint:0,right_shoulder_roll_joint:0,right_elbow_joint:0,left_elbow_joint:0});}],
               ['SQUAT', ()=>{S.g1wave=false;g1Set({left_hip_pitch_joint:-0.85,right_hip_pitch_joint:-0.85,left_knee_joint:1.7,right_knee_joint:1.7,left_ankle_pitch_joint:-0.8,right_ankle_pitch_joint:-0.8});}],
               ['ARMS OUT', ()=>{S.g1wave=false;g1Set({left_shoulder_roll_joint:1.5,right_shoulder_roll_joint:-1.5,left_elbow_joint:0.25,right_elbow_joint:0.25});}],
               ['WAVE', ()=>{S.g1wave=true;}]])}`,
};

function specHTML(r){
  return `<div class="spec">` + Object.entries(r.spec)
    .map(([k,v]) => `${k} — <b>${v}</b>`).join('<br>') + `</div>`;
}

function renderPanel(){
  if (!focus){ panel.style.display='none'; return; }
  const r = ROBOTS.find(x=>x.id===focus);
  panel.style.display='block';
  panel.innerHTML = PANELS[r.id]() + specHTML(r);
  // rebind deferred handlers
  panel.querySelectorAll('input[type=range]').forEach(()=>{});
}

function renderNav(){
  nav.innerHTML = ROBOTS.map(r =>
    `<button data-r="${r.id}" class="${focus===r.id?'on':''}"><i>${r.no}</i>${r.name.split(' ').pop()}</button>`).join('');
  nav.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => setFocus(focus===b.dataset.r ? null : b.dataset.r)));
}

const camGoal = { pos: HOME_POS.clone(), tgt: HOME_TGT.clone() };
function setFocus(id){
  focus = id;
  if (id){
    const r = ROBOTS.find(x=>x.id===id);
    camGoal.pos.set(...r.cam.pos); camGoal.tgt.set(...r.cam.tgt);
  } else { camGoal.pos.copy(HOME_POS); camGoal.tgt.copy(HOME_TGT); }
  renderNav(); renderPanel();
}

/* click to focus */
const ray = new THREE.Raycaster();
let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => downAt = [e.clientX, e.clientY]);
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt) return;
  const dx = e.clientX-downAt[0], dy = e.clientY-downAt[1]; downAt = null;
  if (dx*dx+dy*dy > 25) return;
  const m = new THREE.Vector2(e.clientX/innerWidth*2-1, -(e.clientY/innerHeight)*2+1);
  ray.setFromCamera(m, camera);
  for (const r of ROBOTS){
    if (roots[r.id] && ray.intersectObject(roots[r.id], true).length){ setFocus(r.id); return; }
  }
  setFocus(null);
});
addEventListener('keydown', e => {
  const i = ROBOTS.findIndex(r=>r.id===focus);
  if (e.key==='ArrowRight') setFocus(ROBOT_IDS[(i+1)%4]);
  if (e.key==='ArrowLeft') setFocus(ROBOT_IDS[(i+3)%4]);
  if (e.key==='Escape') setFocus(null);
});
const ROBOT_IDS = ROBOTS.map(r=>r.id);

/* floating labels */
const labelsEl = document.getElementById('labels');
const labelEls = {};
for (const r of ROBOTS){
  const d = document.createElement('div');
  d.className = 'label';
  d.innerHTML = `<div class="n">${r.name}</div><div class="k">${r.kind}</div>`;
  labelsEl.appendChild(d); labelEls[r.id] = d;
}
function placeLabels(){
  for (const r of ROBOTS){
    const p = new THREE.Vector3(r.x, 0, 0.62);
    p.project(camera);
    const el = labelEls[r.id];
    if (p.z > 1){ el.style.opacity = 0; continue; }
    el.style.left = (p.x*0.5+0.5)*innerWidth + 'px';
    el.style.top = (-p.y*0.5+0.5)*innerHeight + 26 + 'px';
    el.style.opacity = (focus && focus!==r.id) ? 0.25 : 0.95;
  }
}

/* responsive home framing */
function fitHome(){
  const aspect = innerWidth/innerHeight;
  const d = Math.min(19, 4.6 / (Math.tan(THREE.MathUtils.degToRad(camera.fov/2)) * aspect));
  HOME_POS.set(-0.15, 1.7, Math.max(6.8, d));
  scene.fog.near = HOME_POS.z * 0.55;
  scene.fog.far = HOME_POS.z * 2.6;
  if (!focus){ camGoal.pos.copy(HOME_POS); camGoal.tgt.copy(HOME_TGT); }
}

/* resize */
addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  fitHome();
});

/* ---------------- run ---------------- */
const clock = new THREE.Clock();
let settled = 0;
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  S.t += dt;
  if (settled < 1){
    settled += dt*0.5;
    camera.position.lerp(camGoal.pos, settled);
    controls.target.lerp(camGoal.tgt, settled);
  }
  camera.position.lerp(camGoal.pos, 1 - Math.exp(-dt*2.2));
  controls.target.lerp(camGoal.tgt, 1 - Math.exp(-dt*2.2));
  behaviours(S.t);
  for (const id in rigs) rigs[id].tick(dt);
  controls.update();
  renderer.render(scene, camera);
  placeLabels();
}

Promise.all(ROBOTS.map(loadRobot)).then(() => {
  pandaSet(PANDA_HOME);
  document.getElementById('loader').style.opacity = 0;
  setTimeout(()=>document.getElementById('loader').remove(), 700);
  fitHome(); camera.position.copy(camGoal.pos); controls.target.copy(camGoal.tgt);
  renderNav(); renderPanel();
  const h = location.hash.slice(1);
  if (ROBOT_IDS.includes(h)){ setFocus(h); camera.position.copy(camGoal.pos); controls.target.copy(camGoal.tgt); }
  animate();
}).catch(e => {
  document.querySelector('#loader .w').textContent = 'FAILED TO LOAD — ' + e.message;
  console.error(e);
});
