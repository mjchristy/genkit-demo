import * as React from "react"

import { cn } from "@/lib/utils"

function Header({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "",
        className
      )}
      {...props}
    >
      <h1 className="text-3xl md:text-5xl font-bold space-y-6 mt-4 mb-6">Dinner Tonight</h1>
      <p className="text-yellow-600 text-sm md:text-base">What's for dinner? I can help you decide. I can recommend restaurants or help create recipes based on what you have.</p>
    </div>
  )
}

export { Header }
