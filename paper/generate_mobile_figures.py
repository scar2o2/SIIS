# SIIS - Mobile-Only Architecture and UI Figure Generator
import os
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, Rectangle, Circle, Polygon

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
# FIGURE 1: MOBILE-ONLY SYSTEM ARCHITECTURE (fig1_arch.png)
# ==============================================================================
def generate_fig1_arch():
    # Only Mobile App (Citizen & Municipal Field Officer modules), Gateway, AI Service, and Supabase Database
    fig, ax = plt.subplots(figsize=(9.2, 5.8), dpi=300)
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

    ax.text(50, 96.5, 'Smart Infrastructure Intelligence System (SIIS) Architecture',
            ha='center', va='center', fontsize=12.5, fontweight='bold', color='#1A365D')

    def draw_card(x, y, w, h, bg_col, border_col, title, items, badge=''):
        rect = FancyBboxPatch((x, y), w, h, boxstyle='round,pad=0.4,rounding_size=1.2',
                              facecolor=bg_col, edgecolor=border_col, linewidth=1.8, zorder=2)
        ax.add_patch(rect)
        h_rect = FancyBboxPatch((x, y + h - 5.0), w, 5.0, boxstyle='round,pad=0.2,rounding_size=0.8',
                                facecolor=border_col, edgecolor=border_col, zorder=3)
        ax.add_patch(h_rect)
        ax.text(x + w/2, y + h - 2.5, title, ha='center', va='center',
                fontsize=9.0, fontweight='bold', color='white', zorder=4)
        if badge:
            ax.text(x + w - 1.5, y + h - 2.5, badge, ha='right', va='center',
                    fontsize=6.5, fontweight='bold', color='#FFEB3B', zorder=5)
        
        cur_y = y + h - 8.2
        for it in items:
            if it.startswith('  '):
                ax.text(x + 2.0, cur_y, '    ' + it.strip(), ha='left', va='center',
                        fontsize=7.3, color='#424242', zorder=4)
            elif it.startswith('['):
                ax.text(x + 2.0, cur_y, it, ha='left', va='center',
                        fontsize=7.6, fontweight='bold', color='#0D47A1', zorder=4)
            else:
                ax.text(x + 2.0, cur_y, chr(8226) + ' ' + it, ha='left', va='center',
                        fontsize=7.6, color='#1C2833', zorder=4)
            cur_y -= 3.3

    # Left: Fully Completed Mobile App (x: 2 to 34, y: 4 to 90, height=86)
    draw_card(2, 4, 32, 86, c_mobile, c_mobile_b, 'SIIS Mobile Application (Android)', [
        '[Citizen Reporting Module]',
        'Live Camera Preview & Level Sensor',
        'Real-Time GNSS / GPS Lock (+/-5m)',
        'Anti-Tamper Live Capture Verification',
        'Community Feed & Hazard Upvoting',
        'Offline Queue (SQLite Storage)',
        '',
        '[Field Officer Triage Module]',
        'Interactive Leaflet / OSM Mobile Map',
        'Dynamic Severity Cluster Filtering',
        'On-Site Work Order Status Machine',
        '  (VERIFIED -> IN_PROGRESS -> RESOLVED)',
        'GPS Navigation to Hazard Site',
        'Resolution Proof Photo Capture'
    ], badge='Capacitor/Vite')

    # Middle Top: Node.js Gateway (x: 40 to 68, y: 50 to 90, height=40)
    draw_card(40, 50, 28, 40, c_gateway, c_gateway_b, 'API Gateway (Node.js/Express)', [
        'JWT Role Auth (Citizen/Officer)',
        'Rate Limiting & Multer Buffer',
        'Sharp Pipeline (1080p WebP / EXIF)',
        'Spatial Deduplication Engine:',
        '  - 15m Proximity Filter (Haversine)',
        '  - 72-Hour Temporal Window',
        'Issue Group Centroid Aggregation'
    ])

    # Right Top: FastAPI AI Microservice (x: 72 to 98, y: 50 to 90, height=40)
    draw_card(72, 50, 26, 40, c_ml, c_ml_b, 'AI Microservice (FastAPI)', [
        'Branch 1: Pothole Segmentation',
        '  - YOLO26n-seg (640x640, Mask)',
        'Branch 2: Road Crack Model',
        '  - YOLO26s (768x768, Boxes)',
        'Branch 3: Sanitation & Waste',
        '  - YOLO26s (640x640, 3-class)',
        'Multi-Factor Severity Scoring'
    ])

    # Middle-Right Bottom: Supabase Cloud DB & Storage (x: 40 to 98, y: 4 to 40, height=36)
    draw_card(40, 4, 58, 36, c_db, c_db_b, 'Supabase Spatial Cloud Tier (PostgreSQL 16 + PostGIS + S3)', [
        'PostGIS Geospatial Engine: ST_DWithin Indexing, Cluster Centroids & Spatial Views',
        'Hazard Reports Table: geometry(Point, 4326), Severity Vector, Confidence & Upvotes',
        'Work Orders & State Machine: Status Audit Logs, Assigned Crews & Resolution History',
        'S3-Compatible Object Storage: Public Evidence CDN & Annotated Detection Overlays'
    ])

    # Arrows
    def arrow(x1, y1, x2, y2, label='', text_offset=(0, 0), fontsize=7.2):
        ax.annotate('', xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle='-|>', color='#2C3E50',
                                    lw=1.8, mutation_scale=14), zorder=5)
        if label:
            mx, my = (x1 + x2)/2 + text_offset[0], (y1 + y2)/2 + text_offset[1]
            ax.text(mx, my, label, ha='center', va='center',
                    fontsize=fontsize, fontweight='bold', color='#0E2F44',
                    bbox=dict(boxstyle='round,pad=0.25', fc='#FFFFFF', ec='#90A4AE', lw=0.8, alpha=0.95),
                    zorder=6)

    # Mobile -> Gateway
    arrow(34, 75, 40, 75, 'Multipart Upload\n(Photo + GPS)', (0, 0))

    # Gateway -> AI
    arrow(68, 73, 72, 73, 'Normalized\nTensor', (0, 0))

    # AI -> Gateway
    arrow(72, 62, 68, 62, 'Masks & BBoxes\n+ Severity', (0, 0))

    # Gateway -> Supabase
    arrow(54, 50, 54, 40, 'Insert Defect & Evidence', (0, 0))

    # Supabase <-> Mobile (Bottom sync)
    arrow(40, 22, 34, 22, 'Real-Time Sync\n& Map Detections', (0, 0))
    arrow(34, 12, 40, 12, 'Status Updates\n& Upvotes', (0, 0))

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig1_arch.png'), dpi=300, bbox_inches='tight')
    plt.savefig(os.path.join(BASE_DIR, 'fig1_arch.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print('[OK] Generated mobile-only fig1_arch.png')

# ==============================================================================
# FIGURE 5: FULLY COMPLETED MOBILE APP INTERFACES (fig5_admin_map.png)
# ==============================================================================
def generate_fig5_mobile_ui():
    # 3 Smartphone frames showcasing the fully completed mobile application:
    # Screen 1: Mobile GIS Defect Map with Cluster Markers & Filter Pills
    # Screen 2: Real-time Camera Viewfinder with Live AI Bounding Box & GPS Lock
    # Screen 3: Incident Details & Officer Triage Modal with Severity & Action Buttons
    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(10.5, 5.8), dpi=300)

    # Smartphone Shell Dimensions (w=300, h=560)
    sw, sh = 300, 560

    def draw_phone_shell(ax, title_text):
        ax.set_xlim(0, sw)
        ax.set_ylim(0, sh)
        ax.axis('off')

        # Outer Phone Bezel (Rounded phone body)
        bezel = FancyBboxPatch((4, 4), sw - 8, sh - 8, boxstyle='round,pad=0,rounding_size=20',
                               facecolor='#0F172A', edgecolor='#334155', linewidth=2.5, zorder=1)
        ax.add_patch(bezel)

        # Inner Screen Glass (Screen display area)
        screen = FancyBboxPatch((12, 12), sw - 24, sh - 24, boxstyle='round,pad=0,rounding_size=14',
                                facecolor='#F8FAFC', edgecolor='none', zorder=2)
        ax.add_patch(screen)

        # Phone Notch / Camera Hole
        notch = FancyBboxPatch((sw/2 - 25, sh - 22), 50, 7, boxstyle='round,pad=0,rounding_size=3.5',
                               facecolor='#0F172A', edgecolor='none', zorder=10)
        ax.add_patch(notch)
        cam = Circle((sw/2 - 12, sh - 18.5), 2.2, facecolor='#1E293B', edgecolor='#475569', lw=0.6, zorder=11)
        ax.add_patch(cam)

        # Top Status Bar (Time, Wifi, Battery)
        ax.text(26, sh - 25, '09:41', fontsize=7.0, fontweight='bold', color='#0F172A', va='center', zorder=9)
        ax.text(sw - 26, sh - 25, '5G  100%', fontsize=6.5, fontweight='bold', color='#0F172A', ha='right', va='center', zorder=9)

        # Bottom Home Bar Indicator
        home_bar = FancyBboxPatch((sw/2 - 35, 16), 70, 3.5, boxstyle='round,pad=0,rounding_size=1.8',
                                  facecolor='#94A3B8', edgecolor='none', zorder=10)
        ax.add_patch(home_bar)

        # Subtitle below phone
        ax.set_title(title_text, fontsize=8.8, fontweight='bold', pad=8, color='#0F172A')

    # --------------------------------------------------------------------------
    # SCREEN 1: MOBILE GIS MAP & INCIDENT CLUSTERS
    # --------------------------------------------------------------------------
    draw_phone_shell(ax1, '(a) Mobile GIS Hazard Map\n(Cluster Pins & Spatial Triage)')

    # Top App Bar in Screen
    app_bar1 = FancyBboxPatch((12, sh - 68), sw - 24, 40, boxstyle='square,pad=0',
                              facecolor='#1E293B', edgecolor='none', zorder=3)
    ax1.add_patch(app_bar1)
    ax1.text(26, sh - 46, 'SIIS Mobile', fontsize=10, fontweight='bold', color='#38BDF8', zorder=4)
    ax1.text(26, sh - 60, 'Chennai Metro District', fontsize=6.8, color='#94A3B8', zorder=4)
    ax1.text(sw - 26, sh - 52, 'Admin Mode', fontsize=6.5, fontweight='bold', color='#4ADE80',
             ha='right', bbox=dict(boxstyle='round,pad=0.2', fc='#064E3B', ec='#059669', lw=0.6), zorder=4)

    # Filter Pills
    pills_y = sh - 90
    pills = [('All (142)', '#0284C7', 'white'), ('Critical (12)', '#DC2626', 'white'),
             ('Potholes', '#F1F5F9', '#334155'), ('Cracks', '#F1F5F9', '#334155')]
    curr_x = 22
    for p_txt, p_bg, p_col in pills:
        pw = len(p_txt) * 5.2 + 10
        p_patch = FancyBboxPatch((curr_x, pills_y), pw, 14, boxstyle='round,pad=0,rounding_size=7',
                                 facecolor=p_bg, edgecolor='#CBD5E1' if p_bg == '#F1F5F9' else 'none',
                                 linewidth=0.8, zorder=4)
        ax1.add_patch(p_patch)
        ax1.text(curr_x + pw/2, pills_y + 7, p_txt, fontsize=6.0, fontweight='bold',
                 color=p_col, ha='center', va='center', zorder=5)
        curr_x += pw + 6

    # Simulated Leaflet / OSM Map Background (y: 120 to sh - 100)
    map_rect = FancyBboxPatch((12, 110), sw - 24, sh - 210, boxstyle='square,pad=0',
                              facecolor='#E8F1F5', edgecolor='none', zorder=2)
    ax1.add_patch(map_rect)

    # Waterway (Adyar River)
    w_pts = np.array([[12, 280], [80, 270], [180, 300], [sw-12, 285], [sw-12, 260], [180, 275], [80, 245], [12, 255]])
    ax1.add_patch(patches.Polygon(w_pts, closed=True, facecolor='#BAE6FD', edgecolor='none', zorder=3))

    # Road Network
    m_roads = [
        [(12, 400), (sw-12, 380)], [(12, 320), (sw-12, 320)], [(12, 200), (sw-12, 200)],
        [(70, 110), (70, sh-100)], [(160, 110), (160, sh-100)], [(230, 110), (230, sh-100)],
        [(12, 430), (220, 150)], [(80, sh-100), (sw-12, 230)]
    ]
    for r in m_roads:
        ax1.plot([r[0][0], r[1][0]], [r[0][1], r[1][1]], color='#FFFFFF', lw=3.0, solid_capstyle='round', zorder=4)
        ax1.plot([r[0][0], r[1][0]], [r[0][1], r[1][1]], color='#CBD5E1', lw=1.0, solid_capstyle='round', zorder=4)

    # Current User GPS Blue Pulse
    ax1.add_patch(Circle((160, 320), 16, facecolor=(0.14, 0.54, 0.95, 0.25), edgecolor='none', zorder=5))
    ax1.add_patch(Circle((160, 320), 5.5, facecolor='#2563EB', edgecolor='white', lw=1.5, zorder=6))

    # Clustered Hazard Pins
    pins = [
        (110, 370, '#EF4444', 'CRIT'),
        (135, 390, '#EF4444', 'CRIT'),
        (210, 360, '#F59E0B', 'WARN'),
        (85, 230, '#8B5CF6', 'CRCK'),
        (240, 210, '#EF4444', 'CRIT'),
        (185, 170, '#10B981', 'DONE')
    ]
    for px, py, pcol, plbl in pins:
        ax1.plot(px, py, marker='o', markersize=7.5, color=pcol, markeredgecolor='white', markeredgewidth=1.4, zorder=6)

    # Bottom Sheet Drawer (Active Selected Defect)
    drawer = FancyBboxPatch((18, 26), sw - 36, 95, boxstyle='round,pad=0,rounding_size=10',
                            facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.2, zorder=7)
    ax1.add_patch(drawer)
    ax1.text(30, 105, 'INCIDENT #INF-8042', fontsize=7.2, fontweight='bold', color='#0284C7', zorder=8)
    ax1.text(sw - 30, 105, 'CRITICAL', fontsize=6.5, fontweight='bold', color='white', ha='right',
             bbox=dict(boxstyle='round,pad=0.2', fc='#DC2626', ec='none'), zorder=8)
    ax1.text(30, 90, 'Severe Road Pothole (5.8% Cavity)', fontsize=7.5, fontweight='bold', color='#0F172A', zorder=8)
    ax1.text(30, 77, 'Anna Salai, Ch-02 • 0.3 km away', fontsize=6.6, color='#64748B', zorder=8)
    ax1.text(30, 64, 'Reported 18m ago • 3 Citizen Upvotes', fontsize=6.2, color='#64748B', zorder=8)

    # Action Buttons inside bottom sheet
    btn_nav = FancyBboxPatch((30, 36), 110, 18, boxstyle='round,pad=0,rounding_size=5',
                             facecolor='#0284C7', edgecolor='none', zorder=8)
    ax1.add_patch(btn_nav)
    ax1.text(85, 45, 'Navigate to Site', fontsize=6.8, fontweight='bold', color='white',
             ha='center', va='center', zorder=9)

    btn_stat = FancyBboxPatch((150, 36), sw - 180, 18, boxstyle='round,pad=0,rounding_size=5',
                              facecolor='#F1F5F9', edgecolor='#CBD5E1', linewidth=0.8, zorder=8)
    ax1.add_patch(btn_stat)
    ax1.text(150 + (sw-180)/2, 45, 'Update Triage', fontsize=6.8, fontweight='bold', color='#1E293B',
             ha='center', va='center', zorder=9)


    # --------------------------------------------------------------------------
    # SCREEN 2: REAL-TIME IN-APP CAMERA & AI CAPTURE
    # --------------------------------------------------------------------------
    draw_phone_shell(ax2, '(b) In-App Real-Time Camera\n(Live AI Segmentation & GPS Lock)')

    # Full-screen Camera Viewfinder (dark asphalt road texture)
    np.random.seed(99)
    vw, vh = int(sw - 24), int(sh - 24)
    cam_bg = np.random.normal(70, 12, (vh, vw)).clip(35, 120).astype(np.uint8)
    cam_rgb = np.stack([cam_bg, cam_bg, cam_bg], axis=-1)

    # Paint Pothole in Viewfinder
    yy2, xx2 = np.mgrid[0:vh, 0:vw]
    pothole_mask = (((xx2 - vw/2)**2)/(65**2) + ((yy2 - vh*0.48)**2)/(45**2)) < 1.0
    cam_rgb[pothole_mask] = (cam_rgb[pothole_mask] * 0.35).astype(np.uint8)

    ax2.imshow(cam_rgb, extent=[12, sw-12, 12, sh-12], zorder=2)

    # Real-time Segmentation Overlay
    theta2 = np.linspace(0, 2*np.pi, 30)
    p_x = (sw/2) + 65 * np.cos(theta2)
    p_y = (sh * 0.52) + 45 * np.sin(theta2)
    ax2.add_patch(patches.Polygon(np.column_stack([p_x, p_y]), closed=True,
                                 facecolor=(0.0, 0.75, 1.0, 0.40), edgecolor='#00E5FF',
                                 linewidth=2.0, zorder=3))
    # Target Reticle Box
    ax2.add_patch(patches.Rectangle((sw/2 - 75, sh*0.52 - 55), 150, 110,
                                   linewidth=1.8, edgecolor='#00E5FF', linestyle='--', facecolor='none', zorder=4))

    # Live AI Tag in Camera Viewfinder
    ax2.text(sw/2 - 75, sh*0.52 + 60, 'Pothole: 0.89  [CRITICAL]', fontsize=7.2, fontweight='bold',
             color='white', bbox=dict(boxstyle='square,pad=0.2', fc='#0284C7', ec='none'), zorder=5)

    # Level Sensor Line
    ax2.plot([sw/2 - 40, sw/2 + 40], [sh*0.52, sh*0.52], color='#4ADE80', lw=1.5, zorder=5)
    ax2.text(sw/2, sh*0.52 + 8, 'HOLD LEVEL: 0.2 deg', fontsize=5.8, fontweight='bold',
             color='#4ADE80', ha='center', zorder=5)

    # Camera Top Bar (Overlaid)
    cam_top = FancyBboxPatch((12, sh - 68), sw - 24, 40, boxstyle='square,pad=0',
                             facecolor='#000000', edgecolor='none', alpha=0.6, zorder=4)
    ax2.add_patch(cam_top)
    ax2.text(26, sh - 46, chr(9679) + ' GPS LOCKED: +/-3.4m', fontsize=6.8, fontweight='bold', color='#4ADE80', zorder=5)
    ax2.text(26, sh - 58, '13.0612 deg N, 80.2584 deg E', fontsize=6.2, color='#CBD5E1', zorder=5)
    ax2.text(sw - 26, sh - 52, 'FLASH: AUTO', fontsize=6.2, color='#F8FAFC', ha='right', zorder=5)

    # Camera Bottom Shutter Control Bar
    cam_bot = FancyBboxPatch((12, 12), sw - 24, 85, boxstyle='square,pad=0',
                             facecolor='#000000', edgecolor='none', alpha=0.7, zorder=4)
    ax2.add_patch(cam_bot)

    # Shutter Outer Ring & Button
    ax2.add_patch(Circle((sw/2, 54), 24, facecolor='none', edgecolor='white', lw=2.5, zorder=5))
    ax2.add_patch(Circle((sw/2, 54), 20, facecolor='#0284C7', edgecolor='white', lw=1.0, zorder=6))

    # Gallery / Mode Switch
    ax2.text(45, 54, 'Cancel', fontsize=7.2, color='#CBD5E1', ha='center', va='center', zorder=5)
    ax2.text(sw - 45, 54, 'Auto AI', fontsize=7.2, fontweight='bold', color='#38BDF8', ha='center', va='center', zorder=5)


    # --------------------------------------------------------------------------
    # SCREEN 3: WORK-ORDER TRIAGE & FIELD OFFICER ACTION
    # --------------------------------------------------------------------------
    draw_phone_shell(ax3, '(c) Mobile Field Triage\n(Work-Order Verification Stepper)')

    # Top App Bar
    app_bar3 = FancyBboxPatch((12, sh - 68), sw - 24, 40, boxstyle='square,pad=0',
                              facecolor='#1E293B', edgecolor='none', zorder=3)
    ax3.add_patch(app_bar3)
    ax3.text(26, sh - 46, '< Incident #INF-8042', fontsize=9.2, fontweight='bold', color='#F8FAFC', zorder=4)
    ax3.text(26, sh - 60, 'Field Dispatch & Verification', fontsize=6.8, color='#94A3B8', zorder=4)
    ax3.text(sw - 26, sh - 52, 'HIGH PRIORITY', fontsize=6.2, fontweight='bold', color='white',
             ha='right', bbox=dict(boxstyle='round,pad=0.2', fc='#DC2626', ec='none'), zorder=4)

    # Photo Evidence Card (Miniature with AI overlay)
    photo_box = FancyBboxPatch((22, sh - 170), sw - 44, 90, boxstyle='round,pad=0,rounding_size=6',
                               facecolor='#334155', edgecolor='none', zorder=3)
    ax3.add_patch(photo_box)
    ax3.imshow(cam_rgb[100:280, 40:220], extent=[22, sw-22, sh-170, sh-80], zorder=4)
    ax3.text(sw - 28, sh - 90, 'AI Segmented Mask', fontsize=6.2, fontweight='bold', color='#00E5FF',
             ha='right', bbox=dict(boxstyle='round,pad=0.2', fc='#0F172A', ec='none', alpha=0.8), zorder=5)

    # Severity Metric Card
    sev_card = FancyBboxPatch((22, sh - 225), sw - 44, 48, boxstyle='round,pad=0,rounding_size=6',
                              facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.0, zorder=3)
    ax3.add_patch(sev_card)
    ax3.text(32, sh - 192, 'SEVERITY SCORE: 9.4 / 10', fontsize=7.8, fontweight='bold', color='#DC2626', zorder=4)
    ax3.text(sw - 32, sh - 192, 'CRITICAL', fontsize=7.0, fontweight='bold', color='#DC2626', ha='right', zorder=4)

    # Severity Progress Bar
    ax3.add_patch(FancyBboxPatch((32, sh - 212), sw - 64, 8, boxstyle='round,pad=0,rounding_size=4',
                                facecolor='#E2E8F0', edgecolor='none', zorder=4))
    ax3.add_patch(FancyBboxPatch((32, sh - 212), (sw - 64)*0.94, 8, boxstyle='round,pad=0,rounding_size=4',
                                facecolor='#DC2626', edgecolor='none', zorder=5))

    # Defect Meta Details
    det_card = FancyBboxPatch((22, sh - 335), sw - 44, 102, boxstyle='round,pad=0,rounding_size=6',
                              facecolor='#FFFFFF', edgecolor='#CBD5E1', linewidth=1.0, zorder=3)
    ax3.add_patch(det_card)
    ax3.text(32, sh - 245, 'Defect Details', fontsize=7.6, fontweight='bold', color='#0F172A', zorder=4)
    ax3.text(32, sh - 262, 'Type: Severe Asphalt Pothole Cavity', fontsize=6.8, color='#334155', zorder=4)
    ax3.text(32, sh - 278, 'Surface Area: 5.8% (Est. Depth > 12cm)', fontsize=6.8, color='#334155', zorder=4)
    ax3.text(32, sh - 294, 'Location: Anna Salai, Ch-02 (GPS Validated)', fontsize=6.8, color='#334155', zorder=4)
    ax3.text(32, sh - 310, 'Assigned Crew: PWD Rapid Response #3', fontsize=6.8, color='#0284C7', fontweight='bold', zorder=4)
    ax3.text(32, sh - 326, 'Citizen Upvotes: 3 (Confidence: 89.1%)', fontsize=6.8, color='#059669', zorder=4)

    # Status Workflow Stepper
    step_card = FancyBboxPatch((22, sh - 410), sw - 44, 68, boxstyle='round,pad=0,rounding_size=6',
                               facecolor='#F8FAFC', edgecolor='#E2E8F0', linewidth=1.0, zorder=3)
    ax3.add_patch(step_card)
    ax3.text(32, sh - 355, 'Operational Status Stepper', fontsize=7.4, fontweight='bold', color='#0F172A', zorder=4)

    # 4 Stepper Nodes
    step_x = [45, 110, 180, 245]
    step_labels = ['Reported', 'Verified', 'Dispatched', 'Resolved']
    step_done = [True, True, True, False]
    # Stepper line
    ax3.plot([45, 245], [sh - 380, sh - 380], color='#CBD5E1', lw=2.0, zorder=4)
    ax3.plot([45, 180], [sh - 380, sh - 380], color='#0284C7', lw=2.2, zorder=5)

    for sx, slbl, sdone in zip(step_x, step_labels, step_done):
        col = '#0284C7' if sdone else '#94A3B8'
        ax3.add_patch(Circle((sx, sh - 380), 5.5, facecolor=col, edgecolor='white', lw=1.4, zorder=6))
        ax3.text(sx, sh - 396, slbl, fontsize=5.8, fontweight='bold',
                 color='#0F172A' if sdone else '#94A3B8', ha='center', zorder=6)

    # Action Buttons
    btn_resolve = FancyBboxPatch((22, 38), sw - 44, 28, boxstyle='round,pad=0,rounding_size=6',
                                 facecolor='#16A34A', edgecolor='none', zorder=4)
    ax3.add_patch(btn_resolve)
    ax3.text(sw/2, 52, 'Capture Repair Proof & Resolve', fontsize=7.6, fontweight='bold',
             color='white', ha='center', va='center', zorder=5)

    btn_reassign = FancyBboxPatch((22, 72), sw - 44, 24, boxstyle='round,pad=0,rounding_size=6',
                                  facecolor='#0284C7', edgecolor='none', zorder=4)
    ax3.add_patch(btn_reassign)
    ax3.text(sw/2, 84, 'Reassign / Dispatch Crew', fontsize=7.2, fontweight='bold',
             color='white', ha='center', va='center', zorder=5)

    plt.tight_layout()
    plt.savefig(os.path.join(OUT_DIR, 'fig5_admin_map.png'), dpi=300, bbox_inches='tight')
    plt.savefig(os.path.join(BASE_DIR, 'fig5_admin_map.png'), dpi=300, bbox_inches='tight')
    plt.close()
    print('[OK] Generated mobile-only fig5_admin_map.png')

if __name__ == '__main__':
    generate_fig1_arch()
    generate_fig5_mobile_ui()
