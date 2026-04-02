"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { useCart } from "@/lib/cart-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Menu,
  ShoppingCart,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Trash2,
} from "lucide-react"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/courses?type=crash", label: "Crash Courses" },
  { href: "/contact", label: "Contact" },
]

interface NavbarProps {
  user?: { email: string; name?: string } | null
  isCrashCourse?: boolean
}

function getInitial(email: string, name?: string) {
  if (name) return name.charAt(0).toUpperCase()
  return email.charAt(0).toUpperCase()
}

function getDisplayName(email: string, name?: string) {
  if (name) return name
  return email.split("@")[0]
}

// Isolated component so useSearchParams doesn't affect parent's useId counters
function NavLinksInner({
  isCrashCourse,
  mobile,
  onClose,
}: {
  isCrashCourse?: boolean
  mobile?: boolean
  onClose?: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (mobile) {
    return (
      <nav className="mt-6 flex flex-col gap-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={`px-2 py-2.5 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
              pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href))
                ? "bg-accent text-accent-foreground"
                : "text-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    )
  }

  return (
    <nav className="hidden md:flex items-center gap-6">
      {NAV_LINKS.map((link) => {
        const url = new URL(link.href, "http://x")
        const linkPath = url.pathname
        const linkType = url.searchParams.get("type")
        const currentType = searchParams.get("type")
        const isActive = linkType
          ? (pathname === linkPath && currentType === linkType) ||
            (linkType === "crash" && isCrashCourse && pathname?.startsWith("/courses/"))
          : (pathname === linkPath && !currentType) ||
            (linkPath !== "/" && pathname?.startsWith(linkPath) && !currentType && !isCrashCourse)
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

function NavLinks(props: {
  isCrashCourse?: boolean
  mobile?: boolean
  onClose?: () => void
}) {
  return (
    <Suspense fallback={null}>
      <NavLinksInner {...props} />
    </Suspense>
  )
}

export function Navbar({ user, isCrashCourse }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()
  const { items, removeFromCart } = useCart()

  useEffect(() => { setMounted(true) }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Left: Logo + desktop nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/basecamp-logo.png"
              alt="Basecamp Digital"
              width={180}
              height={45}
              className="h-8 sm:h-10 w-auto"
              priority
            />
          </Link>
          <NavLinks isCrashCourse={isCrashCourse} />
        </div>

        {/* Right: Cart + Avatar (desktop) / Cart + Menu (mobile) */}
        <div className="flex items-center gap-2">

          {/* Cart icon */}
          <Sheet open={cartOpen} onOpenChange={setCartOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {items.length}
                  </span>
                )}
                <span className="sr-only">Cart</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 sm:w-96 flex flex-col">
              <SheetHeader>
                <SheetTitle>My Cart ({items.length})</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-4">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    Your cart is empty.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {items.map((course) => (
                      <li key={course.id} className="flex items-start gap-3 border-b border-border pb-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight line-clamp-2">{course.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{course.instructor_name}</p>
                          <p className="text-sm font-semibold text-primary mt-1">
                            {course.price === 0 ? "Free" : `₹${course.price}`}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(course.id)}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors mt-0.5"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {items.length > 0 && (
                <div className="border-t border-border pt-4 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-base font-bold text-primary">
                      {items.every(c => c.price === 0)
                        ? "Free"
                        : `₹${items.reduce((sum, c) => sum + c.price, 0)}`}
                    </span>
                  </div>
                  <Button className="w-full">Checkout</Button>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Desktop: Avatar dropdown or Login/Signup */}
          <div className="hidden md:flex items-center gap-2">
            {mounted && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {getInitial(user.email, user.name)}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      {getInitial(user.email, user.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{getDisplayName(user.email, user.name)}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {resolvedTheme === "dark" ? (
                      <><Sun className="h-4 w-4" /> Light Mode</>
                    ) : (
                      <><Moon className="h-4 w-4" /> Dark Mode</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive cursor-pointer"
                    onSelect={() => {
                      const form = document.getElementById("signout-form") as HTMLFormElement
                      form?.submit()
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
            {user && <form id="signout-form" action="/auth/signout" method="post" className="hidden" />}
          </div>

          {/* Mobile: Hamburger */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 sm:w-80">
              <SheetHeader>
                <SheetTitle className="text-left">
                  <Image
                    src="/images/basecamp-logo.png"
                    alt="Basecamp Digital"
                    width={150}
                    height={38}
                    className="h-8 w-auto"
                  />
                </SheetTitle>
              </SheetHeader>

              {mounted && user && (
                <div className="mt-6 flex items-center gap-3 px-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                    {getInitial(user.email, user.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{getDisplayName(user.email, user.name)}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              )}

              <NavLinks mobile onClose={() => setIsOpen(false)} />

              <div className="border-t border-border mt-3 pt-3 flex flex-col gap-1 px-0">
                {mounted && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 px-2 py-2.5 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    <button
                      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                      className="flex items-center gap-2 px-2 py-2.5 rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                    >
                      {resolvedTheme === "dark" ? (
                        <><Sun className="h-4 w-4" /> Light Mode</>
                      ) : (
                        <><Moon className="h-4 w-4" /> Dark Mode</>
                      )}
                    </button>
                    <form action="/auth/signout" method="post" className="mt-2">
                      <button
                        type="submit"
                        className="flex w-full items-center gap-2 px-2 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col gap-2 px-1">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Log In</Button>
                    </Link>
                    <Link href="/auth/sign-up" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}
