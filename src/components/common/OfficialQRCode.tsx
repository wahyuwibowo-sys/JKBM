import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { DEFAULT_LOGO_JATIM, DEFAULT_LOGO_SIDAYU } from '../../data/defaultLogos';

interface OfficialQRCodeProps {
  guruNama: string;
  kepsekNama: string;
  semester?: string;
  customText?: string;
  size?: number;
  logoUrl?: string;
  onClick?: () => void;
  showScanTooltip?: boolean;
}

function drawRoundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load logo: ${src}`));
    img.src = src;
  });
}

export const OfficialQRCode: React.FC<OfficialQRCodeProps> = ({
  guruNama,
  kepsekNama,
  semester = 'Ganjil',
  customText,
  size = 120,
  logoUrl,
  onClick,
  showScanTooltip = true,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [fallbackLogoOnly, setFallbackLogoOnly] = useState<boolean>(false);
  const [activeOverlaySrc, setActiveOverlaySrc] = useState<string>(DEFAULT_LOGO_SIDAYU);

  const primaryLogo =
    logoUrl && logoUrl.trim().length > 0 ? logoUrl.trim() : DEFAULT_LOGO_SIDAYU;

  const qrContent =
    customText ||
    `File Jurnal KBM Semester ${semester} ini valid sudah di tanda tangani secara elektronik Oleh : Nama Guru : ${guruNama} Kepala Sekolah : ${kepsekNama}`;

  useEffect(() => {
    let isMounted = true;
    const renderSize = Math.max(360, size * 4);

    const generateCompositeQR = async () => {
      try {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, qrContent, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: renderSize,
          color: {
            dark: '#0f172a',
            light: '#ffffff',
          },
        });

        const ctx = canvas.getContext('2d');
        const candidates = Array.from(
          new Set([primaryLogo, DEFAULT_LOGO_SIDAYU, DEFAULT_LOGO_JATIM].filter(Boolean))
        );

        let loadedLogo: HTMLImageElement | null = null;
        for (const candidate of candidates) {
          try {
            loadedLogo = await loadImage(candidate);
            break;
          } catch {
            // Try next fallback emblem
          }
        }

        if (ctx && loadedLogo) {
          const badgeSize = Math.round(canvas.width * 0.24);
          const badgeX = Math.round((canvas.width - badgeSize) / 2);
          const badgeY = Math.round((canvas.height - badgeSize) / 2);
          const radius = Math.round(badgeSize * 0.22);

          // Crisp white protective halo around the logo so QR modules remain scannable
          ctx.save();
          drawRoundedRectPath(ctx, badgeX, badgeY, badgeSize, badgeSize, radius);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = Math.max(2, Math.round(canvas.width * 0.006));
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();

          // Fit emblem inside badge preserving aspect ratio without clipping shield edges
          const pad = Math.round(badgeSize * 0.12);
          const maxW = badgeSize - pad * 2;
          const maxH = badgeSize - pad * 2;
          const natW = loadedLogo.naturalWidth || loadedLogo.width || maxW;
          const natH = loadedLogo.naturalHeight || loadedLogo.height || maxH;
          const scale = Math.min(maxW / natW, maxH / natH);
          const drawW = natW * scale;
          const drawH = natH * scale;
          const drawX = badgeX + (badgeSize - drawW) / 2;
          const drawY = badgeY + (badgeSize - drawH) / 2;

          ctx.drawImage(loadedLogo, drawX, drawY, drawW, drawH);
          ctx.restore();
        }

        const compositedUrl = canvas.toDataURL('image/png');
        if (isMounted) {
          setFallbackLogoOnly(false);
          setQrDataUrl(compositedUrl);
        }
      } catch {
        // Fallback to plain QR + overlay emblem if canvas export is blocked
        try {
          const plainUrl = await QRCode.toDataURL(qrContent, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: renderSize,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          if (isMounted) {
            setActiveOverlaySrc(primaryLogo);
            setFallbackLogoOnly(true);
            setQrDataUrl(plainUrl);
          }
        } catch {
          // Ignore unexpected QR failure
        }
      }
    };

    generateCompositeQR();

    return () => {
      isMounted = false;
    };
  }, [qrContent, size, primaryLogo]);

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none group ${onClick ? 'cursor-pointer' : ''}`}
      style={{ width: size, height: size }}
      title={qrContent}
    >
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="Barcode TTD Elektronik Resmi SMKN 1 Sidayu"
          className="w-full h-full object-contain rounded-lg border border-slate-300 print:border-slate-800 bg-white p-0.5 group-hover:border-slate-500 transition-colors"
        />
      ) : (
        <div className="w-full h-full bg-slate-100 rounded-lg border border-slate-200" />
      )}

      {fallbackLogoOnly && qrDataUrl && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-0.5 border border-slate-300 flex items-center justify-center overflow-hidden pointer-events-none"
          style={{ width: Math.round(size * 0.24), height: Math.round(size * 0.24) }}
        >
          <img
            src={activeOverlaySrc}
            alt="Logo SMKN 1 Sidayu"
            className="w-full h-full object-contain"
            onError={() => {
              if (activeOverlaySrc !== DEFAULT_LOGO_SIDAYU) {
                setActiveOverlaySrc(DEFAULT_LOGO_SIDAYU);
              } else if (activeOverlaySrc !== DEFAULT_LOGO_JATIM) {
                setActiveOverlaySrc(DEFAULT_LOGO_JATIM);
              }
            }}
          />
        </div>
      )}

      {showScanTooltip && (
        <div className="no-print absolute -bottom-6 inset-x-0 text-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <span className="text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded-sm font-sans whitespace-nowrap shadow-md">
            Klik / Scan Verifikasi
          </span>
        </div>
      )}
    </div>
  );
};
