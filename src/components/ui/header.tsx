import * as React from "react"

import { cn } from "@/lib/utils"

function Header({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-5xl font-bold mb-8 mt-8 mr-5",
        className
      )}
      {...props}
    />
  )
}

export { Header }
