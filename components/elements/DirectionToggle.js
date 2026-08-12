'use client'

import { useDirection } from "@/context/DirectionContext"

export default function DirectionToggle({ className = "" }) {
	const { direction, isRTL, toggleDirection } = useDirection()

	return (
		<button
			type="button"
			className={`direction-toggle ${className}`}
			onClick={toggleDirection}
			aria-pressed={isRTL}
			aria-label={isRTL ? "Switch to left-to-right layout" : "Switch to right-to-left layout"}
			title={isRTL ? "Switch to LTR" : "Switch to RTL"}
		>
			{direction.toUpperCase()}
		</button>
	)
}
