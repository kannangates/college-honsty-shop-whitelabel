import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/features/gamification/components/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { X } from "lucide-react"

export interface Option {
  label: string
  value: string
  disable?: boolean
  fixed?: boolean
  [key: string]: string | boolean | undefined
}

interface GroupOption {
  [key: string]: Option[]
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  options?: Option[]
  placeholder?: string
  loadingIndicator?: React.ComponentType
  emptyIndicator?: React.ComponentType
  delay?: number
  triggerSearchOnFocus?: boolean
  onValueChange?: (value: Option[]) => void
  disabled?: boolean
  groupBy?: string
  className?: string
  badgeClassName?: string
  selectFirstItem?: boolean
  creatable?: boolean
  asChild?: boolean
  onSearch?: (value: string) => void
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>
  inputProps?: Omit<React.ComponentPropsWithoutRef<"input">, "value" | "placeholder" | "disabled">
  hidePlaceholderWhenSelected?: boolean
  hideClearAllButton?: boolean
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {}
  }
  if (!groupBy) {
    return {
      '': options,
    }
  }

  const groupOption: GroupOption = {}
  options.forEach((option) => {
    const key = (option[groupBy] as string) || ''
    if (!groupOption[key]) {
      groupOption[key] = []
    }
    groupOption[key].push(option)
  })
  return groupOption
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter((val) => !picked.find((p) => p.value === val.value))
  }
  return cloneOption
}

const MultipleSelector = React.forwardRef<MultipleSelectorRef, MultipleSelectorProps>(
  (
    {
      value,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      options: arrayOptions,
      delay,
      onSearch,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
    }: MultipleSelectorProps & {
      onChange?: (value: Option[]) => void
      maxSelected?: number
      onMaxSelected?: (maxLimit: number) => void
    },
    ref
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [onScrollbar, setOnScrollbar] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)

    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<GroupOption>(transToGroupOption(arrayDefaultOptions, groupBy))
    const [inputValue, setInputValue] = React.useState('')
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500)

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
      }),
      [selected]
    )

    const handleUnselect = React.useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.value !== option.value)
        setSelected(newOptions)
        onChange?.(newOptions)
      },
      [onChange, selected]
    )

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current
        if (input) {
          if (e.key === 'Delete' || e.key === 'Backspace') {
            if (input.value === '' && selected.length > 0) {
              handleUnselect(selected[selected.length - 1])
            }
          }
          if (e.key === 'Escape') {
            input.blur()
          }
        }
      },
      [handleUnselect, selected]
    )

    React.useEffect(() => {
      if (value) {
        setSelected(value)
      }
    }, [value])

    React.useEffect(() => {
      if (!arrayOptions || onSearch) {
        return
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy)
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption)
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options])

    React.useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true)
        const res = onSearch ? await onSearch(debouncedSearchTerm) : []
        setOptions(transToGroupOption(res || [], groupBy))
        setIsLoading(false)
      }

      const exec = async () => {
        if (!onSearch || !open) return

        if (triggerSearchOnFocus) {
          await doSearch()
        }

        if (debouncedSearchTerm) {
          await doSearch()
        }
      }

      void exec()
    }, [debouncedSearchTerm, groupBy, onSearch, open, triggerSearchOnFocus])

    const CreatableItem = () => {
      if (!creatable) return undefined
      if (isOptionExist(options, { value: inputValue, label: inputValue }) || selected.find((s) => s.value === inputValue)) {
        return undefined
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length)
              return
            }
            setInputValue('')
            const newOptions = [...selected, { value, label: value }]
            setSelected(newOptions)
            onChange?.(newOptions)
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      )

      if (!isLoading && inputValue.length > 0) {
        return Item
      }

      return undefined
    }

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined

      if (inputValue.length > 0 && !isLoading) {
        if (creatable) {
          return <div className="text-center text-lg leading-10 text-muted-foreground">No results found.</div>
        }
        return <div className="text-center text-lg leading-10 text-muted-foreground">No results found.</div>
      }

      return emptyIndicator ? React.createElement(emptyIndicator) : undefined
    }, [creatable, emptyIndicator, inputValue.length, isLoading])

    const selectables = React.useMemo<GroupOption>(() => removePickedOption(options, selected), [options, selected])

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter
      }

      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1
        }
      }
      return undefined
    }, [creatable, commandProps?.filter])

    return (
      <Command
        onKeyDown={handleKeyDown}
        className={cn('overflow-visible bg-transparent', commandProps?.className)}
        shouldFilter={commandProps?.shouldFilter !== undefined ? commandProps.shouldFilter : !onSearch}
        {...commandProps}
        filter={commandFilter()}
      >
        <div
          className={cn(
            'group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
        >
          <div className="flex gap-1 flex-wrap">
            {selected.map((option) => {
              return (
                <Badge
                  key={option.value}
                  className={cn(
                    'data-[disabled]:bg-muted-foreground data-[disabled]:text-muted data-[disabled]:hover:bg-muted-foreground',
                    'data-[fixed]:bg-muted-foreground data-[fixed]:text-muted data-[fixed]:hover:bg-muted-foreground',
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled}
                >
                  {option.label}
                  <button
                    className={cn(
                      'ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                      (disabled || option.fixed) && 'hidden'
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleUnselect(option)
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            <CommandInput
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => setInputValue(value)}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              placeholder={hidePlaceholderWhenSelected && selected.length !== 0 ? '' : placeholder}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
              {...inputProps}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && (
            <CommandList
              className="z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in"
              onMouseLeave={() => {
                setOnScrollbar(false)
              }}
              onMouseEnter={() => {
                setOnScrollbar(true)
              }}
              onMouseUp={() => {
                inputRef?.current?.focus()
              }}
            >
              {isLoading ? (
                <>{loadingIndicator}</>
              ) : (
                <>
                  <EmptyItem />
                  <CreatableItem />
                  {!selectFirstItem && <CommandEmpty />}
                  {Object.entries(selectables).map(([key, dropdowns]) => (
                    <CommandGroup key={key} heading={key} className="h-full overflow-auto">
                      {dropdowns.map((option) => {
                        return (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            disabled={option.disable}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                            }}
                            onSelect={() => {
                              if (selected.length >= maxSelected) {
                                onMaxSelected?.(selected.length)
                                return
                              }
                              setInputValue('')
                              const newOptions = [...selected, option]
                              setSelected(newOptions)
                              onChange?.(newOptions)
                            }}
                            className={cn('cursor-pointer', option.disable && 'cursor-default text-muted-foreground')}
                          >
                            {option.label}
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  ))}
                </>
              )}
            </CommandList>
          )}
        </div>
      </Command>
    )
  }
)

MultipleSelector.displayName = 'MultipleSelector'
export default MultipleSelector

function isOptionExist(options: GroupOption, targetOption: Option) {
  return Object.values(options).some((optionGroup) =>
    optionGroup.some((option) => option.value === targetOption.value)
  )
}