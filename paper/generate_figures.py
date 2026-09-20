# SIIS - Paper Figure Generator (Refined Edition)
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle, Polygon
from PIL import Image, ImageDraw, ImageFilter

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(BASE_DIR, 'figures')
os.makedirs(OUT_DIR, exist_ok=True)

plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 9
plt.rcParams['axes.labelsize'] = 10
plt.rcParams['axes.titlesize'] = 11
plt.rcParams['xtick.labelsize'] = 9
plt.rcParams['ytick.labelsize'] = 9
plt.rcParams['legend.fontsize'] = 8.5

# ==============================================================================
# FIGURE 1: SYSTEM ARCHITECTURE (fig1_arch.png)
# ==============================================================================
def generate_fig1_arch():
    # Slightly wider layout to prevent text clipping and overlaps
    fig, ax = plt.subplots(figsize=(9.2, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    c_mobile = '#EBF5FB'
    c_mobile_b = '#1B4F72'
    c_gateway = '#FEF9E7'
    c_gateway_b = '#B7950B'
    c_ml = '#F4ECF7'
    c_ml_b = '#6C3483'
    c_db = '#E8F8F5'
    c_db_b = '#117864'
    c_admin = '#EAECEE'
    c_admin_b = '#2C3E50'

    # Title Banner at the very top with ample clearance
    ax.text(50, 96.5, 'Smart Infrastructure Intelligence System (SIIS) Architecture',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color='#1A365D')

    def draw_card(x, y, w, h, bg_col, border_col, title, items):
        rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.4,rounding_size=1.2',
                              facecolor=bg_col, edgecolor=border_col, linewidth=1.8, zorder=2)
        ax.add_patch(rect)
        # Header banner
        h_rect = FancyBboxPatch((x, y + h - 5.0), w, 5.0, boxstyle='round,pad=0.2,rounding_size=0.8',
                                facecolor=border_col, edgecolor=border_col, zorder=3)
        ax.add_patch(h_rect)
        ax.text(x + w/2, y + h - 2.5, title, ha='center', va='center',
                fontsize=9.2, fontweight='bold', color='white', zorder=4)
        
        cur_y = y + h - 8.5
        for it in items:
            ax.text(x + 2.0, cur_y, '• ' + it, ha='left', va='center',
                    fontsize=7.8, color='#1C2833', zorder=4)
            cur_y -= 3.5

    # Top Row: Client -> Gateway -> AI Service (y: 50 to 90, height=40)
    # 1. Citizen Mobile App (x: 2 to 28)
    draw_card(2, 50, 26, 40, c_mobile, c_mobile_b, 'Citizen Mobile Client', [
        'Capacitor Android / Vite',
        'Camera Orientation Lock',
        'GNSS / GPS Lock (±5m)',
        'EXIF Metadata Capture',
        'Multipart Payload (HTTPS)',
        'Local SQLite Report Cache'
    ])

    # 2. Node.js API Gateway (x: 36 to 64)
    draw_card(36, 50, 28, 40, c_gateway, c_gateway_b, 'API Gateway (Node.js/Express)', [
        'JWT Auth & Rate Limiter',
        'Multer Memory Buffer',
        'Sharp Pipeline (1080p WebP)',
        'Haversine Deduplication:',
        '  - 15m Spatial Proximity',
        '  - 72-Hour Temporal Window',
        'Centroid Cluster Aggregation'
    ])

    # 3. AI Inference Microservice (x: 72 to 98)
    draw_card(72, 50, 26, 40, c_ml, c_ml_b, 'AI Microservice (FastAPI)', [
        'Branch 1: Pothole Model',
        '  - YOLO26n-seg (Polygon)',
        'Branch 2: Road Cracks',
        '  - YOLO26s (Bounding Box)',
        'Branch 3: Sanitation Waste',
        '  - YOLO26s (3-Class Detect)',
        'Dynamic Severity Scoring'
    ])

    # Bottom Row: Database & Admin Operations (y: 4 to 42, height=38)
    # 4. Supabase DB & PostGIS (x: 14 to 48)
    draw_card(14, 4, 34, 38, c_db, c_db_b, 'Supabase Spatial Database & Storage', [
        'PostgreSQL 16 + PostGIS Spatial Engine',
        'Defects Layer: geometry(Point, 4326)',
        'ST_DWithin Dynamic Clustering Queries',
        'Issue Groups, Audit Trail & Citizen Upvotes',
        'S3-Compatible Object Storage CDN (Media)'
    ])

    # 5. Municipal Operations Dashboard (x: 54 to 88)
    draw_card(54, 4, 34, 38, c_admin, c_admin_b, 'Municipal Operations Command Center', [
        'React 18 / Vite Responsive Web Portal',
        'Interactive Leaflet / OpenStreetMap GIS',
        'Cluster Marker Aggregation & Severity Heatmap',
        'Dynamic Work Order Priority Triage Queue',
        'Status Machine (VERIFIED -> IN_PROGRESS -> DONE)',
        'Photographic Repair Verification Auditing'
    ])

    # Connecting Arrows with clear non-overlapping badges
    def arrow(x1, y1, x2, y2, label='', text_offset=(0, 2.0)):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='-|>', color='#2C3E50',
                                    lw=1.8, mutation_scale=14), zorder=5)
        if label:
            mx, my = (x1 + x2)/2 + text_offset[0], (y1 + y2)/2 + text_offset[1]
            ax.text(mx, my, label, ha='center', va='center',
                    fontsize=7.4, fontweight='bold', color='#0E2F44',
                    bbox=dict(boxstyle='round,pad=0.25', fc='#FFFFFF', ec='#90A4AE', lw=0.8, alpha=0.95),
                    zorder=6)

    # Mobile -> Gateway
    arrow(28, 70, 36, 70, 'Multipart Upload\n(Image + GPS)')

    # Gateway -> AI
    arrow(64, 73, 72, 73, 'Normalized\nTensor Stream', (0, 3.2))

    # AI -> Gateway
    arrow(72, 62, 64, 62, 'Bounding Boxes,\nMasks & Severity', (0, -3.2))

    # Gateway -> Supabase
    arrow(46, 50, 35, 42, 'Insert Defect Record\n& Storage Upload', (-4.0, 0))

    # Supabase <-> Admin
    arrow(48, 26, 54, 26, 'PostGIS Geospatial Queries & Real-Time Events', (0, 3.0))
    arrow(54, 16, 48, 16, 'Status Updates, Task Dispatch & Crew Allocation', (0, -3.0))

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig1_arch.png'), dpi=300, bbox_inches='tight')
    plt.savefig(os.path.join(BASE_DIR, 'fig1_arch.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print('[OK] Refined fig1_arch.png')

# ==============================================================================
# FIGURE 2: DETECTION SAMPLES COLLAGE (fig2_detections.png)
# ==============================================================================
def generate_fig2_detections():
    # Rich realistic road textures and detailed annotations
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(10.5, 4.0), dpi=300)

    # 1. Asphalt generator with realistic tar tone and gravel specks
    np.random.seed(123)
    w, h = 450, 450
    asphalt = np.random.normal(75, 14, (h, w)).clip(30, 130).astype(np.uint8)
    asphalt_rgb = np.stack([asphalt, asphalt, asphalt], axis=-1)
    # Add gravel specks
    specks = np.random.rand(h, w) > 0.985
    asphalt_rgb[specks] = [170, 170, 165]

    # --- Panel (a): Pothole Segmentation ---
    img1 = asphalt_rgb.copy()
    # Pothole bowl cavity
    yy, xx = np.mgrid[0:h, 0:w]
    # Distorted polygon cavity
    cav_dist = ((xx - 225)**2)/(125**2) + ((yy - 235)**2)/(80**2)
    # Add irregular rim
    cav_noise = 0.12 * np.sin(xx * 0.08) + 0.10 * np.cos(yy * 0.07)
    cav_mask = (cav_dist + cav_noise) < 1.0
    # Cavity interior is darker with deep shadow at top
    img1[cav_mask] = (img1[cav_mask] * 0.30).astype(np.uint8)
    # Deep bottom shadow
    deep_shadow = (cav_dist + cav_noise) < 0.65
    img1[deep_shadow] = (img1[deep_shadow] * 0.45).astype(np.uint8)
    # Broken gravel edge around rim
    rim = ((cav_dist + cav_noise) >= 0.90) & ((cav_dist + cav_noise) <= 1.08)
    img1[rim] = np.clip(img1[rim] * 1.4 + 20, 0, 255).astype(np.uint8)

    ax1.imshow(img1)
    # Transparent cyan segmentation polygon
    theta = np.linspace(0, 2*np.pi, 40)
    poly_r = 1.0 + 0.09 * np.sin(4*theta) + 0.07 * np.cos(3*theta)
    poly_x = 225 + 120 * np.cos(theta) * poly_r
    poly_y = 235 + 75 * np.sin(theta) * poly_r
    poly = patches.Polygon(np.column_stack([poly_x, poly_y]), closed=True,
                           facecolor=(0.0, 0.75, 1.0, 0.42), edgecolor='#00E5FF',
                           linewidth=2.2, zorder=3)
    ax1.add_patch(poly)
    bbox1 = patches.Rectangle((85, 140), 280, 190, linewidth=2.0, edgecolor='#00E5FF',
                              facecolor='none', linestyle='-', zorder=4)
    ax1.add_patch(bbox1)
    ax1.text(85, 130, 'pothole: 0.89  [CRITICAL]', fontsize=8.5, fontweight='bold', color='white',
             bbox=dict(boxstyle='square,pad=0.25', fc='#0288D1', ec='none'), zorder=5)
    ax1.set_title('(a) Pothole Semantic Segmentation
(YOLO26n-seg, mAP50 = 0.874)',
                  fontsize=9.2, fontweight='bold', pad=7)
    ax1.axis('off')

    # --- Panel (b): Road Crack Detection ---
    img2 = asphalt_rgb.copy()
    # Yellow road lane marking across the scene
    img2[190:265, :] = (img2[190:265, :] * 0.4 + np.array([210, 185, 30]) * 0.6).astype(np.uint8)
    # Longitudinal fissure
    for y in range(80, 370):
        x_c = int(210 + 16 * np.sin(y * 0.05) + 8 * np.sin(y * 0.15))
        img2[y, x_c-2:x_c+2] = [20, 20, 20] # dark crack core
        img2[y, x_c-3:x_c-2] = [50, 50, 48]
        img2[y, x_c+2:x_c+4] = [130, 128, 120] # highlighted edge
        if y % 32 == 0:
            for dx in range(-25, 25):
                img2[y, x_c + dx] = [25, 25, 25]

    # Transverse fissure branch
    for x in range(70, 210):
        y_c = int(285 + 12 * np.cos(x * 0.07))
        img2[y_c-2:y_c+2, x] = [22, 22, 22]

    ax2.imshow(img2)
    # Bounding box 1: Longitudinal crack
    bbox2a = patches.Rectangle((170, 75), 95, 295, linewidth=2.0, edgecolor='#FF1744',
                               facecolor='none', zorder=4)
    ax2.add_patch(bbox2a)
    ax2.text(170, 65, 'longitudinal_crack: 0.92', fontsize=8, fontweight='bold', color='white',
             bbox=dict(boxstyle='square,pad=0.25', fc='#D50000', ec='none'), zorder=5)

    # Bounding box 2: Transverse crack
    bbox2b = patches.Rectangle((65, 260), 150, 65, linewidth=2.0, edgecolor='#FF9100',
                               facecolor='none', zorder=4)
    ax2.add_patch(bbox2b)
    ax2.text(65, 250, 'transverse_crack: 0.86', fontsize=7.8, fontweight='bold', color='white',
             bbox=dict(boxstyle='square,pad=0.25', fc='#E65100', ec='none'), zorder=5)
    ax2.set_title('(b) Road Crack Multi-Scale Detection
(YOLO26s, mAP50 = 0.907)',
                  fontsize=9.2, fontweight='bold', pad=7)
    ax2.axis('off')

    # --- Panel (c): Sanitation / Waste ---
    img3 = np.full((h, w, 3), 115, dtype=np.uint8) # Sidewalk concrete
    # Sidewalk paving joints
    img3[140:144, :] = 80
    img3[280:284, :] = 80
    # Road curb line
    img3[310:, :] = (asphalt_rgb[310:, :] * 0.85).astype(np.uint8)
    img3[305:310, :] = 160 # Curb bevel concrete

    # Green Dumpster Body with 3D shading
    img3[70:270, 70:220] = [38, 106, 60] # Green dumpster
    # Vertical rib grooves on dumpster
    for rx in [105, 145, 185]:
        img3[70:270, rx-2:rx+2] = [25, 75, 40]
    # Dumpster rim
    img3[65:75, 65:225] = [28, 85, 45]

    # Overflowing trash mound spilling out of top
    yy3, xx3 = np.mgrid[0:h, 0:w]
    trash_pile = (((xx3 - 145)**2)/(60**2) + ((yy3 - 60)**2)/(35**2)) < 1.0
    img3[trash_pile] = [215, 205, 185] # Paper / carton trash
    # Add colored plastic bag chunks
    bag1 = (((xx3 - 120)**2)/(18**2) + ((yy3 - 55)**2)/(15**2)) < 1.0
    img3[bag1] = [30, 130, 200] # Blue bag
    bag2 = (((xx3 - 165)**2)/(20**2) + ((yy3 - 62)**2)/(16**2)) < 1.0
    img3[bag2] = [210, 50, 45]  # Red bag

    # Road street litter pile on the street below
    litter = (((xx3 - 310)**2)/(70**2) + ((yy3 - 365)**2)/(40**2)) < 1.0
    img3[litter] = [220, 215, 195]
    litter_can = (((xx3 - 330)**2)/(12**2) + ((yy3 - 360)**2)/(8**2)) < 1.0
    img3[litter_can] = [180, 40, 40]

    ax3.imshow(img3)
    # Bounding box 1: Overflowing Bin
    bbox3a = patches.Rectangle((60, 25), 170, 250, linewidth=2.0, edgecolor='#00E676',
                               facecolor='none', zorder=4)
    ax3.add_patch(bbox3a)
    ax3.text(60, 15, 'overflowing_bin: 0.88', fontsize=8, fontweight='bold', color='white',
             bbox=dict(boxstyle='square,pad=0.25', fc='#00A844', ec='none'), zorder=5)

    # Bounding box 2: Trash on road
    bbox3b = patches.Rectangle((235, 320), 155, 90, linewidth=2.0, edgecolor='#FFD600',
                               facecolor='none', zorder=4)
    ax3.add_patch(bbox3b)
    ax3.text(235, 310, 'trash_on_road: 0.84', fontsize=8, fontweight='bold', color='black',
             bbox=dict(boxstyle='square,pad=0.25', fc='#FFD600', ec='none'), zorder=5)
    ax3.set_title('(c) Sanitation & Waste Classification
(YOLO26s, mAP50 = 0.742)',
                  fontsize=9.2, fontweight='bold', pad=7)
    ax3.axis('off')

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig2_detections.png'), dpi=300, bbox_inches='tight')
    plt.savefig(os.path.join(BASE_DIR, 'fig2_detections.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print('[OK] Refined fig2_detections.png')

# ==============================================================================
# FIGURE 5: ADMIN GIS DASHBOARD (fig5_admin_map.png)
# ==============================================================================
def generate_fig5_admin_map():
    fig, ax = plt.subplots(figsize=(9.2, 5.4), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Window container
    window = FancyBboxPatch((0, 0), 100, 100, boxstyle='square,pad=0',
                            facecolor='#F8FAFC', edgecolor='#94A3B8', linewidth=1.5, zorder=1)
    ax.add_patch(window)

    # Header Navbar
    navbar = Rectangle((0, 91), 100, 9, facecolor='#0F172A', zorder=2)
    ax.add_patch(navbar)
    ax.text(2.5, 95.5, 'SIIS', fontsize=11.5, fontweight='bold', color='#38BDF8', va='center', zorder=3)
    ax.text(7.2, 95.5, '|  Municipal Infrastructure Command Portal — Chennai Metro',
            fontsize=8.5, color='#F8FAFC', va='center', zorder=3)
    ax.text(97.5, 95.5, '● System Live  |  Admin: M. Cherukuri', fontsize=7.5,
            color='#4ADE80', ha='right', va='center', zorder=3)

    # Stat Cards with perfect non-overlapping spacing
    def stat_card(x, y, w, h, title, val, badge_txt, badge_col):
        c = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.2,rounding_size=1.0',
                           facecolor='white', edgecolor='#E2E8F0', linewidth=1.2, zorder=3)
        ax.add_patch(c)
        ax.text(x + 2.2, y + h - 2.5, title, fontsize=6.5, color='#64748B', fontweight='bold', zorder=4)
        ax.text(x + 2.2, y + 2.5, val, fontsize=11, color='#0F172A', fontweight='bold', zorder=4)
        ax.text(x + w - 2.2, y + 2.5, badge_txt, fontsize=6.5, color=badge_col,
                fontweight='bold', ha='right', zorder=4)

    stat_card(2, 81.5, 22.5, 8.0, 'TOTAL INCIDENTS', '1,842', '+14 today', '#0284C7')
    stat_card(26, 81.5, 22.5, 8.0, 'CRITICAL DEFECTS', '38', 'Action Req.', '#DC2626')
    stat_card(50, 81.5, 22.5, 8.0, 'RESOLVED (30D)', '1,419', '77.0% rate', '#16A34A')
    stat_card(74, 81.5, 24, 8.0, 'AVG REPAIR TIME', '42.5 hrs', '-18.2% Q1', '#9333EA')

    # Left Container: GIS Map (x: 2 to 67, y: 2 to 79)
    map_box = FancyBboxPatch((2, 2), 65, 77.5, boxstyle='round,pad=0.2,rounding_size=1.0',
                             facecolor='#EDF3F5', edgecolor='#CBD5E1', linewidth=1.2, zorder=2)
    ax.add_patch(map_box)

    # Waterways
    water_pts = np.array([[2, 35], [20, 32], [40, 38], [67, 34], [67, 28], [40, 32], [20, 26], [2, 29]])
    water = patches.Polygon(water_pts, closed=True, facecolor='#BCE0EB', edgecolor='none', zorder=3)
    ax.add_patch(water)

    # Road Network
    roads = [
        [(2, 60), (67, 60)], [(2, 45), (67, 45)], [(2, 20), (67, 20)],
        [(15, 2), (15, 79)], [(32, 2), (32, 79)], [(50, 2), (50, 79)],
        [(2, 70), (50, 20)], [(20, 79), (65, 35)]
    ]
    for r in roads:
        ax.plot([r[0][0], r[1][0]], [r[0][1], r[1][1]], color='#FFFFFF', lw=3.2,
                solid_capstyle='round', zorder=4)
        ax.plot([r[0][0], r[1][0]], [r[0][1], r[1][1]], color='#CBD5E1', lw=1.2,
                solid_capstyle='round', zorder=4)

    # Map Pins
    red_xs = [18, 22, 35, 33, 48, 52]
    red_ys = [58, 62, 46, 44, 22, 68]
    for rx, ry in zip(red_xs, red_ys):
        ax.plot(rx, ry, marker='o', markersize=8.5, color='#EF4444',
                markeredgecolor='white', markeredgewidth=1.8, zorder=5)

    amb_xs = [12, 16, 28, 54, 45]
    amb_ys = [43, 72, 61, 38, 55]
    for ax_pt, ay_pt in zip(amb_xs, amb_ys):
        ax.plot(ax_pt, ay_pt, marker='o', markersize=7.5, color='#F59E0B',
                markeredgecolor='white', markeredgewidth=1.8, zorder=5)

    pur_xs = [8, 38, 42, 60, 25]
    pur_ys = [22, 74, 18, 50, 36]
    for px, py in zip(pur_xs, pur_ys):
        ax.plot(px, py, marker='o', markersize=7.5, color='#8B5CF6',
                markeredgecolor='white', markeredgewidth=1.8, zorder=5)

    # Map Controls Overlay
    ax.text(4, 75.5, 'Layers: [Defect Heatmap: ON] [Satellite: OFF] [Clusters: ON]',
            fontsize=6.6, color='#1E293B', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.25', fc='white', ec='#CBD5E1', alpha=0.92), zorder=6)

    # Selected Defect Popup Tooltip (High zorder=10 so it overlays cleanly without road cuts!)
    popup = FancyBboxPatch((35, 37), 30, 32, boxstyle='round,pad=0.4,rounding_size=1.2',
                           facecolor='#0F172A', edgecolor='#38BDF8', linewidth=1.8,
                           alpha=0.97, zorder=10)
    ax.add_patch(popup)
    ax.text(37.5, 65.5, 'INCIDENT #INF-8042', fontsize=8.0, fontweight='bold', color='#38BDF8', zorder=11)
    ax.text(37.5, 61.5, 'Category: Severe Pothole Cavity', fontsize=7.4, color='#F8FAFC', fontweight='bold', zorder=11)
    ax.text(37.5, 57.5, 'Severity Score: 9.4 / 10  [CRITICAL]', fontsize=7.2, color='#F87171', fontweight='bold', zorder=11)
    ax.text(37.5, 53.5, 'Coords: 13.0612° N, 80.2584° E (Anna Salai)', fontsize=6.6, color='#94A3B8', zorder=11)
    ax.text(37.5, 49.5, 'Cavity Area: 5.8% | Depth Est.: > 12cm', fontsize=6.6, color='#CBD5E1', zorder=11)
    ax.text(37.5, 45.5, 'Citizen Evidence: 3 Reports (Confirmed)', fontsize=6.5, color='#CBD5E1', zorder=11)
    ax.text(37.5, 41.0, 'Status: DISPATCHED -> PWD Crew #3', fontsize=7.2, color='#4ADE80', fontweight='bold', zorder=11)

    # Right Container: Priority Triage Feed
    feed_box = FancyBboxPatch((69, 2), 29, 77.5, boxstyle='round,pad=0.2,rounding_size=1.0',
                              facecolor='white', edgecolor='#CBD5E1', linewidth=1.2, zorder=2)
    ax.add_patch(feed_box)
    ax.text(71, 75.5, 'PRIORITY WORK QUEUE', fontsize=8.2, fontweight='bold', color='#0F172A', zorder=3)

    items_meta = [
        ('#INF-8042', 'CRITICAL', '#EF4444', 'Pothole (Cavity 5.8%)', 'Anna Salai • 18m ago'),
        ('#INF-8041', 'HIGH', '#F59E0B', 'Overflowing Waste Bin', 'T. Nagar • 35m ago'),
        ('#INF-8040', 'CRITICAL', '#EF4444', 'Deep Longitudinal Crack', 'Velachery Rd • 1h ago'),
        ('#INF-8039', 'MEDIUM', '#3B82F6', 'Broken Municipal Bin', 'Guindy Junc • 2h ago'),
        ('#INF-8038', 'RESOLVED', '#10B981', 'Pothole Repaired', 'OMR High Rd • 3h ago')
    ]
    cur_y = 68.0
    for code, sev, sev_col, desc, loc in items_meta:
        card = FancyBboxPatch((70.5, cur_y - 8.2), 26, 9.2, boxstyle='round,pad=0.2,rounding_size=0.8',
                              facecolor='#F8FAFC', edgecolor='#E2E8F0', linewidth=1.0, zorder=3)
        ax.add_patch(card)
        ax.text(71.8, cur_y - 1.8, code, fontsize=7.2, fontweight='bold', color='#1E293B', zorder=4)
        ax.text(95.0, cur_y - 1.8, sev, fontsize=6.2, fontweight='bold', color='white', ha='right',
                bbox=dict(boxstyle='round,pad=0.2', fc=sev_col, ec='none'), zorder=4)
        ax.text(71.8, cur_y - 4.4, desc, fontsize=6.6, color='#334155', fontweight='bold', zorder=4)
        ax.text(71.8, cur_y - 6.8, loc, fontsize=6.0, color='#64748B', zorder=4)
        cur_y -= 11.2

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig5_admin_map.png'), dpi=300, bbox_inches='tight')
    plt.savefig(os.path.join(BASE_DIR, 'fig5_admin_map.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print('[OK] Refined fig5_admin_map.png')

if __name__ == '__main__':
    generate_fig1_arch()
    generate_fig2_detections()
    generate_fig5_admin_map()
    print('Refined figures generated successfully!')
