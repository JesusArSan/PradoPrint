import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import Tarea9Page from './pages/Tarea9Page'
import CarouselPage from './pages/CarouselPage'

const navClass = ({ isActive }: { isActive: boolean }) =>
  [
    'text-sm transition-colors',
    isActive ? 'font-bold text-stone-900' : 'text-stone-500 hover:text-stone-900',
  ].join(' ')

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white font-montserrat text-stone-800">
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-5">
            <div className="flex items-center justify-between gap-6">
              <NavLink
                to="/"
                end
                className="text-2xl font-bold tracking-tight text-stone-900"
              >
                Prado Print
              </NavLink>

              <nav className="flex items-center gap-5">
                <NavLink to="/" end className={navClass}>
                  Portada
                </NavLink>
                <NavLink to="/tarea-9" className={navClass}>
                  Tarea 9
                </NavLink>
                <NavLink to="/carousel" className={navClass}>
                  Carrusel
                </NavLink>
              </nav>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tarea-9" element={<Tarea9Page />} />
            <Route path="/carousel" element={<CarouselPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
