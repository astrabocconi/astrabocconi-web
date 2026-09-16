import { useMemo, type CSSProperties } from "react";

type EffectMode = "dark" | "light";
type FocusRole = "background" | "ui";

type FocusTarget = {
  selector: string;
  role: FocusRole;
  width?: string;
};

export type WovenClothProps = {
  mode?: EffectMode;
  hue?: number;
  saturation?: number;
  brightness?: number;
  className?: string;
  style?: CSSProperties;
};

export const WOVEN_CLOTH_DEFAULTS = {
  hue: 0,
  saturation: 1,
  brightness: 1,
} as const;

const WOVEN_CLOTH_TITLE = "ASTRA kinetic banner";
// Adapted from the authored #16090b to the ASTRA deep blue.
const WOVEN_CLOTH_BACKGROUND = "#020a52";
const WOVEN_CLOTH_TARGETS: readonly FocusTarget[] = [
  {
    selector: "body > div.fixed.inset-0.overflow-hidden.z-0",
    role: "background",
  },
];

// Self-contained HTML/Three.js document. Structure and physics are verbatim
// from the supplied source; the palette and the cloth lettering are swapped to
// ASTRA's, and the external aura image and icon font are dropped so the frame
// has no third party dependencies beyond three.js itself.
const luminaWeaversClothSource = `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>ASTRA Bocconi</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
</head>
<body class="text-white overflow-hidden antialiased selection:bg-[#3b4ad0] selection:text-white font-sans" style="background: radial-gradient(120% 100% at 50% 30%, #0a1a9e 0%, #04107e 55%, #020a52 100%); height: 100dvh; width: 100vw;">

    <!-- Stage / Background -->
    <div class="fixed inset-0 overflow-hidden z-0">
        <canvas id="cloth" class="absolute inset-0 w-full h-full block pointer-events-none"></canvas>
        <div class="absolute inset-0 pointer-events-none" style="background: radial-gradient(90% 80% at 50% 46%, transparent 55%, rgba(2,10,82,.72) 100%);"></div>
    </div>

    <!-- UI Overlay -->
    <div class="absolute inset-0 z-10 flex flex-col p-6 md:p-12 pointer-events-none font-sans">

        <!-- Header -->
        <header class="flex justify-between items-center w-full pointer-events-auto">
            <div class="overflow-hidden">
                <div class="reveal-item opacity-0 translate-y-8 text-xs tracking-[0.28em] uppercase text-[#a9b0d8] font-medium">
                    Est. 1990 &middot; Milano, Italia
                </div>
            </div>
            <nav class="hidden md:flex gap-8">
                <div class="overflow-hidden">
                    <a href="#dispense" class="reveal-item block opacity-0 translate-y-8 text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors duration-300">Dispense</a>
                </div>
                <div class="overflow-hidden">
                    <a href="#partner" class="reveal-item block opacity-0 translate-y-8 text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors duration-300">Partner</a>
                </div>
                <div class="overflow-hidden">
                    <a href="#associazione" class="reveal-item block opacity-0 translate-y-8 text-xs tracking-widest uppercase text-white/80 hover:text-white transition-colors duration-300">L'associazione</a>
                </div>
            </nav>
        </header>

        <!-- Footer / Content -->
        <div class="mt-auto flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 pointer-events-auto w-full">

            <div class="max-w-md space-y-6">
                <div>
                    <p class="word-reveal text-sm md:text-base leading-relaxed text-white/90">
                        <strong class="text-white font-semibold block mb-1 text-base md:text-lg tracking-tight">La rete studentesca di Bocconi.</strong>
                        Dispense, guide e calcolatori costruiti dagli studenti, per gli studenti.
                    </p>
                </div>

                <div class="overflow-hidden pt-2">
                    <div class="reveal-item opacity-0 translate-y-8 inline-block rounded-sm p-[1px] bg-gradient-to-b from-white/30 via-[#3b4ad0]/30 to-[#020a52]/10 shadow-[0_10px_30px_rgba(2,10,82,0.4)] transition-transform duration-300 hover:-translate-y-0.5 group">
                        <a href="#unisciti" class="flex items-center gap-3 bg-[#3b4ad0] group-hover:bg-[#04107e] text-white px-6 py-3 rounded-[1px] text-sm font-semibold tracking-wide transition-colors relative overflow-hidden">
                            <span class="relative z-10">Unisciti ad ASTRA</span>
                            <svg class="relative z-10 transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                        </a>
                    </div>
                </div>
            </div>

            <div class="text-left sm:text-right mt-8 sm:mt-0">
                <div class="word-reveal text-xs tracking-[0.24em] uppercase text-[#a9b0d8] leading-[1.9] font-medium">
                    Universit&agrave; Bocconi<br>
                    Via Sarfatti 25<br>
                    Milano &middot; 20136
                </div>
            </div>

        </div>
    </div>

    <script>
        // --- GSAP Animation ---
        document.addEventListener("DOMContentLoaded", () => {
            gsap.registerPlugin(ScrollTrigger);

            // Standard reveals
            gsap.to(".reveal-item", {
                y: 0,
                opacity: 1,
                duration: 1.2,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.2
            });

            // Masked Word Reveal implementation
            document.querySelectorAll('.word-reveal').forEach(node => {
                function wrapWords(el) {
                    const childNodes = Array.from(el.childNodes);
                    childNodes.forEach(child => {
                        if (child.nodeType === 3) {
                            const words = child.nodeValue.split(/(\\s+)/);
                            const fragment = document.createDocumentFragment();
                            words.forEach(word => {
                                if (word.trim().length > 0) {
                                    const wrapper = document.createElement('span');
                                    wrapper.className = 'inline-flex overflow-hidden pb-1 -mb-1';
                                    const inner = document.createElement('span');
                                    inner.className = 'word-anim translate-y-[110%] opacity-0 inline-block';
                                    inner.textContent = word;
                                    wrapper.appendChild(inner);
                                    fragment.appendChild(wrapper);
                                } else {
                                    fragment.appendChild(document.createTextNode(word));
                                }
                            });
                            el.replaceChild(fragment, child);
                        } else if (child.nodeType === 1) {
                            wrapWords(child);
                        }
                    });
                }
                wrapWords(node);

                // ScrollTrigger staggered reveal
                gsap.to(node.querySelectorAll('.word-anim'), {
                    y: 0,
                    opacity: 1,
                    duration: 0.9,
                    stagger: 0.02,
                    ease: "power4.out",
                    delay: 0.3,
                    scrollTrigger: {
                        trigger: node,
                        start: "top 95%",
                    }
                });
            });
        });

        // --- ASTRA wordmark, inlined from brand/vectors/1.svg ---
        const LOGO_W = 319.3, LOGO_H = 62.9;
        const ASTRA_LOGO_SRC = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="28.2 155.9 319.3 62.9"><path fill="#04107e" d="M 59.425781 156.199219 C 59.195312 156.253906 58.960938 156.398438 58.785156 156.59375 C 58.644531 156.746094 58.394531 157.207031 57.464844 159.023438 C 55.773438 162.335938 49.527344 174.527344 45.003906 183.355469 C 42.824219 187.609375 40.9375 191.296875 40.816406 191.550781 C 40.554688 192.078125 40.496094 192.34375 40.554688 192.679688 C 40.613281 193.003906 40.804688 193.355469 41.050781 193.578125 C 41.765625 194.242188 42.753906 194.175781 43.21875 193.433594 C 43.273438 193.34375 44.414062 191.128906 45.75 188.515625 C 48.382812 183.363281 52.199219 175.917969 52.515625 175.3125 C 52.625 175.105469 52.722656 174.945312 52.738281 174.960938 C 52.761719 174.984375 68.300781 214.777344 68.339844 214.910156 C 68.355469 214.96875 68.300781 214.972656 67.535156 214.972656 C 67.085938 214.972656 66.625 214.988281 66.511719 215.003906 C 66.039062 215.082031 65.695312 215.347656 65.480469 215.800781 C 65.371094 216.035156 65.351562 216.105469 65.339844 216.410156 C 65.320312 216.804688 65.363281 217.035156 65.511719 217.320312 C 65.691406 217.671875 65.933594 217.882812 66.28125 217.992188 C 66.488281 218.058594 66.757812 218.058594 76.230469 218.058594 C 85.777344 218.058594 85.96875 218.058594 86.160156 217.992188 C 86.742188 217.785156 87.097656 217.230469 87.09375 216.527344 C 87.089844 215.824219 86.761719 215.300781 86.183594 215.070312 C 85.988281 214.996094 85.929688 214.992188 84.851562 214.980469 L 83.71875 214.964844 L 83.546875 214.519531 C 83.453125 214.277344 78.445312 201.445312 72.417969 186.003906 C 66.394531 170.566406 61.386719 157.730469 61.292969 157.484375 C 61.199219 157.238281 61.074219 156.96875 61.015625 156.882812 C 60.660156 156.367188 59.976562 156.070312 59.425781 156.199219 M 114.230469 156.199219 C 110.914062 156.3125 107.582031 156.765625 104.839844 157.480469 C 100.761719 158.546875 97.15625 160.257812 94.613281 162.332031 C 94.097656 162.757812 93.089844 163.742188 92.695312 164.214844 C 90.59375 166.730469 89.457031 169.578125 89.0625 173.335938 C 88.972656 174.1875 88.972656 176.867188 89.0625 177.6875 C 89.355469 180.367188 89.976562 182.382812 91.085938 184.246094 C 92.351562 186.375 94.761719 188.648438 97.457031 190.261719 C 98.132812 190.667969 99.46875 191.324219 100.226562 191.625 C 103.0625 192.75 108.175781 194.15625 113.542969 195.285156 C 117.585938 196.136719 120.125 196.8125 121.84375 197.496094 C 123.175781 198.027344 124.011719 198.699219 124.421875 199.578125 C 124.652344 200.066406 124.746094 200.738281 124.667969 201.355469 C 124.617188 201.800781 124.546875 202.046875 124.371094 202.425781 C 123.902344 203.421875 123.117188 203.941406 121.425781 204.375 C 119.117188 204.964844 115.375 205.097656 112.632812 204.6875 C 111.078125 204.453125 109.6875 203.984375 108.746094 203.371094 C 108.371094 203.128906 107.800781 202.566406 107.554688 202.199219 C 107.0625 201.464844 106.695312 200.460938 106.523438 199.375 C 106.453125 198.917969 106.386719 198.113281 106.386719 197.679688 L 106.386719 197.25 L 87.988281 197.25 L 88.011719 198.128906 C 88.117188 201.976562 88.789062 205.066406 90.105469 207.761719 C 91.433594 210.476562 93.414062 212.613281 96.050781 214.171875 C 100.433594 216.757812 106.285156 218.269531 113.542969 218.691406 C 115.460938 218.800781 118.746094 218.835938 120.296875 218.761719 C 127.035156 218.4375 132.347656 216.914062 136.660156 214.070312 C 138.242188 213.027344 139.554688 211.84375 140.640625 210.492188 C 142.640625 207.992188 143.882812 204.902344 144.351562 201.25 C 144.984375 196.292969 144.21875 192.117188 142.125 189.09375 C 141.269531 187.859375 139.78125 186.394531 138.175781 185.210938 C 136.363281 183.867188 134.535156 182.941406 132.125 182.140625 C 128.949219 181.089844 125.113281 180.121094 120.070312 179.09375 C 115.695312 178.199219 112.597656 177.339844 111.121094 176.601562 C 109.851562 175.96875 109.089844 175.054688 108.894531 173.925781 C 108.714844 172.890625 109 172.054688 109.796875 171.300781 C 110.992188 170.171875 112.878906 169.546875 115.597656 169.386719 C 116.355469 169.34375 117.875 169.363281 118.402344 169.421875 C 120.5625 169.675781 121.988281 170.292969 123.089844 171.453125 C 124.128906 172.542969 124.628906 173.765625 124.691406 175.347656 L 124.710938 175.882812 L 142.925781 175.882812 L 142.898438 174.960938 C 142.839844 172.671875 142.570312 170.996094 141.984375 169.230469 C 140.761719 165.554688 138.382812 162.726562 134.667969 160.523438 C 129.363281 157.378906 122.484375 155.925781 114.230469 156.199219 M 149.789062 164.953125 L 149.789062 172.6875 L 169.652344 172.6875 L 169.652344 217.742188 L 189.089844 217.742188 L 189.089844 172.6875 L 208.917969 172.6875 L 208.917969 157.214844 L 149.789062 157.214844 Z M 217.792969 187.480469 L 217.792969 217.742188 L 237.234375 217.742188 L 237.234375 195.671875 L 240.855469 195.671875 L 244.480469 195.675781 L 249.835938 206.699219 L 255.191406 217.726562 L 266.089844 217.734375 C 272.085938 217.738281 276.988281 217.734375 276.988281 217.726562 C 276.988281 217.71875 273.980469 212.046875 270.300781 205.121094 C 268.050781 200.90625 265.8125 196.691406 263.582031 192.476562 C 263.558594 192.425781 263.640625 192.382812 264.105469 192.199219 C 268.476562 190.457031 271.578125 187.636719 273.5 183.652344 C 274.914062 180.722656 275.46875 177.558594 275.179688 174.039062 C 274.980469 171.597656 274.34375 169.320312 273.246094 167.128906 C 272.378906 165.394531 271.527344 164.207031 270.183594 162.859375 C 269.042969 161.71875 268.117188 160.996094 266.671875 160.125 C 266.066406 159.761719 264.664062 159.066406 264.007812 158.808594 C 261.632812 157.871094 259.09375 157.375 256.042969 157.25 C 255.492188 157.226562 248.445312 157.214844 236.488281 157.214844 L 217.792969 157.214844 Z M 302.730469 157.246094 C 302.703125 157.292969 280.675781 217.679688 280.675781 217.714844 C 280.675781 217.730469 285.140625 217.742188 290.597656 217.742188 L 300.523438 217.742188 L 301.761719 213.59375 C 302.445312 211.3125 303.019531 209.394531 303.039062 209.332031 L 303.074219 209.214844 L 324.289062 209.214844 L 324.367188 209.472656 C 324.40625 209.609375 324.980469 211.523438 325.640625 213.726562 L 326.835938 217.726562 L 337.125 217.734375 L 347.410156 217.742188 L 347.277344 217.367188 C 347.203125 217.160156 342.257812 203.605469 336.289062 187.25 C 330.320312 170.894531 325.417969 157.445312 325.386719 157.363281 L 325.335938 157.214844 L 314.042969 157.214844 C 307.789062 157.214844 302.742188 157.226562 302.730469 157.246094 M 237.234375 176.636719 L 237.234375 182.234375 L 243.644531 182.230469 C 247.488281 182.230469 250.222656 182.21875 250.46875 182.199219 C 251.21875 182.136719 251.753906 181.988281 252.410156 181.667969 C 253.445312 181.164062 254.386719 180.207031 254.910156 179.136719 C 255.554688 177.820312 255.652344 176.023438 255.15625 174.621094 C 254.886719 173.855469 254.492188 173.242188 253.867188 172.617188 C 253.082031 171.832031 252.269531 171.382812 251.207031 171.136719 L 250.867188 171.058594 L 244.050781 171.046875 L 237.234375 171.039062 Z M 313.535156 174.136719 C 313.453125 174.367188 307.128906 195.648438 307.140625 195.65625 C 307.148438 195.664062 310.097656 195.667969 313.699219 195.664062 L 320.242188 195.65625 L 317.128906 185.058594 C 315.414062 179.230469 313.988281 174.378906 313.957031 174.277344 L 313.898438 174.09375 L 313.726562 174.09375 C 313.617188 174.09375 313.542969 174.109375 313.535156 174.136719 M 38.367188 197.027344 C 38.316406 197.769531 38.101562 198.789062 37.820312 199.636719 C 36.695312 203.03125 34.058594 205.671875 30.734375 206.742188 C 30.042969 206.964844 29.503906 207.074219 28.398438 207.210938 L 28.152344 207.242188 L 28.347656 207.246094 C 28.453125 207.25 28.738281 207.277344 28.980469 207.304688 C 32.589844 207.75 35.738281 209.824219 37.5 212.925781 C 38.15625 214.078125 38.628906 215.527344 38.769531 216.796875 C 38.792969 217 38.824219 217.21875 38.839844 217.285156 C 38.863281 217.402344 38.867188 217.402344 38.871094 217.226562 C 38.875 216.976562 38.964844 216.292969 39.050781 215.847656 C 39.597656 213.050781 41.128906 210.585938 43.382812 208.902344 C 44.535156 208.039062 45.804688 207.4375 47.207031 207.089844 C 47.734375 206.960938 48.535156 206.832031 48.820312 206.828125 C 49.101562 206.828125 48.933594 206.773438 48.570312 206.746094 C 47.101562 206.640625 45.316406 206.078125 43.941406 205.285156 C 41.007812 203.601562 38.996094 200.710938 38.523438 197.511719 C 38.484375 197.242188 38.453125 196.957031 38.453125 196.875 C 38.453125 196.589844 38.390625 196.695312 38.367188 197.027344"/></svg>'
        );

        // --- Three.js Cloth Simulation ---
        (() => {
            const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
            const canvas = document.getElementById('cloth');
            if (!window.THREE) return;

            // Generate Woven Texture
            function makeClothTexture() {
                const W = 1280, H = 492;
                const c = document.createElement('canvas');
                c.width = W;
                c.height = H;
                const x = c.getContext('2d');

                // White ground gradient, tinted toward the ASTRA light shade
                const g = x.createLinearGradient(0, 0, 0, H);
                g.addColorStop(0, '#ffffff');
                g.addColorStop(0.5, '#f7f8fc');
                g.addColorStop(1, '#edeff9');
                x.fillStyle = g;
                x.fillRect(0, 0, W, H);

                // ASTRA blue hem border
                x.strokeStyle = '#04107e';
                x.lineWidth = 10;
                x.strokeRect(34, 34, W-68, H-68);
                x.lineWidth = 3;
                x.strokeStyle = '#020a52';
                x.strokeRect(50, 50, W-100, H-100);

                // Weave overlay (Thread grid)
                x.globalAlpha = 1;
                for(let yy=0; yy<H; yy+=3){
                    x.strokeStyle = 'rgba(4,16,126,0.05)';
                    x.lineWidth = 1;
                    x.beginPath(); x.moveTo(0,yy+.5); x.lineTo(W,yy+.5); x.stroke();
                }
                for(let xx=0; xx<W; xx+=3){
                    x.strokeStyle = 'rgba(255,255,255,0.06)';
                    x.lineWidth = 1;
                    x.beginPath(); x.moveTo(xx+.5,0); x.lineTo(xx+.5,H); x.stroke();
                }

                // Fabric Slub Noise
                const id = x.getImageData(0, 0, W, H), d = id.data;
                for(let i=0; i<d.length; i+=4){
                    const n = (Math.random()*2-1)*10;
                    d[i]+=n; d[i+1]+=n; d[i+2]+=n;
                }
                x.putImageData(id, 0, 0);

                const tex = new THREE.CanvasTexture(c);
                tex.anisotropy = 4;
                tex.colorSpace = THREE.SRGBColorSpace;

                // The wordmark is drawn last, after the slub noise, so the
                // getImageData pass above never sees an image. A data: URI does
                // not taint the canvas, so the texture stays readable by WebGL.
                const logo = new Image();
                logo.onload = function () {
                    const lw = W * 0.58;
                    const lh = lw * (LOGO_H / LOGO_W);
                    x.drawImage(logo, (W - lw) / 2, H * 0.42 - lh / 2, lw, lh);

                    x.fillStyle = '#3b4ad0';
                    x.font = '600 20px "Helvetica Neue", Arial, sans-serif';
                    x.textAlign = 'center';
                    x.textBaseline = 'middle';
                    x.fillText('R E T E   S T U D E N T E S C A   ·   B O C C O N I', W / 2, H * 0.72);

                    tex.needsUpdate = true;
                };
                logo.src = ASTRA_LOGO_SRC;

                return tex;
            }

            // Scene Setup
            const scene = new THREE.Scene();
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            let camera;

            const BW = 5.2, BH = 2.0;
            const GX = 40, GY = 26;
            const geo = new THREE.PlaneGeometry(BW, BH, GX, GY);
            const mat = new THREE.MeshPhongMaterial({
                map: makeClothTexture(),
                side: THREE.DoubleSide,
                shininess: 6,
                specular: 0x0a1030,
                color: 0xffffff
            });
            const mesh = new THREE.Mesh(geo, mat);
            scene.add(mesh);

            // Lighting
            scene.add(new THREE.AmbientLight(0xffffff, 0.62));
            const key = new THREE.DirectionalLight(0xffffff, 1.15);
            key.position.set(-3, 3.5, 3.2);
            scene.add(key);
            const rim = new THREE.DirectionalLight(0x3b4ad0, 0.42);
            rim.position.set(3, -1.5, 2.0);
            scene.add(rim);

            // Verlet Physics Data
            const pos = geo.attributes.position;
            const N = (GX + 1) * (GY + 1);
            const cur = new Float32Array(N * 3), prev = new Float32Array(N * 3), rest = new Float32Array(N * 3);
            const pinned = new Uint8Array(N);

            for(let i=0; i<N; i++){
                const ax = pos.getX(i), ay = pos.getY(i), az = 0;
                cur[i*3] = prev[i*3] = rest[i*3] = ax;
                cur[i*3+1] = prev[i*3+1] = rest[i*3+1] = ay;
                cur[i*3+2] = prev[i*3+2] = rest[i*3+2] = az;
            }

            for(let ix=0; ix<=GX; ix++){ pinned[ix] = 1; }
            const idx = (ix, iy) => ix + iy * (GX + 1);

            const restH = BW / GX, restV = BH / GY;
            const GRAV = -3.1, DAMP = 0.985, DT = 0.016;

            function wind(ix, iy, t) {
                const cx = ix / GX, cy = iy / GY;
                const travel = t * 1.7 - cy * 4.2;
                const gust = 0.6 + 0.42 * Math.sin(t * 0.6) + 0.18 * Math.sin(t * 1.9 + 1.3);
                const amp = 4.3 * cy;
                const fz = (Math.sin(travel + cx * 3.3) + 0.5 * Math.sin(travel * 1.7 + cx * 6.0)) * amp * gust;
                const fx = Math.sin(t * 0.9 + cy * 2.2) * 0.6 * cy;
                const fy = -0.4 * cy;
                return [fx, fy, fz];
            }

            function step(t) {
                for(let iy=0; iy<=GY; iy++){
                    for(let ix=0; ix<=GX; ix++){
                        const i = idx(ix, iy);
                        if(pinned[i]) continue;
                        const [fx, fy, fz] = wind(ix, iy, t);
                        for(let k=0; k<3; k++){
                            const j = i * 3 + k;
                            const a = (k===0 ? fx : k===1 ? (fy+GRAV) : fz);
                            const v = (cur[j] - prev[j]) * DAMP;
                            prev[j] = cur[j];
                            cur[j] = cur[j] + v + a * DT * DT;
                        }
                    }
                }

                for(let it=0; it<3; it++){
                    for(let iy=0; iy<=GY; iy++){
                        for(let ix=0; ix<GX; ix++){ solve(idx(ix,iy), idx(ix+1,iy), restH); }
                    }
                    for(let iy=0; iy<GY; iy++){
                        for(let ix=0; ix<=GX; ix++){ solve(idx(ix,iy), idx(ix,iy+1), restV); }
                    }
                }

                for(let ix=0; ix<=GX; ix++){
                    const i = ix;
                    cur[i*3] = rest[i*3]; cur[i*3+1] = rest[i*3+1]; cur[i*3+2] = rest[i*3+2];
                    prev[i*3] = rest[i*3]; prev[i*3+1] = rest[i*3+1]; prev[i*3+2] = rest[i*3+2];
                }
            }

            function solve(a, b, rl) {
                const ax = cur[a*3], ay = cur[a*3+1], az = cur[a*3+2];
                const bx = cur[b*3], by = cur[b*3+1], bz = cur[b*3+2];
                let dx = bx - ax, dy = by - ay, dz = bz - az;
                const d = Math.sqrt(dx*dx + dy*dy + dz*dz) || 1e-6;
                const diff = (d - rl) / d * 0.5;
                dx *= diff; dy *= diff; dz *= diff;

                const pa = pinned[a], pb = pinned[b];
                if(!pa && !pb){
                    cur[a*3]+=dx; cur[a*3+1]+=dy; cur[a*3+2]+=dz;
                    cur[b*3]-=dx; cur[b*3+1]-=dy; cur[b*3+2]-=dz;
                }
                else if(pa && !pb){ cur[b*3]-=dx*2; cur[b*3+1]-=dy*2; cur[b*3+2]-=dz*2; }
                else if(!pa && pb){ cur[a*3]+=dx*2; cur[a*3+1]+=dy*2; cur[a*3+2]+=dz*2; }
            }

            function commit() {
                for(let i=0; i<N; i++){ pos.setXYZ(i, cur[i*3], cur[i*3+1], cur[i*3+2]); }
                pos.needsUpdate = true;
                geo.computeVertexNormals();
            }

            function fit() {
                const w = window.innerWidth, h = window.innerHeight;
                renderer.setSize(w, h, false);
                const aspect = w / h;
                camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
                const vFit = (BH/2) / Math.tan(42 * Math.PI / 360);
                const hFit = (BW/2) / Math.tan(42 * Math.PI / 360) / aspect;
                camera.position.set(0, 0.05, Math.max(vFit, hFit) * 1.16 + 0.4);
                camera.lookAt(0, 0, 0);
            }

            window.addEventListener('resize', fit);
            fit();

            let running = false, raf = 0, t = 0;
            function loop() {
                if(!running) return;
                t += DT;
                step(t);
                commit();
                renderer.render(scene, camera);
                raf = requestAnimationFrame(loop);
            }

            function start() { if(running)return; running=true; raf=requestAnimationFrame(loop); }
            function stop() { running=false; cancelAnimationFrame(raf); }

            if(reduce) {
                for(let s=0; s<220; s++) step(s*DT);
                commit();
                renderer.render(scene, camera);
            } else {
                for(let s=0; s<40; s++) step(s*DT);
                t = 40 * DT;
                start();
                document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());
            }
        })();
    </script>
</body>
</html>`;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function buildFocusedDocument(mode: EffectMode) {
  const targetJson = JSON.stringify(WOVEN_CLOTH_TARGETS).replace(
    /</g,
    "\\u003c",
  );
  const background = WOVEN_CLOTH_BACKGROUND;
  const focusStyle = `<style data-threeui-focus>
html, body { width: 100% !important; height: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; background: ${background} !important; }
body { position: relative !important; display: flex !important; align-items: center !important; justify-content: center !important; }
body > * { visibility: hidden !important; }
body[data-threeui-ready] > [data-threeui-role] { visibility: visible !important; }
[data-threeui-residual] { display: none !important; }
[data-threeui-role="background"] { position: fixed !important; inset: 0 !important; width: 100% !important; height: 100% !important; max-width: none !important; max-height: none !important; z-index: 0 !important; opacity: 1 !important; pointer-events: none !important; }
[data-threeui-role="ui"] { position: relative !important; z-index: 1 !important; width: min(calc(100% - 32px), var(--threeui-target-width, 1040px)) !important; max-width: none !important; max-height: calc(100% - 32px) !important; margin: auto !important; overflow: auto !important; opacity: 1 !important; transform: none !important; filter: none !important; flex: none !important; box-sizing: border-box !important; }
</style>`;
  const focusScript = `<script data-threeui-focus>
(function () {
  var isolated = false;
  function isolate() {
    if (isolated) return;
    var specs = ${targetJson};
    var roots = [];
    specs.forEach(function (spec) {
      var element = document.querySelector(spec.selector);
      if (!element) return;
      element.setAttribute('data-threeui-role', spec.role);
      if (spec.width) element.style.setProperty('--threeui-target-width', spec.width);
      if (!roots.some(function (root) { return root.contains(element); })) roots.push(element);
    });
    if (!roots.length) return;
    isolated = true;
    roots.forEach(function (root) { document.body.appendChild(root); });
    Array.from(document.body.children).forEach(function (element) {
      if (roots.indexOf(element) !== -1) return;
      element.setAttribute('data-threeui-residual', '');
      element.setAttribute('aria-hidden', 'true');
      if ('inert' in element) element.inert = true;
    });
    document.body.setAttribute('data-threeui-ready', '');
    requestAnimationFrame(function () { window.dispatchEvent(new Event('resize')); });
  }
  function scheduleIsolation() { setTimeout(isolate, 100); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleIsolation, { once: true });
  else scheduleIsolation();
  window.addEventListener('load', isolate, { once: true });
})();
</script>`;
  return luminaWeaversClothSource
    .replace(/<\/head>/i, `${focusStyle}</head>`)
    .replace(/<\/body>/i, `${focusScript}</body>`);
}

function WovenCloth({
  mode = "dark",
  hue = WOVEN_CLOTH_DEFAULTS.hue,
  saturation = WOVEN_CLOTH_DEFAULTS.saturation,
  brightness = WOVEN_CLOTH_DEFAULTS.brightness,
  className,
  style,
}: WovenClothProps) {
  const safeMode: EffectMode = mode === "light" ? "light" : "dark";
  const source = useMemo(() => buildFocusedDocument(safeMode), [safeMode]);
  const safeHue = clamp(hue, -180, 180);
  const safeSaturation = clamp(saturation, 0, 2);
  const safeBrightness = clamp(brightness, 0.35, 1.65);
  const filter =
    safeHue === 0 && safeSaturation === 1 && safeBrightness === 1
      ? undefined
      : `hue-rotate(${safeHue}deg) saturate(${safeSaturation}) brightness(${safeBrightness})`;

  return (
    <iframe
      className={className}
      data-mode={safeMode}
      title={WOVEN_CLOTH_TITLE}
      srcDoc={source}
      sandbox="allow-scripts"
      loading="eager"
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        border: 0,
        background: WOVEN_CLOTH_BACKGROUND,
        filter,
        ...style,
      }}
    />
  );
}

export default WovenCloth;
