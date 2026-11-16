#!/usr/bin/env python3.13
"""A mascot figure rigged with Rigify, animated and rendered in Blender (bpy, CPU, no GPU). The same description (mascot.json, shape "figure") as the three.js engine.

  python3.13 figure.py mascot.json out_dir [--timeline=t.json] [--env=env.json] [--seconds=8] [--fps=24] [--width=720] [--height=720] [--samples=24] [--still=FRAME] [--blend=out.blend]

What it does: shapes the Rigify "basic human" meta-rig to a chibi's proportions (big head, short body and legs), generates the Rigify rig, builds the parts of the figure (head with a dark visor,
body, arms, legs, optional wings, halo and chest emblem) and fixes each part rigidly to one deform bone of the generated rig (a robot has no skin to bend), then keys the FK controls of the rig:
a float, a nod, a wave, and the mood; the eyes blink; the mouth opens as `env.json` says (lipsync.py). It writes PNG frames (out_dir/00000.png ...); mascot-kit film assembles them.
Needs python 3.13 and `pip install bpy` (400 MB, once). Honest limit: Rigify drives the pose, the parts are simple shapes: the look is a lit, outlined toy, not a modelled character.
"""
import json, math, os, sys
import bpy, addon_utils
from mathutils import Vector, Matrix, Euler

A = [a for a in sys.argv[1:] if not a.startswith('--')]
O = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
if len(A) < 2: sys.exit(__doc__)
cfg = json.load(open(A[0])); OUT = A[1]
FPS = int(O.get('fps', 24)); SEC = float(O.get('seconds', 8)); W = int(O.get('width', 720)); H = int(O.get('height', 720)); SAMPLES = int(O.get('samples', 24))
TL = json.load(open(O['timeline'])) if 'timeline' in O else {'mood': [], 'speak': []}
ENV = json.load(open(O['env'])) if 'env' in O else None

# ---- the description, with the defaults of config.js (the browser engine); only what a figure reads
def get(d, path, default):
    for k in path.split('.'):
        if not isinstance(d, dict) or k not in d: return default
        d = d[k]
    return d
C = lambda p, d: get(cfg, p, d)
def lin(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4) for x in c] + [1]
COL, ACC, GLOW, BG = C('color', '#faf3ea'), C('accent', '#ffb27a'), C('glow', '#ff8a3d'), C('background', '#14110f')
VIS, EYE, MOUTH = C('face.visorColor', '#0b0806'), C('face.eye.color', '#ffe6c2'), C('face.mouth.color', '#ff8a4a')
FIG = {'arms': True, 'legs': True, 'wings': False, 'halo': False, 'wave': True, **cfg.get('figure', {})}
EMB = cfg.get('emblem')

def mood_at(t):
    k = sorted(TL.get('mood', []), key=lambda m: m['at'])
    if not k: return 0.0
    if t <= k[0]['at']: return k[0]['v']
    for i in range(1, len(k)):
        if t <= k[i]['at']:
            u = (t - k[i - 1]['at']) / max(1e-6, k[i]['at'] - k[i - 1]['at']); return k[i - 1]['v'] + (k[i]['v'] - k[i - 1]['v']) * u * u * (3 - 2 * u)
    return k[-1]['v']
speaking = lambda t: any(s['from'] <= t < s['to'] for s in TL.get('speak', []))

# ---- scene, Rigify
bpy.ops.wm.read_factory_settings(use_empty=True)
addon_utils.enable('rigify', default_set=True, persistent=True)      # default_set=True is what makes Rigify's parameters register without a user interface
bpy.ops.object.armature_basic_human_metarig_add()
meta = bpy.context.object
# a chibi: (head, tail) in metres, feet on z = 0, facing -Y; the bends (y offsets of knees and elbows) are the meta-rig's own
P = {'spine': ((0, .06, .58), (0, .02, .70)), 'spine.001': ((0, .02, .70), (0, 0, .80)), 'spine.002': ((0, 0, .80), (0, .01, .92)), 'spine.003': ((0, .01, .92), (0, .01, 1.05)),
     'spine.004': ((0, .01, 1.05), (0, .01, 1.10)), 'spine.005': ((0, .01, 1.10), (0, -.01, 1.15)), 'spine.006': ((0, -.01, 1.15), (0, -.02, 1.62)),
     'breast.L': ((.08, .05, .9), (.08, -.09, .9)), 'pelvis.L': ((0, .06, .58), (.07, -.05, .66)),
     'shoulder.L': ((.02, -.07, 1.0), (.10, .02, 1.0)), 'upper_arm.L': ((.12, .03, .99), (.30, .07, .84)), 'forearm.L': ((.30, .07, .84), (.46, .05, .70)), 'hand.L': ((.46, .05, .70), (.50, .04, .65)),
     'thigh.L': ((.10, .01, .62), (.10, -.03, .32)), 'shin.L': ((.10, -.03, .32), (.10, .02, .07)), 'foot.L': ((.10, .02, .07), (.10, -.09, .02)), 'toe.L': ((.10, -.09, .02), (.10, -.16, .02)), 'heel.02.L': ((.06, .05, 0), (.14, .05, 0))}
