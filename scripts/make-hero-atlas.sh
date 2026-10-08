#!/usr/bin/env bash
# Packs the hero clips into one 4x2 grid video, public/hero/atlas.mp4, plus a
# frame-0 poster. The hero decodes this single file and every tile paints its
# own cell onto a canvas; see "Hero video tiles" in docs/DESIGN.md for why.
#
# Usage: scripts/make-hero-atlas.sh clip1.mp4 ... clip7.mp4   (at most 8)
# Order matters: it must match CLIPS in src/components/home/hero-carousel.tsx.
# Needs ffmpeg 5 or newer (for xstack and rotation-aware decoding). The
# imageio-ffmpeg pip package ships one: FFMPEG="$(python -c 'import
# imageio_ffmpeg as f; print(f.get_ffmpeg_exe())')".
set -euo pipefail

FFMPEG="${FFMPEG:-ffmpeg}"
OUT="$(dirname "$0")/../public/hero"
CRF="${CRF:-23}" # 23 is indistinguishable from the WhatsApp sources
CELL_W=480 # Tile aspect is 776 x 1100; 480 x 680 matches it.
CELL_H=680
COLS=4

[ "$#" -ge 1 ] && [ "$#" -le 8 ] || { echo "pass 1 to 8 clips" >&2; exit 1; }

inputs=() chains="" stack="" layout=""
longest=0
for i in $(seq 0 $(($# - 1))); do
  clip="${@:$((i + 1)):1}"
  inputs+=(-stream_loop -1 -i "$clip")
  dur="$({ "$FFMPEG" -i "$clip" 2>&1 || true; } | sed -n 's/.*Duration: \([0-9:.]*\).*/\1/p' | awk -F: '{print $1*3600+$2*60+$3}')"
  longest="$(awk -v a="$longest" -v b="$dur" 'BEGIN{print (b>a)?b:a}')"
  chains+="[$i:v]fps=30,scale=${CELL_W}:${CELL_H}:force_original_aspect_ratio=increase,crop=${CELL_W}:${CELL_H},setsar=1,hqdn3d=1.5:1.5:6:6[c$i];"
  stack+="[c$i]"
  layout+="$(( (i % COLS) * CELL_W ))_$(( (i / COLS) * CELL_H ))|"
done

# The atlas runs as long as the longest clip; shorter clips loop inside it.
"$FFMPEG" -v error -y "${inputs[@]}" \
  -filter_complex "${chains}${stack}xstack=inputs=$#:layout=${layout%|}:fill=black,pad=$((COLS * CELL_W)):$((2 * CELL_H)):0:0:black[out]" \
  -map "[out]" -t "$longest" -an \
  -c:v libx264 -preset slow -crf "$CRF" -profile:v high -pix_fmt yuv420p -g 60 \
  -movflags +faststart "$OUT/atlas.mp4"

"$FFMPEG" -v error -y -i "$OUT/atlas.mp4" -frames:v 1 -q:v 3 "$OUT/atlas.jpg"
echo "wrote $OUT/atlas.mp4 ($longest s) and atlas.jpg"
