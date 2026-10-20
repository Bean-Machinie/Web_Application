"use client"

import * as React from "react"
import { cn } from "cn"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run",
  children,
  className,
  commandProps,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root> & {
  title?: string
  description?: string
  className?: string
  // Passed to the Command inside, such as the selected value.
  commandProps?: React.ComponentProps<typeof CommandPrimitive>
}) {
  return (
    <DialogPrimitive.Root {...props}>
      <DialogPrimitive.Portal>
        {/* A soft dim, no blur. */}
        <DialogPrimitive.Overlay
          data-slot="command-overlay"
          className="fixed inset-0 z-50 bg-black/30 duration-150 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <DialogPrimitive.Content
          data-slot="command-dialog"
          className={cn(
            "fixed top-[20%] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-2xl ring-1 ring-foreground/10 duration-150 ease-out outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-98 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-98",
            className
          )}
        >
          <DialogPrimitive.Title className="sr-only">{title}</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">{description}</DialogPrimitive.Description>
          <Command shouldFilter={false} {...commandProps}>
            {children}
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function CommandInput({
  className,
  trailing,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & {
  // Shown at the right end of the field, such as the key that closes it.
  trailing?: React.ReactNode
}) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-14 items-center gap-3 border-b px-4">
      <SearchIcon className="size-[18px] shrink-0 text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-full w-full bg-transparent text-[15px] outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
      {trailing}
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      // cmdk reports the height of the results; the list follows it, up to a maximum.
      className={cn(
        "h-[min(var(--cmdk-list-height),26rem)] overflow-x-hidden overflow-y-auto transition-[height] duration-150 ease-out [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin] motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="px-4 py-10 text-center text-sm text-muted-foreground"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden px-2 pt-2 pb-1 text-foreground last:pb-2 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:pt-1 **:[[cmdk-group-heading]]:pb-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("-mx-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex cursor-default items-center gap-3 rounded-lg px-2 py-2 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
}
