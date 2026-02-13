import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',

          '--success-bg': 'var(--popover)',
          '--success-text': 'var(--popover-foreground)',
          '--success-border': 'var(--chart-2)',

          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--popover-foreground)',
          '--error-border': 'var(--destructive)',

          '--warning-bg': 'var(--popover)',
          '--warning-text': 'var(--popover-foreground)',
          '--warning-border': 'var(--chart-4)',

          '--info-bg': 'var(--popover)',
          '--info-text': 'var(--popover-foreground)',
          '--info-border': 'var(--chart-3)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
