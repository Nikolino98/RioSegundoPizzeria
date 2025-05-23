import Image from "next/image"
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CartButton } from "@/components/cart/cart-button"
import { ProductCard } from "@/components/product-card"
import { ScrollToMenuButton, MobileNav, ThemeToggle } from "./client-components"
import { SearchForm } from "@/components/search-form"
import { getProducts } from "@/lib/supabase-actions"
import logo from "../images/logo.png"
import local from "../images/local.jpg"

// Datos de ejemplo para usar mientras se soluciona la conexión a Supabase
const mockProducts = {
  pizzas: [
    {
      id: "pizza-1",
      name: "Margherita",
      description: "Salsa de tomate, mozzarella fresca y albahaca",
      price: 12.99,
      image: "/placeholder.svg?height=96&width=96",
      category: "pizzas",
    },
    {
      id: "pizza-2",
      name: "Pepperoni",
      description: "Salsa de tomate, mozzarella y pepperoni",
      price: 14.99,
      image: "/placeholder.svg?height=96&width=96",
      category: "pizzas",
    },
  ],
  pastas: [
    {
      id: "pasta-1",
      name: "Spaghetti Bolognese",
      description: "Pasta con salsa de carne y tomate",
      price: 10.99,
      image: "/placeholder.svg?height=96&width=96",
      category: "pastas",
    },
  ],
  ensaladas: [
    {
      id: "ensalada-1",
      name: "Ensalada César",
      description: "Lechuga romana, crutones, parmesano y aderezo César",
      price: 8.99,
      image: "/placeholder.svg?height=96&width=96",
      category: "ensaladas",
    },
  ],
  postres: [
    {
      id: "postre-1",
      name: "Tiramisú",
      description: "Postre italiano con café, mascarpone y cacao",
      price: 6.99,
      image: "/placeholder.svg?height=96&width=96",
      category: "postres",
    },
  ],
}

