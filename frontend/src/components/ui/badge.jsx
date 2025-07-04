/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import {cva} from "class-variance-authority"

import {cn} from "@/lib/utils"

const badgeVariants = cva(
	"inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
	{
		variants: {
			variant: {
				default:
					"border-transparent border border-primary text-primary bg-white",
				secondary:
					"border-transparent border border-secondary text-secondary-foreground",
				destructive:
					"border-transparent bg-destructive text-destructive-foreground",
				outline: "text-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
)

function Badge({className, variant = "default", ...props}) {
	return <div className={cn(badgeVariants({variant}), className)} {...props} />
}

export {Badge, badgeVariants}
