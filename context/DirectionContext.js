'use client'

import { createContext, useCallback, useContext, useEffect, useState } from "react"

const STORAGE_KEY = "direction"
const DEFAULT_DIRECTION = "ltr"

const DirectionContext = createContext(undefined)

function applyDirectionToDocument(direction) {
	document.documentElement.setAttribute("dir", direction)
	document.documentElement.classList.toggle("rtl", direction === "rtl")
	document.documentElement.classList.toggle("ltr", direction === "ltr")
}

export function DirectionProvider({ children }) {
	const [direction, setDirectionState] = useState(DEFAULT_DIRECTION)

	// On mount, sync React state with whatever the inline bootstrap script
	// (see app/layout.js) already applied to <html> before hydration, so we
	// never render a mismatched value.
	useEffect(() => {
		const current = document.documentElement.getAttribute("dir")
		setDirectionState(current === "rtl" ? "rtl" : "ltr")
	}, [])

	const setDirection = useCallback((next) => {
		if (next !== "ltr" && next !== "rtl") return
		setDirectionState(next)
		applyDirectionToDocument(next)
		try {
			window.localStorage.setItem(STORAGE_KEY, next)
		} catch (e) {
			// localStorage unavailable (privacy mode, etc.) - direction still works for this session
		}
	}, [])

	const toggleDirection = useCallback(() => {
		setDirection(direction === "rtl" ? "ltr" : "rtl")
	}, [direction, setDirection])

	return (
		<DirectionContext.Provider value={{ direction, isRTL: direction === "rtl", toggleDirection, setDirection }}>
			{children}
		</DirectionContext.Provider>
	)
}

export function useDirection() {
	const context = useContext(DirectionContext)
	if (!context) {
		throw new Error("useDirection must be used within a DirectionProvider")
	}
	return context
}

// Inlined into a <script> tag in app/layout.js so direction is set on <html>
// before React hydrates - avoids a flash of the wrong direction and any
// server/client markup mismatch on the dir attribute.
export const directionBootstrapScript = `
(function() {
	try {
		var dir = window.localStorage.getItem('${STORAGE_KEY}');
		if (dir !== 'rtl' && dir !== 'ltr') dir = '${DEFAULT_DIRECTION}';
		document.documentElement.setAttribute('dir', dir);
		document.documentElement.classList.add(dir);
	} catch (e) {
		document.documentElement.setAttribute('dir', '${DEFAULT_DIRECTION}');
	}
})();
`
