'use client';

import { useControllableState } from '@radix-ui/react-use-controllable-state';
import { type LucideProps, StarIcon } from 'lucide-react';
import type { KeyboardEvent, MouseEvent, ReactElement, ReactNode } from 'react';
import {
  Children,
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '@/lib/utils';

type RatingContextValue = {
  value: number;
  readOnly: boolean;
  hoverValue: number | null;
  focusedStar: number | null;
  handleValueChange: (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
    value: number
  ) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  setHoverValue: (value: number | null) => void;
  setFocusedStar: (value: number | null) => void;
};

const RatingContext = createContext<RatingContextValue | null>(null);

const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a Rating component');
  }
  return context;
};

export type RatingButtonProps = LucideProps & {
  index?: number;
  icon?: ReactElement<LucideProps>;
};

export const RatingButton = ({
  index: providedIndex,
  size,
  className,
  icon = <StarIcon />,
}: RatingButtonProps) => {
  const {
    value,
    readOnly,
    hoverValue,
    focusedStar,
    handleValueChange,
    handleKeyDown,
    setHoverValue,
    setFocusedStar,
  } = useRating();

  const index = providedIndex ?? 0;
  const isActive = index < (hoverValue ?? focusedStar ?? value ?? 0);

  // Responsive size logic: use provided size or auto-adjust based on screen size
  const responsiveSize = size || 'responsive';

  let tabIndex = -1;
  if (!readOnly) {
    tabIndex = value === index + 1 ? 0 : -1;
  }

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      handleValueChange(event, index + 1);
    },
    [handleValueChange, index]
  );

  const handleMouseEnter = useCallback(() => {
    if (!readOnly) {
      setHoverValue(index + 1);
    }
  }, [readOnly, setHoverValue, index]);

  const handleFocus = useCallback(() => {
    setFocusedStar(index + 1);
  }, [setFocusedStar, index]);

  const handleBlur = useCallback(() => {
    setFocusedStar(null);
  }, [setFocusedStar]);

  return (
    <button
      className={cn(
        'rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2',
        'p-0.5 transition-transform duration-200',
        !readOnly && 'hover:scale-110 cursor-pointer',
        readOnly && 'cursor-default',
        className
      )}
      disabled={readOnly}
      onBlur={handleBlur}
      onClick={handleClick}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      tabIndex={tabIndex}
      type="button"
      aria-label={`Rate ${index + 1} star${index + 1 !== 1 ? 's' : ''}`}
    >
      {cloneElement(icon, {
        size: responsiveSize === 'responsive' ? undefined : responsiveSize,
        className: cn(
          'transition-colors duration-200 text-yellow-500',
          // Responsive sizing classes when no explicit size is provided
          responsiveSize === 'responsive' && [
            'w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6', // 16px -> 20px -> 24px
          ],
          isActive && 'fill-current',
          !isActive && 'text-gray-300',
          !readOnly && 'cursor-pointer'
        ),
        'aria-hidden': 'true',
      })}
    </button>
  );
};

export type RatingProps = {
  defaultValue?: number;
  value?: number;
  onChange?: (
    event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
    value: number
  ) => void;
  onValueChange?: (value: number) => void;
  readOnly?: boolean;
  className?: string;
  children?: ReactNode;
};

export const Rating = ({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultValue = 0,
  onChange,
  readOnly = false,
  className,
  children,
  ...props
}: RatingProps) => {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const [focusedStar, setFocusedStar] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue,
    prop: controlledValue,
    onChange: controlledOnValueChange,
  });

  const handleValueChange = useCallback(
    (
      event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>,
      newValue: number
    ) => {
      if (!readOnly) {
        onChange?.(event, newValue);
        onValueChange?.(newValue);
      }
    },
    [readOnly, onChange, onValueChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (readOnly) {
        return;
      }

      const total = Children.count(children);
      let newValue = focusedStar !== null ? focusedStar : (value ?? 0);

      switch (event.key) {
        case 'ArrowRight':
          if (event.shiftKey || event.metaKey) {
            newValue = total;
          } else {
            newValue = Math.min(total, newValue + 1);
          }
          break;
        case 'ArrowLeft':
          if (event.shiftKey || event.metaKey) {
            newValue = 1;
          } else {
            newValue = Math.max(1, newValue - 1);
          }
          break;
        default:
          return;
      }

      event.preventDefault();
      setFocusedStar(newValue);
      handleValueChange(event, newValue);
    },
    [focusedStar, value, children, readOnly, handleValueChange]
  );

  useEffect(() => {
    if (focusedStar !== null && containerRef.current) {
      const buttons = containerRef.current.querySelectorAll('button');
      buttons[focusedStar - 1]?.focus();
    }
  }, [focusedStar]);

  const contextValue: RatingContextValue = {
    value: value ?? 0,
    readOnly,
    hoverValue,
    focusedStar,
    handleValueChange,
    handleKeyDown,
    setHoverValue,
    setFocusedStar,
  };

  return (
    <RatingContext.Provider value={contextValue}>
      <div
        aria-label={`Rating: ${value ?? 0} out of ${Children.count(children)} stars`}
        className={cn('inline-flex items-center gap-0.5', className)}
        onMouseLeave={() => setHoverValue(null)}
        ref={containerRef}
        role="radiogroup"
        {...props}
      >
        {Children.map(children, (child, index) => {
          if (!child) {
            return null;
          }
          return cloneElement(child as ReactElement<RatingButtonProps>, {
            index,
          });
        })}
      </div>
    </RatingContext.Provider>
  );
};

// Convenience component for quick yellow rating implementation
interface YellowRatingProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number; // If provided, overrides responsive sizing. If not provided, auto-adjusts: 16px (mobile) -> 20px (tablet) -> 24px (desktop)
  maxStars?: number;
  className?: string;
  showValue?: boolean;
}

export const YellowRating = ({
  value,
  defaultValue = 0,
  onChange,
  onValueChange,
  readOnly = false,
  size, // No default - will auto-adjust if not provided
  maxStars = 5,
  className,
  showValue = false,
}: YellowRatingProps) => {
  const handleChange = useCallback(
    (event: MouseEvent<HTMLButtonElement> | KeyboardEvent<HTMLButtonElement>, newValue: number) => {
      onChange?.(newValue);
    },
    [onChange]
  );

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Rating
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        onValueChange={onValueChange}
        readOnly={readOnly}
      >
        {Array.from({ length: maxStars }).map((_, index) => (
          <RatingButton key={index} size={size} />
        ))}
      </Rating>
      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {value !== undefined
            ? (Number(value) % 1 === 0 ? Number(value).toString() : Number(value).toFixed(2))
            : (Number(defaultValue) % 1 === 0 ? Number(defaultValue).toString() : Number(defaultValue).toFixed(2))
          }
        </span>
      )}
    </div>
  );
};