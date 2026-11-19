import React, { useState, useEffect, useRef } from 'react';
import {
  getPhotoFromIndexedDB,
  findPhotoForJurnalInIndexedDB,
} from '../../services/photoStorageService';

interface ResolvedPhotoImgProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  jurnalId?: string;
}

function extractGoogleDriveFileId(url: string): string | null {
  if (!url) return null;
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) return lh3Match[1];
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && idParamMatch) return idParamMatch[1];
  return null;
}

export const ResolvedPhotoImg: React.FC<ResolvedPhotoImgProps> = ({
  src,
  jurnalId,
  alt,
  className,
  style,
  onError,
  ...rest
}) => {
  const [resolvedSrc, setResolvedSrc] = useState<string>(src.startsWith('idb://') ? '' : src);
  const fallbackAttemptRef = useRef<number>(0);
  const createdObjectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    fallbackAttemptRef.current = 0;

    if (createdObjectUrlRef.current) {
      URL.revokeObjectURL(createdObjectUrlRef.current);
      createdObjectUrlRef.current = null;
    }

    if (!src) {
      setResolvedSrc('');
      return;
    }

    if (src.startsWith('idb://')) {
      getPhotoFromIndexedDB(src).then((url) => {
        if (!active) {
          if (url && url.startsWith('blob:')) URL.revokeObjectURL(url);
          return;
        }
        if (url) {
          if (url.startsWith('blob:')) createdObjectUrlRef.current = url;
          setResolvedSrc(url);
        } else if (jurnalId) {
          findPhotoForJurnalInIndexedDB(jurnalId).then((recovered) => {
            if (!active) {
              if (recovered && recovered.startsWith('blob:')) URL.revokeObjectURL(recovered);
              return;
            }
            if (recovered) {
              if (recovered.startsWith('blob:')) createdObjectUrlRef.current = recovered;
              setResolvedSrc(recovered);
            }
          });
        }
      });
    } else {
      setResolvedSrc(src);
    }

    return () => {
      active = false;
      if (createdObjectUrlRef.current) {
        URL.revokeObjectURL(createdObjectUrlRef.current);
        createdObjectUrlRef.current = null;
      }
    };
  }, [src, jurnalId]);

  const handleImgError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 1. Jika URL Google Drive gagal dimuat, coba endpoint alternatif Drive
    const driveId = extractGoogleDriveFileId(src);
    if (driveId) {
      const candidates = [
        `https://drive.google.com/thumbnail?id=${driveId}&sz=w1200`,
        `https://lh3.googleusercontent.com/d/${driveId}`,
        `https://drive.google.com/uc?export=view&id=${driveId}`,
      ].filter((u) => u !== resolvedSrc);

      if (fallbackAttemptRef.current < candidates.length) {
        const nextUrl = candidates[fallbackAttemptRef.current];
        fallbackAttemptRef.current += 1;
        setResolvedSrc(nextUrl);
        return;
      }
    }

    // 2. Jika blob: URL lama kedaluwarsa, pulihkan dari IndexedDB berdasar jurnalId
    if ((src.startsWith('blob:') || resolvedSrc.startsWith('blob:')) && jurnalId && fallbackAttemptRef.current === 0) {
      fallbackAttemptRef.current = 99;
      const recovered = await findPhotoForJurnalInIndexedDB(jurnalId);
      if (recovered) {
        if (recovered.startsWith('blob:')) createdObjectUrlRef.current = recovered;
        setResolvedSrc(recovered);
        return;
      }
    }

    if (onError) onError(e);
  };

  if (!resolvedSrc) {
    return null;
  }

  return (
    <img
      src={resolvedSrc}
      alt={alt || 'Foto Dokumentasi'}
      className={className}
      style={style}
      loading="eager"
      decoding="sync"
      referrerPolicy="no-referrer"
      onError={handleImgError}
      {...rest}
    />
  );
};