bpy.ops.object.mode_set(mode='EDIT')
eb = meta.data.edit_bones
for n in [b.name for b in eb if b.name.endswith('.R')]: pass
for n, (h, t) in P.items():
    for side, sx in ((n, 1), (n[:-2] + '.R', -1)) if n.endswith('.L') else ((n, 1),):
        b = eb[side]; b.head = (h[0] * sx, h[1], h[2]); b.tail = (t[0] * sx, t[1], t[2])
bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.pose.rigify_generate()
rig = bpy.data.objects['rig']; bpy.context.view_layer.update()
for o in list(bpy.data.objects):
    if o.name.startswith('WGT-') or o.name == 'metarig': o.hide_render = True; o.hide_viewport = True
DEF = rig.data.bones

# ---- materials
def mat(name, color, rough=.35, emit=None, strength=0.0, coat=0.0, rim=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = lin(color); b.inputs['Roughness'].default_value = rough; b.inputs['Specular IOR Level'].default_value = .35
    if 'Coat Weight' in b.inputs: b.inputs['Coat Weight'].default_value = coat
    if emit:
        b.inputs['Emission Color'].default_value = lin(emit); b.inputs['Emission Strength'].default_value = strength
    if rim:       # a coloured light on the edge: the Fresnel of the Layer Weight node, added to the emission
        lw = nt.nodes.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = .2
        mul = nt.nodes.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = .9; nt.links.new(lw.outputs['Fresnel'], mul.inputs[0])
        mix = nt.nodes.new('ShaderNodeMix'); mix.data_type = 'RGBA'; mix.inputs['B'].default_value = lin(rim); mix.inputs['A'].default_value = [0, 0, 0, 1]; nt.links.new(mul.outputs[0], mix.inputs['Factor'])
        b.inputs['Emission Strength'].default_value = 1.0; nt.links.new(mix.outputs['Result'], b.inputs['Emission Color'])
    return m
M_BODY = mat('body', COL, .38, coat=.6, rim=ACC); M_VIS = mat('visor', VIS, .3, coat=.4)
M_EYE = mat('eye', EYE, .5, emit=EYE, strength=7); M_MOUTH = mat('mouth', MOUTH, .5, emit=MOUTH, strength=6)
M_GLOW = mat('glow', GLOW, .5, emit=GLOW, strength=6); M_WING = mat('wing', COL, .45, coat=.3, rim=GLOW)

# ---- parts, fixed rigidly to a deform bone
def to_bone(obj, bone):
    bpy.context.view_layer.update()
    pb = rig.pose.bones[bone]; obj.parent = rig; obj.parent_type = 'BONE'; obj.parent_bone = bone
    obj.matrix_parent_inverse = (rig.matrix_world @ pb.matrix @ Matrix.Translation((0, pb.bone.length, 0))).inverted()
def ell(name, c, r, material, bone, rot=None, seg=40):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=seg, ring_count=seg // 2, location=c); o = bpy.context.object; o.name = name
    o.scale = r; o.rotation_euler = rot or (0, 0, 0); bpy.ops.object.shade_smooth(); o.data.materials.append(material); to_bone(o, bone); return o
def along(name, a, b, thick, material, bone, extra=.03):      # an ellipsoid laid along a segment (a limb)
    a, b = Vector(a), Vector(b); d = b - a; mid = (a + b) / 2; q = d.to_track_quat('Z', 'Y')
    return ell(name, mid, (thick, thick, d.length / 2 + extra), material, bone, rot=q.to_euler())
def arc(name, c, r, lo, hi, material, bone, width=.02):
    cu = bpy.data.curves.new(name, 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = width; cu.bevel_resolution = 4; sp = cu.splines.new('POLY'); n = 24; sp.points.add(n)
    for i in range(n + 1):
        a = lo + (hi - lo) * i / n; sp.points[i].co = (r * math.cos(a), 0, r * math.sin(a), 1)
    o = bpy.data.objects.new(name, cu); bpy.context.collection.objects.link(o); o.location = c; o.data.materials.append(material); to_bone(o, bone); return o
H6, SP2, SP3 = 'DEF-spine.006', 'DEF-spine.002', 'DEF-spine.003'
head = ell('head', (0, 0, 1.40), (.46, .44, .44), M_BODY, H6, seg=56)
ell('visor', (0, -.30, 1.40), (.37, .18, .30), M_VIS, H6)
eyes = [arc(f'eye{s}', (s * .16, -.487, 1.46), .075, .15, math.pi - .15, M_EYE, H6, .022) for s in (-1, 1)]
smile = arc('smile', (0, -.487, 1.31), .06, math.pi + .35, 2 * math.pi - .35, M_MOUTH, H6, .018)
mouth = ell('mouth', (0, -.488, 1.27), (.05, .012, .012), M_MOUTH, H6)
ell('body', (0, 0, .82), (.30, .24, .27), M_BODY, SP2, seg=48)
if EMB:
    ell('emblem', (0, -.235, .86), (.045, .02, .045), M_GLOW, SP2); arc('emblem_ring', (0, -.232, .86), .085, 0, 2 * math.pi, M_GLOW, SP2, .008)
if FIG['legs']:
    for s, sx in (('L', 1), ('R', -1)):
        ell('thigh' + s, (sx * .10, 0, .47), (.105, .105, .17), M_BODY, f'DEF-thigh.{s}'); ell('shin' + s, (sx * .10, 0, .20), (.09, .09, .13), M_BODY, f'DEF-shin.{s}')
        ell('foot' + s, (sx * .10, -.05, .05), (.115, .19, .07), M_BODY, f'DEF-foot.{s}')
if FIG['arms']:
    for s, sx in (('L', 1), ('R', -1)):
        along('arm' + s, (sx * .12, .03, .99), (sx * .30, .07, .84), .075, M_BODY, f'DEF-upper_arm.{s}')
        along('fore' + s, (sx * .30, .07, .84), (sx * .46, .05, .70), .07, M_BODY, f'DEF-forearm.{s}')
        ell('hand' + s, (sx * .50, .04, .64), (.085, .085, .1), M_BODY, f'DEF-hand.{s}')
wings = []
if FIG['wings']:
    for s, sx in (('L', 1), ('R', -1)):
        for i, (ang, ln, dz) in enumerate(((55, .46, .16), (14, .54, 0.0), (-28, .44, -.17))):
            a = math.radians(ang); c = (sx * (.22 + ln * .5 * math.cos(a)), .2, 1.0 + dz + ln * .5 * math.sin(a) * .45)
            w = ell(f'wing{s}{i}', c, (ln / 2, .04, .12), M_WING, SP3, rot=(0, -sx * math.radians(ang * .5), 0)); wings.append((w, sx))
halo = None
if FIG['halo']:
    bpy.ops.mesh.primitive_torus_add(major_radius=.30, minor_radius=.028, location=(0, -.02, 2.0), rotation=(math.radians(14), 0, 0)); halo = bpy.context.object; halo.name = 'halo'
    halo.data.materials.append(M_GLOW); bpy.ops.object.shade_smooth(); to_bone(halo, H6)

# ---- light, camera, outline
w = bpy.data.worlds.new('w'); bpy.context.scene.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']; bg.inputs['Color'].default_value = lin(BG); bg.inputs['Strength'].default_value = 1.0
def area(n, loc, e, color, size):
    d = bpy.data.lights.new(n, 'AREA'); d.energy = e; d.color = color[:3]; d.size = size; o = bpy.data.objects.new(n, d); bpy.context.collection.objects.link(o); o.location = loc
    t = o.constraints.new('TRACK_TO'); t.target = head; t.track_axis = 'TRACK_NEGATIVE_Z'; t.up_axis = 'UP_Y'
area('key', (1.6, -3.0, 3.4), 520, (1, .97, .94), 2.5); area('fill', (-2.6, -2.2, 1.2), 140, lin('#ffe6d0'), 3); area('rim', (-1.2, 2.4, 2.4), 420, lin(GLOW), 1.5)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); bpy.context.collection.objects.link(cam); cam.data.lens = 78; cam.location = (0, -6.2, 1.18); cam.rotation_euler = (math.radians(90), 0, 0); bpy.context.scene.camera = cam
sc = bpy.context.scene; sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMPLES; sc.cycles.use_denoising = True
sc.render.resolution_x, sc.render.resolution_y, sc.render.fps = W, H, FPS; sc.render.film_transparent = False
sc.render.use_freestyle = True; sc.view_layers[0].use_freestyle = True
ls = sc.view_layers[0].freestyle_settings.linesets.new('outline'); ls.select_silhouette = True; ls.select_border = True; ls.select_crease = False; ls.select_by_visibility = True; ls.select_by_edge_types = True; ls.visibility = 'VISIBLE'; ls.select_by_image_border = False
ls.linestyle.thickness = 2.2 * W / 720; ls.linestyle.color = (.07, .05, .05)
sc.frame_start, sc.frame_end = 0, int(SEC * FPS) - 1

# ---- the pose of the rig
P = rig.pose.bones
for n in P.keys():
    if n.startswith(('upper_arm_parent', 'thigh_parent')) and 'IK_FK' in P[n]: P[n]['IK_FK'] = 1.0      # FK, so that the FK controls below drive the limbs
for n in ('upper_arm_fk.L', 'upper_arm_fk.R', 'forearm_fk.L', 'forearm_fk.R', 'head', 'torso', 'chest'):
    if n in P: P[n].rotation_mode = 'XYZ'
def key(n, **kw):
    pb = P[n]
    for k, v in kw.items(): setattr(pb, k, v); pb.keyframe_insert(k, frame=cur)
def okey(o, **kw):
    for k, v in kw.items(): setattr(o, k, v); o.keyframe_insert(k, frame=cur)
LO, HI = (.0001,) * 3, (1, 1, 1)
frames = [int(O['still'])] if 'still' in O else range(sc.frame_end + 1)
for cur in frames:
    t = cur / FPS; mood = mood_at(t); j, sd = max(mood, 0), max(-mood, 0); talk = (ENV[cur] if ENV and cur < len(ENV) else (.5 + .5 * math.sin(t * 17) * math.sin(t * 4.3 + 1))) if speaking(t) else 0
    bob = math.sin(t * 2) * .035; key('torso', location=(0, 0, .12 + bob)) if 'torso' in P else None
    if 'head' in P: key('head', rotation_euler=(math.radians(-4 * sd + 3 * math.sin(t * 1.7)), 0, math.radians(3 * math.sin(t * 1.1))))
    wave = FIG['wave'] and FIG['arms']
    if FIG['arms']:        # measured on the generated rig: a rotation about Z raises (negative, for the right arm) or lowers an FK arm bone
        key('upper_arm_fk.R', rotation_euler=(0, 0, math.radians((-40 + 4 * math.sin(t * 2.2)) if wave else 6 * math.sin(t * 2))))
        key('forearm_fk.R', rotation_euler=(0, 0, math.radians((-28 + (12 + 10 * talk) * math.sin(t * 5.5)) if wave else -8)))
        key('upper_arm_fk.L', rotation_euler=(0, 0, math.radians(8 + 3 * math.sin(t * 1.9 + 1))))
    # the eyes: smiling arcs, drooping when sad; blinking
    ph = ((t * .7) % 4) / 4; blink = max(.12, abs((ph - .975) / .025)) if ph > .95 else 1.0
    for e in eyes: okey(e, scale=(1, 1, blink * (.7 + .3 * min(1, .4 + j) - .15 * sd)), rotation_euler=(0, 0, 0) if sd < .2 else (0, math.pi, 0))
    o = min(1, max(0, talk)); okey(mouth, scale=(.05 * (1 + .4 * o), .012, .012 * (1 + 9 * o)) if o >= .12 else LO)      # the radii of the ellipsoid are its scale
    okey(smile, scale=HI if (o < .12 and mood >= 0) else LO)
    for w_, sx in wings: okey(w_, rotation_euler=(0, 0, math.radians(sx * 5 * math.sin(t * 2.4))))
    if halo: okey(halo, location=(0, -.02, 2.0 + math.sin(t * 2 + 1) * .02))
bpy.context.scene.frame_set(frames[0] if 'still' in O else 0)
os.makedirs(OUT, exist_ok=True)
if 'blend' in O: bpy.ops.wm.save_as_mainfile(filepath=O['blend'])
if 'still' in O:
    sc.frame_set(int(O['still'])); sc.render.filepath = os.path.join(OUT, 'still.png'); bpy.ops.render.render(write_still=True); print('still', sc.render.filepath)
else:
    sc.render.filepath = os.path.join(OUT, ''); sc.render.image_settings.file_format = 'PNG'; bpy.ops.render.render(animation=True); print('frames', len(frames))
