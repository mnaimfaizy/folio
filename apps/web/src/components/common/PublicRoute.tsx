import { ReactNode } from 'react';
import { SEOConfig } from '@/utils/seoUtils';
import { SEOHead } from '@/components/common/SEOHead';

/**
 * Wrapper component for public routes that includes SEO metadata
 */
export function PublicRoute({
  children,
  seoConfig,
}: {
  children: ReactNode;
  seoConfig: SEOConfig;
}) {
  return (
    <>
      <SEOHead config={seoConfig} />
      {children}
    </>
  );
}
