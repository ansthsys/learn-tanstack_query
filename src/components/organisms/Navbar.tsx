import { useState } from "react"
import { Link } from "react-router"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/atoms/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/atoms/ui/sheet"

const menuItems = [
  { label: "Home", to: "/" },
  { label: "Posts", to: "/posts" },
  { label: "Comments", to: "/comments" },
  { label: "About", to: "/about" },
]

function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src="/favicon.svg" alt="Logo" className="size-6" />
          <span>Learn Query</span>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex items-center gap-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Button variant="ghost" asChild>
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon-sm" aria-label="Toggle menu">
              {open ? <X /> : <Menu />}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="!max-w-72">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Navigation menu</SheetDescription>
            <nav className="mt-8 flex flex-col gap-1">
              {menuItems.map((item) => (
                <Button
                  key={item.to}
                  variant="ghost"
                  className="justify-start text-base"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to={item.to}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

export default Navbar
