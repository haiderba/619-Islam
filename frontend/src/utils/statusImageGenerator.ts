// Ultra-High-Definition Landscape Card PNG Generator for 619 Islam Daily Ayah
export interface AyahData {
  surahNumber: number;
  ayahNumber: number;
  surahNameEnglish: string;
  surahNameArabic: string;
  arabicText: string;
  englishTranslation: string;
  theme?: string;
  audioUrl?: string;
}

// Helper to wrap text onto canvas lines
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  align: CanvasTextAlign = 'center'
): number {
  ctx.textAlign = align;
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

export async function generateAyahStatusImage(ayah: AyahData): Promise<string> {
  // Ultra-High Definition 2x Landscape Card (1600 x 1050 px - matching the dashboard card aspect ratio)
  const width = 1600;
  const height = 1050;
  const cardPadding = 40;
  const cardRadius = 48;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Transparent / dark outer canvas
  ctx.clearRect(0, 0, width, height);

  // 2. Draw Rounded Card Container Path
  const cardX = cardPadding;
  const cardY = cardPadding;
  const cardW = width - cardPadding * 2;
  const cardH = height - cardPadding * 2;

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.clip(); // Clip everything to inside the rounded card

  // 3. Rich Deep Emerald Gradient Background
  const bgGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  bgGrad.addColorStop(0, '#041e20');
  bgGrad.addColorStop(0.35, '#072e31');
  bgGrad.addColorStop(0.7, '#0a3a3d');
  bgGrad.addColorStop(1, '#03191a');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // 4. Ambient Radial Glows (Amber top-right & Teal bottom-left)
  const glowTopRight = ctx.createRadialGradient(cardX + cardW - 100, cardY + 100, 20, cardX + cardW - 100, cardY + 100, 450);
  glowTopRight.addColorStop(0, 'rgba(245, 158, 11, 0.18)');
  glowTopRight.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowTopRight;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  const glowBottomLeft = ctx.createRadialGradient(cardX + 100, cardY + cardH - 100, 20, cardX + 100, cardY + cardH - 100, 500);
  glowBottomLeft.addColorStop(0, 'rgba(13, 148, 136, 0.22)');
  glowBottomLeft.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowBottomLeft;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  ctx.restore(); // Exit clip

  // 5. Golden Glowing Border Around Card
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, cardRadius);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
  ctx.lineWidth = 3.5;
  ctx.shadowColor = 'rgba(245, 158, 11, 0.3)';
  ctx.shadowBlur = 16;
  ctx.stroke();
  ctx.restore();

  // 6. Header Section: Logo + Title on Left, Badge on Right
  const headerY = cardY + 45;
  const headerLeftX = cardX + 50;

  // Load & Draw 619 Logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      logoImg.onload = () => resolve();
      logoImg.onerror = () => resolve();
      logoImg.src = '/logo.png';
    });
    if (logoImg.complete && logoImg.naturalWidth > 0) {
      const logoSize = 82;
      ctx.drawImage(logoImg, headerLeftX, headerY - 5, logoSize, logoSize);
    }
  } catch (_) {}

  // Header Title & Subtitle beside logo
  ctx.textAlign = 'left';
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('✨ AYAH OF THE DAY', headerLeftX + 100, headerY + 30);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = '500 20px sans-serif';
  ctx.fillText('3 Daily Inspiring Verses', headerLeftX + 100, headerY + 62);

  // Header Right Pill Badge: '619 ISLAM'
  const badgeRightX = cardX + cardW - 50;
  const appBadgeText = '619 ISLAM APP';
  ctx.font = 'bold 18px sans-serif';
  const appBadgeW = ctx.measureText(appBadgeText).width + 36;
  const appBadgeH = 44;
  const appBadgeX = badgeRightX - appBadgeW;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.roundRect(appBadgeX, headerY + 10, appBadgeW, appBadgeH, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f59e0b';
  ctx.fillText(appBadgeText, appBadgeX + appBadgeW / 2, headerY + 38);

  // Header Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cardX + 50, headerY + 95);
  ctx.lineTo(cardX + cardW - 50, headerY + 95);
  ctx.stroke();

  // 7. Central Main Arabic Calligraphy
  const centerX = width / 2;
  const arabicStartY = headerY + 220;

  ctx.fillStyle = '#fef3c7';
  ctx.font = 'bold 54px "Amiri", "Traditional Arabic", "Scheherazade New", "Lateef", serif';
  ctx.shadowColor = 'rgba(245, 158, 11, 0.45)';
  ctx.shadowBlur = 18;

  let nextY = wrapText(ctx, ayah.arabicText, centerX, arabicStartY, cardW - 160, 92, 'center');

  ctx.shadowBlur = 0; // reset shadow

  // 8. English Translation in Italic Quotes
  nextY = Math.max(nextY + 45, headerY + 460);
  ctx.fillStyle = '#f1f5f9';
  ctx.font = 'italic 500 32px sans-serif';
  const cleanTranslation = `"${ayah.englishTranslation.replace(/^"|"$/g, '')}"`;
  nextY = wrapText(ctx, cleanTranslation, centerX, nextY, cardW - 180, 52, 'center');

  // 9. Bottom Footer Bar: Surah Reference Badge on Left, Watermark on Right
  const footerY = cardY + cardH - 55;

  // Surah Badge Pill
  const surahBadgeText = `📖 Surah ${ayah.surahNameEnglish} • ${ayah.surahNumber}:${ayah.ayahNumber}`;
  ctx.font = 'bold 22px sans-serif';
  const surahBadgeW = ctx.measureText(surahBadgeText).width + 44;
  const surahBadgeH = 50;
  const surahBadgeX = cardX + 50;

  ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
  ctx.beginPath();
  ctx.roundRect(surahBadgeX, footerY - 38, surahBadgeW, surahBadgeH, 25);
  ctx.fill();
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fbbf24';
  ctx.fillText(surahBadgeText, surahBadgeX + surahBadgeW / 2, footerY - 5);

  // Footer Right Arabic Surah Name
  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = 'bold 22px "Amiri", "Traditional Arabic", serif';
  ctx.fillText(`${ayah.surahNameArabic}`, cardX + cardW - 55, footerY - 5);

  return canvas.toDataURL('image/png');
}

// Download triggering helper
export async function downloadStatusCard(ayah: AyahData) {
  const dataUrl = await generateAyahStatusImage(ayah);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `619_Islam_Ayah_${ayah.surahNumber}_${ayah.ayahNumber}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Share status card (uses Web Share API on mobile if supported, or downloads image)
export async function shareStatusCard(ayah: AyahData) {
  const dataUrl = await generateAyahStatusImage(ayah);
  
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `619_Islam_Ayah.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Ayah of the Day - Surah ${ayah.surahNameEnglish}`,
          text: `"${ayah.englishTranslation}" — Surah ${ayah.surahNameEnglish} (${ayah.surahNumber}:${ayah.ayahNumber}) via 619 Islam App`,
        });
        return;
      }
    } catch (e) {
      console.warn('Native share fallback', e);
    }
  }

  // Fallback download
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `619_Islam_Ayah_${ayah.surahNumber}_${ayah.ayahNumber}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
