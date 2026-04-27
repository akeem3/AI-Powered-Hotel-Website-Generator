import * as React from 'react';

import { cn } from '@/lib/utils/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-xl border border-input bg-transparent px-gap-card/2 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-ring disabled:cursor-not-allowed disabled:opacity-mid md:text-sm',


          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
