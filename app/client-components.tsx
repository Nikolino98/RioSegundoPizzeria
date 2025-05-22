"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { CartButton } from "@/components/cart/cart-button"

// Componente para el botón de desplazamiento al menú
export function ScrollToMenuButton() {
  const handleClick = () => {
    const menuElement = document.getElementById("menu")
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <Button onClick={handleClick} className="bg-red-700 hover:bg-red-800">
      Ver Menú
    </Button>
  )
}

// Componente para la navegación móvil
export function MobileNav() {
  const [open, setOpen] = useState(false)

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const href = e.currentTarget.getAttribute("href")
    if (href && href.startsWith("#")) {
      setOpen(false)
      setTimeout(() => {
        const element = document.getElementById(href.substring(1))
        if (element) {
          element.scrollIntoView({ behavior: "smooth" })
        }
      }, 300)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[250px] sm:w-[300px]">
        <nav className="mt-10">
          <ul className="space-y-4">
            <li>
              <a href="#inicio" className="block py-2 text-lg font-medium hover:text-red-700" onClick={handleNavClick}>
                Inicio
              </a>
            </li>
            <li>
              <a
                href="#nosotros"
                className="block py-2 text-lg font-medium hover:text-red-700"
                onClick={handleNavClick}
              >
                Nosotros
              </a>
            </li>
            <li>
              <a href="#menu" className="block py-2 text-lg font-medium hover:text-red-700" onClick={handleNavClick}>
                Menú
              </a>
            </li>
            <li>
              <a
                href="#contacto"
                className="block py-2 text-lg font-medium hover:text-red-700"
                onClick={handleNavClick}
              >
                Contacto
              </a>
            </li>
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

// Componente para cambiar entre modo claro y oscuro
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}

// Componente principal que incluye la barra de navegación
export function ClientComponents() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 shadow-md backdrop-blur-md dark:bg-stone-900/80" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold text-red-700 dark:text-red-500">
          Rio Segundo Pizzeria
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-6 md:flex">
          <Link href="#inicio" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
            Inicio
          </Link>
          <Link href="#nosotros" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
            Nosotros
          </Link>
          <Link href="#menu" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
            Menú
          </Link>
          <Link href="#contacto" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <CartButton />
          <MobileNav />
        </div>
      </div>
    </header>
  )
}
