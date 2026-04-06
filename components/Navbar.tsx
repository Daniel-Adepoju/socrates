"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { Show,SignInButton, UserButton, useUser } from "@clerk/nextjs"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { LogIn } from "lucide-react"

const navItems: any = [
  { name: "Library", href: "/" ,showInMobile:true},
  { name: "Add New", href: "/books/add-new",showInMobile:true },
  { name: "Pricing", href: "/pricing",showInMobile:false },
  { name: "Contact", href: "/contact",showInMobile:false },
]
const Navbar = () => {
  const pathname = usePathname()
 const session = useUser()

  return (
    <header className="w-full fixed z-50 bg-(--bg-primary) border-b border-(--border-primary) backdrop-blur-sm">
      <div className="wrapper navbar-height py-4 flex items-center justify-between">
        <div className="logo">
          <Link
            href="/"
            className="text-xl font-bold text-yellow-600 "
          >
            SOCRATES
          </Link>
        </div>
        <nav className="flex items-center space-x-4 md:space-x-8">
          {navItems.map((item: any) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn("nav-link-base hover:opacity-70 transition-colors", {
                  "nav-link-active": isActive,
                  "hidden md:inline-block": !item.showInMobile,
                })}
              >
                {item.name}
              </Link>
            )
          })}

            <Show when="signed-out">
            <SignInButton mode="modal">
              <Button className="text-sm font-bold self-center ml-1 px-4 py-3 h-10 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                <LogIn size={20} className="text-white"/>
              </Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <div className="flex flex-col items-center gap-1">
              <UserButton afterSwitchSessionUrl="/"/> 
              <div className="hidden md:block truncate text-xs text-yellow-700 text-center w-25">{session?.user?.fullName}</div>
            </div>
           
          </Show>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