// Función para capitalizar la primera letra de una cadena
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export default async function Home() {
  // Obtener todos los productos
  let allProducts = []

  try {
    allProducts = await getProducts()

    // Si no hay productos, usar datos de ejemplo
    if (allProducts.length === 0) {
      allProducts = [...mockProducts.pizzas, ...mockProducts.pastas, ...mockProducts.ensaladas, ...mockProducts.postres]
    }
  } catch (error) {
    console.error("Error loading products:", error)
    // En caso de error, usar datos de ejemplo
    allProducts = [...mockProducts.pizzas, ...mockProducts.pastas, ...mockProducts.ensaladas, ...mockProducts.postres]
  }

  // Obtener categorías únicas
  const categories = Array.from(new Set(allProducts.map((product) => product.category)))

  // Si no hay categorías, usar las predefinidas
  if (categories.length === 0) {
    categories.push("pizzas", "pastas", "ensaladas", "postres")
  }

  // Agrupar productos por categoría
  const productsByCategory: Record<string, any[]> = {}

  categories.forEach((category) => {
    productsByCategory[category] = allProducts.filter((product) => product.category === category)
  })

  // Asegurarse de que haya al menos una categoría seleccionada por defecto
  const defaultCategory = categories.length > 0 ? categories[0] : "pizzas"

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Image
              src={logo}
              alt="Rio Segundo Pizzeria Logo"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold text-red-700 dark:text-red-500">Rio Segundo Pizzeria & Cafe</span>
          </div>
          <nav className="hidden md:block">
            <ul className="flex gap-6">
              <li>
                <a href="#inicio" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#nosotros" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
                  Nosotros
                </a>
              </li>
              <li>
                <a href="#menu" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
                  Menú
                </a>
              </li>
              <li>
                <a href="#contacto" className="text-sm font-medium hover:text-red-700 dark:hover:text-red-500">
                  Contacto
                </a>
              </li>
            </ul>
          </nav>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <CartButton />
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="dark:bg-gray-950">
        {/* Hero Section */}
        <section id="inicio" className="relative h-[80vh] w-full">
          <div className="absolute inset-0">
            <Image
              src={local}
              alt="Pizza artesanal"
              fill
              className="object-cover brightness-50"
              priority
            />
          </div>
          <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
            <h1 className="mb-2 font-serif text-5xl font-bold md:text-7xl">Pizzeria & Cafe</h1>
            <p className="mb-6 text-xl md:text-2xl">Auténtica cocina en cada bocado</p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <ScrollToMenuButton />
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section id="nosotros" className="bg-stone-50 py-16 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-2 font-serif text-3xl font-bold text-red-700 dark:text-red-500 md:text-4xl">
                Nuestra Historia
              </h2>
              <div className="mb-6 h-1 w-16 bg-red-700 dark:bg-red-500 mx-auto"></div>
              <p className="mb-8 text-gray-700 dark:text-gray-300">
                Fundada en 2020, Rio Segundo Pizzeria nació de la pasión por la auténtica cocina italiana. Nuestras
                recetas han sido transmitidas por generaciones, trayendo los sabores genuinos de Italia a cada plato que
                servimos. Utilizamos ingredientes frescos y de la más alta calidad para crear experiencias culinarias
                memorables.
              </p>
              <div className="grid gap-8 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 8.25v-1.5m-6 1.5v-1.5m12 9.75-1.5.75a3.354 3.354 0 0 1-3 0 3.354 3.354 0 0 0-3 0 3.354 3.354 0 0 1-3 0L3 16.5m15-3.379a48.474 48.474 0 0 0-6-.371c-2.032 0-4.034.126-6 .371m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.169c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 0 1 3 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 0 1 6 13.12M12.265 3.11a.375.375 0 1 1 .53 0L12.53 3.43l.53.37a.375.375 0 1 1-.53.53l-.53-.37-.53.37a.375.375 0 1 1-.53-.53l.53-.37-.53-.37a.375.375 0 0 1 0-.53Z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Recetas Tradicionales</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sabores auténticos con un toque local que nos hace únicos.
                  </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Ingredientes Frescos</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Seleccionamos los mejores ingredientes locales para nuestros platos.
                  </p>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400 mx-auto">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-6 w-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z"
                      />
                    </svg>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Horno de barro</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Nuestras pizzas se hornean en auténticos hornos de barro para un sabor inigualable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Menu Section with Cart Functionality */}
        <section id="menu" className="py-16 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-center font-serif text-3xl font-bold text-red-700 dark:text-red-500 md:text-4xl">
              Nuestro Menú
            </h2>
            <div className="mb-10 h-1 w-16 bg-red-700 dark:bg-red-500 mx-auto"></div>

            

            <Tabs defaultValue={defaultCategory} className="mx-auto max-w-4xl">
              {/* Pestañas de categorías - Mejoradas para móvil y escritorio */}
              <div className="mb-8 overflow-x-auto pb-2">
                <TabsList className="inline-flex w-auto min-w-full justify-start sm:justify-center">
                  {categories.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="min-w-[100px] px-4 py-2 text-sm sm:text-base"
                    >
                      {capitalizeFirstLetter(category)}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Contenido de las pestañas */}
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    {productsByCategory[category] && productsByCategory[category].length > 0 ? (
                      productsByCategory[category].map((item) => <ProductCard key={item.id} product={item} />)
                    ) : (
                      <p className="col-span-2 text-center text-gray-500 dark:text-gray-400">
                        No hay {category} disponibles en este momento.
                      </p>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Contact Section - Corregido el posicionamiento */}
        <section id="contacto" className="bg-red-700 py-16 text-white dark:bg-red-900">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-2 text-center font-serif text-3xl font-bold md:text-4xl">Contáctanos</h2>
              <div className="mb-10 h-1 w-16 bg-white mx-auto"></div>

              <div className="flex flex-col items-center">
                <div className="w-full max-w-lg">
                  <h3 className="mb-6 text-xl font-semibold text-center">Información de Contacto</h3>
                  <div className="space-y-6">
                    <div className="flex items-start justify-center">
                      <MapPin className="mr-3 h-5 w-5 flex-shrink-0 mt-1" />
                      
                      <a href="https://g.co/kgs/zrEJwxT"><p className="text-center">
                        Alem 1158, Río Segundo
                        <br />
                        Córdoba, Argentina
                      </p></a>
                    </div>
                    <div className="flex items-center justify-center">
                      <MessageCircle className="mr-3 h-5 w-5" />
                      <a href="https://wa.me/5493517716373"
                        className="whatsapp_float"
                        target="_blank"
                        rel="noopener noreferrer"
                        >3517716373
                        </a>
                    </div>
                    <div className="flex items-start justify-center">
                      <Clock className="mr-3 h-5 w-5 mt-1" />
                      <div className="text-center">
                        <p>Lunes a Jueves: 18:00 - 23:00</p>
                        <p>Viernes a Domingo: 18:00 - 01:00</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="mb-4 mt-10 text-xl font-semibold text-center">Síguenos</h3>
                  <div className="flex justify-center space-x-6">
                    <a
                      href="#"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-700 transition-colors hover:bg-red-100 dark:bg-gray-800 dark:text-red-500 dark:hover:bg-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a
                      href="https://www.instagram.com/riosegundo.pizzeria/"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-700 transition-colors hover:bg-red-100 dark:bg-gray-800 dark:text-red-500 dark:hover:bg-gray-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 py-8 text-white dark:bg-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="mb-4 flex items-center md:mb-0">
              <Image
                src={logo}
                alt="Rio Segundo Pizzeria Logo"
                width={40}
                height={40}
                className="h-10 w-10 object-contain"
              />
              <span className="ml-2 text-xl font-bold">Rio Segundo Pizzeria & Cafe</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-400">© 2023 Rio Segundo Pizzeria & Cafe. Todos los derechos reservados. Nicolas Perez</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
